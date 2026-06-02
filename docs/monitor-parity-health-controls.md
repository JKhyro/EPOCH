# EPOCH MONITOR Health Controls

## Purpose

This document defines the current EPOCH MONITOR parity slice against the
HERMES-style monitor capability model. The goal is to clone the HERMES monitor
structure for EPOCH calendar/scheduling data without copying HERMES project
data or WORKSHOP revenue-bench scope.

## Required monitor sections

EPOCH MONITOR must expose these local operator sections and routes:

- Summary
- Scope
- Memory
- Queue
- Timeline
- Risks
- Receipts
- Safe Access
- LIBRARY Sync
- Calendar Providers
- Notification Providers
- Sandbox Payment Provider
- Marketing Conversion KPIs
- Provider Adapter Go/No-Go
- Customer Account History
- Controls

Required HERMES-structure routes:

- `/epoch-monitor.html`
- `/epoch-dashboard.html`
- `/epoch-completion.html`
- `/epoch-scorecard.html`
- `/epoch-timeline.html`
- `/epoch-schedule-audit.html`
- `/epoch-receipts.html`
- `/epoch-scheduler-log.html`
- `/epoch-search.html`
- `/epoch-template.html`
- EPOCH persona and team child routes matching the HERMES route pattern

Compatibility aliases may continue to answer `/epoch-work-audit.html` and
`/epoch-runner-log.html`, but the left-side tree and focused page titles should
use EPOCH-specific schedule/calendar language. The route structure is cloned;
the product meaning is not.

The public route may reuse the visual language, but it must not expose raw
monitor/admin state. Public pages remain intake and commercially safe status
surfaces only.

## Data rule

EPOCH MONITOR data must be EPOCH-specific or empty/build-ready. HERMES queue,
Discord, runner, receipt, and project records must not be copied into EPOCH.

WORKSHOP has its own monitor at `/workshop-monitor.html` and owns the revenue
bench. EPOCH may show schedule-bound integration health, but not WORKSHOP's
service catalog or revenue operations as EPOCH core scope.

## Ledger-backed health controls

Monitor operator actions must create durable operating-ledger records, not only
browser UI state.

Current health-action records are stored in `monitorHealthChecks` and mirrored
into internal `monitor-check` receipts. They are internal by default and must
not create customer-visible notification events.

The current action classes are:

- Dirty local ledger export prompt.
- Awaiting-review return prompt.
- Stale monitor memory refresh prompt.
- Local-only safe-access acknowledgement.
- LIBRARY ledger sync/recovery handoff review.
- Calendar provider handoff and invitation-readiness review.
- Notification provider handoff, template readiness, and consent-readiness
  review.
- Sandbox payment provider prototype review for local payment payload previews
  before live checkout, capture, refunds, invoice sending, credentials,
  webhooks, provider writes, or customer-visible payment requests.
- Marketing conversion KPI readiness for route-attributed, first-party,
  no-live-tracking campaign measurement.
- Provider adapter go/no-go readiness for sandbox-only candidate selection
  before live API calls, secrets, OAuth, webhooks, provider writes, or
  production behavior.

## Safe access posture

The current static slice is local-first:

- Raw monitor: `local-only`.
- Raw admin: `local-only`.
- Public intake: `#public`.
- Customer status: `#student`, customer-safe only.
- Controlled gateway: `accessGateways`.
- Public policy: `deny-by-default` outside the explicit controlled public and
  controlled customer gateway records.

`accessGateways` is the current EPOCH-owned gateway contract:

- `gateway-public-intake` allows controlled public offer/intake access only.
- `gateway-customer-status` allows controlled customer-safe status only.
- `gateway-raw-admin` denies public raw admin exposure.
- `gateway-raw-monitor` denies public raw monitor exposure.

Any future public hostname, gateway, route placement, or campaign automation
change that exposes raw monitor/admin state is a security regression unless it
ships with explicit access control and verification evidence.

## Verification

The repository verifier must cover:

- Scope, Memory, and Safe Access route anchors.
- Monitor health summaries for dirty local state, awaiting review, stale memory,
  safe access, and operator actions.
- Schedule lifecycle summaries for rescheduled and canceled entries after a
  session has already been created.
- `createMonitorActionRecords`.
- `rescheduleScheduleRecords` and `cancelScheduleRecords`, including
  customer-safe update events, internal receipts, follow-ups, calendar export,
  and monitor summary counts.
- Internal monitor health checks and `monitor-check` receipts.
- No customer-visible notification events created by monitor actions.
- Operating-ledger export/import preservation of `monitorHealthChecks`.
- ARA handoff lifecycle controls and verifier coverage for approval, dispatch,
  acknowledgement, in-progress, completed, terminal-lock, receipt trail,
  transport history, and the customer-visible completion approval boundary.
- Notification outbox controls and verifier coverage for queued, dispatched,
  sent, failed, blocked, retry-ready, receipt-backed delivery handoff records
  that preserve customer-safe visibility boundaries.
- Quote and payment-readiness controls and verifier coverage for draft,
  presented, approved, payment-ready, payment-blocked, paid-recorded, declined,
  under-19 consent gates, receipts, and customer-safe quote status.
