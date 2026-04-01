# EPOCH v1 Minimal Scheduling Surface

## Goal

Define the first shippable EPOCH slice as a narrow scheduling surface that
proves product ownership before broader suite integrations are attempted.

## v1 intent

The first slice should support a user creating, viewing, and updating a simple
scheduled item with explicit time boundaries and timezone-aware behavior.

## Implementation stance for v1

- native C owns the scheduling model and mutation logic
- the Avalonia desktop shell consumes the native core through explicit interop
- C# stays limited to host, UI, and interop glue unless a documented exception
  is required

## Minimum contract

- title
- optional notes or description
- start timestamp
- end timestamp
- timezone
- status such as active or canceled

## Minimum user-facing behaviors

- create a schedule entry
- view upcoming scheduled entries
- edit the basic fields of an entry
- cancel an entry without deleting historical intent

## Explicitly deferred from this slice

- recurring execution logic beyond documenting the future contract
- reminder delivery systems
- attendee and invitation workflows
- external calendar synchronization
- deep integrations with SYNAPSIS, SYMBIOSIS, ANVIL, NEXUS, or other suite
  surfaces

## Why this is the right first slice

This slice is large enough to prove that EPOCH can own scheduling data and user
flows, but small enough to avoid coupling v1 delivery to unresolved suite-wide
dependencies.

## Ready-for-implementation check

The execution issue for this slice should only move into implementation after:

- the product boundary is accepted
- the runtime and packaging stance is explicit
- the minimum contract is not disputed
- deferred integrations stay deferred
