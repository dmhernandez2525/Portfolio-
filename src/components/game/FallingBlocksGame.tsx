import { useEffect, useRef, useState, useCallback } from "react"
import { ArrowLeft, Play, RotateCcw, Trophy } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Block {
  id: number
  x: number
  y: number
  width: number
  height: number
  color: string
  speed: number
}

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

export function FallingBlocksGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [lives, setLives] = useState(3)
  
  // Game state refs (for loop)
  const gameState = useRef({
    blocks: [] as Block[],
    lastSpawn: 0,
    spawnRate: 1000,
    speedMultiplier: 1,
    score: 0,
    lives: 3,
    isPlaying: false
  })

  const endGame = useCallback(() => {
    gameState.current.isPlaying = false
    setIsPlaying(false)
    setGameOver(true)
    
    if (gameState.current.score > highScore) {
      setHighScore(gameState.current.score)
      localStorage.setItem("falling-blocks-highscore", gameState.current.score.toString())
    }
  }, [highScore])

  const handleStartGame = () => {
      // Init game state
      gameState.current.isPlaying = true
      gameState.current.score = 0
      gameState.current.lives = 3
      gameState.current.blocks = []
      gameState.current.speedMultiplier = 1
      gameState.current.lastSpawn = 0 // Reset spawn timer
      
      setScore(0)
      setLives(3)
      setGameOver(false)
      setIsPlaying(true)
  }

  useEffect(() => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight - 80 // Account for header
    }
    window.addEventListener("resize", handleResize)
    handleResize()

    // Game Loop
    const loop = (timestamp: number) => {
      if (!gameState.current.isPlaying) return

      // Clear background cleanly (no trails)
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Spawn
      if (timestamp - gameState.current.lastSpawn > gameState.current.spawnRate) {
        const size = Math.random() * 30 + 30
        const block: Block = {
          id: timestamp,
          x: Math.random() * (canvas.width - size),
          y: -size,
          width: size,
          height: size,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          speed: (Math.random() * 2 + 1) * gameState.current.speedMultiplier
        }
        gameState.current.blocks.push(block)
        gameState.current.lastSpawn = timestamp
        
        // Increase difficulty
        gameState.current.speedMultiplier += 0.005 // Slower ramp up
        gameState.current.spawnRate = Math.max(200, 1000 - gameState.current.score * 5)
      }

      // Update & Draw
      for (let i = gameState.current.blocks.length - 1; i >= 0; i--) {
        const block = gameState.current.blocks[i]
        block.y += block.speed

        ctx.fillStyle = block.color
        // No shadow effects
        ctx.fillRect(block.x, block.y, block.width, block.height)

        // Check bounds
        if (block.y > canvas.height) {
          gameState.current.blocks.splice(i, 1)
          gameState.current.lives -= 1
          setLives(gameState.current.lives)
          
          if (gameState.current.lives <= 0) {
            endGame()
            return
          }
        }
      }

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [isPlaying, endGame])

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return
    
    // Get coords
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY
    
    if ('touches' in e) {
       clientX = e.touches[0].clientX
       clientY = e.touches[0].clientY
    } else {
       clientX = (e as React.MouseEvent).clientX
       clientY = (e as React.MouseEvent).clientY
    }
    
    const x = clientX - rect.left
    const y = clientY - rect.top

    // Check collisions
    for (let i = gameState.current.blocks.length - 1; i >= 0; i--) {
      const block = gameState.current.blocks[i]
      if (
        x >= block.x &&
        x <= block.x + block.width &&
        y >= block.y &&
        y <= block.y + block.height
      ) {
        // Hit!
        gameState.current.blocks.splice(i, 1)
        gameState.current.score += 10
        setScore(gameState.current.score)
        
        // Particle effect could go here
        break // Only hit one per click
      }
    }
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden touch-none no-select">
       {/* Background Grid */}
       <div 
         className="absolute inset-0 opacity-20 pointer-events-none"
         style={{
            backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
            backgroundSize: `50px 50px`
         }}
       />

      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
        <Link to="/" className="pointer-events-auto">
          <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex flex-col items-end gap-2 text-white">
           <div className="flex items-center gap-2 text-2xl font-bold font-mono">
              Score: {score}
           </div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <Trophy className="h-4 w-4 text-yellow-500" /> High: {highScore}
           </div>
           <div className="flex gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                        "w-3 h-3 rounded-full transition-colors",
                        i < lives ? "bg-red-500" : "bg-gray-800"
                    )}
                  />
              ))}
           </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair touch-none"
        onMouseDown={handleClick}
        onTouchStart={handleClick}
      />

      {/* Overlay */}
      {(!isPlaying || gameOver) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
          <Card className="w-full max-w-md p-6 bg-background/90 border-primary/20">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                Falling Blocks
              </h1>
              
              {gameOver && (
                <div className="space-y-2">
                    <p className="text-2xl text-red-500 font-bold">Game Over!</p>
                    <p className="text-muted-foreground">Final Score: {score}</p>
                </div>
              )}

              {!gameOver && !isPlaying && (
                <p className="text-muted-foreground">
                    Tap or click blocks before they hit the bottom. <br/>
                    Don't let them pass!
                </p>
              )}
              
              <Button 
                size="lg" 
                className="w-full text-lg gap-2" 
                onClick={handleStartGame}
              >
                {gameOver ? <RotateCcw className="h-5 w-5" /> : <Play className="h-5 w-5" />} 
                {gameOver ? "Try Again" : "Start Game"}
              </Button>
              
              {highScore > 100 && (
                 <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                    Current Record: {highScore}
                 </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