- Reminder, recurrence-candidate, and availability-window controls and verifier
  coverage for local reminder rules, operator-approved recurrence candidates,
  provider availability, receipts, calendar export entries, and customer-safe
  visibility boundaries.
- Controlled public/customer access gateway controls and verifier coverage for
  `accessGateways`, public/customer route exposure, raw admin/monitor denial,
  internal receipts, and no customer-visible notifications from gateway actions.
- LIBRARY sync/recovery controls and verifier coverage for
  `librarySyncHandoffs`, internal-only EPOCH-to-LIBRARY snapshot handoff,
  recovery import posture, internal receipts, export/import preservation, and no
  customer-visible notifications from sync actions.
- Calendar provider handoff controls and verifier coverage for
  `calendarProviderHandoffs`, provider-neutral Google/Microsoft readiness,
  customer-safe invitation preview state, no-live-send enforcement, internal
  receipts, export/import preservation, and no customer-visible notifications
  from provider actions.
- Notification provider handoff controls and verifier coverage for
  `notificationProviderHandoffs`, provider-neutral email and LINE/SMS
  readiness, customer-safe template readiness, consent policy readiness,
  no-live-send enforcement, no credentials or webhooks, internal receipts,
  export/import preservation, and no customer-visible notifications from
  provider actions.
- Payment provider handoff controls and verifier coverage for
  `paymentProviderHandoffs`, provider-neutral invoice and checkout readiness,
  under-19/guardian eligibility gates, no-live-payment enforcement, no
  credentials, no webhooks, no capture, internal receipts, export/import
  preservation, and no customer-visible payment events from provider actions.
- Auth/session role readiness controls and verifier coverage for
  `authSessionRoleHandoffs`, provider-neutral public, customer, admin, and
  monitor role boundaries, no-live-auth enforcement, no OAuth client, no
  identity-provider write, no credentials, no token storage, internal receipts,
  export/import preservation, raw admin/monitor denial, and no customer-visible
  notification events from auth actions.
- Marketing conversion analytics readiness controls and verifier coverage for
  `marketingConversionEvents`, Japan/global/submission/under-19 KPI records,
  first-party route attribution, no-live-pixel, no external ad API writes, no
  invasive tracking, no analytics credentials, no webhooks, internal
  `marketing-conversion` receipts, export/import preservation, monitor summary
  counts, and the `monitor-marketing-conversions` section.
- Provider adapter selection controls and verifier coverage for
  `providerAdapterCandidates`, sandbox-only calendar, notification, payment,
  auth/session, analytics/advertising, and durable-persistence candidates,
  no-live-api/no-secrets/no-OAuth/no-webhook/no-provider-write enforcement,
  internal `provider-adapter-selection` receipts, export/import preservation,
  monitor summary counts, and the `monitor-provider-adapters` section.
- Sandbox marketing analytics adapter prototype controls and verifier coverage
  for `marketingAnalyticsAdapterPrototypes`, local provider-neutral conversion
  payload previews, marketing KPI and analytics/advertising provider-adapter
  linkage, no-live-pixel/no-external-ad-write/no-credential/no-webhook/
  no-provider-write/no-invasive-tracking/no-personal-data/no-cross-site-ID
  enforcement, under-19 consent gating, internal
  `marketing-analytics-adapter-prototype` receipts, export/import
  preservation, monitor summary counts, and the
  `monitor-marketing-analytics-prototype` section.
- Sandbox calendar adapter prototype controls and verifier coverage for
  `calendarAdapterPrototypes`, local calendar payload previews,
  provider-go/no-go linkage, no-live-api/no-secrets/no-OAuth/no-webhook,
  no-provider-write/no-live-sync/no-invitation-send enforcement, internal
  `calendar-adapter-prototype` receipts, export/import preservation, monitor
  summary counts, and the `monitor-calendar-adapter` section.
- Sandbox notification provider prototype controls and verifier coverage for
  `notificationProviderPrototypes`, local message payload previews, notification
  provider handoff/template-consent linkage, no-live-send/no-secrets/no-OAuth/
  no-webhook/no-provider-write/no-customer-visible-send enforcement, internal
  `notification-provider-prototype` receipts, export/import preservation,
  monitor summary counts, and the `monitor-notification-prototype` section.
- Sandbox payment provider prototype controls and verifier coverage for
  `paymentProviderPrototypes`, local payment payload previews, payment provider
  handoff and provider-adapter linkage, legal/tax/privacy review posture,
  under-19 eligibility gating, no-live-payment/no-secrets/no-OAuth/no-webhook/
  no-provider-write/no-checkout-session/no-payment-capture/no-refund/
  no-invoice-send/no-customer-visible-payment enforcement, internal
  `payment-provider-prototype` receipts, export/import preservation, monitor
  summary counts, and the `monitor-payment-prototype` section.
- Customer account history controls and verifier coverage for
  `customerAccountHistories`, controlled-customer status timelines,
  submission/cohort/service/receipt linkage, local-only enforcement, no live
  provider writes, no customer sends, export/import preservation, monitor
  summary counts, and the `monitor-account-history` section.
