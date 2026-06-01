# Sandbox Auth Provider Prototype Contract

## Purpose

EPOCH can now prove the auth/session adapter boundary locally before any live
identity provider, production login, OAuth client, token storage, or external
session gateway is allowed. The prototype converts existing auth/session role
readiness records into provider-neutral access payload previews for operator
review.

## Record Model

`authProviderPrototypes` are internal operating records with:

- `providerCandidateId` linked to the `auth-session` provider adapter candidate.
- `sourceHandoffIds` linked to public intake, customer status, raw admin, and
  raw monitor auth/session role handoffs.
- `sandboxOnly: true` and `localOnly: true`.
- `productionAuthEnabled: false`, `liveLoginEnabled: false`,
  `identityProviderWrite: false`, and `externalSessionEnabled: false`.
- `oauthClientConfigured: false`, `secretsPresent: false`,
  `credentialsStored: false`, `storesTokens: false`,
  `tokenStorageEnabled: false`, and `refreshTokenStorageEnabled: false`.
- `customerVisible: false`, `rawAdminExposure: false`, and
  `rawMonitorExposure: false`.
- `payloadPreview` entries for controlled public intake, controlled customer
  status, raw admin denial, and raw monitor denial.

## Monitor Controls

EPOCH MONITOR exposes `Sandbox Auth Provider` under `monitor-auth-prototype`.
The action console can generate a local preview, approve the sandbox proof, mark
operator review complete, defer, or block. Every action creates an internal
`auth-provider-prototype` receipt and `auth-provider-sandbox-proof` health
check.

`transitionAuthProviderPrototypeRecords` owns these sandbox action transitions
and must reassert every disabled live-auth safeguard on each state change.

The action must not create notification events, customer-visible auth behavior,
live sessions, OAuth clients, credentials, tokens, refresh-token storage,
webhooks, or provider writes.

## Out Of Scope

- Production login.
- OAuth or SSO setup.
- Password, credential, token, or refresh-token storage.
- Magic links or invitation emails.
- Session cookies or external session gateways.
- Identity-provider writes.
- Raw admin or monitor exposure outside the local/internal surface.

## Acceptance

- `authProviderPrototypes` is present in the operating ledger.
- MONITOR summary, route status, timeline, risk, receipt, and health-check
  surfaces include the sandbox auth provider state.
- Export/import preserves auth provider prototypes and no-live-auth safeguards.
- The verifier proves disabled live-auth posture, raw admin/monitor denial, and
  no customer-visible auth effects.
