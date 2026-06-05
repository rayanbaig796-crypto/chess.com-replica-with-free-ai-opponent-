import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { ChessPiece } from "./ChessPiecesSVG";

interface ChessBoardProps {
  chess: Chess;
  onMove: (from: string, to: string, promotion?: string) => void;
  isInteractive: boolean;
  isFlipped: boolean; // false = White at bottom, true = Black at bottom
  lastMove?: { from: string; to: string } | null;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  onMove,
  isInteractive,
  isFlipped,
  lastMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState<{ from: string; to: string } | null>(null);

  // Clear selection if FEN or turn changes externally
  useEffect(() => {
    setSelectedSquare(null);
    setLegalTargets([]);
  }, [chess]);

  const board = chess.board();
  const turn = chess.turn();

  // Find King of current turn to show red glow if in check
  const inCheck = chess.inCheck();
  let checkSquare: string | null = null;
  if (inCheck) {
    // Find King positions
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === "k" && piece.color === turn) {
          checkSquare = piece.square;
        }
      }
    }
  }

  // Get rank/file indices based on flip orientation
  const rowIndices = isFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const colIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleSquareClick = (squareRepresentation: string) => {
    if (!isInteractive) return;

    // If currently showing promotion overlay, ignore clicks underneath
    if (isPromoting) return;

    const piece = chess.get(squareRepresentation as Square);

    // Click on currently selected square to deselect
    if (selectedSquare === squareRepresentation) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    // Click on a valid target square to execute move
    if (legalTargets.includes(squareRepresentation)) {
      if (selectedSquare) {
        // Check if movement is a pawn promotion (reached 8th/1st rank)
        const activePiece = chess.get(selectedSquare as Square);
        const isPawn = activePiece?.type === "p";
        const targetRank = squareRepresentation[1];
        const isPromotionRank = targetRank === "8" || targetRank === "1";

        if (isPawn && isPromotionRank) {
          setIsPromoting({ from: selectedSquare, to: squareRepresentation });
        } else {
          onMove(selectedSquare, squareRepresentation);
          setSelectedSquare(null);
          setLegalTargets([]);
        }
      }
      return;
    }

    // Click on player's own pieces to select and view legal moves
    if (piece && piece.color === turn) {
      setSelectedSquare(squareRepresentation);
      // Retrieve legal moves using chess.js
      const moves = chess.moves({ square: squareRepresentation as Square, verbose: true });
      const targets = moves.map((m) => m.to);
      setLegalTargets(targets);
    } else {
      // Clear selection if clicking on void or opponent piece when not a valid legal destination
      setSelectedSquare(null);
      setLegalTargets([]);
    }
  };

  const handlePromotionSelect = (pieceCode: string) => {
    if (isPromoting) {
      onMove(isPromoting.from, isPromoting.to, pieceCode);
      setIsPromoting(null);
      setSelectedSquare(null);
      setLegalTargets([]);
    }
  };

  return (
    <div id="chessboard-container" className="relative w-full aspect-square max-w-[480px] bg-surface-container-lowest rounded-xl p-2 border-4 border-surface-container-highest shadow-2xl overflow-hidden select-none mx-auto sm:p-3">
      {/* 8x8 Chessboard Slots */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-md overflow-hidden">
        {rowIndices.map((row) => {
          return colIndices.map((col) => {
            const squareName = `${files[col]}${ranks[row]}`;
            const piece = board[7 - row][col]; // chess.js tracks black on row 0, white on row 7 internally
            const isLightSquare = (row + col) % 2 !== 0;

            // Compute background classes
            let squareBg = isLightSquare ? "bg-board-light text-board-dark" : "bg-board-dark text-board-light";

            // Visual enhancements: last move highlighting
            const isHighlighted =
              lastMove && (lastMove.from === squareName || lastMove.to === squareName);
            if (isHighlighted) {
              squareBg = isLightSquare
                ? "bg-amber-100/90 border border-amber-300"
                : "bg-[#8CA272]/95 border border-amber-400";
            }

            // Highlighting piece coordinates
            const isSelected = selectedSquare === squareName;
            const isTarget = legalTargets.includes(squareName);
            const isKingInCheck = checkSquare === squareName;

            return (
              <div
                key={squareName}
                id={`square-${squareName}`}
                onClick={() => handleSquareClick(squareName)}
                className={`relative flex items-center justify-center cursor-pointer transition-all duration-100 ${squareBg} ${
                  isSelected ? "ring-4 ring-primary ring-inset z-15" : ""
                } ${isKingInCheck ? "animate-pulse ring-4 ring-rose-500 ring-inset shadow-[0_0_15px_rgba(244,63,94,0.7)] z-15" : ""}`}
                style={{ contentVisibility: "auto" }}
              >
                {/* Chess Piece Vector Render */}
                {piece && (
                  <div className="w-[82%] h-[82%] transition-transform duration-100 hover:scale-105 active:scale-95 flex items-center justify-center z-10">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Tactical Overlays (Legal Move Indicator Dot/Ring) */}
                {isTarget && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    {piece ? (
                      // If target contains opponent piece, draw a hollow target grab ring
                      <div className="w-[78%] h-[78%] rounded-full border-4 border-primary/75 animate-pulse" />
                    ) : (
                      // If target is empty, draw a centered guide dot
                      <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-primary/75 shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
                    )}
                  </div>
                )}

                {/* Chess Coordinate Annotations inside edge squares */}
                {/* Files are on the bottom row */}
                {((!isFlipped && row === 0) || (isFlipped && row === 7)) && (
                  <span className={`absolute bottom-0.5 right-1 text-[9px] font-bold opacity-45 pointer-events-none font-mono ${
                    isLightSquare ? "text-board-dark" : "text-board-light"
                  }`}>
                    {files[col]}
                  </span>
                )}
                {/* Ranks are on the left column */}
                {((!isFlipped && col === 0) || (isFlipped && col === 7)) && (
                  <span className={`absolute top-0.5 left-1 text-[9px] font-bold opacity-45 pointer-events-none font-mono ${
                    isLightSquare ? "text-board-dark" : "text-board-light"
                  }`}>
                    {ranks[row]}
                  </span>
                )}
              </div>
            );
          });
        })}
      </div>

      {/* PAWN PROMOTION TACTILE DRAWER OVERLAY */}
      {isPromoting && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-surface-charcoal border-2 border-surface-container-highest p-5 rounded-xl max-w-[280px] text-center shadow-2xl animate-scale-up space-y-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Pawn Promotion</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Select the piece you want your pawn to promote to:</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: "q", label: "Queen" },
                { type: "r", label: "Rook" },
                { type: "b", label: "Bishop" },
                { type: "n", label: "Knight" },
              ].map((pOpt) => (
                <button
                  key={pOpt.type}
                  onClick={() => handlePromotionSelect(pOpt.type)}
                  className="p-2.5 bg-surface-container-high rounded-lg border border-surface-container-highest hover:bg-primary-container hover:text-on-primary-container transition-all flex flex-col items-center gap-1 active:scale-95"
                >
                  <div className="w-10 h-10">
                    <ChessPiece type={pOpt.type as any} color={chess.turn()} />
                  </div>
                  <span className="font-label-bold text-[9px] uppercase tracking-wider">{pOpt.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsPromoting(null)}
              className="mt-2 text-xs font-semibold text-error hover:underline px-4 py-1.5 bg-surface-container rounded-md w-full"
            >
              Cancel Move
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
