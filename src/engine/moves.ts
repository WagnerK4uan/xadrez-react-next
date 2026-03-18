import type {
  Board,
  Color,
  GameState,
  Move,
  MoveType,
  Piece,
  Position,
} from "@/types/chess";
import {
  cloneBoard,
  getPieceAt,
  isAllyPiece,
  isEnemyPiece,
  isValidPosition,
  oppositeColor,
  positionToKey,
} from "@/utils/helpers";
import { generateNotation } from "@/utils/notation";
import { applyMoveToBoard, findKingPosition } from "./board";

export function isKingInCheck(board: Board, color: Color): boolean {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false;

  const enemy = oppositeColor(color);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row]?.[col]?.piece;
      if (!piece || piece.color !== enemy) continue;

      const rawMoves = getRawMoves(board, { row, col }, null);
      if (rawMoves.some((m) => m.row === kingPos.row && m.col === kingPos.col)) {
        return true;
      }
    }
  }

  return false;
}

function getRawMoves(
  board: Board,
  from: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = getPieceAt(board, from);
  if (!piece) return [];

  switch (piece.type) {
    case "pawn":   return getPawnMoves(board, from, piece, enPassantTarget);
    case "rook":   return getSlidingMoves(board, from, piece, ROOK_DIRS);
    case "bishop": return getSlidingMoves(board, from, piece, BISHOP_DIRS);
    case "queen":  return getSlidingMoves(board, from, piece, QUEEN_DIRS);
    case "knight": return getKnightMoves(board, from, piece);
    case "king":   return getKingRawMoves(board, from, piece);
    default:       return [];
  }
}

const ROOK_DIRS   = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];
const BISHOP_DIRS = [{ r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }];
const QUEEN_DIRS  = [...ROOK_DIRS, ...BISHOP_DIRS];

function getSlidingMoves(
  board: Board,
  from: Position,
  piece: Piece,
  dirs: { r: number; c: number }[]
): Position[] {
  const moves: Position[] = [];

  for (const dir of dirs) {
    let row = from.row + dir.r;
    let col = from.col + dir.c;

    while (isValidPosition({ row, col })) {
      const target = getPieceAt(board, { row, col });

      if (target === null) {
        moves.push({ row, col });
      } else if (target.color !== piece.color) {
        moves.push({ row, col });
        break;
      } else {
        break;
      }

      row += dir.r;
      col += dir.c;
    }
  }

  return moves;
}

const KNIGHT_JUMPS = [
  { r: -2, c: -1 }, { r: -2, c: 1 },
  { r: -1, c: -2 }, { r: -1, c: 2 },
  { r:  1, c: -2 }, { r:  1, c: 2 },
  { r:  2, c: -1 }, { r:  2, c: 1 },
];

function getKnightMoves(board: Board, from: Position, piece: Piece): Position[] {
  return KNIGHT_JUMPS
    .map(({ r, c }) => ({ row: from.row + r, col: from.col + c }))
    .filter(
      (pos) => isValidPosition(pos) && !isAllyPiece(board, pos, piece.color)
    );
}

function getPawnMoves(
  board: Board,
  from: Position,
  piece: Piece,
  enPassantTarget: Position | null
): Position[] {
  const moves: Position[] = [];
  const dir = piece.color === "white" ? -1 : 1;
  const startRow = piece.color === "white" ? 6 : 1;

  const oneStep = { row: from.row + dir, col: from.col };
  if (isValidPosition(oneStep) && getPieceAt(board, oneStep) === null) {
    moves.push(oneStep);

    const twoStep = { row: from.row + 2 * dir, col: from.col };
    if (from.row === startRow && getPieceAt(board, twoStep) === null) {
      moves.push(twoStep);
    }
  }

  for (const colDelta of [-1, 1]) {
    const capture = { row: from.row + dir, col: from.col + colDelta };
    if (!isValidPosition(capture)) continue;

    if (isEnemyPiece(board, capture, piece.color)) {
      moves.push(capture);
    }

    if (
      enPassantTarget &&
      capture.row === enPassantTarget.row &&
      capture.col === enPassantTarget.col
    ) {
      moves.push(capture);
    }
  }

  return moves;
}

