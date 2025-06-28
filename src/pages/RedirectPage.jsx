import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabaseClient';

function RedirectPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectToUrl = async () => {
      try {
        setLoading(true);

        const RESERVED_ROUTES = ['home', 'signin', 'signup', 'lupa-password', 'reset-password'];

        // Validasi kode URL
        if (!code || code.length < 3 || RESERVED_ROUTES.includes(code)) {
          throw new Error('Kode URL tidak valid');
        }

        // Query ke Supabase
        const { data, error: queryError } = await supabase.from('urls').select('original_url').eq('short_code', code).single();

        if (queryError) throw queryError;

        // Cek jika URL tidak ditemukan
        if (!data) {
          throw new Error('URL tidak ditemukan');
        }

        // Validasi URL sebelum redirect
        try {
          new URL(data.original_url);
          window.location.href = data.original_url;
        } catch {
          throw new Error('URL tujuan tidak valid');
        }
      } catch (error) {
        setError('URL tidak ditemukan. Periksa kembali URL yang telah dimasukkan.');
      } finally {
        setLoading(false);
      }
    };

    redirectToUrl();
  }, [code, navigate]);

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 text-center'>
        <div className='bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-6 rounded-lg shadow-md w-full max-w-md'>
          <h2 className='text-xl font-semibold mb-2'>Gagal Mengalihkan</h2>
          <p className='mb-4'>{error}</p>
          <button onClick={() => navigate('/home')} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition'>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white'>
        <div className='flex items-center space-x-3'>
          <svg className='animate-spin h-5 w-5 text-gray-600 dark:text-gray-300' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z' />
          </svg>
          <span>Memproses URL...</span>
        </div>
      </div>
    );
  }

  return null; // Tidak akan pernah sampai sini, karena redirect terjadi sebelumnya
}
export default RedirectPage;
