# EPOCH

Scheduling, calendar, and operating-administration surface for the broader
KHYRON, SYMBIOSIS, and CITADEL suite.

## Current execution order

1. Lock the expanded product boundary.
2. Preserve the native runtime and packaging stance.
3. Define the first shippable operating slice.
4. Track integrations by phase so urgent education-revenue work does not
   collapse into unbounded platform scope.
5. Build revenue-facing platform slices after the integration queue, starting
   with the professional public offer funnel and marketing-ready intake path.
6. Align the public, admin, student, and monitor web surfaces with the
   SCAFFOLD/HERMES visual direction without turning the public funnel into an
   internal monitor page.

## Current planning artifacts

- `docs/product-boundary.md`
- `docs/runtime-and-packaging.md`
- `docs/v1-minimal-scheduling-surface.md`
- `docs/education-operating-platform-boundary.md`
- `docs/first-commercial-slice-checklist.md`
- `docs/integration-priority-ranking.md`
- `docs/curriculum-gameplan-framework.md`
- `docs/monitor-parity-health-controls.md`
- `docs/agentic-revenue-handoff-contract.md`
- `docs/synapse-route-placement-contract.md`
- `docs/controlled-public-customer-access-gateway.md`
- `docs/library-ledger-sync-recovery-contract.md`
- `docs/calendar-provider-handoff-invitation-contract.md`
- `docs/notification-provider-handoff-template-consent-contract.md`
- `docs/payment-provider-handoff-invoice-checkout-contract.md`
- `docs/auth-session-role-readiness-contract.md`
- `docs/marketing-conversion-analytics-readiness-contract.md`
- `docs/provider-adapter-selection-readiness-contract.md`

## Current implementation artifacts

- `native/epoch_core.h` and `native/epoch_core.c`: first native C operating
  contract for statuses, schedule entries, operating entries, and attention
  checks.
- `native/epoch_core_smoke.c`: native smoke test for the core contract.
- `web/index.html`: static first-slice admin, student/customer, monitor, and
  public offer-funnel/intake surface, including a SCAFFOLD/HERMES-style route
  rail, top operating-ledger control panel, command strips, and an adult-first
  public intake route.
- `web/operating-records.js`: browser-local intake-to-operating-record helper
  that turns a public request into lead, customer, request, follow-up, and
  receipt records, then supports opportunity-to-engagement conversion,
  customer-visible update events, scheduling, TEMPO-ready calendar export
  entries, submission creation, deadline summaries, returned-review receipts,
  monitor health reports, ledger-backed monitor health checks, and versioned
  operating-ledger export/import with a LIBRARY-ready durable persistence
  envelope, LIBRARY sync/recovery handoff records, plus SYMBIOSIS/ANVIL
  agentic revenue handoff records and SYNAPSE route placement metadata.
  Calendar provider handoff records remain provider-neutral and no-live-send
  until a later adapter slice implements Google or Microsoft sync.
  Notification provider handoff records remain provider-neutral and
  no-live-send until a later delivery slice implements live email, LINE, SMS,
  NEXUS, or webhook integration.
  Payment provider handoff records remain provider-neutral and no-live-payment
  until a later payment adapter implements invoice sending, checkout sessions,
  credential storage, processor webhooks, or capture.
  Auth/session role handoff records remain provider-neutral and no-live-auth
  until a later identity-provider slice implements production login, OAuth,
  credential storage, token storage, or external sessions.
  Marketing conversion KPI records remain provider-neutral, first-party, and
  no-live-tracking until a later analytics or advertising adapter is explicitly
  selected and reviewed.
  Provider adapter candidate records remain sandbox-only and no-live-provider
  until a later go/no-go decision explicitly permits a scoped live prototype.
- `web/app.js`: shared renderer and local persistence flow for admin,
  student/customer, monitor, public request, scheduling, submission, and
  review-return views, including local ledger save/load, durable snapshot status,
  recovery-import state, JSON export/import, and MONITOR-visible SYNAPSE route
  placement cards, plus marketing-route and labor-model offer catalog display,
  body-level active-view state, shared data-view activation, controlled
  public/customer access gateway controls, and internal-only LIBRARY
  sync/recovery controls plus provider-neutral calendar and notification
  provider handoff controls, auth/session readiness controls, and local
  marketing conversion KPI controls plus provider adapter go/no-go controls.
