"use client";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { Round, Seed } from "../types";

interface RoundRobinBracketProps {
  rounds: Round[];
  onMatchClick?: (match: Seed) => void;
}

export const RoundRobinBracket = ({ rounds, onMatchClick }: RoundRobinBracketProps) => {
  return (
    <div className="space-y-8">
      {rounds.map((round) => (
        <div key={round.title} className="bg-zinc-700/20 rounded-xl p-6 border-2 border-zinc-700">
          <h3 className="text-xl font-semibold mb-4 text-red-400">{round.title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-zinc-400">Team 1</th>
                  <th className="px-4 py-3 text-left text-zinc-400">Team 2</th>
                  <th className="px-4 py-3 text-left text-zinc-400">Status</th>
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
                    <td className={`px-4 py-3 ${
                      seed.teams[0]?.id === seed.winner ? 'text-green-400 font-semibold' : 'text-zinc-300'
                    }`}>
                      {seed.teams[0]?.name}
                    </td>
                    <td className={`px-4 py-3 ${
                      seed.teams[1]?.id === seed.winner ? 'text-green-400 font-semibold' : 'text-zinc-300'
                    }`}>
                      {seed.teams[1]?.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-sm ${
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
  );
};


export default RoundRobinBracket;
