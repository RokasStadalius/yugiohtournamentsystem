'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/Login.module.css';
import { CustomInput } from '../components/CustomInput';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token); // Store the JWT token
            router.push('/home'); // Redirect to dashboard or home page
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                {/* Left Section */}
                <div className={styles.welcomeSection}>
                    <div className={styles.logo}>
                        <h1>LOGO</h1>
                    </div>
                    <h2>Welcome Page</h2>
                    <p>Sign in to continue access</p>
                    <a href="#" className={styles.websiteLink}>www.yoursite.com</a>
                </div>

                {/* Right Section */}
                <div className={styles.formSection}>
                    <h2 className={styles.signInTitle}>Sign In</h2>
                    <form className={styles.loginForm} onSubmit={handleLogin}>
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
                        <button type="button" onClick={() => router.push('/register')} className={styles.continueButton}>
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}