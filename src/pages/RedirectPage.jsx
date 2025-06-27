import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import NotFound from '@/pages/NotFound';
import { Spinner, Alert } from 'react-bootstrap';

function RedirectPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectToUrl = async () => {
      try {
        setLoading(true);

        // Validasi kode URL
        if (!code || code.length < 3) {
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
      <div className='container mt-5'>
        <Alert variant='danger' className='text-center'>
          <Alert.Heading>Gagal Mengalihkan</Alert.Heading>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className='btn btn-primary'>
            Kembali
          </button>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center vh-100'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Mengalihkan...</span>
        </Spinner>
        <span className='ms-3'>Memproses URL...</span>
      </div>
    );
  }

  return (
    <div className='d-flex justify-content-center align-items-center vh-100'>
      <Spinner animation='border' role='status'>
        <span className='visually-hidden'>Mengalihkan...</span>
      </Spinner>
      <span className='ms-3'>Mengalihkan...</span>
    </div>
  );
}

export default RedirectPage;
