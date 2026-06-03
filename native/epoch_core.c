#include "epoch_core.h"

#include <string.h>

typedef struct EpochStatusName {
    EpochOperatingStatus status;
    const char *label;
} EpochStatusName;

typedef struct EpochProviderKindName {
    EpochProviderKind kind;
    const char *label;
} EpochProviderKindName;

typedef struct EpochCalendarSystemName {
    EpochCalendarSystem system;
    const char *label;
} EpochCalendarSystemName;

typedef struct EpochDeadlineHealthName {
    EpochDeadlineHealth health;
    const char *label;
} EpochDeadlineHealthName;

static const EpochStatusName EPOCH_STATUS_NAMES[] = {
    {EPOCH_STATUS_PLANNED, "planned"},
    {EPOCH_STATUS_WAITING, "waiting"},
    {EPOCH_STATUS_PROPOSED, "proposed"},
    {EPOCH_STATUS_DRAFT, "draft"},
    {EPOCH_STATUS_PRESENTED, "presented"},
    {EPOCH_STATUS_AVAILABLE, "available"},
    {EPOCH_STATUS_UNAVAILABLE, "unavailable"},
    {EPOCH_STATUS_QUEUED, "queued"},
    {EPOCH_STATUS_SUBMITTED, "submitted"},
    {EPOCH_STATUS_REVIEWING, "reviewing"},
    {EPOCH_STATUS_RETURNED, "returned"},
    {EPOCH_STATUS_OVERDUE, "overdue"},
    {EPOCH_STATUS_BLOCKED, "blocked"},
    {EPOCH_STATUS_CLEAR, "clear"},
    {EPOCH_STATUS_APPROVED, "approved"},
    {EPOCH_STATUS_DISPATCHED, "dispatched"},
    {EPOCH_STATUS_ACKNOWLEDGED, "acknowledged"},
    {EPOCH_STATUS_ACCEPTED, "accepted"},
    {EPOCH_STATUS_HELD, "held"},
    {EPOCH_STATUS_RELEASED, "released"},
    {EPOCH_STATUS_WAITLISTED, "waitlisted"},
    {EPOCH_STATUS_PROMOTED, "promoted"},
    {EPOCH_STATUS_CONFIRMED, "confirmed"},
    {EPOCH_STATUS_NEEDS_RESCHEDULE, "needs-reschedule"},
    {EPOCH_STATUS_IN_PROGRESS, "in-progress"},
    {EPOCH_STATUS_SENT, "sent"},
    {EPOCH_STATUS_FAILED, "failed"},
    {EPOCH_STATUS_SNOOZED, "snoozed"},
    {EPOCH_STATUS_RETRY_READY, "retry-ready"},
    {EPOCH_STATUS_PAYMENT_READY, "payment-ready"},
    {EPOCH_STATUS_PAYMENT_BLOCKED, "payment-blocked"},
    {EPOCH_STATUS_PAID_RECORDED, "paid-recorded"},
    {EPOCH_STATUS_DECLINED, "declined"},
    {EPOCH_STATUS_REJECTED, "rejected"},
    {EPOCH_STATUS_ROLLED_BACK, "rolled-back"},
    {EPOCH_STATUS_CANCELED, "canceled"},
    {EPOCH_STATUS_COMPLETE, "complete"},
};

static const EpochProviderKindName EPOCH_PROVIDER_KIND_NAMES[] = {
    {EPOCH_PROVIDER_CALENDAR, "calendar"},
    {EPOCH_PROVIDER_AVAILABILITY, "availability"},
    {EPOCH_PROVIDER_REMINDER, "reminder"},
    {EPOCH_PROVIDER_STATUS, "status"},
};

static const EpochCalendarSystemName EPOCH_CALENDAR_SYSTEM_NAMES[] = {
    {EPOCH_CALENDAR_GREGORIAN, "gregorian"},
    {EPOCH_CALENDAR_REVISED_13_MONTH, "revised-13-month"},
};

static const EpochDeadlineHealthName EPOCH_DEADLINE_HEALTH_NAMES[] = {
    {EPOCH_DEADLINE_ON_TRACK, "on-track"},
    {EPOCH_DEADLINE_AT_RISK, "at-risk"},
    {EPOCH_DEADLINE_OVERDUE, "overdue"},
    {EPOCH_DEADLINE_BLOCKED, "blocked"},
};

static int epoch_text_present(const char *value) {
    return value != 0 && value[0] != '\0';
}

const char *epoch_status_label(EpochOperatingStatus status) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_STATUS_NAMES) / sizeof(EPOCH_STATUS_NAMES[0]); i++) {
        if (EPOCH_STATUS_NAMES[i].status == status) {
            return EPOCH_STATUS_NAMES[i].label;
        }
    }

    return "unknown";
}

int epoch_status_from_label(const char *label, EpochOperatingStatus *out_status) {
    size_t i;

    if (label == 0 || out_status == 0) {
        return 0;
    }

    for (i = 0; i < sizeof(EPOCH_STATUS_NAMES) / sizeof(EPOCH_STATUS_NAMES[0]); i++) {
        if (strcmp(EPOCH_STATUS_NAMES[i].label, label) == 0) {
            *out_status = EPOCH_STATUS_NAMES[i].status;
            return 1;
        }
    }

    return 0;
}

