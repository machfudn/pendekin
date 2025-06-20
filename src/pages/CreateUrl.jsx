import { useState } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function CreateUrl() {
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
      if (existing) throw new Error('custom url sudah digunakan');

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

  return (
    <div className='container mt-5'>
      <Navbar />
      <div className='card mx-auto px-4 py-3' style={{ maxWidth: '600px' }}>
        <h2 className='text-center mb-4'>Create Short URL</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor='target_url' className='form-label'>
              URL Tujuan:
            </label>
            <input
              id='target_url'
              type='url'
              className='form-control'
              placeholder='https://example.com/...'
              value={originalUrl}
              onChange={e => setOriginalUrl(e.target.value.trim())}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='custom_code' className='form-label'>
              Custom Url (min 3 karakter):
            </label>
            <input
              id='custom_code'
              className='form-control'
              placeholder='contoh-url'
              value={customCode}
              onChange={e => setCustomCode(e.target.value.trim())}
              required
              disabled={isSubmitting}
              pattern='[a-zA-Z0-9-]+'
              title='Hanya huruf, angka, dan tanda hubung (-) yang diperbolehkan'
            />
          </div>

          <button className='btn btn-success w-100' type='submit' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                Memproses...
              </>
            ) : (
              'Buat Short URL'
            )}
          </button>
        </form>

        {shortUrl && (
          <div className='mt-4 p-3 bg-light rounded'>
            <p className='mb-2'>
              <strong>Short URL:</strong>
            </p>
            <div className='input-group mb-3'>
              <input className='form-control' type='text' value={shortUrl} disabled />
              <div class='input-group-prepend'>
                <button onClick={() => navigator.clipboard.writeText(shortUrl)} class='btn btn-outline-secondary'>
                  Salin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
