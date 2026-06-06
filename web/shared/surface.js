import {
  EPOCH_LEDGER_KEY,
  createAvailabilityConflictDecisionForHandoff,
  createAvailabilityCapacityReceiptForPromotion,
  createAvailabilityCapacitySnapshotForWindow,
  createAvailabilityHoldForAcceptance,
  createAvailabilityHoldReleaseForHold,
  createAvailabilityPromotionCandidateForWaitlist,
  createAvailabilityWaitlistEntryForRequest,
  createBookingOptimizationRunForRequest,
  createBookingOverloadWarningForWindow,
  createBookingConfirmationForHold,
  createBookingRecommendationCandidateForWindow,
  createBookingRecommendationReceiptForRun,
  createBookingReceiptForConfirmation,
  createDeadlineEscalationForExecution,
  createDeadlineExecutionForItem,
  createReminderDeadlineReceiptForEscalation,
  createReminderExecutionForRule,
  createRevisedAvailabilityExceptionForTiming,
  createRevisedAvailabilityExceptionReceiptForException,
  createRevisedRulepackApprovalReceiptForDecision,
  createRevisedRulepackOwnerDecisionForRulepack,
  createScheduleEntryForRequest,
  createScheduleLifecycleActionRecord,
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
  projectRevisedRulepackConstraints,
  revisedRulepackBlocksConversion,
  revisedRulepackReady,
  revisedMonths,
  rankAvailabilityWindowsForRequest,
  scheduleLifecycleActionOptions,
  scheduleNeedLabel,
  scheduleNeedOptions,
  selectFullAvailabilityWindow,
  selectOpenAvailabilityWindow
} from "./epoch-data.js?v=epoch-revised-rulepack-owner-decisions";

const clone = (value) => JSON.parse(JSON.stringify(value));

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const sanitizeCustomerPortalText = (value) => typeof value === "string"
  ? value.replaceAll("MONITOR", "internal controls")
  : value;

const sanitizeCustomerVisiblePortalCopy = (ledger) => {
  for (const value of Object.values(ledger)) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (!item || typeof item !== "object" || !item.customerVisible) continue;
      for (const key of ["summary", "customerSafeStatus", "detail"]) {
        item[key] = sanitizeCustomerPortalText(item[key]);
      }
    }
  }
  return ledger;
};

const mergeLedger = (stored) => {
  const base = clone(initialEpochLedger);
  if (!stored || typeof stored !== "object") return sanitizeCustomerVisiblePortalCopy(base);
  for (const key of [
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
    "availabilityWindows",
    "availabilityCapacitySnapshots",
    "availabilityWaitlistEntries",
    "availabilityHoldReleases",
    "availabilityPromotionCandidates",
    "availabilityCapacityReceipts",
    "bookingOptimizationRuns",
    "bookingRecommendationCandidates",
    "bookingOverloadWarnings",
    "bookingRecommendationReceipts",
    "deadlineItems",
    "reminderExecutions",
    "deadlineExecutions",
    "deadlineEscalations",
    "reminderDeadlineReceipts",
    "recurrenceCandidates",
    "recurringBookingSeries",
    "recurringBookingInstances",
    "recurrenceConflictExceptions",
    "revisedRulepackOwnerDecisions",
    "revisedRulepackApprovalReceipts",
    "revisedAvailabilityExceptions",
    "revisedAvailabilityExceptionReceipts",
    "recurringSeriesReceipts",
    "reminderRules",
    "providerReadinessGates",
    "providerStatusEvents",
    "calendarDisplayModes",
    "scheduleAuditRecords",
    "scheduleReceipts",
    "schedulerLogEntries",
    "calendarSearchQueries",
    "calendarSearchResults",
    "scheduleTemplates",
    "scheduleLifecycleActions",
    "portalTimeline",
    "receipts"
  ]) {
    if (Array.isArray(stored[key])) base[key] = stored[key];
  }
  if (stored.schedulingCoreReadiness && typeof stored.schedulingCoreReadiness === "object") {
    base.schedulingCoreReadiness = stored.schedulingCoreReadiness;
  }
  if (stored.revisedCalendarRulepack && typeof stored.revisedCalendarRulepack === "object") {
    base.revisedCalendarRulepack = stored.revisedCalendarRulepack;
  }
  if (stored.avaloniaShellReadiness && typeof stored.avaloniaShellReadiness === "object") {
    base.avaloniaShellReadiness = stored.avaloniaShellReadiness;
  }
  base.version = stored.version || base.version;
  base.generatedAt = stored.generatedAt || base.generatedAt;
  return sanitizeCustomerVisiblePortalCopy(base);
};

const loadLedger = () => {
  const storage = getStorage();
  if (!storage) return clone(initialEpochLedger);
  try {
    return mergeLedger(JSON.parse(storage.getItem(EPOCH_LEDGER_KEY)));
  } catch {
    return clone(initialEpochLedger);
  }
};

const saveLedger = (nextLedger) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_LEDGER_KEY, JSON.stringify(nextLedger));
};

const EPOCH_CUSTOMER_SCHEDULE_STATUS_EXPORT_KEY = "epoch.webportal.customerScheduleStatusExports.v1";

const normalizeCustomerScheduleStatusExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.providerCallsEnabled !== true &&
    item.monitorWorkflowExposed !== true;
  if (!customerSafe) return null;

  return {
    statusId: String(item.statusId || item.id || "local-schedule-status"),
    requestId: String(item.requestId || "schedule request"),
    status: String(item.status || "local-schedule-status-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your schedule status is ready."),
    nextAction: String(item.nextAction || "Review the returned timing status."),
    createdAtUtc: String(item.createdAtUtc || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.CustomerSafeStatusExport")
  };
};

const normalizeCustomerScheduleStatusPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.statuses)
      ? payload.statuses
      : payload?.statusId
        ? [payload]
        : [];
  return records
    .map(normalizeCustomerScheduleStatusExport)
    .filter(Boolean);
};

const loadCustomerScheduleStatusExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeCustomerScheduleStatusPayload(JSON.parse(storage.getItem(EPOCH_CUSTOMER_SCHEDULE_STATUS_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveCustomerScheduleStatusExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_CUSTOMER_SCHEDULE_STATUS_EXPORT_KEY, JSON.stringify(records));
};

const EPOCH_SCHEDULE_LIFECYCLE_STATUS_EXPORT_KEY = "epoch.webportal.scheduleLifecycleStatusExports.v1";

const normalizeScheduleLifecycleStatusExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.providerCallsEnabled !== true &&
    item.monitorWorkflowExposed !== true;
  if (!customerSafe) return null;

  return {
    statusId: String(item.statusId || item.id || "local-lifecycle-status"),
    actionId: String(item.actionId || "schedule lifecycle action"),
    requestId: String(item.requestId || "schedule request"),
    actionKind: String(item.actionKind || "lifecycle-action"),
    requestedWindow: String(item.requestedWindow || "Window to be confirmed"),
    status: String(item.status || "local-schedule-lifecycle-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your schedule change request is ready for review."),
    nextAction: String(item.nextAction || "Review the customer-safe schedule lifecycle status."),
    createdAtUtc: String(item.createdAtUtc || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.ScheduleLifecycleStatusExport")
  };
};

const normalizeScheduleLifecycleStatusPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.statuses)
      ? payload.statuses
      : payload?.statusId
        ? [payload]
        : [];
  return records
    .map(normalizeScheduleLifecycleStatusExport)
    .filter(Boolean);
};

const loadScheduleLifecycleStatusExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeScheduleLifecycleStatusPayload(JSON.parse(storage.getItem(EPOCH_SCHEDULE_LIFECYCLE_STATUS_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveScheduleLifecycleStatusExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_SCHEDULE_LIFECYCLE_STATUS_EXPORT_KEY, JSON.stringify(records));
};

const EPOCH_REVISED_REMINDER_DEADLINE_RECEIPT_EXPORT_KEY = "epoch.webportal.revisedReminderDeadlineReceipts.v1";

const normalizeRevisedReminderDeadlineReceiptExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.notificationSendEnabled !== true &&
    item.providerCallsEnabled !== true &&
    item.monitorWorkflowExposed !== true &&
    item.workshopCalendarOwnership !== true;
  if (!customerSafe) return null;

  return {
    receiptId: String(item.receiptId || item.id || "revised-reminder-deadline-receipt"),
    requestId: String(item.requestId || "schedule request"),
    revisedTimingPayloadId: String(item.revisedTimingPayloadId || "revised timing payload"),
    kind: String(item.kind || "revised-reminder-deadline-execution"),
    status: String(item.status || "customer-safe-revised-deadline-status-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your reminder/deadline status is ready."),
    nextAction: String(item.nextAction || "Review the customer-safe revised reminder/deadline status."),
    createdAtUtc: String(item.createdAtUtc || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.RevisedReminderDeadlineReceipt")
  };
};

const normalizeRevisedReminderDeadlineReceiptPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.receipts)
      ? payload.receipts
      : payload?.receiptId
        ? [payload]
        : [];
  return records
    .map(normalizeRevisedReminderDeadlineReceiptExport)
    .filter(Boolean);
};

const loadRevisedReminderDeadlineReceiptExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeRevisedReminderDeadlineReceiptPayload(JSON.parse(storage.getItem(EPOCH_REVISED_REMINDER_DEADLINE_RECEIPT_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveRevisedReminderDeadlineReceiptExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_REVISED_REMINDER_DEADLINE_RECEIPT_EXPORT_KEY, JSON.stringify(records));
};

const EPOCH_REVISED_AVAILABILITY_EXCEPTION_RECEIPT_EXPORT_KEY = "epoch.webportal.revisedAvailabilityExceptionReceipts.v1";

const normalizeRevisedAvailabilityExceptionReceiptExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.notificationSendEnabled !== true &&
    item.providerCallsEnabled !== true &&
    item.providerGoLiveRequested !== true &&
    item.monitorWorkflowExposed !== true &&
    item.workshopCalendarOwnership !== true &&
    item.revisedConversionReady !== true;
  if (!customerSafe) return null;

  return {
    receiptId: String(item.receiptId || item.id || "revised-availability-exception-receipt"),
    exceptionId: String(item.exceptionId || "revised availability exception"),
    requestId: String(item.requestId || "schedule request"),
    revisedTimingPayloadId: String(item.revisedTimingPayloadId || "revised timing payload"),
    availabilityWindowId: String(item.availabilityWindowId || "availability window"),
    recurringSeriesId: String(item.recurringSeriesId || "recurring series"),
    recurringInstanceId: String(item.recurringInstanceId || "recurring instance"),
    kind: String(item.kind || "revised-availability-exception"),
    status: String(item.status || "customer-safe-revised-availability-exception-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your recurring availability status is ready."),
    nextAction: String(item.nextAction || "Review the customer-safe revised availability exception."),
    createdAtUtc: String(item.createdAtUtc || item.generatedAt || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.RevisedAvailabilityExceptionReceipt")
  };
};

const normalizeRevisedAvailabilityExceptionReceiptPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.receipts)
      ? payload.receipts
      : payload?.receiptId || payload?.id
        ? [payload]
        : [];
  return records
    .map(normalizeRevisedAvailabilityExceptionReceiptExport)
    .filter(Boolean);
};

const loadRevisedAvailabilityExceptionReceiptExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeRevisedAvailabilityExceptionReceiptPayload(JSON.parse(storage.getItem(EPOCH_REVISED_AVAILABILITY_EXCEPTION_RECEIPT_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveRevisedAvailabilityExceptionReceiptExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_REVISED_AVAILABILITY_EXCEPTION_RECEIPT_EXPORT_KEY, JSON.stringify(records));
};

const EPOCH_REVISED_RULEPACK_APPROVAL_RECEIPT_EXPORT_KEY = "epoch.webportal.revisedRulepackApprovalReceipts.v1";

const normalizeRevisedRulepackApprovalReceiptExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.customerVisibleReceiptReady !== false &&
    item.providerCallsEnabled !== true &&
    item.providerGoLiveRequested !== true &&
    item.monitorWorkflowExposed !== true &&
    item.workshopCalendarOwnership !== true &&
    item.conversionReady !== true;
  if (!customerSafe) return null;

  return {
    receiptId: String(item.receiptId || item.id || "revised-rulepack-approval-receipt"),
    rulepackId: String(item.rulepackId || "revised calendar rulepack"),
    calendarSystem: String(item.calendarSystem || "revised-13-month"),
    kind: String(item.kind || "revised-rulepack-owner-decision"),
    status: String(item.status || "customer-safe-revised-rulepack-approval-held"),
    customerSafeMessage: String(item.customerSafeMessage || "Revised-calendar conversion is still held."),
    nextAction: String(item.nextAction || "Review the owner-approved rulepack decisions before enabling conversion."),
    createdAtUtc: String(item.createdAtUtc || item.generatedAt || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.RevisedRulepackApprovalReceipt")
  };
};

const normalizeRevisedRulepackApprovalReceiptPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.receipts)
      ? payload.receipts
      : payload?.receiptId || payload?.id
        ? [payload]
        : [];
  return records
    .map(normalizeRevisedRulepackApprovalReceiptExport)
    .filter(Boolean);
};

const loadRevisedRulepackApprovalReceiptExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeRevisedRulepackApprovalReceiptPayload(JSON.parse(storage.getItem(EPOCH_REVISED_RULEPACK_APPROVAL_RECEIPT_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveRevisedRulepackApprovalReceiptExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_REVISED_RULEPACK_APPROVAL_RECEIPT_EXPORT_KEY, JSON.stringify(records));
};

const state = {
  ledger: loadLedger()
};

const customerScheduleStatusExportState = {
  records: loadCustomerScheduleStatusExports()
};

const scheduleLifecycleStatusExportState = {
  records: loadScheduleLifecycleStatusExports()
};

const revisedReminderDeadlineReceiptExportState = {
  records: loadRevisedReminderDeadlineReceiptExports()
};

const revisedAvailabilityExceptionReceiptExportState = {
  records: loadRevisedAvailabilityExceptionReceiptExports()
};

const revisedRulepackApprovalReceiptExportState = {
  records: loadRevisedRulepackApprovalReceiptExports()
};

const byId = (id) => document.getElementById(id);

const chip = (value) => `<span class="state-chip">${escapeHtml(value)}</span>`;
const formatCountLabel = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;

const renderStack = (targetId, items, renderItem, emptyText = "No records yet.") => {
  const target = byId(targetId);
  if (!target) return;
  target.innerHTML = items.length
    ? items.map(renderItem).join("")
    : `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
};

const setText = (id, value) => {
  const target = byId(id);
  if (target) target.textContent = value;
};

const moduleRoute = (moduleId, focusId = "") => `#/${encodeURIComponent(moduleId)}${focusId ? `?focus=${encodeURIComponent(focusId)}` : ""}`;

const relationshipCue = (enabled, label, moduleId, focusId = "", detail = "") => enabled
  ? { label, moduleId, focusId, detail }
  : null;

const renderRelationshipCues = (cues, label = "Related records") => {
  const visibleCues = cues.filter(Boolean);
  if (!visibleCues.length) return "";
  return `
    <nav class="relationship-cues" aria-label="${escapeHtml(label)}">
      <span>${escapeHtml(label)}</span>
      ${visibleCues.map((cue) => `
        <a class="relationship-cue" href="${escapeHtml(moduleRoute(cue.moduleId, cue.focusId))}" title="${escapeHtml(cue.detail || cue.label)}">
          ${escapeHtml(cue.label)}
        </a>
      `).join("")}
    </nav>
  `;
};

const EPOCH_APP_MODULE_STORAGE_KEY = "epoch.app.activeModule.v1";

const EPOCH_APP_MODULES = [
  {
    id: "calendar-command",
    label: "Calendar Command",
    description: "Current schedule pressure, top timing decisions, and next scheduling actions.",
    sectionIds: ["epoch-calendar-command"],
    related: ["schedule-requests", "calendar-board", "availability-holds"]
  },
  {
    id: "calendar-board",
    label: "Calendar Board",
    description: "Calendar grid, current visible blocks, and display mode state.",
    sectionIds: ["calendar-board", "calendar-display-mode-list"],
    related: ["calendar-command", "availability-holds", "schedule-requests"]
  },
  {
    id: "schedule-requests",
    label: "Schedule Requests",
    description: "Incoming timing asks, request acceptance, handoffs, decisions, holds, and customer-safe status.",
    sectionIds: [
      "schedule-queue",
      "timing-handoff-list",
      "conflict-decision-list",
      "acceptance-list",
      "hold-list",
      "schedule-status-event-list",
      "timing-return-list",
      "timing-return-receipt-list"
    ],
    related: ["calendar-command", "calendar-board", "availability-holds"]
  },
  {
    id: "availability-holds",
    label: "Availability And Holds",
    description: "Open windows, capacity, waitlist, holds, releases, promotions, and capacity receipts.",
    sectionIds: [
      "availability-list",
      "capacity-snapshot-list",
      "waitlist-list",
      "hold-release-list",
      "promotion-candidate-list",
      "capacity-receipt-list",
      "conflict-decision-list",
      "hold-list"
    ],
    related: ["calendar-board", "bookings-recommendations", "recurring-schedules"]
  },
  {
    id: "bookings-recommendations",
    label: "Bookings And Recommendations",
    description: "Optimization runs, recommended windows, overload warnings, confirmations, and booking receipts.",
    sectionIds: [
      "booking-optimization-list",
      "booking-recommendation-list",
      "booking-overload-warning-list",
      "booking-recommendation-receipt-list",
      "booking-confirmation-list",
      "booking-receipt-list",
      "timing-return-list",
      "timing-return-receipt-list"
    ],
    related: ["calendar-board", "availability-holds", "receipts-audit"]
  },
  {
    id: "recurring-schedules",
    label: "Recurring Schedules",
    description: "Recurring candidates, series, instances, exceptions, revised exceptions, and series receipts.",
    sectionIds: [
      "recurrence-candidate-list",
      "recurring-series-list",
      "recurring-instance-list",
      "recurrence-exception-list",
      "revised-availability-exception-list",
      "revised-availability-exception-receipt-list",
      "app-revised-availability-exception-receipt-export",
      "recurring-series-receipt-list"
    ],
    related: ["availability-holds", "rules-integrations", "receipts-audit"]
  },
  {
    id: "reminders-deadlines",
    label: "Reminders And Deadlines",
    description: "Deadline items, reminder rules, executions, escalations, and reminder/deadline receipts.",
    sectionIds: [
      "deadline-list",
      "reminder-rule-list",
      "reminder-execution-list",
      "deadline-execution-list",
      "deadline-escalation-list",
      "reminder-deadline-receipt-list",
      "app-revised-reminder-deadline-receipts"
    ],
    related: ["schedule-requests", "recurring-schedules", "receipts-audit"]
  },
  {
    id: "rules-integrations",
    label: "Rules And Integrations",
    description: "Native core readiness, provider gates, revised calendar rules, constraints, and owner decisions.",
    sectionIds: [
      "native-core-readiness",
      "provider-readiness-list",
      "provider-check-list",
      "revised-calendar",
      "revised-rulepack-status",
      "revised-constraint-projection",
      "revised-rulepack-owner-decision-list",
      "revised-rulepack-approval-receipt-list",
      "app-revised-rulepack-approval-receipt-export"
    ],
    related: ["calendar-command", "recurring-schedules", "receipts-audit"]
  },
  {
    id: "receipts-audit",
    label: "Receipts And Audit",
    description: "Audits, receipts, scheduler log, search, templates, and proof history.",
    sectionIds: [
      "schedule-audit-list",
      "schedule-receipts-list",
      "scheduler-log-list",
      "calendar-search-query-list",
      "calendar-search-list",
      "schedule-template-list",
      "receipt-list"
    ],
    related: ["calendar-command", "rules-integrations", "settings-ledger"]
  },
  {
    id: "settings-ledger",
    label: "Settings And Ledger",
    description: "Local ledger reset, runtime boundary, native app state, and diagnostic metadata.",
    sectionIds: [
      "stat-schedule-requests",
      "reset-schedule-ledger",
      "receipt-list",
      "avalonia-shell-readiness"
    ],
    related: ["calendar-command", "rules-integrations", "schedule-requests"]
  }
];

const EPOCH_WEBPORTAL_MODULE_STORAGE_KEY = "epoch.webportal.activeModule.v1";

const EPOCH_WEBPORTAL_MODULES = [
  {
    id: "ask-time",
    label: "Ask For A Time",
    description: "Submit or update a customer-safe schedule request.",
    sectionIds: ["schedule-request-form", "schedule-lifecycle-action-form", "portal-schedule-lifecycle-actions"],
    related: ["schedule-status", "booking-options", "receipts-imports"]
  },
  {
    id: "schedule-status",
    label: "My Schedule Status",
    description: "Review accepted requests, timing handoffs, holds, confirmations, lifecycle status, and schedule updates.",
    sectionIds: [
      "portal-timeline",
      "customer-status-list",
      "portal-customer-schedule-status-export",
      "portal-schedule-lifecycle-status-export",
      "portal-acceptance-status",
      "portal-timing-handoff-status",
      "portal-availability-decision",
      "portal-hold-status",
      "portal-booking-status",
      "portal-schedule-status-events",
      "portal-provider-status",
      "portal-revised-status",
      "portal-revised-constraints",
      "portal-revised-rulepack-approval-status"
    ],
    related: ["ask-time", "booking-options", "receipts-imports"]
  },
  {
    id: "booking-options",
    label: "Booking Options",
    description: "Recommended windows, booking alternatives, overload explanations, and recommendation receipts.",
    sectionIds: [
      "portal-booking-recommendations",
      "portal-booking-overload-warnings",
      "portal-booking-recommendation-receipts",
      "portal-booking-status",
      "portal-booking-receipts"
    ],
    related: ["schedule-status", "waitlist-capacity", "receipts-imports"]
  },
  {
    id: "waitlist-capacity",
    label: "Waitlist And Capacity",
    description: "Open windows, capacity status, waitlist state, and promotion status.",
    sectionIds: ["portal-availability", "portal-capacity-status", "portal-waitlist-status", "portal-promotion-status"],
    related: ["booking-options", "recurring-schedule", "schedule-status"]
  },
  {
    id: "reminders-deadlines",
    label: "Reminders And Deadlines",
    description: "Reminder execution, deadline execution, escalation status, and revised deadline receipts.",
    sectionIds: [
      "portal-reminder-execution-status",
      "portal-deadline-execution-status",
      "portal-deadline-escalation-status",
      "portal-revised-reminder-deadline-receipts"
    ],
    related: ["schedule-status", "recurring-schedule", "receipts-imports"]
  },
  {
    id: "recurring-schedule",
    label: "Recurring Schedule",
    description: "Recurring series, instances, exceptions, revised availability exceptions, and related receipts.",
    sectionIds: [
      "portal-recurring-series-status",
      "portal-recurring-instance-status",
      "portal-recurring-exceptions",
      "portal-revised-availability-exceptions",
      "portal-revised-availability-exception-receipts",
      "portal-revised-availability-exception-receipt-export"
    ],
    related: ["waitlist-capacity", "reminders-deadlines", "receipts-imports"]
  },
  {
    id: "receipts-imports",
    label: "Receipts And Imports",
    description: "Customer-safe status imports, receipts, timing returns, audit rows, logs, search, and templates.",
    sectionIds: [
      "customer-schedule-status-import-form",
      "schedule-lifecycle-status-import-form",
      "revised-reminder-deadline-receipt-import-form",
      "revised-availability-exception-receipt-import-form",
      "revised-rulepack-approval-receipt-import-form",
      "portal-schedule-audit",
      "portal-schedule-receipts",
      "portal-scheduler-log",
      "portal-calendar-search",
      "portal-schedule-template",
      "portal-booking-receipts",
      "portal-timing-return-status",
      "portal-timing-return-receipts",
      "portal-revised-rulepack-approval-status",
      "portal-revised-rulepack-approval-receipt-export"
    ],
    related: ["schedule-status", "booking-options", "portal-help"]
  },
  {
    id: "portal-help",
    label: "Portal Help",
    description: "Understand what the scheduling portal handles and what stays internal.",
    sectionIds: ["epoch-portal-help-context"],
    related: ["ask-time", "schedule-status", "booking-options"]
  }
];

const makeModuleById = (modules) => new Map(modules.map((module) => [module.id, module]));
const makeSectionModuleLookup = (modules) => {
  const lookup = new Map();
  for (const module of modules) {
    for (const sectionId of module.sectionIds) {
      if (!lookup.has(sectionId)) lookup.set(sectionId, module.id);
    }
  }
  return lookup;
};

const epochAppModuleById = makeModuleById(EPOCH_APP_MODULES);
const epochAppSectionModuleLookup = makeSectionModuleLookup(EPOCH_APP_MODULES);
const epochWebportalModuleById = makeModuleById(EPOCH_WEBPORTAL_MODULES);
const epochWebportalSectionModuleLookup = makeSectionModuleLookup(EPOCH_WEBPORTAL_MODULES);

const epochAppRouteAliases = new Map([
  ["command", "calendar-command"],
  ["calendar", "calendar-command"],
  ["calendar-board", "calendar-board"],
  ["board", "calendar-board"],
  ["requests", "schedule-requests"],
  ["availability", "availability-holds"],
  ["holds", "availability-holds"],
  ["bookings", "bookings-recommendations"],
  ["recommendations", "bookings-recommendations"],
  ["recurring", "recurring-schedules"],
  ["reminders", "reminders-deadlines"],
  ["deadlines", "reminders-deadlines"],
  ["rules", "rules-integrations"],
  ["integrations", "rules-integrations"],
  ["receipts", "receipts-audit"],
  ["audit", "receipts-audit"],
  ["settings", "settings-ledger"],
  ["ledger", "settings-ledger"]
]);

const epochWebportalRouteAliases = new Map([
  ["request", "ask-time"],
  ["ask", "ask-time"],
  ["status", "schedule-status"],
  ["my-schedule-status", "schedule-status"],
  ["booking", "booking-options"],
  ["bookings", "booking-options"],
  ["options", "booking-options"],
  ["waitlist", "waitlist-capacity"],
  ["capacity", "waitlist-capacity"],
  ["reminders", "reminders-deadlines"],
  ["deadlines", "reminders-deadlines"],
  ["recurring", "recurring-schedule"],
  ["receipts", "receipts-imports"],
  ["imports", "receipts-imports"],
  ["help", "portal-help"]
]);

const resolveModuleId = (moduleId, moduleById, routeAliases, fallbackModuleId) => {
  if (moduleById.has(moduleId)) return moduleId;
  const alias = routeAliases.get(moduleId);
  return moduleById.has(alias) ? alias : fallbackModuleId;
};

const getPanelForSectionId = (sectionId) => {
  const target = byId(sectionId);
  if (!target) return null;
  return target.classList.contains("panel") ? target : target.closest(".panel");
};

function getModuleRouteState(storageKey, moduleById, sectionModuleLookup, routeAliases, fallbackId) {
  const storage = getStorage();
  const savedModule = storage?.getItem(storageKey) || fallbackId;
  const fallbackModuleId = moduleById.has(savedModule) ? savedModule : fallbackId;
  const cleanHash = decodeURIComponent((window.location.hash || "").replace(/^#/, ""));
  if (!cleanHash) return { moduleId: fallbackModuleId, focusId: "" };

  if (cleanHash.startsWith("/")) {
    const [routePart, query = ""] = cleanHash.slice(1).split("?");
    const params = new URLSearchParams(query);
    const moduleId = resolveModuleId(routePart, moduleById, routeAliases, fallbackModuleId);
    return { moduleId, focusId: params.get("focus") || "" };
  }

  return {
    moduleId: sectionModuleLookup.get(cleanHash) || fallbackModuleId,
    focusId: cleanHash
  };
}

function renderModuleNav(navId, modules, linkAttribute) {
  const nav = byId(navId);
  if (!nav) return;
  nav.innerHTML = modules.map((module) => `
    <button class="crm-module-link" type="button" ${linkAttribute}="${escapeHtml(module.id)}">
      <strong>${escapeHtml(module.label)}</strong>
      <small>${escapeHtml(module.description)}</small>
    </button>
  `).join("");
}

function mountModulePanels(modules, panelSelector, moduleDataAttribute, fallbackModuleId) {
  const assignedPanels = new Set();
  for (const module of modules) {
    for (const sectionId of module.sectionIds) {
      const panel = getPanelForSectionId(sectionId);
      if (!panel || assignedPanels.has(panel)) continue;
      panel.dataset[moduleDataAttribute] = module.id;
      panel.classList.add("crm-module-panel");
      assignedPanels.add(panel);
    }
  }

  for (const panel of document.querySelectorAll(panelSelector)) {
    if (assignedPanels.has(panel)) continue;
    panel.dataset[moduleDataAttribute] = fallbackModuleId;
    panel.classList.add("crm-module-panel");
  }
}

function activateModule({
  moduleId,
  focusId = "",
  moduleById,
  fallbackModuleId,
  storageKey,
  bodyDataAttribute,
  titleId,
  descriptionId,
  relatedId,
  panelSelector,
  moduleDataAttribute,
  linkSelector,
  relatedPrefix
}) {
  const module = moduleById.get(moduleId) || moduleById.get(fallbackModuleId);
  const activeModuleId = module.id;
  const storage = getStorage();
  if (storage) storage.setItem(storageKey, activeModuleId);
  document.body.dataset[bodyDataAttribute] = activeModuleId;

  setText(titleId, module.label);
  setText(descriptionId, module.description);
  const relatedLabels = module.related
    .map((id) => moduleById.get(id)?.label)
    .filter(Boolean);
  setText(relatedId, relatedLabels.length
    ? `${relatedPrefix}: ${relatedLabels.join(", ")}.`
    : `${relatedPrefix} appear here.`);

  for (const panel of document.querySelectorAll(panelSelector)) {
    panel.hidden = panel.dataset[moduleDataAttribute] !== activeModuleId;
  }

  for (const link of document.querySelectorAll(linkSelector)) {
    const current = link.getAttribute(linkSelector.match(/\[(.+)\]/)?.[1] || "") === activeModuleId;
    link.setAttribute("aria-current", current ? "page" : "false");
  }

  if (focusId) {
    const panel = getPanelForSectionId(focusId);
    if (panel && panel.dataset[moduleDataAttribute] === activeModuleId) {
      window.requestAnimationFrame(() => panel.scrollIntoView({ block: "start" }));
    }
  }
}

function initializeEpochAppModuleShell() {
  if (!document.body?.classList.contains("app-surface") || !byId("epoch-app-module-nav")) return;
  renderModuleNav("epoch-app-module-nav", EPOCH_APP_MODULES, "data-epoch-app-module-link");
  mountModulePanels(EPOCH_APP_MODULES, ".workspace-grid > .panel", "epochAppModule", "receipts-audit");

  byId("epoch-app-module-nav")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-epoch-app-module-link]");
    if (!button) return;
    const moduleId = button.getAttribute("data-epoch-app-module-link");
    if (!epochAppModuleById.has(moduleId)) return;
    window.location.hash = `/${moduleId}`;
    activateEpochAppModule(moduleId);
  });

  const routeState = getModuleRouteState(EPOCH_APP_MODULE_STORAGE_KEY, epochAppModuleById, epochAppSectionModuleLookup, epochAppRouteAliases, "calendar-command");
  activateEpochAppModule(routeState.moduleId, routeState.focusId);
  window.addEventListener("hashchange", () => {
    const nextRouteState = getModuleRouteState(EPOCH_APP_MODULE_STORAGE_KEY, epochAppModuleById, epochAppSectionModuleLookup, epochAppRouteAliases, "calendar-command");
    activateEpochAppModule(nextRouteState.moduleId, nextRouteState.focusId);
  });
}

function activateEpochAppModule(moduleId, focusId = "") {
  activateModule({
    moduleId,
    focusId,
    moduleById: epochAppModuleById,
    fallbackModuleId: "calendar-command",
    storageKey: EPOCH_APP_MODULE_STORAGE_KEY,
    bodyDataAttribute: "epochAppModule",
    titleId: "epoch-app-module-title",
    descriptionId: "epoch-app-module-description",
    relatedId: "epoch-app-module-related",
    panelSelector: ".crm-module-panel",
    moduleDataAttribute: "epochAppModule",
    linkSelector: "[data-epoch-app-module-link]",
    relatedPrefix: "Related schedule modules"
  });
}

function initializeEpochWebportalModuleShell() {
  if (!document.body?.classList.contains("portal-surface") || !byId("epoch-webportal-module-nav")) return;
  renderModuleNav("epoch-webportal-module-nav", EPOCH_WEBPORTAL_MODULES, "data-epoch-webportal-module-link");
  mountModulePanels(EPOCH_WEBPORTAL_MODULES, ".portal-grid > .panel", "epochWebportalModule", "receipts-imports");

  byId("epoch-webportal-module-nav")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-epoch-webportal-module-link]");
    if (!button) return;
    const moduleId = button.getAttribute("data-epoch-webportal-module-link");
    if (!epochWebportalModuleById.has(moduleId)) return;
    window.location.hash = `/${moduleId}`;
    activateEpochWebportalModule(moduleId);
  });

  const routeState = getModuleRouteState(EPOCH_WEBPORTAL_MODULE_STORAGE_KEY, epochWebportalModuleById, epochWebportalSectionModuleLookup, epochWebportalRouteAliases, "ask-time");
  activateEpochWebportalModule(routeState.moduleId, routeState.focusId);
  window.addEventListener("hashchange", () => {
    const nextRouteState = getModuleRouteState(EPOCH_WEBPORTAL_MODULE_STORAGE_KEY, epochWebportalModuleById, epochWebportalSectionModuleLookup, epochWebportalRouteAliases, "ask-time");
    activateEpochWebportalModule(nextRouteState.moduleId, nextRouteState.focusId);
  });
}

