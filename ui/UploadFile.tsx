import { usePathname } from 'next/navigation';
import { addToStore } from 'stores/files';

import { encryptFile, storeKey } from '@/lib/crypto';
import { useNotification } from '@/lib/Notifications';
import { useSupabase } from '@/lib/supabase-provider';
import { useUserContext } from '@/lib/user-context';
import { formatFilePath } from '@/utils/formatFilePath';
import { faFolderPlus, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@supabase/auth-helpers-nextjs';

interface HandleUploadArgs {
  files: FileList | null;
  user: User | undefined;
  path: string;
  supabase: ReturnType<typeof useSupabase>['supabase'];
  addNotification: (
    message: string,
    status?: 'error' | 'success' | 'loading' | 'info' | undefined,
    progress?: number | undefined,
  ) => string;
  updateNotification: (
    id: string,
    status: 'error' | 'success' | 'loading' | 'info',
    message: string,
    progress?: number | undefined,
  ) => void;
  close: () => void;
}

async function handleUpload({
  supabase,
  files,
  user,
  path,
  addNotification,
  updateNotification,
  close,
}: HandleUploadArgs) {
  close();

  let progress = 0;

  if (!!files && files.length > 0 && !!user) {
    const allFiles = [...files];

    // Add initial notification
    const notificationId = addNotification(
      `Uploading ${files.length} file(s)`,
      undefined,
      0,
    );

    // Loop through file list and run encryption and upload operation
    const promises = allFiles.map(async (file) => {
      if (file.name[0] === '.') {
        return;
      }

      // Update notification with encryption status
      updateNotification(notificationId, 'loading', `Encrypting ${file.name}`);

      // Encrypt file
      const [encryptedFile, encryptionError] = await encryptFile(file);

      // Handle encryption error and update notification with encryption error
      if (encryptionError || !encryptedFile) {
        console.error(encryptionError);
        return addNotification(`Failed to encrypt ${file.name}`, 'error');
      }

      // Update notification with storing key state
      updateNotification(
        notificationId,
        'loading',
        `Storing encryption key for ${file.name}`,
      );

      const dir = `${user?.id}/${formatFilePath(
        path,
        file.webkitRelativePath || file.name,
      )}`;

      // Store encryption keys in DB with supabase postgres wrapper
      const keyStoreError = await storeKey(
        { key: encryptedFile.key, iv: encryptedFile.iv },
        dir,
        user?.id!,
        supabase,
      );

      // Handle error if storing keys fails and update notification with error
      if (keyStoreError) {
        console.error(keyStoreError);
        return addNotification(`Failed to store keys ${file.name}`, 'error');
      }

      // Create file object to be uploaded
      const fileData = new File([encryptedFile.file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });

      // Upload file to AWS with supabase wrapper
      const { error } = await supabase.storage
        .from('Files')
        .upload(dir, await fileData.arrayBuffer(), {
          contentType: file.type,
        });

      // Handle error if upload fails and update notification with error
      if (error) {
        console.error(error);
        return addNotification(
          error.message === 'The resource already exists'
            ? `${file.name} already exists`
            : `Failed to upload ${file.name}`,
          'error',
        );
      }

      // Update UI with the new file
      if (!!file.webkitRelativePath) {
        if (progress === 0) {
          addToStore({
            name: file.name,
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
      } else {
        addToStore({
          name: file.name,
          id: window.crypto.randomUUID(),
          updated_at: new Date().toString(),
          created_at: new Date().toString(),
          // @ts-expect-error
          last_accessed_at: null,
          metadata: {
            size: file.size,
            mimetype: file.type,
            cacheControl: 'max-age=3600',
            lastModified: new Date().toString(),
            contentLength: file.size,
            httpStatusCode: 200,
          },
        });
      }

      progress++;

      // Update notification with file success
      updateNotification(
        notificationId,
        'loading',
        `Uploaded ${file.name}`,
        (progress / files.length) * 100,
      );
    });

    // Concurrently run encryption and upload files
    await Promise.all(promises);

    // Update notification with final status
    const percentComplete = (progress / files.length) * 100;
    const status = percentComplete === 100 ? 'success' : 'error';
    const message =
      percentComplete === 100 ? 'Upload complete!' : 'Upload failed';
    updateNotification(notificationId, status, message, percentComplete);
  }
}

export default function ({
  folder,
  close,
  children,
}: {
  folder: boolean;
  close: () => void;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const user = useUserContext();
  const { supabase } = useSupabase();
  const { addNotification, updateNotification } = useNotification();

  const upload = async (files: FileList | null) =>
    handleUpload({
      files,
      supabase,
      user,
      path,
      addNotification,
      updateNotification,
      close,
    });

  return (
    <label className="w-full p-4 hover:bg-gray-300/30 flex flex-row justify-start items-center cursor-pointer">
      <FontAwesomeIcon icon={folder ? faFolderPlus : faUpload} />
      <span className="ml-4">{children}</span>
      {folder ? (
        <input
          type="file"
          className="sr-only"
          /* @ts-expect-error */
          directory=""
          webkitdirectory=""
          onChange={(e) => upload(e.target.files)}
        />
      ) : (
        <input
          type="file"
          className="sr-only"
          multiple
          onChange={(e) => upload(e.target.files)}
        />
      )}
    </label>
  );
}
