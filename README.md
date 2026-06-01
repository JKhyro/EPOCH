# EPOCH

Scheduling, calendar, and operating-administration surface for the broader
KHYRON, SYMBIOSIS, and CITADEL suite.

## Current execution order

1. Lock the expanded product boundary.
2. Preserve the native runtime and packaging stance.
3. Define the first shippable operating slice.
4. Track integrations by phase so urgent education-revenue work does not
   collapse into unbounded platform scope.
5. Build the next integration in priority order, starting with EPOCH MONITOR
   route and menu parity.

## Current planning artifacts

- `docs/product-boundary.md`
- `docs/runtime-and-packaging.md`
- `docs/v1-minimal-scheduling-surface.md`
- `docs/education-operating-platform-boundary.md`
- `docs/first-commercial-slice-checklist.md`
- `docs/integration-priority-ranking.md`

## Current implementation artifacts

- `native/epoch_core.h` and `native/epoch_core.c`: first native C operating
  contract for statuses, schedule entries, operating entries, and attention
  checks.
- `native/epoch_core_smoke.c`: native smoke test for the core contract.
- `web/index.html`: static first-slice admin, student/customer, monitor, and
  public-intake surface.
- `web/operating-records.js`: browser-local intake-to-operating-record helper
  that turns a public request into lead, customer, request, follow-up, and
  receipt records, then supports opportunity-to-engagement conversion,
  scheduling, submission creation, deadline summaries, returned-review
  receipts, monitor health reports, and versioned operating-ledger
  export/import.
- `web/app.js`: shared renderer and local persistence flow for admin,
  student/customer, monitor, public request, scheduling, submission, and
  review-return views, including local ledger save/load plus JSON export/import.
- `web/seed-data.js`: demo commercial workflow covering leads, tracks, cohorts,
  offer packages, opportunities, sessions, assignments, submissions, reviews,
  follow-ups, and receipts.
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
