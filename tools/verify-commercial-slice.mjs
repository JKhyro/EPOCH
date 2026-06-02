import fs from "node:fs";

function fail(message) {
  console.error(`verification failed: ${message}`);
  process.exit(1);
}

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

const root = read("../web/index.html");
const app = read("../web/app/index.html");
const portal = read("../web/webportal/index.html");
const data = read("../web/shared/epoch-data.js");
const script = read("../web/shared/surface.js");
const styles = read("../web/shared/styles.css");
const boundary = read("../docs/product-boundary.md");
const runtime = read("../docs/runtime-and-packaging.md");
const monitor = read("../docs/monitor-parity-health-controls.md");
const providerGate = read("../docs/calendar-provider-go-live-readiness-gate.md");
const header = read("../native/epoch_core.h");
const source = read("../native/epoch_core.c");
const {
  createAvailabilityHoldForAcceptance,
  createBookingConfirmationForHold,
  createBookingReceiptForConfirmation,
  createScheduleEntryForRequest,
  createScheduleRequestRecord,
  createScheduleRequestAcceptanceForRequest,
  createScheduleStatusEventForBooking,
  initialEpochLedger,
  providerGateBlocksLiveCalls,
  providerGateReadyForToggle,
  revisedRulepackBlocksConversion,
  revisedRulepackReady,
  selectOpenAvailabilityWindow
} = await import("../web/shared/epoch-data.js");

for (const phrase of ["EPOCH App", "EPOCH Webportal", "EPOCH MONITOR"]) {
  if (!root.includes(phrase)) fail(`root missing surface phrase ${phrase}`);
}

if (!app.includes("EPOCH App")) fail("app missing EPOCH App identity");
if (!portal.includes("EPOCH Webportal")) fail("portal missing EPOCH Webportal identity");
if (!app.includes("epoch-monitor.html") || !portal.includes("epoch-monitor.html")) fail("app/webportal missing MONITOR route link");

for (const phrase of [
  "Calendar, Scheduling, And Time Operations",
  "Native C Core",
  "revised 13-month calendar",
  "WORKSHOP Uses EPOCH Time"
]) {
  if (!root.includes(phrase)) fail(`root directory missing ${phrase}`);
}

for (const phrase of [
  "Schedule Command",
  "Calendar Board",
  "Open Windows",
  "Schedule-Bound Work",
  "Local Schedule Ledger",
  "Calendar Provider Readiness",
  "No-Live Provider Proof",
  "Schedule Request Acceptances",
  "Availability Holds",
  "Booking Confirmations",
  "Schedule Status Events",
  "Booking Receipts",
  "Native Scheduling Core",
  "Recurrence Candidates",
  "Revised Calendar Preview",
  "Revised Rulepack Boundary",
  "Native C Core"
]) {
  if (!app.includes(phrase)) fail(`EPOCH app missing ${phrase}`);
}

for (const phrase of [
  "Schedule Request And Status Portal",
  "Ask For A Time",
  "Customer-Safe Timeline",
  "Next Open Windows",
  "Request Acceptance Status",
  "Availability Hold Status",
  "Booking Confirmation Status",
  "Schedule Status Updates",
  "Booking Receipts",
  "Provider Status",
  "Revised Calendar Status",
  "External Calendar Connection",
  "Shows provider status without enabling live provider calls",
  "Does not expose raw admin or MONITOR controls"
]) {
  if (!portal.includes(phrase)) fail(`EPOCH webportal missing ${phrase}`);
}

for (const path of [
  "./app/index.html",
  "./webportal/index.html",
  "http://127.0.0.1:8765/epoch-monitor.html"
]) {
  if (!root.includes(path)) fail(`root directory missing route ${path}`);
}

for (const phrase of ["epochSchedule", "availabilityWindows", "deadlineItems", "revisedMonths", "portalTimeline"]) {
  if (!data.includes(phrase)) fail(`EPOCH data missing ${phrase}`);
}

for (const phrase of [
  "EPOCH_LEDGER_KEY",
  "initialEpochLedger",
  "scheduleEntries",
  "scheduleRequests",
  "scheduleRequestAcceptances",
  "availabilityHolds",
  "bookingConfirmations",
  "scheduleStatusEvents",
  "bookingReceipts",
  "schedulingCoreReadiness",
  "reminderRules",
  "recurrenceCandidates",
  "revisedCalendarRulepack",
  "providerReadinessGates",
  "providerStatusEvents",
  "createScheduleRequestRecord",
  "createScheduleEntryForRequest",
  "createScheduleRequestAcceptanceForRequest",
  "createAvailabilityHoldForAcceptance",
  "createBookingConfirmationForHold",
  "createScheduleStatusEventForBooking",
  "createBookingReceiptForConfirmation",
  "selectOpenAvailabilityWindow",
  "providerGateReadyForToggle",
  "providerGateBlocksLiveCalls",
  "revisedRulepackReady",
  "revisedRulepackBlocksConversion"
]) {
  if (!data.includes(phrase)) fail(`EPOCH data missing ledger phrase ${phrase}`);
}

