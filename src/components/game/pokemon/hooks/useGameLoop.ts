// ============================================================================
// Pokemon RPG — Game Loop Hook (60fps RAF)
// ============================================================================

import { useRef, useEffect, useCallback } from 'react';

export type GameLoopCallback = (dt: number, frameCount: number) => void;

export function useGameLoop(callback: GameLoopCallback, active: boolean) {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const loop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05); // cap at 50ms
    lastTimeRef.current = timestamp;
    frameCountRef.current++;

    callbackRef.current(dt, frameCountRef.current);

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, loop]);

  return frameCountRef;
}
