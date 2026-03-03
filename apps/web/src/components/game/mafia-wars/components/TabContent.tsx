// ========================================
// MAFIA WARS - TAB CONTENT COMPONENTS
// ========================================

import { useState } from 'react'
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
  Users,
  Skull,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { GameState, JobTier, CharacterClass } from '../types'
import { JobCard, OpponentCard, PropertyCard, EquipmentCard, CollectionCard } from './Cards'
import { BossFightModal } from './BossFightModal'
import {
  ALL_TIERS,
  OPPONENTS,
  BOSS_FIGHTS,
  SKILL_POINT_BONUS,
  CHARACTER_CLASSES,
  getTierName,
  getUnlockedTiers,
  formatMoney,
  formatNumber,
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
  onFightBoss: (bossId: string) => { won: boolean; message: string } | null
}

export function JobsTab({ state, selectedTier, onTierChange, onDoJob, onFightBoss }: JobsTabProps) {
  const unlockedTiers = getUnlockedTiers(state.player.level)
  const [showBosses, setShowBosses] = useState(false)

  // Check if selected tier has all gold mastery
  const tierJobs = state.jobs.filter(j => j.tier === selectedTier)
  const allGold = tierJobs.every(j => j.masteryLevel >= 3)

  // Check if any boss is available for the current view
  const availableBosses = BOSS_FIGHTS.filter(boss =>
    boss.requiredTiers.some(t => t === selectedTier)
  )

  return (
    <motion.div key="jobs" {...tabAnimation}>
      {/* Tier Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_TIERS.map(tier => {
          const unlocked = unlockedTiers.includes(tier)
          const jobs = state.jobs.filter(j => j.tier === tier)
          const tierAllGold = jobs.every(j => j.masteryLevel >= 3)
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
                    ? tierAllGold
                      ? 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70 border border-yellow-700/50'
                      : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              )}
            >
              {!unlocked && <Lock className="w-3 h-3" />}
              {tierAllGold && unlocked && <Sparkles className="w-3 h-3" />}
              {getTierName(tier)}
            </button>
          )
        })}
      </div>

      {/* Boss Fight Toggle */}
      {availableBosses.length > 0 && allGold && (
        <div className="mb-4">
          <Button
            onClick={() => setShowBosses(!showBosses)}
            variant="outline"
            className="border-red-700/50 text-red-400 hover:bg-red-900/20"
            size="sm"
          >
            <Skull className="w-4 h-4 mr-2" />
            {showBosses ? 'Hide Boss Fights' : 'Boss Fights Available!'}
          </Button>
        </div>
      )}

      {showBosses && (
        <div className="mb-6">
          <BossFightModal
            state={state}
            onFightBoss={onFightBoss}
          />
        </div>
      )}

      {/* Jobs Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {tierJobs.map(job => (
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
  onUpgradeProperty: (propId: string) => void
}

export function PropertiesTab({
  state,
  pendingIncome,
  hourlyIncome,
  onCollectIncome,
  onBuyProperty,
  onUpgradeProperty,
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
            onUpgrade={() => onUpgradeProperty(prop.id)}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ----------------------------------------
// COLLECTIONS TAB
// ----------------------------------------

interface CollectionsTabProps {
  state: GameState
}

export function CollectionsTab({ state }: CollectionsTabProps) {
  const completedCount = state.collections.filter(c => c.completed).length
  const totalCount = state.collections.length
  const currentBankFee = Math.round(
    (0.10 - completedCount * 0.005) * 100
  )
  const effectiveFee = Math.max(3, currentBankFee)

  // Group collections by tier
  const tierOrder: Record<string, number> = {
    street_thug: 0, associate: 1, soldier: 2, enforcer: 3, hitman: 4,
    capo: 5, consigliere: 6, underboss: 7, boss: 8,
  }

  const sorted = [...state.collections].sort(
    (a, b) => (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99)
  )

  return (
    <motion.div key="collections" {...tabAnimation}>
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl border border-amber-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-amber-400">Collections Completed</div>
            <div className="text-2xl font-bold text-amber-500">{completedCount}/{totalCount}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400">Bank Fee</div>
            <div className="text-lg font-bold text-green-400">{effectiveFee}%</div>
            <div className="text-xs text-zinc-500">-0.5% per collection</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map(col => (
          <CollectionCard key={col.id} collection={col} />
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
  bankFeeRate: number
  onAllocateSkill: (stat: 'attack' | 'defense' | 'energy' | 'stamina') => void
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
  onReset: () => void
  onRecruit: () => void
  onSelectClass: (classId: CharacterClass) => void
}

export function ProfileTab({
  state,
  totalAttack,
  totalDefense,
  bankFeeRate,
  onAllocateSkill,
  onDeposit,
  onWithdraw,
  onReset,
  onRecruit,
  onSelectClass,
}: ProfileTabProps) {
  const recruitCost = 1000 + Math.floor(500 * Math.pow(state.mafiaSize, 1.3))
  const showClassSelector = state.player.level >= 5 && state.player.characterClass === null
  const classDef = state.player.characterClass
    ? CHARACTER_CLASSES.find(c => c.id === state.player.characterClass)
    : null

  return (
    <motion.div key="profile" {...tabAnimation} className="space-y-6">
      {/* Class Selection Prompt */}
      {showClassSelector && (
        <div className="p-6 bg-gradient-to-r from-amber-900/40 to-yellow-900/40 rounded-xl border border-amber-600/50 animate-pulse-slow">
          <h3 className="text-lg font-bold mb-2 text-amber-400">Choose Your Path!</h3>
          <p className="text-sm text-zinc-300 mb-4">
            You've reached Level 5. Choose a character class to unlock permanent bonuses.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {CHARACTER_CLASSES.map(cls => (
              <button
                key={cls.id}
                onClick={() => {
                  if (confirm(`Become a ${cls.name}? This choice is permanent!`)) {
                    onSelectClass(cls.id)
                  }
                }}
                className="p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/50 hover:border-amber-500/50 transition-colors text-left"
              >
                <div className="text-2xl mb-1">{cls.icon}</div>
                <div className="font-bold text-amber-100 text-sm">{cls.name}</div>
                <div className="text-xs text-zinc-400 mt-1">{cls.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          {state.player.name}
          {classDef && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-700/50">
              {classDef.icon} {classDef.name}
            </span>
          )}
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

      {/* Mafia Recruitment */}
      <div className="p-6 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-xl border border-red-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          Mafia Recruitment
        </h3>
        <p className="text-sm text-zinc-400 mb-3">
          Expand your crew to increase your combat power. Each member adds +2 Attack and +1 Defense.
        </p>
        <div className="flex items-center gap-4">
          <Button
            onClick={onRecruit}
            disabled={state.player.cash < recruitCost}
            className="bg-red-600 hover:bg-red-500"
          >
            <Users className="w-4 h-4 mr-2" />
            Recruit Member ({formatMoney(recruitCost)})
          </Button>
          <span className="text-sm text-zinc-400">
            Current crew: <span className="text-amber-500 font-bold">{state.mafiaSize}</span>
          </span>
        </div>
      </div>

      {/* Bank */}
      <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-500" />
          Bank
        </h3>
        <div className="text-xs text-zinc-400 mb-4">
          Deposit fee: <span className="text-amber-400">{Math.round(bankFeeRate * 100)}%</span>
          <span className="text-zinc-500"> (Complete collections to reduce)</span>
        </div>
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

      {/* Boss Defeats */}
      {state.bossesDefeated.length > 0 && (
        <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-500" />
            Bosses Defeated ({state.bossesDefeated.length}/{BOSS_FIGHTS.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {BOSS_FIGHTS.map(boss => {
              const defeated = state.bossesDefeated.includes(boss.id)
              return (
                <div
                  key={boss.id}
                  className={cn(
                    'p-3 rounded-lg border text-center',
                    defeated
                      ? 'bg-green-900/30 border-green-700/50'
                      : 'bg-zinc-800/50 border-zinc-700/50 opacity-40'
                  )}
                >
                  <div className="text-2xl mb-1">{boss.icon}</div>
                  <div className="text-xs font-medium">{boss.name}</div>
                </div>
              )
            })}
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
