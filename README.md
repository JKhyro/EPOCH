# EPOCH

Calendar and scheduling surface for the broader KHYRON and SYMBIOSIS suite.

## Current execution order

1. Lock the product boundary.
2. Define the first shippable EPOCH slice.
3. Track integrations only after the boundary and v1 slice are explicit.

## Current planning artifacts

- `docs/product-boundary.md`
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

## Near-term goal

The immediate goal is to define a minimal but executable scheduling product
contract, then deliver one narrow v1 surface that proves EPOCH can own
scheduling without premature coupling to the rest of the suite.
