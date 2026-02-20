export const config = {
  logoText: 'Privy Wallet',
  primaryColor: '#6851FF',
  customerName: 'Acme Corp',

  enableTestnetMode:
    process.env.NEXT_PUBLIC_ENABLE_TESTNET_MODE === 'true',

  testnet: {
    chainId: 84532,
    chainName: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    sendAmountEth: '0.001',
    usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
  },

  mockEthPriceUsd: 2500,

  defaultBalanceCents: 125000,
  simulatedDepositCents: 10000,

  demoForceMode: process.env.NEXT_PUBLIC_DEMO_FORCE_MODE as
    | 'abstracted'
    | 'crypto'
    | undefined,

  footerText: 'Powered by Privy',
};
