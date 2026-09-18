import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

/**
 * Supabase client for server components, route handlers and server actions.
 *
 * Reads the session from the request cookies, so RLS policies evaluate against
 * the signed-in user rather than the anonymous role.
 *
 * Not memoized, unlike the browser client: each request carries its own
 * cookies, and sharing one instance across requests would serve one user's
 * session to another.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies. That is expected and safe to
          // ignore here: the middleware refreshes the session on every request,
          // so a token rotated during a render is persisted there instead.
        }
      },
    },
  });
}
