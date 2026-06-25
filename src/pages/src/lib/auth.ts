import { supabase } from './supabase';

let cachedAccessToken: string | null = null;
let cachedUser: any | null = null;

export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.provider_token) {
      cachedAccessToken = session.provider_token;
      cachedUser = session.user;
      if (onAuthSuccess) onAuthSuccess(session.user, session.provider_token);
    } else {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session && session.provider_token) {
      cachedAccessToken = session.provider_token;
      cachedUser = session.user;
      if (onAuthSuccess) onAuthSuccess(session.user, session.provider_token);
    } else {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string, url?: string } | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
        redirectTo: window.location.href, // Redirects back to the current page
        skipBrowserRedirect: true, // MUST be true for iframe
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
       console.error('Supabase Sign in error:', error);
       throw error;
    }
    
    if (data?.url) {
       return { user: null, accessToken: '', url: data.url };
    }
    
    return null;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await supabase.auth.signOut();
  cachedAccessToken = null;
  cachedUser = null;
};
