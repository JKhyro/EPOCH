namespace Epoch.App;

public sealed record EpochScheduleExecutionReceipt(
    string ExecutionId,
    string IntentKind,
    string ExecutionStatus,
    string RequestId,
    string AcceptanceId,
    string HoldId,
    string BookingConfirmationId,
    string BookingReceiptId,
    string TimingReturnId,
    string CustomerSafeStatus,
    bool ExecutedLocally,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool ScheduleStatusCustomerSafe,
    bool NativeExecutionReady);
