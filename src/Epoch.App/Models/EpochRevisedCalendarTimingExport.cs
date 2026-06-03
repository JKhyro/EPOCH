namespace Epoch.App;

public sealed record EpochRevisedCalendarTimingExport(
    string PayloadId,
    string ReturnedAtUtc,
    string SourceSurface,
    string SourceHandoffId,
    string RequestId,
    string CalendarSystemLabel,
    string TimingDisplayLabel,
    string ConstraintSummary,
    string ConversionGateReason,
    string EpochProjectionReceiptId,
    string CustomerSafeStatus,
    bool CustomerSafe,
    bool ProviderGoLiveRequested,
    bool EpochTimingProviderOnly,
    bool WorkshopCalendarOwnership,
    bool MonitorWorkflowExposed)
{
    public static EpochRevisedCalendarTimingExport FromSnapshot(
        EpochShellSnapshot snapshot,
        string payloadId,
        DateTimeOffset returnedAtUtc)
    {
        string timingDisplayLabel = $"{snapshot.RevisedMonthCount} x {snapshot.RevisedDaysPerMonth} projection, conversion held";
        string constraintSummary =
            $"{snapshot.RevisedCommonIntercalaryDays} common-year day and {snapshot.RevisedLeapIntercalaryDays} leap-year days outside months.";

        return new EpochRevisedCalendarTimingExport(
            payloadId,
            returnedAtUtc.ToString("O"),
            "EPOCH.App.RevisedTimingProjectionExport",
            "epoch-handoff-002",
            "req-cohort-001",
            snapshot.CalendarSystem,
            timingDisplayLabel,
            constraintSummary,
            snapshot.RevisedConversionGateReason,
            "EPOCH-REVISED-CONSTRAINT-PROJECTION",
            "EPOCH returned customer-safe revised timing context; WORKSHOP keeps service delivery ownership only.",
            snapshot.RevisedConstraintsCustomerSafe &&
                !snapshot.RevisedConversionReady &&
                snapshot.MonitorBoundaryEnforced,
            false,
            true,
            false,
            false);
    }
}