function activateEpochWebportalModule(moduleId, focusId = "") {
  activateModule({
    moduleId,
    focusId,
    moduleById: epochWebportalModuleById,
    fallbackModuleId: "ask-time",
    storageKey: EPOCH_WEBPORTAL_MODULE_STORAGE_KEY,
    bodyDataAttribute: "epochWebportalModule",
    titleId: "epoch-webportal-module-title",
    descriptionId: "epoch-webportal-module-description",
    relatedId: "epoch-webportal-module-related",
    panelSelector: ".crm-module-panel",
    moduleDataAttribute: "epochWebportalModule",
    linkSelector: "[data-epoch-webportal-module-link]",
    relatedPrefix: "Related scheduling modules"
  });
}

const renderNeedOptions = () => {
  const target = byId("schedule-need-select");
  if (!target) return;
  target.innerHTML = scheduleNeedOptions.map((option) => `
    <option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>
  `).join("");
};

const renderLifecycleActionOptions = () => {
  const target = byId("schedule-lifecycle-action-select");
  if (!target) return;
  target.innerHTML = scheduleLifecycleActionOptions.map((option) => `
    <option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>
  `).join("");
};

function renderStats() {
  const gates = state.ledger.providerReadinessGates;
  const blockedGateCount = gates.filter((gate) => providerGateBlocksLiveCalls(gate)).length;
  const openWindowCount = state.ledger.availabilityWindows.filter((window) => window.holds < window.capacity).length;
  setText("stat-schedule-requests", String(state.ledger.scheduleRequests.length));
  setText("stat-open-windows", String(openWindowCount));
  setText("stat-provider-blocks", String(blockedGateCount));
  setText("stat-live-state", gates.some((gate) => gate.liveProviderCallsEnabled) ? "Live enabled" : "Sandbox only");
  setText("stat-core-state", state.ledger.schedulingCoreReadiness?.scheduleEntryValidation || "pending");
  setText("stat-rulepack-state", revisedRulepackReady(state.ledger.revisedCalendarRulepack) ? "ready" : "held");
  setText("stat-accepted-requests", String((state.ledger.scheduleRequestAcceptances || []).length));
  setText("stat-active-holds", String((state.ledger.availabilityHolds || []).filter((hold) => hold.status !== "released").length));
  setText("stat-bookings", String((state.ledger.bookingConfirmations || []).length));
  setText("stat-booking-receipts", String((state.ledger.bookingReceipts || []).length));
  setText("stat-timing-handoffs", String((state.ledger.timingHandoffs || []).length));
  setText("stat-conflicts", String((state.ledger.availabilityConflictDecisions || []).filter((decision) => decision.status !== "clear").length));
  setText("stat-timing-returns", String((state.ledger.timingReturnPayloads || []).length));
  setText("stat-return-receipts", String((state.ledger.timingReturnReceipts || []).length));
  setText("stat-recurring-series", String((state.ledger.recurringBookingSeries || []).length));
  setText("stat-series-instances", String((state.ledger.recurringBookingInstances || []).length));
  setText("stat-series-exceptions", String((state.ledger.recurrenceConflictExceptions || []).length));
  setText("stat-rulepack-decisions", String((state.ledger.revisedRulepackOwnerDecisions || []).length));
  setText("stat-rulepack-approval-receipts", String((state.ledger.revisedRulepackApprovalReceipts || []).length));
  setText("stat-revised-availability-exceptions", String((state.ledger.revisedAvailabilityExceptions || []).length));
  setText("stat-revised-availability-receipts", String((state.ledger.revisedAvailabilityExceptionReceipts || []).length));
  setText("stat-series-receipts", String((state.ledger.recurringSeriesReceipts || []).length));
  setText("stat-capacity-snapshots", String((state.ledger.availabilityCapacitySnapshots || []).length));
  setText("stat-waitlist", String((state.ledger.availabilityWaitlistEntries || []).filter((entry) => entry.status === "waitlisted").length));
  setText("stat-hold-releases", String((state.ledger.availabilityHoldReleases || []).length));
  setText("stat-promotions", String((state.ledger.availabilityPromotionCandidates || []).length));
  setText("stat-capacity-receipts", String((state.ledger.availabilityCapacityReceipts || []).length));
  setText("stat-optimization-runs", String((state.ledger.bookingOptimizationRuns || []).length));
  setText("stat-recommendations", String((state.ledger.bookingRecommendationCandidates || []).length));
  setText("stat-overload-warnings", String((state.ledger.bookingOverloadWarnings || []).length));
  setText("stat-recommendation-receipts", String((state.ledger.bookingRecommendationReceipts || []).length));
  setText("stat-reminder-executions", String((state.ledger.reminderExecutions || []).length));
  setText("stat-deadline-executions", String((state.ledger.deadlineExecutions || []).length));
  setText("stat-deadline-escalations", String((state.ledger.deadlineEscalations || []).length));
  setText("stat-reminder-deadline-receipts", String((state.ledger.reminderDeadlineReceipts || []).length));
  setText("stat-schedule-audits", String((state.ledger.scheduleAuditRecords || []).length));
  setText("stat-schedule-module-receipts", String((state.ledger.scheduleReceipts || []).length));
  setText("stat-scheduler-log", String((state.ledger.schedulerLogEntries || []).length));
  setText("stat-calendar-search", String((state.ledger.calendarSearchResults || []).length));
  setText("stat-schedule-templates", String((state.ledger.scheduleTemplates || []).length));
}

