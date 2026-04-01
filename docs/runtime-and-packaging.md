# EPOCH Runtime And Packaging Stance

## Goal

Keep EPOCH primarily native C while using Avalonia as the desktop shell and C#
only where the host, UI framework, or platform integration makes it necessary.

## Core stance

- Native C is the default implementation language.
- Scheduling logic, data structures, validation, and state transitions should
  live in native C by default.
- Managed code should not become the primary home of EPOCH business rules.

## Avalonia role

- Avalonia is the desktop application shell and UI surface.
- Avalonia can own windowing, rendering, binding, and desktop-app lifecycle
  concerns.
- Avalonia should consume EPOCH through a deliberate interop boundary rather
  than by reimplementing the core scheduling model in C#.

## Interop boundary

- Use a stable native C ABI between the EPOCH core and the Avalonia host.
- Keep the interop surface coarse-grained and versionable.
- Prefer plain structs, explicit handles, and predictable ownership rules over
  chatty object-shaped crossings.
- Design the interop boundary so the native core can later be hosted by other
  shells without CLR coupling.

## C# is allowed where necessary

- Avalonia app bootstrap and application lifecycle
- XAML or Avalonia view code
- platform-specific desktop integration that Avalonia expects in managed code
- interop marshaling and native library loading

## C# is not the default place for

- scheduling rules
- recurrence evaluation
- event mutation and validation logic
- storage-neutral data contracts owned by the core runtime

## Packaging direction

- Package EPOCH as a native C core plus an Avalonia desktop host.
- Keep the native runtime independently testable outside the desktop shell.
- Avoid taking runtime dependencies that force the core scheduling engine to
  live inside the CLR.

## Implications for the first executable slice

- The v1 scheduling surface should prove the native C core first.
- The Avalonia shell should stay thin and consume the native core via explicit
  interop.
- If logic must land in C# for host reasons, document the exception instead of
  letting it silently become the new default.
