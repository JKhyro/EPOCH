# Quote And Payment-Readiness Contract

## Purpose

EPOCH can now record quote and estimate readiness before live payment processing
exists. The contract is deliberately local-first: it supports commercial
conversion, pricing review, under-19 consent gates, and operator receipts
without charging a card or connecting to a payment provider.

## Record Boundary

`quotes` are EPOCH operating-ledger records tied to customers, opportunities,
engagements, and offer packages. A quote may become customer-visible only after
the operator presents it. Internal notes and raw pricing logic remain internal.

## Lifecycle

- `draft`: quote exists internally.
- `presented`: customer-safe estimate status has been shown.
- `approved`: estimate is approved, but payment readiness is not assumed.
- `payment-ready`: payment can be requested through a future approved channel.
- `payment-blocked`: consent, scope, or approval is missing.
- `paid-recorded`: manual payment evidence placeholder has been recorded.
- `declined`: estimate was declined.

## Under-19 Rule

Under-19 or compatibility-required packages are payment-blocked until guardian
consent is explicitly recorded. This protects the adult-first business model
while still allowing compatibility assessments and higher-touch pricing to be
tracked.

## Out Of Scope

No live checkout, processor tokens, invoice sending, payment webhooks, refunds,
settlement, or tax filing automation are included in this phase.
