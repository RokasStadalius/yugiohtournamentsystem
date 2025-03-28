'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/Login.module.css';
import { CustomInput } from '../components/CustomInput';
import { handleLogin } from '../../utils/auth'; // Should return userId and token
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token != null) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handleLogin(email, password);

      localStorage.setItem('userId', data.userId);

      router.push('/');

      toast.success('Login successful!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.loginBox}>
        <div className={styles.welcomeSection}>
          <div className={styles.logo}>
          </div>
          <h2>Welcome Page</h2>
          <p>Sign in to continue access</p>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.signInTitle}>Sign In</h2>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <CustomInput
              placeholder="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <CustomInput
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
            <button type="submit" className={styles.continueButton}>
              Continue
            </button>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className={styles.continueButton}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
