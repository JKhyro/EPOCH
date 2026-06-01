# Calendar Provider Handoff And Invitation-Readiness Contract

## Purpose

EPOCH owns schedule-bound operating records before any external calendar
provider is allowed to write, sync, or send invitations. This slice creates the
EPOCH-side contract for provider-neutral calendar handoffs and customer-safe
invitation readiness while keeping Google Calendar, Microsoft 365 Calendar, and
other live adapters deferred.

## Operating Record

`calendarProviderHandoffs` stores provider readiness and invitation preview
state.

Required fields:

- `targetProvider` and `providerKind`.
- `syncMode`, such as `provider-export-readiness` or
  `invitation-readiness`.
- `status`, `handoffStatus`, `invitationPolicy`, and `customerSafeStatus`.
- `calendarExportSchema`, `eventSourceKinds`, and `readinessChecks`.
- `visibility: internal` and `customerVisible: false`.
- `liveSyncEnabled: false`, `sendsInvitations: false`, and
  `externalProviderWrite: false`.
- `receiptIds` and `handoffHistory`.

## Seeded Handoffs

- `calendar-provider-google-readiness`.
- `calendar-provider-microsoft-readiness`.
- `calendar-provider-invitation-readiness`.

These records let EPOCH show provider readiness, customer-safe invitation
preview readiness, and no-live-send proof in MONITOR before any provider
credentials, API calls, or invitation sending exist.

## Monitor Behavior

`summarizeCalendarProviderState` reports:

- total provider handoffs
- provider-export readiness
- invitation-readiness records
- customer-safe invitation preview state
- no-live-send posture
- exportable calendar entry counts
- provider and visibility violations

`transitionCalendarProviderHandoffRecords` records operator actions for:

- `verify`
- `prepare`
- `mark-ready`
- `invite-ready`
- `block`

Every transition creates an internal monitor health check and a
`calendar-provider-handoff` receipt. It must not create customer-visible
notification events, live provider writes, or external invitations.

## Boundary

This slice does not implement:

- Google Calendar API calls
- Microsoft Graph calls
- OAuth or calendar credentials
- live invitation sending
- live two-way sync
- conflict resolution against external calendars

Those belong to a later provider-adapter slice after the provider-neutral
payload, invitation-readiness, monitor, and receipt contracts are stable.

## Verification

The verifier must prove:

- `calendarProviderHandoffs` is present in the operating ledger.
- MONITOR exposes `Calendar Provider Handoffs`.
- export/import preserves calendar provider handoff records.
- transition actions create internal receipts and health checks.
- transition actions do not create customer-visible notification events.
- malformed live-sync or customer-visible provider records are reported as
  violations.
