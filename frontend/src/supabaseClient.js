import { createClient } from '@supabase/supabase-js';

export function cleanSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
}

// Retrieve Supabase configuration from environment variables or local storage
export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('road_guardian_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('road_guardian_supabase_key') || '' : '';

  const url = cleanSupabaseUrl(envUrl || localUrl);
  const key = (envKey || localKey).trim();

  const isConfigured = Boolean(
    url && 
    key && 
    !url.includes('your-project-id') &&
    url.startsWith('http')
  );

  return { url, key, isConfigured };
}

// Initialize Supabase client
export function initSupabase() {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

export let supabase = initSupabase();

export function saveSupabaseConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('road_guardian_supabase_url', url.trim());
    localStorage.setItem('road_guardian_supabase_key', key.trim());
    supabase = initSupabase();
  }
}

export const isSupabaseConfigured = () => getSupabaseConfig().isConfigured;

// Default Admin configuration from environment or secure defaults
const DEFAULT_ALLOWED_EMAILS = ['admin@roadguardian.gov', 'chief.engineer@roadguardian.gov', 'director@pwd.gov'];
const rawAllowedEmails = import.meta.env.VITE_ADMIN_ALLOWED_EMAILS || '';
export const ALLOWED_ADMIN_EMAILS = rawAllowedEmails 
  ? rawAllowedEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  : DEFAULT_ALLOWED_EMAILS;

export const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'Admin@RoadGuardian2026';

/**
 * Public Portal: Initiate ACTUAL Google OAuth sign-in via Supabase
 */
export async function signInWithGoogle() {
  const client = supabase || initSupabase();
  if (!client) {
    throw new Error('Supabase project is not configured yet. Please enter your Supabase Project URL and Anon Key to activate real Google Authentication.');
  }

  // Real Supabase Google OAuth redirect to accounts.google.com
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    throw error;
  }

  return { data, error: null };
}

/**
 * Public Portal: Retrieve & verify current Supabase session
 */
export async function getVerifiedPublicSession() {
  const client = supabase || initSupabase();
  if (!client) return null;

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session) return null;

    const user = session.user;
    if (!user) return null;

    // Confirm that user authenticated via Google
    const isGoogleUser = user.app_metadata?.provider === 'google' || 
                         user.identities?.some(id => id.provider === 'google');
    
    // In Google OAuth, Google confirms and verifies the email automatically
    const isEmailVerified = Boolean(user.email_confirmed_at) || isGoogleUser;

    if (!isEmailVerified) {
      return { user, verified: false, error: 'Google account is not verified yet.' };
    }

    const formattedUser = {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Citizen',
      email: user.email,
      role: 'public',
      verified: true,
      provider: 'google',
      profile_picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    };

    return { user: formattedUser, verified: true, session };
  } catch (err) {
    console.error('[Supabase Session Error]:', err);
    return null;
  }
}

/**
 * Hardcoded Authorized Authority Admin Credentials
 */
const VALID_ADMIN_EMAILS = [
  'admin@roadguardian.gov',
  'admin',
  'admin@pwd.gov'
];

const VALID_ADMIN_PASSWORDS = [
  'admin123',
  'Admin@RoadGuardian2026',
  'admin2026',
  'admin'
];

/**
 * Admin Portal: Restricted Authority verification
 * Strictly enforces hardcoded credentials.
 */
export function validateAdminCredentials(email, passcode) {
  if (!email || !passcode) {
    return { success: false, error: 'Please enter your administrator email and password.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPasscode = passcode.trim();

  const isEmailValid = VALID_ADMIN_EMAILS.includes(cleanEmail);
  const isPasswordValid = VALID_ADMIN_PASSWORDS.includes(cleanPasscode);

  if (!isEmailValid || !isPasswordValid) {
    return {
      success: false,
      error: 'Invalid administrator credentials. Access denied.'
    };
  }

  const finalEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@roadguardian.gov`;

  const adminUser = {
    id: 'admin-01',
    name: 'Chief Authority Administrator',
    email: finalEmail,
    role: 'admin',
    department: 'Municipal Road Infrastructure',
    badge_number: 'RG-ADMIN-MUNI',
    verified: true,
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  };

  localStorage.setItem('road_guardian_auth_session', JSON.stringify({
    user: adminUser,
    role: 'admin',
    authTime: Date.now()
  }));

  return { success: true, user: adminUser };
}

/**
 * Universal Sign Out
 */
export async function signOutAuth() {
  const client = supabase || initSupabase();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.error('[Supabase SignOut Error]:', err);
    }
  }
  localStorage.removeItem('road_guardian_auth_session');
  localStorage.removeItem('road_guardian_token');
  sessionStorage.removeItem('road_guardian_selected_portal');
  sessionStorage.removeItem('road_guardian_role');
}
