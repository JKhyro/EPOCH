# EPOCH Local Integrated Product Shell

## Status

Local branch: `codex/local-epoch-avalonia-integrated-product-shell`

Integrated source head: `7d95603`

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

## Boundary Status

- EPOCH owns scheduling, calendar, request intake, native schedule command
  execution, and customer-safe timing status.
- WORKSHOP may request timing, but it does not own EPOCH calendar state.
- MONITOR remains development/control evidence only and does not run scheduling
  workflows.
- Provider calls remain disabled.
