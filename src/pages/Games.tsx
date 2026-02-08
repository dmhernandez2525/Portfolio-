import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, Gamepad2, Trophy, Star, Clock, Play, Code, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Game {
  id: string
  title: string
  description: string
  longDescription?: string
  thumbnail: string
  category: "classic" | "arcade" | "strategy" | "original"
  link: string
  externalLink?: string // Optional external version
  isExternal: boolean
  isOriginal?: boolean
  isBuiltIn?: boolean // Has a custom-built version
  yearPlayed?: string
  funFact?: string
  features?: string[] // For built-in games
}

const games: Game[] = [
  {
    id: "falling-blocks",
    title: "Falling Blocks",
    description: "My original creation - tap blocks before they hit the bottom!",
    longDescription: "I built this game as a fun addition to my portfolio. Features combo system, power-ups (slow-mo, bombs), and particle effects. It's surprisingly addictive - try to beat your high score!",
    thumbnail: "/game-falling-blocks.svg",
    category: "original",
    link: "/game",
    isExternal: false,
    isOriginal: true,
    isBuiltIn: true,
    funFact: "I built this in a single coding session while procrastinating on 'real' work.",
    features: ["Combo multiplier system", "Power-ups (Bomb, Slow-Mo, Bonus)", "Particle effects", "Progressive difficulty", "High score tracking"]
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "The classic block-stacking puzzle game - fully rebuilt from scratch!",
    longDescription: "My implementation includes the official Super Rotation System (SRS), hold piece functionality, ghost piece preview, and proper scoring. This took way more hours than I'd like to admit.",
    thumbnail: "/game-tetris.svg",
    category: "classic",
    link: "/tetris",
    externalLink: "https://tetris.com/play-tetris",
    isExternal: false,
    isBuiltIn: true,
    yearPlayed: "Since forever",
    funFact: "I've probably spent more hours playing Tetris than any other game. Building my own version was a bucket list item.",
    features: ["SRS rotation with wall kicks", "Hold piece (C/Shift)", "7-bag randomizer", "Ghost piece preview", "Lock delay", "Soft/hard drop scoring"]
  },
  {
    id: "snake",
    title: "Snake",
    description: "The timeless snake game - with swipe controls and combos!",
    longDescription: "Remember playing this on old Nokia phones? This is my neon-themed take with progressive speed, touch controls, and visual polish. Simple but satisfying.",
    thumbnail: "/game-snake.svg",
    category: "arcade",
    link: "/snake",
    externalLink: "https://playsnake.org/",
    isExternal: false,
    isBuiltIn: true,
    yearPlayed: "2000s",
    funFact: "My first 'programming' was trying to figure out how to hack the high score on my dad's phone.",
    features: ["Progressive speed increase", "Touch/swipe controls", "WASD + Arrow key support", "Pause functionality", "High score tracking"]
  },
  {
    id: "chess",
    title: "Chess",
    description: "The ultimate game of strategy - with AI opponent!",
    longDescription: "I built a full chess engine with minimax AI using alpha-beta pruning. Features complete rules including castling, en passant, pawn promotion, and three difficulty levels. Challenge the AI or grab a friend!",
    thumbnail: "/game-chess.svg",
    category: "strategy",
    link: "/chess",
    externalLink: "https://www.chess.com/play/online",
    isExternal: false,
    isBuiltIn: true,
    yearPlayed: "Since childhood",
    funFact: "I learned chess from my grandfather. Building this AI took me back to those days.",
    features: ["Full chess rules implementation", "Minimax AI with alpha-beta pruning", "3 difficulty levels", "Move hints", "Undo functionality", "Move history notation"]
  },
  {
    id: "cookie-clicker",
    title: "Cookie Clicker",
    description: "The classic idle game - click your way to cookie empire!",
    longDescription: "My take on the legendary idle game. Features 8 building types, 10 upgrades, 14 achievements, golden cookies, and auto-save. Watch your CPS climb as you build your cookie empire!",
    thumbnail: "/game-cookie.svg",
    category: "classic",
    link: "/cookie-clicker",
    externalLink: "https://orteil.dashnet.org/cookieclicker/",
    isExternal: false,
    isBuiltIn: true,
    yearPlayed: "2013+",
    funFact: "I once left this running for 3 weeks straight. My cookie empire was legendary.",
    features: ["8 building types", "10 upgrades with effects", "14 achievements", "Golden cookie events", "Auto-save system", "Click effects"]
  },
  {
    id: "agar",
    title: "Agar.io Clone",
    description: "Eat or be eaten - single player with AI opponents!",
    longDescription: "My single-player version of the viral .io game. Features intelligent AI opponents that hunt, flee, and compete for dominance. Grow your cell by eating food and smaller cells while avoiding predators!",
    thumbnail: "/game-agar.svg",
    category: "arcade",
    link: "/agar",
    externalLink: "https://agar.io/#ffa",
    isExternal: false,
    isBuiltIn: true,
    yearPlayed: "2015+",
    funFact: "My best run: I became the largest cell on the server for 3 glorious minutes.",
    features: ["Smart AI opponents", "Cell splitting mechanic", "Dynamic camera zoom", "Leaderboard", "Touch controls", "Food respawning"]
  },
  {
    id: "tanks",
    title: "Tanks",
    description: "Classic artillery game - physics-based destruction!",
    longDescription: "Turn-based artillery game with procedurally generated terrain. Account for gravity, wind, and terrain destruction. Features AI with multiple difficulty levels and 2-player local mode!",
    thumbnail: "/game-tanks.svg",
    category: "strategy",
    link: "/tanks",
    externalLink: "https://www.mathsisfun.com/games/tanks.html",
    isExternal: false,
    isBuiltIn: true,
    yearPlayed: "2000s",
    funFact: "This game actually helped me understand projectile motion in physics class.",
    features: ["Procedural terrain generation", "Realistic projectile physics", "Wind mechanics", "Terrain destruction", "AI opponent", "2-player local mode"]
  },
  {
    id: "mafia-wars",
    title: "Mafia Wars",
    description: "Build your criminal empire - the classic MySpace game reborn!",
    longDescription: "My recreation of the legendary text-based crime RPG. Manage your energy to do jobs, fight rival mobsters, collect protection money from your properties, and rise from street thug to crime boss. Features job tiers, equipment, properties, and skill progression!",
    thumbnail: "/game-mafia.svg",
    category: "strategy",
    link: "/mafia-wars",
    isExternal: false,
    isBuiltIn: true,
    yearPlayed: "2008-2010",
    funFact: "I spent way too many hours on the original. 'Just one more job' they said...",
    features: ["24 unique jobs across 6 tiers", "AI combat system", "8 property types for passive income", "24 weapons/armor/vehicles", "Skill point allocation", "Auto-save with localStorage"]
  }
]

