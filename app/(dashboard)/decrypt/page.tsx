'use client';

import { decryptFile } from '@/lib/crypto';
import { useNotification } from '@/lib/Notifications';
import download from '@/utils/download';
import { faCircleNotch, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, ChangeEvent } from 'react';

function Upload({
  name,
  handleAddFile,
}: {
  name: 'file' | 'keys';
  handleAddFile: (file: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  //
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      handleAddFile(file);
    }
    setIsDragOver(false);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);
      handleAddFile(file);
    }
  }

  return (
    <label
      className={`h-48 w-full cursor-pointer border-2 p-4 ${
        selectedFile || isDragOver
          ? 'border-gray-300'
          : 'border-dashed border-gray-400'
      } flex flex-col items-center justify-center rounded-lg ${
        isDragOver ? 'bg-gray-200' : ''
      }`}
      htmlFor={name}
      // @ts-expect-error
      onDrop={handleDrop}
      // @ts-expect-error
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        onChange={handleFileChange}
        className="sr-only"
        id={name}
        name={name}
      />

      {selectedFile ? (
        <div>
          <h4 className="mb-2 text-lg font-bold">Selected File:</h4>
          <p>{selectedFile.name}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <FontAwesomeIcon
            icon={faUpload}
            className="mb-2 rounded-full border-2 border-gray-300 p-4 text-gray-400"
          />
          <p className="text-gray-600">
            {isDragOver
              ? 'Drop the files here...'
              : `Drag and drop ${
                  name === 'file' ? 'encrypted file' : 'file containing keys'
                } here or click to select files`}
          </p>
        </div>
      )}
    </label>
  );
}

export default function () {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [keys, setKeys] = useState<File | null>(null);

  const { addNotification, updateNotification } = useNotification();

  async function decrypt(e: { preventDefault: () => void }) {
    e.preventDefault();
    setLoading(true);

    if (!keys) {
      setLoading(false);
      return addNotification('Please input keys!', 'error');
    }

    if (!file) {
      setLoading(false);
      return addNotification('Please input file!', 'error');
    }

    const notificationId = addNotification(
      `Downloading ${file.name}`,
      'loading',
      0,
    );

    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target) {
        updateNotification(
          notificationId,
          'error',
          'File read failed. Try again!',
          0,
        );
        setLoading(false);
        return;
      }

      updateNotification(notificationId, 'success', 'Parsing keys', 0);

      // Transform the keys file to a object
      let fileContent = event.target.result;
      const jsonData: { key: JsonWebKey; iv: Uint8Array } = JSON.parse(
        fileContent as string,
      );

      const { key: jsonKey, iv } = jsonData;

      const key = await crypto.subtle.importKey(
        'jwk',
        jsonKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt'],
      );

      updateNotification(
        notificationId,
        'success',
        'Keys parsed successfully',
        25,
      );

      // Decrypt the file
      updateNotification(notificationId, 'success', 'Decrypting file', 25);
      const [decryptedFile, error] = await decryptFile(
        file,
        key,
        new Uint8Array(iv),
      );

      if (error || !decryptedFile) {
        // do something
        console.error(error);
        updateNotification(
          notificationId,
          'error',
          'File read failed. Try again!',
          0,
        );
        setLoading(false);
        return;
      }

      updateNotification(
        notificationId,
        'success',
        'File decrypted successfully',
        50,
      );

      // Download the file
      updateNotification(
        notificationId,
        'success',
        'Downloading decrypted file',
        75,
      );

      download(new Blob([decryptedFile]), file.name);
      setLoading(false);
      updateNotification(notificationId, 'success', 'Download complete', 100);
    };

    reader.readAsText(keys);
    setLoading(false);
  }

  return (
    <section className="h-[calc(100vh-10rem)] overflow-y-scroll px-7 py-8 md:h-[calc(100vh-7rem)] md:px-1">
      <form
        className="m-auto flex flex-col gap-6 sm:w-[70%]"
        onSubmit={decrypt}
      >
        <label htmlFor="file" className="grid gap-3 font-bold">
          Upload encrypted file:
          <Upload name="file" handleAddFile={(file) => setFile(file)} />
        </label>
        <label htmlFor="keys" className="grid gap-3 font-bold">
          Upload keys:
          <Upload name="keys" handleAddFile={(file) => setKeys(file)} />
        </label>
        <button className="w-36 items-center rounded-lg bg-[#7070FE] p-3 text-white focus:outline-none focus:ring focus:ring-[#7070FE]/50">
          {loading ? (
            <FontAwesomeIcon icon={faCircleNotch} spin />
          ) : (
            'Decrypt Files'
          )}
        </button>
      </form>
    </section>
  );
}
