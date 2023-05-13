import { encryptFile, storeKey } from '@/lib/crypto';
import { useNotification } from '@/lib/Notifications';
import { useUserContext } from '@/lib/user-context';
import { formatFilePath } from '@/utils/formatFilePath';
import { faFolderPlus, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { addToStore } from 'stores/files';

export default ({
  supabase,
  forFolder,
  close,
  path,
  children,
}: {
  supabase: SupabaseClient;
  forFolder: boolean;
  close: () => void;
  path: string;
  children: React.ReactNode;
}) => {
  const { addNotification, updateNotification } = useNotification();
  const user = useUserContext();

  const handleUpload = async (files: FileList | null) => {
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

      const promises = allFiles.map(async (file) => {
        if (file.name[0] === '.') {
          return;
        }

        // Update notification with encryption status
        updateNotification(
          notificationId,
          'loading',
          `Encrypting ${file.name}`,
        );

        const [encryptedFile, encryptionError] = await encryptFile(file);

        // Update notification with encryption error
        if (encryptionError || !encryptedFile) {
          console.error(encryptionError);
          return addNotification(`Failed to encrypt ${file.name}`, 'error');
        }

        updateNotification(
          notificationId,
          'loading',
          `Storing encryption key for ${file.name}`,
        );

        const dir = `${user?.id}/${formatFilePath(
          path,
          file.webkitRelativePath || file.name,
        )}`;

        const keyStoreError = await storeKey(
          { key: encryptedFile.key, iv: encryptedFile.iv },
          dir,
          user?.id!,
          supabase,
        );

        if (keyStoreError) {
          console.error(keyStoreError);
          return addNotification(`Failed to store keys ${file.name}`, 'error');
        }

        const fileData = new File([encryptedFile.file], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        });

        const { error } = await supabase.storage
          .from('Files')
          .upload(dir, await fileData.arrayBuffer(), {
            contentType: file.type,
          });

        // Update notification with upload error
        if (error) {
          console.error(error);
          return addNotification(
            error.message === 'The resource already exists'
              ? `${file.name} already exists`
              : `Failed to upload ${file.name}`,
            'error',
          );
        }

        progress++;

        updateNotification(
          notificationId,
          'loading',
          `Uploaded ${file.name}`,
          (progress / files.length) * 100,
        );

        addToStore([
          {
            name: file.name,
            id: window.crypto.randomUUID(),
            // @ts-expect-error
            updated_at: file.webkitRelativePath ? new Date() : null,
            // @ts-expect-error
            created_at: file.webkitRelativePath ? new Date() : null,
            // @ts-expect-error
            last_accessed_at: null,
            // @ts-expect-error
            metadata: file.webkitRelativePath
              ? {
                  size: file.size,
                  mimetype: file.type,
                  cacheControl: 'max-age=3600',
                  lastModified: new Date(),
                  contentLength: file.size,
                  httpStatusCode: 200,
                }
              : null,
          },
        ]);
      });

      await Promise.all(promises);

      const percentComplete = (progress / files.length) * 100;
      // Update notification with final status
      const status = percentComplete === 100 ? 'success' : 'error';
      const message =
        percentComplete === 100 ? 'Upload complete!' : 'Upload failed';
      updateNotification(notificationId, status, message, percentComplete);
    }
  };

  return (
    <label className="w-full p-4 hover:bg-gray-300/30 flex flex-row justify-center items-center">
      <FontAwesomeIcon icon={forFolder ? faFolderPlus : faUpload} />
      <span className="ml-4">{children}</span>
      {forFolder ? (
        <input
          type="file"
          className="hidden"
          /* @ts-expect-error */
          directory=""
          webkitdirectory=""
          onChange={(e) => handleUpload(e.target.files)}
        />
      ) : (
        <input
          type="file"
          className="hidden"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
        />
      )}
    </label>
  );
};
