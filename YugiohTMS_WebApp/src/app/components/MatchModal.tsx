"use client";

import { useState } from "react";
import { Seed } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MatchModalProps {
  open: boolean;
  match: Seed | null;
  onClose: () => void;
  onAssignWinner: (winnerId: number) => void;
}

const MatchModal = ({ open, match, onClose, onAssignWinner }: MatchModalProps) => {
  const [selectedWinner, setSelectedWinner] = useState<string>("");

  const handleSubmit = () => {
    if (selectedWinner && match) {
      onAssignWinner(Number(selectedWinner));
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-2 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Select Match Winner</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Choose the winning team for this match
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <RadioGroup
            value={selectedWinner}
            onValueChange={setSelectedWinner}
            className="space-y-2"
          >
            {match?.teams.map((team) => {
              if (!team.id) return null;
              
              const teamId = team.id.toString();
              
              return (
                <div key={teamId} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={teamId}
                    id={teamId}
                    className="text-red-500 border-zinc-600"
                  />
                  <Label
                    htmlFor={teamId}
                    className="text-sm font-medium text-zinc-300"
                  >
                    {team.name}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedWinner}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Assign Winner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;