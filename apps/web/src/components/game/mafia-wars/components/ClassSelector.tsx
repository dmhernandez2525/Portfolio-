// ========================================
// MAFIA WARS - CHARACTER CLASS SELECTOR
// ========================================

import { Button } from '@/components/ui/button'
import { CHARACTER_CLASSES } from '../constants'
import type { CharacterClass } from '../types'

interface ClassSelectorProps {
  onSelectClass: (classId: CharacterClass) => void
  onClose: () => void
}

export function ClassSelector({ onSelectClass, onClose }: ClassSelectorProps) {
  const handleSelect = (classId: CharacterClass) => {
    if (confirm(`Are you sure you want to become a ${CHARACTER_CLASSES.find(c => c.id === classId)?.name}? This choice is permanent!`)) {
      onSelectClass(classId)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="w-[600px] max-w-[95vw] bg-zinc-900 border border-amber-700/50 rounded-xl shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-2 text-amber-500">Choose Your Path</h2>
        <p className="text-center text-zinc-400 text-sm mb-6">
          This choice is permanent and defines your playstyle. Choose wisely.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {CHARACTER_CLASSES.map(cls => (
            <div
              key={cls.id}
              className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-amber-600/50 transition-colors flex flex-col"
            >
              <div className="text-3xl text-center mb-2">{cls.icon}</div>
              <h3 className="text-lg font-bold text-center text-amber-100 mb-1">{cls.name}</h3>
              <p className="text-xs text-zinc-400 text-center mb-3 flex-1">{cls.description}</p>

              <div className="space-y-1 mb-4 text-xs">
                {cls.bonuses.energyRegenBonus > 0 && (
                  <div className="text-green-400">+{cls.bonuses.energyRegenBonus} Energy Regen</div>
                )}
                {cls.bonuses.staminaRegenBonus > 0 && (
                  <div className="text-blue-400">+{cls.bonuses.staminaRegenBonus} Stamina Regen</div>
                )}
                {cls.bonuses.jobXpMultiplier > 1 && (
                  <div className="text-purple-400">+{Math.round((cls.bonuses.jobXpMultiplier - 1) * 100)}% Job XP</div>
                )}
                {cls.bonuses.propertyIncomeMultiplier > 1 && (
                  <div className="text-yellow-400">+{Math.round((cls.bonuses.propertyIncomeMultiplier - 1) * 100)}% Property Income</div>
                )}
                {cls.bonuses.bankFeeReduction > 0 && (
                  <div className="text-emerald-400">-{Math.round(cls.bonuses.bankFeeReduction * 100)}% Bank Fee</div>
                )}
                {cls.bonuses.fightCashMultiplier > 1 && (
                  <div className="text-red-400">+{Math.round((cls.bonuses.fightCashMultiplier - 1) * 100)}% Fight Cash</div>
                )}
              </div>

              <Button
                onClick={() => handleSelect(cls.id)}
                className="w-full bg-amber-600 hover:bg-amber-500"
                size="sm"
              >
                Choose {cls.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Decide Later
          </button>
        </div>
      </div>
    </div>
  )
}