int epoch_status_is_terminal(EpochOperatingStatus status) {
    return status == EPOCH_STATUS_RETURNED ||
           status == EPOCH_STATUS_SENT ||
           status == EPOCH_STATUS_PAID_RECORDED ||
           status == EPOCH_STATUS_DECLINED ||
           status == EPOCH_STATUS_REJECTED ||
           status == EPOCH_STATUS_ROLLED_BACK ||
           status == EPOCH_STATUS_CANCELED ||
           status == EPOCH_STATUS_COMPLETE;
}

int epoch_operating_entry_needs_attention(const EpochOperatingEntry *entry) {
    if (entry == 0) {
        return 0;
    }

    return entry->status == EPOCH_STATUS_OVERDUE ||
           entry->status == EPOCH_STATUS_BLOCKED ||
           entry->status == EPOCH_STATUS_PROPOSED ||
           entry->status == EPOCH_STATUS_DRAFT ||
           entry->status == EPOCH_STATUS_PRESENTED ||
           entry->status == EPOCH_STATUS_UNAVAILABLE ||
           entry->status == EPOCH_STATUS_QUEUED ||
           entry->status == EPOCH_STATUS_WAITLISTED ||
           entry->status == EPOCH_STATUS_DISPATCHED ||
           entry->status == EPOCH_STATUS_FAILED ||
           entry->status == EPOCH_STATUS_SNOOZED ||
           entry->status == EPOCH_STATUS_RETRY_READY ||
           entry->status == EPOCH_STATUS_PAYMENT_READY ||
           entry->status == EPOCH_STATUS_PAYMENT_BLOCKED ||
           entry->status == EPOCH_STATUS_SUBMITTED ||
           entry->status == EPOCH_STATUS_REVIEWING ||
           entry->status == EPOCH_STATUS_IN_PROGRESS;
}

const char *epoch_provider_kind_label(EpochProviderKind kind) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_PROVIDER_KIND_NAMES) / sizeof(EPOCH_PROVIDER_KIND_NAMES[0]); i++) {
        if (EPOCH_PROVIDER_KIND_NAMES[i].kind == kind) {
            return EPOCH_PROVIDER_KIND_NAMES[i].label;
        }
    }

    return "unknown";
}

const char *epoch_calendar_system_label(EpochCalendarSystem system) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_CALENDAR_SYSTEM_NAMES) / sizeof(EPOCH_CALENDAR_SYSTEM_NAMES[0]); i++) {
        if (EPOCH_CALENDAR_SYSTEM_NAMES[i].system == system) {
            return EPOCH_CALENDAR_SYSTEM_NAMES[i].label;
        }
    }

    return "unknown";
}

const char *epoch_deadline_health_label(EpochDeadlineHealth health) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_DEADLINE_HEALTH_NAMES) / sizeof(EPOCH_DEADLINE_HEALTH_NAMES[0]); i++) {
        if (EPOCH_DEADLINE_HEALTH_NAMES[i].health == health) {
            return EPOCH_DEADLINE_HEALTH_NAMES[i].label;
        }
    }

    return "unknown";
}

int epoch_schedule_entry_is_valid(const EpochScheduleEntry *entry) {
    if (entry == 0) {
        return 0;
    }

    return epoch_text_present(entry->id) &&
           epoch_text_present(entry->title) &&
           epoch_text_present(entry->start_iso) &&
           epoch_text_present(entry->end_iso) &&
           epoch_text_present(entry->timezone) &&
           entry->status != EPOCH_STATUS_FAILED &&
           entry->status != EPOCH_STATUS_REJECTED &&
           entry->status != EPOCH_STATUS_ROLLED_BACK &&
           entry->status != EPOCH_STATUS_CANCELED;
}

int epoch_schedule_request_is_customer_safe(const EpochScheduleRequest *request) {
    if (request == 0) {
        return 0;
    }

    return request->customer_visible &&
           request->sandbox_only &&
           !request->provider_go_live_requested &&
           epoch_text_present(request->customer_safe_status) &&
           request->status != EPOCH_STATUS_BLOCKED &&
           request->status != EPOCH_STATUS_FAILED;
}

int epoch_availability_window_has_capacity(const EpochAvailabilityWindow *window) {
    if (window == 0 || window->capacity <= 0 || window->holds < 0) {
        return 0;
    }

    return window->holds < window->capacity &&
           window->status == EPOCH_STATUS_AVAILABLE;
}

