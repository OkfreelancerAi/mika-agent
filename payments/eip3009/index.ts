/**
 * Mika EIP-3009 Gasless Payments
 * --------------------------------
 * Drop-in helpers for x402 + EIP-3009 on Base USDC.
 *
 * Flow:
 * 1. Server returns 402 + challenge (challenge.ts)
 * 2. Client signs TransferWithAuthorization (sign.ts)
 * 3. Client retries with X-Payment header
 * 4. Server verifies signature locally (verify.ts)
 * 5. Server hands verified auth to Facilitator for on-chain settlement
 * 6. Only after Facilitator success → execute Mika/Spider job + record earnings
 */

export * from './types';
export * from './sign';
export * from './verify';
export * from './challenge';
