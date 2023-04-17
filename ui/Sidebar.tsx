"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  faClock,
  faFolder,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import {
  faArrowUpRightFromSquare,
  faFileShield,
  faPlus,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function StorageIndicator({ usedStorage }: { usedStorage: number }) {
  const totalStorage = 5;

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
  text,
  icon,
}: {
  route: string;
  text: string;
  icon: IconDefinition;
}) => {
  const pathname = usePathname();

  return (
    <Link
      href={route}
      className={`flex hover:bg-[#292A2C]/50 rounded-lg p-3 items-center w-full my-2 focus:outline-none focus:bg-[#292A2C]/50 active:ring-0 ${
        pathname === route
          ? "bg-[#292A2C] focus:ring-2 hover:ring-2 focus:ring-gray-500 hover:ring-gray-500"
          : ""
      }`}
    >
      <span className="mr-4">
        <FontAwesomeIcon icon={icon} />
      </span>
      <span>{text}</span>
    </Link>
  );
};

const Sidebar = () => {
  return (
    <section className="fixed top-0 left-0 h-screen sm:w-64 w-screen z-50 bg-[#16171B] text-lg text-[#F8F9FE] px-4 pb-10 shadow-lg transform transition-transform flex flex-col">
      <div className="my-8">
        <span className="rounded-full bg-[#47484c] p-2 items-center mr-3">
          <FontAwesomeIcon icon={faFileShield} />
        </span>
        <span className="text-2xl">Secure EDMS</span>
      </div>
      <button className="text-white items-center p-3 bg-[#7070FE] focus:outline-none focus:ring focus:ring-[#7070FE]/50 rounded-lg w-full mt-2 mb-6">
        <span>
          <FontAwesomeIcon icon={faPlus} className="m-auto pr-3" />
        </span>
        <span>Create</span>
      </button>
      <nav>
        <ul>
          <li>
            <NavItem route="/" text="My Files" icon={faFolder} />
          </li>
          <li>
            <NavItem
              route="/shared"
              text="Shared"
              icon={faArrowUpRightFromSquare}
            />
          </li>
          <li>
            <NavItem route="/recents" text="Recents" icon={faClock} />
          </li>
          <li>
            <NavItem route="/trash" text="Deleted" icon={faTrashCan} />
          </li>
        </ul>
      </nav>

      <StorageIndicator usedStorage={3.5} />
    </section>
  );
};

export default Sidebar;