int epoch_timing_handoff_is_sandbox_safe(const EpochTimingHandoff *handoff) {
    if (handoff == 0) {
        return 0;
    }

    return epoch_text_present(handoff->id) &&
           epoch_text_present(handoff->source_product) &&
           epoch_text_present(handoff->source_handoff_id) &&
           epoch_text_present(handoff->schedule_request_id) &&
           epoch_text_present(handoff->requested_window) &&
           epoch_text_present(handoff->timezone) &&
           epoch_text_present(handoff->customer_safe_status) &&
           handoff->sandbox_only &&
           !handoff->provider_go_live_requested &&
           handoff->status != EPOCH_STATUS_FAILED &&
           handoff->status != EPOCH_STATUS_REJECTED &&
           handoff->status != EPOCH_STATUS_ROLLED_BACK &&
           handoff->status != EPOCH_STATUS_CANCELED;
}

int epoch_availability_conflict_decision_is_customer_safe(const EpochAvailabilityConflictDecision *decision) {
    if (decision == 0) {
        return 0;
    }

    if (decision->status == EPOCH_STATUS_CLEAR && !epoch_text_present(decision->availability_window_id)) {
        return 0;
    }

    return epoch_text_present(decision->id) &&
           epoch_text_present(decision->timing_handoff_id) &&
           epoch_text_present(decision->schedule_request_id) &&
           epoch_text_present(decision->conflict_type) &&
           epoch_text_present(decision->customer_safe_status) &&
           decision->customer_visible &&
           decision->sandbox_only &&
           !decision->provider_go_live_requested &&
           (decision->status == EPOCH_STATUS_CLEAR ||
            decision->status == EPOCH_STATUS_NEEDS_RESCHEDULE);
}

int epoch_schedule_request_acceptance_is_ready(const EpochScheduleRequestAcceptance *acceptance) {
    if (acceptance == 0) {
        return 0;
    }

    return epoch_text_present(acceptance->id) &&
           epoch_text_present(acceptance->schedule_request_id) &&
           epoch_text_present(acceptance->availability_window_id) &&
           epoch_text_present(acceptance->customer_safe_status) &&
           acceptance->customer_visible &&
           acceptance->sandbox_only &&
           !acceptance->provider_go_live_requested &&
           (acceptance->status == EPOCH_STATUS_ACCEPTED ||
            acceptance->status == EPOCH_STATUS_APPROVED ||
            acceptance->status == EPOCH_STATUS_ACKNOWLEDGED);
}

int epoch_availability_hold_is_ready(const EpochAvailabilityHold *hold) {
    if (hold == 0) {
        return 0;
    }

    return epoch_text_present(hold->id) &&
           epoch_text_present(hold->acceptance_id) &&
           epoch_text_present(hold->schedule_request_id) &&
           epoch_text_present(hold->availability_window_id) &&
           epoch_text_present(hold->start_iso) &&
           epoch_text_present(hold->end_iso) &&
           epoch_text_present(hold->timezone) &&
           hold->sandbox_only &&
           !hold->provider_go_live_requested &&
           hold->status == EPOCH_STATUS_HELD;
}

int epoch_availability_capacity_snapshot_is_customer_safe(const EpochAvailabilityCapacitySnapshot *snapshot) {
    if (snapshot == 0 || snapshot->capacity <= 0 || snapshot->holds < 0 || snapshot->waitlist_count < 0 ||
        snapshot->released_hold_count < 0 || snapshot->promotion_candidate_count < 0) {
        return 0;
    }

    if (snapshot->holds > snapshot->capacity) {
        return 0;
    }

    return epoch_text_present(snapshot->id) &&
           epoch_text_present(snapshot->availability_window_id) &&
           epoch_text_present(snapshot->customer_safe_status) &&
           snapshot->customer_visible &&
           !snapshot->provider_go_live_requested &&
           (snapshot->status == EPOCH_STATUS_AVAILABLE ||
            snapshot->status == EPOCH_STATUS_UNAVAILABLE ||
            snapshot->status == EPOCH_STATUS_HELD ||
            snapshot->status == EPOCH_STATUS_WAITLISTED);
}

int epoch_availability_waitlist_entry_is_customer_safe(const EpochAvailabilityWaitlistEntry *entry) {
    if (entry == 0 || entry->priority <= 0) {
        return 0;
    }

    return epoch_text_present(entry->id) &&
           epoch_text_present(entry->schedule_request_id) &&
           epoch_text_present(entry->requested_window) &&
           epoch_text_present(entry->timezone) &&
           epoch_text_present(entry->customer_safe_status) &&
           entry->customer_visible &&
           !entry->provider_go_live_requested &&
           (entry->status == EPOCH_STATUS_WAITLISTED ||
            entry->status == EPOCH_STATUS_PROMOTED ||
            entry->status == EPOCH_STATUS_NEEDS_RESCHEDULE);
}

int epoch_availability_hold_release_is_ready(const EpochAvailabilityHoldRelease *release) {
    if (release == 0 || release->released_capacity <= 0) {
        return 0;
    }

    return epoch_text_present(release->id) &&
           epoch_text_present(release->availability_hold_id) &&
           epoch_text_present(release->availability_window_id) &&
           epoch_text_present(release->released_at_iso) &&
           epoch_text_present(release->customer_safe_status) &&
           release->customer_visible &&
           !release->provider_go_live_requested &&
           release->status == EPOCH_STATUS_RELEASED;
}

