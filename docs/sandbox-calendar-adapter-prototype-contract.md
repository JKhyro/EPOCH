# Sandbox Calendar Adapter Prototype Contract

EPOCH can now prove a first calendar adapter path without integrating a live
calendar provider. The slice prepares local payload previews from
`epoch.calendar-export` records and links them to provider go/no-go readiness,
but it remains an internal sandbox proof.

This contract does not implement live Google Calendar, Microsoft Calendar, or
CalDAV synchronization. It does not configure OAuth, store secrets, create
webhooks, send invitations, write provider events, or publish customer-visible
calendar updates.

## Ledger Records

`calendarAdapterPrototypes` stores the sandbox prototype state.

Required fields include:

- `providerCandidateId`
- `sourceHandoffId`
- `adapterFamily: "calendar"`
- `targetProvider`
- `adapterMode`
- `prototypeStatus`
- `sandboxOnly: true`
- `localOnly: true`
- `liveApiCalls: false`
- `liveSyncEnabled: false`
- `sendsInvitations: false`
- `externalProviderWrite: false`
- `productionEnabled: false`
- `secretsPresent: false`
- `credentialsStored: false`
- `oauthConfigured: false`
- `webhookEnabled: false`
- `customerVisible: false`
- `payloadMode`
- `payloadSource: "epoch.calendar-export"`
- `payloadPreview`
- `receiptIds`

## Required Readiness Checks

Every prototype must include:

- `calendar-export-schema-stable`
- `provider-go-no-go-required`
- `sandbox-only-before-go-live`
- `operator-approval-required`
- `no-live-api`
- `no-secrets`
- `no-oauth-client`
- `no-webhooks`
- `no-provider-writes`
- `no-live-sync`
- `no-invitation-send`

## Monitor Surface

EPOCH MONITOR must expose a `Sandbox Calendar Adapter` section at
`monitor-calendar-adapter` with:

- prototype count
- payload-ready count
- sandbox-only and local-only count
- no-live-provider count
- no-secrets count
- no-invitation-send count
- violation count
- local payload preview state

The monitor control form must apply sandbox-only prototype actions through
`transitionCalendarAdapterPrototypeRecords`.

## Actions

Supported prototype actions:

- `generate-preview`
- `approve-sandbox`
- `mark-reviewed`
- `defer`
- `block`

Every action must reassert the no-live-provider boundary and create:

- an internal `calendar-adapter-prototype` receipt
- an internal monitor health check targeting `monitor-calendar-adapter`

No action may create customer-visible notification events.

## Future Go-Live Boundary

A later live adapter may be considered only after this prototype is reviewed and
a separate implementation issue explicitly approves provider credentials,
OAuth, test accounts, webhook posture, consent wording, invitation policy, and
rollback behavior.
