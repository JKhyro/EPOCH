using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedRulepackOwnerDecisionStore
{
    public const string DecisionFileName = "revised-rulepack-owner-decisions.json";

    private const string DefaultDecisionId = "epoch-revised-rulepack-owner-decision-001";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string DecisionPath => Path.Combine(ResolveStateDirectory(), DecisionFileName);

    public static IReadOnlyList<EpochRevisedRulepackOwnerDecision> Load()
    {
        string path = DecisionPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedRulepackOwnerDecision>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedRulepackOwnerDecision>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedRulepackOwnerDecision>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedRulepackOwnerDecision>();
        }
        catch (JsonException)
        {
            ArchiveInvalidDecisions(path);
            return Array.Empty<EpochRevisedRulepackOwnerDecision>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedRulepackOwnerDecision>();
        }
    }

    public static EpochRevisedRulepackOwnerDecision EnsureDefaultDecision(EpochShellSnapshot snapshot)
    {
        List<EpochRevisedRulepackOwnerDecision> decisions = Load().ToList();
        EpochRevisedRulepackOwnerDecision? existing =
            decisions.FirstOrDefault(item => item.DecisionId == DefaultDecisionId);
        if (existing is not null)
        {
            return existing;
        }

        EpochRevisedRulepackOwnerDecision decision =
            EpochRevisedRulepackOwnerDecision.FromSnapshot(
                snapshot,
                DefaultDecisionId,
                DateTimeOffset.UtcNow);

        decisions.Add(decision);
        Save(decisions);

        return decision;
    }

    public static bool TryEnsureDefaultDecision(
        EpochShellSnapshot snapshot,
        out EpochRevisedRulepackOwnerDecision? decision)
    {
        try
        {
            decision = EnsureDefaultDecision(snapshot);
            return true;
        }
        catch (IOException)
        {
            decision = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            decision = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochRevisedRulepackOwnerDecision> decisions)
    {
        string path = DecisionPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised rulepack owner decision path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(decisions, JsonOptions));
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

    private static void ArchiveInvalidDecisions(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the App usable even if Windows has the invalid owner decision ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should stay closed to conversion.
        }
    }
}
