import { eq, desc, sql } from 'drizzle-orm';
import { getDb } from './index';
import { users, transactions, cryptoTransactions, recipients } from './schema';
import { deterministicId, generateId } from '../utils';
import { config } from '../config';
import type { User, Transaction, Recipient, CryptoTransaction, CryptoAsset } from '../types';

// ── Helpers ──

function rowToUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    walletAddress: row.walletAddress,
    displayName: row.displayName,
    balanceCents: row.balanceCents,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToTransaction(row: typeof transactions.$inferSelect): Transaction {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as 'send' | 'receive',
    amountCents: row.amountCents,
    counterpartyLabel: row.counterpartyLabel,
    createdAt: row.createdAt.toISOString(),
    txHash: row.txHash ?? undefined,
  };
}

function rowToCryptoTransaction(row: typeof cryptoTransactions.$inferSelect): CryptoTransaction {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as 'send' | 'receive',
    asset: row.asset as CryptoAsset,
    amount: row.amount,
    address: row.address,
    txHash: row.txHash,
    network: row.network,
    createdAt: row.createdAt.toISOString(),
  };
}

// ── Users ──

export async function getUser(email: string): Promise<User | undefined> {
  const rows = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function createUser(data: {
  email: string;
  walletAddress: string;
  displayName?: string;
}): Promise<User> {
  const existing = await getUser(data.email);
  if (existing) {
    if (!existing.walletAddress && data.walletAddress) {
      await getDb()
        .update(users)
        .set({ walletAddress: data.walletAddress })
        .where(eq(users.email, data.email));
      existing.walletAddress = data.walletAddress;
    }
    return existing;
  }

  const userId = deterministicId('user:' + data.email);

  const [row] = await getDb()
    .insert(users)
    .values({
      id: userId,
      email: data.email,
      walletAddress: data.walletAddress || '',
      displayName: data.displayName || data.email.split('@')[0],
      balanceCents: config.defaultBalanceCents,
      createdAt: new Date('2025-06-01T00:00:00Z'),
    })
    .returning();

  // Seed USD transactions
  await getDb().insert(transactions).values([
    {
      id: `${userId}-seed-1`,
      userId,
      type: 'receive',
      amountCents: 100000,
      counterpartyLabel: 'Initial Deposit',
      createdAt: new Date('2025-06-10T10:00:00Z'),
    },
    {
      id: `${userId}-seed-2`,
      userId,
      type: 'receive',
      amountCents: 25000,
      counterpartyLabel: 'Acme Corp',
      createdAt: new Date('2025-06-12T10:00:00Z'),
    },
  ]);

  // Seed crypto transactions
  await getDb().insert(cryptoTransactions).values([
    {
      id: `${userId}-crypto-seed-1`,
      userId,
      type: 'receive',
      asset: 'ETH',
      amount: '0.5000',
      address: '0xabc1230000000000000000000000000000000001',
      txHash: '0xdead000000000000000000000000000000000000000000000000000000000001',
      network: 'Base Sepolia',
      createdAt: new Date('2025-06-10T10:00:00Z'),
    },
    {
      id: `${userId}-crypto-seed-2`,
      userId,
      type: 'receive',
      asset: 'ETH',
      amount: '0.1000',
      address: '0xabc1230000000000000000000000000000000002',
      txHash: '0xdead000000000000000000000000000000000000000000000000000000000002',
      network: 'Base Sepolia',
      createdAt: new Date('2025-06-11T10:00:00Z'),
    },
    {
      id: `${userId}-crypto-seed-3`,
      userId,
      type: 'receive',
      asset: 'USDC',
      amount: '250.00',
      address: '0xabc1230000000000000000000000000000000003',
      txHash: '0xdead000000000000000000000000000000000000000000000000000000000003',
      network: 'Base Sepolia',
      createdAt: new Date('2025-06-12T10:00:00Z'),
    },
  ]);

  return rowToUser(row);
}

export async function resetUser(email: string): Promise<User> {
  const existing = await getUser(email);
  if (existing) {
    const db = getDb();
    await db.delete(cryptoTransactions).where(eq(cryptoTransactions.userId, existing.id));
    await db.delete(transactions).where(eq(transactions.userId, existing.id));
    await db.delete(users).where(eq(users.id, existing.id));
  }
  return createUser({ email, walletAddress: '', displayName: email.split('@')[0] });
}

export async function updateUser(
  email: string,
  updates: Partial<Pick<User, 'displayName' | 'walletAddress'>>
): Promise<User | undefined> {
  const setValues: Record<string, string> = {};
  if (updates.displayName !== undefined) setValues.displayName = updates.displayName;
  if (updates.walletAddress !== undefined) setValues.walletAddress = updates.walletAddress;

  const rows = await getDb()
    .update(users)
    .set(setValues)
    .where(eq(users.email, email))
    .returning();

  return rows[0] ? rowToUser(rows[0]) : undefined;
}

// ── Recipients ──

export async function getRecipients(): Promise<Recipient[]> {
  const rows = await getDb().select().from(recipients);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nickname: r.nickname,
    createdAt: r.createdAt.toISOString(),
  }));
}

