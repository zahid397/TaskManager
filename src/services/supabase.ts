import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

/**
 * Why `react-native-url-polyfill/auto` (imported above, as a side effect,
 * before `createClient` runs): React Native's JS engine does not ship a
 * spec-complete `URL` implementation. supabase-js constructs request URLs
 * internally, and without this polyfill you get cryptic runtime errors like
 * "URL.protocol is not implemented" the first time you call `.from(...)`.
 * This single import patches `global.URL` before Supabase touches it.
 *
 * We do NOT enable Supabase Auth session persistence here (`auth: { persistSession: false }`)
 * because this assessment explicitly puts authentication out of scope — there
 * is no logged-in user, so there's nothing to persist. If auth is added later,
 * swap in AsyncStorage as the `storage` adapter for the auth config.
 */

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly and early rather than letting every API call throw a vague
  // network error later. Copy .env.example to .env and fill in real values.
  console.warn(
    '[supabase] SUPABASE_URL / SUPABASE_ANON_KEY are not set. ' +
      'Copy .env.example to .env and add your project credentials.',
  );
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
