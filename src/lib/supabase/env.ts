/**
 * Supabase connection values.
 *
 * Both are `NEXT_PUBLIC_` and therefore ship in the browser bundle, which is
 * correct: the publishable key is designed to be public and row level security
 * is what protects the data. The service-role key is a different thing
 * entirely — it bypasses RLS and must never be read from this module or any
 * other code that reaches the client.
 */

/**
 * `NEXT_PUBLIC_` values are inlined into the bundle at build time, so these
 * have to be present wherever the build runs — not only on a developer's
 * machine. A missing one fails the build rather than the request, which is the
 * right moment to find out, provided the message says where to set it.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}.\n` +
        `  Local:  add it to .env.local (see .env.example)\n` +
        `  Vercel: Project Settings > Environment Variables, for Production, ` +
        `Preview and Development\n` +
        `  Both values are in the Supabase dashboard under Project Settings > API.`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_PUBLISHABLE_KEY = required(
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
