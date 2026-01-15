// Vite environment variables
export const isDev = import.meta.env.DEV;

// Devtools like TanstackReactQuery
export const HIDE_DEVTOOLS = import.meta.env.VITE_HIDE_DEVTOOLS === 'true';

// Show test user logins on login page
export const SHOW_TEST_USER_LOGINS = import.meta.env.VITE_SHOW_TEST_USER_LOGINS === 'true';

// Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_DEFAULT_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
export const VERBOSE_LOGS_SUPABASE = import.meta.env.VITE_VERBOSE_LOGS_SUPABASE === 'true';
