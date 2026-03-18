import type { Move, Position, PieceType } from "@/types/chess";


export function colToFile(col: number): string {
  return String.fromCharCode(97 + col); // 97 = 'a'
}

export function rowToRank(row: number): number {
  return 8 - row;
}

export function positionToAlgebraic(pos: Position): string {
  return `${colToFile(pos.col)}${rowToRank(pos.row)}`;
}

export function algebraicToPosition(notation: string): Position {
  const col = notation.charCodeAt(0) - 97;
  const row = 8 - parseInt(notation[1] ?? "1");
  return { row, col };
}

export const PIECE_SYMBOLS: Record<PieceType, string> = {
  pawn: "",
  rook: "R",
  knight: "N", 
  bishop: "B",
  queen: "Q",
  king: "K",
};

export const PIECE_UNICODE: Record<string, string> = {
  "white-king":   "♔",
  "white-queen":  "♕",
  "white-rook":   "♖",
  "white-bishop": "♗",
  "white-knight": "♘",
  "white-pawn":   "♙",
  "black-king":   "♚",
  "black-queen":  "♛",
  "black-rook":   "♜",
  "black-bishop": "♝",
  "black-knight": "♞",
  "black-pawn":   "♟",
};

export function generateNotation(move: Move): string {
  if (move.type === "castling") {
    return move.to.col > move.from.col ? "O-O" : "O-O-O";
  }

  const pieceSymbol = PIECE_SYMBOLS[move.piece.type];
  const toSquare = positionToAlgebraic(move.to);
  const captureSymbol = move.capturedPiece || move.type === "en-passant"
    ? "x"
    : "";

  const fromFile =
    move.piece.type === "pawn" && captureSymbol
      ? colToFile(move.from.col)
      : "";

  const promotionSuffix = move.promotionPiece
    ? `=${PIECE_SYMBOLS[move.promotionPiece]}`
    : "";

  const checkSuffix =
    move.type === "checkmate" ? "#" : move.type === "check" ? "+" : "";

  return `${pieceSymbol}${fromFile}${captureSymbol}${toSquare}${promotionSuffix}${checkSuffix}`;
}

export function formatMoveHistory(moves: Move[]): string[] {
  const pairs: string[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = moves[i]?.notation ?? "";
    const blackMove = moves[i + 1]?.notation ?? "...";

    const blackPart = moves[i + 1] ? blackMove : "";
    pairs.push(
      blackPart
        ? `${moveNumber}. ${whiteMove} ${blackPart}`
        : `${moveNumber}. ${whiteMove}`
    );
  }

  return pairs;
}