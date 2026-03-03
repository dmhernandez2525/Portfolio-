// ========================================
// MAFIA WARS - HEADER COMPONENT
// ========================================

import { Link } from 'react-router-dom'
import { ArrowLeft, Star, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMoney, CHARACTER_CLASSES } from '../constants'
import type { PlayerStats } from '../types'

interface HeaderProps {
  player: PlayerStats
}

export function Header({ player }: HeaderProps) {
  const classDef = player.characterClass
    ? CHARACTER_CLASSES.find(c => c.id === player.characterClass)
    : null

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-amber-900/30">
      <div className="container max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/games">
              <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-300">
              MAFIA WARS
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {classDef && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-700/30 hidden sm:inline-block">
                {classDef.icon} {classDef.name}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Lv.{player.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span>{formatMoney(player.cash)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
