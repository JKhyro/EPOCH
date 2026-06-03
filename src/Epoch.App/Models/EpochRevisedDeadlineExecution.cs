namespace Epoch.App;

public sealed record EpochRevisedDeadlineExecution(
    string ExecutionId,
    string CreatedAtUtc,
    string SourceSurface,
    string RevisedTimingPayloadId,
    string RequestId,
    string CalendarSystemLabel,
    string DeadlineLabel,
    string Health,
    string Status,
    string ConversionGateReason,
    string CustomerSafeStatus,
    bool CustomerSafe,
    bool WebportalExportReady,
    bool NotificationSendEnabled,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool WorkshopCalendarOwnership)
{
    public static EpochRevisedDeadlineExecution FromRevisedTimingExport(
        EpochRevisedCalendarTimingExport timingExport,
        DateTimeOffset createdAtUtc)
    {
        string executionId = $"epoch-revised-deadline-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..52];
        bool customerSafe =
            timingExport.CustomerSafe &&
            timingExport.EpochTimingProviderOnly &&
            !timingExport.ProviderGoLiveRequested &&
            !timingExport.WorkshopCalendarOwnership &&
            !timingExport.MonitorWorkflowExposed;

        return new EpochRevisedDeadlineExecution(
            executionId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedDeadlineExecution",
            timingExport.PayloadId,
            timingExport.RequestId,
            timingExport.CalendarSystemLabel,
            "Revised-calendar deadline check",
            "conversion-held-watch",
            "revised-deadline-evaluated",
            timingExport.ConversionGateReason,
            "Deadline execution was evaluated locally against EPOCH revised timing context; no notification was sent.",
            customerSafe,
            customerSafe,
            false,
            timingExport.ProviderGoLiveRequested,
            timingExport.MonitorWorkflowExposed,
            timingExport.WorkshopCalendarOwnership);
    }
}
