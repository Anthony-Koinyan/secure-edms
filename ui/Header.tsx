import { createClient } from '@/utils/supabase-server';
import SearchBar from './Search';
import UserInfo from './UserInfo';

const Header = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <>
      <header className="sticky md:ml-64 md:w-[calc(100vw-16rem)] border-b border-gray-200 grid md:grid-cols-10 grid-cols-12 z-30">
        <div className="pl-7 md:px-10 py-2.5 md:py-5 col-span-9 md:col-span-7 items-center flex">
          <SearchBar />
        </div>
        <div className="pr-7 md:px-10 py-2.5 md:py-5 w-full md:border-l items-center col-span-3 md:col-span-3">
          <div className="flex gap-4 py-2 md:p-0 rounded-full sm:justify-between items-center text-base ml-auto md:ml-0">
            <span className="sm:block hidden my-auto sm:text-base md:text-lg lg:text-xl">
              {user?.user_metadata?.name}
            </span>
            <UserInfo user={user} />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
