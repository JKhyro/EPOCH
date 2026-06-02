# EPOCH

EPOCH is the calendar, scheduling, and time-operations product for the broader
KHYRON, SYMBIOSIS, and CITADEL suite.

## Product Boundary

EPOCH owns:

- Gregorian calendar and revised 13-month calendar contracts
- availability windows
- schedule requests
- reminders and recurrence candidates
- customer-safe schedule status
- submission/review deadlines when another product needs timing state
- EPOCH MONITOR operational health, receipts, timeline, and control status

EPOCH does not own service packages, pricing, revenue operations, offer funnels,
education delivery, consulting/support pipelines, CRM, or income-stream
production. Those belong to WORKSHOP.

## Surface Map

- `web/index.html`: EPOCH surface directory.
- `web/app/index.html`: EPOCH App, the internal scheduling command surface.
- `web/webportal/index.html`: EPOCH Webportal, the customer-safe schedule
  request and status surface.
- `http://127.0.0.1:8765/epoch-monitor.html`: EPOCH MONITOR, the local
  operational status/control surface.

The app and webportal are product surfaces. MONITOR is not the product UI; it is
the operational control and verification surface.

## Current Implementation Artifacts

- `native/epoch_core.h` and `native/epoch_core.c`: native C status and
  schedule/operating primitives.
- `native/epoch_core_smoke.c`: native smoke test for the core contract.
- `web/shared/epoch-data.js`: schedule-focused demo data for app and webportal
  rendering.
- `web/shared/surface.js`: shared app/webportal renderer and local request
  interaction.
- `web/shared/styles.css`: EPOCH-specific surface styling.
- `tools/verify-commercial-slice.mjs`: repository verifier for EPOCH product
  boundary and surface placement.

## Verification

```powershell
npm run verify
cmake -S . -B build
cmake --build build --config Debug
ctest --test-dir build -C Debug --output-on-failure
```

To preview the web surfaces, serve the `web` folder and open:

- `/index.html`
- `/app/index.html`
- `/webportal/index.html`

## Runtime Stance

Native C is the default implementation language for reusable EPOCH logic.
Avalonia is the planned desktop shell and UI host. Web surfaces are clients over
the EPOCH contract, not the durable source of scheduling truth.

WORKSHOP can consume EPOCH scheduling services for appointments, deadlines,
reminders, and customer-safe timing updates without moving service delivery into
EPOCH.
