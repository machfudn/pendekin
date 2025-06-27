import { useState } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';

export default function CreateUrl() {
  const toast = useToast();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [errorOriginalUrl, setErrorOriginalUrl] = useState('');
  const [errorCustomCode, setErrorCustomCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorOriginalUrl('');
    setErrorCustomCode('');
    setMessage('');

    let isValid = true;

    // Validasi URL
    if (!originalUrl) {
      setErrorOriginalUrl('Url tujuan tidak boleh kosong');
      isValid = false;
    } else if (!/^https?:\/\//i.test(originalUrl)) {
      setErrorOriginalUrl('URL harus diawali dengan http:// atau https://');
      isValid = false;
    } else {
      try {
        new URL(originalUrl);
      } catch {
        setErrorOriginalUrl('Format URL tidak valid');
        isValid = false;
      }
    }

    // Validasi custom url
    if (!customCode) {
      setErrorCustomCode('Custom url tidak boleh kosong');
      isValid = false;
    } else if (customCode.length < 3) {
      setErrorCustomCode('Custom url pendek minimal 3 karakter');
      isValid = false;
    } else if (!/^[a-z0-9-]+$/i.test(customCode)) {
      setErrorCustomCode('Hanya boleh mengandung huruf, angka, dan tanda hubung (-)');
      isValid = false;
    }

    if (!isValid) {
      setIsSubmitting(false);
      return; // Hentikan submit jika tidak valid
    }

    try {
      // Cek ketersediaan custom url
      const { data: existing, error: checkError } = await supabase.from('urls').select('id').ilike('short_code', customCode).maybeSingle();

      if (checkError) {
        setMessage('Gagal memverifikasi kode');
        setIsSubmitting(false);
        return;
      }

      if (existing) {
        setMessage('Short URL sudah digunakan');
        setIsSubmitting(false);
        return;
      }

      // Dapatkan user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage('Anda harus login');
        setIsSubmitting(false);
        return;
      }

      // Insert ke database
      const { error: insertError } = await supabase.from('urls').insert([
        {
          original_url: originalUrl,
          short_code: customCode,
          user_id: user.id,
        },
      ]);

      if (insertError) {
        setMessage('Gagal membuat short URL: ' + insertError.message);
        setIsSubmitting(false);
        return;
      }

      // Tampilkan hasil
      const generatedUrl = `${window.location.origin}/${customCode}`;
      setShortUrl(generatedUrl);

      toast.success(
        <div>
          <p>URL berhasil dibuat!</p>
          <a href={generatedUrl} target='_blank' rel='noopener noreferrer'>
            {generatedUrl}
          </a>
        </div>,
        { duration: 10000 },
      );

      // Reset form
      setOriginalUrl('');
      setCustomCode('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalin = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('URL berhasil disalin!');
    } catch (err) {
      setMessage('Gagal menyalin URL: ' + err.message);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900'>
      <Navbar />
      <div className='max-w-xl mt-10 mx-auto px-4'>
        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white'>Create Short URL</h2>

          <form onSubmit={handleSubmit}>
            {message && (
              <div className='p-3 text-sm text-red-700 bg-red-100 rounded-md mb-4' role='alert'>
                {message}
              </div>
            )}

            {/* URL Tujuan */}
            <div className='mb-4'>
              <label htmlFor='target_url' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                URL Tujuan:
              </label>
              <input
                id='target_url'
                type='text'
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errorOriginalUrl ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-300'
                }`}
                placeholder='https://example.com/...'
                value={originalUrl}
                onChange={e => {
                  setOriginalUrl(e.target.value.trim());
                  if (errorOriginalUrl) setErrorOriginalUrl('');
                }}
                disabled={isSubmitting}
              />
              {errorOriginalUrl && <div className='text-red-500 text-sm mt-1'>{errorOriginalUrl}</div>}
            </div>

            {/* Custom Code */}
            <div className='mb-4'>
              <label htmlFor='custom_code' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Custom Url (min 3 karakter):
              </label>
              <input
                id='custom_code'
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errorCustomCode ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-300'
                }`}
                placeholder='contoh-url'
                value={customCode}
                onChange={e => {
                  setCustomCode(e.target.value.trim());
                  if (errorCustomCode) setErrorCustomCode('');
                }}
                disabled={isSubmitting}
                title='Hanya huruf, angka, dan tanda hubung (-) yang diperbolehkan'
              />
              {errorCustomCode && <div className='text-red-500 text-sm mt-1'>{errorCustomCode}</div>}
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-60 flex justify-center items-center'>
              {isSubmitting ? (
                <>
                  <svg className='animate-spin h-5 w-5 mr-3 text-white' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Membuat...
                </>
              ) : (
                'Buat'
              )}
            </button>
          </form>

          {/* Hasil Short URL */}
          {shortUrl && (
            <div className='mt-6 border-t pt-4'>
              <h3 className='text-lg font-medium mb-2 text-gray-800 dark:text-white'>Hasil Short URL</h3>
              <div className='flex gap-2'>
                <input
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  type='text'
                  value={shortUrl}
                  disabled
                />
                <button onClick={handleSalin} className='px-4 py-2 outline text-black rounded cursor-pointer'>
                  <svg className='text-black w-4 h-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'>
                    <path d='M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z' />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
