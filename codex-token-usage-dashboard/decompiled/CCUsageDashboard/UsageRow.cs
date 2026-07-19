namespace CCUsageDashboard;

internal sealed class UsageRow
{
	public string Label { get; set; }

	public string DisplayLabel { get; set; }

	public string Models { get; set; }

	public double InputTokens { get; set; }

	public double OutputTokens { get; set; }

	public double CacheReadTokens { get; set; }

	public double CacheCreationTokens { get; set; }

	public double TotalTokens { get; set; }

	public double CostUSD { get; set; }
}
