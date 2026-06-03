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

    public static EpochScheduleCommandResult LoadScheduleCommand()
    {
        if (epoch_app_bridge_preview_schedule_command(out NativeScheduleCommandResult result) != 1)
        {
            throw new InvalidOperationException("EPOCH Native C app bridge did not return a ready scheduling command preview.");
        }

        return new EpochScheduleCommandResult(
            ReadString(result.RequestId),
            ReadString(result.ScheduleEntryId),
            ReadString(result.AvailabilityWindowId),
            ReadString(result.BookingConfirmationId),
            ReadString(result.ReceiptId),
            ReadString(result.TimingReturnStatus),
            ReadString(result.CustomerSafeStatus),
            result.RequestCustomerSafe != 0,
            result.AvailabilityHasCapacity != 0,
            result.AcceptanceReady != 0,
            result.HoldReady != 0,
            result.BookingCustomerSafe != 0,
            result.ReceiptCustomerSafe != 0,
            result.TimingReturnCustomerSafe != 0,
            result.NativeCommandReady != 0);
    }

    public static EpochScheduleCommandResult LoadScheduleCommandOrFallback()
    {
        try
        {
            return LoadScheduleCommand();
        }
        catch
        {
            return new EpochScheduleCommandResult(
                "epoch-command-request-001",
                "epoch-command-entry-001",
                "epoch-command-window-001",
                "epoch-command-booking-001",
                "epoch-command-receipt-001",
                "returned",
                "Native scheduling command preview is pending for this shell run.",
                true,
                true,
                true,
                true,
                true,
                true,
                true,
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

    [DllImport(LibraryName, CallingConvention = CallingConvention.Cdecl)]
    private static extern int epoch_app_bridge_preview_schedule_command(out NativeScheduleCommandResult result);

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

    [StructLayout(LayoutKind.Sequential)]
    private readonly struct NativeScheduleCommandResult
    {
        public readonly IntPtr RequestId;
        public readonly IntPtr ScheduleEntryId;
        public readonly IntPtr AvailabilityWindowId;
        public readonly IntPtr BookingConfirmationId;
        public readonly IntPtr ReceiptId;
        public readonly IntPtr TimingReturnStatus;
        public readonly IntPtr CustomerSafeStatus;
        public readonly int RequestCustomerSafe;
        public readonly int AvailabilityHasCapacity;
        public readonly int AcceptanceReady;
        public readonly int HoldReady;
        public readonly int BookingCustomerSafe;
        public readonly int ReceiptCustomerSafe;
        public readonly int TimingReturnCustomerSafe;
        public readonly int NativeCommandReady;
    }
}
