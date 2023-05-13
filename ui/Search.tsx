'use client';
import { useEffect, useState } from 'react';

import { useSupabase } from '@/lib/supabase-provider';
import { FileObject } from '@/lib/types';
import { faSearch, faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';

async function searchFiles(
  path: string,
  userId: string,
  searchTerm: string,
  supabase: SupabaseClient,
) {
  const { data: entries, error } = await supabase.storage
    .from('Files')
    .list(`${userId}/${path}`);

  if (error) {
    console.error(error);
    return [];
  }

  if (entries.length === 0) {
    return [];
  }

  const files: FileObject[] = [];

  for (const entry of entries) {
    if (entry.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      const dir = path || 'My files';

      if (entry.metadata) {
        entry.metadata.path = dir;
      } else {
        entry.metadata = { path: dir };
      }

      entry.id ??= Math.random().toString(36).substr(2, 9);

      files.push(entry);
    }

    if (!entry.name.includes('.')) {
      // Entry is a folder
      const folderFiles = await searchFiles(
        path ? `${path}/${entry.name}` : `${entry.name}`,
        userId,
        searchTerm,
        supabase,
      );
      files.push(...folderFiles);
    }
  }

  return files;
}

export default function SearchBar() {
  const { supabase } = useSupabase();

  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FileObject[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const fetchSearchResults = async () => {
    if (debouncedSearchTerm) {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const files = await searchFiles(
        '',
        user?.id!,
        debouncedSearchTerm,
        supabase,
      );

      if (files.length < 0) {
        return setSearchResults([]);
      }

      setSearchResults(files);
      setIsLoading(false);
      return;
    }

    setSearchResults([]);
  };

  useEffect(() => {
    fetchSearchResults();
  }, [debouncedSearchTerm]);

  return (
    <div
      className={`flex w-full md:w-2/3 bg-[#F2F5F6] rounded-lg ${
        isFocused ? 'ring-2 ring-[#7070FE]' : ''
      } items-center`}
    >
      <span className="mx-3 sm:mx-6 rounded-full my-auto p-2 h-10 w-10">
        <FontAwesomeIcon icon={faSearch} className="text-[#16171B]/70" />
      </span>
      <input
        type="text"
        className="py-6 h-10 bg-[#F2F5F6] outline-none w-full rounded-r-full"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search in My files"
      />
      {isFocused && debouncedSearchTerm && (
        <Overlay
          isLoading={isLoading}
          searchResults={searchResults}
          searchTerm={debouncedSearchTerm}
        />
      )}
    </div>
  );
}

function Overlay({
  searchResults,
  searchTerm,
  isLoading,
}: {
  searchResults: FileObject[];
  searchTerm: string;
  isLoading: boolean;
}) {
  return (
    <>
      <div className="fixed top-0 left-0 flex w-screen h-screen bg-gray-800 opacity-5"></div>
      <div className="fixed top-24 left-0 md:left-72 md:w-[calc(100vw-16rem)] w-full h-screen">
        <div
          className="rounded-xl w-96 md:w-2/3 z-[9000000] max-h-96 overflow-y-scroll m-auto md:m-0 bg-white shadow-2xl transform transition-transform text-[#292A2C]/90"
          style={{ opacity: 1 }}
        >
          {isLoading ? (
            <div className="px-6 py-4">
              <p className="pb-4 border-gray-300 border-b-2 text-sm text-gray-500">
                Searching for "{searchTerm}"
              </p>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse w-full h-fit border-b-2 border-gray-300 last:border-0 p-4"
                >
                  <div className="mb-2">
                    <div className="bg-gray-300 h-5"></div>
                  </div>
                  <div className="my-2">
                    <div className="bg-gray-300 h-5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="px-6 py-4">
              <p className="pb-4 border-gray-300 border-b-2 text-sm text-gray-500">
                Showing {searchResults.length} results for "{searchTerm}"
              </p>
              <div className="mt-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="w-full h-fit border-b-2 border-gray-300 last:border-0"
                  >
                    <p className="text-gray-800 font-medium mt-2 mb-1">
                      {result.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {result.metadata.path}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-fit border-b-2 border-gray-300 last:border-0 p-4">
              <div className="mb-2">
                <div className="h-5 text-xl">No result found</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
