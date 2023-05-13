import { createClient } from '@/utils/supabase-server';

export type FileObject = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<ReturnType<typeof createClient>['storage']['from']>['list']
    >
  >['data']
>[number];
