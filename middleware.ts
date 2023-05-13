import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { Database } from './lib/schema';
import type { NextRequest } from 'next/server';

export const revalidate = 0;

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname, origin } = req.nextUrl;

  if (pathname === '/login') {
    return res;
  }

  const supabase = createMiddlewareSupabaseClient<Database>({ req, res });

  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
