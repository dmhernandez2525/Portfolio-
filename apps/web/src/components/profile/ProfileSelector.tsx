// ============================================================================
// Profile Selector — Modal for choosing/creating local profiles
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { useProfile, MAX_PROFILES, type UserProfile } from '@/context/profile-context';

const AVATAR_OPTIONS = ['🎮', '🕹️', '👾', '🎯', '🏆', '⚡', '🔥', '💎', '🌟', '🎪', '🐉', '🦊'];

interface ProfileSelectorProps {
  onSelect: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export function ProfileSelector({ onSelect, onCancel }: ProfileSelectorProps) {
  const { profiles, activeProfile, createProfile, switchProfile, deleteProfile } = useProfile();
  const [mode, setMode] = useState<'select' | 'create'>(profiles.length === 0 ? 'create' : 'select');
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility — Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Focus trap — focus modal on mount
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleCreate = () => {
    const profile = createProfile(newName, selectedAvatar);
    if (profile) onSelect(profile);
  };

  const handleSelect = (profile: UserProfile) => {
    switchProfile(profile.id);
    onSelect(profile);
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    setConfirmDelete(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? 'Create Profile' : 'Choose Profile'}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full p-6 shadow-2xl outline-none"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {mode === 'create' ? 'Create Profile' : 'Choose Profile'}
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            Local profiles — cloud save & sync coming soon!
          </p>
        </div>

        {mode === 'select' ? (
          <>
            {/* Existing profiles */}
            <div className="space-y-2 mb-4">
              {profiles.map(profile => {
                const savedGames = Object.keys(profile.gameData).length;
                return (
                  <div
                    key={profile.id}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                      ${profile.id === activeProfile?.id
                        ? 'bg-blue-600/20 border border-blue-500/40'
                        : 'bg-neutral-800 border border-transparent hover:border-neutral-600'
                      }`}
                    onClick={() => handleSelect(profile)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(profile); } }}
                  >
                    <span className="text-2xl">{profile.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{profile.name}</p>
                      <p className="text-neutral-500 text-xs">
                        Created {new Date(profile.createdAt).toLocaleDateString()}
                        {savedGames > 0 && ` · ${savedGames} game${savedGames === 1 ? '' : 's'} saved`}
                      </p>
                    </div>

                    {/* Delete button */}
                    {confirmDelete === profile.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(profile.id); }}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                          className="px-2 py-1 bg-neutral-700 text-white text-xs rounded hover:bg-neutral-600"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(profile.id); }}
                        className="text-neutral-600 hover:text-red-400 text-sm transition-colors p-1"
                        title="Delete profile"
                        aria-label={`Delete profile ${profile.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create new button */}
            {profiles.length < MAX_PROFILES && (
              <button
                onClick={() => setMode('create')}
                className="w-full p-3 border-2 border-dashed border-neutral-700 rounded-lg text-neutral-400
                  hover:border-neutral-500 hover:text-neutral-300 transition-colors text-sm"
              >
                + Create New Profile
              </button>
            )}
          </>
        ) : (
          <>
            {/* Create form */}
            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label className="block text-neutral-400 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Player"
                  maxLength={20}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg
                    text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>

              {/* Avatar picker */}
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-2xl p-2 rounded-lg transition-colors
                        ${emoji === selectedAvatar
                          ? 'bg-blue-600/30 border border-blue-500'
                          : 'bg-neutral-800 border border-transparent hover:border-neutral-600'
                        }`}
                      aria-label={`Select avatar ${emoji}`}
                      aria-pressed={emoji === selectedAvatar}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium
                    hover:bg-blue-500 transition-colors"
                >
                  Create
                </button>
                {profiles.length > 0 && (
                  <button
                    onClick={() => setMode('select')}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg
                      hover:bg-neutral-700 transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Cancel */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full mt-4 py-2 text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
          >
            Play without profile
          </button>
        )}
      </div>
    </div>
  );
}

// --- Compact profile badge for in-game display ---

export function ProfileBadge() {
  const { activeProfile } = useProfile();

  if (!activeProfile) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800/80 rounded-md border border-neutral-700/50">
      <span className="text-sm">{activeProfile.avatar}</span>
      <span className="text-xs text-neutral-300 font-medium truncate max-w-[80px]">
        {activeProfile.name}
      </span>
    </div>
  );
}
