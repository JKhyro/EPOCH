(function () {
  const timezoneOffsets = {
    "Asia/Tokyo": "+09:00"
  };

  const offerLabels = {
    education: "Education",
    service_ops: "Service operations",
    consulting: "Consulting",
    technical_support: "Technical support",
    management_system: "Management system"
  };

  const ledgerVersion = 1;
  const persistenceSchema = "epoch.ledger-persistence";
  const persistenceAdapter = "browser-local-durable-ready";
  const ledgerCollections = [
    "tracks",
    "offerPackages",
    "curriculumFrameworks",
    "packageGameplans",
    "campaignRoutes",
    "leads",
    "opportunities",
    "engagements",
    "workPlans",
    "agentHandoffs",
    "routePlacements",
    "monitorHealthChecks",
    "notificationEvents",
    "customers",
    "cohorts",
    "sessions",
    "assignments",
    "submissions",
    "reviews",
    "followups",
    "receipts"
  ];

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function stamp(now) {
    return now.toISOString().replace(/\D/g, "").slice(0, 14);
  }

  function stableStringify(value) {
    if (Array.isArray(value)) {
      return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    }
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value ?? null);
  }

  function hashText(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return `fnv1a32-${hash.toString(16).padStart(8, "0")}`;
  }

  function checksumOperatingData(currentData) {
    const data = normalizedOperatingData(currentData);
    delete data.persistence;
    delete data.routePlacements;
    return hashText(stableStringify(data));
  }

  function withTimezone(value, timezone) {
    const raw = clean(value);
    if (!raw) return null;
    if (/[zZ]$|[+-]\d\d:\d\d$/.test(raw)) return raw;
    const offset = timezoneOffsets[timezone] || "+00:00";
    return raw.length === 16 ? `${raw}:00${offset}` : `${raw}${offset}`;
  }

  function ensureCollections(data) {
    for (const collection of ledgerCollections) {
      if (!Array.isArray(data[collection])) data[collection] = [];
    }
  }

  function defaultRoutePlacements() {
    return [
      {
        id: "synapse-epoch-admin",
        label: "EPOCH Admin",
        href: "#admin",
        surface: "admin",
        visibility: "internal",
        routeKind: "suite-entry",
        status: "ready",
        sourceSystem: "EPOCH",
        targetSystem: "SYNAPSE",
        summaryKey: "queue",
        placement: "link",
        duplicateUi: false
      },
      {
        id: "synapse-epoch-monitor",
        label: "EPOCH MONITOR",
        href: "#monitor",
        surface: "monitor",
        visibility: "internal",
        routeKind: "monitor-entry",
        status: "ready",
        sourceSystem: "EPOCH",
        targetSystem: "SYNAPSE",
        summaryKey: "health",
        placement: "link-or-embed",
        duplicateUi: false
      },
      {
        id: "synapse-epoch-customer-status",
        label: "EPOCH Customer Status",
        href: "#student",
        surface: "student",
        visibility: "controlled-customer",
        routeKind: "status-entry",
        status: "ready",
        sourceSystem: "EPOCH",
        targetSystem: "SYNAPSE",
        summaryKey: "visible-updates",
        placement: "link",
        duplicateUi: false
      },
      {
        id: "synapse-epoch-intake",
        label: "EPOCH Intake",
        href: "#public",
        surface: "public",
        visibility: "public-intake",
        routeKind: "conversion-entry",
        status: "ready",
        sourceSystem: "EPOCH",
        targetSystem: "SYNAPSE",
        summaryKey: "pipeline",
        placement: "link",
        duplicateUi: false
      }
    ];
  }

  function normalizedOperatingData(data) {
    const nextData = cloneData(data || {});
    for (const collection of ledgerCollections) {
      if (!Array.isArray(nextData[collection])) nextData[collection] = [];
    }
    if (!nextData.timezone) nextData.timezone = "Asia/Tokyo";
    if (!Array.isArray(nextData.routePlacements) || !nextData.routePlacements.length) {
      nextData.routePlacements = defaultRoutePlacements();
    }
    if (!Array.isArray(nextData.statuses)) {
      nextData.statuses = ["planned", "waiting", "submitted", "reviewing", "returned", "overdue", "blocked", "canceled", "complete"];
    }
    return nextData;
  }

  function validatePersistenceMetadata(metadata, options = {}) {
    if (metadata === undefined || metadata === null) return null;
    if (typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error("ledger persistence metadata must be an object");
    }
    if (metadata.schema !== persistenceSchema) {
      throw new Error("ledger persistence metadata has an unsupported schema");
    }
    if (metadata.adapter !== persistenceAdapter) {
      throw new Error("ledger persistence metadata has an unsupported adapter");
    }
    if (!clean(metadata.ledgerId)) throw new Error("ledger persistence metadata is missing a ledger id");
    if (!Number.isInteger(Number(metadata.revision)) || Number(metadata.revision) < 1) {
      throw new Error("ledger persistence metadata revision must be a positive integer");
    }
    if (metadata.parentRevision !== null && metadata.parentRevision !== undefined && !Number.isInteger(Number(metadata.parentRevision))) {
      throw new Error("ledger persistence parent revision must be an integer or null");
    }
    if (!clean(metadata.source)) throw new Error("ledger persistence metadata is missing a source");
    if (!clean(metadata.checksum)) throw new Error("ledger persistence metadata is missing a checksum");
    if (!clean(metadata.snapshotAt)) throw new Error("ledger persistence metadata is missing a snapshot timestamp");
    if (!clean(metadata.adapterState)) throw new Error("ledger persistence metadata is missing an adapter state");

    const normalized = {
      schema: persistenceSchema,
      adapter: persistenceAdapter,
      ledgerId: clean(metadata.ledgerId),
      revision: Number(metadata.revision),
      parentRevision: metadata.parentRevision === undefined || metadata.parentRevision === null
        ? null
        : Number(metadata.parentRevision),
      source: clean(metadata.source),
      checksum: clean(metadata.checksum),
      snapshotAt: clean(metadata.snapshotAt),
      adapterState: clean(metadata.adapterState),
      state: clean(metadata.state) || clean(metadata.adapterState),
      libraryReady: metadata.libraryReady !== false,
      recoveryNote: clean(metadata.recoveryNote) || "No recovery note recorded."
    };

    if (options.expectedChecksum && normalized.checksum !== options.expectedChecksum) {
      throw new Error("ledger persistence checksum does not match the ledger data");
    }
    return normalized;
  }

  function createPersistenceMetadata(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = data.timezone || "Asia/Tokyo";
    const existing = validatePersistenceMetadata(data.persistence);
    const checksum = checksumOperatingData(data);
    const checksumMatches = existing && existing.checksum === checksum;

    if (options.preserveExisting && existing && !checksumMatches) {
      throw new Error("existing ledger persistence checksum does not match the ledger data");
    }
    if (options.preserveExisting && existing) return existing;

    const parentRevision = options.parentRevision === undefined
      ? existing?.revision || null
      : (options.parentRevision === null ? null : Number(options.parentRevision));
    const revision = options.revision
      ? Number(options.revision)
      : Math.max(Number(parentRevision || 0), existing?.revision || 0) + 1;
    const adapterState = clean(options.adapterState) || "durable-ready-snapshot";

    return {
      schema: persistenceSchema,
      adapter: persistenceAdapter,
      ledgerId: clean(options.ledgerId) || existing?.ledgerId || `ledger-${stamp(now)}`,
      revision,
      parentRevision,
      source: clean(options.source) || "browser-local",
      checksum,
      snapshotAt: withTimezone(now.toISOString(), timezone),
      adapterState,
      state: adapterState,
      libraryReady: true,
      recoveryNote: clean(options.recoveryNote) || "Browser-local JSON snapshot; ready for LIBRARY durable persistence."
    };
  }

  function summarizePersistenceState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const existing = validatePersistenceMetadata(data.persistence);
    const checksum = checksumOperatingData(data);
    const metadata = existing && existing.checksum === checksum ? existing : createPersistenceMetadata(data, {
      now: options.now,
      adapterState: existing ? "modified-local" : "live-local",
      recoveryNote: existing
        ? "Local ledger has changed since the last durable-ready snapshot."
        : "Live browser-local ledger; no durable snapshot has been written yet."
    });

    return {
      ledgerId: metadata.ledgerId,
      revision: metadata.revision,
      parentRevision: metadata.parentRevision,
      source: metadata.source,
      adapter: metadata.adapter,
      adapterState: metadata.adapterState,
      state: metadata.state,
      checksum: metadata.checksum,
      snapshotAt: metadata.snapshotAt,
      libraryReady: metadata.libraryReady,
      recoveryNote: metadata.recoveryNote
    };
  }

  function parseLedgerPayload(payload) {
    if (typeof payload === "string") return JSON.parse(payload);
    return cloneData(payload || {});
  }

  function operatingDataFromLedgerPayload(payload) {
    const parsed = parseLedgerPayload(payload);
    const candidate = parsed && parsed.data ? parsed.data : parsed;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error("ledger payload must be an object");
    }
    const envelopePersistence = validatePersistenceMetadata(parsed && parsed.persistence);
    const dataPersistence = validatePersistenceMetadata(candidate.persistence);
    if (envelopePersistence && dataPersistence && stableStringify(envelopePersistence) !== stableStringify(dataPersistence)) {
      throw new Error("ledger persistence metadata mismatch between envelope and data");
    }
    for (const collection of ledgerCollections) {
      if (candidate[collection] !== undefined && !Array.isArray(candidate[collection])) {
        throw new Error(`ledger collection ${collection} must be an array`);
      }
    }
    if (candidate.statuses !== undefined && !Array.isArray(candidate.statuses)) {
      throw new Error("ledger statuses must be an array");
    }
    const normalized = normalizedOperatingData(candidate);

    for (const collection of ledgerCollections) {
      if (!Array.isArray(normalized[collection])) {
        throw new Error(`ledger collection ${collection} must be an array`);
      }
    }
    if (!normalized.statuses.includes("reviewing") || !normalized.statuses.includes("returned")) {
      throw new Error("ledger statuses are missing required delivery states");
    }
    const persistence = envelopePersistence || dataPersistence;
    if (persistence) {
      const checksum = checksumOperatingData(normalized);
      if (persistence.checksum !== checksum) {
        throw new Error("ledger persistence checksum does not match the ledger data");
      }
      normalized.persistence = persistence;
    }
    return normalized;
  }

  function findFirstVisibleAssignment(data) {
    return data.assignments.find((assignment) => assignment.externalVisible) || data.assignments[0];
  }

  function findReviewableSubmission(data) {
    return data.submissions.find((submission) => submission.status === "reviewing" || submission.status === "submitted")
      || data.submissions[0];
  }

  function findSchedulableRequest(data) {
    return data.assignments.find((assignment) => assignment.externalVisible && assignment.status !== "returned")
      || data.assignments[0];
  }

  function findHandoffEligibleEngagement(data) {
    return data.engagements.find((engagement) => engagement.status === "active" || engagement.status === "planned")
      || data.engagements[0];
  }

  function trackForOffer(offerKind) {
    return offerKind === "education" ? "track-eiken-upper" : "track-service-ops";
  }

  function packageForRequest(data, offerKind, packageId, isUnder19) {
    if (isUnder19) {
      const under19Package = data.offerPackages.find((item) => item.routing === "compatibility-required");
      if (under19Package) return under19Package;
    }
    return data.offerPackages.find((item) => item.id === packageId)
      || data.offerPackages.find((item) => item.offerKind === offerKind && item.status === "active")
      || null;
  }

  function packageById(data, packageId) {
    return data.offerPackages.find((item) => item.id === packageId) || null;
  }

  function gameplanById(data, gameplanId) {
    return data.packageGameplans.find((item) => item.id === gameplanId) || null;
  }

  function gameplanForPackage(data, packageId) {
    return data.packageGameplans.find((item) => item.packageId === packageId) || null;
  }

  function frameworkById(data, frameworkId) {
    return data.curriculumFrameworks.find((item) => item.id === frameworkId) || null;
  }

  function customerForOpportunity(data, opportunity) {
    const assignment = data.assignments.find((item) => item.opportunityId === opportunity.id);
    if (assignment?.customerId) {
      const assignedCustomer = data.customers.find((item) => item.id === assignment.customerId);
      if (assignedCustomer) return assignedCustomer;
    }
    const lead = data.leads.find((item) => item.id === opportunity.leadId);
    return data.customers.find((item) => item.packageId === opportunity.packageId)
      || data.customers.find((item) => lead && item.trackId === lead.trackId)
      || data.customers[0]
      || null;
  }

  function deliveryStatusForStatus(status) {
    if (status === "complete") return "posted";
    if (status === "blocked") return "blocked";
    return "pending";
  }

  function createNotificationEventRecord(data, details, now, timezone) {
    const status = clean(details.status) || "complete";
    return {
      id: `update-${clean(details.sourceKind) || "event"}-${stamp(now)}-${data.notificationEvents.length + 1}`,
      customerId: clean(details.customerId) || null,
      sourceKind: clean(details.sourceKind) || "operating-record",
      sourceId: clean(details.sourceId) || null,
      channel: "customer-update",
      audience: "customer",
      title: clean(details.title) || "Customer update",
      summary: clean(details.summary) || "Status updated.",
      status,
      deliveryStatus: clean(details.deliveryStatus) || deliveryStatusForStatus(status),
      visible: details.visible !== false,
      createdAt: withTimezone(now.toISOString(), timezone),
      deliverAfterAt: withTimezone(details.deliverAfterAt, timezone) || withTimezone(now.toISOString(), timezone)
    };
  }

  function localDateFor(value) {
    const text = clean(value);
    return text ? text.slice(0, 10) : null;
  }

  function customerById(data, customerId) {
    return data.customers.find((item) => item.id === customerId) || null;
  }

  function createCalendarEntry(data, details, timezone) {
    const customer = customerById(data, details.customerId);
    const startAt = withTimezone(details.startAt, timezone);
    const endAt = withTimezone(details.endAt, timezone);
    const dueAt = withTimezone(details.dueAt, timezone);
    const primaryTime = startAt || dueAt || endAt;

    return {
      id: `calendar-${clean(details.sourceKind)}-${clean(details.sourceId)}`,
      sourceKind: clean(details.sourceKind),
      sourceId: clean(details.sourceId),
      title: clean(details.title) || "Calendar entry",
      timeKind: clean(details.timeKind) || "schedule-window",
      startAt,
      endAt,
      dueAt,
      timezone,
      localDate: localDateFor(primaryTime),
      status: clean(details.status) || "planned",
      owner: clean(details.owner) || null,
      customerId: clean(details.customerId) || null,
      customerName: customer?.displayName || null,
      externalVisible: Boolean(details.externalVisible),
      updateEventId: clean(details.updateEventId) || null
    };
  }

  function createIntakeRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const requesterName = clean(input.requesterName);
    const requestSummary = clean(input.requestSummary);
    const offerKind = clean(input.offerKind) || "education";
    const ageBand = clean(input.ageBand) || "adult";
    const intakeLane = clean(input.intakeLane) || (ageBand === "under-19" ? "parent or guardian" : "19+ individual");
    const billingRegion = clean(input.billingRegion) || "Japan JPY billing";
    const documentType = clean(input.documentType) || "not specified";
    const targetResult = clean(input.targetResult) || "not specified";
    const targetLevel = clean(input.targetLevel) || "diagnostic";
    const baselineSampleState = clean(input.baselineSampleState) || "not submitted";
    const weaknessFocus = clean(input.weaknessFocus) || "diagnostic pending";
    const availableStudyTime = clean(input.availableStudyTime) || "not specified";
    const deadlineTimezone = clean(input.deadlineTimezone) || "not specified";
    const preferredWindow = withTimezone(input.preferredWindow, timezone) || withTimezone(now.toISOString(), timezone);
    const isUnder19 = ageBand === "under-19";
    const offerPackage = packageForRequest(nextData, offerKind, clean(input.packageId), isUnder19);
    const packageGameplan = gameplanForPackage(nextData, offerPackage?.id);
    const curriculumFramework = packageGameplan ? frameworkById(nextData, packageGameplan.frameworkId) : null;
    const gameplanStatus = packageGameplan ? "gameplan-linked" : "gameplan-pending";

    if (!requesterName) throw new Error("requesterName is required");
    if (!requestSummary) throw new Error("requestSummary is required");

    const trackId = offerPackage?.trackId || trackForOffer(offerKind);
    const offerLabel = offerPackage?.name || offerLabels[offerKind] || "Commercial service";
    const qualifiedSummary = [
      requestSummary,
      `Intake lane: ${intakeLane}`,
      `Document type: ${documentType}`,
      `Target result: ${targetResult}`,
      `Target level: ${targetLevel}`,
      `Baseline sample: ${baselineSampleState}`,
      `Weakness focus: ${weaknessFocus}`,
      `Available study time: ${availableStudyTime}`,
      `Deadline/timezone: ${deadlineTimezone}`,
      `Billing region: ${billingRegion}`,
      `Gameplan: ${packageGameplan?.title || "gameplan pending"}`
    ].join(" | ");
    const customerId = `customer-intake-${requestStamp}`;
    const assignmentId = `request-intake-${requestStamp}`;
    const opportunityId = `opp-intake-${requestStamp}`;
    const nextAction = isUnder19
      ? "Run compatibility and guardian assessment before acceptance"
      : `Qualify ${offerLabel} and propose the first paid step`;

    const lead = {
      id: `lead-intake-${requestStamp}`,
      name: `${requesterName} request`,
      trackId,
      packageId: offerPackage?.id || null,
      frameworkId: curriculumFramework?.id || null,
      gameplanId: packageGameplan?.id || null,
      gameplanStatus,
      targetLevel,
      baselineSampleState,
      weaknessFocus,
      availableStudyTime,
      intakeLane,
      billingRegion,
      status: isUnder19 ? "waiting" : "planned",
      nextAction,
      nextActionAt: preferredWindow
    };

    const opportunity = {
      id: opportunityId,
      leadId: lead.id,
      packageId: offerPackage?.id || null,
      frameworkId: curriculumFramework?.id || null,
      gameplanId: packageGameplan?.id || null,
      gameplanStatus,
      targetLevel,
      baselineSampleState,
      weaknessFocus,
      availableStudyTime,
      status: isUnder19 ? "waiting" : "planned",
      estimatedValueJpy: offerPackage?.priceJpy || 0,
      intakeLane,
      billingRegion,
      nextAction,
      nextActionAt: preferredWindow
    };

    const customer = {
      id: customerId,
      displayName: requesterName,
      trackId,
      packageId: offerPackage?.id || null,
      frameworkId: curriculumFramework?.id || null,
      gameplanId: packageGameplan?.id || null,
      gameplanStatus,
      targetLevel,
      baselineSampleState,
      weaknessFocus,
      availableStudyTime,
      ageBand,
      intakeLane,
      billingRegion,
      externalStatus: isUnder19
        ? "Request received; compatibility and guardian review required before acceptance."
        : `${offerLabel} request received; next update follows internal review.`
    };

    const assignment = {
      id: assignmentId,
      customerId,
      packageId: offerPackage?.id || null,
      frameworkId: curriculumFramework?.id || null,
      gameplanId: packageGameplan?.id || null,
      gameplanStatus,
      opportunityId,
      title: `${offerLabel} intake request`,
      dueAt: preferredWindow,
      status: "waiting",
      externalVisible: true,
      documentType,
      targetResult,
      targetLevel,
      baselineSampleState,
      weaknessFocus,
      availableStudyTime,
      deadlineTimezone,
      intakeLane,
      billingRegion,
      summary: qualifiedSummary
    };

    const followup = {
      id: `followup-intake-${requestStamp}`,
      customerId,
      title: `Review ${offerLabel.toLowerCase()} request`,
      status: "planned",
      nextActionAt: preferredWindow
    };

    const receipt = {
      id: `receipt-intake-${requestStamp}`,
      customerId,
      kind: "intake-request",
      status: "complete",
      createdAt: withTimezone(now.toISOString(), timezone),
      frameworkId: curriculumFramework?.id || null,
      gameplanId: packageGameplan?.id || null,
      gameplanStatus,
      note: `Captured ${offerLabel.toLowerCase()} request for ${intakeLane} with ${billingRegion}; ${gameplanStatus}.`
    };
    const notificationEvent = createNotificationEventRecord(nextData, {
      customerId,
      sourceKind: "intake",
      sourceId: assignment.id,
      title: `${offerLabel} request received`,
      summary: customer.externalStatus,
      deliverAfterAt: preferredWindow
    }, now, timezone);

    nextData.leads.unshift(lead);
    nextData.opportunities.unshift(opportunity);
    nextData.customers.unshift(customer);
    nextData.assignments.unshift(assignment);
    nextData.followups.unshift(followup);
    nextData.receipts.unshift(receipt);
    nextData.notificationEvents.unshift(notificationEvent);

    return {
      data: nextData,
      records: {
        lead,
        opportunity,
        customer,
        assignment,
        followup,
        receipt,
        notificationEvent
      }
    };
  }

  function createSubmissionRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const assignmentId = clean(input.assignmentId) || findFirstVisibleAssignment(nextData)?.id;
    const sourceAssignment = nextData.assignments.find((item) => item.id === assignmentId);
    const customerId = clean(input.customerId) || sourceAssignment?.customerId || nextData.customers[0]?.id;
    const submissionTitle = clean(input.submissionTitle) || "Submitted work";
    const submissionSummary = clean(input.submissionSummary);
    const reviewDueAt = withTimezone(input.reviewDueAt, timezone) || withTimezone(now.toISOString(), timezone);

    if (!assignmentId) throw new Error("assignmentId is required");
    if (!customerId) throw new Error("customerId is required");
    if (!submissionSummary) throw new Error("submissionSummary is required");

    const submission = {
      id: `submission-flow-${requestStamp}`,
      assignmentId,
      customerId,
      packageId: sourceAssignment?.packageId || null,
      frameworkId: sourceAssignment?.frameworkId || null,
      gameplanId: sourceAssignment?.gameplanId || null,
      gameplanStatus: sourceAssignment?.gameplanStatus || null,
      targetLevel: sourceAssignment?.targetLevel || null,
      baselineSampleState: sourceAssignment?.baselineSampleState || null,
      weaknessFocus: sourceAssignment?.weaknessFocus || null,
      availableStudyTime: sourceAssignment?.availableStudyTime || null,
      title: submissionTitle,
      summary: submissionSummary,
      submittedAt: withTimezone(now.toISOString(), timezone),
      status: "reviewing",
      reviewDueAt
    };

    const review = {
      id: `review-flow-${requestStamp}`,
      submissionId: submission.id,
      owner: "Jack",
      status: "reviewing",
      returnedAt: null,
      summary: "Review in progress; return feedback and next action."
    };

    const followup = {
      id: `followup-review-${requestStamp}`,
      customerId,
      title: `Return review: ${submissionTitle}`,
      status: "planned",
      nextActionAt: reviewDueAt
    };
    const notificationEvent = createNotificationEventRecord(nextData, {
      customerId,
      sourceKind: "submission",
      sourceId: submission.id,
      title: `${submissionTitle} received`,
      summary: `${submissionTitle} submitted; review is in progress.`,
      deliverAfterAt: reviewDueAt
    }, now, timezone);

    const assignment = sourceAssignment;
    if (assignment) assignment.status = "submitted";

    const customer = nextData.customers.find((item) => item.id === customerId);
    if (customer) {
      customer.externalStatus = `${submissionTitle} submitted; review is in progress.`;
    }

    nextData.submissions.unshift(submission);
    nextData.reviews.unshift(review);
    nextData.followups.unshift(followup);
    nextData.notificationEvents.unshift(notificationEvent);

    return {
      data: nextData,
      records: {
        submission,
        review,
        followup,
        notificationEvent
      }
    };
  }

  function returnReviewRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const submissionId = clean(input.submissionId) || findReviewableSubmission(nextData)?.id;
    const returnedSummary = clean(input.returnedSummary) || "Feedback returned with next action.";

    if (!submissionId) throw new Error("submissionId is required");

    const submission = nextData.submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error("submission not found");

    submission.status = "returned";

    let review = nextData.reviews.find((item) => item.submissionId === submissionId);
    if (!review) {
      review = {
        id: `review-return-${stamp(now)}`,
        submissionId,
        owner: "Jack",
        status: "returned",
        returnedAt: null,
        summary: ""
      };
      nextData.reviews.unshift(review);
    }
    review.status = "returned";
    review.returnedAt = withTimezone(now.toISOString(), timezone);
    review.summary = returnedSummary;

    const assignment = nextData.assignments.find((item) => item.id === submission.assignmentId);
    if (assignment) assignment.status = "returned";

    const customer = nextData.customers.find((item) => item.id === submission.customerId);
    if (customer) {
      customer.externalStatus = `Review returned: ${returnedSummary}`;
    }

    const receipt = {
      id: `receipt-review-${stamp(now)}`,
      customerId: submission.customerId,
      kind: "returned-feedback",
      status: "complete",
      createdAt: withTimezone(now.toISOString(), timezone),
      note: returnedSummary
    };
    const notificationEvent = createNotificationEventRecord(nextData, {
      customerId: submission.customerId,
      sourceKind: "review",
      sourceId: review.id,
      title: "Review returned",
      summary: returnedSummary
    }, now, timezone);

    nextData.receipts.unshift(receipt);
    nextData.notificationEvents.unshift(notificationEvent);

    return {
      data: nextData,
      records: {
        submission,
        review,
        receipt,
        notificationEvent
      }
    };
  }

  function createScheduleRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);
    if (!Array.isArray(nextData.cohorts)) nextData.cohorts = [];
    if (!Array.isArray(nextData.sessions)) nextData.sessions = [];

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const assignmentId = clean(input.assignmentId) || findSchedulableRequest(nextData)?.id;
    const sessionTitle = clean(input.sessionTitle) || "Diagnostic and scheduling session";
    const owner = clean(input.owner) || "Jack";
    const startAt = withTimezone(input.startAt, timezone);
    const endAt = withTimezone(input.endAt, timezone);
    const deadlineAt = withTimezone(input.deadlineAt, timezone) || startAt;

    if (!assignmentId) throw new Error("assignmentId is required");
    if (!startAt) throw new Error("startAt is required");
    if (!endAt) throw new Error("endAt is required");

    const assignment = nextData.assignments.find((item) => item.id === assignmentId);
    if (!assignment) throw new Error("assignment not found");

    const customerId = assignment.customerId || nextData.customers[0]?.id;
    const customer = nextData.customers.find((item) => item.id === customerId);
    const trackId = customer?.trackId || assignment.trackId || "track-service-ops";

    const cohort = {
      id: `cohort-schedule-${requestStamp}`,
      trackId,
      packageId: assignment.packageId || null,
      frameworkId: assignment.frameworkId || null,
      gameplanId: assignment.gameplanId || null,
      gameplanStatus: assignment.gameplanStatus || null,
      name: `${sessionTitle} lane`,
      status: "planned",
      owner,
      startAt
    };

    const session = {
      id: `session-schedule-${requestStamp}`,
      cohortId: cohort.id,
      assignmentId,
      customerId,
      packageId: assignment.packageId || null,
      frameworkId: assignment.frameworkId || null,
      gameplanId: assignment.gameplanId || null,
      gameplanStatus: assignment.gameplanStatus || null,
      title: sessionTitle,
      startAt,
      endAt,
      timezone,
      status: "planned",
      owner
    };

    const followup = {
      id: `followup-deadline-${requestStamp}`,
      customerId,
      title: `Deadline control: ${sessionTitle}`,
      status: "planned",
      nextActionAt: deadlineAt
    };
    const notificationEvent = createNotificationEventRecord(nextData, {
      customerId,
      sourceKind: "session",
      sourceId: session.id,
      title: `${sessionTitle} scheduled`,
      summary: `${sessionTitle} scheduled for ${startAt.replace("T", " ").replace("+09:00", " JST")}; deadline control is active.`,
      deliverAfterAt: startAt
    }, now, timezone);

    assignment.status = "planned";
    assignment.dueAt = deadlineAt;
    assignment.owner = owner;

    if (customer) {
      customer.externalStatus = `${sessionTitle} scheduled for ${startAt.replace("T", " ").replace("+09:00", " JST")}; deadline control is active.`;
    }

    nextData.cohorts.unshift(cohort);
    nextData.sessions.unshift(session);
    nextData.followups.unshift(followup);
    nextData.notificationEvents.unshift(notificationEvent);

    return {
      data: nextData,
      records: {
        cohort,
        session,
        followup,
        assignment,
        notificationEvent
      }
    };
  }

  function decideOpportunityRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);
    if (!Array.isArray(nextData.cohorts)) nextData.cohorts = [];
    if (!Array.isArray(nextData.sessions)) nextData.sessions = [];

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const decision = clean(input.decision) || "accept";
    const opportunityId = clean(input.opportunityId) || nextData.opportunities.find((item) => item.status === "planned" || item.status === "waiting" || item.status === "deferred")?.id;
    const owner = clean(input.owner) || "Jack";
    const note = clean(input.note || input.decisionNote) || "Opportunity reviewed.";
    const planStartAt = withTimezone(input.planStartAt, timezone) || withTimezone(now.toISOString(), timezone);
    const planEndAt = withTimezone(input.planEndAt, timezone) || planStartAt;
    const planDueAt = withTimezone(input.planDueAt, timezone) || planStartAt;

    if (!["accept", "defer", "reject"].includes(decision)) throw new Error("decision must be accept, defer, or reject");
    if (!opportunityId) throw new Error("opportunityId is required");

    const opportunity = nextData.opportunities.find((item) => item.id === opportunityId);
    if (!opportunity) throw new Error("opportunity not found");
    if (
      decision === "accept"
      && nextData.engagements.some((item) => item.opportunityId === opportunity.id && item.status !== "canceled")
    ) {
      throw new Error("opportunity already has an active engagement");
    }

    const offerPackage = packageById(nextData, opportunity.packageId);
    const customer = customerForOpportunity(nextData, opportunity);
    const sourceAssignment = nextData.assignments.find((item) => item.opportunityId === opportunity.id);
    const packageGameplan = gameplanById(nextData, opportunity.gameplanId || customer?.gameplanId || sourceAssignment?.gameplanId)
      || gameplanForPackage(nextData, opportunity.packageId);
    const curriculumFramework = frameworkById(nextData, opportunity.frameworkId || packageGameplan?.frameworkId || customer?.frameworkId || sourceAssignment?.frameworkId);
    const gameplanStatus = packageGameplan ? "gameplan-linked" : "gameplan-pending";
    const targetLevel = clean(opportunity.targetLevel || customer?.targetLevel || sourceAssignment?.targetLevel) || null;
    const baselineSampleState = clean(opportunity.baselineSampleState || customer?.baselineSampleState || sourceAssignment?.baselineSampleState) || null;
    const weaknessFocus = clean(opportunity.weaknessFocus || customer?.weaknessFocus || sourceAssignment?.weaknessFocus) || null;
    const availableStudyTime = clean(opportunity.availableStudyTime || customer?.availableStudyTime || sourceAssignment?.availableStudyTime) || null;
    const packageName = offerPackage?.name || opportunity.packageId || "selected package";
    const valueJpy = Number(opportunity.estimatedValueJpy || offerPackage?.priceJpy || 0);
    const decidedAt = withTimezone(now.toISOString(), timezone);
    const statusMap = {
      accept: "accepted",
      defer: "deferred",
      reject: "rejected"
    };

    opportunity.status = statusMap[decision];
    opportunity.owner = owner;
    opportunity.decisionNote = note;
    opportunity.decidedAt = decidedAt;
    opportunity.frameworkId = curriculumFramework?.id || opportunity.frameworkId || null;
    opportunity.gameplanId = packageGameplan?.id || opportunity.gameplanId || null;
    opportunity.gameplanStatus = gameplanStatus;
    opportunity.targetLevel = targetLevel;
    opportunity.baselineSampleState = baselineSampleState;
    opportunity.weaknessFocus = weaknessFocus;
    opportunity.availableStudyTime = availableStudyTime;
    opportunity.nextAction = decision === "accept"
      ? `Start ${packageName} engagement plan`
      : decision === "defer"
        ? `Defer ${packageName} and follow up later`
        : `Close ${packageName} opportunity`;
    opportunity.nextActionAt = planDueAt;

    const records = { opportunity };

    if (decision === "accept") {
      const createdCustomer = customer ? null : {
        id: `customer-engagement-${requestStamp}`,
        displayName: `${packageName} customer`,
        trackId: offerPackage?.trackId || "track-service-ops",
        packageId: opportunity.packageId,
        frameworkId: curriculumFramework?.id || null,
        gameplanId: packageGameplan?.id || null,
        gameplanStatus,
        targetLevel,
        baselineSampleState,
        weaknessFocus,
        availableStudyTime,
        ageBand: "unknown",
        externalStatus: `${packageName} accepted; onboarding and first submission plan are active.`
      };
      const customerId = customer?.id || createdCustomer.id;
      const engagement = {
        id: `engagement-${requestStamp}`,
        opportunityId: opportunity.id,
        customerId,
        packageId: opportunity.packageId,
        frameworkId: curriculumFramework?.id || null,
        gameplanId: packageGameplan?.id || null,
        gameplanStatus,
        targetLevel,
        baselineSampleState,
        weaknessFocus,
        availableStudyTime,
        status: "active",
        valueJpy,
        owner,
        acceptedAt: decidedAt,
        onboardingDueAt: planDueAt,
        note
      };
      const cohort = {
        id: `cohort-engagement-${requestStamp}`,
        trackId: offerPackage?.trackId || customer?.trackId || "track-service-ops",
        frameworkId: curriculumFramework?.id || null,
        gameplanId: packageGameplan?.id || null,
        gameplanStatus,
        name: `${packageName} engagement plan`,
        status: "planned",
        owner,
        startAt: planStartAt
      };
      const session = {
        id: `session-engagement-${requestStamp}`,
        cohortId: cohort.id,
        opportunityId: opportunity.id,
        engagementId: engagement.id,
        customerId,
        packageId: opportunity.packageId,
        frameworkId: curriculumFramework?.id || null,
        gameplanId: packageGameplan?.id || null,
        gameplanStatus,
        title: `Onboarding: ${packageName}`,
        startAt: planStartAt,
        endAt: planEndAt,
        timezone,
        status: "planned",
        owner
      };
      const assignment = {
        id: `assignment-engagement-${requestStamp}`,
        cohortId: cohort.id,
        customerId,
        opportunityId: opportunity.id,
        engagementId: engagement.id,
        packageId: opportunity.packageId,
        frameworkId: curriculumFramework?.id || null,
        gameplanId: packageGameplan?.id || null,
        gameplanStatus,
        targetLevel,
        baselineSampleState,
        weaknessFocus,
        availableStudyTime,
        title: `First submission plan: ${packageName}`,
        dueAt: planDueAt,
        status: "planned",
        externalVisible: true,
        owner,
        summary: [
          note,
          packageGameplan?.customerVisibleSummary || "Gameplan is pending for this package.",
          targetLevel ? `Target level: ${targetLevel}` : null,
          weaknessFocus ? `Weakness focus: ${weaknessFocus}` : null
        ].filter(Boolean).join(" | ")
      };
      const followup = {
        id: `followup-engagement-${requestStamp}`,
        customerId,
        title: `Confirm first engagement step: ${packageName}`,
        status: "planned",
        nextActionAt: planDueAt
      };
      const receipt = {
        id: `receipt-engagement-${requestStamp}`,
        customerId,
        kind: "opportunity-accepted",
        status: "complete",
        createdAt: decidedAt,
        frameworkId: curriculumFramework?.id || null,
        gameplanId: packageGameplan?.id || null,
        gameplanStatus,
        note: `${packageName} accepted for ${valueJpy} JPY with ${packageGameplan?.title || "no gameplan linked"}.`
      };
      const notificationEvent = createNotificationEventRecord(nextData, {
        customerId,
        sourceKind: "engagement",
        sourceId: engagement.id,
        title: `${packageName} accepted`,
        summary: `${packageName} accepted; onboarding and first submission plan are active.`,
        deliverAfterAt: planDueAt
      }, now, timezone);

      if (customer) {
        customer.packageId = opportunity.packageId;
        customer.frameworkId = curriculumFramework?.id || customer.frameworkId || null;
        customer.gameplanId = packageGameplan?.id || customer.gameplanId || null;
        customer.gameplanStatus = gameplanStatus;
        customer.targetLevel = targetLevel;
        customer.baselineSampleState = baselineSampleState;
        customer.weaknessFocus = weaknessFocus;
        customer.availableStudyTime = availableStudyTime;
        customer.externalStatus = `${packageName} accepted; onboarding and first submission plan are active.`;
      } else {
        nextData.customers.unshift(createdCustomer);
      }

      nextData.engagements.unshift(engagement);
      nextData.cohorts.unshift(cohort);
      nextData.sessions.unshift(session);
      nextData.assignments.unshift(assignment);
      nextData.followups.unshift(followup);
      nextData.receipts.unshift(receipt);
      nextData.notificationEvents.unshift(notificationEvent);
      Object.assign(records, { engagement, cohort, session, assignment, followup, receipt, notificationEvent });
      if (createdCustomer) records.customer = createdCustomer;
    } else {
      const customerId = customer?.id || null;
      const externalSummary = decision === "defer"
        ? `${packageName} request deferred; follow-up is scheduled.`
        : `${packageName} request closed after review.`;
      const followup = {
        id: `followup-opportunity-${requestStamp}`,
        customerId,
        title: `${decision === "defer" ? "Deferred" : "Rejected"} opportunity: ${packageName}`,
        status: decision === "defer" ? "planned" : "complete",
        nextActionAt: planDueAt
      };
      const receipt = {
        id: `receipt-opportunity-${requestStamp}`,
        customerId,
        kind: `opportunity-${decision === "defer" ? "deferred" : "rejected"}`,
        status: "complete",
        createdAt: decidedAt,
        note
      };
      const notificationEvent = createNotificationEventRecord(nextData, {
        customerId,
        sourceKind: "opportunity",
        sourceId: opportunity.id,
        title: `${decision === "defer" ? "Opportunity deferred" : "Opportunity closed"}`,
        summary: customer ? externalSummary : note,
        status: customerId ? "complete" : "blocked",
        deliverAfterAt: planDueAt
      }, now, timezone);

      if (customer) {
        customer.externalStatus = externalSummary;
      }

      nextData.followups.unshift(followup);
      nextData.receipts.unshift(receipt);
      nextData.notificationEvents.unshift(notificationEvent);
      Object.assign(records, { followup, receipt, notificationEvent });
    }

    return {
      data: nextData,
      records
    };
  }

  function createAgentHandoffRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const engagementId = clean(input.engagementId) || findHandoffEligibleEngagement(nextData)?.id;
    const sourceSystem = clean(input.sourceSystem) || "SYMBIOSIS";
    const targetSystem = clean(input.targetSystem) || "ANVIL";
    const owner = clean(input.owner) || "Jack";
    const title = clean(input.title) || "Agent-created revenue work plan";
    const summary = clean(input.summary) || "Proposed agent-created work requires operator approval before any customer-visible action.";
    const nextActionAt = withTimezone(input.nextActionAt || input.dueAt, timezone) || withTimezone(now.toISOString(), timezone);
    const createdAt = withTimezone(now.toISOString(), timezone);

    if (!engagementId) throw new Error("engagementId is required");

    const engagement = nextData.engagements.find((item) => item.id === engagementId);
    if (!engagement) throw new Error("engagement not found");
    if (!["active", "planned"].includes(engagement.status)) {
      throw new Error("engagement must be active or planned for agent handoff");
    }
    if (nextData.agentHandoffs.some((item) => item.engagementId === engagement.id && !["canceled", "rejected", "complete"].includes(item.status))) {
      throw new Error("engagement already has an active agent handoff");
    }

    const customer = customerById(nextData, engagement.customerId);
    const workPlan = {
      id: `workplan-agent-${requestStamp}`,
      engagementId: engagement.id,
      opportunityId: engagement.opportunityId || null,
      customerId: engagement.customerId || null,
      packageId: engagement.packageId || null,
      sourceSystem,
      targetSystem,
      title,
      summary,
      status: "proposed",
      approvalStatus: "pending-operator-approval",
      owner,
      createdAt,
      dueAt: nextActionAt,
      monitorVisible: true,
      customerVisible: false,
      rollbackRule: "Rejecting or canceling the handoff leaves customer-visible records unchanged."
    };
    const handoff = {
      id: `handoff-agent-${requestStamp}`,
      workPlanId: workPlan.id,
      engagementId: engagement.id,
      customerId: engagement.customerId || null,
      sourceSystem,
      targetSystem,
      title: `${sourceSystem} to ${targetSystem}: ${title}`,
      status: "waiting",
      approvalStatus: "pending-operator-approval",
      createdAt,
      nextActionAt,
      monitorVisible: true,
      customerVisible: false,
      rollbackRule: workPlan.rollbackRule
    };
    const followup = {
      id: `followup-agent-handoff-${requestStamp}`,
      customerId: engagement.customerId || null,
      title: `Approve agent work plan: ${title}`,
      status: "planned",
      nextActionAt,
      sourceKind: "agent-handoff",
      sourceId: handoff.id
    };
    const receipt = {
      id: `receipt-agent-handoff-${requestStamp}`,
      customerId: engagement.customerId || null,
      kind: "agent-handoff-proposed",
      status: "complete",
      createdAt,
      note: `${sourceSystem} proposed ${targetSystem} work for ${customer?.displayName || engagement.customerId || "customer pending"}; operator approval required before customer-visible changes.`
    };

    nextData.workPlans.unshift(workPlan);
    nextData.agentHandoffs.unshift(handoff);
    nextData.followups.unshift(followup);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        workPlan,
        handoff,
        followup,
        receipt
      }
    };
  }

  function summarizeDeadlines(currentData, options) {
    const nowText = clean(options && options.now) || "2026-06-01T00:00:00+09:00";
    const todayText = nowText.slice(0, 10);
    const items = [
      ...currentData.assignments.map((item) => ({ ...item, kind: "request", time: item.dueAt })),
      ...currentData.sessions.map((item) => ({ ...item, kind: "session", time: item.startAt })),
      ...currentData.followups.map((item) => ({ ...item, kind: "follow-up", time: item.nextActionAt })),
      ...currentData.submissions.map((item) => ({ ...item, kind: "submission", time: item.reviewDueAt }))
    ].filter((item) => item.time);

    return {
      today: items.filter((item) => item.time.startsWith(todayText)).length,
      upcoming: items.filter((item) => item.time > `${todayText}T23:59:59`).length,
      overdue: items.filter((item) => item.status === "overdue" || item.time < nowText).length,
      owned: items.filter((item) => item.owner || item.kind === "follow-up").length
    };
  }

  function summarizeRevenueState(currentData) {
    const opportunities = Array.isArray(currentData.opportunities) ? currentData.opportunities : [];
    const engagements = Array.isArray(currentData.engagements) ? currentData.engagements : [];
    const packages = Array.isArray(currentData.offerPackages) ? currentData.offerPackages : [];
    const closedStatuses = new Set(["accepted", "rejected"]);
    const pipeline = opportunities.filter((item) => !closedStatuses.has(item.status));
    const activeEngagements = engagements.filter((item) => item.status === "active" || item.status === "planned");
    const packageByIdMemo = packages.reduce((memo, item) => {
      memo[item.id] = item;
      return memo;
    }, {});

    return {
      pipelineCount: pipeline.length,
      pipelineValueJpy: pipeline.reduce((total, item) => total + Number(item.estimatedValueJpy || 0), 0),
      activeEngagements: activeEngagements.length,
      acceptedCount: opportunities.filter((item) => item.status === "accepted").length,
      acceptedValueJpy: engagements.reduce((total, item) => total + Number(item.valueJpy || 0), 0),
      waitingCount: opportunities.filter((item) => item.status === "waiting").length,
      deferredCount: opportunities.filter((item) => item.status === "deferred").length,
      rejectedCount: opportunities.filter((item) => item.status === "rejected").length,
      under19CompatibilityCount: pipeline.filter((item) => packageByIdMemo[item.packageId]?.routing === "compatibility-required").length
    };
  }

  function summarizeCurriculumState(currentData) {
    const frameworks = Array.isArray(currentData.curriculumFrameworks) ? currentData.curriculumFrameworks : [];
    const gameplans = Array.isArray(currentData.packageGameplans) ? currentData.packageGameplans : [];
    const eikenFramework = frameworks.find((item) => clean(item.id) === "framework-eiken-5-to-1-writing")
      || frameworks.find((item) => clean(item.title).includes("EIKEN"));
    const eikenLevels = Array.isArray(eikenFramework?.levels) ? eikenFramework.levels : [];
    const activeGameplans = gameplans.filter((item) => clean(item.status) === "active" || clean(item.status) === "planned");
    const submissionFirst = gameplans.filter((item) => clean(item.laborModel).includes("submission") || clean(item.deliveryCadence).includes("submission"));
    const under19Guarded = gameplans.filter((item) => clean(item.under19Policy).toLowerCase().includes("compatibility"));

    return {
      frameworks: frameworks.length,
      activeFrameworks: frameworks.filter((item) => clean(item.status) === "active").length,
      gameplans: gameplans.length,
      activeGameplans: activeGameplans.length,
      eikenLevelCount: eikenLevels.length,
      eikenLevels,
      submissionFirstGameplans: submissionFirst.length,
      under19GuardedGameplans: under19Guarded.length,
      readyGameplans: activeGameplans.filter((item) => clean(item.internalReadiness).toLowerCase().includes("ready")).length,
      nextMilestones: activeGameplans.filter((item) => clean(item.nextMilestoneAt)).length
    };
  }

  function summarizeNotificationState(currentData) {
    const events = Array.isArray(currentData.notificationEvents) ? currentData.notificationEvents : [];

    return {
      total: events.length,
      visible: events.filter((item) => item.visible).length,
      pending: events.filter((item) => item.deliveryStatus === "pending").length,
      posted: events.filter((item) => item.deliveryStatus === "posted").length,
      blocked: events.filter((item) => item.deliveryStatus === "blocked" || item.status === "blocked").length
    };
  }

  function summarizeAgentHandoffState(currentData) {
    const workPlans = Array.isArray(currentData.workPlans) ? currentData.workPlans : [];
    const handoffs = Array.isArray(currentData.agentHandoffs) ? currentData.agentHandoffs : [];
    const customerVisibleBlocked = [
      ...workPlans,
      ...handoffs
    ].filter((item) => item.customerVisible).length;

    return {
      workPlans: workPlans.length,
      handoffs: handoffs.length,
      pendingApprovals: handoffs.filter((item) => item.approvalStatus === "pending-operator-approval").length,
      monitorVisible: handoffs.filter((item) => item.monitorVisible).length,
      approved: handoffs.filter((item) => item.approvalStatus === "approved").length,
      rejected: handoffs.filter((item) => item.status === "rejected").length,
      customerVisibleBlocked
    };
  }

  function createMonitorActionRecords(currentData, input, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const createdAt = withTimezone(now.toISOString(), timezone);
    const requestStamp = stamp(now);
    const actionId = clean(input.actionId) || `monitor-action-${requestStamp}`;
    const title = clean(input.title) || "Monitor operator action";
    const detail = clean(input.detail) || "Monitor action recorded.";
    const status = clean(input.status) || "complete";
    const target = clean(input.target) || "monitor-controls";
    const owner = clean(input.owner) || "Jack";
    const receiptId = `receipt-monitor-${requestStamp}`;

    const healthCheck = {
      id: `monitor-check-${requestStamp}`,
      actionId,
      receiptId,
      title,
      summary: detail,
      status,
      priority: clean(input.priority) || "medium",
      effect: clean(input.effect) || "record",
      target,
      owner,
      createdAt,
      visibility: "internal",
      customerVisible: false
    };

    const receipt = {
      id: receiptId,
      customerId: null,
      kind: "monitor-check",
      status,
      createdAt,
      note: `${title}: ${detail}`
    };

    nextData.monitorHealthChecks.unshift(healthCheck);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        healthCheck,
        receipt
      }
    };
  }

  function summarizeScopeState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const scope = data.monitorScope && typeof data.monitorScope === "object" ? data.monitorScope : {};
    const routePlacement = options.routePlacement || summarizeRoutePlacementState(data, { now: options.now });
    const allowedSurfaces = Array.isArray(scope.allowedSurfaces) ? scope.allowedSurfaces : [];
    const blockedSurfaces = Array.isArray(scope.blockedSurfaces) ? scope.blockedSurfaces : [];
    const verificationSteps = Array.isArray(scope.verificationSteps) ? scope.verificationSteps : [];
    const warnings = [];

    if (!clean(scope.localAuthority).toLowerCase().includes("local")) {
      warnings.push("Local authority is not stated clearly.");
    }
    if (routePlacement.routes.some((route) => route.surface === "monitor" && route.visibility !== "internal")) {
      warnings.push("Monitor route placement is not internal-only.");
    }
    if (routePlacement.routes.some((route) => route.surface === "admin" && route.visibility !== "internal")) {
      warnings.push("Admin route placement is not internal-only.");
    }
    if (routePlacement.routes.some((route) => route.duplicateUi)) {
      warnings.push("A route placement is marked duplicate-ui.");
    }
    if (!allowedSurfaces.length || !blockedSurfaces.length) {
      warnings.push("Scope surface rules are incomplete.");
    }

    return {
      title: clean(scope.title) || "EPOCH monitor scope",
      summary: clean(scope.summary) || "Scope is not defined yet.",
      localAuthority: clean(scope.localAuthority) || "Local authority not recorded.",
      allowedSurfaces,
      blockedSurfaces,
      verificationSteps,
      owner: clean(scope.owner) || "owner pending",
      updatedAt: clean(scope.updatedAt) || "",
      reviewBy: clean(scope.reviewBy) || "",
      allowedCount: allowedSurfaces.length,
      blockedCount: blockedSurfaces.length,
      verificationCount: verificationSteps.length,
      warnings,
      status: warnings.length ? "attention" : "ready"
    };
  }

  function summarizeMarketingState(currentData) {
    const routes = Array.isArray(currentData.campaignRoutes) ? currentData.campaignRoutes : [];
    const readyRoutes = routes.filter((item) => ["ready", "live", "active"].includes(clean(item.status || item.readinessStatus)));
    const under19Routes = routes.filter((item) => clean(item.audienceTier) === "under19" || clean(item.routeKey).includes("under19"));
    const guardianRequired = under19Routes.filter((item) => {
      const flags = Array.isArray(item.complianceFlags) ? item.complianceFlags : [];
      return Boolean(item.guardianConsentRequired) || flags.includes("guardian-consent-required");
    });
    const copyViolations = routes.filter((item) => {
      const publicCopy = clean(item.publicCopy);
      const ctaPrimary = clean(item.ctaPrimary);
      const ctaSecondary = clean(item.ctaSecondary);
      const copyBlob = `${publicCopy} ${ctaPrimary} ${ctaSecondary}`;
      const forbiddenTerms = Array.isArray(item.copyForbiddenTerms) ? item.copyForbiddenTerms : [];
      return forbiddenTerms.some((term) => clean(term) && copyBlob.includes(clean(term)));
    });
    const conversionTypes = routes.reduce((memo, item) => {
      const key = clean(item.primaryConversion) || "conversion-pending";
      memo[key] = (memo[key] || 0) + 1;
      return memo;
    }, {});
    const channelCount = new Set(routes.map((item) => clean(item.channel)).filter(Boolean)).size;
    const bundleCount = new Set(routes.map((item) => clean(item.offerBundle)).filter(Boolean)).size;

    return {
      total: routes.length,
      ready: readyRoutes.length,
      jp: routes.filter((item) => clean(item.regionScope) === "jp").length,
      global: routes.filter((item) => clean(item.regionScope) === "global").length,
      dual: routes.filter((item) => clean(item.regionScope) === "dual").length,
      publicRoutes: routes.filter((item) => clean(item.publicRoute)).length,
      adminRoutes: routes.filter((item) => clean(item.adminRoute)).length,
      monitorRoutes: routes.filter((item) => clean(item.monitorRoute)).length,
      monitorKpiSets: routes.filter((item) => Array.isArray(item.monitorKpis) && item.monitorKpis.length).length,
      submissionFirstRoutes: routes.filter((item) => clean(item.capacityMode).includes("queue") || clean(item.primaryConversion).includes("submit")).length,
      cohortRoutes: routes.filter((item) => clean(item.capacityMode).includes("cohort")).length,
      serviceRoutes: routes.filter((item) => ["tech-support", "crm-system", "admin-system", "consulting"].includes(clean(item.offerBundle))).length,
      under19Routes: under19Routes.length,
      guardianRequiredRoutes: guardianRequired.length,
      copyCompliant: routes.length - copyViolations.length,
      copyViolations: copyViolations.length,
      channelCount,
      bundleCount,
      conversionTypes
    };
  }

  function summarizeMemoryState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const nowText = clean(options.now) || "2026-06-01T12:00:00+09:00";
    const entries = Array.isArray(data.monitorMemory) ? data.monitorMemory : [];
    const staleEntries = entries.filter((item) => clean(item.status) === "stale" || (clean(item.reviewBy) && clean(item.reviewBy) < nowText));
    const watchEntries = entries.filter((item) => {
      const reviewBy = clean(item.reviewBy);
      return reviewBy && reviewBy >= nowText && reviewBy <= `${nowText.slice(0, 10)}T23:59:59+09:00`;
    });

    return {
      total: entries.length,
      active: entries.filter((item) => clean(item.status) !== "stale").length,
      staleCount: staleEntries.length,
      watchCount: watchEntries.length,
      latestUpdate: entries.map((item) => clean(item.updatedAt)).filter(Boolean).sort().slice(-1)[0] || "",
      ownerCount: new Set(entries.map((item) => clean(item.owner)).filter(Boolean)).size,
      status: staleEntries.length ? "attention" : watchEntries.length ? "watch" : "ready",
      entries
    };
  }

  function summarizeRoutePlacementState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const nowText = clean(options.now) || "2026-06-01T12:00:00+09:00";
    const revenue = summarizeRevenueState(data);
    const curriculum = summarizeCurriculumState(data);
    const notifications = summarizeNotificationState(data);
    const handoffs = summarizeAgentHandoffState(data);
    const marketing = summarizeMarketingState(data);
    const calendarExport = createCalendarExport(data, { now: nowText });
    const timeline = monitorTimelineItems(data);
    const terminalStatuses = new Set(["complete", "returned", "canceled", "accepted", "rejected"]);
    const queue = timeline.filter((item) => ["waiting", "deferred", "submitted", "reviewing", "overdue", "blocked", "proposed"].includes(item.status));
    const risks = timeline.filter((item) => item.status === "blocked" || item.status === "overdue" || (item.time && item.time < nowText && !terminalStatuses.has(item.status)));
    const receipts = Array.isArray(data.receipts) ? data.receipts : [];
    const baseSummary = {
      health: risks.length ? "Attention" : "Ready",
      queue: queue.length,
      risks: risks.length,
      receipts: receipts.length,
      activeEngagements: revenue.activeEngagements,
      pipelineValueJpy: revenue.pipelineValueJpy,
      curriculumFrameworks: curriculum.frameworks,
      activeGameplans: curriculum.activeGameplans,
      visibleUpdates: notifications.visible,
      pendingHandoffApprovals: handoffs.pendingApprovals,
      calendarEntries: calendarExport.counts.total,
      campaignRoutes: marketing.total,
      readyCampaignRoutes: marketing.ready,
      copyComplianceViolations: marketing.copyViolations
    };
    const summaryByKey = {
      health: `${baseSummary.health}; ${baseSummary.risks} risks`,
      queue: `${baseSummary.queue} queued records`,
      "visible-updates": `${baseSummary.visibleUpdates} visible updates`,
      pipeline: `${revenue.pipelineCount} opportunities; ${baseSummary.pipelineValueJpy} JPY pipeline`,
      marketing: `${marketing.ready} ready campaigns; ${marketing.copyViolations} copy policy violations`
    };
    const routes = data.routePlacements.map((route) => ({
      id: clean(route.id),
      label: clean(route.label),
      href: clean(route.href),
      surface: clean(route.surface),
      visibility: clean(route.visibility) || "internal",
      routeKind: clean(route.routeKind) || "suite-entry",
      status: clean(route.status) || "ready",
      sourceSystem: clean(route.sourceSystem) || "EPOCH",
      targetSystem: clean(route.targetSystem) || "SYNAPSE",
      summaryKey: clean(route.summaryKey) || "queue",
      summary: summaryByKey[clean(route.summaryKey)] || summaryByKey.queue,
      placement: clean(route.placement || route.embedMode) || "link",
      duplicateUi: route.duplicateUi === true ? true : false
    }));

    return {
      schema: "epoch.synapse-route-placement",
      version: 1,
      sourceSystem: "EPOCH",
      targetSystem: "SYNAPSE",
      consumerSystem: "SYNAPSE",
      placementMode: "link-or-embed",
      localFirst: true,
      access: "local-or-controlled",
      duplicateUi: false,
      routes,
      summary: {
        ...baseSummary,
        routeCount: routes.length,
        internalRoutes: routes.filter((route) => route.visibility === "internal").length,
        publicRoutes: routes.filter((route) => route.visibility === "public-intake").length,
        controlledCustomerRoutes: routes.filter((route) => route.visibility === "controlled-customer").length,
        monitorHref: routes.find((route) => route.surface === "monitor")?.href || "#monitor"
      }
    };
  }

  function summarizeAccessPosture(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const posture = data.accessPosture && typeof data.accessPosture === "object" ? data.accessPosture : {};
    const routePlacement = options.routePlacement || summarizeRoutePlacementState(data, { now: options.now });
    const violations = [];
    const notes = Array.isArray(posture.notes) ? posture.notes : [];

    if (clean(posture.rawMonitor) !== "local-only") {
      violations.push("Raw monitor is not marked local-only.");
    }
    if (clean(posture.rawAdmin) !== "local-only") {
      violations.push("Raw admin route is not marked local-only.");
    }
    if (clean(posture.defaultPublicPolicy) !== "deny-by-default") {
      violations.push("Default public policy is not deny-by-default.");
    }
    if (routePlacement.routes.some((route) => route.surface === "monitor" && route.visibility !== "internal")) {
      violations.push("Route placement exposes monitor outside the internal lane.");
    }
    if (routePlacement.routes.some((route) => route.surface === "admin" && route.visibility !== "internal")) {
      violations.push("Route placement exposes admin outside the internal lane.");
    }

    return {
      mode: clean(posture.mode) || "local-first",
      rawMonitor: clean(posture.rawMonitor) || "local-only",
      rawAdmin: clean(posture.rawAdmin) || "local-only",
      publicIntake: clean(posture.publicIntake) || "#public",
      customerStatus: clean(posture.customerStatus) || "#student",
      safeGateway: clean(posture.safeGateway) || "none",
      defaultPublicPolicy: clean(posture.defaultPublicPolicy) || "deny-by-default",
      operatorRule: clean(posture.operatorRule) || "Operator rule not recorded.",
      verificationStatus: clean(posture.verificationStatus) || "unverified",
      lastVerifiedAt: clean(posture.lastVerifiedAt) || "",
      notes,
      violations,
      status: violations.length ? "blocked" : "ready"
    };
  }

  function createCalendarExport(currentData, options) {
    const data = normalizedOperatingData(currentData);
    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = data.timezone || "Asia/Tokyo";
    const updateBySource = data.notificationEvents.reduce((memo, item) => {
      if (item.sourceKind && item.sourceId) memo[`${item.sourceKind}:${item.sourceId}`] = item;
      return memo;
    }, {});
    const entries = [];

    for (const campaign of data.campaignRoutes) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "campaign-route",
        sourceId: campaign.id,
        title: campaign.name || campaign.routeKey,
        timeKind: "go-live-window",
        startAt: campaign.goLiveAt || campaign.startAt,
        endAt: campaign.endAt,
        status: campaign.status || campaign.readinessStatus,
        owner: campaign.owner || campaign.channel,
        externalVisible: Boolean(campaign.publicRoute)
      }, timezone));
    }

    for (const session of data.sessions) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "session",
        sourceId: session.id,
        title: session.title,
        timeKind: "session-window",
        startAt: session.startAt,
        endAt: session.endAt,
        status: session.status,
        owner: session.owner,
        customerId: session.customerId,
        externalVisible: true,
        updateEventId: updateBySource[`session:${session.id}`]?.id
      }, timezone));
    }

    for (const assignment of data.assignments) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "assignment",
        sourceId: assignment.id,
        title: assignment.title,
        timeKind: "due-window",
        dueAt: assignment.dueAt,
        status: assignment.status,
        owner: assignment.owner,
        customerId: assignment.customerId,
        externalVisible: assignment.externalVisible,
        updateEventId: updateBySource[`assignment:${assignment.id}`]?.id || updateBySource[`intake:${assignment.id}`]?.id
      }, timezone));
    }

    for (const submission of data.submissions) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "submission",
        sourceId: submission.id,
        title: submission.title || "Submission review",
        timeKind: "review-window",
        startAt: submission.submittedAt,
        dueAt: submission.reviewDueAt,
        status: submission.status,
        owner: submission.owner,
        customerId: submission.customerId,
        externalVisible: true,
        updateEventId: updateBySource[`submission:${submission.id}`]?.id
      }, timezone));
    }

    for (const followup of data.followups) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "followup",
        sourceId: followup.id,
        title: followup.title,
        timeKind: "follow-up-window",
        dueAt: followup.nextActionAt,
        status: followup.status,
        owner: followup.owner,
        customerId: followup.customerId,
        externalVisible: false,
        updateEventId: updateBySource[`followup:${followup.id}`]?.id
      }, timezone));
    }

    for (const engagement of data.engagements) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "engagement",
        sourceId: engagement.id,
        title: `${engagement.packageId || "Engagement"} onboarding`,
        timeKind: "onboarding-window",
        startAt: engagement.acceptedAt,
        dueAt: engagement.onboardingDueAt,
        status: engagement.status,
        owner: engagement.owner,
        customerId: engagement.customerId,
        externalVisible: true,
        updateEventId: updateBySource[`engagement:${engagement.id}`]?.id
      }, timezone));
    }

    for (const workPlan of data.workPlans) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "agent-work-plan",
        sourceId: workPlan.id,
        title: workPlan.title,
        timeKind: "approval-window",
        dueAt: workPlan.dueAt,
        status: workPlan.status,
        owner: workPlan.owner,
        customerId: workPlan.customerId,
        externalVisible: false
      }, timezone));
    }

    for (const handoff of data.agentHandoffs) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "agent-handoff",
        sourceId: handoff.id,
        title: handoff.title,
        timeKind: "handoff-approval-window",
        dueAt: handoff.nextActionAt,
        status: handoff.status,
        owner: handoff.approvalStatus,
        customerId: handoff.customerId,
        externalVisible: false
      }, timezone));
    }

    for (const update of data.notificationEvents) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "notification",
        sourceId: update.id,
        title: update.title,
        timeKind: "customer-update-window",
        startAt: update.createdAt,
        dueAt: update.deliverAfterAt,
        status: update.status,
        owner: update.deliveryStatus,
        customerId: update.customerId,
        externalVisible: update.visible,
        updateEventId: update.id
      }, timezone));
    }

    const normalizedEntries = entries
      .filter((item) => item.startAt || item.endAt || item.dueAt)
      .sort((a, b) => String(a.startAt || a.dueAt || "").localeCompare(String(b.startAt || b.dueAt || "")));

    return {
      schema: "epoch.calendar-export",
      version: 1,
      generatedAt: withTimezone(now.toISOString(), timezone),
      timezone,
      counts: summarizeCalendarExport({ entries: normalizedEntries }),
      entries: normalizedEntries
    };
  }

  function summarizeCalendarExport(calendarExport) {
    const entries = Array.isArray(calendarExport.entries) ? calendarExport.entries : [];

    return {
      total: entries.length,
      sessions: entries.filter((item) => item.sourceKind === "session").length,
      dueWindows: entries.filter((item) => item.timeKind && item.timeKind.includes("window")).length,
      customerVisible: entries.filter((item) => item.externalVisible).length,
      updateLinked: entries.filter((item) => item.updateEventId).length,
      overdueOrBlocked: entries.filter((item) => item.status === "overdue" || item.status === "blocked").length
    };
  }

  function monitorTimelineItems(currentData) {
    return [
      ...currentData.leads.map((item) => ({ kind: "lead", id: item.id, title: item.name, status: item.status, time: item.nextActionAt, owner: item.owner || "intake" })),
      ...currentData.opportunities.map((item) => ({ kind: "opportunity", id: item.id, title: item.packageId || item.id, status: item.status, time: item.nextActionAt, owner: `${item.estimatedValueJpy || 0} JPY` })),
      ...currentData.engagements.map((item) => ({ kind: "engagement", id: item.id, title: item.packageId || item.id, status: item.status, time: item.onboardingDueAt || item.acceptedAt, owner: item.owner || "owner pending" })),
      ...currentData.packageGameplans.map((item) => ({ kind: "gameplan", id: item.id, title: item.title, status: item.status, time: item.nextMilestoneAt, owner: item.laborModel || "delivery plan" })),
      ...currentData.campaignRoutes.map((item) => ({ kind: "campaign route", id: item.id, title: item.name || item.routeKey, status: item.status || item.readinessStatus, time: item.goLiveAt || item.startAt, owner: item.channel || item.owner || "channel pending" })),
      ...currentData.workPlans.map((item) => ({ kind: "agent work plan", id: item.id, title: item.title, status: item.status, time: item.dueAt, owner: item.approvalStatus || item.owner || "approval pending" })),
      ...currentData.agentHandoffs.map((item) => ({ kind: "agent handoff", id: item.id, title: item.title, status: item.status, time: item.nextActionAt, owner: item.approvalStatus || "approval pending" })),
      ...currentData.monitorHealthChecks.map((item) => ({ kind: "monitor check", id: item.id, title: item.title, status: item.status, time: item.createdAt, owner: item.target || item.owner || "monitor" })),
      ...currentData.notificationEvents.map((item) => ({ kind: "update", id: item.id, title: item.title, status: item.status, time: item.deliverAfterAt || item.createdAt, owner: item.deliveryStatus || "pending" })),
      ...currentData.sessions.map((item) => ({ kind: "session", id: item.id, title: item.title, status: item.status, time: item.startAt, owner: item.owner || "owner pending" })),
      ...currentData.assignments.map((item) => ({ kind: "request", id: item.id, title: item.title, status: item.status, time: item.dueAt, owner: item.owner || "owner pending" })),
      ...currentData.submissions.map((item) => ({ kind: "submission", id: item.id, title: item.title || item.id, status: item.status, time: item.reviewDueAt, owner: item.owner || "review queue" })),
      ...currentData.reviews.map((item) => ({ kind: "review", id: item.id, title: item.summary, status: item.status, time: item.returnedAt, owner: item.owner || "Jack" })),
      ...currentData.followups.map((item) => ({ kind: "follow-up", id: item.id, title: item.title, status: item.status, time: item.nextActionAt, owner: item.owner || "operations" })),
      ...currentData.receipts.map((item) => ({ kind: "receipt", id: item.id, title: item.note, status: item.status, time: item.createdAt, owner: item.kind || "receipt" }))
    ].filter((item) => item.time || item.status);
  }

  function buildMonitorReport(currentData, options) {
    const data = normalizedOperatingData(currentData);
    const nowText = clean(options && options.now) || "2026-06-01T12:00:00+09:00";
    const terminalStatuses = new Set(["complete", "returned", "canceled", "accepted", "rejected"]);
    const activeStatuses = new Set(["waiting", "deferred", "submitted", "reviewing", "overdue", "blocked", "proposed"]);
    const revenue = summarizeRevenueState(data);
    const curriculum = summarizeCurriculumState(data);
    const notifications = summarizeNotificationState(data);
    const handoffs = summarizeAgentHandoffState(data);
    const marketing = summarizeMarketingState(data);
    const calendarExport = createCalendarExport(data, { now: nowText });
    const persistence = summarizePersistenceState(data, { now: nowText });
    const routePlacement = summarizeRoutePlacementState(data, { now: nowText });
    const scope = summarizeScopeState(data, { now: nowText, routePlacement });
    const memory = summarizeMemoryState(data, { now: nowText });
    const access = summarizeAccessPosture(data, { now: nowText, routePlacement });
    const monitorHealthChecks = data.monitorHealthChecks
      .slice()
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    const timeline = monitorTimelineItems(data)
      .sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
    const visibleTimeline = timeline.slice(0, 16);
    for (const item of timeline.filter((entry) => entry.kind === "monitor check").slice(0, 2)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
    }
    const queue = timeline
      .filter((item) => activeStatuses.has(item.status))
      .slice(0, 8);
    const overdue = timeline.filter((item) => item.status === "overdue" || (item.time && item.time < nowText && !terminalStatuses.has(item.status)));
    const blocked = timeline.filter((item) => item.status === "blocked");
    const stale = timeline.filter((item) => item.time && item.time < nowText && item.status === "planned");
    const awaitingReview = timeline.filter((item) => {
      return (item.kind === "submission" || item.kind === "review") && ["submitted", "reviewing"].includes(item.status);
    });
    const dirtyLocalState = !["durable-ready-snapshot", "imported-recovery-snapshot"].includes(clean(persistence.adapterState));
    const risks = [];

    if (blocked.length) {
      risks.push({
        id: "blocked-work",
        severity: "high",
        title: "Blocked Work",
        detail: `${blocked.length} record needs source files, decision, or unblock action.`
      });
    }
    if (overdue.length) {
      risks.push({
        id: "overdue-work",
        severity: "high",
        title: "Overdue Work",
        detail: `${overdue.length} record is overdue or past its control time.`
      });
    }
    if (stale.length) {
      risks.push({
        id: "stale-planned-work",
        severity: "medium",
        title: "Stale Planned Work",
        detail: `${stale.length} planned record has passed its scheduled control time.`
      });
    }
    if (dirtyLocalState) {
      risks.push({
        id: "dirty-local-state",
        severity: "high",
        title: "Dirty Local State",
        detail: `Ledger persistence is ${persistence.adapterState}; export a fresh snapshot before treating this browser state as durable.`
      });
    }
    if (awaitingReview.length) {
      risks.push({
        id: "awaiting-review",
        severity: "medium",
        title: "Awaiting Review",
        detail: `${awaitingReview.length} submission or review record still needs operator return or explicit blocker state.`
      });
    }
    if (memory.staleCount) {
      risks.push({
        id: "stale-memory",
        severity: "medium",
        title: "Stale Memory",
        detail: `${memory.staleCount} monitor memory note is stale or past review time.`
      });
    }
    if (marketing.copyViolations) {
      risks.push({
        id: "copy-compliance-violations",
        severity: "high",
        title: "Copy Compliance Violations",
        detail: `${marketing.copyViolations} campaign route has forbidden public copy terms.`
      });
    }
    if (marketing.under19Routes !== marketing.guardianRequiredRoutes) {
      risks.push({
        id: "under19-route-guard-missing",
        severity: "high",
        title: "Under-19 Route Guard Missing",
        detail: `${marketing.under19Routes - marketing.guardianRequiredRoutes} under-19 route lacks guardian consent protection.`
      });
    }
    if (scope.warnings.length) {
      risks.push({
        id: "scope-surface-warning",
        severity: "medium",
        title: "Scope Surface Warning",
        detail: scope.warnings[0]
      });
    }
    if (access.violations.length) {
      risks.push({
        id: "safe-access-violation",
        severity: "high",
        title: "Safe Access Posture",
        detail: access.violations[0]
      });
    }

    const operatorActions = [];
    if (dirtyLocalState) {
      operatorActions.push({
        id: "export-dirty-ledger",
        title: "Export dirty ledger snapshot",
        detail: `Current persistence is ${persistence.adapterState}; write a recovery snapshot before handoff or reset.`,
        target: "monitor-persistence",
        effect: "export-ledger",
        priority: "high"
      });
    }
    if (awaitingReview.length) {
      operatorActions.push({
        id: "return-awaiting-review",
        title: "Return the next queued review",
        detail: `${awaitingReview.length} review-stage record still needs a return action or blocker note.`,
        target: "monitor-controls",
        effect: "return-review",
        priority: "high"
      });
    }
    if (memory.staleCount) {
      operatorActions.push({
        id: "refresh-monitor-memory",
        title: "Refresh stale monitor memory",
        detail: `${memory.staleCount} memory note is stale or past review time.`,
        target: "monitor-memory",
        effect: "scroll",
        priority: "medium"
      });
    }
    operatorActions.push({
      id: "confirm-safe-access",
      title: access.status === "ready" ? "Record local-only access check" : "Repair safe-access posture",
      detail: access.status === "ready"
        ? "Public posture stays intake-only while raw admin and monitor remain local-only."
        : access.violations[0] || "Safe-access posture needs review.",
      target: "monitor-access",
      effect: "acknowledge-posture",
      priority: access.status === "ready" ? "medium" : "high"
    });

    return {
      summary: {
        health: risks.length ? "Attention" : "Ready",
        queue: queue.length,
        timeline: timeline.length,
        risks: risks.length,
        receipts: data.receipts.length,
        activeEngagements: revenue.activeEngagements,
        pipelineValueJpy: revenue.pipelineValueJpy,
        acceptedValueJpy: revenue.acceptedValueJpy,
        curriculumFrameworks: curriculum.frameworks,
        activeGameplans: curriculum.activeGameplans,
        eikenLevelCount: curriculum.eikenLevelCount,
        submissionFirstGameplans: curriculum.submissionFirstGameplans,
        visibleUpdates: notifications.visible,
        blockedUpdates: notifications.blocked,
        agentHandoffs: handoffs.handoffs,
        pendingHandoffApprovals: handoffs.pendingApprovals,
        calendarEntries: calendarExport.counts.total,
        calendarVisible: calendarExport.counts.customerVisible,
        persistenceRevision: persistence.revision,
        persistenceState: persistence.adapterState,
        routePlacements: routePlacement.summary.routeCount,
        synapsePlacementMode: routePlacement.placementMode,
        campaignRoutes: marketing.total,
        readyCampaignRoutes: marketing.ready,
        copyComplianceViolations: marketing.copyViolations,
        under19CampaignRoutes: marketing.under19Routes,
        marketingChannels: marketing.channelCount,
        dirtyLocalState,
        staleRecords: stale.length + memory.staleCount,
        awaitingReview: awaitingReview.length,
        scopeWarnings: scope.warnings.length,
        staleMemoryNotes: memory.staleCount,
        safeAccessViolations: access.violations.length,
        monitorHealthChecks: monitorHealthChecks.length,
        monitorActionReceipts: data.receipts.filter((item) => item.kind === "monitor-check").length,
        operatorActions: operatorActions.length
      },
      revenue,
      curriculum,
      notifications,
      handoffs,
      marketing,
      routePlacement,
      calendar: calendarExport.counts,
      persistence,
      scope,
      memory,
      access,
      monitorHealthChecks: monitorHealthChecks.slice(0, 8),
      queue,
      timeline: visibleTimeline,
      risks,
      receipts: data.receipts.slice(0, 8),
      operatorActions
    };
  }

  function createOperatingLedger(currentData, options) {
    const now = options && options.now ? new Date(options.now) : new Date();
    const data = normalizedOperatingData(currentData);
    const exportedAt = withTimezone(now.toISOString(), data.timezone || "Asia/Tokyo");
    const persistence = createPersistenceMetadata(data, {
      now: now.toISOString(),
      source: options && options.source,
      adapterState: options && options.adapterState,
      ledgerId: options && options.ledgerId,
      parentRevision: options && options.parentRevision,
      preserveExisting: options && options.preserveExisting,
      recoveryNote: options && options.recoveryNote
    });
    data.persistence = persistence;
    const calendarExport = createCalendarExport(data, { now: now.toISOString() });
    const routePlacement = summarizeRoutePlacementState(data, { now: now.toISOString() });
    return {
      schema: "epoch.operating-ledger",
      version: ledgerVersion,
      exportedAt,
      timezone: data.timezone || "Asia/Tokyo",
      persistence,
      counts: ledgerCollections.reduce((memo, collection) => {
        memo[collection] = data[collection].length;
        return memo;
      }, {}),
      monitor: buildMonitorReport(data, {
        now: exportedAt
      }).summary,
      calendarExport,
      routePlacement,
      data
    };
  }

  function importOperatingLedger(currentData, payload) {
    const importedData = operatingDataFromLedgerPayload(payload);
    const ledger = createOperatingLedger(importedData, { preserveExisting: true });
    return {
      data: importedData,
      ledger
    };
  }

  window.EPOCH_OPERATING_RECORDS = {
    ledgerVersion,
    cloneData,
    createCalendarExport,
    createOperatingLedger,
    createPersistenceMetadata,
    createAgentHandoffRecords,
    createMonitorActionRecords,
    decideOpportunityRecords,
    createIntakeRecords,
    createSubmissionRecords,
    createScheduleRecords,
    importOperatingLedger,
    returnReviewRecords,
    buildMonitorReport,
    summarizeCalendarExport,
    summarizeCurriculumState,
    summarizeDeadlines,
    summarizeAgentHandoffState,
    summarizeAccessPosture,
    summarizeMemoryState,
    summarizeScopeState,
    summarizeRoutePlacementState,
    summarizePersistenceState,
    summarizeNotificationState,
    summarizeMarketingState,
    summarizeRevenueState,
    withTimezone
  };
})();
