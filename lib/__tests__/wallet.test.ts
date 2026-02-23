import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ethers
const mockSendTransaction = vi.fn();
const mockWait = vi.fn();
const mockGetSigner = vi.fn();
const mockTransfer = vi.fn();
const mockBalanceOf = vi.fn();

vi.mock('ethers', () => {
  const parseEther = vi.fn((val: string) => BigInt(Math.round(parseFloat(val) * 1e18)));
  const parseUnits = vi.fn((val: string, decimals: number) =>
    BigInt(Math.round(parseFloat(val) * 10 ** decimals)),
  );
  const formatUnits = vi.fn((_val: bigint, _decimals: number) => '50.00');

  return {
    ethers: {
      BrowserProvider: vi.fn().mockImplementation(function () {
        return { getSigner: mockGetSigner };
      }),
      Contract: vi.fn().mockImplementation(function () {
        return { transfer: mockTransfer, balanceOf: mockBalanceOf };
      }),
      parseEther,
      parseUnits,
      formatUnits,
    },
  };
});

vi.mock('@/lib/config', () => ({
  config: {
    testnet: {
      sendAmountEth: '0.001',
      usdcAddress: '0xUSDC',
    },
  },
}));

import { ethers } from 'ethers';
import {
  sendTestnetTransaction,
  sendTestnetTransactionWithAmount,
  sendUsdcTransaction,
  getUsdcBalance,
} from '../wallet';

describe('wallet', () => {
  const fakeProvider = {} as ethers.Eip1193Provider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWait.mockResolvedValue(undefined);
    mockSendTransaction.mockResolvedValue({ hash: '0xabc123', wait: mockWait });
    mockGetSigner.mockResolvedValue({ sendTransaction: mockSendTransaction });
    mockTransfer.mockResolvedValue({ hash: '0xusdc456', wait: mockWait });
    mockBalanceOf.mockResolvedValue(BigInt(50_000_000));
  });

  describe('sendTestnetTransaction', () => {
    it('passes correct to and value', async () => {
      await sendTestnetTransaction(fakeProvider, '0xRecipient');
      expect(mockSendTransaction).toHaveBeenCalledWith({
        to: '0xRecipient',
        value: ethers.parseEther('0.001'),
      });
    });

    it('waits for tx and returns hash', async () => {
      const hash = await sendTestnetTransaction(fakeProvider, '0xRecipient');
      expect(mockWait).toHaveBeenCalled();
      expect(hash).toBe('0xabc123');
    });
  });

  describe('sendTestnetTransactionWithAmount', () => {
    it('uses custom amount', async () => {
      await sendTestnetTransactionWithAmount(fakeProvider, '0xRecipient', '0.05');
      expect(ethers.parseEther).toHaveBeenCalledWith('0.05');
      expect(mockSendTransaction).toHaveBeenCalledWith({
        to: '0xRecipient',
        value: ethers.parseEther('0.05'),
      });
    });
  });

  describe('sendUsdcTransaction', () => {
    it('creates Contract with ERC20 ABI and signer', async () => {
      await sendUsdcTransaction(fakeProvider, '0xRecipient', '10');
      expect(ethers.Contract).toHaveBeenCalledWith(
        '0xUSDC',
        expect.arrayContaining([
          expect.stringContaining('transfer'),
          expect.stringContaining('balanceOf'),
        ]),
        expect.objectContaining({ sendTransaction: mockSendTransaction }),
      );
    });

    it('parses amount with 6 decimals', async () => {
      await sendUsdcTransaction(fakeProvider, '0xRecipient', '10');
      expect(ethers.parseUnits).toHaveBeenCalledWith('10', 6);
    });

    it('throws when usdcAddress missing', async () => {
      const { config } = await import('@/lib/config');
      const original = config.testnet.usdcAddress;
      config.testnet.usdcAddress = '';
      await expect(sendUsdcTransaction(fakeProvider, '0xRecipient', '10')).rejects.toThrow(
        'USDC contract address not configured',
      );
      config.testnet.usdcAddress = original;
    });
  });

  describe('getUsdcBalance', () => {
    it('calls balanceOf and formatUnits with 6 decimals', async () => {
      const result = await getUsdcBalance(fakeProvider, '0xOwner');
      expect(mockBalanceOf).toHaveBeenCalledWith('0xOwner');
      expect(ethers.formatUnits).toHaveBeenCalledWith(BigInt(50_000_000), 6);
      expect(result).toBe('50.00');
    });

    it('throws when usdcAddress missing', async () => {
      const { config } = await import('@/lib/config');
      const original = config.testnet.usdcAddress;
      config.testnet.usdcAddress = '';
      await expect(getUsdcBalance(fakeProvider, '0xOwner')).rejects.toThrow(
        'USDC contract address not configured',
      );
      config.testnet.usdcAddress = original;
    });
  });
});
