import toast from "react-hot-toast";
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'; // For better typing

export const handleLogin = async (
  email: string,
  password: string,
  setError: (message: string) => void,
  router: any
) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || 'Login failed. Please try again.';
    throw new Error(errorMessage);
  }

  if (!data.token || !data.userId) {
    throw new Error('Invalid response from server. Missing token or user ID.');
  }

  // Save token here or in the page (optional)
  localStorage.setItem('token', data.token);

  return data; // Returning userId and token if needed
};

export const handleRegister = async (
  e: React.FormEvent,
  username: string,
  email: string,
  password: string,
  setError: (message: string) => void,
  router: AppRouterInstance
) => {
  e.preventDefault();
  setError(""); // Clear previous errors

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!data.token) {
      const errorMessage = 'No token received';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    localStorage.setItem('token', data.token);
    toast.success('Registration successful!');
    router.push('/');
  } catch (error: unknown) {
    console.error('Registration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error during registration.';
    setError(errorMessage);
    toast.error(errorMessage);
  }
};
