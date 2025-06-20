import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import toast from 'react-hot-toast';
import MyButton from '@/components/MyButton';
import MyInput from '@/components/MyInput';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const signInWithEmail = async () => {
    if (!email.trim()) {
      toast.error('Tolong masukkan email');
      return;
    }
    if (!password.trim()) {
      toast.error('Tolong masukkan password');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        toast.error('Email belum dikonfirmasi. Silakan cek inbox/spam Anda.');
      } else {
        toast.error(error.message); // fallback untuk error lainnya
      }
    } else {
      toast.success('Login berhasil');
      // bisa redirect atau reset form di sini
    }

    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/',
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  const register = async () => {
    if (!email.trim()) {
      toast.error('Tolong masukkan email');
      return;
    }
    if (!password.trim()) {
      toast.error('Tolong masukkan password');
      return;
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) {
      await supabase.from('users').insert([{ id: data.user.id, role: 'user' }]);
      toast.success('Pendaftaran berhasil! Silakan cek email untuk konfirmasi.');
    } else {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (activeTab === 'login') {
      signInWithEmail();
    } else {
      register();
    }
  };

  return (
    <div className='container my-5'>
      <div className='card px-3 py-5 mx-auto w-50'>
        <div className='card mb-3 w-full'>
          <div className='d-flex border justify-content-center rounded overflow-hidden p-2'>
            <MyButton className='flex-fill text-center border-0 rounded' isActive={activeTab === 'login'} onClick={() => setActiveTab('login')}>
              Login
            </MyButton>
            <MyButton className='flex-fill text-center border-0 rounded' isActive={activeTab === 'register'} onClick={() => setActiveTab('register')}>
              Register
            </MyButton>
          </div>
        </div>

        <h3 className='mb-3 text-center'> {activeTab === 'login' ? 'Login' : 'Register'}</h3>
        <form onSubmit={handleSubmit}>
          <label className='mb-2' htmlFor='email'>
            Email :
          </label>
          <MyInput name='email' id='email' autoComplete='email' type='email' placeholder='email' onChange={e => setEmail(e.target.value)} required />
          <div></div>
          <label className='mb-2' htmlFor='password'>
            Password :
          </label>
          <MyInput
            name='password'
            id='password'
            autoComplete='current-password'
            type={showPassword ? 'text' : 'password'}
            placeholder='password'
            onChange={e => setPassword(e.target.value)}
            required
          />
          <MyButton type='button' className='form-check no-hover' onClick={() => setShowPassword(!showPassword)}>
            <MyInput type='checkbox' className='form-check-input mb-2' id='showPasswordCheck' onChange={e => setShowPassword(e.target.checked)} />
            <label id='showPasswordCheck' className='' htmlFor='showPasswordCheck'>
              Tampilkan Password
            </label>
          </MyButton>
          <div className='d-flex flex-column gap-2 justify-content-start mt-3'>
            <MyButton className='btn-primary me-2' onClick={handleSubmit} disabled={isLoading} isActive>
              {isLoading ? (
                activeTab === 'login' ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                    Login...
                  </>
                ) : (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                    Register...
                  </>
                )
              ) : activeTab === 'login' ? (
                'Login'
              ) : (
                'Register'
              )}
            </MyButton>
            {activeTab === 'login' && (
              <MyButton className='btn-danger' onClick={signInWithGoogle}>
                Login with Google
              </MyButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
