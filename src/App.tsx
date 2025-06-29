import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import AppRoutes from './components/AppRoutes';

export default function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  }, [setUser]);

  return (
    <>
      <AppRoutes />
      <Toaster richColors position="top-center" />
    </>
  );
}
