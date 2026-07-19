using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Windows.Forms;

namespace CCUsageDashboard;

internal sealed class DashboardForm : Form
{
	private readonly Dictionary<string, Button> rangeButtons = new Dictionary<string, Button>();

	private readonly Label title = new Label();

	private readonly Label updated = new Label();

	private readonly Label trendTitle = new Label();

	private readonly Label brandMark = new Label();

	private readonly FlowLayoutPanel metricPanel = new FlowLayoutPanel();

	private readonly UsageChart trendChart = new UsageChart();

	private readonly MixChart mixChart = new MixChart();

	private readonly DataGridView table = new DataGridView();

	private string currentRange = "daily";

	private bool renderingTable;

	private List<UsageRow> currentRows = new List<UsageRow>();

	private UsageTotals currentTotals = new UsageTotals();

	public DashboardForm()
	{
		Text = "Codex Token Usage Dashboard";
		base.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
		base.AutoScaleMode = AutoScaleMode.Dpi;
		DoubleBuffered = true;
		MinimumSize = new Size(1180, 780);
		base.Size = new Size(1500, 960);
		BackColor = Color.FromArgb(246, 247, 244);
		Font = new Font("Segoe UI", 10f);
		TableLayoutPanel tableLayoutPanel = new TableLayoutPanel
		{
			Dock = DockStyle.Fill,
			ColumnCount = 1,
			RowCount = 4,
			Padding = new Padding(22),
			BackColor = BackColor
		};
		tableLayoutPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 108f));
		tableLayoutPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 100f));
		tableLayoutPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 55f));
		tableLayoutPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 45f));
		base.Controls.Add(tableLayoutPanel);
		brandMark.Text = "Miraie";
		brandMark.Font = new Font("Segoe UI", 8.5f, FontStyle.Italic);
		brandMark.ForeColor = Color.FromArgb(128, 139, 134);
		brandMark.BackColor = Color.White;
		brandMark.TextAlign = ContentAlignment.MiddleRight;
		brandMark.Width = 160;
		brandMark.Height = 22;
		base.Controls.Add(brandMark);
		brandMark.BringToFront();
		EventHandler value = delegate
		{
			PositionBrandMark();
		};
		base.Resize += value;
		tableLayoutPanel.Controls.Add(BuildHeader(), 0, 0);
		tableLayoutPanel.Controls.Add(metricPanel, 0, 1);
		tableLayoutPanel.Controls.Add(BuildCharts(), 0, 2);
		tableLayoutPanel.Controls.Add(BuildTable(), 0, 3);
		base.Load += delegate
		{
			RefreshData();
		};
		base.Shown += delegate
		{
			PositionBrandMark();
		};
	}

	private void PositionBrandMark()
	{
		brandMark.Location = new Point(Math.Max(0, base.ClientSize.Width - brandMark.Width - 30), Math.Max(0, base.ClientSize.Height - brandMark.Height - 18));
	}

	private Control BuildHeader()
	{
		TableLayoutPanel tableLayoutPanel = new TableLayoutPanel();
		tableLayoutPanel.Dock = DockStyle.Fill;
		tableLayoutPanel.ColumnCount = 2;
		TableLayoutPanel tableLayoutPanel2 = tableLayoutPanel;
		tableLayoutPanel2.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
		tableLayoutPanel2.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 520f));
		Panel panel = new Panel();
		panel.Dock = DockStyle.Fill;
		Panel panel2 = panel;
		title.Text = "Codex Token Usage";
		title.Font = new Font("Segoe UI", 24f, FontStyle.Bold);
		title.ForeColor = Color.FromArgb(23, 32, 28);
		title.AutoSize = true;
		title.Location = new Point(0, 8);
		updated.Text = "Codex token 使用量监测";
		updated.ForeColor = Color.FromArgb(101, 113, 108);
		updated.AutoSize = true;
		updated.Location = new Point(2, 68);
		panel2.Controls.Add(title);
		panel2.Controls.Add(updated);
		FlowLayoutPanel flowLayoutPanel = new FlowLayoutPanel();
		flowLayoutPanel.Dock = DockStyle.Fill;
		flowLayoutPanel.FlowDirection = FlowDirection.RightToLeft;
		flowLayoutPanel.WrapContents = false;
		flowLayoutPanel.Padding = new Padding(0, 0, 10, 0);
		FlowLayoutPanel flowLayoutPanel2 = flowLayoutPanel;
		Button button = NewButton("刷新");
		button.Width = 74;
		button.Click += delegate
		{
			RefreshData();
		};
		flowLayoutPanel2.Controls.Add(button);
		AddRangeButton(flowLayoutPanel2, "monthly", "月");
		AddRangeButton(flowLayoutPanel2, "weekly", "周");
		AddRangeButton(flowLayoutPanel2, "daily", "日");
		tableLayoutPanel2.Controls.Add(panel2, 0, 0);
		tableLayoutPanel2.Controls.Add(flowLayoutPanel2, 1, 0);
		return tableLayoutPanel2;
	}

	private void AddRangeButton(FlowLayoutPanel parent, string range, string text)
	{
		Button button = NewButton(text);
		button.Tag = range;
		button.Click += delegate
		{
			currentRange = range;
			RefreshData();
		};
		rangeButtons[range] = button;
		parent.Controls.Add(button);
	}

	private Button NewButton(string text)
	{
		Button button = new Button();
		button.Text = text;
		button.Width = 92;
		button.Height = 42;
		button.FlatStyle = FlatStyle.Flat;
		button.BackColor = Color.White;
		button.ForeColor = Color.FromArgb(23, 32, 28);
		button.Margin = new Padding(4, 10, 4, 4);
		return button;
	}

	private Control BuildCharts()
	{
		TableLayoutPanel tableLayoutPanel = new TableLayoutPanel();
		tableLayoutPanel.Dock = DockStyle.Fill;
		tableLayoutPanel.ColumnCount = 2;
		tableLayoutPanel.Padding = new Padding(0, 8, 0, 8);
		TableLayoutPanel tableLayoutPanel2 = tableLayoutPanel;
		tableLayoutPanel2.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 68f));
		tableLayoutPanel2.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 32f));
		trendChart.Dock = DockStyle.Fill;
		mixChart.Dock = DockStyle.Fill;
		trendTitle.Text = "趋势";
		trendTitle.Dock = DockStyle.Top;
		trendTitle.Height = 28;
		trendTitle.Font = new Font("Segoe UI", 12f, FontStyle.Bold);
		trendTitle.ForeColor = Color.FromArgb(23, 32, 28);
		tableLayoutPanel2.Controls.Add(WrapPanel(trendTitle, trendChart), 0, 0);
		tableLayoutPanel2.Controls.Add(WrapPanel("Token 构成", mixChart), 1, 0);
		return tableLayoutPanel2;
	}

	private Control BuildTable()
	{
		table.Dock = DockStyle.Fill;
		table.BackgroundColor = Color.White;
		table.BorderStyle = BorderStyle.None;
		table.AllowUserToAddRows = false;
		table.AllowUserToDeleteRows = false;
		table.ReadOnly = true;
		table.RowHeadersVisible = false;
		table.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
		table.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
		table.Columns.Add("Period", "时间");
		table.Columns.Add("Models", "模型");
		table.Columns.Add("Input", "输入");
		table.Columns.Add("Output", "输出");
		table.Columns.Add("Cache", "缓存读取");
		table.Columns.Add("Total", "总量");
		table.Columns.Add("Cost", "费用");
		table.SelectionChanged += delegate
		{
			ShowSelectedDayIntraday();
		};
		return WrapPanel("明细", table);
	}

	private Control WrapPanel(string caption, Control content)
	{
		Label label = new Label();
		label.Text = caption;
		label.Dock = DockStyle.Top;
		label.Height = 28;
		label.Font = new Font("Segoe UI", 12f, FontStyle.Bold);
		label.ForeColor = Color.FromArgb(23, 32, 28);
		Label label2 = label;
		return WrapPanel(label2, content);
	}

	private Control WrapPanel(Label label, Control content)
	{
		Panel panel = new Panel();
		panel.Dock = DockStyle.Fill;
		panel.BackColor = Color.White;
		panel.Padding = new Padding(14);
		panel.Margin = new Padding(0, 0, 12, 0);
		Panel panel2 = panel;
		content.Dock = DockStyle.Fill;
		panel2.Controls.Add(content);
		panel2.Controls.Add(label);
		return panel2;
	}

	private void RefreshData()
	{
		try
		{
			Cursor = Cursors.WaitCursor;
			foreach (KeyValuePair<string, Button> rangeButton in rangeButtons)
			{
				rangeButton.Value.BackColor = ((rangeButton.Key == currentRange) ? Color.FromArgb(238, 243, 240) : Color.White);
			}
			UsageResult usageResult = UsageReader.Load(currentRange);
			currentRows = usageResult.Rows;
			currentTotals = usageResult.Totals;
			updated.Text = "更新于 " + TimeUtil.NowInNewZealand().ToString("yyyy-MM-dd HH:mm:ss") + " " + TimeUtil.WeekdayName(TimeUtil.NowInNewZealand());
			RenderMetrics(usageResult.Totals);
			trendChart.Rows = usageResult.Rows;
			trendChart.IntradayPoints = new List<IntradayPoint>();
			trendTitle.Text = "趋势";
			mixChart.Totals = usageResult.Totals;
			trendChart.Invalidate();
			mixChart.Invalidate();
			RenderTable(usageResult.Rows);
		}
		catch (Exception ex)
		{
			MessageBox.Show(this, ex.Message, "读取数据失败", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		finally
		{
			Cursor = Cursors.Default;
		}
	}

	private void RenderMetrics(UsageTotals totals)
	{
		metricPanel.Controls.Clear();
		metricPanel.Dock = DockStyle.Fill;
		metricPanel.WrapContents = false;
		metricPanel.FlowDirection = FlowDirection.LeftToRight;
		AddMetric("总 Tokens", FormatNumber(totals.TotalTokens));
		AddMetric("估算费用", "$" + totals.CostUSD.ToString("0.00", CultureInfo.InvariantCulture));
		AddMetric("输入", FormatNumber(totals.InputTokens));
		AddMetric("输出", FormatNumber(totals.OutputTokens));
		AddMetric("缓存读取", FormatNumber(totals.CacheReadTokens));
	}

	private void AddMetric(string label, string value)
	{
		Panel panel = new Panel();
		panel.Width = 252;
		panel.Height = 88;
		panel.BackColor = Color.White;
		panel.Margin = new Padding(0, 8, 14, 8);
		panel.Padding = new Padding(12);
		Panel panel2 = panel;
		Label label2 = new Label();
		label2.Text = label;
		label2.ForeColor = Color.FromArgb(101, 113, 108);
		label2.Dock = DockStyle.Top;
		label2.Height = 24;
		Label value2 = label2;
		Label label3 = new Label();
		label3.Text = value;
		label3.Font = new Font("Segoe UI", 17f, FontStyle.Bold);
		label3.Dock = DockStyle.Fill;
		label3.ForeColor = Color.FromArgb(23, 32, 28);
		Label value3 = label3;
		panel2.Controls.Add(value3);
		panel2.Controls.Add(value2);
		metricPanel.Controls.Add(panel2);
	}

	private void RenderTable(List<UsageRow> rows)
	{
		renderingTable = true;
		table.Rows.Clear();
		foreach (UsageRow row in rows)
		{
			int index = table.Rows.Add(row.DisplayLabel, row.Models, FormatNumber(row.InputTokens), FormatNumber(row.OutputTokens), FormatNumber(row.CacheReadTokens), FormatNumber(row.TotalTokens), "$" + row.CostUSD.ToString("0.00"));
			table.Rows[index].Tag = row.Label;
		}
		renderingTable = false;
		ShowSelectedDayIntraday();
	}

	private void ShowSelectedDayIntraday()
	{
		if (renderingTable)
		{
			return;
		}
		if (currentRange != "daily" || table.SelectedRows.Count == 0)
		{
			trendChart.IntradayPoints = new List<IntradayPoint>();
			trendTitle.Text = "趋势";
			mixChart.Totals = currentTotals;
			mixChart.Invalidate();
			trendChart.Invalidate();
			return;
		}
		string date = Convert.ToString(table.SelectedRows[0].Tag, CultureInfo.InvariantCulture);
		if (string.IsNullOrWhiteSpace(date))
		{
			return;
		}
		try
		{
			Cursor = Cursors.WaitCursor;
			List<IntradayPoint> intradayPoints = UsageReader.LoadIntraday(date);
			UsageRow usageRow = currentRows.FirstOrDefault((UsageRow r) => string.Equals(r.Label, date, StringComparison.OrdinalIgnoreCase));
			if (usageRow != null)
			{
				mixChart.Totals = new UsageTotals
				{
					InputTokens = usageRow.InputTokens,
					OutputTokens = usageRow.OutputTokens,
					CacheReadTokens = usageRow.CacheReadTokens,
					CacheCreationTokens = usageRow.CacheCreationTokens,
					TotalTokens = usageRow.TotalTokens,
					CostUSD = usageRow.CostUSD
				};
				mixChart.Invalidate();
			}
			trendChart.IntradayPoints = intradayPoints;
			trendTitle.Text = TimeUtil.FormatDateWithWeekday(date) + " 30 分钟累计用量";
			trendChart.Invalidate();
		}
		catch (Exception ex)
		{
			trendChart.IntradayPoints = new List<IntradayPoint>();
			trendTitle.Text = "趋势";
			trendChart.Invalidate();
			MessageBox.Show(this, ex.Message, "读取当天明细失败", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
		}
		finally
		{
			Cursor = Cursors.Default;
		}
	}

	internal static string FormatNumber(double value)
	{
		return Math.Round(value).ToString("N0", CultureInfo.InvariantCulture);
	}
}
