"use client";

import { useEffect, useRef } from "react";
import type { Move } from "@/types/chess";
import { formatMoveHistory } from "@/utils/notation";

interface MoveHistoryProps {
  moves: Move[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        Nenhuma jogada ainda
      </div>
    );
  }

  const pairs = formatMoveHistory(moves);

  return (
    <div className="overflow-y-auto max-h-48 space-y-0.5 pr-1 scrollbar-thin">
      {pairs.map((pair, i) => {
        const parts = pair.split(" ");
        const number = parts[0];
        const white = parts[1];
        const black = parts[2];

        const whiteIdx = i * 2;
        const blackIdx = i * 2 + 1;
        const isLastWhite = whiteIdx === moves.length - 1;
        const isLastBlack = blackIdx === moves.length - 1;

        return (
          <div key={i} className="flex gap-2 text-sm font-mono px-2 py-0.5 rounded hover:bg-white/5">
            <span className="text-gray-500 w-8 shrink-0">{number}</span>
            <span className={isLastWhite ? "text-white font-bold" : "text-gray-300"}>
              {white}
            </span>
            {black && (
              <span className={isLastBlack ? "text-white font-bold" : "text-gray-300"}>
                {black}
              </span>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
