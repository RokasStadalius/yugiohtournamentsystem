"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, Users, Sword, X } from "lucide-react";
import toast from "react-hot-toast";
import { Sidebar } from "../components/sidebar";

type Club = {
  iD_Club: number;
  name: string;
  description: string;
  location: string;
  iD_Owner: number;
};

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({
    Name: "",
    Description: "",
    Location: ""
  });

  const fetchClubs = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/owned?userId=${userId}`
      );

      if (!response.ok) throw new Error("Failed to fetch clubs");
      const data = await response.json();
      setClubs(data);
    } catch (err) {
      setError("Failed to load clubs");
      toast.error("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newClub,
            ID_Owner: parseInt(userId)
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create club");
      }
      
      const createdClub = await response.json();
      setClubs([...clubs, createdClub]);
      setShowCreateModal(false);
      setNewClub({ Name: "", Description: "", Location: "" });
      toast.success("Club created successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Sidebar />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12">
            <Sword className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              My Clubs
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 bg-zinc-900 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center">
            <Sword className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              My Clubs
            </h1>
          </div>
          <Button 
            className="bg-red-500 hover:bg-red-600"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Club
          </Button>
        </div>

        {error ? (
          <div className="text-center py-12 text-zinc-400">
            {error} - Please try again later
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-zinc-400 mb-4">No clubs found</div>
            <Button 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Club
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Card
                key={club.iD_Club}
                className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{club.name}</h3>
                    <p className="text-red-400 text-sm">ID: {club.iD_Club}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-1 text-red-400" />
                      <span className="text-zinc-300">{club.location}</span>
                    </div>
                    
                    <div className="text-zinc-400 line-clamp-3">
                      {club.description}
                    </div>
                    
                    <div className="flex justify-between text-sm text-zinc-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Owner ID: {club.iD_Owner}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New Club</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <Label className="text-zinc-300 text-white">Club Name</Label>
                  <Input
                    value={newClub.Name}
                    onChange={(e) => setNewClub({...newClub, Name: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-zinc-300">Location</Label>
                  <Input
                    value={newClub.Location}
                    onChange={(e) => setNewClub({...newClub, Location: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-zinc-300">Description</Label>
                  <textarea
                    value={newClub.Description}
                    onChange={(e) => setNewClub({...newClub, Description: e.target.value})}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 mt-1 text-white focus:ring-2 focus:ring-red-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    Create Club
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}