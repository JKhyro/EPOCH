# Calendar Provider Go-Live Readiness Gate

## Purpose

EPOCH may prepare calendar, availability, reminder, and schedule-status provider
readiness locally before any live provider integration exists. This gate keeps
provider work inside EPOCH's scheduling boundary and prevents live provider
calls until a later explicit approval.

## Scope

This gate covers only EPOCH-owned time records:

- schedule entries
- schedule requests
- availability windows
- reminder rules
- recurrence/deadline readiness
- customer-safe timing statuses
- revised-calendar mapping readiness

WORKSHOP service delivery, packages, submissions, CRM, revenue, pricing,
payments, authentication, analytics, ads, and customer acquisition are out of
scope for this gate.

## Required Readiness Checks

`EpochCalendarProviderReadinessGate` is not ready for a live toggle until all
of these are true:

- sandbox prototype passed
- local schedule records verified
- customer-safe timing status verified
- revised-calendar mapping verified
- explicit operator approval recorded
- live provider calls are still disabled before the toggle

The web surfaces represent this as sandbox-only status. They do not call Google
Calendar, Microsoft Graph, CalDAV, notification services, payment providers, or
analytics providers.

## Native Contract

The native core now includes:

- `EpochScheduleRequest`
- `EpochAvailabilityWindow`
- `EpochReminderRule`
- `EpochCalendarProviderReadinessGate`
- `epoch_schedule_request_is_customer_safe`
- `epoch_availability_window_has_capacity`
- `epoch_reminder_rule_is_sandbox_safe`
- `epoch_calendar_provider_gate_ready_for_live_toggle`
- `epoch_calendar_provider_gate_blocks_live_calls`

## Web Contract

The App and Webportal consume local ledger records through
`EPOCH_LEDGER_KEY`.

The App shows:

- local schedule ledger counts
- schedule queue
- availability and deadline records
- sandbox reminder rules
- calendar-provider readiness gates
- no-live-provider proof checks
- local receipts

The Webportal shows:

- schedule request intake
- customer-safe request status
- availability windows
- external calendar connection status

The Webportal must never expose raw provider controls or MONITOR controls.

## Go-Live Rule

This issue does not approve live provider integrations. A later issue must
explicitly approve provider credentials, OAuth or service-account posture,
webhook behavior, external writes, invitation/send policy, rollback behavior,
and customer notification wording before live calls are enabled.
