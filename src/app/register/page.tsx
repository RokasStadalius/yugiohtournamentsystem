'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/Register.module.css';
import { CustomInput } from '../components/CustomInput';

export default function Register() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:5042/api/Auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token); // Store the JWT token
            router.push('/login'); // Redirect to dashboard or home page
        } catch (err) {
            setError('Registration failed. Please try again.');
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
                    <p>Sign Up</p>
                    <a href="#" className={styles.websiteLink}>www.yoursite.com</a>
                </div>

                {/* Right Section */}
                <div className={styles.formSection}>
                    <h2 className={styles.signInTitle}>Sign Up</h2>
                    <form className={styles.loginForm} onSubmit={handleRegister}>
                      <CustomInput
                        placeholder='Username'
                        type='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        
                      ></CustomInput>
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