import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/helpers/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user } = useAuth();
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
        console.error('Error counting URLs:', error);
      }
    };

    countUserUrls();
  }, [user]);
  return (
    <div>
      <div className='container mt-5'>
        <Navbar />
        <div className='card mx-auto px-4 py-3'>
          <h2 className='d-flex justify-content-center mb-3'>Home</h2>
          <div className='row mb-3'>
            <div className='col-sm-6 mb-3'>
              <div className='card'>
                <div className='card-header'>Create URL</div>
                <div className='card-body'>
                  <p className='card-text'>Form untuk menambahkan URL yang ingin diubah</p>
                  <Link to='/create-url' className='btn btn-primary'>
                    Lihat
                  </Link>
                </div>
              </div>
            </div>
            <div className='col-sm-6 mb-3'>
              <div className='card'>
                <div className='card-header'>Data URL</div>
                <div className='card-body'>
                  <p className='card-text'>Total Data URL :{totalUrls}</p>
                  <Link to='/data-url' className='btn btn-primary'>
                    Lihat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
