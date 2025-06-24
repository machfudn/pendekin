import { useState } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';

export default function CreateUrl() {
  const toast = useToast();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validasi URL
      if (!/^https?:\/\//i.test(originalUrl)) {
        throw new Error('URL harus diawali dengan http:// atau https://');
      }

      try {
        new URL(originalUrl); // Validasi format URL
      } catch {
        throw new Error('Format URL tidak valid');
      }

      // Validasi custom url
      if (!customCode || customCode.length < 3) {
        throw new Error('custom url pendek minimal 3 karakter');
      }

      if (!/^[a-z0-9-]+$/i.test(customCode)) {
        throw new Error('Hanya boleh mengandung huruf, angka, dan tanda hubung (-)');
      }

      // Cek ketersediaan custom url (case insensitive)
      const { data: existing, error: checkError } = await supabase
        .from('urls')
        .select('id')
        .ilike('short_code', customCode) // ilike untuk case insensitive
        .maybeSingle();

      if (checkError) throw new Error('Gagal memverifikasi kode');
      if (existing) throw new Error('Short URL sudah digunakan');

      // Dapatkan user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Anda harus login');

      // Insert ke database
      const { error: insertError } = await supabase.from('urls').insert([
        {
          original_url: originalUrl,
          short_code: customCode.toLowerCase(), // Simpan dalam lowercase
          user_id: user.id,
        },
      ]);

      if (insertError) throw insertError;

      // Tampilkan hasil
      const generatedUrl = `${window.location.origin}/${customCode.toLowerCase()}`;
      setShortUrl(generatedUrl);

      toast.success(
        <div>
          <p>URL berhasil dibuat!</p>
          <a href={generatedUrl} target='_blank' rel='noopener noreferrer'>
            {generatedUrl}
          </a>
        </div>,
        { duration: 10000 }, // Toast lebih lama
      );

      // Reset form
      setOriginalUrl('');
      setCustomCode('');
    } catch (error) {
      toast.error(error.message, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSalin = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('URL berhasil disalin!'); // Munculkan toast sukses
    } catch (err) {
      console.error('Gagal menyalin teks: ', err);
      toast.error('Gagal menyalin URL. Silakan coba lagi.'); // Munculkan toast error
    }
  };

  return (
    <div>
      <Navbar />
      <div className='max-w-5xl mx-auto mt-10 px-4'>
        <div className='flex flex-col md:flex-row gap-6'>
          <div className='flex-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <h2 className='text-2xl font-semibold mb-6 text-center md:text-left text-gray-900 dark:text-white'>Create Short URL</h2>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label htmlFor='target_url' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  URL Tujuan:
                </label>
                <input
                  id='target_url'
                  type='url'
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='https://example.com/...'
                  value={originalUrl}
                  onChange={e => setOriginalUrl(e.target.value.trim())}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className='mb-4'>
                <label htmlFor='custom_code' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Custom Url (min 3 karakter):
                </label>
                <input
                  id='custom_code'
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='contoh-url'
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value.trim())}
                  required
                  disabled={isSubmitting}
                  title='Hanya huruf, angka, dan tanda hubung (-) yang diperbolehkan'
                />
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
                    Memproses...
                  </>
                ) : (
                  'Buat Short URL'
                )}
              </button>
            </form>
          </div>

          {/* Hasil - kanan */}
          {shortUrl && (
            <div className='flex-1 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md'>
              <h3 className='text-lg font-medium mb-4 text-gray-800 dark:text-white'>Hasil Short URL</h3>
              <p className='mb-2 text-gray-700 dark:text-gray-200'>
                <strong>Short URL:</strong>
              </p>
              <div className='flex gap-2'>
                <input
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  type='text'
                  value={shortUrl}
                  disabled
                />
                <button onClick={handleSalin} className='px-4 py-2 outline text-black rounded cursor-pointer '>
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
