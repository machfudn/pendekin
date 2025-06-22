import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MyButton from '@/components/MyButton';
import MyInput from '@/components/MyInput';
import '@/styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [message, setMessage] = useState('');

  const signInWithEmail = async e => {
    e.preventDefault();
    let isValid = true;
    setMessage('');

    // Validasi email
    if (!email.trim()) {
      setErrorEmail('Email belum diisi');
      isValid = false;
    } else {
      setErrorEmail('');
    }

    // Validasi password
    if (!password.trim()) {
      setErrorPassword('Password belum diisi');
      isValid = false;
    } else {
      setErrorPassword('');
    }

    if (!isValid) return;

    setIsLoadingEmail(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setMessage('Email belum dikonfirmasi. Silakan cek inbox/spam Anda.');
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        setMessage('Email atau password salah.');
      } else {
        setMessage(error.message);
      }
    } else {
      toast.success('Login berhasil');
      // Arahkan ke dashboard jika perlu
    }

    setIsLoadingEmail(false);
    setEmail('');
    setPassword('');
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/',
      },
    });
    if (error) {
      setMessage(error.error);
    }
  };

  return (
    <div className='container'>
      <div className='card px-3 py-5 mx-auto w-50'>
        <h2 className='mb-3 text-center'> Login</h2>
        <form onSubmit={signInWithEmail}>
          {message && <div className='alert alert-danger my-2'>{message}</div>}

          <label htmlFor='email' className='mb-2'>
            Email:
          </label>
          <MyInput
            className={errorEmail ? 'is-invalid form-control mb-2' : 'form-control mb-2'}
            name='email'
            id='email'
            type='email'
            placeholder='email'
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (errorEmail) setErrorEmail('');
            }}
            autoComplete='email'
          />
          {errorEmail && <div className='alert alert-danger'>{errorEmail}</div>}

          <label htmlFor='password' className='mb-2 mt-3'>
            Password:
          </label>
          <MyInput
            className={errorPassword ? 'is-invalid form-control mb-2' : 'form-control mb-2'}
            name='password'
            id='password'
            type={showPassword ? 'text' : 'password'}
            placeholder='password'
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (errorPassword) setErrorPassword('');
            }}
            autoComplete='current-password'
          />
          {errorPassword && <div className='alert alert-danger'>{errorPassword}</div>}

          <div className='form-check mt-3'>
            <input
              className='form-check-input'
              type='checkbox'
              id='showPasswordCheck'
              checked={showPassword}
              onChange={e => setShowPassword(e.target.checked)}
            />
            <label className='form-check-label' htmlFor='showPasswordCheck'>
              Tampilkan Password
            </label>
          </div>
          <span className=''>
            <Link className='link' to='/register'>
              Lupa Password?
            </Link>
          </span>

          <div className='d-flex flex-column gap-2 justify-content-start mt-3'>
            <MyButton type='submit' className='btn-primary me-2' disabled={isLoadingEmail}>
              {isLoadingEmail ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                  Login...
                </>
              ) : (
                'Login'
              )}
            </MyButton>

            <div>
              Belum punya akun?
              <Link className='link ms-1' to='/register'>
                Register
              </Link>
            </div>

            <div className='separator-or text-center my-2'>
              <span>OR</span>
            </div>

            <MyButton type='button' className='btn-outline-info' onClick={signInWithGoogle}>
              Login dengan Google
            </MyButton>
            <MyButton type='button' className='btn-outline-info' onClick={signInWithGoogle}>
              Login dengan email tautan
            </MyButton>
          </div>
        </form>
      </div>
    </div>
  );
}
