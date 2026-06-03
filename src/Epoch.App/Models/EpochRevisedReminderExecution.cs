namespace Epoch.App;

public sealed record EpochRevisedReminderExecution(
    string ExecutionId,
    string CreatedAtUtc,
    string SourceSurface,
    string RevisedTimingPayloadId,
    string RequestId,
    string CalendarSystemLabel,
    string TimingDisplayLabel,
    string ReminderLabel,
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
    public static EpochRevisedReminderExecution FromRevisedTimingExport(
        EpochRevisedCalendarTimingExport timingExport,
        DateTimeOffset createdAtUtc)
    {
        string executionId = $"epoch-revised-reminder-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..52];
        bool customerSafe =
            timingExport.CustomerSafe &&
            timingExport.EpochTimingProviderOnly &&
            !timingExport.ProviderGoLiveRequested &&
            !timingExport.WorkshopCalendarOwnership &&
            !timingExport.MonitorWorkflowExposed;

        return new EpochRevisedReminderExecution(
            executionId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedReminderExecution",
            timingExport.PayloadId,
            timingExport.RequestId,
            timingExport.CalendarSystemLabel,
            timingExport.TimingDisplayLabel,
            "Revised-calendar reminder review",
            "revised-reminder-ready",
            timingExport.ConversionGateReason,
            "Reminder execution was recorded locally against EPOCH revised timing context; no notification was sent.",
            customerSafe,
            customerSafe,
            false,
            timingExport.ProviderGoLiveRequested,
            timingExport.MonitorWorkflowExposed,
            timingExport.WorkshopCalendarOwnership);
    }
}
