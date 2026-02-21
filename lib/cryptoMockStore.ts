import { CryptoTransaction, CryptoAsset } from './types';
import { generateId } from './utils';

interface CryptoUserData {
  balanceEth: string;
  balanceUsdc: string;
  transactions: CryptoTransaction[];
}

// Persist in-memory data across Next.js HMR in development
const g = globalThis as typeof globalThis & {
  __cryptoUsers?: Map<string, CryptoUserData>;
};

const cryptoUsers = g.__cryptoUsers ?? new Map<string, CryptoUserData>();

if (process.env.NODE_ENV !== 'production') {
  g.__cryptoUsers = cryptoUsers;
}

function fakeTxHash(): string {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += hex[Math.floor(Math.random() * 16)];
  }
  return hash;
}

function ensureUser(userId: string): CryptoUserData {
  let data = cryptoUsers.get(userId);
  if (data) return data;

  data = {
    balanceEth: '0.6000',
    balanceUsdc: '250.00',
    transactions: [
      {
        id: `${userId}-crypto-seed-1`,
        userId,
        type: 'receive',
        asset: 'ETH',
        amount: '0.5000',
        address: '0xabc1230000000000000000000000000000000001',
        txHash: '0xdead000000000000000000000000000000000000000000000000000000000001',
        network: 'Base Sepolia',
        createdAt: '2025-06-10T10:00:00Z',
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
        createdAt: '2025-06-11T10:00:00Z',
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
        createdAt: '2025-06-12T10:00:00Z',
      },
    ],
  };
  cryptoUsers.set(userId, data);
  return data;
}

export function getCryptoData(userId: string): {
  balanceEth: string;
  balanceUsdc: string;
  transactions: CryptoTransaction[];
} {
  const data = ensureUser(userId);
  return {
    balanceEth: data.balanceEth,
    balanceUsdc: data.balanceUsdc,
    transactions: data.transactions
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  };
}

export function createCryptoTransaction(data: {
  userId: string;
  type: 'send' | 'receive';
  asset: CryptoAsset;
  amount: string;
  address: string;
  txHash?: string;
}): CryptoTransaction | { error: string } {
  const userData = ensureUser(data.userId);

  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be positive' };

  const balanceKey = data.asset === 'USDC' ? 'balanceUsdc' : 'balanceEth';
  const balance = parseFloat(userData[balanceKey]);

  if (data.type === 'send' && amount > balance) {
    return { error: `Insufficient ${data.asset} balance` };
  }

  const newBalance = data.type === 'send' ? balance - amount : balance + amount;
  const decimals = data.asset === 'USDC' ? 2 : 4;
  userData[balanceKey] = newBalance.toFixed(decimals);

  const txn: CryptoTransaction = {
    id: generateId(),
    userId: data.userId,
    type: data.type,
    asset: data.asset,
    amount: amount.toFixed(decimals),
    address: data.address,
    txHash: data.txHash || fakeTxHash(),
    network: 'Base Sepolia',
    createdAt: new Date().toISOString(),
  };

  userData.transactions.push(txn);
  return txn;
}
