namespace Epoch.App;

public sealed record EpochRevisedReminderDeadlineReceipt(
    string ReceiptId,
    string CreatedAtUtc,
    string SourceSurface,
    string ReminderExecutionId,
    string DeadlineExecutionId,
    string EscalationId,
    string RevisedTimingPayloadId,
    string RequestId,
    string Kind,
    string Status,
    string CustomerSafeMessage,
    string NextAction,
    bool CustomerSafe,
    bool WebportalExportReady,
    bool NotificationSendEnabled,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool WorkshopCalendarOwnership)
{
    public static EpochRevisedReminderDeadlineReceipt FromExecutionChain(
        EpochRevisedReminderExecution reminderExecution,
        EpochRevisedDeadlineExecution deadlineExecution,
        EpochRevisedDeadlineEscalation escalation,
        DateTimeOffset createdAtUtc)
    {
        string receiptId = $"epoch-revised-reminder-deadline-receipt-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..64];
        bool customerSafe =
            reminderExecution.CustomerSafe &&
            deadlineExecution.CustomerSafe &&
            escalation.CustomerSafe &&
            reminderExecution.RevisedTimingPayloadId == deadlineExecution.RevisedTimingPayloadId &&
            deadlineExecution.RevisedTimingPayloadId == escalation.RevisedTimingPayloadId &&
            !reminderExecution.NotificationSendEnabled &&
            !deadlineExecution.NotificationSendEnabled &&
            !escalation.NotificationSendEnabled &&
            !reminderExecution.ProviderCallsEnabled &&
            !deadlineExecution.ProviderCallsEnabled &&
            !escalation.ProviderCallsEnabled &&
            !reminderExecution.MonitorWorkflowExposed &&
            !deadlineExecution.MonitorWorkflowExposed &&
            !escalation.MonitorWorkflowExposed &&
            !reminderExecution.WorkshopCalendarOwnership &&
            !deadlineExecution.WorkshopCalendarOwnership &&
            !escalation.WorkshopCalendarOwnership;

        return new EpochRevisedReminderDeadlineReceipt(
            receiptId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedReminderDeadlineReceipt",
            reminderExecution.ExecutionId,
            deadlineExecution.ExecutionId,
            escalation.EscalationId,
            reminderExecution.RevisedTimingPayloadId,
            reminderExecution.RequestId,
            "revised-reminder-deadline-execution",
            "customer-safe-revised-deadline-status-ready",
            "EPOCH prepared a local revised-calendar reminder and deadline status. No notification was sent.",
            "Review the customer-safe reminder/deadline receipt before any future notification provider is approved.",
            customerSafe,
            customerSafe,
            false,
            reminderExecution.ProviderCallsEnabled || deadlineExecution.ProviderCallsEnabled || escalation.ProviderCallsEnabled,
            reminderExecution.MonitorWorkflowExposed || deadlineExecution.MonitorWorkflowExposed || escalation.MonitorWorkflowExposed,
            reminderExecution.WorkshopCalendarOwnership || deadlineExecution.WorkshopCalendarOwnership || escalation.WorkshopCalendarOwnership);
    }
}