function renderEpochCommandCenter() {
  const target = byId("epoch-command-kpi-grid");
  if (!target) return;

  const ledger = state.ledger;
  const openWindows = (ledger.availabilityWindows || []).filter((item) => item.holds < item.capacity);
  const activeHolds = (ledger.availabilityHolds || []).filter((hold) => hold.status !== "released");
  const waitlisted = (ledger.availabilityWaitlistEntries || []).filter((entry) => entry.status === "waitlisted");
  const conflicts = (ledger.availabilityConflictDecisions || []).filter((decision) => decision.status !== "clear");
  const remindersDue = (ledger.reminderExecutions || []).filter((item) => item.customerVisible).length +
    (ledger.deadlineExecutions || []).filter((item) => item.customerVisible).length +
    (ledger.deadlineEscalations || []).filter((item) => item.customerVisible).length;
  const recurringPressure = (ledger.recurringBookingSeries || []).length +
    (ledger.recurringBookingInstances || []).length +
    (ledger.recurrenceConflictExceptions || []).length +
    (ledger.revisedAvailabilityExceptions || []).length;
  const recommendationPressure = (ledger.bookingRecommendationCandidates || []).length +
    (ledger.bookingOverloadWarnings || []).length +
    (ledger.bookingRecommendationReceipts || []).length;
  const rulePressure = (ledger.revisedRulepackOwnerDecisions || []).length +
    (ledger.revisedRulepackApprovalReceipts || []).length +
    (revisedRulepackReady(ledger.revisedCalendarRulepack) ? 0 : 1);

  const kpis = [
    ["Schedule requests", String((ledger.scheduleRequests || []).length), "Customer timing asks in the local schedule queue."],
    ["Open windows", String(openWindows.length), "Available windows that can still absorb holds or bookings."],
    ["Active holds", String(activeHolds.length), "Held windows awaiting confirmation, release, or booking."],
    ["Waitlist", String(waitlisted.length), "Requests waiting for capacity or promotion."],
    ["Booking signals", String(recommendationPressure), "Recommendations, alternatives, and recommendation proof rows."],
    ["Recurring pressure", String(recurringPressure), "Series, instances, exceptions, and revised exception rows."],
    ["Reminder/deadline", String(remindersDue), "Customer-visible reminder, deadline, and escalation rows."],
    ["Rules", String(rulePressure), "Rulepack decisions, approval receipts, or held rule status."]
  ];

  target.innerHTML = kpis.map(([label, value, detail]) => `
    <article class="command-kpi">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `).join("");

  setText(
    "epoch-command-summary",
    `${formatCountLabel((ledger.scheduleRequests || []).length, "schedule request")} with ${formatCountLabel(openWindows.length, "open window")} and ${formatCountLabel(activeHolds.length, "active hold")}. EPOCH owns timing decisions; WORKSHOP stays revenue and delivery.`
  );

  const priorityWork = [
    (ledger.scheduleRequests || []).length && {
      label: "Schedule requests",
      detail: `${formatCountLabel((ledger.scheduleRequests || []).length, "request")} need acceptance, handoff, conflict, hold, or booking review.`,
      status: "request queue",
      moduleId: "schedule-requests",
      focusId: "schedule-queue"
    },
    openWindows.length && {
      label: "Availability and holds",
      detail: `${formatCountLabel(openWindows.length, "open window")} can support capacity, waitlist, hold, or promotion decisions.`,
      status: "capacity",
      moduleId: "availability-holds",
      focusId: "availability-list"
    },
    recommendationPressure && {
      label: "Booking recommendations",
      detail: `${formatCountLabel(recommendationPressure, "booking signal")} are ready for recommendation or alternative review.`,
      status: "booking",
      moduleId: "bookings-recommendations",
      focusId: "booking-recommendation-list"
    },
    recurringPressure && {
      label: "Recurring schedules",
      detail: `${formatCountLabel(recurringPressure, "recurring signal")} need series, instance, exception, or revised availability review.`,
      status: "recurring",
      moduleId: "recurring-schedules",
      focusId: "recurring-series-list"
    },
    remindersDue && {
      label: "Reminders and deadlines",
      detail: `${formatCountLabel(remindersDue, "customer-visible reminder/deadline row")} are staged for follow-up review.`,
      status: "deadline",
      moduleId: "reminders-deadlines",
      focusId: "reminder-execution-list"
    },
    rulePressure && {
      label: "Rules and integrations",
      detail: "Rulepack, revised calendar, native core, and provider gates should stay controlled before live scheduling.",
      status: "rules",
      moduleId: "rules-integrations",
      focusId: "revised-rulepack-status"
    }
  ].filter(Boolean).slice(0, 6);

  renderStack("epoch-command-urgent-list", priorityWork, (item) => `
    <a class="command-row" href="${escapeHtml(moduleRoute(item.moduleId, item.focusId))}">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      ${chip(item.status)}
    </a>
  `, "No urgent timing decisions are staged.");

  const nextActions = [
    ["schedule-requests", "schedule-queue", "Review timing requests", "Open request acceptance, handoff, conflict, and hold state."],
    ["availability-holds", "availability-list", "Check open capacity", "Open windows, waitlist, capacity, holds, releases, and promotions."],
    ["bookings-recommendations", "booking-recommendation-list", "Compare booking options", "Open optimization runs, recommended windows, alternatives, and receipts."],
    ["recurring-schedules", "recurring-series-list", "Review recurring schedules", "Open recurring series, instances, exceptions, and revised availability."],
    ["rules-integrations", "revised-rulepack-status", "Confirm rule constraints", "Open provider gates, rulepack decisions, constraints, and core readiness."]
  ];

  renderStack("epoch-command-next-actions", nextActions, ([moduleId, focusId, label, detail]) => `
    <a class="command-row command-row-secondary" href="${escapeHtml(moduleRoute(moduleId, focusId))}">
      <div>
        <strong>${escapeHtml(label)}</strong>
        <p>${escapeHtml(detail)}</p>
      </div>
      <span class="state-chip">open</span>
    </a>
  `, "No next actions are configured.");
}

function renderScheduleQueue() {
  renderStack("schedule-queue", state.ledger.scheduleEntries, (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail)}</p>
        <small>${escapeHtml(item.customerSafeStatus)}</small>
        ${renderRelationshipCues([
          relationshipCue(true, "Calendar board", "calendar-board", "calendar-board", "Open the visible calendar block."),
          relationshipCue(true, "Availability", "availability-holds", "availability-list", "Open windows, capacity, and holds."),
          relationshipCue(true, "Booking options", "bookings-recommendations", "booking-recommendation-list", "Open recommendations and confirmations."),
          relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open schedule receipts and audit rows.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.time)}</span>
      </div>
    </article>
  `);
}

function renderCalendarBoard() {
  const board = byId("calendar-board");
  if (!board) return;
  board.innerHTML = state.ledger.scheduleEntries.map((item, index) => `
    <article class="calendar-event event-${(index % 3) + 1}">
      <span>${escapeHtml(item.time)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.status)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request state."),
        relationshipCue(true, "Availability", "availability-holds", "availability-list", "Open availability and holds."),
        relationshipCue(true, "Booking", "bookings-recommendations", "booking-confirmation-list", "Open booking status."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open receipts and audit.")
      ])}
    </article>
  `).join("");
}

function renderProductModules() {
  renderStack("calendar-display-mode-list", state.ledger.calendarDisplayModes || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("schedule-audit-list", state.ledger.scheduleAuditRecords || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.action)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.scheduleEntryId)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.scheduleEntryId), "Calendar board", "calendar-board", "calendar-board", "Open calendar board."),
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule requests."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open related receipts.")
      ])}
    </article>
  `);

  renderStack("schedule-receipts-list", state.ledger.scheduleReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.kind)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.linkedRecordId)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule requests."),
        relationshipCue(true, "Bookings", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations."),
        relationshipCue(true, "Audit", "receipts-audit", "schedule-audit-list", "Open schedule audit.")
      ])}
    </article>
  `);

  renderStack("scheduler-log-list", state.ledger.schedulerLogEntries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.eventKind)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.recordedAt)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule requests."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("calendar-search-list", state.ledger.calendarSearchResults || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.displayLabel)}</strong>
      <span>${escapeHtml(item.recordKind)} - ${escapeHtml(item.recordId)}</span>
      <small>Customer-safe result: ${escapeHtml(item.customerVisible ? "yes" : "no")}</small>
    </article>
  `);

  renderStack("calendar-search-query-list", state.ledger.calendarSearchQueries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.query)}</strong>
      <span>${escapeHtml(item.role)} - ${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeOnly ? "customer-safe only" : "owner/admin search")}</small>
    </article>
  `);

  renderStack("schedule-template-list", state.ledger.scheduleTemplates || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.templateKind)} - ${escapeHtml(item.defaultDurationLabel)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-schedule-audit", (state.ledger.scheduleAuditRecords || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.action)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-schedule-receipts", (state.ledger.scheduleReceipts || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.kind)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-scheduler-log", (state.ledger.schedulerLogEntries || []).filter((item) => item.productLog && !item.monitorRunnerLog), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.eventKind)}</strong>
      <span>${escapeHtml(item.recordedAt)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-calendar-search", (state.ledger.calendarSearchResults || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.displayLabel)}</strong>
      <span>${escapeHtml(item.recordKind)}</span>
      <small>Limited to customer-safe calendar results.</small>
    </article>
  `);

  renderStack("portal-schedule-template", (state.ledger.scheduleTemplates || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.defaultDurationLabel)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("avalonia-shell-readiness", state.ledger.avaloniaShellReadiness ? [state.ledger.avaloniaShellReadiness] : [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.host)} App Host</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.nativeCore)}</span>
      <small>${escapeHtml(item.nextAction)}</small>
    </article>
  `);
}

function renderAvailability() {
  const renderWindow = (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.time)}</span>
      <small>${escapeHtml(item.capacity - item.holds)} open of ${escapeHtml(item.capacity)} · ${escapeHtml(item.status)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Holds", "availability-holds", "hold-list", "Open holds for available windows."),
        relationshipCue(true, "Capacity", "availability-holds", "capacity-snapshot-list", "Open capacity snapshots."),
        relationshipCue(true, "Booking options", "bookings-recommendations", "booking-recommendation-list", "Open booking recommendations."),
        relationshipCue(true, "Calendar board", "calendar-board", "calendar-board", "Open calendar board.")
      ])}
    </article>
  `;
  const renderPortalWindow = (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.time)}</span>
      <small>${escapeHtml(item.capacity - item.holds)} open of ${escapeHtml(item.capacity)} · ${escapeHtml(item.status)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open customer-safe booking options."),
        relationshipCue(true, "Waitlist", "waitlist-capacity", "portal-waitlist-status", "Open waitlist and capacity status.")
      ])}
    </article>
  `;
  renderStack("availability-list", state.ledger.availabilityWindows, renderWindow);
  renderStack("portal-availability", state.ledger.availabilityWindows, renderPortalWindow);

  renderStack("capacity-snapshot-list", state.ledger.availabilityCapacitySnapshots || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.holds)} of ${escapeHtml(item.capacity)} held</span>
      <small>${escapeHtml(item.waitlistCount)} waitlisted / ${escapeHtml(item.promotionCandidateCount)} promotions - ${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.availabilityWindowId), "Window", "availability-holds", "availability-list", "Open availability windows."),
        relationshipCue((state.ledger.availabilityWaitlistEntries || []).some((entry) => entry.availabilityWindowId === item.availabilityWindowId), "Waitlist", "availability-holds", "waitlist-list", "Open waitlist entries."),
        relationshipCue(true, "Booking options", "bookings-recommendations", "booking-recommendation-list", "Open booking candidates."),
        relationshipCue(true, "Capacity receipt", "availability-holds", "capacity-receipt-list", "Open capacity receipts.")
      ])}
    </article>
  `);

  renderStack("waitlist-list", state.ledger.availabilityWaitlistEntries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.scheduleRequestId)}</strong>
      <span>${escapeHtml(item.status)} - priority ${escapeHtml(item.priority)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.scheduleRequestId), "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request state."),
        relationshipCue(Boolean(item.availabilityWindowId), "Capacity", "availability-holds", "capacity-snapshot-list", "Open capacity snapshot."),
        relationshipCue(true, "Booking options", "bookings-recommendations", "booking-recommendation-list", "Open booking options."),
        relationshipCue(true, "Promotion", "availability-holds", "promotion-candidate-list", "Open promotion candidates.")
      ])}
    </article>
  `);

  renderStack("hold-release-list", state.ledger.availabilityHoldReleases || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityHoldId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.availabilityHoldId), "Hold", "availability-holds", "hold-list", "Open availability holds."),
        relationshipCue(Boolean(item.availabilityWindowId), "Window", "availability-holds", "availability-list", "Open availability windows."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("promotion-candidate-list", state.ledger.availabilityPromotionCandidates || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.waitlistEntryId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.waitlistEntryId), "Waitlist", "availability-holds", "waitlist-list", "Open waitlist entries."),
        relationshipCue(Boolean(item.availabilityWindowId), "Window", "availability-holds", "availability-list", "Open availability windows."),
        relationshipCue(true, "Booking options", "bookings-recommendations", "booking-recommendation-list", "Open booking recommendations.")
      ])}
    </article>
  `);

  renderStack("capacity-receipt-list", state.ledger.availabilityCapacityReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Capacity", "availability-holds", "capacity-snapshot-list", "Open capacity snapshots."),
        relationshipCue(true, "Waitlist", "availability-holds", "waitlist-list", "Open waitlist state."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open audit receipts.")
      ])}
    </article>
  `);

  renderStack("booking-optimization-list", state.ledger.bookingOptimizationRuns || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.scheduleRequestId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.candidateCount)} candidates</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.scheduleRequestId), "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(true, "Availability", "availability-holds", "availability-list", "Open availability windows."),
        relationshipCue(true, "Recommendations", "bookings-recommendations", "booking-recommendation-list", "Open ranked candidates."),
        relationshipCue(true, "Receipts", "bookings-recommendations", "booking-recommendation-receipt-list", "Open recommendation receipts.")
      ])}
    </article>
  `);

  renderStack("booking-recommendation-list", state.ledger.bookingRecommendationCandidates || [], (item) => `
    <article class="mini-row">
      <strong>#${escapeHtml(item.rank)} ${escapeHtml(item.label || item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)} - score ${escapeHtml(item.score)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.scheduleRequestId), "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(Boolean(item.availabilityWindowId), "Availability", "availability-holds", "availability-list", "Open availability window."),
        relationshipCue(true, "Confirmation", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations."),
        relationshipCue(true, "Receipts", "bookings-recommendations", "booking-recommendation-receipt-list", "Open recommendation receipts.")
      ])}
    </article>
  `);

  renderStack("booking-overload-warning-list", state.ledger.bookingOverloadWarnings || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.loadRatioPercent)}% held</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.availabilityWindowId), "Availability", "availability-holds", "availability-list", "Open availability window."),
        relationshipCue(true, "Capacity", "availability-holds", "capacity-snapshot-list", "Open capacity snapshot."),
        relationshipCue(true, "Alternatives", "bookings-recommendations", "booking-recommendation-list", "Open alternate booking candidates.")
      ])}
    </article>
  `);

  renderStack("booking-recommendation-receipt-list", state.ledger.bookingRecommendationReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule requests."),
        relationshipCue(true, "Recommendations", "bookings-recommendations", "booking-recommendation-list", "Open booking recommendations."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open audit receipts.")
      ])}
    </article>
  `);

  renderStack("portal-booking-recommendations", (state.ledger.bookingRecommendationCandidates || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.recommendationType === "best-fit" ? "Recommended window" : "Alternate window")}</strong>
      <span>${escapeHtml(item.recommendedWindow || item.availabilityWindowId)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-booking-status", "Open booking status."),
        relationshipCue(true, "Capacity", "waitlist-capacity", "portal-capacity-status", "Open capacity status."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-booking-receipts", "Open booking receipts.")
      ])}
    </article>
  `);

  renderStack("portal-booking-overload-warnings", (state.ledger.bookingOverloadWarnings || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Availability warning</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options."),
        relationshipCue(true, "Capacity", "waitlist-capacity", "portal-capacity-status", "Open capacity status.")
      ])}
    </article>
  `);

  renderStack("portal-booking-recommendation-receipts", (state.ledger.bookingRecommendationReceipts || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.generatedAt || "")}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-booking-receipts", "Open booking receipts.")
      ])}
    </article>
  `);

  renderStack("portal-waitlist-status", (state.ledger.availabilityWaitlistEntries || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Waitlist priority ${escapeHtml(item.priority)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options."),
        relationshipCue(true, "Capacity", "waitlist-capacity", "portal-capacity-status", "Open capacity status.")
      ])}
    </article>
  `);

  renderStack("portal-capacity-status", (state.ledger.availabilityCapacitySnapshots || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options."),
        relationshipCue(true, "Waitlist", "waitlist-capacity", "portal-waitlist-status", "Open waitlist status.")
      ])}
    </article>
  `);

  renderStack("portal-promotion-status", (state.ledger.availabilityPromotionCandidates || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Waitlist promotion</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Waitlist", "waitlist-capacity", "portal-waitlist-status", "Open waitlist status."),
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options.")
      ])}
    </article>
  `);
}

