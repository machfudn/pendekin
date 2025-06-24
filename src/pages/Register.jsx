import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
function Register() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [message, setMessage] = useState('');
  const register = async e => {
    e.preventDefault();
    let isValid = true;
    setMessage('');

    // Validasi email
    if (!email.trim()) {
      setErrorEmail('Email belum diisi');
      isValid = false;
    } else {
      setErrorEmail('');
    }

    // Validasi password
    if (!password.trim()) {
      setErrorPassword('Password belum diisi');
      isValid = false;
    } else if (password.length < 6) {
      setErrorPassword('Password minimal 6 karakter');
      isValid = false;
    } else {
      setErrorPassword('');
    }
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
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='p-8 mx-auto bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-md mt-10'>
        <header className='text-3xl font-bold text-center mb-6 text-gray-800'>Register</header>
        <form className='space-y-4' onSubmit={register}>
          {message && (
            <div className='p-3 text-sm text-red-700 bg-red-100 rounded-md' role='alert'>
              {message}
            </div>
          )}

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email:
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errorEmail ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
              name='email'
              id='email'
              type='email'
              placeholder='email'
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errorEmail) setErrorEmail('');
              }}
              autoComplete='email'
            />
            {errorEmail && <div className='text-red-500 text-sm mt-1'>{errorEmail}</div>}
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              Password:
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errorPassword ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
              name='password'
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='password'
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (errorPassword) setErrorPassword('');
              }}
              autoComplete='current-password'
            />
            {errorPassword && <div className='text-red-500 text-sm mt-1'>{errorPassword}</div>}
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                type='checkbox'
                id='showPasswordCheck'
                checked={showPassword}
                onChange={e => setShowPassword(e.target.checked)}
              />
              <label className='ml-2 block text-sm text-gray-900' htmlFor='showPasswordCheck'>
                Tampilkan Password
              </label>
            </div>
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

            <div className='text-center text-sm text-gray-600'>
              Sudah punya akun?
              <Link className='text-blue-600 hover:underline' to='/login'>
                Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
