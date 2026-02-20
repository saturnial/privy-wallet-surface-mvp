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
