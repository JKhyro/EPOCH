export const EPOCH_LEDGER_KEY = "epoch.operatingLedger.v3";

export const scheduleNeedOptions = [
  { value: "diagnostic-call", label: "Diagnostic call", entryType: "request" },
  { value: "submission-review-return", label: "Submission review return", entryType: "review-deadline" },
  { value: "project-planning-session", label: "Project planning session", entryType: "request" },
  { value: "deadline-check-in", label: "Deadline check-in", entryType: "follow-up" },
  { value: "reminder-only", label: "Reminder only", entryType: "reminder" }
];

export const initialEpochLedger = {
  version: 3,
  generatedAt: "2026-06-03T23:35:00+09:00",
  schedulingCoreReadiness: {
    id: "EPOCH-CORE-SCHEDULING-001",
    nativeContract: "epoch_core",
    scheduleEntryValidation: "ready",
    scheduleRequestValidation: "ready",
    availabilityValidation: "ready",
    capacityValidation: "ready",
    waitlistValidation: "ready",
    holdReleaseValidation: "ready",
    waitlistPromotionValidation: "ready",
    deadlineHealthValidation: "ready",
    recurrenceSandboxValidation: "ready",
    recurrenceSeriesValidation: "ready",
    customerSafeStatusValidation: "ready",
    revisedRulepackGate: "conversion-held",
    liveProviderPosture: "blocked"
  },
  revisedCalendarRulepack: {
    id: "EPOCH-RULEPACK-DRAFT-001",
    versionId: "owner-approved-rulepack-required",
    calendarSystem: "revised-13-month",
    monthCount: 13,
    status: "draft-only",
    ownerApproved: false,
    monthNamesApproved: false,
    dayDistributionApproved: false,
    intercalaryDaysApproved: false,
    leapRuleApproved: false,
    epochAnchorApproved: false,
    dayOfWeekMappingApproved: false,
    formattingRulesApproved: false,
    timezoneBoundaryApproved: false,
    recurrenceMappingApproved: false,
    publicDisplayWordingApproved: false,
    storageIdentifierApproved: false,
    conversionRulesApproved: false,
    conversionLogicEnabled: false,
    missingApprovals: [
      "month names and display order",
      "number of days in each month",
      "extra or intercalary day treatment",
      "leap rule",
      "Gregorian anchor",
      "day-of-week mapping",
      "formatting and parsing",
      "timezone boundary behavior",
      "recurrence behavior",
      "public display wording",
      "storage representation"
    ],
    customerSafeStatus: "Revised calendar display is draft-only; schedule conversion waits for the owner-approved rulepack."
  },
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
    },
    {
      id: "EPOCH-REQ-WAITLIST-001",
      requester: "Overflow scheduling request",
      need: "project-planning-session",
      requestedWindow: "2026-06-06 evening JST",
      timezone: "Asia/Tokyo",
      status: "waitlisted",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Preferred timing is full; EPOCH has placed the request on the local waitlist.",
      createdAt: "2026-06-03T10:20:00+09:00"
    }
  ],
  timingHandoffs: [
    {
      id: "EPOCH-TIME-HANDOFF-001",
      sourceProduct: "WORKSHOP",
      sourceHandoffId: "WORKSHOP-EPOCH-HANDOFF-001",
      scheduleRequestId: "EPOCH-REQ-001",
      requestedWindow: "2026-06-03 evening JST",
      timezone: "Asia/Tokyo",
      status: "accepted",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Timing handoff accepted into EPOCH; availability is being resolved locally."
    },
    {
      id: "EPOCH-TIME-HANDOFF-002",
      sourceProduct: "WORKSHOP",
      sourceHandoffId: "WORKSHOP-EPOCH-HANDOFF-CONFLICT-001",
      scheduleRequestId: "EPOCH-REQ-CONFLICT-001",
      requestedWindow: "Fully booked evening review block",
      timezone: "Asia/Tokyo",
      status: "needs-reschedule",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Timing handoff needs a new window because local availability is full."
    }
  ],
  availabilityConflictDecisions: [
    {
      id: "EPOCH-CONFLICT-001",
      timingHandoffId: "EPOCH-TIME-HANDOFF-001",
      scheduleRequestId: "EPOCH-REQ-001",
      availabilityWindowId: "EPOCH-WIN-001",
      status: "clear",
      conflictType: "capacity-clear",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerVisible: true,
      customerSafeStatus: "Availability is clear for a local booking hold."
    },
    {
      id: "EPOCH-CONFLICT-002",
      timingHandoffId: "EPOCH-TIME-HANDOFF-002",
      scheduleRequestId: "EPOCH-REQ-CONFLICT-001",
      availabilityWindowId: "",
      status: "needs-reschedule",
      conflictType: "capacity-full",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerVisible: true,
      customerSafeStatus: "Requested timing is not available; a new window is needed."
    }
  ],
  scheduleRequestAcceptances: [
    {
      id: "EPOCH-ACCEPT-001",
      scheduleRequestId: "EPOCH-REQ-001",
      availabilityWindowId: "EPOCH-WIN-001",
      requester: "WORKSHOP timing handoff",
      status: "accepted",
      acceptedAt: "2026-06-03T10:05:00+09:00",
      sandboxOnly: true,
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Schedule request accepted; a local availability hold is being prepared."
    }
  ],
  availabilityHolds: [
    {
      id: "EPOCH-HOLD-001",
      acceptanceId: "EPOCH-ACCEPT-001",
      scheduleRequestId: "EPOCH-REQ-001",
      availabilityWindowId: "EPOCH-WIN-001",
      startIso: "2026-06-03T19:00:00+09:00",
      endIso: "2026-06-03T20:00:00+09:00",
      timezone: "Asia/Tokyo",
      status: "held",
      expiresAt: "2026-06-03T12:00:00+09:00",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Availability is held locally while the booking confirmation is prepared."
    },
    {
      id: "EPOCH-HOLD-EXPIRED-001",
      acceptanceId: "EPOCH-ACCEPT-EXPIRED-001",
      scheduleRequestId: "EPOCH-REQ-EXPIRED-001",
      availabilityWindowId: "EPOCH-WIN-004",
      startIso: "2026-06-06T18:00:00+09:00",
      endIso: "2026-06-06T19:00:00+09:00",
      timezone: "Asia/Tokyo",
      status: "released",
      expiresAt: "2026-06-03T10:25:00+09:00",
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Expired local hold was released; no external calendar write was made."
    }
  ],
  bookingConfirmations: [
    {
      id: "EPOCH-BOOK-001",
      acceptanceId: "EPOCH-ACCEPT-001",
      availabilityHoldId: "EPOCH-HOLD-001",
      scheduleEntryId: "EPOCH-SCH-001",
      scheduleRequestId: "EPOCH-REQ-001",
      requester: "WORKSHOP timing handoff",
      confirmedWindow: "2026-06-03 19:00 JST",
      timezone: "Asia/Tokyo",
      status: "confirmed",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Schedule confirmed locally for 2026-06-03 19:00 JST."
    }
  ],
  scheduleStatusEvents: [
    {
      id: "EPOCH-STATUS-001",
      bookingConfirmationId: "EPOCH-BOOK-001",
      scheduleRequestId: "EPOCH-REQ-001",
      label: "Booking confirmed",
      state: "confirmed",
      customerVisible: true,
      customerSafeStatus: "Schedule confirmed locally; external calendar connection remains inactive.",
      occurredAt: "2026-06-03T10:10:00+09:00"
    }
  ],
  bookingReceipts: [
    {
      id: "EPOCH-BOOK-RECEIPT-001",
      bookingConfirmationId: "EPOCH-BOOK-001",
      scheduleStatusEventId: "EPOCH-STATUS-001",
      status: "ready",
      summary: "Request acceptance, availability hold, booking confirmation, and customer-safe status event are locally recorded without live provider calls.",
      generatedAt: "2026-06-03T10:10:00+09:00"
    }
  ],
  timingReturnPayloads: [
    {
      id: "EPOCH-TIME-RETURN-001",
      timingHandoffId: "EPOCH-TIME-HANDOFF-001",
      conflictDecisionId: "EPOCH-CONFLICT-001",
      bookingConfirmationId: "EPOCH-BOOK-001",
      scheduleRequestId: "EPOCH-REQ-001",
      requester: "WORKSHOP timing handoff",
      requestedWindow: "Mon-Wed 19:00-21:00 JST",
      status: "returned",
      returnType: "booking-confirmed",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Confirmed timing returned locally to the requesting workflow."
    },
    {
      id: "EPOCH-TIME-RETURN-002",
      timingHandoffId: "EPOCH-TIME-HANDOFF-002",
      conflictDecisionId: "EPOCH-CONFLICT-002",
      bookingConfirmationId: "",
      scheduleRequestId: "EPOCH-REQ-CONFLICT-001",
      requester: "Reschedule handoff",
      requestedWindow: "Fully booked evening review block",
      status: "needs-reschedule",
      returnType: "availability-conflict",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "No local availability is open for the requested timing; ask for a new window."
    }
  ],
  timingReturnReceipts: [
    {
      id: "EPOCH-TIME-RETURN-RECEIPT-001",
      timingReturnPayloadId: "EPOCH-TIME-RETURN-001",
      conflictDecisionId: "EPOCH-CONFLICT-001",
      status: "ready",
      summary: "EPOCH returned a confirmed local booking payload without live provider calls.",
      generatedAt: "2026-06-03T10:12:00+09:00"
    },
    {
      id: "EPOCH-TIME-RETURN-RECEIPT-002",
      timingReturnPayloadId: "EPOCH-TIME-RETURN-002",
      conflictDecisionId: "EPOCH-CONFLICT-002",
      status: "needs-reschedule",
      summary: "EPOCH returned a customer-safe availability conflict payload without live provider calls.",
      generatedAt: "2026-06-03T10:13:00+09:00"
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
    },
    {
      id: "EPOCH-WIN-004",
      label: "Overflow cohort window",
      time: "Sat 18:00-19:00 JST",
      startIso: "2026-06-06T18:00:00+09:00",
      endIso: "2026-06-06T19:00:00+09:00",
      timezone: "Asia/Tokyo",
      capacity: 1,
      holds: 1,
      status: "unavailable"
    }
  ],
  availabilityCapacitySnapshots: [
    {
      id: "EPOCH-CAPACITY-001",
      availabilityWindowId: "EPOCH-WIN-004",
      capacity: 1,
      holds: 1,
      waitlistCount: 1,
      releasedHoldCount: 1,
      promotionCandidateCount: 1,
      status: "waitlisted",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "The preferred window is full; one released local hold makes the first waitlisted request eligible for promotion.",
      recordedAt: "2026-06-03T10:26:00+09:00"
    }
  ],
  availabilityWaitlistEntries: [
    {
      id: "EPOCH-WAITLIST-001",
      scheduleRequestId: "EPOCH-REQ-WAITLIST-001",
      requestedWindow: "2026-06-06 evening JST",
      timezone: "Asia/Tokyo",
      priority: 1,
      status: "waitlisted",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Preferred timing is full; the request is first on the local waitlist.",
      createdAt: "2026-06-03T10:21:00+09:00"
    }
  ],
  availabilityHoldReleases: [
    {
      id: "EPOCH-HOLD-RELEASE-001",
      availabilityHoldId: "EPOCH-HOLD-EXPIRED-001",
      availabilityWindowId: "EPOCH-WIN-004",
      releasedCapacity: 1,
      status: "released",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "A local hold was released and the next waitlisted request can be promoted.",
      releasedAt: "2026-06-03T10:26:00+09:00"
    }
  ],
  availabilityPromotionCandidates: [
    {
      id: "EPOCH-PROMOTION-001",
      waitlistEntryId: "EPOCH-WAITLIST-001",
      availabilityWindowId: "EPOCH-WIN-004",
      promotedHoldId: "EPOCH-HOLD-PROMOTED-001",
      status: "promoted",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "The waitlisted request can be promoted into a local availability hold.",
      promotedAt: "2026-06-03T10:27:00+09:00"
    }
  ],
  availabilityCapacityReceipts: [
    {
      id: "EPOCH-CAPACITY-RECEIPT-001",
      kind: "availability-capacity",
      status: "promoted",
      summary: "EPOCH released one local hold and promoted the first waitlisted request without live provider calls.",
      customerVisible: true,
      providerGoLiveRequested: false,
      generatedAt: "2026-06-03T10:27:00+09:00"
    }
  ],
  deadlineItems: [
    { id: "EPOCH-DUE-001", label: "Customer schedule confirmation", due: "2026-06-03 12:00 JST", state: "waiting", health: "at-risk", customerSafeStatus: "Confirmation is waiting for operator review." },
    { id: "EPOCH-DUE-002", label: "Reminder recurrence review", due: "2026-06-05 17:00 JST", state: "planned", health: "on-track", customerSafeStatus: "Reminder rule review is planned." },
    { id: "EPOCH-DUE-003", label: "Calendar export handoff", due: "2026-06-07 09:00 JST", state: "blocked on adapter selection", health: "blocked", customerSafeStatus: "Calendar export is not active." }
  ],
  recurrenceCandidates: [
    {
      id: "EPOCH-REC-001",
      scheduleEntryId: "EPOCH-SCH-001",
      label: "Weekly return-window review",
      rrule: "FREQ=WEEKLY;COUNT=4",
      calendarSystem: "gregorian",
      status: "approved",
      sandboxOnly: true,
      operatorApproved: true,
      createsFutureEntries: true,
      customerSafeStatus: "Repeat pattern is approved for local EPOCH-generated instances."
    },
    {
      id: "EPOCH-REC-002",
      scheduleEntryId: "EPOCH-SCH-003",
      label: "Revised-calendar recurrence hold",
      rrule: "FREQ=MONTHLY;COUNT=2",
      calendarSystem: "revised-13-month",
      status: "blocked",
      sandboxOnly: true,
      operatorApproved: false,
      createsFutureEntries: false,
      customerSafeStatus: "Revised-calendar recurrence waits for the owner-approved rulepack."
    }
  ],
  recurringBookingSeries: [
    {
      id: "EPOCH-SERIES-001",
      recurrenceRuleId: "EPOCH-REC-001",
      scheduleEntryId: "EPOCH-SCH-001",
      title: "Weekly return-window review series",
      rrule: "FREQ=WEEKLY;COUNT=4",
      calendarSystem: "gregorian",
      timezone: "Asia/Tokyo",
      status: "confirmed",
      instanceCount: 4,
      confirmedCount: 3,
      exceptionCount: 1,
      customerVisible: true,
      sandboxOnly: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Weekly return-window review is confirmed locally; one instance needs a new window."
    }
  ],
  recurringBookingInstances: [
    {
      id: "EPOCH-SERIES-INST-001",
      seriesId: "EPOCH-SERIES-001",
      recurrenceRuleId: "EPOCH-REC-001",
      occurrenceIndex: 1,
      scheduleEntryId: "EPOCH-SCH-001",
      bookingConfirmationId: "EPOCH-BOOK-001",
      availabilityWindowId: "EPOCH-WIN-001",
      startIso: "2026-06-03T19:00:00+09:00",
      endIso: "2026-06-03T20:00:00+09:00",
      timezone: "Asia/Tokyo",
      status: "confirmed",
      conflictExceptionId: "",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Recurring schedule instance confirmed locally for 2026-06-03 19:00 JST."
    },
    {
      id: "EPOCH-SERIES-INST-002",
      seriesId: "EPOCH-SERIES-001",
      recurrenceRuleId: "EPOCH-REC-001",
      occurrenceIndex: 2,
      scheduleEntryId: "EPOCH-SCH-SERIES-002",
      bookingConfirmationId: "EPOCH-BOOK-SERIES-002",
      availabilityWindowId: "EPOCH-WIN-001",
      startIso: "2026-06-10T19:00:00+09:00",
      endIso: "2026-06-10T20:00:00+09:00",
      timezone: "Asia/Tokyo",
      status: "confirmed",
      conflictExceptionId: "",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Recurring schedule instance confirmed locally for 2026-06-10 19:00 JST."
    },
    {
      id: "EPOCH-SERIES-INST-003",
      seriesId: "EPOCH-SERIES-001",
      recurrenceRuleId: "EPOCH-REC-001",
      occurrenceIndex: 3,
      scheduleEntryId: "",
      bookingConfirmationId: "",
      availabilityWindowId: "",
      startIso: "2026-06-17T19:00:00+09:00",
      endIso: "2026-06-17T20:00:00+09:00",
      timezone: "Asia/Tokyo",
      status: "needs-reschedule",
      conflictExceptionId: "EPOCH-SERIES-EXCEPTION-001",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Recurring schedule instance needs a new window for 2026-06-17."
    },
    {
      id: "EPOCH-SERIES-INST-004",
      seriesId: "EPOCH-SERIES-001",
      recurrenceRuleId: "EPOCH-REC-001",
      occurrenceIndex: 4,
      scheduleEntryId: "EPOCH-SCH-SERIES-004",
      bookingConfirmationId: "EPOCH-BOOK-SERIES-004",
      availabilityWindowId: "EPOCH-WIN-003",
      startIso: "2026-06-24T16:00:00+09:00",
      endIso: "2026-06-24T17:00:00+09:00",
      timezone: "Asia/Tokyo",
      status: "confirmed",
      conflictExceptionId: "",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Recurring schedule instance confirmed locally for 2026-06-24 16:00 JST."
    }
  ],
  recurrenceConflictExceptions: [
    {
      id: "EPOCH-SERIES-EXCEPTION-001",
      seriesId: "EPOCH-SERIES-001",
      instanceId: "EPOCH-SERIES-INST-003",
      recurrenceRuleId: "EPOCH-REC-001",
      conflictType: "capacity-full",
      requestedWindow: "2026-06-17T19:00:00+09:00/2026-06-17T20:00:00+09:00",
      status: "needs-reschedule",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "One recurring booking instance needs a new window; no external calendar write was made."
    }
  ],
  recurringSeriesReceipts: [
    {
      id: "EPOCH-SERIES-RECEIPT-001",
      seriesId: "EPOCH-SERIES-001",
      status: "ready",
      summary: "Recurring booking series generated local instances and propagated one customer-safe conflict exception without live provider calls.",
      generatedAt: "2026-06-03T22:40:00+09:00"
    }
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
    { label: "Availability check", detail: "Operator reviews matching windows and waitlist priority.", state: "in-progress" },
    { label: "Waitlist status", detail: "Full windows can create local waitlist entries and customer-safe promotion updates.", state: "waitlisted" },
    { label: "Provider status", detail: "External calendar connection remains inactive.", state: "sandbox-only" },
    { label: "Confirmation pending", detail: "Customer-safe confirmation will be sent after approval.", state: "queued" }
  ],
  receipts: [
    { id: "EPOCH-RECEIPT-GATE-001", status: "ready", summary: "Provider readiness gate blocks live calendar calls until sandbox, local records, customer-safe status, revised mapping, and operator approval are satisfied." },
    { id: "EPOCH-RECEIPT-LEDGER-001", status: "ready", summary: "Local ledger contains schedule entries, requests, availability windows, waitlists, reminder rules, and provider-readiness gates." },
    { id: "EPOCH-CAPACITY-RECEIPT-001", status: "promoted", summary: "Availability capacity workflow released one local hold and promoted a waitlisted request without live provider calls." }
  ]
};

