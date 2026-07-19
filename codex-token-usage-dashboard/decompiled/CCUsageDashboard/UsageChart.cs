using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Linq;
using System.Windows.Forms;

namespace CCUsageDashboard;

internal sealed class UsageChart : Control
{
	public List<UsageRow> Rows { get; set; }

	public List<IntradayPoint> IntradayPoints { get; set; }

	public UsageChart()
	{
		Rows = new List<UsageRow>();
		IntradayPoints = new List<IntradayPoint>();
	}

	protected override void OnPaint(PaintEventArgs e)
	{
		base.OnPaint(e);
		e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
		e.Graphics.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;
		e.Graphics.Clear(Color.White);
		if (IntradayPoints != null && IntradayPoints.Count > 0)
		{
			DrawIntraday(e.Graphics);
			return;
		}
		if (Rows.Count == 0)
		{
			DrawCentered(e.Graphics, "没有数据");
			return;
		}
		Rectangle rectangle = new Rectangle(56, 20, Math.Max(10, base.Width - 80), Math.Max(10, base.Height - 62));
		double num = Math.Max(1.0, Rows.Max((UsageRow r) => r.TotalTokens));
		using Pen pen = new Pen(Color.FromArgb(220, 228, 223));
		using SolidBrush brush = new SolidBrush(Color.FromArgb(101, 113, 108));
		using Font font = new Font("Segoe UI", 8.5f);
		for (int num2 = 0; num2 <= 4; num2++)
		{
			int num3 = rectangle.Top + rectangle.Height * num2 / 4;
			e.Graphics.DrawLine(pen, rectangle.Left, num3, rectangle.Right, num3);
			double value = num * (1.0 - (double)num2 / 4.0);
			e.Graphics.DrawString(Compact(value), font, brush, 4f, num3 - 7);
		}
		double num4 = (double)rectangle.Width / (double)Rows.Count;
		double num5 = Math.Max(12.0, num4 * 0.52);
		for (int num2 = 0; num2 < Rows.Count; num2++)
		{
			UsageRow usageRow = Rows[num2];
			double num6 = (double)rectangle.Left + num4 * (double)num2 + (num4 - num5) / 2.0;
			double num7 = (double)rectangle.Height * usageRow.TotalTokens / num;
			int bottom = rectangle.Bottom;
			DrawSegment(e.Graphics, Color.FromArgb(185, 119, 20), num6, ref bottom, num5, num7 * usageRow.CacheReadTokens / Math.Max(usageRow.TotalTokens, 1.0));
			DrawSegment(e.Graphics, Color.FromArgb(49, 109, 202), num6, ref bottom, num5, num7 * usageRow.InputTokens / Math.Max(usageRow.TotalTokens, 1.0));
			DrawSegment(e.Graphics, Color.FromArgb(45, 125, 95), num6, ref bottom, num5, num7 * usageRow.OutputTokens / Math.Max(usageRow.TotalTokens, 1.0));
			string text = (string.IsNullOrWhiteSpace(usageRow.DisplayLabel) ? usageRow.Label : usageRow.DisplayLabel);
			e.Graphics.DrawString((text.Length > 16) ? text.Substring(0, 16) : text, font, brush, (float)num6, rectangle.Bottom + 8);
		}
	}

	private void DrawIntraday(Graphics g)
	{
		Rectangle rectangle = new Rectangle(56, 20, Math.Max(10, base.Width - 80), Math.Max(10, base.Height - 62));
		double num = Math.Max(1.0, IntradayPoints.Max((IntradayPoint p) => p.CumulativeTokens));
		using Pen pen = new Pen(Color.FromArgb(220, 228, 223));
		using SolidBrush brush = new SolidBrush(Color.FromArgb(101, 113, 108));
		using Pen pen2 = new Pen(Color.FromArgb(49, 109, 202), 3f);
		using SolidBrush brush2 = new SolidBrush(Color.FromArgb(49, 109, 202));
		using Font font = new Font("Segoe UI", 8.5f);
		for (int num2 = 0; num2 <= 4; num2++)
		{
			int num3 = rectangle.Top + rectangle.Height * num2 / 4;
			g.DrawLine(pen, rectangle.Left, num3, rectangle.Right, num3);
			double value = num * (1.0 - (double)num2 / 4.0);
			g.DrawString(Compact(value), font, brush, 4f, num3 - 7);
		}
		List<PointF> list = new List<PointF>();
		for (int num2 = 0; num2 < IntradayPoints.Count; num2++)
		{
			float num4 = (float)rectangle.Left + (float)(rectangle.Width * num2) / (float)Math.Max(1, IntradayPoints.Count - 1);
			float num5 = (float)rectangle.Bottom - (float)((double)rectangle.Height * IntradayPoints[num2].CumulativeTokens / num);
			list.Add(new PointF(num4, num5));
		}
		if (list.Count > 1)
		{
			g.DrawLines(pen2, list.ToArray());
		}
		foreach (PointF item in list)
		{
			g.FillEllipse(brush2, item.X - 3f, item.Y - 3f, 6f, 6f);
		}
		for (int num2 = 0; num2 < IntradayPoints.Count; num2 += 6)
		{
			float num4 = (float)rectangle.Left + (float)(rectangle.Width * num2) / (float)Math.Max(1, IntradayPoints.Count - 1);
			g.DrawString(IntradayPoints[num2].Label, font, brush, num4 - 15f, rectangle.Bottom + 8);
		}
		if (IntradayPoints.Count > 0)
		{
			IntradayPoint intradayPoint = IntradayPoints[IntradayPoints.Count - 1];
			g.DrawString("累计 " + DashboardForm.FormatNumber(intradayPoint.CumulativeTokens), font, brush, rectangle.Right - 110, rectangle.Top + 8);
		}
	}

	private static void DrawSegment(Graphics g, Color color, double x, ref int bottom, double width, double height)
	{
		using SolidBrush brush = new SolidBrush(color);
		float num = Math.Max(0f, (float)height);
		g.FillRectangle(brush, (float)x, (float)bottom - num, (float)width, num);
		bottom -= (int)num;
	}

	private void DrawCentered(Graphics g, string text)
	{
		using SolidBrush brush = new SolidBrush(Color.FromArgb(101, 113, 108));
		SizeF sizeF = g.MeasureString(text, Font);
		g.DrawString(text, Font, brush, ((float)base.Width - sizeF.Width) / 2f, ((float)base.Height - sizeF.Height) / 2f);
	}

	private static string Compact(double value)
	{
		if (value >= 1000000.0)
		{
			return (value / 1000000.0).ToString("0.#") + "M";
		}
		if (value >= 1000.0)
		{
			return (value / 1000.0).ToString("0.#") + "K";
		}
		return value.ToString("0");
	}
}
