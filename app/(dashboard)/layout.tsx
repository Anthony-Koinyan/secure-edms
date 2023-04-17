import '@fortawesome/fontawesome-svg-core/styles.css';

import Header from '@/ui//Header';
import Sidebar from '@/ui/Sidebar';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <section className="sm:ml-64 ml-10 w-[calc(100vw-16rem)]">
        <Header />
        {children}
      </section>
    </>
  );
}
