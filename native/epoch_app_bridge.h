#ifndef EPOCH_APP_BRIDGE_H
#define EPOCH_APP_BRIDGE_H

#ifdef _WIN32
#define EPOCH_APP_BRIDGE_API __declspec(dllexport)
#else
#define EPOCH_APP_BRIDGE_API __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct EpochAppBridgeSnapshot {
    const char *product_name;
    const char *core_status;
    const char *calendar_system;
    const char *revised_rulepack_status;
    const char *schedule_queue_status;
    const char *customer_safe_status;
    int schedule_module_count;
    int revised_month_count;
    int revised_days_per_month;
    int revised_conversion_ready;
    int monitor_boundary_enforced;
} EpochAppBridgeSnapshot;

typedef struct EpochAppBridgeScheduleCommandResult {
    const char *request_id;
    const char *schedule_entry_id;
    const char *availability_window_id;
    const char *booking_confirmation_id;
    const char *receipt_id;
    const char *timing_return_status;
    const char *customer_safe_status;
    int request_customer_safe;
    int availability_has_capacity;
    int acceptance_ready;
    int hold_ready;
    int booking_customer_safe;
    int receipt_customer_safe;
    int timing_return_customer_safe;
    int native_command_ready;
} EpochAppBridgeScheduleCommandResult;

typedef struct EpochAppBridgeScheduleExecutionReceipt {
    const char *execution_id;
    const char *intent_kind;
    const char *execution_status;
    const char *request_id;
    const char *acceptance_id;
    const char *hold_id;
    const char *booking_confirmation_id;
    const char *booking_receipt_id;
    const char *timing_return_id;
    const char *customer_safe_status;
    int executed_locally;
    int provider_calls_enabled;
    int monitor_workflow_exposed;
    int schedule_status_customer_safe;
    int native_execution_ready;
} EpochAppBridgeScheduleExecutionReceipt;

EPOCH_APP_BRIDGE_API const char *epoch_app_bridge_product_name(void);
EPOCH_APP_BRIDGE_API const char *epoch_app_bridge_core_status(void);
EPOCH_APP_BRIDGE_API int epoch_app_bridge_get_snapshot(EpochAppBridgeSnapshot *out_snapshot);
EPOCH_APP_BRIDGE_API int epoch_app_bridge_preview_schedule_command(EpochAppBridgeScheduleCommandResult *out_result);
EPOCH_APP_BRIDGE_API int epoch_app_bridge_execute_schedule_command(const char *intent_kind, EpochAppBridgeScheduleExecutionReceipt *out_receipt);
EPOCH_APP_BRIDGE_API int epoch_app_bridge_core_ready(void);
EPOCH_APP_BRIDGE_API int epoch_app_bridge_revised_conversion_ready(void);
EPOCH_APP_BRIDGE_API int epoch_app_bridge_monitor_boundary_enforced(void);

#ifdef __cplusplus
}
#endif

#endif
