import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase client dengan validasi env
const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;

// Validasi environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL dan ANON KEY harus diatur dalam environment variables');
}

// Buat dan export Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Opsional: sesi tetap tersimpan
    autoRefreshToken: true, // Opsional: refresh token otomatis
  },
});
