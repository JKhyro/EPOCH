# Curriculum Gameplan Framework

## Boundary correction

This is preserved prototype work for WORKSHOP. Curriculum, package gameplans,
education offer design, and public education positioning are WORKSHOP-owned.
EPOCH should retain only schedule-bound fields that WORKSHOP needs for
appointments, deadlines, reminders, status events, and customer-safe timing.

## Purpose

WORKSHOP needs a concrete education-delivery framework that supports premium,
submission-first offers without turning the business back into generic hourly
tutoring. The framework separates reusable curriculum structure from
package-specific gameplans and customer-visible progress summaries.

## Record Model

- `curriculumFrameworks`: reusable delivery ladders such as EIKEN 5-1 writing
  or professional writing and operations support.
- `packageGameplans`: package-level execution plans that connect an offer to a
  framework, cadence, milestones, customer-visible summary, internal readiness,
  labor model, and under-19 policy.
- `customers.gameplanId`: optional assignment of a customer to the currently
  visible personalized plan.
- Intake, opportunity, engagement, session, assignment, submission, receipt, and
  customer records should preserve `frameworkId`, `gameplanId`, and
  `gameplanStatus` whenever a package has a linked gameplan.
- Education intake should preserve the minimum personalization inputs needed
  for routing: target level, baseline sample state, weakness focus, and
  available study time.

## Education Rules

- EIKEN must cover levels 5, 4, 3, Pre-2, 2, Pre-1, and 1.
- Paid diagnostics route students into the correct plan before larger
  commitments.
- Live calls are optional checkpoints; submissions, correction windows,
  worksheets, status updates, and receipts do most of the recurring work.
- Under-19 applicants require compatibility review and guardian or institution
  involvement before any recurring plan is accepted.

## Public Copy Rules

- Japan-facing language should sell outcomes: exam readiness, teacher-reviewed
  correction, writing structure, progress visibility, and reliable scheduling.
- Do not lead public education copy with AI terminology.
- Public surfaces may show framework and gameplan summaries, but internal
  readiness notes, risk routing, and operator controls remain internal.

## Monitor Expectations

WORKSHOP MONITOR should report curriculum readiness alongside queue, revenue,
handoff, persistence, delivery, and receipt state. EPOCH MONITOR should show
only related schedule/deadline health when WORKSHOP hands off timed work:

- framework count
- active or planned gameplan count
- EIKEN level coverage
- submission-first gameplan count
- under-19 guarded gameplan count
- next milestone coverage
