'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCookie } from 'cookies-next';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const isBanned = getCookie('isBanned') === '1';
    const currentPath = window.location.pathname;

    if (isBanned && currentPath !== '/banned') {
      router.replace('/banned');
    }
  }, [router]);

  return <>{children}</>;
}