'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useEffect, useState } from 'react';

import { faFolder, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
  faFileShield,
  faFolder as faFolderSolid,
  faPlus,
  faTrashCan as faTrashCanSolid,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import UploadActions from './UploadActions';

function StorageIndicator({ usedStorage }: { usedStorage: number }) {
  const totalStorage = 1;

  const usedPercent = (usedStorage / totalStorage) * 100;
  const unusedPercent = 100 - usedPercent;

  return (
    <div className="p-4 bg-[#292A2c] rounded-lg w-full mt-auto">
      <span className="flex mb-2">
        <div
          className="bg-[#F8F9FE] rounded-l-full h-2"
          style={{ width: `${usedPercent}%` }}
        ></div>
        <div
          className="bg-[#3F4044] rounded-r-full h-2"
          style={{ width: `${unusedPercent}%` }}
        ></div>
      </span>
      <p className="text-xs text-[#F8F9FE] mt-1">
        {usedStorage}GB used of {totalStorage}GB
      </p>
    </div>
  );
}

const NavItem = ({
  route,
  children,
  icon,
  isActive,
}: {
  route: string;
  children: React.ReactNode;
  icon: IconDefinition;
  isActive: boolean;
}) => {
  return (
    <Link
      href={route}
      className={`flex sm:flex-row flex-col md:hover:bg-[#292A2C]/50 rounded-lg p-3 items-center w-full my-auto md:my-2 focus:outline-none focus:bg-[#292A2C]/50 active:ring-0 ${
        isActive
          ? 'md:bg-[#292A2C] md:focus:ring-2 md:hover:ring-2 md:focus:ring-gray-500 md:hover:ring-gray-500'
          : ''
      }`}
    >
      <span className="md:mr-4">
        <FontAwesomeIcon icon={icon} />
      </span>
      <span>{children}</span>
    </Link>
  );
};

const Nav = ({ mobileView = false }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const segement = useSelectedLayoutSegment();

  const activeStyles =
    'md:bg-[#292A2C] md:focus:ring-2 md:hover:ring-2 md:focus:ring-gray-500 md:hover:ring-gray-500';

  return (
    <>
      <nav
        className={`${
          mobileView &&
          'fixed top-[calc(100vh-5rem)] bottom-0 w-screen h-20 z-50 bg-[#16171B] text-lg text-[#F8F9FE] px-2 gap-4 shadow-lg transform transition-transform'
        }`}
      >
        <ul
          className={`${mobileView && 'grid grid-rows-1 grid-cols-2 my-auto'}`}
        >
          <li>
            <NavItem
              isActive={segement !== 'Trash'}
              route="/"
              icon={
                mobileView && segement !== 'Trash' ? faFolderSolid : faFolder
              }
            >
              My Files
            </NavItem>
          </li>
          <li>
            <NavItem
              isActive={segement === 'Trash'}
              route="/Trash"
              icon={
                mobileView && segement === 'Trash'
                  ? faTrashCanSolid
                  : faTrashCan
              }
            >
              Deleted
            </NavItem>
          </li>
        </ul>
      </nav>
      {mobileView && (
        <>
          <button
            className=" absolute bottom-28 right-5 z-50 text-white w-16 h-16 flex p-2 bg-[#7070FE] focus:outline-none focus:ring focus:ring-[#7070FE]/50 rounded-full"
            onClick={() => setShowOverlay(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="m-auto w-14 h-14" />
          </button>

          <div>
            {showOverlay && (
              <UploadActions close={() => setShowOverlay(false)} />
            )}
          </div>
        </>
      )}
    </>
  );
};

const Sidebar = () => {
  const [uploadActionsVisiblity, setUploadActionsVisiblity] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window?.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window?.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [window?.innerWidth]);

  if (windowWidth && windowWidth > 768) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-64 z-50 bg-[#16171B] text-lg text-[#F8F9FE] px-4 pb-10 shadow-lg transform transition-transform flex flex-col">
        <div className="my-8">
          <span className="rounded-full bg-[#47484c] p-2 items-center mr-3">
            <FontAwesomeIcon icon={faFileShield} />
          </span>
          <span className="text-2xl">Secure EDMS</span>
        </div>
        <button
          className="text-white items-center p-3 bg-[#7070FE] focus:outline-none focus:ring focus:ring-[#7070FE]/50 rounded-lg w-full mt-2 mb-6"
          onClick={() => setUploadActionsVisiblity(true)}
        >
          <span>
            <FontAwesomeIcon icon={faPlus} className="m-auto pr-3" />
          </span>
          <span>New</span>
        </button>
        <div>
          {uploadActionsVisiblity && (
            <UploadActions close={() => setUploadActionsVisiblity(false)} />
          )}
        </div>
        <Nav />
        <StorageIndicator usedStorage={0.35} />
      </aside>
    );
  }

  return <Nav mobileView={true} />;
};

export default Sidebar;
