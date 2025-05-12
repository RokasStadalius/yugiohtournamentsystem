export interface PlayerType {
    id: number;
    name: string;
  }
  
  export interface Team {
    name: string;
    id?: number;
  }
  
  export interface Seed {
    id: number;
    teams: Team[];
    status: string;
    winner?: number;
    date?: string;
  }
  
  export interface Round {
    id: string;         // Required from backend
    title: string;
    seeds: Seed[];
    status?: string;    // Matches backend response
    roundNumber?: number;
  }
  
  export interface TournamentType {
    id: number;
    name: string;
    status: "NotStarted" | "InProgress" | "Completed";
    type: "Single Elimination" | "Round Robin";
    ownerID: number;
    players: PlayerType[];
  }