for (const phrase of [
  "localStorage",
  "EPOCH_LEDGER_KEY",
  "schedule-request-form",
  "schedule-need-select",
  "customer-status-list",
  "provider-readiness-list",
  "acceptance-list",
  "hold-list",
  "booking-confirmation-list",
  "schedule-status-event-list",
  "booking-receipt-list",
  "portal-acceptance-status",
  "portal-hold-status",
  "portal-booking-status",
  "portal-schedule-status-events",
  "portal-booking-receipts",
  "portal-provider-status",
  "provider-check-list",
  "native-core-readiness",
  "recurrence-candidate-list",
  "revised-rulepack-status",
  "portal-revised-status",
  "reset-schedule-ledger"
]) {
  if (!script.includes(phrase) && !app.includes(phrase) && !portal.includes(phrase)) fail(`EPOCH workflow missing ${phrase}`);
}

for (const status of [
  "EPOCH_STATUS_PLANNED",
  "EPOCH_STATUS_AVAILABLE",
  "EPOCH_STATUS_QUEUED",
  "EPOCH_STATUS_ACCEPTED",
  "EPOCH_STATUS_HELD",
  "EPOCH_STATUS_CONFIRMED",
  "EPOCH_STATUS_IN_PROGRESS",
  "EPOCH_STATUS_OVERDUE",
  "EPOCH_STATUS_COMPLETE"
]) {
  if (!header.includes(status)) fail(`native header missing ${status}`);
}

for (const label of ["planned", "available", "queued", "accepted", "held", "confirmed", "in-progress", "overdue", "complete"]) {
  if (!source.includes(`"${label}"`)) fail(`native source missing label ${label}`);
}

for (const phrase of [
  "EPOCH is the calendar, scheduling",
  "WORKSHOP owns revenue streams",
  "Native C is the default implementation language",
  "Avalonia is the desktop application shell",
  "Compatibility aliases may redirect",
  "This issue does not approve live provider integrations"
]) {
  const combined = `${boundary}\n${runtime}\n${monitor}\n${providerGate}`;
  if (!combined.includes(phrase)) fail(`docs missing ${phrase}`);
}

for (const type of [
  "EpochScheduleRequest",
  "EpochAvailabilityWindow",
  "EpochScheduleRequestAcceptance",
  "EpochAvailabilityHold",
  "EpochBookingConfirmation",
  "EpochScheduleStatusEvent",
  "EpochBookingReceipt",
  "EpochReminderRule",
  "EpochRecurrenceRule",
  "EpochDeadlineRule",
  "EpochRevisedCalendarRulepack",
  "EpochCalendarSystem",
  "EpochDeadlineHealth",
  "EpochCalendarProviderReadinessGate",
  "EpochProviderKind"
]) {
  if (!header.includes(type)) fail(`native header missing contract ${type}`);
}

for (const fn of [
  "epoch_provider_kind_label",
  "epoch_calendar_system_label",
  "epoch_deadline_health_label",
  "epoch_schedule_entry_is_valid",
  "epoch_schedule_request_is_customer_safe",
  "epoch_availability_window_has_capacity",
  "epoch_schedule_request_acceptance_is_ready",
  "epoch_availability_hold_is_ready",
  "epoch_booking_confirmation_is_customer_safe",
  "epoch_schedule_status_event_is_customer_safe",
  "epoch_booking_receipt_is_customer_safe",
  "epoch_reminder_rule_is_sandbox_safe",
  "epoch_recurrence_rule_is_sandbox_safe",
  "epoch_deadline_rule_is_customer_safe",
  "epoch_revised_calendar_rulepack_conversion_ready",
  "epoch_revised_calendar_rulepack_blocks_conversion",
  "epoch_calendar_provider_gate_ready_for_live_toggle",
  "epoch_calendar_provider_gate_blocks_live_calls"
]) {
  if (!header.includes(fn)) fail(`native header missing function ${fn}`);
  if (!source.includes(fn)) fail(`native source missing function ${fn}`);
}

