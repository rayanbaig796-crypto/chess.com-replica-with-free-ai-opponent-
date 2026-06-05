import React, { useState, useEffect } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { GameScreen } from "./components/GameScreen";
import { PuzzlesScreen } from "./components/PuzzlesScreen";
import { LearnScreen } from "./components/LearnScreen";
import { MoreScreen } from "./components/MoreScreen";
import { PlayerStats, GameHistoryItem } from "./types";
import { Home, Gamepad2, Puzzle, Award, Menu, Settings, User } from "lucide-react";

// Initial standard state defaults
const DEFAULT_STATS: PlayerStats = {
  rapid: 1542,
  blitz: 1320,
  bullet: 1105,
  rapidChange: 12,
  blitzChange: -8,
  bulletChange: 0,
  wins: 14,
  losses: 11,
  draws: 3,
  streak: 3,
};

const DEFAULT_HISTORY: GameHistoryItem[] = [
  {
    id: "g1",
    opponent: "ChessMaster99",
    opponentRating: 1500,
    playerRatingAfter: 1542,
    gameType: "Rapid",
    duration: "10 min",
    result: "win",
    method: "Won by Checkmate",
    ratingChange: 8,
    date: "2h ago",
  },
  {
    id: "g2",
    opponent: "RookieMistake",
    opponentRating: 1340,
    playerRatingAfter: 1320,
    gameType: "Blitz",
    duration: "3 min",
    result: "loss",
    method: "Lost on Time",
    ratingChange: -6,
    date: "Yesterday",
  },
  {
    id: "g2b",
    opponent: "AnonPlayer",
    opponentRating: 1542,
    playerRatingAfter: 1542,
    gameType: "Rapid",
    duration: "10 min",
    result: "draw",
    method: "Draw by Repetition",
    ratingChange: 0,
    date: "Yesterday",
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");

  // Load rating variables persistently from standard local storage
  const [stats, setStats] = useState<PlayerStats>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("checkmate_stats_v1");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_STATS;
        }
      }
    }
    return DEFAULT_STATS;
  });

  const [history, setHistory] = useState<GameHistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("checkmate_history_v1");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_HISTORY;
        }
      }
    }
    return DEFAULT_HISTORY;
  });

  const [activeTimeControl, setActiveTimeControl] = useState<number>(10);
  const [puzzleElo, setPuzzleElo] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("checkmate_puzzle_elo_v1");
      if (saved) {
        try {
          return parseInt(saved);
        } catch {
          return 1850;
        }
      }
    }
    return 1850;
  });

  // Keep state matching local storage
  useEffect(() => {
    localStorage.setItem("checkmate_stats_v1", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("checkmate_history_v1", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("checkmate_puzzle_elo_v1", puzzleElo.toString());
  }, [puzzleElo]);

  // Handle game screen stat updates recursively on achievements/defeats
  const handleGameCompleted = (newStats: PlayerStats, newHistory: GameHistoryItem) => {
    setStats(newStats);
    setHistory((prev) => [newHistory, ...prev]);
  };

  // Puzzle Solved state updater
  const handlePuzzleSolved = (newElo: number) => {
    setPuzzleElo(newElo);
  };

  const handleStartMatch = (timeControlMinutes: number) => {
    setActiveTimeControl(timeControlMinutes);
    setActiveTab("play");
  };

  const handleResetStatistics = () => {
    if (confirm("Are you sure you want to completely erase your local match data and statistics?")) {
      setStats(DEFAULT_STATS);
      setHistory(DEFAULT_HISTORY);
      setPuzzleElo(1850);
      localStorage.removeItem("checkmate_stats_v1");
      localStorage.removeItem("checkmate_history_v1");
      localStorage.removeItem("checkmate_puzzle_elo_v1");
    }
  };

  return (
    <div className="bg-background text-on-surface font-sans h-screen flex flex-col overflow-hidden leading-normal">
      {/* 1. TOP APP BAR (DISPLAYED EXCLUSIVELY ON MOBILE FORMATS) */}
      <header className="md:hidden bg-surface-container-low flex justify-between items-center px-4 h-16 w-full shrink-0 z-40 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest border border-primary/20">
            <img 
              alt="User Profile Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnmBnPsp01gPkTksbce2hRd3eZNPtT8xYnBA30RoWw0XE7mploe25dN45in3GKt0LhLqNiDl2spWPjNAjqyigNDWIyzXpVnaEQHI-F-b9EFOOGJfsuu4tRaxCyZrdd_fV-VFBBZdWwu3k4X9l-9yBUgFb4k0pzG4vN-X3dtZQ2OSA49PwDfwAIR4TE-cBpbl2lF6OM2eLAIYwsfRIAEBVEuf7GNxA6tsvNY5OwlqJQSabxxHMaci6jNYKmWWRF3-AoAocMy_LX9jw"
            />
          </div>
          <span className="font-display font-black text-xl text-primary tracking-tight">Checkmate</span>
        </div>
        <button
          onClick={() => setActiveTab("more")}
          className="text-primary hover:bg-surface-bright rounded-full p-2 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* 2. BODY CONTENT LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar (Drawer) displayed exclusively on DESKTOP */}
        <nav className="hidden md:flex flex-col h-full py-6 px-4 bg-surface-container-high w-80 rounded-r-xl shadow-2xl shrink-0 z-40 border-r border-surface-container-highest">
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary-container shrink-0">
              <img 
                alt="Player Profile Picture" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArlTeizURtWMZyKHhwAJbJ9YEOpKcdFKi3886E7PUAJqYAgYsdnlL6r5a86Y6oGs_D0S9d7hHLUhAMFZXSPqkgLXPbMEaeVfJJm59HRHcBcH8s8zF93csbXxxRhuswNz6W3VdZAoGA8OqF2vLUTGjiDXUYMDU1xIs52DWfgCY0UxPoWnLPYsp-XuGlAA8U9Jjr3ykxX8yVihcgwcWsRDozhA3jhwytQ4FjSZRXOaFGx-0nnXnncd-Ar2jFoM-rqjE-G5OqjrrZgKk"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-primary leading-tight text-base">GrandmasterPlayer</h2>
              <p className="text-xs text-on-surface-variant font-medium">Rating: 2450</p>
              <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold bg-action-gold text-[#1f1b15] px-2 py-0.5 rounded leading-none">
                PRO Member
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5 flex-grow">
            {[
              { id: "home", label: "Home", icon: <Home size={18} /> },
              { id: "play", label: "Play", icon: <Gamepad2 size={18} /> },
              { id: "puzzles", label: "Puzzles", icon: <Puzzle size={18} /> },
              { id: "learn", label: "Learn", icon: <Award size={18} /> },
              { id: "more", label: "More", icon: <Menu size={18} /> },
            ].map((navItem) => (
              <li key={navItem.id}>
                <button
                  onClick={() => setActiveTab(navItem.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === navItem.id
                      ? "bg-primary-container text-on-primary-container shadow-md"
                      : "text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  {navItem.icon}
                  {navItem.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Persistent branding footer in drawer */}
          <div className="text-[10px] font-mono text-on-surface-variant opacity-75 px-2">
            AI Studio Client • v1.0.0
          </div>
        </nav>

        {/* Core Main content scroll viewport */}
        <main className="flex-grow overflow-y-auto pb-24 md:pb-8 pt-4 md:pt-6 px-4 md:px-8 bg-background">
          <div className="max-w-4xl mx-auto">
            {activeTab === "home" && (
              <HomeScreen
                stats={stats}
                history={history}
                onStartMatch={handleStartMatch}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === "play" && (
              <GameScreen
                stats={stats}
                initialTimeControlMinutes={activeTimeControl}
                onUpdateStats={handleGameCompleted}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === "puzzles" && (
              <PuzzlesScreen
                onUpdateStats={handlePuzzleSolved}
                puzzleElo={puzzleElo}
              />
            )}

            {activeTab === "learn" && <LearnScreen />}

            {activeTab === "more" && (
              <MoreScreen
                stats={stats}
                history={history}
                onResetStatistics={handleResetStatistics}
              />
            )}
          </div>
        </main>
      </div>

      {/* 3. DOCKED BOTTOM NAVIGATION BAR (DISPLAYED EXCLUSIVELY ON MOBILE SCREENS) */}
      <nav className="md:hidden bg-surface-container text-primary font-medium text-xs border-t-2 border-surface-container-highest fixed bottom-0 w-full z-50 flex justify-around items-center pt-2.5 pb-4 px-2 shadow-2xl">
        {[
          { id: "home", label: "Home", icon: <Home size={18} /> },
          { id: "play", label: "Play", icon: <Gamepad2 size={18} /> },
          { id: "puzzles", label: "Puzzles", icon: <Puzzle size={18} /> },
          { id: "learn", label: "Learn", icon: <Award size={18} /> },
          { id: "more", label: "More", icon: <Menu size={18} /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
              activeTab === item.id
                ? "text-primary bg-primary/10 rounded-xl px-3 py-1 scale-105 font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {item.icon}
            <span className="text-[10px] tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
