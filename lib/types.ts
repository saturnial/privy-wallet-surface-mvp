export interface User {
  id: string;
  email: string;
  walletAddress: string;
  displayName: string;
  balanceCents: number;
  createdAt: string;
}

export interface Recipient {
  id: string;
  name: string;
  nickname: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'send' | 'receive';
  amountCents: number;
  counterpartyLabel: string;
  createdAt: string;
  txHash?: string;
}

export type InterfaceMode = 'abstracted' | 'crypto';

export type CryptoAsset = 'ETH' | 'USDC';

export interface CryptoTransaction {
  id: string;
  userId: string;
  type: 'send' | 'receive';
  asset: CryptoAsset;
  amount: string;
  address: string;
  txHash: string;
  network: string;
  createdAt: string;
}
