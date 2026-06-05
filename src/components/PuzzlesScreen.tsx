import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { ChessBoard } from "./ChessBoard";
import { Puzzle } from "../types";
import { CURATED_PUZZLES } from "../data/puzzles";
import { Lightbulb, Award, ChevronRight, HelpCircle, AlertCircle, Puzzle as PuzzleIcon } from "lucide-react";

interface PuzzlesScreenProps {
  onUpdateStats: (newElo: number) => void;
  puzzleElo: number;
}

export const PuzzlesScreen: React.FC<PuzzlesScreenProps> = ({
  onUpdateStats,
  puzzleElo,
}) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Puzzle interactive states
  const [chess, setChess] = useState<Chess | null>(null);
  const [solutionStep, setSolutionStep] = useState<number>(0);
  const [puzzleState, setPuzzleState] = useState<"solving" | "correct" | "incorrect" | "completed">("solving");
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Load static puzzles
  useEffect(() => {
    setIsLoading(true);
    // Simulate slight network delay for UI consistency
    setTimeout(() => {
      setPuzzles(CURATED_PUZZLES);
      setIsLoading(false);
    }, 400);
  }, []);

  // Sync board with current puzzle index
  useEffect(() => {
    if (puzzles.length > 0 && currentPuzzleIdx < puzzles.length) {
      const activePuzzle = puzzles[currentPuzzleIdx];
      setChess(new Chess(activePuzzle.initialFen));
      setSolutionStep(0);
      setPuzzleState("solving");
      setLastMove(null);
      setFeedbackMsg(
        activePuzzle.colorToMove === "white"
          ? "White's turn to move and claim victory!"
          : "Black's turn to move and conquer!"
      );
    }
  }, [puzzles, currentPuzzleIdx]);

  const activePuzzle = puzzles[currentPuzzleIdx];

  const handlePuzzleMove = (from: string, to: string, promotion?: string) => {
    if (!chess || !activePuzzle || puzzleState === "completed") return;

    const uciMove = `${from}${to}`;
    const targetMove = activePuzzle.solution[solutionStep];

    const fresh = new Chess(chess.fen());
    try {
      // Test if user played the target solution move
      const testMoveObj = fresh.moves({ verbose: true }).find((m) => m.from === from && m.to === to);
      if (!testMoveObj) return; // Invalid chess move completely

      if (uciMove === targetMove || testMoveObj.lan === targetMove) {
        // CORRECT STEP!
        const actualMove = fresh.move({ from, to, promotion: promotion || "q" });
        setChess(fresh);
        setLastMove({ from: actualMove.from, to: actualMove.to });

        const nextStep = solutionStep + 1;

        if (nextStep >= activePuzzle.solution.length) {
          // PUZZLE INTEGRALLY SOLVED!
          setPuzzleState("completed");
          setFeedbackMsg("Masterfully calculated! Puzzle fully solved +15 rating points!");
          onUpdateStats(puzzleElo + 15);
        } else {
          // Play current opponent response counter-move in solution
          setPuzzleState("correct");
          setFeedbackMsg("Excellent move! Calculating opponent response...");

          setTimeout(() => {
            const opponentUci = activePuzzle.solution[nextStep];
            const opFrom = opponentUci.slice(0, 2);
            const opTo = opponentUci.slice(2, 4);

            const opMove = fresh.move({ from: opFrom, to: opTo, promotion: "q" });
            setChess(fresh);
            setLastMove({ from: opMove.from, to: opMove.to });
            setSolutionStep(nextStep + 1);
            setPuzzleState("solving");
            setFeedbackMsg("Opponent responded. What is your next tactical move?");
          }, 800);
        }
      } else {
        // INCORRECT STEP
        setPuzzleState("incorrect");
        setFeedbackMsg("Incorrect move. Look for a stronger tactical alternative!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getHint = () => {
    if (!activePuzzle) return;
    const target = activePuzzle.solution[solutionStep];
    const originPiece = target.slice(0, 2);
    setFeedbackMsg(`Hint: Move starts from square ${originPiece.toUpperCase()}!`);
  };

  const skipNextPuzzle = () => {
    if (puzzles.length > 0) {
      setCurrentPuzzleIdx((prev) => (prev + 1) % puzzles.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-sm text-on-surface-variant font-medium">Downloading curated study positions...</p>
      </div>
    );
  }

  if (puzzles.length === 0 || !chess || !activePuzzle) {
    return (
      <div className="text-center p-12 bg-surface-charcoal border border-surface-container-highest rounded-xl max-w-md mx-auto">
        <HelpCircle className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
        <p className="text-on-surface">Failed to retrieve puzzle data. Verify your local endpoint routing.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-5xl mx-auto pb-10">
      {/* LEFT CHESSBOARD BOX */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        {/* Banner metadata */}
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest flex justify-between items-center bg-gradient-to-r from-surface-charcoal to-surface-container-high">
          <div>
            <h2 className="font-headline-sm text-base sm:text-lg text-on-surface font-bold flex items-center gap-1.5">
              <span className="p-1 rounded bg-action-gold/15 text-action-gold shrink-0">
                <PuzzleIcon size={18} />
              </span>
              {activePuzzle.title}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">{activePuzzle.description}</p>
          </div>
          <span className="text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/25 px-2.5 py-1 rounded shrink-0">
            Rating: {activePuzzle.rating}
          </span>
        </div>

        {/* Board component */}
        <div className="relative">
          <ChessBoard
            chess={chess}
            onMove={handlePuzzleMove}
            isInteractive={puzzleState === "solving" || puzzleState === "incorrect"}
            isFlipped={activePuzzle.colorToMove === "black"}
            lastMove={lastMove}
          />

          {/* Success Banner Overlay */}
          {puzzleState === "completed" && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-xl z-30 animate-fade-in">
              <Award className="text-primary w-16 h-16 animate-bounce mb-3" />
              <h2 className="text-2xl font-bold text-on-surface">Puzzle Accomplished!</h2>
              <p className="text-on-surface-variant text-sm mt-1 mb-5">Rating Elo Increase: <span className="text-primary font-bold">+15</span></p>
              <button
                onClick={skipNextPuzzle}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-bold btn-3d text-sm shadow-md flex items-center justify-center gap-1.5"
              >
                Proceed Next <ScrollIndicator />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SOLUTIONS FEEDBACK CONTROL */}
      <div className="lg:col-span-5 space-y-4">
        {/* Statistics rating card */}
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">My Tactics Rating</p>
            <p className="text-2xl font-bold text-on-surface font-headline-sm mt-1">{puzzleElo} elo</p>
          </div>
          <div className="px-3 py-1.5 bg-action-gold/10 text-action-gold border border-action-gold/25 text-xs font-bold rounded-lg uppercase tracking-wider">
            Silver Tier
          </div>
        </div>

        {/* Solves instructions card */}
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest space-y-4">
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Tactics Lab Solutions</h3>

          <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
            puzzleState === "completed"
              ? "bg-primary/10 border-primary/35 text-primary-fixed"
              : puzzleState === "incorrect"
              ? "bg-error/10 border-error/35 text-error"
              : "bg-surface-container text-on-surface border-surface-container-highest"
          }`}>
            <span className="mt-0.5">
              {puzzleState === "completed" ? (
                <Award className="text-primary" />
              ) : puzzleState === "incorrect" ? (
                <AlertCircle className="text-error" />
              ) : (
                <Lightbulb className="text-action-gold" />
              )}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {puzzleState === "completed"
                  ? "Puzzles Solved!"
                  : puzzleState === "incorrect"
                  ? "Tactical Warning!"
                  : "Active Instructions"}
              </p>
              <p className="text-sm font-medium mt-1 leading-relaxed">{feedbackMsg}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={getHint}
              disabled={puzzleState === "completed"}
              className="flex-1 py-2.5 bg-surface-container text-on-surface hover:bg-surface-bright rounded-md text-xs font-bold border border-surface-container-highest flex items-center justify-center gap-1 shadow-inner active:scale-95 disabled:opacity-40"
            >
              Get Hint
            </button>
            <button
              onClick={skipNextPuzzle}
              className="flex-1 py-2.5 bg-primary-container text-on-primary-container hover:scale-[1.02] rounded-md text-xs font-bold btn-3d flex items-center justify-center gap-1.5"
            >
              Skip Puzzle <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* List of general tactical motifs */}
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest">
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-3">Tactical Motifs</h3>
          <ul className="space-y-2">
            {[
              { motif: "Greek Gift Sacrifice", desc: "A classic bishop sacrifice on the h7/h2 square." },
              { motif: "Anastasia's Back-Rank Mate", desc: "Rook checkmates the king on the edge file." },
              { motif: "Smothered Knight Mate", desc: "Checkmate sequence when king is trapped in own pieces." },
            ].map((mItem, idx) => (
              <li key={idx} className="p-2.5 bg-surface-container rounded-lg border border-surface-container-highest text-xs">
                <p className="font-bold text-on-surface">{mItem.motif}</p>
                <p className="text-on-surface-variant font-medium mt-0.5">{mItem.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const ScrollIndicator = () => (
  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
  </svg>
);
