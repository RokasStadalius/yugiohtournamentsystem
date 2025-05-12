"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "../components/sidebar";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardType } from "../components/card";
import { Sword, Shield, Flame } from "lucide-react";
import PaginatedGrid from "@/app/components/PaginatedGrid";
import { GiCardPick } from 'react-icons/gi';

export default function CardLibrary() {
  const router = useRouter();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      toast.error("Please log in");
      router.push("/login");
      return;
    }
    fetchAllCards();
  }, []);

  const fetchAllCards = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cards/get-cards`
      );
      if (!response.ok) throw new Error("Failed to fetch cards");
      const data: CardType[] = await response.json();
      setCards(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch available cards");
      setLoading(false);
    }
  };

  const handleCardContextMenu = (card: CardType) => {
    console.log("Context menu for card:", card);
  };

  const filteredCards = cards.filter((card) => {
    const nameMatch = card.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const typeMatch =
      searchType === "" ||
      (searchType === "normal" && card.frameType.includes("normal")) ||
      (searchType === "effect" && card.frameType.includes("effect")) ||
      (searchType === "spell" && card.frameType === "Spell Card") ||
      (searchType === "trap" && card.frameType === "Trap Card") ||
      card.frameType.toLowerCase().includes(searchType.toLowerCase());
    return nameMatch && typeMatch;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />
        <Toaster
          position="top-right"
          toastOptions={{ style: { background: "#1a1a1a", color: "white" } }}
        />

        <div className="flex-1 p-8 lg:p-12 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-12">
              <GiCardPick className="w-8 h-8 text-red-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Card Database
              </h1>
            </div>

            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-96 bg-zinc-900 rounded-xl" />
                <Skeleton className="h-96 bg-zinc-900 rounded-xl" />
                <Skeleton className="h-96 bg-zinc-900 rounded-xl" />
              </div>
            ) : (
              <div className="flex gap-8">
                <div className="w-80 flex-shrink-0 sticky top-4 h-[calc(100vh-2rem)]">
                  <Card className="bg-zinc-900 border-2 border-zinc-800 h-full">
                    <CardHeader className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                          <Shield className="w-5 h-5" /> Card Library
                        </h2>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                          />
                          <select
                            className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                          >
                            <option value="">All Types</option>
                            <option value="normal">Normal Monster</option>
                            <option value="effect">Effect Monster</option>
                            <option value="spell">Spell</option>
                            <option value="trap">Trap</option>
                            <option value="xyz">XYZ</option>
                            <option value="synchro">Synchro</option>
                            <option value="fusion">Fusion</option>
                            <option value="link">Link</option>
                            <option value="pendulum">Pendulum</option>
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 h-[calc(100%-180px)] min-h-0 flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <PaginatedGrid
                          items={filteredCards}
                          onCardClick={(card) => setSelectedCard(card)}
                          onCardContextMenu={handleCardContextMenu}
                          className="h-full"
                          itemsPerPage={8}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedCard && (
                  <div className="flex-1 max-w-2xl sticky top-4 h-[calc(100vh-2rem)]">
                    <Card className="bg-zinc-900 border-2 border-zinc-800 h-full">
                      <CardHeader className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                          <Flame className="w-5 h-5 text-orange-500" />
                          Card Details
                        </h2>
                      </CardHeader>
                      <CardContent className="p-6 h-[calc(100%-80px)] overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="relative aspect-[421/614] rounded-lg overflow-hidden border-2 border-zinc-700">
                            <Image
                              src={selectedCard.imageURL}
                              alt={selectedCard.name}
                              fill
                              className="object-cover"
                              priority
                            />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-2xl font-bold text-red-400 mb-2">
                                {selectedCard.name}
                              </h3>
                              <p className="text-sm text-zinc-400">
                                {selectedCard.race} {selectedCard.frameType}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg">
                              {selectedCard.atk !== undefined && (
                                <div>
                                  <div className="flex items-center gap-1">
                                    <Sword className="w-4 h-4 text-red-400" />
                                    <p className="text-sm text-zinc-400">ATK</p>
                                  </div>
                                  <p className="text-xl font-bold text-white">
                                    {selectedCard.atk}
                                  </p>
                                </div>
                              )}
                              {selectedCard.def !== undefined && (
                                <div>
                                  <div className="flex items-center gap-1">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                    <p className="text-sm text-zinc-400">DEF</p>
                                  </div>
                                  <p className="text-xl font-bold text-white">
                                    {selectedCard.def}
                                  </p>
                                </div>
                              )}
                              {selectedCard.level && (
                                <div>
                                    <div className="flex items-center gap-1">
                                        <Image src={"/level.png"} alt={""} width={"15"} height={"15"}></Image>
                                        <p className="text-sm text-zinc-400">Level</p>
                                    </div>
                                  
                                  <p className="text-xl font-bold text-white">
                                    {selectedCard.level}
                                  </p>
                                </div>
                              )}
                              {selectedCard.attribute && (
                                <div>
                                  <p className="text-sm text-zinc-400">
                                    Attribute
                                  </p>
                                  <p className="text-xl font-bold text-white">
                                    {selectedCard.attribute}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-zinc-300 whitespace-pre-line">
                                {selectedCard.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
