"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import toast from "react-hot-toast";
import { Sidebar } from "@/app/components/sidebar";
import { Bracket, IRoundProps } from "react-brackets";
import RoundRobinBracket from "@/app/components/RoundRobinBracket";
import SingleEliminationBracket from "@/app/components/SingleEliminationBracket";
import SwissBracket from "@/app/components/SwissBracket";
import MatchModal from "@/app/components/MatchModal";
import JoinTournamentModal from "@/app/components/JoinTournamentModal";
import { Trophy } from "lucide-react";
import { Round } from "@/app/types";

interface PlayerType {
  id: number;
  name: string;
  deckName: string;
  iD_Deck: number;
  rating: number;
}

interface Seed {
  id: number;
  date: string;
  teams: { name: string; id?: number }[];
  status: string;
  winner?: number;
}

interface TournamentType {
  id: number;
  name: string;
  status: "NotStarted" | "InProgress" | "Completed";
  type: "Single Elimination" | "Round Robin" | "Swiss Stage";
  ownerID: number;
  players: PlayerType[];
  winner: string;
  numOfRounds: number;
}

export default function TournamentPage() {
  const { tournamentId } = useParams() as { tournamentId: string };
  const router = useRouter();

  const [tournament, setTournament] = useState<TournamentType | null>(null);
  const [bracketRounds, setBracketRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserInTournament, setIsUserInTournament] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    id: number;
    teams: { name: string; id?: number }[];
    status: string;
    winner?: number;
  } | null>(null);
  // State to hold the userId from localStorage
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Access localStorage only on the client side
    if (typeof window !== "undefined") {
      setCurrentUserId(parseInt(localStorage.getItem("userId") || "0"));
    }
  }, []);

  // Use currentUserId for owner check
  const isOwner = tournament?.ownerID === currentUserId;

  useEffect(() => {
    if (!tournamentId) {
      toast.error("Invalid tournament ID");
      router.push("/tournaments");
      return;
    }
    fetchTournamentData();
  }, [tournamentId, currentUserId]); // Add currentUserId as a dependency

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/tournament/${tournamentId}`
      );

      if (!response.ok) throw new Error("Failed to fetch tournament");

      const data: TournamentType = await response.json();
      console.log(data);
      setTournament(data);
      // Check for user in tournament only after currentUserId is set
      if (currentUserId !== null) {
        setIsUserInTournament(
          data.players.some((p) => p.id === currentUserId)
        );
      }

      const matchesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/tournament/fetch-matches/${tournamentId}`
      );
      const bracketData = await matchesResponse.json();
      setBracketRounds(bracketData);
    } catch (error) {
      toast.error("Error fetching tournament data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = async () => {
    try {
      const startResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/start-tournament/${tournamentId}`,
        { method: "POST" }
      );

      if (!startResponse.ok) throw new Error("Failed to start tournament");

      const generateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/tournament/generate-matches/${tournamentId}`
      );

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.message || "Failed to generate matches");
      }

      toast.success("Tournament started and matches generated!");
      setTournament((prev) =>
        prev ? { ...prev, status: "InProgress" } : null
      );
      await fetchTournamentData();
    } catch (error) {
      console.error("Tournament start error:", error);
      toast.error(
        error instanceof Error ? error.message : "Error starting tournament"
      );
    }
  };

  const handleJoinTournament = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not logged in. Please log in to join a tournament.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tournament/jointournament`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_Tournament: tournamentId,
            id_User: parseInt(userId),
          }),
        }
      );

      if (!response.ok) throw new Error("Join failed");

      toast.success("Joined tournament!");
      fetchTournamentData();
    } catch (error) {
      toast.error("Error joining tournament");
    }
  };

  const handleAssignWinner = async (matchId: number, winnerId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tournament/match/assign-winner/${matchId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ winnerId }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign winner");

      const matchesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/tournament/fetch-matches/${tournamentId}`
      );
      const bracketData = await matchesResponse.json();
      setBracketRounds(bracketData);

      if (tournament?.type === "Swiss Stage") {
        const latestRound = bracketData[bracketData.length - 1];
        const isRoundComplete = latestRound.seeds.every(
          (match: { winner: null }) => match.winner != null
        );

        if (isRoundComplete) {
          if (bracketData.length >= tournament.numOfRounds) {
            toast.success("All Swiss rounds completed!");
            return;
          }

          const generateResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/tournament/generate-next-swiss-round/${tournamentId}`,
            { method: "POST" }
          );

          if (!generateResponse.ok) {
            throw new Error("Failed to generate next round");
          }

          const newMatchesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/Tournament/tournament/fetch-matches/${tournamentId}`
          );
          const newBracketData = await newMatchesResponse.json();
          setBracketRounds(newBracketData);
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const completeTournament = async (tournamentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tournament/complete/${tournamentId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 409) {
        const errorData = await response.json();
        if (errorData.requiresTiebreaker) {
          const tiebreakerRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tournament/generate-tiebreaker/${tournamentId}`,
            { method: "POST" }
          );

          if (!tiebreakerRes.ok) {
            throw new Error("Failed to generate tiebreaker");
          }

          toast.success("Tiebreaker match generated! Please complete it.");
          await fetchTournamentData();
        }
        return;
      }

      if (!response.ok) throw new Error("Completion failed");

      const result = await response.json();
      toast.success(`Tournament completed! Winner ID: ${result.winnerId}`);
      fetchTournamentData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    }
  };

  const processBracketData = (data: any): Round[] => {
    return data.map((round: any) => ({
      id: round.id || `round-${Date.now()}`,
      title: round.title,
      status: round.status,
      seeds: round.seeds.map((seed: any) => ({
        id: seed.id,
        teams: seed.teams,
        status: seed.status,
        winner: seed.winner,
      })),
    }));
  };

  const handleMatchClick = (match: Seed) => {
    if (isOwner) { // Use the state variable
      setSelectedMatch(match);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!tournament) return <Typography>Tournament not found</Typography>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex">
      <Sidebar />
      <div className="flex-1 p-8 lg:p-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12">
            <Trophy className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              {tournament.name}
            </h1>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-12 border-2 border-zinc-700">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-4">
                <span
                  className={`px-4 py-2 rounded-full ${
                    tournament.status === "Completed"
                      ? "bg-green-500/20 text-green-400"
                      : tournament.status === "InProgress"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {tournament.status}
                </span>
                <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-400">
                  {tournament.type}
                </span>
                {tournament.type === "Swiss Stage" && (
                  <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400">
                    Rounds: {tournament.numOfRounds}
                  </span>
                )}
              </div>

              {!isUserInTournament && (
                <Button
                  className="bg-red-600 hover:bg-red-700 ml-auto"
                  onClick={() => setJoinModalOpen(true)}
                >
                  Join Tournament
                </Button>
              )}

              {isOwner && (
                <div className="flex gap-4">
                  {tournament.status === "NotStarted" && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleStartTournament}
                    >
                      Start Tournament
                    </Button>
                  )}
                  {tournament.status === "InProgress" && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => completeTournament(parseInt(tournamentId))}
                    >
                      Complete Tournament
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-800 rounded-xl border-2 border-zinc-700 mb-12 overflow-hidden">
            <div className="p-6 border-b border-zinc-700">
              <h2 className="text-xl font-semibold">
                Combatants ({tournament.players.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-zinc-400">Name</th>
                    <th className="px-6 py-4 text-left text-zinc-400">Deck</th>
                    <th className="px-6 py-4 text-left text-zinc-400">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tournament.players.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-zinc-700/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{player.name}</td>
                      <td className="px-6 py-4">{player.deckName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
                          {player.rating}
                        </span>
                      </td>
                      {isOwner && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              router.push(`/deckbuilder/${player.iD_Deck}`)
                            }
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          >
                            View Deck
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {tournament.status === "Completed" && tournament.winner && (
            <div className="bg-zinc-800 rounded-xl border-2 border-zinc-700 mb-12 p-6">
              <div className="flex items-center space-x-4">
                <Trophy className="w-12 h-12 text-green-400" />
                <div>
                  <h2 className="text-2xl font-bold text-green-400">
                    Tournament Champion
                  </h2>
                  <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {tournament.winner}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-zinc-800 rounded-xl border-2 border-zinc-700 p-6">
            <h2 className="text-2xl font-bold mb-6">Tournament Bracket</h2>
            {tournament.type === "Single Elimination" ? (
              <SingleEliminationBracket
                isOwner={isOwner}
                tournamentStatus={tournament.status}
                rounds={bracketRounds}
                onMatchClick={(match) => setSelectedMatch(match)}
              />
            ) : tournament.type === "Round Robin" ? (
              <RoundRobinBracket
                isOwner={isOwner}
                tournamentStatus={tournament.status}
                rounds={bracketRounds}
                onMatchClick={(match) => setSelectedMatch(match)}
              />
            ) : tournament.type === "Swiss Stage" ? (
              <SwissBracket
                isOwner={isOwner}
                tournamentStatus={tournament.status}
                rounds={bracketRounds}
                onMatchClick={(match) => setSelectedMatch(match)}
              />
            ) : (
              <div className="text-center py-12 text-zinc-400">
                Unsupported bracket type
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-72 bg-gradient-to-r from-red-500/20 to-transparent blur-3xl -z-10" />
      </div>

      <MatchModal
        open={!!selectedMatch}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onAssignWinner={async (winnerId) => {
          if (!selectedMatch) return;
          try {
            await handleAssignWinner(selectedMatch.id, winnerId);
            setSelectedMatch(null);
          } catch (error) {
            toast.error("Failed to assign winner");
          }
        }}
      />
      <JoinTournamentModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        tournamentId={tournamentId}
        onJoin={async (deckId) => {
          try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
              toast.error("User not logged in. Please log in to join a tournament.");
              return;
            }

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/tournament/jointournament`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_Tournament: tournamentId,
                  id_User: parseInt(userId),
                  id_Deck: deckId,
                }),
              }
            );

            if (!response.ok) throw new Error("Join failed");

            toast.success("Joined tournament!");
            fetchTournamentData();
            setJoinModalOpen(false);
          } catch (error) {
            toast.error("Error joining tournament");
          }
        }}
      />
    </div>
  );
}