# Reminder Recurrence And Availability Contract

## Purpose

EPOCH now records reminder rules, recurrence candidates, and availability
windows in the local operating ledger before any external calendar provider is
connected.

The contract strengthens scheduling and calendar control without sending live
invitations, syncing external calendars, or delivering automated reminders.

## Records

- `reminderRules`: operator-facing reminder rules tied to sessions,
  assignments, submissions, reviews, follow-ups, quotes, deliveries, or handoffs.
- `recurrenceCandidates`: repeatable service patterns that require operator
  approval before creating future sessions.
- `availabilityWindows`: provider/operator availability and blocked windows for
  booking, cohort clustering, and capacity planning.

## Visibility

Customer-safe visibility is explicit and false by default. Raw internal
availability, recurrence reasoning, and reminder notes stay inside EPOCH MONITOR
unless an operator marks the record as customer-safe.

## Out Of Scope

This phase does not create external calendar events, send attendee invitations,
send automated reminders, perform calendar conflict resolution against Google or
Microsoft calendars, or create future sessions automatically from recurrence
candidates.
