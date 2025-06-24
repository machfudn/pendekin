import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar.jsx';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';

export default function ShortData() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [newUrl, setNewUrl] = useState('');

  const fetchUrls = () => {
    if (user) {
      supabase
        .from('urls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => setUrls(data));
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [user]);

  const handleUpdate = async () => {
    const { error } = await supabase.from('urls').update({ original_url: newUrl }).eq('id', selectedUrl.id);

    if (error) return toast.error('Gagal update');
    toast.success('URL berhasil diupdate');
    setShowEdit(false);
    fetchUrls();
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('urls').delete().eq('id', selectedUrl.id);
    if (error) return toast.error('Gagal menghapus');
    toast.success('Data dihapus');
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

  return (
    <div>
      <Navbar />
      <div className='container mt-5'>
        <div className='card mx-auto px-4 py-3'>
          <h2 className='d-flex justify-content-center mb-2'>Data URL</h2>
          <table className='table table-bordered'>
            <thead>
              <tr className='text-center'>
                <th scope='col'>No</th>
                <th scope='col'>Original URL</th>
                <th scope='col'>Custom URL</th>
                <th scope='col' className='text-nowrap' style={{ maxWidth: '150px', minWidth: '100px', width: '30%' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url, index) => (
                <tr className='text-center' key={url.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className='input-group mb-3'>
                      <input className='form-control' type='text' value={url.original_url} disabled />
                    </div>
                  </td>
                  <td>
                    <div className='input-group mb-3'>
                      <input className='form-control' type='text' value={`${window.location.origin}/${url.short_code}`} disabled />
                    </div>
                  </td>
                  <td className='d-flex justify-content-center gap-1 flex-wrap'>
                    <Button
                      size='sm'
                      variant='outline-secondary'
                      onClick={() => {
                        setSelectedUrl(url);
                        setShowQR(true);
                      }}>
                      QR Code
                    </Button>
                    <Button size='sm' variant='outline-dark' onClick={e => salinOriginalUrl(e, url.original_url)}>
                      Salin Original URL
                    </Button>
                    <Button size='sm' variant='outline-dark' onClick={e => lihatOriginalUrl(e, url.original_url)}>
                      Lihat Original URL
                    </Button>
                    <Button size='sm' variant='outline-dark' onClick={e => salinCustomUrl(e, `${window.location.origin}/${url.short_code}`)}>
                      Salin Custom URL
                    </Button>
                    <Button size='sm' variant='outline-dark' onClick={e => lihatCustomUrl(e, `${window.location.origin}/${url.short_code}`)}>
                      Lihat Custome URL
                    </Button>

                    <Button
                      size='sm'
                      variant='outline-primary'
                      onClick={() => {
                        setSelectedUrl(url);
                        setNewUrl(url.original_url);
                        setShowEdit(true);
                      }}>
                      Edit
                    </Button>

                    <Button
                      size='sm'
                      variant='outline-danger'
                      onClick={() => {
                        setSelectedUrl(url);
                        setShowDelete(true);
                      }}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal QR */}
          <Modal show={showQR} onHide={() => setShowQR(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>QR Code</Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center'>
              {selectedUrl && (
                <>
                  <QRCodeSVG
                    id='qr-code-svg'
                    value={`${window.location.origin}/${selectedUrl.short_code}`}
                    size={256}
                    level='H' // High error correction
                    includeMargin={true}
                  />
                  <p className='mt-3'>{`${window.location.origin}/${selectedUrl.short_code}`}</p>
                  <Button variant='primary' onClick={handleDownload} className='mt-2'>
                    Download QR Code (.svg)
                  </Button>
                </>
              )}
            </Modal.Body>
          </Modal>

          {/* Modal Edit */}
          <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit URL</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Control type='text' value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setShowEdit(false)}>
                Batal
              </Button>
              <Button variant='primary' onClick={handleUpdate}>
                Simpan
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal Delete */}
          <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Konfirmasi Hapus</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className='mb-3'>Yakin ingin menghapus link ini?</div>
              <Form.Group className='mb-3'>
                <div>Original URL:</div>
                <Form.Control id='originalUrl' type='text' value={selectedUrl?.original_url} disabled />
              </Form.Group>
              <Form.Group className='mb-3'>
                <div>Custom URL:</div>
                <Form.Control id='customUrl' type='text' value={`${window.location.origin}/${selectedUrl?.short_code}`} disabled />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setShowDelete(false)}>
                Batal
              </Button>
              <Button variant='danger' onClick={handleDelete}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
