import { describe, it, expect, beforeEach } from 'vitest';
import {
  setMuted, isMuted,
  setBGMVolume, setSFXVolume,
  getBGMVolume, getSFXVolume,
  mapMusicToTrack, getTrackForBattle,
  cleanup,
} from '../audio-manager';

// Audio-manager uses Web Audio API which isn't available in Node.
// We test the state management and mapping functions that don't require AudioContext.

describe('audio-manager', () => {
  beforeEach(() => {
    // Reset muted state
    setMuted(false);
  });

  describe('mute state', () => {
    it('starts unmuted', () => {
      expect(isMuted()).toBe(false);
    });

    it('can be muted', () => {
      setMuted(true);
      expect(isMuted()).toBe(true);
    });

    it('can be unmuted', () => {
      setMuted(true);
      setMuted(false);
      expect(isMuted()).toBe(false);
    });
  });

  describe('volume controls', () => {
    it('sets and gets BGM volume', () => {
      setBGMVolume(0.7);
      expect(getBGMVolume()).toBeCloseTo(0.7);
    });

    it('sets and gets SFX volume', () => {
      setSFXVolume(0.3);
      expect(getSFXVolume()).toBeCloseTo(0.3);
    });

    it('clamps BGM volume to 0-1 range', () => {
      setBGMVolume(-0.5);
      expect(getBGMVolume()).toBe(0);

      setBGMVolume(2.0);
      expect(getBGMVolume()).toBe(1);
    });

    it('clamps SFX volume to 0-1 range', () => {
      setSFXVolume(-1);
      expect(getSFXVolume()).toBe(0);

      setSFXVolume(5);
      expect(getSFXVolume()).toBe(1);
    });
  });

  describe('mapMusicToTrack', () => {
    it('maps known music IDs to tracks', () => {
      expect(mapMusicToTrack('town')).toBe('overworld');
      expect(mapMusicToTrack('route')).toBe('route');
      expect(mapMusicToTrack('cave')).toBe('cave');
      expect(mapMusicToTrack('surf')).toBe('surf');
      expect(mapMusicToTrack('pokemon_center')).toBe('pokemon_center');
      expect(mapMusicToTrack('gym')).toBe('battle_gym');
      expect(mapMusicToTrack('victory_road')).toBe('cave');
      expect(mapMusicToTrack('elite_four')).toBe('battle_champion');
    });

    it('defaults to overworld for unknown IDs', () => {
      expect(mapMusicToTrack('unknown')).toBe('overworld');
      expect(mapMusicToTrack('something_else')).toBe('overworld');
    });

    it('defaults to overworld for undefined', () => {
      expect(mapMusicToTrack(undefined)).toBe('overworld');
    });
  });

  describe('getTrackForBattle', () => {
    it('returns battle_champion for champion battles', () => {
      expect(getTrackForBattle(true, true, true)).toBe('battle_champion');
    });

    it('returns battle_gym for gym leader battles', () => {
      expect(getTrackForBattle(true, true, false)).toBe('battle_gym');
    });

    it('returns battle_trainer for regular trainer battles', () => {
      expect(getTrackForBattle(true, false, false)).toBe('battle_trainer');
    });

    it('returns battle_wild for wild encounters', () => {
      expect(getTrackForBattle(false, false, false)).toBe('battle_wild');
    });

    it('champion takes priority over gym leader', () => {
      expect(getTrackForBattle(true, true, true)).toBe('battle_champion');
    });

    it('gym leader takes priority over regular trainer', () => {
      expect(getTrackForBattle(true, true, false)).toBe('battle_gym');
    });
  });

  describe('cleanup', () => {
    it('does not throw when called without AudioContext', () => {
      expect(() => cleanup()).not.toThrow();
    });
  });
});
