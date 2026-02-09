// ============================================================================
// Profile Button — Compact header button for profile access
// ============================================================================

import { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/profile-context';
import { ProfileSelector } from './ProfileSelector';

const HINT_KEY = 'profile-hint-dismissed';

export function ProfileButton() {
  const { activeProfile } = useProfile();
  const [showSelector, setShowSelector] = useState(false);
  const [showPulse, setShowPulse] = useState(() => {
    try { return !localStorage.getItem(HINT_KEY); } catch { return true; }
  });

  const handleClick = () => {
    setShowSelector(true);
    if (showPulse) {
      setShowPulse(false);
      try { localStorage.setItem(HINT_KEY, 'true'); } catch { /* ignore */ }
    }
  };

  return (
    <>
      {activeProfile ? (
        <button
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors"
          title={`Profile: ${activeProfile.name}`}
        >
          <span className="text-sm">{activeProfile.avatar}</span>
          <span className="text-xs font-medium text-foreground truncate max-w-[60px]">
            {activeProfile.name}
          </span>
        </button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          aria-label="Sign in"
          className="h-9 w-9 relative"
          title="Create profile"
        >
          <User className="h-4 w-4" />
          {showPulse && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </span>
          )}
        </Button>
      )}

      {showSelector && (
        <ProfileSelector
          onSelect={() => setShowSelector(false)}
          onCancel={() => setShowSelector(false)}
        />
      )}
    </>
  );
}
