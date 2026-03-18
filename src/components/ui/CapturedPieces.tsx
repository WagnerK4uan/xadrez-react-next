import type { Color, Piece } from "@/types/chess";
import { ChessPiece } from "@/components/pieces/ChessPiece";
import { PIECE_VALUES } from "@/utils/helpers";

interface CapturedPiecesProps {
  pieces: Piece[];
  capturedBy: Color;
  advantage: number;
}

export function CapturedPieces({ pieces, capturedBy, advantage }: CapturedPiecesProps) {
  const sorted = [...pieces].sort(
    (a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]
  );

  const showAdvantage = capturedBy === "white" ? advantage > 0 : advantage < 0;
  const absAdvantage = Math.abs(advantage);

  return (
    <div className="flex items-center gap-1 h-7 flex-wrap">
      {sorted.map((piece, i) => (
        <div key={i} className="w-5 h-5 opacity-80">
          <ChessPiece type={piece.type} color={piece.color} />
        </div>
      ))}
      {showAdvantage && absAdvantage > 0 && (
        <span className="text-gray-400 text-sm font-medium ml-1">
          +{absAdvantage}
        </span>
      )}
    </div>
  );
}
