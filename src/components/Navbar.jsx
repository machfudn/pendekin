import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className='d-flex justify-content-between align-items-center mb-4'>
      <h4>Pendek.in</h4>
      <div>
        {user && (
          <>
            <Link to='/' className='btn btn-outline-primary me-2'>
              Form pembuatan link
            </Link>
            <Link to='/dashboard' className='btn btn-outline-primary me-2'>
              Link yang dibuat
            </Link>
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
