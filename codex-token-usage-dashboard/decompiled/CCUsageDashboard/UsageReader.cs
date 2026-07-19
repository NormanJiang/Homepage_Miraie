using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Script.Serialization;

namespace CCUsageDashboard;

internal static class UsageReader
{
	public static UsageResult Load(string range)
	{
		string input = RunCcusage(range);
		JavaScriptSerializer javaScriptSerializer = new JavaScriptSerializer();
		javaScriptSerializer.MaxJsonLength = int.MaxValue;
		JavaScriptSerializer javaScriptSerializer2 = javaScriptSerializer;
		if (!(javaScriptSerializer2.DeserializeObject(input) is Dictionary<string, object> root))
		{
			throw new InvalidOperationException("无法解析 ccusage 数据。");
		}
		List<UsageRow> rows = ReadRows(root, range);
		UsageTotals totals = ReadTotals(root, rows);
		UsageResult usageResult = new UsageResult();
		usageResult.Rows = rows;
		usageResult.Totals = totals;
		return usageResult;
	}

	public static List<IntradayPoint> LoadIntraday(string date)
	{
		string input = RunCcusage("session");
		JavaScriptSerializer javaScriptSerializer = new JavaScriptSerializer();
		javaScriptSerializer.MaxJsonLength = int.MaxValue;
		JavaScriptSerializer javaScriptSerializer2 = javaScriptSerializer;
		if (!(javaScriptSerializer2.DeserializeObject(input) is Dictionary<string, object> dictionary) || !dictionary.ContainsKey("session"))
		{
			return new List<IntradayPoint>();
		}
		if (!(dictionary["session"] is object[] array))
		{
			return new List<IntradayPoint>();
		}
		double[] array2 = new double[48];
		object[] array3 = array;
		foreach (object obj in array3)
		{
			if (obj is Dictionary<string, object> row)
			{
				string period = Text(row, "period") ?? "";
				string a = PeriodDate(period);
				if (string.Equals(a, date, StringComparison.OrdinalIgnoreCase) && PeriodTime(period, out var time))
				{
					int num = Math.Max(0, Math.Min(47, time.Hour * 2 + ((time.Minute >= 30) ? 1 : 0)));
					array2[num] += Number(row, "totalTokens");
				}
			}
		}
		List<IntradayPoint> list = new List<IntradayPoint>();
		double num2 = 0.0;
		DateTime dateTime = TimeUtil.NowInNewZealand();
		string b = dateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
		int num3 = (string.Equals(date, b, StringComparison.OrdinalIgnoreCase) ? Math.Max(0, Math.Min(47, dateTime.Hour * 2 + ((dateTime.Minute >= 30) ? 1 : 0))) : 47);
		for (int j = 0; j <= num3; j++)
		{
			num2 += array2[j];
			int num4 = j / 2;
			int num5 = ((j % 2 != 0) ? 30 : 0);
			list.Add(new IntradayPoint
			{
				Label = num4.ToString("00") + ":" + num5.ToString("00"),
				CumulativeTokens = num2
			});
		}
		return list;
	}

	private static string RunCcusage(string range)
	{
		string folderPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
		string text = Path.Combine(folderPath, "pnpm", "bin");
		string text2 = Path.Combine(text, "ccusage.cmd");
		if (!File.Exists(text2))
		{
			throw new FileNotFoundException("找不到 ccusage.cmd，请先安装 ccusage。", text2);
		}
		string text3 = "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin";
		ProcessStartInfo processStartInfo = new ProcessStartInfo();
		processStartInfo.FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe";
		processStartInfo.Arguments = "/d /s /c \"\"" + text2 + "\" " + range + " --offline --json\"";
		processStartInfo.UseShellExecute = false;
		processStartInfo.RedirectStandardOutput = true;
		processStartInfo.RedirectStandardError = true;
		processStartInfo.CreateNoWindow = true;
		processStartInfo.StandardOutputEncoding = Encoding.UTF8;
		processStartInfo.StandardErrorEncoding = Encoding.UTF8;
		ProcessStartInfo processStartInfo2 = processStartInfo;
		processStartInfo2.EnvironmentVariables["PATH"] = text3 + ";" + text + ";" + Environment.GetEnvironmentVariable("PATH");
		using Process process = Process.Start(processStartInfo2);
		string result = process.StandardOutput.ReadToEnd();
		string text4 = process.StandardError.ReadToEnd();
		process.WaitForExit();
		if (process.ExitCode != 0)
		{
			throw new InvalidOperationException(string.IsNullOrWhiteSpace(text4) ? "ccusage 运行失败。" : text4);
		}
		return result;
	}

