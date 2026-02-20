import { CryptoTransaction } from './types';
import { generateId } from './utils';

interface CryptoUserData {
  balanceEth: string;
  transactions: CryptoTransaction[];
}

const cryptoUsers = new Map<string, CryptoUserData>();

function fakeTxHash(): string {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += hex[Math.floor(Math.random() * 16)];
  }
  return hash;
}

function fakeAddress(): string {
  const hex = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += hex[Math.floor(Math.random() * 16)];
  }
  return addr;
}

function ensureUser(userId: string): CryptoUserData {
  let data = cryptoUsers.get(userId);
  if (data) return data;

  data = {
    balanceEth: '0.6000',
    transactions: [
      {
        id: generateId(),
        userId,
        type: 'receive',
        amountEth: '0.5000',
        address: fakeAddress(),
        txHash: fakeTxHash(),
        network: 'Base Sepolia',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: generateId(),
        userId,
        type: 'receive',
        amountEth: '0.1000',
        address: fakeAddress(),
        txHash: fakeTxHash(),
        network: 'Base Sepolia',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  };
  cryptoUsers.set(userId, data);
  return data;
}

export function getCryptoData(userId: string): CryptoUserData {
  const data = ensureUser(userId);
  return {
    balanceEth: data.balanceEth,
    transactions: data.transactions
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  };
}

export function createCryptoTransaction(data: {
  userId: string;
  type: 'send' | 'receive';
  amountEth: string;
  address: string;
  txHash?: string;
}): CryptoTransaction | { error: string } {
  const userData = ensureUser(data.userId);

  const amount = parseFloat(data.amountEth);
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be positive' };

  const balance = parseFloat(userData.balanceEth);
  if (data.type === 'send' && amount > balance) {
    return { error: 'Insufficient ETH balance' };
  }

  const newBalance = data.type === 'send' ? balance - amount : balance + amount;
  userData.balanceEth = newBalance.toFixed(4);

  const txn: CryptoTransaction = {
    id: generateId(),
    userId: data.userId,
    type: data.type,
    amountEth: amount.toFixed(4),
    address: data.address,
    txHash: data.txHash || fakeTxHash(),
    network: 'Base Sepolia',
    createdAt: new Date().toISOString(),
  };

  userData.transactions.push(txn);
  return txn;
}
