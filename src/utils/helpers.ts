import type { Position, Board, Color, Piece, PieceType } from "@/types/chess";

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row <= 7 && pos.col >= 0 && pos.col <= 7;
}


export function isSamePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}


export function positionToKey(pos: Position): string {
  return `${pos.row}-${pos.col}`;
}


export function keyToPosition(key: string): Position {
  const [row, col] = key.split("-").map(Number);
  return { row: row!, col: col! };
}


export function getPieceAt(board: Board, pos: Position): Piece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row]?.[pos.col]?.piece ?? null;
}

export function isEmptySquare(board: Board, pos: Position): boolean {
  return getPieceAt(board, pos) === null;
}

export function isEnemyPiece(
  board: Board,
  pos: Position,
  myColor: Color
): boolean {
  const piece = getPieceAt(board, pos);
  return piece !== null && piece.color !== myColor;
}

export function isAllyPiece(
  board: Board,
  pos: Position,
  myColor: Color
): boolean {
  const piece = getPieceAt(board, pos);
  return piece !== null && piece.color === myColor;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((square) => ({
      ...square,
      piece: square.piece ? { ...square.piece } : null,
    }))
  );
}

export function oppositeColor(color: Color): Color {
  return color === "white" ? "black" : "white";
}

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0, // O rei não tem valor material — é inestimável
};

export function calculateMaterialAdvantage(capturedPieces: {
  white: Piece[];
  black: Piece[];
}): number {
  const whiteValue = capturedPieces.white.reduce(
    (sum, p) => sum + PIECE_VALUES[p.type],
    0
  );
  const blackValue = capturedPieces.black.reduce(
    (sum, p) => sum + PIECE_VALUES[p.type],
    0
  );
  return whiteValue - blackValue;
}