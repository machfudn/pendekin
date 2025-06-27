import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar.jsx';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/context/ToastContext';
import { IconCopy, IconLink, IconClose, IconDownload, IconEdit, IconDelete, IconQR } from '@/components/Icons';
import QrCode from '@/components/QrCode';

export default function ShortData() {
  const toast = useToast();
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const paginate = 10;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / paginate);
  const [showQR, setShowQR] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [newOriginalUrl, setNewOriginalUrl] = useState('');
  const [newShortCode, setNewShortCode] = useState('');
  const [errorOriginalUrl, setErrorOriginalUrl] = useState('');
  const [errorShortCode, setErrorShortCode] = useState('');
  const createModalRef = useRef();
  const qrModalRef = useRef();
  const editModalRef = useRef();
  const deleteModalRef = useRef();
  const [loadingData, setLoadingData] = useState(true);

  const fetchUrls = async () => {
    setLoadingData(true);
    if (!user) return;
    const from = (page - 1) * paginate;
    const to = from + paginate - 1;

    let query = supabase.from('urls').select('*', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: true }).range(from, to);

    if (search.trim()) {
      query = supabase
        .from('urls')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: true })
        .range(from, to)
        .eq('user_id', user.id)
        .or(`original_url.ilike.%${search.trim()}%,short_code.ilike.%${search.trim()}%`);
    }

    const { data, count, error } = await query;

    if (!error) {
      setUrls(data);
      setTotalCount(count); // total hasil pencarian
    }
    setLoadingData(false); // selesai loading
  };

  //Fetch Effect
  useEffect(() => {
    fetchUrls();
  }, [search, page, user]);
  // Modal Effect
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') {
        setShowCreate(false);
        setShowQR(false);
        setShowEdit(false);
        setShowDelete(false);
      }
    };

    const handleClickOutside = event => {
      if (createModalRef.current && !createModalRef.current.contains(event.target)) {
        setShowCreate(false);
      }
      if (qrModalRef.current && !qrModalRef.current.contains(event.target)) {
        setShowQR(false);
      }
      if (editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEdit(false);
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDelete(false);
      }
    };

    const isAnyModalOpen = showCreate || showQR || showEdit || showDelete;

    if (isAnyModalOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreate, showQR, showEdit, showDelete, user]);

  const handleUpdate = async e => {
    e.preventDefault();
    let isValid = true;

    setErrorOriginalUrl('');
    setErrorShortCode('');

    if (!newOriginalUrl.trim()) {
      setErrorOriginalUrl('Original URL tidak boleh kosong.');
      isValid = false;
    }

    if (!newShortCode.trim()) {
      setErrorShortCode('Custom URL tidak boleh kosong.');
      isValid = false;
    }

    if (!isValid) return;

    const { error } = await supabase
      .from('urls')
      .update({
        original_url: newOriginalUrl.trim(),
        short_code: newShortCode.trim(),
      })
      .eq('id', selectedUrl.id);

    if (error) {
      toast.error('Gagal update');
      return;
    }

    toast.success('URL berhasil diupdate');
    setShowEdit(false);
    fetchUrls();
  };

  const handleCreate = async e => {
    e.preventDefault();
    let isValid = true;

    // Reset error state
    setErrorOriginalUrl('');
    setErrorShortCode('');

    // Validasi original URL
    if (!newOriginalUrl.trim()) {
      setErrorOriginalUrl('Original URL tidak boleh kosong.');
      isValid = false;
    }

    // Validasi short code
    if (!newShortCode.trim()) {
      setErrorShortCode('Custom URL tidak boleh kosong.');
      isValid = false;
    }

    if (!isValid) return;

    const { data: existing, error: checkError } = await supabase
      .from('urls')
      .select('id')
      .eq('short_code', newShortCode.trim())
      .limit(1)
      .maybeSingle();

    if (checkError) {
      toast.error('Terjadi kesalahan saat memeriksa URL.');
      return;
    }

    if (existing) {
      setErrorShortCode('Custom URL sudah digunakan. Gunakan yang lain.');
      return;
    }

    const { error } = await supabase.from('urls').insert([
      {
        original_url: newOriginalUrl.trim(),
        short_code: newShortCode.trim(),
        user_id: user.id,
      },
    ]);

    if (error) {
      toast.error('Gagal menambahkan URL!');
      return;
    }

    toast.success('URL berhasil ditambahkan!');
    setShowCreate(false);
    setNewOriginalUrl('');
    setNewShortCode('');
    fetchUrls();
  };

  const handleDelete = async e => {
    e.preventDefault();
    const { error } = await supabase.from('urls').delete().eq('id', selectedUrl.id);
    if (error) return toast.error('Gagal menghapus');
    toast.success('Data berhasil dihapus');
    setShowDelete(false);
    fetchUrls();
  };

  const lihatOriginalUrl = (e, original_url) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(original_url)
      .then(() => {
        window.open(original_url, '_blank');
      })
      .catch(err => {
        toast.error('Gagal menyalin URL:', err);
        window.location.href = original_url;
      });
  };
  const salinOriginalUrl = (e, original_url) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(original_url)
      .then(() => {
        toast.success('Original URL berhasil disalin');
      })
      .catch(err => {
        toast.error('Gagal menyalin URL:', err);
        window.location.href = original_url;
      });
  };
  const lihatCustomUrl = (e, short_code) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(short_code)
      .then(() => {
        window.open(short_code, '_blank');
      })
      .catch(err => {
        toast.error('Gagal menyalin URL:', err);
        window.location.href = short_code;
      });
  };
  const salinCustomUrl = (e, short_code) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(short_code)
      .then(() => {
        toast.success('Custom URL berhasil disalin');
      })
      .catch(err => {
        toast.error('Gagal menyalin URL:', err);
        window.location.href = short_code;
      });
  };
  const handleDownload = () => {
    const isDark = document.documentElement.classList.contains('dark');

    const svg = document.getElementById('qr-code-svg');
    const clone = svg.cloneNode(true);

    // Tambahkan background putih/hitam
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '0');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', isDark ? '#ffffff' : '#000000'); // bg putih jika dark, bg hitam jika light
    clone.insertBefore(bgRect, clone.firstChild);

    // Ubah warna elemen QR code (biasanya <path> atau <rect>)
    const elements = clone.querySelectorAll('path, rect');
    elements.forEach(el => {
      if (el.getAttribute('fill') === 'currentColor' || el.getAttribute('fill') === '#000000') {
        el.setAttribute('fill', isDark ? '#ffffff' : '#000000'); // hitam untuk dark mode (di atas putih), putih untuk light mode (di atas hitam)
      }
    });

    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const fileName = `${selectedUrl.short_code}-${new Date().toLocaleDateString('id-ID')}.svg`.replace(/\//g, '-');

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(svgBlob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // handling Reset
  const handleReset = e => {
    e.preventDefault();
    setNewOriginalUrl('');
    setNewShortCode('');
    setErrorOriginalUrl('');
    setErrorShortCode('');
  };
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900'>
      <Navbar />
      <div className=' mx-auto px-4 py-6'>
        <div className='bg-white dark:bg-gray-900 text-black dark:text-white shadow-md rounded-lg p-6'>
          <h2 className='text-2xl font-semibold text-start mb-4'>Data URL</h2>

          <div className='overflow-x-auto'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4'>
              {/* Search Input */}
              <input
                id='search'
                autoComplete='off'
                type='text'
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder='Cari URL asli atau custom...'
                className='w-full md:max-w-sm px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400  focus:outline focus:outline-black dark:focus:outline-white focus:border-black dark:focus:border-white'
              />

              {/* Tombol Tambah */}
              <button
                onClick={() => {
                  setNewOriginalUrl('');
                  setNewShortCode('');
                  setErrorOriginalUrl('');
                  setErrorShortCode('');
                  setShowCreate(true);
                }}
                className='px-4 py-2 border rounded-md text-black dark:text-white hover:bg-blue-500 hover:border-blue-500 hover:text-white cursor-pointer'>
                Tambah
              </button>
            </div>

            {/* Tabel Dekstop */}
            <table className='min-w-full border border-gray-300 text-sm hidden md:table'>
              <thead className='bg-white dark:bg-gray-900'>
                <tr className='text-center'>
                  <th className='border px-3 py-2'>No</th>
                  <th className='border px-3 py-2'>Original URL</th>
                  <th className='border px-3 py-2'>Custom URL</th>
                  <th className='border px-3 py-2 text-nowrap'>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={4} className='text-center py-4 text-black dark:text-white'>
                      Loading...
                    </td>
                  </tr>
                ) : urls.length === 0 ? (
                  <tr>
                    <td colSpan={4} className='text-center py-4 text-black dark:text-white'>
                      Tidak ada data yang tersimpan.
                    </td>
                  </tr>
                ) : (
                  urls.map((url, index) => (
                    <tr className='text-center' key={url.id}>
                      <td className='border px-2 py-2'>
                        <span>{(page - 1) * paginate + index + 1}</span>
                      </td>
                      {/* Original URL */}
                      <td className='border px-2 py-2'>
                        <div className='relative w-full'>
                          <input
                            type='text'
                            value={url.original_url}
                            disabled
                            className='w-full bg-white dark:bg-gray-900 border dark:border-gray-300 px-3 py-2 pr-20 text-sm rounded'
                          />
                          {/* Tombol Salin */}
                          <button
                            type='button'
                            onClick={e => salinOriginalUrl(e, url.original_url)}
                            title='Salin URL'
                            className='absolute right-10 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'>
                            <IconCopy />
                          </button>

                          {/* Tombol Lihat */}
                          <button
                            type='button'
                            onClick={e => lihatOriginalUrl(e, url.original_url)}
                            title='Lihat URL'
                            className='absolute right-2 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'>
                            <IconLink />
                          </button>
                        </div>
                      </td>

                      {/* Custom URL */}
                      <td className='border px-2 py-2'>
                        <div className='relative w-full'>
                          <input
                            type='text'
                            value={`${window.location.origin}/${url.short_code}`}
                            disabled
                            className='w-full bg-white dark:bg-gray-900 border dark:border-gray-300 px-3 py-2 pr-20 text-sm rounded'
                          />
                          {/* Tombol Salin */}
                          <button
                            type='button'
                            onClick={e => salinCustomUrl(e, `${window.location.origin}/${url.short_code}`)}
                            title='Salin URL'
                            className='absolute right-10 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'>
                            <IconCopy />
                          </button>

                          {/* Tombol Lihat */}
                          <button
                            type='button'
                            onClick={e => lihatCustomUrl(e, `${window.location.origin}/${url.short_code}`)}
                            title='Lihat URL'
                            className='absolute right-2 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'>
                            <IconLink />
                          </button>
                        </div>
                      </td>

                      {/* Tombol Aksi */}
                      <td className='border px-2 py-2'>
                        <div className='flex flex-wrap justify-center gap-2'>
                          <button
                            onClick={() => {
                              setSelectedUrl(url);
                              setShowQR(true);
                            }}
                            className='flex gap-2 text-sm px-3 py-1 border rounded hover:bg-gray-100 hover:text-black dark:hover:bg-black dark:hover:border-black dark:hover:text-white'>
                            <IconQR />
                            <span>Show QR Code</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUrl(url);
                              setErrorOriginalUrl('');
                              setErrorShortCode('');
                              setNewOriginalUrl(url.original_url);
                              setNewShortCode(url.short_code);
                              setShowEdit(true);
                            }}
                            className='flex gap-2 text-sm px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-500 hover:text-white'>
                            <IconEdit />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUrl(url);
                              setShowDelete(true);
                            }}
                            className='flex gap-2 text-sm px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-500 hover:text-white'>
                            <IconDelete />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Card Versi Mobile */}
            <div className='block md:hidden space-y-4'>
              {loadingData ? (
                <p className='text-center py-4 text-black dark:text-white'>Loading...</p>
              ) : urls.length === 0 ? (
                <p className='text-center py-4 text-black dark:text-white'>Tidak ada data yang tersimpan.</p>
              ) : (
                urls.map((url, index) => (
                  <div key={url.id} className='border rounded-lg p-4 bg-white dark:bg-gray-900 shadow'>
                    <p className='text-sm mb-1 text-gray-700 dark:text-gray-300'>No: {(page - 1) * paginate + index + 1}</p>

                    <p className='text-sm font-semibold text-gray-800 dark:text-white'>Original URL:</p>
                    <div className='relative mb-3'>
                      <input
                        type='text'
                        value={url.original_url}
                        disabled
                        className='w-full bg-white dark:bg-gray-900 border dark:border-gray-300 px-3 py-2 pr-20 text-sm rounded'
                      />
                      <button
                        type='button'
                        onClick={e => salinOriginalUrl(e, url.original_url)}
                        title='Salin URL'
                        className='absolute right-10 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300'>
                        <IconCopy />
                      </button>
                      <button
                        type='button'
                        onClick={e => lihatOriginalUrl(e, url.original_url)}
                        title='Lihat URL'
                        className='absolute right-2 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300'>
                        <IconLink />
                      </button>
                    </div>

                    <p className='text-sm font-semibold text-gray-800 dark:text-white'>Custom URL:</p>
                    <div className='relative mb-3'>
                      <input
                        type='text'
                        value={`${window.location.origin}/${url.short_code}`}
                        disabled
                        className='w-full bg-white dark:bg-gray-900 border dark:border-gray-300 px-3 py-2 pr-20 text-sm rounded'
                      />
                      <button
                        type='button'
                        onClick={e => salinCustomUrl(e, `${window.location.origin}/${url.short_code}`)}
                        title='Salin URL'
                        className='absolute right-10 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300'>
                        <IconCopy />
                      </button>
                      <button
                        type='button'
                        onClick={e => lihatCustomUrl(e, `${window.location.origin}/${url.short_code}`)}
                        title='Lihat URL'
                        className='absolute right-2 inset-y-0 my-auto h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300'>
                        <IconLink />
                      </button>
                    </div>

                    {/* Aksi */}
                    <div className='flex flex-wrap justify-center gap-2 mt-2'>
                      <button
                        onClick={() => {
                          setSelectedUrl(url);
                          setShowQR(true);
                        }}
                        className='flex gap-2 text-sm px-3 py-1 border rounded hover:bg-gray-100 hover:text-black dark:hover:bg-black dark:hover:text-white'>
                        <IconQR />
                        <span>QR Code</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUrl(url);
                          setNewOriginalUrl(url.original_url);
                          setNewShortCode(url.short_code);
                          setErrorOriginalUrl('');
                          setErrorShortCode('');
                          setShowEdit(true);
                        }}
                        className='flex gap-2 text-sm px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-500 hover:text-white'>
                        <IconEdit />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUrl(url);
                          setShowDelete(true);
                        }}
                        className='flex gap-2 text-sm px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-500 hover:text-white'>
                        <IconDelete />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-center md:justify-end mt-4 gap-2'>
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className='px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600'>
                Prev
              </button>
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={page >= totalPages}
                className='px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50'>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Create */}
      {showCreate && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div ref={createModalRef} className='bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative'>
            <div className='flex justify-between items-center '>
              <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>Tambah URL Baru</h3>
              <button
                type='button'
                className='absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700 cursor-pointer'
                title='Close'
                onClick={() => setShowCreate(false)}>
                <IconClose />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              {/* Original URL */}
              <label htmlFor='original_url' className='block text-sm text-gray-700 dark:text-gray-300 mb-1'>
                Original URL
              </label>
              <input
                id='original_url'
                type='text'
                value={newOriginalUrl}
                onChange={e => {
                  setNewOriginalUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setErrorOriginalUrl('');
                  }
                }}
                className={`w-full px-3 py-2 mb-1 border rounded bg-white dark:bg-gray-800 text-black dark:text-white ${
                  errorOriginalUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              {errorOriginalUrl && <p className='text-sm text-red-500 mb-3'>{errorOriginalUrl}</p>}

              {/* Short Code */}
              <label htmlFor='short_code' className='block text-sm text-gray-700 dark:text-gray-300 mb-1'>
                Custom URL
              </label>
              <input
                id='short_code'
                type='text'
                value={newShortCode}
                onChange={e => {
                  setNewShortCode(e.target.value);
                  if (e.target.value.trim()) {
                    setErrorShortCode('');
                  }
                }}
                className={`w-full px-3 py-2 mb-1 border rounded bg-white dark:bg-gray-800 text-black dark:text-white ${
                  errorShortCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              {errorShortCode && <p className='text-sm text-red-500 mb-3'>{errorShortCode}</p>}

              <div className='flex justify-end gap-2 mt-2'>
                <button
                  type='button'
                  onClick={handleReset}
                  className='px-4 py-2  rounded-md text-white bg-yellow-600 hover:bg-yellow-700 cursor-pointer'>
                  Reset
                </button>
                <button type='submit' className='px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer'>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {showQR && (
        <div className='fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50'>
          <div ref={qrModalRef} className='bg-white dark:bg-black dark:text-white p-6 rounded shadow max-w-sm w-full text-center'>
            <div className='relative'>
              <h3 className='text-lg font-semibold mb-4'>QR Code</h3>
              <button
                type='button'
                className='absolute top-0 right-1 p-1 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700 cursor-pointer'
                title='Close'
                onClick={() => setShowQR(false)}>
                <IconClose />
              </button>
            </div>
            <div className='flex flex-col items-center'>
              <QrCode value={`${window.location.origin}/${selectedUrl.short_code}`} />
              <p className='mt-3 text-sm break-all'>{`${window.location.origin}/${selectedUrl.short_code}`}</p>
            </div>
            <div className='mt-4 flex justify-center gap-2'>
              <button
                onClick={handleDownload}
                className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:border-blue-600 cursor-pointer'>
                <IconDownload />
                <span>Download QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && (
        <div className='fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50'>
          <div ref={editModalRef} className='bg-white dark:bg-gray-900  p-6 rounded shadow max-w-md w-full'>
            <div className='relative'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>Edit URL</h2>
              <button
                type='button'
                className='absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700 cursor-pointer'
                title='Tutup'
                onClick={() => setShowEdit(false)}>
                <IconClose />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <label className='dark:text-white' htmlFor='original_url'>
                Original URL:
              </label>
              <input
                id='original_url'
                type='text'
                value={newOriginalUrl}
                onChange={e => {
                  setNewOriginalUrl(e.target.value);
                  if (e.target.value.trim()) setErrorOriginalUrl('');
                }}
                className={`w-full border px-3 py-2 rounded mb-1 dark:text-white ${errorOriginalUrl ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errorOriginalUrl && <p className='text-sm text-red-500 mb-3'>{errorOriginalUrl}</p>}

              <label className='dark:text-white' htmlFor='short_code'>
                Custom URL:
              </label>
              <input
                id='short_code'
                type='text'
                value={newShortCode}
                onChange={e => {
                  setNewShortCode(e.target.value);
                  if (e.target.value.trim()) setErrorShortCode('');
                }}
                className={`w-full border px-3 py-2 rounded mb-1 dark:text-white ${errorShortCode ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errorShortCode && <p className='text-sm text-red-500 mb-3'>{errorShortCode}</p>}

              <div className='flex justify-end gap-2 mt-2'>
                <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 cursor-pointer'>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDelete && (
        <div className='fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50'>
          <div ref={deleteModalRef} className='bg-white dark:bg-gray-900 dark:text-white p-6 rounded shadow max-w-md w-full'>
            <div className='relative'>
              <h3 className='text-lg font-semibold mb-4'>Konfirmasi Hapus</h3>
              <button
                type='button'
                className='absolute top-0 right-0 p-1 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700 cursor-pointer'
                title='Close'
                onClick={() => setShowDelete(false)}>
                <IconClose />
              </button>
            </div>
            <p className='mb-3'>Yakin ingin menghapus data ini?</p>
            <form onSubmit={handleDelete}>
              <label className='block text-sm mb-1'>Original URL:</label>
              <input type='text' value={selectedUrl?.original_url} readOnly className='w-full border border-gray-300 px-3 py-2 rounded mb-4' />
              <label className='block text-sm mb-1'>Custom URL:</label>
              <input
                type='text'
                value={`${window.location.origin}/${selectedUrl?.short_code}`}
                readOnly
                className='w-full border border-gray-300 px-3 py-2 rounded mb-4'
              />
              <div className='flex justify-end gap-2'>
                <button type='submit' className='px-4 py-2 text-white bg-red-500 rounded hover:bg-red-700 hover:text-white cursor-pointer'>
                  Hapus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
