# LIBRARY Ledger Sync And Recovery Contract

## Purpose

EPOCH now treats durable persistence as an explicit operating handoff instead of
only a browser-local export button. The current slice remains EPOCH-side only:
it prepares, tracks, verifies, and recovers ledger snapshots for future LIBRARY
storage without mutating the LIBRARY repository or requiring a live database
adapter.

## Operating Record

`librarySyncHandoffs` stores the current handoff state.

Required fields:

- `sourceSystem` and `targetSystem`, with one side set to `LIBRARY`.
- `syncMode`, such as `ledger-snapshot` or `recovery-import`.
- `status` and `handoffStatus`.
- `persistenceLedgerId`, `revision`, `checksum`, and `snapshotAt`.
- `recoveryState`, `durability`, `searchReady`, and `backupReady`.
- `visibility: internal` and `customerVisible: false`.
- `receiptIds` and `syncHistory`.

## Current Seeded Handoffs

- `library-sync-operating-ledger`: EPOCH-to-LIBRARY ledger snapshot handoff.
- `library-recovery-import`: LIBRARY-to-EPOCH recovery import handoff.

These records make export, search-readiness, backup-readiness, and recovery
intent visible in EPOCH MONITOR before a live durable store exists.

## Monitor Behavior

`summarizeLibrarySyncState` reports:

- total handoffs
- export handoffs
- recovery handoffs
- search-ready and backup-ready counts
- dirty snapshot posture
- internal-only violations
- LIBRARY targeting violations

`transitionLibrarySyncHandoffRecords` records operator actions for:

- `prepare-export`
- `mark-ready`
- `mark-synced`
- `recovery-ready`
- `retry`
- `block`

Every transition creates an internal monitor health check and a
`library-sync-handoff` receipt. It must not create customer-visible notification
events.

## Boundary

This slice proves the EPOCH handoff contract. It does not implement:

- live LIBRARY API calls
- live Postgres or vector storage
- external authentication
- multi-device sync
- analytics or retrieval ranking

Those belong to a later adapter slice after the EPOCH-side records, monitor
controls, and recovery semantics are stable.

## Verification

The verifier must prove:

- `librarySyncHandoffs` is present in the operating ledger.
- MONITOR exposes `LIBRARY Sync Handoffs`.
- export/import preserves LIBRARY sync handoff records.
- transition actions create internal receipts and health checks.
- transition actions do not create customer-visible notification events.
- malformed public/customer-visible LIBRARY sync handoffs are reported as
  violations.
