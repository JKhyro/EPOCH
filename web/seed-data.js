window.EPOCH_SEED_DATA = {
  "generatedAt": "2026-06-01T10:58:00+09:00",
  "timezone": "Asia/Tokyo",
  "statuses": [
    "planned",
    "waiting",
    "submitted",
    "reviewing",
    "returned",
    "overdue",
    "blocked",
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
      "routing": "project-estimate",
      "status": "active"
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
  "customers": [
    {
      "id": "student-001",
      "displayName": "Adult writing student",
      "trackId": "track-eiken-upper",
      "ageBand": "adult",
      "externalStatus": "Review returned; next submission window opens June 3."
    },
    {
      "id": "client-001",
      "displayName": "Small business ops client",
      "trackId": "track-service-ops",
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
  "receipts": [
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
