import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, Undo2, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Types ---
type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
type PieceColor = "white" | "black"
type Square = { piece: Piece | null }
type Position = { row: number; col: number }
type Move = {
  from: Position
  to: Position
  piece: Piece
  captured?: Piece
  isEnPassant?: boolean
  isCastling?: "kingside" | "queenside"
  promotion?: PieceType
}

interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

type GameState = {
  board: Square[][]
  turn: PieceColor
  moveHistory: Move[]
  enPassantTarget: Position | null
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  selectedSquare: Position | null
  legalMoves: Position[]
  lastMove: Move | null
}

// --- Constants ---
const INITIAL_BOARD: Square[][] = createInitialBoard()

function createInitialBoard(): Square[][] {
  const board: Square[][] = Array(8).fill(null).map(() =>
    Array(8).fill(null).map(() => ({ piece: null }))
  )

  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { piece: { type: "pawn", color: "black" } }
    board[6][col] = { piece: { type: "pawn", color: "white" } }
  }

  // Place other pieces
  const backRowPieces: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

  for (let col = 0; col < 8; col++) {
    board[0][col] = { piece: { type: backRowPieces[col], color: "black" } }
    board[7][col] = { piece: { type: backRowPieces[col], color: "white" } }
  }

  return board
}

// Piece symbols
const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙"
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟"
  }
}

// --- Utility Functions ---
function cloneBoard(board: Square[][]): Square[][] {
  return board.map(row => row.map(square => ({
    piece: square.piece ? { ...square.piece } : null
  })))
}

function posEquals(a: Position | null, b: Position | null): boolean {
  if (!a || !b) return false
  return a.row === b.row && a.col === b.col
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

function findKing(board: Square[][], color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece
      if (piece?.type === "king" && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

// --- Move Generation ---
function getPseudoLegalMoves(
  board: Square[][],
  pos: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[pos.row][pos.col].piece
  if (!piece) return []

  const moves: Position[] = []
  const { row, col } = pos

  switch (piece.type) {
    case "pawn": {
      const direction = piece.color === "white" ? -1 : 1
      const startRow = piece.color === "white" ? 6 : 1

      // Forward move
      if (isInBounds(row + direction, col) && !board[row + direction][col].piece) {
        moves.push({ row: row + direction, col })

        // Double move from start
        if (row === startRow && !board[row + 2 * direction][col].piece) {
          moves.push({ row: row + 2 * direction, col })
        }
      }

      // Captures
      for (const dcol of [-1, 1]) {
        const newRow = row + direction
        const newCol = col + dcol
        if (isInBounds(newRow, newCol)) {
          const target = board[newRow][newCol].piece
          if (target && target.color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
          // En passant
          if (posEquals({ row: newRow, col: newCol }, enPassantTarget)) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
      break
    }

    case "knight": {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [dr, dc] of knightMoves) {
        const newRow = row + dr
        const newCol = col + dc
        if (isInBounds(newRow, newCol)) {
          const target = board[newRow][newCol].piece
          if (!target || target.color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
      break
    }

    case "bishop": {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!isInBounds(newRow, newCol)) break
          const target = board[newRow][newCol].piece
          if (!target) {
            moves.push({ row: newRow, col: newCol })
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: newRow, col: newCol })
            }
            break
          }
        }
      }
      break
    }

    case "rook": {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!isInBounds(newRow, newCol)) break
          const target = board[newRow][newCol].piece
          if (!target) {
            moves.push({ row: newRow, col: newCol })
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: newRow, col: newCol })
            }
            break
          }
        }
      }
      break
    }

    case "queen": {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ]
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!isInBounds(newRow, newCol)) break
          const target = board[newRow][newCol].piece
          if (!target) {
            moves.push({ row: newRow, col: newCol })
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: newRow, col: newCol })
            }
            break
          }
        }
      }
      break
    }

    case "king": {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ]
      for (const [dr, dc] of directions) {
        const newRow = row + dr
        const newCol = col + dc
        if (isInBounds(newRow, newCol)) {
          const target = board[newRow][newCol].piece
          if (!target || target.color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
      break
    }
  }

  return moves
}

function isSquareAttacked(
  board: Square[][],
  pos: Position,
  byColor: PieceColor
): boolean {
  // Check all opponent pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece
      if (piece && piece.color === byColor) {
        const moves = getPseudoLegalMoves(board, { row, col }, null)
        if (moves.some(m => posEquals(m, pos))) {
          return true
        }
      }
    }
  }
  return false
}

