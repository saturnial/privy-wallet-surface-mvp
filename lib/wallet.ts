import { ethers } from 'ethers';
import { config } from './config';

export async function sendTestnetTransaction(
  walletProvider: ethers.Eip1193Provider,
  toAddress: string
): Promise<string> {
  const provider = new ethers.BrowserProvider(walletProvider);
  const signer = await provider.getSigner();

  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(config.testnet.sendAmountEth),
  });

  await tx.wait();
  return tx.hash;
}

export async function sendTestnetTransactionWithAmount(
  walletProvider: ethers.Eip1193Provider,
  toAddress: string,
  amountEth: string,
): Promise<string> {
  const provider = new ethers.BrowserProvider(walletProvider);
  const signer = await provider.getSigner();

  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(amountEth),
  });

  await tx.wait();
  return tx.hash;
}

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
];

export async function sendUsdcTransaction(
  walletProvider: ethers.Eip1193Provider,
  toAddress: string,
  amountUsdc: string,
): Promise<string> {
  if (!config.testnet.usdcAddress) {
    throw new Error('USDC contract address not configured');
  }

  const provider = new ethers.BrowserProvider(walletProvider);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(config.testnet.usdcAddress, ERC20_ABI, signer);

  // USDC uses 6 decimals
  const amount = ethers.parseUnits(amountUsdc, 6);
  const tx = await contract.transfer(toAddress, amount);
  await tx.wait();
  return tx.hash;
}

export async function getUsdcBalance(
  walletProvider: ethers.Eip1193Provider,
  ownerAddress: string,
): Promise<string> {
  if (!config.testnet.usdcAddress) {
    throw new Error('USDC contract address not configured');
  }

  const provider = new ethers.BrowserProvider(walletProvider);
  const contract = new ethers.Contract(config.testnet.usdcAddress, ERC20_ABI, provider);
  const balance: bigint = await contract.balanceOf(ownerAddress);
  return ethers.formatUnits(balance, 6);
}
