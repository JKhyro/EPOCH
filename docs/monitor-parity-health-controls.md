# EPOCH MONITOR Health Controls

## Purpose

This document defines the current EPOCH MONITOR parity slice against the
HERMES-style monitor capability model. The goal is not to copy HERMES domain
wording, but to keep the same operator-grade surface pattern for EPOCH's
education, service, scheduling, submission, and revenue workflows.

## Required monitor sections

EPOCH MONITOR must expose these local operator sections:

- Summary
- Scope
- Memory
- Queue
- Timeline
- Risks
- Receipts
- Safe Access
- Controls

The public route may reuse the visual language, but it must not expose raw
monitor/admin state. Public pages remain intake and commercially safe status
surfaces only.

## Ledger-backed health controls

Monitor operator actions must create durable operating-ledger records, not only
browser UI state.

Current health-action records are stored in `monitorHealthChecks` and mirrored
into internal `monitor-check` receipts. They are internal by default and must
not create customer-visible notification events.

The current action classes are:

- Dirty local ledger export prompt.
- Awaiting-review return prompt.
- Stale monitor memory refresh prompt.
- Local-only safe-access acknowledgement.

## Safe access posture

The current static slice is local-first:

- Raw monitor: `local-only`.
- Raw admin: `local-only`.
- Public intake: `#public`.
- Customer status: `#student`, customer-safe only.
- Public policy: `deny-by-default` unless a controlled gateway is explicitly
  added and verified.

Any future public hostname, gateway, route placement, or campaign automation
change that exposes raw monitor/admin state is a security regression unless it
ships with explicit access control and verification evidence.

## Verification

The repository verifier must cover:

- Scope, Memory, and Safe Access route anchors.
- Monitor health summaries for dirty local state, awaiting review, stale memory,
  safe access, and operator actions.
- Schedule lifecycle summaries for rescheduled and canceled entries after a
  session has already been created.
- `createMonitorActionRecords`.
- `rescheduleScheduleRecords` and `cancelScheduleRecords`, including
  customer-safe update events, internal receipts, follow-ups, calendar export,
  and monitor summary counts.
- Internal monitor health checks and `monitor-check` receipts.
- No customer-visible notification events created by monitor actions.
- Operating-ledger export/import preservation of `monitorHealthChecks`.
- ARA handoff lifecycle controls and verifier coverage for approval, dispatch,
  acknowledgement, in-progress, completed, terminal-lock, receipt trail,
  transport history, and the customer-visible completion approval boundary.
- Notification outbox controls and verifier coverage for queued, dispatched,
  sent, failed, blocked, retry-ready, receipt-backed delivery handoff records
  that preserve customer-safe visibility boundaries.
- Quote and payment-readiness controls and verifier coverage for draft,
  presented, approved, payment-ready, payment-blocked, paid-recorded, declined,
  under-19 consent gates, receipts, and customer-safe quote status.
- Reminder, recurrence-candidate, and availability-window controls and verifier
  coverage for local reminder rules, operator-approved recurrence candidates,
  provider availability, receipts, calendar export entries, and customer-safe
  visibility boundaries.

