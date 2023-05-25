import { ChangeEvent, DragEvent, useState } from 'react';

import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Upload({
  name,
  handleAddFile,
}: {
  name: 'file' | 'keys';
  handleAddFile: (file: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

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
      onDrop={handleDrop}
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
