import React from 'react';
import Navbar from '@/components/Navbar';
import { IconGithub, IconEmail } from '@/components/Icons';

function About() {
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-800'>
      <Navbar />
      <div className='mx-auto px-4 py-6'>
        <div className='bg-white shadow-md rounded-lg p-6 dark:bg-gray-900'>
          <h2 className='flex justify-start mb-2 text-2xl font-semibold text-black dark:text-white'>About</h2>
          <p className='text-black dark:text-white text-justify mb-2'>
            Pendek.in adalah layanan pemendek URL yang memungkinkan pengguna untuk membuat tautan pendek dari URL panjang mereka. Layanan ini
            menyediakan cara yang sederhana dan efisien untuk berbagi tautan, membuatnya lebih mudah diingat dan dibagikan.
          </p>
          <p className='text-black dark:text-white mb-2 mt-2'>
            Created By <span className='font-bold'>Machfudin</span>
          </p>
          <a
            className='flex gap-2 items-center hover:text-blue-500 dark:hover:text-blue-500 
             text-black dark:text-white
             transition-colors mb-1'
            href='#'
            target='_blank'
            rel='noopener noreferrer'>
            <IconGithub />
            Machfudin
          </a>
          <a
            className='flex gap-2 items-center hover:text-blue-500 dark:hover:text-blue-500 
             text-black dark:text-white
             transition-colors'
            href='#'
            target='_blank'
            rel='noopener noreferrer'>
            <IconEmail />
            Kontak Saya
          </a>
        </div>
      </div>
    </div>
  );
}

export default About;