function isInCheck(board: Square[][], color: PieceColor): boolean {
  const kingPos = findKing(board, color)
  if (!kingPos) return false
  const opponentColor = color === "white" ? "black" : "white"
  return isSquareAttacked(board, kingPos, opponentColor)
}

function canCastle(
  board: Square[][],
  color: PieceColor,
  side: "kingside" | "queenside"
): boolean {
  const row = color === "white" ? 7 : 0
  const king = board[row][4].piece

  if (!king || king.type !== "king" || king.hasMoved) return false
  if (isInCheck(board, color)) return false

  const rookCol = side === "kingside" ? 7 : 0
  const rook = board[row][rookCol].piece
  if (!rook || rook.type !== "rook" || rook.hasMoved) return false

  // Check squares between are empty
  const start = side === "kingside" ? 5 : 1
  const end = side === "kingside" ? 6 : 3
  for (let col = start; col <= end; col++) {
    if (board[row][col].piece) return false
  }

  // Check king doesn't pass through check
  const opponentColor = color === "white" ? "black" : "white"
  const checkCols = side === "kingside" ? [5, 6] : [2, 3]
  for (const col of checkCols) {
    if (isSquareAttacked(board, { row, col }, opponentColor)) return false
  }

  return true
}

function getLegalMoves(
  board: Square[][],
  pos: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[pos.row][pos.col].piece
  if (!piece) return []

  const pseudoMoves = getPseudoLegalMoves(board, pos, enPassantTarget)
  const legalMoves: Position[] = []

  for (const move of pseudoMoves) {
    // Simulate the move
    const newBoard = cloneBoard(board)
    newBoard[move.row][move.col].piece = newBoard[pos.row][pos.col].piece
    newBoard[pos.row][pos.col].piece = null

    // Handle en passant capture
    if (piece.type === "pawn" && posEquals(move, enPassantTarget)) {
      const captureRow = piece.color === "white" ? move.row + 1 : move.row - 1
      newBoard[captureRow][move.col].piece = null
    }

    // Check if king is in check after move
    if (!isInCheck(newBoard, piece.color)) {
      legalMoves.push(move)
    }
  }

  // Add castling moves for king
  if (piece.type === "king" && !piece.hasMoved) {
    if (canCastle(board, piece.color, "kingside")) {
      legalMoves.push({ row: pos.row, col: 6 })
    }
    if (canCastle(board, piece.color, "queenside")) {
      legalMoves.push({ row: pos.row, col: 2 })
    }
  }

  return legalMoves
}

function getAllLegalMoves(
  board: Square[][],
  color: PieceColor,
  enPassantTarget: Position | null
): { from: Position; to: Position }[] {
  const moves: { from: Position; to: Position }[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece
      if (piece && piece.color === color) {
        const from = { row, col }
        const legalMoves = getLegalMoves(board, from, enPassantTarget)
        for (const to of legalMoves) {
          moves.push({ from, to })
        }
      }
    }
  }

  return moves
}

// --- AI (Minimax with Alpha-Beta) ---
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
}

// Position bonuses for pieces
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0]
]

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
]

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
]

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0]
]

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20]
]

const KING_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20]
]

function getPieceSquareValue(piece: Piece, row: number, col: number): number {
  const tables: Record<PieceType, number[][]> = {
    pawn: PAWN_TABLE,
    knight: KNIGHT_TABLE,
    bishop: BISHOP_TABLE,
    rook: ROOK_TABLE,
    queen: QUEEN_TABLE,
    king: KING_TABLE
  }

  const table = tables[piece.type]
  // Flip table for black pieces
  const tableRow = piece.color === "white" ? row : 7 - row

  return table[tableRow][col]
}

function evaluateBoard(board: Square[][]): number {
  let score = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type]
        const posValue = getPieceSquareValue(piece, row, col)
        const totalValue = pieceValue + posValue

        if (piece.color === "white") {
          score += totalValue
        } else {
          score -= totalValue
        }
      }
    }
  }

  return score
}

