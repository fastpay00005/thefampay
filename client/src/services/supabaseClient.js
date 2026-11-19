import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gphlejllfvcsrgdfelma.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGxlamxsZnZjc3JnZGZlbG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NDEyNzUsImV4cCI6MjExMDIxNzI3NX0.1amaToscW3HQB2xBa_7Eeb5wsBqu_CeocpWrZeLwurw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Trigger Google OAuth flow via Supabase
 * @param {string} referralCode - optional referral code to preserve across redirect
 */
export async function signInWithGoogle(referralCode = '') {
  if (referralCode) {
    try {
      localStorage.setItem('fampay_pending_ref', referralCode.trim());
    } catch (e) {
      console.warn('Could not store pending ref in localStorage', e);
    }
  }

  const redirectUrl = `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}
