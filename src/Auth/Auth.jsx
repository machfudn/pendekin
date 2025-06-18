import { supabase } from "../supabaseClient";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) toast.error(error.message);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const register = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) {
      await supabase.from("users").insert([{ id: data.user.id, role: "user" }]);
      toast.success("Pendaftaran berhasil!");
    } else {
      toast.error(error.message);
    }
  };

  return (
    <div className='container mt-5'>
      <h2>Login / Register</h2>
      <input type='email' placeholder='email' className='form-control mb-2' onChange={(e) => setEmail(e.target.value)} />
      <input type='password' placeholder='password' className='form-control mb-2' onChange={(e) => setPassword(e.target.value)} />
      <button className='btn btn-primary me-2' onClick={signInWithEmail}>
        Login
      </button>
      <button className='btn btn-success me-2' onClick={register}>
        Register
      </button>
      <button className='btn btn-danger' onClick={signInWithGoogle}>
        Login with Google
      </button>
    </div>
  );
}
