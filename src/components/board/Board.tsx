"use client";

import { useGameStore } from "@/store/gameStore";
import { Square } from "./Square";
import { PromotionModal } from "./PromotionModal";

export function Board() {
  const { game, highlights, selectSquare, promotePawn, pendingPromotion } =
    useGameStore();

  return (
    <div className="relative">
      <div className="chess-board w-[min(90vw,560px)]">
        {game.board.map((row, rowIndex) =>
          row.map((square, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const key = `${rowIndex}-${colIndex}`;
            const highlight = highlights.get(key);

            return (
              <Square
                key={key}
                position={square.position}
                piece={square.piece}
                highlight={highlight}
                isLight={isLight}
                onClick={selectSquare}
              />
            );
          })
        )}
      </div>

      {pendingPromotion && (
        <PromotionModal
          color={game.currentTurn}
          onSelect={promotePawn}
        />
      )}
    </div>
  );
}
