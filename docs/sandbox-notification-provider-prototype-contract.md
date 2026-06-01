# Sandbox Notification Provider Prototype Contract

EPOCH can now prove a first notification provider path without integrating a
live email, LINE, SMS, NEXUS, or webhook delivery provider. The slice prepares
local provider-neutral message payload previews from customer-safe update
records and links them to notification provider handoff/template consent
readiness, but it remains an internal sandbox proof.

This contract does not send email, LINE messages, SMS, NEXUS messages, webhook
payloads, or app notifications. It does not configure OAuth, store secrets,
store credentials, create webhooks, write provider records, enable production
delivery, or publish customer-visible sends.

## Ledger Records

`notificationProviderPrototypes` stores the sandbox prototype state.

Required fields include:

- `providerCandidateId`
- `sourceHandoffId`
- `adapterFamily: "notification"`
- `targetProvider`
- `adapterMode`
- `prototypeStatus`
- `sandboxOnly: true`
- `localOnly: true`
- `liveSendEnabled: false`
- `liveEmailSend: false`
- `liveLineSend: false`
- `liveSmsSend: false`
- `liveNexusSend: false`
- `externalProviderWrite: false`
- `productionEnabled: false`
- `secretsPresent: false`
- `credentialsStored: false`
- `storesCredentials: false`
- `oauthConfigured: false`
- `webhookEnabled: false`
- `customerVisible: false`
- `notificationOutboxSchema: "epoch.notification-outbox"`
- `payloadMode`
- `payloadSource: "epoch.notification-outbox"`
- `payloadPreview`
- `receiptIds`

## Required Readiness Checks

Every prototype must include:

- `provider-handoff-required`
- `template-consent-required`
- `notification-outbox-schema-stable`
- `sandbox-only-before-go-live`
- `operator-approval-required`
- `no-live-send`
- `no-secrets`
- `no-oauth-client`
- `no-webhooks`
- `no-provider-writes`
- `no-customer-visible-send`
- `no-nexus-send`

## Monitor Surface

EPOCH MONITOR must expose a `Sandbox Notification Provider` section at
`monitor-notification-prototype` with:

- prototype count
- payload-ready count
- sandbox-only and local-only count
- no-live-send count
- no-secrets count
- no-customer-visible-send count
- violation count
- local message payload preview state

The monitor control form must apply sandbox-only prototype actions through
`transitionNotificationProviderPrototypeRecords`.

## Actions

Supported prototype actions:

- `generate-preview`
- `approve-sandbox`
- `mark-reviewed`
- `defer`
- `block`

Every action must reassert the no-live-provider boundary and create:

- an internal `notification-provider-prototype` receipt
- an internal monitor health check targeting `monitor-notification-prototype`

No action may create customer-visible notification events.

## Future Go-Live Boundary

A later live adapter may be considered only after this prototype is reviewed and
a separate implementation issue explicitly approves provider credentials, OAuth,
test accounts, webhook posture, consent wording, customer-safe templates,
rollback behavior, and the exact delivery channels allowed.
