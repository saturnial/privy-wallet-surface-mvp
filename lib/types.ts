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

export interface CryptoTransaction {
  id: string;
  userId: string;
  type: 'send' | 'receive';
  amountEth: string;
  address: string;
  txHash: string;
  network: string;
  createdAt: string;
}
