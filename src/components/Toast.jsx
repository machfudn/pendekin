// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

const Toast = ({ message, type, id, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Efek untuk menampilkan toast dengan animasi
  useEffect(() => {
    // Memberi sedikit jeda agar transisi CSS bisa berjalan
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Otomatis sembunyikan toast
    const hideTimer = setTimeout(() => {
      setIsVisible(false); // Memulai animasi keluar
      // Panggil onClose setelah animasi keluar selesai (durasi 200ms)
      setTimeout(() => onClose(id), 200); // Sesuaikan dengan durasi transisi CSS
    }, 2000); // Toast akan terlihat selama 2 detik sebelum mulai menghilang

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, onClose]);

  // Kelas Tailwind berdasarkan tipe toast
  const baseClasses = 'px-4 py-3 rounded-lg shadow-lg text-white transform transition-all duration-200 ease-out'; // Durasi transisi dipercepat menjadi 200ms
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500 text-gray-800',
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type] || typeClasses.info} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      {message}
    </div>
  );
};

export default Toast;
