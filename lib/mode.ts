'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import React from 'react';
import { config } from './config';
import type { InterfaceMode } from './types';

const STORAGE_KEY = 'privy-demo-interface-mode';

interface InterfaceModeContextValue {
  mode: InterfaceMode;
  setMode: (mode: InterfaceMode) => void;
  isForced: boolean;
}

const InterfaceModeContext = createContext<InterfaceModeContextValue>({
  mode: 'abstracted',
  setMode: () => {},
  isForced: false,
});

export function InterfaceModeProvider({ children }: { children: React.ReactNode }) {
  const forced = config.demoForceMode;
  const isForced = forced === 'abstracted' || forced === 'crypto';

  const [mode, setModeState] = useState<InterfaceMode>(() => {
    if (isForced) return forced;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'abstracted' || stored === 'crypto') return stored;
    }
    return 'abstracted';
  });

  useEffect(() => {
    if (!isForced) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode, isForced]);

  const setMode = useCallback(
    (next: InterfaceMode) => {
      if (!isForced) setModeState(next);
    },
    [isForced],
  );

  return React.createElement(
    InterfaceModeContext.Provider,
    { value: { mode, setMode, isForced } },
    children,
  );
}

export function useInterfaceMode() {
  return useContext(InterfaceModeContext);
}
