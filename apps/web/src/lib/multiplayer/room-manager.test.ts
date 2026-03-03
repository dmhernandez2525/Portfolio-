import { describe, expect, it } from "vitest"
import {
  createGameHistory,
  createRoom,
  disconnectPlayer,
  findMatch,
  finishGame,
  joinRoom,
  leaveRoom,
  reconnectPlayer,
  startGame,
  updateRating,
  validateMove,
} from "@/lib/multiplayer/room-manager"
import type { Player, MatchRequest } from "@/lib/multiplayer/room-manager"

const hostPlayer: Player = { id: "p1", name: "Alice", rating: 1000, connected: true, lastSeen: Date.now() }
const guestPlayer: Player = { id: "p2", name: "Bob", rating: 1050, connected: true, lastSeen: Date.now() }

describe("createRoom", () => {
  it("creates a room with host as first player", () => {
    const room = createRoom("p1", "Alice", "snake")
    expect(room.code).toHaveLength(6)
    expect(room.host).toBe("p1")
    expect(room.players).toHaveLength(1)
    expect(room.status).toBe("waiting")
    expect(room.gameType).toBe("snake")
  })

  it("generates unique room codes", () => {
    const a = createRoom("p1", "A", "chess")
    const b = createRoom("p2", "B", "chess")
    expect(a.code).not.toBe(b.code)
  })
})

describe("joinRoom", () => {
  it("adds a player to a waiting room", () => {
    const room = createRoom("p1", "Alice", "snake")
    const updated = joinRoom(room, guestPlayer)
    expect(updated?.players).toHaveLength(2)
  })

  it("rejects join when room is full", () => {
    const room = createRoom("p1", "Alice", "snake", 2)
    const withGuest = joinRoom(room, guestPlayer)
    const third: Player = { id: "p3", name: "Carol", rating: 900, connected: true, lastSeen: Date.now() }
    expect(joinRoom(withGuest!, third)).toBeNull()
  })

  it("rejects duplicate player", () => {
    const room = createRoom("p1", "Alice", "snake")
    expect(joinRoom(room, { ...hostPlayer })).toBeNull()
  })

  it("rejects join when game is playing", () => {
    const room = createRoom("p1", "Alice", "snake")
    const started = { ...joinRoom(room, guestPlayer)!, status: "playing" as const }
    const third: Player = { id: "p3", name: "Eve", rating: 1000, connected: true, lastSeen: Date.now() }
    expect(joinRoom(started, third)).toBeNull()
  })
})

describe("leaveRoom", () => {
  it("removes a player", () => {
    const room = createRoom("p1", "Alice", "snake")
    const withGuest = joinRoom(room, guestPlayer)!
    const after = leaveRoom(withGuest, "p2")
    expect(after.players).toHaveLength(1)
  })
})

describe("startGame / finishGame", () => {
  it("starts a game with enough players", () => {
    const room = joinRoom(createRoom("p1", "Alice", "chess"), guestPlayer)!
    const started = startGame(room)
    expect(started?.status).toBe("playing")
  })

  it("rejects start with only 1 player", () => {
    const room = createRoom("p1", "Alice", "chess")
    expect(startGame(room)).toBeNull()
  })

  it("finishes a game", () => {
    const room = joinRoom(createRoom("p1", "Alice", "chess"), guestPlayer)!
    const started = startGame(room)!
    const finished = finishGame(started)
    expect(finished.status).toBe("finished")
  })
})

describe("reconnectPlayer / disconnectPlayer", () => {
  it("disconnects and reconnects a player", () => {
    const room = joinRoom(createRoom("p1", "Alice", "snake"), guestPlayer)!
    const disconnected = disconnectPlayer(room, "p2")
    expect(disconnected.players.find((p) => p.id === "p2")?.connected).toBe(false)

    const reconnected = reconnectPlayer(disconnected, "p2")
    expect(reconnected?.players.find((p) => p.id === "p2")?.connected).toBe(true)
  })

  it("returns null when reconnecting unknown player", () => {
    const room = createRoom("p1", "Alice", "snake")
    expect(reconnectPlayer(room, "unknown")).toBeNull()
  })
})

describe("findMatch", () => {
  const queue: MatchRequest[] = [
    { playerId: "a", rating: 1000, gameType: "snake", timestamp: 1 },
    { playerId: "b", rating: 1100, gameType: "snake", timestamp: 2 },
    { playerId: "c", rating: 1500, gameType: "snake", timestamp: 3 },
    { playerId: "d", rating: 1050, gameType: "chess", timestamp: 4 },
  ]

  it("finds closest rating match", () => {
    const req: MatchRequest = { playerId: "x", rating: 1020, gameType: "snake", timestamp: 5 }
    const match = findMatch(req, queue)
    expect(match?.playerId).toBe("a")
  })

  it("filters by game type", () => {
    const req: MatchRequest = { playerId: "x", rating: 1050, gameType: "chess", timestamp: 5 }
    const match = findMatch(req, queue)
    expect(match?.playerId).toBe("d")
  })

  it("respects rating range", () => {
    const req: MatchRequest = { playerId: "x", rating: 1000, gameType: "snake", timestamp: 5 }
    const match = findMatch(req, queue, 50)
    expect(match?.playerId).toBe("a")
  })

  it("returns null when no match found", () => {
    const req: MatchRequest = { playerId: "x", rating: 2000, gameType: "snake", timestamp: 5 }
    expect(findMatch(req, queue)).toBeNull()
  })

  it("excludes self from match", () => {
    const req: MatchRequest = { playerId: "a", rating: 1000, gameType: "snake", timestamp: 5 }
    const match = findMatch(req, queue)
    expect(match?.playerId).not.toBe("a")
  })
})

describe("validateMove", () => {
  it("validates correct sequence", () => {
    expect(validateMove({ playerId: "p1", moveData: "e2-e4", timestamp: 1, sequence: 1 }, 1)).toBe(true)
  })

  it("rejects wrong sequence", () => {
    expect(validateMove({ playerId: "p1", moveData: "e2-e4", timestamp: 1, sequence: 3 }, 1)).toBe(false)
  })

  it("rejects empty move data", () => {
    expect(validateMove({ playerId: "p1", moveData: "", timestamp: 1, sequence: 1 }, 1)).toBe(false)
  })
})

describe("updateRating", () => {
  it("increases winner rating and decreases loser", () => {
    const result = updateRating(1000, 1000)
    expect(result.winner).toBeGreaterThan(1000)
    expect(result.loser).toBeLessThan(1000)
  })

  it("gives more points for upset wins", () => {
    const upset = updateRating(800, 1200)
    const expected = updateRating(1200, 800)
    expect(upset.winner - 800).toBeGreaterThan(expected.winner - 1200)
  })
})

describe("createGameHistory", () => {
  it("creates a complete history record", () => {
    const room = joinRoom(createRoom("p1", "Alice", "chess"), guestPlayer)!
    const moves = [{ playerId: "p1", moveData: "e2-e4", timestamp: 1, sequence: 1 }]
    const history = createGameHistory(room, moves, "Alice")
    expect(history.roomCode).toBe(room.code)
    expect(history.players).toContain("Alice")
    expect(history.players).toContain("Bob")
    expect(history.moves).toHaveLength(1)
    expect(history.winner).toBe("Alice")
  })
})