int epoch_availability_promotion_candidate_is_ready(const EpochAvailabilityPromotionCandidate *candidate) {
    if (candidate == 0) {
        return 0;
    }

    return epoch_text_present(candidate->id) &&
           epoch_text_present(candidate->waitlist_entry_id) &&
           epoch_text_present(candidate->availability_window_id) &&
           epoch_text_present(candidate->promoted_hold_id) &&
           epoch_text_present(candidate->customer_safe_status) &&
           candidate->customer_visible &&
           !candidate->provider_go_live_requested &&
           (candidate->status == EPOCH_STATUS_PROMOTED ||
            candidate->status == EPOCH_STATUS_HELD);
}

int epoch_availability_capacity_receipt_is_customer_safe(const EpochAvailabilityCapacityReceipt *receipt) {
    if (receipt == 0) {
        return 0;
    }

    return epoch_text_present(receipt->id) &&
           epoch_text_present(receipt->kind) &&
           epoch_text_present(receipt->summary) &&
           receipt->customer_visible &&
           !receipt->provider_go_live_requested &&
           strcmp(receipt->kind, "availability-capacity") == 0 &&
           (receipt->status == EPOCH_STATUS_COMPLETE ||
            receipt->status == EPOCH_STATUS_PROMOTED ||
            receipt->status == EPOCH_STATUS_WAITLISTED ||
            receipt->status == EPOCH_STATUS_NEEDS_RESCHEDULE);
}

int epoch_booking_optimization_run_is_customer_safe(const EpochBookingOptimizationRun *run) {
    if (run == 0 || run->candidate_count <= 0 || run->overload_warning_count < 0) {
        return 0;
    }

    return epoch_text_present(run->id) &&
           epoch_text_present(run->schedule_request_id) &&
           epoch_text_present(run->primary_availability_window_id) &&
           epoch_text_present(run->customer_safe_status) &&
           run->customer_visible &&
           !run->provider_go_live_requested &&
           (run->status == EPOCH_STATUS_COMPLETE ||
            run->status == EPOCH_STATUS_IN_PROGRESS ||
            run->status == EPOCH_STATUS_NEEDS_RESCHEDULE);
}

int epoch_booking_recommendation_candidate_is_customer_safe(const EpochBookingRecommendationCandidate *candidate) {
    if (candidate == 0 || candidate->rank <= 0 || candidate->score <= 0) {
        return 0;
    }

    return epoch_text_present(candidate->id) &&
           epoch_text_present(candidate->optimization_run_id) &&
           epoch_text_present(candidate->schedule_request_id) &&
           epoch_text_present(candidate->availability_window_id) &&
           epoch_text_present(candidate->recommendation_type) &&
           epoch_text_present(candidate->customer_safe_status) &&
           candidate->customer_visible &&
           !candidate->provider_go_live_requested &&
           (candidate->status == EPOCH_STATUS_AVAILABLE ||
            candidate->status == EPOCH_STATUS_CONFIRMED ||
            candidate->status == EPOCH_STATUS_NEEDS_RESCHEDULE ||
            candidate->status == EPOCH_STATUS_WAITLISTED);
}

int epoch_booking_overload_warning_is_customer_safe(const EpochBookingOverloadWarning *warning) {
    if (warning == 0 || warning->load_ratio_percent <= 0) {
        return 0;
    }

    return epoch_text_present(warning->id) &&
           epoch_text_present(warning->optimization_run_id) &&
           epoch_text_present(warning->availability_window_id) &&
           epoch_text_present(warning->customer_safe_status) &&
           warning->customer_visible &&
           !warning->provider_go_live_requested &&
           (warning->status == EPOCH_STATUS_IN_PROGRESS ||
            warning->status == EPOCH_STATUS_NEEDS_RESCHEDULE ||
            warning->status == EPOCH_STATUS_UNAVAILABLE ||
            warning->status == EPOCH_STATUS_WAITLISTED);
}

int epoch_booking_recommendation_receipt_is_customer_safe(const EpochBookingRecommendationReceipt *receipt) {
    if (receipt == 0) {
        return 0;
    }

    return epoch_text_present(receipt->id) &&
           epoch_text_present(receipt->kind) &&
           epoch_text_present(receipt->optimization_run_id) &&
           epoch_text_present(receipt->summary) &&
           receipt->customer_visible &&
           !receipt->provider_go_live_requested &&
           strcmp(receipt->kind, "booking-recommendation") == 0 &&
           (receipt->status == EPOCH_STATUS_COMPLETE ||
            receipt->status == EPOCH_STATUS_AVAILABLE ||
            receipt->status == EPOCH_STATUS_NEEDS_RESCHEDULE);
}