- `web/seed-data.js`: demo commercial workflow covering leads, tracks, cohorts,
  offer packages, curriculum frameworks, package gameplans, opportunities,
  update events, sessions, assignments, submissions, reviews, follow-ups,
  receipts, SYNAPSE route placements, and marketing-ready package metadata.
  It also seeds internal LIBRARY ledger sync/recovery handoff records and
  provider-neutral calendar/invitation-readiness handoff records, plus
  notification provider template/consent readiness, payment provider
  invoice/checkout readiness, auth/session role readiness handoff records, and
  local marketing conversion KPI records for Japan, global, submission-first,
  and under-19 guarded routes, plus provider adapter candidate records for
  calendar, notification, payment, auth/session, analytics, and persistence
  go/no-go readiness.
- `tools/verify-commercial-slice.mjs`: repository verifier for the first
  commercial slice.

## Verification

```powershell
npm run verify
cmake -S . -B $env:TEMP\epoch-cmake-build
cmake --build $env:TEMP\epoch-cmake-build --config Debug
ctest --test-dir $env:TEMP\epoch-cmake-build -C Debug --output-on-failure
```

To preview the static portal, serve the `web` folder with any local static file
server and open `index.html`.

## Initial product intent

EPOCH is the suite surface responsible for time-, calendar-, schedule-, and
operations-shaped work:

- time-based objects such as events and schedule entries
- user-facing planning and viewing flows
- timezone-aware scheduling behavior
- the contract for future reminders, recurrence, and availability work
- internal administration over programs, classes, requests, submissions, and
  review cycles when those workflows are schedule-bound
- external student/customer notification, update, tracking, request, and
  submission surfaces when they depend on schedule state
- MONITOR-grade operational visibility for EPOCH lanes, following the HERMES
  MONITOR capability pattern as the parity target

The immediate commercial wedge is an education operating platform that supports
premium exam/writing/test-prep offers with less live-class labor: cohorts,
submission workflows, progress tracking, request handling, and professional
web-facing conversion surfaces.

EPOCH is not trying to solve every adjacent suite concern in one pass. Deep
integration into SYMBIOSIS, FURYOKU, ANVIL, NEXUS, LIBRARY, and other CITADEL
surfaces should follow a stable phased EPOCH boundary instead of defining it by
accident.

## First commercial operating lane

The first revenue-facing lane should support:

- premium adult and serious-student education services
- EIKEN 5-1 and later TOEIC, IELTS, TOEFL, school writing, university writing,
  and professional English tracks
- under-19 compatibility assessment before acceptance, or higher-touch pricing
  when younger students are accepted
- fewer live classes by default, with cohorts, submissions, structured feedback,
  and progress reporting doing more of the work
- professional public website copy and intake paths that do not lead with AI
  terminology in Japan-facing messaging
- controlled public intake and customer-safe status routes that do not expose
  raw admin or EPOCH MONITOR state
- adjacent revenue services such as consulting, tech support, clerical/admin,
  database, CRM, management-system, and automation support

## ARA revenue direction

EPOCH should also support the Agentic Response Array revenue model: MONITOR,
SYMBIOSIS, FURYOKU, and other CITADEL projects should be able to create,
schedule, track, operate, and report revenue-producing work with minimal manual
input from Jack. EPOCH owns the schedule/admin layer for that future loop; the
agent/control-plane behavior remains owned by the appropriate ARA projects.

## Implementation stance

- Native C is the default implementation language for EPOCH.
- Avalonia is the desktop host and UI surface.
- The boundary between the Avalonia host and the EPOCH core should be explicit
  native C interop instead of managed business logic.
- C# should be limited to the thin host, binding, and interop glue that
  Avalonia or platform integration requires.

## Near-term goal

The immediate goal is to replace the narrow calendar-only bootstrap with a
minimal but executable operating product contract: a scheduling core, a class
and submission administration surface, a HERMES-style monitor parity target, and
a public website/intake path. This should prove EPOCH can own schedule-bound
operations without premature coupling to every CITADEL integration or
unnecessary managed implementation spread.
