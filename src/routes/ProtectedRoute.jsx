import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth(); // Tambahkan isLoading
  const location = useLocation();

  if (isLoading) {
    return <div className='d-flex justify-content-center align-items-center vh-100'>Loading...</div>; // Tampilkan loading state
  }

  if (!user) {
    return <Navigate to='/auth' state={{ from: location }} replace />;
  }

  return children;
}
