using System;
using System.Globalization;

namespace CCUsageDashboard;

internal static class TimeUtil
{
	private static readonly string[] Weekdays = new string[7] { "周日", "周一", "周二", "周三", "周四", "周五", "周六" };

	public static DateTime NowInNewZealand()
	{
		try
		{
			TimeZoneInfo destinationTimeZone = TimeZoneInfo.FindSystemTimeZoneById("New Zealand Standard Time");
			return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, destinationTimeZone);
		}
		catch
		{
			return DateTime.Now;
		}
	}

	public static string WeekdayName(DateTime date)
	{
		return Weekdays[(int)date.DayOfWeek];
	}

	public static string FormatDateWithWeekday(string value)
	{
		if (DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var result))
		{
			return value + " " + WeekdayName(result);
		}
		return value;
	}
}
