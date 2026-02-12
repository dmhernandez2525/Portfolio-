import { useState } from 'react'
import type { ReactNode } from 'react'
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

const screens: Record<Screen, (props: { onNavigate: (s: Screen) => void }) => ReactNode> = {
  menu: (props) => <MenuScreen onNavigate={props.onNavigate} />,
  village: (props) => <VillageScreen onNavigate={props.onNavigate} />,
  battle: (props) => <BattleScreen onNavigate={props.onNavigate} />,
  campaign: (props) => <CampaignScreen onNavigate={props.onNavigate} />,
  load: (props) => <LoadGameScreen onNavigate={props.onNavigate} />,
}

export function CocGame() {
  const [screen, setScreen] = useState<Screen>('menu')

  const ScreenComponent = screens[screen]

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

      <ScreenComponent onNavigate={setScreen} />
    </div>
  )
}
