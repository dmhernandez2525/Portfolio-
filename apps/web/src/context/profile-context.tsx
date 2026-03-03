// ============================================================================
// Local Profile System — Context & Provider
// ============================================================================
// localStorage-based user profiles for game save persistence.
// Full cloud login/sync planned for future release.

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// --- Types ---

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;        // emoji
  createdAt: number;
  gameData: Record<string, unknown>;
}

interface ProfileContextValue {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  createProfile: (name: string, avatar: string) => UserProfile | null;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  clearActiveProfile: () => void;
  saveGameData: (gameId: string, data: unknown) => void;
  loadGameData: <T>(gameId: string) => T | null;
}

// --- Constants ---

const STORAGE_KEY = 'portfolio-profiles';
const ACTIVE_PROFILE_KEY = 'portfolio-active-profile';
export const MAX_PROFILES = 5;

// --- Storage helpers ---

function isValidProfile(p: unknown): p is UserProfile {
  if (!p || typeof p !== 'object') return false;
  const obj = p as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.avatar === 'string' &&
    typeof obj.createdAt === 'number' &&
    typeof obj.gameData === 'object' && obj.gameData !== null
  );
}

function loadProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidProfile);
  } catch {
    return [];
  }
}

function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // QuotaExceededError or other storage issue — silently fail
  }
}

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

function saveActiveId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  } catch {
    // Storage issue — silently fail
  }
}

function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// --- Context ---

const ProfileContext = createContext<ProfileContextValue | null>(null);

// --- Provider ---

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(loadProfiles);
  const [activeId, setActiveId] = useState<string | null>(loadActiveId);

  const activeProfile = useMemo(
    () => profiles.find(p => p.id === activeId) ?? null,
    [profiles, activeId]
  );

  const createProfile = useCallback((name: string, avatar: string): UserProfile | null => {
    const profile: UserProfile = {
      id: generateId(),
      name: name.trim() || 'Player',
      avatar,
      createdAt: Date.now(),
      gameData: {},
    };

    let created = false;
    setProfiles(prev => {
      if (prev.length >= MAX_PROFILES) {
        created = false;
        return prev;
      }
      const next = [...prev, profile];
      saveProfiles(next);
      created = true;
      return next;
    });

    if (!created) return null;

    setActiveId(profile.id);
    saveActiveId(profile.id);

    return profile;
  }, []);

  const switchProfile = useCallback((id: string) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      saveProfiles(next);
      return next;
    });

    // Use functional update to avoid stale activeId closure
    setActiveId(prev => {
      if (prev === id) {
        saveActiveId(null);
        return null;
      }
      return prev;
    });
  }, []);

  const clearActiveProfile = useCallback(() => {
    setActiveId(null);
    saveActiveId(null);
  }, []);

  const saveGameData = useCallback((gameId: string, data: unknown) => {
    setProfiles(prev => {
      // Read activeId from state via a closure-safe approach
      const currentActiveId = loadActiveId();
      if (!currentActiveId) return prev;

      const next = prev.map(p => {
        if (p.id !== currentActiveId) return p;
        return { ...p, gameData: { ...p.gameData, [gameId]: data } };
      });
      saveProfiles(next);
      return next;
    });
  }, []);

  const loadGameData = useCallback(<T,>(gameId: string): T | null => {
    if (!activeProfile) return null;
    const data = activeProfile.gameData[gameId];
    return data != null ? (data as T) : null;
  }, [activeProfile]);

  const value = useMemo<ProfileContextValue>(() => ({
    profiles,
    activeProfile,
    createProfile,
    switchProfile,
    deleteProfile,
    clearActiveProfile,
    saveGameData,
    loadGameData,
  }), [profiles, activeProfile, createProfile, switchProfile, deleteProfile, clearActiveProfile, saveGameData, loadGameData]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// --- Hook ---

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
