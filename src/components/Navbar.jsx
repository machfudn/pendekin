import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../helpers/supabaseClient';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <nav className='d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border border-light border-2 border-light'>
      <h4>Pendek.in</h4>
      <div>
        {user && (
          <>
            <NavLink to='/' className={({ isActive }) => `btn me-1 ${isActive ? 'active btn-primary' : ''}`}>
              Home
            </NavLink>
            <NavLink to='/create-url' className={({ isActive }) => `btn me-1 ${isActive ? 'active btn-primary' : ''}`}>
              Create URL
            </NavLink>
            <NavLink to='/data-url' className={({ isActive }) => `btn me-1 ${isActive ? 'active btn-primary' : ''}`}>
              Data URL
            </NavLink>
            <button onClick={handleLogout} className='btn btn-outline-danger'>
              Logout
            </button>
          </>
        )}
        {!user && (
          <Link to='/auth' className='btn btn-primary'>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