const categoryColors = {
  classic: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  arcade: "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30",
  strategy: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  original: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
}

export function Games() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [filter, setFilter] = useState<"all" | "built-in" | "classic" | "arcade" | "strategy" | "original">("all")

  const filteredGames = filter === "all"
    ? games
    : filter === "built-in"
      ? games.filter(g => g.isBuiltIn)
      : games.filter(g => g.category === filter)

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="container max-w-6xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Gamepad2 className="w-4 h-4" />
              <span className="text-sm font-medium">Game Room</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 dark:from-neon-pink dark:via-neon-purple dark:to-neon-cyan">
                My Favorite Games
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Games have always been a huge part of my life. From learning strategy through chess
              with my grandfather to building my own games today - here are the ones that shaped me.
            </p>
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {(["all", "built-in", "original", "classic", "arcade", "strategy"] as const).map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(cat)}
                className="capitalize"
              >
                {cat === "all" ? "All Games" : cat === "built-in" ? "Play Here" : cat}
                {cat === "built-in" && <Code className="w-3 h-3 ml-1" />}
                {cat === "original" && <Star className="w-3 h-3 ml-1" />}
              </Button>
            ))}
          </motion.div>

          {/* Built-in games highlight */}
          {filter === "all" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold">Play Games Built Into This Site</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                I've built custom versions of these classic games with modern features. Try them out!
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/game">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Play className="w-3 h-3" /> Falling Blocks
                  </Button>
                </Link>
                <Link to="/tetris">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Play className="w-3 h-3" /> Tetris
                  </Button>
                </Link>
                <Link to="/snake">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Play className="w-3 h-3" /> Snake
                  </Button>
                </Link>
                <Link to="/chess">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Play className="w-3 h-3" /> Chess
                  </Button>
                </Link>
                <Link to="/tanks">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Play className="w-3 h-3" /> Tanks
                  </Button>
                </Link>
                <Link to="/cookie-clicker">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Play className="w-3 h-3" /> Cookie Clicker
                  </Button>
                </Link>
                <Link to="/agar">
                  <Button size="sm" variant="secondary" className="gap-1">
                    <Play className="w-3 h-3" /> Agar.io
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative bg-card rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                  game.isBuiltIn
                    ? "border-primary/50 hover:border-primary hover:shadow-primary/20"
                    : game.isOriginal
                      ? "border-green-500/50 hover:border-green-500 hover:shadow-green-500/20"
                      : "border-border hover:border-primary/50 hover:shadow-primary/10"
                }`}
              >
                {/* Badges */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                  {game.isOriginal && (
                    <Badge className="bg-green-500 text-white">
                      <Star className="w-3 h-3 mr-1" /> Original
                    </Badge>
                  )}
                  {game.isBuiltIn && !game.isOriginal && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Code className="w-3 h-3 mr-1" /> Built-In
                    </Badge>
                  )}
                </div>

                {/* Thumbnail placeholder */}
                <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl opacity-50 group-hover:scale-110 transition-transform">
                    {game.id === "chess" && "♟️"}
                    {game.id === "cookie-clicker" && "🍪"}
                    {game.id === "agar" && "🔵"}
                    {game.id === "tanks" && "💥"}
                    {game.id === "falling-blocks" && "🎮"}
                    {game.id === "tetris" && "🧱"}
                    {game.id === "snake" && "🐍"}
                  </div>
                  {game.isExternal && (
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-black/50 px-2 py-1 rounded">
                      External Link
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{game.title}</h3>
                    <Badge variant="outline" className={categoryColors[game.category]}>
                      {game.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {game.description}
                  </p>

                  {game.yearPlayed && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Clock className="w-3 h-3" />
                      Playing since: {game.yearPlayed}
                    </div>
                  )}

                  {/* Features for built-in games */}
                  {game.features && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {game.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {f}
                        </span>
                      ))}
                      {game.features.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{game.features.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* Primary play button */}
                    <Button
                      asChild
                      size="sm"
                      className="flex-1"
                    >
                      {game.isExternal ? (
                        <a href={game.link} target="_blank" rel="noopener noreferrer">
                          <Play className="w-4 h-4 mr-1" /> Play
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <Link to={game.link}>
                          <Play className="w-4 h-4 mr-1" /> Play My Version
                        </Link>
                      )}
                    </Button>

                    {/* Secondary external link for built-in games */}
                    {game.externalLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={game.externalLink} target="_blank" rel="noopener noreferrer" title="Play original">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGame(game)}
                    >
                      Info
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Game Detail Modal */}
          {selectedGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedGame(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-card rounded-xl p-6 max-w-lg w-full shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedGame.title}</h2>
                    <Badge variant="outline" className={`mt-2 ${categoryColors[selectedGame.category]}`}>
                      {selectedGame.category}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    {selectedGame.isOriginal && (
                      <Badge className="bg-green-500 text-white">
                        <Star className="w-3 h-3 mr-1" /> Original
                      </Badge>
                    )}
                    {selectedGame.isBuiltIn && !selectedGame.isOriginal && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Code className="w-3 h-3 mr-1" /> Built-In
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">
                  {selectedGame.longDescription}
                </p>

                {/* Features list for built-in games */}
                {selectedGame.features && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Features</h4>
                    <ul className="grid grid-cols-2 gap-1">
                      {selectedGame.features.map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="text-primary">-</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedGame.funFact && (
                  <div className="bg-primary/10 rounded-lg p-4 mb-4">
                    <p className="text-sm">
                      <span className="font-bold text-primary">Fun Fact:</span> {selectedGame.funFact}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    {selectedGame.isExternal ? (
                      <a href={selectedGame.link} target="_blank" rel="noopener noreferrer">
                        <Play className="w-4 h-4 mr-2" /> Play Now
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    ) : (
                      <Link to={selectedGame.link}>
                        <Play className="w-4 h-4 mr-2" /> Play My Version
                      </Link>
                    )}
                  </Button>
                  {selectedGame.externalLink && (
                    <Button variant="outline" asChild>
                      <a href={selectedGame.externalLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Original
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedGame(null)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Challenge me to a game sometime!
              </span>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
