export type GameType = "Rapid" | "Blitz" | "Bullet";

export interface GameHistoryItem {
  id: string;
  opponent: string;
  opponentRating: number;
  playerRatingAfter: number;
  gameType: GameType;
  duration: string;
  result: "win" | "loss" | "draw";
  method: string;
  ratingChange: number;
  date: string;
}

export interface PlayerStats {
  rapid: number;
  blitz: number;
  bullet: number;
  rapidChange: number;
  blitzChange: number;
  bulletChange: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
}

export interface Puzzle {
  id: string;
  title: string;
  initialFen: string;
  solution: string[]; // List of UCI moves e.g., ["e2e4", "d7d5"] or coordinate notation
  rating: number;
  description: string;
  colorToMove: "white" | "black";
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  steps: {
    fen: string;
    explanation: string;
    targetMove?: string;
  }[];
}
