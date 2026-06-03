using Epoch.App.Native;

namespace Epoch.App;

internal static class EpochShellSmoke
{
    public static int Run()
    {
        try
        {
            EpochShellSnapshot snapshot = EpochNative.LoadSnapshot();

            if (snapshot.ProductName != "EPOCH" ||
                snapshot.CoreStatus != "native-core-ready" ||
                snapshot.RevisedMonthCount != 13 ||
                snapshot.RevisedDaysPerMonth != 28 ||
                snapshot.RevisedConversionReady ||
                !snapshot.MonitorBoundaryEnforced)
            {
                return 2;
            }

            return 0;
        }
        catch
        {
            return 1;
        }
    }
}
