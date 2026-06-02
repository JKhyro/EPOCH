# Revised 13-Month Calendar Contract

## Status

Draft-only. Do not implement conversion logic until Jack approves the exact
calendar contract.

## Purpose

EPOCH must support both the standard Gregorian calendar and Jack's revised
13-month calendar. The revised calendar is a first-class EPOCH concern, but the
rules are not safe to infer.

## Required owner decisions

The 13-month calendar implementation is blocked until these rules are provided
or approved:

- month names and display order
- number of days in each month
- treatment of extra/intercalary days
- leap-year or leap-cycle behavior
- epoch anchor between Gregorian and revised-calendar dates
- day-of-week mapping
- date formatting and parsing rules
- timezone boundary behavior
- recurrence behavior across Gregorian and revised-calendar views
- public/customer display wording
- storage representation and version identifier

## Native C contract

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
