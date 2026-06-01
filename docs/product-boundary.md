# EPOCH Product Boundary

## Purpose

EPOCH is the calendar, scheduling, and schedule-bound operating administration
surface for the broader KHYRON, SYMBIOSIS, and CITADEL suite. It owns the model
and user-facing surface of time-organized work without requiring immediate deep
integration into every adjacent product.

The current commercial pressure adds an education-platform wedge: EPOCH must be
able to support classes, cohorts, student/customer requests, submissions,
progress tracking, notifications, and professional public intake for premium
education offers while preserving a reusable scheduling core.

## EPOCH owns

- event and schedule-entry primitives
- timezone-aware date and time handling for scheduling workflows
- calendar and schedule presentation surfaces
- the contract for reminders, recurrence, and availability
- the primary place where scheduling intent is created, reviewed, and updated
- schedule-bound operating objects such as cohorts, sessions, submission
  windows, review deadlines, request queues, and follow-up checkpoints
- internal administration for schedule-dependent education and service delivery
- external student/customer views for notification, update, tracking, request,
  and submission workflows
- EPOCH MONITOR visibility over schedule health, queue state, overdue work,
  workload, review status, delivery risk, and lane history
- a public website/intake surface when the site is directly feeding EPOCH
  scheduling, onboarding, request, or submission workflows

## EPOCH does not own right now

- full cross-suite orchestration or agentic decision-making
- all education curriculum or pedagogical content as a separate knowledge domain
- payment processing as a first-class finance system
- external calendar sync beyond defining import/export and future integration
  contracts
- complex resource booking outside the first education/service operating lanes
- generalized CRM, database, or helpdesk products that are not schedule-bound
- notification delivery infrastructure outside the EPOCH contract itself

## Relationship to adjacent products

- `TEMPO` is the closest conceptual peer for time primitives and adjacent time UX.
- `SYMBIOSIS` is a likely runtime and agent-facing integration surface.
- `FURYOKU` and `HERMES` are the monitor/autopilot pattern sources for EPOCH
  MONITOR parity.
- `ANVIL` is a likely workflow and work-planning integration surface.
- `NEXUS` is a likely communications and coordination integration surface.
- `LIBRARY` is the likely durable data/retrieval substrate when EPOCH needs
  long-lived records or knowledge-linked history.

These relationships matter, but they should be phased. EPOCH should not wait for
every suite dependency before delivering its first commercial operating slice.

## Phased boundary

### Phase 0: Boundary reset

Record the expanded EPOCH ownership model and explicitly separate owned,
integrated, and deferred scope.

### Phase 1: Education operating slice

Support a premium education-service workflow with:

- public website and intake path
- adult/serious-student positioning with under-19 compatibility assessment or
  higher-touch pricing
- class/cohort/session calendar
- assignment and submission windows
- review and feedback deadlines
- student/customer status tracking
- internal admin dashboard for next actions, overdue items, and workload

### Phase 2: EPOCH MONITOR parity

Clone the HERMES MONITOR capability pattern into an EPOCH-specific monitor:

- lane tree and status pages
- sections for Summary, Scope, Memory, Queue, Timeline, Risks, and Receipts
- health and overdue-state generation
- visible project/menu integration
- safe local-first operation with public exposure denied until access control is
  explicitly configured

### Phase 3: ARA revenue operations

Use EPOCH to schedule, track, and report revenue-producing work created by ARA
projects, including education, consulting, tech support, clerical/admin,
database/CRM/management systems, and automation/service delivery.

## Immediate boundary questions

- What is the minimal schedule-bound operating object EPOCH must own in v1?
- Which class/cohort/submission actions must exist in the first shippable
  education operating surface?
- Which HERMES MONITOR capabilities are cloned exactly, and which are renamed or
  adapted for EPOCH?
- Which public website/intake features are EPOCH-owned versus marketing/content
  artifacts?
- Which integrations are hard dependencies, and which are explicitly deferred?

## Exit criteria for boundary lock

- EPOCH has a clear ownership statement for scheduling.
- EPOCH has a clear ownership statement for schedule-bound operating
  administration.
- The v1 surface is defined as a narrow education/service operating slice.
- Deferred integrations are recorded separately instead of pulled into v1.
