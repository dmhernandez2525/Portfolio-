// ============================================================================
// Pokemon RPG Engine - Audio Manager
// ============================================================================
// Chiptune-style synthesized audio using Web Audio API.
// No external audio files needed.

type SFXType =
  | 'hit' | 'hit_super' | 'hit_crit' | 'hit_not_very'
  | 'faint' | 'level_up' | 'evolution' | 'catch'
  | 'select' | 'cancel' | 'heal' | 'save';

type BGMTrack =
  | 'title' | 'overworld' | 'battle_wild' | 'battle_trainer'
  | 'battle_gym' | 'battle_champion' | 'victory' | 'pokemon_center'
  | 'route' | 'cave' | 'surf';

interface AudioState {
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
  currentTrack: BGMTrack | null;
}

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let bgmOscillators: OscillatorNode[] = [];
let bgmInterval: ReturnType<typeof setInterval> | null = null;

const state: AudioState = {
  bgmVolume: 0.3,
  sfxVolume: 0.5,
  muted: false,
  currentTrack: null,
};

function ensureContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    bgmGain = audioCtx.createGain();
    bgmGain.gain.value = state.bgmVolume;
    bgmGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = state.sfxVolume;
    sfxGain.connect(masterGain);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// --- Note frequency helpers ---

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  gainNode?: GainNode,
  startTime?: number
): void {
  const ctx = ensureContext();
  if (state.muted) return;

  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const target = gainNode ?? sfxGain!;
  osc.connect(env);
  env.connect(target);

  const t = startTime ?? ctx.currentTime;
  env.gain.setValueAtTime(0.3, t);
  env.gain.exponentialRampToValueAtTime(0.01, t + duration);

  osc.start(t);
  osc.stop(t + duration);
  bgmOscillators.push(osc);
}

function playNotes(
  notes: string[],
  noteDuration: number,
  type: OscillatorType = 'square',
  gainNode?: GainNode
): void {
  const ctx = ensureContext();
  const now = ctx.currentTime;
  for (let i = 0; i < notes.length; i++) {
    const freq = NOTE_FREQ[notes[i]];
    if (freq) playTone(freq, noteDuration, type, gainNode, now + i * noteDuration * 0.8);
  }
}

// --- BGM Track Definitions ---

interface TrackDef {
  notes: string[];
  tempo: number; // ms per note
  waveform: OscillatorType;
}

const TRACKS: Record<BGMTrack, TrackDef> = {
  title:            { notes: ['E4','G4','B4','E5','D5','B4','G4','E4'], tempo: 300, waveform: 'square' },
  overworld:        { notes: ['C4','E4','G4','C5','B4','G4','E4','C4','D4','F4','A4','D5'], tempo: 250, waveform: 'square' },
  route:            { notes: ['G4','A4','B4','D5','C5','A4','G4','E4','D4','E4','G4','A4'], tempo: 220, waveform: 'square' },
  battle_wild:      { notes: ['E4','E4','G4','E4','D4','E4','G4','A4','G4','E4','D4','C4'], tempo: 150, waveform: 'sawtooth' },
  battle_trainer:   { notes: ['A4','C5','E5','A4','G4','E4','C4','E4','G4','A4','C5','A4'], tempo: 140, waveform: 'sawtooth' },
  battle_gym:       { notes: ['C5','E5','G5','C5','A4','C5','E5','G5','A5','G5','E5','C5'], tempo: 130, waveform: 'sawtooth' },
  battle_champion:  { notes: ['E5','D5','C5','D5','E5','G5','A5','G5','E5','D5','C5','E5'], tempo: 120, waveform: 'sawtooth' },
  victory:          { notes: ['C5','E5','G5','C5','E5','G5','A5','G5','E5','C5'], tempo: 200, waveform: 'square' },
  pokemon_center:   { notes: ['C4','E4','G4','E4','C4','D4','F4','A4','F4','D4'], tempo: 300, waveform: 'triangle' },
  cave:             { notes: ['C3','E3','G3','B3','G3','E3','C3','D3','F3','A3'], tempo: 350, waveform: 'triangle' },
  surf:             { notes: ['E4','G4','A4','B4','A4','G4','E4','D4','E4','G4','A4','B4'], tempo: 280, waveform: 'sine' },
};

// --- Public API ---

