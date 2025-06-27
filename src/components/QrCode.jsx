import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function QrCode({ value }) {
  const [bgColor, setBgColor] = useState('#ffffff'); // default light

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setBgColor(isDark ? '#00000' : '#ffffff'); // dark:bg-gray-900, light:bg-white

    // Optional: listen for theme changes (if using toggle)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = e => {
      setBgColor(e.matches ? '#00000' : '#ffffff');
    };
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return (
    <QRCodeSVG
      id='qr-code-svg'
      value={value}
      size={256}
      level='H'
      includeMargin={true}
      fgColor='currentColor'
      bgColor={bgColor}
      className='text-black dark:text-white'
    />
  );
}
export default QrCode;
