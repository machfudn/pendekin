import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar.jsx';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/context/ToastContext';
import { IconCopy, IconLink, IconClose } from '@/components/Icons';

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

  const fetchUrls = async () => {
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

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('urls')
      .update({
        original_url: newOriginalUrl,
        short_code: newShortCode,
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
    } else {
      setErrorOriginalUrl('');
    }

    // Validasi short code
    if (!newShortCode.trim()) {
      setErrorShortCode('Custom URL tidak boleh kosong.');
      isValid = false;
    } else {
      setErrorShortCode('');
    }

    if (!isValid) return;

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

  const handleDelete = async () => {
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
    // Format nama file: value-tanggal-bulan-tahun
    const fileName = `${selectedUrl.short_code}-${new Date().toLocaleDateString('id-ID')}.svg`.replace(/\//g, '-'); // Ganti slash dengan dash untuk format tanggal

    // Dapatkan SVG element
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

    // Buat download link
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
            {/* Header: Search & Tambah */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4'>
              {/* Search Input */}
              <input
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
                onClick={() => setShowCreate(true)}
                className='px-4 py-2 border rounded-md text-black dark:text-white hover:bg-blue-500 hover:border-blue-500 hover:text-white'>
                Tambah
              </button>
            </div>

            {/* Tabel */}
            <table className='min-w-full border border-gray-300 text-sm'>
              <thead className='bg-white dark:bg-gray-900'>
                <tr className='text-center'>
                  <th className='border px-3 py-2'>No</th>
                  <th className='border px-3 py-2'>Original URL</th>
                  <th className='border px-3 py-2'>Custom URL</th>
                  <th className='border px-3 py-2 text-nowrap'>Action</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url, index) => (
                  <tr className='text-center' key={url.id}>
                    <td className='border px-2 py-2'>
                      <td>{(page - 1) * paginate + index + 1}</td>
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
                          className='text-sm px-3 py-1 border rounded hover:bg-gray-100 hover:text-black dark:hover:bg-black dark:hover:border-black dark:hover:text-white'>
                          Show QR Code
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUrl(url);
                            setNewOriginalUrl(url.original_url);
                            setNewShortCode(url.short_code);
                            setShowEdit(true);
                          }}
                          className='text-sm px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-50'>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUrl(url);
                            setShowDelete(true);
                          }}
                          className='text-sm px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50'>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className='flex items-center justify-end mt-4 gap-2'>
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>Tambah URL Baru</h2>
              <button
                type='button'
                className='absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700'
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
                <button type='button' onClick={handleReset} className='px-4 py-2 border rounded-md text-white bg-yellow-600 hover:bg-yellow-700'>
                  Reset
                </button>
                <button type='submit' className='px-4 py-2 border rounded-md text-white bg-blue-600 hover:bg-blue-700'>
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
          <div ref={qrModalRef} className='bg-white dark:bg-gray-900 dark:text-white p-6 rounded shadow max-w-sm w-full text-center'>
            <h3 className='text-lg font-semibold mb-4'>QR Code</h3>
            <div className='flex flex-col items-center'>
              <QRCodeSVG
                id='qr-code-svg'
                value={`${window.location.origin}/${selectedUrl.short_code}`}
                size={256}
                level='H'
                includeMargin={true}
                fgColor='currentColor'
                bgColor='transparent'
                className='text-black dark:text-white'
              />
              <p className='mt-3 text-sm break-all'>{`${window.location.origin}/${selectedUrl.short_code}`}</p>
            </div>
            <div className='mt-4 flex justify-center gap-2'>
              <button
                onClick={() => setShowQR(false)}
                className='px-4 py-2 border rounded hover:bg-gray-900 hover:text-white dark:hover:text-white dark:hover:border-black dark:hover:bg-black cursor-pointer'>
                Close
              </button>
              <button
                onClick={handleDownload}
                className='px-4 py-2 border text-blue-500 rounded hover:bg-blue-500 hover:text-white hover:border-blue-500 cursor-pointer'>
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && (
        <div className='fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50'>
          <div ref={editModalRef} className='bg-white dark:bg-gray-900 dark:text-white p-6 rounded shadow max-w-md w-full'>
            <div className='relative'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>Edit URL</h2>
              <button
                type='button'
                className='absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700'
                title='Tutup'
                onClick={() => setShowEdit(false)}>
                <IconClose />
              </button>
            </div>

            <label htmlFor='original_url'>Original URL:</label>
            <input
              id='original_url'
              type='text'
              value={newOriginalUrl}
              onChange={e => setNewOriginalUrl(e.target.value)}
              className='w-full border border-gray-300 px-3 py-2 rounded mb-4'
            />
            <label htmlFor='short_code'>Custom URL:</label>
            <input
              id='short_code'
              type='text'
              value={newShortCode}
              onChange={e => setNewShortCode(e.target.value)}
              className='w-full border border-gray-300 px-3 py-2 rounded mb-4'
            />
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setShowEdit(false)}
                className='px-4 py-2 border rounded hover:bg-gray-900 hover:text-white dark:hover:text-white dark:hover:border-black dark:hover:bg-black cursor-pointer'>
                Batal
              </button>
              <button
                onClick={handleUpdate}
                className='px-4 py-2 border text-blue-500 rounded hover:bg-blue-500 hover:text-white hover:border-blue-500 cursor-pointer'>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div ref={deleteModalRef} className='bg-white p-6 rounded shadow max-w-md w-full'>
            <h3 className='text-lg font-semibold mb-4'>Konfirmasi Hapus</h3>
            <p className='mb-3'>Yakin ingin menghapus link ini?</p>
            <div className='mb-3'>
              <label className='block text-sm mb-1'>Original URL:</label>
              <input type='text' value={selectedUrl?.original_url} disabled className='w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded' />
            </div>
            <div className='mb-3'>
              <label className='block text-sm mb-1'>Custom URL:</label>
              <input
                type='text'
                value={`${window.location.origin}/${selectedUrl?.short_code}`}
                disabled
                className='w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded'
              />
            </div>
            <div className='flex justify-end gap-2'>
              <button onClick={() => setShowDelete(false)} className='px-4 py-2 border rounded hover:bg-gray-100'>
                Batal
              </button>
              <button onClick={handleDelete} className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
