# EPOCH

Calendar and scheduling surface for the broader KHYRON and SYMBIOSIS suite.

## Current execution order

1. Lock the product boundary.
2. Lock the runtime and packaging stance.
3. Define the first shippable EPOCH slice.
4. Track integrations only after the boundary, runtime stance, and v1 slice are explicit.

## Current planning artifacts

- `docs/product-boundary.md`
- `docs/runtime-and-packaging.md`
- `docs/v1-minimal-scheduling-surface.md`

## Initial product intent

EPOCH is the suite surface responsible for calendar- and schedule-shaped work:

- time-based objects such as events and schedule entries
- user-facing planning and viewing flows
- timezone-aware scheduling behavior
- the contract for future reminders, recurrence, and availability work

EPOCH is not trying to solve every adjacent suite concern in its first pass. Deep
integration into SYNAPSIS, SYMBIOSIS, ANVIL, NEXUS, and other surfaces should
follow a stable EPOCH boundary instead of defining it.

## Implementation stance

- Native C is the default implementation language for EPOCH.
- Avalonia is the desktop host and UI surface.
- The boundary between the Avalonia host and the EPOCH core should be explicit
  native C interop instead of managed business logic.
- C# should be limited to the thin host, binding, and interop glue that
  Avalonia or platform integration requires.

## Near-term goal

The immediate goal is to define a minimal but executable scheduling product
contract, lock the native-runtime stance, then deliver one narrow v1 surface
that proves EPOCH can own scheduling without premature coupling to the rest of
the suite or unnecessary managed implementation spread.
