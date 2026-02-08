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
  ArrowUpCircle,
} from 'lucide-react'

import type { Job, Property, Equipment, Opponent, Collection } from '../types'
import { formatMoney, getPropertyIncome, getPropertyUpgradeCost } from '../constants'
import {
  SPRITES,
  CHARACTER_POSITIONS,
  PROPERTY_POSITIONS,
  WEAPON_POSITIONS,
  ARMOR_POSITIONS,
  VEHICLE_POSITIONS,
} from '../assets'

// ----------------------------------------
// SPRITE ICON HELPER
// ----------------------------------------

interface SpriteIconProps {
  sprite: string
  position: { row: number; col: number } | undefined
  size?: number
  cols: number
  baseSize: number
  fallbackIcon?: string
  className?: string
}

function SpriteIcon({
  sprite,
  position,
  size = 48,
  cols,
  baseSize,
  fallbackIcon = '❓',
  className = '',
}: SpriteIconProps) {
  if (!position) {
    return <span className={`text-3xl ${className}`}>{fallbackIcon}</span>
  }

  return (
    <div
      className={`overflow-hidden flex-shrink-0 rounded-lg ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sprite})`,
        backgroundPosition: `-${position.col * baseSize}px -${position.row * baseSize}px`,
        backgroundSize: `${cols * baseSize}px auto`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}

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
    <div className="mafia-card p-4 rounded-xl border border-amber-900/50 hover:border-red-700/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <SpriteIcon
          sprite={SPRITES.characters}
          position={CHARACTER_POSITIONS[opponent.id]}
          size={64}
          cols={4}
          baseSize={128}
          fallbackIcon={opponent.icon}
        />
        <div>
          <h4 className="font-bold text-amber-100">{opponent.name}</h4>
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
  onUpgrade?: () => void
}

export function PropertyCard({ property, cash, onBuy, onUpgrade }: PropertyCardProps) {
  const canAfford = cash >= property.cost
  const maxedOut = property.owned >= property.maxOwnable
  const upgradeCost = getPropertyUpgradeCost(property)
  const canUpgrade = property.owned > 0 && property.upgradeLevel < 3 && cash >= upgradeCost
  const upgradeNames = ['Base', 'Improved', 'Premium', 'Maximum']
  const income = getPropertyIncome(property)

  return (
    <div className="mafia-card p-4 rounded-xl border border-amber-900/50 hover:border-green-700/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <SpriteIcon
          sprite={SPRITES.properties}
          position={PROPERTY_POSITIONS[property.id]}
          size={64}
          cols={4}
          baseSize={128}
          fallbackIcon={property.icon}
        />
        <div>
          <h4 className="font-bold text-amber-100">{property.name}</h4>
          <div className="text-xs text-amber-200/70">
            Owned: {property.owned}/{property.maxOwnable}
          </div>
          {property.owned > 0 && (
            <div className="text-xs text-zinc-400">
              Level: <span className="text-amber-400">{upgradeNames[property.upgradeLevel]}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{property.description}</p>
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-green-500">+{formatMoney(income)}/hr per unit</span>
        <span className="text-zinc-400">{formatMoney(property.cost)}</span>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onBuy}
          disabled={!canAfford || maxedOut}
          className="flex-1 bg-green-600 hover:bg-green-500"
          size="sm"
        >
          {maxedOut ? 'Maxed Out' : `Buy (${formatMoney(property.cost)})`}
        </Button>
        {property.owned > 0 && property.upgradeLevel < 3 && onUpgrade && (
          <Button
            onClick={onUpgrade}
            disabled={!canUpgrade}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <ArrowUpCircle className="w-4 h-4 mr-1" />
            {formatMoney(upgradeCost)}
          </Button>
        )}
      </div>
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
  const maxedOut = equipment.owned >= equipment.maxOwnable
  const canAfford = cash >= equipment.cost && !maxedOut

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        equipment.owned > 0
          ? 'bg-amber-900/20 border-amber-700/50'
          : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600/50'
      )}
    >
      <div className="flex justify-center mb-1">
        <SpriteIcon
          sprite={
            equipment.type === 'weapon'
              ? SPRITES.weapons
              : equipment.type === 'armor'
              ? SPRITES.armor
              : SPRITES.vehicles
          }
          position={
            equipment.type === 'weapon'
              ? WEAPON_POSITIONS[equipment.id]
              : equipment.type === 'armor'
              ? ARMOR_POSITIONS[equipment.id]
              : VEHICLE_POSITIONS[equipment.id]
          }
          size={48}
          cols={equipment.type === 'vehicle' ? 3 : 4}
          baseSize={equipment.type === 'vehicle' ? 170 : 128}
          fallbackIcon={equipment.icon}
        />
      </div>
      <h5 className="font-medium text-sm text-center mb-1 text-amber-100">{equipment.name}</h5>
      <div className="text-xs text-center text-zinc-400 mb-2">
        {equipment.attackBonus > 0 && <span className="text-red-400">+{equipment.attackBonus} ATK</span>}
        {equipment.attackBonus > 0 && equipment.defenseBonus > 0 && ' / '}
        {equipment.defenseBonus > 0 && <span className="text-blue-400">+{equipment.defenseBonus} DEF</span>}
      </div>
      {equipment.owned > 0 && (
        <div className="text-xs text-center text-amber-500 mb-2">Owned: {equipment.owned}/{equipment.maxOwnable}</div>
      )}
      <Button onClick={onBuy} disabled={!canAfford} variant="outline" size="sm" className="w-full text-xs">
        {maxedOut ? 'MAXED' : formatMoney(equipment.cost)}
      </Button>
    </div>
  )
}

// ----------------------------------------
// COLLECTION CARD
// ----------------------------------------

interface CollectionCardProps {
  collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const collectedCount = collection.items.filter(i => i.collected).length
  const totalItems = collection.items.length
  const progress = Math.round((collectedCount / totalItems) * 100)

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-colors',
        collection.completed
          ? 'bg-green-900/20 border-green-700/50'
          : collectedCount > 0
            ? 'bg-amber-900/10 border-amber-700/30'
            : 'bg-zinc-800/50 border-zinc-700/50'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-amber-100">{collection.name}</h4>
        <span className={cn(
          'text-xs font-medium',
          collection.completed ? 'text-green-500' : 'text-zinc-400'
        )}>
          {collectedCount}/{totalItems}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {collection.items.map(item => (
          <div
            key={item.id}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded text-lg border transition-colors',
              item.collected
                ? 'bg-amber-900/40 border-amber-600/50'
                : 'bg-zinc-800/80 border-zinc-700/50 grayscale opacity-40'
            )}
            title={item.collected ? item.name : '???'}
          >
            {item.icon}
          </div>
        ))}
      </div>

      {!collection.completed && (
        <div className="mb-2">
          <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className={cn(
        'text-xs',
        collection.completed ? 'text-green-400 font-medium' : 'text-zinc-500'
      )}>
        {collection.completed ? `Completed! ${collection.rewardDescription}` : `Reward: ${collection.rewardDescription}`}
      </div>
    </div>
  )
}
