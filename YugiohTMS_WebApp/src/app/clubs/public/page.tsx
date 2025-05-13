"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Sword } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/app/components/sidebar";

type ClubDto = {
  iD_Club: number;
  name: string;
  description: string;
  location: string;
  iD_Owner: number;
  visibility: string | null;
};


export default function PublicClubsPage() {
  const [publicClubs, setPublicClubs] = useState<ClubDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchPublicClubs = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/public`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch public clubs");
      }


      const data: ClubDto[] = await response.json();
      setPublicClubs(data)
      console.log(data)
    } catch (err: any) {
      setError("Failed to load public clubs");
      console.error("Error fetching public clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicClubs();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Sidebar/>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Sword className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Public Clubs
          </h1>
        </div>

        {error ? (
          <div className="text-center py-12 text-zinc-400">{error}</div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={`public-skeleton-${i}`}>
                <Skeleton className="h-64 bg-zinc-900 rounded-xl" />
              </div>
            ))}
          </div>
        ) : publicClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicClubs.map((club) => (
              <Card
                key={club.iD_Club}
                className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                onClick={() => router.push(`/clubs/${club.iD_Club}`)}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{club.name}</h3>
                    <p className="text-blue-400 text-sm">Public Club</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-1 text-blue-400" />
                      <span className="text-zinc-300">{club.location}</span>
                    </div>
                    <div className="text-zinc-400 line-clamp-3">{club.description}</div>
                    <div className="flex justify-between text-sm text-zinc-500">
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-400">No public clubs available yet.</div>
        )}
      </div>
    </div>
  );
}