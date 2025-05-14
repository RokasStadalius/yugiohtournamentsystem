"use client";

import { Round, Seed } from "../types";

interface RoundRobinBracketProps {
  rounds: Round[];
  onMatchClick?: (match: Seed) => void;
}

export const RoundRobinBracket = ({ rounds, onMatchClick }: RoundRobinBracketProps) => {
  const calculateStandings = (rounds: Round[]) => {
    const standings = new Map<number, { name: string; wins: number; losses: number }>();
    
    rounds.forEach(round => {
      round.seeds.forEach(seed => {
        if (seed.status === "Completed" && seed.winner) {
          const winner = standings.get(seed.winner) || { name: seed.teams.find(t => t.id === seed.winner)?.name || "", wins: 0, losses: 0 };
          standings.set(seed.winner, {
            ...winner,
            wins: winner.wins + 1
          });

          const loserId = seed.teams.find(t => t.id !== seed.winner)?.id;
          if (loserId) {
            const loser = standings.get(loserId) || { name: seed.teams.find(t => t.id === loserId)?.name || "", wins: 0, losses: 0 };
            standings.set(loserId, {
              ...loser,
              losses: loser.losses + 1
            });
          }
        }
      });
    });

    return Array.from(standings.entries())
      .sort(([,a], [,b]) => b.wins - a.wins || a.losses - b.losses);
  };

  const standings = calculateStandings(rounds);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-zinc-800/20 rounded-xl p-4 border border-zinc-700">
        <h3 className="text-lg font-semibold mb-3 text-red-400">Current Standings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-zinc-400">Player</th>
                <th className="px-3 py-2 text-left text-sm text-zinc-400">W</th>
                <th className="px-3 py-2 text-left text-sm text-zinc-400">L</th>
              </tr>
            </thead>
            <tbody>
              {standings.map(([playerId, { name, wins, losses }]) => (
                <tr key={playerId} className="hover:bg-zinc-700/20 transition-colors">
                  <td className="px-3 py-2 text-sm font-medium">{name}</td>
                  <td className="px-3 py-2 text-sm text-green-400">{wins}</td>
                  <td className="px-3 py-2 text-sm text-red-400">{losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
        {rounds.map((round) => (
          <div key={round.title} className="bg-zinc-800/20 rounded-lg p-3 border border-zinc-700">
            <h3 className="text-sm font-semibold mb-2 text-red-400">{round.title}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs text-zinc-400">Team 1</th>
                    <th className="px-2 py-1 text-left text-xs text-zinc-400">Team 2</th>
                    <th className="px-2 py-1 text-left text-xs text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {round.seeds.map((seed) => (
                    <tr
                      key={seed.id}
                      onClick={() => seed.status !== "Completed" && onMatchClick?.(seed)}
                      className={`transition-all ${
                        seed.status !== "Completed" 
                          ? 'hover:bg-red-500/10 cursor-pointer' 
                          : 'opacity-75'
                      }`}
                    >
                      <td className={`px-2 py-1 text-sm ${
                        seed.teams[0]?.id === seed.winner ? 'text-green-400 font-medium' : 'text-zinc-300'
                      }`}>
                        {seed.teams[0]?.name}
                      </td>
                      <td className={`px-2 py-1 text-sm ${
                        seed.teams[1]?.id === seed.winner ? 'text-green-400 font-medium' : 'text-zinc-300'
                      }`}>
                        {seed.teams[1]?.name}
                      </td>
                      <td className="px-2 py-1">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          seed.status === "Completed" 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {seed.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoundRobinBracket;