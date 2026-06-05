import { Chess, Square } from "chess.js";

// Piece weights
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables - Positional evaluation (Higher values mean preferred positions for White)
// Indices map to the chessboard where rank 8 is top row, rank 1 is bottom row
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [ 0,  0,  0,  5,  5,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  5,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDDLE_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

/**
 * Perform a static evaluation of the chessboard.
 * A positive value means White stands better; negative means Black stands better.
 */
export function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const type = piece.type;
      const color = piece.color;
      let pieceVal = PIECE_VALUES[type];

      // Reverse PST coordinates for Black since tables are configured for White
      const pY = color === "w" ? r : 7 - r;
      const pX = color === "w" ? c : 7 - c;

      let positionVal = 0;
      switch (type) {
        case "p":
          positionVal = PAWN_PST[pY][pX];
          break;
        case "n":
          positionVal = KNIGHT_PST[pY][pX];
          break;
        case "b":
          positionVal = BISHOP_PST[pY][pX];
          break;
        case "r":
          positionVal = ROOK_PST[pY][pX];
          break;
        case "q":
          positionVal = QUEEN_PST[pY][pX];
          break;
        case "k":
          positionVal = KING_MIDDLE_PST[pY][pX];
          break;
      }

      const totalVal = pieceVal + positionVal;
      if (color === "w") {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  return score;
}

/**
 * Minimax with Alpha-Beta pruning.
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): { score: number; move: string | null } {
  // Base case: game over or max depth reached
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess), move: null };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluateBoard(chess), move: null };
  }

  // Simple move ordering: captures and promotions evaluated first to increase Alpha-Beta cuts
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10;
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10;
    if (a.promotion) scoreA += 900;
    if (b.promotion) scoreB += 900;
    return scoreB - scoreA;
  });

  let bestMove: string | null = null;

  if (isMaximizingPlayer) {
    let maxScore = -Infinity;
    for (const move of moves) {
      chess.move(move.lan);
      const { score } = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      if (score > maxScore) {
        maxScore = score;
        bestMove = move.lan;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break; // Beta cut-off
      }
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      chess.move(move.lan);
      const { score } = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (score < minScore) {
        minScore = score;
        bestMove = move.lan;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        break; // Alpha cut-off
      }
    }
    return { score: minScore, move: bestMove };
  }
}

/**
 * Compute the optimal chess move based on active difficulty level.
 * @param fen Chess position in FEN string format
 * @param difficulty 'easy' | 'medium' | 'hard'
 */
export function getBotMove(fen: string, difficulty: "easy" | "medium" | "hard" = "hard"): string | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return null;

  // Easy / Fischer level (Depth 1 with high randomness)
  if (difficulty === "easy") {
    // 60% chance of playing a random move, 40% chance of depth 1 search
    if (Math.random() < 0.6) {
      const randomIdx = Math.floor(Math.random() * moves.length);
      return moves[randomIdx].lan;
    }
    const result = minimax(chess, 1, -Infinity, Infinity, chess.turn() === "w");
    return result.move;
  }

  // Medium / Kasparov level (Depth 2)
  if (difficulty === "medium") {
    // 20% chance of randomizing among top moves to prevent repetitive play
    if (Math.random() < 0.25) {
      const randomIdx = Math.floor(Math.random() * moves.length);
      return moves[randomIdx].lan;
    }
    const result = minimax(chess, 2, -Infinity, Infinity, chess.turn() === "w");
    return result.move;
  }

  // Hard / Magnus Level (Depth 3 with comprehensive PST values)
  const result = minimax(chess, 3, -Infinity, Infinity, chess.turn() === "w");
  return result.move;
}
