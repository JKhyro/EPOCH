# Notification Provider Handoff And Template Consent Contract

## Purpose

EPOCH now records notification provider readiness before any live email, LINE,
SMS, NEXUS, or webhook delivery integration exists. The goal is to make customer
updates delivery-ready without adding credentials, live sends, or provider
side effects.

## Records

`notificationProviderHandoffs` are internal EPOCH operating records with:

- provider target and provider kind, such as email, LINE/SMS, or
  provider-neutral template/consent readiness.
- `templatePolicy`, `consentPolicy`, `customerSafeStatus`, and
  `readinessChecks`.
- `notificationOutboxSchema: epoch.notification-outbox`.
- `visibility: internal` and `customerVisible: false`.
- `liveSendEnabled: false`, `externalProviderWrite: false`,
  `storesCredentials: false`, and `webhookEnabled: false`.
- receipt ids and handoff history.

## Current Seeded Handoffs

- `notification-provider-email-readiness`: provider-neutral email template and
  consent readiness.
- `notification-provider-line-sms-readiness`: LINE/SMS opt-in and short-template
  readiness.
- `notification-template-consent-readiness`: cross-channel customer-safe
  template and consent policy readiness.

## Operator Actions

The MONITOR control can verify, prepare, mark ready, mark template-ready, mark
consent-ready, or block a provider handoff. Each action creates:

- an internal `notification-provider-handoff` receipt.
- a `monitorHealthChecks` record targeting `monitor-notification-provider`.
- no customer-visible notification event.
- no live provider send, credential storage, webhook enablement, or external
  provider write.

Code paths should create new readiness records through
`createNotificationProviderHandoffRecords` and apply operator state changes
through `transitionNotificationProviderHandoffRecords`. Both helpers must keep
provider handoffs internal-only until a later live-delivery adapter is approved.

## Out Of Scope

This phase does not send email, LINE, SMS, or app messages. It does not store
provider credentials, configure webhooks, retry through a real provider, or call
NEXUS delivery APIs. Live delivery can consume this contract later after consent,
templates, provider selection, and authentication are separately implemented.

## Verification

The repository verifier must prove:

- `notificationProviderHandoffs` are present in seed data and operating-ledger
  export/import.
- EPOCH MONITOR exposes `Notification Provider Handoffs`.
- transition actions create internal receipts and monitor checks only.
- malformed handoffs that enable live send, provider writes, credentials,
  webhooks, or customer-visible exposure are reported as risks.
- provider actions do not create customer-visible notification events.
- the contract remains no live provider send until a later adapter slice.
