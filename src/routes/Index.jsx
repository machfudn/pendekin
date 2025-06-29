// src/routes/Index.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import SignIn from '@/pages/SignIn';
import SignInWithEmail from '@/pages/SignInWithEmail';
import LupaPassword from '@/pages/LupaPassword';
import ResetPassword from '@/pages/ResetPassword';
import SignUp from '@/pages/SignUp';
import DataUrl from '@/pages/DataUrl';
import Home from '@/pages/Home';
import About from '@/pages/About';
import ProtectedRoute from './ProtectedRoute';
import { supabase } from '@/helpers/supabaseClient';
import RedirectPage from '@/pages/RedirectPage';
import { useToast } from '@/context/ToastContext';

function Index() {
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAndInsertUser = async () => {
      if (!user) return;

      const { data: existingUser, error: fetchError } = await supabase.from('users').select('role').eq('id', user.id).single();

      // Perbaikan: insert jika tidak ada user atau jika error karena tidak ditemukan
      if (!existingUser || fetchError?.code === 'PGRST116') {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: user.id,
            email: user.email,
            role: 'user',
          },
        ]);

        if (insertError) {
          toast.error('Gagal insert user:', insertError.message);
        }
      }

      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();

      if (userData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    };

    const isFromLogin = location.pathname === '/signin';

    if (user && isFromLogin) checkAndInsertUser();
  }, [user, navigate, location.pathname]);
  return (
    <>
      <Routes>
        <Route path='/' element={<Navigate to='/home' replace />} />
        <Route path='/signin' element={!user ? <SignIn /> : <Navigate to='/home' />} />

        <Route path='/signup' element={<SignUp />} />
        <Route path='/signin-email' element={<SignInWithEmail />} />
        <Route path='/lupa-password' element={<LupaPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route
          path='/home'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path='/data-url'
          element={
            <ProtectedRoute>
              <DataUrl />
            </ProtectedRoute>
          }
        />
        <Route
          path='/about'
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        <Route path='/:code' element={<RedirectPage />} />
      </Routes>
    </>
  );
}

export default Index;
