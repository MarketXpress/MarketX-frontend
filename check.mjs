import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const { data, error } = await s.auth.signInWithPassword({
  email: 'techhub@demo.marketx.test', password: 'demo-password',
});
console.log(error ? `demo seller sign-in FAILED: ${error.message}` : `demo seller sign-in ok: ${data.user.email}`);
