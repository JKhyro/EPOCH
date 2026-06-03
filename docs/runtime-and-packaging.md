# EPOCH Runtime And Packaging Stance

## Goal

Keep EPOCH primarily native C while using Avalonia as the desktop shell and C#
only where the host, UI framework, or platform integration makes it necessary.

## Core stance

- Native C is the default implementation language.
- Scheduling logic, data structures, validation, and state transitions should
  live in native C by default.
- Schedule-bound operating logic for sessions, cohorts, submission windows,
  review deadlines, queue state, and status transitions should also prefer the
  native core when the behavior is reusable beyond one host.
- Request acceptance, local availability holds, booking confirmations,
  customer-safe schedule status events, and booking receipts are part of the
  native contract surface once they influence more than one host.
- Timing handoffs, availability conflict decisions, timing return payloads,
  and return receipts are also native-owned because they define EPOCH's service
  boundary for products that request schedule state.
- Managed code should not become the primary home of EPOCH business rules.

## Avalonia role

- Avalonia is the desktop application shell and UI surface.
- Avalonia can own windowing, rendering, binding, and desktop-app lifecycle
  concerns.
- Avalonia should consume EPOCH through a deliberate interop boundary rather
  than by reimplementing the core scheduling model in C#.
- Avalonia may host the first internal administration surface for calendars,
  availability windows, deadlines, reminders, recurrence, schedule-bound
  requests, and EPOCH MONITOR status.

## Interop boundary

- Use a stable native C ABI between the EPOCH core and the Avalonia host.
- Keep the interop surface coarse-grained and versionable.
- Prefer plain structs, explicit handles, and predictable ownership rules over
  chatty object-shaped crossings.
- Design the interop boundary so the native core can later be hosted by other
  shells without CLR coupling.
- Public/customer webportal and client surfaces should consume the same
  scheduling/operating contract rather than inventing separate schedule state.

## C# is allowed where necessary

- Avalonia app bootstrap and application lifecycle
- XAML or Avalonia view code
- platform-specific desktop integration that Avalonia expects in managed code
- interop marshaling and native library loading
- host-side rendering of internal dashboards and monitor pages
- adapters to web/API surfaces before a more permanent cross-host boundary is
  available

## C# is not the default place for

- scheduling rules
- recurrence evaluation
- event mutation and validation logic
- storage-neutral data contracts owned by the core runtime
- cohort/session/submission/review state transitions that should remain shared
  across desktop, web, monitor, and ARA service workflows

## Packaging direction

- Package EPOCH as a native C core plus an Avalonia desktop host.
- Keep the native runtime independently testable outside the desktop shell.
- Avoid taking runtime dependencies that force the core scheduling engine to
  live inside the CLR.
- Package web/portal surfaces as consumers of EPOCH contracts, not as the
  permanent source of scheduling truth.
- Keep EPOCH MONITOR generation local-first until public access control and
  exposure policy are explicitly verified.

## Implications for the first executable slice

- The v1 operating surface should prove the native C core first for
  schedule-bound objects and status transitions.
- The local-first booking workflow should create a schedule request, acceptance,
  availability hold, booking confirmation, status event, and receipt before any
  live calendar provider integration is approved.
- Handoff consumers should receive either a confirmed local timing return or a
  customer-safe reschedule/conflict return while EPOCH keeps calendar ownership.
- The Avalonia shell should stay thin and consume the native core via explicit
  interop for internal administration.
- A customer-safe webportal may be built before the Avalonia host, but it
  should be treated as a host/client surface over the EPOCH contract. Revenue
  and service-delivery portals belong to WORKSHOP.
- If logic must land in C# for host reasons, document the exception instead of
  letting it silently become the new default.

## Current Avalonia shell proof

- `native/epoch_app_bridge.h` exposes the first coarse C ABI for the desktop
  host.
- `native/epoch_app_bridge.c` returns a scheduling snapshot from Native C
  validation, not from a parallel C# schedule model.
- `src/Epoch.App` is the first Avalonia host. It renders Calendar Board,
  Schedule Queue, Revised Calendar Lab, and Boundary Contract panels from the
  native bridge snapshot.
- `dotnet run --project src/Epoch.App/Epoch.App.csproj -- --smoke` is the
  managed smoke check after the native bridge has been built into `build`.
- Product modules stay in EPOCH App/Webportal. MONITOR may report readiness for
  those modules, but it does not host the scheduling workflows.

## Native-backed scheduling command slice

- `epoch_app_bridge_preview_schedule_command` previews a validated native
  command chain: request, EPOCH-owned availability window, timing handoff,
  acceptance, local hold, booking confirmation, schedule status event, booking
  receipt, and timing return payload.
- The Avalonia shell renders that command chain in the Native Scheduling
  Command panel.
- The command preview remains local-only and customer-safe. It does not enable
  provider calls and does not expose WORKSHOP service or CRM internals.

## Native-backed scheduling execution slice

- `epoch_app_bridge_execute_schedule_command` accepts an explicit scheduling
  intent such as `confirm-local-booking` and returns an execution receipt.
- The execution receipt proves request acceptance, local availability hold,
  booking confirmation, customer-safe schedule status, booking receipt, and
  timing return from the Native C bridge.
- The execution path is local-only: provider calls stay disabled, MONITOR
  workflow exposure stays false, and WORKSHOP service/CRM details remain
  outside EPOCH.

## Local scheduling execution history slice

- `EpochScheduleExecutionHistoryStore` persists native execution receipts in an
  EPOCH App-owned JSON ledger named `schedule-execution-history.json`.
- The default ledger directory is under the local application-data path at
  `KHYRON/EPOCH/App`; tests and smoke runs can override it with
  `EPOCH_APP_STATE_DIR`.
- The Avalonia shell displays the persisted command count, latest local history
  status, and ledger path in the App. MONITOR remains a development/control
  evidence surface and does not become the scheduling history workflow.
- Invalid JSON history is archived aside instead of blocking the desktop shell,
  keeping local recovery inside the App layer and away from public/provider
  integrations.
