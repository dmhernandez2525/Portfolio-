// ========================================
// MAFIA WARS - BOSS FIGHT MODAL
// ========================================

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skull, Shield, Swords, Lock } from 'lucide-react'

import type { GameState } from '../types'
import { BOSS_FIGHTS, getTierName, formatMoney } from '../constants'

interface BossFightModalProps {
  state: GameState
  onFightBoss: (bossId: string) => { won: boolean; message: string } | null
}

export function BossFightModal({ state, onFightBoss }: BossFightModalProps) {
  return (
    <div className="space-y-4">
      {BOSS_FIGHTS.map(boss => {
        const defeated = state.bossesDefeated.includes(boss.id)
        const allMastered = boss.requiredTiers.every(tier => {
          const tierJobs = state.jobs.filter(j => j.tier === tier)
          return tierJobs.every(j => j.masteryLevel >= 3)
        })
        const canFight = allMastered && !defeated && state.player.stamina >= 20 && state.player.health >= 50

        return (
          <div
            key={boss.id}
            className={cn(
              'p-5 rounded-xl border transition-colors',
              defeated
                ? 'bg-green-900/20 border-green-700/50'
                : allMastered
                  ? 'bg-red-900/20 border-red-700/50 hover:border-red-500/70'
                  : 'bg-zinc-800/50 border-zinc-700/50 opacity-60'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{boss.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-amber-100">{boss.name}</h3>
                  {defeated && <span className="text-xs text-green-500 font-bold">DEFEATED</span>}
                  {!allMastered && <Lock className="w-4 h-4 text-zinc-500" />}
                </div>
                <p className="text-sm text-zinc-400 mb-2">{boss.description}</p>

                <div className="flex flex-wrap gap-3 text-xs mb-3">
                  <span className="flex items-center gap-1 text-red-400">
                    <Swords className="w-3 h-3" /> ATK: {boss.attack}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <Shield className="w-3 h-3" /> DEF: {boss.defense}
                  </span>
                  <span className="text-zinc-400">HP: {boss.health.toLocaleString()}</span>
                  <span className="text-green-400">{formatMoney(boss.cashReward)}</span>
                </div>

                <div className="text-xs text-zinc-500 mb-3">
                  Requires Gold Mastery: {boss.requiredTiers.map(t => getTierName(t)).join(', ')}
                </div>

                <div className="text-xs text-amber-400 mb-3">
                  Reward: {boss.rewardDescription}
                </div>

                {!defeated && (
                  <Button
                    onClick={() => onFightBoss(boss.id)}
                    disabled={!canFight}
                    variant="destructive"
                    size="sm"
                  >
                    <Skull className="w-4 h-4 mr-1" />
                    {!allMastered
                      ? 'Locked'
                      : state.player.stamina < 20
                        ? 'Need 20 Stamina'
                        : state.player.health < 50
                          ? 'Need 50 Health'
                          : 'Challenge Boss (20 Stamina)'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
