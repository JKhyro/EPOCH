# Education Operating Platform Boundary

## Purpose

This document defines the first commercial operating lane for EPOCH: a premium,
professional education and service-delivery platform that reduces manual labor
by coordinating classes, cohorts, submissions, reviews, requests, notifications,
and progress tracking.

The platform should support education revenue first, then generalize into ARA
revenue operations for consulting, tech support, clerical/admin, database, CRM,
management-system, and automation services.

## Positioning rules

- Lead Japan-facing offers with outcomes, structure, teacher-reviewed guidance,
  scheduling reliability, progress tracking, and professional support.
- Do not lead with AI terminology in English-education marketing.
- Do not sell generic tutoring as the primary product; sell exam/result
  coaching, structured writing review, cohort labs, submission packs, and
  managed progress.
- Prefer adults and serious students. Students under 19 should require
  compatibility assessment, guardian agreement, and either a limited accepted
  track or higher-touch pricing.
- Keep 1:1 live teaching premium and scarce. Use cohorts, submissions, and
  asynchronous review to reduce labor.

## Education products EPOCH must support

- EIKEN 5 through 1 tracks, with writing/interview/test-prep emphasis where
  relevant.
- TOEIC, IELTS, TOEFL, school/university writing, business English, and
  professional communication tracks as later catalog entries.
- Paid diagnostics.
- Submission review packs.
- Cohort labs with class sessions and submission windows.
- Premium exam sprints.
- Subscription study-material and strategy access after the operating workflow
  proves demand.

## Core workflow

1. Prospect enters through the website or direct intake.
2. Intake records age, goal, current level, schedule, compatibility, and urgency.
3. EPOCH creates diagnostic, class, submission, or consultation schedule items.
4. Student/customer submits work or request.
5. Internal admin view shows review deadlines, overdue work, and next actions.
6. Provider returns feedback, update, or next assignment.
7. External view shows the student/customer what is due, submitted, returned, or
   requested.
8. EPOCH MONITOR records lane health, queue state, risks, and receipts.

The first implementable checklist lives in
`docs/first-commercial-slice-checklist.md`.

## Website/platform requirements

- Professional public landing page for education services.
- Pricing and package pages that support premium positioning without founder
  discount language.
- Intake form for diagnostics, classes, submission packs, and consultations.
- Student/customer portal for schedule, requests, submissions, and updates.
- Admin portal for calendar, cohorts, queue, overdue items, and status.
- Marketing pages for Japan-wide service first, then global expansion.
- Content blocks for all-level EIKEN and later non-EIKEN test tracks.

## EPOCH MONITOR parity target

EPOCH MONITOR should follow the HERMES MONITOR capability pattern:

- generated local monitor state
- project/lane tree
- Summary, Scope, Memory, Queue, Timeline, Risks, and Receipts sections
- health indicators for overdue, blocked, stale, dirty, or awaiting-review work
- visible route/page integration
- safe local-first operation with public access denied unless access control is
  explicitly verified

The first parity pass should clone the capability model, not the exact HERMES
domain wording. EPOCH names should describe scheduling, education operations,
student/customer status, service requests, and revenue workflow health.

## Revenue expansion surfaces

EPOCH should be able to schedule and administer:

- education products
- consulting sessions
- tech support
- clerical/admin work
- database/CRM/management-system setup and maintenance
- business process documentation
- automation and internal tooling projects
- ARA-created service tasks that need tracking, follow-up, and revenue receipts

## Explicit deferrals

- Full payment processing.
- Public automated notification delivery.
- Production authentication.
- Deep LIBRARY persistence.
- Full HERMES-equivalent autopilot behavior.
- Full global advertising automation.
- Full LMS curriculum authoring.

These are planned phases, not v1 blockers.
