import JSZip from 'jszip';
import { usePathname } from 'next/navigation';
import { removeFromStore } from 'stores/files';

import { decryptFile, fetchKey } from '@/lib/crypto';
import { useNotification } from '@/lib/Notifications';
import { useSupabase } from '@/lib/supabase-provider';
import { FileObject } from '@/lib/types';
import { useUserContext } from '@/lib/user-context';
import { formatFilePath } from '@/utils/formatFilePath';
import { getSubFiles } from '@/utils/getSubFiles';

import { useFileListActions } from './FileList';

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

  const handleDownload = async (decrypt: boolean) => {
    close();
    const originalPath = formatFilePath(path, file.name);
    const paths = await getSubFiles(originalPath, user?.id!, supabase);

    const notificationId = addNotification(
      `Downloading ${file.name}`,
      'loading',
      0,
    );

    const zip = new JSZip();
    let completed = 0;

    const promises = paths.map(async (path) => {
      const { data: file, error } = await supabase.storage
        .from('Files')
        .download(`${user?.id}/${path}`);

      if (error) {
        console.error(error);
        return addNotification(`Failed to download ${path}`, 'error');
      }

      if (decrypt) {
        const [data, error] = await fetchKey(`${user?.id}/${path}`, supabase);

        if (error || !data) {
          console.error(error);

          return addNotification(
            `Failed to fetch keys to decrypt ${path}`,
            'error',
          );
        }

        const { key, iv } = data;

        const [decryptedFile, decryptionError] = await decryptFile(
          file,
          key,
          iv,
        );

        if (decryptionError || !decryptedFile) {
          console.error(decryptionError);
          return addNotification(`Failed to decrypt ${path}`, 'error');
        }

        zip.file(path, decryptedFile);
      } else {
        zip.file(path, file);
      }

      completed++;
    });

    await Promise.all(promises);

    if (completed > 0) {
      console.log('foo');

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
  };

  return (
    <div className="w-64">
      <ul className="p-1.5 border-b border-gray-300">
        {file.metadata && (
          <li className="hover:bg-gray-300/50 w-full rounded-md">
            <button className="w-full text-left p-2" onClick={viewDetails}>
              View details
            </button>
          </li>
        )}
        <li className="hover:bg-gray-300/50 w-full rounded-md">
          <button
            className="w-full text-left p-2"
            onClick={async () => await handleDownload(true)}
          >
            Download
          </button>
        </li>
        <li className="hover:bg-gray-300/50 w-full rounded-md">
          <button
            className="w-full text-left p-2"
            onClick={async () => await handleDownload(false)}
          >
            Download encrypted copy
          </button>
        </li>
      </ul>
      <ul className="p-1.5">
        <li className="hover:bg-gray-300/50 w-full rounded-md">
          <button className="w-full text-left p-2" onClick={handleDelete}>
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
}
