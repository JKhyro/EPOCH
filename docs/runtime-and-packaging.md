# EPOCH Runtime And Packaging Stance

## Goal

Keep EPOCH primarily native C while using Avalonia as the desktop shell and C#
only where the host, UI framework, or platform integration makes it necessary.

## Core stance

- Native C is the default implementation language.
- Scheduling logic, data structures, validation, and state transitions should
  live in native C by default.
- Schedule-bound operating logic for sessions, cohorts, submission windows,
  review deadlines, queue state, and status transitions should also prefer the
  native core when the behavior is reusable beyond one host.
- Request acceptance, local availability holds, booking confirmations,
  customer-safe schedule status events, and booking receipts are part of the
  native contract surface once they influence more than one host.
- Timing handoffs, availability conflict decisions, timing return payloads,
  and return receipts are also native-owned because they define EPOCH's service
  boundary for products that request schedule state.
- Managed code should not become the primary home of EPOCH business rules.

## Avalonia role

- Avalonia is the desktop application shell and UI surface.
- Avalonia can own windowing, rendering, binding, and desktop-app lifecycle
  concerns.
- Avalonia should consume EPOCH through a deliberate interop boundary rather
  than by reimplementing the core scheduling model in C#.
- Avalonia may host the first internal administration surface for calendars,
  availability windows, deadlines, reminders, recurrence, schedule-bound
  requests, and EPOCH MONITOR status.

## Interop boundary

- Use a stable native C ABI between the EPOCH core and the Avalonia host.
- Keep the interop surface coarse-grained and versionable.
- Prefer plain structs, explicit handles, and predictable ownership rules over
  chatty object-shaped crossings.
- Design the interop boundary so the native core can later be hosted by other
  shells without CLR coupling.
- Public/customer webportal and client surfaces should consume the same
  scheduling/operating contract rather than inventing separate schedule state.

## C# is allowed where necessary

- Avalonia app bootstrap and application lifecycle
- XAML or Avalonia view code
- platform-specific desktop integration that Avalonia expects in managed code
- interop marshaling and native library loading
- host-side rendering of internal dashboards and monitor pages
- adapters to web/API surfaces before a more permanent cross-host boundary is
  available

## C# is not the default place for

- scheduling rules
- recurrence evaluation
- event mutation and validation logic
- storage-neutral data contracts owned by the core runtime
- cohort/session/submission/review state transitions that should remain shared
  across desktop, web, monitor, and ARA service workflows

## Packaging direction

- Package EPOCH as a native C core plus an Avalonia desktop host.
- Keep the native runtime independently testable outside the desktop shell.
- Avoid taking runtime dependencies that force the core scheduling engine to
  live inside the CLR.
- Package web/portal surfaces as consumers of EPOCH contracts, not as the
  permanent source of scheduling truth.
- Keep EPOCH MONITOR generation local-first until public access control and
  exposure policy are explicitly verified.

## Implications for the first executable slice

- The v1 operating surface should prove the native C core first for
  schedule-bound objects and status transitions.
- The local-first booking workflow should create a schedule request, acceptance,
  availability hold, booking confirmation, status event, and receipt before any
  live calendar provider integration is approved.
- Handoff consumers should receive either a confirmed local timing return or a
  customer-safe reschedule/conflict return while EPOCH keeps calendar ownership.
- The Avalonia shell should stay thin and consume the native core via explicit
  interop for internal administration.
- A customer-safe webportal may be built before the Avalonia host, but it
  should be treated as a host/client surface over the EPOCH contract. Revenue
  and service-delivery portals belong to WORKSHOP.
- If logic must land in C# for host reasons, document the exception instead of
  letting it silently become the new default.

## Current Avalonia shell proof

- `native/epoch_app_bridge.h` exposes the first coarse C ABI for the desktop
  host.
- `native/epoch_app_bridge.c` returns a scheduling snapshot from Native C
  validation, not from a parallel C# schedule model.
- `src/Epoch.App` is the first Avalonia host. It renders Calendar Board,
  Schedule Queue, Revised Calendar Lab, and Boundary Contract panels from the
  native bridge snapshot.
- `dotnet run --project src/Epoch.App/Epoch.App.csproj -- --smoke` is the
  managed smoke check after the native bridge has been built into `build`.
- Product modules stay in EPOCH App/Webportal. MONITOR may report readiness for
  those modules, but it does not host the scheduling workflows.

## Native-backed revised calendar constraint slice

- `EpochRevisedCalendarConstraintProjection` is now produced by the Native C
  core from the draft rulepack and passed through `EpochAppBridgeSnapshot`.
- The projection exposes the executable structural constraints: 13 months,
  28 days per month, the year-opening day outside the months, the leap-year
  extra day outside the months at year end, 1 common-year intercalary day,
  2 leap-year intercalary days, and the measured-average first-spring-day
  anchor method/source.
- The Avalonia Revised Calendar Lab renders the constraint projection and the
  conversion gate reason. Conversion remains blocked until the owner-approved
  physical spring anchor and display rulepack are complete.
- The Webportal renders only customer-safe constraint status; it does not expose
  MONITOR controls, live provider toggles, or independent conversion rules.

