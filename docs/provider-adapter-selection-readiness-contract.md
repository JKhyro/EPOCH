# Provider Adapter Selection Readiness Contract

## Purpose

EPOCH needs a go/no-go control surface before any live provider adapter exists.
This contract records candidate adapters, sandbox-only readiness, legal/privacy
review state, credential and webhook prohibitions, and monitor-visible blockers
without connecting to live systems.

This is an EPOCH-local readiness layer. It does not create live API calls,
OAuth clients, secrets, webhooks, provider writes, payment capture,
notification sends, calendar sync, auth/session behavior, analytics pixels, or
advertising API writes.

## Ledger Records

`providerAdapterCandidates` records define the provider selection queue.

Required fields:

- `providerFamily`: `calendar`, `notification`, `payment`, `auth-session`,
  `analytics-advertising`, or `durable-persistence`.
- `targetProvider`: the provider or provider family under consideration.
- `sourceHandoffIds`: related EPOCH handoff or KPI records.
- `adapterMode`, `status`, `readinessStatus`, and `goNoGoState`.
- `riskLevel`, `legalReviewRequired`, `privacyReviewRequired`, and
  `consentBoundaryRequired`.
- `readinessChecks`, `goCriteria`, `blockers`, and `receiptIds`.

Every record must keep:

- `sandboxOnly: true`
- `liveApiCalls: false`
- `productionEnabled: false`
- `secretsPresent: false`
- `credentialsStored: false`
- `oauthConfigured: false`
- `webhookEnabled: false`
- `externalProviderWrite: false`
- `customerVisible: false`

Every record must include these readiness tokens:

- `provider-candidate-recorded`
- `sandbox-only-before-go-live`
- `operator-approval-required`
- `credential-plan-required`
- `no-live-api`
- `no-secrets`
- `no-oauth-client`
- `no-webhooks`
- `no-provider-writes`

Family-specific checks:

- Calendar: `no-live-sync`
- Notification: `no-live-send`
- Payment: `no-payment-capture`
- Auth/session: `no-live-auth`, `raw-monitor-denied-public`,
  `raw-admin-denied-public`
- Analytics/advertising: `no-live-pixel`, `no-external-ad-api-write`,
  `no-invasive-tracking`
- Durable persistence: `backup-plan-required`, `recovery-plan-required`

## Monitor Requirements

EPOCH MONITOR must expose a `Provider Adapter Go/No-Go` section with:

- total candidates
- ready candidates
- sandbox-only count
- approved-sandbox-only count
- high-risk candidates
- legal/privacy/consent review counts
- no-live-provider count
- no-secrets count
- readiness violations
- a health-check target of `monitor-provider-adapters`
- `provider-adapter-selection` receipts

Any record that enables live APIs, production behavior, provider writes,
secrets, credentials, OAuth clients, webhooks, or customer-visible readiness
must become a high-risk monitor violation.

## Allowed Actions

The local action surface may:

- verify readiness
- mark a candidate ready for sandbox review
- approve sandbox-only evaluation
- defer a candidate
- block a candidate

All actions must preserve no-live-provider safeguards and create internal
receipts only. They must not create customer-visible notification events.

## Deferrals

This slice explicitly defers:

- production credentials
- OAuth setup
- webhook endpoints
- live calendar writes
- live notification sends
- payment capture
- production authentication/session handling
- analytics pixels
- external advertising API conversion writes
- live LIBRARY/Postgres mutation
