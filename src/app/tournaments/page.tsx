'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import toast, {Toaster} from 'react-hot-toast';
import {Sidebar} from '../components/sidebar';
import {CustomInput} from '../components/CustomInput';

export default function UserTournamentsPage(){
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
        if(!newTournamentName.trim() || !newTournamentType.trim()){
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
        <div className="p-8">
          <Sidebar />
          <Toaster position="top-right" />
    
          <h1 className="text-2xl font-bold mb-6 mt-20">Your Tournaments</h1>
    
          <div className="mb-8 p-4 border rounded-lg bg-white shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create a New Tournament</h2>
            <div className="flex flex-col space-y-4">
              <CustomInput
                type="text"
                placeholder="Enter Tournament Name"
                value={newTournamentName}
                onChange={(e) => setNewTournamentName(e.target.value)}
              />
              <select
                value={newTournamentType}
                onChange={(e) => setNewTournamentType(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="">Select Tournament Type</option>
                <option value="Single Elimination">Single Elimination</option>
                <option value="Double Elimination">Double Elimination</option>
                <option value="Round Robin">Round Robin</option>
                <option value="Swiss">Swiss</option>
              </select>
              <button
                onClick={handleCreateTournament}
                disabled={creating}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </div>
    
          {loading ? (
            <p>Loading...</p>
          ) : tournaments.length === 0 ? (
            <p style={{ marginTop: 50 }}>No Tournaments found. Start by creating one!</p>
          ) : (
            <ul className="space-y-4">
              {tournaments.map((tournament: any) => (
                <li
                  key={tournament.iD_Tournament}
                  className="border p-4 rounded-lg cursor-pointer hover:shadow-md transition"
                  //onClick={() => handleDeckClick(deck.iD_Deck)} //TODO: Kai reikes onClick
                >
                  <h2 className="text-xl font-semibold">{tournament.name}</h2>
                  <p className="text-gray-600">Tournament ID: {tournament.iD_Tournament}</p>
                  <p className= "text-gray-600">Tournament type: {tournament.type}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

}