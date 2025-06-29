import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';

function SignInWithEmail() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [message, setMessage] = useState('');

  const SignInEmail = async e => {
    e.preventDefault();
    if (!email) {
      setErrorEmail('Silakan masukkan email terlebih dahulu.');
      return;
    }

    try {
      setIsLoadingEmail(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/home',
        },
      });

      if (error) {
        setMessage(error.message || 'Gagal mengirim magic link.');
      } else {
        toast.success('Magic link telah dikirim ke email Anda. Silakan periksa kotak masuk.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800'>
      <div className='p-8 mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg w-full max-w-md mt-10'>
        <header className='text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white'>Sign In Email</header>
        <form className='space-y-4' onSubmit={SignInEmail}>
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

          <div className='flex flex-col gap-3 mt-4'>
            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isLoadingEmail}>
              {isLoadingEmail ? (
                <div className='flex items-center justify-center'>
                  <svg className='animate-spin h-5 w-5 mr-3 text-white' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Mengirim Email...
                </div>
              ) : (
                'Kirim'
              )}
            </button>
            <Link
              to='/signin'
              className='w-full flex gap-2 items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-black hover:text-white focus:bg-black focus:text-white focus:ring-black dark:border-black'>
              Kembali
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInWithEmail;
