namespace Epoch.App;

public sealed record EpochShellSnapshot(
    string ProductName,
    string CoreStatus,
    string CalendarSystem,
    string RevisedRulepackStatus,
    string ScheduleQueueStatus,
    string CustomerSafeStatus,
    int ScheduleModuleCount,
    int RevisedMonthCount,
    int RevisedDaysPerMonth,
    bool RevisedConversionReady,
    bool MonitorBoundaryEnforced);