for (const forbidden of [
  "Package Gameplans",
  "Marketing Conversion",
  "Payment Provider",
  "Sandbox Payment",
  "EIKEN",
  "Premium English",
  "Campaign Routes",
  "Quote Payment",
  "Consulting Pipeline",
  "CRM"
]) {
  const combinedWeb = `${root}\n${app}\n${portal}\n${data}\n${script}`;
  if (combinedWeb.includes(forbidden)) fail(`EPOCH web surface still contains WORKSHOP-only phrase ${forbidden}`);
}

for (const selector of [".directory-layout", ".workspace-grid", ".portal-grid", ".calendar-board", ".month-grid", ".wide-panel", ".secondary-button"]) {
  if (!styles.includes(selector)) fail(`styles missing ${selector}`);
}

const fakeForm = new Map([
  ["requester", "  "],
  ["need", "submission-review-return"],
  ["window", "Weekday evening Japan time"],
  ["timezone", "Asia/Tokyo"]
]);
const request = createScheduleRequestRecord(fakeForm);
const entry = createScheduleEntryForRequest(request);
const openWindow = selectOpenAvailabilityWindow(initialEpochLedger.availabilityWindows);
const acceptance = createScheduleRequestAcceptanceForRequest(request, openWindow);
const hold = createAvailabilityHoldForAcceptance(acceptance, openWindow);
const booking = createBookingConfirmationForHold(hold, request, entry);
const statusEvent = createScheduleStatusEventForBooking(booking, request);
const bookingReceipt = createBookingReceiptForConfirmation(booking, statusEvent);
const rulepack = initialEpochLedger.revisedCalendarRulepack;
const approvedRulepack = {
  ...rulepack,
  versionId: "owner-approved-rulepack-v1",
  ownerApproved: true,
  monthNamesApproved: true,
  dayDistributionApproved: true,
  intercalaryDaysApproved: true,
  leapRuleApproved: true,
  epochAnchorApproved: true,
  dayOfWeekMappingApproved: true,
  formattingRulesApproved: true,
  timezoneBoundaryApproved: true,
  recurrenceMappingApproved: true,
  publicDisplayWordingApproved: true,
  storageIdentifierApproved: true,
  conversionRulesApproved: true,
  conversionLogicEnabled: true
};
const gate = {
  ...initialEpochLedger.providerReadinessGates[0],
  revisedCalendarMappingVerified: true,
  operatorApprovalRecorded: true,
  liveProviderCallsEnabled: false
};

if (request.requester !== "Schedule requester") fail("schedule request factory did not default blank requester");
if (request.providerGoLiveRequested !== false || request.sandboxOnly !== true) fail("schedule request factory is not sandbox-only");
if (!entry.title.includes("Submission review return")) fail("schedule entry factory did not map need label");
if (!openWindow || openWindow.id !== "EPOCH-WIN-001") fail("open availability selector did not choose the first open window");
if (acceptance.status !== "accepted" || !acceptance.customerVisible || acceptance.providerGoLiveRequested) fail("acceptance factory did not create safe local acceptance");
if (hold.status !== "held" || hold.providerGoLiveRequested || hold.availabilityWindowId !== openWindow.id) fail("hold factory did not create safe local availability hold");
if (booking.status !== "confirmed" || booking.providerGoLiveRequested || !booking.customerSafeStatus.includes("Schedule confirmed locally")) fail("booking factory did not create safe local confirmation");
if (statusEvent.state !== "confirmed" || !statusEvent.customerVisible || !statusEvent.customerSafeStatus.includes("external calendar connection remains inactive")) fail("status event factory did not create customer-safe schedule status");
if (bookingReceipt.status !== "ready" || !bookingReceipt.summary.includes("without live provider calls")) fail("booking receipt factory did not preserve local-only proof");
if (!providerGateReadyForToggle(gate)) fail("provider gate should be ready for live toggle after all checks");
if (!providerGateBlocksLiveCalls(gate)) fail("provider gate should still block live calls before toggle");
gate.liveProviderCallsEnabled = true;
if (providerGateBlocksLiveCalls(gate)) fail("provider gate should allow live calls after explicit toggle and checks");
if (revisedRulepackReady(rulepack)) fail("draft revised rulepack must not be conversion-ready");
if (!revisedRulepackBlocksConversion(rulepack)) fail("draft revised rulepack must block conversion");
if (!revisedRulepackReady(approvedRulepack)) fail("approved revised rulepack should be conversion-ready");
approvedRulepack.conversionLogicEnabled = false;
if (revisedRulepackReady(approvedRulepack)) fail("disabled conversion logic should keep approved rulepack held");

console.log("EPOCH surface boundary verification passed");