function makeMove(
  board: Square[][],
  from: Position,
  to: Position,
  enPassantTarget: Position | null
): { newBoard: Square[][]; newEnPassant: Position | null } {
  const newBoard = cloneBoard(board)
  const piece = newBoard[from.row][from.col].piece!
  const captured = newBoard[to.row][to.col].piece

  // Move piece
  newBoard[to.row][to.col].piece = { ...piece, hasMoved: true }
  newBoard[from.row][from.col].piece = null

  let newEnPassant: Position | null = null

  // Handle special moves
  if (piece.type === "pawn") {
    // En passant capture
    if (posEquals(to, enPassantTarget) && !captured) {
      const captureRow = piece.color === "white" ? to.row + 1 : to.row - 1
      newBoard[captureRow][to.col].piece = null
    }

    // Set en passant target for next move
    if (Math.abs(to.row - from.row) === 2) {
      newEnPassant = {
        row: (from.row + to.row) / 2,
        col: from.col
      }
    }

    // Promotion (auto-queen for AI)
    if (to.row === 0 || to.row === 7) {
      newBoard[to.row][to.col].piece = { type: "queen", color: piece.color, hasMoved: true }
    }
  }

  // Castling
  if (piece.type === "king" && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      // Kingside
      newBoard[from.row][5].piece = { ...newBoard[from.row][7].piece!, hasMoved: true }
      newBoard[from.row][7].piece = null
    } else {
      // Queenside
      newBoard[from.row][3].piece = { ...newBoard[from.row][0].piece!, hasMoved: true }
      newBoard[from.row][0].piece = null
    }
  }

  return { newBoard, newEnPassant }
}

