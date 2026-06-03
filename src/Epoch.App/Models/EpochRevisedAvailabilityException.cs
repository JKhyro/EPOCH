namespace Epoch.App;

public sealed record EpochRevisedAvailabilityException(
    string ExceptionId,
    string CreatedAtUtc,
    string SourceSurface,
    string RevisedTimingPayloadId,
    string RequestId,
    string NativeScheduleRequestId,
    string CalendarSystemLabel,
    string TimingDisplayLabel,
    string AvailabilityWindowId,
    string RecurringSeriesId,
    string RecurringInstanceId,
    string ConflictExceptionId,
    string Status,
    string ConversionGateReason,
    string CustomerSafeStatus,
    string OperatorNextAction,
    bool CustomerSafe,
    bool WebportalExportReady,
    bool ProviderCallsEnabled,
    bool NotificationSendEnabled,
    bool WorkshopCalendarOwnership,
    bool MonitorWorkflowExposed,
    bool RevisedConversionReady,
    bool RecurringExceptionReady,
    bool AvailabilityExceptionReady)
{
    public static EpochRevisedAvailabilityException FromRevisedTimingExport(
        EpochRevisedCalendarTimingExport timingExport,
        EpochScheduleCommandResult command,
        DateTimeOffset createdAtUtc)
    {
        string exceptionId = $"epoch-revised-availability-exception-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..64];
        string conflictExceptionId = $"epoch-revised-recurring-conflict-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..64];
        bool providerCallsEnabled = timingExport.ProviderGoLiveRequested;
        bool revisedConversionReady = false;
        bool customerSafe =
            timingExport.CustomerSafe &&
            timingExport.EpochTimingProviderOnly &&
            command.NativeCommandReady &&
            !providerCallsEnabled &&
            !timingExport.WorkshopCalendarOwnership &&
            !timingExport.MonitorWorkflowExposed;

        return new EpochRevisedAvailabilityException(
            exceptionId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedAvailabilityException",
            timingExport.PayloadId,
            timingExport.RequestId,
            command.RequestId,
            timingExport.CalendarSystemLabel,
            timingExport.TimingDisplayLabel,
            command.AvailabilityWindowId,
            "epoch-recurring-revised-series-local-001",
            "epoch-recurring-revised-instance-local-001",
            conflictExceptionId,
            "revised-availability-exception-ready",
            timingExport.ConversionGateReason,
            "EPOCH recorded a recurring revised-calendar availability exception locally; no external calendar write was made.",
            "Review the customer-safe recurring availability exception before approving revised-calendar recurrence conversion.",
            customerSafe,
            customerSafe,
            providerCallsEnabled,
            false,
            timingExport.WorkshopCalendarOwnership,
            timingExport.MonitorWorkflowExposed,
            revisedConversionReady,
            customerSafe && !revisedConversionReady,
            customerSafe && command.AvailabilityHasCapacity);
    }
}
