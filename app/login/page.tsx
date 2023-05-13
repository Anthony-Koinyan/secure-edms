'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase-provider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileShield } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { useRouter } from 'next/navigation';

function SocialLogin() {
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  // const router = useRouter();

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     if (session) {
  //       router.push('/');
  //     }
  //   });
  // });

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
          <span className="rounded-full bg-gray-200 p-2 items-center mr-3">
            <FontAwesomeIcon icon={faFileShield} />
          </span>
          <span className="text-2xl">Secure EDMS</span>
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
