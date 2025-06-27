import { useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/helpers/supabaseClient';
import Theme from '@/components/Theme';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className=' mb-3 rounded-xl mx-auto px-4'>
      {user ? (
        <nav className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-900 shadow-md rounded-lg px-6 py-4'>
          <div className='flex items-center justify-between flex-wrap'>
            {/* Brand */}
            <h1 className='text-xl font-semibold text-gray-800 dark:text-white'>Pendek.in</h1>

            {/* Toggle Button (aktif di mobile & tablet) */}
            <button onClick={() => setIsOpen(!isOpen)} className='lg:hidden p-2 rounded-md hover:bg-blue-500/50' aria-label='Toggle navigation'>
              <div className='space-y-1'>
                <span className='block w-6 h-0.5 bg-gray-800 dark:bg-white'></span>
                <span className='block w-6 h-0.5 bg-gray-800 dark:bg-white'></span>
                <span className='block w-6 h-0.5 bg-gray-800 dark:bg-white'></span>
              </div>
            </button>

            {/* Navigation Menu */}
            <div className={`w-full lg:flex lg:items-center lg:w-auto mt-4 lg:mt-0 ${isOpen ? 'block' : 'hidden'}`}>
              <div className='flex flex-col lg:flex-row lg:items-center lg:gap-4 w-full'>
                {[
                  { path: '/', label: 'Home' },
                  { path: '/data-url', label: 'Data URL' },
                  { path: '/about', label: 'About' },
                ].map(({ path, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-sm text-gray-800 dark:text-white font-medium text-center mb-1 ${
                        isActive ? 'bg-blue-500 text-white' : 'text-gray-800 hover:bg-blue-500/50 hover:text-white'
                      }`
                    }
                    onClick={() => setIsOpen(false)}>
                    {label}
                  </NavLink>
                ))}

                <Theme />

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className='px-4 py-2 mt-2 lg:mt-0 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition cursor-pointer'>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <Link
          to='/login'
          onClick={() => setIsOpen(false)}
          className='block w-full lg:w-auto text-center mt-3 lg:mt-0 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700'>
          Login
        </Link>
      )}
    </div>
  );
}
