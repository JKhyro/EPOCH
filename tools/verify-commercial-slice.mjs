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
  createAvailabilityConflictDecisionForHandoff,
  createAvailabilityCapacityReceiptForPromotion,
  createAvailabilityCapacitySnapshotForWindow,
  createAvailabilityHoldForAcceptance,
  createAvailabilityHoldReleaseForHold,
  createAvailabilityPromotionCandidateForWaitlist,
  createAvailabilityWaitlistEntryForRequest,
  createBookingConfirmationForHold,
  createBookingReceiptForConfirmation,
  createDeadlineEscalationForExecution,
  createDeadlineExecutionForItem,
  createReminderDeadlineReceiptForEscalation,
  createReminderExecutionForRule,
  createScheduleEntryForRequest,
  createScheduleRequestRecord,
  createScheduleRequestAcceptanceForRequest,
  createScheduleStatusEventForConflict,
  createScheduleStatusEventForBooking,
  createRecurrenceConflictExceptionForInstance,
  createRecurringBookingInstanceForSeries,
  createRecurringBookingSeriesForRule,
  createRecurringSeriesReceiptForSeries,
  createTimingHandoffForRequest,
  createTimingReturnPayloadForDecision,
  createTimingReturnReceiptForPayload,
  initialEpochLedger,
  providerGateBlocksLiveCalls,
  providerGateReadyForToggle,
  revisedRulepackBlocksConversion,
  revisedRulepackReady,
  selectFullAvailabilityWindow,
  selectOpenAvailabilityWindow
} = await import("../web/shared/epoch-data.js");

for (const phrase of ["EPOCH App", "EPOCH Webportal", "EPOCH MONITOR"]) {
  if (!root.includes(phrase)) fail(`root missing surface phrase ${phrase}`);
}

if (!app.includes("EPOCH App")) fail("app missing EPOCH App identity");
if (!portal.includes("EPOCH Webportal")) fail("portal missing EPOCH Webportal identity");
if (!app.includes("epoch-monitor.html")) fail("app missing MONITOR route link");
if (portal.includes("epoch-monitor.html") || /MONITOR|raw admin|control surface/i.test(portal)) {
  fail("webportal exposes MONITOR/admin/control language");
}

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
  "Local Reminder Runs",
  "Deadline Evaluations",
  "Deadline Escalations",
  "Reminder Deadline Receipts",
  "Local Schedule Ledger",
  "Calendar Provider Readiness",
  "No-Live Provider Proof",
  "Timing Handoffs",
  "Availability Conflict Decisions",
  "Schedule Request Acceptances",
  "Availability Holds",
  "Capacity Snapshots",
  "Availability Waitlist",
  "Hold Releases",
  "Promotion Candidates",
  "Capacity Receipts",
  "Booking Confirmations",
  "Schedule Status Events",
  "Booking Receipts",
  "Timing Return Payloads",
  "Timing Return Receipts",
  "Native Scheduling Core",
  "Recurrence Candidates",
  "Recurring Booking Series",
  "Recurring Booking Instances",
  "Recurrence Conflict Exceptions",
  "Recurring Series Receipts",
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
  "Timing Handoff Status",
  "Availability Decision",
  "Availability Hold Status",
  "Capacity Status",
  "Waitlist Status",
  "Promotion Status",
  "Booking Confirmation Status",
  "Schedule Status Updates",
  "Reminder Execution Status",
  "Deadline Execution Status",
  "Deadline Escalation Status",
  "Booking Receipts",
  "Timing Return Status",
  "Timing Return Receipts",
  "Recurring Schedule Status",
  "Recurring Instance Status",
  "Recurring Exception Status",
  "Provider Status",
  "Revised Calendar Status",
  "External Calendar Connection",
  "Shows provider status without enabling live provider calls",
  "Keeps operational controls outside this customer portal"
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

for (const phrase of ["epochSchedule", "availabilityWindows", "availabilityCapacitySnapshots", "availabilityWaitlistEntries", "availabilityHoldReleases", "availabilityPromotionCandidates", "availabilityCapacityReceipts", "deadlineItems", "reminderExecutions", "deadlineExecutions", "deadlineEscalations", "reminderDeadlineReceipts", "revisedMonths", "portalTimeline"]) {
  if (!data.includes(phrase)) fail(`EPOCH data missing ${phrase}`);
}

