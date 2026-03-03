import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Gamepad2, Square, Move } from "lucide-react"
import { FallingBlocksGame } from "./FallingBlocksGame"
import { SnakeGame } from "./SnakeGame"
import { TetrisGame } from "./TetrisGame"

export function GameHub() {
  const [activeGame, setActiveGame] = useState<"menu" | "blocks" | "snake" | "tetris">("menu")
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-neon-cyan hover:text-neon-pink transition-colors">
          <Gamepad2 className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] border-neon-purple p-0 overflow-hidden bg-black/95">
        
        {activeGame === "menu" && (
            <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
                <DialogHeader>
                    <DialogTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-pink text-center">
                        Game Hub
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        Select a game to play
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-6 flex-wrap justify-center">
                    <Button 
                        onClick={() => setActiveGame("blocks")}
                        className="w-48 h-48 flex flex-col gap-4 border-2 border-neon-blue bg-black/50 hover:bg-neon-blue/20"
                        variant="outline"
                    >
                        <Square className="h-12 w-12 text-neon-blue" />
                        <span className="text-xl font-bold">Falling Blocks</span>
                    </Button>
                    
                    <button 
                        onClick={() => setActiveGame("snake")}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-border border-dashed hover:border-neon-pink/50 rounded-xl bg-card/50 hover:bg-neon-pink/5 transition-all w-full md:w-48 md:h-48"
                    >
                        <div className="bg-neon-pink/20 p-4 rounded-full mb-3 group-hover:bg-neon-pink/40 transition-colors">
                            <Move className="w-8 h-8 text-neon-pink" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Neon Snake</h3>
                        <p className="text-xs text-muted-foreground">Classic snake</p>
                    </button>

                    <button 
                        onClick={() => setActiveGame("tetris")}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-border border-dashed hover:border-neon-purple/50 rounded-xl bg-card/50 hover:bg-neon-purple/5 transition-all w-full md:w-48 md:h-48"
                    >
                        <div className="bg-neon-purple/20 p-4 rounded-full mb-3 group-hover:bg-neon-purple/40 transition-colors">
                            <div className="flex gap-0.5">
                                <div className="w-4 h-4 bg-neon-purple" />
                                <div className="w-4 h-4 bg-neon-purple" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">Neon Stacker</h3>
                        <p className="text-xs text-muted-foreground">High-speed stacking</p>
                    </button>
                </div>
            </div>
        )}

        {activeGame !== "menu" && (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center">
                    <Button variant="ghost" onClick={() => setActiveGame("menu")} className="gap-2">
                        <span>←</span> Back to Menu
                    </Button>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                    {activeGame === "blocks" && <FallingBlocksGame />}
                    {activeGame === "snake" && <SnakeGame />}
                    {activeGame === "tetris" && <TetrisGame />}
                </div>
            </div>
        )}

      </DialogContent>
    </Dialog>
  )
}