const KING_MOVES = [
  { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
  { r:  0, c: -1 },                   { r:  0, c: 1 },
  { r:  1, c: -1 }, { r:  1, c: 0 }, { r:  1, c: 1 },
];

function getKingRawMoves(board: Board, from: Position, piece: Piece): Position[] {
  return KING_MOVES
    .map(({ r, c }) => ({ row: from.row + r, col: from.col + c }))
    .filter(
      (pos) => isValidPosition(pos) && !isAllyPiece(board, pos, piece.color)
    );
}

function getCastlingMoves(
  board: Board,
  from: Position,
  piece: Piece,
  state: GameState
): Position[] {
  if (piece.type !== "king" || piece.hasMoved) return [];

  const rights = state.castlingRights[piece.color];
  const row = piece.color === "white" ? 7 : 0;
  const moves: Position[] = [];

  if (isKingInCheck(board, piece.color)) return [];

  if (rights.kingSide) {
    const rookPos = { row, col: 7 };
    const rook = getPieceAt(board, rookPos);
    if (rook?.type === "rook" && !rook.hasMoved) {
      const f = { row, col: 5 };
      const g = { row, col: 6 };
      if (
        getPieceAt(board, f) === null &&
        getPieceAt(board, g) === null &&
        !squareIsAttacked(board, f, piece.color) &&
        !squareIsAttacked(board, g, piece.color)
      ) {
        moves.push(g); 
      }
    }
  }

  if (rights.queenSide) {
    const rookPos = { row, col: 0 };
    const rook = getPieceAt(board, rookPos);
    if (rook?.type === "rook" && !rook.hasMoved) {
      const b = { row, col: 1 };
      const c = { row, col: 2 };
      const d = { row, col: 3 };
      if (
        getPieceAt(board, b) === null &&
        getPieceAt(board, c) === null &&
        getPieceAt(board, d) === null &&
        !squareIsAttacked(board, c, piece.color) &&
        !squareIsAttacked(board, d, piece.color)
      ) {
        moves.push(c); 
      }
    }
  }

  return moves;
}

function squareIsAttacked(
  board: Board,
  pos: Position,
  defendingColor: Color
): boolean {
  const enemy = oppositeColor(defendingColor);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row]?.[col]?.piece;
      if (!piece || piece.color !== enemy) continue;
      const rawMoves = getRawMoves(board, { row, col }, null);
      if (rawMoves.some((m) => m.row === pos.row && m.col === pos.col)) {
        return true;
      }
    }
  }
  return false;
}

export function getLegalMoves(state: GameState, from: Position): Position[] {
  const piece = getPieceAt(state.board, from);
  if (!piece) return [];

  const enPassant = state.enPassantTarget?.position ?? null;
  const rawMoves = getRawMoves(state.board, from, enPassant);

  const castlingMoves =
    piece.type === "king" ? getCastlingMoves(state.board, from, piece, state) : [];

  const allMoves = [...rawMoves, ...castlingMoves];

  return allMoves.filter((to) => {
    const boardCopy = cloneBoard(state.board);
    applyMoveToBoard(boardCopy, from, to);
    return !isKingInCheck(boardCopy, piece.color);
  });
}

export function hasNoLegalMoves(state: GameState, color: Color): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row]?.[col]?.piece;
      if (!piece || piece.color !== color) continue;
      const moves = getLegalMoves(state, { row, col });
      if (moves.length > 0) return false;
    }
  }
  return true;
}

export function buildMove(
  state: GameState,
  from: Position,
  to: Position,
  promotionPiece?: "queen" | "rook" | "bishop" | "knight"
): Move {
  const piece = getPieceAt(state.board, from)!;
  const capturedPiece = getPieceAt(state.board, to);

  let type: MoveType = "normal";

  if (capturedPiece) {
    type = "capture";
  }

  if (
    piece.type === "pawn" &&
    from.col !== to.col &&
    capturedPiece === null
  ) {
    type = "en-passant";
  }

  if (piece.type === "king" && Math.abs(to.col - from.col) === 2) {
    type = "castling";
  }

  if (
    piece.type === "pawn" &&
    (to.row === 0 || to.row === 7)
  ) {
    type = "promotion";
  }

  const boardCopy = cloneBoard(state.board);
  applyMoveToBoard(boardCopy, from, to, promotionPiece);
  const enemyColor = oppositeColor(piece.color);
  const inCheck = isKingInCheck(boardCopy, enemyColor);

  const stateAfter: GameState = {
    ...state,
    board: boardCopy,
    currentTurn: enemyColor,
    enPassantTarget: null,
    castlingRights: state.castlingRights,
  };

  if (inCheck) {
    type = hasNoLegalMoves(stateAfter, enemyColor) ? "checkmate" : "check";
  }

  const move: Move = {
    from,
    to,
    piece,
    capturedPiece:
      type === "en-passant"
        ? getPieceAt(state.board, {
            row: from.row,
            col: to.col,
          })
        : capturedPiece,
    type,
    promotionPiece,
    notation: "",
  };

  move.notation = generateNotation(move);
  return move;
}

export function calcEnPassantTarget(
  from: Position,
  to: Position,
  piece: Piece
): { position: Position; pawnPosition: Position } | null {
  if (piece.type !== "pawn") return null;
  if (Math.abs(to.row - from.row) !== 2) return null;

  const middleRow = (from.row + to.row) / 2;
  return {
    position: { row: middleRow, col: from.col },
    pawnPosition: to,
  };
}

export function updateCastlingRights(
  rights: GameState["castlingRights"],
  from: Position,
  piece: Piece
): GameState["castlingRights"] {
  const newRights = {
    white: { ...rights.white },
    black: { ...rights.black },
  };

  const color = piece.color;

  if (piece.type === "king") {
    newRights[color].kingSide = false;
    newRights[color].queenSide = false;
  }

  if (piece.type === "rook") {
    const baseRow = color === "white" ? 7 : 0;
    if (from.row === baseRow) {
      if (from.col === 0) newRights[color].queenSide = false;
      if (from.col === 7) newRights[color].kingSide = false;
    }
  }

  return newRights;
}
