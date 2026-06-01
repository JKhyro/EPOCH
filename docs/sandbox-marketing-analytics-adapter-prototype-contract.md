# Sandbox Marketing Analytics Adapter Prototype Contract

## Purpose

EPOCH needs to prove campaign conversion payload readiness before any live
analytics, advertising, pixel, webhook, or conversion API integration is
allowed. This prototype is a local-only adapter proof for Japan-wide, global,
adjacent-service, teacher-review, and under-19 compatibility campaign routes.

## Ledger Records

`marketingAnalyticsAdapterPrototypes` records are internal operating records
with:

- `providerCandidateId` linked to an `analytics-advertising` provider adapter
  candidate.
- `sourceEventIds` linked to `marketingConversionEvents`.
- local `payloadPreview` entries generated from route-attributed KPI records.
- `prototypeStatus`, `adapterMode`, `payloadMode`, blockers, and receipt IDs.

Every record must remain:

- `sandboxOnly: true`
- `localOnly: true`
- `livePixelEnabled: false`
- `externalAdApiWrite: false`
- `liveApiCalls: false`
- `externalProviderWrite: false`
- `productionEnabled: false`
- `invasiveTracking: false`
- `storesPersonalData: false`
- `productionAnalyticsCredential: false`
- `secretsPresent: false`
- `credentialsStored: false`
- `oauthConfigured: false`
- `webhookEnabled: false`
- `crossSiteIdentifier: false`
- `thirdPartyCookieEnabled: false`
- `fingerprintingEnabled: false`
- `crossDeviceIdentityEnabled: false`
- `customerVisible: false`
- `publicProofSurface: false`

The prototype must preserve legal, privacy, and consent review requirements.
Under-19 compatibility payloads must remain guardian-consent gated and
`no-paid-action-before-consent`.

## Monitor Requirements

EPOCH MONITOR exposes `Sandbox Marketing Analytics Adapter` under
`monitor-marketing-analytics-prototype`.

The monitor summary must show:

- prototype count
- payload-ready count
- sandbox/local count
- no-live-tracking count
- no-credential count
- no-personal-data count
- no-customer-visible-analytics count
- privacy/consent-ready count
- under-19 consent-gated count
- readiness violations

Every create or transition action creates an internal monitor health check and
a `marketing-analytics-adapter-prototype` receipt. No action may create
customer-visible notification events or public analytics proof surfaces.
The action helper is `transitionMarketingAnalyticsAdapterPrototypeRecords`.

## Allowed Actions

The internal action surface may:

- generate a local preview
- approve sandbox proof
- mark operator reviewed
- defer the prototype
- block the prototype

All actions must reassert the no-live-tracking, no-provider-write,
no-credential, no-personal-data, no-cross-site-ID, and under-19 consent
boundaries.

## Verification

- `marketingAnalyticsAdapterPrototypes` is present in the operating ledger.
- Seed data includes one sandbox analytics prototype linked to conversion KPIs
  and the analytics-advertising provider adapter candidate.
- Export/import preserves prototype records and no-live safeguards.
- Malformed records that enable live pixels, ad writes, credentials, webhooks,
  invasive tracking, personal-data storage, cross-site identifiers, cookies,
  fingerprinting, cross-device identity, customer-visible analytics, or
  under-19 paid action before consent become monitor risks.
