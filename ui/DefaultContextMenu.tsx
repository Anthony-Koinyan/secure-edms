import { usePathname } from 'next/navigation';
import { removeFromStore } from 'stores/files';

import { fetchKey } from '@/lib/crypto';
import { useNotification } from '@/lib/Notifications';
import { useSupabase } from '@/lib/supabase-provider';
import { FileObject } from '@/lib/types';
import { useUserContext } from '@/lib/user-context';
import { formatFilePath } from '@/utils/formatFilePath';
import { getSubFiles } from '@/utils/getSubFiles';

import { useFileListActions } from './FileList';
import { User } from '@supabase/auth-helpers-nextjs';
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js';

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

    const keyIvPairToJson = JSON.stringify(keyIvPair, null, 2);
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
    const link = document.createElement('a');
    link.href = URL.createObjectURL(await zip.close());
    link.download = `${file.name}.zip`;
    link.click();
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

export default function DefaultMenu({
  file,
  close,
}: {
  file: FileObject;
  close: () => void;
}) {
  const { supabase } = useSupabase();
  const user = useUserContext();
  const path = usePathname();
  const { selectFile } = useFileListActions();
  const { addNotification, updateNotification } = useNotification();

  const viewDetails = () => {
    selectFile(file);
    close();
  };

  // TODO: Make this move the files to the top level Trash folder
  const handleDelete = async () => {
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
  };

  return (
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
            onClick={async () =>
              await handleDownload({
                path,
                file,
                user: user!,
                close,
                supabase,
                addNotification,
                updateNotification,
                password: '~~~',
              })
            }
          >
            Download encrypted copy
          </button>
        </li>
      </ul>
      <ul className="p-1.5">
        <li className="w-full rounded-md hover:bg-gray-300/50">
          <button className="w-full p-2 text-left" onClick={handleDelete}>
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
}
