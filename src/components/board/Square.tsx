import type { Position, Piece } from "@/types/chess";
import { ChessPiece } from "@/components/pieces/ChessPiece";
import { clsx } from "clsx";

interface SquareProps {
  position: Position;
  piece: Piece | null;
  highlight: string | undefined;
  isLight: boolean;
  onClick: (pos: Position) => void;
}


function getSquareColor(isLight: boolean, highlight: string | undefined): string {
  switch (highlight) {
    case "selected":
      return "bg-board-selected";
    case "check":
      return "bg-board-danger animate-[pulseCheck_1s_ease-in-out_infinite]";
    case "last-move-from":
    case "last-move-to":
      return isLight ? "bg-[#cdd26a]" : "bg-[#aaa23a]";
    default:
      return isLight ? "bg-board-light" : "bg-board-dark";
  }
}

function LegalMoveIndicator({ hasCapture }: { hasCapture: boolean }) {
  if (hasCapture) {
    return (
      <div className="absolute inset-0 rounded-none border-4 border-black/20 pointer-events-none z-10" />
    );
  }
  return (
    <div className="absolute w-[30%] h-[30%] rounded-full bg-black/20 pointer-events-none z-10" />
  );
}


function CoordLabels({
  position,
  isLight,
}: {
  position: Position;
  isLight: boolean;
}) {
  const labelColor = isLight ? "text-board-dark" : "text-board-light";
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <>
      {position.col === 0 && (
        <span
          className={clsx(
            "board-coords top-0.5 left-1",
            labelColor
          )}
        >
          {8 - position.row}
        </span>
      )}
      {position.row === 7 && (
        <span
          className={clsx(
            "board-coords bottom-0.5 right-1",
            labelColor
          )}
        >
          {files[position.col]}
        </span>
      )}
    </>
  );
}

export function Square({ position, piece, highlight, isLight, onClick }: SquareProps) {
  const isLegalMove = highlight === "legal-move";
  const isCapture = isLegalMove && piece !== null;

  return (
    <div
      className={clsx(
        "chess-square",
        getSquareColor(isLight, highlight),
        isLegalMove && "cursor-pointer"
      )}
      onClick={() => onClick(position)}
      role="button"
      aria-label={`Square ${position.row}-${position.col}`}
    >
      <CoordLabels position={position} isLight={isLight} />

      {isLegalMove && <LegalMoveIndicator hasCapture={isCapture} />}

      {piece && (
        <ChessPiece
          type={piece.type}
          color={piece.color}
          className="relative z-20"
        />
      )}
    </div>
  );
}
