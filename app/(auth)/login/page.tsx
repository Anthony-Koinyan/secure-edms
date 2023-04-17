'use client';

import { useSupabase } from '@/lib/supabase-provider';

export default function Login() {
  const { supabase } = useSupabase();

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  }

  return (
    <button
      className="p-4 border-2 rounded-xl border-black"
      onClick={signInWithGoogle}
    >
      Login With Google
    </button>
  );
}
