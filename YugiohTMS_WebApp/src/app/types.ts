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
    id: string;
    title: string;
    seeds: Seed[];
    status?: string; 
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