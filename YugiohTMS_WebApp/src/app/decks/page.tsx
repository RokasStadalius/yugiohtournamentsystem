'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Sidebar } from '../components/sidebar';
import { CustomInput } from '../components/CustomInput';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sword, Shield, Plus, Flame } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserDecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [newDeckName, setNewDeckName] = useState('');
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
    fetchUserDecks(userIdFromStorage);
  }, [router]);

  const fetchUserDecks = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Decks/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch decks');
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      toast.error('Error loading decks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeckClick = (deckId: number) => {
    router.push(`/deckbuilder/${deckId}`);
  };

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      toast.error('Deck name cannot be empty!');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Decks/create-deck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeckName,
          id_User: parseInt(userId),
        }),
      });

      if (!response.ok) throw new Error('Failed to create deck');
      
      toast.success('Deck created successfully!');
      setNewDeckName('');
      fetchUserDecks(userId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Creation failed');
    } finally {
      setCreating(false);
    }
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
              Your Decks
            </h1>
          </div>

          <Card className="bg-zinc-900 border-2 border-zinc-800 mb-12">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <Plus className="w-6 h-6 text-red-500 mr-2" />
                <h2 className="text-xl font-semibold text-white">Forge New Deck</h2>
              </div>
              <div className="flex flex-col space-y-4">
                <CustomInput
                  type="text"
                  placeholder="Deck Name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 focus:ring-red-500"
                />
                <Button 
                  onClick={handleCreateDeck}
                  disabled={creating}
                  className="bg-red-600 hover:bg-red-700 transition-transform hover:scale-[1.02]"
                >
                  {creating ? 'Crafting...' : 'Create Deck'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 bg-zinc-900 rounded-xl border-2 border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : decks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <Shield className="w-24 h-24 text-zinc-700 mb-6" />
              <h2 className="text-2xl font-semibold text-zinc-400">No Decks Forged</h2>
              <p className="text-zinc-600 mt-2">Create your first deck above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck: any) => (
                <Card
                  key={deck.iD_Deck}
                  className="group bg-zinc-900 border-2 border-zinc-800 hover:border-red-500/50 transition-all duration-300 rounded-xl shadow-2xl cursor-pointer transform hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => handleDeckClick(deck.iD_Deck)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white truncate">
                          {deck.name}
                        </h2>
                        <p className="text-sm text-zinc-400 mt-2">Deck ID: {deck.iD_Deck}</p>
                      </div>
                      <Sword className="text-red-500 flex-shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center text-sm text-zinc-400">
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