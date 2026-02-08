// ========================================
// MAFIA WARS - TAB NAVIGATION COMPONENT
// ========================================

import { Briefcase, Swords, Building2, Package, User, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GameTab } from '../types'

interface TabNavigationProps {
  activeTab: GameTab
  onTabChange: (tab: GameTab) => void
}

const TABS = [
  { id: 'jobs' as const, label: 'Jobs', icon: Briefcase },
  { id: 'fight' as const, label: 'Fight', icon: Swords },
  { id: 'properties' as const, label: 'Properties', icon: Building2 },
  { id: 'collections' as const, label: 'Collections', icon: Layers },
  { id: 'inventory' as const, label: 'Inventory', icon: Package },
  { id: 'profile' as const, label: 'Profile', icon: User },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="bg-zinc-800/50 border-b border-zinc-700/50">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
