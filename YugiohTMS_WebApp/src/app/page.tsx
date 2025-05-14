'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './components/sidebar';
import { Toaster, toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Swords, Flame, CalendarDays, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  const fetchAllTournaments = async () => {
    setLoadingTournaments(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/all-tournaments`);

      if (!response.ok) {
        throw new Error('Failed to fetch tournaments');
      }

      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      toast.error('Error fetching tournaments');
    } finally {
      setLoadingTournaments(false);
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        setIsLoading(false);
        fetchAllTournaments();
      }
    } catch (error) {
      console.error('Error checking token:', error);
      toast.error('An error occurred while checking authentication.');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="text-white text-center mt-20">
        <Flame className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <p className="mt-4 text-xl font-semibold">Initializing Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: 'white', border: '1px solid #3f3f3f' } }} />
      <Sidebar />
      
      <div className="flex-1 p-8 lg:p-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12">
            <Swords className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Featured Tournaments
            </h1>
          </div>

          {loadingTournaments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 bg-zinc-900 rounded-xl border border-zinc-800" />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Trophy className="w-24 h-24 text-zinc-700 mb-6" />
              <h2 className="text-2xl font-semibold text-zinc-400">No active tournaments</h2>
              <p className="text-zinc-600 mt-2">Check back later for new challenges</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament: any) => (
                <Card
                  key={tournament.iD_Tournament}
                  className="group bg-zinc-900 border-2 border-zinc-800 hover:border-red-500/50 transition-all duration-300 rounded-xl shadow-2xl cursor-pointer transform hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => router.push(`/tournaments/${tournament.iD_Tournament}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="pr-4">
                        <h2 className="text-xl font-bold text-white truncate mb-2">
                          {tournament.name}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tournament.status === 'Active' 
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {tournament.status}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                            {tournament.type}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="text-red-500 flex-shrink-0 mt-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex flex-col gap-2 text-sm text-zinc-400">
                        <div className="flex items-center">
                          <CalendarDays className="w-4 h-4 mr-2 text-red-500" />
                          <span>
                            {new Date(tournament.startDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-red-500" />
                          <span className="truncate">{tournament.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Trophy className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-sm font-medium text-red-500">
                          {tournament.winner?.username || 'Champion Seat Empty'}
                        </p>
                      </div>
                      
                      <div className="h-px bg-zinc-800 my-4" />

                      <div className="flex justify-between text-sm text-zinc-400">
                        <div>
                        </div>
                        <div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-72 bg-gradient-to-r from-red-500/20 to-transparent blur-3xl -z-10" />
      </div>
    </div>
  );
}