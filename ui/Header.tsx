import SearchBar from './Search';

const Header = async () => {
  return (
    <>
      <header className="w-full border-b border-gray-200 grid grid-cols-10">
        <div className="p-5 col-span-7">
          <SearchBar />
        </div>
        <div className="p-5 w-1/3 border-l"></div>
      </header>
    </>
  );
};

export default Header;