function renderBookingWorkflow() {
  renderStack("timing-handoff-list", state.ledger.timingHandoffs || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.sourceProduct)} timing handoff</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.requestedWindow)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(true, "Availability", "availability-holds", "availability-list", "Open availability decisions."),
        relationshipCue(true, "Booking options", "bookings-recommendations", "booking-recommendation-list", "Open booking options."),
        relationshipCue(true, "Timing return", "bookings-recommendations", "timing-return-list", "Open timing return payloads.")
      ])}
    </article>
  `);

  renderStack("conflict-decision-list", state.ledger.availabilityConflictDecisions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.conflictType)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId || "no window")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(Boolean(item.availabilityWindowId), "Availability", "availability-holds", "availability-list", "Open availability window."),
        relationshipCue(true, "Timing return", "bookings-recommendations", "timing-return-list", "Open timing return state.")
      ])}
    </article>
  `);

  renderStack("acceptance-list", state.ledger.scheduleRequestAcceptances || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(Boolean(item.availabilityWindowId), "Hold", "availability-holds", "hold-list", "Open hold state."),
        relationshipCue(true, "Booking", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("hold-list", state.ledger.availabilityHolds || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId || "operator-selected window")}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.timezone)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(Boolean(item.availabilityWindowId), "Availability", "availability-holds", "availability-list", "Open availability window."),
        relationshipCue(true, "Confirmation", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations."),
        relationshipCue(true, "Hold release", "availability-holds", "hold-release-list", "Open hold releases.")
      ])}
    </article>
  `);

  renderStack("booking-confirmation-list", state.ledger.bookingConfirmations || [], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.requester)}</strong>
        <p>${escapeHtml(item.customerSafeStatus)}</p>
        <small>${escapeHtml(item.scheduleEntryId || "local entry pending")}</small>
        ${renderRelationshipCues([
          relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
          relationshipCue(true, "Availability hold", "availability-holds", "hold-list", "Open hold state."),
          relationshipCue(true, "Booking receipt", "bookings-recommendations", "booking-receipt-list", "Open booking receipts."),
          relationshipCue(true, "Timing return", "bookings-recommendations", "timing-return-list", "Open timing return payloads.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.confirmedWindow)}</span>
      </div>
    </article>
  `);

  renderStack("schedule-status-event-list", state.ledger.scheduleStatusEvents || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.state)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(true, "Booking", "bookings-recommendations", "booking-confirmation-list", "Open booking state."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("booking-receipt-list", state.ledger.bookingReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Booking", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations."),
        relationshipCue(true, "Timing return", "bookings-recommendations", "timing-return-list", "Open timing return state."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open audit receipts.")
      ])}
    </article>
  `);

  renderStack("timing-return-list", state.ledger.timingReturnPayloads || [], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.returnType)} - ${escapeHtml(item.requester || item.scheduleRequestId)}</strong>
        <p>${escapeHtml(item.customerSafeStatus)}</p>
        <small>${escapeHtml(item.timingHandoffId)}</small>
        ${renderRelationshipCues([
          relationshipCue(Boolean(item.scheduleRequestId), "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
          relationshipCue(Boolean(item.timingHandoffId), "Timing handoff", "schedule-requests", "timing-handoff-list", "Open timing handoff."),
          relationshipCue(true, "Booking", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations."),
          relationshipCue(true, "Receipts", "bookings-recommendations", "timing-return-receipt-list", "Open timing return receipts.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.requestedWindow || item.bookingConfirmationId || "reschedule")}</span>
      </div>
    </article>
  `);

  renderStack("timing-return-receipt-list", state.ledger.timingReturnReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Timing return", "bookings-recommendations", "timing-return-list", "Open timing return payloads."),
        relationshipCue(true, "Booking", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open audit receipts.")
      ])}
    </article>
  `);

  renderStack("portal-timing-handoff-status", state.ledger.timingHandoffs || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.sourceProduct)} timing</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-timing-return-receipts", "Open timing receipts.")
      ])}
    </article>
  `);

  renderStack("portal-availability-decision", state.ledger.availabilityConflictDecisions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status === "clear" ? "Availability clear" : "New window needed")}</strong>
      <span>${escapeHtml(item.conflictType)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Capacity", "waitlist-capacity", "portal-capacity-status", "Open capacity status."),
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options.")
      ])}
    </article>
  `);

  renderStack("portal-acceptance-status", state.ledger.scheduleRequestAcceptances || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Hold status", "schedule-status", "portal-hold-status", "Open hold status."),
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options.")
      ])}
    </article>
  `);

  renderStack("portal-hold-status", state.ledger.availabilityHolds || [], (item) => `
    <article class="mini-row">
      <strong>Availability hold</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Capacity", "waitlist-capacity", "portal-capacity-status", "Open capacity status."),
        relationshipCue(true, "Booking status", "schedule-status", "portal-booking-status", "Open booking status.")
      ])}
    </article>
  `);

  renderStack("portal-booking-status", state.ledger.bookingConfirmations || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.confirmedWindow)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options."),
        relationshipCue(true, "Reminders", "reminders-deadlines", "portal-reminder-execution-status", "Open reminders and deadlines."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-booking-receipts", "Open booking receipts.")
      ])}
    </article>
  `);

  renderStack("portal-schedule-status-events", state.ledger.scheduleStatusEvents || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.state)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Booking status", "schedule-status", "portal-booking-status", "Open booking status."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-schedule-receipts", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("portal-booking-receipts", state.ledger.bookingReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.generatedAt || "")}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Booking status", "schedule-status", "portal-booking-status", "Open booking status."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-schedule-receipts", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("portal-timing-return-status", state.ledger.timingReturnPayloads || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.returnType)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timing-handoff-status", "Open timing handoff status."),
        relationshipCue(true, "Booking status", "schedule-status", "portal-booking-status", "Open booking status."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-timing-return-receipts", "Open timing receipts.")
      ])}
    </article>
  `);

  renderStack("portal-timing-return-receipts", state.ledger.timingReturnReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.generatedAt || "")}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Timing status", "receipts-imports", "portal-timing-return-status", "Open timing status."),
        relationshipCue(true, "Booking status", "schedule-status", "portal-booking-status", "Open booking status.")
      ])}
    </article>
  `);
}

function renderDeadlinesAndReminders() {
  renderStack("deadline-list", state.ledger.deadlineItems, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.due)}</span>
      <small>${escapeHtml(item.health || "unscored")} - ${escapeHtml(item.customerSafeStatus || item.state)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request state."),
        relationshipCue(true, "Reminder rules", "reminders-deadlines", "reminder-rule-list", "Open reminder rules."),
        relationshipCue(true, "Escalations", "reminders-deadlines", "deadline-escalation-list", "Open escalation state.")
      ])}
    </article>
  `);

  renderStack("reminder-execution-list", state.ledger.reminderExecutions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.reminderRuleId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.channel)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Reminder rule", "reminders-deadlines", "reminder-rule-list", "Open reminder rule."),
        relationshipCue(true, "Deadline", "reminders-deadlines", "deadline-list", "Open related deadline."),
        relationshipCue(true, "Receipts", "reminders-deadlines", "reminder-deadline-receipt-list", "Open reminder/deadline receipts.")
      ])}
    </article>
  `);

  renderStack("deadline-execution-list", state.ledger.deadlineExecutions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.deadlineItemId)}</strong>
      <span>${escapeHtml(item.health)} - ${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.deadlineItemId), "Deadline", "reminders-deadlines", "deadline-list", "Open deadline item."),
        relationshipCue(true, "Escalation", "reminders-deadlines", "deadline-escalation-list", "Open escalation state."),
        relationshipCue(true, "Receipts", "reminders-deadlines", "reminder-deadline-receipt-list", "Open reminder/deadline receipts.")
      ])}
    </article>
  `);

  renderStack("deadline-escalation-list", state.ledger.deadlineEscalations || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.owner)}</strong>
      <span>Level ${escapeHtml(item.escalationLevel)} - ${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Deadline", "reminders-deadlines", "deadline-list", "Open deadline item."),
        relationshipCue(true, "Reminder", "reminders-deadlines", "reminder-execution-list", "Open reminder executions."),
        relationshipCue(true, "Receipts", "reminders-deadlines", "reminder-deadline-receipt-list", "Open reminder/deadline receipts.")
      ])}
    </article>
  `);

  renderStack("reminder-deadline-receipt-list", state.ledger.reminderDeadlineReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Deadline", "reminders-deadlines", "deadline-list", "Open deadlines."),
        relationshipCue(true, "Reminder", "reminders-deadlines", "reminder-execution-list", "Open reminders."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open audit receipts.")
      ])}
    </article>
  `);

  renderStack("recurrence-candidate-list", state.ledger.recurrenceCandidates || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.rrule)} - ${escapeHtml(item.calendarSystem)}</span>
      <small>${item.createsFutureEntries ? "future creation enabled" : "preview only"} - ${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Recurring series", "recurring-schedules", "recurring-series-list", "Open recurring series."),
        relationshipCue(true, "Availability", "availability-holds", "availability-list", "Open availability windows."),
        relationshipCue(true, "Rules", "rules-integrations", "revised-rulepack-status", "Open calendar rules.")
      ])}
    </article>
  `);

  renderStack("recurring-series-list", state.ledger.recurringBookingSeries || [], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.customerSafeStatus)}</p>
        <small>${escapeHtml(item.rrule)} - ${escapeHtml(item.calendarSystem)} - ${escapeHtml(item.timezone)}</small>
        ${renderRelationshipCues([
          relationshipCue(true, "Instances", "recurring-schedules", "recurring-instance-list", "Open recurring instances."),
          relationshipCue(true, "Exceptions", "recurring-schedules", "recurrence-exception-list", "Open recurring exceptions."),
          relationshipCue(true, "Reminders", "reminders-deadlines", "reminder-execution-list", "Open reminders and deadlines."),
          relationshipCue(true, "Receipts", "recurring-schedules", "recurring-series-receipt-list", "Open recurring receipts.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.confirmedCount ?? 0)} confirmed / ${escapeHtml(item.exceptionCount ?? 0)} exceptions</span>
      </div>
    </article>
  `);

  renderStack("recurring-instance-list", state.ledger.recurringBookingInstances || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.seriesId)} #${escapeHtml(item.occurrenceIndex)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.startIso || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.seriesId), "Series", "recurring-schedules", "recurring-series-list", "Open recurring series."),
        relationshipCue(true, "Exceptions", "recurring-schedules", "recurrence-exception-list", "Open exceptions."),
        relationshipCue(true, "Booking", "bookings-recommendations", "booking-confirmation-list", "Open booking confirmations.")
      ])}
    </article>
  `);

  renderStack("recurrence-exception-list", state.ledger.recurrenceConflictExceptions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.conflictType)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.requestedWindow)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Recurring series", "recurring-schedules", "recurring-series-list", "Open recurring series."),
        relationshipCue(true, "Availability", "availability-holds", "availability-list", "Open availability windows."),
        relationshipCue(true, "Timing return", "bookings-recommendations", "timing-return-list", "Open timing return state.")
      ])}
    </article>
  `);

  renderStack("revised-availability-exception-list", state.ledger.revisedAvailabilityExceptions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.recurringSeriesId)} / ${escapeHtml(item.availabilityWindowId || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.recurringSeriesId), "Series", "recurring-schedules", "recurring-series-list", "Open recurring series."),
        relationshipCue(Boolean(item.availabilityWindowId), "Availability", "availability-holds", "availability-list", "Open availability window."),
        relationshipCue(true, "Receipts", "recurring-schedules", "revised-availability-exception-receipt-list", "Open revised availability receipts.")
      ])}
    </article>
  `);

  renderStack("revised-availability-exception-receipt-list", state.ledger.revisedAvailabilityExceptionReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.kind)}</span>
      <small>${escapeHtml(item.customerSafeMessage || item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(Boolean(item.requestId), "Schedule request", "schedule-requests", "schedule-queue", "Open schedule request."),
        relationshipCue(true, "Revised exception", "recurring-schedules", "revised-availability-exception-list", "Open revised availability exceptions."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open audit receipts.")
      ])}
    </article>
  `);

  renderStack("recurring-series-receipt-list", state.ledger.recurringSeriesReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Recurring series", "recurring-schedules", "recurring-series-list", "Open recurring series."),
        relationshipCue(true, "Instances", "recurring-schedules", "recurring-instance-list", "Open recurring instances."),
        relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open audit receipts.")
      ])}
    </article>
  `);

  renderStack("portal-recurring-series-status", state.ledger.recurringBookingSeries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Instances", "recurring-schedule", "portal-recurring-instance-status", "Open recurring instances."),
        relationshipCue(true, "Reminders", "reminders-deadlines", "portal-reminder-execution-status", "Open reminders."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-schedule-receipts", "Open receipts.")
      ])}
    </article>
  `);

  renderStack("portal-recurring-instance-status", state.ledger.recurringBookingInstances || [], (item) => `
    <article class="mini-row">
      <strong>Occurrence ${escapeHtml(item.occurrenceIndex)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Recurring schedule", "recurring-schedule", "portal-recurring-series-status", "Open recurring schedule."),
        relationshipCue(true, "Exceptions", "recurring-schedule", "portal-recurring-exceptions", "Open exceptions."),
        relationshipCue(true, "Booking status", "schedule-status", "portal-booking-status", "Open booking status.")
      ])}
    </article>
  `);

  renderStack("portal-recurring-exceptions", state.ledger.recurrenceConflictExceptions || [], (item) => `
    <article class="mini-row">
      <strong>New window needed</strong>
      <span>${escapeHtml(item.conflictType)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Recurring schedule", "recurring-schedule", "portal-recurring-series-status", "Open recurring schedule."),
        relationshipCue(true, "Booking options", "booking-options", "portal-booking-recommendations", "Open booking options."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-timing-return-receipts", "Open timing receipts.")
      ])}
    </article>
  `);

  renderStack("portal-revised-availability-exceptions", (state.ledger.revisedAvailabilityExceptions || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Revised availability review</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Recurring schedule", "recurring-schedule", "portal-recurring-series-status", "Open recurring schedule."),
        relationshipCue(true, "Capacity", "waitlist-capacity", "portal-capacity-status", "Open capacity status."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-revised-availability-exception-receipts", "Open revised availability receipts.")
      ])}
    </article>
  `);

  renderStack("portal-revised-availability-exception-receipts", (state.ledger.revisedAvailabilityExceptionReceipts || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.availabilityWindowId || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeMessage || item.summary)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Recurring schedule", "recurring-schedule", "portal-recurring-series-status", "Open recurring schedule."),
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-schedule-receipts", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("reminder-rule-list", state.ledger.reminderRules, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.rrule)}</span>
      <small>${escapeHtml(item.customerSafeLabel)} · ${item.sandboxOnly ? "sandbox-only" : "review required"}</small>
    </article>
  `);
  renderStack("portal-reminder-execution-status", (state.ledger.reminderExecutions || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Reminder status</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Deadlines", "reminders-deadlines", "portal-deadline-execution-status", "Open deadlines."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-schedule-receipts", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("portal-deadline-execution-status", (state.ledger.deadlineExecutions || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.deadlineItemId)}</strong>
      <span>${escapeHtml(item.health)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Reminders", "reminders-deadlines", "portal-reminder-execution-status", "Open reminders."),
        relationshipCue(true, "Escalations", "reminders-deadlines", "portal-deadline-escalation-status", "Open escalations."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-schedule-receipts", "Open schedule receipts.")
      ])}
    </article>
  `);

  renderStack("portal-deadline-escalation-status", (state.ledger.deadlineEscalations || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Deadline follow-up</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
      ${renderRelationshipCues([
        relationshipCue(true, "Deadlines", "reminders-deadlines", "portal-deadline-execution-status", "Open deadlines."),
        relationshipCue(true, "Schedule status", "schedule-status", "portal-timeline", "Open schedule status."),
        relationshipCue(true, "Receipts", "receipts-imports", "portal-schedule-receipts", "Open schedule receipts.")
      ])}
    </article>
  `);
}

