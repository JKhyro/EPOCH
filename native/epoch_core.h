#ifndef EPOCH_CORE_H
#define EPOCH_CORE_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum EpochOperatingStatus {
    EPOCH_STATUS_PLANNED = 0,
    EPOCH_STATUS_WAITING,
    EPOCH_STATUS_SUBMITTED,
    EPOCH_STATUS_REVIEWING,
    EPOCH_STATUS_RETURNED,
    EPOCH_STATUS_OVERDUE,
    EPOCH_STATUS_BLOCKED,
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

typedef struct EpochScheduleEntry {
    const char *id;
    const char *title;
    const char *notes;
    const char *start_iso;
    const char *end_iso;
    const char *timezone;
    EpochOperatingStatus status;
} EpochScheduleEntry;

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

#ifdef __cplusplus
}
#endif

#endif
