using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Linq;
using System.Windows.Forms;

namespace CCUsageDashboard;

internal sealed class MixChart : Control
{
	public UsageTotals Totals { get; set; }

	public MixChart()
	{
		Totals = new UsageTotals();
	}

	protected override void OnPaint(PaintEventArgs e)
	{
		base.OnPaint(e);
		e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
		e.Graphics.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;
		e.Graphics.Clear(Color.White);
		List<Tuple<string, double, Color>> list = new Tuple<string, double, Color>[4]
		{
			new Tuple<string, double, Color>("输入", Totals.InputTokens, Color.FromArgb(49, 109, 202)),
			new Tuple<string, double, Color>("输出", Totals.OutputTokens, Color.FromArgb(45, 125, 95)),
			new Tuple<string, double, Color>("缓存读取", Totals.CacheReadTokens, Color.FromArgb(185, 119, 20)),
			new Tuple<string, double, Color>("缓存创建", Totals.CacheCreationTokens, Color.FromArgb(187, 74, 74))
		}.Where((Tuple<string, double, Color> i) => i.Item2 > 0.0).ToList();
		double num = list.Sum((Tuple<string, double, Color> i) => i.Item2);
		if (num <= 0.0)
		{
			using (SolidBrush brush = new SolidBrush(Color.FromArgb(101, 113, 108)))
			{
				e.Graphics.DrawString("无数据", Font, brush, 20f, 44f);
				return;
			}
		}
		int num2 = Math.Min(base.Width, base.Height - 92) - 28;
		Rectangle rect = new Rectangle((base.Width - num2) / 2, 18, num2, num2);
		float num3 = -90f;
		foreach (Tuple<string, double, Color> item in list)
		{
			float num4 = (float)(item.Item2 / num * 360.0);
			using (SolidBrush brush = new SolidBrush(item.Item3))
			{
				e.Graphics.FillPie(brush, rect, num3, num4);
			}
			num3 += num4;
		}
		using (SolidBrush brush = new SolidBrush(Color.White))
		{
			e.Graphics.FillEllipse(brush, (float)rect.Left + (float)num2 * 0.28f, (float)rect.Top + (float)num2 * 0.28f, (float)num2 * 0.44f, (float)num2 * 0.44f);
		}
		using Font font = new Font("Segoe UI", 8.5f);
		int num5 = Math.Max(126, (base.Width - 44) / 2);
		for (int num6 = 0; num6 < list.Count; num6++)
		{
			int num7 = 18 + num6 % 2 * num5;
			int num8 = base.Height - 48 + num6 / 2 * 20;
			using (SolidBrush brush = new SolidBrush(list[num6].Item3))
			{
				e.Graphics.FillRectangle(brush, num7, num8 + 3, 10, 10);
			}
			using SolidBrush brush = new SolidBrush(Color.FromArgb(101, 113, 108));
			e.Graphics.DrawString(list[num6].Item1, font, brush, num7 + 16, num8);
		}
	}
}
