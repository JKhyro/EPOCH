# EPOCH Product Boundary

## Purpose

EPOCH is the calendar, scheduling, availability, reminder, recurrence, and
schedule-bound administration product for KHYRON, SYMBIOSIS, and CITADEL.

EPOCH is not the revenue bench. WORKSHOP owns revenue streams, education offer
packaging, consulting and support catalogs, marketing operations, pricing,
client acquisition, and ARA income-production workflows.

## EPOCH owns

- Gregorian calendar scheduling.
- The owner-reviewed revised 13-month calendar contract and later native
  conversion implementation.
- Date/time primitives, timezone-aware scheduling, schedule entries, calendar
  views, availability windows, reminder rules, recurrence candidates, and
  booking/request timing.
- Schedule-bound operating records, such as sessions, deadlines, follow-ups,
  customer-safe schedule status, and overdue schedule risk.
- Internal administration for work that is fundamentally calendar-bound.
- External request, submission, tracking, and notification timing when those
  flows depend on schedule state.
- EPOCH MONITOR: a HERMES MONITOR structural clone using EPOCH data only.

## EPOCH does not own

- WORKSHOP service catalogs, pricing, revenue models, marketing plans, paid
  education packages, consulting offers, tech-support offers, clerical/admin
  services, CRM/database service delivery, or AI/dev service packaging.
- General curriculum/content strategy except where a schedule or deadline must
  represent it.
- Payment processing as a finance product.
- Production authentication as an identity product.
- Cross-suite agentic decision-making.
- Raw public exposure of admin or monitor surfaces.

## WORKSHOP relationship

WORKSHOP may consume EPOCH for:

- appointment scheduling
- availability checks
- cohort/session calendars
- submission and review deadlines
- reminder and notification timing
- customer-safe schedule/status events
- schedule health exposed through EPOCH MONITOR

That integration is provider-client integration. It does not merge the products.

## MONITOR parity

EPOCH MONITOR must clone the HERMES MONITOR structure:

- monitor, dashboard, completion, scorecard, timeline, audit, receipts,
  runner-status, search, template, persona, and team route roles
- EPOCH-specific visible route names such as Schedule Completion, Schedule
  Scorecard, Schedule Timeline, Schedule Audit, Schedule Receipts, Scheduler
  Log, Calendar Search, and Schedule Template
- CITADEL left-side tree integration
- Summary, Scope, Memory, Queue, Timeline, Risks, Receipts, and Controls
- local-first generated status data
- safe no-op controls until EPOCH-specific runners are wired

The clone must not copy HERMES project data. Empty/build-ready EPOCH data is
correct until EPOCH-specific queues, records, and runners exist. The clone must
not preserve generic HERMES labels when those labels make EPOCH look like the
same workbench as WORKSHOP.

## Native C directive

Native C remains the default for EPOCH core logic. The native core should own
calendar conversion, scheduling rules, recurrence evaluation, validation, and
schedule-state mutation once the contracts are approved.

Avalonia or web surfaces are host/client layers. They consume the EPOCH core;
they do not become the permanent source of scheduling truth.

## Immediate lock criteria

- EPOCH owns calendar/scheduling and schedule-bound administration.
- WORKSHOP owns the revenue bench.
- The revised 13-month calendar remains draft-only until the exact owner
  contract is approved.
- EPOCH MONITOR has HERMES structural parity without HERMES data.
- Existing revenue-facing prototype assets are treated as extraction candidates,
  not as durable EPOCH ownership.
