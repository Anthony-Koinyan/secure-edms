'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@supabase/auth-helpers-nextjs';

import { useSupabase } from './supabase-provider';

const Context = createContext<User | undefined>(undefined);

export default function UserContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user!);
    };

    fetchUser();
  }, [supabase]);

  return <Context.Provider value={user}>{children}</Context.Provider>;
}

export const useUserContext = () => useContext(Context);
