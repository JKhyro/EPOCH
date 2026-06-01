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
    "leads",
    "opportunities",
    "engagements",
    "workPlans",
    "agentHandoffs",
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

  function normalizedOperatingData(data) {
    const nextData = cloneData(data || {});
    for (const collection of ledgerCollections) {
      if (!Array.isArray(nextData[collection])) nextData[collection] = [];
    }
    if (!nextData.timezone) nextData.timezone = "Asia/Tokyo";
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
    const preferredWindow = withTimezone(input.preferredWindow, timezone) || withTimezone(now.toISOString(), timezone);
    const isUnder19 = ageBand === "under-19";
    const offerPackage = packageForRequest(nextData, offerKind, clean(input.packageId), isUnder19);

    if (!requesterName) throw new Error("requesterName is required");
    if (!requestSummary) throw new Error("requestSummary is required");

    const trackId = offerPackage?.trackId || trackForOffer(offerKind);
    const offerLabel = offerPackage?.name || offerLabels[offerKind] || "Commercial service";
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
      status: isUnder19 ? "waiting" : "planned",
      nextAction,
      nextActionAt: preferredWindow
    };

    const opportunity = {
      id: opportunityId,
      leadId: lead.id,
      packageId: offerPackage?.id || null,
      status: isUnder19 ? "waiting" : "planned",
      estimatedValueJpy: offerPackage?.priceJpy || 0,
      nextAction,
      nextActionAt: preferredWindow
    };

    const customer = {
      id: customerId,
      displayName: requesterName,
      trackId,
      packageId: offerPackage?.id || null,
      ageBand,
      externalStatus: isUnder19
        ? "Request received; compatibility and guardian review required before acceptance."
        : `${offerLabel} request received; next update follows internal review.`
    };

    const assignment = {
      id: assignmentId,
      customerId,
      packageId: offerPackage?.id || null,
      opportunityId,
      title: `${offerLabel} intake request`,
      dueAt: preferredWindow,
      status: "waiting",
      externalVisible: true,
      summary: requestSummary
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
      note: `Captured ${offerLabel.toLowerCase()} request for operating review.`
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
    const customerId = clean(input.customerId) || nextData.assignments.find((item) => item.id === assignmentId)?.customerId || nextData.customers[0]?.id;
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

    const assignment = nextData.assignments.find((item) => item.id === assignmentId);
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
        ageBand: "unknown",
        externalStatus: `${packageName} accepted; onboarding and first submission plan are active.`
      };
      const customerId = customer?.id || createdCustomer.id;
      const engagement = {
        id: `engagement-${requestStamp}`,
        opportunityId: opportunity.id,
        customerId,
        packageId: opportunity.packageId,
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
        title: `First submission plan: ${packageName}`,
        dueAt: planDueAt,
        status: "planned",
        externalVisible: true,
        owner,
        summary: note
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
        note: `${packageName} accepted for ${valueJpy} JPY.`
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

  function createCalendarExport(currentData, options) {
    const data = normalizedOperatingData(currentData);
    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = data.timezone || "Asia/Tokyo";
    const updateBySource = data.notificationEvents.reduce((memo, item) => {
      if (item.sourceKind && item.sourceId) memo[`${item.sourceKind}:${item.sourceId}`] = item;
      return memo;
    }, {});
    const entries = [];

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
      ...currentData.workPlans.map((item) => ({ kind: "agent work plan", id: item.id, title: item.title, status: item.status, time: item.dueAt, owner: item.approvalStatus || item.owner || "approval pending" })),
      ...currentData.agentHandoffs.map((item) => ({ kind: "agent handoff", id: item.id, title: item.title, status: item.status, time: item.nextActionAt, owner: item.approvalStatus || "approval pending" })),
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
    const nowText = clean(options && options.now) || "2026-06-01T12:00:00+09:00";
    const terminalStatuses = new Set(["complete", "returned", "canceled", "accepted", "rejected"]);
    const activeStatuses = new Set(["waiting", "deferred", "submitted", "reviewing", "overdue", "blocked", "proposed"]);
    const revenue = summarizeRevenueState(currentData);
    const notifications = summarizeNotificationState(currentData);
    const handoffs = summarizeAgentHandoffState(currentData);
    const calendarExport = createCalendarExport(currentData, { now: nowText });
    const persistence = summarizePersistenceState(currentData, { now: nowText });
    const timeline = monitorTimelineItems(currentData)
      .sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
    const queue = timeline
      .filter((item) => activeStatuses.has(item.status))
      .slice(0, 8);
    const overdue = timeline.filter((item) => item.status === "overdue" || (item.time && item.time < nowText && !terminalStatuses.has(item.status)));
    const blocked = timeline.filter((item) => item.status === "blocked");
    const stale = timeline.filter((item) => item.time && item.time < nowText && item.status === "planned");
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

    return {
      summary: {
        health: risks.length ? "Attention" : "Ready",
        queue: queue.length,
        timeline: timeline.length,
        risks: risks.length,
        receipts: currentData.receipts.length,
        activeEngagements: revenue.activeEngagements,
        pipelineValueJpy: revenue.pipelineValueJpy,
        acceptedValueJpy: revenue.acceptedValueJpy,
        visibleUpdates: notifications.visible,
        blockedUpdates: notifications.blocked,
        agentHandoffs: handoffs.handoffs,
        pendingHandoffApprovals: handoffs.pendingApprovals,
        calendarEntries: calendarExport.counts.total,
        calendarVisible: calendarExport.counts.customerVisible,
        persistenceRevision: persistence.revision,
        persistenceState: persistence.adapterState
      },
      revenue,
      notifications,
      handoffs,
      calendar: calendarExport.counts,
      persistence,
      queue,
      timeline: timeline.slice(0, 10),
      risks,
      receipts: currentData.receipts.slice(0, 8)
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
    decideOpportunityRecords,
    createIntakeRecords,
    createSubmissionRecords,
    createScheduleRecords,
    importOperatingLedger,
    returnReviewRecords,
    buildMonitorReport,
    summarizeCalendarExport,
    summarizeDeadlines,
    summarizeAgentHandoffState,
    summarizePersistenceState,
    summarizeNotificationState,
    summarizeRevenueState,
    withTimezone
  };
})();
