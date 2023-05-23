import { Dispatch, SetStateAction, useState } from 'react';

import { FileObject } from '@/lib/types';
import { convertFileSize } from '@/utils/convert-file-size';
import { IconDetector } from '@/utils/set-icon-based-on-file-type';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ContextMenu from './ContextMenu';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useFileListActions } from './FileList';

const getRedirectURL = (path: string, filename: string) => {
  const rootDir = path === '/' ? '' : path;
  const redirectURL = `${rootDir}/${filename.split(' ').join('-')}`;

  return redirectURL;
};

function FileInTableLayout({
  file,
  handleFileSelection,
  setShowContextMenu,
  setCursorPosition,
}: {
  file: FileObject;
  handleFileSelection?: (file: FileObject) => void;
  setShowContextMenu: Dispatch<SetStateAction<boolean>>;
  setCursorPosition: Dispatch<
    SetStateAction<{
      x: number;
      y: number;
    }>
  >;
}) {
  return (
    <>
      <label
        htmlFor={file.id}
        className="relative gap-x-5 grid grid-cols-6 grid-rows-2 md:grid-rows-1 md:grid-cols-12 items-center px-4 py-2 rounded-xl md:gap-2 text-base border-2 border-gray-200 focus-within:border-[#7070FE] focus-within:bg-[#7070FE]/10 hover:border-[#7070FE] hover:bg-[#7070FE]/20 cursor-pointer"
        onContextMenu={(e) => {
          e.preventDefault();
          if (file.metadata) {
            setShowContextMenu(true);
            setCursorPosition({ x: e.clientX, y: e.clientY });
          }
        }}
      >
        <input
          type="radio"
          name={file.id}
          id={file.id}
          className="sr-only"
          onFocus={() => {
            if (handleFileSelection) {
              handleFileSelection(file);
            }
          }}
        />

        <div
          className="relative p-2 col-span-1 row-span-2 md:row-span-1 rounded-lg w-10 h-10 flex bg-white"
          style={{ border: 'inherit' }}
        >
          <IconDetector mimeType={file.metadata?.mimetype} />
        </div>
        <span className="relative col-span-4 row-start-1 col-start-2 truncate md:-ml-3">
          {file.name}
        </span>

        <span className="relative col-span-2 col-start-6 md:block hidden">
          {file.created_at ? new Date(file.created_at).toDateString() : '-'}
        </span>
        <span className="relative col-span-2 col-start-8 md:block hidden">
          {file.updated_at ? new Date(file.updated_at).toDateString() : '-'}
        </span>
        <span className="relative col-span-2 md:col-span-2 text-sm md:text-base text-gray-500 md:text-black col-start-2 md:col-start-10 row-start-2 md:row-start-auto">
          {convertFileSize(file.metadata?.size) || '-'}
        </span>

        <button
          className="relative col-span-1 col-start-6 md:col-start-12 row-span-2 md:row-span-1 hover:bg-gray-300/60 w-10 h-10 rounded-full"
          onClick={(e) => {
            if (!file.metadata) {
              e.preventDefault();
              e.stopPropagation();
            }

            setShowContextMenu(true);
            setCursorPosition({ x: e.clientX, y: e.clientY });
          }}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
      </label>
    </>
  );
}

export function FileDetailed({ file }: { file: FileObject }) {
  const { selectFile } = useFileListActions();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  if (file.metadata) {
    return (
      <>
        <FileInTableLayout
          file={file}
          handleFileSelection={() => selectFile(file)}
          setCursorPosition={setCursorPosition}
          setShowContextMenu={setShowContextMenu}
        ></FileInTableLayout>

        {showContextMenu && (
          <ContextMenu
            file={file}
            cursorPosition={cursorPosition}
            close={() => {
              setShowContextMenu(false);
            }}
          />
        )}
      </>
    );
  }

  const path = usePathname();
  const redirectURL = getRedirectURL(path, file.name);

  return (
    <>
      <Link
        href={redirectURL}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setCursorPosition({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
        }}
      >
        <FileInTableLayout
          file={file}
          setCursorPosition={setCursorPosition}
          setShowContextMenu={setShowContextMenu}
        ></FileInTableLayout>
      </Link>
      {showContextMenu && (
        <ContextMenu
          file={file}
          cursorPosition={cursorPosition}
          close={() => {
            setShowContextMenu(false);
          }}
        />
      )}
    </>
  );
}

export function FileLarge({ file }: { file: FileObject }) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  }>();

  const { selectFile } = useFileListActions();

  return (
    <>
      <label
        className="grid grid-cols-2 grid-rows-2 gap-5 hover:bg-[#FEE25B]/30 hover:border-[#FEE25B] border-2 px-2.5 md:px-5 py-3.5 md:py-3 border-gray-200 rounded-xl cursor-pointer"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setCursorPosition({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
        }}
      >
        <input
          type="radio"
          name={file.id}
          id={file.id}
          className="sr-only"
          onFocus={(e) => {
            e.preventDefault();
            selectFile(file);
          }}
        />
        <div
          className="p-2 rounded-lg w-10 h-10 flex bg-white col-span-1"
          style={{ border: 'inherit' }}
        >
          <IconDetector mimeType={file.metadata?.mimetype} />
        </div>
        <button
          className="w-10 h-10 rounded-full ml-auto mb-auto hover:bg-gray-300/30"
          onClick={(e) => {
            setShowContextMenu(true);
            setCursorPosition({ x: e.clientX, y: e.clientY });
          }}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>

        <div className=" col-span-2 row-span-1 row-start-2 flex flex-col gap-1">
          <span className="truncate text-base gap-1">{file.name}</span>
          <span className="font-light text-sm">
            {convertFileSize(file.metadata?.size) || '-'}
          </span>
        </div>
      </label>
      {showContextMenu && (
        <ContextMenu
          file={file}
          cursorPosition={cursorPosition}
          close={() => {
            setShowContextMenu(false);
          }}
        />
      )}
    </>
  );
}

export function FileSmall({ file }: { file: FileObject }) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  }>();

  const path = usePathname();
  const redirectURL = getRedirectURL(path, file.name);

  return (
    <>
      <Link href={redirectURL}>
        <label
          className="hover:bg-[#FEE25B]/30 hover:border-[#FEE25B] border-2 p-2.5 md:p-5 border-gray-200 rounded-xl h-20 items-center flex justify-between cursor-pointer"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCursorPosition({ x: e.clientX, y: e.clientY });
            setShowContextMenu(true);
          }}
        >
          <input type="radio" name={file.id} id={file.id} className="sr-only" />
          <div
            className="p-2 rounded-lg w-10 sm:h-10 flex bg-white"
            style={{ border: 'inherit' }}
          >
            <IconDetector mimeType={file.metadata?.mimetype} />
          </div>
          <span className="w-16 m-auto md:w-28 truncate md:text-base text-sm">
            {file?.name}
          </span>

          <button
            className="w-10 h-10 rounded-full m-auto hover:bg-gray-300/30"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowContextMenu(true);
              setCursorPosition({ x: e.clientX, y: e.clientY });
            }}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </label>
      </Link>

      {showContextMenu && (
        <ContextMenu
          file={file}
          cursorPosition={cursorPosition}
          close={() => {
            setShowContextMenu(false);
          }}
        />
      )}
    </>
  );
}
