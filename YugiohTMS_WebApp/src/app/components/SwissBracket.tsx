"use client";

import { Round } from "../types";

interface SwissBracketProps {
  rounds: Round[];
  onMatchClick: (match: Round['seeds'][number]) => void;
}

const SwissBracket = ({ rounds, onMatchClick }: SwissBracketProps) => {
  const playerMap = new Map<number, string>();
  rounds.forEach(round => {
    round.seeds.forEach(seed => {
      seed.teams.forEach(team => {
        if (team.id && !playerMap.has(team.id)) {
          playerMap.set(team.id, team.name);
        }
      });
    });
  });

  const calculateStandings = (rounds: Round[]) => {
    const standings = new Map<number, { wins: number, losses: number }>();
    
    rounds.forEach(round => {
      round.seeds.forEach(seed => {
        if (seed.status === "Completed" && seed.winner) {
          standings.set(seed.winner, {
            wins: (standings.get(seed.winner)?.wins || 0) + 1,
            losses: standings.get(seed.winner)?.losses || 0
          });
          
          const loser = seed.teams.find(t => t.id !== seed.winner)?.id;
          if (loser) {
            standings.set(loser, {
              wins: standings.get(loser)?.wins || 0,
              losses: (standings.get(loser)?.losses || 0) + 1
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
      {/* Standings */}
      <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4">
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
              {standings.map(([playerId, { wins, losses }]) => (
                <tr key={playerId} className="hover:bg-zinc-700/20 transition-colors">
                  <td className="px-3 py-2 text-sm font-medium">{playerMap.get(playerId)}</td>
                  <td className="px-3 py-2 text-sm text-green-400">{wins}</td>
                  <td className="px-3 py-2 text-sm text-red-400">{losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rounds */}
      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
        {rounds.map((round) => (
          <div 
            key={round.title} 
            className="bg-zinc-800/20 rounded-lg p-3 border border-zinc-700"
          >
            <h3 className="text-sm font-semibold mb-2 text-red-400">{round.title}</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {round.seeds.map((seed) => (
                <div
                  key={seed.id}
                  onClick={() => seed.status !== "Completed" && onMatchClick(seed)}
                  className={`p-2 rounded-md border transition-all ${
                    seed.status === "Completed" 
                      ? 'border-zinc-600 bg-zinc-800/30' 
                      : 'border-red-500/30 hover:border-red-500/50 bg-zinc-800/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      {seed.teams.map((team) => (
                        <div
                          key={team.id}
                          className={`px-2 py-1 rounded-sm text-sm ${
                            seed.winner === team.id
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-zinc-700/30'
                          }`}
                        >
                          {team.name}
                        </div>
                      ))}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      seed.status === "Completed" 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {seed.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwissBracket;