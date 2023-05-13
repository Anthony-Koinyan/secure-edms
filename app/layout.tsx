import '@/styles/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { Albert_Sans } from 'next/font/google';

import SupabaseProvider from '@/lib/supabase-provider';

const albertSans = Albert_Sans({
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${albertSans.className} font-albert-sans font-text font-medium antialiased text-lg bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base`}
      >
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
