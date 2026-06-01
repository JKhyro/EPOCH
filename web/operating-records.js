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
    "marketingConversionEvents",
    "providerAdapterCandidates",
    "calendarAdapterPrototypes",
    "notificationProviderPrototypes",
    "paymentProviderPrototypes",
    "leads",
    "opportunities",
    "engagements",
    "workPlans",
    "agentHandoffs",
    "routePlacements",
    "accessGateways",
    "librarySyncHandoffs",
    "calendarProviderHandoffs",
    "monitorHealthChecks",
    "notificationEvents",
    "notificationDeliveries",
    "notificationProviderHandoffs",
    "paymentProviderHandoffs",
    "authSessionRoleHandoffs",
    "customerAccountHistories",
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

  function defaultCalendarProviderHandoffs() {
    return [
      {
        id: "calendar-provider-google-readiness",
        title: "Google Calendar Provider Handoff",
        sourceSystem: "EPOCH",
        targetProvider: "Google Calendar",
        providerKind: "google",
        syncMode: "provider-export-readiness",
        status: "planned",
        handoffStatus: "adapter-deferred",
        invitationPolicy: "no-live-send",
        customerSafeStatus: "preview-ready",
        visibility: "internal",
        customerVisible: false,
        liveSyncEnabled: false,
        sendsInvitations: false,
        externalProviderWrite: false,
        calendarExportSchema: "epoch.calendar-export",
        eventSourceKinds: ["session", "assignment", "notification", "reminder-rule"],
        readinessChecks: ["timezone-normalized", "customer-safe-title", "operator-approval-required"],
        nextActionAt: "2026-06-02T10:00:00+09:00",
        createdAt: "2026-06-01T23:05:00+09:00",
        updatedAt: "2026-06-01T23:05:00+09:00",
        receiptIds: ["receipt-calendar-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-01T23:05:00+09:00",
            note: "Google Calendar adapter remains deferred while EPOCH records invitation-ready exports."
          }
        ],
        notes: "Prepare provider-neutral event payloads before any Google Calendar API adapter is implemented."
      },
      {
        id: "calendar-provider-microsoft-readiness",
        title: "Microsoft 365 Calendar Provider Handoff",
        sourceSystem: "EPOCH",
        targetProvider: "Microsoft 365 Calendar",
        providerKind: "microsoft",
        syncMode: "provider-export-readiness",
        status: "planned",
        handoffStatus: "adapter-deferred",
        invitationPolicy: "no-live-send",
        customerSafeStatus: "preview-ready",
        visibility: "internal",
        customerVisible: false,
        liveSyncEnabled: false,
        sendsInvitations: false,
        externalProviderWrite: false,
        calendarExportSchema: "epoch.calendar-export",
        eventSourceKinds: ["session", "assignment", "notification", "availability-window"],
        readinessChecks: ["timezone-normalized", "customer-safe-title", "operator-approval-required"],
        nextActionAt: "2026-06-02T10:30:00+09:00",
        createdAt: "2026-06-01T23:06:00+09:00",
        updatedAt: "2026-06-01T23:06:00+09:00",
        receiptIds: ["receipt-calendar-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-01T23:06:00+09:00",
            note: "Microsoft 365 adapter remains deferred while EPOCH records invitation-ready exports."
          }
        ],
        notes: "Prepare provider-neutral event payloads before any Microsoft Graph adapter is implemented."
      },
      {
        id: "calendar-provider-invitation-readiness",
        title: "Customer-Safe Invitation Readiness",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral",
        providerKind: "invitation",
        syncMode: "invitation-readiness",
        status: "queued",
        handoffStatus: "operator-preview-ready",
        invitationPolicy: "operator-approved-no-live-send",
        customerSafeStatus: "ready-to-preview",
        visibility: "internal",
        customerVisible: false,
        liveSyncEnabled: false,
        sendsInvitations: false,
        externalProviderWrite: false,
        calendarExportSchema: "epoch.calendar-export",
        eventSourceKinds: ["session", "assignment", "customer-update"],
        readinessChecks: ["customer-safe-summary", "operator-approval-required", "no-provider-send"],
        nextActionAt: "2026-06-01T23:30:00+09:00",
        createdAt: "2026-06-01T23:07:00+09:00",
        updatedAt: "2026-06-01T23:07:00+09:00",
        receiptIds: ["receipt-calendar-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "queued",
            at: "2026-06-01T23:07:00+09:00",
            note: "Customer-safe invitation previews can be prepared, but no external invitation is sent."
          }
        ],
        notes: "Invitation readiness records can preview customer-safe schedule text without sending provider invitations."
      }
    ];
  }

  function defaultNotificationProviderHandoffs() {
    return [
      {
        id: "notification-provider-email-readiness",
        title: "Email Provider Handoff",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral email",
        providerKind: "email",
        syncMode: "notification-provider-readiness",
        status: "planned",
        handoffStatus: "adapter-deferred",
        templatePolicy: "customer-safe-template-required",
        consentPolicy: "customer-consent-required",
        customerSafeStatus: "template-ready",
        visibility: "internal",
        customerVisible: false,
        liveSendEnabled: false,
        externalProviderWrite: false,
        storesCredentials: false,
        webhookEnabled: false,
        notificationOutboxSchema: "epoch.notification-outbox",
        channelKinds: ["email", "customer-update"],
        readinessChecks: ["customer-safe-template", "customer-consent-required", "operator-approval-required", "no-live-send"],
        nextActionAt: "2026-06-02T11:00:00+09:00",
        createdAt: "2026-06-02T00:10:00+09:00",
        updatedAt: "2026-06-02T00:10:00+09:00",
        receiptIds: ["receipt-notification-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-02T00:10:00+09:00",
            note: "Email delivery adapter remains deferred while EPOCH records template and consent readiness."
          }
        ],
        notes: "Prepare customer-safe email templates and consent checks before any email provider API work."
      },
      {
        id: "notification-provider-line-sms-readiness",
        title: "LINE / SMS Provider Handoff",
        sourceSystem: "EPOCH",
        targetProvider: "LINE or SMS provider",
        providerKind: "line-sms",
        syncMode: "notification-provider-readiness",
        status: "planned",
        handoffStatus: "adapter-deferred",
        templatePolicy: "short-customer-safe-template-required",
        consentPolicy: "channel-opt-in-required",
        customerSafeStatus: "template-ready",
        visibility: "internal",
        customerVisible: false,
        liveSendEnabled: false,
        externalProviderWrite: false,
        storesCredentials: false,
        webhookEnabled: false,
        notificationOutboxSchema: "epoch.notification-outbox",
        channelKinds: ["line", "sms", "customer-update"],
        readinessChecks: ["customer-safe-template", "channel-opt-in-required", "operator-approval-required", "no-live-send"],
        nextActionAt: "2026-06-02T11:30:00+09:00",
        createdAt: "2026-06-02T00:11:00+09:00",
        updatedAt: "2026-06-02T00:11:00+09:00",
        receiptIds: ["receipt-notification-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-02T00:11:00+09:00",
            note: "LINE/SMS delivery adapters remain deferred while channel opt-in and short-template readiness are recorded."
          }
        ],
        notes: "Prepare opt-in language and short status-update templates before any LINE or SMS adapter is implemented."
      },
      {
        id: "notification-template-consent-readiness",
        title: "Template And Consent Readiness",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral",
        providerKind: "template-consent",
        syncMode: "template-consent-readiness",
        status: "queued",
        handoffStatus: "operator-review-ready",
        templatePolicy: "approved-customer-safe-copy",
        consentPolicy: "consent-policy-defined",
        customerSafeStatus: "ready-to-preview",
        visibility: "internal",
        customerVisible: false,
        liveSendEnabled: false,
        externalProviderWrite: false,
        storesCredentials: false,
        webhookEnabled: false,
        notificationOutboxSchema: "epoch.notification-outbox",
        channelKinds: ["email", "line", "sms", "customer-update"],
        readinessChecks: ["customer-safe-template", "consent-policy-defined", "operator-approval-required", "no-live-send"],
        nextActionAt: "2026-06-02T12:00:00+09:00",
        createdAt: "2026-06-02T00:12:00+09:00",
        updatedAt: "2026-06-02T00:12:00+09:00",
        receiptIds: ["receipt-notification-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "queued",
            at: "2026-06-02T00:12:00+09:00",
            note: "Template and consent readiness can be reviewed without sending live messages."
          }
        ],
        notes: "Customer-safe templates and consent policies must be explicit before live delivery is added."
      }
    ];
  }

  function defaultPaymentProviderHandoffs() {
    return [
      {
        id: "payment-provider-invoice-readiness",
        title: "Invoice Provider Handoff",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral invoice",
        providerKind: "invoice",
        syncMode: "payment-provider-readiness",
        status: "planned",
        handoffStatus: "processor-deferred",
        invoicePolicy: "customer-safe-invoice-copy-required",
        checkoutPolicy: "checkout-link-deferred",
        eligibilityPolicy: "operator-approval-required",
        customerSafeStatus: "invoice-copy-ready",
        visibility: "internal",
        customerVisible: false,
        livePaymentEnabled: false,
        externalProviderWrite: false,
        storesCredentials: false,
        webhookEnabled: false,
        capturesPayment: false,
        paymentProcessorSchema: "epoch.quote-payment",
        readinessChecks: ["invoice-copy-ready", "operator-approval-required", "guardian-consent-gate", "no-live-payment"],
        nextActionAt: "2026-06-02T13:00:00+09:00",
        createdAt: "2026-06-02T00:20:00+09:00",
        updatedAt: "2026-06-02T00:20:00+09:00",
        receiptIds: ["receipt-payment-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-02T00:20:00+09:00",
            note: "Invoice provider adapter remains deferred while EPOCH records customer-safe invoice readiness."
          }
        ],
        notes: "Prepare invoice wording, quote references, and payment eligibility checks before any payment processor work."
      },
      {
        id: "payment-provider-checkout-readiness",
        title: "Checkout Provider Handoff",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral checkout",
        providerKind: "checkout",
        syncMode: "invoice-checkout-readiness",
        status: "planned",
        handoffStatus: "processor-deferred",
        invoicePolicy: "customer-safe-invoice-copy-required",
        checkoutPolicy: "checkout-handoff-ready",
        eligibilityPolicy: "operator-approval-required",
        customerSafeStatus: "checkout-instructions-ready",
        visibility: "internal",
        customerVisible: false,
        livePaymentEnabled: false,
        externalProviderWrite: false,
        storesCredentials: false,
        webhookEnabled: false,
        capturesPayment: false,
        paymentProcessorSchema: "epoch.quote-payment",
        readinessChecks: ["invoice-copy-ready", "checkout-handoff-ready", "operator-approval-required", "no-live-payment"],
        nextActionAt: "2026-06-02T13:30:00+09:00",
        createdAt: "2026-06-02T00:21:00+09:00",
        updatedAt: "2026-06-02T00:21:00+09:00",
        receiptIds: ["receipt-payment-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-02T00:21:00+09:00",
            note: "Checkout session creation remains deferred while operator handoff data is prepared."
          }
        ],
        notes: "Record checkout readiness without creating a checkout session, payment link, webhook, or processor write."
      },
      {
        id: "payment-eligibility-guardian-readiness",
        title: "Payment Eligibility And Guardian Gate",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral",
        providerKind: "eligibility",
        syncMode: "eligibility-guard-readiness",
        status: "queued",
        handoffStatus: "operator-review-ready",
        invoicePolicy: "invoice-blocked-until-eligible",
        checkoutPolicy: "checkout-blocked-until-eligible",
        eligibilityPolicy: "guardian-consent-and-operator-approval",
        customerSafeStatus: "eligibility-review-ready",
        visibility: "internal",
        customerVisible: false,
        livePaymentEnabled: false,
        externalProviderWrite: false,
        storesCredentials: false,
        webhookEnabled: false,
        capturesPayment: false,
        paymentProcessorSchema: "epoch.quote-payment",
        readinessChecks: ["guardian-consent-gate", "payment-eligibility-rule", "operator-approval-required", "no-live-payment"],
        nextActionAt: "2026-06-02T14:00:00+09:00",
        createdAt: "2026-06-02T00:22:00+09:00",
        updatedAt: "2026-06-02T00:22:00+09:00",
        receiptIds: ["receipt-payment-provider-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "queued",
            at: "2026-06-02T00:22:00+09:00",
            note: "Under-19 and compatibility-required payment gates stay blocked until consent and operator approval are recorded."
          }
        ],
        notes: "Payment requests for under-19 or compatibility-required work must remain blocked until eligibility and consent are explicit."
      }
    ];
  }

  function defaultAuthSessionRoleHandoffs() {
    return [
      {
        id: "auth-public-intake-readiness",
        title: "Public Intake Session Boundary",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral auth",
        roleKey: "public-intake",
        surface: "public",
        sessionMode: "public-intake-readiness",
        status: "planned",
        handoffStatus: "provider-deferred",
        accessPolicy: "controlled-public-intake-only",
        visibility: "controlled-public",
        publicExposure: "controlled-public",
        publicSurface: true,
        customerVisible: false,
        customerSafe: true,
        rawSurface: false,
        productionAuthEnabled: false,
        identityProviderWrite: false,
        storesCredentials: false,
        storesTokens: false,
        oauthClientConfigured: false,
        externalSessionEnabled: false,
        authSchema: "epoch.auth-session-role",
        readinessChecks: ["public-intake-route-only", "customer-safe-copy", "operator-approval-required", "no-live-auth"],
        nextActionAt: "2026-06-02T15:00:00+09:00",
        createdAt: "2026-06-02T01:00:00+09:00",
        updatedAt: "2026-06-02T01:00:00+09:00",
        receiptIds: ["receipt-auth-session-role-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-02T01:00:00+09:00",
            note: "Public intake remains a controlled public route without production login or identity provider writes."
          }
        ],
        notes: "Public intake can stay public, but it must not expose admin, monitor, customer-specific, token, or credential state."
      },
      {
        id: "auth-customer-status-readiness",
        title: "Customer Status Session Boundary",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral auth",
        roleKey: "customer",
        surface: "student",
        sessionMode: "customer-session-readiness",
        status: "planned",
        handoffStatus: "provider-deferred",
        accessPolicy: "controlled-customer-status-only",
        visibility: "controlled-customer",
        publicExposure: "controlled-customer",
        publicSurface: false,
        customerVisible: true,
        customerSafe: true,
        rawSurface: false,
        productionAuthEnabled: false,
        identityProviderWrite: false,
        storesCredentials: false,
        storesTokens: false,
        oauthClientConfigured: false,
        externalSessionEnabled: false,
        authSchema: "epoch.auth-session-role",
        readinessChecks: ["controlled-customer-route", "customer-safe-status-only", "operator-approval-required", "no-live-auth"],
        nextActionAt: "2026-06-02T15:30:00+09:00",
        createdAt: "2026-06-02T01:01:00+09:00",
        updatedAt: "2026-06-02T01:01:00+09:00",
        receiptIds: ["receipt-auth-session-role-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "planned",
            at: "2026-06-02T01:01:00+09:00",
            note: "Customer status is prepared as a controlled customer-safe boundary without production sessions."
          }
        ],
        notes: "Customer status may show customer-safe progress only; admin notes, monitor state, tokens, and credentials stay out."
      },
      {
        id: "auth-admin-operator-readiness",
        title: "Admin Operator Session Boundary",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral auth",
        roleKey: "operator-admin",
        surface: "admin",
        sessionMode: "internal-admin-readiness",
        status: "queued",
        handoffStatus: "operator-review-ready",
        accessPolicy: "internal-admin-denied-public",
        visibility: "internal",
        publicExposure: "denied",
        publicSurface: false,
        customerVisible: false,
        customerSafe: false,
        rawSurface: true,
        productionAuthEnabled: false,
        identityProviderWrite: false,
        storesCredentials: false,
        storesTokens: false,
        oauthClientConfigured: false,
        externalSessionEnabled: false,
        authSchema: "epoch.auth-session-role",
        readinessChecks: ["admin-denied-public", "operator-only", "no-credential-storage", "no-live-auth"],
        nextActionAt: "2026-06-02T16:00:00+09:00",
        createdAt: "2026-06-02T01:02:00+09:00",
        updatedAt: "2026-06-02T01:02:00+09:00",
        receiptIds: ["receipt-auth-session-role-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "queued",
            at: "2026-06-02T01:02:00+09:00",
            note: "Admin is internal-only until a future authenticated operator gateway is selected and verified."
          }
        ],
        notes: "Admin access must remain internal/local-first and denied to public/customer traffic in this readiness slice."
      },
      {
        id: "auth-monitor-denial-readiness",
        title: "Monitor Session Boundary",
        sourceSystem: "EPOCH",
        targetProvider: "provider-neutral auth",
        roleKey: "monitor-operator",
        surface: "monitor",
        sessionMode: "internal-monitor-readiness",
        status: "queued",
        handoffStatus: "operator-review-ready",
        accessPolicy: "raw-monitor-denied-public",
        visibility: "internal",
        publicExposure: "denied",
        publicSurface: false,
        customerVisible: false,
        customerSafe: false,
        rawSurface: true,
        productionAuthEnabled: false,
        identityProviderWrite: false,
        storesCredentials: false,
        storesTokens: false,
        oauthClientConfigured: false,
        externalSessionEnabled: false,
        authSchema: "epoch.auth-session-role",
        readinessChecks: ["monitor-denied-public", "operator-only", "no-token-storage", "no-live-auth"],
        nextActionAt: "2026-06-02T16:30:00+09:00",
        createdAt: "2026-06-02T01:03:00+09:00",
        updatedAt: "2026-06-02T01:03:00+09:00",
        receiptIds: ["receipt-auth-session-role-seed"],
        handoffHistory: [
          {
            action: "seed",
            status: "queued",
            at: "2026-06-02T01:03:00+09:00",
            note: "Monitor remains local/internal and denied to public traffic while production auth remains deferred."
          }
        ],
        notes: "Raw monitor state is not a customer or public surface; future auth must be explicit before exposure changes."
      }
    ];
  }

  function defaultMarketingConversionEvents() {
    return [
      {
        id: "conversion-ja-diagnostic-view",
        title: "Japan English Offer View Readiness",
        campaignRouteId: "campaign-ja-english-accelerator",
        campaignId: "cmp-ja-eiken-writing-001",
        routeKey: "ja/offers/english-accelerator/intake",
        regionScope: "jp",
        sourceChannel: "Japan SEO, LINE, note, X, referrals",
        offerBundle: "english-cohort",
        audienceTier: "19plus",
        eventType: "offer_view",
        conversionStage: "awareness",
        primaryConversion: "diagnostic_submit",
        status: "queued",
        readinessStatus: "kpi-ready",
        conversionValueJpy: 0,
        publicMetric: true,
        customerVisible: false,
        customerSafe: true,
        localOnly: true,
        livePixelEnabled: false,
        externalAdApiWrite: false,
        invasiveTracking: false,
        storesPersonalData: false,
        productionAnalyticsCredential: false,
        webhookEnabled: false,
        crossSiteIdentifier: false,
        analyticsProvider: "provider-neutral ledger",
        attributionPolicy: "first-party-route-key-only",
        copyPolicy: "outcome-workflow-no-ai-forward",
        readinessChecks: ["route-key-preserved", "no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"],
        monitorKpis: ["Route Health", "Offer View Readiness", "Submission-to-Enrollment"],
        nextActionAt: "2026-06-02T17:00:00+09:00",
        occurredAt: "2026-06-02T09:00:00+09:00",
        createdAt: "2026-06-02T02:00:00+09:00",
        updatedAt: "2026-06-02T02:00:00+09:00",
        receiptIds: ["receipt-marketing-conversion-seed"],
        notes: "Track offer-view readiness through local route attribution only; do not attach live pixels or external ad provider writes."
      },
      {
        id: "conversion-ja-diagnostic-submit",
        title: "Japan Diagnostic Submit KPI",
        campaignRouteId: "campaign-ja-english-accelerator",
        campaignId: "cmp-ja-eiken-writing-001",
        routeKey: "ja/offers/english-accelerator/intake",
        regionScope: "jp",
        sourceChannel: "Japan SEO, LINE, note, X, referrals",
        offerBundle: "english-cohort",
        audienceTier: "19plus",
        eventType: "diagnostic_submit",
        conversionStage: "high-intent",
        primaryConversion: "diagnostic_submit",
        status: "planned",
        readinessStatus: "kpi-ready",
        conversionValueJpy: 45000,
        publicMetric: false,
        customerVisible: false,
        customerSafe: true,
        localOnly: true,
        livePixelEnabled: false,
        externalAdApiWrite: false,
        invasiveTracking: false,
        storesPersonalData: false,
        productionAnalyticsCredential: false,
        webhookEnabled: false,
        crossSiteIdentifier: false,
        analyticsProvider: "provider-neutral ledger",
        attributionPolicy: "first-party-route-key-only",
        copyPolicy: "outcome-workflow-no-ai-forward",
        readinessChecks: ["route-key-preserved", "primary-conversion-defined", "no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"],
        monitorKpis: ["Submission-to-Enrollment", "Cohort Fill%", "Queue-to-Delivery SLA"],
        nextActionAt: "2026-06-02T17:30:00+09:00",
        occurredAt: "",
        createdAt: "2026-06-02T02:01:00+09:00",
        updatedAt: "2026-06-02T02:01:00+09:00",
        receiptIds: ["receipt-marketing-conversion-seed"],
        notes: "Diagnostic submit is the main Japan English conversion signal before any paid route or external ad integration."
      },
      {
        id: "conversion-ja-review-submit",
        title: "Teacher Review Submission KPI",
        campaignRouteId: "campaign-ja-teacher-review-pack",
        campaignId: "cmp-ja-review-pack-001",
        routeKey: "ja/offers/teacher-review-pack/submission-path",
        regionScope: "jp",
        sourceChannel: "Community partners, search, referral messages",
        offerBundle: "teacher-review",
        audienceTier: "19plus",
        eventType: "portfolio_submit",
        conversionStage: "high-intent",
        primaryConversion: "portfolio_submit",
        status: "planned",
        readinessStatus: "kpi-ready",
        conversionValueJpy: 16000,
        publicMetric: false,
        customerVisible: false,
        customerSafe: true,
        localOnly: true,
        livePixelEnabled: false,
        externalAdApiWrite: false,
        invasiveTracking: false,
        storesPersonalData: false,
        productionAnalyticsCredential: false,
        webhookEnabled: false,
        crossSiteIdentifier: false,
        analyticsProvider: "provider-neutral ledger",
        attributionPolicy: "first-party-route-key-only",
        copyPolicy: "teacher-reviewed-outcome-copy",
        readinessChecks: ["route-key-preserved", "primary-conversion-defined", "submission-first", "no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"],
        monitorKpis: ["Submission-to-Enrollment", "Queue-to-Delivery SLA", "Copy Compliance Violations"],
        nextActionAt: "2026-06-02T18:00:00+09:00",
        occurredAt: "",
        createdAt: "2026-06-02T02:02:00+09:00",
        updatedAt: "2026-06-02T02:02:00+09:00",
        receiptIds: ["receipt-marketing-conversion-seed"],
        notes: "Submission-first review pack conversion stays local and route-key based until campaign proof is strong enough for provider selection."
      },
      {
        id: "conversion-global-support-consult",
        title: "Global Support Consultation KPI",
        campaignRouteId: "campaign-global-professional-support",
        campaignId: "cmp-global-support-001",
        routeKey: "global/offers/professional-support/tech-support",
        regionScope: "global",
        sourceChannel: "LinkedIn, Google Search, partner newsletters",
        offerBundle: "tech-support",
        audienceTier: "corporate",
        eventType: "consult_booking",
        conversionStage: "qualified",
        primaryConversion: "consult_booking",
        status: "planned",
        readinessStatus: "provider-deferred",
        conversionValueJpy: 120000,
        publicMetric: false,
        customerVisible: false,
        customerSafe: true,
        localOnly: true,
        livePixelEnabled: false,
        externalAdApiWrite: false,
        invasiveTracking: false,
        storesPersonalData: false,
        productionAnalyticsCredential: false,
        webhookEnabled: false,
        crossSiteIdentifier: false,
        analyticsProvider: "provider-neutral ledger",
        attributionPolicy: "first-party-route-key-only",
        copyPolicy: "service-outcome-copy",
        readinessChecks: ["route-key-preserved", "primary-conversion-defined", "access-boundary-required", "no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"],
        monitorKpis: ["Route Health", "Queue-to-Delivery SLA", "Premium Add-on Conversion"],
        nextActionAt: "2026-06-02T18:30:00+09:00",
        occurredAt: "",
        createdAt: "2026-06-02T02:03:00+09:00",
        updatedAt: "2026-06-02T02:03:00+09:00",
        receiptIds: ["receipt-marketing-conversion-seed"],
        notes: "Global support route can measure consultation readiness locally before ad platforms, pixels, or analytics credentials are selected."
      },
      {
        id: "conversion-under19-compatibility-request",
        title: "Under-19 Compatibility Request KPI",
        campaignRouteId: "campaign-ja-under19-guardian-gate",
        campaignId: "cmp-ja-under19-001",
        routeKey: "ja/offers/under19/guardian-gate",
        regionScope: "jp",
        sourceChannel: "Guardian referrals, school contacts, partner placements",
        offerBundle: "english-cohort",
        audienceTier: "under19",
        eventType: "compatibility_request",
        conversionStage: "guarded-intake",
        primaryConversion: "compatibility_request",
        status: "queued",
        readinessStatus: "guardian-gated",
        conversionValueJpy: 0,
        publicMetric: false,
        customerVisible: false,
        customerSafe: true,
        localOnly: true,
        livePixelEnabled: false,
        externalAdApiWrite: false,
        invasiveTracking: false,
        storesPersonalData: false,
        productionAnalyticsCredential: false,
        webhookEnabled: false,
        crossSiteIdentifier: false,
        analyticsProvider: "provider-neutral ledger",
        attributionPolicy: "first-party-route-key-only",
        copyPolicy: "under19-guardian-gated-copy",
        readinessChecks: ["route-key-preserved", "guardian-consent-required", "no-paid-action-before-consent", "no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"],
        monitorKpis: ["Under-19 Compliance Rate", "Copy Compliance Violations"],
        nextActionAt: "2026-06-02T19:00:00+09:00",
        occurredAt: "",
        createdAt: "2026-06-02T02:04:00+09:00",
        updatedAt: "2026-06-02T02:04:00+09:00",
        receiptIds: ["receipt-marketing-conversion-seed"],
        notes: "Under-19 conversion analytics only proves compatibility-route readiness; payment and enrollment remain blocked before consent."
      }
    ];
  }

  function defaultProviderAdapterCandidates() {
    return [
      {
        id: "provider-adapter-calendar-google",
        title: "Google Calendar Adapter Candidate",
        providerFamily: "calendar",
        targetProvider: "Google Calendar",
        sourceHandoffIds: ["calendar-provider-google-readiness"],
        adapterMode: "calendar-sync-readiness",
        status: "planned",
        readinessStatus: "go-no-go-ready",
        goNoGoState: "sandbox-review",
        riskLevel: "medium",
        legalReviewRequired: false,
        privacyReviewRequired: true,
        consentBoundaryRequired: true,
        sandboxOnly: true,
        liveApiCalls: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        oauthConfigured: false,
        webhookEnabled: false,
        externalProviderWrite: false,
        customerVisible: false,
        customerSafe: false,
        readinessChecks: ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "privacy-boundary-required", "consent-boundary-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-sync"],
        goCriteria: ["Calendar export schema remains stable", "Operator approves a sandbox account only", "Consent and invitation copy are reviewed before any send"],
        blockers: ["No OAuth client configured", "No production calendar write path"],
        nextActionAt: "2026-06-03T10:00:00+09:00",
        createdAt: "2026-06-02T03:00:00+09:00",
        updatedAt: "2026-06-02T03:00:00+09:00",
        receiptIds: ["receipt-provider-adapter-seed"],
        notes: "Calendar adapter may be evaluated in sandbox only after explicit operator approval; live sync remains deferred."
      },
      {
        id: "provider-adapter-notification-line-sms",
        title: "LINE/SMS Notification Adapter Candidate",
        providerFamily: "notification",
        targetProvider: "LINE Messaging API or SMS provider",
        sourceHandoffIds: ["notification-provider-line-sms-readiness"],
        adapterMode: "notification-send-readiness",
        status: "planned",
        readinessStatus: "go-no-go-ready",
        goNoGoState: "deferred",
        riskLevel: "high",
        legalReviewRequired: true,
        privacyReviewRequired: true,
        consentBoundaryRequired: true,
        sandboxOnly: true,
        liveApiCalls: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        oauthConfigured: false,
        webhookEnabled: false,
        externalProviderWrite: false,
        customerVisible: false,
        customerSafe: false,
        readinessChecks: ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "privacy-boundary-required", "consent-boundary-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-send"],
        goCriteria: ["Consent policy is accepted", "Template copy is approved", "Sandbox send proof is separated from customer-visible delivery"],
        blockers: ["No live sending consent", "No webhook endpoint selected"],
        nextActionAt: "2026-06-03T10:30:00+09:00",
        createdAt: "2026-06-02T03:01:00+09:00",
        updatedAt: "2026-06-02T03:01:00+09:00",
        receiptIds: ["receipt-provider-adapter-seed"],
        notes: "Notification adapter remains a candidate until consent, templates, and sandbox-only handling are reviewed."
      },
      {
        id: "provider-adapter-payment-checkout",
        title: "Invoice Checkout Adapter Candidate",
        providerFamily: "payment",
        targetProvider: "Stripe, Square, or invoice checkout provider",
        sourceHandoffIds: ["payment-provider-checkout-readiness"],
        adapterMode: "payment-checkout-readiness",
        status: "waiting",
        readinessStatus: "go-no-go-ready",
        goNoGoState: "legal-review-required",
        riskLevel: "high",
        legalReviewRequired: true,
        privacyReviewRequired: true,
        consentBoundaryRequired: true,
        sandboxOnly: true,
        liveApiCalls: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        oauthConfigured: false,
        webhookEnabled: false,
        externalProviderWrite: false,
        customerVisible: false,
        customerSafe: false,
        readinessChecks: ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "privacy-boundary-required", "consent-boundary-required", "credential-plan-required", "legal-review-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-payment-capture"],
        goCriteria: ["Legal/tax posture is reviewed", "Under-19 guardian block is preserved", "Sandbox checkout cannot capture production payment"],
        blockers: ["No live payment capture", "No webhook signing secret", "No checkout credential storage"],
        nextActionAt: "2026-06-03T11:00:00+09:00",
        createdAt: "2026-06-02T03:02:00+09:00",
        updatedAt: "2026-06-02T03:02:00+09:00",
        receiptIds: ["receipt-provider-adapter-seed"],
        notes: "Payment adapter requires legal/privacy review and sandbox-only approval before any provider integration."
      },
      {
        id: "provider-adapter-auth-session",
        title: "Auth Session Adapter Candidate",
        providerFamily: "auth-session",
        targetProvider: "Provider-neutral identity adapter",
        sourceHandoffIds: ["auth-public-intake-readiness", "auth-customer-status-readiness", "auth-admin-denial-readiness", "auth-monitor-denial-readiness"],
        adapterMode: "identity-boundary-readiness",
        status: "planned",
        readinessStatus: "go-no-go-ready",
        goNoGoState: "deferred",
        riskLevel: "high",
        legalReviewRequired: false,
        privacyReviewRequired: true,
        consentBoundaryRequired: true,
        sandboxOnly: true,
        liveApiCalls: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        oauthConfigured: false,
        webhookEnabled: false,
        externalProviderWrite: false,
        customerVisible: false,
        customerSafe: false,
        readinessChecks: ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "privacy-boundary-required", "consent-boundary-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-auth", "raw-monitor-denied-public", "raw-admin-denied-public"],
        goCriteria: ["Public/customer/admin/monitor role split is preserved", "Token storage policy is explicit", "Raw monitor/admin denial remains verified"],
        blockers: ["No OAuth client", "No token storage", "No external session"],
        nextActionAt: "2026-06-03T11:30:00+09:00",
        createdAt: "2026-06-02T03:03:00+09:00",
        updatedAt: "2026-06-02T03:03:00+09:00",
        receiptIds: ["receipt-provider-adapter-seed"],
        notes: "Auth adapter selection cannot weaken raw admin/monitor denial or introduce token storage."
      },
      {
        id: "provider-adapter-analytics-ads",
        title: "Analytics And Ads Adapter Candidate",
        providerFamily: "analytics-advertising",
        targetProvider: "Google Analytics, Google Ads, Meta, or LINE Ads candidate",
        sourceHandoffIds: ["conversion-ja-diagnostic-submit", "conversion-global-support-consult"],
        adapterMode: "conversion-measurement-readiness",
        status: "waiting",
        readinessStatus: "go-no-go-ready",
        goNoGoState: "privacy-review-required",
        riskLevel: "high",
        legalReviewRequired: true,
        privacyReviewRequired: true,
        consentBoundaryRequired: true,
        sandboxOnly: true,
        liveApiCalls: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        oauthConfigured: false,
        webhookEnabled: false,
        externalProviderWrite: false,
        customerVisible: false,
        customerSafe: false,
        readinessChecks: ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "privacy-boundary-required", "consent-boundary-required", "credential-plan-required", "legal-review-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-pixel", "no-external-ad-api-write", "no-invasive-tracking"],
        goCriteria: ["Privacy posture is explicit", "Consent and regional policy are reviewed", "First-party KPI ledger remains the default truth"],
        blockers: ["No live pixel", "No ad API conversion write", "No cross-site identifier"],
        nextActionAt: "2026-06-03T12:00:00+09:00",
        createdAt: "2026-06-02T03:04:00+09:00",
        updatedAt: "2026-06-02T03:04:00+09:00",
        receiptIds: ["receipt-provider-adapter-seed"],
        notes: "Analytics/ad adapter selection remains blocked until legal/privacy and consent boundaries are explicit."
      },
      {
        id: "provider-adapter-library-persistence",
        title: "LIBRARY Persistence Adapter Candidate",
        providerFamily: "durable-persistence",
        targetProvider: "LIBRARY API or Postgres ledger persistence",
        sourceHandoffIds: ["library-sync-operating-ledger", "library-recovery-import"],
        adapterMode: "durable-ledger-readiness",
        status: "planned",
        readinessStatus: "go-no-go-ready",
        goNoGoState: "sandbox-review",
        riskLevel: "medium",
        legalReviewRequired: false,
        privacyReviewRequired: true,
        consentBoundaryRequired: false,
        sandboxOnly: true,
        liveApiCalls: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        oauthConfigured: false,
        webhookEnabled: false,
        externalProviderWrite: false,
        customerVisible: false,
        customerSafe: false,
        readinessChecks: ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "privacy-boundary-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "backup-plan-required", "recovery-plan-required"],
        goCriteria: ["Backup/recovery path is preserved", "Import/export checks stay deterministic", "Sandbox writes cannot overwrite production records"],
        blockers: ["No live database mutation", "No service credential storage"],
        nextActionAt: "2026-06-03T12:30:00+09:00",
        createdAt: "2026-06-02T03:05:00+09:00",
        updatedAt: "2026-06-02T03:05:00+09:00",
        receiptIds: ["receipt-provider-adapter-seed"],
        notes: "Durable persistence adapter is sandbox-only until recovery and backup behavior are proven."
      }
    ];
  }

  function defaultCalendarAdapterPrototypes() {
    return [
      {
        id: "calendar-adapter-google-sandbox-export",
        title: "Google Calendar Sandbox Export Prototype",
        providerCandidateId: "provider-adapter-calendar-google",
        sourceHandoffId: "calendar-provider-google-readiness",
        adapterFamily: "calendar",
        targetProvider: "Google Calendar",
        adapterMode: "sandbox-export-preview",
        status: "queued",
        prototypeStatus: "payload-ready",
        sandboxOnly: true,
        localOnly: true,
        liveApiCalls: false,
        liveSyncEnabled: false,
        sendsInvitations: false,
        externalProviderWrite: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        oauthConfigured: false,
        webhookEnabled: false,
        customerVisible: false,
        customerSafe: false,
        calendarExportSchema: "epoch.calendar-export",
        payloadMode: "provider-neutral-event-json-preview",
        payloadSource: "epoch.calendar-export",
        exportEntryCount: 0,
        payloadEntryCount: 2,
        readinessChecks: ["calendar-export-schema-stable", "provider-go-no-go-required", "sandbox-only-before-go-live", "operator-approval-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-sync", "no-invitation-send"],
        payloadPreview: [
          {
            uid: "epoch-session-seed-diagnostic-session",
            summary: "Diagnostic writing session",
            startsAt: "2026-06-05T19:30:00+09:00",
            endsAt: "2026-06-05T20:15:00+09:00",
            timezone: "Asia/Tokyo",
            source: "session:session-001"
          },
          {
            uid: "epoch-assignment-seed-eiken-writing-request",
            summary: "EIKEN writing submission due",
            startsAt: "2026-06-06T18:00:00+09:00",
            endsAt: "2026-06-06T18:00:00+09:00",
            timezone: "Asia/Tokyo",
            source: "assignment:assignment-001"
          }
        ],
        blockers: ["No OAuth client configured", "No live calendar write path", "No provider invitation sending"],
        nextActionAt: "2026-06-04T10:00:00+09:00",
        createdAt: "2026-06-02T04:00:00+09:00",
        updatedAt: "2026-06-02T04:00:00+09:00",
        receiptIds: ["receipt-calendar-adapter-prototype-seed"],
        notes: "Local payload proof only; live calendar API calls, OAuth, secrets, webhooks, provider writes, and invitations remain disabled."
      }
    ];
  }

  function defaultNotificationProviderPrototypes() {
    return [
      {
        id: "notification-provider-sandbox-message-preview",
        title: "Notification Provider Sandbox Message Preview",
        providerCandidateId: "provider-adapter-notification-line-sms",
        sourceHandoffId: "notification-template-consent-readiness",
        adapterFamily: "notification",
        targetProvider: "provider-neutral email / LINE / SMS",
        adapterMode: "sandbox-message-preview",
        status: "queued",
        prototypeStatus: "payload-ready",
        sandboxOnly: true,
        localOnly: true,
        liveSendEnabled: false,
        liveEmailSend: false,
        liveLineSend: false,
        liveSmsSend: false,
        liveNexusSend: false,
        externalProviderWrite: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        storesCredentials: false,
        oauthConfigured: false,
        webhookEnabled: false,
        customerVisible: false,
        customerSafe: false,
        notificationOutboxSchema: "epoch.notification-outbox",
        payloadMode: "provider-neutral-message-json-preview",
        payloadSource: "epoch.notification-outbox",
        payloadEntryCount: 2,
        readinessChecks: ["provider-handoff-required", "template-consent-required", "notification-outbox-schema-stable", "sandbox-only-before-go-live", "operator-approval-required", "no-live-send", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-customer-visible-send", "no-nexus-send"],
        payloadPreview: [
          {
            uid: "epoch-notification-update-001",
            title: "Review returned",
            channel: "email",
            provider: "provider-neutral",
            customerId: "student-001",
            customerName: "Adult writing student",
            summary: "Diagnostic review returned and next action created.",
            source: "review:review-001",
            status: "preview-only",
            customerSafe: true
          },
          {
            uid: "epoch-notification-update-002",
            title: "Source files needed",
            channel: "line",
            provider: "provider-neutral",
            customerId: "client-001",
            customerName: "Small business ops client",
            summary: "Service request is blocked pending source files.",
            source: "request:request-001",
            status: "preview-only",
            customerSafe: true
          }
        ],
        blockers: ["No live sending consent", "No provider credential storage", "No webhook or NEXUS delivery path"],
        nextActionAt: "2026-06-04T11:00:00+09:00",
        createdAt: "2026-06-02T06:00:00+09:00",
        updatedAt: "2026-06-02T06:00:00+09:00",
        receiptIds: ["receipt-notification-provider-prototype-seed"],
        notes: "Local message preview only; live email, LINE, SMS, NEXUS, webhooks, credentials, provider writes, and customer-visible sends remain disabled."
      }
    ];
  }

  function defaultPaymentProviderPrototypes() {
    return [
      {
        id: "payment-provider-sandbox-checkout-preview",
        title: "Payment Provider Sandbox Checkout Preview",
        providerCandidateId: "provider-adapter-payment-checkout",
        sourceHandoffId: "payment-provider-checkout-readiness",
        adapterFamily: "payment",
        targetProvider: "provider-neutral invoice / checkout",
        adapterMode: "sandbox-payment-payload-preview",
        status: "queued",
        prototypeStatus: "payload-ready",
        sandboxOnly: true,
        localOnly: true,
        livePaymentEnabled: false,
        liveCheckoutEnabled: false,
        liveCaptureEnabled: false,
        liveRefundEnabled: false,
        invoiceSendEnabled: false,
        checkoutSessionCreated: false,
        paymentLinkCreated: false,
        capturesPayment: false,
        externalProviderWrite: false,
        productionEnabled: false,
        secretsPresent: false,
        credentialsStored: false,
        storesCredentials: false,
        oauthConfigured: false,
        webhookEnabled: false,
        customerVisible: false,
        customerSafe: false,
        legalReviewRequired: true,
        taxReviewRequired: true,
        privacyReviewRequired: true,
        under19Guarded: true,
        paymentProcessorSchema: "epoch.quote-payment",
        payloadMode: "provider-neutral-payment-json-preview",
        payloadSource: "epoch.quote-payment",
        payloadEntryCount: 2,
        readinessChecks: ["provider-candidate-required", "payment-provider-handoff-required", "quote-payment-schema-stable", "legal-review-required", "tax-review-required", "privacy-boundary-required", "under19-eligibility-gate", "sandbox-only-before-go-live", "operator-approval-required", "no-live-payment", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-checkout-session", "no-payment-capture", "no-refunds", "no-invoice-send", "no-customer-visible-payment-request"],
        payloadPreview: [
          {
            uid: "epoch-payment-preview-eiken-monthly",
            title: "Premium EIKEN Writing Review payment preview",
            provider: "provider-neutral",
            amountJpy: 45000,
            currency: "JPY",
            customerName: "Adult writing student",
            packageId: "pkg-eiken-writing-monthly",
            source: "opportunity:opp-001",
            status: "preview-only",
            paymentStatus: "not-created",
            checkoutSession: "not-created",
            customerSafe: true
          },
          {
            uid: "epoch-payment-preview-under19-gate",
            title: "Under-19 compatibility assessment blocked payment preview",
            provider: "provider-neutral",
            amountJpy: 65000,
            currency: "JPY",
            customerName: "Under-19 compatibility review",
            packageId: "pkg-under19-assessment",
            source: "package:pkg-under19-assessment",
            status: "blocked-preview-only",
            paymentStatus: "guardian-consent-required",
            checkoutSession: "not-created",
            customerSafe: true
          }
        ],
        blockers: ["No legal/tax/privacy review signoff", "No checkout credential storage", "No webhook signing secret", "No live payment capture or refund path", "Under-19 payment requests remain blocked before guardian consent"],
        nextActionAt: "2026-06-04T12:00:00+09:00",
        createdAt: "2026-06-02T07:00:00+09:00",
        updatedAt: "2026-06-02T07:00:00+09:00",
        receiptIds: ["receipt-payment-provider-prototype-seed"],
        notes: "Local payment payload preview only; live checkout, invoice sending, capture, refunds, OAuth, secrets, webhooks, provider writes, and customer-visible payment requests remain disabled."
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
    if (!Array.isArray(nextData.calendarProviderHandoffs) || !nextData.calendarProviderHandoffs.length) {
      nextData.calendarProviderHandoffs = defaultCalendarProviderHandoffs();
    }
    if (!Array.isArray(nextData.notificationProviderHandoffs) || !nextData.notificationProviderHandoffs.length) {
      nextData.notificationProviderHandoffs = defaultNotificationProviderHandoffs();
    }
    if (!Array.isArray(nextData.paymentProviderHandoffs) || !nextData.paymentProviderHandoffs.length) {
      nextData.paymentProviderHandoffs = defaultPaymentProviderHandoffs();
    }
    if (!Array.isArray(nextData.authSessionRoleHandoffs) || !nextData.authSessionRoleHandoffs.length) {
      nextData.authSessionRoleHandoffs = defaultAuthSessionRoleHandoffs();
    }
    if (!Array.isArray(nextData.marketingConversionEvents) || !nextData.marketingConversionEvents.length) {
      nextData.marketingConversionEvents = defaultMarketingConversionEvents();
    }
    if (!Array.isArray(nextData.providerAdapterCandidates) || !nextData.providerAdapterCandidates.length) {
      nextData.providerAdapterCandidates = defaultProviderAdapterCandidates();
    }
    if (!Array.isArray(nextData.calendarAdapterPrototypes) || !nextData.calendarAdapterPrototypes.length) {
      nextData.calendarAdapterPrototypes = defaultCalendarAdapterPrototypes();
    }
    if (!Array.isArray(nextData.notificationProviderPrototypes) || !nextData.notificationProviderPrototypes.length) {
      nextData.notificationProviderPrototypes = defaultNotificationProviderPrototypes();
    }
    if (!Array.isArray(nextData.paymentProviderPrototypes) || !nextData.paymentProviderPrototypes.length) {
      nextData.paymentProviderPrototypes = defaultPaymentProviderPrototypes();
    }
    nextData.customerAccountHistories = reconcileCustomerAccountHistories(nextData);
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

  function summarizeNotificationProviderState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const notifications = options.notifications || summarizeNotificationState(data);
    const handoffs = data.notificationProviderHandoffs.map((handoff) => {
      const targetProvider = clean(handoff.targetProvider) || "provider-neutral";
      const providerKind = clean(handoff.providerKind) || "provider-neutral";
      const syncMode = clean(handoff.syncMode) || "notification-provider-readiness";
      const status = clean(handoff.status) || "planned";
      const visibility = clean(handoff.visibility) || "internal";
      const customerVisible = handoff.customerVisible === true;
      const liveSendEnabled = handoff.liveSendEnabled === true;
      const externalProviderWrite = handoff.externalProviderWrite === true;
      const storesCredentials = handoff.storesCredentials === true;
      const webhookEnabled = handoff.webhookEnabled === true;
      const channelKinds = Array.isArray(handoff.channelKinds) ? handoff.channelKinds : [];
      const readinessChecks = Array.isArray(handoff.readinessChecks) ? handoff.readinessChecks : [];
      const receiptIds = Array.isArray(handoff.receiptIds) ? handoff.receiptIds : [];
      const handoffHistory = Array.isArray(handoff.handoffHistory) ? handoff.handoffHistory : [];
      const violations = [];

      if (visibility !== "internal" || customerVisible) {
        violations.push("Notification provider handoff must remain internal-only until an authenticated customer delivery surface exists.");
      }
      if (liveSendEnabled || externalProviderWrite) {
        violations.push("Notification provider handoff cannot enable live sending or external provider writes in this slice.");
      }
      if (storesCredentials || webhookEnabled) {
        violations.push("Notification provider handoff cannot store credentials or enable webhooks in this slice.");
      }
      if (!targetProvider) {
        violations.push("Notification provider handoff is missing a provider target.");
      }
      if (status === "complete" && !receiptIds.length) {
        violations.push("Completed notification provider handoff requires a receipt trail.");
      }
      if (syncMode === "template-consent-readiness") {
        if (!readinessChecks.includes("customer-safe-template")) {
          violations.push("Template readiness must prove customer-safe template copy.");
        }
        if (!readinessChecks.includes("consent-policy-defined")) {
          violations.push("Consent readiness must prove a consent policy is defined.");
        }
        if (!readinessChecks.includes("no-live-send")) {
          violations.push("Template and consent readiness must prove no live send occurs.");
        }
      }

      return {
        id: clean(handoff.id),
        title: clean(handoff.title) || "Notification Provider Handoff",
        sourceSystem: clean(handoff.sourceSystem) || "EPOCH",
        targetProvider,
        providerKind,
        syncMode,
        status,
        handoffStatus: clean(handoff.handoffStatus) || "pending",
        templatePolicy: clean(handoff.templatePolicy) || "customer-safe-template-required",
        consentPolicy: clean(handoff.consentPolicy) || "customer-consent-required",
        customerSafeStatus: clean(handoff.customerSafeStatus) || "template-pending",
        visibility,
        customerVisible,
        liveSendEnabled,
        externalProviderWrite,
        storesCredentials,
        webhookEnabled,
        notificationOutboxSchema: clean(handoff.notificationOutboxSchema) || "epoch.notification-outbox",
        channelKinds,
        readinessChecks,
        nextActionAt: clean(handoff.nextActionAt),
        updatedAt: clean(handoff.updatedAt),
        receiptIds,
        handoffHistory,
        notes: clean(handoff.notes) || "No notification provider handoff note recorded.",
        violations
      };
    });
    const violations = handoffs.flatMap((handoff) => handoff.violations.map((detail) => `${handoff.title || handoff.id}: ${detail}`));

    return {
      schema: "epoch.notification-provider-handoff",
      handoffCount: handoffs.length,
      providerReady: handoffs.filter((item) => item.syncMode === "notification-provider-readiness").length,
      templateReady: handoffs.filter((item) => item.readinessChecks.includes("customer-safe-template")).length,
      consentReady: handoffs.filter((item) => item.readinessChecks.includes("consent-policy-defined") || item.readinessChecks.includes("customer-consent-required") || item.readinessChecks.includes("channel-opt-in-required")).length,
      queued: handoffs.filter((item) => item.status === "queued").length,
      complete: handoffs.filter((item) => item.status === "complete").length,
      blocked: handoffs.filter((item) => item.status === "blocked").length,
      noLiveSend: handoffs.filter((item) => !item.liveSendEnabled && !item.externalProviderWrite && !item.storesCredentials && !item.webhookEnabled).length,
      providerKinds: new Set(handoffs.map((item) => item.providerKind).filter(Boolean)).size,
      outboxRecords: notifications.outbox,
      visibleUpdates: notifications.visible,
      violations,
      status: violations.length ? "blocked" : "ready",
      handoffs
    };
  }

  function createNotificationProviderHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const createdAt = withTimezone(now.toISOString(), timezone);
    const handoff = {
      id: clean(input.id) || `notification-provider-${stamp(now)}`,
      title: clean(input.title) || "Notification Provider Handoff",
      sourceSystem: "EPOCH",
      targetProvider: clean(input.targetProvider) || "provider-neutral",
      providerKind: clean(input.providerKind) || "provider-neutral",
      syncMode: clean(input.syncMode) || "notification-provider-readiness",
      status: clean(input.status) || "planned",
      handoffStatus: clean(input.handoffStatus) || "adapter-deferred",
      templatePolicy: clean(input.templatePolicy) || "customer-safe-template-required",
      consentPolicy: clean(input.consentPolicy) || "customer-consent-required",
      customerSafeStatus: clean(input.customerSafeStatus) || "template-ready",
      visibility: "internal",
      customerVisible: false,
      liveSendEnabled: false,
      externalProviderWrite: false,
      storesCredentials: false,
      webhookEnabled: false,
      notificationOutboxSchema: "epoch.notification-outbox",
      channelKinds: Array.isArray(input.channelKinds) ? input.channelKinds : ["customer-update"],
      readinessChecks: Array.isArray(input.readinessChecks) ? input.readinessChecks : ["customer-safe-template", "operator-approval-required", "no-live-send"],
      nextActionAt: withTimezone(input.nextActionAt, timezone) || createdAt,
      createdAt,
      updatedAt: createdAt,
      receiptIds: [],
      handoffHistory: [
        {
          action: "create",
          status: clean(input.status) || "planned",
          at: createdAt,
          note: clean(input.note) || "Notification provider handoff created for operator review."
        }
      ],
      notes: clean(input.note) || "Notification provider handoff created for operator review."
    };
    nextData.notificationProviderHandoffs.unshift(handoff);
    return {
      data: nextData,
      records: {
        handoff
      }
    };
  }

  function transitionNotificationProviderHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const updatedAt = withTimezone(now.toISOString(), timezone);
    const handoffId = clean(input.handoffId || input.id);
    const action = clean(input.action) || "verify";
    const note = clean(input.note) || "Notification provider handoff reviewed by operator.";
    const handoff = nextData.notificationProviderHandoffs.find((item) => item.id === handoffId);
    if (!handoff) throw new Error("notification provider handoff not found");

    if (action === "verify") {
      handoff.status = "complete";
      handoff.handoffStatus = "verified-provider-deferred";
    } else if (action === "prepare") {
      handoff.status = "queued";
      handoff.handoffStatus = "provider-template-payload-ready";
    } else if (action === "mark-ready") {
      handoff.status = "queued";
      handoff.handoffStatus = "adapter-ready-without-live-send";
    } else if (action === "template-ready") {
      handoff.status = "queued";
      handoff.syncMode = "template-consent-readiness";
      handoff.handoffStatus = "template-review-ready";
      handoff.customerSafeStatus = "template-ready";
      handoff.templatePolicy = "approved-customer-safe-copy";
      if (!Array.isArray(handoff.readinessChecks)) handoff.readinessChecks = [];
      for (const check of ["customer-safe-template", "no-live-send"]) {
        if (!handoff.readinessChecks.includes(check)) handoff.readinessChecks.push(check);
      }
    } else if (action === "consent-ready") {
      handoff.status = "queued";
      handoff.syncMode = "template-consent-readiness";
      handoff.handoffStatus = "consent-review-ready";
      handoff.consentPolicy = "consent-policy-defined";
      if (!Array.isArray(handoff.readinessChecks)) handoff.readinessChecks = [];
      for (const check of ["consent-policy-defined", "operator-approval-required", "no-live-send"]) {
        if (!handoff.readinessChecks.includes(check)) handoff.readinessChecks.push(check);
      }
    } else if (action === "block") {
      handoff.status = "blocked";
      handoff.handoffStatus = "blocked";
    } else {
      throw new Error("unsupported notification provider action");
    }

    handoff.visibility = "internal";
    handoff.customerVisible = false;
    handoff.liveSendEnabled = false;
    handoff.externalProviderWrite = false;
    handoff.storesCredentials = false;
    handoff.webhookEnabled = false;
    handoff.updatedAt = updatedAt;
    handoff.nextActionAt = withTimezone(input.nextActionAt, timezone) || handoff.nextActionAt || updatedAt;
    handoff.notes = note;
    if (!Array.isArray(handoff.handoffHistory)) handoff.handoffHistory = [];
    handoff.handoffHistory.unshift({
      action,
      status: handoff.status,
      at: updatedAt,
      note
    });

    const receiptId = `receipt-notification-provider-${stamp(now)}`;
    if (!Array.isArray(handoff.receiptIds)) handoff.receiptIds = [];
    handoff.receiptIds.unshift(receiptId);
    const healthCheck = {
      id: `monitor-check-notification-provider-${stamp(now)}`,
      actionId: `notification-provider-${action}`,
      receiptId,
      title: `Notification provider ${action}`,
      summary: `${handoff.title}: ${note}`,
      status: handoff.status,
      priority: action === "block" ? "high" : "medium",
      effect: "notification-provider-handoff",
      target: "monitor-notification-provider",
      owner: clean(input.owner) || "Jack",
      createdAt: updatedAt,
      visibility: "internal",
      customerVisible: false
    };
    const receipt = {
      id: receiptId,
      customerId: null,
      kind: "notification-provider-handoff",
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

  function summarizePaymentProviderState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const quotes = options.quotes || summarizeQuoteState(data);
    const handoffs = data.paymentProviderHandoffs.map((handoff) => {
      const targetProvider = clean(handoff.targetProvider) || "provider-neutral";
      const providerKind = clean(handoff.providerKind) || "provider-neutral";
      const syncMode = clean(handoff.syncMode) || "payment-provider-readiness";
      const status = clean(handoff.status) || "planned";
      const visibility = clean(handoff.visibility) || "internal";
      const customerVisible = handoff.customerVisible === true;
      const livePaymentEnabled = handoff.livePaymentEnabled === true;
      const externalProviderWrite = handoff.externalProviderWrite === true;
      const storesCredentials = handoff.storesCredentials === true;
      const webhookEnabled = handoff.webhookEnabled === true;
      const capturesPayment = handoff.capturesPayment === true;
      const readinessChecks = Array.isArray(handoff.readinessChecks) ? handoff.readinessChecks : [];
      const receiptIds = Array.isArray(handoff.receiptIds) ? handoff.receiptIds : [];
      const handoffHistory = Array.isArray(handoff.handoffHistory) ? handoff.handoffHistory : [];
      const violations = [];

      if (visibility !== "internal" || customerVisible) {
        violations.push("Payment provider handoff must remain internal-only until an authenticated payment/customer surface exists.");
      }
      if (livePaymentEnabled || capturesPayment || externalProviderWrite) {
        violations.push("Payment provider handoff cannot enable live checkout, payment capture, or external provider writes in this slice.");
      }
      if (storesCredentials || webhookEnabled) {
        violations.push("Payment provider handoff cannot store credentials or enable webhooks in this slice.");
      }
      if (!targetProvider) {
        violations.push("Payment provider handoff is missing a provider target.");
      }
      if (status === "complete" && !receiptIds.length) {
        violations.push("Completed payment provider handoff requires a receipt trail.");
      }
      if (syncMode === "invoice-checkout-readiness") {
        if (!readinessChecks.includes("invoice-copy-ready")) {
          violations.push("Invoice readiness must prove customer-safe invoice copy.");
        }
        if (!readinessChecks.includes("checkout-handoff-ready")) {
          violations.push("Checkout readiness must prove checkout handoff data without a live session.");
        }
        if (!readinessChecks.includes("no-live-payment")) {
          violations.push("Invoice/checkout readiness must prove no live payment occurs.");
        }
      }
      if (syncMode === "eligibility-guard-readiness") {
        if (!readinessChecks.includes("guardian-consent-gate") || !readinessChecks.includes("payment-eligibility-rule")) {
          violations.push("Payment eligibility readiness must prove guardian/eligibility gating.");
        }
        if (!readinessChecks.includes("no-live-payment")) {
          violations.push("Payment eligibility readiness must prove no live payment occurs.");
        }
      }

      return {
        id: clean(handoff.id),
        title: clean(handoff.title) || "Payment Provider Handoff",
        sourceSystem: clean(handoff.sourceSystem) || "EPOCH",
        targetProvider,
        providerKind,
        syncMode,
        status,
        handoffStatus: clean(handoff.handoffStatus) || "pending",
        invoicePolicy: clean(handoff.invoicePolicy) || "customer-safe-invoice-copy-required",
        checkoutPolicy: clean(handoff.checkoutPolicy) || "checkout-link-deferred",
        eligibilityPolicy: clean(handoff.eligibilityPolicy) || "operator-approval-required",
        customerSafeStatus: clean(handoff.customerSafeStatus) || "invoice-pending",
        visibility,
        customerVisible,
        livePaymentEnabled,
        externalProviderWrite,
        storesCredentials,
        webhookEnabled,
        capturesPayment,
        paymentProcessorSchema: clean(handoff.paymentProcessorSchema) || "epoch.quote-payment",
        readinessChecks,
        nextActionAt: clean(handoff.nextActionAt),
        updatedAt: clean(handoff.updatedAt),
        receiptIds,
        handoffHistory,
        notes: clean(handoff.notes) || "No payment provider handoff note recorded.",
        violations
      };
    });
    const violations = handoffs.flatMap((handoff) => handoff.violations.map((detail) => `${handoff.title || handoff.id}: ${detail}`));

    return {
      schema: "epoch.payment-provider-handoff",
      handoffCount: handoffs.length,
      providerReady: handoffs.filter((item) => item.syncMode === "payment-provider-readiness").length,
      invoiceReady: handoffs.filter((item) => item.readinessChecks.includes("invoice-copy-ready")).length,
      checkoutReady: handoffs.filter((item) => item.readinessChecks.includes("checkout-handoff-ready")).length,
      eligibilityReady: handoffs.filter((item) => item.readinessChecks.includes("guardian-consent-gate") || item.readinessChecks.includes("payment-eligibility-rule")).length,
      queued: handoffs.filter((item) => item.status === "queued").length,
      complete: handoffs.filter((item) => item.status === "complete").length,
      blocked: handoffs.filter((item) => item.status === "blocked").length,
      noLivePayment: handoffs.filter((item) => !item.livePaymentEnabled && !item.capturesPayment && !item.externalProviderWrite && !item.storesCredentials && !item.webhookEnabled).length,
      providerKinds: new Set(handoffs.map((item) => item.providerKind).filter(Boolean)).size,
      quoteRecords: quotes.total,
      paymentReadyQuotes: quotes.paymentReady,
      violations,
      status: violations.length ? "blocked" : "ready",
      handoffs
    };
  }

  function createPaymentProviderHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const createdAt = withTimezone(now.toISOString(), timezone);
    const handoff = {
      id: clean(input.id) || `payment-provider-${stamp(now)}`,
      title: clean(input.title) || "Payment Provider Handoff",
      sourceSystem: "EPOCH",
      targetProvider: clean(input.targetProvider) || "provider-neutral",
      providerKind: clean(input.providerKind) || "provider-neutral",
      syncMode: clean(input.syncMode) || "payment-provider-readiness",
      status: clean(input.status) || "planned",
      handoffStatus: clean(input.handoffStatus) || "processor-deferred",
      invoicePolicy: clean(input.invoicePolicy) || "customer-safe-invoice-copy-required",
      checkoutPolicy: clean(input.checkoutPolicy) || "checkout-link-deferred",
      eligibilityPolicy: clean(input.eligibilityPolicy) || "operator-approval-required",
      customerSafeStatus: clean(input.customerSafeStatus) || "invoice-copy-ready",
      visibility: "internal",
      customerVisible: false,
      livePaymentEnabled: false,
      externalProviderWrite: false,
      storesCredentials: false,
      webhookEnabled: false,
      capturesPayment: false,
      paymentProcessorSchema: "epoch.quote-payment",
      readinessChecks: Array.isArray(input.readinessChecks) ? input.readinessChecks : ["invoice-copy-ready", "operator-approval-required", "no-live-payment"],
      nextActionAt: withTimezone(input.nextActionAt, timezone) || createdAt,
      createdAt,
      updatedAt: createdAt,
      receiptIds: [],
      handoffHistory: [
        {
          action: "create",
          status: clean(input.status) || "planned",
          at: createdAt,
          note: clean(input.note) || "Payment provider handoff created for operator review."
        }
      ],
      notes: clean(input.note) || "Payment provider handoff created for operator review."
    };
    nextData.paymentProviderHandoffs.unshift(handoff);
    return {
      data: nextData,
      records: {
        handoff
      }
    };
  }

  function transitionPaymentProviderHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const updatedAt = withTimezone(now.toISOString(), timezone);
    const handoffId = clean(input.handoffId || input.id);
    const action = clean(input.action) || "verify";
    const note = clean(input.note) || "Payment provider handoff reviewed by operator.";
    const handoff = nextData.paymentProviderHandoffs.find((item) => item.id === handoffId);
    if (!handoff) throw new Error("payment provider handoff not found");

    if (action === "verify") {
      handoff.status = "complete";
      handoff.handoffStatus = "verified-processor-deferred";
    } else if (action === "prepare") {
      handoff.status = "queued";
      handoff.handoffStatus = "invoice-checkout-payload-ready";
    } else if (action === "mark-ready") {
      handoff.status = "queued";
      handoff.handoffStatus = "adapter-ready-without-live-payment";
    } else if (action === "invoice-ready") {
      handoff.status = "queued";
      handoff.syncMode = "invoice-checkout-readiness";
      handoff.handoffStatus = "invoice-review-ready";
      handoff.customerSafeStatus = "invoice-copy-ready";
      handoff.invoicePolicy = "customer-safe-invoice-copy-ready";
      if (!Array.isArray(handoff.readinessChecks)) handoff.readinessChecks = [];
      for (const check of ["invoice-copy-ready", "operator-approval-required", "no-live-payment"]) {
        if (!handoff.readinessChecks.includes(check)) handoff.readinessChecks.push(check);
      }
    } else if (action === "checkout-ready") {
      handoff.status = "queued";
      handoff.syncMode = "invoice-checkout-readiness";
      handoff.handoffStatus = "checkout-review-ready";
      handoff.checkoutPolicy = "checkout-handoff-ready";
      if (!Array.isArray(handoff.readinessChecks)) handoff.readinessChecks = [];
      for (const check of ["checkout-handoff-ready", "operator-approval-required", "no-live-payment"]) {
        if (!handoff.readinessChecks.includes(check)) handoff.readinessChecks.push(check);
      }
    } else if (action === "eligibility-ready") {
      handoff.status = "queued";
      handoff.syncMode = "eligibility-guard-readiness";
      handoff.handoffStatus = "eligibility-review-ready";
      handoff.eligibilityPolicy = "guardian-consent-and-operator-approval";
      if (!Array.isArray(handoff.readinessChecks)) handoff.readinessChecks = [];
      for (const check of ["guardian-consent-gate", "payment-eligibility-rule", "operator-approval-required", "no-live-payment"]) {
        if (!handoff.readinessChecks.includes(check)) handoff.readinessChecks.push(check);
      }
    } else if (action === "block") {
      handoff.status = "blocked";
      handoff.handoffStatus = "blocked";
    } else {
      throw new Error("unsupported payment provider action");
    }

    handoff.visibility = "internal";
    handoff.customerVisible = false;
    handoff.livePaymentEnabled = false;
    handoff.externalProviderWrite = false;
    handoff.storesCredentials = false;
    handoff.webhookEnabled = false;
    handoff.capturesPayment = false;
    handoff.updatedAt = updatedAt;
    handoff.nextActionAt = withTimezone(input.nextActionAt, timezone) || handoff.nextActionAt || updatedAt;
    handoff.notes = note;
    if (!Array.isArray(handoff.handoffHistory)) handoff.handoffHistory = [];
    handoff.handoffHistory.unshift({
      action,
      status: handoff.status,
      at: updatedAt,
      note
    });

    const receiptId = `receipt-payment-provider-${stamp(now)}`;
    if (!Array.isArray(handoff.receiptIds)) handoff.receiptIds = [];
    handoff.receiptIds.unshift(receiptId);
    const healthCheck = {
      id: `monitor-check-payment-provider-${stamp(now)}`,
      actionId: `payment-provider-${action}`,
      receiptId,
      title: `Payment provider ${action}`,
      summary: `${handoff.title}: ${note}`,
      status: handoff.status,
      priority: action === "block" ? "high" : "medium",
      effect: "payment-provider-handoff",
      target: "monitor-payment-provider",
      owner: clean(input.owner) || "Jack",
      createdAt: updatedAt,
      visibility: "internal",
      customerVisible: false
    };
    const receipt = {
      id: receiptId,
      customerId: null,
      kind: "payment-provider-handoff",
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

  function summarizeAuthSessionRoleState(currentData) {
    const data = normalizedOperatingData(currentData);
    const handoffs = data.authSessionRoleHandoffs.map((handoff) => {
      const roleKey = clean(handoff.roleKey) || "role-pending";
      const surface = clean(handoff.surface) || "surface-pending";
      const sessionMode = clean(handoff.sessionMode) || "auth-session-readiness";
      const status = clean(handoff.status) || "planned";
      const visibility = clean(handoff.visibility) || "internal";
      const publicExposure = clean(handoff.publicExposure) || "denied";
      const customerVisible = handoff.customerVisible === true;
      const customerSafe = handoff.customerSafe !== false;
      const rawSurface = handoff.rawSurface === true || ["admin", "monitor"].includes(surface);
      const productionAuthEnabled = handoff.productionAuthEnabled === true;
      const identityProviderWrite = handoff.identityProviderWrite === true;
      const storesCredentials = handoff.storesCredentials === true;
      const storesTokens = handoff.storesTokens === true;
      const oauthClientConfigured = handoff.oauthClientConfigured === true;
      const externalSessionEnabled = handoff.externalSessionEnabled === true;
      const readinessChecks = Array.isArray(handoff.readinessChecks) ? handoff.readinessChecks : [];
      const receiptIds = Array.isArray(handoff.receiptIds) ? handoff.receiptIds : [];
      const handoffHistory = Array.isArray(handoff.handoffHistory) ? handoff.handoffHistory : [];
      const violations = [];

      if (productionAuthEnabled || identityProviderWrite || externalSessionEnabled || oauthClientConfigured) {
        violations.push("Auth/session readiness cannot enable production auth, OAuth clients, external sessions, or identity-provider writes in this slice.");
      }
      if (storesCredentials || storesTokens) {
        violations.push("Auth/session readiness cannot store credentials or tokens in this slice.");
      }
      if (!readinessChecks.includes("no-live-auth")) {
        violations.push("Auth/session readiness must prove no-live-auth.");
      }
      if (surface === "public") {
        if (publicExposure !== "controlled-public" || visibility !== "controlled-public") {
          violations.push("Public auth/session boundary must remain controlled-public intake only.");
        }
        if (!readinessChecks.includes("public-intake-route-only")) {
          violations.push("Public intake readiness must prove route-only public access.");
        }
      }
      if (surface === "student" || roleKey === "customer") {
        if (publicExposure !== "controlled-customer" || visibility !== "controlled-customer" || !customerVisible || !customerSafe) {
          violations.push("Customer auth/session boundary must remain controlled-customer and customer-safe.");
        }
        if (!readinessChecks.includes("controlled-customer-route")) {
          violations.push("Customer readiness must prove a controlled customer route.");
        }
      }
      if (rawSurface) {
        if (publicExposure !== "denied" || visibility !== "internal" || customerVisible || customerSafe) {
          violations.push("Raw admin/monitor auth/session boundaries must stay internal, denied, and not customer-visible.");
        }
        if (!readinessChecks.some((check) => check.includes("denied-public"))) {
          violations.push("Raw auth/session boundary must prove public denial.");
        }
      }
      if (status === "complete" && !receiptIds.length) {
        violations.push("Completed auth/session readiness requires a receipt trail.");
      }

      return {
        id: clean(handoff.id),
        title: clean(handoff.title) || "Auth Session Role Handoff",
        sourceSystem: clean(handoff.sourceSystem) || "EPOCH",
        targetProvider: clean(handoff.targetProvider) || "provider-neutral auth",
        roleKey,
        surface,
        sessionMode,
        status,
        handoffStatus: clean(handoff.handoffStatus) || "pending",
        accessPolicy: clean(handoff.accessPolicy) || "policy-pending",
        visibility,
        publicExposure,
        publicSurface: handoff.publicSurface === true,
        customerVisible,
        customerSafe,
        rawSurface,
        productionAuthEnabled,
        identityProviderWrite,
        storesCredentials,
        storesTokens,
        oauthClientConfigured,
        externalSessionEnabled,
        authSchema: clean(handoff.authSchema) || "epoch.auth-session-role",
        readinessChecks,
        nextActionAt: clean(handoff.nextActionAt),
        updatedAt: clean(handoff.updatedAt),
        receiptIds,
        handoffHistory,
        notes: clean(handoff.notes) || "No auth/session role handoff note recorded.",
        violations
      };
    });
    const violations = handoffs.flatMap((handoff) => handoff.violations.map((detail) => `${handoff.title || handoff.id}: ${detail}`));

    return {
      schema: "epoch.auth-session-role-handoff",
      handoffCount: handoffs.length,
      publicReady: handoffs.filter((item) => item.surface === "public" && item.publicExposure === "controlled-public").length,
      customerReady: handoffs.filter((item) => (item.surface === "student" || item.roleKey === "customer") && item.publicExposure === "controlled-customer").length,
      internalDenied: handoffs.filter((item) => item.rawSurface && item.publicExposure === "denied" && item.visibility === "internal").length,
      noLiveAuth: handoffs.filter((item) => !item.productionAuthEnabled && !item.identityProviderWrite && !item.externalSessionEnabled && !item.oauthClientConfigured && !item.storesCredentials && !item.storesTokens).length,
      queued: handoffs.filter((item) => item.status === "queued").length,
      complete: handoffs.filter((item) => item.status === "complete").length,
      blocked: handoffs.filter((item) => item.status === "blocked").length,
      roleCount: new Set(handoffs.map((item) => item.roleKey).filter(Boolean)).size,
      violations,
      status: violations.length ? "blocked" : "ready",
      handoffs
    };
  }

  function createAuthSessionRoleHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const createdAt = withTimezone(now.toISOString(), timezone);
    const surface = clean(input.surface) || "admin";
    const rawSurface = input.rawSurface === true || ["admin", "monitor"].includes(surface);
    const publicExposure = clean(input.publicExposure) || (surface === "public" ? "controlled-public" : surface === "student" ? "controlled-customer" : "denied");
    const visibility = clean(input.visibility) || (publicExposure === "controlled-public" ? "controlled-public" : publicExposure === "controlled-customer" ? "controlled-customer" : "internal");
    const handoff = {
      id: clean(input.id) || `auth-session-role-${stamp(now)}`,
      title: clean(input.title) || "Auth Session Role Handoff",
      sourceSystem: "EPOCH",
      targetProvider: clean(input.targetProvider) || "provider-neutral auth",
      roleKey: clean(input.roleKey) || (surface === "student" ? "customer" : surface),
      surface,
      sessionMode: clean(input.sessionMode) || "auth-session-readiness",
      status: clean(input.status) || "planned",
      handoffStatus: clean(input.handoffStatus) || "provider-deferred",
      accessPolicy: clean(input.accessPolicy) || "provider-neutral-auth-deferred",
      visibility,
      publicExposure,
      publicSurface: surface === "public",
      customerVisible: publicExposure === "controlled-customer",
      customerSafe: !rawSurface,
      rawSurface,
      productionAuthEnabled: false,
      identityProviderWrite: false,
      storesCredentials: false,
      storesTokens: false,
      oauthClientConfigured: false,
      externalSessionEnabled: false,
      authSchema: "epoch.auth-session-role",
      readinessChecks: Array.isArray(input.readinessChecks) ? input.readinessChecks : ["operator-approval-required", "no-live-auth"],
      nextActionAt: withTimezone(input.nextActionAt, timezone) || createdAt,
      createdAt,
      updatedAt: createdAt,
      receiptIds: [],
      handoffHistory: [
        {
          action: "create",
          status: clean(input.status) || "planned",
          at: createdAt,
          note: clean(input.note) || "Auth/session role handoff created for operator review."
        }
      ],
      notes: clean(input.note) || "Auth/session role handoff created for operator review."
    };
    nextData.authSessionRoleHandoffs.unshift(handoff);
    return {
      data: nextData,
      records: {
        handoff
      }
    };
  }

  function transitionAuthSessionRoleHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const updatedAt = withTimezone(now.toISOString(), timezone);
    const handoffId = clean(input.handoffId || input.id);
    const action = clean(input.action) || "verify";
    const note = clean(input.note) || "Auth/session role handoff reviewed by operator.";
    const handoff = nextData.authSessionRoleHandoffs.find((item) => item.id === handoffId);
    if (!handoff) throw new Error("auth/session role handoff not found");

    if (!Array.isArray(handoff.readinessChecks)) handoff.readinessChecks = [];
    const ensureChecks = (checks) => {
      for (const check of checks) {
        if (!handoff.readinessChecks.includes(check)) handoff.readinessChecks.push(check);
      }
    };

    if (action === "verify") {
      handoff.status = "complete";
      handoff.handoffStatus = "verified-provider-deferred";
      ensureChecks(["operator-approval-required", "no-live-auth"]);
    } else if (action === "prepare") {
      handoff.status = "queued";
      handoff.handoffStatus = "session-policy-ready";
      ensureChecks(["operator-approval-required", "no-live-auth"]);
    } else if (action === "mark-ready") {
      handoff.status = "queued";
      handoff.handoffStatus = "auth-boundary-ready-without-live-provider";
      ensureChecks(["operator-approval-required", "no-live-auth"]);
    } else if (action === "public-ready") {
      handoff.status = "queued";
      handoff.surface = "public";
      handoff.roleKey = "public-intake";
      handoff.sessionMode = "public-intake-readiness";
      handoff.accessPolicy = "controlled-public-intake-only";
      handoff.visibility = "controlled-public";
      handoff.publicExposure = "controlled-public";
      handoff.publicSurface = true;
      handoff.customerVisible = false;
      handoff.customerSafe = true;
      handoff.rawSurface = false;
      handoff.handoffStatus = "public-intake-ready";
      ensureChecks(["public-intake-route-only", "customer-safe-copy", "operator-approval-required", "no-live-auth"]);
    } else if (action === "customer-ready") {
      handoff.status = "queued";
      handoff.surface = "student";
      handoff.roleKey = "customer";
      handoff.sessionMode = "customer-session-readiness";
      handoff.accessPolicy = "controlled-customer-status-only";
      handoff.visibility = "controlled-customer";
      handoff.publicExposure = "controlled-customer";
      handoff.publicSurface = false;
      handoff.customerVisible = true;
      handoff.customerSafe = true;
      handoff.rawSurface = false;
      handoff.handoffStatus = "customer-status-ready";
      ensureChecks(["controlled-customer-route", "customer-safe-status-only", "operator-approval-required", "no-live-auth"]);
    } else if (action === "deny-raw") {
      handoff.status = "complete";
      handoff.visibility = "internal";
      handoff.publicExposure = "denied";
      handoff.publicSurface = false;
      handoff.customerVisible = false;
      handoff.customerSafe = false;
      handoff.rawSurface = true;
      handoff.handoffStatus = "raw-surface-denied";
      ensureChecks(["admin-denied-public", "monitor-denied-public", "operator-only", "no-live-auth"]);
    } else if (action === "block") {
      handoff.status = "blocked";
      handoff.handoffStatus = "blocked";
      ensureChecks(["operator-approval-required", "no-live-auth"]);
    } else {
      throw new Error("unsupported auth/session role action");
    }

    handoff.productionAuthEnabled = false;
    handoff.identityProviderWrite = false;
    handoff.storesCredentials = false;
    handoff.storesTokens = false;
    handoff.oauthClientConfigured = false;
    handoff.externalSessionEnabled = false;
    handoff.authSchema = "epoch.auth-session-role";
    handoff.updatedAt = updatedAt;
    handoff.nextActionAt = withTimezone(input.nextActionAt, timezone) || handoff.nextActionAt || updatedAt;
    handoff.notes = note;
    if (!Array.isArray(handoff.handoffHistory)) handoff.handoffHistory = [];
    handoff.handoffHistory.unshift({
      action,
      status: handoff.status,
      at: updatedAt,
      note
    });

    const receiptId = `receipt-auth-session-role-${stamp(now)}`;
    if (!Array.isArray(handoff.receiptIds)) handoff.receiptIds = [];
    handoff.receiptIds.unshift(receiptId);
    const healthCheck = {
      id: `monitor-check-auth-session-role-${stamp(now)}`,
      actionId: `auth-session-role-${action}`,
      receiptId,
      title: `Auth/session role ${action}`,
      summary: `${handoff.title}: ${note}`,
      status: handoff.status,
      priority: action === "block" ? "high" : "medium",
      effect: "auth-session-role-handoff",
      target: "monitor-auth-session",
      owner: clean(input.owner) || "Jack",
      createdAt: updatedAt,
      visibility: "internal",
      customerVisible: false
    };
    const receipt = {
      id: receiptId,
      customerId: null,
      kind: "auth-session-role-handoff",
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

  function addCustomerHistoryEvent(events, customer, details) {
    const sourceKind = clean(details.sourceKind) || "account";
    const sourceId = clean(details.sourceId) || customer.id;
    const occurredAt = clean(details.occurredAt || details.updatedAt || details.createdAt || details.dueAt || details.nextActionAt || details.startAt);
    events.push({
      id: clean(details.id) || `account-history-${customer.id}-${sourceKind}-${sourceId}`,
      customerId: customer.id,
      sourceKind,
      sourceId,
      title: clean(details.title) || "Account history event",
      summary: clean(details.summary) || clean(details.note) || "Customer-safe account event recorded.",
      status: clean(details.status) || "complete",
      occurredAt,
      customerVisible: details.customerVisible === true,
      operatorVisible: details.operatorVisible !== false,
      customerSafe: details.customerSafe !== false,
      receiptId: clean(details.receiptId) || null
    });
  }

  function dedupeCustomerHistoryEvents(events) {
    const byKey = new Map();
    for (const event of events) {
      const key = `${event.sourceKind}:${event.sourceId}:${event.title}`;
      if (!byKey.has(key)) byKey.set(key, event);
    }
    return Array.from(byKey.values())
      .sort((a, b) => String(b.occurredAt || "").localeCompare(String(a.occurredAt || "")));
  }

  function relatedCustomerRecords(data, customer) {
    const submissions = data.submissions.filter((item) => item.customerId === customer.id);
    const submissionIds = new Set(submissions.map((item) => item.id));
    const assignmentIds = new Set(submissions.map((item) => item.assignmentId).filter(Boolean));
    const assignments = data.assignments.filter((item) => item.customerId === customer.id || assignmentIds.has(item.id));
    for (const assignment of assignments) {
      if (assignment.id) assignmentIds.add(assignment.id);
    }
    const cohortIds = new Set(assignments.map((item) => item.cohortId).filter(Boolean));
    const sessions = data.sessions.filter((item) => item.customerId === customer.id || assignmentIds.has(item.assignmentId) || cohortIds.has(item.cohortId));
    for (const session of sessions) {
      if (session.cohortId) cohortIds.add(session.cohortId);
    }
    const cohorts = data.cohorts.filter((item) => cohortIds.has(item.id));
    const reviews = data.reviews.filter((item) => submissionIds.has(item.submissionId));
    const receipts = data.receipts.filter((item) => item.customerId === customer.id);
    const followups = data.followups.filter((item) => item.customerId === customer.id);
    const notificationEvents = data.notificationEvents.filter((item) => item.customerId === customer.id);
    const notificationDeliveries = (data.notificationDeliveries || []).filter((item) => item.customerId === customer.id);
    const quotes = (data.quotes || []).filter((item) => item.customerId === customer.id);
    const engagements = (data.engagements || []).filter((item) => item.customerId === customer.id);
    const workPlans = (data.workPlans || []).filter((item) => item.customerId === customer.id);
    const agentHandoffs = (data.agentHandoffs || []).filter((item) => item.customerId === customer.id);
    return { assignments, cohorts, sessions, submissions, reviews, receipts, followups, notificationEvents, notificationDeliveries, quotes, engagements, workPlans, agentHandoffs };
  }

  function buildCustomerAccountHistoryEntries(data, customer) {
    const records = relatedCustomerRecords(data, customer);
    const events = [];
    addCustomerHistoryEvent(events, customer, {
      sourceKind: "account-status",
      sourceId: customer.id,
      title: "Current customer status",
      summary: customer.externalStatus,
      status: "complete",
      customerVisible: true,
      occurredAt: customer.updatedAt || customer.createdAt || ""
    });
    for (const assignment of records.assignments) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "assignment",
        sourceId: assignment.id,
        title: assignment.title,
        summary: assignment.summary || `Request status: ${assignment.status}`,
        status: assignment.status,
        customerVisible: assignment.externalVisible === true,
        occurredAt: assignment.dueAt || assignment.createdAt
      });
    }
    for (const cohort of records.cohorts) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "cohort",
        sourceId: cohort.id,
        title: cohort.name,
        summary: `Cohort lane status: ${cohort.status}`,
        status: cohort.status,
        customerVisible: false,
        occurredAt: cohort.startAt
      });
    }
    for (const session of records.sessions) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "session",
        sourceId: session.id,
        title: session.title,
        summary: `Session ${session.status}; ${scheduleWindowText(session.startAt)} to ${scheduleWindowText(session.endAt)}.`,
        status: session.status,
        customerVisible: true,
        occurredAt: session.startAt
      });
    }
    for (const submission of records.submissions) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "submission",
        sourceId: submission.id,
        title: submission.title || "Submitted work",
        summary: submission.summary || `Submission status: ${submission.status}`,
        status: submission.status,
        customerVisible: true,
        occurredAt: submission.submittedAt || submission.reviewDueAt
      });
    }
    for (const review of records.reviews) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "review",
        sourceId: review.id,
        title: "Review record",
        summary: review.summary,
        status: review.status,
        customerVisible: review.status === "returned",
        occurredAt: review.returnedAt
      });
    }
    for (const update of records.notificationEvents) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "customer-update",
        sourceId: update.id,
        title: update.title,
        summary: update.summary,
        status: update.outboxStatus || update.deliveryStatus || update.status || "queued",
        customerVisible: update.visible === true,
        occurredAt: update.deliverAfterAt || update.createdAt
      });
    }
    for (const delivery of records.notificationDeliveries) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "delivery",
        sourceId: delivery.id,
        title: delivery.title,
        summary: delivery.lastNote || delivery.summary,
        status: delivery.status,
        customerVisible: delivery.customerVisible === true,
        occurredAt: delivery.nextActionAt || delivery.createdAt
      });
    }
    for (const quote of records.quotes) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "quote",
        sourceId: quote.id,
        title: quote.title,
        summary: quote.customerSafeStatus || quote.summary,
        status: quote.status,
        customerVisible: quote.customerVisible === true,
        occurredAt: quote.updatedAt || quote.createdAt
      });
    }
    for (const engagement of records.engagements) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "engagement",
        sourceId: engagement.id,
        title: engagement.title || "Accepted service",
        summary: engagement.summary || `Engagement status: ${engagement.status}`,
        status: engagement.status,
        customerVisible: false,
        occurredAt: engagement.startAt || engagement.createdAt
      });
    }
    for (const workPlan of records.workPlans) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "work-plan",
        sourceId: workPlan.id,
        title: workPlan.title,
        summary: workPlan.summary || "Operator-approved work plan record.",
        status: workPlan.status,
        customerVisible: workPlan.customerVisible === true,
        occurredAt: workPlan.dueAt || workPlan.createdAt
      });
    }
    for (const handoff of records.agentHandoffs) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "agent-handoff",
        sourceId: handoff.id,
        title: handoff.title,
        summary: handoff.lastNote || handoff.rollbackRule || "Internal handoff record.",
        status: handoff.status,
        customerVisible: handoff.customerVisible === true,
        occurredAt: handoff.nextActionAt || handoff.createdAt
      });
    }
    for (const followup of records.followups) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "followup",
        sourceId: followup.id,
        title: followup.title,
        summary: `Follow-up status: ${followup.status}`,
        status: followup.status,
        customerVisible: false,
        occurredAt: followup.nextActionAt
      });
    }
    for (const receipt of records.receipts) {
      addCustomerHistoryEvent(events, customer, {
        sourceKind: "receipt",
        sourceId: receipt.id,
        title: receipt.kind,
        summary: receipt.note,
        status: receipt.status,
        customerVisible: false,
        occurredAt: receipt.createdAt,
        receiptId: receipt.id
      });
    }
    return dedupeCustomerHistoryEvents(events);
  }

  function buildCustomerAccountHistorySnapshot(data, customer, existing = {}) {
    const entries = buildCustomerAccountHistoryEntries(data, customer);
    const existingTimeline = Array.isArray(existing.statusTimeline) ? existing.statusTimeline : null;
    const statusTimeline = existingTimeline || entries.slice(0, 10);
    const receiptIds = Array.from(new Set([
      ...statusTimeline.map((entry) => entry.receiptId).filter(Boolean),
      ...(Array.isArray(existing.receiptIds) ? existing.receiptIds : [])
    ]));
    const sourceKinds = Array.from(new Set(statusTimeline.map((entry) => entry.sourceKind).filter(Boolean)));
    const serviceSourceKinds = ["assignment", "engagement", "work-plan", "agent-handoff"];
    const eventCounts = {
      total: statusTimeline.length,
      customerVisible: statusTimeline.filter((entry) => entry.customerVisible).length,
      operatorOnly: statusTimeline.filter((entry) => !entry.customerVisible).length,
      submissions: statusTimeline.filter((entry) => entry.sourceKind === "submission").length,
      cohorts: statusTimeline.filter((entry) => entry.sourceKind === "cohort").length,
      serviceRecords: statusTimeline.filter((entry) => serviceSourceKinds.includes(entry.sourceKind)).length,
      receipts: receiptIds.length
    };
    const guardrails = Array.isArray(existing.guardrails) && existing.guardrails.length
      ? existing.guardrails
      : [
        "controlled-customer-status-only",
        "no-live-provider-write",
        "no-customer-send",
        "no-secret-material",
        "no-raw-monitor"
      ];
    return {
      id: clean(existing.id) || `account-history-${customer.id}`,
      customerId: customer.id,
      displayName: customer.displayName,
      trackId: customer.trackId || null,
      packageId: customer.packageId || null,
      gameplanId: customer.gameplanId || null,
      ageBand: customer.ageBand || null,
      status: clean(existing.status) || "complete",
      visibility: clean(existing.visibility) || "controlled-customer",
      customerSafe: existing.customerSafe === undefined ? true : existing.customerSafe === true,
      operatorVisible: existing.operatorVisible !== false,
      customerVisible: existing.customerVisible !== false,
      localOnly: existing.localOnly === undefined ? true : existing.localOnly === true,
      liveProviderWrite: existing.liveProviderWrite === true,
      externalNotification: existing.externalNotification === true,
      productionEnabled: existing.productionEnabled === true,
      customerSafeSummary: clean(customer.externalStatus) || clean(existing.customerSafeSummary) || "Customer-safe status is pending.",
      operatorSummary: clean(existing.operatorSummary) || `${customer.displayName} has ${entries.length} linked account-history event${entries.length === 1 ? "" : "s"} across ${sourceKinds.join(", ") || "account status"}.`,
      sourceKinds,
      eventCounts,
      statusTimeline,
      receiptIds,
      guardrails,
      reviewedAt: clean(existing.reviewedAt) || null,
      updatedAt: entries[0]?.occurredAt || clean(existing.updatedAt) || null
    };
  }

  function reconcileCustomerAccountHistories(data) {
    const existingByCustomer = new Map((data.customerAccountHistories || []).map((item) => [item.customerId, item]));
    return (data.customers || []).map((customer) => buildCustomerAccountHistorySnapshot(data, customer, existingByCustomer.get(customer.id) || {}));
  }

  function summarizeCustomerAccountHistoryState(currentData) {
    const data = normalizedOperatingData(currentData);
    const histories = data.customerAccountHistories.map((history) => {
      const entries = Array.isArray(history.statusTimeline) ? history.statusTimeline : [];
      const violations = [];
      if (!clean(history.customerId)) violations.push("Account history record is missing customerId.");
      if (!data.customers.some((customer) => customer.id === history.customerId)) violations.push("Account history record is not linked to a known customer.");
      if (!["controlled-customer", "internal"].includes(clean(history.visibility))) violations.push("Account history visibility must be controlled-customer or internal.");
      if (history.customerSafe !== true) violations.push("Account history must be marked customer-safe.");
      if (history.localOnly !== true) violations.push("Account history must remain local-only until account auth is implemented.");
      if (history.liveProviderWrite || history.externalNotification || history.productionEnabled) violations.push("Account history must not enable live provider writes, sends, or production integration.");
      if (!entries.length) violations.push("Account history must retain at least one status timeline event.");
      if (!Array.isArray(history.guardrails) || !history.guardrails.includes("controlled-customer-status-only")) violations.push("Account history guardrails must include controlled-customer-status-only.");
      if (!entries.every((entry) => entry.customerSafe !== false)) violations.push("Account history timeline contains a non-customer-safe event.");
      const forbiddenText = stableStringify(entries).toLowerCase();
      if (forbiddenText.includes("secret") || forbiddenText.includes("oauth") || forbiddenText.includes("token")) violations.push("Account history timeline must not expose secret, OAuth, or token material.");
      return {
        ...history,
        eventCount: entries.length,
        customerVisibleEvents: entries.filter((entry) => entry.customerVisible).length,
        operatorOnlyEvents: entries.filter((entry) => !entry.customerVisible).length,
        receiptCount: Array.isArray(history.receiptIds) ? history.receiptIds.length : 0,
        submissionEvents: entries.filter((entry) => entry.sourceKind === "submission").length,
        cohortEvents: entries.filter((entry) => entry.sourceKind === "cohort").length,
        serviceEvents: entries.filter((entry) => ["assignment", "engagement", "work-plan", "agent-handoff"].includes(entry.sourceKind)).length,
        violations
      };
    });
    const violations = histories.flatMap((history) => history.violations.map((violation) => `${history.id}: ${violation}`));
    return {
      schema: "epoch.customer-account-history",
      historyCount: histories.length,
      customerCount: data.customers.length,
      linkedCustomers: histories.filter((history) => data.customers.some((customer) => customer.id === history.customerId)).length,
      timelineEvents: histories.reduce((sum, history) => sum + history.eventCount, 0),
      customerVisibleEvents: histories.reduce((sum, history) => sum + history.customerVisibleEvents, 0),
      operatorOnlyEvents: histories.reduce((sum, history) => sum + history.operatorOnlyEvents, 0),
      receiptLinked: histories.filter((history) => history.receiptCount > 0).length,
      submissionLinked: histories.filter((history) => history.submissionEvents > 0).length,
      cohortLinked: histories.filter((history) => history.cohortEvents > 0).length,
      serviceLinked: histories.filter((history) => history.serviceEvents > 0).length,
      localOnly: histories.filter((history) => history.localOnly === true).length,
      customerSafe: histories.filter((history) => history.customerSafe === true).length,
      status: violations.length ? "blocked" : "ready",
      violations,
      histories
    };
  }

  function createCustomerAccountHistoryRecords(currentData, input = {}, options = {}) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const customer = customerById(nextData, clean(input.customerId)) || nextData.customers[0];
    if (!customer) throw new Error("customerId is required");
    const existing = nextData.customerAccountHistories.find((item) => item.customerId === customer.id) || {};
    const history = buildCustomerAccountHistorySnapshot(nextData, customer, {
      id: existing.id,
      receiptIds: existing.receiptIds,
      status: clean(input.status) || existing.status || "complete",
      visibility: "controlled-customer",
      customerSafe: true,
      operatorVisible: true,
      customerVisible: true,
      localOnly: true,
      liveProviderWrite: false,
      externalNotification: false,
      productionEnabled: false,
      reviewedAt: withTimezone(input.reviewedAt, timezone) || withTimezone(now.toISOString(), timezone),
      operatorSummary: clean(input.operatorSummary) || existing.operatorSummary
    });
    const receipt = {
      id: `receipt-account-history-${stamp(now)}`,
      customerId: customer.id,
      kind: "customer-account-history",
      status: "complete",
      createdAt: withTimezone(now.toISOString(), timezone),
      note: clean(input.note) || `${customer.displayName} account history refreshed as a controlled customer-safe local record.`
    };
    history.receiptIds = Array.from(new Set([...(history.receiptIds || []), receipt.id]));
    nextData.customerAccountHistories = nextData.customerAccountHistories.filter((item) => item.customerId !== customer.id);
    nextData.customerAccountHistories.unshift(history);
    nextData.receipts.unshift(receipt);
    return {
      data: nextData,
      records: {
        customer,
        history,
        receipt
      }
    };
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

  function summarizeMarketingConversionState(currentData) {
    const data = normalizedOperatingData(currentData);
    const routesById = new Map(data.campaignRoutes.map((route) => [clean(route.id), route]));
    const events = data.marketingConversionEvents.map((event) => {
      const route = routesById.get(clean(event.campaignRouteId));
      const eventType = clean(event.eventType) || clean(event.primaryConversion) || "conversion-pending";
      const status = clean(event.status) || "planned";
      const readinessStatus = clean(event.readinessStatus) || "provider-deferred";
      const readinessChecks = Array.isArray(event.readinessChecks) ? event.readinessChecks : [];
      const monitorKpis = Array.isArray(event.monitorKpis) ? event.monitorKpis : [];
      const receiptIds = Array.isArray(event.receiptIds) ? event.receiptIds : [];
      const livePixelEnabled = event.livePixelEnabled === true;
      const externalAdApiWrite = event.externalAdApiWrite === true;
      const invasiveTracking = event.invasiveTracking === true;
      const storesPersonalData = event.storesPersonalData === true;
      const productionAnalyticsCredential = event.productionAnalyticsCredential === true;
      const webhookEnabled = event.webhookEnabled === true;
      const crossSiteIdentifier = event.crossSiteIdentifier === true;
      const audienceTier = clean(event.audienceTier || route?.audienceTier) || "19plus";
      const violations = [];

      if (!route) {
        violations.push("Marketing conversion event must reference a campaign route.");
      }
      if (livePixelEnabled || externalAdApiWrite || productionAnalyticsCredential || webhookEnabled) {
        violations.push("Marketing conversion readiness cannot enable live pixels, ad API writes, analytics credentials, or webhooks.");
      }
      if (invasiveTracking || storesPersonalData || crossSiteIdentifier) {
        violations.push("Marketing conversion readiness must avoid invasive tracking, personal-data storage, and cross-site identifiers.");
      }
      for (const required of ["no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"]) {
        if (!readinessChecks.includes(required)) {
          violations.push(`Marketing conversion readiness must include ${required}.`);
        }
      }
      if (audienceTier === "under19") {
        if (!readinessChecks.includes("guardian-consent-required") || !readinessChecks.includes("no-paid-action-before-consent")) {
          violations.push("Under-19 marketing conversion readiness must preserve guardian consent and no paid action before consent.");
        }
      }
      if (!monitorKpis.length) {
        violations.push("Marketing conversion event must expose at least one monitor KPI.");
      }

      return {
        id: clean(event.id),
        title: clean(event.title) || "Marketing Conversion Event",
        campaignRouteId: clean(event.campaignRouteId),
        campaignId: clean(event.campaignId || route?.campaignId),
        routeKey: clean(event.routeKey || route?.routeKey),
        regionScope: clean(event.regionScope || route?.regionScope) || "jp",
        sourceChannel: clean(event.sourceChannel || route?.channel) || "channel pending",
        offerBundle: clean(event.offerBundle || route?.offerBundle) || "offer-pending",
        audienceTier,
        eventType,
        conversionStage: clean(event.conversionStage) || "readiness",
        primaryConversion: clean(event.primaryConversion || route?.primaryConversion) || eventType,
        status,
        readinessStatus,
        conversionValueJpy: Number(event.conversionValueJpy || 0),
        publicMetric: event.publicMetric === true,
        customerVisible: event.customerVisible === true,
        customerSafe: event.customerSafe !== false,
        localOnly: event.localOnly !== false,
        livePixelEnabled,
        externalAdApiWrite,
        invasiveTracking,
        storesPersonalData,
        productionAnalyticsCredential,
        webhookEnabled,
        crossSiteIdentifier,
        analyticsProvider: clean(event.analyticsProvider) || "provider-neutral ledger",
        attributionPolicy: clean(event.attributionPolicy) || "first-party-route-key-only",
        copyPolicy: clean(event.copyPolicy || route?.copyPolicy) || "copy-policy-pending",
        readinessChecks,
        monitorKpis,
        nextActionAt: clean(event.nextActionAt),
        occurredAt: clean(event.occurredAt),
        createdAt: clean(event.createdAt),
        updatedAt: clean(event.updatedAt),
        receiptIds,
        notes: clean(event.notes) || "No marketing conversion note recorded.",
        routeStatus: clean(route?.status || route?.readinessStatus) || "missing-route",
        violations
      };
    });
    const violationList = events.flatMap((event) => event.violations.map((violation) => `${event.title}: ${violation}`));
    const conversionStatuses = new Set(["recorded", "complete", "qualified", "converted"]);

    return {
      eventCount: events.length,
      readyEvents: events.filter((event) => ["ready", "kpi-ready", "provider-deferred", "guardian-gated"].includes(event.readinessStatus)).length,
      recordedEvents: events.filter((event) => conversionStatuses.has(event.status)).length,
      highIntentEvents: events.filter((event) => ["high-intent", "qualified", "converted", "guarded-intake"].includes(event.conversionStage)).length,
      jpEvents: events.filter((event) => event.regionScope === "jp").length,
      globalEvents: events.filter((event) => event.regionScope === "global").length,
      dualEvents: events.filter((event) => event.regionScope === "dual").length,
      under19GuardedEvents: events.filter((event) => event.audienceTier === "under19" && event.readinessChecks.includes("guardian-consent-required")).length,
      noLiveTracking: events.filter((event) => !event.livePixelEnabled && !event.externalAdApiWrite && !event.invasiveTracking && !event.storesPersonalData && !event.productionAnalyticsCredential && !event.webhookEnabled && !event.crossSiteIdentifier).length,
      providerDeferred: events.filter((event) => event.analyticsProvider === "provider-neutral ledger").length,
      potentialValueJpy: events.reduce((sum, event) => sum + event.conversionValueJpy, 0),
      eventTypes: events.reduce((memo, event) => {
        memo[event.eventType] = (memo[event.eventType] || 0) + 1;
        return memo;
      }, {}),
      status: violationList.length ? "blocked" : "ready",
      violations: violationList,
      events
    };
  }

  function createMarketingConversionEventRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const nowText = withTimezone(now.toISOString(), nextData.timezone || "Asia/Tokyo");
    const route = nextData.campaignRoutes.find((item) => clean(item.id) === clean(input.campaignRouteId))
      || nextData.campaignRoutes.find((item) => clean(item.routeKey) === clean(input.routeKey))
      || nextData.campaignRoutes[0];
    if (!route) throw new Error("Create a campaign route before creating marketing conversion readiness.");
    const eventType = clean(input.eventType || route.primaryConversion) || "conversion_readiness";
    const event = {
      id: `conversion-${stamp(now)}-${nextData.marketingConversionEvents.length + 1}`,
      title: clean(input.title) || `${clean(route.name) || "Campaign"} ${eventType} KPI`,
      campaignRouteId: clean(route.id),
      campaignId: clean(route.campaignId),
      routeKey: clean(route.routeKey),
      regionScope: clean(route.regionScope),
      sourceChannel: clean(input.sourceChannel || route.channel),
      offerBundle: clean(route.offerBundle),
      audienceTier: clean(route.audienceTier) || "19plus",
      eventType,
      conversionStage: clean(input.conversionStage) || "readiness",
      primaryConversion: clean(input.primaryConversion || route.primaryConversion || eventType),
      status: clean(input.status) || "planned",
      readinessStatus: clean(input.readinessStatus) || "provider-deferred",
      conversionValueJpy: Number(input.conversionValueJpy || 0),
      publicMetric: input.publicMetric === true || input.publicMetric === "true",
      customerVisible: false,
      customerSafe: true,
      localOnly: true,
      livePixelEnabled: false,
      externalAdApiWrite: false,
      invasiveTracking: false,
      storesPersonalData: false,
      productionAnalyticsCredential: false,
      webhookEnabled: false,
      crossSiteIdentifier: false,
      analyticsProvider: "provider-neutral ledger",
      attributionPolicy: "first-party-route-key-only",
      copyPolicy: clean(input.copyPolicy || route.copyPolicy),
      readinessChecks: ["route-key-preserved", "primary-conversion-defined", "no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"],
      monitorKpis: Array.isArray(route.monitorKpis) ? route.monitorKpis.slice(0, 4) : ["Route Health"],
      nextActionAt: withTimezone(input.nextActionAt, nextData.timezone || "Asia/Tokyo") || nowText,
      occurredAt: clean(input.occurredAt) ? withTimezone(input.occurredAt, nextData.timezone || "Asia/Tokyo") : "",
      createdAt: nowText,
      updatedAt: nowText,
      receiptIds: [],
      notes: clean(input.note) || "Marketing conversion KPI readiness created without live pixels or external analytics writes."
    };
    if (event.audienceTier === "under19") {
      event.readinessChecks.push("guardian-consent-required", "no-paid-action-before-consent");
    }
    const receipt = {
      id: `receipt-marketing-conversion-${stamp(now)}`,
      kind: "marketing-conversion",
      status: "complete",
      createdAt: nowText,
      note: `${event.title}: local KPI readiness created with provider-neutral attribution.`
    };
    event.receiptIds.push(receipt.id);
    nextData.marketingConversionEvents.unshift(event);
    nextData.receipts.unshift(receipt);
    return {
      data: nextData,
      records: {
        event,
        receipt
      }
    };
  }

  function transitionMarketingConversionEventRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const nowText = withTimezone(now.toISOString(), nextData.timezone || "Asia/Tokyo");
    const event = nextData.marketingConversionEvents.find((item) => clean(item.id) === clean(input.eventId));
    if (!event) throw new Error("Select a marketing conversion event before applying an action.");
    const action = clean(input.action) || "verify";
    const note = clean(input.note) || "Marketing conversion readiness reviewed.";
    const ensureChecks = (checks) => {
      event.readinessChecks = Array.isArray(event.readinessChecks) ? event.readinessChecks : [];
      for (const check of checks) {
        if (!event.readinessChecks.includes(check)) event.readinessChecks.push(check);
      }
    };

    if (action === "verify") {
      event.status = "complete";
      event.readinessStatus = "kpi-ready";
      event.conversionStage = event.conversionStage || "readiness";
      ensureChecks(["route-key-preserved", "primary-conversion-defined"]);
    } else if (action === "record-view") {
      event.status = "recorded";
      event.eventType = event.eventType || "offer_view";
      event.conversionStage = "awareness";
      event.occurredAt = nowText;
      ensureChecks(["route-key-preserved"]);
    } else if (action === "record-conversion") {
      event.status = "converted";
      event.conversionStage = "converted";
      event.occurredAt = nowText;
      ensureChecks(["route-key-preserved", "primary-conversion-defined"]);
    } else if (action === "qualify") {
      event.status = "qualified";
      event.conversionStage = "qualified";
      event.readinessStatus = "kpi-ready";
      ensureChecks(["route-key-preserved", "primary-conversion-defined"]);
    } else if (action === "block") {
      event.status = "blocked";
      event.readinessStatus = "blocked";
    } else {
      event.status = action;
    }

    ensureChecks(["no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"]);
    if (clean(event.audienceTier) === "under19") {
      ensureChecks(["guardian-consent-required", "no-paid-action-before-consent"]);
    }
    event.localOnly = true;
    event.customerVisible = false;
    event.customerSafe = true;
    event.livePixelEnabled = false;
    event.externalAdApiWrite = false;
    event.invasiveTracking = false;
    event.storesPersonalData = false;
    event.productionAnalyticsCredential = false;
    event.webhookEnabled = false;
    event.crossSiteIdentifier = false;
    event.analyticsProvider = "provider-neutral ledger";
    event.attributionPolicy = "first-party-route-key-only";
    event.updatedAt = nowText;
    event.notes = note;

    const receipt = {
      id: `receipt-marketing-conversion-${stamp(now)}`,
      kind: "marketing-conversion",
      status: event.status === "blocked" ? "blocked" : "complete",
      createdAt: nowText,
      note: `${event.title}: ${action} recorded without live pixels or external ad writes. ${note}`
    };
    const healthCheck = {
      id: `monitor-check-marketing-conversion-${stamp(now)}`,
      title: "Marketing Conversion KPI Readiness",
      status: event.status === "blocked" ? "blocked" : "complete",
      target: "monitor-marketing-conversions",
      effect: "marketing-conversion-readiness",
      createdAt: nowText,
      summary: `${event.title} is ${event.readinessStatus}; attribution remains first-party and provider-neutral.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };

    event.receiptIds = Array.isArray(event.receiptIds) ? event.receiptIds : [];
    event.receiptIds.push(receipt.id);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        event,
        receipt,
        healthCheck
      }
    };
  }

  function summarizeProviderAdapterSelectionState(currentData) {
    const data = normalizedOperatingData(currentData);
    const requiredBaseChecks = ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes"];
    const familyChecks = {
      calendar: ["no-live-sync"],
      notification: ["no-live-send", "consent-boundary-required"],
      payment: ["no-payment-capture", "legal-review-required", "consent-boundary-required"],
      "auth-session": ["no-live-auth", "raw-monitor-denied-public", "raw-admin-denied-public"],
      "analytics-advertising": ["no-live-pixel", "no-external-ad-api-write", "no-invasive-tracking", "legal-review-required", "consent-boundary-required"],
      "durable-persistence": ["backup-plan-required", "recovery-plan-required"]
    };
    const candidates = data.providerAdapterCandidates.map((candidate) => {
      const providerFamily = clean(candidate.providerFamily) || "provider";
      const status = clean(candidate.status) || "planned";
      const readinessStatus = clean(candidate.readinessStatus) || "go-no-go-ready";
      const goNoGoState = clean(candidate.goNoGoState) || "deferred";
      const readinessChecks = Array.isArray(candidate.readinessChecks) ? candidate.readinessChecks : [];
      const sourceHandoffIds = Array.isArray(candidate.sourceHandoffIds) ? candidate.sourceHandoffIds : [];
      const receiptIds = Array.isArray(candidate.receiptIds) ? candidate.receiptIds : [];
      const goCriteria = Array.isArray(candidate.goCriteria) ? candidate.goCriteria : [];
      const blockers = Array.isArray(candidate.blockers) ? candidate.blockers : [];
      const liveApiCalls = candidate.liveApiCalls === true;
      const productionEnabled = candidate.productionEnabled === true;
      const secretsPresent = candidate.secretsPresent === true;
      const credentialsStored = candidate.credentialsStored === true;
      const oauthConfigured = candidate.oauthConfigured === true;
      const webhookEnabled = candidate.webhookEnabled === true;
      const externalProviderWrite = candidate.externalProviderWrite === true;
      const customerVisible = candidate.customerVisible === true;
      const violations = [];

      if (liveApiCalls || productionEnabled || externalProviderWrite) {
        violations.push("Provider adapter candidate cannot enable live API calls, production behavior, or provider writes.");
      }
      if (secretsPresent || credentialsStored || oauthConfigured || webhookEnabled) {
        violations.push("Provider adapter candidate cannot store secrets, credentials, OAuth clients, or webhooks.");
      }
      if (customerVisible) {
        violations.push("Provider adapter readiness must remain internal and not customer-visible.");
      }
      for (const required of requiredBaseChecks.concat(familyChecks[providerFamily] || [])) {
        if (!readinessChecks.includes(required)) {
          violations.push(`Provider adapter readiness must include ${required}.`);
        }
      }
      if (!goCriteria.length) violations.push("Provider adapter candidate must define go criteria.");
      if (!blockers.length) violations.push("Provider adapter candidate must define blockers.");

      return {
        id: clean(candidate.id),
        title: clean(candidate.title) || "Provider Adapter Candidate",
        providerFamily,
        targetProvider: clean(candidate.targetProvider) || "provider pending",
        sourceHandoffIds,
        adapterMode: clean(candidate.adapterMode) || "provider-readiness",
        status,
        readinessStatus,
        goNoGoState,
        riskLevel: clean(candidate.riskLevel) || "medium",
        legalReviewRequired: candidate.legalReviewRequired === true,
        privacyReviewRequired: candidate.privacyReviewRequired !== false,
        consentBoundaryRequired: candidate.consentBoundaryRequired === true,
        sandboxOnly: candidate.sandboxOnly !== false,
        liveApiCalls,
        productionEnabled,
        secretsPresent,
        credentialsStored,
        oauthConfigured,
        webhookEnabled,
        externalProviderWrite,
        customerVisible,
        customerSafe: candidate.customerSafe === true,
        readinessChecks,
        goCriteria,
        blockers,
        nextActionAt: clean(candidate.nextActionAt),
        createdAt: clean(candidate.createdAt),
        updatedAt: clean(candidate.updatedAt),
        receiptIds,
        notes: clean(candidate.notes) || "No provider adapter note recorded.",
        violations
      };
    });
    const violationList = candidates.flatMap((candidate) => candidate.violations.map((violation) => `${candidate.title}: ${violation}`));
    const readyStates = new Set(["go-no-go-ready", "sandbox-ready", "approved-sandbox-only"]);

    return {
      candidateCount: candidates.length,
      readyCandidates: candidates.filter((candidate) => readyStates.has(candidate.readinessStatus)).length,
      sandboxOnly: candidates.filter((candidate) => candidate.sandboxOnly).length,
      approvedSandboxOnly: candidates.filter((candidate) => candidate.goNoGoState === "approved-sandbox-only").length,
      blockedCandidates: candidates.filter((candidate) => candidate.status === "blocked" || candidate.readinessStatus === "blocked").length,
      deferredCandidates: candidates.filter((candidate) => ["deferred", "legal-review-required", "privacy-review-required"].includes(candidate.goNoGoState)).length,
      highRiskCandidates: candidates.filter((candidate) => candidate.riskLevel === "high").length,
      legalReviewRequired: candidates.filter((candidate) => candidate.legalReviewRequired).length,
      privacyReviewRequired: candidates.filter((candidate) => candidate.privacyReviewRequired).length,
      consentBoundaryRequired: candidates.filter((candidate) => candidate.consentBoundaryRequired).length,
      noLiveProvider: candidates.filter((candidate) => !candidate.liveApiCalls && !candidate.productionEnabled && !candidate.externalProviderWrite).length,
      noSecrets: candidates.filter((candidate) => !candidate.secretsPresent && !candidate.credentialsStored && !candidate.oauthConfigured && !candidate.webhookEnabled).length,
      familyCounts: candidates.reduce((memo, candidate) => {
        memo[candidate.providerFamily] = (memo[candidate.providerFamily] || 0) + 1;
        return memo;
      }, {}),
      status: violationList.length ? "blocked" : "ready",
      violations: violationList,
      candidates
    };
  }

  function createProviderAdapterCandidateRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const nowText = withTimezone(now.toISOString(), nextData.timezone || "Asia/Tokyo");
    const providerFamily = clean(input.providerFamily) || "provider";
    const requiredChecks = ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes"];
    const candidate = {
      id: `provider-adapter-${stamp(now)}-${nextData.providerAdapterCandidates.length + 1}`,
      title: clean(input.title) || `${providerFamily} Provider Adapter Candidate`,
      providerFamily,
      targetProvider: clean(input.targetProvider) || "provider-neutral candidate",
      sourceHandoffIds: Array.isArray(input.sourceHandoffIds) ? input.sourceHandoffIds : [],
      adapterMode: clean(input.adapterMode) || "provider-readiness",
      status: clean(input.status) || "planned",
      readinessStatus: clean(input.readinessStatus) || "go-no-go-ready",
      goNoGoState: clean(input.goNoGoState) || "deferred",
      riskLevel: clean(input.riskLevel) || "medium",
      legalReviewRequired: input.legalReviewRequired === true || input.legalReviewRequired === "true",
      privacyReviewRequired: input.privacyReviewRequired !== false,
      consentBoundaryRequired: input.consentBoundaryRequired === true || input.consentBoundaryRequired === "true",
      sandboxOnly: true,
      liveApiCalls: false,
      productionEnabled: false,
      secretsPresent: false,
      credentialsStored: false,
      oauthConfigured: false,
      webhookEnabled: false,
      externalProviderWrite: false,
      customerVisible: false,
      customerSafe: false,
      readinessChecks: requiredChecks.concat(Array.isArray(input.readinessChecks) ? input.readinessChecks : []),
      goCriteria: Array.isArray(input.goCriteria) ? input.goCriteria : ["Operator approval required before sandbox proof."],
      blockers: Array.isArray(input.blockers) ? input.blockers : ["No live provider behavior is enabled."],
      nextActionAt: withTimezone(input.nextActionAt, nextData.timezone || "Asia/Tokyo") || nowText,
      createdAt: nowText,
      updatedAt: nowText,
      receiptIds: [],
      notes: clean(input.note) || "Provider adapter candidate created without live API calls, secrets, OAuth, webhooks, or provider writes."
    };
    const familyChecks = {
      calendar: ["no-live-sync"],
      notification: ["no-live-send", "consent-boundary-required"],
      payment: ["no-payment-capture", "legal-review-required", "consent-boundary-required"],
      "auth-session": ["no-live-auth", "raw-monitor-denied-public", "raw-admin-denied-public"],
      "analytics-advertising": ["no-live-pixel", "no-external-ad-api-write", "no-invasive-tracking", "legal-review-required", "consent-boundary-required"],
      "durable-persistence": ["backup-plan-required", "recovery-plan-required"]
    };
    for (const check of familyChecks[providerFamily] || []) {
      if (!candidate.readinessChecks.includes(check)) candidate.readinessChecks.push(check);
    }
    const receipt = {
      id: `receipt-provider-adapter-${stamp(now)}`,
      kind: "provider-adapter-selection",
      status: "complete",
      createdAt: nowText,
      note: `${candidate.title}: provider adapter candidate created as no-live readiness only.`
    };
    candidate.receiptIds.push(receipt.id);
    nextData.providerAdapterCandidates.unshift(candidate);
    nextData.receipts.unshift(receipt);
    return {
      data: nextData,
      records: {
        candidate,
        receipt
      }
    };
  }

  function transitionProviderAdapterCandidateRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const nowText = withTimezone(now.toISOString(), nextData.timezone || "Asia/Tokyo");
    const candidate = nextData.providerAdapterCandidates.find((item) => clean(item.id) === clean(input.candidateId));
    if (!candidate) throw new Error("Select a provider adapter candidate before applying an action.");
    const action = clean(input.action) || "verify";
    const note = clean(input.note) || "Provider adapter readiness reviewed.";
    const ensureChecks = (checks) => {
      candidate.readinessChecks = Array.isArray(candidate.readinessChecks) ? candidate.readinessChecks : [];
      for (const check of checks) {
        if (!candidate.readinessChecks.includes(check)) candidate.readinessChecks.push(check);
      }
    };

    if (action === "verify" || action === "mark-ready") {
      candidate.status = "complete";
      candidate.readinessStatus = "go-no-go-ready";
      candidate.goNoGoState = "ready-for-sandbox-review";
    } else if (action === "approve-sandbox-only") {
      candidate.status = "approved";
      candidate.readinessStatus = "approved-sandbox-only";
      candidate.goNoGoState = "approved-sandbox-only";
      candidate.sandboxOnly = true;
    } else if (action === "defer") {
      candidate.status = "waiting";
      candidate.readinessStatus = "go-no-go-ready";
      candidate.goNoGoState = "deferred";
    } else if (action === "block") {
      candidate.status = "blocked";
      candidate.readinessStatus = "blocked";
      candidate.goNoGoState = "blocked";
    } else {
      candidate.status = action;
    }

    ensureChecks(["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes"]);
    if (clean(candidate.providerFamily) === "calendar") ensureChecks(["no-live-sync"]);
    if (clean(candidate.providerFamily) === "notification") ensureChecks(["no-live-send", "consent-boundary-required"]);
    if (clean(candidate.providerFamily) === "payment") ensureChecks(["no-payment-capture", "legal-review-required", "consent-boundary-required"]);
    if (clean(candidate.providerFamily) === "auth-session") ensureChecks(["no-live-auth", "raw-monitor-denied-public", "raw-admin-denied-public"]);
    if (clean(candidate.providerFamily) === "analytics-advertising") ensureChecks(["no-live-pixel", "no-external-ad-api-write", "no-invasive-tracking", "legal-review-required", "consent-boundary-required"]);
    if (clean(candidate.providerFamily) === "durable-persistence") ensureChecks(["backup-plan-required", "recovery-plan-required"]);

    candidate.sandboxOnly = true;
    candidate.liveApiCalls = false;
    candidate.productionEnabled = false;
    candidate.secretsPresent = false;
    candidate.credentialsStored = false;
    candidate.oauthConfigured = false;
    candidate.webhookEnabled = false;
    candidate.externalProviderWrite = false;
    candidate.customerVisible = false;
    candidate.customerSafe = false;
    candidate.updatedAt = nowText;
    candidate.notes = note;

    const receipt = {
      id: `receipt-provider-adapter-${stamp(now)}`,
      kind: "provider-adapter-selection",
      status: candidate.status === "blocked" ? "blocked" : "complete",
      createdAt: nowText,
      note: `${candidate.title}: ${action} recorded without live API calls, secrets, OAuth, webhooks, or provider writes. ${note}`
    };
    const healthCheck = {
      id: `monitor-check-provider-adapter-${stamp(now)}`,
      title: "Provider Adapter Go/No-Go Readiness",
      status: candidate.status === "blocked" ? "blocked" : "complete",
      target: "monitor-provider-adapters",
      effect: "provider-adapter-selection-readiness",
      createdAt: nowText,
      summary: `${candidate.title} is ${candidate.goNoGoState}; provider behavior remains sandbox-only and no-live.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };

    candidate.receiptIds = Array.isArray(candidate.receiptIds) ? candidate.receiptIds : [];
    candidate.receiptIds.push(receipt.id);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        candidate,
        receipt,
        healthCheck
      }
    };
  }

  function calendarAdapterPayloadPreview(calendarExport, limit = 4) {
    return (calendarExport.entries || []).slice(0, limit).map((entry) => ({
      uid: `epoch-${clean(entry.sourceKind)}-${clean(entry.sourceId)}`,
      summary: clean(entry.title) || "EPOCH calendar item",
      startsAt: clean(entry.startAt || entry.dueAt),
      endsAt: clean(entry.endAt || entry.dueAt || entry.startAt),
      timezone: clean(calendarExport.timezone) || "Asia/Tokyo",
      source: `${clean(entry.sourceKind)}:${clean(entry.sourceId)}`,
      status: clean(entry.status) || "planned"
    }));
  }

  function summarizeCalendarAdapterPrototypeState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const calendarExport = options.calendarExport || createCalendarExport(data, { now: options.now || "2026-06-01T12:00:00+09:00" });
    const adapterSummary = options.providerAdapters || summarizeProviderAdapterSelectionState(data);
    const candidateById = adapterSummary.candidates.reduce((memo, candidate) => {
      memo[candidate.id] = candidate;
      return memo;
    }, {});
    const requiredChecks = ["calendar-export-schema-stable", "provider-go-no-go-required", "sandbox-only-before-go-live", "operator-approval-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-sync", "no-invitation-send"];
    const prototypes = data.calendarAdapterPrototypes.map((prototype) => {
      const providerCandidateId = clean(prototype.providerCandidateId);
      const candidate = candidateById[providerCandidateId] || null;
      const readinessChecks = Array.isArray(prototype.readinessChecks) ? prototype.readinessChecks : [];
      const payloadPreview = Array.isArray(prototype.payloadPreview) ? prototype.payloadPreview : [];
      const receiptIds = Array.isArray(prototype.receiptIds) ? prototype.receiptIds : [];
      const blockers = Array.isArray(prototype.blockers) ? prototype.blockers : [];
      const liveApiCalls = prototype.liveApiCalls === true;
      const liveSyncEnabled = prototype.liveSyncEnabled === true;
      const sendsInvitations = prototype.sendsInvitations === true;
      const externalProviderWrite = prototype.externalProviderWrite === true;
      const productionEnabled = prototype.productionEnabled === true;
      const secretsPresent = prototype.secretsPresent === true;
      const credentialsStored = prototype.credentialsStored === true;
      const oauthConfigured = prototype.oauthConfigured === true;
      const webhookEnabled = prototype.webhookEnabled === true;
      const customerVisible = prototype.customerVisible === true;
      const violations = [];

      if (clean(prototype.adapterFamily || "calendar") !== "calendar") {
        violations.push("Calendar adapter prototype must stay in the calendar adapter family.");
      }
      if (!candidate || candidate.providerFamily !== "calendar") {
        violations.push("Calendar adapter prototype must link to a calendar provider adapter candidate.");
      } else if (candidate.violations.length) {
        violations.push("Linked provider adapter candidate has readiness violations.");
      }
      if (prototype.sandboxOnly === false || prototype.localOnly === false) {
        violations.push("Calendar adapter prototype must remain sandbox-only and local-only.");
      }
      if (liveApiCalls || liveSyncEnabled || sendsInvitations || externalProviderWrite || productionEnabled) {
        violations.push("Calendar adapter prototype cannot enable live API calls, live sync, invitations, production behavior, or provider writes.");
      }
      if (secretsPresent || credentialsStored || oauthConfigured || webhookEnabled) {
        violations.push("Calendar adapter prototype cannot store secrets, credentials, OAuth clients, or webhooks.");
      }
      if (customerVisible) {
        violations.push("Calendar adapter prototype must remain internal and not customer-visible.");
      }
      for (const required of requiredChecks) {
        if (!readinessChecks.includes(required)) {
          violations.push(`Calendar adapter prototype must include ${required}.`);
        }
      }
      if (!payloadPreview.length) violations.push("Calendar adapter prototype must include a local payload preview.");
      if (!blockers.length) violations.push("Calendar adapter prototype must define blockers before live provider work.");
      if (clean(prototype.status) === "complete" && !receiptIds.length) {
        violations.push("Completed calendar adapter prototype requires a receipt trail.");
      }

      return {
        id: clean(prototype.id),
        title: clean(prototype.title) || "Calendar Adapter Prototype",
        providerCandidateId,
        sourceHandoffId: clean(prototype.sourceHandoffId),
        adapterFamily: clean(prototype.adapterFamily) || "calendar",
        targetProvider: clean(prototype.targetProvider) || candidate?.targetProvider || "provider-neutral calendar",
        adapterMode: clean(prototype.adapterMode) || "sandbox-export-preview",
        status: clean(prototype.status) || "planned",
        prototypeStatus: clean(prototype.prototypeStatus) || "payload-pending",
        sandboxOnly: prototype.sandboxOnly !== false,
        localOnly: prototype.localOnly !== false,
        liveApiCalls,
        liveSyncEnabled,
        sendsInvitations,
        externalProviderWrite,
        productionEnabled,
        secretsPresent,
        credentialsStored,
        oauthConfigured,
        webhookEnabled,
        customerVisible,
        customerSafe: prototype.customerSafe === true,
        calendarExportSchema: clean(prototype.calendarExportSchema) || calendarExport.schema,
        payloadMode: clean(prototype.payloadMode) || "provider-neutral-event-json-preview",
        payloadSource: clean(prototype.payloadSource) || "epoch.calendar-export",
        exportEntryCount: Number.isInteger(Number(prototype.exportEntryCount)) && Number(prototype.exportEntryCount) > 0 ? Number(prototype.exportEntryCount) : calendarExport.counts.total,
        payloadEntryCount: payloadPreview.length,
        readinessChecks,
        payloadPreview,
        blockers,
        nextActionAt: clean(prototype.nextActionAt),
        createdAt: clean(prototype.createdAt),
        updatedAt: clean(prototype.updatedAt),
        receiptIds,
        notes: clean(prototype.notes) || "No sandbox calendar adapter prototype note recorded.",
        violations
      };
    });
    const violations = prototypes.flatMap((prototype) => prototype.violations.map((detail) => `${prototype.title}: ${detail}`));

    return {
      schema: "epoch.calendar-adapter-prototype",
      prototypeCount: prototypes.length,
      payloadReady: prototypes.filter((prototype) => ["payload-ready", "sandbox-approved", "operator-reviewed"].includes(prototype.prototypeStatus)).length,
      sandboxOnly: prototypes.filter((prototype) => prototype.sandboxOnly).length,
      localOnly: prototypes.filter((prototype) => prototype.localOnly).length,
      noLiveProvider: prototypes.filter((prototype) => !prototype.liveApiCalls && !prototype.liveSyncEnabled && !prototype.sendsInvitations && !prototype.externalProviderWrite && !prototype.productionEnabled).length,
      noSecrets: prototypes.filter((prototype) => !prototype.secretsPresent && !prototype.credentialsStored && !prototype.oauthConfigured && !prototype.webhookEnabled).length,
      noInvitationSend: prototypes.filter((prototype) => !prototype.sendsInvitations).length,
      candidateLinked: prototypes.filter((prototype) => candidateById[prototype.providerCandidateId]?.providerFamily === "calendar").length,
      exportEntries: calendarExport.counts.total,
      payloadEntries: prototypes.reduce((total, prototype) => total + prototype.payloadEntryCount, 0),
      status: violations.length ? "blocked" : "ready",
      violations,
      prototypes
    };
  }

  function createCalendarAdapterPrototypeRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const nowText = withTimezone(now.toISOString(), timezone);
    const calendarExport = createCalendarExport(nextData, { now: now.toISOString() });
    const candidateId = clean(input.providerCandidateId || input.candidateId) || clean(nextData.providerAdapterCandidates.find((item) => clean(item.providerFamily) === "calendar")?.id);
    const candidate = nextData.providerAdapterCandidates.find((item) => clean(item.id) === candidateId);
    if (!candidate || clean(candidate.providerFamily) !== "calendar") throw new Error("calendar provider adapter candidate is required");
    if (candidate.liveApiCalls || candidate.productionEnabled || candidate.externalProviderWrite || candidate.secretsPresent || candidate.credentialsStored || candidate.oauthConfigured || candidate.webhookEnabled) {
      throw new Error("calendar provider adapter candidate is not safe for sandbox prototype");
    }
    const payloadPreview = calendarAdapterPayloadPreview(calendarExport, Number(input.payloadLimit) || 4);
    if (!payloadPreview.length) throw new Error("calendar export has no entries to preview");
    const prototype = {
      id: clean(input.id) || `calendar-adapter-prototype-${stamp(now)}-${nextData.calendarAdapterPrototypes.length + 1}`,
      title: clean(input.title) || `${candidate.targetProvider || "Calendar"} Sandbox Calendar Adapter Prototype`,
      providerCandidateId: candidate.id,
      sourceHandoffId: clean(input.sourceHandoffId) || (Array.isArray(candidate.sourceHandoffIds) ? candidate.sourceHandoffIds[0] : ""),
      adapterFamily: "calendar",
      targetProvider: clean(input.targetProvider) || candidate.targetProvider || "provider-neutral calendar",
      adapterMode: clean(input.adapterMode) || "sandbox-export-preview",
      status: clean(input.status) || "queued",
      prototypeStatus: clean(input.prototypeStatus) || "payload-ready",
      sandboxOnly: true,
      localOnly: true,
      liveApiCalls: false,
      liveSyncEnabled: false,
      sendsInvitations: false,
      externalProviderWrite: false,
      productionEnabled: false,
      secretsPresent: false,
      credentialsStored: false,
      oauthConfigured: false,
      webhookEnabled: false,
      customerVisible: false,
      customerSafe: false,
      calendarExportSchema: calendarExport.schema,
      payloadMode: clean(input.payloadMode) || "provider-neutral-event-json-preview",
      payloadSource: "epoch.calendar-export",
      exportEntryCount: calendarExport.counts.total,
      payloadEntryCount: payloadPreview.length,
      readinessChecks: ["calendar-export-schema-stable", "provider-go-no-go-required", "sandbox-only-before-go-live", "operator-approval-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-sync", "no-invitation-send"],
      payloadPreview,
      blockers: Array.isArray(input.blockers) ? input.blockers : ["No OAuth client configured", "No live calendar write path", "No provider invitation sending"],
      nextActionAt: withTimezone(input.nextActionAt, timezone) || nowText,
      createdAt: nowText,
      updatedAt: nowText,
      receiptIds: [],
      notes: clean(input.note) || "Sandbox calendar adapter prototype created from EPOCH calendar export without live provider behavior."
    };
    const receipt = {
      id: `receipt-calendar-adapter-prototype-${stamp(now)}`,
      kind: "calendar-adapter-prototype",
      status: "complete",
      createdAt: nowText,
      note: `${prototype.title}: local payload preview created without live API calls, OAuth, secrets, webhooks, provider writes, or invitations.`
    };
    const healthCheck = {
      id: `monitor-check-calendar-adapter-${stamp(now)}`,
      title: "Sandbox Calendar Adapter Prototype",
      status: "complete",
      target: "monitor-calendar-adapter",
      effect: "calendar-adapter-sandbox-proof",
      createdAt: nowText,
      summary: `${prototype.title} generated ${payloadPreview.length} local payload preview items from ${calendarExport.counts.total} calendar export entries.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };
    prototype.receiptIds.push(receipt.id);
    nextData.calendarAdapterPrototypes.unshift(prototype);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        prototype,
        receipt,
        healthCheck
      }
    };
  }

  function transitionCalendarAdapterPrototypeRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const nowText = withTimezone(now.toISOString(), timezone);
    const prototype = nextData.calendarAdapterPrototypes.find((item) => clean(item.id) === clean(input.prototypeId || input.id));
    if (!prototype) throw new Error("Select a sandbox calendar adapter prototype before applying an action.");
    const action = clean(input.action) || "generate-preview";
    const note = clean(input.note) || "Sandbox calendar adapter prototype reviewed without live provider behavior.";
    const ensureChecks = (checks) => {
      prototype.readinessChecks = Array.isArray(prototype.readinessChecks) ? prototype.readinessChecks : [];
      for (const check of checks) {
        if (!prototype.readinessChecks.includes(check)) prototype.readinessChecks.push(check);
      }
    };

    if (action === "generate-preview") {
      const calendarExport = createCalendarExport(nextData, { now: now.toISOString() });
      prototype.payloadPreview = calendarAdapterPayloadPreview(calendarExport, Number(input.payloadLimit) || 4);
      prototype.exportEntryCount = calendarExport.counts.total;
      prototype.payloadEntryCount = prototype.payloadPreview.length;
      prototype.status = "queued";
      prototype.prototypeStatus = "payload-ready";
    } else if (action === "approve-sandbox") {
      prototype.status = "approved";
      prototype.prototypeStatus = "sandbox-approved";
    } else if (action === "mark-reviewed") {
      prototype.status = "complete";
      prototype.prototypeStatus = "operator-reviewed";
    } else if (action === "defer") {
      prototype.status = "waiting";
      prototype.prototypeStatus = "deferred";
    } else if (action === "block") {
      prototype.status = "blocked";
      prototype.prototypeStatus = "blocked";
    } else {
      throw new Error("unsupported sandbox calendar adapter action");
    }

    ensureChecks(["calendar-export-schema-stable", "provider-go-no-go-required", "sandbox-only-before-go-live", "operator-approval-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-sync", "no-invitation-send"]);
    prototype.adapterFamily = "calendar";
    prototype.sandboxOnly = true;
    prototype.localOnly = true;
    prototype.liveApiCalls = false;
    prototype.liveSyncEnabled = false;
    prototype.sendsInvitations = false;
    prototype.externalProviderWrite = false;
    prototype.productionEnabled = false;
    prototype.secretsPresent = false;
    prototype.credentialsStored = false;
    prototype.oauthConfigured = false;
    prototype.webhookEnabled = false;
    prototype.customerVisible = false;
    prototype.customerSafe = false;
    prototype.payloadSource = "epoch.calendar-export";
    prototype.updatedAt = nowText;
    prototype.notes = note;

    const receipt = {
      id: `receipt-calendar-adapter-prototype-${stamp(now)}`,
      kind: "calendar-adapter-prototype",
      status: prototype.status === "blocked" ? "blocked" : "complete",
      createdAt: nowText,
      note: `${prototype.title}: ${action} recorded without live calendar API calls, OAuth, secrets, webhooks, provider writes, or invitations. ${note}`
    };
    const healthCheck = {
      id: `monitor-check-calendar-adapter-${stamp(now)}`,
      title: "Sandbox Calendar Adapter Prototype",
      status: prototype.status === "blocked" ? "blocked" : "complete",
      target: "monitor-calendar-adapter",
      effect: "calendar-adapter-sandbox-proof",
      createdAt: nowText,
      summary: `${prototype.title} is ${prototype.prototypeStatus}; calendar behavior remains sandbox/local only.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };

    prototype.receiptIds = Array.isArray(prototype.receiptIds) ? prototype.receiptIds : [];
    prototype.receiptIds.push(receipt.id);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        prototype,
        receipt,
        healthCheck
      }
    };
  }

  function notificationProviderPayloadPreview(currentData, limit = 4) {
    const data = normalizedOperatingData(currentData);
    const customersById = data.customers.reduce((memo, customer) => {
      memo[customer.id] = customer;
      return memo;
    }, {});
    const deliveryItems = data.notificationDeliveries.map((delivery) => {
      const customer = customersById[delivery.customerId] || {};
      return {
        uid: `epoch-notification-delivery-${clean(delivery.id)}`,
        title: clean(delivery.title) || "Customer update delivery preview",
        channel: clean(delivery.channel) || "customer-update",
        provider: clean(delivery.provider) || "provider-neutral",
        customerId: clean(delivery.customerId),
        customerName: clean(customer.name) || clean(delivery.customerName) || "customer",
        summary: clean(delivery.summary || delivery.lastNote) || "Customer-safe notification payload preview.",
        deliverAfterAt: clean(delivery.nextActionAt || delivery.createdAt),
        source: `${clean(delivery.sourceKind) || "notification-delivery"}:${clean(delivery.sourceId || delivery.notificationEventId || delivery.id)}`,
        status: "preview-only",
        customerSafe: true
      };
    });
    const updateItems = data.notificationEvents
      .filter((event) => event.visible !== false)
      .map((event) => {
        const customer = customersById[event.customerId] || {};
        return {
          uid: `epoch-notification-${clean(event.id)}`,
          title: clean(event.title) || "Customer update preview",
          channel: clean(event.channel) || "customer-update",
          provider: "provider-neutral",
          customerId: clean(event.customerId),
          customerName: clean(customer.name) || "customer",
          summary: clean(event.summary) || "Customer-safe update preview.",
          deliverAfterAt: clean(event.deliverAfterAt || event.createdAt),
          source: `${clean(event.sourceKind) || "notification-event"}:${clean(event.sourceId || event.id)}`,
          status: "preview-only",
          customerSafe: true
        };
      });
    return (deliveryItems.length ? deliveryItems : updateItems).slice(0, limit);
  }

  function summarizeNotificationProviderPrototypeState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const providerAdapters = options.providerAdapters || summarizeProviderAdapterSelectionState(data);
    const notificationProvider = options.notificationProvider || summarizeNotificationProviderState(data);
    const candidateById = providerAdapters.candidates.reduce((memo, candidate) => {
      memo[candidate.id] = candidate;
      return memo;
    }, {});
    const handoffById = notificationProvider.handoffs.reduce((memo, handoff) => {
      memo[handoff.id] = handoff;
      return memo;
    }, {});
    const requiredChecks = ["provider-handoff-required", "template-consent-required", "notification-outbox-schema-stable", "sandbox-only-before-go-live", "operator-approval-required", "no-live-send", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-customer-visible-send", "no-nexus-send"];
    const prototypes = data.notificationProviderPrototypes.map((prototype) => {
      const providerCandidateId = clean(prototype.providerCandidateId);
      const sourceHandoffId = clean(prototype.sourceHandoffId);
      const candidate = candidateById[providerCandidateId] || null;
      const handoff = handoffById[sourceHandoffId] || null;
      const readinessChecks = Array.isArray(prototype.readinessChecks) ? prototype.readinessChecks : [];
      const payloadPreview = Array.isArray(prototype.payloadPreview) ? prototype.payloadPreview : [];
      const receiptIds = Array.isArray(prototype.receiptIds) ? prototype.receiptIds : [];
      const blockers = Array.isArray(prototype.blockers) ? prototype.blockers : [];
      const liveSendEnabled = prototype.liveSendEnabled === true;
      const liveEmailSend = prototype.liveEmailSend === true;
      const liveLineSend = prototype.liveLineSend === true;
      const liveSmsSend = prototype.liveSmsSend === true;
      const liveNexusSend = prototype.liveNexusSend === true;
      const externalProviderWrite = prototype.externalProviderWrite === true;
      const productionEnabled = prototype.productionEnabled === true;
      const secretsPresent = prototype.secretsPresent === true;
      const credentialsStored = prototype.credentialsStored === true;
      const storesCredentials = prototype.storesCredentials === true;
      const oauthConfigured = prototype.oauthConfigured === true;
      const webhookEnabled = prototype.webhookEnabled === true;
      const customerVisible = prototype.customerVisible === true;
      const violations = [];

      if (clean(prototype.adapterFamily || "notification") !== "notification") {
        violations.push("Notification provider prototype must stay in the notification adapter family.");
      }
      if (!candidate || candidate.providerFamily !== "notification") {
        violations.push("Notification provider prototype must link to a notification provider adapter candidate.");
      } else if (candidate.violations.length) {
        violations.push("Linked notification provider adapter candidate has readiness violations.");
      }
      if (!handoff) {
        violations.push("Notification provider prototype must link to a notification provider handoff.");
      } else if (handoff.violations.length) {
        violations.push("Linked notification provider handoff has readiness violations.");
      }
      if (prototype.sandboxOnly === false || prototype.localOnly === false) {
        violations.push("Notification provider prototype must remain sandbox-only and local-only.");
      }
      if (liveSendEnabled || liveEmailSend || liveLineSend || liveSmsSend || liveNexusSend || externalProviderWrite || productionEnabled) {
        violations.push("Notification provider prototype cannot enable live sends, NEXUS sends, production behavior, or provider writes.");
      }
      if (secretsPresent || credentialsStored || storesCredentials || oauthConfigured || webhookEnabled) {
        violations.push("Notification provider prototype cannot store secrets, credentials, OAuth clients, or webhooks.");
      }
      if (customerVisible) {
        violations.push("Notification provider prototype must remain internal and not customer-visible.");
      }
      for (const required of requiredChecks) {
        if (!readinessChecks.includes(required)) {
          violations.push(`Notification provider prototype must include ${required}.`);
        }
      }
      if (!payloadPreview.length) violations.push("Notification provider prototype must include a local message payload preview.");
      if (!blockers.length) violations.push("Notification provider prototype must define blockers before live provider work.");
      if (clean(prototype.status) === "complete" && !receiptIds.length) {
        violations.push("Completed notification provider prototype requires a receipt trail.");
      }

      return {
        id: clean(prototype.id),
        title: clean(prototype.title) || "Notification Provider Prototype",
        providerCandidateId,
        sourceHandoffId,
        adapterFamily: clean(prototype.adapterFamily) || "notification",
        targetProvider: clean(prototype.targetProvider) || candidate?.targetProvider || handoff?.targetProvider || "provider-neutral notification",
        adapterMode: clean(prototype.adapterMode) || "sandbox-message-preview",
        status: clean(prototype.status) || "planned",
        prototypeStatus: clean(prototype.prototypeStatus) || "payload-pending",
        sandboxOnly: prototype.sandboxOnly !== false,
        localOnly: prototype.localOnly !== false,
        liveSendEnabled,
        liveEmailSend,
        liveLineSend,
        liveSmsSend,
        liveNexusSend,
        externalProviderWrite,
        productionEnabled,
        secretsPresent,
        credentialsStored,
        storesCredentials,
        oauthConfigured,
        webhookEnabled,
        customerVisible,
        customerSafe: prototype.customerSafe === true,
        notificationOutboxSchema: clean(prototype.notificationOutboxSchema) || "epoch.notification-outbox",
        payloadMode: clean(prototype.payloadMode) || "provider-neutral-message-json-preview",
        payloadSource: clean(prototype.payloadSource) || "epoch.notification-outbox",
        payloadEntryCount: payloadPreview.length,
        readinessChecks,
        payloadPreview,
        blockers,
        nextActionAt: clean(prototype.nextActionAt),
        createdAt: clean(prototype.createdAt),
        updatedAt: clean(prototype.updatedAt),
        receiptIds,
        notes: clean(prototype.notes) || "No sandbox notification provider prototype note recorded.",
        violations
      };
    });
    const violations = prototypes.flatMap((prototype) => prototype.violations.map((detail) => `${prototype.title}: ${detail}`));

    return {
      schema: "epoch.notification-provider-prototype",
      prototypeCount: prototypes.length,
      payloadReady: prototypes.filter((prototype) => ["payload-ready", "sandbox-approved", "operator-reviewed"].includes(prototype.prototypeStatus)).length,
      sandboxOnly: prototypes.filter((prototype) => prototype.sandboxOnly).length,
      localOnly: prototypes.filter((prototype) => prototype.localOnly).length,
      noLiveSend: prototypes.filter((prototype) => !prototype.liveSendEnabled && !prototype.liveEmailSend && !prototype.liveLineSend && !prototype.liveSmsSend && !prototype.liveNexusSend && !prototype.externalProviderWrite && !prototype.productionEnabled).length,
      noSecrets: prototypes.filter((prototype) => !prototype.secretsPresent && !prototype.credentialsStored && !prototype.storesCredentials && !prototype.oauthConfigured && !prototype.webhookEnabled).length,
      noCustomerVisibleSend: prototypes.filter((prototype) => !prototype.customerVisible).length,
      candidateLinked: prototypes.filter((prototype) => candidateById[prototype.providerCandidateId]?.providerFamily === "notification").length,
      handoffLinked: prototypes.filter((prototype) => handoffById[prototype.sourceHandoffId]).length,
      payloadEntries: prototypes.reduce((total, prototype) => total + prototype.payloadEntryCount, 0),
      status: violations.length ? "blocked" : "ready",
      violations,
      prototypes
    };
  }

  function createNotificationProviderPrototypeRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const nowText = withTimezone(now.toISOString(), timezone);
    const candidateId = clean(input.providerCandidateId || input.candidateId) || clean(nextData.providerAdapterCandidates.find((item) => clean(item.providerFamily) === "notification")?.id);
    const candidate = nextData.providerAdapterCandidates.find((item) => clean(item.id) === candidateId);
    if (!candidate || clean(candidate.providerFamily) !== "notification") throw new Error("notification provider adapter candidate is required");
    if (candidate.liveApiCalls || candidate.productionEnabled || candidate.externalProviderWrite || candidate.secretsPresent || candidate.credentialsStored || candidate.oauthConfigured || candidate.webhookEnabled) {
      throw new Error("notification provider adapter candidate is not safe for sandbox prototype");
    }
    const sourceHandoffId = clean(input.sourceHandoffId || input.handoffId) || clean((Array.isArray(candidate.sourceHandoffIds) ? candidate.sourceHandoffIds[0] : "") || nextData.notificationProviderHandoffs[0]?.id);
    const sourceHandoff = nextData.notificationProviderHandoffs.find((item) => clean(item.id) === sourceHandoffId);
    if (!sourceHandoff) throw new Error("notification provider handoff is required for sandbox prototype");
    if (sourceHandoff.liveSendEnabled || sourceHandoff.externalProviderWrite || sourceHandoff.storesCredentials || sourceHandoff.webhookEnabled || sourceHandoff.customerVisible) {
      throw new Error("notification provider handoff is not safe for sandbox prototype");
    }
    const payloadPreview = notificationProviderPayloadPreview(nextData, Number(input.payloadLimit) || 4);
    if (!payloadPreview.length) throw new Error("notification records have no customer-safe updates to preview");
    const prototype = {
      id: clean(input.id) || `notification-provider-prototype-${stamp(now)}-${nextData.notificationProviderPrototypes.length + 1}`,
      title: clean(input.title) || `${candidate.targetProvider || "Notification"} Sandbox Notification Provider Prototype`,
      providerCandidateId: candidate.id,
      sourceHandoffId: sourceHandoff.id,
      adapterFamily: "notification",
      targetProvider: clean(input.targetProvider) || candidate.targetProvider || sourceHandoff.targetProvider || "provider-neutral notification",
      adapterMode: clean(input.adapterMode) || "sandbox-message-preview",
      status: clean(input.status) || "queued",
      prototypeStatus: clean(input.prototypeStatus) || "payload-ready",
      sandboxOnly: true,
      localOnly: true,
      liveSendEnabled: false,
      liveEmailSend: false,
      liveLineSend: false,
      liveSmsSend: false,
      liveNexusSend: false,
      externalProviderWrite: false,
      productionEnabled: false,
      secretsPresent: false,
      credentialsStored: false,
      storesCredentials: false,
      oauthConfigured: false,
      webhookEnabled: false,
      customerVisible: false,
      customerSafe: false,
      notificationOutboxSchema: "epoch.notification-outbox",
      payloadMode: clean(input.payloadMode) || "provider-neutral-message-json-preview",
      payloadSource: "epoch.notification-outbox",
      payloadEntryCount: payloadPreview.length,
      readinessChecks: ["provider-handoff-required", "template-consent-required", "notification-outbox-schema-stable", "sandbox-only-before-go-live", "operator-approval-required", "no-live-send", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-customer-visible-send", "no-nexus-send"],
      payloadPreview,
      blockers: Array.isArray(input.blockers) ? input.blockers : ["No live sending consent", "No provider credential storage", "No webhook or NEXUS delivery path"],
      nextActionAt: withTimezone(input.nextActionAt, timezone) || nowText,
      createdAt: nowText,
      updatedAt: nowText,
      receiptIds: [],
      notes: clean(input.note) || "Sandbox notification provider prototype created from EPOCH customer-safe update records without live provider behavior."
    };
    const receipt = {
      id: `receipt-notification-provider-prototype-${stamp(now)}`,
      kind: "notification-provider-prototype",
      status: "complete",
      createdAt: nowText,
      note: `${prototype.title}: local message payload preview created without live email, LINE, SMS, NEXUS, webhooks, OAuth, secrets, provider writes, or customer-visible sends.`
    };
    const healthCheck = {
      id: `monitor-check-notification-prototype-${stamp(now)}`,
      title: "Sandbox Notification Provider Prototype",
      status: "complete",
      target: "monitor-notification-prototype",
      effect: "notification-provider-sandbox-proof",
      createdAt: nowText,
      summary: `${prototype.title} generated ${payloadPreview.length} local message payload preview items from customer-safe update records.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };
    prototype.receiptIds.push(receipt.id);
    nextData.notificationProviderPrototypes.unshift(prototype);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        prototype,
        receipt,
        healthCheck
      }
    };
  }

  function transitionNotificationProviderPrototypeRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const nowText = withTimezone(now.toISOString(), timezone);
    const prototype = nextData.notificationProviderPrototypes.find((item) => clean(item.id) === clean(input.prototypeId || input.id));
    if (!prototype) throw new Error("Select a sandbox notification provider prototype before applying an action.");
    const action = clean(input.action) || "generate-preview";
    const note = clean(input.note) || "Sandbox notification provider prototype reviewed without live provider behavior.";
    const ensureChecks = (checks) => {
      prototype.readinessChecks = Array.isArray(prototype.readinessChecks) ? prototype.readinessChecks : [];
      for (const check of checks) {
        if (!prototype.readinessChecks.includes(check)) prototype.readinessChecks.push(check);
      }
    };

    if (action === "generate-preview") {
      prototype.payloadPreview = notificationProviderPayloadPreview(nextData, Number(input.payloadLimit) || 4);
      prototype.payloadEntryCount = prototype.payloadPreview.length;
      prototype.status = "queued";
      prototype.prototypeStatus = "payload-ready";
    } else if (action === "approve-sandbox") {
      prototype.status = "approved";
      prototype.prototypeStatus = "sandbox-approved";
    } else if (action === "mark-reviewed") {
      prototype.status = "complete";
      prototype.prototypeStatus = "operator-reviewed";
    } else if (action === "defer") {
      prototype.status = "waiting";
      prototype.prototypeStatus = "deferred";
    } else if (action === "block") {
      prototype.status = "blocked";
      prototype.prototypeStatus = "blocked";
    } else {
      throw new Error("unsupported sandbox notification provider action");
    }

    ensureChecks(["provider-handoff-required", "template-consent-required", "notification-outbox-schema-stable", "sandbox-only-before-go-live", "operator-approval-required", "no-live-send", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-customer-visible-send", "no-nexus-send"]);
    prototype.adapterFamily = "notification";
    prototype.sandboxOnly = true;
    prototype.localOnly = true;
    prototype.liveSendEnabled = false;
    prototype.liveEmailSend = false;
    prototype.liveLineSend = false;
    prototype.liveSmsSend = false;
    prototype.liveNexusSend = false;
    prototype.externalProviderWrite = false;
    prototype.productionEnabled = false;
    prototype.secretsPresent = false;
    prototype.credentialsStored = false;
    prototype.storesCredentials = false;
    prototype.oauthConfigured = false;
    prototype.webhookEnabled = false;
    prototype.customerVisible = false;
    prototype.customerSafe = false;
    prototype.notificationOutboxSchema = "epoch.notification-outbox";
    prototype.payloadSource = "epoch.notification-outbox";
    prototype.updatedAt = nowText;
    prototype.notes = note;

    const receipt = {
      id: `receipt-notification-provider-prototype-${stamp(now)}`,
      kind: "notification-provider-prototype",
      status: prototype.status === "blocked" ? "blocked" : "complete",
      createdAt: nowText,
      note: `${prototype.title}: ${action} recorded without live email, LINE, SMS, NEXUS, webhooks, OAuth, secrets, provider writes, or customer-visible sends. ${note}`
    };
    const healthCheck = {
      id: `monitor-check-notification-prototype-${stamp(now)}`,
      title: "Sandbox Notification Provider Prototype",
      status: prototype.status === "blocked" ? "blocked" : "complete",
      target: "monitor-notification-prototype",
      effect: "notification-provider-sandbox-proof",
      createdAt: nowText,
      summary: `${prototype.title} is ${prototype.prototypeStatus}; notification behavior remains sandbox/local only.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };

    prototype.receiptIds = Array.isArray(prototype.receiptIds) ? prototype.receiptIds : [];
    prototype.receiptIds.push(receipt.id);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        prototype,
        receipt,
        healthCheck
      }
    };
  }

  function paymentProviderPayloadPreview(currentData, limit = 4) {
    const data = normalizedOperatingData(currentData);
    const customersById = data.customers.reduce((memo, customer) => {
      memo[customer.id] = customer;
      return memo;
    }, {});
    const leadsById = data.leads.reduce((memo, lead) => {
      memo[lead.id] = lead;
      return memo;
    }, {});
    const packagesById = data.offerPackages.reduce((memo, offerPackage) => {
      memo[offerPackage.id] = offerPackage;
      return memo;
    }, {});
    const quoteItems = data.quotes.map((quote) => {
      const customer = customersById[quote.customerId] || {};
      const offerPackage = packagesById[quote.packageId] || {};
      return {
        uid: `epoch-payment-quote-${clean(quote.id)}`,
        title: clean(quote.title) || `${clean(offerPackage.name) || "Service"} payment preview`,
        provider: "provider-neutral",
        amountJpy: Number(quote.amountJpy || offerPackage.priceJpy || 0),
        currency: clean(quote.currency) || "JPY",
        customerId: clean(quote.customerId),
        customerName: clean(customer.name) || "customer",
        packageId: clean(quote.packageId),
        source: `quote:${clean(quote.id)}`,
        status: "preview-only",
        paymentStatus: clean(quote.paymentStatus) || "not-created",
        checkoutSession: "not-created",
        under19Guarded: quote.under19 === true || quote.guardianConsentRequired === true,
        customerSafe: true
      };
    });
    const opportunityItems = data.opportunities.map((opportunity) => {
      const lead = leadsById[opportunity.leadId] || {};
      const offerPackage = packagesById[opportunity.packageId] || {};
      const under19Guarded = clean(offerPackage.routing) === "compatibility-required" || clean(lead.name).toLowerCase().includes("under-19");
      return {
        uid: `epoch-payment-opportunity-${clean(opportunity.id)}`,
        title: `${clean(offerPackage.name) || clean(opportunity.packageId) || "Service"} payment preview`,
        provider: "provider-neutral",
        amountJpy: Number(opportunity.estimatedValueJpy || offerPackage.priceJpy || 0),
        currency: "JPY",
        customerId: "",
        customerName: clean(lead.name) || "prospect",
        packageId: clean(opportunity.packageId),
        source: `opportunity:${clean(opportunity.id)}`,
        status: under19Guarded ? "blocked-preview-only" : "preview-only",
        paymentStatus: under19Guarded ? "guardian-consent-required" : "not-created",
        checkoutSession: "not-created",
        under19Guarded,
        customerSafe: true
      };
    });
    const packageItems = data.offerPackages
      .filter((offerPackage) => clean(offerPackage.routing) === "compatibility-required")
      .map((offerPackage) => ({
        uid: `epoch-payment-package-${clean(offerPackage.id)}`,
        title: `${clean(offerPackage.name) || "Compatibility package"} blocked payment preview`,
        provider: "provider-neutral",
        amountJpy: Number(offerPackage.priceJpy || 0),
        currency: "JPY",
        customerId: "",
        customerName: "Under-19 compatibility review",
        packageId: clean(offerPackage.id),
        source: `package:${clean(offerPackage.id)}`,
        status: "blocked-preview-only",
        paymentStatus: "guardian-consent-required",
        checkoutSession: "not-created",
        under19Guarded: true,
        customerSafe: true
      }));

    return (quoteItems.length ? quoteItems : [...opportunityItems, ...packageItems]).slice(0, limit);
  }

  function summarizePaymentProviderPrototypeState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const providerAdapters = options.providerAdapters || summarizeProviderAdapterSelectionState(data);
    const paymentProvider = options.paymentProvider || summarizePaymentProviderState(data);
    const candidateById = providerAdapters.candidates.reduce((memo, candidate) => {
      memo[candidate.id] = candidate;
      return memo;
    }, {});
    const handoffById = paymentProvider.handoffs.reduce((memo, handoff) => {
      memo[handoff.id] = handoff;
      return memo;
    }, {});
    const requiredChecks = ["provider-candidate-required", "payment-provider-handoff-required", "quote-payment-schema-stable", "legal-review-required", "tax-review-required", "privacy-boundary-required", "under19-eligibility-gate", "sandbox-only-before-go-live", "operator-approval-required", "no-live-payment", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-checkout-session", "no-payment-capture", "no-refunds", "no-invoice-send", "no-customer-visible-payment-request"];
    const prototypes = data.paymentProviderPrototypes.map((prototype) => {
      const providerCandidateId = clean(prototype.providerCandidateId);
      const sourceHandoffId = clean(prototype.sourceHandoffId);
      const candidate = candidateById[providerCandidateId] || null;
      const handoff = handoffById[sourceHandoffId] || null;
      const readinessChecks = Array.isArray(prototype.readinessChecks) ? prototype.readinessChecks : [];
      const payloadPreview = Array.isArray(prototype.payloadPreview) ? prototype.payloadPreview : [];
      const receiptIds = Array.isArray(prototype.receiptIds) ? prototype.receiptIds : [];
      const blockers = Array.isArray(prototype.blockers) ? prototype.blockers : [];
      const livePaymentEnabled = prototype.livePaymentEnabled === true;
      const liveCheckoutEnabled = prototype.liveCheckoutEnabled === true;
      const liveCaptureEnabled = prototype.liveCaptureEnabled === true;
      const liveRefundEnabled = prototype.liveRefundEnabled === true;
      const invoiceSendEnabled = prototype.invoiceSendEnabled === true;
      const checkoutSessionCreated = prototype.checkoutSessionCreated === true;
      const paymentLinkCreated = prototype.paymentLinkCreated === true;
      const capturesPayment = prototype.capturesPayment === true;
      const externalProviderWrite = prototype.externalProviderWrite === true;
      const productionEnabled = prototype.productionEnabled === true;
      const secretsPresent = prototype.secretsPresent === true;
      const credentialsStored = prototype.credentialsStored === true;
      const storesCredentials = prototype.storesCredentials === true;
      const oauthConfigured = prototype.oauthConfigured === true;
      const webhookEnabled = prototype.webhookEnabled === true;
      const customerVisible = prototype.customerVisible === true;
      const legalReviewRequired = prototype.legalReviewRequired !== false;
      const taxReviewRequired = prototype.taxReviewRequired !== false;
      const privacyReviewRequired = prototype.privacyReviewRequired !== false;
      const under19Guarded = prototype.under19Guarded !== false;
      const violations = [];

      if (clean(prototype.adapterFamily || "payment") !== "payment") {
        violations.push("Payment provider prototype must stay in the payment adapter family.");
      }
      if (!candidate || candidate.providerFamily !== "payment") {
        violations.push("Payment provider prototype must link to a payment provider adapter candidate.");
      } else if (candidate.violations.length) {
        violations.push("Linked payment provider adapter candidate has readiness violations.");
      }
      if (!handoff) {
        violations.push("Payment provider prototype must link to a payment provider handoff.");
      } else if (handoff.violations.length) {
        violations.push("Linked payment provider handoff has readiness violations.");
      }
      if (prototype.sandboxOnly === false || prototype.localOnly === false) {
        violations.push("Payment provider prototype must remain sandbox-only and local-only.");
      }
      if (livePaymentEnabled || liveCheckoutEnabled || liveCaptureEnabled || liveRefundEnabled || invoiceSendEnabled || checkoutSessionCreated || paymentLinkCreated || capturesPayment || externalProviderWrite || productionEnabled) {
        violations.push("Payment provider prototype cannot enable live checkout, invoice sending, payment capture, refunds, production behavior, payment links, checkout sessions, or provider writes.");
      }
      if (secretsPresent || credentialsStored || storesCredentials || oauthConfigured || webhookEnabled) {
        violations.push("Payment provider prototype cannot store secrets, credentials, OAuth clients, or webhooks.");
      }
      if (customerVisible) {
        violations.push("Payment provider prototype must remain internal and not create customer-visible payment requests.");
      }
      if (!legalReviewRequired || !taxReviewRequired || !privacyReviewRequired) {
        violations.push("Payment provider prototype must keep legal, tax, and privacy review requirements visible.");
      }
      if (!under19Guarded) {
        violations.push("Payment provider prototype must preserve under-19 eligibility gating.");
      }
      for (const required of requiredChecks) {
        if (!readinessChecks.includes(required)) {
          violations.push(`Payment provider prototype must include ${required}.`);
        }
      }
      if (!payloadPreview.length) violations.push("Payment provider prototype must include a local payment payload preview.");
      if (!blockers.length) violations.push("Payment provider prototype must define blockers before live payment provider work.");
      if (clean(prototype.status) === "complete" && !receiptIds.length) {
        violations.push("Completed payment provider prototype requires a receipt trail.");
      }

      return {
        id: clean(prototype.id),
        title: clean(prototype.title) || "Payment Provider Prototype",
        providerCandidateId,
        sourceHandoffId,
        adapterFamily: clean(prototype.adapterFamily) || "payment",
        targetProvider: clean(prototype.targetProvider) || candidate?.targetProvider || handoff?.targetProvider || "provider-neutral payment",
        adapterMode: clean(prototype.adapterMode) || "sandbox-payment-payload-preview",
        status: clean(prototype.status) || "planned",
        prototypeStatus: clean(prototype.prototypeStatus) || "payload-pending",
        sandboxOnly: prototype.sandboxOnly !== false,
        localOnly: prototype.localOnly !== false,
        livePaymentEnabled,
        liveCheckoutEnabled,
        liveCaptureEnabled,
        liveRefundEnabled,
        invoiceSendEnabled,
        checkoutSessionCreated,
        paymentLinkCreated,
        capturesPayment,
        externalProviderWrite,
        productionEnabled,
        secretsPresent,
        credentialsStored,
        storesCredentials,
        oauthConfigured,
        webhookEnabled,
        customerVisible,
        customerSafe: prototype.customerSafe === true,
        legalReviewRequired,
        taxReviewRequired,
        privacyReviewRequired,
        under19Guarded,
        paymentProcessorSchema: clean(prototype.paymentProcessorSchema) || "epoch.quote-payment",
        payloadMode: clean(prototype.payloadMode) || "provider-neutral-payment-json-preview",
        payloadSource: clean(prototype.payloadSource) || "epoch.quote-payment",
        payloadEntryCount: payloadPreview.length,
        readinessChecks,
        payloadPreview,
        blockers,
        nextActionAt: clean(prototype.nextActionAt),
        createdAt: clean(prototype.createdAt),
        updatedAt: clean(prototype.updatedAt),
        receiptIds,
        notes: clean(prototype.notes) || "No sandbox payment provider prototype note recorded.",
        violations
      };
    });
    const violations = prototypes.flatMap((prototype) => prototype.violations.map((detail) => `${prototype.title}: ${detail}`));

    return {
      schema: "epoch.payment-provider-prototype",
      prototypeCount: prototypes.length,
      payloadReady: prototypes.filter((prototype) => ["payload-ready", "sandbox-approved", "operator-reviewed"].includes(prototype.prototypeStatus)).length,
      sandboxOnly: prototypes.filter((prototype) => prototype.sandboxOnly).length,
      localOnly: prototypes.filter((prototype) => prototype.localOnly).length,
      noLivePayment: prototypes.filter((prototype) => !prototype.livePaymentEnabled && !prototype.liveCheckoutEnabled && !prototype.liveCaptureEnabled && !prototype.liveRefundEnabled && !prototype.invoiceSendEnabled && !prototype.checkoutSessionCreated && !prototype.paymentLinkCreated && !prototype.capturesPayment && !prototype.externalProviderWrite && !prototype.productionEnabled).length,
      noSecrets: prototypes.filter((prototype) => !prototype.secretsPresent && !prototype.credentialsStored && !prototype.storesCredentials && !prototype.oauthConfigured && !prototype.webhookEnabled).length,
      noCustomerVisiblePayment: prototypes.filter((prototype) => !prototype.customerVisible).length,
      noPaymentCapture: prototypes.filter((prototype) => !prototype.capturesPayment && !prototype.liveCaptureEnabled).length,
      legalTaxPrivacyReady: prototypes.filter((prototype) => prototype.legalReviewRequired && prototype.taxReviewRequired && prototype.privacyReviewRequired).length,
      under19Guarded: prototypes.filter((prototype) => prototype.under19Guarded).length,
      candidateLinked: prototypes.filter((prototype) => candidateById[prototype.providerCandidateId]?.providerFamily === "payment").length,
      handoffLinked: prototypes.filter((prototype) => handoffById[prototype.sourceHandoffId]).length,
      payloadEntries: prototypes.reduce((total, prototype) => total + prototype.payloadEntryCount, 0),
      status: violations.length ? "blocked" : "ready",
      violations,
      prototypes
    };
  }

  function createPaymentProviderPrototypeRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const nowText = withTimezone(now.toISOString(), timezone);
    const candidateId = clean(input.providerCandidateId || input.candidateId) || clean(nextData.providerAdapterCandidates.find((item) => clean(item.providerFamily) === "payment")?.id);
    const candidate = nextData.providerAdapterCandidates.find((item) => clean(item.id) === candidateId);
    if (!candidate || clean(candidate.providerFamily) !== "payment") throw new Error("payment provider adapter candidate is required");
    if (candidate.liveApiCalls || candidate.productionEnabled || candidate.externalProviderWrite || candidate.secretsPresent || candidate.credentialsStored || candidate.oauthConfigured || candidate.webhookEnabled) {
      throw new Error("payment provider adapter candidate is not safe for sandbox prototype");
    }
    const sourceHandoffId = clean(input.sourceHandoffId || input.handoffId) || clean((Array.isArray(candidate.sourceHandoffIds) ? candidate.sourceHandoffIds[0] : "") || nextData.paymentProviderHandoffs[0]?.id);
    const sourceHandoff = nextData.paymentProviderHandoffs.find((item) => clean(item.id) === sourceHandoffId);
    if (!sourceHandoff) throw new Error("payment provider handoff is required for sandbox prototype");
    if (sourceHandoff.livePaymentEnabled || sourceHandoff.externalProviderWrite || sourceHandoff.storesCredentials || sourceHandoff.webhookEnabled || sourceHandoff.capturesPayment || sourceHandoff.customerVisible) {
      throw new Error("payment provider handoff is not safe for sandbox prototype");
    }
    const payloadPreview = paymentProviderPayloadPreview(nextData, Number(input.payloadLimit) || 4);
    if (!payloadPreview.length) throw new Error("payment records have no quote or opportunity payload to preview");
    const prototype = {
      id: clean(input.id) || `payment-provider-prototype-${stamp(now)}-${nextData.paymentProviderPrototypes.length + 1}`,
      title: clean(input.title) || `${candidate.targetProvider || "Payment"} Sandbox Payment Provider Prototype`,
      providerCandidateId: candidate.id,
      sourceHandoffId: sourceHandoff.id,
      adapterFamily: "payment",
      targetProvider: clean(input.targetProvider) || candidate.targetProvider || sourceHandoff.targetProvider || "provider-neutral payment",
      adapterMode: clean(input.adapterMode) || "sandbox-payment-payload-preview",
      status: clean(input.status) || "queued",
      prototypeStatus: clean(input.prototypeStatus) || "payload-ready",
      sandboxOnly: true,
      localOnly: true,
      livePaymentEnabled: false,
      liveCheckoutEnabled: false,
      liveCaptureEnabled: false,
      liveRefundEnabled: false,
      invoiceSendEnabled: false,
      checkoutSessionCreated: false,
      paymentLinkCreated: false,
      capturesPayment: false,
      externalProviderWrite: false,
      productionEnabled: false,
      secretsPresent: false,
      credentialsStored: false,
      storesCredentials: false,
      oauthConfigured: false,
      webhookEnabled: false,
      customerVisible: false,
      customerSafe: false,
      legalReviewRequired: true,
      taxReviewRequired: true,
      privacyReviewRequired: true,
      under19Guarded: true,
      paymentProcessorSchema: "epoch.quote-payment",
      payloadMode: clean(input.payloadMode) || "provider-neutral-payment-json-preview",
      payloadSource: "epoch.quote-payment",
      payloadEntryCount: payloadPreview.length,
      readinessChecks: ["provider-candidate-required", "payment-provider-handoff-required", "quote-payment-schema-stable", "legal-review-required", "tax-review-required", "privacy-boundary-required", "under19-eligibility-gate", "sandbox-only-before-go-live", "operator-approval-required", "no-live-payment", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-checkout-session", "no-payment-capture", "no-refunds", "no-invoice-send", "no-customer-visible-payment-request"],
      payloadPreview,
      blockers: Array.isArray(input.blockers) ? input.blockers : ["No legal/tax/privacy review signoff", "No checkout credential storage", "No webhook signing secret", "No live payment capture or refund path", "Under-19 payment requests remain blocked before guardian consent"],
      nextActionAt: withTimezone(input.nextActionAt, timezone) || nowText,
      createdAt: nowText,
      updatedAt: nowText,
      receiptIds: [],
      notes: clean(input.note) || "Sandbox payment provider prototype created from EPOCH quote/payment readiness records without live provider behavior."
    };
    const receipt = {
      id: `receipt-payment-provider-prototype-${stamp(now)}`,
      kind: "payment-provider-prototype",
      status: "complete",
      createdAt: nowText,
      note: `${prototype.title}: local payment payload preview created without live checkout, invoice sending, capture, refunds, OAuth, secrets, webhooks, provider writes, or customer-visible payment requests.`
    };
    const healthCheck = {
      id: `monitor-check-payment-prototype-${stamp(now)}`,
      title: "Sandbox Payment Provider Prototype",
      status: "complete",
      target: "monitor-payment-prototype",
      effect: "payment-provider-sandbox-proof",
      createdAt: nowText,
      summary: `${prototype.title} generated ${payloadPreview.length} local payment payload preview items from quote/payment readiness records.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };
    prototype.receiptIds.push(receipt.id);
    nextData.paymentProviderPrototypes.unshift(prototype);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        prototype,
        receipt,
        healthCheck
      }
    };
  }

  function transitionPaymentProviderPrototypeRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const nowText = withTimezone(now.toISOString(), timezone);
    const prototype = nextData.paymentProviderPrototypes.find((item) => clean(item.id) === clean(input.prototypeId || input.id));
    if (!prototype) throw new Error("Select a sandbox payment provider prototype before applying an action.");
    const action = clean(input.action) || "generate-preview";
    const note = clean(input.note) || "Sandbox payment provider prototype reviewed without live provider behavior.";
    const ensureChecks = (checks) => {
      prototype.readinessChecks = Array.isArray(prototype.readinessChecks) ? prototype.readinessChecks : [];
      for (const check of checks) {
        if (!prototype.readinessChecks.includes(check)) prototype.readinessChecks.push(check);
      }
    };

    if (action === "generate-preview") {
      prototype.payloadPreview = paymentProviderPayloadPreview(nextData, Number(input.payloadLimit) || 4);
      prototype.payloadEntryCount = prototype.payloadPreview.length;
      prototype.status = "queued";
      prototype.prototypeStatus = "payload-ready";
    } else if (action === "approve-sandbox") {
      prototype.status = "approved";
      prototype.prototypeStatus = "sandbox-approved";
    } else if (action === "mark-reviewed") {
      prototype.status = "complete";
      prototype.prototypeStatus = "operator-reviewed";
    } else if (action === "defer") {
      prototype.status = "waiting";
      prototype.prototypeStatus = "deferred";
    } else if (action === "block") {
      prototype.status = "blocked";
      prototype.prototypeStatus = "blocked";
    } else {
      throw new Error("unsupported sandbox payment provider action");
    }

    ensureChecks(["provider-candidate-required", "payment-provider-handoff-required", "quote-payment-schema-stable", "legal-review-required", "tax-review-required", "privacy-boundary-required", "under19-eligibility-gate", "sandbox-only-before-go-live", "operator-approval-required", "no-live-payment", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-checkout-session", "no-payment-capture", "no-refunds", "no-invoice-send", "no-customer-visible-payment-request"]);
    prototype.adapterFamily = "payment";
    prototype.sandboxOnly = true;
    prototype.localOnly = true;
    prototype.livePaymentEnabled = false;
    prototype.liveCheckoutEnabled = false;
    prototype.liveCaptureEnabled = false;
    prototype.liveRefundEnabled = false;
    prototype.invoiceSendEnabled = false;
    prototype.checkoutSessionCreated = false;
    prototype.paymentLinkCreated = false;
    prototype.capturesPayment = false;
    prototype.externalProviderWrite = false;
    prototype.productionEnabled = false;
    prototype.secretsPresent = false;
    prototype.credentialsStored = false;
    prototype.storesCredentials = false;
    prototype.oauthConfigured = false;
    prototype.webhookEnabled = false;
    prototype.customerVisible = false;
    prototype.customerSafe = false;
    prototype.legalReviewRequired = true;
    prototype.taxReviewRequired = true;
    prototype.privacyReviewRequired = true;
    prototype.under19Guarded = true;
    prototype.paymentProcessorSchema = "epoch.quote-payment";
    prototype.payloadSource = "epoch.quote-payment";
    prototype.updatedAt = nowText;
    prototype.notes = note;

    const receipt = {
      id: `receipt-payment-provider-prototype-${stamp(now)}`,
      kind: "payment-provider-prototype",
      status: prototype.status === "blocked" ? "blocked" : "complete",
      createdAt: nowText,
      note: `${prototype.title}: ${action} recorded without live checkout, invoice sending, capture, refunds, OAuth, secrets, webhooks, provider writes, or customer-visible payment requests. ${note}`
    };
    const healthCheck = {
      id: `monitor-check-payment-prototype-${stamp(now)}`,
      title: "Sandbox Payment Provider Prototype",
      status: prototype.status === "blocked" ? "blocked" : "complete",
      target: "monitor-payment-prototype",
      effect: "payment-provider-sandbox-proof",
      createdAt: nowText,
      summary: `${prototype.title} is ${prototype.prototypeStatus}; payment behavior remains sandbox/local only.`,
      receiptId: receipt.id,
      visibility: "internal",
      customerVisible: false
    };

    prototype.receiptIds = Array.isArray(prototype.receiptIds) ? prototype.receiptIds : [];
    prototype.receiptIds.push(receipt.id);
    nextData.receipts.unshift(receipt);
    nextData.monitorHealthChecks.unshift(healthCheck);

    return {
      data: nextData,
      records: {
        prototype,
        receipt,
        healthCheck
      }
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
    const marketingConversion = summarizeMarketingConversionState(data);
    const providerAdapters = summarizeProviderAdapterSelectionState(data);
    const calendarExport = createCalendarExport(data, { now: nowText });
    const calendarAdapter = summarizeCalendarAdapterPrototypeState(data, { now: nowText, calendarExport, providerAdapters });
    const paymentProvider = summarizePaymentProviderState(data, { quotes });
    const paymentPrototype = summarizePaymentProviderPrototypeState(data, { providerAdapters, paymentProvider });
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
      marketingConversionEvents: marketingConversion.eventCount,
      marketingConversionReady: marketingConversion.readyEvents,
      providerAdapterCandidates: providerAdapters.candidateCount,
      providerAdapterReady: providerAdapters.readyCandidates,
      calendarAdapterPrototypes: calendarAdapter.prototypeCount,
      calendarAdapterPayloadReady: calendarAdapter.payloadReady,
      paymentProviderPrototypes: paymentPrototype.prototypeCount,
      paymentPrototypePayloadReady: paymentPrototype.payloadReady,
      copyComplianceViolations: marketing.copyViolations
    };
    const summaryByKey = {
      health: `${baseSummary.health}; ${baseSummary.risks} risks`,
      queue: `${baseSummary.queue} queued records`,
      "visible-updates": `${baseSummary.visibleUpdates} visible updates`,
      pipeline: `${revenue.pipelineCount} opportunities; ${baseSummary.pipelineValueJpy} JPY pipeline`,
      marketing: `${marketing.ready} ready campaigns; ${marketingConversion.readyEvents} KPI events; ${providerAdapters.readyCandidates} provider candidates; ${calendarAdapter.payloadReady} calendar prototypes; ${paymentPrototype.payloadReady} payment prototypes; ${marketing.copyViolations} copy policy violations`
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

  function summarizeCalendarProviderState(currentData, options = {}) {
    const data = normalizedOperatingData(currentData);
    const calendarExport = options.calendarExport || createCalendarExport(data, { now: options.now || "2026-06-01T12:00:00+09:00" });
    const handoffs = data.calendarProviderHandoffs.map((handoff) => {
      const targetProvider = clean(handoff.targetProvider) || "provider-neutral";
      const providerKind = clean(handoff.providerKind) || "provider-neutral";
      const syncMode = clean(handoff.syncMode) || "provider-export-readiness";
      const status = clean(handoff.status) || "planned";
      const visibility = clean(handoff.visibility) || "internal";
      const customerVisible = handoff.customerVisible === true;
      const liveSyncEnabled = handoff.liveSyncEnabled === true;
      const sendsInvitations = handoff.sendsInvitations === true;
      const externalProviderWrite = handoff.externalProviderWrite === true;
      const eventSourceKinds = Array.isArray(handoff.eventSourceKinds) ? handoff.eventSourceKinds : [];
      const readinessChecks = Array.isArray(handoff.readinessChecks) ? handoff.readinessChecks : [];
      const receiptIds = Array.isArray(handoff.receiptIds) ? handoff.receiptIds : [];
      const handoffHistory = Array.isArray(handoff.handoffHistory) ? handoff.handoffHistory : [];
      const violations = [];

      if (visibility !== "internal" || customerVisible) {
        violations.push("Calendar provider handoff must remain internal-only until a controlled customer invitation surface exists.");
      }
      if (liveSyncEnabled || sendsInvitations || externalProviderWrite) {
        violations.push("Calendar provider handoff cannot enable live sync, live provider writes, or invitation sending in this slice.");
      }
      if (!targetProvider) {
        violations.push("Calendar provider handoff is missing a provider target.");
      }
      if (status === "complete" && !receiptIds.length) {
        violations.push("Completed calendar provider handoff requires a receipt trail.");
      }
      if (syncMode === "invitation-readiness" && !readinessChecks.includes("no-provider-send")) {
        violations.push("Invitation readiness must prove no provider send occurs.");
      }

      return {
        id: clean(handoff.id),
        title: clean(handoff.title) || "Calendar Provider Handoff",
        sourceSystem: clean(handoff.sourceSystem) || "EPOCH",
        targetProvider,
        providerKind,
        syncMode,
        status,
        handoffStatus: clean(handoff.handoffStatus) || "pending",
        invitationPolicy: clean(handoff.invitationPolicy) || "no-live-send",
        customerSafeStatus: clean(handoff.customerSafeStatus) || "preview-pending",
        visibility,
        customerVisible,
        liveSyncEnabled,
        sendsInvitations,
        externalProviderWrite,
        calendarExportSchema: clean(handoff.calendarExportSchema) || calendarExport.schema,
        eventSourceKinds,
        readinessChecks,
        nextActionAt: clean(handoff.nextActionAt),
        updatedAt: clean(handoff.updatedAt),
        receiptIds,
        handoffHistory,
        notes: clean(handoff.notes) || "No provider handoff note recorded.",
        violations
      };
    });
    const violations = handoffs.flatMap((handoff) => handoff.violations.map((detail) => `${handoff.title || handoff.id}: ${detail}`));

    return {
      schema: "epoch.calendar-provider-handoff",
      handoffCount: handoffs.length,
      providerReady: handoffs.filter((item) => item.syncMode === "provider-export-readiness").length,
      invitationReady: handoffs.filter((item) => item.syncMode === "invitation-readiness").length,
      queued: handoffs.filter((item) => item.status === "queued").length,
      complete: handoffs.filter((item) => item.status === "complete").length,
      blocked: handoffs.filter((item) => item.status === "blocked").length,
      customerSafe: handoffs.filter((item) => clean(item.customerSafeStatus).includes("ready") || clean(item.customerSafeStatus).includes("preview")).length,
      noLiveSend: handoffs.filter((item) => !item.liveSyncEnabled && !item.sendsInvitations && !item.externalProviderWrite).length,
      providerKinds: new Set(handoffs.map((item) => item.providerKind).filter(Boolean)).size,
      exportEntries: calendarExport.counts.total,
      customerVisibleEntries: calendarExport.counts.customerVisible,
      violations,
      status: violations.length ? "blocked" : "ready",
      handoffs
    };
  }

  function createCalendarProviderHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const createdAt = withTimezone(now.toISOString(), timezone);
    const handoff = {
      id: clean(input.id) || `calendar-provider-${stamp(now)}`,
      title: clean(input.title) || "Calendar Provider Handoff",
      sourceSystem: "EPOCH",
      targetProvider: clean(input.targetProvider) || "provider-neutral",
      providerKind: clean(input.providerKind) || "provider-neutral",
      syncMode: clean(input.syncMode) || "provider-export-readiness",
      status: clean(input.status) || "planned",
      handoffStatus: clean(input.handoffStatus) || "adapter-deferred",
      invitationPolicy: clean(input.invitationPolicy) || "no-live-send",
      customerSafeStatus: clean(input.customerSafeStatus) || "preview-ready",
      visibility: "internal",
      customerVisible: false,
      liveSyncEnabled: false,
      sendsInvitations: false,
      externalProviderWrite: false,
      calendarExportSchema: "epoch.calendar-export",
      eventSourceKinds: Array.isArray(input.eventSourceKinds) ? input.eventSourceKinds : ["session", "assignment"],
      readinessChecks: Array.isArray(input.readinessChecks) ? input.readinessChecks : ["timezone-normalized", "operator-approval-required", "no-provider-send"],
      nextActionAt: withTimezone(input.nextActionAt, timezone) || createdAt,
      createdAt,
      updatedAt: createdAt,
      receiptIds: [],
      handoffHistory: [
        {
          action: "create",
          status: clean(input.status) || "planned",
          at: createdAt,
          note: clean(input.note) || "Calendar provider handoff created for operator review."
        }
      ],
      notes: clean(input.note) || "Calendar provider handoff created for operator review."
    };
    nextData.calendarProviderHandoffs.unshift(handoff);
    return {
      data: nextData,
      records: {
        handoff
      }
    };
  }

  function transitionCalendarProviderHandoffRecords(currentData, input = {}, options = {}) {
    const nextData = normalizedOperatingData(currentData);
    const now = options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const updatedAt = withTimezone(now.toISOString(), timezone);
    const handoffId = clean(input.handoffId || input.id);
    const action = clean(input.action) || "verify";
    const note = clean(input.note) || "Calendar provider handoff reviewed by operator.";
    const handoff = nextData.calendarProviderHandoffs.find((item) => item.id === handoffId);
    if (!handoff) throw new Error("calendar provider handoff not found");

    if (action === "verify") {
      handoff.status = "complete";
      handoff.handoffStatus = "verified-provider-deferred";
    } else if (action === "prepare") {
      handoff.status = "queued";
      handoff.handoffStatus = "provider-payload-ready";
    } else if (action === "mark-ready") {
      handoff.status = "queued";
      handoff.handoffStatus = "adapter-ready-without-live-send";
    } else if (action === "invite-ready") {
      handoff.status = "queued";
      handoff.syncMode = "invitation-readiness";
      handoff.handoffStatus = "operator-preview-ready";
      handoff.customerSafeStatus = "ready-to-preview";
      handoff.invitationPolicy = "operator-approved-no-live-send";
      if (!Array.isArray(handoff.readinessChecks)) handoff.readinessChecks = [];
      if (!handoff.readinessChecks.includes("no-provider-send")) handoff.readinessChecks.push("no-provider-send");
    } else if (action === "block") {
      handoff.status = "blocked";
      handoff.handoffStatus = "blocked";
    } else {
      throw new Error("unsupported calendar provider action");
    }

    handoff.visibility = "internal";
    handoff.customerVisible = false;
    handoff.liveSyncEnabled = false;
    handoff.sendsInvitations = false;
    handoff.externalProviderWrite = false;
    handoff.updatedAt = updatedAt;
    handoff.nextActionAt = withTimezone(input.nextActionAt, timezone) || handoff.nextActionAt || updatedAt;
    handoff.notes = note;
    if (!Array.isArray(handoff.handoffHistory)) handoff.handoffHistory = [];
    handoff.handoffHistory.unshift({
      action,
      status: handoff.status,
      at: updatedAt,
      note
    });

    const receiptId = `receipt-calendar-provider-${stamp(now)}`;
    if (!Array.isArray(handoff.receiptIds)) handoff.receiptIds = [];
    handoff.receiptIds.unshift(receiptId);
    const healthCheck = {
      id: `monitor-check-calendar-provider-${stamp(now)}`,
      actionId: `calendar-provider-${action}`,
      receiptId,
      title: `Calendar provider ${action}`,
      summary: `${handoff.title}: ${note}`,
      status: handoff.status,
      priority: action === "block" ? "high" : "medium",
      effect: "calendar-provider-handoff",
      target: "monitor-calendar-provider",
      owner: clean(input.owner) || "Jack",
      createdAt: updatedAt,
      visibility: "internal",
      customerVisible: false
    };
    const receipt = {
      id: receiptId,
      customerId: null,
      kind: "calendar-provider-handoff",
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
      ...(currentData.marketingConversionEvents || []).map((item) => ({ kind: "marketing conversion", id: item.id, title: item.title, status: item.status || item.readinessStatus, time: item.nextActionAt || item.occurredAt || item.updatedAt || item.createdAt, owner: item.eventType || item.primaryConversion || "conversion" })),
      ...(currentData.providerAdapterCandidates || []).map((item) => ({ kind: "provider adapter", id: item.id, title: item.title, status: item.status || item.readinessStatus, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.providerFamily || item.targetProvider || "provider" })),
      ...(currentData.calendarAdapterPrototypes || []).map((item) => ({ kind: "calendar adapter", id: item.id, title: item.title, status: item.status || item.prototypeStatus, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.targetProvider || item.adapterMode || "calendar" })),
      ...(currentData.notificationProviderPrototypes || []).map((item) => ({ kind: "notification prototype", id: item.id, title: item.title, status: item.status || item.prototypeStatus, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.targetProvider || item.adapterMode || "notification" })),
      ...(currentData.paymentProviderPrototypes || []).map((item) => ({ kind: "payment prototype", id: item.id, title: item.title, status: item.status || item.prototypeStatus, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.targetProvider || item.adapterMode || "payment" })),
      ...(currentData.customerAccountHistories || []).map((item) => ({ kind: "account history", id: item.id, title: item.displayName || item.id, status: item.status, time: item.updatedAt || item.reviewedAt, owner: item.visibility || "customer history" })),
      ...currentData.workPlans.map((item) => ({ kind: "agent work plan", id: item.id, title: item.title, status: item.status, time: item.dueAt, owner: item.approvalStatus || item.owner || "approval pending" })),
      ...currentData.agentHandoffs.map((item) => ({ kind: "agent handoff", id: item.id, title: item.title, status: item.status, time: item.nextActionAt, owner: item.approvalStatus || "approval pending" })),
      ...currentData.monitorHealthChecks.map((item) => ({ kind: "monitor check", id: item.id, title: item.title, status: item.status, time: item.createdAt, owner: item.target || item.owner || "monitor" })),
      ...currentData.notificationEvents.map((item) => ({ kind: "update", id: item.id, title: item.title, status: item.status, time: item.deliverAfterAt || item.createdAt, owner: item.deliveryStatus || "pending" })),
      ...(currentData.notificationDeliveries || []).map((item) => ({ kind: "notification delivery", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.createdAt, owner: item.provider || item.channel || "outbox" })),
      ...(currentData.notificationProviderHandoffs || []).map((item) => ({ kind: "notification provider", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.targetProvider || item.handoffStatus || "notifications" })),
      ...(currentData.paymentProviderHandoffs || []).map((item) => ({ kind: "payment provider", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.targetProvider || item.handoffStatus || "payments" })),
      ...(currentData.authSessionRoleHandoffs || []).map((item) => ({ kind: "auth/session role", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.roleKey || item.surface || "auth" })),
      ...(currentData.quotes || []).map((item) => ({ kind: "quote", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.validUntil || item.createdAt, owner: item.paymentStatus || item.approvalStatus || "quote" })),
      ...(currentData.reminderRules || []).map((item) => ({ kind: "reminder rule", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.reminderAt, owner: item.channel || "reminder" })),
      ...(currentData.recurrenceCandidates || []).map((item) => ({ kind: "recurrence candidate", id: item.id, title: item.title, status: item.status, time: item.nextCandidateAt || item.createdAt, owner: item.cadence || "recurrence" })),
      ...(currentData.availabilityWindows || []).map((item) => ({ kind: "availability window", id: item.id, title: item.title, status: item.status, time: item.startAt || item.createdAt, owner: item.owner || "availability" })),
      ...(currentData.accessGateways || []).map((item) => ({ kind: "access gateway", id: item.id, title: item.label, status: item.status, time: item.updatedAt || item.lastVerifiedAt || item.createdAt, owner: item.publicExposure || item.policy || "access" })),
      ...(currentData.librarySyncHandoffs || []).map((item) => ({ kind: "library sync", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.handoffStatus || item.targetSystem || "LIBRARY" })),
      ...(currentData.calendarProviderHandoffs || []).map((item) => ({ kind: "calendar provider", id: item.id, title: item.title, status: item.status, time: item.nextActionAt || item.updatedAt || item.createdAt, owner: item.targetProvider || item.handoffStatus || "calendar" })),
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
    const notificationProvider = summarizeNotificationProviderState(data, { notifications });
    const quotes = summarizeQuoteState(data);
    const paymentProvider = summarizePaymentProviderState(data, { quotes });
    const authSession = summarizeAuthSessionRoleState(data);
    const accountHistory = summarizeCustomerAccountHistoryState(data);
    const scheduleControls = summarizeScheduleControlState(data);
    const handoffs = summarizeAgentHandoffState(data);
    const marketing = summarizeMarketingState(data);
    const marketingConversion = summarizeMarketingConversionState(data);
    const providerAdapters = summarizeProviderAdapterSelectionState(data);
    const paymentPrototype = summarizePaymentProviderPrototypeState(data, { providerAdapters, paymentProvider });
    const calendarExport = createCalendarExport(data, { now: nowText });
    const calendarAdapter = summarizeCalendarAdapterPrototypeState(data, { now: nowText, calendarExport, providerAdapters });
    const notificationPrototype = summarizeNotificationProviderPrototypeState(data, { providerAdapters, notificationProvider });
    const calendarProvider = summarizeCalendarProviderState(data, { now: nowText, calendarExport });
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
    for (const item of timeline.filter((entry) => entry.kind === "notification delivery").slice(0, 3)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "access gateway").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "library sync").slice(0, 3)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "calendar provider").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "notification provider").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "notification prototype").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "payment provider").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "payment prototype").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "auth/session role").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "marketing conversion").slice(0, 5)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "provider adapter").slice(0, 6)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "calendar adapter").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
      if (activeStatuses.has(item.status) && !queue.some((entry) => entry.id === item.id)) queue.push(item);
    }
    for (const item of timeline.filter((entry) => entry.kind === "account history").slice(0, 4)) {
      if (!visibleTimeline.some((entry) => entry.id === item.id)) visibleTimeline.push(item);
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
    if (marketingConversion.violations.length) {
      risks.push({
        id: "marketing-conversion-readiness-violation",
        severity: "high",
        title: "Marketing Conversion KPI Readiness",
        detail: marketingConversion.violations[0]
      });
    }
    if (providerAdapters.violations.length) {
      risks.push({
        id: "provider-adapter-readiness-violation",
        severity: "high",
        title: "Provider Adapter Go/No-Go",
        detail: providerAdapters.violations[0]
      });
    }
    if (calendarAdapter.violations.length) {
      risks.push({
        id: "calendar-adapter-prototype-violation",
        severity: "high",
        title: "Sandbox Calendar Adapter",
        detail: calendarAdapter.violations[0]
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
    if (calendarProvider.violations.length) {
      risks.push({
        id: "calendar-provider-violation",
        severity: "high",
        title: "Calendar Provider Violation",
        detail: calendarProvider.violations[0]
      });
    }
    if (notificationProvider.violations.length) {
      risks.push({
        id: "notification-provider-violation",
        severity: "high",
        title: "Notification Provider Violation",
        detail: notificationProvider.violations[0]
      });
    }
    if (notificationPrototype.violations.length) {
      risks.push({
        id: "notification-provider-prototype-violation",
        severity: "high",
        title: "Sandbox Notification Provider",
        detail: notificationPrototype.violations[0]
      });
    }
    if (paymentProvider.violations.length) {
      risks.push({
        id: "payment-provider-violation",
        severity: "high",
        title: "Payment Provider Violation",
        detail: paymentProvider.violations[0]
      });
    }
    if (paymentPrototype.violations.length) {
      risks.push({
        id: "payment-provider-prototype-violation",
        severity: "high",
        title: "Sandbox Payment Provider",
        detail: paymentPrototype.violations[0]
      });
    }
    if (authSession.violations.length) {
      risks.push({
        id: "auth-session-role-violation",
        severity: "high",
        title: "Auth Session Role Violation",
        detail: authSession.violations[0]
      });
    }
    if (accountHistory.violations.length) {
      risks.push({
        id: "account-history-violation",
        severity: "high",
        title: "Customer Account History",
        detail: accountHistory.violations[0]
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
        notificationProviderHandoffs: notificationProvider.handoffCount,
        notificationProviderReady: notificationProvider.providerReady,
        notificationTemplateReady: notificationProvider.templateReady,
        notificationConsentReady: notificationProvider.consentReady,
        notificationProviderNoLiveSend: notificationProvider.noLiveSend,
        notificationProviderViolations: notificationProvider.violations.length,
        notificationProviderPrototypes: notificationPrototype.prototypeCount,
        notificationPrototypePayloadReady: notificationPrototype.payloadReady,
        notificationPrototypeSandboxOnly: notificationPrototype.sandboxOnly,
        notificationPrototypeLocalOnly: notificationPrototype.localOnly,
        notificationPrototypeNoLiveSend: notificationPrototype.noLiveSend,
        notificationPrototypeNoSecrets: notificationPrototype.noSecrets,
        notificationPrototypeNoCustomerVisibleSend: notificationPrototype.noCustomerVisibleSend,
        notificationPrototypeViolations: notificationPrototype.violations.length,
        paymentProviderHandoffs: paymentProvider.handoffCount,
        paymentProviderReady: paymentProvider.providerReady,
        paymentInvoiceReady: paymentProvider.invoiceReady,
        paymentCheckoutReady: paymentProvider.checkoutReady,
        paymentEligibilityReady: paymentProvider.eligibilityReady,
        paymentProviderNoLivePayment: paymentProvider.noLivePayment,
        paymentProviderViolations: paymentProvider.violations.length,
        paymentProviderPrototypes: paymentPrototype.prototypeCount,
        paymentPrototypePayloadReady: paymentPrototype.payloadReady,
        paymentPrototypeSandboxOnly: paymentPrototype.sandboxOnly,
        paymentPrototypeLocalOnly: paymentPrototype.localOnly,
        paymentPrototypeNoLivePayment: paymentPrototype.noLivePayment,
        paymentPrototypeNoSecrets: paymentPrototype.noSecrets,
        paymentPrototypeNoCustomerVisiblePayment: paymentPrototype.noCustomerVisiblePayment,
        paymentPrototypeNoPaymentCapture: paymentPrototype.noPaymentCapture,
        paymentPrototypeLegalTaxPrivacyReady: paymentPrototype.legalTaxPrivacyReady,
        paymentPrototypeUnder19Guarded: paymentPrototype.under19Guarded,
        paymentPrototypeViolations: paymentPrototype.violations.length,
        authSessionRoleHandoffs: authSession.handoffCount,
        authPublicReady: authSession.publicReady,
        authCustomerReady: authSession.customerReady,
        authInternalDenied: authSession.internalDenied,
        authNoLiveAuth: authSession.noLiveAuth,
        authSessionRoleViolations: authSession.violations.length,
        accountHistories: accountHistory.historyCount,
        accountHistoryEvents: accountHistory.timelineEvents,
        accountHistoryCustomerVisible: accountHistory.customerVisibleEvents,
        accountHistoryReceiptLinked: accountHistory.receiptLinked,
        accountHistoryLocalOnly: accountHistory.localOnly,
        accountHistoryViolations: accountHistory.violations.length,
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
        marketingConversionEvents: marketingConversion.eventCount,
        marketingConversionReady: marketingConversion.readyEvents,
        marketingConversionRecorded: marketingConversion.recordedEvents,
        marketingConversionNoLiveTracking: marketingConversion.noLiveTracking,
        marketingConversionPotentialValueJpy: marketingConversion.potentialValueJpy,
        marketingConversionViolations: marketingConversion.violations.length,
        providerAdapterCandidates: providerAdapters.candidateCount,
        providerAdapterReady: providerAdapters.readyCandidates,
        providerAdapterSandboxOnly: providerAdapters.sandboxOnly,
        providerAdapterNoLiveProvider: providerAdapters.noLiveProvider,
        providerAdapterNoSecrets: providerAdapters.noSecrets,
        providerAdapterApprovedSandboxOnly: providerAdapters.approvedSandboxOnly,
        providerAdapterHighRisk: providerAdapters.highRiskCandidates,
        providerAdapterLegalReviewRequired: providerAdapters.legalReviewRequired,
        providerAdapterPrivacyReviewRequired: providerAdapters.privacyReviewRequired,
        providerAdapterViolations: providerAdapters.violations.length,
        calendarAdapterPrototypes: calendarAdapter.prototypeCount,
        calendarAdapterPayloadReady: calendarAdapter.payloadReady,
        calendarAdapterSandboxOnly: calendarAdapter.sandboxOnly,
        calendarAdapterLocalOnly: calendarAdapter.localOnly,
        calendarAdapterNoLiveProvider: calendarAdapter.noLiveProvider,
        calendarAdapterNoSecrets: calendarAdapter.noSecrets,
        calendarAdapterNoInvitationSend: calendarAdapter.noInvitationSend,
        calendarAdapterViolations: calendarAdapter.violations.length,
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
        calendarProviderHandoffs: calendarProvider.handoffCount,
        calendarProviderReady: calendarProvider.providerReady,
        calendarInvitationReady: calendarProvider.invitationReady,
        calendarNoLiveSend: calendarProvider.noLiveSend,
        calendarProviderViolations: calendarProvider.violations.length,
        monitorHealthChecks: monitorHealthChecks.length,
        monitorActionReceipts: data.receipts.filter((item) => item.kind === "monitor-check").length,
        operatorActions: operatorActions.length
      },
      revenue,
      curriculum,
      notifications,
      notificationProvider,
      notificationPrototype,
      paymentProvider,
      paymentPrototype,
      authSession,
      accountHistory,
      quotes,
      scheduleControls,
      handoffs,
      marketing,
      marketingConversion,
      providerAdapters,
      calendarAdapter,
      calendarProvider,
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
    const calendarProvider = summarizeCalendarProviderState(data, { now: now.toISOString(), calendarExport });
    const notificationProvider = summarizeNotificationProviderState(data);
    const paymentProvider = summarizePaymentProviderState(data);
    const authSession = summarizeAuthSessionRoleState(data);
    const accountHistory = summarizeCustomerAccountHistoryState(data);
    const marketingConversion = summarizeMarketingConversionState(data);
    const providerAdapters = summarizeProviderAdapterSelectionState(data);
    const calendarAdapter = summarizeCalendarAdapterPrototypeState(data, { now: now.toISOString(), calendarExport, providerAdapters });
    const notificationPrototype = summarizeNotificationProviderPrototypeState(data, { providerAdapters, notificationProvider });
    const paymentPrototype = summarizePaymentProviderPrototypeState(data, { providerAdapters, paymentProvider });
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
      calendarProvider,
      notificationProvider,
      notificationPrototype,
      paymentProvider,
      paymentPrototype,
      authSession,
      accountHistory,
      marketingConversion,
      providerAdapters,
      calendarAdapter,
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
    createNotificationProviderHandoffRecords,
    transitionNotificationProviderHandoffRecords,
    createPaymentProviderHandoffRecords,
    transitionPaymentProviderHandoffRecords,
    createAuthSessionRoleHandoffRecords,
    transitionAuthSessionRoleHandoffRecords,
    createMarketingConversionEventRecords,
    transitionMarketingConversionEventRecords,
    createProviderAdapterCandidateRecords,
    transitionProviderAdapterCandidateRecords,
    createCalendarAdapterPrototypeRecords,
    transitionCalendarAdapterPrototypeRecords,
    createNotificationProviderPrototypeRecords,
    transitionNotificationProviderPrototypeRecords,
    createPaymentProviderPrototypeRecords,
    transitionPaymentProviderPrototypeRecords,
    createCustomerAccountHistoryRecords,
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
    createCalendarProviderHandoffRecords,
    transitionCalendarProviderHandoffRecords,
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
    summarizeCalendarProviderState,
    summarizeNotificationProviderState,
    summarizePaymentProviderState,
    summarizeAuthSessionRoleState,
    summarizeMarketingConversionState,
    summarizeProviderAdapterSelectionState,
    summarizeCalendarAdapterPrototypeState,
    summarizeNotificationProviderPrototypeState,
    summarizePaymentProviderPrototypeState,
    summarizeCustomerAccountHistoryState,
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
