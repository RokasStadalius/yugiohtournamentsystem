"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ScrollableList from "../../components/ScrollableList";
import { Sidebar } from "../../components/sidebar";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import type { CardType } from "../../components/card"; // Match ScrollableList

interface DeckCardType {
  id_DeckCard: number;
  id_Card: number;
  card: CardType;
  whichDeck: number; // 0 = Main, 1 = Extra, 2 = Side
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
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});

  const extraDeckTypes = [
    "link",
    "synchro_pendulum",
    "fusion",
    "xyz",
    "xyz_pendulum",
    "synchro",
    "fusion_pendulum"
  ];

  useEffect(() => {
    if (!deckId) {
      toast.error("No deck ID provided!");
      router.push("/userdecks");
      return;
    }

    fetchDeckCards(deckId);
    fetchAllCards();
  }, [deckId, router]);

  const fetchDeckCards = async (deckId: string) => {
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Decks/decklist/${deckId}`);

      if (!response.ok) {
        const message = await response.text();
        toast.error(`Error fetching deck: ${message}`);
        setLoading(false);
        return;
      }

      const data: DeckCardType[] = await response.json();

      const main = data.filter((card) => card.whichDeck === 0).map((item) => item.card);
      const extra = data.filter((card) => card.whichDeck === 1).map((item) => item.card);
      const side = data.filter((card) => card.whichDeck === 2).map((item) => item.card);

      setMainDeckCards(main);
      setExtraDeckCards(extra);
      setSideDeckCards(side);

    } catch {
      toast.error("Failed to fetch deck cards.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCards = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards/get-cards`);
      const data: CardType[] = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Error fetching card list:", error);
      toast.error("Failed to fetch available cards.");
    }
  };

  const handleCardClick = (card: CardType) => {
    const isExtraDeck = extraDeckTypes.includes(card.frameType.toLowerCase());

    const alreadyInMain = mainDeckCards.find((c) => c.iD_Card === card.iD_Card);
    const alreadyInExtra = extraDeckCards.find((c) => c.iD_Card === card.iD_Card);
    const alreadyInSide = sideDeckCards.find((c) => c.iD_Card === card.iD_Card);

    if (alreadyInMain || alreadyInExtra || alreadyInSide) {
      toast.error("Card already added to deck!");
      return;
    }

    if (isExtraDeck) {
      setExtraDeckCards((prev) => [...prev, card]);
    } else {
      setMainDeckCards((prev) => [...prev, card]);
    }

    setImageLoading((prev) => ({ ...prev, [card.iD_Card]: true }));

    const img = new window.Image();
    img.src = card.imageURL;

    img.onload = () => {
      setImageLoading((prev) => ({ ...prev, [card.iD_Card]: false }));
    };

    img.onerror = () => {
      console.error("Failed to load image:", card.imageURL);
      setImageLoading((prev) => ({ ...prev, [card.iD_Card]: false }));
    };
  };

  const handleSaveDeck = async () => {
    const deckCards = [
      ...mainDeckCards.map((card) => ({
        ID_Card: card.iD_Card,
        WhichDeck: 0
      })),
      ...extraDeckCards.map((card) => ({
        ID_Card: card.iD_Card,
        WhichDeck: 1
      })),
      ...sideDeckCards.map((card) => ({
        ID_Card: card.iD_Card,
        WhichDeck: 2
      })),
    ];

    if (deckCards.length === 0) {
      toast.error("Your deck is empty! Add some cards first.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Decks/decklist/${deckId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(deckCards)
        }
      );

      if (!response.ok) {
        const message = await response.text();
        toast.error(`Failed to save deck: ${message}`);
        return;
      }

      toast.success("Deck saved successfully!");
    } catch (error) {
      console.error("Error saving deck:", error);
      toast.error("An error occurred while saving the deck.");
    }
  };

  const renderDeckSection = (cards: CardType[], title: string, bgColor: string) => (
    <div style={{ marginTop: "40px" }}>
      <h2>{title}</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "10px",
          border: "2px solid #ccc",
          borderRadius: "10px",
          minHeight: "150px",
          marginTop: "20px",
          background: bgColor
        }}
      >
        {cards.length === 0 ? (
          <p>No cards in this section.</p>
        ) : (
          cards.map((card, index) => (
            <div
              key={`${title}-${card.iD_Card}-${index}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#fff",
                width: "150px", // wider container
                height: "240px", // taller container
                position: "relative"
              }}
            >
              {imageLoading[card.iD_Card] && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  Loading...
                </div>
              )}

              <Image
                src={card.imageURL}
                alt={card.name}
                width={120}      // image width
                height={160}     // image height
                onLoad={() => handleImageLoad(card.iD_Card)}
                onError={() => handleImageError(card.iD_Card)}
                style={{
                  borderRadius: "5px",
                  objectFit: "contain",
                  width: "120px",
                  height: "160px",
                  opacity: imageLoading[card.iD_Card] ? 0.3 : 1,
                  transition: "opacity 0.3s ease-in-out"
                }}
              />

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginTop: "10px",
                  textAlign: "center",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  maxWidth: "100%"
                }}
              >
                {card.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const handleImageLoad = (id: number) => {
    setImageLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageError = (id: number) => {
    setImageLoading((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ marginLeft: "220px", padding: "20px", width: "100%" }}>
          <Toaster position="top-right" />

          <div style={{
            display: "flex",
            marginBottom: "20px",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h1>Deck Builder</h1>
          </div>

          {loading ? (
            <p>Loading deck cards...</p>
          ) : (
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <div style={{ width: "300px", marginRight: "20px" }}>
                <h2>All Cards</h2>
                <ScrollableList items={cards} onCardClick={handleCardClick} />

                <button
                  onClick={handleSaveDeck}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginTop: "10px"
                  }}
                >
                  Save Deck
                </button>
              </div>

              <div style={{ flex: 1 }}>
                {renderDeckSection(mainDeckCards, "Main Deck Cards", "#d4fcd4")}
                {renderDeckSection(extraDeckCards, "Extra Deck Cards", "#d4e1fc")}
                {renderDeckSection(sideDeckCards, "Side Deck Cards", "#fcd4d4")}
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