function renderRevisedCalendar() {
  const monthGrid = byId("revised-calendar");
  if (monthGrid) {
    monthGrid.innerHTML = revisedMonths.map((month, index) => `
      <span>
        <strong>${String(index + 1).padStart(2, "0")}</strong>
        ${escapeHtml(month)}
      </span>
    `).join("");
  }

  const rulepack = state.ledger.revisedCalendarRulepack || {};
  const projection = projectRevisedRulepackConstraints(rulepack);
  const blocked = revisedRulepackBlocksConversion(rulepack);
  const missing = Array.isArray(rulepack.missingApprovals) ? rulepack.missingApprovals : [];
  renderStack("revised-rulepack-status", [rulepack], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.id || "rulepack")}</strong>
        <p>${escapeHtml(item.customerSafeStatus || "Rulepack status unavailable.")}</p>
        <small>${missing.slice(0, 5).map(escapeHtml).join(", ")}${missing.length > 5 ? "..." : ""}</small>
        ${renderRelationshipCues([
          relationshipCue(true, "Constraints", "rules-integrations", "revised-constraint-projection", "Open constraint projection."),
          relationshipCue(true, "Owner decisions", "rules-integrations", "revised-rulepack-owner-decision-list", "Open owner decisions."),
          relationshipCue(true, "Approval receipts", "rules-integrations", "revised-rulepack-approval-receipt-list", "Open approval receipts."),
          relationshipCue(true, "Recurring schedules", "recurring-schedules", "recurring-series-list", "Open recurring schedules.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(blocked ? "conversion held" : "conversion ready")}
        <span>${escapeHtml(item.versionId || "no version")}</span>
      </div>
    </article>
  `);

  renderStack("revised-constraint-projection", [projection], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.calendarSystem)}</strong>
        <p>${escapeHtml(item.yearOpeningDayPolicy)} ${escapeHtml(item.leapDayPolicy)}</p>
        <small>${escapeHtml(item.anchorMethod)}; source: ${escapeHtml(item.anchorSource)}</small>
        <small>${escapeHtml(item.intercalaryPolicy)}</small>
        ${renderRelationshipCues([
          relationshipCue(true, "Rulepack", "rules-integrations", "revised-rulepack-status", "Open rulepack status."),
          relationshipCue(true, "Owner decisions", "rules-integrations", "revised-rulepack-owner-decision-list", "Open owner decisions."),
          relationshipCue(true, "Approval receipts", "rules-integrations", "revised-rulepack-approval-receipt-list", "Open approval receipts.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(item.customerSafe ? "customer-safe constraints" : "constraints blocked")}
        <span>${escapeHtml(item.conversionGateReason)}</span>
      </div>
    </article>
  `);

  const fallbackDecision = createRevisedRulepackOwnerDecisionForRulepack(rulepack);
  const decisionRecords = (state.ledger.revisedRulepackOwnerDecisions || []).length
    ? state.ledger.revisedRulepackOwnerDecisions
    : [fallbackDecision];
  const approvalReceipts = (state.ledger.revisedRulepackApprovalReceipts || []).length
    ? state.ledger.revisedRulepackApprovalReceipts
    : [createRevisedRulepackApprovalReceiptForDecision(fallbackDecision)];
  const customerSafeApprovalReceipts = approvalReceipts.filter((receipt) =>
    receipt.customerVisible &&
    receipt.customerSafe &&
    receipt.webportalExportReady &&
    receipt.conversionReady !== true &&
    receipt.providerCallsEnabled !== true &&
    receipt.providerGoLiveRequested !== true &&
    receipt.monitorWorkflowExposed !== true &&
    receipt.workshopCalendarOwnership !== true
  );

  renderStack("revised-rulepack-owner-decision-list", decisionRecords, (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.status || "owner-decision-required")}</strong>
        <p>${escapeHtml(item.customerSafeStatus || item.decisionSummary || "Rulepack owner decisions are pending.")}</p>
        <small>${escapeHtml(item.missingApprovalSummary || "Owner approvals are still required.")}</small>
        ${renderRelationshipCues([
          relationshipCue(true, "Rulepack", "rules-integrations", "revised-rulepack-status", "Open rulepack status."),
          relationshipCue(true, "Constraints", "rules-integrations", "revised-constraint-projection", "Open constraint projection."),
          relationshipCue(true, "Approval receipts", "rules-integrations", "revised-rulepack-approval-receipt-list", "Open approval receipts.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(item.conversionReady ? "conversion ready" : "conversion held")}
        <span>${escapeHtml(item.missingApprovalCount ?? 0)} missing</span>
      </div>
    </article>
  `);

  renderStack("revised-rulepack-approval-receipt-list", approvalReceipts, (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.receiptId || item.id || "approval receipt")}</strong>
        <p>${escapeHtml(item.summary || "Rulepack approval receipt is ready.")}</p>
        <small>${escapeHtml(item.nextAction || "Review owner approval decisions before conversion.")}</small>
        ${renderRelationshipCues([
          relationshipCue(true, "Rulepack", "rules-integrations", "revised-rulepack-status", "Open rulepack status."),
          relationshipCue(true, "Owner decisions", "rules-integrations", "revised-rulepack-owner-decision-list", "Open owner decisions."),
          relationshipCue(true, "Receipts", "receipts-audit", "schedule-receipts-list", "Open schedule receipts.")
        ])}
      </div>
      <div class="item-meta">
        ${chip(item.status || "approval-held")}
        <span>${escapeHtml(item.rulepackId || "rulepack")}</span>
      </div>
    </article>
  `);

  renderStack("portal-revised-status", [rulepack], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.calendarSystem || "revised calendar")}</strong>
      <span>${blocked ? "conversion inactive" : "conversion ready"}</span>
      <small>${escapeHtml(item.customerSafeStatus || "")}</small>
    </article>
  `);

  renderStack("portal-revised-constraints", [projection], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.monthCount)} x ${escapeHtml(item.daysPerMonth)}</strong>
      <span>${escapeHtml(item.commonIntercalaryDayCount)} common / ${escapeHtml(item.leapIntercalaryDayCount)} leap day(s) outside months</span>
      <small>${escapeHtml(item.conversionGateReason)}</small>
    </article>
  `);

  renderStack("portal-revised-rulepack-approval-status", customerSafeApprovalReceipts, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status || "approval held")}</strong>
      <span>${escapeHtml(item.calendarSystem || "revised-13-month")}</span>
      <small>${escapeHtml(item.customerSafeMessage || "Revised-calendar conversion is still held.")}</small>
    </article>
  `);
}

function renderCoreReadiness() {
  const core = state.ledger.schedulingCoreReadiness || {};
  const checks = [
    ["Schedule Entry", core.scheduleEntryValidation],
    ["Schedule Request", core.scheduleRequestValidation],
    ["Availability", core.availabilityValidation],
    ["Capacity", core.capacityValidation],
    ["Waitlist", core.waitlistValidation],
    ["Hold Release", core.holdReleaseValidation],
    ["Promotion", core.waitlistPromotionValidation],
    ["Optimization", core.availabilityOptimizationValidation],
    ["Recommendation", core.bookingRecommendationValidation],
    ["Overload Warning", core.overloadWarningValidation],
    ["Recommendation Proof", core.recommendationReceiptValidation],
    ["Deadline Health", core.deadlineHealthValidation],
    ["Reminder Execution", core.reminderExecutionValidation],
    ["Deadline Execution", core.deadlineExecutionValidation],
    ["Escalation", core.escalationValidation],
    ["Recurrence", core.recurrenceSandboxValidation],
    ["Rulepack Owner Decision", core.revisedRulepackOwnerDecisionValidation],
    ["Rulepack Approval Receipt", core.revisedRulepackApprovalReceiptValidation],
    ["Revised Availability Exception", core.revisedAvailabilityExceptionValidation],
    ["Revised Availability Receipt", core.revisedAvailabilityExceptionReceiptValidation],
    ["Customer Status", core.customerSafeStatusValidation],
    ["Rulepack Gate", core.revisedRulepackGate],
    ["Live Provider", core.liveProviderPosture]
  ];
  renderStack("native-core-readiness", checks, ([label, value]) => `
    <article class="mini-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value || "pending")}</span>
      <small>${escapeHtml(core.nativeContract || "epoch_core")}</small>
    </article>
  `);
}

function renderProviderReadiness() {
  const renderGate = (gate) => {
    const ready = providerGateReadyForToggle(gate);
    const blocked = providerGateBlocksLiveCalls(gate);
    return `
      <article class="item-card">
        <div>
          <strong>${escapeHtml(gate.targetProvider)}</strong>
          <p>${escapeHtml(gate.customerSafeStatus)}</p>
          <small>${escapeHtml(gate.blocker || "No blocker recorded.")}</small>
        </div>
        <div class="item-meta">
          ${chip(ready ? "ready for approval" : gate.status)}
          <span>${blocked ? "live calls blocked" : "live calls allowed"}</span>
        </div>
      </article>
    `;
  };

  renderStack("provider-readiness-list", state.ledger.providerReadinessGates, renderGate);
  renderStack("portal-provider-status", state.ledger.providerReadinessGates, (gate) => `
    <article class="mini-row">
      <strong>${escapeHtml(gate.targetProvider)}</strong>
      <span>${providerGateBlocksLiveCalls(gate) ? "inactive" : "active"}</span>
      <small>${escapeHtml(gate.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("provider-check-list", state.ledger.providerStatusEvents, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.state)}</span>
      <small>${escapeHtml(item.detail)}</small>
    </article>
  `);
}

function renderPortalTimeline() {
  renderStack("portal-timeline", state.ledger.portalTimeline, (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      ${chip(item.state)}
    </article>
  `);

  renderStack("customer-status-list", state.ledger.scheduleRequests.slice(0, 5), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);
}

function renderCustomerScheduleStatusExports() {
  setText(
    "customer-schedule-status-export-summary",
    customerScheduleStatusExportState.records.length
      ? `${customerScheduleStatusExportState.records.length} App-exported schedule status record(s) loaded.`
      : "No App-exported schedule status records loaded."
  );

  renderStack(
    "portal-customer-schedule-status-export",
    customerScheduleStatusExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe App status exports loaded."
  );
}

function renderScheduleLifecycleActions() {
  renderStack(
    "portal-schedule-lifecycle-actions",
    (state.ledger.scheduleLifecycleActions || []).filter((item) => item.customerVisible),
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.actionKind)}</strong>
        <span>${escapeHtml(item.status)} - ${escapeHtml(item.requestId)}</span>
        <small>${escapeHtml(item.customerSafeStatus)}</small>
        <small>${escapeHtml(item.requestedWindow)}</small>
      </article>
    `,
    "No customer-safe schedule lifecycle actions yet."
  );
}

function renderScheduleLifecycleStatusExports() {
  setText(
    "schedule-lifecycle-status-export-summary",
    scheduleLifecycleStatusExportState.records.length
      ? `${scheduleLifecycleStatusExportState.records.length} App-exported lifecycle status record(s) loaded.`
      : "No App-exported schedule lifecycle status records loaded."
  );

  renderStack(
    "portal-schedule-lifecycle-status-export",
    scheduleLifecycleStatusExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.actionKind)} / ${escapeHtml(item.requestId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe App lifecycle status exports loaded."
  );
}

function renderRevisedReminderDeadlineReceiptExports() {
  setText(
    "revised-reminder-deadline-receipt-summary",
    revisedReminderDeadlineReceiptExportState.records.length
      ? `${revisedReminderDeadlineReceiptExportState.records.length} App-exported revised reminder/deadline receipt(s) loaded.`
      : "No App-exported revised reminder/deadline receipts loaded."
  );

  renderStack(
    "portal-revised-reminder-deadline-receipts",
    revisedReminderDeadlineReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.kind)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe revised reminder/deadline receipt exports loaded."
  );
  renderStack(
    "app-revised-reminder-deadline-receipts",
    revisedReminderDeadlineReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.revisedTimingPayloadId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
      </article>
    `,
    "No App-exported revised reminder/deadline receipt records loaded."
  );
}

