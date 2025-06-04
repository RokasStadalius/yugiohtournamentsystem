"use client";

import { Bracket, IRoundProps, Seed, SeedItem } from "react-brackets";
import { Round } from "../types";
import { toast } from "react-hot-toast";

interface SingleEliminationBracketProps {
  rounds: Round[];
  onMatchClick: (match: Round['seeds'][number]) => void;
  isOwner: boolean;
  tournamentStatus: "NotStarted" | "InProgress" | "Completed"; // Add tournament status
}


const SingleEliminationBracket = ({ 
  rounds, 
  onMatchClick, 
  isOwner,
  tournamentStatus 
}: SingleEliminationBracketProps) => {
  const formattedRounds: IRoundProps[] = rounds.map((round) => ({
    title: round.title,
    seeds: round.seeds.map(seed => ({
      ...seed,
      teams: seed.teams.map(team => ({
        name: team.name,
        id: Number(team.id)
      })),
      id: seed.id 
    }))
  }));

  const validateBracket = () => {
    const allIds = formattedRounds.flatMap(round => 
      round.seeds.map(seed => seed.id)
    );
    return new Set(allIds).size === allIds.length;
  };

  if (!validateBracket()) {
    toast.error("Invalid bracket structure detected!");
    return <div className="text-red-500 p-4">Bracket rendering error</div>;
  }

  return (
    <div className="overflow-x-auto py-4">
      <Bracket 
        rounds={formattedRounds}
        renderSeedComponent={({ seed, breakpoint, roundIndex }) => {
          const originalSeed = rounds
            .flatMap(round => round.seeds)
            .find(s => s.id === seed.id);
            
          // Determine if match is clickable
          const isClickable = isOwner && 
                              tournamentStatus === "InProgress" && 
                              seed.status !== "Completed";

          return (
            <Seed mobileBreakpoint={breakpoint}>
              <SeedItem>
                <div 
                  className={`p-4 min-w-[220px] rounded-lg border-2 transition-all ${
                    seed.status === "Completed" 
                      ? 'border-zinc-700 bg-zinc-800/50' 
                      : isClickable
                        ? 'border-red-500/30 hover:border-red-500/50 bg-zinc-800 cursor-pointer'
                        : 'border-zinc-600 bg-zinc-800/30 cursor-default'
                  }`}
                  onClick={() => isClickable && originalSeed && onMatchClick(originalSeed)}
                >
                  <div className="space-y-2">
                    {seed.teams.map((team, index) => (
                      <div
                        key={`team-${seed.id}-${team.id}-${index}`}
                        className={`p-3 rounded-md transition-colors ${
                          seed.winner === team.id
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-700/30 hover:bg-zinc-700/50'
                        }`}
                      >
                        <span className="font-medium">{team.name}</span>
                        <span className="text-zinc-400 ml-2 text-sm">#{team.id}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-3 text-sm ${
                    seed.status === "Completed" ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {seed.status}
                  </div>
                </div>
              </SeedItem>
            </Seed>
          );
        }}
      />
    </div>
  );
};

export default SingleEliminationBracket;