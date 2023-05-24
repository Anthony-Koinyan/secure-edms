import Image from 'next/image';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase-server';

import Logo from '../../public/logo.png';
import LoginProviderButton from './LoginProviderButton';

export default async function ({
  searchParams,
}: {
  searchParams: { redirectedFrom: string };
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(searchParams.redirectedFrom ?? '/');
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
            <div className="text-xl ml-4 w-full">Lead City Secure EDMS</div>
          </span>
        </div>
        <h2 className="text-center text-xl font-bold mb-8">
          Welcome to Our App!
        </h2>
        <p className="text-center text-gray-500 mb-3">
          Please sign in to continue
        </p>
        <div className="flex items-center flex-col gap-4">
          <LoginProviderButton provider="google" />
          <LoginProviderButton provider="github" />
        </div>
        <p className="text-sm text-gray-500 mt-10 text-center">
          This app only supports social login to simplify the login process and
          protect your data.
        </p>
      </div>
    </main>
  );
}
