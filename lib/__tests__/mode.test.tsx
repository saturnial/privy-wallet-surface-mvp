// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import React from 'react';

// happy-dom in Vitest doesn't always initialise localStorage correctly.
// Provide a simple in-memory shim that satisfies the Storage interface.
const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

vi.mock('@/lib/config', () => ({
  config: {
    demoForceMode: undefined as string | undefined,
  },
}));

import { InterfaceModeProvider, useInterfaceMode } from '../mode';
import { config } from '@/lib/config';

const STORAGE_KEY = 'privy-demo-interface-mode';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(InterfaceModeProvider, null, children);

describe('useInterfaceMode', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorageMock.clear();
    (config as Record<string, unknown>).demoForceMode = undefined;
  });

  it("defaults to 'abstracted'", () => {
    const { result } = renderHook(() => useInterfaceMode(), { wrapper });
    expect(result.current.mode).toBe('abstracted');
  });

  it('reads stored mode from localStorage', () => {
    localStorageMock.setItem(STORAGE_KEY, 'crypto');
    const { result } = renderHook(() => useInterfaceMode(), { wrapper });
    expect(result.current.mode).toBe('crypto');
  });

  it('setMode updates mode', () => {
    const { result } = renderHook(() => useInterfaceMode(), { wrapper });
    act(() => {
      result.current.setMode('crypto');
    });
    expect(result.current.mode).toBe('crypto');
  });

  it('persists mode to localStorage', () => {
    const { result } = renderHook(() => useInterfaceMode(), { wrapper });
    act(() => {
      result.current.setMode('crypto');
    });
    expect(localStorageMock.getItem(STORAGE_KEY)).toBe('crypto');
  });

  it('ignores setMode when forced', () => {
    (config as Record<string, unknown>).demoForceMode = 'abstracted';
    const { result } = renderHook(() => useInterfaceMode(), { wrapper });
    act(() => {
      result.current.setMode('crypto');
    });
    expect(result.current.mode).toBe('abstracted');
    expect(result.current.isForced).toBe(true);
  });

  it("invalid localStorage value falls back to 'abstracted'", () => {
    localStorageMock.setItem(STORAGE_KEY, 'garbage');
    const { result } = renderHook(() => useInterfaceMode(), { wrapper });
    expect(result.current.mode).toBe('abstracted');
  });
});
