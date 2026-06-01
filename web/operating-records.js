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
    "accessGateways",
    "librarySyncHandoffs",
    "monitorHealthChecks",
    "notificationEvents",
    "notificationDeliveries",
    "quotes",
    "reminderRules",
    "recurrenceCandidates",
    "availabilityWindows",
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

  function defaultAccessGateways() {
    return [
      {
        id: "gateway-public-intake",
        label: "Public Intake Gateway",
        href: "#public",
        surface: "public",
        audience: "prospect",
        visibility: "public-intake",
        publicExposure: "controlled-public",
        policy: "intake-only",
        status: "complete",
        verificationStatus: "verified-local-route-split",
        lastVerifiedAt: "2026-06-01T18:21:00+09:00",
        customerSafe: true,
        rawSurface: false,
        operatorApprovalRequired: false,
        notes: "Public traffic can reach offer copy and request intake only."
      },
      {
        id: "gateway-customer-status",
        label: "Customer Status Gateway",
        href: "#student",
        surface: "student",
        audience: "customer",
        visibility: "controlled-customer",
        publicExposure: "controlled-customer",
        policy: "customer-safe-status-only",
        status: "complete",
        verificationStatus: "verified-customer-safe",
        lastVerifiedAt: "2026-06-01T18:21:00+09:00",
        customerSafe: true,
        rawSurface: false,
        operatorApprovalRequired: true,
        notes: "Customer status can show due, submitted, returned, next-action, and approved update records only."
      },
      {
        id: "gateway-raw-admin",
        label: "Raw Admin Denial",
        href: "#admin",
        surface: "admin",
        audience: "operator",
        visibility: "internal",
        publicExposure: "denied",
        policy: "local-only-admin",
        status: "complete",
        verificationStatus: "verified-denied",
        lastVerifiedAt: "2026-06-01T18:21:00+09:00",
        customerSafe: false,
        rawSurface: true,
        operatorApprovalRequired: true,
        notes: "Admin controls remain local-only and must not be placed on public hostnames."
      },
      {
        id: "gateway-raw-monitor",
        label: "Raw Monitor Denial",
        href: "#monitor",
        surface: "monitor",
        audience: "operator",
        visibility: "internal",
        publicExposure: "denied",
        policy: "local-only-monitor",
        status: "complete",
        verificationStatus: "verified-denied",
        lastVerifiedAt: "2026-06-01T18:21:00+09:00",
        customerSafe: false,
        rawSurface: true,
        operatorApprovalRequired: true,
        notes: "EPOCH MONITOR remains the operator control room and is never customer-visible."
      }
    ];
  }

  function defaultLibrarySyncHandoffs() {
    return [
      {
        id: "library-sync-operating-ledger",
        title: "Operating Ledger Snapshot Handoff",
        sourceSystem: "EPOCH",
        targetSystem: "LIBRARY",
        syncMode: "ledger-snapshot",
        status: "queued",
        handoffStatus: "ready-for-export",
        visibility: "internal",
        customerVisible: false,
        persistenceLedgerId: "pending-export",
        revision: 0,
        checksum: "pending-export",
        snapshotAt: "",
        recoveryState: "export-required",
        durability: "browser-local-to-library",
        searchReady: true,
        backupReady: true,
        operatorApprovalRequired: true,
        nextActionAt: "2026-06-01T18:45:00+09:00",
        createdAt: "2026-06-01T18:31:00+09:00",
        updatedAt: "2026-06-01T18:31:00+09:00",
        receiptIds: ["receipt-library-sync-seed"],
        syncHistory: [
          {
            action: "seed",
            status: "queued",
            at: "2026-06-01T18:31:00+09:00",
            note: "EPOCH ledger is ready for a controlled LIBRARY snapshot handoff after operator export."
          }
        ],
        notes: "Export a fresh operating ledger before external LIBRARY writeback."
      },
      {
        id: "library-recovery-import",
        title: "Recovery Snapshot Import Handoff",
        sourceSystem: "LIBRARY",
        targetSystem: "EPOCH",
        syncMode: "recovery-import",
        status: "planned",
        handoffStatus: "recovery-path-defined",
        visibility: "internal",
        customerVisible: false,
        persistenceLedgerId: "pending-recovery",
        revision: 0,
        checksum: "pending-recovery",
        snapshotAt: "",
        recoveryState: "recovery-ready",
        durability: "library-to-browser-local",
        searchReady: false,
        backupReady: true,
        operatorApprovalRequired: true,
        nextActionAt: "2026-06-02T09:00:00+09:00",
        createdAt: "2026-06-01T18:32:00+09:00",
        updatedAt: "2026-06-01T18:32:00+09:00",
        receiptIds: ["receipt-library-sync-seed"],
        syncHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-01T18:32:00+09:00",
            note: "Recovery imports must validate the EPOCH ledger envelope before replacing local browser state."
          }
        ],
        notes: "Recovery can import only validated operating-ledger JSON with matching persistence metadata."
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
    if (!Array.isArray(nextData.accessGateways) || !nextData.accessGateways.length) {
      nextData.accessGateways = defaultAccessGateways();
    }
    if (!Array.isArray(nextData.librarySyncHandoffs) || !nextData.librarySyncHandoffs.length) {
      nextData.librarySyncHandoffs = defaultLibrarySyncHandoffs();
    }
    if (!nextData.accessPosture || typeof nextData.accessPosture !== "object") {
      nextData.accessPosture = {
        mode: "controlled-local-first",
        rawMonitor: "local-only",
        rawAdmin: "local-only",
        publicIntake: "#public",
        customerStatus: "#student",
        safeGateway: "controlled-public-customer-gateway",
        defaultPublicPolicy: "deny-by-default",
        operatorRule: "Raw admin and monitor stay denied unless a future authenticated gateway is explicitly implemented and verified.",
        verificationStatus: "verified-local-route-split",
        lastVerifiedAt: "2026-06-01T18:21:00+09:00",
        notes: [
          "Public traffic can reach intake only.",
          "Customer status can show customer-safe state only.",
          "Raw admin and monitor routes remain denied by default."
        ]
      };
    }
    if (!Array.isArray(nextData.statuses)) {
      nextData.statuses = [
        "planned",
        "waiting",
        "proposed",
        "draft",
        "presented",
        "available",
        "unavailable",
        "queued",
        "submitted",
        "reviewing",
        "returned",
        "overdue",
        "blocked",
        "approved",
        "dispatched",
        "acknowledged",
        "in-progress",
        "sent",
        "failed",
        "snoozed",
        "retry-ready",
        "payment-ready",
        "payment-blocked",
        "paid-recorded",
        "declined",
        "rejected",
        "rolled-back",
        "canceled",
        "complete"
      ];
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

  function notificationDeliveryInitialStatus(event) {
    if (clean(event.deliveryStatus) === "blocked" || clean(event.status) === "blocked") return "blocked";
    return "queued";
  }

  function findNotificationDeliveryBundle(data, input) {
    const deliveryId = clean(input.deliveryId || input.notificationDeliveryId);
    const eventId = clean(input.notificationEventId || input.updateEventId);
    const delivery = deliveryId
      ? data.notificationDeliveries.find((item) => item.id === deliveryId)
      : data.notificationDeliveries.find((item) => item.notificationEventId === eventId);

    if (!delivery) throw new Error("deliveryId is required");

    const event = data.notificationEvents.find((item) => item.id === delivery.notificationEventId) || null;
    return {
      delivery,
      event,
      customer: customerById(data, delivery.customerId)
    };
  }

  function addNotificationDeliveryReceipt(record, receiptId) {
    if (!record) return;
    if (!Array.isArray(record.receiptIds)) record.receiptIds = [];
    if (!record.receiptIds.includes(receiptId)) record.receiptIds.unshift(receiptId);
  }

  function appendNotificationDeliveryHistory(record, entry) {
    if (!record) return;
    if (!Array.isArray(record.deliveryHistory)) record.deliveryHistory = [];
    record.deliveryHistory.unshift(entry);
  }

  function createNotificationOutboxRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const eventId = clean(input.notificationEventId || input.updateEventId);
    const provider = clean(input.provider) || "operator-dispatch";
    const channel = clean(input.channel) || "customer-update";
    const actor = clean(input.actor || input.owner) || "Jack";
    const includeInternal = input.includeInternal === true || clean(input.includeInternal) === "true";
    const candidateEvents = nextData.notificationEvents
      .filter((event) => !eventId || event.id === eventId)
      .filter((event) => includeInternal || event.visible !== false)
      .filter((event) => !nextData.notificationDeliveries.some((delivery) => delivery.notificationEventId === event.id));

    if (eventId && !nextData.notificationEvents.some((event) => event.id === eventId)) {
      throw new Error("notificationEventId not found");
    }

    const deliveries = [];
    const receipts = [];
    const events = [];

    for (const event of candidateEvents) {
      const initialStatus = notificationDeliveryInitialStatus(event);
      const deliveryId = `delivery-${event.id}-${requestStamp}`;
      const receiptId = `receipt-notification-outbox-${event.id}-${requestStamp}`;
      const nextActionAt = withTimezone(input.nextActionAt || event.deliverAfterAt || event.createdAt, timezone) || withTimezone(now.toISOString(), timezone);
      const delivery = {
        id: deliveryId,
        notificationEventId: event.id,
        customerId: event.customerId || null,
        sourceKind: "notification",
        sourceId: event.id,
        provider,
        channel: clean(input.channel) || event.channel || channel,
        audience: event.audience || "customer",
        title: event.title,
        summary: event.summary,
        status: initialStatus,
        deliveryStatus: initialStatus,
        customerVisible: event.visible !== false,
        createdAt: withTimezone(now.toISOString(), timezone),
        nextActionAt,
        attemptCount: 0,
        receiptIds: [receiptId],
        deliveryHistory: [{
          action: "queue",
          at: withTimezone(now.toISOString(), timezone),
          actor,
          nextStatus: initialStatus,
          receiptId,
          note: initialStatus === "blocked" ? "Visible update entered the outbox blocked." : "Visible update queued for provider-neutral delivery handoff."
        }]
      };
      const receipt = {
        id: receiptId,
        customerId: event.customerId || null,
        kind: initialStatus === "blocked" ? "notification-outbox-blocked" : "notification-outbox-queued",
        status: initialStatus === "blocked" ? "blocked" : "complete",
        createdAt: withTimezone(now.toISOString(), timezone),
        sourceKind: "notification-delivery",
        sourceId: delivery.id,
        notificationEventId: event.id,
        provider,
        channel: delivery.channel,
        note: `${actor} prepared ${event.id} for ${provider} delivery as ${initialStatus}.`
      };

      event.outboxDeliveryId = delivery.id;
      event.outboxStatus = initialStatus;
      event.deliveryProvider = provider;
      event.deliveryChannel = delivery.channel;
      event.deliveryStatus = initialStatus;
      addNotificationDeliveryReceipt(event, receipt.id);

      nextData.notificationDeliveries.unshift(delivery);
      nextData.receipts.unshift(receipt);
      deliveries.push(delivery);
      receipts.push(receipt);
      events.push(event);
    }

    return {
      data: nextData,
      records: {
        deliveries,
        receipts,
        events
      }
    };
  }

  function transitionNotificationDeliveryRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const action = clean(input.action) || "dispatch";
    const actor = clean(input.actor || input.owner) || "Jack";
    const note = clean(input.note || input.summary) || `Notification delivery ${action} recorded.`;
    const eventAt = withTimezone(now.toISOString(), timezone);
    const nextActionAt = withTimezone(input.nextActionAt, timezone) || eventAt;
    const { delivery, event } = findNotificationDeliveryBundle(nextData, input);
    const previousStatus = delivery.status || "queued";
    const stateByAction = {
      dispatch: { status: "dispatched", receiptKind: "notification-delivery-dispatched" },
      sent: { status: "sent", receiptKind: "notification-delivery-sent" },
      fail: { status: "failed", receiptKind: "notification-delivery-failed" },
      block: { status: "blocked", receiptKind: "notification-delivery-blocked" },
      retry: { status: "retry-ready", receiptKind: "notification-delivery-retry-ready" }
    };

    if (!stateByAction[action]) {
      throw new Error("action must be dispatch, sent, fail, block, or retry");
    }
    if (previousStatus === "sent") {
      throw new Error("sent notification deliveries are terminal");
    }
    if (action === "dispatch" && !["queued", "retry-ready"].includes(previousStatus)) {
      throw new Error("notification delivery must be queued or retry-ready before dispatch");
    }
    if (action === "sent" && previousStatus !== "dispatched") {
      throw new Error("notification delivery must be dispatched before sent");
    }
    if (action === "retry" && !["failed", "blocked"].includes(previousStatus)) {
      throw new Error("notification delivery must fail or block before retry");
    }

    const transition = stateByAction[action];
    const receipt = {
      id: `receipt-notification-delivery-${action}-${requestStamp}`,
      customerId: delivery.customerId || null,
      kind: transition.receiptKind,
      status: action === "fail" || action === "block" ? "blocked" : "complete",
      createdAt: eventAt,
      sourceKind: "notification-delivery",
      sourceId: delivery.id,
      notificationEventId: delivery.notificationEventId,
      provider: clean(input.provider || delivery.provider) || "operator-dispatch",
      channel: clean(input.channel || delivery.channel) || "customer-update",
      note: `${actor} moved ${delivery.id} from ${previousStatus} to ${transition.status}. ${note}`
    };

    delivery.status = transition.status;
    delivery.deliveryStatus = transition.status;
    delivery.updatedAt = eventAt;
    delivery.nextActionAt = nextActionAt;
    delivery.lastActor = actor;
    delivery.lastNote = note;
    delivery.provider = receipt.provider;
    delivery.channel = receipt.channel;
    if (action === "dispatch") {
      delivery.dispatchedAt = eventAt;
      delivery.attemptCount = Number(delivery.attemptCount || 0) + 1;
    }
    if (action === "sent") delivery.sentAt = eventAt;
    if (action === "fail") {
      delivery.failedAt = eventAt;
      delivery.lastError = clean(input.error || input.lastError) || note;
    }
    if (action === "retry") delivery.retryReadyAt = eventAt;

    addNotificationDeliveryReceipt(delivery, receipt.id);
    appendNotificationDeliveryHistory(delivery, {
      action,
      at: eventAt,
      actor,
      previousStatus,
      nextStatus: transition.status,
      receiptId: receipt.id,
      note
    });

    if (event) {
      event.outboxStatus = transition.status;
      event.deliveryStatus = transition.status;
      event.deliveryProvider = delivery.provider;
      event.deliveryChannel = delivery.channel;
      event.updatedAt = eventAt;
      addNotificationDeliveryReceipt(event, receipt.id);
    }

    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        delivery,
        notificationEvent: event,
        receipt
      }
    };
  }

  function offerPackageById(data, packageId) {
    return data.offerPackages.find((item) => item.id === packageId) || null;
  }

  function isUnder19Quote(customer, offerPackage, input = {}) {
    const ageBand = clean(input.ageBand || customer?.ageBand).toLowerCase();
    return ageBand.includes("under") || clean(offerPackage?.routing) === "compatibility-required";
  }

  function findQuoteBundle(data, quoteId) {
    const requestedId = clean(quoteId);
    const quote = requestedId
      ? data.quotes.find((item) => item.id === requestedId)
      : data.quotes.find((item) => !["declined", "paid-recorded"].includes(item.status)) || data.quotes[0];

    if (!quote) throw new Error("quoteId is required");

    return {
      quote,
      opportunity: data.opportunities.find((item) => item.id === quote.opportunityId) || null,
      engagement: data.engagements.find((item) => item.id === quote.engagementId) || null,
      customer: customerById(data, quote.customerId),
      offerPackage: offerPackageById(data, quote.packageId)
    };
  }

  function addQuoteReceiptId(record, receiptId) {
    if (!record) return;
    if (!Array.isArray(record.receiptIds)) record.receiptIds = [];
    if (!record.receiptIds.includes(receiptId)) record.receiptIds.unshift(receiptId);
  }

  function appendQuoteHistory(record, entry) {
    if (!record) return;
    if (!Array.isArray(record.quoteHistory)) record.quoteHistory = [];
    record.quoteHistory.unshift(entry);
  }

  function createQuoteEstimateRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const opportunity = nextData.opportunities.find((item) => item.id === clean(input.opportunityId)) || null;
    const engagement = nextData.engagements.find((item) => item.id === clean(input.engagementId)) || null;
    const packageId = clean(input.packageId || opportunity?.packageId || engagement?.packageId);
    const offerPackage = offerPackageById(nextData, packageId);
    const customer = customerById(nextData, clean(input.customerId || opportunity && customerForOpportunity(nextData, opportunity)?.id || engagement?.customerId));
    const amountJpy = Number(input.amountJpy || input.priceJpy || offerPackage?.priceJpy || opportunity?.estimatedValueJpy || engagement?.valueJpy || 0);
    const title = clean(input.title) || `${offerPackage?.name || packageId || "Service"} estimate`;
    const validUntil = withTimezone(input.validUntil || input.nextActionAt, timezone) || withTimezone(now.toISOString(), timezone);

    if (!packageId || !offerPackage) throw new Error("packageId is required for quote estimate");
    if (!customer) throw new Error("customerId is required for quote estimate");
    if (!amountJpy) throw new Error("amountJpy is required for quote estimate");

    const under19 = isUnder19Quote(customer, offerPackage, input);
    const guardianConsentRecorded = input.guardianConsentRecorded === true || clean(input.guardianConsentRecorded) === "true";
    const paymentBlocked = under19 && !guardianConsentRecorded;
    const quoteId = `quote-${requestStamp}`;
    const receiptId = `receipt-quote-created-${requestStamp}`;
    const quote = {
      id: quoteId,
      opportunityId: opportunity?.id || null,
      engagementId: engagement?.id || null,
      customerId: customer.id,
      packageId,
      title,
      summary: clean(input.summary) || `${title} for ${amountJpy} JPY.`,
      amountJpy,
      currency: "JPY",
      status: "draft",
      paymentStatus: paymentBlocked ? "payment-blocked" : "draft",
      approvalStatus: "draft",
      customerVisible: false,
      under19,
      guardianConsentRequired: paymentBlocked,
      guardianConsentRecorded,
      internalNote: clean(input.internalNote) || "Local quote estimate; live payment processing is out of scope.",
      customerSafeStatus: "Estimate is being prepared.",
      validUntil,
      nextActionAt: validUntil,
      createdAt: withTimezone(now.toISOString(), timezone),
      receiptIds: [receiptId],
      quoteHistory: [{
        action: "create",
        at: withTimezone(now.toISOString(), timezone),
        actor: clean(input.actor || input.owner) || "Jack",
        nextStatus: "draft",
        receiptId,
        note: paymentBlocked ? "Quote created with under-19 payment block pending consent." : "Quote estimate created."
      }]
    };
    const receipt = {
      id: receiptId,
      customerId: customer.id,
      kind: "quote-estimate-created",
      status: "complete",
      createdAt: withTimezone(now.toISOString(), timezone),
      sourceKind: "quote",
      sourceId: quote.id,
      note: `${title} created for ${amountJpy} JPY; payment processing not initiated.`
    };

    nextData.quotes.unshift(quote);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        quote,
        receipt
      }
    };
  }

  function transitionQuoteEstimateRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const action = clean(input.action) || "present";
    const actor = clean(input.actor || input.owner) || "Jack";
    const note = clean(input.note || input.summary) || `Quote ${action} recorded.`;
    const eventAt = withTimezone(now.toISOString(), timezone);
    const { quote, customer, offerPackage } = findQuoteBundle(nextData, input.quoteId);
    const previousStatus = quote.status || "draft";
    const guardianConsentRecorded = quote.guardianConsentRecorded || input.guardianConsentRecorded === true || clean(input.guardianConsentRecorded) === "true";
    const under19 = quote.under19 || isUnder19Quote(customer, offerPackage, input);
    const stateByAction = {
      present: { status: "presented", paymentStatus: quote.paymentStatus || "draft", approvalStatus: "presented", receiptKind: "quote-presented", customerSafeStatus: "Estimate presented for review." },
      approve: { status: "approved", paymentStatus: quote.paymentStatus || "draft", approvalStatus: "approved", receiptKind: "quote-approved", customerSafeStatus: "Estimate approved; payment readiness is being checked." },
      decline: { status: "declined", paymentStatus: "declined", approvalStatus: "declined", receiptKind: "quote-declined", customerSafeStatus: "Estimate declined." },
      "mark-payment-ready": { status: "payment-ready", paymentStatus: "payment-ready", approvalStatus: "approved", receiptKind: "quote-payment-ready", customerSafeStatus: "Payment-ready status recorded; payment instructions are not live yet." },
      "block-payment": { status: "payment-blocked", paymentStatus: "payment-blocked", approvalStatus: quote.approvalStatus || "pending", receiptKind: "quote-payment-blocked", customerSafeStatus: "Payment is blocked pending required review." },
      "record-payment": { status: "paid-recorded", paymentStatus: "paid-recorded", approvalStatus: "approved", receiptKind: "quote-payment-recorded", customerSafeStatus: "Payment record placeholder captured." }
    };

    if (!stateByAction[action]) {
      throw new Error("action must be present, approve, decline, mark-payment-ready, block-payment, or record-payment");
    }
    if (["declined", "paid-recorded"].includes(previousStatus)) {
      throw new Error("terminal quotes cannot be changed");
    }
    if (action === "mark-payment-ready" && quote.approvalStatus !== "approved") {
      throw new Error("quote must be approved before payment readiness");
    }
    if (action === "record-payment" && quote.paymentStatus !== "payment-ready") {
      throw new Error("quote must be payment-ready before recording payment placeholder");
    }

    let transition = stateByAction[action];
    if (action === "mark-payment-ready" && under19 && !guardianConsentRecorded) {
      transition = stateByAction["block-payment"];
    }

    quote.status = transition.status;
    quote.paymentStatus = transition.paymentStatus;
    quote.approvalStatus = transition.approvalStatus;
    quote.customerVisible = action !== "block-payment";
    quote.customerSafeStatus = transition.customerSafeStatus;
    quote.guardianConsentRecorded = guardianConsentRecorded;
    quote.guardianConsentRequired = under19 && !guardianConsentRecorded;
    quote.updatedAt = eventAt;
    quote.lastActor = actor;
    quote.lastNote = note;
    quote.nextActionAt = withTimezone(input.nextActionAt, timezone) || eventAt;
    if (action === "present") quote.presentedAt = eventAt;
    if (action === "approve") quote.approvedAt = eventAt;
    if (transition.status === "payment-ready") quote.paymentReadyAt = eventAt;
    if (transition.status === "payment-blocked") quote.paymentBlockedAt = eventAt;
    if (action === "record-payment") quote.paymentRecordedAt = eventAt;

    const receipt = {
      id: `receipt-quote-${action}-${requestStamp}`,
      customerId: quote.customerId || null,
      kind: transition.receiptKind,
      status: transition.status === "payment-blocked" ? "blocked" : "complete",
      createdAt: eventAt,
      sourceKind: "quote",
      sourceId: quote.id,
      note: `${actor} moved ${quote.id} from ${previousStatus} to ${transition.status}. ${note}`
    };
    addQuoteReceiptId(quote, receipt.id);
    appendQuoteHistory(quote, {
      action,
      at: eventAt,
      actor,
      previousStatus,
      nextStatus: transition.status,
      receiptId: receipt.id,
      note
    });
    if (customer && quote.customerVisible) {
      customer.externalStatus = quote.customerSafeStatus;
    }

    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        quote,
        receipt
      }
    };
  }

  function createReminderRuleRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const sourceKind = clean(input.sourceKind) || "session";
    const sourceId = clean(input.sourceId || input.sessionId || input.assignmentId || input.submissionId || input.followupId);
    const reminderAt = withTimezone(input.reminderAt || input.nextActionAt, timezone) || withTimezone(now.toISOString(), timezone);
    const customerVisible = input.customerVisible === true || clean(input.customerVisible) === "true";
    if (!sourceId) throw new Error("sourceId is required for reminder rule");

    const reminder = {
      id: `reminder-${requestStamp}`,
      sourceKind,
      sourceId,
      customerId: clean(input.customerId) || null,
      title: clean(input.title) || `Reminder for ${sourceKind} ${sourceId}`,
      summary: clean(input.summary) || "Local reminder rule; external reminder delivery is out of scope.",
      status: "planned",
      reminderAt,
      nextActionAt: reminderAt,
      leadMinutes: Number(input.leadMinutes || 60),
      channel: clean(input.channel) || "operator-dashboard",
      customerVisible,
      createdAt: withTimezone(now.toISOString(), timezone),
      receiptIds: [`receipt-reminder-created-${requestStamp}`],
      reminderHistory: []
    };
    reminder.reminderHistory.unshift({
      action: "create",
      at: reminder.createdAt,
      actor: clean(input.actor || input.owner) || "Jack",
      nextStatus: reminder.status,
      receiptId: reminder.receiptIds[0],
      note: reminder.summary
    });
    const receipt = {
      id: reminder.receiptIds[0],
      customerId: reminder.customerId,
      kind: "reminder-rule-created",
      status: "complete",
      createdAt: reminder.createdAt,
      sourceKind: "reminder-rule",
      sourceId: reminder.id,
      note: `${reminder.title} scheduled for ${reminderAt}.`
    };

    nextData.reminderRules.unshift(reminder);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        reminder,
        receipt
      }
    };
  }

  function transitionReminderRuleRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const reminder = nextData.reminderRules.find((item) => item.id === clean(input.reminderId)) || nextData.reminderRules[0];
    if (!reminder) throw new Error("reminderId is required");

    const action = clean(input.action) || "complete";
    const actor = clean(input.actor || input.owner) || "Jack";
    const note = clean(input.note || input.summary) || `Reminder ${action} recorded.`;
    const eventAt = withTimezone(now.toISOString(), timezone);
    const previousStatus = reminder.status || "planned";
    const transitionByAction = {
      complete: { status: "complete", receiptKind: "reminder-rule-completed" },
      snooze: { status: "snoozed", receiptKind: "reminder-rule-snoozed" },
      block: { status: "blocked", receiptKind: "reminder-rule-blocked" },
      cancel: { status: "canceled", receiptKind: "reminder-rule-canceled" }
    };
    if (!transitionByAction[action]) throw new Error("action must be complete, snooze, block, or cancel");
    if (["complete", "canceled"].includes(previousStatus)) throw new Error("terminal reminders cannot be changed");

    const transition = transitionByAction[action];
    const nextActionAt = withTimezone(input.nextActionAt || input.reminderAt, timezone) || reminder.nextActionAt || eventAt;
    reminder.status = transition.status;
    reminder.updatedAt = eventAt;
    reminder.nextActionAt = nextActionAt;
    reminder.reminderAt = action === "snooze" ? nextActionAt : reminder.reminderAt;
    reminder.lastActor = actor;
    reminder.lastNote = note;
    if (action === "complete") reminder.completedAt = eventAt;

    const receipt = {
      id: `receipt-reminder-${action}-${requestStamp}`,
      customerId: reminder.customerId || null,
      kind: transition.receiptKind,
      status: action === "block" ? "blocked" : "complete",
      createdAt: eventAt,
      sourceKind: "reminder-rule",
      sourceId: reminder.id,
      note: `${actor} moved ${reminder.id} from ${previousStatus} to ${transition.status}. ${note}`
    };
    if (!Array.isArray(reminder.receiptIds)) reminder.receiptIds = [];
    reminder.receiptIds.unshift(receipt.id);
    if (!Array.isArray(reminder.reminderHistory)) reminder.reminderHistory = [];
    reminder.reminderHistory.unshift({
      action,
      at: eventAt,
      actor,
      previousStatus,
      nextStatus: transition.status,
      receiptId: receipt.id,
      note
    });
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        reminder,
        receipt
      }
    };
  }

  function createRecurrenceCandidateRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const candidate = {
      id: `recurrence-${requestStamp}`,
      sourceKind: clean(input.sourceKind) || "engagement",
      sourceId: clean(input.sourceId || input.engagementId || input.packageId) || "manual",
      customerId: clean(input.customerId) || null,
      title: clean(input.title) || "Recurring service candidate",
      cadence: clean(input.cadence) || "weekly",
      status: "proposed",
      nextCandidateAt: withTimezone(input.nextCandidateAt || input.nextActionAt, timezone) || withTimezone(now.toISOString(), timezone),
      customerVisible: input.customerVisible === true || clean(input.customerVisible) === "true",
      autoCreateSessions: false,
      summary: clean(input.summary) || "Recurrence candidate only; future sessions require operator approval.",
      createdAt: withTimezone(now.toISOString(), timezone),
      receiptIds: [`receipt-recurrence-created-${requestStamp}`],
      recurrenceHistory: []
    };
    candidate.recurrenceHistory.unshift({
      action: "create",
      at: candidate.createdAt,
      actor: clean(input.actor || input.owner) || "Jack",
      nextStatus: candidate.status,
      receiptId: candidate.receiptIds[0],
      note: candidate.summary
    });
    const receipt = {
      id: candidate.receiptIds[0],
      customerId: candidate.customerId,
      kind: "recurrence-candidate-created",
      status: "complete",
      createdAt: candidate.createdAt,
      sourceKind: "recurrence-candidate",
      sourceId: candidate.id,
      note: `${candidate.title} proposed with ${candidate.cadence} cadence.`
    };

    nextData.recurrenceCandidates.unshift(candidate);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        recurrence: candidate,
        receipt
      }
    };
  }

  function transitionRecurrenceCandidateRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const recurrence = nextData.recurrenceCandidates.find((item) => item.id === clean(input.recurrenceId)) || nextData.recurrenceCandidates[0];
    if (!recurrence) throw new Error("recurrenceId is required");

    const action = clean(input.action) || "approve";
    const actor = clean(input.actor || input.owner) || "Jack";
    const note = clean(input.note || input.summary) || `Recurrence ${action} recorded.`;
    const eventAt = withTimezone(now.toISOString(), timezone);
    const previousStatus = recurrence.status || "proposed";
    const transitionByAction = {
      approve: { status: "approved", receiptKind: "recurrence-candidate-approved" },
      reject: { status: "rejected", receiptKind: "recurrence-candidate-rejected" },
      block: { status: "blocked", receiptKind: "recurrence-candidate-blocked" }
    };
    if (!transitionByAction[action]) throw new Error("action must be approve, reject, or block");
    if (["approved", "rejected"].includes(previousStatus)) throw new Error("terminal recurrence candidates cannot be changed");

    const transition = transitionByAction[action];
    recurrence.status = transition.status;
    recurrence.updatedAt = eventAt;
    recurrence.nextCandidateAt = withTimezone(input.nextCandidateAt || input.nextActionAt, timezone) || recurrence.nextCandidateAt;
    recurrence.lastActor = actor;
    recurrence.lastNote = note;
    const receipt = {
      id: `receipt-recurrence-${action}-${requestStamp}`,
      customerId: recurrence.customerId || null,
      kind: transition.receiptKind,
      status: action === "block" ? "blocked" : "complete",
      createdAt: eventAt,
      sourceKind: "recurrence-candidate",
      sourceId: recurrence.id,
      note: `${actor} moved ${recurrence.id} from ${previousStatus} to ${transition.status}. ${note}`
    };
    if (!Array.isArray(recurrence.receiptIds)) recurrence.receiptIds = [];
    recurrence.receiptIds.unshift(receipt.id);
    if (!Array.isArray(recurrence.recurrenceHistory)) recurrence.recurrenceHistory = [];
    recurrence.recurrenceHistory.unshift({
      action,
      at: eventAt,
      actor,
      previousStatus,
      nextStatus: transition.status,
      receiptId: receipt.id,
      note
    });
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        recurrence,
        receipt
      }
    };
  }

  function createAvailabilityWindowRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const startAt = withTimezone(input.startAt || input.availableStartAt, timezone);
    const endAt = withTimezone(input.endAt || input.availableEndAt, timezone);
    if (!startAt || !endAt) throw new Error("startAt and endAt are required for availability window");
    const windowRecord = {
      id: `availability-${requestStamp}`,
      owner: clean(input.owner) || "Jack",
      title: clean(input.title) || "Provider availability window",
      status: clean(input.status) === "blocked" ? "blocked" : "available",
      startAt,
      endAt,
      timezone,
      capacity: Number(input.capacity || 1),
      serviceLane: clean(input.serviceLane) || "education",
      customerVisible: input.customerVisible === true || clean(input.customerVisible) === "true",
      createdAt: withTimezone(now.toISOString(), timezone),
      receiptIds: [`receipt-availability-created-${requestStamp}`],
      availabilityHistory: []
    };
    windowRecord.availabilityHistory.unshift({
      action: "create",
      at: windowRecord.createdAt,
      actor: windowRecord.owner,
      nextStatus: windowRecord.status,
      receiptId: windowRecord.receiptIds[0],
      note: "Availability window recorded locally; external calendar sync is out of scope."
    });
    const receipt = {
      id: windowRecord.receiptIds[0],
      kind: windowRecord.status === "blocked" ? "availability-window-blocked" : "availability-window-created",
      status: windowRecord.status === "blocked" ? "blocked" : "complete",
      createdAt: windowRecord.createdAt,
      sourceKind: "availability-window",
      sourceId: windowRecord.id,
      note: `${windowRecord.owner} availability ${startAt} to ${endAt} recorded as ${windowRecord.status}.`
    };

    nextData.availabilityWindows.unshift(windowRecord);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        availability: windowRecord,
        receipt
      }
    };
  }

  function transitionAvailabilityWindowRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const availability = nextData.availabilityWindows.find((item) => item.id === clean(input.availabilityId)) || nextData.availabilityWindows[0];
    if (!availability) throw new Error("availabilityId is required");

    const action = clean(input.action) || "block";
    const actor = clean(input.actor || input.owner) || availability.owner || "Jack";
    const note = clean(input.note || input.summary) || `Availability ${action} recorded.`;
    const eventAt = withTimezone(now.toISOString(), timezone);
    const previousStatus = availability.status || "available";
    const transitionByAction = {
      block: { status: "blocked", receiptKind: "availability-window-blocked" },
      reopen: { status: "available", receiptKind: "availability-window-reopened" },
      close: { status: "unavailable", receiptKind: "availability-window-closed" }
    };
    if (!transitionByAction[action]) throw new Error("action must be block, reopen, or close");
    const transition = transitionByAction[action];

    availability.status = transition.status;
    availability.updatedAt = eventAt;
    availability.lastActor = actor;
    availability.lastNote = note;
    const receipt = {
      id: `receipt-availability-${action}-${requestStamp}`,
      kind: transition.receiptKind,
      status: transition.status === "blocked" || transition.status === "unavailable" ? "blocked" : "complete",
      createdAt: eventAt,
      sourceKind: "availability-window",
      sourceId: availability.id,
      note: `${actor} moved ${availability.id} from ${previousStatus} to ${transition.status}. ${note}`
    };
    if (!Array.isArray(availability.receiptIds)) availability.receiptIds = [];
    availability.receiptIds.unshift(receipt.id);
    if (!Array.isArray(availability.availabilityHistory)) availability.availabilityHistory = [];
    availability.availabilityHistory.unshift({
      action,
      at: eventAt,
      actor,
      previousStatus,
      nextStatus: transition.status,
      receiptId: receipt.id,
      note
    });
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        availability,
        receipt
      }
    };
  }

  function localDateFor(value) {
    const text = clean(value);
    return text ? text.slice(0, 10) : null;
  }

  function scheduleWindowText(value) {
    const text = clean(value);
    return text ? text.replace("T", " ").replace("+09:00", " JST") : "time pending";
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
      updateEventId: clean(details.updateEventId) || null,
      lifecycleAction: clean(details.lifecycleAction) || null,
      previousStartAt: withTimezone(details.previousStartAt, timezone),
      previousEndAt: withTimezone(details.previousEndAt, timezone),
      rescheduledAt: withTimezone(details.rescheduledAt, timezone),
      canceledAt: withTimezone(details.canceledAt, timezone)
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

  function findLifecycleSession(data, sessionId) {
    const requestedId = clean(sessionId);
    if (requestedId) return data.sessions.find((item) => item.id === requestedId) || null;
    return data.sessions.find((item) => item.status !== "canceled") || data.sessions[0] || null;
  }

  function pushLifecycleHistory(record, entry) {
    if (!record) return;
    if (!Array.isArray(record.lifecycleHistory)) record.lifecycleHistory = [];
    record.lifecycleHistory.unshift(entry);
  }

  function rescheduleScheduleRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const session = findLifecycleSession(nextData, input.sessionId);
    const startAt = withTimezone(input.startAt || input.newStartAt, timezone);
    const endAt = withTimezone(input.endAt || input.newEndAt, timezone);
    const deadlineAt = withTimezone(input.deadlineAt, timezone);
    const reason = clean(input.reason || input.lifecycleReason) || "Schedule updated at operator request.";

    if (!session) throw new Error("sessionId is required");
    if (session.status === "canceled") throw new Error("canceled sessions cannot be rescheduled");
    if (!startAt) throw new Error("startAt is required");
    if (!endAt) throw new Error("endAt is required");

    const previousStartAt = session.startAt;
    const previousEndAt = session.endAt;
    const rescheduledAt = withTimezone(now.toISOString(), timezone);
    const customerId = session.customerId || nextData.assignments.find((item) => item.id === session.assignmentId)?.customerId || nextData.customers[0]?.id;
    const customer = nextData.customers.find((item) => item.id === customerId);
    const assignment = nextData.assignments.find((item) => item.id === session.assignmentId);
    const owner = clean(input.owner) || session.owner || assignment?.owner || "Jack";

    session.startAt = startAt;
    session.endAt = endAt;
    session.status = "planned";
    session.owner = owner;
    session.rescheduledAt = rescheduledAt;
    session.rescheduleReason = reason;
    session.previousStartAt = previousStartAt || null;
    session.previousEndAt = previousEndAt || null;
    pushLifecycleHistory(session, {
      action: "rescheduled",
      at: rescheduledAt,
      previousStartAt: previousStartAt || null,
      previousEndAt: previousEndAt || null,
      nextStartAt: startAt,
      nextEndAt: endAt,
      reason
    });

    if (assignment) {
      assignment.status = assignment.status === "canceled" ? "planned" : assignment.status || "planned";
      assignment.owner = owner;
      assignment.scheduleStatus = "rescheduled";
      assignment.lastScheduleId = session.id;
      if (deadlineAt) {
        assignment.previousDueAt = assignment.dueAt || null;
        assignment.dueAt = deadlineAt;
      }
      pushLifecycleHistory(assignment, {
        action: "schedule-rescheduled",
        at: rescheduledAt,
        sessionId: session.id,
        previousDueAt: assignment.previousDueAt || null,
        nextDueAt: assignment.dueAt || null,
        reason
      });
    }

    const externalStatus = `${session.title} rescheduled for ${scheduleWindowText(startAt)}; deadline control is active.`;
    if (customer) customer.externalStatus = externalStatus;

    const receipt = {
      id: `receipt-reschedule-${requestStamp}`,
      customerId,
      kind: "schedule-rescheduled",
      status: "complete",
      createdAt: rescheduledAt,
      note: `${session.title} moved from ${scheduleWindowText(previousStartAt)} to ${scheduleWindowText(startAt)}. ${reason}`
    };
    const followup = {
      id: `followup-reschedule-${requestStamp}`,
      customerId,
      title: `Confirm updated schedule: ${session.title}`,
      status: "planned",
      owner,
      nextActionAt: deadlineAt || startAt
    };
    const notificationEvent = createNotificationEventRecord(nextData, {
      customerId,
      sourceKind: "session-lifecycle",
      sourceId: session.id,
      title: "Schedule updated",
      summary: externalStatus,
      deliverAfterAt: startAt
    }, now, timezone);

    nextData.receipts.unshift(receipt);
    nextData.followups.unshift(followup);
    nextData.notificationEvents.unshift(notificationEvent);

    return {
      data: nextData,
      records: {
        session,
        assignment,
        receipt,
        followup,
        notificationEvent
      }
    };
  }

  function cancelScheduleRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const session = findLifecycleSession(nextData, input.sessionId);
    const reason = clean(input.reason || input.lifecycleReason) || "Schedule canceled at operator request.";
    const nextActionAt = withTimezone(input.nextActionAt, timezone) || withTimezone(now.toISOString(), timezone);

    if (!session) throw new Error("sessionId is required");

    const canceledAt = withTimezone(now.toISOString(), timezone);
    const customerId = session.customerId || nextData.assignments.find((item) => item.id === session.assignmentId)?.customerId || nextData.customers[0]?.id;
    const customer = nextData.customers.find((item) => item.id === customerId);
    const assignment = nextData.assignments.find((item) => item.id === session.assignmentId);
    const owner = clean(input.owner) || session.owner || assignment?.owner || "Jack";

    session.status = "canceled";
    session.owner = owner;
    session.canceledAt = canceledAt;
    session.cancelReason = reason;
    pushLifecycleHistory(session, {
      action: "canceled",
      at: canceledAt,
      startAt: session.startAt || null,
      endAt: session.endAt || null,
      reason
    });

    if (assignment) {
      assignment.scheduleStatus = "canceled";
      assignment.lastScheduleId = session.id;
      assignment.nextActionAt = nextActionAt;
      if (assignment.status === "planned") assignment.status = "waiting";
      pushLifecycleHistory(assignment, {
        action: "schedule-canceled",
        at: canceledAt,
        sessionId: session.id,
        nextActionAt,
        reason
      });
    }

    const externalStatus = `${session.title} was canceled; replacement plan will be confirmed if needed.`;
    if (customer) customer.externalStatus = externalStatus;

    const receipt = {
      id: `receipt-cancel-${requestStamp}`,
      customerId,
      kind: "schedule-canceled",
      status: "complete",
      createdAt: canceledAt,
      note: `${session.title} canceled. ${reason}`
    };
    const followup = {
      id: `followup-cancel-${requestStamp}`,
      customerId,
      title: `Confirm replacement plan: ${session.title}`,
      status: "planned",
      owner,
      nextActionAt
    };
    const notificationEvent = createNotificationEventRecord(nextData, {
      customerId,
      sourceKind: "session-lifecycle",
      sourceId: session.id,
      title: "Schedule canceled",
      summary: externalStatus,
      deliverAfterAt: nextActionAt
    }, now, timezone);

    nextData.receipts.unshift(receipt);
    nextData.followups.unshift(followup);
    nextData.notificationEvents.unshift(notificationEvent);

    return {
      data: nextData,
      records: {
        session,
        assignment,
        receipt,
        followup,
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
      receiptIds: [`receipt-agent-handoff-${requestStamp}`],
      transportHistory: [],
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
      receiptIds: [`receipt-agent-handoff-${requestStamp}`],
      transportHistory: [],
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
      sourceKind: "agent-handoff",
      sourceId: handoff.id,
      sourceSystem,
      targetSystem,
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

  function findAgentHandoffBundle(data, handoffId) {
    const requestedId = clean(handoffId);
    const terminalStatuses = new Set(["rejected", "rolled-back", "canceled", "complete"]);
    const handoff = requestedId
      ? data.agentHandoffs.find((item) => item.id === requestedId)
      : data.agentHandoffs.find((item) => !terminalStatuses.has(item.status)) || data.agentHandoffs[0];

    if (!handoff) throw new Error("handoffId is required");

    const workPlan = data.workPlans.find((item) => item.id === handoff.workPlanId) || null;
    return {
      handoff,
      workPlan,
      engagement: data.engagements.find((item) => item.id === handoff.engagementId) || null,
      customer: customerById(data, handoff.customerId)
    };
  }

  function appendTransportHistory(record, entry) {
    if (!record) return;
    if (!Array.isArray(record.transportHistory)) record.transportHistory = [];
    record.transportHistory.unshift(entry);
  }

  function addReceiptId(record, receiptId) {
    if (!record) return;
    if (!Array.isArray(record.receiptIds)) record.receiptIds = [];
    if (!record.receiptIds.includes(receiptId)) record.receiptIds.unshift(receiptId);
  }

  function transitionAgentHandoffRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const action = clean(input.action) || "approve";
    const actor = clean(input.actor || input.owner) || "Jack";
    const note = clean(input.note || input.summary) || `Agent handoff ${action} recorded.`;
    const nextActionAt = withTimezone(input.nextActionAt, timezone) || withTimezone(now.toISOString(), timezone);
    const eventAt = withTimezone(now.toISOString(), timezone);
    const { handoff, workPlan, customer } = findAgentHandoffBundle(nextData, input.handoffId);
    const terminalStatuses = new Set(["rejected", "rolled-back", "canceled", "complete"]);
    const customerVisibleApproved = input.customerVisibleApproved === true || clean(input.customerVisibleApproved) === "true";

    if (!["approve", "reject", "dispatch", "acknowledge", "progress", "block", "complete", "cancel", "rollback"].includes(action)) {
      throw new Error("action must be approve, reject, dispatch, acknowledge, progress, block, complete, cancel, or rollback");
    }
    if (terminalStatuses.has(handoff.status) && action !== "rollback") {
      throw new Error("terminal handoffs can only receive rollback records");
    }
    if (action === "approve" && !["waiting", "proposed", "blocked"].includes(handoff.status)) {
      throw new Error("handoff can only be approved from waiting, proposed, or blocked state");
    }
    if (action === "reject" && !["waiting", "proposed", "approved", "blocked"].includes(handoff.status)) {
      throw new Error("handoff can only be rejected before dispatch");
    }
    if (action === "dispatch" && (handoff.approvalStatus !== "approved" || handoff.status !== "approved")) {
      throw new Error("handoff must be approved before dispatch");
    }
    if (action === "acknowledge" && handoff.status !== "dispatched") {
      throw new Error("handoff must be dispatched before acknowledgement");
    }
    if (action === "progress" && !["acknowledged", "blocked"].includes(handoff.status)) {
      throw new Error("handoff must be acknowledged before progress can be recorded");
    }
    if (action === "complete" && !["acknowledged", "in-progress"].includes(handoff.status)) {
      throw new Error("handoff must be acknowledged or in progress before completion");
    }

    const previousStatus = handoff.status || "waiting";
    const previousApprovalStatus = handoff.approvalStatus || "pending-operator-approval";
    const sourceSystem = clean(handoff.sourceSystem || workPlan?.sourceSystem) || "SYMBIOSIS";
    const targetSystem = clean(handoff.targetSystem || workPlan?.targetSystem) || "ANVIL";
    const stateByAction = {
      approve: { status: "approved", approvalStatus: "approved", receiptKind: "agent-handoff-approved", followupTitle: `Dispatch approved handoff: ${handoff.title}` },
      reject: { status: "rejected", approvalStatus: "rejected", receiptKind: "agent-handoff-rejected", followupTitle: "" },
      dispatch: { status: "dispatched", approvalStatus: "approved", receiptKind: "agent-handoff-dispatched", followupTitle: `Await ${targetSystem} acknowledgement: ${handoff.title}` },
      acknowledge: { status: "acknowledged", approvalStatus: "approved", receiptKind: "agent-handoff-acknowledged", followupTitle: `Track ${targetSystem} progress: ${handoff.title}` },
      progress: { status: "in-progress", approvalStatus: "approved", receiptKind: "agent-handoff-progress", followupTitle: `Review ${targetSystem} progress: ${handoff.title}` },
      block: { status: "blocked", approvalStatus: previousApprovalStatus, receiptKind: "agent-handoff-blocked", followupTitle: `Unblock handoff: ${handoff.title}` },
      complete: { status: "complete", approvalStatus: "approved", receiptKind: "agent-handoff-complete", followupTitle: "" },
      cancel: { status: "canceled", approvalStatus: previousApprovalStatus === "pending-operator-approval" ? "canceled" : previousApprovalStatus, receiptKind: "agent-handoff-canceled", followupTitle: "" },
      rollback: { status: "rolled-back", approvalStatus: previousApprovalStatus, receiptKind: "agent-handoff-rollback", followupTitle: "" }
    };
    const transition = stateByAction[action];

    handoff.status = transition.status;
    handoff.approvalStatus = transition.approvalStatus;
    handoff.updatedAt = eventAt;
    handoff.lastActor = actor;
    handoff.lastNote = note;
    handoff.nextActionAt = nextActionAt;
    handoff.customerVisible = false;
    if (action === "approve") {
      handoff.approvedBy = actor;
      handoff.approvedAt = eventAt;
    }
    if (action === "dispatch") handoff.dispatchedAt = eventAt;
    if (action === "acknowledge") handoff.acknowledgedAt = eventAt;
    if (action === "complete") handoff.completedAt = eventAt;
    if (action === "rollback") {
      handoff.rollbackReason = note;
      handoff.rollbackOf = clean(input.rollbackOf) || previousStatus;
    }

    if (workPlan) {
      workPlan.status = transition.status;
      workPlan.approvalStatus = transition.approvalStatus;
      workPlan.updatedAt = eventAt;
      workPlan.nextActionAt = nextActionAt;
      workPlan.customerVisible = false;
      if (action === "approve") {
        workPlan.approvedBy = actor;
        workPlan.approvedAt = eventAt;
      }
      if (action === "dispatch") workPlan.dispatchedAt = eventAt;
      if (action === "acknowledge") workPlan.acknowledgedAt = eventAt;
      if (action === "complete") workPlan.completedAt = eventAt;
      if (action === "rollback") {
        workPlan.rollbackReason = note;
        workPlan.rollbackOf = clean(input.rollbackOf) || previousStatus;
      }
    }

    const receipt = {
      id: `receipt-agent-handoff-${action}-${requestStamp}`,
      customerId: handoff.customerId || null,
      kind: transition.receiptKind,
      status: action === "block" ? "blocked" : "complete",
      createdAt: eventAt,
      note: `${actor} moved ${handoff.id} from ${previousStatus} to ${transition.status}. ${note}`,
      sourceKind: "agent-handoff",
      sourceId: handoff.id,
      sourceSystem,
      targetSystem
    };
    addReceiptId(handoff, receipt.id);
    addReceiptId(workPlan, receipt.id);
    appendTransportHistory(handoff, {
      action,
      at: eventAt,
      actor,
      previousStatus,
      nextStatus: transition.status,
      previousApprovalStatus,
      nextApprovalStatus: transition.approvalStatus,
      receiptId: receipt.id,
      note
    });
    appendTransportHistory(workPlan, {
      action,
      at: eventAt,
      actor,
      previousStatus,
      nextStatus: transition.status,
      receiptId: receipt.id,
      note
    });

    let followup = null;
    if (transition.followupTitle) {
      followup = {
        id: `followup-agent-handoff-${action}-${requestStamp}`,
        customerId: handoff.customerId || null,
        title: transition.followupTitle,
        status: action === "block" ? "blocked" : "planned",
        owner: actor,
        nextActionAt,
        sourceKind: "agent-handoff",
        sourceId: handoff.id
      };
      nextData.followups.unshift(followup);
    }

    let notificationEvent = null;
    if (action === "complete" && customerVisibleApproved && customer) {
      const customerSummary = clean(input.customerSummary) || `${handoff.title} completed; operator-approved outcome is recorded.`;
      customer.externalStatus = customerSummary;
      notificationEvent = createNotificationEventRecord(nextData, {
        customerId: customer.id,
        sourceKind: "agent-handoff",
        sourceId: handoff.id,
        title: "Service work completed",
        summary: customerSummary,
        deliverAfterAt: eventAt
      }, now, timezone);
      nextData.notificationEvents.unshift(notificationEvent);
      handoff.customerVisible = true;
      if (workPlan) workPlan.customerVisible = true;
    }

    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        workPlan,
        handoff,
        receipt,
        followup,
        notificationEvent
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
    const deliveries = Array.isArray(currentData.notificationDeliveries) ? currentData.notificationDeliveries : [];
    const deliveryStatus = (status) => deliveries.filter((item) => item.status === status || item.deliveryStatus === status).length;

    return {
      total: events.length,
      visible: events.filter((item) => item.visible).length,
      pending: events.filter((item) => item.deliveryStatus === "pending").length,
      posted: events.filter((item) => item.deliveryStatus === "posted" || item.deliveryStatus === "sent").length,
      blocked: events.filter((item) => item.deliveryStatus === "blocked" || item.status === "blocked").length,
      outbox: deliveries.length,
      queued: deliveryStatus("queued"),
      dispatched: deliveryStatus("dispatched"),
      sent: deliveryStatus("sent"),
      failed: deliveryStatus("failed"),
      retryReady: deliveryStatus("retry-ready"),
      outboxBlocked: deliveryStatus("blocked"),
      receiptLinks: deliveries.reduce((total, item) => total + (Array.isArray(item.receiptIds) ? item.receiptIds.length : 0), 0),
      missingOutbox: events.filter((item) => item.visible !== false && !deliveries.some((delivery) => delivery.notificationEventId === item.id)).length
    };
  }

  function summarizeQuoteState(currentData) {
    const quotes = Array.isArray(currentData.quotes) ? currentData.quotes : [];
    const byStatus = (status) => quotes.filter((item) => item.status === status || item.paymentStatus === status).length;

    return {
      total: quotes.length,
      draft: byStatus("draft"),
      presented: byStatus("presented"),
      approved: quotes.filter((item) => item.approvalStatus === "approved").length,
      declined: byStatus("declined"),
      paymentReady: byStatus("payment-ready"),
      paymentBlocked: byStatus("payment-blocked"),
      paidRecorded: byStatus("paid-recorded"),
      under19Blocked: quotes.filter((item) => item.under19 && item.guardianConsentRequired).length,
      customerVisible: quotes.filter((item) => item.customerVisible).length,
      valueJpy: quotes.reduce((total, item) => total + Number(item.amountJpy || 0), 0),
      receiptLinks: quotes.reduce((total, item) => total + (Array.isArray(item.receiptIds) ? item.receiptIds.length : 0), 0)
    };
  }

  function summarizeScheduleControlState(currentData) {
    const reminders = Array.isArray(currentData.reminderRules) ? currentData.reminderRules : [];
    const recurrence = Array.isArray(currentData.recurrenceCandidates) ? currentData.recurrenceCandidates : [];
    const availability = Array.isArray(currentData.availabilityWindows) ? currentData.availabilityWindows : [];

    return {
      reminders: reminders.length,
      plannedReminders: reminders.filter((item) => item.status === "planned").length,
      snoozedReminders: reminders.filter((item) => item.status === "snoozed").length,
      blockedReminders: reminders.filter((item) => item.status === "blocked").length,
      completedReminders: reminders.filter((item) => item.status === "complete").length,
      recurrenceCandidates: recurrence.length,
      approvedRecurrence: recurrence.filter((item) => item.status === "approved").length,
      blockedRecurrence: recurrence.filter((item) => item.status === "blocked").length,
      rejectedRecurrence: recurrence.filter((item) => item.status === "rejected").length,
      availabilityWindows: availability.length,
      availableWindows: availability.filter((item) => item.status === "available").length,
      blockedAvailability: availability.filter((item) => item.status === "blocked").length,
      unavailableWindows: availability.filter((item) => item.status === "unavailable").length,
      customerVisibleAvailability: availability.filter((item) => item.customerVisible).length,
      receiptLinks: [...reminders, ...recurrence, ...availability].reduce((total, item) => total + (Array.isArray(item.receiptIds) ? item.receiptIds.length : 0), 0)
    };
  }

  function summarizeAgentHandoffState(currentData) {
    const workPlans = Array.isArray(currentData.workPlans) ? currentData.workPlans : [];
    const handoffs = Array.isArray(currentData.agentHandoffs) ? currentData.agentHandoffs : [];
    const customerVisibleBlocked = [
      ...workPlans,
      ...handoffs
    ].filter((item) => item.customerVisible && item.status !== "complete").length;

    return {
      workPlans: workPlans.length,
      handoffs: handoffs.length,
      pendingApprovals: handoffs.filter((item) => item.approvalStatus === "pending-operator-approval").length,
      monitorVisible: handoffs.filter((item) => item.monitorVisible).length,
      approved: handoffs.filter((item) => item.approvalStatus === "approved").length,
      dispatched: handoffs.filter((item) => item.status === "dispatched").length,
      acknowledged: handoffs.filter((item) => item.status === "acknowledged").length,
      inProgress: handoffs.filter((item) => item.status === "in-progress").length,
      blocked: handoffs.filter((item) => item.status === "blocked").length,
      complete: handoffs.filter((item) => item.status === "complete").length,
      canceled: handoffs.filter((item) => item.status === "canceled").length,
      rolledBack: handoffs.filter((item) => item.status === "rolled-back").length,
      rejected: handoffs.filter((item) => item.status === "rejected").length,
      receipts: handoffs.reduce((total, item) => total + (Array.isArray(item.receiptIds) ? item.receiptIds.length : 0), 0),
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
    const quotes = summarizeQuoteState(data);
    const scheduleControls = summarizeScheduleControlState(data);
    const handoffs = summarizeAgentHandoffState(data);
    const marketing = summarizeMarketingState(data);
    const calendarExport = createCalendarExport(data, { now: nowText });
    const timeline = monitorTimelineItems(data);
    const terminalStatuses = new Set(["complete", "sent", "paid-recorded", "declined", "returned", "canceled", "accepted", "rejected", "rolled-back"]);
    const queue = timeline.filter((item) => ["waiting", "deferred", "draft", "presented", "queued", "submitted", "reviewing", "overdue", "blocked", "proposed", "approved", "dispatched", "acknowledged", "in-progress", "failed", "snoozed", "retry-ready", "payment-ready", "payment-blocked", "unavailable"].includes(item.status));
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
      notificationOutbox: notifications.outbox,
      quoteCount: quotes.total,
      paymentReadyQuotes: quotes.paymentReady,
      reminderRules: scheduleControls.reminders,
      availabilityWindows: scheduleControls.availabilityWindows,
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

  function summarizeAccessGatewayState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const routePlacement = options.routePlacement || summarizeRoutePlacementState(data, { now: options.now });
    const gateways = data.accessGateways.map((gateway) => {
      const surface = clean(gateway.surface);
      const publicExposure = clean(gateway.publicExposure) || "denied";
      const visibility = clean(gateway.visibility) || "internal";
      const route = routePlacement.routes.find((item) => item.surface === surface || item.href === clean(gateway.href));
      const violations = [];

      if (["admin", "monitor"].includes(surface)) {
        if (publicExposure !== "denied" || visibility !== "internal") {
          violations.push(`${surface} gateway must remain denied/internal.`);
        }
        if (route && route.visibility !== "internal") {
          violations.push(`${surface} route placement is not internal-only.`);
        }
      }
      if (surface === "public" && publicExposure !== "controlled-public") {
        violations.push("Public gateway must be controlled-public intake only.");
      }
      if (["student", "customer"].includes(surface) && publicExposure !== "controlled-customer") {
        violations.push("Customer gateway must be controlled-customer status only.");
      }
      if (Boolean(gateway.customerVisible) && gateway.customerSafe === false) {
        violations.push("Customer-visible gateway is not marked customer-safe.");
      }
      if (Boolean(gateway.rawSurface) && publicExposure !== "denied") {
        violations.push("Raw surface gateway is not denied.");
      }

      return {
        id: clean(gateway.id),
        label: clean(gateway.label),
        href: clean(gateway.href),
        surface,
        audience: clean(gateway.audience) || "operator",
        visibility,
        publicExposure,
        policy: clean(gateway.policy) || "policy-pending",
        status: clean(gateway.status) || "planned",
        verificationStatus: clean(gateway.verificationStatus) || "unverified",
        lastVerifiedAt: clean(gateway.lastVerifiedAt),
        customerSafe: gateway.customerSafe !== false,
        rawSurface: gateway.rawSurface === true,
        operatorApprovalRequired: gateway.operatorApprovalRequired !== false,
        notes: clean(gateway.notes) || "No gateway note recorded.",
        routePlacementStatus: route ? route.status : "missing-route-placement",
        routeVisibility: route ? route.visibility : "missing-route-placement",
        violations
      };
    });
    const violations = gateways.flatMap((gateway) => gateway.violations.map((detail) => `${gateway.label || gateway.id}: ${detail}`));

    return {
      schema: "epoch.controlled-access-gateway",
      gatewayCount: gateways.length,
      controlledPublic: gateways.filter((item) => item.publicExposure === "controlled-public").length,
      controlledCustomer: gateways.filter((item) => item.publicExposure === "controlled-customer").length,
      deniedRaw: gateways.filter((item) => item.rawSurface && item.publicExposure === "denied").length,
      verified: gateways.filter((item) => clean(item.verificationStatus).startsWith("verified")).length,
      blocked: gateways.filter((item) => item.status === "blocked").length,
      violations,
      status: violations.length ? "blocked" : "ready",
      gateways
    };
  }

  function createAccessGatewayRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const createdAt = withTimezone(now.toISOString(), timezone);
    const gateway = {
      id: clean(input.id) || `gateway-${stamp(now)}`,
      label: clean(input.label) || "Controlled Access Gateway",
      href: clean(input.href) || "#public",
      surface: clean(input.surface) || "public",
      audience: clean(input.audience) || "prospect",
      visibility: clean(input.visibility) || "public-intake",
      publicExposure: clean(input.publicExposure) || "controlled-public",
      policy: clean(input.policy) || "intake-only",
      status: clean(input.status) || "planned",
      verificationStatus: clean(input.verificationStatus) || "pending-operator-verification",
      lastVerifiedAt: clean(input.lastVerifiedAt) || "",
      customerSafe: input.customerSafe !== false,
      rawSurface: input.rawSurface === true,
      operatorApprovalRequired: input.operatorApprovalRequired !== false,
      notes: clean(input.notes) || "Gateway created for operator review.",
      createdAt,
      updatedAt: createdAt
    };
    nextData.accessGateways.unshift(gateway);
    return {
      data: nextData,
      records: {
        gateway
      }
    };
  }

  function transitionAccessGatewayRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const updatedAt = withTimezone(now.toISOString(), timezone);
    const gatewayId = clean(input.gatewayId || input.id);
    const action = clean(input.action) || "verify";
    const note = clean(input.note) || "Access gateway reviewed by operator.";
    const gateway = nextData.accessGateways.find((item) => item.id === gatewayId);
    if (!gateway) throw new Error("access gateway not found");

    if (action === "verify") {
      gateway.status = "complete";
      gateway.verificationStatus = clean(input.verificationStatus) || (gateway.rawSurface ? "verified-denied" : "verified-controlled-gateway");
      gateway.lastVerifiedAt = updatedAt;
    } else if (action === "block") {
      gateway.status = "blocked";
      gateway.verificationStatus = "blocked";
    } else if (action === "deny") {
      gateway.status = "complete";
      gateway.publicExposure = "denied";
      gateway.visibility = "internal";
      gateway.customerSafe = false;
      gateway.rawSurface = true;
      gateway.verificationStatus = "verified-denied";
      gateway.lastVerifiedAt = updatedAt;
    } else if (action === "customer-safe") {
      gateway.status = "complete";
      gateway.publicExposure = "controlled-customer";
      gateway.visibility = "controlled-customer";
      gateway.customerSafe = true;
      gateway.rawSurface = false;
      gateway.verificationStatus = "verified-customer-safe";
      gateway.lastVerifiedAt = updatedAt;
    } else {
      throw new Error("unsupported access gateway action");
    }

    gateway.notes = note;
    gateway.updatedAt = updatedAt;

    const receiptId = `receipt-access-gateway-${stamp(now)}`;
    const healthCheck = {
      id: `monitor-check-access-gateway-${stamp(now)}`,
      actionId: `access-gateway-${action}`,
      receiptId,
      title: `Access gateway ${action}`,
      summary: `${gateway.label}: ${note}`,
      status: gateway.status,
      priority: action === "block" ? "high" : "medium",
      effect: "access-gateway-review",
      target: "monitor-access",
      owner: clean(input.owner) || "Jack",
      createdAt: updatedAt,
      visibility: "internal",
      customerVisible: false
    };
    const receipt = {
      id: receiptId,
      customerId: null,
      kind: "access-gateway",
      status: gateway.status,
      createdAt: updatedAt,
      note: `${healthCheck.title}: ${healthCheck.summary}`
    };
    nextData.monitorHealthChecks.unshift(healthCheck);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        gateway,
        healthCheck,
        receipt
      }
    };
  }

  function summarizeLibrarySyncState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const persistence = options.persistence || summarizePersistenceState(data, { now: options.now });
    const handoffs = data.librarySyncHandoffs.map((handoff) => {
      const targetSystem = clean(handoff.targetSystem) || "LIBRARY";
      const sourceSystem = clean(handoff.sourceSystem) || "EPOCH";
      const syncMode = clean(handoff.syncMode) || "ledger-snapshot";
      const status = clean(handoff.status) || "planned";
      const visibility = clean(handoff.visibility) || "internal";
      const customerVisible = handoff.customerVisible === true;
      const handoffStatus = clean(handoff.handoffStatus) || "pending";
      const recoveryState = clean(handoff.recoveryState) || "recovery-pending";
      const checksum = clean(handoff.checksum) || persistence.checksum;
      const revision = Number.isInteger(Number(handoff.revision)) ? Number(handoff.revision) : persistence.revision;
      const receiptIds = Array.isArray(handoff.receiptIds) ? handoff.receiptIds : [];
      const syncHistory = Array.isArray(handoff.syncHistory) ? handoff.syncHistory : [];
      const violations = [];

      if (targetSystem !== "LIBRARY" && sourceSystem !== "LIBRARY") {
        violations.push("LIBRARY sync handoff must target or source LIBRARY.");
      }
      if (visibility !== "internal" || customerVisible) {
        violations.push("LIBRARY sync handoff must remain internal-only.");
      }
      if (status === "complete" && !receiptIds.length) {
        violations.push("Completed LIBRARY sync handoff requires a receipt trail.");
      }
      if (["ready-for-export", "ready-for-library", "synced-to-library"].includes(handoffStatus) && !checksum) {
        violations.push("LIBRARY sync handoff is missing a checksum.");
      }
      if (syncMode === "recovery-import" && !["recovery-ready", "validated-recovery", "imported-recovery-snapshot"].includes(recoveryState)) {
        violations.push("Recovery handoff must declare a validated recovery state.");
      }

      return {
        id: clean(handoff.id),
        title: clean(handoff.title) || "LIBRARY Sync Handoff",
        sourceSystem,
        targetSystem,
        syncMode,
        status,
        handoffStatus,
        visibility,
        customerVisible,
        persistenceLedgerId: clean(handoff.persistenceLedgerId) || persistence.ledgerId,
        revision,
        checksum,
        snapshotAt: clean(handoff.snapshotAt) || persistence.snapshotAt,
        recoveryState,
        durability: clean(handoff.durability) || "browser-local-to-library",
        searchReady: handoff.searchReady === true,
        backupReady: handoff.backupReady !== false,
        operatorApprovalRequired: handoff.operatorApprovalRequired !== false,
        nextActionAt: clean(handoff.nextActionAt),
        updatedAt: clean(handoff.updatedAt),
        receiptIds,
        syncHistory,
        notes: clean(handoff.notes) || "No LIBRARY sync note recorded.",
        violations
      };
    });
    const violations = handoffs.flatMap((handoff) => handoff.violations.map((detail) => `${handoff.title || handoff.id}: ${detail}`));
    const exportHandoffs = handoffs.filter((item) => item.syncMode.includes("snapshot") || item.syncMode.includes("export"));
    const recoveryHandoffs = handoffs.filter((item) => item.syncMode.includes("recovery") || item.recoveryState.includes("recovery"));
    const dirtySnapshotPending = !["durable-ready-snapshot", "imported-recovery-snapshot"].includes(clean(persistence.adapterState));

    return {
      schema: "epoch.library-ledger-sync-handoff",
      handoffCount: handoffs.length,
      exportHandoffs: exportHandoffs.length,
      recoveryHandoffs: recoveryHandoffs.length,
      queued: handoffs.filter((item) => item.status === "queued").length,
      complete: handoffs.filter((item) => item.status === "complete").length,
      blocked: handoffs.filter((item) => item.status === "blocked").length,
      searchReady: handoffs.filter((item) => item.searchReady).length,
      backupReady: handoffs.filter((item) => item.backupReady).length,
      internalOnly: handoffs.filter((item) => item.visibility === "internal" && !item.customerVisible).length,
      dirtySnapshotPending,
      persistenceLedgerId: persistence.ledgerId,
      persistenceRevision: persistence.revision,
      persistenceChecksum: persistence.checksum,
      persistenceState: persistence.adapterState,
      violations,
      status: violations.length ? "blocked" : dirtySnapshotPending ? "snapshot-needed" : "ready",
      handoffs
    };
  }

  function createLibrarySyncHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const createdAt = withTimezone(now.toISOString(), timezone);
    const persistence = summarizePersistenceState(nextData, { now: createdAt });
    const handoff = {
      id: clean(input.id) || `library-sync-${stamp(now)}`,
      title: clean(input.title) || "LIBRARY Ledger Sync Handoff",
      sourceSystem: clean(input.sourceSystem) || "EPOCH",
      targetSystem: clean(input.targetSystem) || "LIBRARY",
      syncMode: clean(input.syncMode) || "ledger-snapshot",
      status: clean(input.status) || "queued",
      handoffStatus: clean(input.handoffStatus) || "ready-for-export",
      visibility: "internal",
      customerVisible: false,
      persistenceLedgerId: clean(input.persistenceLedgerId) || persistence.ledgerId,
      revision: Number.isInteger(Number(input.revision)) ? Number(input.revision) : persistence.revision,
      checksum: clean(input.checksum) || persistence.checksum,
      snapshotAt: clean(input.snapshotAt) || persistence.snapshotAt,
      recoveryState: clean(input.recoveryState) || "export-required",
      durability: clean(input.durability) || "browser-local-to-library",
      searchReady: input.searchReady === true || clean(input.searchReady) === "true",
      backupReady: input.backupReady !== false && clean(input.backupReady) !== "false",
      operatorApprovalRequired: true,
      nextActionAt: withTimezone(input.nextActionAt, timezone) || createdAt,
      createdAt,
      updatedAt: createdAt,
      receiptIds: [],
      syncHistory: [
        {
          action: "create",
          status: clean(input.status) || "queued",
          at: createdAt,
          note: clean(input.note) || "LIBRARY sync handoff created for operator review."
        }
      ],
      notes: clean(input.note) || "LIBRARY sync handoff created for operator review."
    };
    nextData.librarySyncHandoffs.unshift(handoff);
    return {
      data: nextData,
      records: {
        handoff
      }
    };
  }

  function transitionLibrarySyncHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const updatedAt = withTimezone(now.toISOString(), timezone);
    const handoffId = clean(input.handoffId || input.id);
    const action = clean(input.action) || "prepare-export";
    const note = clean(input.note) || "LIBRARY ledger sync handoff reviewed by operator.";
    const handoff = nextData.librarySyncHandoffs.find((item) => item.id === handoffId);
    if (!handoff) throw new Error("LIBRARY sync handoff not found");

    const persistence = summarizePersistenceState(nextData, { now: updatedAt });
    handoff.persistenceLedgerId = persistence.ledgerId;
    handoff.revision = persistence.revision;
    handoff.checksum = persistence.checksum;
    handoff.snapshotAt = persistence.snapshotAt;

    if (action === "prepare-export") {
      handoff.status = "queued";
      handoff.handoffStatus = "ready-for-export";
      handoff.recoveryState = "export-required";
    } else if (action === "mark-ready") {
      handoff.status = "queued";
      handoff.handoffStatus = "ready-for-library";
      handoff.recoveryState = "snapshot-ready";
    } else if (action === "mark-synced") {
      handoff.status = "complete";
      handoff.handoffStatus = "synced-to-library";
      handoff.recoveryState = "validated-recovery";
    } else if (action === "recovery-ready") {
      handoff.status = "complete";
      handoff.handoffStatus = "recovery-path-defined";
      handoff.recoveryState = "recovery-ready";
      handoff.syncMode = "recovery-import";
    } else if (action === "retry") {
      handoff.status = "retry-ready";
      handoff.handoffStatus = "retry-ready";
    } else if (action === "block") {
      handoff.status = "blocked";
      handoff.handoffStatus = "blocked";
    } else {
      throw new Error("unsupported LIBRARY sync action");
    }

    handoff.visibility = "internal";
    handoff.customerVisible = false;
    handoff.operatorApprovalRequired = true;
    handoff.updatedAt = updatedAt;
    handoff.nextActionAt = withTimezone(input.nextActionAt, timezone) || handoff.nextActionAt || updatedAt;
    handoff.notes = note;
    if (!Array.isArray(handoff.syncHistory)) handoff.syncHistory = [];
    handoff.syncHistory.unshift({
      action,
      status: handoff.status,
      at: updatedAt,
      checksum: handoff.checksum,
      note
    });

    const receiptId = `receipt-library-sync-${stamp(now)}`;
    if (!Array.isArray(handoff.receiptIds)) handoff.receiptIds = [];
    handoff.receiptIds.unshift(receiptId);
    const healthCheck = {
      id: `monitor-check-library-sync-${stamp(now)}`,
      actionId: `library-sync-${action}`,
      receiptId,
      title: `LIBRARY sync ${action}`,
      summary: `${handoff.title}: ${note}`,
      status: handoff.status,
      priority: action === "block" ? "high" : "medium",
      effect: "library-sync-handoff",
      target: "monitor-library-sync",
      owner: clean(input.owner) || "Jack",
      createdAt: updatedAt,
      visibility: "internal",
      customerVisible: false
    };
    const receipt = {
      id: receiptId,
      customerId: null,
      kind: "library-sync-handoff",
      status: handoff.status,
      createdAt: updatedAt,
      note: `${healthCheck.title}: ${healthCheck.summary}`
    };
    nextData.monitorHealthChecks.unshift(healthCheck);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        handoff,
        healthCheck,
        receipt
      }
    };
  }

  function summarizeAccessPosture(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const posture = data.accessPosture && typeof data.accessPosture === "object" ? data.accessPosture : {};
    const routePlacement = options.routePlacement || summarizeRoutePlacementState(data, { now: options.now });
    const accessGateways = summarizeAccessGatewayState(data, { now: options.now, routePlacement });
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
    for (const violation of accessGateways.violations) {
      violations.push(violation);
    }

    return {
      mode: clean(posture.mode) || "local-first",
      rawMonitor: clean(posture.rawMonitor) || "local-only",
      rawAdmin: clean(posture.rawAdmin) || "local-only",
      publicIntake: clean(posture.publicIntake) || "#public",
      customerStatus: clean(posture.customerStatus) || "#student",
      safeGateway: clean(posture.safeGateway) || "controlled-public-customer-gateway",
      defaultPublicPolicy: clean(posture.defaultPublicPolicy) || "deny-by-default",
      operatorRule: clean(posture.operatorRule) || "Operator rule not recorded.",
      verificationStatus: clean(posture.verificationStatus) || "unverified",
      lastVerifiedAt: clean(posture.lastVerifiedAt) || "",
      notes,
      accessGateways,
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
        updateEventId: updateBySource[`session:${session.id}`]?.id || updateBySource[`session-lifecycle:${session.id}`]?.id,
        lifecycleAction: session.canceledAt ? "canceled" : session.rescheduledAt ? "rescheduled" : "",
        previousStartAt: session.previousStartAt,
        previousEndAt: session.previousEndAt,
        rescheduledAt: session.rescheduledAt,
        canceledAt: session.canceledAt
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
        updateEventId: updateBySource[`assignment:${assignment.id}`]?.id || updateBySource[`intake:${assignment.id}`]?.id,
        lifecycleAction: assignment.scheduleStatus || "",
        previousStartAt: assignment.previousDueAt
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

    for (const delivery of data.notificationDeliveries) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "notification-delivery",
        sourceId: delivery.id,
        title: delivery.title,
        timeKind: "delivery-window",
        dueAt: delivery.nextActionAt,
        status: delivery.status,
        owner: delivery.provider || delivery.channel,
        customerId: delivery.customerId,
        externalVisible: delivery.customerVisible,
        updateEventId: delivery.notificationEventId
      }, timezone));
    }

    for (const quote of data.quotes) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "quote",
        sourceId: quote.id,
        title: quote.title,
        timeKind: "quote-validity-window",
        dueAt: quote.nextActionAt || quote.validUntil,
        status: quote.status,
        owner: quote.paymentStatus || quote.approvalStatus,
        customerId: quote.customerId,
        externalVisible: quote.customerVisible
      }, timezone));
    }

    for (const reminder of data.reminderRules) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "reminder-rule",
        sourceId: reminder.id,
        title: reminder.title,
        timeKind: "reminder-window",
        dueAt: reminder.nextActionAt || reminder.reminderAt,
        status: reminder.status,
        owner: reminder.channel,
        customerId: reminder.customerId,
        externalVisible: reminder.customerVisible
      }, timezone));
    }

    for (const recurrence of data.recurrenceCandidates) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "recurrence-candidate",
        sourceId: recurrence.id,
        title: recurrence.title,
        timeKind: "recurrence-review-window",
        dueAt: recurrence.nextCandidateAt,
        status: recurrence.status,
        owner: recurrence.cadence,
        customerId: recurrence.customerId,
        externalVisible: recurrence.customerVisible
      }, timezone));
    }

    for (const availability of data.availabilityWindows) {
      entries.push(createCalendarEntry(data, {
        sourceKind: "availability-window",
        sourceId: availability.id,
        title: availability.title,
        timeKind: "availability-window",
        startAt: availability.startAt,
        endAt: availability.endAt,
        status: availability.status,
        owner: availability.owner,
        externalVisible: availability.customerVisible
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
      overdueOrBlocked: entries.filter((item) => item.status === "overdue" || item.status === "blocked").length,
      rescheduled: entries.filter((item) => item.lifecycleAction === "rescheduled" || item.rescheduledAt).length,
      canceled: entries.filter((item) => item.status === "canceled" || item.lifecycleAction === "canceled").length
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
      ...(currentData.notificationDeliveries || []).map((item) => ({ kind: "notification delivery", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.createdAt, owner: item.provider || item.channel || "outbox" })),
      ...(currentData.quotes || []).map((item) => ({ kind: "quote", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.validUntil || item.createdAt, owner: item.paymentStatus || item.approvalStatus || "quote" })),
      ...(currentData.reminderRules || []).map((item) => ({ kind: "reminder rule", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.reminderAt, owner: item.channel || "reminder" })),
      ...(currentData.recurrenceCandidates || []).map((item) => ({ kind: "recurrence candidate", id: item.id, title: item.title, status: item.status, time: item.nextCandidateAt || item.createdAt, owner: item.cadence || "recurrence" })),
      ...(currentData.availabilityWindows || []).map((item) => ({ kind: "availability window", id: item.id, title: item.title, status: item.status, time: item.startAt || item.createdAt, owner: item.owner || "availability" })),
      ...(currentData.accessGateways || []).map((item) => ({ kind: "access gateway", id: item.id, title: item.label, status: item.status, time: item.updatedAt || item.lastVerifiedAt || item.createdAt, owner: item.publicExposure || item.policy || "access" })),
      ...(currentData.librarySyncHandoffs || []).map((item) => ({ kind: "library sync", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.handoffStatus || item.targetSystem || "LIBRARY" })),
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
    const terminalStatuses = new Set(["complete", "sent", "paid-recorded", "declined", "returned", "canceled", "accepted", "rejected", "rolled-back"]);
    const activeStatuses = new Set(["waiting", "deferred", "draft", "presented", "queued", "submitted", "reviewing", "overdue", "blocked", "proposed", "approved", "dispatched", "acknowledged", "in-progress", "failed", "snoozed", "retry-ready", "payment-ready", "payment-blocked", "unavailable"]);
    const revenue = summarizeRevenueState(data);
    const curriculum = summarizeCurriculumState(data);
    const notifications = summarizeNotificationState(data);
    const quotes = summarizeQuoteState(data);
    const scheduleControls = summarizeScheduleControlState(data);
    const handoffs = summarizeAgentHandoffState(data);
    const marketing = summarizeMarketingState(data);
    const calendarExport = createCalendarExport(data, { now: nowText });
    const persistence = summarizePersistenceState(data, { now: nowText });
    const librarySync = summarizeLibrarySyncState(data, { now: nowText, persistence });
    const routePlacement = summarizeRoutePlacementState(data, { now: nowText });
    const scope = summarizeScopeState(data, { now: nowText, routePlacement });
    const memory = summarizeMemoryState(data, { now: nowText });
    const accessGateways = summarizeAccessGatewayState(data, { now: nowText, routePlacement });
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
    for (const item of timeline.filter((entry) => entry.kind === "quote" && activeStatuses.has(entry.status)).slice(0, 2)) {
      if (!queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => ["reminder rule", "recurrence candidate", "availability window"].includes(entry.kind) && activeStatuses.has(entry.status)).slice(0, 3)) {
      if (!queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "access gateway").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "library sync").slice(0, 3)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
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
    if (accessGateways.violations.length) {
      risks.push({
        id: "access-gateway-violation",
        severity: "high",
        title: "Access Gateway Violation",
        detail: accessGateways.violations[0]
      });
    }
    if (librarySync.violations.length) {
      risks.push({
        id: "library-sync-violation",
        severity: "high",
        title: "LIBRARY Sync Violation",
        detail: librarySync.violations[0]
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
        notificationOutbox: notifications.outbox,
        queuedNotifications: notifications.queued,
        dispatchedNotifications: notifications.dispatched,
        sentNotifications: notifications.sent,
        failedNotifications: notifications.failed,
        retryReadyNotifications: notifications.retryReady,
        outboxBlockedNotifications: notifications.outboxBlocked,
        missingNotificationOutbox: notifications.missingOutbox,
        quotes: quotes.total,
        quoteValueJpy: quotes.valueJpy,
        presentedQuotes: quotes.presented,
        approvedQuotes: quotes.approved,
        paymentReadyQuotes: quotes.paymentReady,
        paymentBlockedQuotes: quotes.paymentBlocked,
        paidRecordedQuotes: quotes.paidRecorded,
        under19BlockedQuotes: quotes.under19Blocked,
        reminderRules: scheduleControls.reminders,
        plannedReminders: scheduleControls.plannedReminders,
        snoozedReminders: scheduleControls.snoozedReminders,
        recurrenceCandidates: scheduleControls.recurrenceCandidates,
        approvedRecurrence: scheduleControls.approvedRecurrence,
        availabilityWindows: scheduleControls.availabilityWindows,
        availableWindows: scheduleControls.availableWindows,
        blockedAvailability: scheduleControls.blockedAvailability,
        agentHandoffs: handoffs.handoffs,
        pendingHandoffApprovals: handoffs.pendingApprovals,
        approvedHandoffs: handoffs.approved,
        dispatchedHandoffs: handoffs.dispatched,
        acknowledgedHandoffs: handoffs.acknowledged,
        inProgressHandoffs: handoffs.inProgress,
        blockedHandoffs: handoffs.blocked,
        completedHandoffs: handoffs.complete,
        rolledBackHandoffs: handoffs.rolledBack,
        calendarEntries: calendarExport.counts.total,
        calendarVisible: calendarExport.counts.customerVisible,
        rescheduledScheduleEntries: calendarExport.counts.rescheduled,
        canceledScheduleEntries: calendarExport.counts.canceled,
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
        accessGatewayRoutes: accessGateways.gatewayCount,
        controlledPublicGateways: accessGateways.controlledPublic,
        controlledCustomerGateways: accessGateways.controlledCustomer,
        deniedRawGateways: accessGateways.deniedRaw,
        accessGatewayViolations: accessGateways.violations.length,
        librarySyncHandoffs: librarySync.handoffCount,
        libraryExportHandoffs: librarySync.exportHandoffs,
        libraryRecoveryHandoffs: librarySync.recoveryHandoffs,
        librarySearchReady: librarySync.searchReady,
        libraryBackupReady: librarySync.backupReady,
        librarySyncViolations: librarySync.violations.length,
        libraryDirtySnapshotPending: librarySync.dirtySnapshotPending,
        monitorHealthChecks: monitorHealthChecks.length,
        monitorActionReceipts: data.receipts.filter((item) => item.kind === "monitor-check").length,
        operatorActions: operatorActions.length
      },
      revenue,
      curriculum,
      notifications,
      quotes,
      scheduleControls,
      handoffs,
      marketing,
      librarySync,
      accessGateways,
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
    const accessGateway = summarizeAccessGatewayState(data, { now: now.toISOString(), routePlacement });
    const librarySync = summarizeLibrarySyncState(data, { now: now.toISOString(), persistence });
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
      accessGateway,
      librarySync,
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
    transitionAgentHandoffRecords,
    createNotificationOutboxRecords,
    transitionNotificationDeliveryRecords,
    createQuoteEstimateRecords,
    transitionQuoteEstimateRecords,
    createReminderRuleRecords,
    transitionReminderRuleRecords,
    createRecurrenceCandidateRecords,
    transitionRecurrenceCandidateRecords,
    createAvailabilityWindowRecords,
    transitionAvailabilityWindowRecords,
    createAccessGatewayRecords,
    transitionAccessGatewayRecords,
    createLibrarySyncHandoffRecords,
    transitionLibrarySyncHandoffRecords,
    createMonitorActionRecords,
    decideOpportunityRecords,
    createIntakeRecords,
    createSubmissionRecords,
    createScheduleRecords,
    rescheduleScheduleRecords,
    cancelScheduleRecords,
    importOperatingLedger,
    returnReviewRecords,
    buildMonitorReport,
    summarizeCalendarExport,
    summarizeCurriculumState,
    summarizeDeadlines,
    summarizeAgentHandoffState,
    summarizeQuoteState,
    summarizeScheduleControlState,
    summarizeAccessGatewayState,
    summarizeLibrarySyncState,
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