for (const phrase of [
  "EPOCH_LEDGER_KEY",
  "initialEpochLedger",
  "scheduleEntries",
  "scheduleRequests",
  "timingHandoffs",
  "availabilityConflictDecisions",
  "scheduleRequestAcceptances",
  "availabilityHolds",
  "bookingConfirmations",
  "scheduleStatusEvents",
  "bookingReceipts",
  "timingReturnPayloads",
  "timingReturnReceipts",
  "availabilityCapacitySnapshots",
  "availabilityWaitlistEntries",
  "availabilityHoldReleases",
  "availabilityPromotionCandidates",
  "availabilityCapacityReceipts",
  "reminderExecutions",
  "deadlineExecutions",
  "deadlineEscalations",
  "reminderDeadlineReceipts",
  "schedulingCoreReadiness",
  "reminderRules",
  "recurrenceCandidates",
  "recurringBookingSeries",
  "recurringBookingInstances",
  "recurrenceConflictExceptions",
  "recurringSeriesReceipts",
  "revisedCalendarRulepack",
  "providerReadinessGates",
  "providerStatusEvents",
  "createScheduleRequestRecord",
  "createScheduleEntryForRequest",
  "createTimingHandoffForRequest",
  "createAvailabilityConflictDecisionForHandoff",
  "createScheduleRequestAcceptanceForRequest",
  "createAvailabilityHoldForAcceptance",
  "createAvailabilityCapacitySnapshotForWindow",
  "createAvailabilityWaitlistEntryForRequest",
  "createAvailabilityHoldReleaseForHold",
  "createAvailabilityPromotionCandidateForWaitlist",
  "createAvailabilityCapacityReceiptForPromotion",
  "createBookingConfirmationForHold",
  "createScheduleStatusEventForBooking",
  "createScheduleStatusEventForConflict",
  "createBookingReceiptForConfirmation",
  "createTimingReturnPayloadForDecision",
  "createTimingReturnReceiptForPayload",
  "createReminderExecutionForRule",
  "createDeadlineExecutionForItem",
  "createDeadlineEscalationForExecution",
  "createReminderDeadlineReceiptForEscalation",
  "createRecurringBookingSeriesForRule",
  "createRecurringBookingInstanceForSeries",
  "createRecurrenceConflictExceptionForInstance",
  "createRecurringSeriesReceiptForSeries",
  "selectOpenAvailabilityWindow",
  "selectFullAvailabilityWindow",
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
  "timing-handoff-list",
  "conflict-decision-list",
  "acceptance-list",
  "hold-list",
  "capacity-snapshot-list",
  "waitlist-list",
  "hold-release-list",
  "promotion-candidate-list",
  "capacity-receipt-list",
  "booking-confirmation-list",
  "schedule-status-event-list",
  "booking-receipt-list",
  "timing-return-list",
  "timing-return-receipt-list",
  "reminder-execution-list",
  "deadline-execution-list",
  "deadline-escalation-list",
  "reminder-deadline-receipt-list",
  "portal-acceptance-status",
  "portal-timing-handoff-status",
  "portal-availability-decision",
  "portal-hold-status",
  "portal-capacity-status",
  "portal-waitlist-status",
  "portal-promotion-status",
  "portal-booking-status",
  "portal-schedule-status-events",
  "portal-booking-receipts",
  "portal-timing-return-status",
  "portal-timing-return-receipts",
  "portal-reminder-execution-status",
  "portal-deadline-execution-status",
  "portal-deadline-escalation-status",
  "portal-provider-status",
  "provider-check-list",
  "native-core-readiness",
  "recurrence-candidate-list",
  "recurring-series-list",
  "recurring-instance-list",
  "recurrence-exception-list",
  "recurring-series-receipt-list",
  "portal-recurring-series-status",
  "portal-recurring-instance-status",
  "portal-recurring-exceptions",
  "generate-recurring-series",
  "promote-waitlist",
  "run-reminder-deadline-pass",
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
  "EPOCH_STATUS_CLEAR",
  "EPOCH_STATUS_ACCEPTED",
  "EPOCH_STATUS_HELD",
  "EPOCH_STATUS_RELEASED",
  "EPOCH_STATUS_WAITLISTED",
  "EPOCH_STATUS_PROMOTED",
  "EPOCH_STATUS_CONFIRMED",
  "EPOCH_STATUS_NEEDS_RESCHEDULE",
  "EPOCH_STATUS_IN_PROGRESS",
  "EPOCH_STATUS_OVERDUE",
  "EPOCH_STATUS_COMPLETE"
]) {
  if (!header.includes(status)) fail(`native header missing ${status}`);
}

