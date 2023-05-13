import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { removeFromStore } from 'stores/files';

import { useNotification } from '@/lib/Notifications';
import { useSupabase } from '@/lib/supabase-provider';
import { FileObject } from '@/lib/types';
import { useUserContext } from '@/lib/user-context';
import { formatFilePath } from '@/utils/formatFilePath';
import { getSubFiles } from '@/utils/getSubFiles';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ConfirmDeletePopup({
  handleDelete,
  close,
  filename,
}: {
  handleDelete: () => void;
  close: () => void;
  filename: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex w-screen h-screen bg-gray-800 opacity-30"></div>
      <div className="fixed top-0 left-0 md:left-64 z-50 flex w-screen md:w-[calc(100vw-16rem)] h-screen">
        <div className="relative p-7 rounded-xl w-96 z-50 m-auto bg-white shadow-2xl transform transition-transform text-[#292A2C]/90 grid grid-cols-1 gap-6">
          <h1 className="text-2xl">Delete forever?</h1>
          <p className="text-lg">
            {filename} will be deleted forever and you won't be able to restore
            it
          </p>
          <span className="ml-auto flex gap-4">
            <button
              className="text-[#7070FE] text-base hover:bg-[#7070FE]/20 p-3 rounded-full"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="text-white bg-[#7070FE] text-base hover:bg-[#7070FE]/70 p-3 rounded-full"
              onClick={async () => {
                setIsLoading(true);
                handleDelete();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faCircleNotch} width={48} spin />
              ) : (
                'Delete'
              )}
            </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default function TrashMenu({
  file,
  close,
}: {
  file: FileObject;
  close: () => void;
}) {
  const { supabase } = useSupabase();
  const user = useUserContext();
  const path = usePathname();
  const { addNotification, updateNotification } = useNotification();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRestore = async () => {
    close();
    let completed = 0;

    const paths = await getSubFiles(
      formatFilePath(path, file.name),
      user?.id!,
      supabase,
    );

    const notificationId = addNotification(
      `Restoring ${file.name} to ${path.slice(7)}`,
      'loading',
      0,
    );

    const promises = paths.map(async (path) => {
      const destination = `${user?.id}/${path.slice(6)}`;

      const { error } = await supabase
        .from('trash')
        .delete()
        .eq('previous_path', destination);

      if (error) {
        console.error(error);
      }

      const { error: restoreError } = await supabase.storage
        .from('Files')
        .move(`${user?.id}/${path}`, destination);

      if (restoreError) {
        console.error(error);
        return updateNotification(
          notificationId,
          'error',
          error?.message ?? `Failed to restore ${file.name}`,
        );
      }

      removeFromStore(file.id);
      completed++;
    });

    await Promise.all(promises);

    if (completed === paths.length) {
      updateNotification(
        notificationId,
        'success',
        `${file.name} restored to ${path.slice(7)}`,
        100,
      );
    } else {
      updateNotification(
        notificationId,
        'error',
        `Restored ${completed} files out of ${paths.length}`,
        (completed / paths.length) * 100,
      );
    }
  };

  const handleDelete = async () => {
    let completed = 0;
    const originalPath = formatFilePath(path, file.name);
    const paths = await getSubFiles(originalPath, user?.id!, supabase);

    const previousPath = `${user?.id}/${formatFilePath(
      path.slice(6),
      file.name,
    )}`;

    const notificationId = addNotification(
      `Permanently deleting ${file.name}`,
      'loading',
      0,
    );

    const promises = paths.map(async (path) => {
      const { error } = await supabase.storage
        .from('Files')
        .remove([`${user?.id}/${path}`]);

      if (error) {
        console.error(error);
        return addNotification(`Failed to delete ${path}`, 'error');
      }

      const { error: cacheRemoveError } = await supabase
        .from('trash')
        .delete()
        .eq('previous_path', previousPath);

      if (cacheRemoveError) {
        console.error(error);
        return addNotification(`Failed to clear cache for ${path}`, 'error');
      }

      const { error: keyDelteError } = await supabase
        .from('keys')
        .delete()
        .eq('path', previousPath);

      if (keyDelteError) {
        console.error(error);
        return addNotification(`Failed to clear keys for ${path}`, 'error');
      }

      removeFromStore(file.id);
      completed++;
    });

    await Promise.all(promises);

    if (completed === paths.length) {
      updateNotification(
        notificationId,
        'success',
        `${file.name} permanently deleted`,
        100,
      );
    } else {
      updateNotification(
        notificationId,
        'error',
        `Deleted ${completed} files out of ${paths.length}`,
        (completed / paths.length) * 100,
      );
    }

    close();
  };

  return (
    <>
      {confirmDelete ? (
        <ConfirmDeletePopup
          filename={file.name}
          handleDelete={handleDelete}
          close={close}
        />
      ) : (
        <ul className="p-1.5">
          <li className="hover:bg-gray-300/50 w-full rounded-md">
            <button className="w-full text-left p-2" onClick={handleRestore}>
              Restore
            </button>
          </li>
          <li className="hover:bg-gray-300/50 w-full rounded-md">
            <button
              className="w-full text-left p-2"
              onClick={() => {
                setConfirmDelete(true);
              }}
            >
              Delete permanently
            </button>
          </li>
        </ul>
      )}
    </>
  );
}
