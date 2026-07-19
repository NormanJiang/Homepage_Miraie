using System.Collections.Generic;

namespace CCUsageDashboard;

internal sealed class UsageResult
{
	public List<UsageRow> Rows { get; set; }

	public UsageTotals Totals { get; set; }

	public UsageResult()
	{
		Rows = new List<UsageRow>();
		Totals = new UsageTotals();
	}
}
