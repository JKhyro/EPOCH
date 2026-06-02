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
    EPOCH_STATUS_APPROVED,
    EPOCH_STATUS_DISPATCHED,
    EPOCH_STATUS_ACKNOWLEDGED,
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

typedef struct EpochReminderRule {
    const char *id;
    const char *schedule_entry_id;
    const char *rrule;
    const char *customer_safe_label;
    EpochOperatingStatus status;
    int sandbox_only;
    int customer_visible;
} EpochReminderRule;

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
int epoch_schedule_request_is_customer_safe(const EpochScheduleRequest *request);
int epoch_availability_window_has_capacity(const EpochAvailabilityWindow *window);
int epoch_reminder_rule_is_sandbox_safe(const EpochReminderRule *rule);
int epoch_calendar_provider_gate_ready_for_live_toggle(const EpochCalendarProviderReadinessGate *gate);
int epoch_calendar_provider_gate_blocks_live_calls(const EpochCalendarProviderReadinessGate *gate);

#ifdef __cplusplus
}
#endif

#endif
