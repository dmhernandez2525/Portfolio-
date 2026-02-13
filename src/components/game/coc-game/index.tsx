import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Import screens directly from the submodule
import { MenuScreen } from '../../../../lib/coc-game/src/components/MenuScreen.tsx'
import { VillageScreen } from '../../../../lib/coc-game/src/components/VillageScreen.tsx'
import { BattleScreen } from '../../../../lib/coc-game/src/components/BattleScreen.tsx'
import { CampaignScreen } from '../../../../lib/coc-game/src/components/CampaignScreen.tsx'
import { LoadGameScreen } from '../../../../lib/coc-game/src/components/LoadGameScreen.tsx'
import type { Screen } from '../../../../lib/coc-game/src/App.tsx'
import type { VillageState } from '../../../../lib/coc-game/src/types/village.ts'
import { createStarterVillage } from '../../../../lib/coc-game/src/engine/village-manager.ts'

export function CocGame() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [villageState, setVillageState] = useState<VillageState>(createStarterVillage)

  const handleCampaignComplete = useCallback(
    (levelNumber: number, stars: number, loot: { gold: number; elixir: number; darkElixir: number } | null) => {
      setVillageState((prev) => {
        const existing = prev.campaignProgress.levels.find((l) => l.levelNumber === levelNumber);
        if (existing && existing.stars >= stars) return prev;

        const updatedLevels = existing
          ? prev.campaignProgress.levels.map((l) =>
              l.levelNumber === levelNumber ? { ...l, stars, completed: stars > 0 } : l,
            )
          : [...prev.campaignProgress.levels, { levelNumber, stars, completed: stars > 0 }];

        const totalStars = updatedLevels.reduce((sum, l) => sum + l.stars, 0);

        let resources = prev.resources;
        if (loot) {
          resources = {
            ...prev.resources,
            gold: prev.resources.gold + loot.gold,
            elixir: prev.resources.elixir + loot.elixir,
            darkElixir: prev.resources.darkElixir + loot.darkElixir,
          };
        }

        return { ...prev, campaignProgress: { levels: updatedLevels, totalStars }, resources };
      });
    },
    [],
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Back to portfolio navigation */}
      <div className="absolute top-3 left-3 z-50">
        <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
          <Link to="/games">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

      {screen === 'menu' && <MenuScreen onNavigate={setScreen} />}
      {screen === 'village' && (
        <VillageScreen onNavigate={setScreen} externalState={villageState} externalSetState={setVillageState} />
      )}
      {screen === 'battle' && <BattleScreen onNavigate={setScreen} />}
      {screen === 'campaign' && (
        <CampaignScreen
          onNavigate={setScreen}
          campaignProgress={villageState.campaignProgress}
          army={villageState.army}
          onCampaignComplete={handleCampaignComplete}
        />
      )}
      {screen === 'load' && <LoadGameScreen onNavigate={setScreen} />}
    </div>
  )
}
