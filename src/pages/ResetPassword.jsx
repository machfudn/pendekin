import { useState } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import { useToast } from '@/context/ToastContext';
import { Link } from 'react-router-dom';
import { IconEyeShow, IconEyeNotShow } from '@/components/Icons';

export default function ResetPassword() {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submitUpdate = async e => {
    e.preventDefault();
    let isValid = true;
    setMessage('');

    // Validasi password
    if (!password.trim()) {
      setErrorPassword('Password belum diisi');
      setIsPasswordValid(false);
      isValid = false;
    } else if (password.length < 6) {
      setErrorPassword('Password minimal 6 karakter');
      setIsPasswordValid(false);
      isValid = false;
    } else {
      setErrorPassword('');
      setIsPasswordValid(true);
    }

    // Validasi Konfirmasi Password
    if (!confirmPassword.trim()) {
      setErrorConfirmPassword('Konfirmasi password belum diisi');
      setIsConfirmPasswordValid(false);
      isValid = false;
    } else if (confirmPassword !== password) {
      setErrorConfirmPassword('Password tidak cocok');
      setIsConfirmPasswordValid(false);
      isValid = false;
    } else {
      setErrorConfirmPassword('');
      setIsConfirmPasswordValid(true);
    }
    if (!isValid) return;

    setErrorPassword('');
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message.toLowerCase().includes('auth session missing')) {
          setMessage('Sesi login tidak ditemukan. Silakan login ulang.');
        } else {
          setMessage('Gagal mengubah password: ' + error.message);
        }
      } else {
        toast.success('Password berhasil diubah. Silakan login kembali.');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
      await supabase.auth.signOut();
    }
  };
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4'>
      <div className='bg-white dark:bg-gray-800 p-8 rounded shadow max-w-md w-full'>
        <h2 className='text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white'>Ubah Password</h2>

        {message && <div className='mb-4 text-sm text-center text-red-500 dark:text-red-400'>{message}</div>}

        <form onSubmit={submitUpdate} className='space-y-4'>
          <div>
            <label htmlFor='password' className='block mb-1 text-sm text-gray-700 dark:text-white'>
              Password Baru:
            </label>
            <div className='relative'>
              <input
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-white ${
                  errorPassword
                    ? 'border-red-500 focus:ring-red-300'
                    : isPasswordValid
                    ? 'border-green-500 focus:ring-green-300'
                    : 'border-gray-300 focus:ring-blue-300'
                }`}
                name='password'
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='password'
                value={password}
                onChange={e => {
                  const value = e.target.value;
                  setPassword(value);

                  setIsPasswordValid(value.length >= 6);

                  if (errorPassword) setErrorPassword('');
                }}
                autoComplete='current-password'
              />
              <button
                type='button'
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-white cursor-pointer'
                onClick={() => setShowPassword(prev => !prev)}>
                {showPassword ? <IconEyeNotShow /> : <IconEyeShow />}
              </button>
            </div>
            {errorPassword && <div className='text-red-500 text-sm mt-1'>{errorPassword}</div>}
          </div>
          <div className='mt-4'>
            <label htmlFor='confirm-password' className='block text-sm font-medium text-gray-700 mb-1 dark:text-white'>
              Konfirmasi Password Baru:
            </label>
            <div className='relative'>
              <input
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-white ${
                  errorConfirmPassword
                    ? 'border-red-500 focus:ring-red-300'
                    : isConfirmPasswordValid
                    ? 'border-green-500 focus:ring-green-300'
                    : 'border-gray-300 focus:ring-blue-300'
                }`}
                name='confirm-password'
                id='confirm-password'
                type={showConfirmPassword ? 'text' : 'password'} // untuk confirm
                placeholder='ulangi password'
                value={confirmPassword}
                onChange={e => {
                  const value = e.target.value;
                  setConfirmPassword(value);

                  // validasi cocok
                  setIsConfirmPasswordValid(value === password);

                  if (errorConfirmPassword) setErrorConfirmPassword('');
                }}
                autoComplete='new-password'
              />
              <button
                type='button'
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-white cursor-pointer'
                onClick={() => setShowConfirmPassword(prev => !prev)}>
                {showConfirmPassword ? <IconEyeNotShow /> : <IconEyeShow />}
              </button>
            </div>
            {errorConfirmPassword && <div className='text-red-500 text-sm mt-1'>{errorConfirmPassword}</div>}
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50'>
            {loading ? 'Mengubah...' : 'Ubah Password'}
          </button>

          <Link
            to='/signin'
            className='w-full flex gap-2 items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-black hover:text-white focus:bg-black focus:text-white focus:ring-black dark:border-black'>
            Kembali ke Login
          </Link>
        </form>
      </div>
    </div>
  );
}
