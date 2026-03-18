
export type Color = "white" | "black";


export type PieceType =
  | "pawn"   
  | "rook"   
  | "knight" 
  | "bishop"  
  | "queen"  
  | "king";  


export interface Piece {
  type: PieceType;
  color: Color;

  hasMoved: boolean;
}


export interface Position {
  row: number;
  col: number;
}


export interface Square {
  position: Position;
  piece: Piece | null;
}


export type Board = Square[][];



export type MoveType =
  | "normal"       
  | "capture"      
  | "en-passant"   
  | "castling"    
  | "promotion"   
  | "check"       
  | "checkmate";   


export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece: Piece | null;
  type: MoveType;
  promotionPiece?: PieceType;
  notation: string;
}



export type GameStatus =
  | "idle"       
  | "playing"   
  | "check"      
  | "checkmate"  
  | "stalemate"  
  | "draw";     

export interface EnPassantTarget {
  position: Position;
  pawnPosition: Position;
}


export interface CastlingRights {
  kingSide: boolean;
  queenSide: boolean;
}

export interface GameState {
  board: Board;
  currentTurn: Color;
  status: GameStatus;
  selectedSquare: Position | null;
  legalMoves: Position[];
  moveHistory: Move[];
  capturedPieces: {
    white: Piece[]; 
    black: Piece[];  
  };
  castlingRights: {
    white: CastlingRights;
    black: CastlingRights;
  };
  enPassantTarget: EnPassantTarget | null;
  kingInCheckPosition: Position | null;
  winner: Color | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}


export type Direction = {
  rowDelta: number;
  colDelta: number;
};


export interface CheckResult {
  isInCheck: boolean;
  attackers: Position[];
}

export type HighlightMap = Map<string, HighlightType>;

export type HighlightType =
  | "selected"   
  | "legal-move" 
  | "capture"    
  | "check"      
  | "last-move-from" 
  | "last-move-to";  