int epoch_booking_confirmation_is_customer_safe(const EpochBookingConfirmation *confirmation) {
    if (confirmation == 0) {
        return 0;
    }

    return epoch_text_present(confirmation->id) &&
           epoch_text_present(confirmation->acceptance_id) &&
           epoch_text_present(confirmation->availability_hold_id) &&
           epoch_text_present(confirmation->schedule_entry_id) &&
           epoch_text_present(confirmation->schedule_request_id) &&
           epoch_text_present(confirmation->confirmed_window) &&
           epoch_text_present(confirmation->timezone) &&
           epoch_text_present(confirmation->customer_safe_status) &&
           confirmation->customer_visible &&
           !confirmation->provider_go_live_requested &&
           confirmation->status == EPOCH_STATUS_CONFIRMED;
}

int epoch_schedule_status_event_is_customer_safe(const EpochScheduleStatusEvent *event) {
    if (event == 0) {
        return 0;
    }

    return epoch_text_present(event->id) &&
           epoch_text_present(event->booking_confirmation_id) &&
           epoch_text_present(event->schedule_request_id) &&
           epoch_text_present(event->state_label) &&
           epoch_text_present(event->customer_safe_status) &&
           event->customer_visible &&
           event->status != EPOCH_STATUS_BLOCKED &&
           event->status != EPOCH_STATUS_FAILED &&
           event->status != EPOCH_STATUS_REJECTED &&
           event->status != EPOCH_STATUS_ROLLED_BACK &&
           event->status != EPOCH_STATUS_CANCELED;
}

int epoch_booking_receipt_is_customer_safe(const EpochBookingReceipt *receipt) {
    if (receipt == 0) {
        return 0;
    }

    return epoch_text_present(receipt->id) &&
           epoch_text_present(receipt->booking_confirmation_id) &&
           epoch_text_present(receipt->schedule_status_event_id) &&
           epoch_text_present(receipt->summary) &&
           receipt->customer_visible &&
           !receipt->provider_go_live_requested &&
           receipt->status != EPOCH_STATUS_FAILED &&
           receipt->status != EPOCH_STATUS_REJECTED &&
           receipt->status != EPOCH_STATUS_ROLLED_BACK &&
           receipt->status != EPOCH_STATUS_CANCELED;
}

int epoch_timing_return_payload_is_customer_safe(const EpochTimingReturnPayload *payload) {
    if (payload == 0) {
        return 0;
    }

    if (payload->status == EPOCH_STATUS_RETURNED && !epoch_text_present(payload->booking_confirmation_id)) {
        return 0;
    }

    return epoch_text_present(payload->id) &&
           epoch_text_present(payload->timing_handoff_id) &&
           epoch_text_present(payload->conflict_decision_id) &&
           epoch_text_present(payload->schedule_request_id) &&
           epoch_text_present(payload->return_type) &&
           epoch_text_present(payload->customer_safe_status) &&
           payload->customer_visible &&
           !payload->provider_go_live_requested &&
           (payload->status == EPOCH_STATUS_RETURNED ||
            payload->status == EPOCH_STATUS_NEEDS_RESCHEDULE);
}

int epoch_timing_return_receipt_is_customer_safe(const EpochTimingReturnReceipt *receipt) {
    if (receipt == 0) {
        return 0;
    }

    return epoch_text_present(receipt->id) &&
           epoch_text_present(receipt->timing_return_payload_id) &&
           epoch_text_present(receipt->conflict_decision_id) &&
           epoch_text_present(receipt->summary) &&
           receipt->customer_visible &&
           !receipt->provider_go_live_requested &&
           (receipt->status == EPOCH_STATUS_COMPLETE ||
            receipt->status == EPOCH_STATUS_NEEDS_RESCHEDULE ||
            receipt->status == EPOCH_STATUS_RETURNED);
}

int epoch_reminder_rule_is_sandbox_safe(const EpochReminderRule *rule) {
    if (rule == 0) {
        return 0;
    }

    return rule->sandbox_only &&
           epoch_text_present(rule->customer_safe_label) &&
           rule->status != EPOCH_STATUS_FAILED;
}

int epoch_recurrence_rule_is_sandbox_safe(const EpochRecurrenceRule *rule) {
    if (rule == 0) {
        return 0;
    }

    return rule->sandbox_only &&
           !rule->creates_future_entries &&
           epoch_text_present(rule->id) &&
           epoch_text_present(rule->schedule_entry_id) &&
           epoch_text_present(rule->rrule) &&
           rule->status != EPOCH_STATUS_FAILED &&
           rule->status != EPOCH_STATUS_BLOCKED &&
           rule->status != EPOCH_STATUS_CANCELED &&
           (rule->calendar_system != EPOCH_CALENDAR_REVISED_13_MONTH || rule->operator_approved);
}

int epoch_recurring_booking_series_is_customer_safe(const EpochRecurringBookingSeries *series) {
    if (series == 0 || series->instance_count <= 0 || series->confirmed_count < 0 || series->exception_count < 0) {
        return 0;
    }

    if (series->confirmed_count + series->exception_count > series->instance_count) {
        return 0;
    }

    return epoch_text_present(series->id) &&
           epoch_text_present(series->recurrence_rule_id) &&
           epoch_text_present(series->schedule_entry_id) &&
           epoch_text_present(series->rrule) &&
           epoch_text_present(series->timezone) &&
           epoch_text_present(series->customer_safe_status) &&
           series->customer_visible &&
           series->sandbox_only &&
           !series->provider_go_live_requested &&
           series->calendar_system == EPOCH_CALENDAR_GREGORIAN &&
           (series->status == EPOCH_STATUS_CONFIRMED ||
            series->status == EPOCH_STATUS_IN_PROGRESS ||
            series->status == EPOCH_STATUS_PLANNED);
}

