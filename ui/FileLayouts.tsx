import { FileObject } from '@/lib/types';
import { FileDetailed, FileLarge, FileSmall } from './File';

export function TableLayout({ files }: { files: FileObject[] }) {
  return (
    <section>
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-12 text-lg mb-3">
          <div className="font-extralight col-span-5 text-sm">Name</div>
          <div className="font-extralight col-span-2 text-sm hidden md:block">
            Created on
          </div>
          <div className="font-extralight col-span-2 text-sm hidden md:block">
            Last changed
          </div>
          <div className="font-extralight col-span-2 text-sm hidden md:block">
            Size
          </div>
        </div>

        {files?.map((file) => (
          <FileDetailed key={file.id} file={file} />
        ))}
      </section>
    </section>
  );
}

export function GridLayout({ files }: { files: FileObject[] }) {
  const folders = files?.filter((file) => !file.metadata);
  const allFiles = files?.filter((file) => !!file.metadata);

  return (
    <>
      <section>
        <div className="flex my-6 items-center">
          <h2 className="text-lg font-bold">Folders</h2>
        </div>

        <div className="grid md:gap-8 gap-4 md:grid-cols-4 grid-cols-2">
          {folders?.map((folder) => (
            <FileSmall key={folder.id} file={folder} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex my-6 items-center">
          <h2 className="text-lg font-bold">Files</h2>
        </div>

        <div className="grid  md:gap-8 gap-4 md:grid-cols-4 grid-cols-2">
          {allFiles?.map((file) => (
            <FileLarge key={file.id} file={file} />
          ))}
        </div>
      </section>
    </>
  );
}
