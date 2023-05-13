import type { Database } from '@/lib/schema';
import { FileObject } from '@/lib/types';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';

type Supabase = SupabaseClient<Database>;

export default async ({
  supabase,
  path,
  limit,
  offset,
  search,
  sortBy,
  filter,
  transform,
}: {
  supabase: Supabase;
  path: string;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: { column: string; order: string };
  filter?: (file: FileObject) => boolean;
  transform?: (file: FileObject) => FileObject;
}) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let { data: files, error } = await supabase.storage
    .from('Files')
    .list(`${user?.id}/${path}`, { limit, offset, sortBy, search });

  if (files && !error && filter) {
    files = files.filter(filter);
  }

  if (files && !error && transform) {
    files = files.map(transform);
  }

  return { files, error };
};
