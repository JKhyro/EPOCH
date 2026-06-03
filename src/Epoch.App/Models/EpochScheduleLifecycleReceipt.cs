namespace Epoch.App;

public sealed record EpochScheduleLifecycleReceipt(
    string ReceiptId,
    string CreatedAtUtc,
    string ActionId,
    string RequestId,
    string ActionKind,
    string RequestedWindow,
    string RequestCommandReceiptId,
    string ExecutionHistoryId,
    string TimingReturnId,
    string Status,
    string CustomerSafeStatus,
    bool CustomerSafe,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool NativeExecutionReady)
{
    public static EpochScheduleLifecycleReceipt FromLifecycleAndCommand(
        EpochScheduleLifecycleAction action,
        EpochRequestScheduleCommandReceipt commandReceipt,
        EpochScheduleExecutionHistoryEntry historyEntry,
        DateTimeOffset createdAtUtc)
    {
        string receiptId = $"epoch-lifecycle-receipt-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..51];
        bool customerSafe =
            action.CustomerSafe &&
            commandReceipt.CustomerSafe &&
            historyEntry.NativeExecutionReady &&
            !action.ProviderCallsEnabled &&
            !commandReceipt.ProviderCallsEnabled &&
            !historyEntry.ProviderCallsEnabled &&
            !action.MonitorWorkflowExposed &&
            !commandReceipt.MonitorWorkflowExposed &&
            !historyEntry.MonitorWorkflowExposed;

        return new EpochScheduleLifecycleReceipt(
            receiptId,
            createdAtUtc.ToString("O"),
            action.ActionId,
            action.RequestId,
            action.ActionKind,
            action.RequestedWindow,
            commandReceipt.ReceiptId,
            historyEntry.HistoryId,
            historyEntry.TimingReturnId,
            "schedule-lifecycle-receipt-linked",
            "The schedule lifecycle action is linked to a local EPOCH native scheduling command receipt. Provider calls remain disabled.",
            customerSafe,
            action.ProviderCallsEnabled || commandReceipt.ProviderCallsEnabled || historyEntry.ProviderCallsEnabled,
            action.MonitorWorkflowExposed || commandReceipt.MonitorWorkflowExposed || historyEntry.MonitorWorkflowExposed,
            commandReceipt.NativeExecutionReady && historyEntry.NativeExecutionReady);
    }
}
