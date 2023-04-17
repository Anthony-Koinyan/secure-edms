import '@/styles/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
  subsets: ['latin'],
});

import SupabaseProvider from '@/lib/supabase-provider';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={
          albertSans.className
        } /* className="sm:flex font-albert-sans font-text font-medium antialiased text-lg bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base" */
      >
        <main>
          <SupabaseProvider>{children}</SupabaseProvider>
        </main>
      </body>
    </html>
  );
}
