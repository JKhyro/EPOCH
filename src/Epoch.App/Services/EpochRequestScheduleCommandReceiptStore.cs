using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRequestScheduleCommandReceiptStore
{
    public const string ReceiptFileName = "request-to-schedule-command.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ReceiptPath => Path.Combine(ResolveStateDirectory(), ReceiptFileName);

    public static IReadOnlyList<EpochRequestScheduleCommandReceipt> Load()
    {
        string path = ReceiptPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRequestScheduleCommandReceipt>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRequestScheduleCommandReceipt>? entries =
                JsonSerializer.Deserialize<List<EpochRequestScheduleCommandReceipt>>(json, JsonOptions);

            if (entries is not null)
            {
                return entries;
            }

            return Array.Empty<EpochRequestScheduleCommandReceipt>();
        }
        catch (JsonException)
        {
            ArchiveInvalidReceipts(path);
            return Array.Empty<EpochRequestScheduleCommandReceipt>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRequestScheduleCommandReceipt>();
        }
    }

    public static EpochRequestScheduleCommandReceipt Append(
        EpochWebportalScheduleRequest request,
        EpochScheduleExecutionHistoryEntry historyEntry,
        EpochScheduleExecutionReceipt execution)
    {
        List<EpochRequestScheduleCommandReceipt> receipts = Load().ToList();
        EpochRequestScheduleCommandReceipt receipt = EpochRequestScheduleCommandReceipt.FromRequestAndExecution(
            request,
            historyEntry,
            execution,
            DateTimeOffset.UtcNow);

        receipts.Add(receipt);
        Save(receipts);

        return receipt;
    }

    public static bool TryAppend(
        EpochWebportalScheduleRequest request,
        EpochScheduleExecutionHistoryEntry historyEntry,
        EpochScheduleExecutionReceipt execution,
        out EpochRequestScheduleCommandReceipt? receipt)
    {
        try
        {
            receipt = Append(request, historyEntry, execution);
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

    private static void Save(IReadOnlyList<EpochRequestScheduleCommandReceipt> receipts)
    {
        string path = ReceiptPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App request-to-command receipt path does not have a directory.");
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
            // Keep the app usable even if Windows has the invalid receipt ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
