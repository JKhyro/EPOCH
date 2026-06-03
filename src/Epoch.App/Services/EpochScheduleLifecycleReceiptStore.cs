using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochScheduleLifecycleReceiptStore
{
    public const string ReceiptFileName = "schedule-lifecycle-receipts.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ReceiptPath => Path.Combine(ResolveStateDirectory(), ReceiptFileName);

    public static IReadOnlyList<EpochScheduleLifecycleReceipt> Load()
    {
        string path = ReceiptPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochScheduleLifecycleReceipt>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochScheduleLifecycleReceipt>? entries =
                JsonSerializer.Deserialize<List<EpochScheduleLifecycleReceipt>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochScheduleLifecycleReceipt>();
        }
        catch (JsonException)
        {
            ArchiveInvalidReceipts(path);
            return Array.Empty<EpochScheduleLifecycleReceipt>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochScheduleLifecycleReceipt>();
        }
    }

    public static EpochScheduleLifecycleReceipt Append(
        EpochScheduleLifecycleAction action,
        EpochRequestScheduleCommandReceipt commandReceipt,
        EpochScheduleExecutionHistoryEntry historyEntry)
    {
        List<EpochScheduleLifecycleReceipt> receipts = Load().ToList();
        EpochScheduleLifecycleReceipt receipt = EpochScheduleLifecycleReceipt.FromLifecycleAndCommand(
            action,
            commandReceipt,
            historyEntry,
            DateTimeOffset.UtcNow);

        receipts.Add(receipt);
        Save(receipts);

        return receipt;
    }

    public static bool TryAppend(
        EpochScheduleLifecycleAction action,
        EpochRequestScheduleCommandReceipt commandReceipt,
        EpochScheduleExecutionHistoryEntry historyEntry,
        out EpochScheduleLifecycleReceipt? receipt)
    {
        try
        {
            receipt = Append(action, commandReceipt, historyEntry);
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

    private static void Save(IReadOnlyList<EpochScheduleLifecycleReceipt> receipts)
    {
        string path = ReceiptPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App lifecycle receipt path does not have a directory.");
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
            // Keep the app usable even if Windows has the invalid lifecycle receipt ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
