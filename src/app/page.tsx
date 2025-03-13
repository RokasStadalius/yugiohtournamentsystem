'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './components/sidebar';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token == null) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking token:', error);
      toast.error('An error occurred while checking authentication.');
    }
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar />
    </div>
  );
}
