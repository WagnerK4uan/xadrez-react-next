import type { GameStatus, Color } from "@/types/chess";

interface GameStatusProps {
  status: GameStatus;
  currentTurn: Color;
  winner: Color | null;
}

const STATUS_LABELS: Record<GameStatus, string> = {
  idle: "Aguardando...",
  playing: "",
  check: "Xeque!",
  checkmate: "Xeque-mate!",
  stalemate: "Afogamento! Empate",
  draw: "Empate",
};

const TURN_LABELS: Record<Color, string> = {
  white: "Vez das Brancas",
  black: "Vez das Pretas",
};

export function GameStatusBadge({ status, currentTurn, winner }: GameStatusProps) {
  const isGameOver = status === "checkmate" || status === "stalemate" || status === "draw";

  if (isGameOver) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-white mb-1">
          {STATUS_LABELS[status]}
        </div>
        {winner && (
          <div className="text-gray-300 text-sm">
            {winner === "white" ? "Brancas vencem!" : "Pretas vencem!"}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full border-2 border-gray-500 ${
          currentTurn === "white" ? "bg-white" : "bg-gray-900"
        }`}
      />
      <span className="text-gray-200 font-medium">
        {TURN_LABELS[currentTurn]}
      </span>
      {status === "check" && (
        <span className="text-red-400 font-bold text-sm animate-pulse ml-1">
          ⚠ Xeque
        </span>
      )}
    </div>
  );
}
