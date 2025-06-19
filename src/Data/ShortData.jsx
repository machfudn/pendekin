import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar.jsx";

export default function ShortDataUser() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    if (user) {
      supabase
        .from("urls")
        .select("*")
        .eq("user_id", user.id)
        .then(({ data }) => setUrls(data));
    }
  }, [user]);

  return (
    <div className='container mt-4'>
      <Navbar />
      <h2>URL Saya</h2>
      <ul>
        {urls.map((url) => (
          <li key={url.id}>
            <a href={url.original_url} target='_blank'>
              {url.short_code}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
