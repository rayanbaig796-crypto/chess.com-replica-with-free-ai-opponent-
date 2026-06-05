import React from "react";
import { GameHistoryItem, PlayerStats } from "../types";
import { Bolt, Timer, Rocket, Trophy, Play, ArrowUpRight, ArrowDownRight, ChevronRight, Puzzle, Flame } from "lucide-react";

interface HomeScreenProps {
  stats: PlayerStats;
  history: GameHistoryItem[];
  onStartMatch: (timeControlMinutes: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  history,
  onStartMatch,
  onNavigateToTab,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero / Play Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Play Card */}
        <div className="bg-surface-charcoal rounded-xl p-6 flex flex-col justify-center items-center gap-5 shadow-2xl border border-surface-container-highest relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
          <h1 className="font-display-lg text-2xl sm:text-3xl text-on-surface relative z-10 text-center tracking-tight font-bold">
            Ready for a match?
          </h1>

          <button
            id="play-now-btn"
            onClick={() => onStartMatch(10)}
            className="w-full md:w-[85%] py-4 bg-primary-container text-on-primary-container font-semibold rounded-lg btn-3d shadow-xl flex justify-center items-center gap-2 relative z-10 text-lg transition-transform"
          >
            <Play size={20} className="fill-current" />
            Play Now
          </button>

          <div className="flex gap-4 w-full md:w-[85%] relative z-10">
            <button
              onClick={() => onStartMatch(3)}
              className="flex-1 py-3 bg-surface-container-high text-on-surface font-semibold rounded btn-secondary-3d flex items-center justify-center gap-1.5 border border-surface-container-highest text-sm"
            >
              <Bolt size={15} className="text-primary" /> 3 min
            </button>
            <button
              onClick={() => onStartMatch(10)}
              className="flex-1 py-3 bg-surface-container-high text-on-surface font-semibold rounded btn-secondary-3d flex items-center justify-center gap-1.5 border border-surface-container-highest text-sm"
            >
              <Timer size={15} className="text-primary" /> 10 min
            </button>
          </div>
        </div>

        {/* Daily Puzzle Card */}
        <div
          onClick={() => onNavigateToTab("puzzles")}
          className="bg-surface-charcoal rounded-xl overflow-hidden shadow-2xl border border-surface-container-highest flex flex-col cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group relative"
        >
          <div className="h-40 bg-surface-container-lowest relative">
            <img
              alt="Chessboard puzzle illustration"
              src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&q=80&w=650&h=400"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity group-hover:opacity-70 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-charcoal to-transparent"></div>
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className="p-1 rounded bg-action-gold/20 text-action-gold">
                <Puzzle size={20} />
              </span>
              <span className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                Daily Puzzle
              </span>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center bg-surface-charcoal">
            <div>
              <p className="text-body-md text-on-surface-variant font-medium text-sm">
                White to move and benefit.
              </p>
              <p className="font-semibold text-xs text-primary mt-1 bg-primary/10 px-2 py-0.5 rounded-full inline-block">
                Rating: 1850
              </p>
            </div>
            <button className="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center hover:bg-surface-bright transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid: Elo Ratings & Match History */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Elo Stats Column */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-surface-container-high text-on-surface-variant flex items-center justify-center border border-surface-container-highest">
                <Timer size={20} className="text-[#a5b4fc]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Rapid</p>
                <p className="text-xl font-bold text-on-surface">{stats.rapid}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary flex items-center bg-primary/10 px-2 py-1 rounded-md">
              <ArrowUpRight size={13} className="mr-0.5" /> +{stats.rapidChange}
            </span>
          </div>

          <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-surface-container-high text-on-surface-variant flex items-center justify-center border border-surface-container-highest">
                <Bolt size={20} className="text-[#fdba74]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Blitz</p>
                <p className="text-xl font-bold text-on-surface">{stats.blitz}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-error flex items-center bg-error/10 px-2 py-1 rounded-md">
              <ArrowDownRight size={13} className="mr-0.5" /> {stats.blitzChange >= 0 ? `+${stats.blitzChange}` : stats.blitzChange}
            </span>
          </div>

          <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-surface-container-high text-on-surface-variant flex items-center justify-center border border-surface-container-highest">
                <Rocket size={20} className="text-[#f472b6]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Bullet</p>
                <p className="text-xl font-bold text-on-surface">{stats.bullet}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-on-surface-variant flex items-center bg-surface-container-high px-2.5 py-1 rounded-md border border-surface-container-highest">
              -
            </span>
          </div>
        </div>

        {/* Recent Games Column */}
        <div className="md:col-span-2 bg-surface-charcoal rounded-xl shadow-xl border border-surface-container-highest overflow-hidden flex flex-col">
          <div className="p-4 border-b border-surface-container flex justify-between items-center bg-surface-container-high/40">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <Trophy size={18} className="text-action-gold" />
              Recent Games
            </h2>
            <div className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
              Streak: <span className="text-primary font-bold flex items-center gap-0.5">{stats.streak} <Flame size={14} className="text-[#fdba74] inline animate-pulseFill fill-[#fdba74]" /></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] divide-y divide-surface-container">
            {history.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                No matches played yet. Launch a quick game now!
              </div>
            ) : (
              history.map((game) => (
                <div
                  key={game.id}
                  className="p-3.5 hover:bg-surface-container-lowest transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-10 rounded-full ${
                        game.result === "win"
                          ? "bg-primary"
                          : game.result === "loss"
                          ? "bg-error"
                          : "bg-on-surface-variant opacity-40"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface flex items-center gap-1">
                          vs. {game.opponent}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          ({game.opponentRating})
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                        {game.gameType} • {game.duration} • {game.method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold text-sm ${
                        game.result === "win"
                          ? "text-primary"
                          : game.result === "loss"
                          ? "text-error"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {game.ratingChange >= 0 ? `+${game.ratingChange}` : game.ratingChange}
                    </p>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">{game.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
