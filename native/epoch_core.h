#ifndef EPOCH_CORE_H
#define EPOCH_CORE_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum EpochOperatingStatus {
    EPOCH_STATUS_PLANNED = 0,
    EPOCH_STATUS_WAITING,
    EPOCH_STATUS_PROPOSED,
    EPOCH_STATUS_DRAFT,
    EPOCH_STATUS_PRESENTED,
    EPOCH_STATUS_AVAILABLE,
    EPOCH_STATUS_UNAVAILABLE,
    EPOCH_STATUS_QUEUED,
    EPOCH_STATUS_SUBMITTED,
    EPOCH_STATUS_REVIEWING,
    EPOCH_STATUS_RETURNED,
    EPOCH_STATUS_OVERDUE,
    EPOCH_STATUS_BLOCKED,
    EPOCH_STATUS_CLEAR,
    EPOCH_STATUS_APPROVED,
    EPOCH_STATUS_DISPATCHED,
    EPOCH_STATUS_ACKNOWLEDGED,
    EPOCH_STATUS_ACCEPTED,
    EPOCH_STATUS_HELD,
    EPOCH_STATUS_RELEASED,
    EPOCH_STATUS_WAITLISTED,
    EPOCH_STATUS_PROMOTED,
    EPOCH_STATUS_CONFIRMED,
    EPOCH_STATUS_NEEDS_RESCHEDULE,
    EPOCH_STATUS_IN_PROGRESS,
    EPOCH_STATUS_SENT,
    EPOCH_STATUS_FAILED,
    EPOCH_STATUS_SNOOZED,
    EPOCH_STATUS_RETRY_READY,
    EPOCH_STATUS_PAYMENT_READY,
    EPOCH_STATUS_PAYMENT_BLOCKED,
    EPOCH_STATUS_PAID_RECORDED,
    EPOCH_STATUS_DECLINED,
    EPOCH_STATUS_REJECTED,
    EPOCH_STATUS_ROLLED_BACK,
    EPOCH_STATUS_CANCELED,
    EPOCH_STATUS_COMPLETE
} EpochOperatingStatus;

typedef enum EpochOperatingType {
    EPOCH_TYPE_DIAGNOSTIC = 0,
    EPOCH_TYPE_COHORT_SESSION,
    EPOCH_TYPE_ASSIGNMENT_WINDOW,
    EPOCH_TYPE_SUBMISSION_DEADLINE,
    EPOCH_TYPE_REVIEW_DEADLINE,
    EPOCH_TYPE_REQUEST,
    EPOCH_TYPE_FOLLOW_UP,
    EPOCH_TYPE_RECEIPT
} EpochOperatingType;

typedef enum EpochProviderKind {
    EPOCH_PROVIDER_CALENDAR = 0,
    EPOCH_PROVIDER_AVAILABILITY,
    EPOCH_PROVIDER_REMINDER,
    EPOCH_PROVIDER_STATUS
} EpochProviderKind;

typedef enum EpochCalendarSystem {
    EPOCH_CALENDAR_GREGORIAN = 0,
    EPOCH_CALENDAR_REVISED_13_MONTH
} EpochCalendarSystem;

typedef enum EpochDeadlineHealth {
    EPOCH_DEADLINE_ON_TRACK = 0,
    EPOCH_DEADLINE_AT_RISK,
    EPOCH_DEADLINE_OVERDUE,
    EPOCH_DEADLINE_BLOCKED
} EpochDeadlineHealth;

typedef struct EpochScheduleEntry {
    const char *id;
    const char *title;
    const char *notes;
    const char *start_iso;
    const char *end_iso;
    const char *timezone;
    EpochOperatingStatus status;
} EpochScheduleEntry;

typedef struct EpochScheduleRequest {
    const char *id;
    const char *requester;
    const char *requested_window;
    const char *timezone;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
    int sandbox_only;
    int provider_go_live_requested;
} EpochScheduleRequest;

typedef struct EpochAvailabilityWindow {
    const char *id;
    const char *label;
    const char *start_iso;
    const char *end_iso;
    const char *timezone;
    int capacity;
    int holds;
    EpochOperatingStatus status;
} EpochAvailabilityWindow;

typedef struct EpochTimingHandoff {
    const char *id;
    const char *source_product;
    const char *source_handoff_id;
    const char *schedule_request_id;
    const char *requested_window;
    const char *timezone;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int sandbox_only;
    int provider_go_live_requested;
} EpochTimingHandoff;

typedef struct EpochAvailabilityConflictDecision {
    const char *id;
    const char *timing_handoff_id;
    const char *schedule_request_id;
    const char *availability_window_id;
    const char *conflict_type;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
    int sandbox_only;
    int provider_go_live_requested;
} EpochAvailabilityConflictDecision;

typedef struct EpochScheduleRequestAcceptance {
    const char *id;
    const char *schedule_request_id;
    const char *availability_window_id;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
    int sandbox_only;
    int provider_go_live_requested;
} EpochScheduleRequestAcceptance;

