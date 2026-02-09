// ============================================================================
// Profile Button — Compact header button for profile access
// ============================================================================

import { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/profile-context';
import { ProfileSelector } from './ProfileSelector';

export function ProfileButton() {
  const { activeProfile } = useProfile();
  const [showSelector, setShowSelector] = useState(false);

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
          onClick={() => setShowSelector(true)}
          aria-label="Sign in"
          className="h-9 w-9"
          title="Create profile"
        >
          <User className="h-4 w-4" />
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
