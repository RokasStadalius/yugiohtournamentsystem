'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './components/sidebar';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('token'); // Assuming you store the JWT token in localStorage
    if (!token) {
      // Redirect to the login page if the user is not authenticated
      router.push('/login');
    } else {
      setIsLoading(false); // User is authenticated, stop loading
    }
  }, [router]);

  // Show a loading indicator while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If the user is authenticated, render the home page with the Sidebar
  return (
    <div>
      <Sidebar />
    </div>
  );
}