'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { faChevronRight, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default ({ path }: { path: string }) => {
  const folders = path.length === 1 ? [path] : path.split('/');
  const [maxFolder, setMaxFolders] = useState<1 | 3>(3);

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    function handleResize() {
      setMaxFolders(window.innerWidth < 640 ? 1 : 3);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  });

  const truncatedFolders = folders.slice(-maxFolder);
  const dropdownFolders = folders.slice(0, -maxFolder);

  return (
    <div className="max-w-4xl mx-auto">
      <ul className="font-light font-sm flex gap-4 items-center">
        {dropdownFolders.length > 0 && (
          <>
            <li>
              <button className="flex items-center" onClick={toggleDropdown}>
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  className="w-12 h-12 my-auto hover:bg-gray-300/30 bg-gray-300/20 md:bg-white rounded-lg px-1 py-2 mr-4"
                />
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className={`w-2 h-2 my-auto ${
                    showDropdown ? 'transform rotate-90' : ''
                  }`}
                />
              </button>
            </li>
            {showDropdown && (
              <div className="absolute z-10 bg-white rounded-lg shadow-lg py-1 mt-20 cursor-pointer">
                <ul className="font-light font-sm flex flex-col gap-2 p-2">
                  {dropdownFolders.map((folder, index) => {
                    const route = dropdownFolders.slice(0, index + 1).join('/');

                    return (
                      <React.Fragment key={Math.random() * 100000000}>
                        <li className="w-full hover:bg-gray-300/20 rounded-lg">
                          <Link href={route || '/'} className="px-2 py-1">
                            {folder === ''
                              ? 'My files'
                              : folder.split('-').join(' ')}
                          </Link>
                        </li>
                        <span className="h-px bg-gray-200 last:hidden"></span>
                      </React.Fragment>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {truncatedFolders.map((folder, index) => {
          const route = truncatedFolders.slice(0, index + 1).join('/');

          return (
            <li className="flex cursor-pointer" key={Math.random() * 100000000}>
              <Link
                href={route || '/'}
                className={`${
                  index === truncatedFolders.length - 1 ? 'font-bold' : ''
                } hover:bg-gray-300/20 p-2 rounded-lg`}
              >
                {folder === '' || folder === '/'
                  ? 'My files'
                  : folder.split('-').join(' ')}{' '}
              </Link>
              {index !== truncatedFolders.length - 1 && (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="w-2 h-2 my-auto ml-4"
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