export const revisedMonths = [
  "Draft Month 01", "Draft Month 02", "Draft Month 03", "Draft Month 04",
  "Draft Month 05", "Draft Month 06", "Draft Month 07", "Draft Month 08",
  "Draft Month 09", "Draft Month 10", "Draft Month 11", "Draft Month 12",
  "Draft Month 13"
];

export const epochSchedule = initialEpochLedger.scheduleEntries;
export const availabilityWindows = initialEpochLedger.availabilityWindows.map((window) => ({
  ...window,
  capacity: `${window.capacity - window.holds} open of ${window.capacity}`
}));
export const availabilityCapacitySnapshots = initialEpochLedger.availabilityCapacitySnapshots;
export const availabilityWaitlistEntries = initialEpochLedger.availabilityWaitlistEntries;
export const availabilityHoldReleases = initialEpochLedger.availabilityHoldReleases;
export const availabilityPromotionCandidates = initialEpochLedger.availabilityPromotionCandidates;
export const availabilityCapacityReceipts = initialEpochLedger.availabilityCapacityReceipts;
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

export function revisedRulepackHasRequiredApprovals(rulepack) {
  return Boolean(
    rulepack?.id &&
    rulepack?.versionId &&
    rulepack?.monthCount === 13 &&
    rulepack?.monthNamesApproved &&
    rulepack?.dayDistributionApproved &&
    rulepack?.intercalaryDaysApproved &&
    rulepack?.leapRuleApproved &&
    rulepack?.epochAnchorApproved &&
    rulepack?.dayOfWeekMappingApproved &&
    rulepack?.formattingRulesApproved &&
    rulepack?.timezoneBoundaryApproved &&
    rulepack?.recurrenceMappingApproved &&
    rulepack?.publicDisplayWordingApproved &&
    rulepack?.storageIdentifierApproved &&
    rulepack?.conversionRulesApproved &&
    rulepack?.ownerApproved
  );
}

