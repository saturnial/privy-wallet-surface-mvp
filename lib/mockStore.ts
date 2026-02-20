import { User, Recipient, Transaction } from './types';
import { generateId } from './utils';
import { config } from './config';

const users = new Map<string, User>();
const transactions = new Map<string, Transaction[]>();

const recipients: Recipient[] = [
  { id: 'r1', name: 'Acme Corp', nickname: 'acme', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'r2', name: 'Jane Smith', nickname: 'jane', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'r3', name: 'Global Payments Inc', nickname: 'gpi', createdAt: '2025-03-10T10:00:00Z' },
];

export function getUser(email: string): User | undefined {
  return users.get(email);
}

export function getUserById(id: string): User | undefined {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return undefined;
}

export function createUser(data: {
  email: string;
  walletAddress: string;
  displayName?: string;
}): User {
  const existing = users.get(data.email);
  if (existing) return existing;

  const user: User = {
    id: generateId(),
    email: data.email,
    walletAddress: data.walletAddress,
    displayName: data.displayName || data.email.split('@')[0],
    balanceCents: config.defaultBalanceCents,
    createdAt: new Date().toISOString(),
  };
  users.set(data.email, user);

  const seedTxns: Transaction[] = [
    {
      id: generateId(),
      userId: user.id,
      type: 'receive',
      amountCents: 100000,
      counterpartyLabel: 'Initial Deposit',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: generateId(),
      userId: user.id,
      type: 'receive',
      amountCents: 25000,
      counterpartyLabel: 'Acme Corp',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  transactions.set(user.id, seedTxns);

  return user;
}

export function updateUser(
  email: string,
  updates: Partial<Pick<User, 'displayName' | 'walletAddress'>>
): User | undefined {
  const user = users.get(email);
  if (!user) return undefined;
  Object.assign(user, updates);
  return user;
}

export function getRecipients(): Recipient[] {
  return recipients;
}

export function getTransactions(userId: string): Transaction[] {
  return (transactions.get(userId) || []).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createTransaction(data: {
  userId: string;
  type: 'send' | 'receive';
  amountCents: number;
  counterpartyLabel: string;
  txHash?: string;
}): Transaction | { error: string } {
  const user = getUserById(data.userId);
  if (!user) return { error: 'User not found' };

  if (data.amountCents <= 0) return { error: 'Amount must be positive' };

  if (data.type === 'send' && data.amountCents > user.balanceCents) {
    return { error: 'Insufficient balance' };
  }

  if (data.type === 'send') {
    user.balanceCents -= data.amountCents;
  } else {
    user.balanceCents += data.amountCents;
  }

  const txn: Transaction = {
    id: generateId(),
    userId: data.userId,
    type: data.type,
    amountCents: data.amountCents,
    counterpartyLabel: data.counterpartyLabel,
    createdAt: new Date().toISOString(),
    txHash: data.txHash,
  };

  const userTxns = transactions.get(data.userId) || [];
  userTxns.push(txn);
  transactions.set(data.userId, userTxns);

  return txn;
}
