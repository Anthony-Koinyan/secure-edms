import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { removeFromStore } from 'stores/files';

import { fetchKey } from '@/lib/crypto';
import { useNotification } from '@/lib/Notifications';
import { useSupabase } from '@/lib/supabase-provider';
import { FileObject } from '@/lib/types';
import { useUserContext } from '@/lib/user-context';
import download from '@/utils/download';
import { formatFilePath } from '@/utils/formatFilePath';
import { getSubFiles } from '@/utils/getSubFiles';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@supabase/auth-helpers-nextjs';
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js';

import { useFileListActions } from './FileList';

interface DownloadArgs {
  path: string;
  password: string;
  file: FileObject;
  user: User;
  supabase: ReturnType<typeof useSupabase>['supabase'];
  close: () => void;
  addNotification: (
    message: string,
    status?: 'loading' | 'error' | 'success' | 'info' | undefined,
    progress?: number | undefined,
  ) => string;
  updateNotification: (
    id: string,
    status: 'loading' | 'error' | 'success' | 'info',
    message: string,
    progress?: number | undefined,
  ) => void;
}

interface DeleteArgs {
  path: string;
  file: FileObject;
  user: User;
  supabase: ReturnType<typeof useSupabase>['supabase'];
  close: () => void;
  addNotification: (
    message: string,
    status?: 'loading' | 'error' | 'success' | 'info' | undefined,
    progress?: number | undefined,
  ) => string;
  updateNotification: (
    id: string,
    status: 'loading' | 'error' | 'success' | 'info',
    message: string,
    progress?: number | undefined,
  ) => void;
}

async function handleDownload({
  path,
  file,
  user,
  close,
  password,
  supabase,
  addNotification,
  updateNotification,
}: DownloadArgs) {
  close();
  const originalPath = formatFilePath(path, file.name);
  const paths = await getSubFiles(originalPath, user.id!, supabase);

  const notificationId = addNotification(
    `Downloading ${file.name}`,
    'loading',
    0,
  );

  const zip = new ZipWriter(new BlobWriter('application/zip'));
  let completed = 0;

  const promises = paths.map(async (path) => {
    const { data: file, error } = await supabase.storage
      .from('Files')
      .download(`${user?.id}/${path}`);

    if (error) {
      console.error(error);
      return addNotification(`Failed to download ${path}`, 'error');
    }

    await zip.add(path, new BlobReader(file));
    const [keyIvPair, fetchKeyError] = await fetchKey(
      `${user?.id}/${path}`,
      supabase,
    );

    if (fetchKeyError || !keyIvPair) {
      console.error(error);

      return addNotification(
        `Failed to fetch keys to decrypt ${path}`,
        'error',
      );
    }

    const iv = Array.from(keyIvPair.iv);

    const keyIvPairToJson = JSON.stringify({ key: keyIvPair.key, iv }, null, 2);
    const keyIvPairJsonBlob = new Blob([keyIvPairToJson], {
      type: 'application/json',
    });

    const keyIvPairFileName = path
      .split('/')
      .map((p, i, arr) => {
        return i + 1 === arr.length ? p + '_keys.json' : p;
      })
      .join('/');

    await zip.add(keyIvPairFileName, new BlobReader(keyIvPairJsonBlob), {
      password,
    });

    completed++;
  });

  await Promise.all(promises);

  if (completed > 0) {
    download(await zip.close(), `${file.name}.zip`);
  }

  if (completed === paths.length) {
    updateNotification(
      notificationId,
      'success',
      `${file.name} downloaded`,
      100,
    );
  } else {
    updateNotification(
      notificationId,
      'error',
      `Downloaded ${completed} files out of ${paths.length}`,
      (completed / paths.length) * 100,
    );
  }
}

async function handleDelete({
  path,
  file,
  user,
  close,
  supabase,
  addNotification,
  updateNotification,
}: DeleteArgs) {
  close();
  const originalPath = formatFilePath(path, file.name);
  const paths = await getSubFiles(originalPath, user?.id!, supabase);

  const notificationId = addNotification(
    `Moving ${file.name} to trash`,
    'loading',
    0,
  );

  let completed = 0;

  await Promise.all(
    paths.map(async (path) => {
      const source = `${user?.id}/${path}`;
      const destination = `${user?.id}/Trash/${path}`;

      const { error: moveError } = await supabase.storage
        .from('Files')
        .move(source, destination);

      if (moveError) {
        console.error(moveError);
        return addNotification(`Failed to move ${source} to trash`, 'error');
      }

      const { data: keys } = await supabase
        .from('keys')
        .select('id')
        .eq('path', source)
        .single();

      if (keys) {
        await supabase
          .from('trash')
          .insert({ key_id: keys.id, previous_path: source });
      }

      removeFromStore(file.id);

      completed++;
    }),
  );

  if (completed === 0) {
    return updateNotification(
      notificationId,
      'error',
      `Failed to move ${file.name} to trash`,
      100,
    );
  }

  updateNotification(
    notificationId,
    'success',
    `${file.name} move to trash`,
    100,
  );
}

export default function DefaultMenu({
  file,
  close,
}: {
  file: FileObject;
  close: () => void;
}) {
  const path = usePathname();
  const user = useUserContext();
  const { supabase } = useSupabase();
  const { selectFile } = useFileListActions();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const { addNotification, updateNotification } = useNotification();

  const viewDetails = () => {
    selectFile(file);
    close();
  };

  return (
    <>
      <div className="w-64">
        <ul className="border-b border-gray-300 p-1.5">
          {file.metadata && (
            <li className="w-full rounded-md hover:bg-gray-300/50">
              <button className="w-full p-2 text-left" onClick={viewDetails}>
                View details
              </button>
            </li>
          )}
          <li className="w-full rounded-md hover:bg-gray-300/50">
            <button
              className="w-full p-2 text-left"
              onClick={() => setShowPasswordPopup(true)}
            >
              Download
            </button>
          </li>
        </ul>
        <ul className="p-1.5">
          <li className="w-full rounded-md hover:bg-gray-300/50">
            <button
              className="w-full p-2 text-left"
              onClick={async () =>
                handleDelete({
                  path,
                  file,
                  user: user!,
                  close,
                  supabase,
                  addNotification,
                  updateNotification,
                })
              }
            >
              Delete
            </button>
          </li>
        </ul>
      </div>

      {showPasswordPopup && (
        <div className="fixed left-0 top-0 z-50 flex h-screen w-screen">
          <div className="relative z-50 m-auto grid w-96 transform grid-cols-1 gap-6 rounded-xl bg-white p-7 text-[#292A2C]/90 shadow-2xl transition-transform">
            <h1 className="text-2xl">Set Password</h1>
            <input
              type="password"
              className="h-14 rounded-md border border-gray-400 px-6 focus:outline-2 focus:outline-[#7070FE]"
              onChange={(e) => setPassword(e.target.value)}
            />

            <span className="ml-auto flex gap-4">
              <button
                className="rounded-full p-3 text-base text-[#7070FE] hover:bg-[#7070FE]/20"
                onClick={close}
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-[#7070FE] p-3 text-base text-white hover:bg-[#7070FE]/70"
                onClick={async () => {
                  setLoading(true);
                  await handleDownload({
                    path,
                    file,
                    close,
                    supabase,
                    password,
                    user: user!,
                    addNotification,
                    updateNotification,
                  });
                  setLoading(false);
                  setShowPasswordPopup(false);
                  close();
                }}
                disabled={loading}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faCircleNotch} width={48} spin />
                ) : (
                  'Download'
                )}
              </button>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
