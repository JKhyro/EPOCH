namespace Epoch.App;

public sealed record EpochShellSnapshot(
    string ProductName,
    string CoreStatus,
    string CalendarSystem,
    string RevisedRulepackStatus,
    string RevisedAnchorMethod,
    string RevisedAnchorSource,
    string RevisedYearOpeningPolicy,
    string RevisedLeapDayPolicy,
    string RevisedIntercalaryPolicy,
    string RevisedConversionGateReason,
    string ScheduleQueueStatus,
    string CustomerSafeStatus,
    int ScheduleModuleCount,
    int RevisedMonthCount,
    int RevisedDaysPerMonth,
    int RevisedCommonIntercalaryDays,
    int RevisedLeapIntercalaryDays,
    bool RevisedConstraintsCustomerSafe,
    bool RevisedConversionReady,
    bool MonitorBoundaryEnforced);
