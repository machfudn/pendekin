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
    const checkAuthUser = async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        const authUser = sessionData?.session?.user;

        if (!authUser || error) {
          toast.error('User tidak ditemukan atau tidak login.');
          return;
        }

        // Jika user login, arahkan ke home
        navigate('/home');
      } catch (err) {
        toast.error('Error saat mengecek auth user:', err);
        toast.error('Gagal memverifikasi user.');
      }
    };

    const isFromLogin = location.pathname === '/signin';

    if (user && isFromLogin) {
      checkAuthUser();
    }
  }, [user, navigate, location.pathname, toast]);
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
