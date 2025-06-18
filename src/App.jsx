import { Routes, Route, useParams, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import ShortenForm from "./components/ShortenForm";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Auth from "./Auth/Auth";
import ShortData from "./Data/ShortData";
import ProtectedRoute from "./routes/ProtectedRoute";

function RedirectPage() {
  const { code } = useParams();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("urls").select("original_url").eq("short_code", code).single();

      if (data) {
        window.location.href = data.original_url;
      } else {
        alert("URL tidak ditemukan");
      }
    })();
  }, [code]);

  return <p>Mengalihkan...</p>;
}

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      const { data: userData } = await supabase.from("users").select("role").eq("id", user?.id).single();

      if (userData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    };

    if (user) fetchRole();
  }, [user, navigate]);

  return (
    <>
      <Toaster position='top-center' reverseOrder={false} />
      <Routes>
        <Route path='/auth' element={!user ? <Auth /> : <Navigate to='/' />} />
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <ShortenForm />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <ShortData />
            </ProtectedRoute>
          }
        />
        <Route path='/:code' element={<RedirectPage />} />
      </Routes>
    </>
  );
}

export default App;
