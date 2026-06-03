namespace Epoch.App;

public sealed record EpochRevisedDeadlineEscalation(
    string EscalationId,
    string CreatedAtUtc,
    string SourceSurface,
    string ReminderExecutionId,
    string DeadlineExecutionId,
    string RevisedTimingPayloadId,
    string RequestId,
    string EscalationKind,
    string Status,
    string CustomerSafeStatus,
    bool CustomerSafe,
    bool WebportalExportReady,
    bool NotificationSendEnabled,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool WorkshopCalendarOwnership)
{
    public static EpochRevisedDeadlineEscalation FromExecutions(
        EpochRevisedReminderExecution reminderExecution,
        EpochRevisedDeadlineExecution deadlineExecution,
        DateTimeOffset createdAtUtc)
    {
        string escalationId = $"epoch-revised-escalation-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..54];
        bool customerSafe =
            reminderExecution.CustomerSafe &&
            deadlineExecution.CustomerSafe &&
            reminderExecution.RevisedTimingPayloadId == deadlineExecution.RevisedTimingPayloadId &&
            !reminderExecution.NotificationSendEnabled &&
            !deadlineExecution.NotificationSendEnabled &&
            !reminderExecution.ProviderCallsEnabled &&
            !deadlineExecution.ProviderCallsEnabled &&
            !reminderExecution.MonitorWorkflowExposed &&
            !deadlineExecution.MonitorWorkflowExposed &&
            !reminderExecution.WorkshopCalendarOwnership &&
            !deadlineExecution.WorkshopCalendarOwnership;

        return new EpochRevisedDeadlineEscalation(
            escalationId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedDeadlineEscalation",
            reminderExecution.ExecutionId,
            deadlineExecution.ExecutionId,
            reminderExecution.RevisedTimingPayloadId,
            reminderExecution.RequestId,
            "revised-calendar-deadline-follow-up",
            "local-escalation-held",
            "Deadline follow-up was queued locally; no notification was sent and revised-calendar conversion remains gated.",
            customerSafe,
            customerSafe,
            false,
            reminderExecution.ProviderCallsEnabled || deadlineExecution.ProviderCallsEnabled,
            reminderExecution.MonitorWorkflowExposed || deadlineExecution.MonitorWorkflowExposed,
            reminderExecution.WorkshopCalendarOwnership || deadlineExecution.WorkshopCalendarOwnership);
    }
}
