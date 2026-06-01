# Notification Outbox Delivery Contract

## Purpose

EPOCH now treats customer-safe updates as delivery-ready operating records
without requiring live email, SMS, LINE, or other provider integration.

`notificationEvents` remain the customer-safe update log. `notificationDeliveries`
are the internal provider-neutral outbox records that track whether an update is
queued, dispatched, sent, failed, blocked, or ready to retry.

## Local-First Contract

- Only customer-safe notification events are queued by default.
- Internal monitor/admin notes stay out of the outbox unless an operator
  explicitly includes internal records.
- Every queued delivery creates a `notification-outbox-*` receipt.
- Every lifecycle transition creates a `notification-delivery-*` receipt and a
  `deliveryHistory` entry.
- Sent deliveries are terminal in this phase.
- Failed or blocked deliveries can move to `retry-ready` before another
  dispatch attempt.

## Current Lifecycle

- `queued`: visible update is ready for provider-neutral dispatch.
- `dispatched`: operator released the update to a future provider handoff.
- `sent`: provider-neutral delivery was marked complete.
- `failed`: delivery failed and needs review.
- `blocked`: delivery must not proceed until the blocker is resolved.
- `retry-ready`: a failed or blocked delivery has been reviewed and can be
  dispatched again.

## Out Of Scope

This phase does not send live messages, store provider credentials, retry
automatically, sign webhooks, or expose raw delivery internals publicly. It only
creates the EPOCH-side ledger contract that live delivery can later consume.
