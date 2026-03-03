/**
 * Multiplayer room management, matchmaking, and game state synchronization.
 */

export interface Player {
  id: string
  name: string
  rating: number
  connected: boolean
  lastSeen: number
}

export interface GameRoom {
  code: string
  host: string
  players: Player[]
  maxPlayers: number
  status: RoomStatus
  gameType: string
  createdAt: number
}

export type RoomStatus = "waiting" | "playing" | "finished"

export interface MatchRequest {
  playerId: string
  rating: number
  gameType: string
  timestamp: number
}

export interface GameMove {
  playerId: string
  moveData: string
  timestamp: number
  sequence: number
}

export interface GameHistory {
  roomCode: string
  gameType: string
  players: string[]
  moves: GameMove[]
  winner: string | null
  startedAt: number
  finishedAt: number
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function createRoom(hostId: string, hostName: string, gameType: string, maxPlayers = 2): GameRoom {
  return {
    code: generateRoomCode(),
    host: hostId,
    players: [{ id: hostId, name: hostName, rating: 1000, connected: true, lastSeen: Date.now() }],
    maxPlayers,
    status: "waiting",
    gameType,
    createdAt: Date.now(),
  }
}

export function joinRoom(room: GameRoom, player: Player): GameRoom | null {
  if (room.status !== "waiting") return null
  if (room.players.length >= room.maxPlayers) return null
  if (room.players.some((p) => p.id === player.id)) return null

  return {
    ...room,
    players: [...room.players, { ...player, connected: true, lastSeen: Date.now() }],
  }
}

export function leaveRoom(room: GameRoom, playerId: string): GameRoom {
  return {
    ...room,
    players: room.players.filter((p) => p.id !== playerId),
  }
}

export function startGame(room: GameRoom): GameRoom | null {
  if (room.status !== "waiting") return null
  if (room.players.length < 2) return null
  return { ...room, status: "playing" }
}

export function finishGame(room: GameRoom): GameRoom {
  return { ...room, status: "finished" }
}

export function reconnectPlayer(room: GameRoom, playerId: string): GameRoom | null {
  const playerIdx = room.players.findIndex((p) => p.id === playerId)
  if (playerIdx < 0) return null

  const players = [...room.players]
  players[playerIdx] = { ...players[playerIdx], connected: true, lastSeen: Date.now() }
  return { ...room, players }
}

export function disconnectPlayer(room: GameRoom, playerId: string): GameRoom {
  const players = room.players.map((p) =>
    p.id === playerId ? { ...p, connected: false } : p
  )
  return { ...room, players }
}

export function findMatch(
  request: MatchRequest,
  queue: MatchRequest[],
  ratingRange = 200
): MatchRequest | null {
  const candidates = queue.filter(
    (q) =>
      q.playerId !== request.playerId &&
      q.gameType === request.gameType &&
      Math.abs(q.rating - request.rating) <= ratingRange
  )

  if (candidates.length === 0) return null

  candidates.sort((a, b) => Math.abs(a.rating - request.rating) - Math.abs(b.rating - request.rating))
  return candidates[0]
}

export function validateMove(move: GameMove, expectedSequence: number): boolean {
  if (move.sequence !== expectedSequence) return false
  if (!move.playerId || !move.moveData) return false
  return true
}

export function updateRating(winnerRating: number, loserRating: number, kFactor = 32): { winner: number; loser: number } {
  const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
  const expectedLose = 1 - expectedWin

  return {
    winner: Math.round(winnerRating + kFactor * (1 - expectedWin)),
    loser: Math.round(loserRating + kFactor * (0 - expectedLose)),
  }
}

export function createGameHistory(
  room: GameRoom,
  moves: GameMove[],
  winner: string | null
): GameHistory {
  return {
    roomCode: room.code,
    gameType: room.gameType,
    players: room.players.map((p) => p.name),
    moves: [...moves],
    winner,
    startedAt: room.createdAt,
    finishedAt: Date.now(),
  }
}