export function playBGM(track: BGMTrack): void {
  if (state.currentTrack === track) return;
  stopBGM();
  state.currentTrack = track;

  const def = TRACKS[track];
  if (!def || state.muted) return;

  ensureContext();
  let noteIdx = 0;

  const playNext = () => {
    if (state.muted || state.currentTrack !== track) return;
    const note = def.notes[noteIdx % def.notes.length];
    const freq = NOTE_FREQ[note];
    if (freq) playTone(freq, def.tempo / 1000, def.waveform, bgmGain!);
    noteIdx++;
  };

  playNext();
  bgmInterval = setInterval(playNext, def.tempo);
}

export function stopBGM(): void {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  for (const osc of bgmOscillators) {
    try { osc.stop(); } catch { /* already stopped */ }
  }
  bgmOscillators = [];
  state.currentTrack = null;
}

export function playSFX(sfx: SFXType): void {
  if (state.muted) return;
  ensureContext();

  const sfxDefs: Record<SFXType, { notes: string[]; dur: number; wave: OscillatorType }> = {
    hit:          { notes: ['E4','C4'],                   dur: 0.08, wave: 'square' },
    hit_super:    { notes: ['G4','E4','C4'],              dur: 0.08, wave: 'square' },
    hit_crit:     { notes: ['A4','E4','C4','A3'],         dur: 0.06, wave: 'sawtooth' },
    hit_not_very: { notes: ['C4'],                        dur: 0.12, wave: 'triangle' },
    faint:        { notes: ['E4','D4','C4','B3','A3'],    dur: 0.15, wave: 'sawtooth' },
    level_up:     { notes: ['C4','E4','G4','C5','E5'],    dur: 0.10, wave: 'square' },
    evolution:    { notes: ['C4','D4','E4','F4','G4','A4','B4','C5'], dur: 0.12, wave: 'square' },
    catch:        { notes: ['G4','A4','B4','C5','D5','E5'], dur: 0.10, wave: 'square' },
    select:       { notes: ['E5'],                        dur: 0.05, wave: 'square' },
    cancel:       { notes: ['C4'],                        dur: 0.05, wave: 'square' },
    heal:         { notes: ['C4','E4','G4','C5'],         dur: 0.15, wave: 'triangle' },
    save:         { notes: ['E4','G4','E5'],              dur: 0.12, wave: 'triangle' },
  };

  const def = sfxDefs[sfx];
  if (def) playNotes(def.notes, def.dur, def.wave, sfxGain!);
}

export function setMuted(muted: boolean): void {
  state.muted = muted;
  if (muted) stopBGM();
}

export function isMuted(): boolean {
  return state.muted;
}

export function setBGMVolume(vol: number): void {
  state.bgmVolume = Math.max(0, Math.min(1, vol));
  if (bgmGain) bgmGain.gain.value = state.bgmVolume;
}

export function setSFXVolume(vol: number): void {
  state.sfxVolume = Math.max(0, Math.min(1, vol));
  if (sfxGain) sfxGain.gain.value = state.sfxVolume;
}

export function getBGMVolume(): number {
  return state.bgmVolume;
}

export function getSFXVolume(): number {
  return state.sfxVolume;
}

// Map the music field on GameMap to a BGM track
export function mapMusicToTrack(musicId: string | undefined): BGMTrack {
  if (!musicId) return 'overworld';

  const mapping: Record<string, BGMTrack> = {
    'town': 'overworld',
    'route': 'route',
    'cave': 'cave',
    'surf': 'surf',
    'pokemon_center': 'pokemon_center',
    'gym': 'battle_gym',
    'victory_road': 'cave',
    'elite_four': 'battle_champion',
  };

  return mapping[musicId] ?? 'overworld';
}

export function getTrackForBattle(
  isTrainer: boolean,
  isGymLeader: boolean,
  isChampion: boolean
): BGMTrack {
  if (isChampion) return 'battle_champion';
  if (isGymLeader) return 'battle_gym';
  if (isTrainer) return 'battle_trainer';
  return 'battle_wild';
}

export function cleanup(): void {
  stopBGM();
  if (audioCtx) {
    audioCtx.close().catch(() => { /* ignore close errors */ });
    audioCtx = null;
  }
  masterGain = null;
  bgmGain = null;
  sfxGain = null;
  state.currentTrack = null;
}
