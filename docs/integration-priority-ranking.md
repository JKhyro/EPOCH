# EPOCH Integration Priority Ranking

## Goal

Rank deferred EPOCH integrations after the first commercial operating surface
became real. Integration work should now extend the accepted EPOCH boundary
instead of reopening the v1 scope.

## Ranking Rule

Prioritize integrations that directly improve revenue operations, reduce manual
coordination, or protect schedule accuracy. Defer integrations that mainly add
suite polish, alternate shells, or deep storage before the operating contract is
stable.

## Ranked Lanes

### 1. EPOCH MONITOR Route And Menu Parity

EPOCH needs a first-class monitor surface that follows the HERMES MONITOR
capability pattern: visible route placement, queue health, timeline state,
risks, receipts, controls, and local access discipline.

- Classification: hard next step.
- Reason: the commercial operating surface now creates live operating records,
  so the control surface must be visible and monitor-grade.
- Consumes EPOCH data: operating ledger, monitor report, queue, risk, receipts,
  revenue summary.
- Produces EPOCH data: monitor receipts, operator actions, health snapshots.
- Keep out for now: public raw monitor exposure.

### 2. NEXUS Communication And External Notification Contract

External student/customer updates should become a contract before delivery
channels are automated. EPOCH should define notification events for accepted
engagements, onboarding, first submission plans, schedule changes, review
returns, overdue work, and follow-ups.

- Classification: hard revenue follow-on.
- Reason: accepted customers need clear request, submission, update, and
  tracking messages without Jack manually rewriting status every time.
- Consumes EPOCH data: customers, assignments, sessions, submissions, reviews,
  follow-ups, receipts.
- Produces EPOCH data: delivery receipts, notification status, customer-visible
  update records.
- Keep out for now: direct email/SMS/LINE sending until consent, templates, and
  delivery records exist.

### 3. TEMPO Time Primitive And Calendar Contract

EPOCH should align with TEMPO before external calendar sync grows. The first
contract should cover timezone-aware instants, local dates, due windows,
sessions, recurrence candidates, and export-ready schedule entries.

- Classification: hard accuracy follow-on.
- Reason: scheduling and deadlines are the product core, and weak time
  primitives will leak errors into every later integration.
- Consumes EPOCH data: sessions, assignment due times, follow-up times,
  review due times.
- Produces EPOCH data: normalized schedule entries, conflict candidates,
  export-ready calendar records.
- Keep out for now: full multi-calendar synchronization and complex invitation
  workflows.

Current EPOCH-side calendar provider slice:

- `calendarProviderHandoffs` records provider-neutral Google Calendar,
  Microsoft 365 Calendar, and customer-safe invitation-readiness handoffs.
- `summarizeCalendarProviderState` exposes provider readiness, invitation
  readiness, no-live-send posture, customer-safe preview state, and violations to
  EPOCH MONITOR.
- `transitionCalendarProviderHandoffRecords` creates internal monitor health
  checks and `calendar-provider-handoff` receipts without live provider writes
  or customer-visible notification events.

Current EPOCH-side notification provider slice:

- `notificationProviderHandoffs` records provider-neutral email, LINE/SMS, and
  template/consent readiness before any live delivery adapter exists.
- `summarizeNotificationProviderState` exposes provider readiness,
  customer-safe template readiness, consent readiness, no-live-send posture, and
  violations to EPOCH MONITOR.
- `transitionNotificationProviderHandoffRecords` creates internal monitor
  health checks and `notification-provider-handoff` receipts without live
  sends, credentials, webhooks, provider writes, or customer-visible notification
  events.

### 4. Payment Provider Readiness And Invoice Checkout Handoff

Payment readiness now needs the same no-live-provider staging discipline as
calendar and notification delivery. EPOCH should prepare invoice and checkout
handoff records before any processor, webhook, credential, or payment-capture
integration exists.

Current EPOCH-side payment provider slice:

