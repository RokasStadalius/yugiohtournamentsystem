"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "../../components/sidebar";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardType } from "../../components/card";
import { Sword, Shield, Plus, Flame } from "lucide-react";
import PaginatedGrid from "@/app/components/PaginatedGrid";

interface DeckCardType {
  id_DeckCard: number;
  id_Card: number;
  card: CardType;
  whichDeck: number;
}

interface DeckInfoType {
  iD_Deck: number;
  name: string;
  iD_User: number;
}

export default function DeckBuilder() {
  const params = useParams();
  const router = useRouter();
  const { deckId } = params as { deckId: string };

  const [cards, setCards] = useState<CardType[]>([]);
  const [mainDeckCards, setMainDeckCards] = useState<CardType[]>([]);
  const [extraDeckCards, setExtraDeckCards] = useState<CardType[]>([]);
  const [sideDeckCards, setSideDeckCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [searchName, setSearchName] = useState(""); // Added searchName state
  const [searchType, setSearchType] = useState(""); // Added searchType state
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [deckInfo, setDeckInfo] = useState<DeckInfoType | null>(null);
  const [selectedDeckCard, setSelectedDeckCard] = useState<CardType | null>(null);

  const extraDeckTypes = [
    "link",
    "synchro_pendulum",
    "fusion",
    "xyz",
    "xyz_pendulum",
    "synchro",
    "fusion_pendulum",
  ];

  useEffect(() => {
    if (!deckId) {
      toast.error("No deck ID provided!");
      router.push("/userdecks");
      return;
    }

    if (localStorage.getItem("token") == null) {
      toast.error("Please log in");
      router.push("/login");
      return;
    }

    fetchDeckInfo(deckId);
    fetchDeckCards(deckId);
    fetchAllCards();
  }, [deckId, router]);

  useEffect(() => {
    const handleClickOutside = () => {
      setMenuPosition(null);
      setSelectedCard(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchDeckInfo = async (deckId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Decks/${deckId}`
      );
      if (!response.ok) throw new Error("Failed to fetch deck info");
      
      const data: DeckInfoType = await response.json();
      setDeckInfo(data);

      
      const userId = localStorage.getItem("userId");
      setIsOwner(data.iD_User === parseInt(userId || "0"));
    } catch (error) {
      toast.error("Error loading deck info");
    }
  };

  const fetchDeckCards = async (deckId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Decks/decklist/${deckId}`
      );
      if (!response.ok) throw new Error("Failed to fetch deck");

      const data: DeckCardType[] = await response.json();
      const main = data
        .filter((card) => card.whichDeck === 0)
        .map((item) => item.card);
      const extra = data
        .filter((card) => card.whichDeck === 1)
        .map((item) => item.card);
      const side = data
        .filter((card) => card.whichDeck === 2)
        .map((item) => item.card);

      setMainDeckCards(main);
      setExtraDeckCards(extra);
      setSideDeckCards(side);
    } catch (error) {
      toast.error("Error loading deck cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCards = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cards/get-cards`
      );
      const data: CardType[] = await response.json();
      setCards(data);
    } catch (error) {
      toast.error("Failed to fetch available cards");
    }
  };

  const addCardToDeck = (deckType: "main" | "extra" | "side") => {
    if (!selectedCard) return;

    if (deckType === "main" && mainDeckCards.length >= 60) {
      toast.error("Main deck cannot exceed 60 cards!");
      return;
    }
    if (deckType === "extra" && extraDeckCards.length >= 15) {
      toast.error("Extra deck cannot exceed 15 cards!");
      return;
    }
    if (deckType === "side" && sideDeckCards.length >= 15) {
      toast.error("Side deck cannot exceed 15 cards!");
      return;
    }

    const totalCopies = [
      ...mainDeckCards,
      ...extraDeckCards,
      ...sideDeckCards,
    ].filter((c) => c.iD_Card === selectedCard.iD_Card).length;

    if (totalCopies >= 3) {
      toast.error("Maximum 3 copies allowed!");
      return;
    }

    switch (deckType) {
      case "main":
        setMainDeckCards((prev) => [...prev, selectedCard]);
        break;
      case "extra":
        setExtraDeckCards((prev) => [...prev, selectedCard]);
        break;
      case "side":
        setSideDeckCards((prev) => [...prev, selectedCard]);
        break;
    }

    setImageLoading((prev) => ({ ...prev, [selectedCard.iD_Card]: true }));
    setMenuPosition(null);

    const img = new window.Image();
    img.src = selectedCard.imageURL;
    img.onload = img.onerror = () => {
      setImageLoading((prev) => ({ ...prev, [selectedCard.iD_Card]: false }));
    };
  };

  const handleRemoveCard = (
    card: CardType,
    deckType: "main" | "extra" | "side",
    cardIndex: number
  ) => {
    switch (deckType) {
      case "main":
        setMainDeckCards((prev) =>
          prev.filter((_, index) => index !== cardIndex)
        );
        break;
      case "extra":
        setExtraDeckCards((prev) =>
          prev.filter((_, index) => index !== cardIndex)
        );
        break;
      case "side":
        setSideDeckCards((prev) =>
          prev.filter((_, index) => index !== cardIndex)
        );
        break;
    }
  };

  const handleSaveDeck = async () => {
    const deckCards = [
      ...mainDeckCards.map((card) => ({ ID_Card: card.iD_Card, WhichDeck: 0 })),
      ...extraDeckCards.map((card) => ({
        ID_Card: card.iD_Card,
        WhichDeck: 1,
      })),
      ...sideDeckCards.map((card) => ({ ID_Card: card.iD_Card, WhichDeck: 2 })),
    ];

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Decks/decklist/${deckId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deckCards),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      toast.success("Deck saved successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };

  const renderDeckSection = (
    cards: CardType[],
    title: string,
    deckType: "main" | "extra" | "side"
  ) => (
    <Card className="bg-zinc-900 border-2 border-zinc-800 flex-1">
      <CardHeader className="bg-zinc-800 px-2 py-1.5 border-b border-zinc-700">
        <h2 className="text-sm font-semibold text-white">
          {title}{" "}
          <span className="text-zinc-400 text-xs">({cards.length})</span>
        </h2>
      </CardHeader>
      <CardContent className="p-1 max-h-[300px] min-h-[160px] overflow-y-auto">
        <div className="grid grid-cols-10 gap-0.5">
          {cards.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-full text-zinc-500 text-xs">
              No cards in this section
            </div>
          ) : (
            cards.map((card, index) => (
              <div
                key={`${deckType}-${card.iD_Card}-${index}`}
                className={`group relative w-20 h-28 flex-shrink-0 bg-zinc-800 rounded-sm border ${
                  isOwner 
                    ? "border-zinc-700 hover:border-red-500" 
                    : "border-zinc-600 hover:border-blue-500"
                } transition-all`}
                onClick={() => {
                  if (!isOwner) setSelectedDeckCard(card);
                }}
              >
                {isOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCard(card, deckType, index);
                    }}
                    className="absolute top-0.5 right-0.5 bg-black bg-opacity-70 rounded-full text-xs text-red-500 hover:text-white w-4 h-4 flex items-center justify-center z-10"
                  >
                    ×
                  </button>
                )}

                {imageLoading[card.iD_Card] && (
                  <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center rounded-sm">
                    <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                  </div>
                )}
                <Image
                  src={card.imageURL}
                  alt={card.name}
                  width={80}
                  height={112}
                  className="rounded-t-sm object-cover w-full h-16"
                  onLoad={() =>
                    setImageLoading((prev) => ({
                      ...prev,
                      [card.iD_Card]: false,
                    }))
                  }
                  onError={() =>
                    setImageLoading((prev) => ({
                      ...prev,
                      [card.iD_Card]: false,
                    }))
                  }
                />
                <div className="p-0.5">
                  <p className="text-[0.6rem] font-medium text-zinc-200 truncate">
                    {card.name}
                  </p>
                  <span className="text-[0.5rem] text-zinc-400">
                    {card.frameType}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCardDetails = () => {
    if (!selectedDeckCard) return null;
    
    return (
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
                  src={selectedDeckCard.imageURL}
                  alt={selectedDeckCard.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">
                    {selectedDeckCard.name}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {selectedDeckCard.race} {selectedDeckCard.frameType}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg">
                  {selectedDeckCard.atk !== undefined && (
                    <div>
                      <div className="flex items-center gap-1">
                        <Sword className="w-4 h-4 text-red-400" />
                        <p className="text-sm text-zinc-400">ATK</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedDeckCard.atk}
                      </p>
                    </div>
                  )}
                  {selectedDeckCard.def !== undefined && (
                    <div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <p className="text-sm text-zinc-400">DEF</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedDeckCard.def}
                      </p>
                    </div>
                  )}
                  {selectedDeckCard.level && (
                    <div>
                      <div className="flex items-center gap-1">
                        <Image 
                          src="/level.png" 
                          alt="Level" 
                          width={15} 
                          height={15} 
                        />
                        <p className="text-sm text-zinc-400">Level</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedDeckCard.level}
                      </p>
                    </div>
                  )}
                  {selectedDeckCard.attribute && (
                    <div>
                      <p className="text-sm text-zinc-400">Attribute</p>
                      <p className="text-xl font-bold text-white">
                        {selectedDeckCard.attribute}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300 whitespace-pre-line">
                    {selectedDeckCard.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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
              <Sword className="w-8 h-8 text-red-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                {deckInfo ? deckInfo.name : "Deck Forge"}
              </h1>
              {!isOwner && (
                <span className="ml-4 px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full">
                  View Only
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-96 bg-zinc-900 rounded-xl" />
                <Skeleton className="h-96 bg-zinc-900 rounded-xl" />
                <Skeleton className="h-96 bg-zinc-900 rounded-xl" />
              </div>
            ) : (
              <div className="flex gap-8">
                {isOwner && (
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
                            items={cards.filter((card) => {
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
                            })}
                            onCardClick={(card) => setSelectedCard(card)}
                            onCardContextMenu={(card, e) => {
                              e.preventDefault();
                              setSelectedCard(card);
                              setMenuPosition({ x: e.clientX, y: e.clientY });
                            }}
                            className="h-full"
                            itemsPerPage={8}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className={`${isOwner ? "flex-1" : selectedDeckCard ? "w-2/3" : "w-full"} space-y-4`}>
                  {renderDeckSection(mainDeckCards, "Main Deck", "main")}
                  {renderDeckSection(extraDeckCards, "Extra Deck", "extra")}
                  {renderDeckSection(sideDeckCards, "Side Deck", "side")}

                  {isOwner && (
                    <Button
                      onClick={handleSaveDeck}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-md py-4"
                    >
                      Save Deck
                    </Button>
                  )}
                </div>

                {!isOwner && renderCardDetails()}
              </div>
            )}
          </div>

          <div className="absolute top-0 right-0 w-1/3 h-72 bg-gradient-to-r from-red-500/20 to-transparent blur-3xl -z-10" />
        </div>
      </div>

      {isOwner && menuPosition && selectedCard && (
        <div
          className="fixed bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-lg z-50"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <div className="flex flex-col gap-1">
            {!extraDeckTypes.includes(selectedCard.frameType.toLowerCase()) && (
              <Button
                onClick={() => {
                  addCardToDeck("main");
                  setMenuPosition(null);
                }}
                variant="ghost"
                className="text-xs h-8 px-3 justify-start hover:bg-zinc-700 text-white"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add to Main Deck
              </Button>
            )}

            {extraDeckTypes.includes(selectedCard.frameType.toLowerCase()) && (
              <Button
                onClick={() => {
                  addCardToDeck("extra");
                  setMenuPosition(null);
                }}
                variant="ghost"
                className="text-xs h-8 px-3 justify-start hover:bg-zinc-700 text-white"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add to Extra Deck
              </Button>
            )}

            <Button
              onClick={() => {
                addCardToDeck("side");
                setMenuPosition(null);
              }}
              variant="ghost"
              className="text-xs h-8 px-3 justify-start hover:bg-zinc-700 text-white"
            >
              <Plus className="w-3 h-3 mr-2" />
              Add to Side Deck
            </Button>
          </div>
        </div>
      )}
    </DndProvider>
  );
}