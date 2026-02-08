// ============================================================================
// Pokemon RPG — Input Hook
// ============================================================================

import { useRef, useEffect, useCallback } from 'react';
import { InputManager } from '../engine/input';
import type { InputState } from '../engine/types';

export function useInput() {
  const managerRef = useRef<InputManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new InputManager();
  }

  useEffect(() => {
    const manager = managerRef.current!;
    manager.attach();
    return () => manager.detach();
  }, []);

  const update = useCallback(() => {
    managerRef.current!.update();
  }, []);

  const isHeld = useCallback((button: keyof InputState) => {
    return managerRef.current!.isHeld(button);
  }, []);

  const isJustPressed = useCallback((button: keyof InputState) => {
    return managerRef.current!.isJustPressed(button);
  }, []);

  const getDirection = useCallback(() => {
    return managerRef.current!.getDirection();
  }, []);

  const setButton = useCallback((button: keyof InputState, pressed: boolean) => {
    managerRef.current!.setButton(button, pressed);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    managerRef.current!.setEnabled(enabled);
  }, []);

  return { update, isHeld, isJustPressed, getDirection, setButton, setEnabled };
}
