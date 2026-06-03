using Epoch.App.Native;

namespace Epoch.App;

internal static class EpochShellSmoke
{
    public static int Run()
    {
        try
        {
            EpochShellSnapshot snapshot = EpochNative.LoadSnapshot();
            EpochScheduleCommandResult command = EpochNative.LoadScheduleCommand();
            EpochScheduleExecutionReceipt execution = EpochNative.ExecuteScheduleCommand("confirm-local-booking");

            if (snapshot.ProductName != "EPOCH" ||
                snapshot.CoreStatus != "native-core-ready" ||
                snapshot.RevisedMonthCount != 13 ||
                snapshot.RevisedDaysPerMonth != 28 ||
                snapshot.RevisedConversionReady ||
                !snapshot.MonitorBoundaryEnforced ||
                !command.NativeCommandReady ||
                command.TimingReturnStatus != "returned" ||
                command.BookingConfirmationId != "epoch-command-booking-001" ||
                command.ReceiptId != "epoch-command-receipt-001" ||
                !execution.NativeExecutionReady ||
                !execution.ExecutedLocally ||
                execution.ProviderCallsEnabled ||
                execution.MonitorWorkflowExposed ||
                execution.ExecutionStatus != "complete" ||
                execution.BookingReceiptId != "epoch-exec-receipt-001")
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
