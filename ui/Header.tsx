import Image from 'next/image';

import { createClient } from '@/utils/supabase-server';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SearchBar from './Search';

const UserInfo = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-10 py-5 w-full border-l flex justify-between items-center col-span-3">
      <button>
        <FontAwesomeIcon icon={faBell} className="text-[#16171B] text-2xl" />
      </button>
      <div className="flex gap-4 bg-gray-300 py-2 px-3 rounded-full items-center text-base">
        <span>{user?.user_metadata?.name}</span>
        <Image
          src={user?.user_metadata.picture}
          alt="Profile Photo"
          width={36}
          height={36}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <>
      <header className="w-full border-b border-gray-200 grid grid-cols-10">
        <div className="px-10 py-5 col-span-7">
          <SearchBar />
        </div>
        <UserInfo />
      </header>
    </>
  );
};

export default Header;
