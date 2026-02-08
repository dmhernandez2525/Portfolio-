// ========================================
// MAFIA WARS - RESOURCE BARS COMPONENT
// ========================================

import { Zap, Battery, Heart, TrendingUp } from 'lucide-react'
import type { PlayerStats } from '../types'

interface ResourceBarsProps {
  player: PlayerStats
}

export function ResourceBars({ player }: ResourceBarsProps) {
  return (
    <div className="bg-black/40 border-b border-zinc-700/50 py-2">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Energy */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
              />
            </div>
            <span>
              {player.energy}/{player.maxEnergy}
            </span>
          </div>

          {/* Stamina */}
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-blue-500" />
            <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(player.stamina / player.maxStamina) * 100}%` }}
              />
            </div>
            <span>
              {player.stamina}/{player.maxStamina}
            </span>
          </div>

          {/* Health */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              />
            </div>
            <span>
              {player.health}/{player.maxHealth}
            </span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${(player.experience / player.experienceToLevel) * 100}%` }}
              />
            </div>
            <span>
              {player.experience}/{player.experienceToLevel} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
