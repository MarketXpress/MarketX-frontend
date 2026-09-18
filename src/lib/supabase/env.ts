/**
 * Supabase connection values.
 *
 * Both are `NEXT_PUBLIC_` and therefore ship in the browser bundle, which is
 * correct: the publishable key is designed to be public and row level security
 * is what protects the data. The service-role key is a different thing
 * entirely — it bypasses RLS and must never be read from this module or any
 * other code that reaches the client.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy it from the Supabase dashboard into .env.local.`,
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
