#include "epoch_app_bridge.h"

#include <assert.h>
#include <string.h>

int main(void) {
    EpochAppBridgeSnapshot snapshot;
    EpochAppBridgeScheduleCommandResult command;

    assert(epoch_app_bridge_get_snapshot(&snapshot) == 1);
    assert(strcmp(epoch_app_bridge_product_name(), "EPOCH") == 0);
    assert(strcmp(snapshot.product_name, "EPOCH") == 0);
    assert(strcmp(snapshot.core_status, "native-core-ready") == 0);
    assert(strcmp(snapshot.calendar_system, "revised-13-month") == 0);
    assert(strcmp(snapshot.revised_rulepack_status, "structure-ready-conversion-gated") == 0);
    assert(strcmp(snapshot.schedule_queue_status, "queued") == 0);
    assert(snapshot.schedule_module_count == 5);
    assert(snapshot.revised_month_count == 13);
    assert(snapshot.revised_days_per_month == 28);
    assert(snapshot.revised_conversion_ready == 0);
    assert(snapshot.monitor_boundary_enforced == 1);
    assert(epoch_app_bridge_preview_schedule_command(&command) == 1);
    assert(strcmp(command.request_id, "epoch-command-request-001") == 0);
    assert(strcmp(command.schedule_entry_id, "epoch-command-entry-001") == 0);
    assert(strcmp(command.booking_confirmation_id, "epoch-command-booking-001") == 0);
    assert(strcmp(command.receipt_id, "epoch-command-receipt-001") == 0);
    assert(strcmp(command.timing_return_status, "returned") == 0);
    assert(command.request_customer_safe == 1);
    assert(command.availability_has_capacity == 1);
    assert(command.acceptance_ready == 1);
    assert(command.hold_ready == 1);
    assert(command.booking_customer_safe == 1);
    assert(command.receipt_customer_safe == 1);
    assert(command.timing_return_customer_safe == 1);
    assert(command.native_command_ready == 1);
    assert(epoch_app_bridge_preview_schedule_command(0) == 0);
    assert(epoch_app_bridge_get_snapshot(0) == 0);

    return 0;
}
