# First Commercial Slice Checklist

## Goal

Define the first implementable EPOCH slice for revenue-supporting education and
service operations without waiting for every future CITADEL integration.

## Required screens or surfaces

- Public professional offer page.
- Intake path for diagnostics, cohorts, submissions, consultations, and service
  requests.
- Internal schedule/admin view.
- Student/customer status view or export-ready status page.
- EPOCH MONITOR status page for queue, overdue, risk, and receipt visibility.
- SCAFFOLD/HERMES-aligned route rail, top operating controls, command strips,
  muted operational cards, and monitor side navigation across the internal
  surfaces, with the public page using the same visual language in a
  commercially appropriate way.

## Required records

- Lead or prospect.
- Student/customer.
- Program or service track.
- Curriculum framework.
- Package gameplan.
- Campaign route for marketing and advertising automation.
- Cohort or engagement.
- Session.
- Assignment or service request.
- Submission or deliverable.
- Review/feedback item.
- Follow-up item.
- Receipt or outcome note.
- Controlled public/customer access gateway record.
- LIBRARY ledger sync/recovery handoff record.
- Calendar provider handoff and invitation-readiness record.
- Notification provider handoff and template/consent readiness record.

## Required operating states

- planned
- waiting
- submitted
- reviewing
- returned
- overdue
- blocked
- canceled
- complete

## Required revenue-supporting behaviors

- Schedule a diagnostic, cohort class, consultation, or service call.
- Accept, defer, or reject an opportunity from the internal admin surface.
- Convert accepted opportunities into an engagement, onboarding session,
  first submission plan, follow-up, and receipt.
- Show the package gameplan that explains cadence, milestones, and internal
  delivery readiness before the work becomes recurring labor.
- Create a submission or request window.
- Record when work is submitted.
- Record when review or feedback is returned.
- Show internal next actions.
- Show overdue submissions, reviews, and follow-ups.
- Give the student/customer a clear status view.
- Produce monitor-visible receipts for completed delivery.

## Acceptance criteria

- The first slice can administer at least one paid cohort or service engagement
  from intake through returned feedback.
- The provider can move a captured opportunity into a monitor-visible
  engagement without manually duplicating records.
- The provider can see today, upcoming, overdue, and blocked work.
- A student/customer can see what is due, what was submitted, what was returned,
  and what is next.
- The monitor can summarize health without manually reading every record.
- Public, admin, student/customer, and monitor surfaces share one aligned visual
  system while keeping public intake distinct from the internal control room.
- Public intake and customer-safe status are explicitly controlled through
  gateway records, while raw admin and EPOCH MONITOR exposure remain denied by
  default.
- LIBRARY sync/recovery handoffs are internal-only operating records with
  snapshot, recovery, receipt, search-readiness, and backup-readiness evidence.
- Calendar provider handoffs prepare Google/Microsoft-ready export and
  customer-safe invitation preview state while keeping live sync and invitation
  sending disabled.
- Notification provider handoffs prepare provider-neutral email, LINE/SMS, and
  template/consent readiness while keeping live sending, credentials, webhooks,
  and external provider writes disabled.
- EIKEN 5-1 and professional/service-support offers have reusable frameworks
  and package-level gameplans that support personalized delivery.
- Japan-wide and global campaign routes define channel, conversion action, copy
  policy, under-19 guard, and monitor KPI coverage before outreach begins.
- The slice does not depend on production payment, public notification delivery,
  full authentication, or live LIBRARY database/API persistence.
