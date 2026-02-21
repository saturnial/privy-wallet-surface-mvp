import { User, Recipient, Transaction } from './types';
import { generateId, deterministicId } from './utils';
import { config } from './config';

// Persist in-memory data across Next.js HMR in development
const g = globalThis as typeof globalThis & {
  __mockUsers?: Map<string, User>;
  __mockTransactions?: Map<string, Transaction[]>;
};

const users = g.__mockUsers ?? new Map<string, User>();
const transactions = g.__mockTransactions ?? new Map<string, Transaction[]>();

if (process.env.NODE_ENV !== 'production') {
  g.__mockUsers = users;
  g.__mockTransactions = transactions;
}

const recipients: Recipient[] = [
  { id: 'r1', name: 'Acme Corp', nickname: 'acme', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'r2', name: 'Jane Smith', nickname: 'jane', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'r3', name: 'Global Payments Inc', nickname: 'gpi', createdAt: '2025-03-10T10:00:00Z' },
];

function seedTransactions(userId: string): Transaction[] {
  const txns: Transaction[] = [
    {
      id: `${userId}-seed-1`,
      userId,
      type: 'receive',
      amountCents: 100000,
      counterpartyLabel: 'Initial Deposit',
      createdAt: '2025-06-10T10:00:00Z',
    },
    {
      id: `${userId}-seed-2`,
      userId,
      type: 'receive',
      amountCents: 25000,
      counterpartyLabel: 'Acme Corp',
      createdAt: '2025-06-12T10:00:00Z',
    },
  ];
  transactions.set(userId, txns);
  return txns;
}

function ensureUser(email: string): User {
  const existing = users.get(email);
  if (existing) return existing;

  const user: User = {
    id: deterministicId('user:' + email),
    email,
    walletAddress: '',
    displayName: email.split('@')[0],
    balanceCents: config.defaultBalanceCents,
    createdAt: '2025-06-01T00:00:00Z',
  };
  users.set(email, user);
  seedTransactions(user.id);
  return user;
}

export function getUser(email: string): User | undefined {
  return users.get(email) || ensureUser(email);
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
  if (existing) {
    // Update walletAddress if it was missing (cold-start ensureUser creates with empty address)
    if (!existing.walletAddress && data.walletAddress) {
      existing.walletAddress = data.walletAddress;
    }
    return existing;
  }

  const user: User = {
    id: deterministicId('user:' + data.email),
    email: data.email,
    walletAddress: data.walletAddress,
    displayName: data.displayName || data.email.split('@')[0],
    balanceCents: config.defaultBalanceCents,
    createdAt: '2025-06-01T00:00:00Z',
  };
  users.set(data.email, user);
  seedTransactions(user.id);

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
  if (!transactions.has(userId)) {
    seedTransactions(userId);
  }
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
