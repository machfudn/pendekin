import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ShortDataAdmin() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    supabase
      .from("urls")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setUrls(data));
  }, []);

  return (
    <div className='container mt-4'>
      <h2>Semua URL</h2>
      <ul>
        {urls.map((url) => (
          <li key={url.id}>
            <strong>{url.short_code}</strong>:{" "}
            <a href={url.original_url} target='_blank'>
              {url.original_url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
