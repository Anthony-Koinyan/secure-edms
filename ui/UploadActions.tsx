import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useNotification } from '@/lib/Notifications';
import { useSupabase } from '@/lib/supabase-provider';
import { useUserContext } from '@/lib/user-context';
import { faCircleNotch, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Upload from './UploadFile';
import { revalidatePath } from 'next/cache';
import { addToStore } from 'stores/files';

type SupabaseClient = ReturnType<typeof useSupabase>['supabase'];

const NewEmptyFolder = ({
  close,
  supabase,
  path,
}: {
  close: () => void;
  supabase: SupabaseClient;
  path: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification, updateNotification } = useNotification();
  const user = useUserContext();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const createFolder = async () => {
    if (inputRef.current) {
      const folderName = inputRef.current?.value;

      if (folderName === 'Trash') {
        return addNotification(
          '`Trash` as it is a reserved folder name! Name the folder something else.',
          'error',
        );
      }

      setIsLoading(true);

      const notificationId = addNotification(`Creating ${folderName}`);

      const dir = `/${user?.id}${path
        .split('-')
        .join(' ')}/${folderName}/.placeholder`;

      const { error } = await supabase.storage.from('Files').upload(dir, '');

      setIsLoading(false);

      if (error) {
        console.log(error);
        return updateNotification(
          notificationId,
          'error',
          error.message === 'The resource already exists'
            ? `${folderName} already exists`
            : `Failed to create ${folderName}`,
        );
      }

      updateNotification(notificationId, 'success', `${folderName} created`);
      close();
      addToStore({
        name: folderName,
        id: window.crypto.randomUUID(),
        // @ts-expect-error
        updated_at: null,
        // @ts-expect-error
        created_at: null,
        // @ts-expect-error
        last_accessed_at: null,
        // @ts-expect-error
        metadata: null,
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex w-screen h-screen">
      <div className="relative p-7 rounded-xl w-96 z-50 m-auto bg-white shadow-2xl transform transition-transform text-[#292A2C]/90 grid grid-cols-1 gap-6">
        <h1 className="text-2xl">Create folder</h1>
        <input
          type="text"
          className="h-14 px-6 border border-gray-400 focus:outline-2 rounded-md focus:outline-[#7070FE]"
          defaultValue="Untitled folder"
          ref={inputRef}
        />

        <span className="ml-auto flex gap-4">
          <button
            className="text-[#7070FE] text-base hover:bg-[#7070FE]/20 p-3 rounded-full"
            onClick={close}
          >
            Cancel
          </button>
          <button
            className="text-white bg-[#7070FE] text-base hover:bg-[#7070FE]/70 p-3 rounded-full"
            onClick={createFolder}
            disabled={isLoading}
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faCircleNotch} width={48} spin />
            ) : (
              'Create'
            )}
          </button>
        </span>
      </div>
    </div>
  );
};

export default ({ close }: { close: () => void }) => {
  const { supabase } = useSupabase();

  const [isNewFolderDialogVisible, setIsNewFolderDialogVisible] =
    useState(false);
  const path = usePathname();

  return (
    <>
      <div
        className="fixed top-0 left-0 h-full w-screen z-50 bg-gray-800 opacity-30"
        onClick={close}
      ></div>
      {!isNewFolderDialogVisible && (
        <div className="fixed md:top-0 md:left-0 md:bottom-0 md:right-0 bottom-48 right-10 p-4 rounded-xl w-72 h-fit md:ml-72 md:mt-12 z-50 bg-white shadow-2xl transform transition-transform text-[#292A2C]/90 flex flex-col gap-3">
          <button
            className="p-4 hover:bg-gray-300/30"
            onClick={() => {
              setIsNewFolderDialogVisible(true);
            }}
          >
            <FontAwesomeIcon icon={faFolderPlus} />
            <span className="ml-4">New folder</span>
          </button>
          <div className="w-full h-px border border-gray-400"></div>
          <Upload
            supabase={supabase}
            forFolder={true}
            close={close}
            path={path}
          >
            Folder upload
          </Upload>
          <Upload
            supabase={supabase}
            forFolder={false}
            close={close}
            path={path}
          >
            File upload
          </Upload>
        </div>
      )}
      {isNewFolderDialogVisible && (
        <NewEmptyFolder close={close} supabase={supabase} path={path} />
      )}
    </>
  );
};
