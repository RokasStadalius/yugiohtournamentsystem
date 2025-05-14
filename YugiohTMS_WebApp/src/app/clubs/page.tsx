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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ClubDto = {
  iD_Club: number;
  name: string;
  description: string;
  location: string;
  iD_Owner: number;
  visibility: string | null; 
};

type ClubsApiResponse = {
  clubs: ClubDto[];
};

export default function ClubsPage() {
  const router = useRouter();
  const [ownedClubs, setOwnedClubs] = useState<ClubDto[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<ClubDto[]>([]);
  const [loadingOwned, setLoadingOwned] = useState(true);
  const [loadingJoined, setLoadingJoined] = useState(true);
  const [errorOwned, setErrorOwned] = useState("");
  const [errorJoined, setErrorJoined] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({
    Name: "",
    Description: "",
    Location: "",
    Visibility: "public",
  });

  const fetchOwnedClubs = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/owned?userId=${userId}`
      );

      if (!response.ok) throw new Error("Failed to fetch owned clubs");
      const data: ClubsApiResponse = await response.json();
      console.log("Owned Clubs API Response:", data);
      console.log("Owned Clubs Array:", data.clubs);
      setOwnedClubs(data.clubs);
    } catch (err) {
      setErrorOwned("Failed to load owned clubs");
      toast.error("Failed to load owned clubs");
    } finally {
      setLoadingOwned(false);
    }
  };

  const fetchJoinedClubs = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/joined?userId=${userId}`
      );
  
      if (!response.ok) throw new Error("Failed to fetch joined clubs");
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setJoinedClubs(data);
      } 
      else if (data.clubs && Array.isArray(data.clubs)) {
        setJoinedClubs(data.clubs);
      } else {
        throw new Error("Unexpected response structure");
      }
  
    } catch (err) {
      setErrorJoined("Failed to load joined clubs");
      toast.error("Failed to load joined clubs");
    } finally {
      setLoadingJoined(false);
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
            ID_Owner: parseInt(userId),
            Visibility: newClub.Visibility.toLowerCase(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create club");
      }

      const createdClub: ClubDto = await response.json();
      setOwnedClubs([...ownedClubs, createdClub]);
      setShowCreateModal(false);
      setNewClub({ Name: "", Description: "", Location: "", Visibility: "public" });
      toast.success("Club created successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOwnedClubs();
    fetchJoinedClubs();
  }, []);

  const loadingAll = loadingOwned || loadingJoined;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
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

        {errorOwned || errorJoined ? (
          <div className="text-center py-12 text-zinc-400">
            {errorOwned || errorJoined} - Please try again later
          </div>
        ) : loadingAll ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Owned Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2].map((i) => (
                <div key={`owned-skeleton-${i}`}>
                  <Skeleton className="h-64 bg-zinc-900 rounded-xl" />
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-semibold mb-6">Joined Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={`joined-skeleton-${i}`}>
                  <Skeleton className="h-64 bg-zinc-900 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Owned Clubs</h2>
            {ownedClubs && ownedClubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {ownedClubs.map((club) => (
                  <Card
                    key={club.iD_Club}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                    onClick={() => router.push(`/clubs/${club.iD_Club}`)}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">{club.name}</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 mr-2 mt-1 text-red-400" />
                          <span className="text-zinc-300">{club.location}</span>
                        </div>
                        <div className="text-zinc-400 line-clamp-3">{club.description}</div>
                        <div className="flex justify-between text-sm text-zinc-500">
                          <span className="capitalize">{club.visibility}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400 mb-6">You haven't created any clubs yet.</div>
            )}

            <h2 className="text-2xl font-semibold mb-4">Joined Clubs</h2>
            {joinedClubs && joinedClubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedClubs.map((club) => (
                  <Card
                    key={club.iD_Club}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                    onClick={() => router.push(`/clubs/${club.iD_Club}`)}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">{club.name}</h3>
                        <p className="text-green-400 text-sm">Joined</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 mr-2 mt-1 text-red-400" />
                          <span className="text-zinc-300">{club.location}</span>
                        </div>
                        <div className="text-zinc-400 line-clamp-3">{club.description}</div>
                        <div className="flex justify-between text-sm text-zinc-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Owner ID: {club.iD_Owner}
                          </div>
                          <span className="capitalize">{club.visibility}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400">You haven't joined any clubs yet.</div>
            )}
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
                    onChange={(e) =>
                      setNewClub({ ...newClub, Name: e.target.value })
                    }
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-zinc-300">Location</Label>
                  <Input
                    value={newClub.Location}
                    onChange={(e) =>
                      setNewClub({ ...newClub, Location: e.target.value })
                    }
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-zinc-300">Description</Label>
                  <textarea
                    value={newClub.Description}
                    onChange={(e) =>
                      setNewClub({ ...newClub, Description: e.target.value })
                    }
                    className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 mt-1 text-white focus:ring-2 focus:ring-red-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label className="text-zinc-300">Visibility</Label>
                  <Select
                    value={newClub.Visibility}
                    onValueChange={(value) =>
                      setNewClub({ ...newClub, Visibility: value })
                    }
                  >
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 mt-1 text-white focus:ring-2 focus:ring-red-500">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
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