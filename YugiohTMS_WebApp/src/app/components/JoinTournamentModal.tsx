"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DeckType {
  iD_Deck: number;
  name: string;
}

interface ValidationResult {
  isValid: boolean;
  violations: string[];
  mainDeckCount: number;
  extraDeckCount: number;
  sideDeckCount: number;
}

const JoinTournamentModal = ({
  open,
  onClose,
  tournamentId,
  onJoin,
}: {
  open: boolean;
  onClose: () => void;
  tournamentId: string;
  onJoin: (deckId: number) => Promise<void>;
}) => {
  const [decks, setDecks] = useState<DeckType[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<number>();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/decks/user/${userId}`
        );
        const data = await response.json();
        setDecks(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Failed to load decks");
        setDecks([]);
      }
    };

    if (open) {
      fetchDecks();
      setSelectedDeck(undefined);
      setValidationResult(null);
    }
  }, [open]);

  const handleValidateDeck = async () => {
    if (!selectedDeck) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/decks/validate-deck/${selectedDeck}`
      );
      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      toast.error("Deck validation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-2 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Select Tournament Deck</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Choose and validate a deck to join the tournament
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            value={selectedDeck?.toString() || ""}
            onValueChange={(value: any) => setSelectedDeck(Number(value))}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Select a deck" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {decks.map((deck) => (
                <SelectItem
                  key={deck.iD_Deck}
                  value={deck.iD_Deck.toString()}
                  className="hover:bg-zinc-700 text-zinc-300"
                >
                  {deck.name} (ID: {deck.iD_Deck})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDeck && (
            <div className="space-y-4">
              <Button
                onClick={handleValidateDeck}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Deck"
                )}
              </Button>

              {validationResult && (
                <div className="space-y-3 p-4 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                      {validationResult.isValid ? "✅ Valid Deck" : "❌ Invalid Deck"}
                    </span>
                    <span className="text-zinc-400 text-sm">
                      (Main: {validationResult.mainDeckCount}, Extra: {validationResult.extraDeckCount}, Side: {validationResult.sideDeckCount})
                    </span>
                  </div>

                  {!validationResult.isValid && (
                    <ScrollArea className="h-32 rounded-md border border-zinc-700 p-2">
                      {validationResult.violations.map((violation, index) => (
                        <p key={index} className="text-red-400 text-sm">
                          {violation}
                        </p>
                      ))}
                    </ScrollArea>
                  )}

                  <Button
                    onClick={() => onJoin(selectedDeck)}
                    disabled={!validationResult.isValid || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Join Tournament
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTournamentModal;