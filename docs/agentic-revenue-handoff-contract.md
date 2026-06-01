# Agentic Revenue Handoff Contract

## Purpose

This document defines the EPOCH-side handoff record contract for revenue work
created by `SYMBIOSIS` and planned or executed through `ANVIL`.

The contract is intentionally local-first. Until deeper integrations are ready,
EPOCH should treat these records as browser-ledger operating records that make
agent-created work visible, reviewable, receipt-backed, and reversible without
requiring live cross-suite APIs.

## Contract Position

- EPOCH owns the schedule-bound handoff record, approval state, next action,
  and monitor visibility.
- `SYMBIOSIS` may originate a proposed revenue handoff.
- `ANVIL` may receive an approved handoff and report internal work progress back
  into EPOCH as receipt-backed updates.
- Customer-facing schedule, assignment, submission, review, and notification
  records remain EPOCH-owned and cannot be mutated directly by agents without
  explicit approval.

## Record Shape

Each handoff record should be represented as one EPOCH operating record with
this minimum shape:

```json
{
  "id": "handoff-20260601-001",
  "kind": "agentic-revenue-handoff",
  "sourceSystem": "symbiosis",
  "executionSystem": "anvil",
  "status": "proposed",
  "createdAt": "2026-06-01T12:00:00+09:00",
  "updatedAt": "2026-06-01T12:00:00+09:00",
  "engagementId": "engagement-...",
  "customerId": "customer-...",
  "serviceLane": "education|consulting|support|admin|automation",
  "summary": "Short operator-readable description of the revenue work.",
  "requestedOutcome": "What the work should produce.",
  "proposedPlan": "Short plan or work package summary from the agent side.",
  "approval": {
    "required": true,
    "status": "pending",
    "approvedBy": null,
    "approvedAt": null
  },
  "receiptIds": [],
  "rollbackOf": null,
  "rollbackReason": null,
  "notes": ""
}
```

## Required Fields

- `id`: stable EPOCH-side handoff id.
- `kind`: fixed value `agentic-revenue-handoff`.
- `sourceSystem`: origin system such as `symbiosis`.
- `executionSystem`: target work-planning system such as `anvil`.
- `status`: current handoff state from the state model below.
- `engagementId`: required once the work is tied to an accepted EPOCH
  engagement.
- `customerId`: required when the work is tied to a customer record.
- `summary`: concise operator-facing description.
- `requestedOutcome`: the concrete delivery result expected from the handoff.
- `proposedPlan`: concise proposed execution plan, not the full live work log.
- `approval`: explicit human approval boundary.
- `receiptIds`: receipts that prove creation, approval, dispatch, update,
  completion, rejection, cancellation, or rollback.
- `rollbackOf` and `rollbackReason`: required when the record is compensating
  for an earlier handoff.

## State Model

Use these states only:

- `proposed`: agent-originated handoff exists in EPOCH but has not been
  approved. In the browser-ledger implementation this approval boundary is
  represented as `pending-operator-approval`.
- `approved`: operator approved the handoff for dispatch to `ANVIL`.
- `rejected`: operator refused the handoff. No downstream execution should
  occur.
- `dispatched`: EPOCH released the approved handoff to `ANVIL`.
- `acknowledged`: `ANVIL` confirmed receipt of the handoff.
- `in-progress`: downstream work is underway.
- `completed`: downstream work finished and the outcome was recorded.
  The current browser-ledger/native status label is `complete`; it maps to this
  terminal contract state.
- `canceled`: the handoff was stopped before completion.
- `rolled-back`: EPOCH recorded a compensating rollback for an earlier handoff.
- `blocked`: the handoff cannot proceed because approval, scope, data, or
  delivery conditions are unresolved.

`rejected`, `canceled`, and `rolled-back` are terminal. `completed` is terminal
unless a later rollback receipt compensates for the completed handoff.

## Approval Boundary

- Agent-created handoffs may enter EPOCH in `proposed` state without creating
  customer-visible schedule or delivery changes.
- Only an explicit EPOCH operator approval may move a record from `proposed` to
  `approved`.
- `SYMBIOSIS` and `ANVIL` may propose plans, update internal execution state,
  and attach receipts.
- `SYMBIOSIS` and `ANVIL` may not directly create or modify customer-facing
  engagements, assignments, sessions, submissions, reviews, follow-ups, or
  notification events without a separate approved EPOCH action.
- If a downstream agent outcome should change a customer-facing record, EPOCH
  must treat that as a new operator-reviewed action, not as an implicit side
  effect of the handoff.

## Receipt Expectations

Every external or cross-boundary state change must create a receipt in EPOCH.
At minimum, receipts should exist for:

- handoff created
- handoff approved or rejected
- handoff dispatched
- downstream receipt acknowledged
- work marked in progress
- work completed
- handoff canceled
- rollback recorded

Each receipt should capture:

- receipt id
- handoff id
- actor or system
- action
- timestamp
- resulting state
- short note
- source reference such as local import batch, operator action, or future API
  event id

## Rollback Expectations

- Rollback must be additive. Do not delete the original handoff record or its
  receipts.
- A rollback creates a new compensating receipt and sets the affected handoff to
  `rolled-back` or `canceled`, depending on whether downstream execution
  occurred.
- Rollback must name the cause, operator or system actor, and the record or
  receipt being reversed.
- If rollback affects a customer-facing record, that customer-facing change must
  carry its own EPOCH receipt trail as a separate action.

## Monitor Visibility

EPOCH MONITOR should expose handoff records as local-first operating data with:

- queue counts by handoff state
- approval-needed count
- blocked and stale handoff warnings
- recent handoff receipts in the timeline and receipts sections
- source and execution system visibility such as `symbiosis` and `anvil`
- rollback and rejection visibility as explicit risk or receipt items

The monitor route should remain local or access-controlled. Raw agent payloads,
internal notes, and future transport details should not be exposed publicly by
default.

## Current Browser-Ledger Implementation

The current static implementation is intentionally local-first and lives in
`web/operating-records.js`.

- `createAgentHandoffRecords` creates a `workPlan`, `agentHandoff`, approval
  follow-up, and `agent-handoff-proposed` receipt without changing
  customer-visible status or notification events.
- `transitionAgentHandoffRecords` records operator/system state changes for
  `approve`, `reject`, `dispatch`, `acknowledge`, `progress`, `block`,
  `complete`, `cancel`, and `rollback`.
- Each transition writes a receipt, appends `transportHistory`, mirrors
  receipt ids onto the handoff and work plan, and updates EPOCH MONITOR counts.
- Dispatch requires prior approval, acknowledgement requires dispatch, and
  progress/completion require acknowledgement or in-progress state.
- Customer-visible notification events are created only when `complete` is
  submitted with `customerVisibleApproved=true`; internal completion remains
  private by default.
- The Monitor controls include an ARA handoff transition console so the
  operator can apply these lifecycle states from the local UI before live
  cross-suite APIs exist.

## Out Of Scope For This Phase

The contract does not require live API integration yet. Out of scope for the
current phase:

- direct `SYMBIOSIS` or `ANVIL` API calls from EPOCH
- bidirectional sync guarantees
- autonomous agent mutation of customer-facing EPOCH records
- production auth, webhook trust, or signing rules
- durable `LIBRARY` persistence beyond the current browser-ledger stance
- automatic retry, replay, or dead-letter infrastructure
- public monitor exposure of raw handoff details

The immediate goal is a stable EPOCH-side record contract that can live inside
the local operating ledger first, then move to durable persistence and live
transport later without redefining the approval or receipt model.
