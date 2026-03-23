# EPOCH Product Boundary

## Purpose

EPOCH is the calendar and scheduling surface for the broader KHYRON and
SYMBIOSIS suite. It should own the model and user-facing surface of scheduling
work without requiring immediate deep integration into every adjacent product.

## EPOCH owns

- event and schedule-entry primitives
- timezone-aware date and time handling for scheduling workflows
- calendar and schedule presentation surfaces
- the contract for reminders, recurrence, and availability
- the primary place where scheduling intent is created, reviewed, and updated

## EPOCH does not own right now

- full cross-suite orchestration
- external calendar sync
- complex resource booking
- multi-party invitation and attendee workflows
- notification delivery infrastructure outside the EPOCH contract itself

## Relationship to adjacent products

- `TEMPO` is the closest conceptual peer for time primitives and adjacent time UX.
- `SYNAPSIS` is a likely shell and suite-placement surface.
- `SYMBIOSIS` is a likely runtime and agent-facing integration surface.
- `ANVIL` is a likely workflow and work-planning integration surface.
- `NEXUS` is a likely communications and coordination integration surface.

These relationships matter, but they should remain deferred integration planning
until EPOCH has a stable boundary and a clear first slice.

## Immediate boundary questions

- What is the minimal event object EPOCH must own in v1?
- Which scheduling actions must exist in the first shippable surface?
- What reminder and recurrence behaviors need to be specified now versus later?
- Which integrations are hard dependencies, and which are explicitly deferred?

## Exit criteria for boundary lock

- EPOCH has a clear ownership statement for scheduling.
- The v1 surface is defined as a narrow execution slice.
- Deferred integrations are recorded separately instead of pulled into v1.
