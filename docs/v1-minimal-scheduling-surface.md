# EPOCH v1 Minimal Scheduling Surface

## Goal

Define the first shippable EPOCH slice as a narrow scheduling surface that
proves product ownership before broader suite integrations are attempted.

## v1 intent

The first slice should support a user creating, viewing, and updating a simple
scheduled item with explicit time boundaries and timezone-aware behavior.

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
- the minimum contract is not disputed
- deferred integrations stay deferred
