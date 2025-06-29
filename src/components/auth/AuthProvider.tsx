import React, { useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: any;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);

    // Only redirect if user is on a protected route
    const protectedPaths = ['/dashboard'];
    if (!session && protectedPaths.includes(window.location.pathname)) {
      navigate('/login');
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);

    const protectedPaths = ['/dashboard'];
    if (!session && protectedPaths.includes(window.location.pathname)) {
      navigate('/login');
    }
  });

  return () => subscription.unsubscribe();
}, [setUser, navigate]);

  const contextValue = {
    user,
    session: user ? { user } : null
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}