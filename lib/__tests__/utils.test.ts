import { describe, it, expect } from 'vitest';
import {
  deterministicId,
  generateId,
  formatCurrency,
  truncateAddress,
  formatCryptoAmount,
  isValidAddress,
  formatDate,
  formatTime,
} from '../utils';

describe('deterministicId', () => {
  it('returns a 12-character hex string', () => {
    const id = deterministicId('test-seed');
    expect(id).toMatch(/^[0-9a-f]{12}$/);
  });

  it('is deterministic for the same input', () => {
    expect(deterministicId('seed-a')).toBe(deterministicId('seed-a'));
  });

  it('produces unique IDs for different inputs', () => {
    expect(deterministicId('seed-a')).not.toBe(deterministicId('seed-b'));
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('is not deterministic', () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe('formatCurrency', () => {
  it('formats 0 cents as $0.00', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats 100 cents as $1.00', () => {
    expect(formatCurrency(100)).toBe('$1.00');
  });

  it('formats 100000 cents with comma separator', () => {
    expect(formatCurrency(100000)).toBe('$1,000.00');
  });
});

describe('truncateAddress', () => {
  it('returns short addresses unchanged', () => {
    expect(truncateAddress('0x123456')).toBe('0x123456');
  });

  it('truncates long addresses to first6...last4', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(truncateAddress(addr)).toBe('0x1234...5678');
  });
});

describe('formatCryptoAmount', () => {
  it('formats ETH with 4 decimals', () => {
    expect(formatCryptoAmount('1.5', 'ETH')).toBe('1.5000 ETH');
  });

  it('formats USDC with 2 decimals', () => {
    expect(formatCryptoAmount('250', 'USDC')).toBe('250.00 USDC');
  });

  it('formats tiny ETH with 6 decimals', () => {
    expect(formatCryptoAmount('0.0001', 'ETH')).toBe('0.000100 ETH');
  });

  it('returns 0 for NaN input', () => {
    expect(formatCryptoAmount('not-a-number', 'ETH')).toBe('0 ETH');
  });
});

describe('isValidAddress', () => {
  it('accepts valid 0x + 40 hex address', () => {
    expect(isValidAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true);
  });

  it('rejects missing 0x prefix', () => {
    expect(isValidAddress('1234567890abcdef1234567890abcdef12345678')).toBe(false);
  });

  it('rejects short address', () => {
    expect(isValidAddress('0x1234')).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(isValidAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toBe(false);
  });
});

describe('formatDate', () => {
  it('returns a non-empty string', () => {
    expect(formatDate('2025-06-10T10:00:00Z').length).toBeGreaterThan(0);
  });
});

describe('formatTime', () => {
  it('returns a non-empty string', () => {
    expect(formatTime('2025-06-10T10:00:00Z').length).toBeGreaterThan(0);
  });
});
