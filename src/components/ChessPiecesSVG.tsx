import React from "react";

interface ChessPieceProps {
  type: "p" | "r" | "n" | "b" | "q" | "k"; // Pawn, Rook, Knight, Bishop, Queen, King
  color: "w" | "b"; // White, Black
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = "w-full h-full" }) => {
  const isWhite = color === "w";
  
  // High-fidelity standard styling variables matching premium flat Chess UI
  const fillColor = isWhite ? "#FFFFFF" : "#302E2B";
  const strokeColor = isWhite ? "#262421" : "#FAFAF8";
  const detailStrokeColor = isWhite ? "rgba(38, 36, 33, 0.5)" : "rgba(250, 250, 248, 0.5)";

  return (
    <svg
      viewBox="0 0 45 45"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {type === "p" && (
        // PAWN
        <g fill={fillColor} stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.85 3.87 2.22 5.19C15.91 26.96 14 29.25 14 32v4h17v-4c0-2.75-1.91-5.04-4.22-6.81C28.15 24.87 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
          <path d="M22.5 9v12" stroke={detailStrokeColor} strokeWidth="1" strokeLinecap="round" />
        </g>
      )}

      {type === "r" && (
        // ROOK
        <g fill={fillColor} stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zm3-13h21v3H12v-3zm0-14h21v4H12v-4z" />
          <path d="M14 26V16h17v10H14z" />
          <path d="M14 12V9h3v2h4V9h3v2h4V9h3v2h4V9h3v3H14z" />
          <path d="M11 36v-7h23v7H11z" />
          <path d="M22.5 12v20" stroke={detailStrokeColor} strokeWidth="1" />
        </g>
      )}

      {type === "n" && (
        // KNIGHT
        <g fill={fillColor} stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 22,10 C 22,10 19,11 16,15 C 13,19 13,23 13,23 C 13,23 14,21 16,20 C 18,19 20,20 20,20 C 20,20 18,21 17,23 C 16,25 16,28 17,29 C 18,30 20,30 21,29 C 22,28 23,26 23,26 C 23,26 23,29 21,31 C 19,33 16,33 16,33 C 16,33 19,34 23,34 C 27,33 29,31 31,28 C 33,25 35,22 35,22 C 35,22 36,25 38,25 C 40,25 38,20 37,17 C 36,14 34,12 31,11 C 28,10 25,10 22,10 z" />
          <path d="M 9.5 25.5 A 0.5 0.5 0 1 1  8.5,25.5 A 0.5 0.5 0 1 1  9.5 25.5 z" transform="matrix(0.861785,0.507278,-0.507278,0.861785,31.5,-4)" fill={strokeColor} stroke="none" />
          <path d="M 20 38 L 33 38 L 31 41 L 12 41 z" />
        </g>
      )}

      {type === "b" && (
        // BISHOP
        <g fill={fillColor} stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 36h27v-3H9v3zm13.5-31c-3.11 0-5.62 3.5-5.62 6.5 0 1.25.33 2.41.91 3.5C15.35 16.5 14 18.59 14 21c0 3.31 2.69 6 6 6h5c3.31 0 6-2.69 6-6 0-2.41-1.35-4.5-3.79-6C27.79 13.91 28.12 12.75 28.12 11.5c0-3-2.51-6.5-5.62-6.5z" />
          <circle cx="22.5" cy="5" r="1.5" fill={strokeColor} stroke="none" />
          <path d="M22.5 10v11M19.5 13h6" stroke={detailStrokeColor} strokeWidth="1.5" />
        </g>
      )}

      {type === "q" && (
        // QUEEN
        <g fill={fillColor} stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zm3-13l3 10h15l3-10H12z" />
          <path d="M9 26l4.5-12 4.5 12 4.5-12 4.5 12 4.5-12 4.5 12" />
          <circle cx="9" cy="14" r="1.5" fill={strokeColor} stroke="none" />
          <circle cx="18" cy="14" r="1.5" fill={strokeColor} stroke="none" />
          <circle cx="27" cy="14" r="1.5" fill={strokeColor} stroke="none" />
          <circle cx="36" cy="14" r="1.5" fill={strokeColor} stroke="none" />
          <path d="M22.5 14V33" stroke={detailStrokeColor} strokeWidth="1.2" />
        </g>
      )}

      {type === "k" && (
        // KING
        <g fill={fillColor} stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zm13.5-31V5M20 6.5h5" stroke={strokeColor} strokeWidth="1.5" />
          <path d="M11.5 30C11.5 30 14 26 18 26h9c4 0 6.5 4 6.5 4v6h-22v-6z" />
          <path d="M12 21.5c0-2.48 2.02-4.5 4.5-4.5h12c2.48 0 4.5 2.02 4.5 4.5V26H12v-4.5z" />
          <path d="M22.5 10v20" stroke={detailStrokeColor} strokeWidth="1.2" />
        </g>
      )}
    </svg>
  );
};
