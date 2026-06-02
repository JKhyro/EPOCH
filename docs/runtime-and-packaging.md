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
- The Avalonia shell should stay thin and consume the native core via explicit
  interop for internal administration.
- A customer-safe webportal may be built before the Avalonia host, but it
  should be treated as a host/client surface over the EPOCH contract. Revenue
  and service-delivery portals belong to WORKSHOP.
- If logic must land in C# for host reasons, document the exception instead of
  letting it silently become the new default.
