import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/helpers/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';

function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const [totalUrls, setTotalUrls] = useState(0);
  useEffect(() => {
    const countUserUrls = async () => {
      if (!user) {
        setTotalUrls(0);
        return;
      }

      try {
        const { count, error } = await supabase.from('urls').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

        if (error) throw error;

        setTotalUrls(count || 0);
      } catch (error) {
        toast.error('Error counting URLs:', error);
      }
    };

    countUserUrls();
  }, [user]);
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900'>
      <Navbar />
      <div className='container mx-auto mt-10 px-4'>
        <div className='bg-white shadow-md rounded-lg p-6 dark:bg-gray-800'>
          <h2 className='text-start text-2xl font-semibold mb-6 dark:text-white'>Home</h2>
          <div className='grid mb-3 grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Card Create URL */}
            <section className='bg-green-500 rounded-md shadow p-4'>
              <div className='border-b pb-2 mb-4 font-medium text-lg'>Create URL</div>
              <p className='mb-4 '>Form untuk menambahkan URL yang ingin diubah</p>
              <Link
                to='/create-url'
                className='inline-block outline text-black px-4 py-2 rounded hover:outline-black hover:bg-black hover:text-white'>
                Lihat
              </Link>
            </section>

            {/* Card Data URL */}
            <section className='bg-yellow-500  rounded-md shadow p-4'>
              <div className='border-b pb-2 mb-4 font-medium text-lg'>Data URL</div>
              <p className='mb-4'>Total Data URL: {totalUrls}</p>
              <Link to='/data-url' className='inline-block outline text-black px-4 py-2 rounded hover:outline-black hover:bg-black hover:text-white'>
                Lihat
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
