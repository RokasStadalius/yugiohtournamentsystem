'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Sidebar } from '../components/sidebar';
import { CustomInput } from '../components/CustomInput';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Trophy, Plus, Sword, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserTournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [newTournamentName, setNewTournamentName] = useState('');
  const [newTournamentType, setNewTournamentType] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userIdFromStorage = localStorage.getItem('userId');

    if (!token || !userIdFromStorage) {
      toast.error('You need to be logged in!');
      router.push('/login');
      return;
    }

    setUserId(userIdFromStorage);
    fetchUserTournaments(userIdFromStorage);
  }, [router]);

  const fetchUserTournaments = async (userId: string) => {
    setLoading(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/user/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tournaments');
    }

    const data = await response.json();
    setTournaments(data);
    setLoading(false);
  };

  const handleCreateTournament = async () => {
    if (!newTournamentName.trim() || !newTournamentType.trim()) {
      toast.error('Tournament information must be filled in');
      return;
    }

    setCreating(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/create-tournament`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newTournamentName,
        type: newTournamentType,
        id_User: parseInt(userId),
        status: 'NotStarted',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Created tournament failed response text:', text);
      throw new Error('Failed to create tournament');
    }

    toast.success('Tournament created successfully!');
    setNewTournamentName('');
    fetchUserTournaments(userId);
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: 'white', border: '1px solid #3f3f3f' } }} />
      
      <div className="flex-1 p-8 lg:p-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12">
            <Sword className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Your Tournaments
            </h1>
          </div>

          <Card className="bg-zinc-900 border-2 border-zinc-800 mb-12">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <Plus className="w-6 h-6 text-red-500 mr-2" />
                <h2 className="text-xl font-semibold text-white">Create A New Tournament</h2>
              </div>
              <div className="space-y-4">
                <CustomInput
                  type="text"
                  placeholder="Tournament Name"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 focus:ring-red-500"
                />
                <select
                  value={newTournamentType}
                  onChange={(e) => setNewTournamentType(e.target.value)}
                  className="w-full border border-zinc-700 bg-zinc-800 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="">Select Tournament Format</option>
                  <option value="Single Elimination">Single Elimination</option>
                  <option value="Round Robin">Round Robin</option>
                  <option value="Swiss">Swiss Stage</option>
                </select>
                <Button 
                  onClick={handleCreateTournament}
                  disabled={creating}
                  className="w-full bg-red-600 hover:bg-red-700 transition-transform hover:scale-[1.02]"
                >
                  {creating ? 'Fetching tournaments...' : 'Create tournament'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 bg-zinc-900 rounded-xl border-2 border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <Skull className="w-24 h-24 text-zinc-700 mb-6" />
              <h2 className="text-2xl font-semibold text-zinc-400">No tournaments found.</h2>
              <p className="text-zinc-600 mt-2">Create your first tournament above</p>
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
                      <div className="flex items-center">
                        <Trophy className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-sm font-medium text-white">
                          {tournament.winner?.username || 'Unclaimed Glory'}
                        </p>
                      </div>
                      
                      <div className="h-px bg-zinc-800 my-4" />
                      <div className="flex justify-between text-sm text-zinc-400">
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
