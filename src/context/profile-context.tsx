// ============================================================================
// Local Profile System — Context & Provider
// ============================================================================
// localStorage-based user profiles for game save persistence.
// Full cloud login/sync planned for future release.

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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
  createProfile: (name: string, avatar: string) => UserProfile;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  clearActiveProfile: () => void;
  saveGameData: (gameId: string, data: unknown) => void;
  loadGameData: <T>(gameId: string) => T | null;
}

// --- Constants ---

const STORAGE_KEY = 'portfolio-profiles';
const ACTIVE_PROFILE_KEY = 'portfolio-active-profile';
const MAX_PROFILES = 5;

// --- Storage helpers ---

function loadProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

function saveActiveId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
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

  const activeProfile = profiles.find(p => p.id === activeId) ?? null;

  const createProfile = useCallback((name: string, avatar: string): UserProfile => {
    const profile: UserProfile = {
      id: generateId(),
      name: name.trim() || 'Player',
      avatar,
      createdAt: Date.now(),
      gameData: {},
    };

    setProfiles(prev => {
      const next = [...prev, profile].slice(-MAX_PROFILES);
      saveProfiles(next);
      return next;
    });

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

    if (activeId === id) {
      setActiveId(null);
      saveActiveId(null);
    }
  }, [activeId]);

  const clearActiveProfile = useCallback(() => {
    setActiveId(null);
    saveActiveId(null);
  }, []);

  const saveGameData = useCallback((gameId: string, data: unknown) => {
    if (!activeId) return;

    setProfiles(prev => {
      const next = prev.map(p => {
        if (p.id !== activeId) return p;
        return { ...p, gameData: { ...p.gameData, [gameId]: data } };
      });
      saveProfiles(next);
      return next;
    });
  }, [activeId]);

  const loadGameData = useCallback(<T,>(gameId: string): T | null => {
    if (!activeProfile) return null;
    return (activeProfile.gameData[gameId] as T) ?? null;
  }, [activeProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        createProfile,
        switchProfile,
        deleteProfile,
        clearActiveProfile,
        saveGameData,
        loadGameData,
      }}
    >
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
