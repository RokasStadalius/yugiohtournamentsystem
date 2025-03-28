'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './components/sidebar';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);


  const fetchAllTournaments = async () => {

    setLoadingTournaments(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/all-tournaments`);

    if (!response.ok) {
      throw new Error('Failed to fetch tournaments');
    }

    const data = await response.json();

    setTournaments(data);
    setLoadingTournaments(false);
  }


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

    fetchAllTournaments();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="m-6">
        {loadingTournaments ? (
            <p>Loading...</p>
          ) : tournaments.length === 0 ? (
            <p style={{ marginTop: 50 }}>No active  tournaments found.</p>
          ) : (
            <ul className="space-y-4">
              {tournaments.map((tournament: any) => (
                <li
                  key={tournament.iD_Tournament}
                  className="border p-4 rounded-lg cursor-pointer hover:shadow-md transition"
                >
                  <h2 className="text-xl font-semibold">{tournament.name}</h2>
                  <p className="text-gray-600">Tournament ID: {tournament.iD_Tournament}</p>
                  <p className= "text-gray-600">Tournament type: {tournament.type}</p>
                </li>
              ))}
            </ul>
          )}
      </div>
      
    </div>
  );
}
