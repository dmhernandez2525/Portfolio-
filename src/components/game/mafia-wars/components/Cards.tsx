// ========================================
// MAFIA WARS - CARD COMPONENTS
// ========================================

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  Zap,
  Star,
  Skull,
  Shield,
  Swords,
} from 'lucide-react'

import type { Job, Property, Equipment, Opponent } from '../types'
import { formatMoney } from '../constants'

// ----------------------------------------
// JOB CARD
// ----------------------------------------

interface JobCardProps {
  job: Job
  energy: number
  onExecute: () => void
}

export function JobCard({ job, energy, onExecute }: JobCardProps) {
  const canAfford = energy >= job.energyCost
  const masteryColors = ['text-zinc-500', 'text-amber-700', 'text-zinc-400', 'text-yellow-500']

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-amber-700/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold">{job.name}</h4>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i < job.masteryLevel ? masteryColors[job.masteryLevel] : 'text-zinc-700'
              )}
              fill={i < job.masteryLevel ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{job.description}</p>
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-green-500" />
          {formatMoney(job.cashRewardMin)} - {formatMoney(job.cashRewardMax)}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-purple-500" />
          +{job.expReward} XP
        </span>
      </div>
      {job.masteryLevel < 3 && (
        <div className="mb-3">
          <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${job.masteryProgress}%` }}
            />
          </div>
          <div className="text-xs text-zinc-500 mt-1">{job.masteryProgress}% to next mastery</div>
        </div>
      )}
      <Button onClick={onExecute} disabled={!canAfford} className="w-full" size="sm">
        <Zap className="w-4 h-4 mr-1" />
        Do Job ({job.energyCost} Energy)
      </Button>
    </div>
  )
}

// ----------------------------------------
// OPPONENT CARD
// ----------------------------------------

interface OpponentCardProps {
  opponent: Opponent
  playerLevel: number
  stamina: number
  onFight: () => void
}

export function OpponentCard({ opponent, playerLevel, stamina, onFight }: OpponentCardProps) {
  const staminaCost = 5 + Math.floor(opponent.level / 10)
  const canFight = stamina >= staminaCost
  const levelDiff = playerLevel - opponent.level
  const difficulty =
    levelDiff >= 10 ? 'Easy' : levelDiff >= 0 ? 'Fair' : levelDiff >= -10 ? 'Hard' : 'Deadly'
  const difficultyColor = {
    Easy: 'text-green-500',
    Fair: 'text-yellow-500',
    Hard: 'text-orange-500',
    Deadly: 'text-red-500',
  }[difficulty]

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-red-700/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{opponent.icon}</div>
        <div>
          <h4 className="font-bold">{opponent.name}</h4>
          <div className={cn('text-xs', difficultyColor)}>
            Lv.{opponent.level} • {difficulty}
          </div>
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{opponent.description}</p>
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <span className="flex items-center gap-1">
          <Swords className="w-3 h-3 text-red-400" />
          {opponent.attack}
          <Shield className="w-3 h-3 text-blue-400 ml-2" />
          {opponent.defense}
        </span>
        <span className="text-green-500">
          {formatMoney(opponent.cashRewardMin)}-{formatMoney(opponent.cashRewardMax)}
        </span>
      </div>
      <Button onClick={onFight} disabled={!canFight} variant="destructive" className="w-full" size="sm">
        <Skull className="w-4 h-4 mr-1" />
        Attack ({staminaCost} Stamina)
      </Button>
    </div>
  )
}

// ----------------------------------------
// PROPERTY CARD
// ----------------------------------------

interface PropertyCardProps {
  property: Property
  cash: number
  onBuy: () => void
}

export function PropertyCard({ property, cash, onBuy }: PropertyCardProps) {
  const canAfford = cash >= property.cost
  const maxedOut = property.owned >= property.maxOwnable

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-green-700/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{property.icon}</div>
        <div>
          <h4 className="font-bold">{property.name}</h4>
          <div className="text-xs text-zinc-400">
            Owned: {property.owned}/{property.maxOwnable}
          </div>
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{property.description}</p>
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-green-500">+{formatMoney(property.incomePerHour)}/hr</span>
        <span className="text-zinc-400">{formatMoney(property.cost)}</span>
      </div>
      <Button
        onClick={onBuy}
        disabled={!canAfford || maxedOut}
        className="w-full bg-green-600 hover:bg-green-500"
        size="sm"
      >
        {maxedOut ? 'Maxed Out' : `Buy (${formatMoney(property.cost)})`}
      </Button>
    </div>
  )
}

// ----------------------------------------
// EQUIPMENT CARD
// ----------------------------------------

interface EquipmentCardProps {
  equipment: Equipment
  cash: number
  onBuy: () => void
}

export function EquipmentCard({ equipment, cash, onBuy }: EquipmentCardProps) {
  const canAfford = cash >= equipment.cost

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        equipment.owned > 0
          ? 'bg-amber-900/20 border-amber-700/50'
          : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600/50'
      )}
    >
      <div className="text-2xl text-center mb-1">{equipment.icon}</div>
      <h5 className="font-medium text-sm text-center mb-1">{equipment.name}</h5>
      <div className="text-xs text-center text-zinc-400 mb-2">
        {equipment.attackBonus > 0 && <span className="text-red-400">+{equipment.attackBonus} ATK</span>}
        {equipment.attackBonus > 0 && equipment.defenseBonus > 0 && ' / '}
        {equipment.defenseBonus > 0 && <span className="text-blue-400">+{equipment.defenseBonus} DEF</span>}
      </div>
      {equipment.owned > 0 && (
        <div className="text-xs text-center text-amber-500 mb-2">Owned: {equipment.owned}</div>
      )}
      <Button onClick={onBuy} disabled={!canAfford} variant="outline" size="sm" className="w-full text-xs">
        {formatMoney(equipment.cost)}
      </Button>
    </div>
  )
}
