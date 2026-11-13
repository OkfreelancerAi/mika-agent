/**
 * EIP-3009 TransferWithAuthorization types for Mika MicroWorks
 * Target: USDC on Base (chainId 8453)
 */

export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export interface TransferWithAuthorization {
  from: Address;
  to: Address;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: Hex;
}

export interface SignedAuthorization {
  authorization: TransferWithAuthorization;
  signature: Hex;
}

export interface PaymentRequirements {
  scheme: 'exact';
  network: 'base';
  maxAmountRequired: string; // atomic units as string
  resource: string;
  description: string;
  mimeType: string;
  payTo: Address;
  maxTimeoutSeconds: number;
  asset: Address;
  extra: {
    name: string;
    version: string;
  };
}

export interface X402Challenge {
  x402Version: number;
  accepts: PaymentRequirements[];
}

export interface SettlementResult {
  success: boolean;
  transactionHash?: Hex;
  network: string;
  amount: string;
  recipient: Address;
  payer: Address;
  timestamp: number;
  error?: string;
}

/** USDC on Base mainnet */
export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

/** Mika creator wallet (Base) */
export const MIKA_CREATOR_WALLET = '0x1FcEd4cdd432F6EC61249D94B959e0E74FE5577a' as const;

export const USDC_DOMAIN = {
  name: 'USD Coin',
  version: '2',
  chainId: 8453,
  verifyingContract: USDC_BASE,
} as const;

export const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;
