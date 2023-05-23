import { randomUUID } from 'crypto';

import StoreInitialiser from '@/lib/StoreInitialiser';
import FileList from '@/ui/FileList';
import { createClient } from '@/utils/supabase-server';
import { Metadata } from 'next';

export const revalidate = 0;

interface Props {
  params: { path: string[] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const folder = params.path ? params.path.at(-1)! : 'My files';
  const title = folder.split('-').join(' ');

  return { title: `${title} | LCU Secure EDMS` };
}

export default async function ({ params }: Props) {
  const supabase = createClient();

  const path = !params.path
    ? ''
    : params.path[0] === 'Trash' && params.path.length === 1
    ? 'Trash'
    : params.path.map((path) => path.split('-').join(' ')).join('/');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let { data: files } = await supabase.storage
    .from('Files')
    .list(`${user?.id}/${path}`, {
      limit: 30,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (files) {
    files = files.filter(
      (file) => !file.name.startsWith('.') && file.name !== 'Trash',
    );

    files = files.map((file) => {
      file.id ??= randomUUID();
      return file;
    });

    if (params.path && params.path[0] === 'Trash') {
      const { data } = await supabase.from('trash').select('*');
      if (data && data.length > 0) {
        const toBeDeleted = data?.filter((d) => {
          if (d.date_added) {
            return (
              Date.now() - new Date(d.date_added).getMilliseconds() > 2592000000
            );
          }
        });

        const promises = toBeDeleted.map(async (d) => {
          let path = d.previous_path.split('/');
          path = [path[0], 'Trash', ...path];
          const finalPath = path.join('/');

          await supabase.storage.from('Files').remove([finalPath]);
          await supabase.from('keys').delete().eq('id', d.key_id);
          await supabase.from('trash').delete().eq('id', d.id);
        });

        await Promise.all(promises);
      }
    }
  }

  // TODO: Show an error if there is an error

  return (
    <>
      <StoreInitialiser files={files ?? []} />
      <div className="grid grid-cols-10">
        <FileList files={files ?? []} />
      </div>
    </>
  );
}
