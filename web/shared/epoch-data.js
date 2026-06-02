export const EPOCH_LEDGER_KEY = "epoch.operatingLedger.v1";

export const scheduleNeedOptions = [
  { value: "diagnostic-call", label: "Diagnostic call", entryType: "request" },
  { value: "submission-review-return", label: "Submission review return", entryType: "review-deadline" },
  { value: "project-planning-session", label: "Project planning session", entryType: "request" },
  { value: "deadline-check-in", label: "Deadline check-in", entryType: "follow-up" },
  { value: "reminder-only", label: "Reminder only", entryType: "reminder" }
];

export const initialEpochLedger = {
  version: 1,
  generatedAt: "2026-06-03T10:00:00+09:00",
  scheduleEntries: [
    {
      id: "EPOCH-SCH-001",
      title: "Submission review return window",
      owner: "EPOCH",
      status: "queued",
      time: "2026-06-03 19:00 JST",
      startIso: "2026-06-03T19:00:00+09:00",
      endIso: "2026-06-03T20:00:00+09:00",
      timezone: "Asia/Tokyo",
      customerSafeStatus: "Return window is queued for operator review.",
      detail: "Schedule-bound return window requested by a WORKSHOP timing client."
    },
    {
      id: "EPOCH-SCH-002",
      title: "Calendar provider readiness review",
      owner: "EPOCH",
      status: "planned",
      time: "2026-06-04 10:30 JST",
      startIso: "2026-06-04T10:30:00+09:00",
      endIso: "2026-06-04T11:00:00+09:00",
      timezone: "Asia/Tokyo",
      customerSafeStatus: "Provider readiness is internal and sandbox-only.",
      detail: "Internal provider-readiness gate; no live provider write."
    },
    {
      id: "EPOCH-SCH-003",
      title: "Revised calendar contract pass",
      owner: "EPOCH",
      status: "in-progress",
      time: "2026-06-05 14:00 JST",
      startIso: "2026-06-05T14:00:00+09:00",
      endIso: "2026-06-05T15:00:00+09:00",
      timezone: "Asia/Tokyo",
      customerSafeStatus: "Revised-calendar mapping is being checked.",
      detail: "Validate month mapping and schedule conversion rules."
    }
  ],
  scheduleRequests: [
    {
      id: "EPOCH-REQ-001",
      requester: "WORKSHOP timing handoff",
      need: "submission-review-return",
      requestedWindow: "2026-06-03 evening JST",
      timezone: "Asia/Tokyo",
      status: "queued",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Timing request received; availability is being checked.",
      createdAt: "2026-06-03T10:00:00+09:00"
    }
  ],
  availabilityWindows: [
    {
      id: "EPOCH-WIN-001",
      label: "Evening review block",
      time: "Mon-Wed 19:00-21:00 JST",
      startIso: "2026-06-03T19:00:00+09:00",
      endIso: "2026-06-03T21:00:00+09:00",
      timezone: "Asia/Tokyo",
      capacity: 2,
      holds: 1,
      status: "available"
    },
    {
      id: "EPOCH-WIN-002",
      label: "Admin scheduling block",
      time: "Fri 09:00-11:00 JST",
      startIso: "2026-06-05T09:00:00+09:00",
      endIso: "2026-06-05T11:00:00+09:00",
      timezone: "Asia/Tokyo",
      capacity: 4,
      holds: 0,
      status: "available"
    },
    {
      id: "EPOCH-WIN-003",
      label: "Async deadline pass",
      time: "Sun 16:00-18:00 JST",
      startIso: "2026-06-07T16:00:00+09:00",
      endIso: "2026-06-07T18:00:00+09:00",
      timezone: "Asia/Tokyo",
      capacity: 3,
      holds: 2,
      status: "available"
    }
  ],
  deadlineItems: [
    { id: "EPOCH-DUE-001", label: "Customer schedule confirmation", due: "2026-06-03 12:00 JST", state: "waiting" },
    { id: "EPOCH-DUE-002", label: "Reminder recurrence review", due: "2026-06-05 17:00 JST", state: "planned" },
    { id: "EPOCH-DUE-003", label: "Calendar export handoff", due: "2026-06-07 09:00 JST", state: "blocked on adapter selection" }
  ],
  reminderRules: [
    {
      id: "EPOCH-REM-001",
      scheduleEntryId: "EPOCH-SCH-001",
      label: "Review return reminder preview",
      rrule: "FREQ=DAILY;COUNT=2",
      status: "planned",
      sandboxOnly: true,
      customerVisible: false,
      customerSafeLabel: "Reminder preview is not sending."
    },
    {
      id: "EPOCH-REM-002",
      scheduleEntryId: "EPOCH-SCH-003",
      label: "Revised calendar check reminder",
      rrule: "FREQ=WEEKLY;COUNT=1",
      status: "queued",
      sandboxOnly: true,
      customerVisible: false,
      customerSafeLabel: "Internal reminder preview only."
    }
  ],
  providerReadinessGates: [
    {
      id: "EPOCH-GATE-CALENDAR-001",
      providerKind: "calendar",
      targetProvider: "Provider-neutral calendar adapter",
      status: "reviewing",
      sandboxPrototypePassed: true,
      localRecordsVerified: true,
      customerSafeStatusVerified: true,
      revisedCalendarMappingVerified: false,
      operatorApprovalRecorded: false,
      liveProviderCallsEnabled: false,
      blocker: "Revised-calendar mapping and operator approval still required.",
      customerSafeStatus: "External calendar connection is not active."
    },
    {
      id: "EPOCH-GATE-AVAILABILITY-001",
      providerKind: "availability",
      targetProvider: "Availability export preview",
      status: "planned",
      sandboxPrototypePassed: true,
      localRecordsVerified: true,
      customerSafeStatusVerified: true,
      revisedCalendarMappingVerified: true,
      operatorApprovalRecorded: false,
      liveProviderCallsEnabled: false,
      blocker: "Operator approval required before any live toggle.",
      customerSafeStatus: "Availability is shown from local EPOCH records."
    }
  ],
  providerStatusEvents: [
    { id: "EPOCH-PROVIDER-STATUS-001", label: "Sandbox calendar preview", state: "passed", detail: "Local payload preview exists; live write remains blocked." },
    { id: "EPOCH-PROVIDER-STATUS-002", label: "Customer-safe status check", state: "passed", detail: "Portal text does not expose internal provider controls." },
    { id: "EPOCH-PROVIDER-STATUS-003", label: "Operator approval", state: "waiting", detail: "No live provider toggle until an explicit later approval." }
  ],
  portalTimeline: [
    { label: "Request received", detail: "Timing request is accepted into EPOCH scheduling.", state: "complete" },
    { label: "Availability check", detail: "Operator reviews matching windows.", state: "in-progress" },
    { label: "Provider status", detail: "External calendar connection remains inactive.", state: "sandbox-only" },
    { label: "Confirmation pending", detail: "Customer-safe confirmation will be sent after approval.", state: "queued" }
  ],
  receipts: [
    { id: "EPOCH-RECEIPT-GATE-001", status: "ready", summary: "Provider readiness gate blocks live calendar calls until sandbox, local records, customer-safe status, revised mapping, and operator approval are satisfied." },
    { id: "EPOCH-RECEIPT-LEDGER-001", status: "ready", summary: "Local ledger contains schedule entries, requests, availability windows, reminder rules, and provider-readiness gates." }
  ]
};

