'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useEffect, useState } from 'react';

import { faFolder, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
  faFingerprint,
  faFolder as faFolderSolid,
  faPlus,
  faTrashCan as faTrashCanSolid,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Logo from '../public/logo.png';
import UploadActions from './UploadActions';

function StorageIndicator({ usedStorage }: { usedStorage: number }) {
  const totalStorage = 1;

  const usedPercent = (usedStorage / totalStorage) * 100;
  const unusedPercent = 100 - usedPercent;

  return (
    <div className="mt-auto w-full rounded-lg bg-[#292A2c] p-4">
      <span className="mb-2 flex">
        <div
          className="h-2 rounded-l-full bg-[#F8F9FE]"
          style={{ width: `${usedPercent}%` }}
        ></div>
        <div
          className="h-2 rounded-r-full bg-[#3F4044]"
          style={{ width: `${unusedPercent}%` }}
        ></div>
      </span>
      <p className="mt-1 text-xs text-[#F8F9FE]">
        {usedStorage} GB used of {totalStorage} GB
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
      className={`my-auto flex w-full flex-col items-center rounded-lg p-3 focus:bg-[#292A2C]/50 focus:outline-none active:ring-0 sm:flex-row md:my-2 md:hover:bg-[#292A2C]/50 ${
        isActive
          ? 'md:bg-[#292A2C] md:hover:ring-2 md:hover:ring-gray-500 md:focus:ring-2 md:focus:ring-gray-500'
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
          'fixed bottom-0 top-[calc(100vh-5rem)] z-50 h-20 w-screen transform gap-4 bg-[#16171B] px-2 text-lg text-[#F8F9FE] shadow-lg transition-transform'
        }`}
      >
        <ul
          className={`${mobileView && 'my-auto grid grid-cols-3 grid-rows-1'}`}
        >
          <li>
            <NavItem
              isActive={segement !== 'Trash' && segement !== 'decrypt'}
              route="/"
              icon={
                mobileView && segement !== 'Trash' && segement !== 'decrypt'
                  ? faFolderSolid
                  : faFolder
              }
            >
              My Files
            </NavItem>
          </li>
          <li>
            <NavItem
              isActive={segement === 'decrypt'}
              route="/decrypt"
              icon={faFingerprint}
            >
              Decrypt
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
            className="absolute bottom-28 right-5 z-50 flex h-16 w-16 rounded-full bg-[#7070FE] p-2 text-white focus:outline-none focus:ring focus:ring-[#7070FE]/50"
            onClick={() => setShowOverlay(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="m-auto h-14 w-14" />
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
  const [windowWidth, setWindowWidth] = useState(768);

  useEffect(() => {
    function handleResize() {
      if (window) {
        setWindowWidth(window.innerWidth);
      }
    }

    if (window) {
      window.addEventListener('resize', handleResize);
      handleResize();
    }

    return () => {
      if (window) {
        return window.removeEventListener('resize', handleResize);
      }
    };
  });

  if (windowWidth >= 768) {
    return (
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 transform flex-col bg-[#16171B] px-4 pb-10 text-lg text-[#F8F9FE] shadow-lg transition-transform">
        <div className="my-8">
          <span className="flex items-center justify-between p-2">
            <Image
              width={64}
              height={64}
              src={Logo}
              alt="Leadcity logo"
              className="m-auto"
            />
            <div className="ml-4 w-full text-xl">Lead City University</div>
          </span>
        </div>
        <button
          className="mb-6 mt-2 w-full items-center rounded-lg bg-[#7070FE] p-3 text-white focus:outline-none focus:ring focus:ring-[#7070FE]/50"
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
        <StorageIndicator usedStorage={0.1} />
      </aside>
    );
  }

  return <Nav mobileView={true} />;
};

export default Sidebar;
