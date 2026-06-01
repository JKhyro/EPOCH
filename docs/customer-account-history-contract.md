# Customer Account History Contract

## Purpose

EPOCH keeps durable customer/student account history as a first-class local ledger collection so status, submissions, cohorts, service records, receipts, and customer-safe updates do not remain scattered across separate operating records.

## Ledger Collection

- `customerAccountHistories`
- Schema marker: `epoch.customer-account-history`
- Monitor section: `Customer Account History`
- Monitor anchor: `monitor-account-history`
- Helper functions:
  - `summarizeCustomerAccountHistoryState`
  - `createCustomerAccountHistoryRecords`

## Required Guardrails

- `visibility: controlled-customer`
- `customerSafe: true`
- `operatorVisible: true`
- `localOnly: true`
- `liveProviderWrite: false`
- `externalNotification: false`
- `productionEnabled: false`
- guardrails include `controlled-customer-status-only`

## History Inputs

Account history may summarize:

- customer status records
- assignments and service requests
- cohorts and sessions
- submissions and reviews
- customer-safe update events
- notification delivery handoff records
- quotes and payment-readiness records
- ARA work plans and handoffs after operator approval
- receipts

## Boundary

This slice does not send notifications, write provider calendars, create payment/auth sessions, expose raw monitor/admin state, or store secrets. It is a local account-history hardening layer for operator review and controlled customer-safe status only.
