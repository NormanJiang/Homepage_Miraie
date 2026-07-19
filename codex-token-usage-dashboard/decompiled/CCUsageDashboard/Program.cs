using System;
using System.Linq;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace CCUsageDashboard;

internal static class Program
{
	[DllImport("user32.dll")]
	private static extern bool SetProcessDPIAware();

	[DllImport("user32.dll")]
	private static extern bool SetProcessDpiAwarenessContext(IntPtr dpiContext);

	[STAThread]
	private static void Main(string[] args)
	{
		if (args.Any((string a) => string.Equals(a, "--health", StringComparison.OrdinalIgnoreCase)))
		{
			UsageResult usageResult = UsageReader.Load("daily");
			Console.WriteLine("rows=" + usageResult.Rows.Count + " total=" + usageResult.Totals.TotalTokens);
			return;
		}
		try
		{
			if (!SetProcessDpiAwarenessContext(new IntPtr(-4)))
			{
				SetProcessDPIAware();
			}
		}
		catch
		{
			try
			{
				SetProcessDPIAware();
			}
			catch
			{
			}
		}
		Application.EnableVisualStyles();
		Application.SetCompatibleTextRenderingDefault(defaultValue: false);
		Application.Run(new DashboardForm());
	}
}
