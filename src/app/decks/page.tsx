'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Sidebar } from '../components/sidebar';
import { CustomInput } from '../components/CustomInput'; // Assuming path is correct

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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Decks/user/${userId}`);

    console.log('Fetch Decks Response:', response);

    if (!response.ok) {
      const text = await response.text();
      throw new Error('Failed to fetch decks');
    }

    const data = await response.json();

    setDecks(data);
    setLoading(false);
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Decks/create-deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newDeckName,
        id_User: parseInt(userId), // Ensure this matches backend model
      }),
    });

    console.log('Create Deck Response:', response);

    if (!response.ok) {
      const text = await response.text();
      console.error('Create deck failed response text:', text);
      throw new Error('Failed to create deck');
    }

    toast.success('Deck created successfully!');
    setNewDeckName('');
    fetchUserDecks(userId);
    setCreating(false);
  };

  return (
    <div className="p-8">
      <Sidebar />
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6">Your Decks</h1>

      {/* Create New Deck Form */}
      <div className="mb-8 p-4 border rounded-lg bg-white shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create a New Deck</h2>
        <div className="flex flex-col space-y-4">
          <CustomInput
            type="text"
            placeholder="Enter Deck Name"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
          />
          <button
            onClick={handleCreateDeck}
            disabled={creating}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Deck'}
          </button>
        </div>
      </div>

      {/* Deck List */}
      {loading ? (
        <p>Loading...</p>
      ) : decks.length === 0 ? (
        <p style={{ marginTop: 50 }}>No decks found. Start by creating one!</p>
      ) : (
        <ul className="space-y-4">
          {decks.map((deck: any) => (
            <li
              key={deck.iD_Deck}
              className="border p-4 rounded-lg cursor-pointer hover:shadow-md transition"
              onClick={() => handleDeckClick(deck.iD_Deck)}
            >
              <h2 className="text-xl font-semibold">{deck.name}</h2>
              <p className="text-gray-600">Deck ID: {deck.iD_Deck}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