int epoch_recurring_booking_instance_is_customer_safe(const EpochRecurringBookingInstance *instance) {
    if (instance == 0 || instance->occurrence_index <= 0) {
        return 0;
    }

    if (instance->status == EPOCH_STATUS_CONFIRMED &&
        (!epoch_text_present(instance->schedule_entry_id) ||
         !epoch_text_present(instance->booking_confirmation_id) ||
         !epoch_text_present(instance->availability_window_id))) {
        return 0;
    }

    if (instance->status == EPOCH_STATUS_NEEDS_RESCHEDULE &&
        !epoch_text_present(instance->conflict_exception_id)) {
        return 0;
    }

    return epoch_text_present(instance->id) &&
           epoch_text_present(instance->series_id) &&
           epoch_text_present(instance->recurrence_rule_id) &&
           epoch_text_present(instance->start_iso) &&
           epoch_text_present(instance->end_iso) &&
           epoch_text_present(instance->timezone) &&
           epoch_text_present(instance->customer_safe_status) &&
           instance->customer_visible &&
           !instance->provider_go_live_requested &&
           (instance->status == EPOCH_STATUS_CONFIRMED ||
            instance->status == EPOCH_STATUS_NEEDS_RESCHEDULE);
}

int epoch_recurrence_conflict_exception_is_customer_safe(const EpochRecurrenceConflictException *exception) {
    if (exception == 0) {
        return 0;
    }

    return epoch_text_present(exception->id) &&
           epoch_text_present(exception->series_id) &&
           epoch_text_present(exception->instance_id) &&
           epoch_text_present(exception->recurrence_rule_id) &&
           epoch_text_present(exception->conflict_type) &&
           epoch_text_present(exception->requested_window) &&
           epoch_text_present(exception->customer_safe_status) &&
           exception->customer_visible &&
           !exception->provider_go_live_requested &&
           (exception->status == EPOCH_STATUS_NEEDS_RESCHEDULE ||
            exception->status == EPOCH_STATUS_BLOCKED);
}

int epoch_recurring_series_receipt_is_customer_safe(const EpochRecurringSeriesReceipt *receipt) {
    if (receipt == 0) {
        return 0;
    }

    return epoch_text_present(receipt->id) &&
           epoch_text_present(receipt->series_id) &&
           epoch_text_present(receipt->summary) &&
           receipt->customer_visible &&
           !receipt->provider_go_live_requested &&
           (receipt->status == EPOCH_STATUS_COMPLETE ||
            receipt->status == EPOCH_STATUS_NEEDS_RESCHEDULE ||
            receipt->status == EPOCH_STATUS_RETURNED);
}

int epoch_deadline_rule_is_customer_safe(const EpochDeadlineRule *rule) {
    if (rule == 0) {
        return 0;
    }

    return rule->customer_visible &&
           epoch_text_present(rule->id) &&
           epoch_text_present(rule->linked_entry_id) &&
           epoch_text_present(rule->due_iso) &&
           epoch_text_present(rule->timezone) &&
           epoch_text_present(rule->customer_safe_status) &&
           rule->status != EPOCH_STATUS_FAILED &&
           rule->status != EPOCH_STATUS_BLOCKED &&
           rule->health != EPOCH_DEADLINE_BLOCKED;
}

int epoch_reminder_execution_is_customer_safe(const EpochReminderExecution *execution) {
    if (execution == 0) {
        return 0;
    }

    return epoch_text_present(execution->id) &&
           epoch_text_present(execution->reminder_rule_id) &&
           epoch_text_present(execution->schedule_entry_id) &&
           epoch_text_present(execution->scheduled_for_iso) &&
           epoch_text_present(execution->executed_at_iso) &&
           epoch_text_present(execution->channel) &&
           epoch_text_present(execution->customer_safe_status) &&
           execution->sandbox_only &&
           execution->customer_visible &&
           !execution->provider_go_live_requested &&
           !execution->notification_send_enabled &&
           (execution->status == EPOCH_STATUS_DISPATCHED ||
            execution->status == EPOCH_STATUS_ACKNOWLEDGED ||
            execution->status == EPOCH_STATUS_SNOOZED ||
            execution->status == EPOCH_STATUS_RETRY_READY);
}

