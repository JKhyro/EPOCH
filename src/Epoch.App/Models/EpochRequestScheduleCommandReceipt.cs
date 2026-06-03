namespace Epoch.App;

public sealed record EpochRequestScheduleCommandReceipt(
    string ReceiptId,
    string CreatedAtUtc,
    string RequestId,
    string ExecutionHistoryId,
    string ExecutionId,
    string IntentKind,
    string BookingReceiptId,
    string TimingReturnId,
    string Status,
    string CustomerSafeStatus,
    bool CustomerSafe,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool NativeExecutionReady)
{
    public static EpochRequestScheduleCommandReceipt FromRequestAndExecution(
        EpochWebportalScheduleRequest request,
        EpochScheduleExecutionHistoryEntry historyEntry,
        EpochScheduleExecutionReceipt execution,
        DateTimeOffset createdAtUtc)
    {
        string receiptId = $"epoch-request-command-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..51];

        return new EpochRequestScheduleCommandReceipt(
            receiptId,
            createdAtUtc.ToString("O"),
            request.RequestId,
            historyEntry.HistoryId,
            execution.ExecutionId,
            execution.IntentKind,
            execution.BookingReceiptId,
            execution.TimingReturnId,
            "native-command-receipt-linked",
            "The Webportal schedule request is linked to a local EPOCH native scheduling command receipt. Provider calls remain disabled.",
            request.CustomerSafe && execution.ScheduleStatusCustomerSafe,
            execution.ProviderCallsEnabled,
            execution.MonitorWorkflowExposed,
            execution.NativeExecutionReady);
    }
}