- `paymentProviderHandoffs` records provider-neutral invoice, checkout, and
  guardian/eligibility readiness before any live payment adapter exists.
- `summarizePaymentProviderState` exposes invoice readiness, checkout readiness,
  payment eligibility gates, no-live-payment posture, and violations to EPOCH
  MONITOR.
- `transitionPaymentProviderHandoffRecords` creates internal monitor health
  checks and `payment-provider-handoff` receipts without live checkout,
  credentials, webhooks, provider writes, capture, or customer-visible payment
  events.

### 5. Production Auth And Session Role Readiness

Production auth/session boundaries must be explicit before live adapters or
public/customer account behavior advance. EPOCH should prepare role and surface
readiness records before identity-provider selection, OAuth setup, token
storage, credential storage, or external sessions exist.

Current EPOCH-side auth/session slice:

- `authSessionRoleHandoffs` records provider-neutral public intake, customer
  status, admin, and monitor role boundaries before any live identity provider
  exists.
- `summarizeAuthSessionRoleState` exposes public-ready, customer-ready,
  internal-denied, no-live-auth, and violation counts to EPOCH MONITOR.
- `transitionAuthSessionRoleHandoffRecords` creates internal monitor health
  checks and `auth-session-role-handoff` receipts without production auth,
  OAuth clients, credentials, tokens, external sessions, identity-provider
  writes, or customer-visible notification events.

### 6. Marketing Conversion Analytics Readiness

Marketing conversion analytics should stay local and provider-neutral until
campaign routes, privacy posture, and consent boundaries are explicit. EPOCH
should prove KPI records before any ad pixel, analytics credential, external ad
API write, webhook, or cross-site identifier exists.

Current EPOCH-side marketing conversion slice:

- `marketingConversionEvents` records route-attributed KPI events for Japan,
  global, submission-first, service-support, and under-19 guarded routes.
- `summarizeMarketingConversionState` exposes ready KPIs, recorded events,
  no-live-tracking posture, potential JPY value, and violations to EPOCH
  MONITOR.
- `transitionMarketingConversionEventRecords` creates internal monitor health
  checks and `marketing-conversion` receipts without live pixels, external ad
  API writes, invasive tracking, analytics credentials, webhooks, personal-data
  storage, cross-site identifiers, or customer-visible notification events.

Current EPOCH-side provider adapter selection slice:

- `providerAdapterCandidates` records sandbox-only candidate adapters for
  calendar, notification, payment, auth/session, analytics/advertising, and
  durable persistence.
- `summarizeProviderAdapterSelectionState` exposes ready candidates,
  approved-sandbox-only, high-risk, legal/privacy/consent review, no-live,
  no-secrets, and violation counts to EPOCH MONITOR.
- `transitionProviderAdapterCandidateRecords` creates internal monitor health
  checks and `provider-adapter-selection` receipts without live API calls,
  secrets, OAuth clients, webhooks, provider writes, production behavior, or
  customer-visible notification events.

Current EPOCH-side sandbox calendar adapter prototype slice:

- `calendarAdapterPrototypes` records local payload-preview prototypes linked
  to calendar provider adapter candidates and the EPOCH calendar export.
- `summarizeCalendarAdapterPrototypeState` exposes payload-ready, sandbox-only,
  local-only, no-live-provider, no-secrets, no-invitation-send, and violation
  counts to EPOCH MONITOR.
- `transitionCalendarAdapterPrototypeRecords` creates internal monitor health
  checks and `calendar-adapter-prototype` receipts without live calendar API
  calls, OAuth clients, secrets, webhooks, provider writes, invitations, or
  customer-visible notification events.

Current EPOCH-side customer account history slice:

- `customerAccountHistories` records controlled customer-safe timelines across
  status, submissions, cohorts, service records, receipts, and update events.
- `summarizeCustomerAccountHistoryState` exposes history coverage, timeline
  events, receipt linkage, local-only posture, and violation counts to EPOCH
  MONITOR.