	private static string PeriodDate(string period)
	{
		if (string.IsNullOrWhiteSpace(period) || period.Length < 10)
		{
			return "";
		}
		return period.Substring(0, 10).Replace("/", "-");
	}

	private static bool PeriodTime(string period, out DateTime time)
	{
		time = DateTime.MinValue;
		string text = "rollout-";
		int num = period.IndexOf(text, StringComparison.OrdinalIgnoreCase);
		if (num < 0 || period.Length < num + text.Length + 19)
		{
			return false;
		}
		string text2 = period.Substring(num + text.Length, 19);
		string s = text2.Substring(0, 13) + ":" + text2.Substring(14, 2) + ":" + text2.Substring(17, 2);
		return DateTime.TryParseExact(s, "yyyy-MM-ddTHH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out time);
	}

	private static List<UsageRow> ReadRows(Dictionary<string, object> root, string range)
	{
		if (!root.ContainsKey(range))
		{
			return new List<UsageRow>();
		}
		if (!(root[range] is object[] source))
		{
			return new List<UsageRow>();
		}
		return source.Select(delegate(object item, int index)
		{
			Dictionary<string, object> row = item as Dictionary<string, object>;
			string text = Text(row, "date", "period", "week", "month", "startTime", "blockStart") ?? ("#" + (index + 1));
			return new UsageRow
			{
				Label = text,
				DisplayLabel = TimeUtil.FormatDateWithWeekday(text),
				Models = Models(row),
				InputTokens = Number(row, "inputTokens"),
				OutputTokens = Number(row, "outputTokens"),
				CacheReadTokens = Number(row, "cacheReadTokens"),
				CacheCreationTokens = Number(row, "cacheCreationTokens"),
				TotalTokens = Number(row, "totalTokens"),
				CostUSD = Number(row, "costUSD", "totalCost")
			};
		}).ToList();
	}

	private static UsageTotals ReadTotals(Dictionary<string, object> root, List<UsageRow> rows)
	{
		Dictionary<string, object> dictionary = (root.ContainsKey("totals") ? (root["totals"] as Dictionary<string, object>) : null);
		if (dictionary == null)
		{
			UsageTotals usageTotals = new UsageTotals();
			usageTotals.InputTokens = rows.Sum((UsageRow r) => r.InputTokens);
			usageTotals.OutputTokens = rows.Sum((UsageRow r) => r.OutputTokens);
			usageTotals.CacheReadTokens = rows.Sum((UsageRow r) => r.CacheReadTokens);
			usageTotals.CacheCreationTokens = rows.Sum((UsageRow r) => r.CacheCreationTokens);
			usageTotals.TotalTokens = rows.Sum((UsageRow r) => r.TotalTokens);
			usageTotals.CostUSD = rows.Sum((UsageRow r) => r.CostUSD);
			return usageTotals;
		}
		UsageTotals usageTotals2 = new UsageTotals();
		usageTotals2.InputTokens = Number(dictionary, "inputTokens");
		usageTotals2.OutputTokens = Number(dictionary, "outputTokens");
		usageTotals2.CacheReadTokens = Number(dictionary, "cacheReadTokens");
		usageTotals2.CacheCreationTokens = Number(dictionary, "cacheCreationTokens");
		usageTotals2.TotalTokens = Number(dictionary, "totalTokens");
		usageTotals2.CostUSD = Number(dictionary, "costUSD", "totalCost");
		return usageTotals2;
	}

	private static string Models(Dictionary<string, object> row)
	{
		if (row == null)
		{
			return "-";
		}
		object[] array = (row.ContainsKey("modelsUsed") ? (row["modelsUsed"] as object[]) : null);
		if (array != null)
		{
			return string.Join(", ", array.Select(Convert.ToString).ToArray());
		}
		Dictionary<string, object> dictionary = (row.ContainsKey("models") ? (row["models"] as Dictionary<string, object>) : null);
		if (dictionary != null)
		{
			return string.Join(", ", dictionary.Keys.ToArray());
		}
		return "-";
	}

	private static string Text(Dictionary<string, object> row, params string[] keys)
	{
		if (row == null)
		{
			return null;
		}
		foreach (string key in keys)
		{
			if (row.ContainsKey(key) && row[key] != null)
			{
				return Convert.ToString(row[key], CultureInfo.InvariantCulture);
			}
		}
		return null;
	}

	private static double Number(Dictionary<string, object> row, params string[] keys)
	{
		if (row == null)
		{
			return 0.0;
		}
		foreach (string key in keys)
		{
			if (row.ContainsKey(key) && row[key] != null && double.TryParse(Convert.ToString(row[key], CultureInfo.InvariantCulture), NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
			{
				return result;
			}
		}
		return 0.0;
	}
}
