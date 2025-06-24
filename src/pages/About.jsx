import React from 'react';
import Navbar from '@/components/Navbar';

function About() {
  return (
    <div>
      <Navbar />
      <div className='container mt-5'>
        <div className='card mx-auto px-4 py-3'>
          <h2 className='d-flex justify-content-center mb-2'>About</h2>
        </div>
      </div>
    </div>
  );
}

export default About;