// ── Transactions ──

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const rows = await getDb()
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt));
  return rows.map(rowToTransaction);
}

export async function createTransaction(data: {
  userId: string;
  type: 'send' | 'receive';
  amountCents: number;
  counterpartyLabel: string;
  txHash?: string;
}): Promise<Transaction | { error: string }> {
  const user = await getUserById(data.userId);
  if (!user) return { error: 'User not found' };

  if (data.amountCents <= 0) return { error: 'Amount must be positive' };

  if (data.type === 'send' && data.amountCents > user.balanceCents) {
    return { error: 'Insufficient balance' };
  }

  const delta = data.type === 'send' ? -data.amountCents : data.amountCents;

  // Atomic: update balance + insert transaction
  await getDb()
    .update(users)
    .set({ balanceCents: sql`${users.balanceCents} + ${delta}` })
    .where(eq(users.id, data.userId));

  const [row] = await getDb()
    .insert(transactions)
    .values({
      id: generateId(),
      userId: data.userId,
      type: data.type,
      amountCents: data.amountCents,
      counterpartyLabel: data.counterpartyLabel,
      txHash: data.txHash ?? null,
    })
    .returning();

  return rowToTransaction(row);
}

// ── Crypto ──

function fakeTxHash(): string {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += hex[Math.floor(Math.random() * 16)];
  }
  return hash;
}

export async function getCryptoData(userId: string): Promise<{
  balanceEth: string;
  balanceUsdc: string;
  transactions: CryptoTransaction[];
}> {
  // Compute balances via SUM aggregation
  const balanceRows = await getDb()
    .select({
      asset: cryptoTransactions.asset,
      total: sql<string>`COALESCE(SUM(
        CASE WHEN ${cryptoTransactions.type} = 'receive' THEN CAST(${cryptoTransactions.amount} AS NUMERIC)
             WHEN ${cryptoTransactions.type} = 'send' THEN -CAST(${cryptoTransactions.amount} AS NUMERIC)
             ELSE 0 END
      ), 0)`,
    })
    .from(cryptoTransactions)
    .where(eq(cryptoTransactions.userId, userId))
    .groupBy(cryptoTransactions.asset);

  let balanceEth = '0.0000';
  let balanceUsdc = '0.00';
  for (const row of balanceRows) {
    const val = parseFloat(row.total);
    if (row.asset === 'ETH') balanceEth = val.toFixed(4);
    if (row.asset === 'USDC') balanceUsdc = val.toFixed(2);
  }

  const txnRows = await getDb()
    .select()
    .from(cryptoTransactions)
    .where(eq(cryptoTransactions.userId, userId))
    .orderBy(desc(cryptoTransactions.createdAt));

  return {
    balanceEth,
    balanceUsdc,
    transactions: txnRows.map(rowToCryptoTransaction),
  };
}

export async function createCryptoTransaction(data: {
  userId: string;
  type: 'send' | 'receive';
  asset: CryptoAsset;
  amount: string;
  address: string;
  txHash?: string;
}): Promise<CryptoTransaction | { error: string }> {
  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be positive' };

  if (data.type === 'send') {
    // Check balance via SUM
    const [balanceRow] = await getDb()
      .select({
        total: sql<string>`COALESCE(SUM(
          CASE WHEN ${cryptoTransactions.type} = 'receive' THEN CAST(${cryptoTransactions.amount} AS NUMERIC)
               WHEN ${cryptoTransactions.type} = 'send' THEN -CAST(${cryptoTransactions.amount} AS NUMERIC)
               ELSE 0 END
        ), 0)`,
      })
      .from(cryptoTransactions)
      .where(
        sql`${cryptoTransactions.userId} = ${data.userId} AND ${cryptoTransactions.asset} = ${data.asset}`
      );

    const balance = parseFloat(balanceRow?.total ?? '0');
    if (amount > balance) {
      return { error: `Insufficient ${data.asset} balance` };
    }
  }

  const decimals = data.asset === 'USDC' ? 2 : 4;

  const [row] = await getDb()
    .insert(cryptoTransactions)
    .values({
      id: generateId(),
      userId: data.userId,
      type: data.type,
      asset: data.asset,
      amount: amount.toFixed(decimals),
      address: data.address,
      txHash: data.txHash || fakeTxHash(),
      network: 'Base Sepolia',
    })
    .returning();

  return rowToCryptoTransaction(row);
}