function renderRevisedAvailabilityExceptionReceiptExports() {
  setText(
    "revised-availability-exception-receipt-summary",
    revisedAvailabilityExceptionReceiptExportState.records.length
      ? `${revisedAvailabilityExceptionReceiptExportState.records.length} App-exported revised availability exception receipt(s) loaded.`
      : "No App-exported revised availability exception receipts loaded."
  );

  renderStack(
    "portal-revised-availability-exception-receipt-export",
    revisedAvailabilityExceptionReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.recurringSeriesId)} / ${escapeHtml(item.availabilityWindowId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe revised availability exception receipt exports loaded."
  );
  renderStack(
    "app-revised-availability-exception-receipt-export",
    revisedAvailabilityExceptionReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.revisedTimingPayloadId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
      </article>
    `,
    "No App-exported revised availability exception receipt records loaded."
  );
}

function renderRevisedRulepackApprovalReceiptExports() {
  setText(
    "revised-rulepack-approval-receipt-summary",
    revisedRulepackApprovalReceiptExportState.records.length
      ? `${revisedRulepackApprovalReceiptExportState.records.length} App-exported revised rulepack approval receipt(s) loaded.`
      : "No App-exported revised rulepack approval receipts loaded."
  );

  renderStack(
    "portal-revised-rulepack-approval-receipt-export",
    revisedRulepackApprovalReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.calendarSystem)} / ${escapeHtml(item.rulepackId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe revised rulepack approval receipt exports loaded."
  );
  renderStack(
    "app-revised-rulepack-approval-receipt-export",
    revisedRulepackApprovalReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.calendarSystem)} / ${escapeHtml(item.rulepackId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
      </article>
    `,
    "No App-exported revised rulepack approval receipt records loaded."
  );
}

function renderReceipts() {
  renderStack("receipt-list", state.ledger.receipts, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);
}

function appendReceipt(summary, status = "ready") {
  state.ledger.receipts.unshift({
    id: `EPOCH-RECEIPT-${Date.now().toString(36)}`,
    status,
    summary
  });
}

function addTimeline(label, detail, timelineState = "queued") {
  state.ledger.portalTimeline.unshift({ label, detail, state: timelineState });
}

function handleGenerateRecurringSeries() {
  const existingActiveSeries = (state.ledger.recurringBookingSeries || []).find((series) => series.status !== "canceled");
  if (existingActiveSeries) {
    const confirmation = byId("series-confirmation");
    if (confirmation) confirmation.textContent = "A local recurring booking series is already generated.";
    return;
  }

  const candidate = (state.ledger.recurrenceCandidates || []).find((item) => item.createsFutureEntries && item.calendarSystem === "gregorian");
  const entry = (state.ledger.scheduleEntries || []).find((item) => item.id === candidate?.scheduleEntryId);
  if (!candidate || !entry) {
    const confirmation = byId("series-confirmation");
    if (confirmation) confirmation.textContent = "No approved Gregorian recurrence candidate is ready for local series generation.";
    return;
  }

  const series = createRecurringBookingSeriesForRule(candidate, entry);
  const openWindows = (state.ledger.availabilityWindows || []).filter((window) => Number(window.holds || 0) < Number(window.capacity || 0));
  const instances = Array.from({ length: series.instanceCount }, (_, index) => {
    const window = index === 2 ? null : openWindows[index % Math.max(openWindows.length, 1)] || null;
    return createRecurringBookingInstanceForSeries(series, index + 1, window, entry);
  });
  const exceptions = instances
    .filter((instance) => instance.status === "needs-reschedule")
    .map((instance) => {
      const exception = createRecurrenceConflictExceptionForInstance(instance, series);
      instance.conflictExceptionId = exception.id;
      return exception;
    });
  series.confirmedCount = instances.filter((instance) => instance.status === "confirmed").length;
  series.exceptionCount = exceptions.length;
  series.customerSafeStatus = exceptions.length
    ? "Recurring booking series is generated locally; one instance needs a new window."
    : "Recurring booking series is generated locally with all instances confirmed.";
  const receipt = createRecurringSeriesReceiptForSeries(series, instances, exceptions);
  const revisedAvailabilityExceptions = exceptions.map((exception) => {
    const instance = instances.find((item) => item.id === exception.instanceId) || null;
    const fallbackWindow = openWindows[0] || null;
    return createRevisedAvailabilityExceptionForTiming(
      state.ledger.revisedCalendarRulepack,
      series,
      instance,
      exception,
      fallbackWindow
    );
  });
  const revisedAvailabilityReceipts = revisedAvailabilityExceptions.map(createRevisedAvailabilityExceptionReceiptForException);

  state.ledger.recurringBookingSeries.unshift(series);
  state.ledger.recurringBookingInstances.unshift(...instances);
  state.ledger.recurrenceConflictExceptions.unshift(...exceptions);
  state.ledger.recurringSeriesReceipts.unshift(receipt);
  state.ledger.revisedAvailabilityExceptions ||= [];
  state.ledger.revisedAvailabilityExceptionReceipts ||= [];
  state.ledger.revisedAvailabilityExceptions.unshift(...revisedAvailabilityExceptions);
  state.ledger.revisedAvailabilityExceptionReceipts.unshift(...revisedAvailabilityReceipts);
  addTimeline("Recurring series generated", series.customerSafeStatus, series.status);
  appendReceipt(receipt.summary, receipt.status);
  saveLedger(state.ledger);

  const confirmation = byId("series-confirmation");
  if (confirmation) confirmation.textContent = series.customerSafeStatus;
  renderAll();
}

function handleGenerateBookingRecommendations() {
  const confirmation = byId("booking-recommendation-confirmation");
  const request = (state.ledger.scheduleRequests || []).find((item) =>
    ["queued", "waitlisted", "needs-reschedule"].includes(item.status)
  ) || (state.ledger.scheduleRequests || [])[0];
  const windows = state.ledger.availabilityWindows || [];

  if (!request || !windows.length) {
    if (confirmation) confirmation.textContent = "No local schedule request and availability windows are ready for recommendation.";
    return;
  }

  const run = createBookingOptimizationRunForRequest(request, windows);
  const rankedWindows = rankAvailabilityWindowsForRequest(windows);
  const candidates = rankedWindows
    .slice(0, 3)
    .map((window, index) => createBookingRecommendationCandidateForWindow(run, request, window, index + 1));
  const warningWindows = rankedWindows.filter((window) =>
    Number(window.capacity || 0) > 0 && Number(window.holds || 0) >= Number(window.capacity || 0)
  );
  const warnings = warningWindows.map((window) => createBookingOverloadWarningForWindow(run, window));
  const receipt = createBookingRecommendationReceiptForRun(run, candidates, warnings);

  state.ledger.bookingOptimizationRuns ||= [];
  state.ledger.bookingRecommendationCandidates ||= [];
  state.ledger.bookingOverloadWarnings ||= [];
  state.ledger.bookingRecommendationReceipts ||= [];

  run.candidateCount = candidates.length;
  run.overloadWarningCount = warnings.length;
  state.ledger.bookingOptimizationRuns.unshift(run);
  state.ledger.bookingRecommendationCandidates.unshift(...candidates);
  state.ledger.bookingOverloadWarnings.unshift(...warnings);
  state.ledger.bookingRecommendationReceipts.unshift(receipt);
  addTimeline("Booking recommendations generated", receipt.summary, receipt.status);
  appendReceipt(receipt.summary, receipt.status);
  saveLedger(state.ledger);

  if (confirmation) confirmation.textContent = receipt.summary;
  renderAll();
}

function handlePromoteWaitlist() {
  const waitlistEntry = (state.ledger.availabilityWaitlistEntries || []).find((entry) => entry.status === "waitlisted");
  const fullWindow = selectFullAvailabilityWindow(state.ledger.availabilityWindows || []);
  const releaseHold = (state.ledger.availabilityHolds || []).find((hold) => hold.status === "released" && (!fullWindow || hold.availabilityWindowId === fullWindow.id))
    || (state.ledger.availabilityHolds || []).find((hold) => hold.status === "held" && (!fullWindow || hold.availabilityWindowId === fullWindow.id));
  const confirmation = byId("waitlist-promotion-confirmation");

  if (!waitlistEntry || !fullWindow || !releaseHold) {
    if (confirmation) confirmation.textContent = "No local waitlist entry, full window, and releasable hold are ready for promotion.";
    return;
  }

  const release = createAvailabilityHoldReleaseForHold(releaseHold, fullWindow);
  const promotion = createAvailabilityPromotionCandidateForWaitlist(waitlistEntry, fullWindow, release);
  const receipt = createAvailabilityCapacityReceiptForPromotion(promotion, release, waitlistEntry);
  const snapshot = createAvailabilityCapacitySnapshotForWindow(
    fullWindow,
    state.ledger.availabilityWaitlistEntries,
    [release, ...(state.ledger.availabilityHoldReleases || [])],
    [promotion, ...(state.ledger.availabilityPromotionCandidates || [])]
  );

  releaseHold.status = "released";
  releaseHold.customerSafeStatus = release.customerSafeStatus;
  waitlistEntry.status = "promoted";
  waitlistEntry.customerSafeStatus = "Waitlist request was promoted into a local availability hold.";
  state.ledger.availabilityHoldReleases.unshift(release);
  state.ledger.availabilityPromotionCandidates.unshift(promotion);
  state.ledger.availabilityCapacitySnapshots.unshift(snapshot);
  state.ledger.availabilityCapacityReceipts.unshift(receipt);
  addTimeline("Waitlist promoted", promotion.customerSafeStatus, promotion.status);
  appendReceipt(receipt.summary, receipt.status);
  saveLedger(state.ledger);

  if (confirmation) confirmation.textContent = promotion.customerSafeStatus;
  renderAll();
}

function handleRunReminderDeadlinePass() {
  const reminderRule = (state.ledger.reminderRules || []).find((rule) => rule.sandboxOnly && rule.status !== "failed");
  const scheduleEntry = (state.ledger.scheduleEntries || []).find((entry) => entry.id === reminderRule?.scheduleEntryId);
  const deadlineItem = (state.ledger.deadlineItems || []).find((item) => item.health && item.health !== "on-track")
    || (state.ledger.deadlineItems || [])[0];
  const confirmation = byId("reminder-deadline-confirmation");

  if (!reminderRule || !deadlineItem) {
    if (confirmation) confirmation.textContent = "No local reminder rule and deadline item are ready for execution.";
    return;
  }

  const reminderExecution = createReminderExecutionForRule(reminderRule, scheduleEntry);
  const deadlineExecution = createDeadlineExecutionForItem(deadlineItem);
  const escalation = createDeadlineEscalationForExecution(deadlineExecution, reminderExecution);
  const receipt = createReminderDeadlineReceiptForEscalation(escalation, deadlineExecution, reminderExecution);

  state.ledger.reminderExecutions.unshift(reminderExecution);
  state.ledger.deadlineExecutions.unshift(deadlineExecution);
  state.ledger.deadlineEscalations.unshift(escalation);
  state.ledger.reminderDeadlineReceipts.unshift(receipt);
  state.ledger.receipts.unshift({
    id: receipt.id,
    status: receipt.status,
    summary: receipt.summary
  });
  addTimeline("Reminder deadline pass", receipt.summary, receipt.status);
  saveLedger(state.ledger);

  if (confirmation) confirmation.textContent = receipt.summary;
  renderAll();
}

function renderAll() {
  renderNeedOptions();
  renderLifecycleActionOptions();
  renderStats();
  renderEpochCommandCenter();
  renderScheduleQueue();
  renderCalendarBoard();
  renderProductModules();
  renderAvailability();
  renderBookingWorkflow();
  renderDeadlinesAndReminders();
  renderCoreReadiness();
  renderRevisedCalendar();
  renderProviderReadiness();
  renderPortalTimeline();
  renderCustomerScheduleStatusExports();
  renderScheduleLifecycleActions();
  renderScheduleLifecycleStatusExports();
  renderRevisedReminderDeadlineReceiptExports();
  renderRevisedAvailabilityExceptionReceiptExports();
  renderRevisedRulepackApprovalReceiptExports();
  renderReceipts();
}

async function handleCustomerScheduleStatusImport(event) {
  event.preventDefault();
  const fileInput = byId("customer-schedule-status-file");
  const confirmation = byId("customer-schedule-status-export-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose customer-schedule-status.json first.";
    return;
  }

  try {
    const imported = normalizeCustomerScheduleStatusPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe Webportal-ready schedule status records found.";
      return;
    }

    const byStatusId = new Map(customerScheduleStatusExportState.records.map((item) => [item.statusId, item]));
    for (const item of imported) byStatusId.set(item.statusId, item);
    customerScheduleStatusExportState.records = Array.from(byStatusId.values());
    saveCustomerScheduleStatusExports(customerScheduleStatusExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Status export could not be read.";
  }
}

