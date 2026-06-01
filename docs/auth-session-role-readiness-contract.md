# Auth Session Role Readiness Contract

EPOCH now records production auth and session role readiness before any live
identity provider, OAuth client, production login, token store, credential
store, or external session gateway is enabled.

This slice is provider-neutral. It prepares access boundaries for public,
customer, admin, monitor, and operator surfaces without choosing or contacting
an auth provider.

## Ledger Records

`authSessionRoleHandoffs` are internal EPOCH operating records with:

- role key and surface such as public intake, customer status, admin, or
  monitor.
- session mode and access policy.
- visibility and public exposure.
- customer-safe flags for customer-facing status only.
- raw-surface denial for admin and monitor boundaries.
- explicit no-live-auth flags:
  - `productionAuthEnabled: false`
  - `identityProviderWrite: false`
  - `storesCredentials: false`
  - `storesTokens: false`
  - `oauthClientConfigured: false`
  - `externalSessionEnabled: false`
- readiness checks proving route boundaries and no-live-auth.
- receipt and handoff history fields.

Seed records cover:

- `auth-public-intake-readiness`: controlled public intake only.
- `auth-customer-status-readiness`: controlled customer-safe status only.
- `auth-admin-operator-readiness`: internal admin denied to public/customer
  traffic.
- `auth-monitor-denial-readiness`: raw monitor denied to public/customer
  traffic.

## Operator Actions

The monitor form can verify, prepare, mark boundary-ready, mark public intake
ready, mark customer status ready, deny raw admin/monitor, or block an
auth/session role handoff.

Every transition creates:

- an internal `auth-session-role-handoff` receipt.
- a `monitorHealthChecks` record targeting `monitor-auth-session`.
- a preserved no-live-auth posture.

Transitions must not create customer-visible notification events, OAuth
clients, token storage, credential storage, external sessions, or identity
provider writes.

## Monitor Surface

EPOCH MONITOR exposes `Auth Session Role Handoffs` with:

- public-ready count.
- customer-ready count.
- internal-denied count.
- no-live-auth count.
- violation reporting.

Violations become monitor risks when:

- public intake is not controlled-public.
- customer status is not controlled-customer and customer-safe.
- admin or monitor are not internal and denied.
- live auth, OAuth clients, identity-provider writes, credentials, tokens, or
  external sessions are enabled.

## Out Of Scope

This contract does not implement production login, OAuth, SSO, magic links,
password storage, user provisioning, session cookies, token refresh, RBAC
middleware, invitation emails, or external identity-provider calls.

Those belong to a later adapter slice after auth provider selection, public
hostname policy, legal/privacy review, and route-level access controls are
explicitly accepted.
