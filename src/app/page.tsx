"use client";

import { useGameStore } from "@/store/gameStore";
import { Board } from "@/components/board/Board";
import { CapturedPieces } from "@/components/ui/CapturedPieces";
import { MoveHistory } from "@/components/ui/MoveHistory";
import { GameStatusBadge } from "@/components/ui/GameStatus";
import { calculateMaterialAdvantage } from "@/utils/helpers";

export default function Home() {
  const { game, resetGame } = useGameStore();
  const advantage = calculateMaterialAdvantage(game.capturedPieces);
  const isGameOver =
    game.status === "checkmate" ||
    game.status === "stalemate" ||
    game.status === "draw";

  return (
    <main className="min-h-screen bg-surface-100 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-5xl">

        {/* ── TABULEIRO ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          {/* Peças capturadas pelas pretas (topo) */}
          <div className="w-[min(90vw,560px)]">
            <CapturedPieces
              pieces={game.capturedPieces.black}
              capturedBy="black"
              advantage={advantage}
            />
          </div>

          <Board />

          {/* Peças capturadas pelas brancas (base) */}
          <div className="w-[min(90vw,560px)]">
            <CapturedPieces
              pieces={game.capturedPieces.white}
              capturedBy="white"
              advantage={advantage}
            />
          </div>
        </div>

        {/* ── PAINEL LATERAL ────────────────────────────────────── */}
        <div className="bg-surface-200 rounded-2xl p-5 w-full lg:w-72 flex flex-col gap-5 border border-gray-700/50">

          {/* Título */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ♟ Chess Game
            </h1>
          </div>

          {/* Status do jogo */}
          <div className="bg-surface-300 rounded-xl px-4 py-3">
            <GameStatusBadge
              status={game.status}
              currentTurn={game.currentTurn}
              winner={game.winner}
            />
          </div>

          {/* Histórico de movimentos */}
          <div className="flex-1">
            <h2 className="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-2">
              Histórico
            </h2>
            <div className="bg-surface-300 rounded-xl p-2">
              <MoveHistory moves={game.moveHistory} />
            </div>
          </div>

          {/* Info do jogo */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Jogada</span>
              <span className="text-gray-400">{game.fullMoveNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Regra dos 50 mov.</span>
              <span className="text-gray-400">{game.halfMoveClock}/50</span>
            </div>
          </div>

          {/* Botão de reiniciar */}
          <button
            onClick={resetGame}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isGameOver
                ? "bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                : "bg-surface-300 text-gray-300 hover:bg-gray-600 border border-gray-600"
            }`}
          >
            {isGameOver ? "Nova Partida" : "Reiniciar"}
          </button>
        </div>
      </div>
    </main>
  );
}
