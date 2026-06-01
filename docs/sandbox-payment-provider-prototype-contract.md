# Sandbox Payment Provider Prototype Contract

## Purpose

EPOCH needs a payment-provider proof before any payment processor work, but the
first slice must stay sandbox-only and local-first. The prototype proves that
quotes, package prices, under-19 gates, and invoice/checkout readiness can be
rendered into provider-neutral payment payload previews without creating live
checkout sessions, sending invoices, capturing money, issuing refunds, storing
credentials, configuring OAuth, creating webhooks, writing provider records, or
showing customer-visible payment requests.

## Ledger Records

`paymentProviderPrototypes` records define the local payment adapter proof.

Required fields:

- `providerCandidateId` pointing at a payment `providerAdapterCandidates` row.
- `sourceHandoffId` pointing at a `paymentProviderHandoffs` row.
- `adapterFamily: "payment"`
- `paymentProcessorSchema: "epoch.quote-payment"`
- `payloadMode: "provider-neutral-payment-json-preview"`
- `payloadPreview` with local quote, opportunity, or package payment payloads.
- `blockers` naming the missing live-provider prerequisites.
- `readinessChecks` proving legal, tax, privacy, under-19, and no-live-payment
  posture.

Every prototype must remain:

- `sandboxOnly: true`
- `localOnly: true`
- `livePaymentEnabled: false`
- `liveCheckoutEnabled: false`
- `liveCaptureEnabled: false`
- `liveRefundEnabled: false`
- `invoiceSendEnabled: false`
- `checkoutSessionCreated: false`
- `paymentLinkCreated: false`
- `capturesPayment: false`
- `externalProviderWrite: false`
- `productionEnabled: false`
- `secretsPresent: false`
- `credentialsStored: false`
- `storesCredentials: false`
- `oauthConfigured: false`
- `webhookEnabled: false`
- `customerVisible: false`
- `legalReviewRequired: true`
- `taxReviewRequired: true`
- `privacyReviewRequired: true`
- `under19Guarded: true`

Every prototype must also preserve these readiness tokens:

- `provider-candidate-required`
- `payment-provider-handoff-required`
- `quote-payment-schema-stable`
- `legal-review-required`
- `tax-review-required`
- `privacy-boundary-required`
- `under19-eligibility-gate`
- `sandbox-only-before-go-live`
- `operator-approval-required`
- `no-live-payment`
- `no-secrets`
- `no-oauth-client`
- `no-webhooks`
- `no-provider-writes`
- `no-checkout-session`
- `no-payment-capture`
- `no-refunds`
- `no-invoice-send`
- `no-customer-visible-payment-request`

## Monitor Surface

The prototype appears on `monitor-payment-prototype` as `Sandbox Payment
Provider`. The monitor summary must count payload-ready prototypes, sandbox-only
records, local-only records, no-live-payment posture, no-secrets posture,
no-customer-visible-payment posture, no-capture posture, legal/tax/privacy
review posture, under-19 guard posture, and violations.

## Actions

`transitionPaymentProviderPrototypeRecords` supports:

- `generate-preview`
- `approve-sandbox`
- `mark-reviewed`
- `defer`
- `block`

Each action writes an internal `payment-provider-prototype` receipt and a
`payment-provider-sandbox-proof` monitor health check. None of the actions may
create notification events, customer-visible payment requests, live checkout
sessions, invoice sends, captures, refunds, OAuth clients, secrets, webhooks, or
provider writes.

## Future Go-Live Boundary

A later live payment slice must be explicitly approved and must replace this
contract with a narrower processor-specific contract covering legal/tax
handling, privacy notices, under-19 guardian consent, refunds, webhooks,
credential storage, idempotency, reconciliation, and customer-visible payment
copy.
