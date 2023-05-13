'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState } from 'react';

import { FileObject } from '@/lib/types';
import BreadCrumbMenu from '@/ui/BreadCrumbMenu';
import { GridLayout, TableLayout } from '@/ui/FileLayouts';
import { faList, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import NoFilesFound from '../public/empty_folder_v2.svg';
import { FileDetails } from './FileDetails';

import type { Dispatch, SetStateAction } from 'react';
import { useStore } from '@nanostores/react';
import { fileStore, initStore } from 'stores/files';

const FileList = createContext<
  | {
      selectFile: Dispatch<SetStateAction<FileObject | null>>;
    }
  | undefined
>(undefined);

export const useFileListActions = () => {
  const actions = useContext(FileList);

  if (!actions) {
    throw new Error('file list not initialised');
  }

  return actions;
};

export default ({ files }: { files: FileObject[] }) => {
  const fileList = useStore(fileStore);
  const [fileView, setFileView] = useState<'grid' | 'table'>('table');
  const [file, setFile] = useState<FileObject | null>(null);
  const path = usePathname();

  return (
    <>
      <section
        className={`overflow-y-scroll px-7 md:px-10 py-8 md:h-[calc(100vh-7rem)] h-[calc(100vh-10rem)] ${
          file ? 'md:col-span-7 md:pr-10' : 'col-span-10'
        }`}
      >
        <div className="flex justify-between mb-3">
          <h1 className="w-3/5 text-base md:text-xl">
            <BreadCrumbMenu path={path} />
          </h1>
          <span className="text-base w-[5.5rem] flex justify-between">
            <button
              onClick={() => setFileView(() => 'grid')}
              className={`border-2 p-2 rounded-lg w-10 h-10 flex ${
                fileView === 'grid'
                  ? 'border-[#FEE25B] bg-[#FEE25B]/30'
                  : 'bg-gray-200/40 border-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faTableCellsLarge} className="m-auto" />
            </button>
            <button
              onClick={() => setFileView(() => 'table')}
              className={`border-2 p-2 rounded-lg w-10 h-10 flex ${
                fileView === 'table'
                  ? 'border-[#7070FE] bg-[#7070FE]/30'
                  : 'bg-gray-200/40 border-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faList} className="m-auto" />
            </button>
          </span>
        </div>
        <FileList.Provider value={{ selectFile: setFile }}>
          {files.length > 0 ? (
            fileView === 'table' ? (
              <TableLayout files={fileList.length > 0 ? fileList : files} />
            ) : (
              <GridLayout files={fileList.length > 0 ? fileList : files} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-5/6">
              <Image
                width={150}
                height={150}
                src={NoFilesFound}
                alt="This folder is empty"
              />
              <span className="mt-4 font-bold text-3xl">
                This folder is empty
              </span>
            </div>
          )}
        </FileList.Provider>
      </section>

      {file && (
        <FileDetails
          file={file}
          path={path}
          closeWindow={() => setFile(null)}
        />
      )}
    </>
  );
};
