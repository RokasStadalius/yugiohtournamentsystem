'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Crown, Flame, Trophy, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '../components/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface User {
  iD_User: number;
  username: string;
  email: string;
  rating: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error("User ID not available.");
        toast.error("Could not retrieve user ID.");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Users/me`, {
        method: 'POST', // Changed to POST
        headers: {
          'Content-Type': 'application/json', // Still important to indicate JSON
        },
        body: JSON.stringify(userId), // Send the raw userId as JSON
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current user data');
      }

      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      console.error('Error fetching current user:', error);
      toast.error('Failed to load your ranking details.');
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Users/leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      const data: User[] = await response.json();
      // Add ranking based on the sorted order
      const rankedLeaderboard = data.map((user, index) => ({ ...user, Ranking: index + 1 }));
      setLeaderboard(rankedLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load the leaderboard.');
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
      fetchCurrentUser();
      fetchLeaderboard();
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="text-white text-center mt-20">
        <Zap className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />
        <p className="mt-4 text-xl font-semibold">Powering Up Leaderboard...</p>
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
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Champions Leaderboard
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-zinc-300">Your Standings</h2>
            <Card className="bg-zinc-900 border-2 border-zinc-800 hover:border-yellow-500/50 transition-colors group">
              <CardContent className="p-6">
                {currentUser ? (
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Trophy className="w-12 h-12 text-yellow-500" />
                      <span className="absolute -bottom-1 -right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                        #{leaderboard.findIndex(u => u.iD_User === currentUser.iD_User) + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{currentUser.username}</h3>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="text-lg font-semibold text-yellow-500">{currentUser.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Flame className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-green-500">{currentUser.tournamentsPlayed}</span>
                          <span className="mx-2 text-zinc-500">|</span>
                          <Crown className="w-5 h-5 text-orange-500 mr-2" />
                          <span className="text-orange-500">{currentUser.tournamentsWon}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="w-full h-16 bg-zinc-800 rounded-md" />
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-zinc-300">Global Rankings</h2>
            {loadingLeaderboard ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 bg-zinc-900 rounded-lg border border-zinc-800" />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900 border-2 border-zinc-800 overflow-hidden">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2 border-zinc-800">
                      <TableHead className="text-zinc-400 py-5 px-6">Rank</TableHead>
                      <TableHead className="text-zinc-400 py-5 px-6">Player</TableHead>
                      <TableHead className="text-zinc-400 py-5 px-6">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                          Rating
                        </div>
                      </TableHead>
                      <TableHead className="text-zinc-400 py-5 px-6">
                        <div className="flex items-center">
                          <Flame className="w-4 h-4 mr-2 text-green-500" />
                          Played
                        </div>
                      </TableHead>
                      <TableHead className="text-zinc-400 py-5 px-6">
                        <div className="flex items-center">
                          <Crown className="w-4 h-4 mr-2 text-orange-500" />
                          Won
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((user, index) => (
                      <TableRow 
                        key={user.iD_User} 
                        className="border-b-2 border-zinc-800 hover:bg-zinc-800/20 cursor-pointer transition-colors"
                      >
                        <TableCell className="py-4 px-6 font-medium">
                          <span className="text-zinc-400">#{index + 1}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6 font-semibold text-white">
                          {user.username}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-yellow-500 font-medium">
                          {user.rating}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-green-500">
                          {user.tournamentsPlayed}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-orange-500 font-medium">
                          {user.tournamentsWon}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-72 bg-gradient-to-r from-yellow-500/20 to-transparent blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-1/3 h-72 bg-gradient-to-l from-orange-500/20 to-transparent blur-3xl -z-10" />
      </div>
    </div>
  );
}