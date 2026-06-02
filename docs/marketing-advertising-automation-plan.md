# Marketing And Advertising Automation Plan

## Boundary correction

This plan is preserved prototype work for WORKSHOP. Campaign strategy, offer
copy, lead conversion, pricing posture, education/service bundles, and
advertising automation are WORKSHOP-owned. EPOCH may provide schedule-bound
route timing, booking windows, deadlines, reminders, and customer-safe
schedule/status events.

## Purpose

WORKSHOP marketing must convert outreach into tracked diagnostic, submission,
cohort, or scoped service work. The plan is intentionally route-first: every
ad, post, referral message, and partner placement maps to a campaign route,
source campaign id, conversion action, copy policy, and monitor KPI set before
any spend or outreach begins.

## Campaign Route Model

- `campaignRoutes`: public, admin, and monitor-ready campaign records.
- `marketingConversionEvents`: local conversion KPI records linked to campaign
  routes before any live ad pixel, external ad API, or analytics provider is
  selected.
- `routeKey`: stable route family and stage, such as
  `ja/offers/english-accelerator/intake` or
  `services/crm-database/workflow-audit`.
- `regionScope`: `jp`, `global`, or `dual`.
- `offerBundle`: education and adjacent-service lane, including
  `english-cohort`, `teacher-review`, `tech-support`, `crm-system`,
  `admin-system`, or `consulting`.
- `audienceTier`: `19plus`, `under19`, or `corporate`.
- `capacityMode`: whether the route feeds cohorts, submission queues,
  retainers, compatibility gates, or project estimates.
- `primaryConversion`: the next tracked action, such as
  `diagnostic_submit`, `portfolio_submit`, `consult_booking`, or
  `compatibility_request`.
- `publicRoute`, `adminRoute`, and `monitorRoute`: the surface where the route
  is visible.
- `monitorKpis`: route health, submission-to-enrollment, cohort fill, under-19
  compliance, premium add-on conversion, queue-to-delivery SLA, and copy-policy
  checks.

## Conversion KPI Readiness

WORKSHOP measures conversion readiness with first-party route attribution only.
EPOCH may receive only the schedule-bound route timing and status fields needed
for bookings, deadlines, reminders, and customer-safe schedule updates.
The local KPI layer should answer which route is ready for views, diagnostic
submissions, writing-sample submissions, consultation bookings, and guarded
under-19 compatibility requests.

Required seed coverage:

- Japan English offer view readiness.
- Japan diagnostic submit KPI.
- Teacher review submission KPI.
- Global support consultation KPI.
- Under-19 compatibility request KPI.

Every KPI record must keep `livePixelEnabled`, `externalAdApiWrite`,
`invasiveTracking`, `storesPersonalData`, `productionAnalyticsCredential`,
`webhookEnabled`, and `crossSiteIdentifier` false. The readiness checks must
include `no-live-pixel`, `no-external-ad-api-write`,
`first-party-ledger-only`, `no-invasive-tracking`, and
`no-analytics-credentials`.

Provider selection is deferred until the route, offer, legal/privacy posture,
and consent boundary are explicit.

## Route Families

- Japan English progress route: EIKEN 5-1, test writing, teacher-reviewed
  correction, cohorts, and submission-first monthly review.
- Japan teacher review pack: fast writing-sample submission, review timeline,
  and enrollment path for adult candidates.
- Global professional support route: technical support, documentation cleanup,
  admin support, and request-queue retainers.
- CRM and database workflow audit: scoped diagnostics for CRM cleanup,
  database planning, SOPs, and lightweight management-system builds.
- Under-19 compatibility gate: guardian-led assessment and no paid recurring
  plan before compatibility and consent are recorded.

## Copy Rules

- Do lead with outcomes: exam readiness, writing structure, teacher-reviewed
  correction, progress visibility, reliable scheduling, request tracking, and
  handoff-ready work.
- Do make the workflow visible: intake, diagnostic or submission, review,
  progress update, and next task.
- Do keep the recurring offer submission-first, cohort-scaled, or queue-based
  unless a live call clearly advances the outcome.
- Do not use founder-pricing language.
- Do not make Japan-facing public copy AI-forward.
- Do not position the default route as intensive 1:1 tutoring.

## Channel Plan

- Japan-wide: search landing pages, LINE OA, X, note articles, short-form
  video, community partner placements, referrals, and direct outreach to adult
  learners or institutions.
- Global: search, LinkedIn, partner newsletters, education communities, remote
  support communities, and proof-bundle follow-up sequences.
- Every channel must preserve its `routeKey`, `campaignId`, and
  `primaryConversion` through intake so WORKSHOP can measure source quality and
  avoid untracked open-ended calls.

## Under-19 Governance

- Under-19 routes must set `guardianConsentRequired` or the
  `guardian-consent-required` compliance flag.
- No paid action, recurring plan, or enrollment confirmation should occur
  before guardian consent and compatibility review are recorded.
- Under-19 copy must describe compatibility assessment and guardian-led intake,
  not direct enrollment.
- Higher-touch pricing remains a protected route, not a discount path.

## Adjacent Services

Campaign routes are not limited to English teaching. WORKSHOP should also route:

- technical support retainers
- CRM and database cleanup or build work
- admin and clerical operating-system support
- documentation and SOP cleanup
- consulting diagnostics and proposal work

These routes must start with a scoped diagnostic, source-file or access-boundary
check, and monitor-visible next action.

## Monitor Readiness

WORKSHOP MONITOR should report:

- total campaign routes
- ready campaign routes
- Japan, global, and dual-route counts
- public, admin, and monitor route coverage
- copy-policy violations
- under-19 guardian-gate coverage
- conversion KPI readiness
- no-live-tracking count
- potential JPY conversion value
- conversion-readiness violations
- channel count and offer-bundle count
- go-live windows in the calendar export

## Go-Live Checklist

- Each campaign route has public, admin, and monitor visibility.
- Each route has one primary conversion action.
- Each route has a channel, campaign id, owner, approver, and go-live time.
- Public copy avoids forbidden terms and contains required workflow language.
- Under-19 routes are guardian-gated before payment or enrollment.
- Conversion KPIs are linked to campaign routes and remain first-party,
  provider-neutral, and no-live-tracking.
- Campaign routes appear in the operating ledger, monitor report, and calendar
  export.
