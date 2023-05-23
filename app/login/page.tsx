'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSupabase } from '@/lib/supabase-provider';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Logo from '../../public/logo.png';

function SocialLogin() {
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function checkSessionAndRedirect() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const redirectFrom = searchParams.get('redirectedFrom');
        if (redirectFrom) {
          router.push(redirectFrom.toString());
        } else {
          router.push('/');
        }
      }
    }
    if (window.location.hash.includes('access_token')) {
      checkSessionAndRedirect();
    }
  });

  async function handleLogin(provider: 'google' | 'github') {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) console.log(error);
    setLoading(false);
  }

  return (
    <main className="flex items-center justify-center bg-[#dce1ea] w-screen h-screen">
      <div className="max-w-lg h-fit mx-auto p-4 rounded-md shadow-md bg-white">
        <div className="p-4">
          <span className="p-2 flex justify-between items-center">
            <Image
              width={64}
              height={64}
              src={Logo}
              alt="Leadcity logo"
              className="m-auto"
            />
            <div className="text-xl ml-4 w-full">Leadcity Secure EDMS</div>
          </span>
        </div>
        <h2 className="text-center text-xl font-bold mb-8">
          Welcome to Our App!
        </h2>
        <p className="text-center text-gray-500 mb-3">
          Please sign in to continue
        </p>
        <div className="flex items-center flex-col gap-4">
          <button
            className="flex items-center justify-center border-2 border-gray-400 rounded-md p-2 hover:bg-red-600/30 hover:border-red-600 transition-colors duration-300 ease-in-out w-56"
            onClick={() => handleLogin('google')}
            disabled={loading}
          >
            <FontAwesomeIcon
              icon={faGoogle}
              className="text-red-600 mr-2 w-8"
            />
            <span>Sign in with Google</span>
          </button>
          <button
            className="flex items-center justify-center border-2 border-gray-400 rounded-md p-2 hover:bg-gray-600/30 hover:border-gray-600 transition-colors duration-300 ease-in-out w-56"
            onClick={() => handleLogin('github')}
            disabled={loading}
          >
            <FontAwesomeIcon
              icon={faGithub}
              className="text-gray-600 mr-2 w-8"
            />
            <span>Sign in with GitHub</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-10 text-center">
          This app only supports social login to simplify the login process and
          protect your data.
        </p>
      </div>
    </main>
  );
}

export default SocialLogin;
