using Epoch.App.Native;

namespace Epoch.App.ViewModels;

public sealed class MainWindowViewModel
{
    private MainWindowViewModel(EpochShellSnapshot snapshot)
    {
        ProductName = snapshot.ProductName;
        CoreStatus = snapshot.CoreStatus;
        CalendarSystem = snapshot.CalendarSystem;
        RevisedRulepackStatus = snapshot.RevisedRulepackStatus;
        ScheduleQueueStatus = snapshot.ScheduleQueueStatus;
        CustomerSafeStatus = snapshot.CustomerSafeStatus;
        ModuleSummary = $"{snapshot.ScheduleModuleCount} scheduling product modules are native-bridge visible: audit, receipts, log, search, and templates.";
        RevisedCalendarShape = $"{snapshot.RevisedMonthCount} months x {snapshot.RevisedDaysPerMonth} days, with conversion ready: {snapshot.RevisedConversionReady.ToString().ToLowerInvariant()}.";
        BoundaryStatus = snapshot.MonitorBoundaryEnforced ? "monitor boundary enforced" : "monitor boundary blocked";
    }

    public string ProductName { get; }
    public string CoreStatus { get; }
    public string CalendarSystem { get; }
    public string RevisedRulepackStatus { get; }
    public string ScheduleQueueStatus { get; }
    public string CustomerSafeStatus { get; }
    public string ModuleSummary { get; }
    public string RevisedCalendarShape { get; }
    public string BoundaryStatus { get; }

    public static MainWindowViewModel Load()
    {
        return new MainWindowViewModel(EpochNative.LoadSnapshotOrFallback());
    }
}
