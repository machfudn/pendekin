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

  return (
    <div className='container mt-5'>
      <Navbar />
      <div className='card mx-auto px-4 py-3'>
        <h2 className='d-flex justify-content-center mb-2'>Data URL</h2>
        <table className='table table-bordered'>
          <thead>
            <tr className='text-center'>
              <th scope='col'>No</th>
              <th scope='col'>Original URL</th>
              <th scope='col'>Custom URL</th>
              <th scope='col'>Action</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url, index) => (
              <tr className='text-center' key={url.id}>
                <td>{index + 1}</td>
                <td>
                  <a href={url.original_url} target='_blank'>
                    {url.original_url}
                  </a>
                </td>
                <td>
                  <a href={url.original_url} target='_blank'>
                    {`${window.location.origin}/${url.short_code}`}
                  </a>
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
                <QRCodeSVG value={`${window.location.origin}/${selectedUrl.short_code}`} />
                <p className='mt-3'>{`${window.location.origin}/${selectedUrl.short_code}`}</p>
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
  );
}
