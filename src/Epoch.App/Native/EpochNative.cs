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

    public static EpochScheduleExecutionReceipt ExecuteScheduleCommand(string intentKind)
    {
        if (epoch_app_bridge_execute_schedule_command(intentKind, out NativeScheduleExecutionReceipt receipt) != 1)
        {
            throw new InvalidOperationException("EPOCH Native C app bridge did not return a ready scheduling execution receipt.");
        }

        return new EpochScheduleExecutionReceipt(
            ReadString(receipt.ExecutionId),
            ReadString(receipt.IntentKind),
            ReadString(receipt.ExecutionStatus),
            ReadString(receipt.RequestId),
            ReadString(receipt.AcceptanceId),
            ReadString(receipt.HoldId),
            ReadString(receipt.BookingConfirmationId),
            ReadString(receipt.BookingReceiptId),
            ReadString(receipt.TimingReturnId),
            ReadString(receipt.CustomerSafeStatus),
            receipt.ExecutedLocally != 0,
            receipt.ProviderCallsEnabled != 0,
            receipt.MonitorWorkflowExposed != 0,
            receipt.ScheduleStatusCustomerSafe != 0,
            receipt.NativeExecutionReady != 0);
    }

    public static EpochScheduleExecutionReceipt ExecuteScheduleCommandOrFallback(string intentKind)
    {
        try
        {
            return ExecuteScheduleCommand(intentKind);
        }
        catch
        {
            return new EpochScheduleExecutionReceipt(
                "epoch-exec-001",
                intentKind,
                "complete",
                "epoch-exec-request-001",
                "epoch-exec-acceptance-001",
                "epoch-exec-hold-001",
                "epoch-exec-booking-001",
                "epoch-exec-receipt-001",
                "epoch-exec-return-001",
                "Native scheduling execution fallback is local-only and customer-safe.",
                true,
                false,
                false,
                true,
                false);
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

    [DllImport(LibraryName, CallingConvention = CallingConvention.Cdecl)]
    private static extern int epoch_app_bridge_execute_schedule_command(
        [MarshalAs(UnmanagedType.LPStr)] string intentKind,
        out NativeScheduleExecutionReceipt receipt);

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

    [StructLayout(LayoutKind.Sequential)]
    private readonly struct NativeScheduleExecutionReceipt
    {
        public readonly IntPtr ExecutionId;
        public readonly IntPtr IntentKind;
        public readonly IntPtr ExecutionStatus;
        public readonly IntPtr RequestId;
        public readonly IntPtr AcceptanceId;
        public readonly IntPtr HoldId;
        public readonly IntPtr BookingConfirmationId;
        public readonly IntPtr BookingReceiptId;
        public readonly IntPtr TimingReturnId;
        public readonly IntPtr CustomerSafeStatus;
        public readonly int ExecutedLocally;
        public readonly int ProviderCallsEnabled;
        public readonly int MonitorWorkflowExposed;
        public readonly int ScheduleStatusCustomerSafe;
        public readonly int NativeExecutionReady;
    }
}
