namespace CCUsageDashboard;

internal sealed class UsageTotals
{
	public double InputTokens { get; set; }

	public double OutputTokens { get; set; }

	public double CacheReadTokens { get; set; }

	public double CacheCreationTokens { get; set; }

	public double TotalTokens { get; set; }

	public double CostUSD { get; set; }
}
