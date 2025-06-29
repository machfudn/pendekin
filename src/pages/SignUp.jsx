import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { IconGoogle, IconEyeShow, IconEyeNotShow } from '@/components/Icons';

function SignUp() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [message, setMessage] = useState('');
  const register = async e => {
    e.preventDefault();
    let isValid = true;
    setMessage('');

    // Validasi email
    if (!email.trim()) {
      setErrorEmail('Email belum diisi');
      setIsEmailValid(false);
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorEmail('Format email tidak valid');
      setIsEmailValid(false);
      isValid = false;
    } else {
      setErrorEmail('');
      setIsEmailValid(true);
    }

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
    // Jika ada error, hentikan proses
    if (!isValid) return;

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('password should be at least 6 characters')) {
        setMessage('Password minimal 6 karakter');
      } else {
        setMessage('Email sudah terdaftar. Silakan login atau gunakan email lain.');
      }
    } else {
      toast.success('Pendaftaran berhasil! Silakan cek email untuk konfirmasi.');
    }

    setIsLoading(false);
  };
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) {
      setMessage(error.error);
    }
  };
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800'>
      <div className='p-8 mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg w-full max-w-md mt-10'>
        <header className='text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white'>Sign Up</header>
        <form className='space-y-4' onSubmit={register}>
          {message && (
            <div className='p-3 text-sm text-red-700 bg-red-100 rounded-md' role='alert'>
              {message}
            </div>
          )}

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1 dark:text-white'>
              Email:
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-white ${
                errorEmail
                  ? 'border-red-500 focus:ring-red-300'
                  : isEmailValid
                  ? 'border-green-500 focus:ring-green-300'
                  : 'border-gray-300 focus:ring-blue-300'
              }`}
              name='email'
              id='email'
              type='email'
              placeholder='email'
              value={email}
              onChange={e => {
                const value = e.target.value;
                setEmail(value);

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                setIsEmailValid(emailRegex.test(value));

                if (errorEmail) setErrorEmail('');
              }}
              autoComplete='email'
            />
            {errorEmail && <div className='text-red-500 text-sm mt-1'>{errorEmail}</div>}
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1 dark:text-white'>
              Password:
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
              Konfirmasi Password:
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

          <div className='flex flex-col gap-3 mt-4'>
            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isLoading}>
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <svg className='animate-spin h-5 w-5 mr-3 text-white' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Register...
                </div>
              ) : (
                'Register'
              )}
            </button>

            <div className='text-center flex gap-1 justify-center text-sm text-gray-600 dark:text-gray-400'>
              Sudah punya akun?
              <Link className='text-blue-600 hover:underline' to='/signin'>
                Sign In
              </Link>
            </div>
          </div>
          <div className='relative flex py-2 items-center'>
            <div className='flex-grow border-t border-gray-300'></div>
            <span className='flex-shrink mx-4 text-gray-500 dark:text-white'>Atau</span>
            <div className='flex-grow border-t border-gray-300'></div>
          </div>

          <button
            type='button'
            className='w-full flex gap-2 items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-black hover:text-white focus:bg-black focus:text-white focus:ring-black dark:border-black '
            onClick={signInWithGoogle}>
            <IconGoogle />
            Sign Up dengan Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
