import { useEffect, useState } from 'react';

export default function Theme() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;

    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className='px-4 py-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:text-white hover:bg-blue-500/50'>
      {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}