export const revisedMonths = [
  "Aster", "Beryl", "Crown", "Dawn", "Ember", "Frost", "Grove",
  "Harbor", "Ivory", "Juniper", "Keystone", "Lumen", "Meridian"
];

export const epochSchedule = initialEpochLedger.scheduleEntries;
export const availabilityWindows = initialEpochLedger.availabilityWindows.map((window) => ({
  ...window,
  capacity: `${window.capacity - window.holds} open of ${window.capacity}`
}));
export const deadlineItems = initialEpochLedger.deadlineItems;
export const portalTimeline = initialEpochLedger.portalTimeline;

export function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function scheduleNeedLabel(value) {
  return scheduleNeedOptions.find((need) => need.value === value)?.label || value;
}

function providerGatePrerequisitesPassed(gate) {
  return Boolean(
    gate?.sandboxPrototypePassed &&
    gate?.localRecordsVerified &&
    gate?.customerSafeStatusVerified &&
    gate?.revisedCalendarMappingVerified &&
    gate?.operatorApprovalRecorded &&
    !["blocked", "failed"].includes(gate?.status)
  );
}

export function providerGateReadyForToggle(gate) {
  return providerGatePrerequisitesPassed(gate) && !gate?.liveProviderCallsEnabled;
}

export function providerGateBlocksLiveCalls(gate) {
  return !providerGatePrerequisitesPassed(gate) || !gate?.liveProviderCallsEnabled;
}

export function createScheduleRequestRecord(form) {
  const requester = String(form.get("requester") || "").trim() || "Schedule requester";
  const need = String(form.get("need") || "diagnostic-call");
  const requestedWindow = String(form.get("window") || "").trim() || "Window to be confirmed";
  const timezone = String(form.get("timezone") || "").trim() || "Asia/Tokyo";
  const createdAt = new Date().toISOString();
  return {
    id: makeId("EPOCH-REQ"),
    requester,
    need,
    requestedWindow,
    timezone,
    status: "queued",
    sandboxOnly: true,
    providerGoLiveRequested: false,
    customerSafeStatus: "Schedule request received; availability is being checked.",
    createdAt
  };
}

export function createScheduleEntryForRequest(request) {
  return {
    id: makeId("EPOCH-SCH"),
    title: scheduleNeedLabel(request.need),
    owner: "EPOCH",
    status: "queued",
    time: request.requestedWindow,
    startIso: "",
    endIso: "",
    timezone: request.timezone,
    customerSafeStatus: request.customerSafeStatus,
    detail: `${request.requester} requested ${scheduleNeedLabel(request.need)}.`
  };
}
