import type { Color, PieceType } from "@/types/chess";
import { ChessPiece } from "@/components/pieces/ChessPiece";

interface PromotionModalProps {
  color: Color;
  onSelect: (piece: PieceType) => void;
}

const PROMOTION_CHOICES: PieceType[] = ["queen", "rook", "bishop", "knight"];

export function PromotionModal({ color, onSelect }: PromotionModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-200 border border-gray-600 rounded-xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-in-out]">
        <h3 className="text-white text-center font-bold text-lg mb-4">
          Promover peão
        </h3>
        <div className="flex gap-3">
          {PROMOTION_CHOICES.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="w-16 h-16 bg-surface-300 hover:bg-board-selected rounded-lg flex items-center justify-center transition-colors cursor-pointer border-2 border-transparent hover:border-white/40"
              title={piece}
            >
              <ChessPiece type={piece} color={color} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
