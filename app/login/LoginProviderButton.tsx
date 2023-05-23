'use client';

import { useState } from 'react';

import { useSupabase } from '@/lib/supabase-provider';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Provider = 'github' | 'google';

export default function ({ provider }: { provider: Provider }) {
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();

  async function handleLogin(provider: Provider) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) console.log(error);
    setLoading(false);
  }

  const icon = provider === 'github' ? faGithub : faGoogle;
  const iconColor = provider === 'github' ? 'text-gray-600' : 'text-red-600';
  const providerStyles =
    provider === 'github'
      ? 'hover:bg-gray-600/30 hover:border-gray-600'
      : 'hover:bg-red-600/30 hover:border-red-600';

  return (
    <button
      className={`flex items-center justify-center border-2 border-gray-400 rounded-md p-2 transition-colors duration-300 ease-in-out w-56 ${providerStyles}`}
      onClick={() => handleLogin(provider)}
      disabled={loading}
    >
      <FontAwesomeIcon icon={icon} className={`mr-2 w-8 ${iconColor}`} />
      <span>
        Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
      </span>
    </button>
  );
}
