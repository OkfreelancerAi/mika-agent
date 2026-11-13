# Mika EIP-3009 Gasless Payments

Production-oriented helpers for **x402 + EIP-3009** micropayments on **Base USDC**.

## What this implements

| Module | Purpose |
|--------|--------|
| `types.ts` | Shared types, USDC domain, creator wallet constant |
| `sign.ts` | Client-side authorization building + signing |
| `verify.ts` | Server-side signature, amount, recipient, expiry, nonce checks |
| `challenge.ts` | x402 HTTP 402 challenge builders for Mika products |
| `index.ts` | Public exports + middleware skeleton |

## Correct order of operations

1. **Challenge** → return HTTP 402 with exact price
2. **Sign** → client creates EIP-3009 `TransferWithAuthorization`
3. **Verify** → server checks signature locally (no funds moved yet)
4. **Settle** → Facilitator submits on-chain and returns tx hash
5. **Execute** → only then run Mika / Spider job
6. **Ledger** → record only Facilitator-confirmed settlements

## Locked creator wallet

```
0x1FcEd4cdd432F6EC61249D94B959e0E74FE5577a
```

## Still required before production revenue

- Real Facilitator integration (verify + settle)
- Durable nonce / settlement ledger (not in-memory only)
- Replay protection across instances
- End-to-end Base Sepolia test with explorer proof
- Agent execution gated behind successful settlement

## Install notes

These modules expect:

- `viem` (for `recoverTypedDataAddress` and wallet signing)
- Node.js `crypto` for nonces

They are written to be framework-agnostic (works with Hono, Express, Nitro, etc.).
