import type { Board, Color, Piece, PieceType, Position, GameState } from "@/types/chess";
import { positionToKey } from "@/utils/helpers";

const BACK_RANK_ORDER: PieceType[] = [
  "rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook",
];

function createPiece(type: PieceType, color: Color): Piece {
  return { type, color, hasMoved: false };
}


export function createInitialBoard(): Board {
  const board: Board = [];

  for (let row = 0; row < 8; row++) {
    const currentRow = [];

    for (let col = 0; col < 8; col++) {
      let piece: Piece | null = null;

      if (row === 0) {
        piece = createPiece(BACK_RANK_ORDER[col]!, "black");
      } else if (row === 1) {
        piece = createPiece("pawn", "black");
      } else if (row === 6) {
        piece = createPiece("pawn", "white");
      } else if (row === 7) {
        piece = createPiece(BACK_RANK_ORDER[col]!, "white");
      }

      currentRow.push({
        position: { row, col },
        piece,
      });
    }

    board.push(currentRow);
  }

  return board;
}

export function applyMoveToBoard(
  board: Board,
  from: Position,
  to: Position,
  promotionPiece?: PieceType
): Board {
  const fromSquare = board[from.row]?.[from.col];
  const piece = fromSquare?.piece;

  if (!fromSquare || !piece) return board;

  fromSquare.piece = null;

  const toSquare = board[to.row]?.[to.col];
  if (toSquare) {
    toSquare.piece = {
      ...piece,
      hasMoved: true,
      type: promotionPiece ?? piece.type,
    };
  }

  if (piece.type === "king") {
    const colDiff = to.col - from.col;

    if (Math.abs(colDiff) === 2) {
      const rookFromCol = colDiff > 0 ? 7 : 0; 
      const rookToCol = colDiff > 0 ? 5 : 3;  

      const rookSquare = board[from.row]?.[rookFromCol];
      const rookDestSquare = board[from.row]?.[rookToCol];

      if (rookSquare?.piece && rookDestSquare) {
        rookDestSquare.piece = { ...rookSquare.piece, hasMoved: true };
        rookSquare.piece = null;
      }
    }
  }

  if (piece.type === "pawn" && from.col !== to.col) {
    const targetSquare = board[from.row]?.[to.col];
    if (targetSquare && !board[to.row]?.[to.col]?.piece) {
    }
    const capturedPawnSquare = board[from.row]?.[to.col];
    if (capturedPawnSquare) capturedPawnSquare.piece = null;
  }

  return board;
}


export function findKingPosition(board: Board, color: Color): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row]?.[col]?.piece;
      if (piece?.type === "king" && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}
export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: "white", 
    status: "playing",
    selectedSquare: null,
    legalMoves: [],
    moveHistory: [],
    capturedPieces: {
      white: [],
      black: [],
    },
    castlingRights: {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true },
    },
    enPassantTarget: null,
    kingInCheckPosition: null,
    winner: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
  };
}
export function buildHighlightMap(state: GameState) {
  const highlights = new Map<string, string>();

  const lastMove = state.moveHistory[state.moveHistory.length - 1];
  if (lastMove) {
    highlights.set(positionToKey(lastMove.from), "last-move-from");
    highlights.set(positionToKey(lastMove.to), "last-move-to");
  }

  if (state.selectedSquare) {
    highlights.set(positionToKey(state.selectedSquare), "selected");
  }

  for (const move of state.legalMoves) {
    const key = positionToKey(move);
    if (!highlights.has(key)) {
      highlights.set(key, "legal-move");
    }
  }

  if (state.kingInCheckPosition) {
    highlights.set(positionToKey(state.kingInCheckPosition), "check");
  }

  return highlights;
}