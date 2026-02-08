// ========================================
// MAFIA WARS - TAB CONTENT COMPONENTS
// ========================================

import { motion } from 'framer-motion'
import { 
  Swords, 
  Shield, 
  ChevronRight, 
  DollarSign, 
  Lock, 
  User, 
  Building2, 
  TrendingUp, 
  Award, 
  RefreshCw,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { GameState, JobTier } from '../types'
import { JobCard, OpponentCard, PropertyCard, EquipmentCard } from './Cards'
import { 
  OPPONENTS, 
  SKILL_POINT_BONUS, 
  getTierName, 
  getUnlockedTiers, 
  formatMoney, 
  formatNumber 
} from '../constants'

// ----------------------------------------
// ANIMATION WRAPPER
// ----------------------------------------

const tabAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

// ----------------------------------------
// JOBS TAB
// ----------------------------------------

interface JobsTabProps {
  state: GameState
  selectedTier: JobTier
  onTierChange: (tier: JobTier) => void
  onDoJob: (jobId: string) => void
}

export function JobsTab({ state, selectedTier, onTierChange, onDoJob }: JobsTabProps) {
  const unlockedTiers = getUnlockedTiers(state.player.level)

  return (
    <motion.div key="jobs" {...tabAnimation}>
      {/* Tier Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['street_thug', 'associate', 'soldier', 'capo', 'underboss', 'boss'] as JobTier[]).map(tier => {
          const unlocked = unlockedTiers.includes(tier)
          return (
            <button
              key={tier}
              onClick={() => unlocked && onTierChange(tier)}
              disabled={!unlocked}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                selectedTier === tier && unlocked
                  ? 'bg-amber-600 text-white'
                  : unlocked
                    ? 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              )}
            >
              {!unlocked && <Lock className="w-3 h-3" />}
              {getTierName(tier)}
            </button>
          )
        })}
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {state.jobs
          .filter(j => j.tier === selectedTier)
          .map(job => (
            <JobCard
              key={job.id}
              job={job}
              energy={state.player.energy}
              onExecute={() => onDoJob(job.id)}
            />
          ))}
      </div>
    </motion.div>
  )
}

// ----------------------------------------
// FIGHT TAB
// ----------------------------------------

interface FightTabProps {
  state: GameState
  totalAttack: number
  totalDefense: number
  onFight: (opponentId: string) => void
}

export function FightTab({ state, totalAttack, totalDefense, onFight }: FightTabProps) {
  return (
    <motion.div key="fight" {...tabAnimation}>
      <div className="mb-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-500" />
              <span>Attack: {totalAttack}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Defense: {totalDefense}</span>
            </div>
          </div>
          <div className="text-sm text-zinc-400">
            W: {state.wins} / L: {state.losses}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {OPPONENTS.map(opp => (
          <OpponentCard
            key={opp.id}
            opponent={opp}
            playerLevel={state.player.level}
            stamina={state.player.stamina}
            onFight={() => onFight(opp.id)}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ----------------------------------------
// PROPERTIES TAB
// ----------------------------------------

interface PropertiesTabProps {
  state: GameState
  pendingIncome: number
  hourlyIncome: number
  onCollectIncome: () => void
  onBuyProperty: (propId: string) => void
}

export function PropertiesTab({
  state,
  pendingIncome,
  hourlyIncome,
  onCollectIncome,
  onBuyProperty,
}: PropertiesTabProps) {
  return (
    <motion.div key="properties" {...tabAnimation}>
      <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-green-400">Pending Income</div>
            <div className="text-2xl font-bold text-green-500">{formatMoney(pendingIncome)}</div>
            <div className="text-xs text-zinc-400">{formatMoney(hourlyIncome)}/hour</div>
          </div>
          <Button
            onClick={onCollectIncome}
            className="bg-green-600 hover:bg-green-500"
            disabled={pendingIncome < 1}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Collect
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {state.properties.map(prop => (
          <PropertyCard
            key={prop.id}
            property={prop}
            cash={state.player.cash}
            onBuy={() => onBuyProperty(prop.id)}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ----------------------------------------
// INVENTORY TAB
// ----------------------------------------

interface InventoryTabProps {
  state: GameState
  onBuyEquipment: (eqId: string) => void
}

export function InventoryTab({ state, onBuyEquipment }: InventoryTabProps) {
  return (
    <motion.div key="inventory" {...tabAnimation}>
      {(['weapon', 'armor', 'vehicle'] as const).map(type => (
        <div key={type} className="mb-8">
          <h3 className="text-lg font-bold mb-4 capitalize flex items-center gap-2">
            {type === 'weapon' && <Swords className="w-5 h-5 text-red-500" />}
            {type === 'armor' && <Shield className="w-5 h-5 text-blue-500" />}
            {type === 'vehicle' && <ChevronRight className="w-5 h-5 text-purple-500" />}
            {type}s
          </h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {state.equipment
              .filter(e => e.type === type)
              .map(eq => (
                <EquipmentCard
                  key={eq.id}
                  equipment={eq}
                  cash={state.player.cash}
                  onBuy={() => onBuyEquipment(eq.id)}
                />
              ))}
          </div>
        </div>
      ))}
    </motion.div>
  )
}

// ----------------------------------------
// PROFILE TAB
// ----------------------------------------

interface ProfileTabProps {
  state: GameState
  totalAttack: number
  totalDefense: number
  onAllocateSkill: (stat: 'attack' | 'defense' | 'energy' | 'stamina') => void
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
  onReset: () => void
}

export function ProfileTab({
  state,
  totalAttack,
  totalDefense,
  onAllocateSkill,
  onDeposit,
  onWithdraw,
  onReset,
}: ProfileTabProps) {
  return (
    <motion.div key="profile" {...tabAnimation} className="space-y-6">
      {/* Stats Overview */}
      <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          {state.player.name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-zinc-400">Level</div>
            <div className="text-xl font-bold">{state.player.level}</div>
          </div>
          <div>
            <div className="text-zinc-400">Mafia Size</div>
            <div className="text-xl font-bold">{state.mafiaSize}</div>
          </div>
          <div>
            <div className="text-zinc-400">Total Attack</div>
            <div className="text-xl font-bold text-red-500">{totalAttack}</div>
          </div>
          <div>
            <div className="text-zinc-400">Total Defense</div>
            <div className="text-xl font-bold text-blue-500">{totalDefense}</div>
          </div>
          <div>
            <div className="text-zinc-400">Cash</div>
            <div className="text-xl font-bold text-green-500">{formatMoney(state.player.cash)}</div>
          </div>
          <div>
            <div className="text-zinc-400">Banked</div>
            <div className="text-xl font-bold text-yellow-500">{formatMoney(state.player.bankedCash)}</div>
          </div>
          <div>
            <div className="text-zinc-400">Wins</div>
            <div className="text-xl font-bold">{formatNumber(state.wins)}</div>
          </div>
          <div>
            <div className="text-zinc-400">Losses</div>
            <div className="text-xl font-bold">{formatNumber(state.losses)}</div>
          </div>
        </div>
      </div>

      {/* Bank */}
      <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-500" />
          Bank
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onDeposit(Math.floor(state.player.cash * 0.1))}>
            Deposit 10%
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDeposit(state.player.cash)}>
            Deposit All
          </Button>
          <Button variant="outline" size="sm" onClick={() => onWithdraw(Math.floor(state.player.bankedCash * 0.1))}>
            Withdraw 10%
          </Button>
          <Button variant="outline" size="sm" onClick={() => onWithdraw(state.player.bankedCash)}>
            Withdraw All
          </Button>
        </div>
      </div>

      {/* Skill Points */}
      {state.player.skillPoints > 0 && (
        <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-700/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Skill Points: {state.player.skillPoints}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['attack', 'defense', 'energy', 'stamina'] as const).map(stat => (
              <Button key={stat} variant="outline" onClick={() => onAllocateSkill(stat)} className="capitalize">
                <Plus className="w-4 h-4 mr-1" />
                {stat} (+{SKILL_POINT_BONUS[stat]})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Achievements ({state.achievements.filter(a => a.unlocked).length}/{state.achievements.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {state.achievements.map(ach => (
            <div
              key={ach.id}
              className={cn(
                'p-3 rounded-lg border text-center transition-colors',
                ach.unlocked
                  ? 'bg-amber-900/30 border-amber-700/50'
                  : 'bg-zinc-800/50 border-zinc-700/50 opacity-50'
              )}
            >
              <div className="text-2xl mb-1">{ach.icon}</div>
              <div className="text-xs font-medium">{ach.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="text-center pt-4">
        <Button variant="destructive" size="sm" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>
      </div>
    </motion.div>
  )
}
