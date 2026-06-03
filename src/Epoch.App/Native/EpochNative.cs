using System.Reflection;
using System.Runtime.InteropServices;

namespace Epoch.App.Native;

internal static class EpochNative
{
    private const string LibraryName = "epoch_app_bridge";

    static EpochNative()
    {
        NativeLibrary.SetDllImportResolver(typeof(EpochNative).Assembly, ResolveNativeLibrary);
    }

    public static EpochShellSnapshot LoadSnapshot()
    {
        if (epoch_app_bridge_get_snapshot(out NativeSnapshot snapshot) != 1)
        {
            throw new InvalidOperationException("EPOCH Native C app bridge did not return a ready scheduling snapshot.");
        }

        return new EpochShellSnapshot(
            ReadString(snapshot.ProductName),
            ReadString(snapshot.CoreStatus),
            ReadString(snapshot.CalendarSystem),
            ReadString(snapshot.RevisedRulepackStatus),
            ReadString(snapshot.ScheduleQueueStatus),
            ReadString(snapshot.CustomerSafeStatus),
            snapshot.ScheduleModuleCount,
            snapshot.RevisedMonthCount,
            snapshot.RevisedDaysPerMonth,
            snapshot.RevisedConversionReady != 0,
            snapshot.MonitorBoundaryEnforced != 0);
    }

    public static EpochShellSnapshot LoadSnapshotOrFallback()
    {
        try
        {
            return LoadSnapshot();
        }
        catch (Exception ex)
        {
            return new EpochShellSnapshot(
                "EPOCH",
                "native-bridge-pending",
                "revised-13-month",
                "structure-ready-conversion-gated",
                "queued",
                $"Native C bridge is pending for this shell run: {ex.GetType().Name}",
                5,
                13,
                28,
                false,
                true);
        }
    }

    private static IntPtr ResolveNativeLibrary(string libraryName, Assembly assembly, DllImportSearchPath? searchPath)
    {
        if (libraryName != LibraryName)
        {
            return IntPtr.Zero;
        }

        foreach (string candidate in CandidateLibraryPaths())
        {
            if (File.Exists(candidate))
            {
                return NativeLibrary.Load(candidate, assembly, searchPath);
            }
        }

        return IntPtr.Zero;
    }

    private static IEnumerable<string> CandidateLibraryPaths()
    {
        string fileName = OperatingSystem.IsWindows()
            ? "epoch_app_bridge.dll"
            : OperatingSystem.IsMacOS()
                ? "libepoch_app_bridge.dylib"
                : "libepoch_app_bridge.so";
        DirectoryInfo? cursor = new(AppContext.BaseDirectory);

        yield return Path.Combine(AppContext.BaseDirectory, fileName);

        for (int depth = 0; cursor is not null && depth < 10; depth++, cursor = cursor.Parent)
        {
            yield return Path.Combine(cursor.FullName, "build", "Debug", fileName);
            yield return Path.Combine(cursor.FullName, "build", "Release", fileName);
            yield return Path.Combine(cursor.FullName, "build", fileName);
        }
    }

    private static string ReadString(IntPtr value)
    {
        return Marshal.PtrToStringAnsi(value) ?? string.Empty;
    }

    [DllImport(LibraryName, CallingConvention = CallingConvention.Cdecl)]
    private static extern int epoch_app_bridge_get_snapshot(out NativeSnapshot snapshot);

    [StructLayout(LayoutKind.Sequential)]
    private readonly struct NativeSnapshot
    {
        public readonly IntPtr ProductName;
        public readonly IntPtr CoreStatus;
        public readonly IntPtr CalendarSystem;
        public readonly IntPtr RevisedRulepackStatus;
        public readonly IntPtr ScheduleQueueStatus;
        public readonly IntPtr CustomerSafeStatus;
        public readonly int ScheduleModuleCount;
        public readonly int RevisedMonthCount;
        public readonly int RevisedDaysPerMonth;
        public readonly int RevisedConversionReady;
        public readonly int MonitorBoundaryEnforced;
    }
}
