import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_DEFAULT_KEY, SUPABASE_URL } from '@/lib/env';
import type { Database } from '@/lib/database.types';

const supabaseUrl = SUPABASE_URL as string;
const supabasePublishableKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY as string;

if (!supabaseUrl || !supabasePublishableKey)
    console.error('Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey);

export function clearSupabaseStorage() {
    for (const k of Object.keys(localStorage)) {
        if (k.startsWith('sb-')) localStorage.removeItem(k);
    }
}
