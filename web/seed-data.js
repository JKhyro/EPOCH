window.EPOCH_SEED_DATA = {
  "generatedAt": "2026-06-01T10:58:00+09:00",
  "timezone": "Asia/Tokyo",
  "statuses": [
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
  ],
  "tracks": [
    {
      "id": "track-eiken-upper",
      "name": "EIKEN Upper Writing Lab",
      "market": "Japan-wide",
      "positioning": "Premium exam writing and structured review for serious students and adults.",
      "defaultPackage": "Cohort plus submission review"
    },
    {
      "id": "track-service-ops",
      "name": "Service Operations Support",
      "market": "Japan and global remote",
      "positioning": "Consulting, tech support, admin, CRM, and management-system delivery tracked through EPOCH.",
      "defaultPackage": "Consultation plus managed follow-up"
    }
  ],
  "offerPackages": [
    {
      "id": "pkg-eiken-writing-monthly",
      "trackId": "track-eiken-upper",
      "offerKind": "education",
      "name": "Premium EIKEN Writing Review",
      "audience": "Adults and serious test candidates",
      "deliveryModel": "Submission-first monthly review",
      "priceJpy": 45000,
      "marketRoute": "Japan-wide remote adults",
      "laborModel": "async-first",
      "routing": "submission-first",
      "status": "active"
    },
    {
      "id": "pkg-eiken-cohort-lab",
      "trackId": "track-eiken-upper",
      "offerKind": "education",
      "name": "EIKEN Cohort Writing Lab",
      "audience": "Small groups preparing for EIKEN 2, Pre-1, or 1",
      "deliveryModel": "Cohort plus weekly submissions",
      "priceJpy": 22000,
      "marketRoute": "Japan-wide grouped exam level",
      "laborModel": "cohort-scaled",
      "routing": "cohort",
      "status": "active"
    },
    {
      "id": "pkg-under19-assessment",
      "trackId": "track-eiken-upper",
      "offerKind": "education",
      "name": "Under-19 Compatibility Assessment",
      "audience": "Younger applicants requiring fit review",
      "deliveryModel": "Compatibility gate before acceptance",
      "priceJpy": 65000,
      "marketRoute": "restricted under-19 fit review",
      "laborModel": "high-touch-gated",
      "routing": "compatibility-required",
      "status": "restricted"
    },
    {
      "id": "pkg-ops-diagnostic",
      "trackId": "track-service-ops",
      "offerKind": "service_ops",
      "name": "Service Operations Diagnostic",
      "audience": "Small business and solo operators",
      "deliveryModel": "Consultation plus managed follow-up",
      "priceJpy": 30000,
      "marketRoute": "Japan and global remote",
      "laborModel": "diagnostic",
      "routing": "diagnostic",
      "status": "active"
    },
    {
      "id": "pkg-tech-support-retainer",
      "trackId": "track-service-ops",
      "offerKind": "technical_support",
      "name": "Remote Technical Support Retainer",
      "audience": "Operators needing recurring support",
      "deliveryModel": "Monthly support and request queue",
      "priceJpy": 80000,
      "marketRoute": "recurring remote operators",
      "laborModel": "retainer",
      "routing": "retainer",
      "status": "active"
    },
    {
      "id": "pkg-crm-system-build",
      "trackId": "track-service-ops",
      "offerKind": "management_system",
      "name": "Database / CRM System Build",
      "audience": "Businesses needing lightweight operating systems",
      "deliveryModel": "Scoped build plus handoff",
      "priceJpy": 150000,
      "marketRoute": "small business systems",
      "laborModel": "project-scoped",
      "routing": "project-estimate",
      "status": "active"
    }
  ],
  "curriculumFrameworks": [
    {
      "id": "framework-eiken-5-to-1-writing",
      "trackId": "track-eiken-upper",
      "title": "EIKEN 5-1 Adaptive Writing Ladder",
      "audience": "Adults and serious exam candidates",
      "levels": ["5", "4", "3", "Pre-2", "2", "Pre-1", "1"],
      "positioning": "Diagnostic-led writing improvement with level-specific tasks, reusable strategies, and teacher-reviewed feedback.",
      "diagnostic": "No-help baseline writing sample, goal interview, deadline check, and exam-level routing.",
      "cadence": "Weekly or biweekly submission windows with optional live review only when it moves the outcome forward.",
      "modules": [
        "Level fit and exam task control",
        "Idea generation and answer structure",
        "Reason development and examples",
        "Grammar cleanup and reusable phrase control",
        "Timed writing and final correction loop"
      ],
      "assessmentRules": [
        "Adults can enter through paid diagnostic or monthly review.",
        "Under-19 applicants require compatibility review and guardian agreement.",
        "Cohorts open only when level and schedule clusters are strong enough."
      ],
      "status": "active"
    },
    {
      "id": "framework-professional-writing-ops",
      "trackId": "track-service-ops",
      "title": "Professional Writing And Operations Support Framework",
      "audience": "Adults, freelancers, and small operators",
      "levels": ["diagnostic", "cleanup", "systemize", "handoff"],
      "positioning": "Outcome-first support for documents, CRM cleanup, SOPs, admin systems, and recurring operating requests.",
      "diagnostic": "Request intake, source-file check, deadline and risk review, then a scoped first deliverable.",
      "cadence": "Retainer or project windows with clear next actions, receipts, and controlled customer updates.",
      "modules": [
        "Request triage and source check",
        "Deliverable definition",
        "Draft or system cleanup",
        "Review and revision",
        "Handoff record and next-action plan"
      ],
      "assessmentRules": [
        "No broad ongoing support without a scoped diagnostic.",
        "Recurring support requires a queue, owner, and written handoff rule.",
        "Customer-visible status changes stay separate from internal agent work."
      ],
      "status": "active"
    }
  ],
  "packageGameplans": [
    {
      "id": "gameplan-premium-eiken-monthly",
      "packageId": "pkg-eiken-writing-monthly",
      "frameworkId": "framework-eiken-5-to-1-writing",
      "title": "Premium EIKEN Monthly Review Gameplan",
      "status": "active",
      "deliveryCadence": "4 submission windows per month with one diagnostic and three targeted improvement cycles.",
      "personalizationInputs": ["target level", "deadline", "baseline sample", "weakness pattern", "available study time"],
      "milestones": [
        "Baseline diagnostic returned with level fit and priority weaknesses.",
        "Personal writing template selected for the target EIKEN level.",
        "Two corrected submissions returned with revision targets.",
        "Final timed submission checked against exam-ready criteria."
      ],
      "customerVisibleSummary": "Your plan starts with a diagnostic, then moves through structured submissions, returned feedback, and exam-level milestones.",
      "internalReadiness": "Ready for paid diagnostic and monthly review delivery.",
      "nextMilestoneAt": "2026-06-03T18:00:00+09:00",
      "laborModel": "submission-first",
      "liveTouchPolicy": "Live calls are optional diagnostic or strategy checkpoints, not the core delivery unit.",
      "under19Policy": "Route under-19 applicants to compatibility assessment before this gameplan is offered."
    },
    {
      "id": "gameplan-eiken-cohort-lab",
      "packageId": "pkg-eiken-cohort-lab",
      "frameworkId": "framework-eiken-5-to-1-writing",
      "title": "EIKEN Cohort Writing Lab Gameplan",
      "status": "planned",
      "deliveryCadence": "Small-group weekly prompt plus shared strategy notes and individual correction windows.",
      "personalizationInputs": ["exam level cluster", "submission pace", "common weakness pattern", "cohort schedule"],
      "milestones": [
        "Cohort level and schedule cluster confirmed.",
        "Shared strategy worksheet released.",
        "Individual submission queue opened.",
        "Returned feedback summarized into next cohort focus."
      ],
      "customerVisibleSummary": "Cohort work opens when level and schedule fit are strong enough; individual correction remains tracked separately.",
      "internalReadiness": "Ready after demand cluster and schedule window are confirmed.",
      "nextMilestoneAt": "2026-06-05T20:00:00+09:00",
      "laborModel": "cohort-scaled",
      "liveTouchPolicy": "One compact group strategy session can support several submission reviews.",
      "under19Policy": "Younger candidates require guardian-led compatibility review and higher-touch pricing."
    },
    {
      "id": "gameplan-under19-compatibility",
      "packageId": "pkg-under19-assessment",
      "frameworkId": "framework-eiken-5-to-1-writing",
      "title": "Under-19 Compatibility Assessment Gameplan",
      "status": "restricted",
      "deliveryCadence": "Guardian-led fit review, baseline task, schedule-risk check, and acceptance decision before recurring work.",
      "personalizationInputs": ["target level", "guardian contact", "baseline sample", "study maturity", "schedule fit"],
      "milestones": [
        "Guardian or institution intake confirmed.",
        "Compatibility diagnostic completed.",
        "Schedule and behavior fit reviewed.",
        "Accept, defer, or close decision recorded."
      ],
      "customerVisibleSummary": "Younger applicants start with compatibility review before any recurring package is offered.",
      "internalReadiness": "Restricted route; ready only when guardian-led intake is complete.",
      "nextMilestoneAt": "2026-06-02T17:00:00+09:00",
      "laborModel": "high-touch-gated",
      "liveTouchPolicy": "Live time is assessment-only until fit is proven.",
      "under19Policy": "Required compatibility gate for all under-19 applicants."
    },
    {
      "id": "gameplan-ops-diagnostic",
      "packageId": "pkg-ops-diagnostic",
      "frameworkId": "framework-professional-writing-ops",
      "title": "Service Operations Diagnostic Gameplan",
      "status": "active",
      "deliveryCadence": "Request intake, source check, one diagnostic session, written action list, and follow-up receipt.",
      "personalizationInputs": ["business goal", "source files", "deadline", "systems used", "support boundary"],
      "milestones": [
        "Source files and access boundary confirmed.",
        "Diagnostic session scheduled.",
        "Written action list returned.",
        "Follow-up or retainer route selected."
      ],
      "customerVisibleSummary": "Your request is scoped before work starts, then tracked through status updates and a written handoff.",
      "internalReadiness": "Ready for scoped service requests and follow-up conversion.",
      "nextMilestoneAt": "2026-06-04T16:00:00+09:00",
      "laborModel": "diagnostic",
      "liveTouchPolicy": "Live time is used for scoping; recurring work moves through managed requests.",
      "under19Policy": "Not applicable; business and adult operator route only."
    },
    {
      "id": "gameplan-tech-support-retainer",
      "packageId": "pkg-tech-support-retainer",
      "frameworkId": "framework-professional-writing-ops",
      "title": "Remote Technical Support Retainer Gameplan",
      "status": "planned",
      "deliveryCadence": "Recurring request queue with weekly prioritization, status updates, and monthly operating receipt.",
      "personalizationInputs": ["systems used", "support boundary", "priority queue", "access rules"],
      "milestones": [
        "Support boundary confirmed.",
        "Request queue opened.",
        "First support item returned.",
        "Monthly support receipt issued."
      ],
      "customerVisibleSummary": "Recurring support runs through a managed request queue with visible status and monthly receipts.",
      "internalReadiness": "Ready after diagnostic and access boundary review.",
      "nextMilestoneAt": "2026-06-07T15:00:00+09:00",
      "laborModel": "retainer",
      "liveTouchPolicy": "Live support is reserved for issues that cannot be resolved asynchronously.",
      "under19Policy": "Not applicable; business and adult operator route only."
    },
    {
      "id": "gameplan-crm-system-build",
      "packageId": "pkg-crm-system-build",
      "frameworkId": "framework-professional-writing-ops",
      "title": "Database / CRM System Build Gameplan",
      "status": "planned",
      "deliveryCadence": "Scoped build plan, source-data review, prototype milestone, handoff notes, and follow-up support option.",
      "personalizationInputs": ["current data shape", "workflow pain", "handoff owner", "acceptance criteria"],
      "milestones": [
        "Scope and source data confirmed.",
        "Prototype milestone scheduled.",
        "Handoff checklist returned.",
        "Support or maintenance route selected."
      ],
      "customerVisibleSummary": "System builds start with scope and source-data review, then move through prototype and handoff milestones.",
      "internalReadiness": "Ready for project estimate after diagnostic evidence is available.",
      "nextMilestoneAt": "2026-06-10T18:00:00+09:00",
      "laborModel": "project-scoped",
      "liveTouchPolicy": "Live time is used for scope and handoff; build work remains milestone tracked.",
      "under19Policy": "Not applicable; business and adult operator route only."
    }
  ],
  "campaignRoutes": [
    {
      "id": "campaign-ja-english-accelerator",
      "campaignId": "cmp-ja-eiken-writing-001",
      "routeKey": "ja/offers/english-accelerator/intake",
      "name": "Japan English Progress Route",
      "regionScope": "jp",
      "languageProfile": "ja-en",
      "channel": "Japan SEO, LINE, note, X, referrals",
      "offerBundle": "english-cohort",
      "packageIds": ["pkg-eiken-writing-monthly", "pkg-eiken-cohort-lab"],
      "audienceTier": "19plus",
      "capacityMode": "cohort-plus-queue",
      "primaryConversion": "diagnostic_submit",
      "landingUrl": "#public",
      "publicRoute": "#public",
      "adminRoute": "#admin-campaign-routes",
      "monitorRoute": "#monitor-campaigns",
      "copySetId": "copy-outcome-workflow-ja-001",
      "ctaPrimary": "Submit diagnostic",
      "ctaSecondary": "Compare cohorts",
      "publicCopy": "Submission-based cohort workflow with teacher-reviewed correction, progress tracking, and a diagnostic route before enrollment.",
      "copyPolicy": "outcome-workflow-no-ai-forward",
      "copyRequiredTerms": ["submission", "cohort", "progress", "teacher-reviewed", "workflow"],
      "copyForbiddenTerms": ["AI", "automation-first", "1:1 intensive"],
      "complianceFlags": ["no-founder-pricing", "no-ai-forward-public-copy", "adult-first"],
      "monitorKpis": ["Route Health", "Submission-to-Enrollment", "Cohort Fill%", "Queue-to-Delivery SLA"],
      "weeklyCadence": "Week 1 diagnostic submissions; Week 2 cohort clustering; Week 3 proof bundle; Week 4 enrollment reminders.",
      "automationRule": "Every channel maps to this route key and source campaign id before intake is accepted.",
      "readinessStatus": "ready",
      "status": "ready",
      "startAt": "2026-06-03T09:00:00+09:00",
      "endAt": "2026-06-30T23:59:00+09:00",
      "goLiveAt": "2026-06-03T09:00:00+09:00",
      "owner": "Jack",
      "approver": "operator"
    },
    {
      "id": "campaign-ja-teacher-review-pack",
      "campaignId": "cmp-ja-review-pack-001",
      "routeKey": "ja/offers/teacher-review-pack/submission-path",
      "name": "Teacher Review Submission Pack",
      "regionScope": "jp",
      "languageProfile": "ja-en",
      "channel": "Community partners, search, referral messages",
      "offerBundle": "teacher-review",
      "packageIds": ["pkg-eiken-writing-monthly"],
      "audienceTier": "19plus",
      "capacityMode": "queue",
      "primaryConversion": "portfolio_submit",
      "landingUrl": "#public",
      "publicRoute": "#public",
      "adminRoute": "#admin-campaign-routes",
      "monitorRoute": "#monitor-campaigns",
      "copySetId": "copy-review-pack-ja-001",
      "ctaPrimary": "Submit writing sample",
      "ctaSecondary": "View review timeline",
      "publicCopy": "Submission review workflow for teacher-reviewed writing analysis, progress notes, and a clear correction timeline.",
      "copyPolicy": "teacher-reviewed-outcome-copy",
      "copyRequiredTerms": ["submission", "progress", "teacher-reviewed", "workflow"],
      "copyForbiddenTerms": ["AI", "automation-first", "1:1 intensive"],
      "complianceFlags": ["no-founder-pricing", "no-ai-forward-public-copy", "submission-first"],
      "monitorKpis": ["Route Health", "Submission-to-Enrollment", "Queue-to-Delivery SLA", "Copy Compliance Violations"],
      "weeklyCadence": "Two submission reminders, one proof bundle release, and one enrollment close reminder per week.",
      "automationRule": "Source channel and route key must be preserved on every diagnostic submission.",
      "readinessStatus": "ready",
      "status": "ready",
      "startAt": "2026-06-04T09:00:00+09:00",
      "endAt": "2026-06-30T23:59:00+09:00",
      "goLiveAt": "2026-06-04T09:00:00+09:00",
      "owner": "Jack",
      "approver": "operator"
    },
    {
      "id": "campaign-global-professional-support",
      "campaignId": "cmp-global-support-001",
      "routeKey": "global/offers/professional-support/tech-support",
      "name": "Global Professional Support Route",
      "regionScope": "global",
      "languageProfile": "en",
      "channel": "LinkedIn, Google Search, partner newsletters",
      "offerBundle": "tech-support",
      "packageIds": ["pkg-tech-support-retainer", "pkg-ops-diagnostic"],
      "audienceTier": "corporate",
      "capacityMode": "queue-retainer",
      "primaryConversion": "consult_booking",
      "landingUrl": "#public",
      "publicRoute": "#public",
      "adminRoute": "#admin-campaign-routes",
      "monitorRoute": "#monitor-campaigns",
      "copySetId": "copy-professional-support-global-001",
      "ctaPrimary": "Request diagnostic",
      "ctaSecondary": "Review support scope",
      "publicCopy": "Managed request workflow for technical support, documentation cleanup, progress visibility, and recurring operating support.",
      "copyPolicy": "service-outcome-copy",
      "copyRequiredTerms": ["workflow", "progress", "support", "request"],
      "copyForbiddenTerms": ["AI", "automation-first", "unlimited support"],
      "complianceFlags": ["scoped-diagnostic-required", "access-boundary-required"],
      "monitorKpis": ["Route Health", "Queue-to-Delivery SLA", "Premium Add-on Conversion"],
      "weeklyCadence": "Diagnostic audit offer, request queue reminder, and retainer follow-up each week.",
      "automationRule": "No support retainer is confirmed until source access and support boundary are recorded.",
      "readinessStatus": "planned",
      "status": "planned",
      "startAt": "2026-06-07T09:00:00+09:00",
      "endAt": "2026-07-05T23:59:00+09:00",
      "goLiveAt": "2026-06-07T09:00:00+09:00",
      "owner": "Jack",
      "approver": "operator"
    },
    {
      "id": "campaign-services-crm-database",
      "campaignId": "cmp-services-crm-001",
      "routeKey": "services/crm-database/workflow-audit",
      "name": "CRM And Database Workflow Audit",
      "regionScope": "dual",
      "languageProfile": "en",
      "channel": "LinkedIn, referrals, small-business outreach",
      "offerBundle": "crm-system",
      "packageIds": ["pkg-crm-system-build", "pkg-ops-diagnostic"],
      "audienceTier": "corporate",
      "capacityMode": "project-estimate",
      "primaryConversion": "consult_booking",
      "landingUrl": "#public",
      "publicRoute": "#public",
      "adminRoute": "#admin-campaign-routes",
      "monitorRoute": "#monitor-campaigns",
      "copySetId": "copy-crm-database-001",
      "ctaPrimary": "Request workflow audit",
      "ctaSecondary": "Download proposal outline",
      "publicCopy": "Workflow audit for CRM cleanup, database planning, progress checkpoints, and handoff-ready operating systems.",
      "copyPolicy": "project-scope-copy",
      "copyRequiredTerms": ["workflow", "progress", "handoff"],
      "copyForbiddenTerms": ["AI", "automation-first", "guaranteed revenue"],
      "complianceFlags": ["scoped-diagnostic-required", "data-boundary-required"],
      "monitorKpis": ["Route Health", "Queue-to-Delivery SLA", "Premium Add-on Conversion"],
      "weeklyCadence": "Audit invitation, source checklist, proposal follow-up, and handoff option reminder.",
      "automationRule": "Every inquiry must capture source-data shape before project estimate.",
      "readinessStatus": "planned",
      "status": "planned",
      "startAt": "2026-06-10T09:00:00+09:00",
      "endAt": "2026-07-10T23:59:00+09:00",
      "goLiveAt": "2026-06-10T09:00:00+09:00",
      "owner": "Jack",
      "approver": "operator"
    },
    {
      "id": "campaign-ja-under19-guardian-gate",
      "campaignId": "cmp-ja-under19-001",
      "routeKey": "ja/offers/under19/guardian-gate",
      "name": "Japan Under-19 Compatibility Gate",
      "regionScope": "jp",
      "languageProfile": "ja-en",
      "channel": "Guardian referrals, school contacts, partner placements",
      "offerBundle": "english-cohort",
      "packageIds": ["pkg-under19-assessment"],
      "audienceTier": "under19",
      "capacityMode": "compatibility-gate",
      "primaryConversion": "compatibility_request",
      "landingUrl": "#public",
      "publicRoute": "#public",
      "adminRoute": "#admin-campaign-routes",
      "monitorRoute": "#monitor-campaigns",
      "copySetId": "copy-under19-gate-ja-001",
      "ctaPrimary": "Request guardian-led assessment",
      "ctaSecondary": "Review compatibility rules",
      "publicCopy": "Guardian-led compatibility workflow before any paid recurring plan, with teacher-reviewed diagnostic submission and progress visibility.",
      "copyPolicy": "under19-guardian-gated-copy",
      "copyRequiredTerms": ["submission", "progress", "teacher-reviewed", "workflow", "guardian"],
      "copyForbiddenTerms": ["AI", "automation-first", "direct minor enrollment"],
      "guardianConsentRequired": true,
      "complianceFlags": ["guardian-consent-required", "no-paid-action-before-consent", "premium-under19-handling"],
      "monitorKpis": ["Route Health", "Under-19 Compliance Rate", "Copy Compliance Violations"],
      "weeklyCadence": "Compatibility intake review, guardian agreement check, and accept/defer/close decision follow-up.",
      "automationRule": "Under-19 leads cannot reach payment or enrollment until guardian consent is recorded.",
      "readinessStatus": "ready",
      "status": "ready",
      "startAt": "2026-06-03T09:00:00+09:00",
      "endAt": "2026-06-30T23:59:00+09:00",
      "goLiveAt": "2026-06-03T09:00:00+09:00",
      "owner": "Jack",
      "approver": "operator"
    }
  ],
  "leads": [
    {
      "id": "lead-001",
      "name": "Adult EIKEN Pre-1 prospect",
      "trackId": "track-eiken-upper",
      "status": "planned",
      "nextAction": "Diagnostic call",
      "nextActionAt": "2026-06-01T19:30:00+09:00"
    },
    {
      "id": "lead-002",
      "name": "Under-19 compatibility review",
      "trackId": "track-eiken-upper",
      "status": "waiting",
      "nextAction": "Guardian and compatibility assessment required before acceptance",
      "nextActionAt": "2026-06-02T17:00:00+09:00"
    }
  ],
  "opportunities": [
    {
      "id": "opp-001",
      "leadId": "lead-001",
      "packageId": "pkg-eiken-writing-monthly",
      "status": "planned",
      "estimatedValueJpy": 45000,
      "nextAction": "Confirm diagnostic and submission plan",
      "nextActionAt": "2026-06-01T19:30:00+09:00"
    }
  ],
  "engagements": [],
  "workPlans": [],
  "agentHandoffs": [],
  "routePlacements": [
    {
      "id": "synapse-epoch-admin",
      "label": "EPOCH Admin",
      "href": "#admin",
      "surface": "admin",
      "visibility": "internal",
      "routeKind": "suite-entry",
      "status": "ready",
      "sourceSystem": "EPOCH",
      "targetSystem": "SYNAPSE",
      "summaryKey": "queue",
      "placement": "link",
      "duplicateUi": false
    },
    {
      "id": "synapse-epoch-monitor",
      "label": "EPOCH MONITOR",
      "href": "#monitor",
      "surface": "monitor",
      "visibility": "internal",
      "routeKind": "monitor-entry",
      "status": "ready",
      "sourceSystem": "EPOCH",
      "targetSystem": "SYNAPSE",
      "summaryKey": "health",
      "placement": "link-or-embed",
      "duplicateUi": false
    },
    {
      "id": "synapse-epoch-customer-status",
      "label": "EPOCH Customer Status",
      "href": "#student",
      "surface": "student",
      "visibility": "controlled-customer",
      "routeKind": "status-entry",
      "status": "ready",
      "sourceSystem": "EPOCH",
      "targetSystem": "SYNAPSE",
      "summaryKey": "visible-updates",
      "placement": "link",
      "duplicateUi": false
    },
    {
      "id": "synapse-epoch-intake",
      "label": "EPOCH Intake",
      "href": "#public",
      "surface": "public",
      "visibility": "public-intake",
      "routeKind": "conversion-entry",
      "status": "ready",
      "sourceSystem": "EPOCH",
      "targetSystem": "SYNAPSE",
      "summaryKey": "pipeline",
      "placement": "link",
      "duplicateUi": false
    },
    {
      "id": "synapse-epoch-campaign-readiness",
      "label": "EPOCH Campaign Readiness",
      "href": "#monitor",
      "surface": "monitor",
      "visibility": "internal",
      "routeKind": "marketing-readiness",
      "status": "ready",
      "sourceSystem": "EPOCH",
      "targetSystem": "SYNAPSE",
      "summaryKey": "marketing",
      "placement": "link-or-embed",
      "duplicateUi": false
    }
  ],
  "notificationEvents": [
    {
      "id": "update-001",
      "customerId": "student-001",
      "sourceKind": "review",
      "sourceId": "review-001",
      "channel": "customer-update",
      "audience": "customer",
      "title": "Review returned",
      "summary": "Diagnostic review returned and next action created.",
      "status": "complete",
      "deliveryStatus": "posted",
      "visible": true,
      "createdAt": "2026-06-01T18:15:00+09:00",
      "deliverAfterAt": "2026-06-01T18:15:00+09:00"
    },
    {
      "id": "update-002",
      "customerId": "client-001",
      "sourceKind": "request",
      "sourceId": "request-001",
      "channel": "customer-update",
      "audience": "customer",
      "title": "Source files needed",
      "summary": "Service request is blocked pending source files.",
      "status": "blocked",
      "deliveryStatus": "blocked",
      "visible": true,
      "createdAt": "2026-06-01T12:05:00+09:00",
      "deliverAfterAt": "2026-06-01T12:05:00+09:00"
    }
  ],
  "notificationDeliveries": [],
  "quotes": [],
  "reminderRules": [],
  "recurrenceCandidates": [],
  "availabilityWindows": [],
  "customers": [
    {
      "id": "student-001",
      "displayName": "Adult writing student",
      "trackId": "track-eiken-upper",
      "packageId": "pkg-eiken-writing-monthly",
      "gameplanId": "gameplan-premium-eiken-monthly",
      "ageBand": "adult",
      "externalStatus": "Review returned; next submission window opens June 3."
    },
    {
      "id": "client-001",
      "displayName": "Small business ops client",
      "trackId": "track-service-ops",
      "packageId": "pkg-ops-diagnostic",
      "gameplanId": "gameplan-ops-diagnostic",
      "ageBand": "business",
      "externalStatus": "Service request blocked pending source files."
    }
  ],
  "cohorts": [
    {
      "id": "cohort-001",
      "trackId": "track-eiken-upper",
      "name": "June Premium Writing Lab",
      "status": "planned",
      "owner": "Jack",
      "startAt": "2026-06-03T20:00:00+09:00"
    }
  ],
  "sessions": [
    {
      "id": "session-001",
      "cohortId": "cohort-001",
      "title": "Diagnostic review and strategy session",
      "startAt": "2026-06-03T20:00:00+09:00",
      "endAt": "2026-06-03T21:00:00+09:00",
      "timezone": "Asia/Tokyo",
      "status": "planned"
    }
  ],
  "assignments": [
    {
      "id": "assignment-001",
      "cohortId": "cohort-001",
      "title": "EIKEN writing diagnostic submission",
      "dueAt": "2026-06-01T18:00:00+09:00",
      "status": "submitted",
      "externalVisible": true
    },
    {
      "id": "request-001",
      "customerId": "client-001",
      "title": "CRM cleanup estimate request",
      "dueAt": "2026-06-01T12:00:00+09:00",
      "status": "blocked",
      "externalVisible": true
    }
  ],
  "submissions": [
    {
      "id": "submission-001",
      "assignmentId": "assignment-001",
      "customerId": "student-001",
      "submittedAt": "2026-06-01T16:42:00+09:00",
      "status": "reviewing",
      "reviewDueAt": "2026-06-02T12:00:00+09:00"
    }
  ],
  "reviews": [
    {
      "id": "review-001",
      "submissionId": "submission-001",
      "owner": "Jack",
      "status": "returned",
      "returnedAt": "2026-06-01T18:10:00+09:00",
      "summary": "Feedback returned with next focus: reason development and word-count control."
    },
    {
      "id": "review-002",
      "submissionId": "submission-002",
      "owner": "Jack",
      "status": "overdue",
      "returnedAt": null,
      "summary": "Overdue placeholder proving monitor risk visibility."
    }
  ],
  "followups": [
    {
      "id": "followup-001",
      "customerId": "student-001",
      "title": "Send next submission window",
      "status": "planned",
      "nextActionAt": "2026-06-03T09:00:00+09:00"
    }
  ],
  "monitorScope": {
    "title": "EPOCH monitor commercial slice",
    "summary": "Keep the bounded commercial surface local-first while exposing only intake and controlled customer status outside the operator lane.",
    "localAuthority": "Browser-local operating ledger plus route tree in this workspace.",
    "allowedSurfaces": [
      "Public intake route may describe offers and collect requests.",
      "Controlled customer status may show delivery-safe updates only.",
      "Internal admin and monitor routes stay local to the operator lane."
    ],
    "blockedSurfaces": [
      "Do not expose raw admin or monitor routes on public hostnames.",
      "Do not publish customer-visible agent work before operator approval.",
      "Do not treat browser-local edits as durable writeback until a ledger snapshot exists."
    ],
    "verificationSteps": [
      "Verify route split locally before changing public campaign copy.",
      "Export a ledger snapshot before handoff, reset, or browser recovery.",
      "Keep public posture intake-only unless a controlled gateway is explicitly added and verified."
    ],
    "updatedAt": "2026-06-01T18:20:00+09:00",
    "reviewBy": "2026-06-05T18:00:00+09:00",
    "owner": "Jack"
  },
  "monitorMemory": [
    {
      "id": "memory-001",
      "title": "Public route is intake-only",
      "summary": "Japan-facing and global campaign routes can land on public intake, but raw monitor/admin routes remain local-only.",
      "status": "active",
      "updatedAt": "2026-06-01T18:18:00+09:00",
      "reviewBy": "2026-06-08T18:00:00+09:00",
      "owner": "Jack"
    },
    {
      "id": "memory-002",
      "title": "Dirty local ledger must be exported before handoff",
      "summary": "Modified-local or live-local persistence is usable for local control, but not a durable recovery point until export writes a receipt-bearing snapshot.",
      "status": "active",
      "updatedAt": "2026-06-01T18:19:00+09:00",
      "reviewBy": "2026-06-02T09:00:00+09:00",
      "owner": "Jack"
    },
    {
      "id": "memory-003",
      "title": "Awaiting-review work should stay visible",
      "summary": "Submitted and reviewing work must remain obvious in the monitor until feedback is returned or an explicit blocker is recorded.",
      "status": "stale",
      "updatedAt": "2026-05-29T12:00:00+09:00",
      "reviewBy": "2026-05-31T18:00:00+09:00",
      "owner": "Jack"
    }
  ],
  "accessPosture": {
    "mode": "local-first",
    "rawMonitor": "local-only",
    "rawAdmin": "local-only",
    "publicIntake": "#public",
    "customerStatus": "#student",
    "safeGateway": "none in this static slice",
    "defaultPublicPolicy": "deny-by-default",
    "operatorRule": "Customer-visible agent work stays blocked until operator approval is recorded.",
    "verificationStatus": "verified-local-route-split",
    "lastVerifiedAt": "2026-06-01T18:21:00+09:00",
    "notes": [
      "Route placement may point public traffic to intake only.",
      "Controlled customer status should exclude internal notes and raw receipts.",
      "A future public gateway must be explicitly controlled before monitor/admin exposure changes."
    ]
  },
  "monitorHealthChecks": [
    {
      "id": "monitor-check-seed-scope",
      "actionId": "seed-scope-baseline",
      "receiptId": "receipt-monitor-seed-scope",
      "title": "Scope route baseline",
      "summary": "Scope, memory, queue, timeline, risks, receipts, and safe access routes are visible in the local monitor.",
      "status": "complete",
      "priority": "medium",
      "effect": "record",
      "target": "monitor-scope",
      "owner": "Jack",
      "createdAt": "2026-06-01T18:22:00+09:00",
      "visibility": "internal",
      "customerVisible": false
    },
    {
      "id": "monitor-check-seed-access",
      "actionId": "seed-safe-access-baseline",
      "receiptId": "receipt-monitor-seed-access",
      "title": "Safe-access baseline",
      "summary": "Raw monitor and admin surfaces are local-only; public route remains intake-only until a controlled gateway is verified.",
      "status": "complete",
      "priority": "high",
      "effect": "acknowledge-posture",
      "target": "monitor-access",
      "owner": "Jack",
      "createdAt": "2026-06-01T18:23:00+09:00",
      "visibility": "internal",
      "customerVisible": false
    }
  ],
  "receipts": [
    {
      "id": "receipt-monitor-seed-scope",
      "customerId": null,
      "kind": "monitor-check",
      "status": "complete",
      "createdAt": "2026-06-01T18:22:00+09:00",
      "note": "Scope route baseline: Scope, memory, queue, timeline, risks, receipts, and safe access routes are visible in the local monitor."
    },
    {
      "id": "receipt-monitor-seed-access",
      "customerId": null,
      "kind": "monitor-check",
      "status": "complete",
      "createdAt": "2026-06-01T18:23:00+09:00",
      "note": "Safe-access baseline: raw monitor and admin surfaces are local-only; public route remains intake-only until a controlled gateway is verified."
    },
    {
      "id": "receipt-001",
      "customerId": "student-001",
      "kind": "returned-feedback",
      "status": "complete",
      "createdAt": "2026-06-01T18:15:00+09:00",
      "note": "Diagnostic review returned and next action created."
    }
  ]
};