typedef struct EpochAvailabilityHold {
    const char *id;
    const char *acceptance_id;
    const char *schedule_request_id;
    const char *availability_window_id;
    const char *start_iso;
    const char *end_iso;
    const char *timezone;
    EpochOperatingStatus status;
    int sandbox_only;
    int provider_go_live_requested;
} EpochAvailabilityHold;

typedef struct EpochAvailabilityCapacitySnapshot {
    const char *id;
    const char *availability_window_id;
    const char *customer_safe_status;
    int capacity;
    int holds;
    int waitlist_count;
    int released_hold_count;
    int promotion_candidate_count;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochAvailabilityCapacitySnapshot;

typedef struct EpochAvailabilityWaitlistEntry {
    const char *id;
    const char *schedule_request_id;
    const char *requested_window;
    const char *timezone;
    const char *customer_safe_status;
    int priority;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochAvailabilityWaitlistEntry;

typedef struct EpochAvailabilityHoldRelease {
    const char *id;
    const char *availability_hold_id;
    const char *availability_window_id;
    const char *released_at_iso;
    const char *customer_safe_status;
    int released_capacity;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochAvailabilityHoldRelease;

typedef struct EpochAvailabilityPromotionCandidate {
    const char *id;
    const char *waitlist_entry_id;
    const char *availability_window_id;
    const char *promoted_hold_id;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochAvailabilityPromotionCandidate;

typedef struct EpochAvailabilityCapacityReceipt {
    const char *id;
    const char *kind;
    const char *summary;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochAvailabilityCapacityReceipt;

typedef struct EpochBookingConfirmation {
    const char *id;
    const char *acceptance_id;
    const char *availability_hold_id;
    const char *schedule_entry_id;
    const char *schedule_request_id;
    const char *confirmed_window;
    const char *timezone;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochBookingConfirmation;

typedef struct EpochScheduleStatusEvent {
    const char *id;
    const char *booking_confirmation_id;
    const char *schedule_request_id;
    const char *state_label;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
} EpochScheduleStatusEvent;

typedef struct EpochBookingReceipt {
    const char *id;
    const char *booking_confirmation_id;
    const char *schedule_status_event_id;
    const char *summary;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochBookingReceipt;

typedef struct EpochTimingReturnPayload {
    const char *id;
    const char *timing_handoff_id;
    const char *conflict_decision_id;
    const char *booking_confirmation_id;
    const char *schedule_request_id;
    const char *return_type;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochTimingReturnPayload;

typedef struct EpochTimingReturnReceipt {
    const char *id;
    const char *timing_return_payload_id;
    const char *conflict_decision_id;
    const char *summary;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochTimingReturnReceipt;

typedef struct EpochReminderRule {
    const char *id;
    const char *schedule_entry_id;
    const char *rrule;
    const char *customer_safe_label;
    EpochOperatingStatus status;
    int sandbox_only;
    int customer_visible;
} EpochReminderRule;

typedef struct EpochRecurrenceRule {
    const char *id;
    const char *schedule_entry_id;
    const char *rrule;
    EpochCalendarSystem calendar_system;
    EpochOperatingStatus status;
    int sandbox_only;
    int operator_approved;
    int creates_future_entries;
} EpochRecurrenceRule;

typedef struct EpochRecurringBookingSeries {
    const char *id;
    const char *recurrence_rule_id;
    const char *schedule_entry_id;
    const char *rrule;
    const char *timezone;
    const char *customer_safe_status;
    EpochCalendarSystem calendar_system;
    EpochOperatingStatus status;
    int instance_count;
    int confirmed_count;
    int exception_count;
    int customer_visible;
    int sandbox_only;
    int provider_go_live_requested;
} EpochRecurringBookingSeries;

typedef struct EpochRecurringBookingInstance {
    const char *id;
    const char *series_id;
    const char *recurrence_rule_id;
    const char *schedule_entry_id;
    const char *booking_confirmation_id;
    const char *availability_window_id;
    const char *conflict_exception_id;
    const char *start_iso;
    const char *end_iso;
    const char *timezone;
    const char *customer_safe_status;
    int occurrence_index;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochRecurringBookingInstance;

typedef struct EpochRecurrenceConflictException {
    const char *id;
    const char *series_id;
    const char *instance_id;
    const char *recurrence_rule_id;
    const char *conflict_type;
    const char *requested_window;
    const char *customer_safe_status;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochRecurrenceConflictException;

typedef struct EpochRecurringSeriesReceipt {
    const char *id;
    const char *series_id;
    const char *summary;
    EpochOperatingStatus status;
    int customer_visible;
    int provider_go_live_requested;
} EpochRecurringSeriesReceipt;

typedef struct EpochDeadlineRule {
    const char *id;
    const char *linked_entry_id;
    const char *due_iso;
    const char *timezone;
    const char *customer_safe_status;
    EpochDeadlineHealth health;
    EpochOperatingStatus status;
    int customer_visible;
} EpochDeadlineRule;

typedef struct EpochRevisedCalendarRulepack {
    const char *id;
    const char *version_id;
    int month_count;
    int month_names_approved;
    int day_distribution_approved;
    int intercalary_days_approved;
    int leap_rule_approved;
    int epoch_anchor_approved;
    int day_of_week_mapping_approved;
    int formatting_rules_approved;
    int timezone_boundary_approved;
    int recurrence_mapping_approved;
    int public_display_wording_approved;
    int storage_identifier_approved;
    int conversion_rules_approved;
    int owner_approved;
    int conversion_logic_enabled;
} EpochRevisedCalendarRulepack;

typedef struct EpochCalendarProviderReadinessGate {
    const char *id;
    EpochProviderKind provider_kind;
    EpochOperatingStatus status;
    int sandbox_prototype_passed;
    int local_records_verified;
    int customer_safe_status_verified;
    int revised_calendar_mapping_verified;
    int operator_approval_recorded;
    int live_provider_calls_enabled;
    const char *blocker;
} EpochCalendarProviderReadinessGate;

typedef struct EpochOperatingEntry {
    const char *id;
    EpochOperatingType type;
    const char *linked_entity_id;
    const char *owner;
    EpochOperatingStatus status;
    int external_visible;
    const char *last_update_iso;
    const char *next_action_iso;
} EpochOperatingEntry;

const char *epoch_status_label(EpochOperatingStatus status);
int epoch_status_from_label(const char *label, EpochOperatingStatus *out_status);
int epoch_status_is_terminal(EpochOperatingStatus status);
int epoch_operating_entry_needs_attention(const EpochOperatingEntry *entry);
const char *epoch_provider_kind_label(EpochProviderKind kind);
const char *epoch_calendar_system_label(EpochCalendarSystem system);
const char *epoch_deadline_health_label(EpochDeadlineHealth health);
int epoch_schedule_entry_is_valid(const EpochScheduleEntry *entry);
int epoch_schedule_request_is_customer_safe(const EpochScheduleRequest *request);
int epoch_availability_window_has_capacity(const EpochAvailabilityWindow *window);
int epoch_timing_handoff_is_sandbox_safe(const EpochTimingHandoff *handoff);
int epoch_availability_conflict_decision_is_customer_safe(const EpochAvailabilityConflictDecision *decision);
int epoch_schedule_request_acceptance_is_ready(const EpochScheduleRequestAcceptance *acceptance);
int epoch_availability_hold_is_ready(const EpochAvailabilityHold *hold);
int epoch_availability_capacity_snapshot_is_customer_safe(const EpochAvailabilityCapacitySnapshot *snapshot);
int epoch_availability_waitlist_entry_is_customer_safe(const EpochAvailabilityWaitlistEntry *entry);
int epoch_availability_hold_release_is_ready(const EpochAvailabilityHoldRelease *release);
int epoch_availability_promotion_candidate_is_ready(const EpochAvailabilityPromotionCandidate *candidate);
int epoch_availability_capacity_receipt_is_customer_safe(const EpochAvailabilityCapacityReceipt *receipt);
int epoch_booking_confirmation_is_customer_safe(const EpochBookingConfirmation *confirmation);
int epoch_schedule_status_event_is_customer_safe(const EpochScheduleStatusEvent *event);
int epoch_booking_receipt_is_customer_safe(const EpochBookingReceipt *receipt);
int epoch_timing_return_payload_is_customer_safe(const EpochTimingReturnPayload *payload);
int epoch_timing_return_receipt_is_customer_safe(const EpochTimingReturnReceipt *receipt);
int epoch_reminder_rule_is_sandbox_safe(const EpochReminderRule *rule);
int epoch_recurrence_rule_is_sandbox_safe(const EpochRecurrenceRule *rule);
int epoch_recurring_booking_series_is_customer_safe(const EpochRecurringBookingSeries *series);
int epoch_recurring_booking_instance_is_customer_safe(const EpochRecurringBookingInstance *instance);
int epoch_recurrence_conflict_exception_is_customer_safe(const EpochRecurrenceConflictException *exception);
int epoch_recurring_series_receipt_is_customer_safe(const EpochRecurringSeriesReceipt *receipt);
int epoch_deadline_rule_is_customer_safe(const EpochDeadlineRule *rule);
int epoch_revised_calendar_rulepack_has_required_approvals(const EpochRevisedCalendarRulepack *rulepack);
int epoch_revised_calendar_rulepack_conversion_ready(const EpochRevisedCalendarRulepack *rulepack);
int epoch_revised_calendar_rulepack_blocks_conversion(const EpochRevisedCalendarRulepack *rulepack);
int epoch_calendar_provider_gate_ready_for_live_toggle(const EpochCalendarProviderReadinessGate *gate);
int epoch_calendar_provider_gate_blocks_live_calls(const EpochCalendarProviderReadinessGate *gate);

#ifdef __cplusplus
}
#endif

#endif
