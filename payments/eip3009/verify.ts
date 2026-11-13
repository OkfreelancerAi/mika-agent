/**
 * Server-side EIP-3009 verification for Mika payment gate
 * Does NOT settle on-chain — that is the Facilitator's job.
 */

import { recoverTypedDataAddress } from 'viem';
import type { Address, Hex, TransferWithAuthorization, SignedAuthorization } from './types';
import {
  USDC_DOMAIN,
  TRANSFER_WITH_AUTHORIZATION_TYPES,
  MIKA_CREATOR_WALLET,
} from './types';

export interface VerifyOptions {
  expectedAmount: bigint;
  expectedRecipient?: Address;
  usedNonces?: Set<string>;
}

export interface VerifyResult {
  valid: boolean;
  payer?: Address;
  error?: string;
}

/**
 * Verify a signed TransferWithAuthorization before sending to Facilitator.
 */
export async function verifyAuthorization(
  signed: SignedAuthorization,
  options: VerifyOptions
): Promise<VerifyResult> {
  const { authorization, signature } = signed;
  const expectedRecipient = (options.expectedRecipient ?? MIKA_CREATOR_WALLET).toLowerCase();

  if (authorization.to.toLowerCase() !== expectedRecipient) {
    return { valid: false, error: 'Wrong recipient' };
  }

  if (authorization.value !== options.expectedAmount) {
    return { valid: false, error: 'Wrong amount' };
  }

  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now < authorization.validAfter) {
    return { valid: false, error: 'Authorization not yet valid' };
  }
  if (now > authorization.validBefore) {
    return { valid: false, error: 'Authorization expired' };
  }

  if (options.usedNonces?.has(authorization.nonce.toLowerCase())) {
    return { valid: false, error: 'Nonce already used (replay)' };
  }

  try {
    const signer = await recoverTypedDataAddress({
      domain: USDC_DOMAIN,
      types: TRANSFER_WITH_AUTHORIZATION_TYPES,
      primaryType: 'TransferWithAuthorization',
      message: {
        from: authorization.from,
        to: authorization.to,
        value: authorization.value,
        validAfter: authorization.validAfter,
        validBefore: authorization.validBefore,
        nonce: authorization.nonce,
      },
      signature,
    });

    if (signer.toLowerCase() !== authorization.from.toLowerCase()) {
      return { valid: false, error: 'Signature does not match from address' };
    }

    return {
      valid: true,
      payer: signer as Address,
    };
  } catch (err) {
    return {
      valid: false,
      error: `Signature recovery failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Parse a base64 X-Payment / PAYMENT-SIGNATURE header back into a SignedAuthorization
 */
export function parsePaymentHeader(headerValue: string): SignedAuthorization | null {
  try {
    const json = Buffer.from(headerValue, 'base64').toString('utf8');
    const parsed = JSON.parse(json);

    const auth = parsed?.payload?.authorization;
    const signature = parsed?.payload?.signature;

    if (!auth || !signature) return null;

    return {
      authorization: {
        from: auth.from,
        to: auth.to,
        value: BigInt(auth.value),
        validAfter: BigInt(auth.validAfter),
        validBefore: BigInt(auth.validBefore),
        nonce: auth.nonce,
      },
      signature,
    };
  } catch {
    return null;
  }
}
