import { Puzzle } from "../types";

export const CURATED_PUZZLES: Puzzle[] = [
  {
    id: "p1",
    title: "The Greek Gift Sacrifice",
    initialFen: "r1bqk2r/ppp2ppp/2n1p3/3p4/3Pn3/2PBPN2/PP1N1PPP/R2QK2R w KQkq - 0 1",
    solution: ["d3h7", "e8h7", "f3g5"], // White bishop sacrifice on h7 (Greek gift)
    rating: 1420,
    description: "Classical bishop sacrifice on h7. Find the winning combination to expose the black king.",
    colorToMove: "white"
  },
  {
    id: "p2",
    title: "Anastasia's Mate Motif",
    initialFen: "5r1k/1p4pp/p3Q3/3N4/8/1P6/P1q3PP/4R1K1 b - - 0 1",
    solution: ["c2f2", "g1h1", "f2f1", "e1f1", "f8f1"], // Back-rank mating threat
    rating: 1350,
    description: "A sudden weakness in white's back rank. Force the checkmate sequence.",
    colorToMove: "black"
  },
  {
    id: "p3",
    title: "Smothered Mate Combination",
    initialFen: "r1b2r1k/ppp3pp/2n5/2b1NpN1/2B1p3/2P5/PP3PPP/R1B2RK1 w - - 0 1",
    solution: ["e5f7", "f8f7", "g5f7", "h8g8"], // Preparing the double check
    rating: 1680,
    description: "Utilize your active knights to corner the black king. Find the tactical sequence.",
    colorToMove: "white"
  },
  {
    id: "p4",
    title: "Deflection to Queen Fork",
    initialFen: "r3k2r/ppqnbpp1/2p2np1/3p4/3P2P1/1QNBP2P/PP3P2/R1B1K2R b KQkq - 0 1",
    solution: ["f6g4", "h3g4", "h8h1"], // Winning the rook on h1
    rating: 1550,
    description: "Tactical deflection of the h3 pawn. Find how to win wood on the kingside.",
    colorToMove: "black"
  },
  {
    id: "p5",
    title: "Intermezzo (In-Between Move)",
    initialFen: "r4rk1/ppp1qpbp/2np1np1/4p3/3PP3/1PNB1Q1P/PBP2PP1/R4RK1 w - - 0 1",
    solution: ["d4d5", "c6d4", "f3d1"], // Blocking square and repositioning
    rating: 1210,
    description: "Establish center control as White. Gain a valuable tempo on the Black knight.",
    colorToMove: "white"
  }
];
