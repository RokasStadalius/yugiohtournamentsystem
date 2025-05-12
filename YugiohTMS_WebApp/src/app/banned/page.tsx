'use client';

import { useEffect } from 'react';
import { deleteCookie } from 'cookies-next';

export default function BannedPage() {
  useEffect(() => {
    const checkBanStatus = () => {
      const isBanned = document.cookie.includes('isBanned=1');
      if (!isBanned) {
        window.location.href = '/';
      }
    };
    
    checkBanStatus();
    const interval = setInterval(checkBanStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 
      ${process.env.NEXT_PUBLIC_FONT_SANS_VARIABLE} 
      ${process.env.NEXT_PUBLIC_FONT_MONO_VARIABLE} 
      antialiased text-center bg-black`}
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Account Banned
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Your account has been suspended due to violations of our terms of service.
        </p>
        <div className="space-y-4">
          <p className="text-gray-400">
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}