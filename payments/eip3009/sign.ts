/**
 * Client-side EIP-3009 signing helpers for Mika payments
 */

import { randomBytes } from 'crypto';
import type { Address, Hex, TransferWithAuthorization, SignedAuthorization } from './types';
import { USDC_DOMAIN, TRANSFER_WITH_AUTHORIZATION_TYPES, MIKA_CREATOR_WALLET } from './types';

/**
 * Convert USD amount to USDC atomic units (6 decimals)
 */
export function toUsdcUnits(amountUsd: number): bigint {
  return BigInt(Math.round(amountUsd * 1_000_000));
}

/**
 * Generate a fresh random bytes32 nonce
 */
export function generateNonce(): Hex {
  return `0x${randomBytes(32).toString('hex')}` as Hex;
}

/**
 * Build a TransferWithAuthorization message
 */
export function buildAuthorization(params: {
  from: Address;
  amountUsd: number;
  to?: Address;
  validitySeconds?: number;
}): TransferWithAuthorization {
  const {
    from,
    amountUsd,
    to = MIKA_CREATOR_WALLET,
    validitySeconds = 3600, // 1 hour default
  } = params;

  const now = Math.floor(Date.now() / 1000);

  return {
    from,
    to,
    value: toUsdcUnits(amountUsd),
    validAfter: 0n,
    validBefore: BigInt(now + validitySeconds),
    nonce: generateNonce(),
  };
}

/**
 * Sign a TransferWithAuthorization using a viem-compatible wallet client.
 */
export async function signAuthorization(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any,
  params: {
    from: Address;
    amountUsd: number;
    to?: Address;
    validitySeconds?: number;
  }
): Promise<SignedAuthorization> {
  const authorization = buildAuthorization(params);

  const signature = await walletClient.signTypedData({
    domain: USDC_DOMAIN,
    types: TRANSFER_WITH_AUTHORIZATION_TYPES,
    primaryType: 'TransferWithAuthorization',
    message: authorization,
  });

  return {
    authorization,
    signature: signature as Hex,
  };
}

/**
 * Encode signed authorization into a base64 payload suitable for X-Payment header
 */
export function encodePaymentHeader(signed: SignedAuthorization): string {
  const payload = {
    x402Version: 1,
    scheme: 'exact',
    network: 'base',
    payload: {
      signature: signed.signature,
      authorization: {
        from: signed.authorization.from,
        to: signed.authorization.to,
        value: signed.authorization.value.toString(),
        validAfter: signed.authorization.validAfter.toString(),
        validBefore: signed.authorization.validBefore.toString(),
        nonce: signed.authorization.nonce,
      },
    },
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
