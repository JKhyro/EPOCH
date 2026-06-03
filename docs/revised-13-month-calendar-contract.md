# Revised 13-Month Calendar Contract

## Status

Draft-only for authoritative conversion. EPOCH may represent the approved
structural direction, but must not enable public conversion logic until Jack
approves the exact calendar contract.

## Purpose

EPOCH must support both the standard Gregorian calendar and Jack's revised
13-month calendar. The revised calendar is a first-class EPOCH concern. The
current structural direction is known: the year opens with a day outside the
13 months, each of the 13 months has 28 days, the first day of the year
coincides with the average first day of spring based on physical measurement
rather than a hard-coded Gregorian approximation, and the leap-year extra day is
also outside the months at the end of the year.

## Required owner decisions

The 13-month calendar implementation is blocked until these rules are provided
or approved:

- month names and display order
- final public names for the year-opening day and leap-year extra day
- measurement source and method for the average first day of spring
- leap-year or leap-cycle behavior
- epoch anchor between Gregorian and revised-calendar dates
- day-of-week mapping
- date formatting and parsing rules
- timezone boundary behavior
- recurrence behavior across Gregorian and revised-calendar views
- public/customer display wording
- storage representation and version identifier

## Native C contract

Current native boundary records rulepack readiness before conversion logic is
allowed. The first implementation uses:

- `EpochCalendarSystem` to distinguish Gregorian and revised-calendar schedule
  context.
- `EpochRecurrenceRule` to keep recurrence previews sandboxed until an operator
  approves the calendar context.
- `EpochDeadlineRule` and `EpochDeadlineHealth` to keep deadline status
  schedule-owned and customer-safe.
- `EpochRevisedCalendarRulepack` to hold every owner-approved decision required
  before revised-date conversion can run.
- `EpochRevisedCalendarDate` and `EpochRevisedCalendarConversionResult` to
  represent draft-safe revised-calendar projections while conversion remains
  gated.
- `epoch_revised_calendar_rulepack_blocks_conversion` as the guard for draft,
  partial, or disabled rulepacks.

Once approved, the native C core should own:

- Gregorian to revised-date conversion
- revised-date to Gregorian conversion
- validation of revised dates
- formatting tokens
- recurrence helpers that explicitly state which calendar system they use
- round-trip tests for every approved edge case

The Avalonia host, web surfaces, and MONITOR views may display revised-calendar
values, but they should not independently define conversion rules.

## Compatibility rules

- Store canonical timestamps in an unambiguous machine format.
- Treat revised-calendar display as a projection until the native conversion
  contract is accepted.
- Preserve the calendar-system identifier on user-facing schedule records.
- Never silently convert between calendar systems without an explicit display or
  scheduling context.

## Acceptance criteria

- The approved contract is recorded in this document or a linked successor doc.
- Native C tests cover normal days, boundary days, leap/intercalary behavior,
  invalid dates, round trips, timezone boundaries, and recurrence examples.
- EPOCH MONITOR can display which calendar system a schedule record uses.
