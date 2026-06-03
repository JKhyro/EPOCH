using Epoch.App.Native;
using Epoch.App.Services;

namespace Epoch.App;

internal static class EpochShellSmoke
{
    public static int Run()
    {
        string? previousStateDirectory = Environment.GetEnvironmentVariable(
            EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable);
        string smokeStateDirectory = Path.Combine(
            Path.GetTempPath(),
            "Epoch.App.Smoke",
            Guid.NewGuid().ToString("N"));

        try
        {
            Environment.SetEnvironmentVariable(
                EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable,
                smokeStateDirectory);

            EpochShellSnapshot snapshot = EpochNative.LoadSnapshot();
            EpochScheduleCommandResult command = EpochNative.LoadScheduleCommand();
            EpochScheduleExecutionReceipt execution = EpochNative.ExecuteScheduleCommand("confirm-local-booking");
            EpochScheduleExecutionHistoryEntry historyEntry = EpochScheduleExecutionHistoryStore.Append(
                execution,
                "Epoch.App.Smoke");
            IReadOnlyList<EpochScheduleExecutionHistoryEntry> history = EpochScheduleExecutionHistoryStore.Load();

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
                execution.BookingReceiptId != "epoch-exec-receipt-001" ||
                history.Count != 1 ||
                history[0].HistoryId != historyEntry.HistoryId ||
                history[0].BookingReceiptId != "epoch-exec-receipt-001" ||
                history[0].ProviderCallsEnabled ||
                history[0].MonitorWorkflowExposed ||
                !File.Exists(EpochScheduleExecutionHistoryStore.HistoryPath))
            {
                return 2;
            }

            return 0;
        }
        catch
        {
            return 1;
        }
        finally
        {
            Environment.SetEnvironmentVariable(
                EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable,
                previousStateDirectory);

            try
            {
                if (Directory.Exists(smokeStateDirectory))
                {
                    Directory.Delete(smokeStateDirectory, true);
                }
            }
            catch (IOException)
            {
                // Smoke state is isolated under the temp directory and can be cleaned later.
            }
        }
    }
}
