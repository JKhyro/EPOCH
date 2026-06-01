# SYNAPSE Route Placement Contract

## Purpose

This document defines the EPOCH-side route placement contract that lets SYNAPSE
find EPOCH operating surfaces without copying EPOCH UI. The contract covers
route metadata, placement surfaces, summary fields, access discipline, and
change control. It does not define live API behavior.

## Route Metadata Shape

EPOCH exposes route placement records in `routePlacements` using this shape:

```js
{
  id: "synapse-epoch-monitor",
  label: "EPOCH MONITOR",
  href: "#monitor",
  surface: "monitor",
  visibility: "internal",
  routeKind: "monitor-entry",
  status: "ready",
  sourceSystem: "EPOCH",
  targetSystem: "SYNAPSE",
  summaryKey: "health",
  placement: "link-or-embed",
  duplicateUi: false
}
```

Stable route entries currently cover:

- `synapse-epoch-admin`: internal admin surface at `#admin`
- `synapse-epoch-monitor`: internal monitor surface at `#monitor`
- `synapse-epoch-customer-status`: controlled customer status surface at
  `#student`
- `synapse-epoch-intake`: public intake surface at `#public`

## Placement Rules

- EPOCH owns route metadata and operating-state summaries for its own surfaces.
- SYNAPSE may link to or frame the declared EPOCH routes according to
  `placement`.
- `duplicateUi` must remain `false` unless a future contract explicitly changes
  ownership boundaries.
- EPOCH MONITOR remains the canonical operational view for EPOCH queue, risk,
  receipt, persistence, handoff, calendar, and route-placement state.

## Summary Contract

`summarizeRoutePlacementState()` returns a compact SYNAPSE-facing summary:

- `schema`: `epoch.synapse-route-placement`
- `sourceSystem`: `EPOCH`
- `targetSystem`: `SYNAPSE`
- `placementMode`: `link-or-embed`
- `access`: `local-or-controlled`
- `summary.queue`: active queue count
- `summary.risks`: blocked, overdue, or stale record count
- `summary.receipts`: receipt count
- `summary.activeEngagements`: active revenue engagement count
- `summary.visibleUpdates`: customer-visible update count
- `summary.pendingHandoffApprovals`: operator approval count
- `summary.calendarEntries`: calendar-export entry count
- `summary.monitorHref`: the canonical monitor route

Detailed queue inspection, remote polling, and bidirectional workflow control
remain outside this contract.

## Local-First Access Discipline

EPOCH route placement is local-first. Missing remote data must not cause EPOCH
to invent SYNAPSE state, duplicate SYNAPSE UI, or perform speculative
cross-system recovery. If only local state is available, EPOCH should still
render the declared routes and local summaries.

## Out of Scope

- live API integration
- remote health polling
- remote queue polling
- SYNAPSE internal screen structure
- embedding duplicated EPOCH management UI inside SYNAPSE
- bidirectional workflow control

## Change Control

Any change to route ids, route hrefs, visibility semantics, placement behavior,
summary field shape, or ownership boundaries requires an explicit contract
update in this document.
