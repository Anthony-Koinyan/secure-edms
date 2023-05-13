export default function Loading() {
  return (
    <>
      <section className="animate-pulse px-7 md:px-10 py-8 md:h-[calc(100vh-7rem)] h-[calc(100vh-10rem)] col-span-10">
        <div className="flex justify-between mb-6">
          <div className="w-3/5 bg-gray-300 h-5 rounded"></div>
          <span className="w-[5.5rem] flex justify-between">
            <div className="border-2 p-2 rounded-lg w-10 h-10 bg-gray-300"></div>
            <div className="border-2 p-2 rounded-lg w-10 h-10 bg-gray-300"></div>
          </span>
        </div>

        <section className="flex flex-col gap-4 mb-3">
          <div className="grid grid-cols-12 gap-4 text-lg">
            <div className="font-extralight col-span-5 text-sm bg-gray-300 h-6 rounded"></div>
            <div className="font-extralight col-span-2 text-sm hidden md:block bg-gray-300 h-6 rounded"></div>
            <div className="font-extralight col-span-2 text-sm hidden md:block bg-gray-300 h-6 rounded"></div>
            <div className="font-extralight col-span-2 text-sm hidden md:block bg-gray-300 h-6 rounded"></div>
          </div>

          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 grid grid-cols-12 gap-4 items-center py-2 px-4 rounded-lg border-2 border-gray-200 cursor-pointer"
            >
              <div className="col-span-4">
                <div className="bg-gray-300 h-5 rounded"></div>
              </div>
              <div className="col-span-2 text-sm hidden md:block">
                <div className="bg-gray-300 h-5 rounded"></div>
              </div>
              <div className="col-span-2 text-sm hidden md:block">
                <div className="bg-gray-300 h-5 rounded"></div>
              </div>
              <div className="col-span-2 text-sm hidden md:block">
                <div className="bg-gray-300 h-5 rounded"></div>
              </div>
            </div>
          ))}
        </section>
      </section>
    </>
  );
}
