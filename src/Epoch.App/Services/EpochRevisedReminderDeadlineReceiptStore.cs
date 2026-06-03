using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedReminderDeadlineReceiptStore
{
    public const string ReceiptFileName = "revised-reminder-deadline-receipts.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ReceiptPath => Path.Combine(ResolveStateDirectory(), ReceiptFileName);

    public static IReadOnlyList<EpochRevisedReminderDeadlineReceipt> Load()
    {
        string path = ReceiptPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedReminderDeadlineReceipt>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedReminderDeadlineReceipt>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedReminderDeadlineReceipt>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedReminderDeadlineReceipt>();
        }
        catch (JsonException)
        {
            ArchiveInvalidReceipts(path);
            return Array.Empty<EpochRevisedReminderDeadlineReceipt>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedReminderDeadlineReceipt>();
        }
    }

    public static EpochRevisedReminderDeadlineReceipt Append(
        EpochRevisedReminderExecution reminderExecution,
        EpochRevisedDeadlineExecution deadlineExecution,
        EpochRevisedDeadlineEscalation escalation)
    {
        List<EpochRevisedReminderDeadlineReceipt> receipts = Load().ToList();
        EpochRevisedReminderDeadlineReceipt receipt = EpochRevisedReminderDeadlineReceipt.FromExecutionChain(
            reminderExecution,
            deadlineExecution,
            escalation,
            DateTimeOffset.UtcNow);

        receipts.Add(receipt);
        Save(receipts);

        return receipt;
    }

    public static bool TryAppend(
        EpochRevisedReminderExecution reminderExecution,
        EpochRevisedDeadlineExecution deadlineExecution,
        EpochRevisedDeadlineEscalation escalation,
        out EpochRevisedReminderDeadlineReceipt? receipt)
    {
        try
        {
            receipt = Append(reminderExecution, deadlineExecution, escalation);
            return true;
        }
        catch (IOException)
        {
            receipt = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            receipt = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochRevisedReminderDeadlineReceipt> receipts)
    {
        string path = ReceiptPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised reminder deadline receipt path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(receipts, JsonOptions));
        File.Move(tempPath, path, true);
    }

    private static string ResolveStateDirectory()
    {
        string? overrideDirectory = Environment.GetEnvironmentVariable(
            EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable);
        if (!string.IsNullOrWhiteSpace(overrideDirectory))
        {
            return overrideDirectory;
        }

        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        if (string.IsNullOrWhiteSpace(localAppData))
        {
            localAppData = Path.Combine(Path.GetTempPath(), "KHYRON");
        }

        return Path.Combine(localAppData, "KHYRON", "EPOCH", "App");
    }

    private static void ArchiveInvalidReceipts(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid reminder deadline receipt ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
