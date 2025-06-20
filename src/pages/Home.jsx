import React from 'react';
import Navbar from '@/components/Navbar';

function Home() {
  return (
    <div>
      <div className='container mt-5'>
        <Navbar />
        <div className='card mx-auto px-4 py-3'>
          <h2 className='d-flex justify-content-center mb-2'>Home</h2>
        </div>
      </div>
    </div>
  );
}

export default Home;
