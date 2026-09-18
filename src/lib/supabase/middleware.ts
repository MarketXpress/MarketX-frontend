import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

/**
 * Routes that require a signed-in user.
 *
 * Listing what is *protected* rather than what is public is the wrong way
 * round for anything holding real data — a route added later is public by
 * default, which is how a dashboard ends up readable by anyone. It is the
 * right way round here because this app is a storefront: the catalogue, the
 * product pages and search are meant to be open, and only the account area is
 * not. Anything under these prefixes is covered, so a new dashboard tab is
 * protected the moment it exists.
 */
const PROTECTED_PREFIXES = ['/dashboard', '/profile'];

/** Routes a signed-in user has no reason to see. */
const AUTH_ONLY_PREFIXES = ['/auth/login', '/auth/register'];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Refreshes the Supabase session on every request, and gates the account area.
 *
 * Two jobs, deliberately together: the session has to be revalidated before
 * anything can decide whether the caller is signed in, and doing that in one
 * pass avoids a second round trip to Supabase per request.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // `getUser` revalidates the token against Supabase, unlike `getSession`
  // which trusts whatever the cookie says. On a path that decides access,
  // trusting the cookie is how a forged one gets through.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && matches(pathname, PROTECTED_PREFIXES)) {
    const login = request.nextUrl.clone();
    login.pathname = '/auth/login';
    login.search = '';
    // Preserved so the user lands where they were going rather than on a
    // generic dashboard, which is the difference between a redirect that
    // helps and one that loses their place.
    login.searchParams.set('returnUrl', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (user && matches(pathname, AUTH_ONLY_PREFIXES)) {
    const home = request.nextUrl.clone();
    home.pathname = '/dashboard/orders';
    home.search = '';
    return NextResponse.redirect(home);
  }

  return response;
}