export function revisedRulepackReady(rulepack) {
  return revisedRulepackHasRequiredApprovals(rulepack) && Boolean(rulepack?.conversionLogicEnabled);
}

export function revisedRulepackBlocksConversion(rulepack) {
  return !revisedRulepackReady(rulepack);
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

export function selectOpenAvailabilityWindow(windows = initialEpochLedger.availabilityWindows) {
  return windows.find((window) => Number(window.holds || 0) < Number(window.capacity || 0)) || null;
}

export function selectFullAvailabilityWindow(windows = initialEpochLedger.availabilityWindows) {
  return windows.find((window) => Number(window.holds || 0) >= Number(window.capacity || 0)) || null;
}

export function createTimingHandoffForRequest(request, sourceProduct = "EPOCH") {
  return {
    id: makeId("EPOCH-TIME-HANDOFF"),
    sourceProduct,
    sourceHandoffId: `${sourceProduct}-LOCAL-${request.id}`,
    scheduleRequestId: request.id,
    requestedWindow: request.requestedWindow,
    timezone: request.timezone,
    status: "accepted",
    sandboxOnly: true,
    providerGoLiveRequested: false,
    customerSafeStatus: "Timing handoff accepted into EPOCH; availability is being resolved locally."
  };
}

export function createAvailabilityConflictDecisionForHandoff(handoff, availabilityWindow = null) {
  const hasCapacity = Boolean(availabilityWindow);
  return {
    id: makeId("EPOCH-CONFLICT"),
    timingHandoffId: handoff.id,
    scheduleRequestId: handoff.scheduleRequestId,
    availabilityWindowId: availabilityWindow?.id || "",
    status: hasCapacity ? "clear" : "needs-reschedule",
    conflictType: hasCapacity ? "capacity-clear" : "capacity-full",
    sandboxOnly: true,
    providerGoLiveRequested: false,
    customerVisible: true,
    customerSafeStatus: hasCapacity
      ? "Availability is clear for a local booking hold."
      : "Requested timing is not available; a new window is needed."
  };
}

export function createScheduleRequestAcceptanceForRequest(request, availabilityWindow = null) {
  return {
    id: makeId("EPOCH-ACCEPT"),
    scheduleRequestId: request.id,
    availabilityWindowId: availabilityWindow?.id || "",
    requester: request.requester,
    status: "accepted",
    acceptedAt: new Date().toISOString(),
    sandboxOnly: true,
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: "Schedule request accepted; a local availability hold is being prepared."
  };
}

export function createAvailabilityHoldForAcceptance(acceptance, availabilityWindow = null) {
  return {
    id: makeId("EPOCH-HOLD"),
    acceptanceId: acceptance.id,
    scheduleRequestId: acceptance.scheduleRequestId,
    availabilityWindowId: acceptance.availabilityWindowId || availabilityWindow?.id || "",
    startIso: availabilityWindow?.startIso || "",
    endIso: availabilityWindow?.endIso || "",
    timezone: availabilityWindow?.timezone || "Asia/Tokyo",
    status: "held",
    expiresAt: new Date().toISOString(),
    sandboxOnly: true,
    providerGoLiveRequested: false,
    customerSafeStatus: availabilityWindow
      ? "Availability is held locally while the booking confirmation is prepared."
      : "Availability hold is pending an operator-selected window."
  };
}

export function createAvailabilityCapacitySnapshotForWindow(window, waitlistEntries = [], holdReleases = [], promotionCandidates = []) {
  const windowWaitlist = waitlistEntries.filter((entry) => entry.status === "waitlisted");
  const windowReleases = holdReleases.filter((release) => release.availabilityWindowId === window?.id);
  const windowPromotions = promotionCandidates.filter((candidate) => candidate.availabilityWindowId === window?.id);
  const full = Number(window?.holds || 0) >= Number(window?.capacity || 0);
  return {
    id: makeId("EPOCH-CAPACITY"),
    availabilityWindowId: window?.id || "",
    capacity: Number(window?.capacity || 0),
    holds: Number(window?.holds || 0),
    waitlistCount: windowWaitlist.length,
    releasedHoldCount: windowReleases.length,
    promotionCandidateCount: windowPromotions.length,
    status: full && windowWaitlist.length ? "waitlisted" : (full ? "unavailable" : "available"),
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: full
      ? "The preferred window is full; EPOCH is tracking local waitlist and promotion status."
      : "Availability is open for local schedule requests.",
    recordedAt: new Date().toISOString()
  };
}

export function createAvailabilityWaitlistEntryForRequest(request, decision, priority = 1) {
  return {
    id: makeId("EPOCH-WAITLIST"),
    scheduleRequestId: request.id,
    requestedWindow: request.requestedWindow,
    timezone: request.timezone,
    priority: Number(priority || 1),
    status: "waitlisted",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: decision?.customerSafeStatus || "Preferred timing is full; the request is on the local waitlist.",
    createdAt: new Date().toISOString()
  };
}

export function createAvailabilityHoldReleaseForHold(hold, availabilityWindow) {
  return {
    id: makeId("EPOCH-HOLD-RELEASE"),
    availabilityHoldId: hold?.id || "",
    availabilityWindowId: availabilityWindow?.id || hold?.availabilityWindowId || "",
    releasedCapacity: 1,
    status: "released",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: "A local hold was released and the next waitlisted request can be promoted.",
    releasedAt: new Date().toISOString()
  };
}

export function createAvailabilityPromotionCandidateForWaitlist(entry, availabilityWindow, release) {
  return {
    id: makeId("EPOCH-PROMOTION"),
    waitlistEntryId: entry?.id || "",
    availabilityWindowId: availabilityWindow?.id || release?.availabilityWindowId || "",
    promotedHoldId: makeId("EPOCH-HOLD-PROMOTED"),
    status: "promoted",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: "The waitlisted request can be promoted into a local availability hold.",
    promotedAt: new Date().toISOString()
  };
}

export function createAvailabilityCapacityReceiptForPromotion(candidate, release, entry) {
  const promoted = candidate?.status === "promoted";
  return {
    id: makeId("EPOCH-CAPACITY-RECEIPT"),
    kind: "availability-capacity",
    status: promoted ? "promoted" : "waitlisted",
    summary: promoted
      ? "EPOCH released one local hold and promoted the first waitlisted request without live provider calls."
      : "EPOCH recorded local availability capacity and waitlist status without live provider calls.",
    waitlistEntryId: entry?.id || candidate?.waitlistEntryId || "",
    holdReleaseId: release?.id || "",
    promotionCandidateId: candidate?.id || "",
    customerVisible: true,
    providerGoLiveRequested: false,
    generatedAt: new Date().toISOString()
  };
}

export function createBookingConfirmationForHold(hold, request, entry = null) {
  const confirmedWindow = entry?.time || request.requestedWindow || "Window to be confirmed";
  return {
    id: makeId("EPOCH-BOOK"),
    acceptanceId: hold.acceptanceId,
    availabilityHoldId: hold.id,
    scheduleEntryId: entry?.id || "",
    scheduleRequestId: request.id,
    requester: request.requester,
    confirmedWindow,
    timezone: hold.timezone || request.timezone,
    status: "confirmed",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: `Schedule confirmed locally for ${confirmedWindow}.`
  };
}

export function createScheduleStatusEventForBooking(confirmation, request) {
  return {
    id: makeId("EPOCH-STATUS"),
    bookingConfirmationId: confirmation.id,
    scheduleRequestId: request.id,
    label: "Booking confirmed",
    state: "confirmed",
    customerVisible: true,
    customerSafeStatus: "Schedule confirmed locally; external calendar connection remains inactive.",
    occurredAt: new Date().toISOString()
  };
}

export function createScheduleStatusEventForConflict(decision, request) {
  return {
    id: makeId("EPOCH-STATUS"),
    bookingConfirmationId: "",
    scheduleRequestId: request.id,
    label: "Timing needs reschedule",
    state: "needs-reschedule",
    customerVisible: true,
    customerSafeStatus: decision.customerSafeStatus,
    occurredAt: new Date().toISOString()
  };
}

export function createTimingReturnPayloadForDecision(decision, request, bookingConfirmation = null) {
  const bookingReady = decision.status === "clear" && bookingConfirmation;
  return {
    id: makeId("EPOCH-TIME-RETURN"),
    timingHandoffId: decision.timingHandoffId,
    conflictDecisionId: decision.id,
    bookingConfirmationId: bookingConfirmation?.id || "",
    scheduleRequestId: request.id,
    requester: request.requester,
    requestedWindow: request.requestedWindow,
    status: bookingReady ? "returned" : "needs-reschedule",
    returnType: bookingReady ? "booking-confirmed" : "availability-conflict",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: bookingReady
      ? "Confirmed timing returned locally to the requesting workflow."
      : "No local availability is open for the requested timing; ask for a new window."
  };
}

export function createBookingReceiptForConfirmation(confirmation, statusEvent) {
  return {
    id: makeId("EPOCH-BOOK-RECEIPT"),
    bookingConfirmationId: confirmation.id,
    scheduleStatusEventId: statusEvent.id,
    status: "ready",
    summary: "Request acceptance, availability hold, booking confirmation, and customer-safe status event are locally recorded without live provider calls.",
    generatedAt: new Date().toISOString()
  };
}

export function createTimingReturnReceiptForPayload(payload, decision) {
  return {
    id: makeId("EPOCH-TIME-RETURN-RECEIPT"),
    timingReturnPayloadId: payload.id,
    conflictDecisionId: decision.id,
    status: payload.status === "returned" ? "ready" : "needs-reschedule",
    summary: payload.status === "returned"
      ? "EPOCH returned a confirmed local booking payload without live provider calls."
      : "EPOCH returned a customer-safe availability conflict payload without live provider calls.",
    generatedAt: new Date().toISOString()
  };
}

function addDaysIso(iso, days) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function formatCustomerWindow(iso, timezone = "Asia/Tokyo") {
  if (!iso) return "window pending";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min} ${timezone.replace("Asia/Tokyo", "JST")}`;
}

function recurrenceCountFromRule(rrule, fallback = 4) {
  const match = String(rrule || "").match(/COUNT=(\d+)/i);
  return match ? Math.max(1, Number(match[1])) : fallback;
}

export function createRecurringBookingSeriesForRule(rule, entry) {
  const count = recurrenceCountFromRule(rule?.rrule, 4);
  return {
    id: makeId("EPOCH-SERIES"),
    recurrenceRuleId: rule?.id || "",
    scheduleEntryId: entry?.id || rule?.scheduleEntryId || "",
    title: `${rule?.label || entry?.title || "Recurring booking"} series`,
    rrule: rule?.rrule || "",
    calendarSystem: rule?.calendarSystem || "gregorian",
    timezone: entry?.timezone || "Asia/Tokyo",
    status: rule?.status === "blocked" ? "blocked" : "confirmed",
    instanceCount: count,
    confirmedCount: 0,
    exceptionCount: 0,
    customerVisible: true,
    sandboxOnly: true,
    providerGoLiveRequested: false,
    customerSafeStatus: rule?.status === "blocked"
      ? "Recurring booking series is held until calendar rules are approved."
      : "Recurring booking series is generated locally; external calendar connection remains inactive."
  };
}

export function createRecurringBookingInstanceForSeries(series, occurrenceIndex, availabilityWindow = null, entry = null) {
  const hasCapacity = Boolean(availabilityWindow && Number(availabilityWindow.holds || 0) < Number(availabilityWindow.capacity || 0));
  const baseStart = entry?.startIso || availabilityWindow?.startIso || "";
  const baseEnd = entry?.endIso || availabilityWindow?.endIso || "";
  const days = Math.max(0, Number(occurrenceIndex || 1) - 1) * 7;
  const startIso = addDaysIso(baseStart, days) || baseStart;
  const endIso = addDaysIso(baseEnd, days) || baseEnd;
  const timezone = series?.timezone || availabilityWindow?.timezone || entry?.timezone || "Asia/Tokyo";
  return {
    id: makeId("EPOCH-SERIES-INST"),
    seriesId: series?.id || "",
    recurrenceRuleId: series?.recurrenceRuleId || "",
    occurrenceIndex: Number(occurrenceIndex || 1),
    scheduleEntryId: hasCapacity ? (entry?.id || series?.scheduleEntryId || "") : "",
    bookingConfirmationId: hasCapacity ? makeId("EPOCH-BOOK-SERIES") : "",
    availabilityWindowId: hasCapacity ? availabilityWindow.id : "",
    startIso,
    endIso,
    timezone,
    status: hasCapacity ? "confirmed" : "needs-reschedule",
    conflictExceptionId: "",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: hasCapacity
      ? `Recurring schedule instance confirmed locally for ${formatCustomerWindow(startIso, timezone)}.`
      : "Recurring schedule instance needs a new window before confirmation."
  };
}

export function createRecurrenceConflictExceptionForInstance(instance, series) {
  return {
    id: makeId("EPOCH-SERIES-EXCEPTION"),
    seriesId: series?.id || instance?.seriesId || "",
    instanceId: instance?.id || "",
    recurrenceRuleId: series?.recurrenceRuleId || instance?.recurrenceRuleId || "",
    conflictType: "capacity-full",
    requestedWindow: `${instance?.startIso || "window pending"}/${instance?.endIso || "window pending"}`,
    status: "needs-reschedule",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: "One recurring booking instance needs a new window; no external calendar write was made."
  };
}

export function createRecurringSeriesReceiptForSeries(series, instances = [], exceptions = []) {
  return {
    id: makeId("EPOCH-SERIES-RECEIPT"),
    seriesId: series?.id || "",
    status: exceptions.length ? "needs-reschedule" : "ready",
    summary: `${instances.length} recurring booking instances generated locally; ${exceptions.length} customer-safe conflict exceptions propagated without live provider calls.`,
    generatedAt: new Date().toISOString()
  };
}
