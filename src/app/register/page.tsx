'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/Register.module.css';
import { CustomInput } from '../components/CustomInput';
import { handleRegister } from '../../utils/auth';
import toast, { Toaster } from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // move this here to ensure form doesn't refresh
    try {
      handleRegister(e, username, email, password, setError, router);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.loginBox}>
        {/* Left Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.logo}>
            <h1>LOGO</h1>
          </div>
          <h2>Welcome Page</h2>
          <p>Sign Up</p>
          <a href="#" className={styles.websiteLink}>
            www.yoursite.com
          </a>
        </div>

        {/* Right Section */}
        <div className={styles.formSection}>
          <h2 className={styles.signInTitle}>Sign Up</h2>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <CustomInput
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
