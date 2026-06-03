namespace Epoch.App;

public sealed record EpochRevisedAvailabilityExceptionReceipt(
    string ReceiptId,
    string CreatedAtUtc,
    string SourceSurface,
    string ExceptionId,
    string RevisedTimingPayloadId,
    string RequestId,
    string NativeScheduleRequestId,
    string AvailabilityWindowId,
    string RecurringSeriesId,
    string RecurringInstanceId,
    string ConflictExceptionId,
    string Kind,
    string Status,
    string Summary,
    string CustomerSafeMessage,
    string NextAction,
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
    public static EpochRevisedAvailabilityExceptionReceipt FromException(
        EpochRevisedAvailabilityException availabilityException,
        DateTimeOffset createdAtUtc)
    {
        string receiptId = $"epoch-revised-availability-exception-receipt-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..64];
        bool customerSafe =
            availabilityException.CustomerSafe &&
            availabilityException.WebportalExportReady &&
            availabilityException.RecurringExceptionReady &&
            availabilityException.AvailabilityExceptionReady &&
            !availabilityException.ProviderCallsEnabled &&
            !availabilityException.NotificationSendEnabled &&
            !availabilityException.WorkshopCalendarOwnership &&
            !availabilityException.MonitorWorkflowExposed &&
            !availabilityException.RevisedConversionReady;

        return new EpochRevisedAvailabilityExceptionReceipt(
            receiptId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedAvailabilityExceptionReceipt",
            availabilityException.ExceptionId,
            availabilityException.RevisedTimingPayloadId,
            availabilityException.RequestId,
            availabilityException.NativeScheduleRequestId,
            availabilityException.AvailabilityWindowId,
            availabilityException.RecurringSeriesId,
            availabilityException.RecurringInstanceId,
            availabilityException.ConflictExceptionId,
            "revised-availability-exception",
            "customer-safe-revised-availability-exception-ready",
            "EPOCH recorded a recurring revised-calendar availability exception and kept provider calls, notifications, WORKSHOP calendar ownership, and MONITOR workflow exposure disabled.",
            "Your recurring availability status is ready for review. Revised-calendar conversion is still owner-gated.",
            "Review the customer-safe revised availability exception before any provider or revised-calendar conversion approval.",
            customerSafe,
            customerSafe,
            availabilityException.ProviderCallsEnabled,
            availabilityException.NotificationSendEnabled,
            availabilityException.WorkshopCalendarOwnership,
            availabilityException.MonitorWorkflowExposed,
            availabilityException.RevisedConversionReady,
            availabilityException.RecurringExceptionReady,
            availabilityException.AvailabilityExceptionReady);
    }
}