function minimax(
  board: Square[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  enPassantTarget: Position | null
): number {
  if (depth === 0) {
    return evaluateBoard(board)
  }

  const color = isMaximizing ? "white" : "black"
  const moves = getAllLegalMoves(board, color, enPassantTarget)

  if (moves.length === 0) {
    if (isInCheck(board, color)) {
      // Checkmate
      return isMaximizing ? -Infinity : Infinity
    }
    // Stalemate
    return 0
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const { newBoard, newEnPassant } = makeMove(board, move.from, move.to, enPassantTarget)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, newEnPassant)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const { newBoard, newEnPassant } = makeMove(board, move.from, move.to, enPassantTarget)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, newEnPassant)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

function getBestMove(
  board: Square[][],
  color: PieceColor,
  enPassantTarget: Position | null,
  depth: number = 3
): { from: Position; to: Position } | null {
  const moves = getAllLegalMoves(board, color, enPassantTarget)
  if (moves.length === 0) return null

  let bestMove = moves[0]
  let bestValue = color === "white" ? -Infinity : Infinity

  for (const move of moves) {
    const { newBoard, newEnPassant } = makeMove(board, move.from, move.to, enPassantTarget)
    const value = minimax(
      newBoard,
      depth - 1,
      -Infinity,
      Infinity,
      color === "black", // If AI is black, next turn maximizes for white
      newEnPassant
    )

    if (color === "white" && value > bestValue) {
      bestValue = value
      bestMove = move
    } else if (color === "black" && value < bestValue) {
      bestValue = value
      bestMove = move
    }
  }

  return bestMove
}

// --- Component ---
export function ChessGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: cloneBoard(INITIAL_BOARD),
    turn: "white",
    moveHistory: [],
    enPassantTarget: null,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    selectedSquare: null,
    legalMoves: [],
    lastMove: null
  }))

  const [playerColor] = useState<PieceColor>("white")
  const [aiDifficulty, setAiDifficulty] = useState<1 | 2 | 3>(2)
  const [isThinking, setIsThinking] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hint, setHint] = useState<{ from: Position; to: Position } | null>(null)
  const [wins, setWins] = useState(() => parseInt(localStorage.getItem("chess-wins") || "0"))

  // Check for checkmate/stalemate
  const checkGameEnd = useCallback((
    board: Square[][],
    turn: PieceColor,
    enPassantTarget: Position | null
  ): { isCheckmate: boolean; isStalemate: boolean; isCheck: boolean } => {
    const inCheck = isInCheck(board, turn)
    const moves = getAllLegalMoves(board, turn, enPassantTarget)

    if (moves.length === 0) {
      if (inCheck) {
        return { isCheckmate: true, isStalemate: false, isCheck: true }
      }
      return { isCheckmate: false, isStalemate: true, isCheck: false }
    }

    return { isCheckmate: false, isStalemate: false, isCheck: inCheck }
  }, [])

  // Handle square click
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameState.isCheckmate || gameState.isStalemate) return
    if (gameState.turn !== playerColor) return
    if (isThinking) return

    const clickedSquare = { row, col }
    const piece = gameState.board[row][col].piece

    // If we have a piece selected and clicking on a legal move
    if (gameState.selectedSquare) {
      const isLegalMove = gameState.legalMoves.some(m => posEquals(m, clickedSquare))

      if (isLegalMove) {
        // Make the move
        const from = gameState.selectedSquare
        const movingPiece = gameState.board[from.row][from.col].piece!
        const captured = gameState.board[row][col].piece

        const { newBoard, newEnPassant } = makeMove(
          gameState.board,
          from,
          clickedSquare,
          gameState.enPassantTarget
        )

        // Determine castling
        let isCastling: "kingside" | "queenside" | undefined
        if (movingPiece.type === "king" && Math.abs(col - from.col) === 2) {
          isCastling = col === 6 ? "kingside" : "queenside"
        }

        // Determine en passant
        const isEnPassant = movingPiece.type === "pawn" &&
          posEquals(clickedSquare, gameState.enPassantTarget) &&
          !captured

        // Create move record
        const move: Move = {
          from,
          to: clickedSquare,
          piece: movingPiece,
          captured: isEnPassant
            ? { type: "pawn", color: playerColor === "white" ? "black" : "white" }
            : captured ?? undefined,
          isEnPassant,
          isCastling
        }

        const { isCheckmate, isStalemate, isCheck } = checkGameEnd(
          newBoard,
          playerColor === "white" ? "black" : "white",
          newEnPassant
        )

        setGameState(prev => ({
          ...prev,
          board: newBoard,
          turn: playerColor === "white" ? "black" : "white",
          moveHistory: [...prev.moveHistory, move],
          enPassantTarget: newEnPassant,
          selectedSquare: null,
          legalMoves: [],
          lastMove: move,
          isCheck,
          isCheckmate,
          isStalemate
        }))

        setShowHint(false)
        setHint(null)

        if (isCheckmate && playerColor === "white") {
          const newWins = wins + 1
          setWins(newWins)
          localStorage.setItem("chess-wins", newWins.toString())
        }

        return
      }

      // Clicking on same square deselects
      if (posEquals(gameState.selectedSquare, clickedSquare)) {
        setGameState(prev => ({
          ...prev,
          selectedSquare: null,
          legalMoves: []
        }))
        return
      }
    }

    // Select a new piece
    if (piece && piece.color === playerColor) {
      const moves = getLegalMoves(gameState.board, clickedSquare, gameState.enPassantTarget)
      setGameState(prev => ({
        ...prev,
        selectedSquare: clickedSquare,
        legalMoves: moves
      }))
    }
  }, [gameState, playerColor, isThinking, checkGameEnd, wins])

  // AI move
  useEffect(() => {
    if (gameState.turn !== playerColor && !gameState.isCheckmate && !gameState.isStalemate) {
      setTimeout(() => setIsThinking(true), 0)

      // Delay to show "thinking"
      const timer = setTimeout(() => {
        const aiColor = playerColor === "white" ? "black" : "white"
        const bestMove = getBestMove(
          gameState.board,
          aiColor,
          gameState.enPassantTarget,
          aiDifficulty + 1 // Depth 2, 3, or 4
        )

        if (bestMove) {
          const from = bestMove.from
          const to = bestMove.to
          const movingPiece = gameState.board[from.row][from.col].piece!
          const captured = gameState.board[to.row][to.col].piece

          const { newBoard, newEnPassant } = makeMove(
            gameState.board,
            from,
            to,
            gameState.enPassantTarget
          )

          // Determine castling
          let isCastling: "kingside" | "queenside" | undefined
          if (movingPiece.type === "king" && Math.abs(to.col - from.col) === 2) {
            isCastling = to.col === 6 ? "kingside" : "queenside"
          }

          // Determine en passant
          const isEnPassant = movingPiece.type === "pawn" &&
            posEquals(to, gameState.enPassantTarget) &&
            !captured

          const move: Move = {
            from,
            to,
            piece: movingPiece,
            captured: isEnPassant
              ? { type: "pawn", color: playerColor }
              : captured ?? undefined,
            isEnPassant,
            isCastling
          }

          const { isCheckmate, isStalemate, isCheck } = checkGameEnd(
            newBoard,
            playerColor,
            newEnPassant
          )

          setGameState(prev => ({
            ...prev,
            board: newBoard,
            turn: playerColor,
            moveHistory: [...prev.moveHistory, move],
            enPassantTarget: newEnPassant,
            lastMove: move,
            isCheck,
            isCheckmate,
            isStalemate
          }))
        }

        setIsThinking(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [gameState.turn, gameState.isCheckmate, gameState.isStalemate, playerColor, gameState.board, gameState.enPassantTarget, aiDifficulty, checkGameEnd])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      board: cloneBoard(INITIAL_BOARD),
      turn: "white",
      moveHistory: [],
      enPassantTarget: null,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      selectedSquare: null,
      legalMoves: [],
      lastMove: null
    })
    setShowHint(false)
    setHint(null)
  }, [])

  // Undo move (undo both player and AI move)
  const undoMove = useCallback(() => {
    if (gameState.moveHistory.length < 2) return
    if (isThinking) return

    // We need to rebuild the board state from scratch
    let board = cloneBoard(INITIAL_BOARD)
    let enPassantTarget: Position | null = null

    // Replay all moves except the last two
    const newHistory = gameState.moveHistory.slice(0, -2)

    for (const move of newHistory) {
      const result = makeMove(board, move.from, move.to, enPassantTarget)
      board = result.newBoard
      enPassantTarget = result.newEnPassant
    }

    const { isCheck } = checkGameEnd(board, playerColor, enPassantTarget)

    setGameState({
      board,
      turn: playerColor,
      moveHistory: newHistory,
      enPassantTarget,
      isCheck,
      isCheckmate: false,
      isStalemate: false,
      selectedSquare: null,
      legalMoves: [],
      lastMove: newHistory.length > 0 ? newHistory[newHistory.length - 1] : null
    })
  }, [gameState.moveHistory, playerColor, checkGameEnd, isThinking])

  // Get hint
  const getHint = useCallback(() => {
    if (gameState.turn !== playerColor) return
    if (isThinking) return

    const bestMove = getBestMove(
      gameState.board,
      playerColor,
      gameState.enPassantTarget,
      3
    )

    if (bestMove) {
      setHint(bestMove)
      setShowHint(true)
    }
  }, [gameState, playerColor, isThinking])

  // Get captured pieces
  const capturedPieces = useMemo(() => {
    const white: Piece[] = []
    const black: Piece[] = []

    for (const move of gameState.moveHistory) {
      if (move.captured) {
        if (move.captured.color === "white") {
          white.push(move.captured)
        } else {
          black.push(move.captured)
        }
      }
    }

    return { white, black }
  }, [gameState.moveHistory])

  // Get algebraic notation for move
  const getMoveNotation = (move: Move): string => {
    const files = "abcdefgh"
    const ranks = "87654321"

    if (move.isCastling === "kingside") return "O-O"
    if (move.isCastling === "queenside") return "O-O-O"

    let notation = ""

    if (move.piece.type !== "pawn") {
      notation += PIECE_SYMBOLS[move.piece.color][move.piece.type]
    }

    if (move.captured) {
      if (move.piece.type === "pawn") {
        notation += files[move.from.col]
      }
      notation += "x"
    }

    notation += files[move.to.col] + ranks[move.to.row]

    return notation
  }

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 h-full bg-white dark:bg-black/90 p-4">
      {/* Game Board */}
      <div className="flex flex-col items-center">
        {/* Stats */}
        <div className="flex justify-between w-full mb-4 px-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Wins: {wins}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">AI Level:</span>
            <select
              value={aiDifficulty}
              onChange={e => setAiDifficulty(Number(e.target.value) as 1 | 2 | 3)}
              className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
              disabled={gameState.moveHistory.length > 0}
            >
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
          </div>
        </div>

        {/* Captured pieces (opponent's) */}
        <div className="h-8 mb-2 flex items-center gap-1">
          {capturedPieces.white.map((p, i) => (
            <span key={i} className="text-xl opacity-60">{PIECE_SYMBOLS.white[p.type]}</span>
          ))}
        </div>

        {/* Board */}
        <div
          className="grid grid-cols-8 border-2 border-gray-700 dark:border-gray-500 shadow-lg"
          style={{ width: "min(90vw, 400px)", height: "min(90vw, 400px)" }}
        >
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8)
            const col = i % 8
            const isLight = (row + col) % 2 === 0
            const piece = gameState.board[row][col].piece
            const isSelected = posEquals(gameState.selectedSquare, { row, col })
            const isLegalMove = gameState.legalMoves.some(m => m.row === row && m.col === col)
            const isLastMoveFrom = posEquals(gameState.lastMove?.from ?? null, { row, col })
            const isLastMoveTo = posEquals(gameState.lastMove?.to ?? null, { row, col })
            const isHintFrom = showHint && posEquals(hint?.from ?? null, { row, col })
            const isHintTo = showHint && posEquals(hint?.to ?? null, { row, col })
            const isKingInCheck = gameState.isCheck &&
              piece?.type === "king" &&
              piece.color === gameState.turn

            return (
              <button
                key={i}
                onClick={() => handleSquareClick(row, col)}
                className={cn(
                  "relative flex items-center justify-center text-3xl sm:text-4xl transition-all",
                  isLight
                    ? "bg-amber-100 dark:bg-amber-200"
                    : "bg-amber-700 dark:bg-amber-800",
                  isSelected && "ring-2 ring-inset ring-blue-500",
                  (isLastMoveFrom || isLastMoveTo) && "bg-yellow-300 dark:bg-yellow-500/50",
                  isKingInCheck && "bg-red-400 dark:bg-red-600",
                  (isHintFrom || isHintTo) && "bg-green-300 dark:bg-green-500/50"
                )}
                disabled={isThinking || gameState.isCheckmate || gameState.isStalemate}
              >
                {piece && (
                  <span className={cn(
                    piece.color === "white"
                      ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      : "text-gray-900"
                  )}>
                    {PIECE_SYMBOLS[piece.color][piece.type]}
                  </span>
                )}

                {/* Legal move indicator */}
                {isLegalMove && !piece && (
                  <div className="absolute w-3 h-3 rounded-full bg-black/20 dark:bg-white/30" />
                )}
                {isLegalMove && piece && (
                  <div className="absolute inset-0 border-4 border-black/20 dark:border-white/30 rounded-sm" />
                )}

                {/* File/Rank labels */}
                {row === 7 && (
                  <span className={cn(
                    "absolute bottom-0.5 right-1 text-[10px] font-bold",
                    isLight ? "text-amber-700" : "text-amber-100"
                  )}>
                    {"abcdefgh"[col]}
                  </span>
                )}
                {col === 0 && (
                  <span className={cn(
                    "absolute top-0.5 left-1 text-[10px] font-bold",
                    isLight ? "text-amber-700" : "text-amber-100"
                  )}>
                    {8 - row}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Captured pieces (player's) */}
        <div className="h-8 mt-2 flex items-center gap-1">
          {capturedPieces.black.map((p, i) => (
            <span key={i} className="text-xl opacity-60">{PIECE_SYMBOLS.black[p.type]}</span>
          ))}
        </div>

        {/* Status */}
        <div className="mt-4 text-center">
          {gameState.isCheckmate && (
            <p className={cn(
              "text-2xl font-bold",
              gameState.turn !== playerColor ? "text-green-500" : "text-red-500"
            )}>
              {gameState.turn !== playerColor ? "You Win!" : "Checkmate - AI Wins"}
            </p>
          )}
          {gameState.isStalemate && (
            <p className="text-2xl font-bold text-yellow-500">Stalemate - Draw</p>
          )}
          {!gameState.isCheckmate && !gameState.isStalemate && (
            <p className="text-lg text-muted-foreground">
              {isThinking ? (
                <span className="animate-pulse">AI is thinking...</span>
              ) : gameState.isCheck ? (
                <span className="text-red-500 font-bold">Check!</span>
              ) : (
                `${gameState.turn === playerColor ? "Your" : "AI's"} turn`
              )}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-4">
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-1" /> New Game
          </Button>
          <Button
            onClick={undoMove}
            variant="outline"
            size="sm"
            disabled={gameState.moveHistory.length < 2 || isThinking}
          >
            <Undo2 className="h-4 w-4 mr-1" /> Undo
          </Button>
          <Button
            onClick={getHint}
            variant="outline"
            size="sm"
            disabled={gameState.turn !== playerColor || isThinking}
          >
            <Lightbulb className="h-4 w-4 mr-1" /> Hint
          </Button>
        </div>
      </div>

      {/* Move History */}
      <div className="w-full lg:w-64 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
        <h3 className="font-bold mb-2 text-center">Move History</h3>
        <div className="max-h-80 overflow-y-auto space-y-1 font-mono text-sm">
          {gameState.moveHistory.length === 0 ? (
            <p className="text-muted-foreground text-center text-xs">No moves yet</p>
          ) : (
            Array.from({ length: Math.ceil(gameState.moveHistory.length / 2) }).map((_, i) => {
              const whiteMove = gameState.moveHistory[i * 2]
              const blackMove = gameState.moveHistory[i * 2 + 1]
              return (
                <div key={i} className="flex gap-2">
                  <span className="text-muted-foreground w-6">{i + 1}.</span>
                  <span className="w-16">{getMoveNotation(whiteMove)}</span>
                  <span className="w-16">{blackMove ? getMoveNotation(blackMove) : ""}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
