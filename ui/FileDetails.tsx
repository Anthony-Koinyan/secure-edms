import type { FileObject } from '@/lib/types';
import { convertFileSize } from '@/utils/convert-file-size';
import getFileType from '@/utils/getFileType';
import { IconDetector } from '@/utils/set-icon-based-on-file-type';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// FIXME: The selected file should stay highlighted when view is changed

export function FileDetails({
  file,
  path,
  closeWindow,
}: {
  file: FileObject;
  path: string;
  closeWindow: () => void;
}) {
  // };
  return (
    <aside className="md:border-l md:border-l-gray-200 md:col-span-3 md:w-full w-screen h-full md:block fixed md:relative z-40 md:z-1 shadow-md md:shadow-none bg-white">
      <section className="flex justify-between px-10 py-8 border-b border-gray-200">
        <h2 className="flex text-base font-extrabold w-3/5 items-center">
          <span className="w-10 h-10 border flex items-center justify-center rounded-lg border-gray-200 p-2">
            <IconDetector mimeType={file.metadata?.mimetype} />
          </span>
          <span className="ml-4 truncate">{file.name}</span>
        </h2>
        <button onClick={closeWindow}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </section>
      <section className="px-7 md:px-10 py-8 border-b border-gray-200"></section>
      <section className="px-7 md:px-10 py-8">
        <h2 className="text-md font-extrabold mb-6">Properties</h2>
        <div className="w-full text-base grid grid-cols-3 gap-y-4">
          <span className="font-extralight col-span-1 ">Size</span>
          <span className="col-span-2">
            {convertFileSize(file.metadata?.size) || 'Unknown'}
          </span>
          <span className="font-extralight col-span-1">Created</span>
          <span className="col-span-2">
            {file.created_at
              ? `${new Date(file.created_at).toDateString()} \n
               ${new Date(file.created_at).toLocaleTimeString()}`
              : 'Unknown'}
          </span>
          <span className="font-extralight col-span-1">Modified</span>
          <span className="col-span-2">
            {file.updated_at
              ? `${new Date(file.updated_at).toDateString()} \n
              ${new Date(file.updated_at).toLocaleTimeString()}`
              : 'Unknown'}
          </span>
          <span className="font-extralight col-span-1">Type</span>
          <span className="col-span-2">
            {getFileType(file.metadata?.mimetype)}
          </span>
          <span className="font-extralight col-span-1">Location</span>
          <span className="col-span-2 truncate">{`My files${
            path !== '/' ? path : ''
          }`}</span>
        </div>
      </section>
    </aside>
  );
}
