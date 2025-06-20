import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/helpers/supabaseClient';
import NotFoundPage from '@/pages/NotFound';
function RedirectPage() {
  const { code } = useParams();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('urls').select('original_url').eq('short_code', code).single();

      if (data) {
        window.location.href = data.original_url;
      } else {
        alert('URL tidak ditemukan');
      }
    })();
  }, [code]);

  return <p>Mengalihkan...</p>;
}

export default RedirectPage;