## Native-backed scheduling command slice

- `epoch_app_bridge_preview_schedule_command` previews a validated native
  command chain: request, EPOCH-owned availability window, timing handoff,
  acceptance, local hold, booking confirmation, schedule status event, booking
  receipt, and timing return payload.
- The Avalonia shell renders that command chain in the Native Scheduling
  Command panel.
- The command preview remains local-only and customer-safe. It does not enable
  provider calls and does not expose WORKSHOP service or CRM internals.

## Native-backed scheduling execution slice

- `epoch_app_bridge_execute_schedule_command` accepts an explicit scheduling
  intent such as `confirm-local-booking` and returns an execution receipt.
- The execution receipt proves request acceptance, local availability hold,
  booking confirmation, customer-safe schedule status, booking receipt, and
  timing return from the Native C bridge.
- The execution path is local-only: provider calls stay disabled, MONITOR
  workflow exposure stays false, and WORKSHOP service/CRM details remain
  outside EPOCH.

## Local scheduling execution history slice

- `EpochScheduleExecutionHistoryStore` persists native execution receipts in an
  EPOCH App-owned JSON ledger named `schedule-execution-history.json`.
- The default ledger directory is under the local application-data path at
  `KHYRON/EPOCH/App`; tests and smoke runs can override it with
  `EPOCH_APP_STATE_DIR`.
- The Avalonia shell displays the persisted command count, latest local history
  status, and ledger path in the App. MONITOR remains a development/control
  evidence surface and does not become the scheduling history workflow.
- Invalid JSON history is archived aside instead of blocking the desktop shell,
  keeping local recovery inside the App layer and away from public/provider
  integrations.

## Local Webportal request inbox slice

- `EpochScheduleRequestInboxStore` persists customer-safe Webportal scheduling
  request intent in an EPOCH App-owned JSON ledger named
  `schedule-request-inbox.json`.
- The request inbox uses the same local application-data directory and
  `EPOCH_APP_STATE_DIR` override as the execution history ledger.
- The Avalonia Schedule Queue panel renders the local Webportal Request Inbox
  count and latest customer-safe request status. This is App/Webportal product
  state; MONITOR may report readiness/evidence only.
- Request inbox entries are local-only, provider-off, customer-safe, and marked
  as App-owned inbox state before a Native C scheduling command consumes them.

## Local request-to-scheduling-command slice

- `EpochRequestScheduleCommandReceiptStore` persists the App-owned link between
  a Webportal schedule request inbox entry and a native scheduling execution
  receipt in `request-to-schedule-command.json`.
- The link is written only after a customer-safe inbox request and direct native
  execution history receipt both exist.
- The Avalonia Schedule Queue panel renders Request To Native Command status so
  the operator can see that Webportal request intent has been consumed by local
  EPOCH scheduling execution.
- The receipt remains local-only, provider-off, MONITOR-off, and native-ready;
  MONITOR may report implementation evidence but does not run the request flow.

## Local schedule operations board slice

- `EpochScheduleOperationsBoardSnapshot` synthesizes the Webportal Request
  Inbox, Request To Native Command receipts, and Native Execution History into
  one App-owned scheduling operations board.
- The board reports queue state, latest customer-safe Webportal request, latest
  request-command link, latest native execution history item, safety flags,
  ledger locations, and the next operator action.
- The board is ready only when the request, command link, and native execution
  history agree, provider calls are disabled, MONITOR workflow exposure is
  false, and the chain is customer-safe.
- The Avalonia shell renders Schedule Operations Board above the Calendar Board
  and Schedule Queue so the EPOCH App behaves like the scheduling command
  surface. MONITOR remains development/control evidence only.

## Local customer-safe schedule status feedback slice

- `EpochCustomerScheduleStatusStore` persists App-owned customer-safe schedule
  status exports in `customer-schedule-status.json`.
- `EpochCustomerScheduleStatusRecord` is created from the linked Webportal
  Request Inbox entry, Request To Native Command receipt, and Native Execution
  History item after the operations board is ready for operator review.
- The exported status is Webportal-ready only when the whole chain is
  customer-safe, provider calls are disabled, and MONITOR workflow exposure is
  false.
- The Avalonia shell renders Customer-Safe Status Feedback so the operator can
  see what the Webportal may safely show without exposing MONITOR controls or
  live calendar provider behavior.

## Local Webportal schedule status reader slice

- The EPOCH Webportal can load an App-exported
  `customer-schedule-status.json` file into a browser-local status reader.
- The reader accepts only records marked customer-safe, Webportal-ready,
  provider-off, and MONITOR-off before rendering them.
- The Webportal displays the customer-safe schedule status message, next action,
  request label, and status only. Native execution ids, operator controls,
  provider controls, and MONITOR controls stay outside the customer portal.

## Local schedule lifecycle action slice

- The EPOCH Webportal can queue customer-safe schedule lifecycle actions such
  as reschedule, cancel, confirm, or preferred-window change requests without
  activating live provider calls.
- `EpochScheduleLifecycleActionStore` persists App-owned lifecycle intent in
  `schedule-lifecycle-actions.json`, separate from MONITOR development logs.
