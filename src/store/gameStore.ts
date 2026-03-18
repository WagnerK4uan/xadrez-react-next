import { create } from "zustand";
import type { GameState, Position, PieceType, Color } from "@/types/chess";
import { createInitialGameState, applyMoveToBoard, buildHighlightMap, findKingPosition } from "@/engine/board";
import {
  getLegalMoves,
  isKingInCheck,
  hasNoLegalMoves,
  buildMove,
  calcEnPassantTarget,
  updateCastlingRights,
} from "@/engine/moves";
import { cloneBoard, getPieceAt, isSamePosition, oppositeColor } from "@/utils/helpers";



interface GameStore {
  game: GameState;
  highlights: Map<string, string>;
  pendingPromotion: { from: Position; to: Position } | null;
  selectSquare: (pos: Position) => void;
  promotePawn: (pieceType: PieceType) => void;
  resetGame: () => void;
}


function executeMove(
  game: GameState,
  from: Position,
  to: Position,
  promotionPiece?: PieceType
): GameState {
  const movingPiece = getPieceAt(game.board, from)!;

  const move = buildMove(
    game,
    from,
    to,
    promotionPiece as "queen" | "rook" | "bishop" | "knight" | undefined
  );

  const newBoard = cloneBoard(game.board);
  applyMoveToBoard(newBoard, from, to, promotionPiece);

  const newCapturedPieces = {
    white: [...game.capturedPieces.white],
    black: [...game.capturedPieces.black],
  };
  if (move.capturedPiece) {
    newCapturedPieces[movingPiece.color].push(move.capturedPiece);
  }

  const newCastlingRights = updateCastlingRights(game.castlingRights, from, movingPiece);
  const newEnPassant = calcEnPassantTarget(from, to, movingPiece);
  const nextTurn: Color = oppositeColor(game.currentTurn);

  const kingInCheck = isKingInCheck(newBoard, nextTurn);
  const kingPos = findKingPosition(newBoard, nextTurn);

  const tempState: GameState = {
    ...game,
    board: newBoard,
    currentTurn: nextTurn,
    enPassantTarget: newEnPassant,
    castlingRights: newCastlingRights,
    selectedSquare: null,
    legalMoves: [],
    moveHistory: [...game.moveHistory, move],
  };

  const noMoves = hasNoLegalMoves(tempState, nextTurn);

  let status: GameState["status"];
  let winner = game.winner;

  if (kingInCheck && noMoves) {
    status = "checkmate";
    winner = game.currentTurn;
  } else if (!kingInCheck && noMoves) {
    status = "stalemate";
  } else if (kingInCheck) {
    status = "check";
  } else {
    status = "playing";
  }

  const halfMoveClock =
    movingPiece.type === "pawn" || move.capturedPiece
      ? 0
      : game.halfMoveClock + 1;

  const fullMoveNumber =
    game.currentTurn === "black"
      ? game.fullMoveNumber + 1
      : game.fullMoveNumber;

  return {
    ...tempState,
    status,
    winner,
    kingInCheckPosition: kingInCheck ? kingPos : null,
    capturedPieces: newCapturedPieces,
    halfMoveClock,
    fullMoveNumber,
  };
}


export const useGameStore = create<GameStore>((set, get) => ({
  game: createInitialGameState(),
  highlights: buildHighlightMap(createInitialGameState()),
  pendingPromotion: null,

  selectSquare: (pos: Position) => {
    const { game, pendingPromotion } = get();

    if (pendingPromotion) return;
    if (game.status === "checkmate" || game.status === "stalemate") return;

    const clickedPiece = getPieceAt(game.board, pos);

    if (!game.selectedSquare) {
      if (!clickedPiece || clickedPiece.color !== game.currentTurn) return;

      const legalMoves = getLegalMoves(game, pos);
      set((s) => {
        const updated: GameState = { ...s.game, selectedSquare: pos, legalMoves };
        return { game: updated, highlights: buildHighlightMap(updated) };
      });
      return;
    }

    const selected = game.selectedSquare;

    if (isSamePosition(selected, pos)) {
      set((s) => {
        const updated: GameState = { ...s.game, selectedSquare: null, legalMoves: [] };
        return { game: updated, highlights: buildHighlightMap(updated) };
      });
      return;
    }

    if (clickedPiece && clickedPiece.color === game.currentTurn) {
      const legalMoves = getLegalMoves(game, pos);
      set((s) => {
        const updated: GameState = { ...s.game, selectedSquare: pos, legalMoves };
        return { game: updated, highlights: buildHighlightMap(updated) };
      });
      return;
    }

    const isLegal = game.legalMoves.some((m) => isSamePosition(m, pos));
    if (!isLegal) {
      set((s) => {
        const updated: GameState = { ...s.game, selectedSquare: null, legalMoves: [] };
        return { game: updated, highlights: buildHighlightMap(updated) };
      });
      return;
    }

    const movingPiece = getPieceAt(game.board, selected)!;
    if (movingPiece.type === "pawn" && (pos.row === 0 || pos.row === 7)) {
      set({ pendingPromotion: { from: selected, to: pos } });
      return;
    }

    const updatedGame = executeMove(game, selected, pos);
    set({ game: updatedGame, highlights: buildHighlightMap(updatedGame) });
  },

  promotePawn: (pieceType: PieceType) => {
    const { pendingPromotion, game } = get();
    if (!pendingPromotion) return;

    const updatedGame = executeMove(game, pendingPromotion.from, pendingPromotion.to, pieceType);
    set({
      game: updatedGame,
      highlights: buildHighlightMap(updatedGame),
      pendingPromotion: null,
    });
  },

  resetGame: () => {
    const initial = createInitialGameState();
    set({
      game: initial,
      highlights: buildHighlightMap(initial),
      pendingPromotion: null,
    });
  },
}));
