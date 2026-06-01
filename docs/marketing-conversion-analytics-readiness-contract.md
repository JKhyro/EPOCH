# Marketing Conversion Analytics Readiness Contract

## Purpose

EPOCH needs conversion analytics before live advertising spend, but the first
slice must stay local-first and provider-neutral. The goal is to help the
operator see which routes produce diagnostics, submissions, compatibility
requests, consultation bookings, and premium service opportunities without
installing live pixels, writing to ad APIs, storing analytics credentials, or
tracking people invasively.

This follows the SCAFFOLD/HERMES direction for EPOCH: professional control
surfaces, monitor-visible operating state, customer-safe public intake, and
internal administration that supports scalable submissions, cohorts, and
service workflows.

## Ledger Records

`marketingConversionEvents` records define the local KPI layer for campaign
routes.

Required fields:

- `campaignRouteId`, `campaignId`, and `routeKey` for route attribution.
- `regionScope`, `sourceChannel`, `offerBundle`, and `audienceTier` for
  Japan-wide, global, adjacent-service, and under-19 routing.
- `eventType`, `conversionStage`, `primaryConversion`, `status`, and
  `readinessStatus` for KPI lifecycle state.
- `conversionValueJpy` for pipeline value estimates without payment capture.
- `readinessChecks` and `monitorKpis` for EPOCH MONITOR visibility.
- `receiptIds` for audit evidence.

Every record must remain:

- `localOnly: true`
- `customerVisible: false`
- `customerSafe: true`
- `livePixelEnabled: false`
- `externalAdApiWrite: false`
- `invasiveTracking: false`
- `storesPersonalData: false`
- `productionAnalyticsCredential: false`
- `webhookEnabled: false`
- `crossSiteIdentifier: false`
- `analyticsProvider: "provider-neutral ledger"`
- `attributionPolicy: "first-party-route-key-only"`

Every record must also preserve these readiness tokens:

- `no-live-pixel`
- `no-external-ad-api-write`
- `first-party-ledger-only`
- `no-invasive-tracking`
- `no-analytics-credentials`

## Seed KPI Coverage

The seed ledger must include at least these KPI records:

- Japan English offer view readiness.
- Japan diagnostic submit KPI.
- Teacher review submission KPI.
- Global support consultation KPI.
- Under-19 compatibility request KPI.

The under-19 KPI must include `guardian-consent-required` and
`no-paid-action-before-consent`. It measures compatibility-route readiness only;
payment, enrollment, and direct contracting stay blocked until the separate
guardian/compatibility path permits them.

## Monitor Requirements

EPOCH MONITOR must expose:

- a `Marketing Conversion KPIs` section
- ready KPI count
- recorded/converted event count
- no-live-tracking count
- potential JPY value
- readiness violations
- a monitor health check target of `monitor-marketing-conversions`
- `marketing-conversion` receipts

Violations must be high-risk if a record enables live pixels, ad API writes,
analytics credentials, webhooks, invasive tracking, personal-data storage, or
cross-site identifiers.

## Public And Marketing Copy Rules

Japan-facing public copy should sell outcomes and workflow, not AI. Acceptable
phrasing includes teacher-reviewed correction, structured feedback, progress
tracking, diagnostic submission, review workflow, and professional support.

Do not use conversion analytics as public-facing proof. Keep the raw KPI
records inside the operator control room. Public pages can describe the offer
and intake path; they should not expose EPOCH MONITOR state.

## Deferrals

This slice does not choose or configure:

- Google Analytics
- Meta Pixel
- Google Ads conversion writes
- LINE Ads conversion APIs
- webhook delivery
- cross-device identity
- third-party cookie or fingerprinting behavior

Provider selection is a later adapter decision after legal, privacy, consent,
and platform-policy boundaries are explicit.
