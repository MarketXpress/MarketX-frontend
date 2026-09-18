'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

/**
 * Supabase client for browser code.
 *
 * `createBrowserClient` stores the session in cookies rather than
 * localStorage, which is what lets the server read it too — server components
 * and middleware see the same session the browser has, so a signed-in user is
 * not anonymous for the first render.
 *
 * Memoized: each call to `createBrowserClient` opens its own auth listener and
 * token-refresh timer, so calling it per component would leave a trail of them
 * refreshing the same session.
 */
// Built through a non-generic wrapper so `ReturnType` resolves to a concrete
// client. Referencing `typeof createBrowserClient` directly leaves its generic
// unresolved, and every callback typed from it degrades to `any`.
function makeBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

let browserClient: ReturnType<typeof makeBrowserClient> | undefined;

export function createClient() {
  browserClient ??= makeBrowserClient();
  return browserClient;
}
