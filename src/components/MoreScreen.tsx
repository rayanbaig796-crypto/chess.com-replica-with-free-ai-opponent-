import React from "react";
import { PlayerStats, GameHistoryItem } from "../types";
import { User, Volume2, RotateCcw, Flame, TrendingUp, BarChart2, ShieldAlert, Palette, Check, Image } from "lucide-react";

interface MoreScreenProps {
  stats: PlayerStats;
  history: GameHistoryItem[];
  onResetStatistics: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  stats,
  history,
  onResetStatistics,
}) => {
  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-10">
      {/* Profile summary card */}
      <div className="bg-surface-charcoal rounded-xl p-5 flex items-center gap-5 shadow-2xl border border-surface-container-highest bg-gradient-to-br from-surface-charcoal to-surface-container-high relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 text-primary opacity-10 font-bold font-mono text-8xl pointer-events-none select-none">
          GM
        </div>

        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary-container shrink-0 bg-primary/10 flex items-center justify-center font-bold text-lg text-primary shadow-inner">
          <User size={25} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">GrandmasterPlayer</h2>
            <span className="inline-block font-bold text-[9px] bg-action-gold text-[#1f1b15] px-2 py-0.5 rounded uppercase tracking-wider">
              PRO MEMBER
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Chess Elo Rating: <span className="text-primary font-bold">2450</span></p>
        </div>
      </div>

      {/* REAL-TIME STATISTICS GRID */}
      <div className="bg-surface-charcoal rounded-xl p-5 shadow-2xl border border-surface-container-highest space-y-4">
        <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-1.5">
          <BarChart2 size={16} className="text-primary" />
          Real-Time Game Metrics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-container p-3 rounded-lg border border-surface-container-highest text-center">
            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Total Battles</p>
            <p className="text-xl font-bold text-on-surface mt-1">{totalGames}</p>
          </div>

          <div className="bg-surface-container p-3 rounded-lg border border-surface-container-highest text-center">
            <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Wins</p>
            <p className="text-xl font-bold text-primary mt-1">{stats.wins}</p>
          </div>

          <div className="bg-surface-container p-3 rounded-lg border border-surface-container-highest text-center">
            <p className="text-[10px] text-error uppercase font-bold tracking-wider">Losses</p>
            <p className="text-xl font-bold text-error mt-1">{stats.losses}</p>
          </div>

          <div className="bg-surface-container p-3 rounded-lg border border-surface-container-highest text-center">
            <p className="text-[10px] text-action-gold uppercase font-bold tracking-wider">Win Rate</p>
            <p className="text-xl font-bold text-action-gold mt-1">{winRate}%</p>
          </div>
        </div>

        {/* LiveStreak Metrics */}
        <div className="flex gap-3 pt-2">
          <div className="flex-1 bg-surface-container p-3 rounded-lg border border-surface-container-highest flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <Flame size={14} className="text-[#fdba74]" /> Active Streak Counter
            </span>
            <span className="font-mono font-bold text-sm text-[#fdba74] flex items-center gap-1">
              {stats.streak} matches <Flame size={14} className="text-[#fdba74] fill-[#fdba74] animate-pulse" />
            </span>
          </div>

          <div className="flex-1 bg-surface-container p-3 rounded-lg border border-surface-container-highest flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#a5b4fc]" /> Rapid Progress
            </span>
            <span className={`font-mono font-bold text-sm ${stats.rapidChange >= 0 ? "text-primary" : "text-error"}`}>
              {stats.rapidChange >= 0 ? `+${stats.rapidChange}` : stats.rapidChange} Elo
            </span>
          </div>
        </div>
      </div>

      {/* CHESS PIECES & BOARD ARTISTRY SHOWCASE */}
      <div className="bg-surface-charcoal rounded-xl p-5 shadow-2xl border border-surface-container-highest space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={16} className="text-primary" />
            Theme & Piece Customization
          </h3>
          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Active Set
          </span>
        </div>

        {/* Generated Chess.com Pieces Visual Card */}
        <div className="relative rounded-lg overflow-hidden border border-surface-container-highest bg-surface-container shadow-inner group">
          <img
            src="/src/assets/images/chess_pieces_premium_1780676348629.png"
            alt="Chess.com Neo-Classic Piece Showcase"
            referrerPolicy="no-referrer"
            className="w-full h-40 object-cover opacity-90 group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex flex-col justify-end p-4">
            <h4 className="font-bold text-md text-on-surface flex items-center gap-1.5 shadow-sm">
              Chess.com Neo-Classic
              <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
              Custom flat-vector icons with ultra-refined obsidian dark textures and pure ivory satin white coatings.
            </p>
          </div>
        </div>

        {/* Piece details / attributes list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-surface-container rounded-lg border border-surface-container-highest flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Satin Finishes</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">Warm ivory gloss highlights.</p>
            </div>
          </div>

          <div className="p-2.5 bg-surface-container rounded-lg border border-surface-container-highest flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Refined Outlines</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">High-contrast bold boundaries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS PANEL */}
      <div className="bg-surface-charcoal rounded-xl p-5 shadow-2xl border border-surface-container-highest space-y-4">
        <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">General Configurations</h3>

        <div className="space-y-3.5">
          {/* reset game stats button */}
          <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-surface-container-highest">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-on-surface">Erase Matches History</p>
              <p className="text-[10.5px] text-on-surface-variant mt-0.5">Wipe clean Elo trackers, streak logs, and leaderboard rankings.</p>
            </div>
            <button
              onClick={onResetStatistics}
              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/35 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          {/* Credits */}
          <div className="p-3 bg-surface-container/50 rounded-lg text-[11px] text-on-surface-variant leading-relaxed font-mono">
            Checkmate Grandmaster client is powered by Google AI Studio. Play, learn, and train checkmate patterns with deep reasoning models.
          </div>
        </div>
      </div>
    </div>
  );
};