function handleClearCustomerScheduleStatusExports() {
  customerScheduleStatusExportState.records = [];
  saveCustomerScheduleStatusExports(customerScheduleStatusExportState.records);
  const fileInput = byId("customer-schedule-status-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

async function handleScheduleLifecycleStatusImport(event) {
  event.preventDefault();
  const fileInput = byId("schedule-lifecycle-status-file");
  const confirmation = byId("schedule-lifecycle-status-export-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose schedule-lifecycle-status.json first.";
    return;
  }

  try {
    const imported = normalizeScheduleLifecycleStatusPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe Webportal-ready schedule lifecycle status records found.";
      return;
    }

    const byStatusId = new Map(scheduleLifecycleStatusExportState.records.map((item) => [item.statusId, item]));
    for (const item of imported) byStatusId.set(item.statusId, item);
    scheduleLifecycleStatusExportState.records = Array.from(byStatusId.values());
    saveScheduleLifecycleStatusExports(scheduleLifecycleStatusExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Lifecycle status export could not be read.";
  }
}

function handleClearScheduleLifecycleStatusExports() {
  scheduleLifecycleStatusExportState.records = [];
  saveScheduleLifecycleStatusExports(scheduleLifecycleStatusExportState.records);
  const fileInput = byId("schedule-lifecycle-status-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

async function handleRevisedReminderDeadlineReceiptImport(event) {
  event.preventDefault();
  const fileInput = byId("revised-reminder-deadline-receipt-file");
  const confirmation = byId("revised-reminder-deadline-receipt-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose revised-reminder-deadline-receipts.json first.";
    return;
  }

  try {
    const imported = normalizeRevisedReminderDeadlineReceiptPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe revised reminder/deadline receipt records found.";
      return;
    }

    const byReceiptId = new Map(revisedReminderDeadlineReceiptExportState.records.map((item) => [item.receiptId, item]));
    for (const item of imported) byReceiptId.set(item.receiptId, item);
    revisedReminderDeadlineReceiptExportState.records = Array.from(byReceiptId.values());
    saveRevisedReminderDeadlineReceiptExports(revisedReminderDeadlineReceiptExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Revised reminder/deadline receipt export could not be read.";
  }
}

function handleClearRevisedReminderDeadlineReceiptExports() {
  revisedReminderDeadlineReceiptExportState.records = [];
  saveRevisedReminderDeadlineReceiptExports(revisedReminderDeadlineReceiptExportState.records);
  const fileInput = byId("revised-reminder-deadline-receipt-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

async function handleRevisedAvailabilityExceptionReceiptImport(event) {
  event.preventDefault();
  const fileInput = byId("revised-availability-exception-receipt-file");
  const confirmation = byId("revised-availability-exception-receipt-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose revised-availability-exception-receipts.json first.";
    return;
  }

  try {
    const imported = normalizeRevisedAvailabilityExceptionReceiptPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe revised availability exception receipt records found.";
      return;
    }

    const byReceiptId = new Map(revisedAvailabilityExceptionReceiptExportState.records.map((item) => [item.receiptId, item]));
    for (const item of imported) byReceiptId.set(item.receiptId, item);
    revisedAvailabilityExceptionReceiptExportState.records = Array.from(byReceiptId.values());
    saveRevisedAvailabilityExceptionReceiptExports(revisedAvailabilityExceptionReceiptExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Revised availability exception receipt export could not be read.";
  }
}

function handleClearRevisedAvailabilityExceptionReceiptExports() {
  revisedAvailabilityExceptionReceiptExportState.records = [];
  saveRevisedAvailabilityExceptionReceiptExports(revisedAvailabilityExceptionReceiptExportState.records);
  const fileInput = byId("revised-availability-exception-receipt-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

async function handleRevisedRulepackApprovalReceiptImport(event) {
  event.preventDefault();
  const fileInput = byId("revised-rulepack-approval-receipt-file");
  const confirmation = byId("revised-rulepack-approval-receipt-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose revised-rulepack-approval-receipts.json first.";
    return;
  }

  try {
    const imported = normalizeRevisedRulepackApprovalReceiptPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe revised rulepack approval receipt records found.";
      return;
    }

    const byReceiptId = new Map(revisedRulepackApprovalReceiptExportState.records.map((item) => [item.receiptId, item]));
    for (const item of imported) byReceiptId.set(item.receiptId, item);
    revisedRulepackApprovalReceiptExportState.records = Array.from(byReceiptId.values());
    saveRevisedRulepackApprovalReceiptExports(revisedRulepackApprovalReceiptExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Revised rulepack approval receipt export could not be read.";
  }
}

function handleClearRevisedRulepackApprovalReceiptExports() {
  revisedRulepackApprovalReceiptExportState.records = [];
  saveRevisedRulepackApprovalReceiptExports(revisedRulepackApprovalReceiptExportState.records);
  const fileInput = byId("revised-rulepack-approval-receipt-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

function handleScheduleLifecycleAction(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const action = createScheduleLifecycleActionRecord(data);

  state.ledger.scheduleLifecycleActions ||= [];
  state.ledger.scheduleLifecycleActions.unshift(action);
  addTimeline("Schedule lifecycle action requested", action.customerSafeStatus, action.status);
  appendReceipt(`${action.actionKind} action queued locally for ${action.requestId}; provider calls remain disabled.`, action.status);
  saveLedger(state.ledger);

  const confirmation = byId("schedule-lifecycle-confirmation");
  if (confirmation) confirmation.textContent = action.customerSafeStatus;
  form.reset();
  renderAll();
}

function handleScheduleRequest(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const request = createScheduleRequestRecord(data);
  const handoff = createTimingHandoffForRequest(request, "EPOCH");
  const availabilityWindow = selectOpenAvailabilityWindow(state.ledger.availabilityWindows);
  const conflictDecision = createAvailabilityConflictDecisionForHandoff(handoff, availabilityWindow);

  state.ledger.scheduleRequests.unshift(request);
  state.ledger.timingHandoffs.unshift(handoff);
  state.ledger.availabilityConflictDecisions.unshift(conflictDecision);

  let confirmationText = conflictDecision.customerSafeStatus;
  if (conflictDecision.status === "clear") {
    const entry = createScheduleEntryForRequest(request);
    const acceptance = createScheduleRequestAcceptanceForRequest(request, availabilityWindow);
    const hold = createAvailabilityHoldForAcceptance(acceptance, availabilityWindow);
    const bookingConfirmation = createBookingConfirmationForHold(hold, request, entry);
    const scheduleStatusEvent = createScheduleStatusEventForBooking(bookingConfirmation, request);
    const bookingReceipt = createBookingReceiptForConfirmation(bookingConfirmation, scheduleStatusEvent);
    const timingReturnPayload = createTimingReturnPayloadForDecision(conflictDecision, request, bookingConfirmation);
    const timingReturnReceipt = createTimingReturnReceiptForPayload(timingReturnPayload, conflictDecision);

    request.status = "accepted";
    request.customerSafeStatus = acceptance.customerSafeStatus;
    handoff.status = "returned";
    handoff.customerSafeStatus = timingReturnPayload.customerSafeStatus;
    entry.status = "confirmed";
    entry.customerSafeStatus = bookingConfirmation.customerSafeStatus;

    state.ledger.scheduleEntries.unshift(entry);
    state.ledger.scheduleRequestAcceptances.unshift(acceptance);
    state.ledger.availabilityHolds.unshift(hold);
    state.ledger.bookingConfirmations.unshift(bookingConfirmation);
    state.ledger.scheduleStatusEvents.unshift(scheduleStatusEvent);
    state.ledger.bookingReceipts.unshift(bookingReceipt);
    state.ledger.timingReturnPayloads.unshift(timingReturnPayload);
    state.ledger.timingReturnReceipts.unshift(timingReturnReceipt);
    if (availabilityWindow) availabilityWindow.holds = Number(availabilityWindow.holds || 0) + 1;
    addTimeline("Request accepted", `${request.requester} requested ${scheduleNeedLabel(request.need)}.`, acceptance.status);
    addTimeline("Booking confirmed", bookingConfirmation.customerSafeStatus, bookingConfirmation.status);
    addTimeline("Timing returned", timingReturnPayload.customerSafeStatus, timingReturnPayload.status);
    appendReceipt(`${request.requester} received a local-only schedule booking confirmation and timing return.`);
    confirmationText = bookingConfirmation.customerSafeStatus;
  } else {
    const scheduleStatusEvent = createScheduleStatusEventForConflict(conflictDecision, request);
    const timingReturnPayload = createTimingReturnPayloadForDecision(conflictDecision, request);
    const timingReturnReceipt = createTimingReturnReceiptForPayload(timingReturnPayload, conflictDecision);
    const waitlistEntry = createAvailabilityWaitlistEntryForRequest(
      request,
      conflictDecision,
      (state.ledger.availabilityWaitlistEntries || []).length + 1
    );
    const fullWindow = selectFullAvailabilityWindow(state.ledger.availabilityWindows || []);
    const snapshot = createAvailabilityCapacitySnapshotForWindow(
      fullWindow,
      [waitlistEntry, ...(state.ledger.availabilityWaitlistEntries || [])],
      state.ledger.availabilityHoldReleases || [],
      state.ledger.availabilityPromotionCandidates || []
    );
    const capacityReceipt = createAvailabilityCapacityReceiptForPromotion(null, null, waitlistEntry);

    request.status = "waitlisted";
    request.customerSafeStatus = waitlistEntry.customerSafeStatus;
    handoff.status = "needs-reschedule";
    handoff.customerSafeStatus = timingReturnPayload.customerSafeStatus;

    state.ledger.scheduleStatusEvents.unshift(scheduleStatusEvent);
    state.ledger.timingReturnPayloads.unshift(timingReturnPayload);
    state.ledger.timingReturnReceipts.unshift(timingReturnReceipt);
    state.ledger.availabilityWaitlistEntries.unshift(waitlistEntry);
    if (snapshot.availabilityWindowId) state.ledger.availabilityCapacitySnapshots.unshift(snapshot);
    state.ledger.availabilityCapacityReceipts.unshift(capacityReceipt);
    addTimeline("Timing conflict", timingReturnPayload.customerSafeStatus, timingReturnPayload.status);
    addTimeline("Waitlist opened", waitlistEntry.customerSafeStatus, waitlistEntry.status);
    appendReceipt(`${request.requester} received a local-only availability conflict return.`, "needs-reschedule");
    appendReceipt(capacityReceipt.summary, capacityReceipt.status);
    confirmationText = waitlistEntry.customerSafeStatus;
  }
  saveLedger(state.ledger);

  const confirmation = byId("request-confirmation");
  if (confirmation) confirmation.textContent = confirmationText;
  form.reset();
  renderAll();
}

function bindControls() {
  const requestForm = byId("schedule-request-form");
  if (requestForm) requestForm.addEventListener("submit", handleScheduleRequest);

  const lifecycleActionForm = byId("schedule-lifecycle-action-form");
  if (lifecycleActionForm) lifecycleActionForm.addEventListener("submit", handleScheduleLifecycleAction);

  const statusImportForm = byId("customer-schedule-status-import-form");
  if (statusImportForm) statusImportForm.addEventListener("submit", handleCustomerScheduleStatusImport);

  const clearStatusExportButton = byId("clear-customer-schedule-status-export");
  if (clearStatusExportButton) clearStatusExportButton.addEventListener("click", handleClearCustomerScheduleStatusExports);

  const lifecycleStatusImportForm = byId("schedule-lifecycle-status-import-form");
  if (lifecycleStatusImportForm) lifecycleStatusImportForm.addEventListener("submit", handleScheduleLifecycleStatusImport);

  const clearLifecycleStatusExportButton = byId("clear-schedule-lifecycle-status-export");
  if (clearLifecycleStatusExportButton) clearLifecycleStatusExportButton.addEventListener("click", handleClearScheduleLifecycleStatusExports);

  const revisedReminderDeadlineReceiptImportForm = byId("revised-reminder-deadline-receipt-import-form");
  if (revisedReminderDeadlineReceiptImportForm) revisedReminderDeadlineReceiptImportForm.addEventListener("submit", handleRevisedReminderDeadlineReceiptImport);

  const clearRevisedReminderDeadlineReceiptsButton = byId("clear-revised-reminder-deadline-receipts");
  if (clearRevisedReminderDeadlineReceiptsButton) clearRevisedReminderDeadlineReceiptsButton.addEventListener("click", handleClearRevisedReminderDeadlineReceiptExports);

  const revisedAvailabilityExceptionReceiptImportForm = byId("revised-availability-exception-receipt-import-form");
  if (revisedAvailabilityExceptionReceiptImportForm) revisedAvailabilityExceptionReceiptImportForm.addEventListener("submit", handleRevisedAvailabilityExceptionReceiptImport);

  const clearRevisedAvailabilityExceptionReceiptsButton = byId("clear-revised-availability-exception-receipts");
  if (clearRevisedAvailabilityExceptionReceiptsButton) clearRevisedAvailabilityExceptionReceiptsButton.addEventListener("click", handleClearRevisedAvailabilityExceptionReceiptExports);

  const revisedRulepackApprovalReceiptImportForm = byId("revised-rulepack-approval-receipt-import-form");
  if (revisedRulepackApprovalReceiptImportForm) revisedRulepackApprovalReceiptImportForm.addEventListener("submit", handleRevisedRulepackApprovalReceiptImport);

  const clearRevisedRulepackApprovalReceiptsButton = byId("clear-revised-rulepack-approval-receipts");
  if (clearRevisedRulepackApprovalReceiptsButton) clearRevisedRulepackApprovalReceiptsButton.addEventListener("click", handleClearRevisedRulepackApprovalReceiptExports);

  const resetButton = byId("reset-schedule-ledger");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      state.ledger = clone(initialEpochLedger);
      saveLedger(state.ledger);
      renderAll();
    });
  }

  const seriesButton = byId("generate-recurring-series");
  if (seriesButton) seriesButton.addEventListener("click", handleGenerateRecurringSeries);

  const recommendationButton = byId("generate-booking-recommendations");
  if (recommendationButton) recommendationButton.addEventListener("click", handleGenerateBookingRecommendations);

  const promoteButton = byId("promote-waitlist");
  if (promoteButton) promoteButton.addEventListener("click", handlePromoteWaitlist);

  const reminderDeadlineButton = byId("run-reminder-deadline-pass");
  if (reminderDeadlineButton) reminderDeadlineButton.addEventListener("click", handleRunReminderDeadlinePass);
}

initializeEpochAppModuleShell();
initializeEpochWebportalModuleShell();
renderAll();
bindControls();
