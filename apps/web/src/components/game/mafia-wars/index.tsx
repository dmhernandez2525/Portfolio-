// ========================================
// MAFIA WARS - MAIN GAME COMPONENT
// ========================================
// A recreation of the classic 2009 Zynga game
// ========================================

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import type { GameState, GameTab, JobTier } from './types'

import {
  loadGameState,
  useSaveGame,
  useMessages,
  useRegeneration,
  useLevelUp,
  useAchievements,
  useGameActions,
  useComputedValues,
  useIncomeCollection,
} from './hooks'

import {
  Header,
  ResourceBars,
  TabNavigation,
  ToastNotifications,
  JobsTab,
  FightTab,
  PropertiesTab,
  CollectionsTab,
  InventoryTab,
  ProfileTab,
} from './components'

// Import authentic Mafia Wars styling
import './mafia-wars.css'

// ----------------------------------------
// MAIN COMPONENT
// ----------------------------------------

export function MafiaWarsGame() {
  // Core state
  const [state, setState] = useState<GameState>(loadGameState)
  const [activeTab, setActiveTab] = useState<GameTab>('jobs')
  const [selectedTier, setSelectedTier] = useState<JobTier>('street_thug')

  // Hooks for game systems
  useSaveGame(state)
  const addMessage = useMessages(setState)
  useRegeneration(setState)
  const checkLevelUp = useLevelUp()
  const checkAchievements = useAchievements(setState)

  // Game actions
  const {
    doJob,
    fightOpponent,
    buyProperty,
    upgradeProperty,
    buyEquipment,
    allocateSkillPoint,
    depositCash,
    withdrawCash,
    selectClass,
    fightBoss,
    resetGame,
    recruitMafia,
  } = useGameActions({
    setState,
    addMessage,
    checkLevelUp,
    checkAchievements,
  })

  // Computed values
  const { totalAttack, totalDefense, pendingIncome, hourlyIncome, bankFeeRate, calculatePendingIncome } =
    useComputedValues(state)

  // Income collection
  const collectIncome = useIncomeCollection(setState, addMessage, calculatePendingIncome, checkAchievements)

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
    <div className="mafia-wars-container min-h-screen">
      <Header player={state.player} />
      <ResourceBars player={state.player} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container max-w-5xl mx-auto px-4 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'jobs' && (
            <JobsTab
              state={state}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              onDoJob={doJob}
              onFightBoss={fightBoss}
            />
          )}

          {activeTab === 'fight' && (
            <FightTab
              state={state}
              totalAttack={totalAttack}
              totalDefense={totalDefense}
              onFight={fightOpponent}
            />
          )}

          {activeTab === 'properties' && (
            <PropertiesTab
              state={state}
              pendingIncome={pendingIncome}
              hourlyIncome={hourlyIncome}
              onCollectIncome={collectIncome}
              onBuyProperty={buyProperty}
              onUpgradeProperty={upgradeProperty}
            />
          )}

          {activeTab === 'collections' && (
            <CollectionsTab state={state} />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab state={state} onBuyEquipment={buyEquipment} />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              state={state}
              totalAttack={totalAttack}
              totalDefense={totalDefense}
              bankFeeRate={bankFeeRate}
              onAllocateSkill={allocateSkillPoint}
              onDeposit={depositCash}
              onWithdraw={withdrawCash}
              onReset={resetGame}
              onRecruit={recruitMafia}
              onSelectClass={selectClass}
            />
          )}
        </AnimatePresence>
      </main>

      <ToastNotifications messages={state.messages || []} />
    </div>
  )
}

export default MafiaWarsGame
