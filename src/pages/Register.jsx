import { supabase } from '@/helpers/supabaseClient';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MyButton from '@/components/MyButton';
import MyInput from '@/components/MyInput';
import '@/styles/Register.css';
function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [message, setMessage] = useState('');
  const register = async e => {
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

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('password should be at least 6 characters')) {
        setMessage('Password minimal 6 karakter');
      } else if (error.message.toLowerCase().includes('user already registered')) {
        setMessage('Email sudah terdaftar. Silakan login atau gunakan email lain.');
      } else {
        setMessage(error.message);
      }
    } else {
      if (data?.user?.id) {
        const { error: insertError } = await supabase.from('users').insert([{ id: data.user.id, role: 'user' }]);

        if (insertError) {
          setMessage('Gagal menyimpan data user:', insertError.message);
        }
      }

      toast.success('Pendaftaran berhasil! Silakan cek email untuk konfirmasi.');
    }

    setIsLoading(false);
  };
  return (
    <div>
      <div className='container my-5'>
        <div className='card px-3 py-5 mx-auto w-50'>
          <h2 className='mb-3 text-md text-center'>Register</h2>
          <form onSubmit={register}>
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

            <div className='d-flex flex-column gap-2 justify-content-start mt-3'>
              <MyButton type='submit' className='btn-primary me-2' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                    Register...
                  </>
                ) : (
                  'Login'
                )}
              </MyButton>

              <div>
                Sudah punya akun?
                <Link className='link ms-1' to='/login'>
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