int epoch_deadline_execution_is_customer_safe(const EpochDeadlineExecution *execution) {
    if (execution == 0) {
        return 0;
    }

    return epoch_text_present(execution->id) &&
           epoch_text_present(execution->deadline_rule_id) &&
           epoch_text_present(execution->linked_entry_id) &&
           epoch_text_present(execution->due_iso) &&
           epoch_text_present(execution->evaluated_at_iso) &&
           epoch_text_present(execution->customer_safe_status) &&
           execution->customer_visible &&
           !execution->provider_go_live_requested &&
           execution->status != EPOCH_STATUS_FAILED &&
           execution->status != EPOCH_STATUS_REJECTED &&
           execution->status != EPOCH_STATUS_ROLLED_BACK &&
           execution->status != EPOCH_STATUS_CANCELED &&
           execution->health != EPOCH_DEADLINE_BLOCKED;
}

int epoch_deadline_escalation_is_customer_safe(const EpochDeadlineEscalation *escalation) {
    if (escalation == 0 || escalation->escalation_level <= 0) {
        return 0;
    }

    return epoch_text_present(escalation->id) &&
           epoch_text_present(escalation->deadline_execution_id) &&
           epoch_text_present(escalation->reminder_execution_id) &&
           epoch_text_present(escalation->owner) &&
           epoch_text_present(escalation->customer_safe_status) &&
           escalation->customer_visible &&
           !escalation->provider_go_live_requested &&
           !escalation->notification_send_enabled &&
           (escalation->status == EPOCH_STATUS_DISPATCHED ||
            escalation->status == EPOCH_STATUS_ACKNOWLEDGED ||
            escalation->status == EPOCH_STATUS_RETRY_READY);
}

int epoch_reminder_deadline_receipt_is_customer_safe(const EpochReminderDeadlineReceipt *receipt) {
    if (receipt == 0) {
        return 0;
    }

    return epoch_text_present(receipt->id) &&
           epoch_text_present(receipt->kind) &&
           epoch_text_present(receipt->summary) &&
           receipt->customer_visible &&
           !receipt->provider_go_live_requested &&
           !receipt->notification_send_enabled &&
           strcmp(receipt->kind, "reminder-deadline-execution") == 0 &&
           (receipt->status == EPOCH_STATUS_COMPLETE ||
            receipt->status == EPOCH_STATUS_ACKNOWLEDGED ||
            receipt->status == EPOCH_STATUS_RETRY_READY);
}

int epoch_revised_calendar_rulepack_has_required_approvals(const EpochRevisedCalendarRulepack *rulepack) {
    if (rulepack == 0) {
        return 0;
    }

    return epoch_text_present(rulepack->id) &&
           epoch_text_present(rulepack->version_id) &&
           rulepack->month_count == 13 &&
           rulepack->days_per_month == 28 &&
           rulepack->year_opening_day_outside_months &&
           rulepack->leap_day_outside_months_at_year_end &&
           epoch_text_present(rulepack->spring_anchor_method) &&
           epoch_text_present(rulepack->spring_anchor_source) &&
           rulepack->month_names_approved &&
           rulepack->day_distribution_approved &&
           rulepack->intercalary_days_approved &&
           rulepack->leap_rule_approved &&
           rulepack->epoch_anchor_approved &&
           rulepack->day_of_week_mapping_approved &&
           rulepack->formatting_rules_approved &&
           rulepack->timezone_boundary_approved &&
           rulepack->recurrence_mapping_approved &&
           rulepack->public_display_wording_approved &&
           rulepack->storage_identifier_approved &&
           rulepack->conversion_rules_approved &&
           rulepack->owner_approved;
}

int epoch_revised_calendar_rulepack_conversion_ready(const EpochRevisedCalendarRulepack *rulepack) {
    return epoch_revised_calendar_rulepack_has_required_approvals(rulepack) &&
           rulepack->conversion_logic_enabled;
}

int epoch_revised_calendar_rulepack_blocks_conversion(const EpochRevisedCalendarRulepack *rulepack) {
    return !epoch_revised_calendar_rulepack_conversion_ready(rulepack);
}

int epoch_revised_calendar_rulepack_represents_owner_structure(const EpochRevisedCalendarRulepack *rulepack) {
    if (rulepack == 0) {
        return 0;
    }

    return epoch_text_present(rulepack->id) &&
           epoch_text_present(rulepack->version_id) &&
           rulepack->month_count == 13 &&
           rulepack->days_per_month == 28 &&
           rulepack->year_opening_day_outside_months &&
           rulepack->leap_day_outside_months_at_year_end &&
           epoch_text_present(rulepack->spring_anchor_method) &&
           epoch_text_present(rulepack->spring_anchor_source);
}

int epoch_revised_calendar_conversion_result_is_gated(const EpochRevisedCalendarConversionResult *result) {
    if (result == 0) {
        return 0;
    }

    return epoch_text_present(result->id) &&
           epoch_text_present(result->gregorian_iso) &&
           epoch_text_present(result->customer_safe_status) &&
           epoch_text_present(result->revised_date.rulepack_version_id) &&
           !result->conversion_ready &&
           !result->public_display_ready &&
           (result->status == EPOCH_STATUS_BLOCKED ||
            result->status == EPOCH_STATUS_REVIEWING ||
            result->status == EPOCH_STATUS_PLANNED);
}

