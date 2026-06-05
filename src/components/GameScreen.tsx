import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { ChessBoard } from "./ChessBoard";
import { ChessPiece } from "./ChessPiecesSVG";
import { getBotMove } from "../utils/ai";
import { GameHistoryItem, PlayerStats } from "../types";
import { Play, RotateCcw, Award, Sparkles, MessageCircle, Volume2, VolumeX, ShieldAlert, Navigation, Swords } from "lucide-react";

interface GameScreenProps {
  stats: PlayerStats;
  initialTimeControlMinutes: number;
  onUpdateStats: (newStats: PlayerStats, newHistory: GameHistoryItem) => void;
  onNavigateToTab: (tab: string) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  stats,
  initialTimeControlMinutes,
  onUpdateStats,
  onNavigateToTab,
}) => {
  // Game state
  const [chess, setChess] = useState<Chess>(() => new Chess());
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Sound configuration
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Clocks represent seconds remaining
  const [playerTime, setPlayerTime] = useState<number>(initialTimeControlMinutes * 60);
  const [botTime, setBotTime] = useState<number>(initialTimeControlMinutes * 60);

  // Tracking game termination
  const [gameState, setGameState] = useState<"ongoing" | "checkmate" | "draw" | "stalemate" | "timeout">("ongoing");
  const [winnerMessage, setWinnerMessage] = useState<string>("");

  // AI Commentary coach state
  const [coachComment, setCoachComment] = useState<string>(
    "Choose your difficulty, set your timer speed, and hit Start Game to battle the Grandmaster AI! I will provide live move diagnostics."
  );
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger game start / resets
  const startNewGame = (colorSelected: "w" | "b" = playerColor) => {
    const freshChess = new Chess();
    setChess(freshChess);
    setPlayerColor(colorSelected);
    setIsFlipped(colorSelected === "b");
    setPlayerTime(initialTimeControlMinutes * 60);
    setBotTime(initialTimeControlMinutes * 60);
    setGameState("ongoing");
    setWinnerMessage("");
    setLastMove(null);
    setIsPlaying(true);
    setCoachComment("The board is set. Good luck! Play your first moves.");

    if (colorSelected === "b") {
      // Trigger instant bot move if user selected black
      setTimeout(() => triggerBotTurn(freshChess), 600);
    }
  };

  const playTactileSound = (type: "move" | "capture" | "check" | "gameover") => {
    if (!soundEnabled) return;
    try {
      const isBrowser = typeof window !== "undefined";
      if (!isBrowser) return;

      const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.connect(gain);
      gain.connect(actx.destination);

      if (type === "move") {
        osc.frequency.setValueAtTime(320, actx.currentTime);
        gain.gain.setValueAtTime(0.1, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.1);
        osc.start();
        osc.stop(actx.currentTime + 0.1);
      } else if (type === "capture") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, actx.currentTime);
        gain.gain.setValueAtTime(0.12, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.15);
        osc.start();
        osc.stop(actx.currentTime + 0.15);
      } else if (type === "check") {
        osc.frequency.setValueAtTime(512, actx.currentTime);
        gain.gain.setValueAtTime(0.15, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.25);
        osc.start();
        osc.stop(actx.currentTime + 0.25);
      } else if (type === "gameover") {
        osc.frequency.setValueAtTime(260, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(130, actx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.6);
        osc.start();
        osc.stop(actx.currentTime + 0.6);
      }
    } catch (e) {
      // Audio execution guard for iframe policies which is fine
    }
  };

  // Turn scheduler clock countdowns
  useEffect(() => {
    if (isPlaying && gameState === "ongoing") {
      timerRef.current = setInterval(() => {
        const activeColor = chess.turn();
        if (activeColor === playerColor) {
          setPlayerTime((t) => {
            if (t <= 1) {
              handleGameOver("timeout", playerColor === "w" ? "b" : "w");
              return 0;
            }
            return t - 1;
          });
        } else {
          setBotTime((t) => {
            if (t <= 1) {
              handleGameOver("timeout", playerColor);
              return 0;
            }
            return t - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameState, chess, playerColor]);

  // AI coaching commentary trigger (Offline / No API Key required)
  const requestCoachVoiceLine = (boardInstance: Chess, latestMoveStr: string) => {
    setIsCoachLoading(true);
    
    setTimeout(() => {
      let comment = "A solid, balanced position. Continue developing your pieces.";
      
      if (boardInstance.isCheck()) {
        comment = "Check! Ensure your king has a safe escape square.";
      } else if (latestMoveStr.includes("x")) {
        comment = "A sharp exchange! Always calculate the recaptures carefully.";
      } else if (boardInstance.history().length < 10) {
        comment = "Focus on central control and rapid development in the opening phase.";
      } else if (latestMoveStr.includes("O-O")) {
        comment = "King safety secured with a castle. Now, prepare your middlegame plans.";
      } else if (boardInstance.history().length > 40) {
        comment = "We are deep into the endgame. King activity and pawn structures are vital now.";
      } else {
        const standardLines = [
          "Look for outpost squares for your knights.",
          "Keep an eye on open files for your rooks.",
          "Maintain pawn structure and avoid isolated pawns where possible.",
          "A fascinating position. Evaluate all forcing moves first.",
          "Watch out for tactical forks and pins!"
        ];
        comment = standardLines[Math.floor(Math.random() * standardLines.length)];
      }

      setCoachComment(comment);
      setIsCoachLoading(false);
    }, 400); // Simulate brief thought time
  };

  // Execute bot turn
  const triggerBotTurn = (currentChess: Chess) => {
    if (currentChess.isGameOver()) return;

    // Simulate bot thinking time
    setTimeout(() => {
      const botsMove = getBotMove(currentChess.fen(), difficulty);
      if (botsMove) {
        const fresh = new Chess(currentChess.fen());
        try {
          const m = fresh.move(botsMove);
          setChess(fresh);
          setLastMove({ from: m.from, to: m.to });

          // Audio triggers
          if (m.captured) {
            playTactileSound("capture");
          } else if (fresh.inCheck()) {
            playTactileSound("check");
          } else {
            playTactileSound("move");
          }

          // Evaluate game termination conditions
          if (fresh.isGameOver()) {
            if (fresh.isCheckmate()) {
              handleGameOver("checkmate", playerColor === "w" ? "b" : "w");
            } else if (fresh.isDraw() || fresh.isStalemate()) {
              handleGameOver("draw");
            }
          } else {
            // Trigger AI Coach commentary
            requestCoachVoiceLine(fresh, m.san);
          }
        } catch (err) {
          console.error("Critical bot move error:", err);
        }
      }
    }, 700);
  };

  // Perform user moves
  const handleUserMove = (from: string, to: string, promotion?: string) => {
    if (chess.isGameOver()) return;

    const fresh = new Chess(chess.fen());
    try {
      const m = fresh.move({ from, to, promotion: promotion || "q" });
      setChess(fresh);
      setLastMove({ from: m.from, to: m.to });

      if (m.captured) {
        playTactileSound("capture");
      } else if (fresh.inCheck()) {
        playTactileSound("check");
      } else {
        playTactileSound("move");
      }

      // Check for immediate game over
      if (fresh.isGameOver()) {
        if (fresh.isCheckmate()) {
          handleGameOver("checkmate", playerColor);
        } else if (fresh.isDraw() || fresh.isStalemate()) {
          handleGameOver("draw");
        }
      } else {
        // AI commentary fetch
        requestCoachVoiceLine(fresh, m.san);
        // Queue AI Opponent counter offensive
        triggerBotTurn(fresh);
      }
    } catch {
      // Invalid move guard
    }
  };

  // Game over processor
  const handleGameOver = (
    reason: "checkmate" | "draw" | "stalemate" | "timeout",
    winningColor?: "w" | "b"
  ) => {
    setGameState(reason);
    playTactileSound("gameover");

    let statusText = "The game is drawn.";
    let finalResult: "win" | "loss" | "draw" = "draw";
    let scoreEarned = 0;

    const botLevelLabel =
      difficulty === "easy" ? "Fischer (Bot)" : difficulty === "medium" ? "Kasparov (Bot)" : "Magnus (Grandmaster Bot)";

    if (reason === "checkmate") {
      if (winningColor === playerColor) {
        statusText = `Victory has been claimed via Checkmate! You defeated ${botLevelLabel}.`;
        finalResult = "win";
        scoreEarned = difficulty === "easy" ? 6 : difficulty === "medium" ? 11 : 18;
      } else {
        statusText = `Defeat. ${botLevelLabel} checkmated you. Keep seeking improvement!`;
        finalResult = "loss";
        scoreEarned = difficulty === "easy" ? -4 : difficulty === "medium" ? -6 : -9;
      }
    } else if (reason === "timeout") {
      if (winningColor === playerColor) {
        statusText = `Victory on Time! ${botLevelLabel} ran out of seconds.`;
        finalResult = "win";
        scoreEarned = difficulty === "easy" ? 4 : difficulty === "medium" ? 8 : 12;
      } else {
        statusText = "Lost on Time. Watch your clock speed!";
        finalResult = "loss";
        scoreEarned = difficulty === "easy" ? -3 : difficulty === "medium" ? -5 : -7;
      }
    } else if (reason === "stalemate") {
      statusText = "Stalemate! There are no legal moves remaining.";
    }

    setWinnerMessage(statusText);

    // Save history and update Elo rating variables on actual match completion
    const newStats = { ...stats };
    const randomId = Math.random().toString(36).substr(2, 9);
    const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Identify game time control type
    const matchType = initialTimeControlMinutes <= 3 ? "Blitz" : "Rapid";

    if (finalResult === "win") {
      newStats.wins += 1;
      newStats.streak += 1;
      if (matchType === "Rapid") {
        newStats.rapid += scoreEarned;
        newStats.rapidChange += scoreEarned;
      } else {
        newStats.blitz += scoreEarned;
        newStats.blitzChange += scoreEarned;
      }
    } else if (finalResult === "loss") {
      newStats.losses += 1;
      newStats.streak = 0;
      if (matchType === "Rapid") {
        newStats.rapid = Math.max(800, newStats.rapid + scoreEarned);
        newStats.rapidChange += scoreEarned;
      } else {
        newStats.blitz = Math.max(800, newStats.blitz + scoreEarned);
        newStats.blitzChange += scoreEarned;
      }
    } else {
      newStats.draws += 1;
    }

    const historyRecord: GameHistoryItem = {
      id: randomId,
      opponent: botLevelLabel,
      opponentRating: difficulty === "easy" ? 1200 : difficulty === "medium" ? 1800 : 2500,
      playerRatingAfter: matchType === "Rapid" ? newStats.rapid : newStats.blitz,
      gameType: matchType,
      duration: `${initialTimeControlMinutes} min`,
      result: finalResult,
      method: reason === "checkmate" ? "Checkmate" : reason === "timeout" ? "Timeout" : "Draw",
      ratingChange: scoreEarned,
      date: currentDate,
    };

    onUpdateStats(newStats, historyRecord);
  };

  // Quick resign button
  const handleResign = () => {
    if (!isPlaying || gameState !== "ongoing") return;
    handleGameOver("checkmate", playerColor === "w" ? "b" : "w");
  };

  // Formatting clock counters
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Scanning captured chips
  const getCapturedMaterial = () => {
    const initialCounts = { p: 8, r: 2, n: 2, b: 2, q: 1 };
    const whiteRemains = { p: 0, r: 0, n: 0, b: 0, q: 0 };
    const blackRemains = { p: 0, r: 0, n: 0, b: 0, q: 0 };

    chess.board().forEach((row) => {
      row.forEach((piece) => {
        if (piece && piece.type !== "k") {
          const t = piece.type as keyof typeof whiteRemains;
          if (piece.color === "w") whiteRemains[t]++;
          else blackRemains[t]++;
        }
      });
    });

    // Captured white material is missing white pieces
    const capturedWhite: string[] = [];
    Object.keys(initialCounts).forEach((key) => {
      const k = key as keyof typeof whiteRemains;
      const count = initialCounts[k] - whiteRemains[k];
      for (let i = 0; i < count; i++) capturedWhite.push(k);
    });

    // Captured black material is missing black pieces
    const capturedBlack: string[] = [];
    Object.keys(initialCounts).forEach((key) => {
      const k = key as keyof typeof blackRemains;
      const count = initialCounts[k] - blackRemains[k];
      for (let i = 0; i < count; i++) capturedBlack.push(k);
    });

    // Calculate trade evaluation points
    // p=1, n=3, b=3, r=5, q=9
    const valMap = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let scoreW = 0;
    let scoreB = 0;
    capturedBlack.forEach((p) => (scoreW += valMap[p as keyof typeof valMap] || 0));
    capturedWhite.forEach((p) => (scoreB += valMap[p as keyof typeof valMap] || 0));

    return {
      capturedWhite, // Pieces user has eaten (if playing as black)
      capturedBlack, // Pieces user has eaten (if playing as white)
      relativeDifference: scoreW - scoreB,
    };
  };

  const materialInfo = getCapturedMaterial();
  const opponentName =
    difficulty === "easy" ? "Fischer (Bot)" : difficulty === "medium" ? "Kasparov (Bot)" : "Magnus (GM)";
  const opponentRatingLabel = difficulty === "easy" ? "1200" : difficulty === "medium" ? "1800" : "2500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-5xl mx-auto animate-fade-in pb-10">
      {/* 8-COLUMN LEFT CHESSBOARD MODULE */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        {/* Opponent Profile Header */}
        <div className="bg-surface-charcoal rounded-xl p-3 shadow-md border border-surface-container-highest flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border-2 border-primary/25 overflow-hidden shadow-inner">
              <Swords className="text-primary w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface text-sm sm:text-base">{opponentName}</span>
                <span className="text-xs text-on-surface-variant font-mono bg-surface-container-low px-1.5 py-0.5 rounded border border-surface-container">
                  {opponentRatingLabel}
                </span>
              </div>
              {/* Material captured info */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                  {(playerColor === "w" ? materialInfo.capturedBlack : materialInfo.capturedWhite).map((p, idx) => (
                    <div key={idx} className="w-4 h-4 bg-surface-container-high hover:scale-110 transition-transform rounded flex items-center justify-center p-0.5 border border-surface-container-highest" title={p.toUpperCase()}>
                      <ChessPiece type={p as any} color={playerColor === "w" ? "b" : "w"} />
                    </div>
                  ))}
                </div>
                {materialInfo.relativeDifference > 0 && playerColor === "w" && (
                  <span className="text-[10px] bg-primary/20 text-primary font-bold px-1.5 rounded-full">
                    +{materialInfo.relativeDifference}
                  </span>
                )}
                {materialInfo.relativeDifference < 0 && playerColor === "b" && (
                  <span className="text-[10px] bg-primary/20 text-primary font-bold px-1.5 rounded-full">
                    +{-materialInfo.relativeDifference}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clock digital timer */}
          <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-base sm:text-lg tabular-nums flex items-center gap-1.5 transition-colors ${
            chess.turn() !== playerColor && isPlaying && gameState === "ongoing"
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
              : "bg-surface-container text-on-surface-variant border-surface-container-highest"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            {formatTime(botTime)}
          </div>
        </div>

        {/* The Live Board Canvas */}
        <div className="relative">
          <ChessBoard
            chess={chess}
            onMove={handleUserMove}
            isInteractive={isPlaying && gameState === "ongoing" && chess.turn() === playerColor}
            isFlipped={isFlipped}
            lastMove={lastMove}
          />

          {/* Result Alert overlay */}
          {gameState !== "ongoing" && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-xl z-30 animate-fade-in">
              <Award className="text-action-gold w-16 h-16 animate-bounce mb-3" />
              <h2 className="text-2xl font-bold text-on-surface capitalize tracking-tight">{gameState} Finished</h2>
              <p className="text-on-surface-variant max-w-[320px] mt-2 mb-5 text-sm leading-relaxed">{winnerMessage}</p>
              <button
                onClick={() => startNewGame(playerColor)}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-bold btn-3d text-sm shadow-md flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} /> Play Again
              </button>
            </div>
          )}
        </div>

        {/* Player Profile Footer */}
        <div className="bg-surface-charcoal rounded-xl p-3 shadow-md border border-surface-container-highest flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold border-2 border-primary overflow-hidden">
              <span className="text-primary font-mono text-xs font-black">PRO</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface text-sm sm:text-base">GrandmasterPlayer</span>
                <span className="text-xs text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">
                  {initialTimeControlMinutes <= 3 ? stats.blitz : stats.rapid}
                </span>
              </div>
              {/* Captured material */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                  {(playerColor === "w" ? materialInfo.capturedWhite : materialInfo.capturedBlack).map((p, idx) => (
                    <div key={idx} className="w-4 h-4 bg-surface-container-high hover:scale-110 transition-transform rounded flex items-center justify-center p-0.5 border border-surface-container-highest" title={p.toUpperCase()}>
                      <ChessPiece type={p as any} color={playerColor === "w" ? "w" : "b"} />
                    </div>
                  ))}
                </div>
                {materialInfo.relativeDifference < 0 && playerColor === "w" && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-1.5 rounded-full">
                    {materialInfo.relativeDifference}
                  </span>
                )}
                {materialInfo.relativeDifference > 0 && playerColor === "b" && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-1.5 rounded-full">
                    {-materialInfo.relativeDifference}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clock digital timer */}
          <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-base sm:text-lg tabular-nums flex items-center gap-1.5 transition-colors ${
            chess.turn() === playerColor && isPlaying && gameState === "ongoing"
              ? "bg-primary-container/20 text-primary border-primary/40 animate-pulse"
              : "bg-surface-container text-on-surface-variant border-surface-container-highest"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            {formatTime(playerTime)}
          </div>
        </div>
      </div>

      {/* 4-COLUMN RIGHT ACTIVE METRICS SIDE PANEL */}
      <div className="lg:col-span-5 space-y-4">
        {/* Game Rules Config or Match Control */}
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest space-y-3">
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Battle Settings</h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "easy", name: "Fischer", elo: "1200" },
              { id: "medium", name: "Kasparov", elo: "1800" },
              { id: "hard", name: "Magnus", elo: "GM 2500" },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setDifficulty(lvl.id as any)}
                disabled={isPlaying && gameState === "ongoing"}
                className={`p-2 rounded-lg border text-center transition-all ${
                  difficulty === lvl.id
                    ? "bg-primary-container text-on-primary-container border-primary font-bold shadow-md"
                    : "bg-surface-container text-on-surface-variant border-surface-container-highest hover:bg-surface-bright"
                } disabled:opacity-40`}
              >
                <p className="text-xs">{lvl.name}</p>
                <p className="text-[9px] opacity-80 mt-0.5 font-mono">{lvl.elo}</p>
              </button>
            ))}
          </div>

          {/* Color Selector */}
          {!isPlaying && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Play as Color:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => startNewGame("w")}
                  className="flex-1 py-1.5 bg-[#FFFFF0] text-black border border-neutral-300 rounded-md font-bold text-xs select-none hover:bg-white flex items-center justify-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-full bg-white border border-neutral-400"></span> White
                </button>
                <button
                  onClick={() => startNewGame("b")}
                  className="flex-1 py-1.5 bg-[#2E2B28] text-white border border-neutral-700 rounded-md font-bold text-xs select-none hover:bg-[#3E3A36] flex items-center justify-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-neutral-600"></span> Black
                </button>
              </div>
            </div>
          )}

          {/* Tactics controls */}
          <div className="flex gap-2 pt-2 border-t border-surface-container">
            <button
              onClick={() => setIsFlipped((f) => !f)}
              className="flex-1 py-2 bg-surface-container text-on-surface hover:bg-surface-bright rounded-md text-xs font-bold border border-surface-container-highest flex items-center justify-center gap-1 shadow-inner active:scale-95"
            >
              <Navigation size={13} className="rotate-45" /> Flip Board
            </button>
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className="px-3 py-2 bg-surface-container text-on-surface hover:bg-surface-bright rounded-md text-xs font-bold border border-surface-container-highest flex items-center justify-center"
              title="Toggle Move Audio"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            {isPlaying && gameState === "ongoing" && (
              <button
                onClick={handleResign}
                className="flex-1 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-md text-xs font-bold border border-rose-500/20 flex items-center justify-center gap-1 active:scale-95"
              >
                <ShieldAlert size={13} /> Resign Match
              </button>
            )}
            {!isPlaying && (
              <button
                onClick={() => startNewGame(playerColor)}
                className="flex-1 py-2 bg-primary-container text-on-primary-container hover:scale-[1.02] rounded-md text-xs font-bold btn-3d flex items-center justify-center gap-1"
              >
                <Play size={13} className="fill-current" /> Initialize
              </button>
            )}
          </div>
        </div>

        {/* AI COACHING MENTOR CONTAINER */}
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest flex flex-col gap-3 relative">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-action-gold animate-spin" />
              AI Studio Grandmaster Coach
            </h4>
            <div className="p-1 rounded-full bg-primary/10 text-primary">
              <MessageCircle size={15} />
            </div>
          </div>

          <div className="relative bg-surface-container-lowest p-3 rounded-lg border border-surface-container max-h-[140px] overflow-y-auto min-h-[70px] flex items-center justify-center">
            {isCoachLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span className="text-[11px] text-on-surface-variant font-mono">Grandmaster analyzing position FEN...</span>
              </div>
            ) : (
              <p className="text-xs text-on-surface/90 leading-relaxed font-sans">{coachComment}</p>
            )}
          </div>
        </div>

        {/* Move History scroll box */}
        <div className="bg-surface-charcoal rounded-xl shadow-xl border border-surface-container-highest overflow-hidden flex flex-col max-h-[180px]">
          <div className="p-3 bg-surface-container-high/40 border-b border-surface-container flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Move Log</span>
            <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded">
              Moves: {Math.ceil(chess.history().length / 2)}
            </span>
          </div>

          <div className="p-3 overflow-y-auto flex-1 font-mono text-xs h-[110px] space-y-1 scrolling-container">
            {chess.history().length === 0 ? (
              <div className="text-center text-on-surface-variant opacity-60 italic py-6">
                Waiting for matches to ignite...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                {chess.history({ verbose: true }).reduce<(React.ReactNode)[][]>((acc, m, idx) => {
                  if (idx % 2 === 0) {
                    acc.push([
                      <div key={idx} className="flex gap-2">
                        <span className="text-on-surface-variant">{Math.floor(idx / 2) + 1}.</span>
                        <span className="font-bold text-on-surface">{m.san}</span>
                      </div>,
                    ]);
                  } else {
                    acc[acc.length - 1].push(
                      <div key={idx} className="text-primary font-bold">
                        {m.san}
                      </div>
                    );
                  }
                  return acc;
                }, []).map((row, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex justify-between border-b border-surface-container/30 pb-0.5">
                      {row[0]}
                      {row[1] || <span className="opacity-0">-</span>}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
