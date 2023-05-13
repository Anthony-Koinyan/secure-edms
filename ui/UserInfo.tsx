'use client';
import Image from 'next/image';
import { useState } from 'react';

import { faSignOut, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { User } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/supabase-provider';
import { useRouter } from 'next/navigation';

export default ({ user }: { user: User | null }) => {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push('/login');
    }

    setLoading(false);
  };

  return (
    <>
      <button
        className={`ml-auto sm:m-0 hover:bg-slate-800/40 p-1 rounded-full ${
          showOverlay ? 'bg-gray-800/40' : ''
        }`}
        onClick={() => {
          setShowOverlay(() => !showOverlay);
        }}
      >
        <Image
          src={user?.user_metadata.picture}
          alt="Profile Photo"
          width={48}
          height={48}
          className="rounded-full w-12 h-12"
        />
      </button>

      {showOverlay && (
        <>
          <div
            className="fixed top-0 left-0 flex w-screen h-screen bg-gray-800 opacity-5"
            onClick={(e) => {
              e.stopPropagation();
              setShowOverlay(() => !showOverlay);
            }}
          ></div>
          <div className="fixed top-28 left-4 md:left-[calc(100vw-21rem)] md:w-80 bg-[#fff6c7] rounded-2xl w-[calc(100vw-2rem)] p-4">
            <div className="grid grid-cols-4 grid-rows-2 md:grid-cols-8 md:gap-x-2 rounded-2xl bg-white p-2">
              <Image
                src={user?.user_metadata.picture}
                alt="Profile Photo"
                width={48}
                height={48}
                className="rounded-full m-auto w-12 h-12 col-span-1 md:col-span-2 row-span-2"
              />
              <div className="col-span-3 md:col-span-6 row-span-1 text-md text-left">
                {user?.user_metadata?.name}
              </div>
              <div className="col-span-3 md:col-span-6 row-span-1 text-sm font-light text-left">
                {user?.email}
              </div>
            </div>
            <span className="bg-[#FEE25B] h-0.5 w-full block mt-3"></span>
            <button
              className="p-2 mt-3 w-full text-left hover:bg-[#FEE25B]/60 rounded-xl"
              onClick={handleSignout}
            >
              {loading ? (
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  spin
                  className="w-12 h-12"
                />
              ) : (
                <FontAwesomeIcon icon={faSignOut} className="w-12 h-12" />
              )}
              <span className="text-gray-800">Sign out</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};
