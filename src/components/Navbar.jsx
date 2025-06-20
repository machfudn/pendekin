import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div>
      {user && (
        <>
          <nav className='d-flex flex-column flex-md-row justify-content-between align-items-center p-3 bg-white rounded shadow-sm border border-light border-2 mb-4'>
            <div className='d-flex w-auto justify-content-between w-100 align-items-center'>
              <h4 className='m-0 me-md-4'>Pendek.in</h4>

              {/* Hamburger Button (Mobile Only) */}
              <button className='btn d-md-none' onClick={() => setIsOpen(!isOpen)} aria-label='Toggle navigation'>
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>

            {/* Mobile Menu (Collapsible) */}
            <div className={`${isOpen ? 'd-flex' : 'd-none'} d-md-flex flex-column flex-md-row align-items-center w-100 mt-3 mt-md-0`}>
              {user ? (
                <>
                  <NavLink
                    to='/'
                    className={({ isActive }) => `btn w-100 text-center mb-2 mb-md-0 me-md-1 ${isActive ? 'active btn-primary' : ''}`}
                    onClick={() => setIsOpen(false)}>
                    Home
                  </NavLink>
                  <NavLink
                    to='/create-url'
                    className={({ isActive }) => `btn w-100 text-center mb-2 mb-md-0 me-md-1 ${isActive ? 'active btn-primary' : ''}`}
                    onClick={() => setIsOpen(false)}>
                    Create URL
                  </NavLink>
                  <NavLink
                    to='/data-url'
                    className={({ isActive }) => `btn w-100 text-center mb-2 mb-md-0 me-md-1 ${isActive ? 'active btn-primary' : ''}`}
                    onClick={() => setIsOpen(false)}>
                    Data URL
                  </NavLink>
                  <NavLink
                    to='/about'
                    className={({ isActive }) => `btn w-100 text-center mb-2 mb-md-0 me-md-1 ${isActive ? 'active btn-primary' : ''}`}
                    onClick={() => setIsOpen(false)}>
                    About
                  </NavLink>
                  <Button
                    variant='outline-danger'
                    className='w-100 w-md-auto'
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}>
                    Logout
                  </Button>
                </>
              ) : (
                <Link to='/auth' className='btn btn-primary w-100 w-md-auto' onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
      {!user && (
        <Link to='/auth' className='btn btn-primary w-100 w-md-auto' onClick={() => setIsOpen(false)}>
          Login
        </Link>
      )}
    </div>
  );
}
