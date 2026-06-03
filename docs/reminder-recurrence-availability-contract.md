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
- `reminderExecutions`: local reminder execution rows that record schedule-bound
  reminder status without sending customer notifications.
- `deadlineExecutions`: local deadline evaluation rows that record due-state,
  health, and customer-safe timing status.
- `deadlineEscalations`: local escalation rows that queue operator follow-up
  without external notification sends.
- `reminderDeadlineReceipts`: customer-safe/local proof rows for reminder,
  deadline, and escalation execution.
- `recurrenceCandidates`: repeatable service patterns that require operator
  approval before creating future sessions.
- `availabilityWindows`: provider/operator availability and blocked windows for
  booking, cohort clustering, and capacity planning.
- `deadlineItems`: deadline-health records that keep due-state visibility inside
  EPOCH scheduling rather than in service-delivery or CRM records.

## Native C guard

`EpochRecurrenceRule` is sandbox-safe only when it is local-only, does not create
future schedule entries, has a valid RRULE, and is not failed, blocked, or
canceled. Revised-calendar recurrence additionally requires operator approval
because the 13-month rulepack is not yet owner-approved.

Reminder/deadline execution guards require local-only customer-safe status,
disabled provider go-live flags, and disabled notification-send flags. Escalation
records may queue operator follow-up, but they do not send external reminders.

## Visibility

Customer-safe visibility is explicit and false by default. Raw internal
availability, recurrence reasoning, and reminder notes stay inside EPOCH MONITOR
unless an operator marks the record as customer-safe.

## Out Of Scope

This phase does not create external calendar events, send attendee invitations,
send automated reminders, perform calendar conflict resolution against Google or
Microsoft calendars, or create future sessions automatically from recurrence
candidates.
