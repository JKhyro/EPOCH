# EPOCH Local Integrated Product Shell

## Status

Local branch: `codex/local-epoch-avalonia-integrated-product-shell`

Integrated source head: `1b323d1`

This branch freezes the current EPOCH App/Webportal/native shell stack before
deeper scheduling modules are added. It is local Git only; no GitHub writeback,
pull request, issue, live provider, payment, notification, or public MONITOR
exposure is part of this integration checkpoint.

## Integrated App State

- Native C app bridge snapshot and scheduling command preview.
- Native scheduling execution receipt for `confirm-local-booking`.
- App-owned `schedule-execution-history.json` ledger for direct native
  execution receipts.
- App-owned `schedule-request-inbox.json` ledger for customer-safe Webportal
  schedule request intent.
- App-owned `request-to-schedule-command.json` ledger linking Webportal request
  inbox entries to native execution history.
- Avalonia Schedule Queue rendering for Webportal Request Inbox and Request To
  Native Command status.

## Next Local Product Slice

- `codex/local-epoch-avalonia-schedule-operations-board` builds the EPOCH
  Avalonia Schedule Operations Board over the existing App-owned request inbox,
  request-command receipt, and native execution history ledgers.
- The board is still local-only, provider-off, MONITOR-off, and EPOCH-owned.
  It is not a WORKSHOP revenue surface and not a MONITOR development page.
- `codex/local-epoch-avalonia-status-feedback` adds the App-owned
  `customer-schedule-status.json` export ledger so linked schedule requests and
  native execution history can become customer-safe Webportal status records
  without exposing MONITOR or live provider behavior.
- `codex/local-epoch-webportal-status-reader` adds the Webportal-side reader
  for that App export. It loads only customer-safe, Webportal-ready,
  provider-off status records and keeps native execution/operator details out
  of the customer portal.
- `codex/local-epoch-avalonia-schedule-lifecycle-actions` adds App/Webportal
  schedule lifecycle actions so reschedule/cancel/confirm/change-window
  requests are queued as customer-safe product state, linked to local native
  scheduling command evidence, and exported back through
  `schedule-lifecycle-status.json` without provider calls or MONITOR workflow
  exposure.
- `codex/local-epoch-avalonia-revised-calendar-constraints` adds the Native
  C/Avalonia/Webportal revised-calendar constraint projection so the known
  13-month structure, intercalary-day policy, measured spring anchor method,
  and conversion gate reason are executable product state while authoritative
  conversion stays blocked.
- `codex/local-epoch-revised-timing-export` adds the App-owned
  `epoch-revised-calendar-timing.json` export so WORKSHOP can consume
  customer-safe revised timing context while EPOCH retains calendar authority,
  provider go-live stays disabled, and MONITOR remains development evidence
  only.
- `codex/local-epoch-revised-calendar-reminder-deadline-execution` adds
  App-owned revised-calendar reminder/deadline execution ledgers and a
  customer-safe Webportal receipt reader. Notification sends, provider calls,
  WORKSHOP calendar ownership, and MONITOR workflow exposure stay disabled.
- `codex/local-epoch-recurring-revised-availability-refinements` adds
  App-owned recurring revised-calendar availability exception ledgers and a
  customer-safe Webportal receipt reader. The slice links revised timing
  context to EPOCH-owned availability and recurrence exception status while
  revised conversion, live provider calls, notification sends, WORKSHOP calendar
  ownership, and MONITOR workflow exposure remain blocked.

## Boundary Status

- EPOCH owns scheduling, calendar, request intake, native schedule command
  execution, and customer-safe timing status.
- WORKSHOP may request timing, but it does not own EPOCH calendar state.
- MONITOR remains development/control evidence only and does not run scheduling
  workflows.
- Provider calls remain disabled.
