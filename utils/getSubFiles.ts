import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function getSubFiles(
  path: string,
  userId: string,
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data: entries, error } = await supabase.storage
    .from('Files')
    .list(`${userId}/${path}`);

  if (error) {
    console.error(error);
    return [];
  }

  if (entries.length === 0) {
    return [path];
  }

  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = `${path}/${entry.name}`;
    if (entry.name.includes('.')) {
      // Entry is a file
      files.push(entryPath);
    } else {
      // Entry is a folder
      const folderFiles = await getSubFiles(entryPath, userId, supabase);
      files.push(...folderFiles);
    }
  }

  return files;
}
