# EPOCH MONITOR Health Controls

## Purpose

EPOCH MONITOR clones the HERMES monitor structure for EPOCH calendar and
scheduling operations without copying HERMES project data or WORKSHOP service
bench scope.

MONITOR is not the EPOCH App and not the EPOCH Webportal. It is the local
operational status/control surface for EPOCH work.

## Required Monitor Sections

EPOCH MONITOR should expose local operator sections for:

- Summary
- Scope
- Memory
- Queue
- Schedule Timeline
- Schedule Risk
- Schedule Receipts
- Booking acceptance, hold, confirmation, status-event, and receipt aggregates
- Timing handoff, availability conflict, timing return, and return-receipt
  aggregates
- Availability capacity, waitlist, hold-release, promotion, and capacity-receipt
  aggregates
- Booking recommendation optimization, ranked-window, overload-warning, and
  recommendation-receipt aggregates
- Reminder execution, deadline execution, escalation, and execution-receipt
  aggregates
- Safe Access
- Calendar Provider Readiness
- Reminder And Recurrence Readiness
- Revised Calendar Contract Status
- Controls

These are schedule/calendar sections. Payment, pricing, offer packaging,
education delivery, consulting/support delivery, CRM, marketing, and revenue
pipeline sections belong to WORKSHOP App/Webportal or WORKSHOP MONITOR.

## Required HERMES-Structure Routes

- `/epoch-monitor.html`
- `/epoch-dashboard.html`
- `/epoch-completion.html`
- `/epoch-scorecard.html`
- `/epoch-timeline.html`
- `/epoch-schedule-audit.html`
- `/epoch-receipts.html`
- `/epoch-scheduler-log.html`
- `/epoch-search.html`
- `/epoch-template.html`
- EPOCH persona and team child routes matching the HERMES route pattern

Compatibility aliases may redirect `/epoch-work-audit.html` and
`/epoch-runner-log.html` to the canonical EPOCH-specific routes. The left-side
tree and focused page titles must use schedule/calendar language.

## App, Webportal, And MONITOR Placement

EPOCH has three distinct local surfaces:

- EPOCH App: `web/app/index.html`
- EPOCH Webportal: `web/webportal/index.html`
- EPOCH MONITOR: `/epoch-monitor.html`

Product UI belongs in the app and webportal. MONITOR belongs to operational
status, control, receipts, route health, timeline, and build-readiness evidence.
MONITOR must not become the customer portal, app dashboard, package catalog,
delivery console, offer bench, pricing surface, marketing console, payment
console, or CRM.

## Data Rule

EPOCH MONITOR data must be EPOCH-specific or empty/build-ready. HERMES queue,
Discord, runner, receipt, and project records must not be copied into EPOCH.

WORKSHOP has its own monitor at `/workshop-monitor.html` and owns the service
bench. EPOCH may show schedule-bound integration health, but not WORKSHOP's
service catalog or revenue operations as EPOCH core scope.

## Initial Health Controls

Until EPOCH-specific runners and persistent records are wired, MONITOR controls
should stay safe and local:

- route and status refresh
- schedule audit review
- scheduler log inspection
- safe access confirmation
- calendar provider readiness proof
- reminder/recurrence readiness proof
- revised-calendar contract readiness proof

Controls may create local receipts, but must not create customer-visible
messages, external calendar writes, provider calls, public monitor exposure, or
WORKSHOP service records.

The first booking workflow keeps product interaction in EPOCH App/Webportal.
EPOCH MONITOR reports aggregate request acceptance, availability hold, booking
confirmation, status-event, and receipt counts plus safe local receipts only.

The timing handoff return workflow follows the same placement rule: EPOCH App
and EPOCH Webportal expose the workflow, while EPOCH MONITOR reports aggregate
handoff, conflict, return, and receipt counts only.

The availability capacity workflow follows the same placement rule: EPOCH App
and EPOCH Webportal expose local capacity, waitlist, release, and promotion
status, while EPOCH MONITOR reports aggregate waitlist, release, promotion,
capacity-risk, and receipt counts only.

The booking recommendation workflow follows the same placement rule: EPOCH App
and EPOCH Webportal expose local ranked windows, alternatives, overload
warnings, and customer-safe recommendation receipts, while EPOCH MONITOR reports
aggregate optimization-run, recommendation-candidate, overload-warning,
provider-live-block, and receipt counts only.

The reminder/deadline execution workflow follows the same placement rule: EPOCH
App and EPOCH Webportal expose local reminder status, deadline evaluation, and
customer-safe follow-up state, while EPOCH MONITOR reports aggregate reminder
execution, deadline execution, escalation, notification-send-block, and receipt
counts only.
