// src/routes/Index.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import DataUrl from '@/pages/DataUrl';
import CreateUrl from '@/pages/CreateUrl';
import Home from '@/pages/Home';
import About from '@/pages/About';
import ProtectedRoute from './ProtectedRoute';
import { supabase } from '@/helpers/supabaseClient';
import RedirectPage from '@/pages/RedirectPage';
function Index() {
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
          console.error('Gagal insert user:', insertError.message);
        }
      }

      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();

      if (userData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    };

    const isFromLogin = location.pathname === '/login';

    if (user && isFromLogin) checkAndInsertUser();
  }, [user, navigate, location.pathname]);
  return (
    <>
      <Routes>
        <Route path='/login' element={!user ? <Login /> : <Navigate to='/' />} />

        <Route path='/register' element={<Register />} />
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create-url'
          element={
            <ProtectedRoute>
              <CreateUrl />
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
