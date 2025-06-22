import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import MyButton from '@/components/MyButton';
import '@/styles/Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div>
      {user && (
        <>
          <nav className='navbar'>
            <div className='navbar-header'>
              <h4 className='navbar-brand'>Pendek.in</h4>

              <button className='navbar-toggle' onClick={() => setIsOpen(!isOpen)} aria-label='Toggle navigation'>
                <span className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
                  <div className='hamburger-line'></div>
                </span>
              </button>
            </div>

            <div className={`navbar-menu ${isOpen ? 'show' : ''}`}>
              <NavLink to='/' className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Home
              </NavLink>
              <NavLink to='/create-url' className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Create URL
              </NavLink>
              <NavLink to='/data-url' className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Data URL
              </NavLink>
              <NavLink to='/about' className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                About
              </NavLink>
              <button
                className='logout-btn'
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}>
                Logout
              </button>
            </div>
          </nav>
        </>
      )}
      {!user && (
        <Link to='/login' className='btn btn-primary w-100 w-md-auto' onClick={() => setIsOpen(false)}>
          Login
        </Link>
      )}
    </div>
  );
}
