import { NotificationProvider } from '@/lib/Notifications';
import UserContext from '@/lib/user-context';
import Header from '@/ui//Header';
import Nav from '@/ui/Nav';

import Notifications from './Notifications';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserContext>
      <NotificationProvider>
        <div className="max-h-screen overflow-y-hidden">
          <Nav />
          {/*  @ts-expect-error */}
          <Header />
          <main className="md:ml-64 ml-0 mb-10 md:mb-0 md:w-[calc(100vw-16rem)] relative">
            <Notifications />
            {children}
          </main>
        </div>
      </NotificationProvider>
    </UserContext>
  );
}
