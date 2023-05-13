import type { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export default async function (supabase: SupabaseClient) {
  process.nextTick(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/login');
    }
  });
}
