# Controlled Public And Customer Access Gateway

## Purpose

This contract defines the EPOCH-owned access gateway that lets public intake and
customer-safe status routes move toward production use without exposing raw
admin or EPOCH MONITOR state.

The gateway is a local-first operating contract in this slice. It does not add
production authentication, live hosting, external notification delivery, or
payment processing.

## Gateway Records

EPOCH stores gateway policy in `accessGateways`.

Current gateway records:

- `gateway-public-intake`: `#public`, controlled public intake only.
- `gateway-customer-status`: `#student`, controlled customer-safe status only.
- `gateway-raw-admin`: `#admin`, denied from public exposure.
- `gateway-raw-monitor`: `#monitor`, denied from public exposure.

Each record defines:

- `surface`
- `href`
- `visibility`
- `publicExposure`
- `policy`
- `verificationStatus`
- `customerSafe`
- `rawSurface`
- `operatorApprovalRequired`

## Access Rules

- Public traffic may reach offer copy, package comparison, and request intake.
- Customer traffic may reach only customer-safe status, submitted work,
  returned feedback, next action, and operator-approved update records.
- Raw admin controls remain local-only.
- Raw EPOCH MONITOR remains local-only.
- Any public hostname, gateway, campaign route, or SYNAPSE placement that
  exposes raw admin or monitor state is a security regression.

## Monitor Behavior

EPOCH MONITOR must expose:

- `summarizeAccessGatewayState()`
- gateway count
- controlled public gateway count
- controlled customer gateway count
- denied raw gateway count
- gateway violations
- internal receipts for gateway verification or blocking actions

Gateway actions create `access-gateway` receipts and internal
`monitorHealthChecks`; they must not create customer-visible notification
events.

## Verification

The verifier must prove:

- `accessGateways` is present in the operating ledger.
- Public intake is `controlled-public`.
- Customer status is `controlled-customer`.
- Raw admin and raw monitor are `denied`.
- `summarizeAccessGatewayState()` reports `ready` for the seed data.
- A deliberately bad monitor gateway is reported as a violation.
- `transitionAccessGatewayRecords()` creates internal receipts and no customer
  notification events.
- Export/import preserves gateway records.
