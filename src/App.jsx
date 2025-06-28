import Index from '@/routes/Index';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Cek preferensi pengguna dari localStorage atau media query
    const userPref = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (userPref === 'dark' || (!userPref && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  return (
    <>
      <Index />
    </>
  );
}

export default App;
