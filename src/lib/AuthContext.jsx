import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false); // Mocked for old UI compatibility
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setIsLoadingAuth(false);
      } catch (err) {
        console.error('Session check failed:', err);
        setAuthError({ type: 'unknown', message: err.message });
        setIsLoadingAuth(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Re-trigger auth flow
  };

  const navigateToLogin = () => {
    // In Supabase, you can trigger your own login UI or redirect to a login route
    // For now, if we are in this state, we might want to redirect the user
    console.log('Redirecting to login...');
    // If you have a login page, navigate to it:
    // window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings, // Expected by old UI
      authError, // Expected by old UI
      logout,
      navigateToLogin // Expected by old UI
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
