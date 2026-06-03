export const EPOCH_LEDGER_KEY = "epoch.operatingLedger.v5";

export const scheduleNeedOptions = [
  { value: "diagnostic-call", label: "Diagnostic call", entryType: "request" },
  { value: "submission-review-return", label: "Submission review return", entryType: "review-deadline" },
  { value: "project-planning-session", label: "Project planning session", entryType: "request" },
  { value: "deadline-check-in", label: "Deadline check-in", entryType: "follow-up" },
  { value: "reminder-only", label: "Reminder only", entryType: "reminder" }
];

export const scheduleLifecycleActionOptions = [
  { value: "reschedule", label: "Request a new time", status: "reschedule-requested" },
  { value: "cancel", label: "Cancel a scheduled time", status: "cancel-requested" },
  { value: "confirm", label: "Confirm the current time", status: "confirmation-requested" },
  { value: "change-window", label: "Change preferred window", status: "window-change-requested" }
];

export const initialEpochLedger = {
  version: 5,
  generatedAt: "2026-06-04T02:20:00+09:00",
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
    availabilityOptimizationValidation: "ready",
    bookingRecommendationValidation: "ready",
    overloadWarningValidation: "ready",
    recommendationReceiptValidation: "ready",
    deadlineHealthValidation: "ready",
    reminderExecutionValidation: "ready",
    deadlineExecutionValidation: "ready",
    escalationValidation: "ready",
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
    daysPerMonth: 28,
    yearOpeningDayOutsideMonths: true,
    leapDayOutsideMonthsAtYearEnd: true,
    springAnchorMethod: "measured-average-first-spring-day",
    springAnchorSource: "owner-physical-measurement-required",
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
      "public names for the year-opening and leap-year extra days",
      "measurement source for the average first day of spring",
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
  calendarDisplayModes: [
    {
      id: "EPOCH-CALENDAR-MODE-GREGORIAN",
      label: "Gregorian",
      status: "available",
      customerSafeStatus: "Standard Gregorian schedule display is available."
    },
    {
      id: "EPOCH-CALENDAR-MODE-REVISED",
      label: "Revised 13-Month",
      status: "draft-only",
      customerSafeStatus: "Revised 13-month display is available only as a gated preview until the rulepack is owner-approved."
    },
    {
      id: "EPOCH-CALENDAR-MODE-SIDE-BY-SIDE",
      label: "Side-by-side",
      status: "draft-only",
      customerSafeStatus: "Side-by-side display is held behind the revised-calendar rulepack gate."
    }
  ],
  scheduleAuditRecords: [
    {
      id: "EPOCH-SCHEDULE-AUDIT-001",
      scheduleEntryId: "EPOCH-SCH-001",
      actor: "EPOCH App",
      action: "booking-confirmed",
      status: "confirmed",
      customerVisible: true,
      providerGoLiveRequested: false,
      summary: "Schedule Audit product module records the local booking confirmation and timing return without exposing internal controls."
    },
    {
      id: "EPOCH-SCHEDULE-AUDIT-002",
      scheduleEntryId: "EPOCH-SCH-003",
      actor: "EPOCH App",
      action: "revised-rulepack-held",
      status: "blocked",
      customerVisible: false,
      providerGoLiveRequested: false,
      summary: "Revised calendar conversion stays gated until the owner-approved physical spring anchor and display rules are complete."
    }
  ],
  scheduleReceipts: [
    {
      id: "EPOCH-SCHEDULE-RECEIPT-001",
      kind: "schedule-receipt",
      linkedRecordId: "EPOCH-BOOK-001",
      status: "complete",
      customerVisible: true,
      providerGoLiveRequested: false,
      summary: "Schedule Receipts product module shows customer-safe local schedule proof without exposing internal controls."
    },
    {
      id: "EPOCH-SCHEDULE-RECEIPT-002",
      kind: "rulepack-gate",
      linkedRecordId: "EPOCH-RULEPACK-DRAFT-001",
      status: "blocked",
      customerVisible: false,
      providerGoLiveRequested: false,
      summary: "Revised 13-month conversion remains blocked while the draft rulepack awaits owner approval."
    }
  ],
  schedulerLogEntries: [
    {
      id: "EPOCH-SCHEDULER-LOG-001",
      eventKind: "request-accepted",
      linkedRecordId: "EPOCH-REQ-001",
      status: "accepted",
      productLog: true,
      monitorRunnerLog: false,
      recordedAt: "2026-06-03T10:05:00+09:00",
      summary: "Scheduler Log product module recorded an EPOCH schedule request acceptance."
    },
    {
      id: "EPOCH-SCHEDULER-LOG-002",
      eventKind: "timing-returned",
      linkedRecordId: "EPOCH-TIME-RETURN-001",
      status: "returned",
      productLog: true,
      monitorRunnerLog: false,
      recordedAt: "2026-06-03T10:12:00+09:00",
      summary: "Scheduler Log product module recorded an EPOCH timing return to a consuming workflow."
    }
  ],
  calendarSearchQueries: [
    {
      id: "EPOCH-CALENDAR-SEARCH-001",
      query: "review",
      role: "owner",
      includePrivateRecords: true,
      customerSafeOnly: false,
      status: "available"
    },
    {
      id: "EPOCH-CALENDAR-SEARCH-002",
      query: "confirmed",
      role: "customer",
      includePrivateRecords: false,
      customerSafeOnly: true,
      status: "available"
    }
  ],
  calendarSearchResults: [
    {
      id: "EPOCH-CALENDAR-RESULT-001",
      queryId: "EPOCH-CALENDAR-SEARCH-002",
      recordId: "EPOCH-SCH-001",
      recordKind: "schedule-entry",
      displayLabel: "Submission review return window",
      customerVisible: true
    }
  ],
  scheduleTemplates: [
    {
      id: "EPOCH-SCHEDULE-TEMPLATE-001",
      templateKind: "submission-review-return",
      title: "Submission Review Return",
      defaultDurationLabel: "48-hour async return block",
      timezone: "Asia/Tokyo",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Schedule Template product module can prepare reusable timing patterns while EPOCH remains the schedule owner."
    },
    {
      id: "EPOCH-SCHEDULE-TEMPLATE-002",
      templateKind: "cohort-window",
      title: "Recurring Cohort Window",
      defaultDurationLabel: "weekly 60-minute local hold",
      timezone: "Asia/Tokyo",
      customerVisible: false,
      providerGoLiveRequested: false,
      customerSafeStatus: "Recurring cohort timing template is internal until EPOCH confirms availability."
    },
    {
      id: "EPOCH-SCHEDULE-TEMPLATE-003",
      templateKind: "systems-scope-review",
      title: "Systems Scope Review",
      defaultDurationLabel: "30-minute scope and fit review hold",
      timezone: "Asia/Tokyo",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Systems review timing can be requested through EPOCH while service delivery remains in WORKSHOP."
    }
  ],
  avaloniaShellReadiness: {
    id: "EPOCH-AVALONIA-SHELL-001",
    host: "Avalonia",
    nativeCore: "epoch_core",
    status: "planned",
    nextAction: "Create the native EPOCH App shell and bind it to the Native C scheduling core through a stable interop layer.",
    customerSafeStatus: "Native app shell is planned; web surfaces remain client previews over local state."
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
  bookingOptimizationRuns: [
    {
      id: "EPOCH-OPT-001",
      scheduleRequestId: "EPOCH-REQ-WAITLIST-001",
      primaryAvailabilityWindowId: "EPOCH-WIN-002",
      candidateCount: 3,
      overloadWarningCount: 1,
      status: "complete",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "EPOCH ranked local availability options; no external calendar write was made.",
      generatedAt: "2026-06-03T10:28:00+09:00"
    }
  ],
  bookingRecommendationCandidates: [
    {
      id: "EPOCH-BOOK-REC-001",
      optimizationRunId: "EPOCH-OPT-001",
      scheduleRequestId: "EPOCH-REQ-WAITLIST-001",
      availabilityWindowId: "EPOCH-WIN-002",
      label: "Admin scheduling block",
      requestedWindow: "2026-06-06 evening JST",
      recommendedWindow: "Fri 09:00-11:00 JST",
      recommendationType: "best-fit",
      rank: 1,
      score: 96,
      status: "available",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Recommended local window: Fri 09:00-11:00 JST."
    },
    {
      id: "EPOCH-BOOK-REC-002",
      optimizationRunId: "EPOCH-OPT-001",
      scheduleRequestId: "EPOCH-REQ-WAITLIST-001",
      availabilityWindowId: "EPOCH-WIN-003",
      label: "Async deadline pass",
      requestedWindow: "2026-06-06 evening JST",
      recommendedWindow: "Sun 16:00-18:00 JST",
      recommendationType: "alternative",
      rank: 2,
      score: 84,
      status: "available",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Alternate local window: Sun 16:00-18:00 JST."
    },
    {
      id: "EPOCH-BOOK-REC-003",
      optimizationRunId: "EPOCH-OPT-001",
      scheduleRequestId: "EPOCH-REQ-WAITLIST-001",
      availabilityWindowId: "EPOCH-WIN-004",
      label: "Overflow cohort window",
      requestedWindow: "2026-06-06 evening JST",
      recommendedWindow: "Sat 18:00-19:00 JST",
      recommendationType: "waitlist-fallback",
      rank: 3,
      score: 20,
      status: "needs-reschedule",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "This window is full; choose an alternate local window or stay waitlisted."
    }
  ],
  bookingOverloadWarnings: [
    {
      id: "EPOCH-OVERLOAD-001",
      optimizationRunId: "EPOCH-OPT-001",
      availabilityWindowId: "EPOCH-WIN-004",
      loadRatioPercent: 100,
      status: "needs-reschedule",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Preferred window is full; choose an alternate local window or stay waitlisted.",
      recordedAt: "2026-06-03T10:28:00+09:00"
    }
  ],
  bookingRecommendationReceipts: [
    {
      id: "EPOCH-BOOK-REC-RECEIPT-001",
      kind: "booking-recommendation",
      optimizationRunId: "EPOCH-OPT-001",
      status: "complete",
      summary: "EPOCH generated ranked local booking recommendations and one overload warning without live provider calls.",
      customerVisible: true,
      providerGoLiveRequested: false,
      generatedAt: "2026-06-03T10:28:00+09:00"
    }
  ],
  deadlineItems: [
    { id: "EPOCH-DUE-001", label: "Customer schedule confirmation", due: "2026-06-03 12:00 JST", state: "waiting", health: "at-risk", customerSafeStatus: "Confirmation is waiting for operator review." },
    { id: "EPOCH-DUE-002", label: "Reminder recurrence review", due: "2026-06-05 17:00 JST", state: "planned", health: "on-track", customerSafeStatus: "Reminder rule review is planned." },
    { id: "EPOCH-DUE-003", label: "Calendar export handoff", due: "2026-06-07 09:00 JST", state: "blocked on adapter selection", health: "blocked", customerSafeStatus: "Calendar export is not active." }
  ],
  reminderExecutions: [
    {
      id: "EPOCH-REM-EXEC-001",
      reminderRuleId: "EPOCH-REM-001",
      scheduleEntryId: "EPOCH-SCH-001",
      scheduledFor: "2026-06-03T11:30:00+09:00",
      executedAt: "2026-06-03T11:31:00+09:00",
      channel: "local-status",
      status: "dispatched",
      sandboxOnly: true,
      customerVisible: true,
      providerGoLiveRequested: false,
      notificationSendEnabled: false,
      customerSafeStatus: "Reminder status was recorded locally; no notification was sent."
    }
  ],
  deadlineExecutions: [
    {
      id: "EPOCH-DUE-EXEC-001",
      deadlineItemId: "EPOCH-DUE-001",
      linkedEntryId: "EPOCH-SCH-001",
      due: "2026-06-03 12:00 JST",
      evaluatedAt: "2026-06-03T11:32:00+09:00",
      status: "retry-ready",
      health: "at-risk",
      customerVisible: true,
      providerGoLiveRequested: false,
      customerSafeStatus: "Deadline is at risk; EPOCH queued a local escalation check."
    }
  ],
  deadlineEscalations: [
    {
      id: "EPOCH-DUE-ESC-001",
      deadlineExecutionId: "EPOCH-DUE-EXEC-001",
      reminderExecutionId: "EPOCH-REM-EXEC-001",
      owner: "EPOCH operator",
      escalationLevel: 1,
      status: "acknowledged",
      customerVisible: true,
      providerGoLiveRequested: false,
      notificationSendEnabled: false,
      customerSafeStatus: "Operator follow-up is queued locally; no external reminder was sent."
    }
  ],
  reminderDeadlineReceipts: [
    {
      id: "EPOCH-REM-DUE-RECEIPT-001",
      kind: "reminder-deadline-execution",
      status: "complete",
      summary: "EPOCH recorded reminder execution, deadline evaluation, and escalation status without live notification sends.",
      customerVisible: true,
      providerGoLiveRequested: false,
      notificationSendEnabled: false,
      generatedAt: "2026-06-03T11:33:00+09:00"
    }
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
  scheduleLifecycleActions: [
    {
      id: "EPOCH-LIFECYCLE-ACTION-001",
      requestId: "EPOCH-REQ-001",
      actionKind: "reschedule",
      requestedWindow: "Next weekday evening JST",
      reason: "Customer needs a later review window.",
      status: "reschedule-requested",
      customerVisible: true,
      providerCallsEnabled: false,
      monitorWorkflowExposed: false,
      appOwnedLifecycleState: true,
      customerSafeStatus: "Reschedule request is queued for EPOCH App review; external calendar provider calls remain disabled.",
      createdAt: "2026-06-03T11:20:00+09:00"
    }
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
    { id: "EPOCH-CAPACITY-RECEIPT-001", status: "promoted", summary: "Availability capacity workflow released one local hold and promoted a waitlisted request without live provider calls." },
    { id: "EPOCH-REM-DUE-RECEIPT-001", status: "complete", summary: "Reminder and deadline execution workflow recorded local escalation status without live notification sends." }
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
export const bookingOptimizationRuns = initialEpochLedger.bookingOptimizationRuns;
export const bookingRecommendationCandidates = initialEpochLedger.bookingRecommendationCandidates;
export const bookingOverloadWarnings = initialEpochLedger.bookingOverloadWarnings;
export const bookingRecommendationReceipts = initialEpochLedger.bookingRecommendationReceipts;
export const deadlineItems = initialEpochLedger.deadlineItems;
export const reminderExecutions = initialEpochLedger.reminderExecutions;
export const deadlineExecutions = initialEpochLedger.deadlineExecutions;
export const deadlineEscalations = initialEpochLedger.deadlineEscalations;
export const reminderDeadlineReceipts = initialEpochLedger.reminderDeadlineReceipts;
export const scheduleLifecycleActions = initialEpochLedger.scheduleLifecycleActions;
export const portalTimeline = initialEpochLedger.portalTimeline;

export function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function scheduleNeedLabel(value) {
  return scheduleNeedOptions.find((need) => need.value === value)?.label || value;
}

export function scheduleLifecycleActionLabel(value) {
  return scheduleLifecycleActionOptions.find((action) => action.value === value)?.label || value;
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

export function projectRevisedRulepackConstraints(rulepack) {
  const conversionReady = revisedRulepackReady(rulepack);
  const structureReady = Boolean(
    rulepack?.monthCount === 13 &&
    rulepack?.daysPerMonth === 28 &&
    rulepack?.yearOpeningDayOutsideMonths &&
    rulepack?.leapDayOutsideMonthsAtYearEnd &&
    rulepack?.springAnchorMethod &&
    rulepack?.springAnchorSource
  );
  return {
    id: "EPOCH-REVISED-CONSTRAINT-PROJECTION",
    rulepackId: rulepack?.id || "rulepack-pending",
    calendarSystem: rulepack?.calendarSystem || "revised-13-month",
    anchorMethod: rulepack?.springAnchorMethod || "measured-average-first-spring-day",
    anchorSource: rulepack?.springAnchorSource || "owner-physical-measurement-required",
    yearOpeningDayPolicy: rulepack?.yearOpeningDayOutsideMonths
      ? "Year-opening day sits outside the 13 months."
      : "Year-opening day policy is not ready.",
    leapDayPolicy: rulepack?.leapDayOutsideMonthsAtYearEnd
      ? "Leap-year extra day sits outside the 13 months at the end of the year."
      : "Leap-day policy is not ready.",
    intercalaryPolicy: "Common years use 1 day outside months; leap years use 2 days outside months.",
    commonIntercalaryDayCount: rulepack?.yearOpeningDayOutsideMonths ? 1 : 0,
    leapIntercalaryDayCount: rulepack?.yearOpeningDayOutsideMonths && rulepack?.leapDayOutsideMonthsAtYearEnd ? 2 : 0,
    monthCount: rulepack?.monthCount || 0,
    daysPerMonth: rulepack?.daysPerMonth || 0,
    structureReady,
    conversionReady,
    customerSafe: structureReady,
    conversionGateReason: conversionReady
      ? "Owner-approved rulepack allows conversion."
      : "Owner-approved physical spring anchor and display rulepack are required before conversion."
  };
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

export function createScheduleLifecycleActionRecord(form) {
  const requestId = String(form.get("requestId") || "").trim() || "EPOCH-REQ-001";
  const actionKind = String(form.get("actionKind") || "reschedule");
  const requestedWindow = String(form.get("lifecycleWindow") || "").trim() || "Window to be confirmed by EPOCH";
  const reason = String(form.get("reason") || "").trim() || "Customer requested a schedule lifecycle change.";
  const createdAt = new Date().toISOString();
  const status = scheduleLifecycleActionOptions.find((action) => action.value === actionKind)?.status || "lifecycle-action-requested";
  return {
    id: makeId("EPOCH-LIFECYCLE-ACTION"),
    requestId,
    actionKind,
    requestedWindow,
    reason,
    status,
    customerVisible: true,
    providerCallsEnabled: false,
    monitorWorkflowExposed: false,
    appOwnedLifecycleState: true,
    customerSafeStatus: `${scheduleLifecycleActionLabel(actionKind)} is queued for EPOCH App review. External calendar provider calls remain disabled.`,
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

export function availabilityWindowOpenSlots(window) {
  return Math.max(0, Number(window?.capacity || 0) - Number(window?.holds || 0));
}

function bookingRecommendationScore(window) {
  const capacity = Math.max(1, Number(window?.capacity || 0));
  const holds = Math.max(0, Number(window?.holds || 0));
  const openSlots = availabilityWindowOpenSlots(window);
  const liveLocalWindow = window?.status === "available";
  const loadPenalty = Math.round((holds / capacity) * 20);
  const base = liveLocalWindow ? 70 : 20;
  return Math.max(1, Math.min(99, base + Math.min(openSlots, 5) * 8 - loadPenalty));
}

export function rankAvailabilityWindowsForRequest(windows = initialEpochLedger.availabilityWindows) {
  return [...windows]
    .map((window) => ({
      ...window,
      openSlots: availabilityWindowOpenSlots(window),
      score: bookingRecommendationScore(window)
    }))
    .sort((left, right) => {
      const leftOpen = left.status === "available" && left.openSlots > 0 ? 1 : 0;
      const rightOpen = right.status === "available" && right.openSlots > 0 ? 1 : 0;
      if (leftOpen !== rightOpen) return rightOpen - leftOpen;
      if (right.score !== left.score) return right.score - left.score;
      return String(left.startIso || left.id).localeCompare(String(right.startIso || right.id));
    });
}

export function createBookingOptimizationRunForRequest(request, windows = initialEpochLedger.availabilityWindows) {
  const ranked = rankAvailabilityWindowsForRequest(windows);
  const openCandidates = ranked.filter((window) => window.status === "available" && window.openSlots > 0);
  const overloaded = ranked.filter((window) => Number(window.capacity || 0) > 0 && Number(window.holds || 0) >= Number(window.capacity || 0));
  const primaryWindow = openCandidates[0] || ranked[0] || null;
  return {
    id: makeId("EPOCH-OPT"),
    scheduleRequestId: request?.id || "",
    primaryAvailabilityWindowId: primaryWindow?.id || "",
    candidateCount: ranked.length,
    overloadWarningCount: overloaded.length,
    status: openCandidates.length ? "complete" : "needs-reschedule",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: openCandidates.length
      ? "EPOCH generated local booking recommendations; no external calendar write was made."
      : "No local availability is open; a new window is needed.",
    generatedAt: new Date().toISOString()
  };
}

export function createBookingRecommendationCandidateForWindow(run, request, window, rank = 1) {
  const openSlots = availabilityWindowOpenSlots(window);
  const locallyAvailable = window?.status === "available" && openSlots > 0;
  const recommendedWindow = window?.time || window?.label || "window pending";
  const recommendationType = locallyAvailable
    ? (Number(rank || 1) === 1 ? "best-fit" : "alternative")
    : "waitlist-fallback";
  return {
    id: makeId("EPOCH-BOOK-REC"),
    optimizationRunId: run?.id || "",
    scheduleRequestId: request?.id || run?.scheduleRequestId || "",
    availabilityWindowId: window?.id || "",
    label: window?.label || "Availability window",
    requestedWindow: request?.requestedWindow || "",
    recommendedWindow,
    recommendationType,
    rank: Number(rank || 1),
    score: bookingRecommendationScore(window),
    status: locallyAvailable ? "available" : "needs-reschedule",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: locallyAvailable
      ? `${Number(rank || 1) === 1 ? "Recommended" : "Alternate"} local window: ${recommendedWindow}.`
      : "This window is full; choose an alternate local window or stay waitlisted."
  };
}

export function createBookingOverloadWarningForWindow(run, window) {
  const capacity = Math.max(1, Number(window?.capacity || 0));
  const holds = Math.max(0, Number(window?.holds || 0));
  const ratio = Math.round((holds / capacity) * 100);
  return {
    id: makeId("EPOCH-OVERLOAD"),
    optimizationRunId: run?.id || "",
    availabilityWindowId: window?.id || "",
    loadRatioPercent: ratio,
    status: ratio >= 100 ? "needs-reschedule" : "in-progress",
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: ratio >= 100
      ? "Preferred window is full; choose an alternate local window or stay waitlisted."
      : "Preferred window is nearly full; EPOCH is checking alternate local windows.",
    recordedAt: new Date().toISOString()
  };
}

export function createBookingRecommendationReceiptForRun(run, candidates = [], warnings = []) {
  const readyCandidateCount = candidates.filter((candidate) => candidate.status === "available").length;
  const warningWord = warnings.length === 1 ? "warning" : "warnings";
  return {
    id: makeId("EPOCH-BOOK-REC-RECEIPT"),
    kind: "booking-recommendation",
    optimizationRunId: run?.id || "",
    status: readyCandidateCount ? "complete" : "needs-reschedule",
    summary: `${candidates.length} local booking recommendations generated with ${warnings.length} overload ${warningWord} without live provider calls.`,
    customerVisible: true,
    providerGoLiveRequested: false,
    generatedAt: new Date().toISOString()
  };
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

export function createReminderExecutionForRule(rule, entry = null) {
  const now = new Date().toISOString();
  return {
    id: makeId("EPOCH-REM-EXEC"),
    reminderRuleId: rule?.id || "",
    scheduleEntryId: rule?.scheduleEntryId || entry?.id || "",
    scheduledFor: entry?.startIso || now,
    executedAt: now,
    channel: "local-status",
    status: "dispatched",
    sandboxOnly: true,
    customerVisible: true,
    providerGoLiveRequested: false,
    notificationSendEnabled: false,
    customerSafeStatus: "Reminder status was recorded locally; no notification was sent."
  };
}

export function createDeadlineExecutionForItem(item) {
  const health = item?.health === "blocked" ? "at-risk" : (item?.health || "on-track");
  return {
    id: makeId("EPOCH-DUE-EXEC"),
    deadlineItemId: item?.id || "",
    linkedEntryId: item?.linkedEntryId || "EPOCH-SCH-001",
    due: item?.due || "deadline pending",
    evaluatedAt: new Date().toISOString(),
    status: health === "on-track" ? "acknowledged" : "retry-ready",
    health,
    customerVisible: true,
    providerGoLiveRequested: false,
    customerSafeStatus: health === "on-track"
      ? "Deadline is on track after local EPOCH evaluation."
      : "Deadline is at risk; EPOCH queued a local escalation check."
  };
}

export function createDeadlineEscalationForExecution(deadlineExecution, reminderExecution = null) {
  const atRisk = deadlineExecution?.health && deadlineExecution.health !== "on-track";
  return {
    id: makeId("EPOCH-DUE-ESC"),
    deadlineExecutionId: deadlineExecution?.id || "",
    reminderExecutionId: reminderExecution?.id || "",
    owner: "EPOCH operator",
    escalationLevel: atRisk ? 1 : 0,
    status: atRisk ? "acknowledged" : "complete",
    customerVisible: true,
    providerGoLiveRequested: false,
    notificationSendEnabled: false,
    customerSafeStatus: atRisk
      ? "Operator follow-up is queued locally; no external reminder was sent."
      : "No escalation is needed after local deadline evaluation."
  };
}

export function createReminderDeadlineReceiptForEscalation(escalation, deadlineExecution, reminderExecution = null) {
  const escalated = Number(escalation?.escalationLevel || 0) > 0;
  return {
    id: makeId("EPOCH-REM-DUE-RECEIPT"),
    kind: "reminder-deadline-execution",
    status: escalated ? "acknowledged" : "complete",
    summary: escalated
      ? "EPOCH recorded reminder execution, deadline evaluation, and escalation status without live notification sends."
      : "EPOCH recorded reminder execution and deadline evaluation without live notification sends.",
    reminderExecutionId: reminderExecution?.id || escalation?.reminderExecutionId || "",
    deadlineExecutionId: deadlineExecution?.id || escalation?.deadlineExecutionId || "",
    escalationId: escalation?.id || "",
    customerVisible: true,
    providerGoLiveRequested: false,
    notificationSendEnabled: false,
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
