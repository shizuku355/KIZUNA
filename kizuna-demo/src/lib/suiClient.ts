import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Sui client setup
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'), // or 'mainnet', 'devnet'
});

// Network configuration
export const NETWORK = 'testnet';

// Contract addresses (to be updated with actual deployed addresses)
export const PACKAGE_ID = '0x...'; // Replace with actual package ID after deployment
