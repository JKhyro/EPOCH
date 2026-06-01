# EPOCH v1 Minimal Operating Surface

## Goal

Define the first shippable EPOCH slice as a narrow scheduling and education
operations surface that proves product ownership before broader suite
integrations are attempted.

## v1 intent

The first slice should support a provider creating, viewing, and updating
schedule-bound education/service work with explicit time boundaries,
timezone-aware behavior, and a submission/review loop.

## Implementation stance for v1

- native C owns the scheduling model and mutation logic
- the Avalonia desktop shell consumes the native core through explicit interop
- C# stays limited to host, UI, and interop glue unless a documented exception
  is required

## Minimum contract

### Schedule entry

- title
- optional notes or description
- start timestamp
- end timestamp
- timezone
- status such as active or canceled

### Operating entry

- type such as class, cohort session, diagnostic, assignment window, submission
  deadline, review deadline, request, or follow-up
- linked student/customer/cohort identifier
- owner or responsible reviewer
- internal status such as planned, waiting, submitted, reviewing, returned,
  overdue, canceled, or complete
- external visibility flag for student/customer-facing views
- last update timestamp and next-action timestamp

## Minimum user-facing behaviors

- create a schedule entry
- view upcoming scheduled entries
- reschedule the start/end window of an entry while preserving the previous
  schedule state
- cancel an entry without deleting historical intent
- create a cohort/session/assignment/review deadline
- view an internal next-action list
- view overdue submissions, reviews, and follow-ups
- record a student/customer request
- record a submission received state and feedback returned state
- expose a minimal external status page or export-ready view for a student or
  customer

## Schedule lifecycle records

Schedule changes after creation must be ledger-backed transitions, not direct
field edits with no proof trail.

The current lifecycle contract is:

- reschedule records preserve `previousStartAt`, `previousEndAt`, a
  `lifecycleHistory` entry, a customer-safe update event, an internal
  `schedule-rescheduled` receipt, and a follow-up control record
- cancellation records mark the session `canceled`, preserve the session row,
  add `canceledAt`, a lifecycle history entry, a customer-safe update event, an
  internal `schedule-canceled` receipt, and a replacement-plan follow-up
- linked assignments may carry `scheduleStatus` and `lastScheduleId`, but the
  assignment/request record is not deleted
- calendar export and EPOCH MONITOR summaries must expose rescheduled and
  canceled lifecycle state

## Explicitly deferred from this slice

- recurring execution logic beyond documenting the future contract
- automated reminder delivery systems
- full attendee and invitation workflows
- external calendar synchronization
- payment processing
- full curriculum authoring
- full CRM/helpdesk behavior outside schedule-bound requests
- deep integrations with SYMBIOSIS, FURYOKU, ANVIL, NEXUS, LIBRARY, or other suite
  surfaces

## Why this is the right first slice

This slice is large enough to prove that EPOCH can own scheduling data,
education/service operating flow, and user-visible status, but small enough to
avoid coupling v1 delivery to unresolved suite-wide dependencies.

## Ready-for-implementation check

The execution issue for this slice should only move into implementation after:

- the product boundary is accepted
- the runtime and packaging stance is explicit
- the minimum contract is not disputed
- deferred integrations stay deferred
- the commercial education lane is accepted as the first operating proof
- EPOCH MONITOR parity is scoped as a follow-on slice rather than mixed into the
  first scheduling/admin implementation
