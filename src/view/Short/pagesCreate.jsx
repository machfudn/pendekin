import { useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";

export default function ShortenForm() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^https?:\/\//.test(originalUrl)) {
      toast.error("URL harus diawali dengan http:// atau https://");
      return;
    }

    if (!customCode || customCode.length < 3) {
      toast.error("Kode pendek minimal 3 karakter");
      return;
    }

    // Cek apakah short_code sudah ada
    const { data: existing, error: checkError } = await supabase.from("urls").select("id").eq("short_code", customCode).maybeSingle();

    if (checkError) {
      toast.error("Terjadi kesalahan saat cek short code");
      return;
    }

    if (existing) {
      toast.error("URL custom sudah dipakai, coba yang lain!");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Gagal mendapatkan user");
      return;
    }

    const insertPromise = supabase.from("urls").insert([
      {
        original_url: originalUrl,
        short_code: customCode,
        user_id: user.id,
      },
    ]);

    const { error: insertError } = await toast.promise(insertPromise, {
      loading: "Memendekkan URL...",
      success: "URL berhasil dipendekkan!",
      error: "Gagal memendekkan URL",
    });

    if (!insertError) {
      const generated = `${window.location.origin}/${customCode}`;
      setShortUrl(""); // Reset dulu untuk trigger perubahan
      setTimeout(() => {
        setShortUrl(generated);
      }, 50); // delay kecil agar render dipicu

      setOriginalUrl("");
      setCustomCode("");
    }
  };

  return (
    <div className='container mt-5'>
      <Navbar />
      <div className='card mx-auto px-4 py-3'>
        <h2 className='d-flex justify-content-center'>Tambah URL</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor='target_url'>Masukan URL yang ingin dipendekkan :</label>
            <input
              id='target_url'
              type='url'
              className='form-control'
              placeholder='https://contoh.com/...'
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='custom_url'>Masukan custom linknya :</label>
            <input
              id='target_url'
              className='form-control'
              placeholder='contoh pendek (misal: contoh123)'
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              required
            />
          </div>
          <button className='btn btn-success' type='submit'>
            Submit
          </button>
        </form>
        {shortUrl && (
          <div key={shortUrl} className='mt-3'>
            <strong>URL yang telah diubah:</strong>
            <a href={shortUrl} target='_blank' rel='noopener noreferrer' className='ms-2'>
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