for (const label of ["planned", "available", "queued", "clear", "accepted", "held", "released", "waitlisted", "promoted", "confirmed", "needs-reschedule", "in-progress", "overdue", "complete"]) {
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
  "EpochTimingHandoff",
  "EpochAvailabilityConflictDecision",
  "EpochScheduleRequestAcceptance",
  "EpochAvailabilityHold",
  "EpochAvailabilityCapacitySnapshot",
  "EpochAvailabilityWaitlistEntry",
  "EpochAvailabilityHoldRelease",
  "EpochAvailabilityPromotionCandidate",
  "EpochAvailabilityCapacityReceipt",
  "EpochBookingConfirmation",
  "EpochScheduleStatusEvent",
  "EpochBookingReceipt",
  "EpochTimingReturnPayload",
  "EpochTimingReturnReceipt",
  "EpochReminderRule",
  "EpochRecurrenceRule",
  "EpochRecurringBookingSeries",
  "EpochRecurringBookingInstance",
  "EpochRecurrenceConflictException",
  "EpochRecurringSeriesReceipt",
  "EpochDeadlineRule",
  "EpochReminderExecution",
  "EpochDeadlineExecution",
  "EpochDeadlineEscalation",
  "EpochReminderDeadlineReceipt",
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
  "epoch_timing_handoff_is_sandbox_safe",
  "epoch_availability_conflict_decision_is_customer_safe",
  "epoch_schedule_request_acceptance_is_ready",
  "epoch_availability_hold_is_ready",
  "epoch_availability_capacity_snapshot_is_customer_safe",
  "epoch_availability_waitlist_entry_is_customer_safe",
  "epoch_availability_hold_release_is_ready",
  "epoch_availability_promotion_candidate_is_ready",
  "epoch_availability_capacity_receipt_is_customer_safe",
  "epoch_booking_confirmation_is_customer_safe",
  "epoch_schedule_status_event_is_customer_safe",
  "epoch_booking_receipt_is_customer_safe",
  "epoch_timing_return_payload_is_customer_safe",
  "epoch_timing_return_receipt_is_customer_safe",
  "epoch_reminder_rule_is_sandbox_safe",
  "epoch_recurrence_rule_is_sandbox_safe",
  "epoch_recurring_booking_series_is_customer_safe",
  "epoch_recurring_booking_instance_is_customer_safe",
  "epoch_recurrence_conflict_exception_is_customer_safe",
  "epoch_recurring_series_receipt_is_customer_safe",
  "epoch_deadline_rule_is_customer_safe",
  "epoch_reminder_execution_is_customer_safe",
  "epoch_deadline_execution_is_customer_safe",
  "epoch_deadline_escalation_is_customer_safe",
  "epoch_reminder_deadline_receipt_is_customer_safe",
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
const handoff = createTimingHandoffForRequest(request, "WORKSHOP");
const clearDecision = createAvailabilityConflictDecisionForHandoff(handoff, openWindow);
const acceptance = createScheduleRequestAcceptanceForRequest(request, openWindow);
const hold = createAvailabilityHoldForAcceptance(acceptance, openWindow);
const booking = createBookingConfirmationForHold(hold, request, entry);
const statusEvent = createScheduleStatusEventForBooking(booking, request);
const bookingReceipt = createBookingReceiptForConfirmation(booking, statusEvent);
const timingReturnPayload = createTimingReturnPayloadForDecision(clearDecision, request, booking);
const timingReturnReceipt = createTimingReturnReceiptForPayload(timingReturnPayload, clearDecision);
const reminderRule = initialEpochLedger.reminderRules[0];
const deadlineItem = initialEpochLedger.deadlineItems.find((item) => item.health === "at-risk");
const reminderExecution = createReminderExecutionForRule(reminderRule, entry);
const deadlineExecution = createDeadlineExecutionForItem(deadlineItem);
const deadlineEscalation = createDeadlineEscalationForExecution(deadlineExecution, reminderExecution);
const reminderDeadlineReceipt = createReminderDeadlineReceiptForEscalation(deadlineEscalation, deadlineExecution, reminderExecution);
const conflictDecision = createAvailabilityConflictDecisionForHandoff(handoff, null);
const conflictStatusEvent = createScheduleStatusEventForConflict(conflictDecision, request);
const conflictPayload = createTimingReturnPayloadForDecision(conflictDecision, request);
const conflictReceipt = createTimingReturnReceiptForPayload(conflictPayload, conflictDecision);
const fullWindow = selectFullAvailabilityWindow(initialEpochLedger.availabilityWindows);
const waitlistEntry = createAvailabilityWaitlistEntryForRequest(request, conflictDecision, 2);
const releaseSourceHold = initialEpochLedger.availabilityHolds.find((item) => item.status === "released");
const holdRelease = createAvailabilityHoldReleaseForHold(releaseSourceHold, fullWindow);
const promotionCandidate = createAvailabilityPromotionCandidateForWaitlist(waitlistEntry, fullWindow, holdRelease);
const capacityReceipt = createAvailabilityCapacityReceiptForPromotion(promotionCandidate, holdRelease, waitlistEntry);
const capacitySnapshot = createAvailabilityCapacitySnapshotForWindow(
  fullWindow,
  [waitlistEntry, ...initialEpochLedger.availabilityWaitlistEntries],
  [holdRelease, ...initialEpochLedger.availabilityHoldReleases],
  [promotionCandidate, ...initialEpochLedger.availabilityPromotionCandidates]
);
const recurrenceCandidate = initialEpochLedger.recurrenceCandidates.find((candidate) => candidate.createsFutureEntries);
const recurringSeries = createRecurringBookingSeriesForRule(recurrenceCandidate, entry);
const recurringInstance = createRecurringBookingInstanceForSeries(recurringSeries, 1, openWindow, entry);
const recurringConflictInstance = createRecurringBookingInstanceForSeries(recurringSeries, 2, null, entry);
const recurringException = createRecurrenceConflictExceptionForInstance(recurringConflictInstance, recurringSeries);
recurringConflictInstance.conflictExceptionId = recurringException.id;
const recurringReceipt = createRecurringSeriesReceiptForSeries(recurringSeries, [recurringInstance, recurringConflictInstance], [recurringException]);
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
if (handoff.sourceProduct !== "WORKSHOP" || handoff.providerGoLiveRequested || !handoff.customerSafeStatus.includes("availability is being resolved")) fail("timing handoff factory did not create safe local handoff");
if (clearDecision.status !== "clear" || clearDecision.providerGoLiveRequested || clearDecision.availabilityWindowId !== openWindow.id) fail("conflict decision factory did not create clear decision");
if (acceptance.status !== "accepted" || !acceptance.customerVisible || acceptance.providerGoLiveRequested) fail("acceptance factory did not create safe local acceptance");
if (hold.status !== "held" || hold.providerGoLiveRequested || hold.availabilityWindowId !== openWindow.id) fail("hold factory did not create safe local availability hold");
if (booking.status !== "confirmed" || booking.providerGoLiveRequested || !booking.customerSafeStatus.includes("Schedule confirmed locally")) fail("booking factory did not create safe local confirmation");
if (statusEvent.state !== "confirmed" || !statusEvent.customerVisible || !statusEvent.customerSafeStatus.includes("external calendar connection remains inactive")) fail("status event factory did not create customer-safe schedule status");
if (bookingReceipt.status !== "ready" || !bookingReceipt.summary.includes("without live provider calls")) fail("booking receipt factory did not preserve local-only proof");
if (timingReturnPayload.status !== "returned" || timingReturnPayload.providerGoLiveRequested || !timingReturnPayload.bookingConfirmationId) fail("timing return payload did not create confirmed return");
if (timingReturnPayload.requester !== request.requester || timingReturnPayload.requestedWindow !== request.requestedWindow) fail("timing return payload did not preserve requester/window context");
if (timingReturnReceipt.status !== "ready" || !timingReturnReceipt.summary.includes("without live provider calls")) fail("timing return receipt did not preserve local-only proof");
if (reminderExecution.status !== "dispatched" || reminderExecution.notificationSendEnabled || reminderExecution.providerGoLiveRequested) fail("reminder execution did not stay local-only");
if (!reminderExecution.customerSafeStatus.includes("no notification was sent")) fail("reminder execution did not expose customer-safe no-send status");
if (deadlineExecution.status !== "retry-ready" || deadlineExecution.providerGoLiveRequested || deadlineExecution.health !== "at-risk") fail("deadline execution did not create at-risk local evaluation");
if (deadlineEscalation.escalationLevel !== 1 || deadlineEscalation.notificationSendEnabled || deadlineEscalation.providerGoLiveRequested) fail("deadline escalation did not stay local-only");
if (reminderDeadlineReceipt.kind !== "reminder-deadline-execution" || reminderDeadlineReceipt.notificationSendEnabled || !reminderDeadlineReceipt.summary.includes("without live notification sends")) fail("reminder deadline receipt did not preserve local-only proof");
if (conflictDecision.status !== "needs-reschedule" || conflictDecision.availabilityWindowId || !conflictDecision.customerSafeStatus.includes("new window")) fail("conflict decision did not create reschedule decision");
if (conflictStatusEvent.state !== "needs-reschedule" || !conflictStatusEvent.customerSafeStatus.includes("new window")) fail("conflict status event is not customer-safe");
if (conflictPayload.status !== "needs-reschedule" || conflictPayload.bookingConfirmationId || !conflictPayload.customerSafeStatus.includes("new window")) fail("conflict return payload did not create reschedule return");
if (conflictReceipt.status !== "needs-reschedule" || !conflictReceipt.summary.includes("availability conflict")) fail("conflict return receipt did not preserve conflict proof");
if (!fullWindow || fullWindow.id !== "EPOCH-WIN-004") fail("full availability selector did not choose the full seeded window");
if (waitlistEntry.status !== "waitlisted" || waitlistEntry.providerGoLiveRequested || waitlistEntry.priority !== 2) fail("waitlist factory did not create safe local waitlist entry");
if (holdRelease.status !== "released" || holdRelease.providerGoLiveRequested || holdRelease.availabilityWindowId !== fullWindow.id) fail("hold release factory did not create safe local release");
if (promotionCandidate.status !== "promoted" || promotionCandidate.providerGoLiveRequested || promotionCandidate.waitlistEntryId !== waitlistEntry.id) fail("promotion factory did not create safe local promotion candidate");
if (capacityReceipt.status !== "promoted" || capacityReceipt.kind !== "availability-capacity" || !capacityReceipt.summary.includes("without live provider calls")) fail("capacity receipt did not preserve local-only proof");
if (capacitySnapshot.status !== "waitlisted" || capacitySnapshot.providerGoLiveRequested || capacitySnapshot.waitlistCount < 1 || capacitySnapshot.promotionCandidateCount < 1) fail("capacity snapshot did not summarize waitlist/promotion state");
if (!recurrenceCandidate || recurrenceCandidate.calendarSystem !== "gregorian") fail("approved recurrence candidate missing for series generation");
if (recurringSeries.status !== "confirmed" || recurringSeries.providerGoLiveRequested || !recurringSeries.customerSafeStatus.includes("generated locally")) fail("recurring series factory did not create safe local series");
if (recurringInstance.status !== "confirmed" || recurringInstance.providerGoLiveRequested || !recurringInstance.bookingConfirmationId) fail("recurring instance factory did not create confirmed local instance");
if (recurringConflictInstance.status !== "needs-reschedule" || !recurringConflictInstance.customerSafeStatus.includes("new window")) fail("recurring instance factory did not create conflict instance");
if (recurringException.status !== "needs-reschedule" || recurringException.providerGoLiveRequested || !recurringException.customerSafeStatus.includes("new window")) fail("recurrence exception factory did not preserve customer-safe conflict");
if (recurringReceipt.status !== "needs-reschedule" || !recurringReceipt.summary.includes("conflict exceptions")) fail("recurring series receipt did not summarize exceptions");
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
