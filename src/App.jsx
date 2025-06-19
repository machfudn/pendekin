import { Routes, Route, useParams, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Auth from "./view/Auth/pages";
import ShortData from "./view/Short/pagesData";
import ShortCreate from "./view/Short/pagesCreate";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();

  useEffect(() => {
    const checkAndInsertUser = async () => {
      if (!user) return;

      const { data: existingUser, error: fetchError } = await supabase.from("users").select("role").eq("id", user.id).single();

      // Perbaikan: insert jika tidak ada user atau jika error karena tidak ditemukan
      if (!existingUser || fetchError?.code === "PGRST116") {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.id,
            email: user.email,
            role: "user",
          },
        ]);

        if (insertError) {
          console.error("Gagal insert user:", insertError.message);
        }
      }

      const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

      if (userData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    };

    const isFromAuth = location.pathname === "/auth";

    if (user && isFromAuth) checkAndInsertUser();
  }, [user, navigate, location.pathname]);

  if (user === undefined) return <p>Loading...</p>; // untuk cegah render saat user belum siap
  return (
    <>
      <Toaster position='top-center' reverseOrder={false} />
      <Routes>
        <Route path='/auth' element={!user ? <Auth /> : <Navigate to='/' />} />

        <Route
          path='/'
          element={
            <ProtectedRoute>
              <ShortCreate />
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
