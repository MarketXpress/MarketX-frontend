import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

/**
 * Refreshes the Supabase session on every request and writes the rotated
 * tokens back as cookies.
 *
 * Without this, an expired access token is never renewed server-side: server
 * components would see a signed-out user while the browser still believed it
 * was signed in, and the UI would flicker between the two.
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
  // which trusts whatever the cookie says. On a middleware path that decides
  // access, trusting the cookie is how a forged one gets through.
  await supabase.auth.getUser();

  return response;
}
