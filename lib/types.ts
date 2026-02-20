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
