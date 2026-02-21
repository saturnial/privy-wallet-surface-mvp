import { createHash } from 'crypto';

export function deterministicId(seed: string): string {
  return createHash('sha256').update(seed).digest('hex').substring(0, 12);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCryptoAmount(value: string, asset: 'ETH' | 'USDC' = 'ETH'): string {
  const num = parseFloat(value);
  if (isNaN(num)) return `0 ${asset}`;
  if (asset === 'USDC') {
    return `${num.toFixed(2)} USDC`;
  }
  return `${num.toFixed(num < 0.001 ? 6 : 4)} ETH`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
