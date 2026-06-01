# Payment Provider Handoff And Invoice Checkout Contract

## Purpose

EPOCH now records payment provider readiness before any live invoice, checkout,
processor, webhook, or payment-capture integration exists. The goal is to make
quotes commercially actionable while preserving local-first operator control and
avoiding accidental live payment behavior.

## Records

`paymentProviderHandoffs` are internal EPOCH operating records with:

- provider target and provider kind, such as invoice, checkout, or
  provider-neutral eligibility readiness.
- `invoicePolicy`, `checkoutPolicy`, `eligibilityPolicy`, and
  `readinessChecks`.
- `paymentProcessorSchema: epoch.quote-payment`.
- `visibility: internal` and `customerVisible: false`.
- `livePaymentEnabled: false`, `externalProviderWrite: false`,
  `storesCredentials: false`, `webhookEnabled: false`, and
  `capturesPayment: false`.
- receipt ids and handoff history.

## Current Seeded Handoffs

- `payment-provider-invoice-readiness`: provider-neutral customer-safe invoice
  copy readiness.
- `payment-provider-checkout-readiness`: checkout handoff readiness without a
  live checkout session or payment link.
- `payment-eligibility-guardian-readiness`: guardian consent, under-19, and
  operator approval readiness before payment request.

## Operator Actions

The MONITOR control can verify, prepare, mark ready, mark invoice-ready, mark
checkout-ready, mark eligibility-ready, or block a payment provider handoff.
Each action creates:

- an internal `payment-provider-handoff` receipt.
- a `monitorHealthChecks` record targeting `monitor-payment-provider`.
- no customer-visible payment event.
- no live checkout, payment capture, credential storage, webhook enablement, or
  external provider write.

Code paths should create new readiness records through
`createPaymentProviderHandoffRecords` and apply operator state changes through
`transitionPaymentProviderHandoffRecords`. Both helpers must keep provider
handoffs internal-only until a later live-payment adapter is approved.

## Under-19 And Eligibility Guard

Under-19 or compatibility-required work remains payment-blocked until guardian
consent, offer compatibility, and operator approval are explicit. Payment
provider readiness may record the gating rule, but it must not create a payment
request, invoice send, checkout session, or processor action for ineligible
records.

## Out Of Scope

This phase does not send invoices, create checkout sessions, store processor
credentials, configure webhooks, capture payments, process refunds, handle
settlement, or automate tax filings. Live delivery can consume this contract
later after payment provider selection, legal/tax review, authentication,
webhook verification, and consent rules are separately implemented.

## Verification

The repository verifier must prove:

- `paymentProviderHandoffs` are present in seed data and operating-ledger
  export/import.
- EPOCH MONITOR exposes `Payment Provider Handoffs`.
- transition actions create internal receipts and monitor checks only.
- malformed handoffs that enable live checkout, provider writes, credentials,
  webhooks, capture, or customer-visible exposure are reported as risks.
- provider actions do not create customer-visible payment events.
- the contract remains no live payment until a later adapter slice.
