/**
 * Build x402 HTTP 402 payment challenges for Mika endpoints
 */

import type { Address, PaymentRequirements, X402Challenge } from './types';
import { USDC_BASE, MIKA_CREATOR_WALLET } from './types';
import { toUsdcUnits } from './sign';

/**
 * Create a standard x402 "exact" challenge for a Mika paid resource.
 */
export function buildExactChallenge(params: {
  amountUsd: number;
  resource: string;
  description: string;
  mimeType?: string;
  payTo?: Address;
  maxTimeoutSeconds?: number;
}): X402Challenge {
  const {
    amountUsd,
    resource,
    description,
    mimeType = 'application/json',
    payTo = MIKA_CREATOR_WALLET,
    maxTimeoutSeconds = 300,
  } = params;

  const requirements: PaymentRequirements = {
    scheme: 'exact',
    network: 'base',
    maxAmountRequired: toUsdcUnits(amountUsd).toString(),
    resource,
    description,
    mimeType,
    payTo,
    maxTimeoutSeconds,
    asset: USDC_BASE,
    extra: {
      name: 'USD Coin',
      version: '2',
    },
  };

  return {
    x402Version: 1,
    accepts: [requirements],
  };
}

/**
 * Helper: return a proper 402 response body + headers
 */
export function create402Response(challenge: X402Challenge) {
  const body = JSON.stringify(challenge);
  const paymentRequiredHeader = Buffer.from(body).toString('base64');

  return {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'PAYMENT-REQUIRED': paymentRequiredHeader,
    },
    body: challenge,
  };
}

/**
 * Pre-built challenges for Mika MicroWorks products
 */
export const MIKA_PRODUCT_CHALLENGES = {
  research: (resource = '/api/mika/research') =>
    buildExactChallenge({
      amountUsd: 0.25,
      resource,
      description: 'Mika Research — verified research job',
    }),

  leadFinder: (resource = '/api/mika/leads') =>
    buildExactChallenge({
      amountUsd: 0.5,
      resource,
      description: 'Mika LeadFinder — qualified lead discovery',
    }),

  agentTool: (resource = '/api/mika/tools') =>
    buildExactChallenge({
      amountUsd: 0.05,
      resource,
      description: 'Mika Agent Tools — single API call',
    }),

  spiderWatch: (resource = '/api/spider/monitor') =>
    buildExactChallenge({
      amountUsd: 0.1,
      resource,
      description: 'Spider Watch — monitoring event / plan',
    }),

  spiderIntel: (resource = '/api/spider/signals') =>
    buildExactChallenge({
      amountUsd: 1.0,
      resource,
      description: 'Spider Intelligence — curated signal report',
    }),
};