- `createCustomerAccountHistoryRecords` refreshes a customer's account-history
  snapshot and creates a `customer-account-history` receipt without live
  provider writes, external sends, or production account integration.

### 7. LIBRARY Durable Operating Ledger Persistence

The local JSON ledger proves the shape, but durable persistence should move to
LIBRARY once the first notification and calendar contracts are stable.

- Classification: required before serious scale.
- Reason: local storage is enough for a demo and early operator use, but not for
  reliable student history, search, analytics, backups, or multi-device use.
- Consumes EPOCH data: full operating ledger, monitor snapshots, receipts.
- Produces EPOCH data: durable ids, history, search results, recovery exports.
- Keep out for now: deep vector retrieval or analytics before plain durable
  records and backup/recovery exist.

Current EPOCH-side slice:

- `librarySyncHandoffs` records the internal-only EPOCH-to-LIBRARY snapshot
  handoff and the LIBRARY-to-EPOCH recovery import handoff.
- `summarizeLibrarySyncState` exposes sync readiness, recovery readiness,
  search readiness, backup readiness, and violations to EPOCH MONITOR.
- `transitionLibrarySyncHandoffRecords` creates internal monitor health checks
  and `library-sync-handoff` receipts without creating customer-visible updates.
- Live LIBRARY API/database mutation remains out of scope until this handoff
  contract is stable and verified.

### 8. SYMBIOSIS And ANVIL Agentic Work Handoff

After EPOCH can notify people and preserve records, the ARA revenue loop should
use EPOCH to schedule and track agent-created work. SYMBIOSIS can expose
agent-facing scheduling hooks; ANVIL can receive accepted engagements and turn
them into work plans.

- Classification: ARA revenue accelerator.
- Reason: this is the path toward minimal-input revenue operations, but it
  needs the EPOCH operating contract to be stable first.
- Consumes EPOCH data: accepted engagements, assignments, sessions, follow-ups,
  receipts, monitor risks.
- Produces EPOCH data: proposed work plans, task handoff records, agent action
  receipts, next-action updates.
- Keep out for now: agents mutating customer-facing records without approval,
  audit receipts, and rollback rules.

### 9. SYNAPSE Shell Placement And Suite Navigation

SYNAPSE should embed or link to EPOCH once the monitor and core operating flows
are durable enough to present as a suite surface.

- Classification: optional shell follow-on.
- Reason: navigation matters, but shell placement should not outrank revenue
  communication, schedule accuracy, persistence, or ARA work handoff.
- Consumes EPOCH data: route metadata, health summary, current queue counts.
- Produces EPOCH data: navigation context only.
- Keep out for now: duplicating EPOCH UI logic inside SYNAPSE.

## Data Movement Rules

- EPOCH owns schedule-bound operating records and monitor-ready health state.
- Other systems may consume EPOCH summaries before they can mutate EPOCH
  records.
- Mutations from outside EPOCH must create receipts.
- Customer-visible changes must preserve a delivery/update record.
- Monitor routes must stay local or access-controlled until public exposure is
  explicitly hardened.

## Next Implementation Order

1. Build the EPOCH MONITOR route/menu parity slice.
2. Add an external notification event contract and customer-visible update log.
3. Define TEMPO-aligned time primitives and export-ready schedule entries.
4. Add provider-neutral production auth/session role readiness before live
   adapters.
5. Add local marketing conversion KPI readiness before live ad or analytics
   adapters.
6. Add provider adapter go/no-go readiness before selecting a live adapter
   prototype.
7. Move the operating ledger from browser-local JSON into durable LIBRARY
   persistence.
8. Add SYMBIOSIS/ANVIL handoff records for agent-created revenue work.
9. Add SYNAPSE route placement after the operational contracts are stable.

## Acceptance For Issue 2

Issue 2 is complete when this ranking is committed, linked from the README, and
written back to GitHub with the next implementation target selected.
