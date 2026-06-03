using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochCustomerScheduleStatusStore
{
    public const string StatusFileName = "customer-schedule-status.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string StatusPath => Path.Combine(ResolveStateDirectory(), StatusFileName);

    public static IReadOnlyList<EpochCustomerScheduleStatusRecord> Load()
    {
        string path = StatusPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochCustomerScheduleStatusRecord>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochCustomerScheduleStatusRecord>? entries =
                JsonSerializer.Deserialize<List<EpochCustomerScheduleStatusRecord>>(json, JsonOptions);

            if (entries is not null)
            {
                return entries;
            }

            return Array.Empty<EpochCustomerScheduleStatusRecord>();
        }
        catch (JsonException)
        {
            ArchiveInvalidStatuses(path);
            return Array.Empty<EpochCustomerScheduleStatusRecord>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochCustomerScheduleStatusRecord>();
        }
    }

    public static EpochCustomerScheduleStatusRecord Append(
        EpochWebportalScheduleRequest request,
        EpochRequestScheduleCommandReceipt commandReceipt,
        EpochScheduleExecutionHistoryEntry historyEntry)
    {
        List<EpochCustomerScheduleStatusRecord> statuses = Load().ToList();
        EpochCustomerScheduleStatusRecord status = EpochCustomerScheduleStatusRecord.FromScheduleChain(
            request,
            commandReceipt,
            historyEntry,
            DateTimeOffset.UtcNow);

        statuses.Add(status);
        Save(statuses);

        return status;
    }

    public static bool TryAppend(
        EpochWebportalScheduleRequest request,
        EpochRequestScheduleCommandReceipt commandReceipt,
        EpochScheduleExecutionHistoryEntry historyEntry,
        out EpochCustomerScheduleStatusRecord? status)
    {
        try
        {
            status = Append(request, commandReceipt, historyEntry);
            return true;
        }
        catch (IOException)
        {
            status = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            status = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochCustomerScheduleStatusRecord> statuses)
    {
        string path = StatusPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App customer schedule status path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(statuses, JsonOptions));
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

    private static void ArchiveInvalidStatuses(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid status ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