- `EpochScheduleLifecycleReceiptStore` links a lifecycle action to the local
  request-to-native-command receipt and native execution history in
  `schedule-lifecycle-receipts.json`.
- `EpochScheduleLifecycleStatusStore` exports customer-safe lifecycle status in
  `schedule-lifecycle-status.json` for the Webportal reader.
- The Webportal lifecycle status reader accepts only App-exported records that
  are customer-safe, Webportal-ready, provider-off, and MONITOR-off. It renders
  schedule change status only and does not expose operator controls, native
  execution internals, or MONITOR workflow state.

## Local EPOCH revised timing export slice

- `EpochRevisedCalendarTimingExportStore` persists App-owned revised-calendar
  timing context in `epoch-revised-calendar-timing.json` under the same local
  EPOCH App state directory and `EPOCH_APP_STATE_DIR` override used by the
  other scheduling ledgers.
- The export is customer-safe timing-provider context for WORKSHOP timing
  consumption only. It describes the EPOCH-owned revised 13-month projection,
  the conversion gate reason, and the customer-safe status returned from EPOCH.
- WORKSHOP timing-provider consumption is limited to customer-safe schedule
  context; EPOCH remains the calendar and revised-calendar authority.
- Provider go-live remains false, WORKSHOP calendar ownership remains false,
  and MONITOR workflow exposure remains false. The export does not give
  WORKSHOP permission to mutate EPOCH calendar state or implement revised
  calendar conversion.
- The Avalonia Revised Calendar Lab renders the export count, latest export
  status, and export path so the operator can see the bridge artifact without
  moving the workflow into MONITOR.

## Local revised-calendar owner decision gate slice

- `EpochRevisedRulepackOwnerDecisionStore` persists App-owned revised-calendar
  owner decision gate records in `revised-rulepack-owner-decisions.json`.
- `EpochRevisedRulepackApprovalReceiptStore` writes customer-safe Webportal
  import receipts in `revised-rulepack-approval-receipts.json`.
- The decision record makes the current state explicit: the 13-month structure
  is represented, but authoritative conversion remains blocked until the owner
  approves the physical spring anchor source, month/intercalary day names, leap
  rule, day-of-week mapping, timezone boundaries, recurrence mapping, public
  wording, storage identifier, and conversion rules.
- Required approvals may be tracked separately from the final conversion
  toggle. Even if every approval field becomes true, conversion remains held
  until `conversionLogicEnabled` is explicitly enabled under owner-approved
  rules.
- Provider calls remain disabled, provider go-live remains false, WORKSHOP
  calendar ownership remains false, and MONITOR workflow exposure remains
  false. The EPOCH Webportal may load only customer-safe held approval receipts;
  it does not expose the operator decision workflow.

## Local revised-calendar availability exception slice

- `EpochRevisedAvailabilityExceptionStore` persists App-owned recurring
  revised-calendar availability exception records in
  `revised-availability-exceptions.json` after the App has a customer-safe
  revised timing export and a native scheduling command preview.
- `EpochRevisedAvailabilityExceptionReceiptStore` writes customer-safe
  Webportal import receipts in
  `revised-availability-exception-receipts.json`.
- The recurring revised-calendar availability exception chain links revised
  timing context, the native schedule request id, the EPOCH-owned availability
  window id, the recurring series id, the recurring instance id, and the local
  conflict exception id without creating a live provider write.
- Provider calls remain disabled, notification sends remain disabled, WORKSHOP
  calendar ownership remains false, MONITOR workflow exposure remains false,
  and revised-calendar conversion remains owner-gated across the whole chain.
- The EPOCH Webportal can load the App-exported
  `revised-availability-exception-receipts.json` file into a browser-local
  reader. The reader accepts only customer-safe, Webportal-ready,
  notification-off, provider-off, WORKSHOP-calendar-off, MONITOR-off, and
  conversion-held records before rendering status.

## Local revised-calendar reminder/deadline execution slice

- `EpochRevisedReminderExecutionStore` persists App-owned revised-calendar
  reminder execution records in `revised-reminder-executions.json` after the
  App has a customer-safe revised timing export.
- `EpochRevisedDeadlineExecutionStore` persists matching deadline evaluation
  records in `revised-deadline-executions.json` while revised-calendar
  conversion remains owner-gated.
- `EpochRevisedDeadlineEscalationStore` links the reminder and deadline records
  into `revised-deadline-escalations.json` as a local follow-up hold.
- `EpochRevisedReminderDeadlineReceiptStore` writes customer-safe Webportal
  import receipts in `revised-reminder-deadline-receipts.json`.
- Notification sends remain disabled, provider calls remain disabled, WORKSHOP
  calendar ownership remains false, and MONITOR workflow exposure remains false
  across the whole chain.
- The EPOCH Webportal can load the App-exported
  `revised-reminder-deadline-receipts.json` file into a browser-local reader.
  The reader accepts only customer-safe, Webportal-ready, notification-off,
  provider-off, and MONITOR-off records before rendering status. It does not
  expose App ledger internals, notification controls, provider controls, or
  MONITOR workflow state.