int epoch_schedule_audit_record_is_customer_safe(const EpochScheduleAuditRecord *record) {
    if (record == 0) {
        return 0;
    }

    return epoch_text_present(record->id) &&
           epoch_text_present(record->schedule_entry_id) &&
           epoch_text_present(record->actor) &&
           epoch_text_present(record->action) &&
           epoch_text_present(record->summary) &&
           record->customer_visible &&
           !record->provider_go_live_requested &&
           record->status != EPOCH_STATUS_FAILED &&
           record->status != EPOCH_STATUS_BLOCKED;
}

int epoch_schedule_receipt_is_customer_safe(const EpochScheduleReceipt *receipt) {
    if (receipt == 0) {
        return 0;
    }

    return epoch_text_present(receipt->id) &&
           epoch_text_present(receipt->kind) &&
           epoch_text_present(receipt->linked_record_id) &&
           epoch_text_present(receipt->summary) &&
           receipt->customer_visible &&
           !receipt->provider_go_live_requested &&
           (receipt->status == EPOCH_STATUS_COMPLETE ||
            receipt->status == EPOCH_STATUS_CONFIRMED ||
            receipt->status == EPOCH_STATUS_ACKNOWLEDGED);
}

int epoch_scheduler_log_entry_is_product_log(const EpochSchedulerLogEntry *entry) {
    if (entry == 0) {
        return 0;
    }

    return epoch_text_present(entry->id) &&
           epoch_text_present(entry->event_kind) &&
           epoch_text_present(entry->linked_record_id) &&
           epoch_text_present(entry->summary) &&
           epoch_text_present(entry->recorded_at_iso) &&
           entry->product_log &&
           !entry->monitor_runner_log;
}

int epoch_calendar_search_query_respects_role(const EpochCalendarSearchQuery *query) {
    if (query == 0) {
        return 0;
    }

    if (!epoch_text_present(query->id) || !epoch_text_present(query->query) || !epoch_text_present(query->role)) {
        return 0;
    }

    if (query->customer_safe_only) {
        return !query->include_private_records;
    }

    return strcmp(query->role, "owner") == 0 || strcmp(query->role, "admin") == 0;
}

int epoch_calendar_search_result_is_customer_safe(const EpochCalendarSearchResult *result) {
    if (result == 0) {
        return 0;
    }

    return epoch_text_present(result->id) &&
           epoch_text_present(result->query_id) &&
           epoch_text_present(result->record_id) &&
           epoch_text_present(result->record_kind) &&
           epoch_text_present(result->display_label) &&
           result->customer_visible;
}

int epoch_schedule_template_is_ready(const EpochScheduleTemplate *template_record) {
    if (template_record == 0) {
        return 0;
    }

    return epoch_text_present(template_record->id) &&
           epoch_text_present(template_record->template_kind) &&
           epoch_text_present(template_record->title) &&
           epoch_text_present(template_record->default_duration_label) &&
           epoch_text_present(template_record->timezone) &&
           !template_record->provider_go_live_requested;
}

int epoch_persona_lane_status_is_local(const EpochPersonaLaneStatus *lane) {
    if (lane == 0) {
        return 0;
    }

    return epoch_text_present(lane->id) &&
           epoch_text_present(lane->role) &&
           epoch_text_present(lane->runner_kind) &&
           epoch_text_present(lane->worktree_path) &&
           epoch_text_present(lane->local_branch) &&
           (strcmp(lane->role, "EPOCH INTEGRATOR") == 0 ||
            strcmp(lane->role, "EPOCH ORCHESTRATOR") == 0 ||
            strcmp(lane->role, "EPOCH CONTRIBUTOR") == 0);
}

int epoch_local_worktree_status_is_local_only(const EpochLocalWorktreeStatus *worktree) {
    if (worktree == 0) {
        return 0;
    }

    return epoch_text_present(worktree->id) &&
           epoch_text_present(worktree->path) &&
           epoch_text_present(worktree->local_branch) &&
           epoch_text_present(worktree->head) &&
           !worktree->external_sync_enabled;
}

static int epoch_calendar_provider_gate_prerequisites_passed(const EpochCalendarProviderReadinessGate *gate) {
    if (gate == 0) {
        return 0;
    }

    return gate->sandbox_prototype_passed &&
           gate->local_records_verified &&
           gate->customer_safe_status_verified &&
           gate->revised_calendar_mapping_verified &&
           gate->operator_approval_recorded &&
           gate->status != EPOCH_STATUS_BLOCKED &&
           gate->status != EPOCH_STATUS_FAILED;
}

int epoch_calendar_provider_gate_ready_for_live_toggle(const EpochCalendarProviderReadinessGate *gate) {
    if (gate == 0) {
        return 0;
    }

    return epoch_calendar_provider_gate_prerequisites_passed(gate) &&
           !gate->live_provider_calls_enabled;
}

int epoch_calendar_provider_gate_blocks_live_calls(const EpochCalendarProviderReadinessGate *gate) {
    if (gate == 0) {
        return 1;
    }

    return !epoch_calendar_provider_gate_prerequisites_passed(gate) ||
           !gate->live_provider_calls_enabled;
}
