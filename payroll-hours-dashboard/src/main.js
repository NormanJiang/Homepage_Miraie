import payslipData from "./payslip-data.json";
import "./styles.css";

const data = payslipData;
const records = data.records;
const daily = data.daily_entries;
const totals = data.totals;

const money = (value) =>
  new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(value || 0);
const number = (value, digits = 2) =>
  new Intl.NumberFormat("en-NZ", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value || 0);
const date = (value) =>
  new Intl.DateTimeFormat("en-NZ", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
const range = (row) => `${date(row.period_start)} - ${date(row.period_end)}`;

function linePath(points, width, height, padding, domain) {
  const xs = points.map((_, i) => padding + (i * (width - padding * 2)) / Math.max(points.length - 1, 1));
  const min = domain?.min ?? Math.min(...points);
  const max = domain?.max ?? Math.max(...points);
  const span = max - min || 1;
  return points
    .map((value, i) => {
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${xs[i].toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function ChartFrame({ title, subtitle, children }) {
  return `
    <section class="panel chart-panel">
      <div class="panel-head">
        <div>
          <h2>${title}</h2>
          <p>${subtitle}</p>
        </div>
      </div>
      ${children}
    </section>
  `;
}

function WeeklyBars() {
  const max = Math.max(...records.map((row) => row.total_hours));
  return ChartFrame({
    title: "Weekly hours",
    subtitle: `Highest week: ${number(max)} hours. Average: ${number(totals.average_hours_per_week)} hours.`,
    children: `
      <div class="bar-chart">
        ${records
          .map(
            (row) => `
              <div class="bar-row">
                <span>${range(row)}</span>
                <div class="bar-track"><div class="bar-fill hours" style="width:${(row.total_hours / max) * 100}%"></div></div>
                <strong>${number(row.total_hours)}h</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    `,
  });
}

function PayTrend() {
  const width = 760;
  const height = 240;
  const padding = 32;
  const payValues = records.flatMap((row) => [row.gross_pay, row.net_pay]);
  const domain = { min: Math.min(...payValues), max: Math.max(...payValues) };
  const grossPath = linePath(records.map((row) => row.gross_pay), width, height, padding, domain);
  const netPath = linePath(records.map((row) => row.net_pay), width, height, padding, domain);
  return ChartFrame({
    title: "Weekly pay trend",
    subtitle: `Net pay high: ${money(Math.max(...records.map((row) => row.net_pay)))}. Low: ${money(Math.min(...records.map((row) => row.net_pay)))}.`,
    children: `
      <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Weekly pay trend">
        <path class="grid" d="M ${padding} ${height - padding} H ${width - padding}" />
        <path class="line gross" d="${grossPath}" />
        <path class="line net" d="${netPath}" />
        ${records
          .map((row, i) => {
            const x = padding + (i * (width - padding * 2)) / Math.max(records.length - 1, 1);
            return `<text x="${x}" y="${height - 8}" text-anchor="middle">${date(row.period_end)}</text>`;
          })
          .join("")}
      </svg>
      <div class="legend"><span class="dot gross"></span>Gross pay <span class="dot net"></span>Net pay</div>
    `,
  });
}

function DailyHours() {
  const max = Math.max(...daily.map((row) => row.hours));
  return ChartFrame({
    title: "Daily hours distribution",
    subtitle: `Longest day: ${number(max)} hours across ${totals.work_days} work days.`,
    children: `
      <div class="daily-chart" style="--count:${daily.length}">
        ${daily
          .map(
            (row) => `
              <div class="daily-bar" title="${row.date}: ${number(row.hours)}h">
                <div style="height:${(row.hours / max) * 100}%"></div>
                <span>${new Date(`${row.date}T00:00:00`).getDate()}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    `,
  });
}

function CumulativeTrend() {
  return ChartFrame({
    title: "Cumulative earnings",
    subtitle: `Cumulative net pay: ${money(totals.net_pay)}. PAYE paid: ${money(totals.paye_tax)}.`,
    children: `
      <div class="stack-list">
        ${records
          .map(
            (row) => `
              <div>
                <div class="stack-label"><span>${range(row)}</span><strong>${money(row.cumulative_net_pay)}</strong></div>
                <div class="stack-track">
                  <div class="stack-net" style="width:${(row.cumulative_net_pay / totals.net_pay) * 100}%"></div>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `,
  });
}

function TaxSplit() {
  return ChartFrame({
    title: "Net pay and PAYE split",
    subtitle: `Net pay is ${number((totals.net_pay / totals.gross_pay) * 100, 1)}% of gross pay. PAYE is ${number((totals.paye_tax / totals.gross_pay) * 100, 1)}%.`,
    children: `
      <div class="donut-wrap">
        <div class="donut" style="--tax:${(totals.paye_tax / totals.gross_pay) * 100}%"></div>
        <div class="split-stats">
          <div><span>Net Pay</span><strong>${money(totals.net_pay)}</strong></div>
          <div><span>PAYE Tax</span><strong>${money(totals.paye_tax)}</strong></div>
          <div><span>Gross Pay</span><strong>${money(totals.gross_pay)}</strong></div>
        </div>
      </div>
    `,
  });
}

function WeeklyTable() {
  return `
    <section class="panel table-panel">
      <div class="panel-head">
        <div>
          <h2>Payslip details</h2>
          <p>Weekly summary with payment dates and year-to-date validation values.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Hours</th>
              <th>Gross pay</th>
              <th>PAYE</th>
              <th>Net pay</th>
              <th>Payment date</th>
              <th>YTD net pay</th>
            </tr>
          </thead>
          <tbody>
            ${records
              .map(
                (row) => `
                  <tr>
                    <td>${range(row)}</td>
                    <td>${number(row.total_hours)}h</td>
                    <td>${money(row.gross_pay)}</td>
                    <td>${money(row.paye_tax)}</td>
                    <td>${money(row.net_pay)}</td>
                    <td>${date(row.payment_date)}</td>
                    <td>${money(row.ytd_net_pay)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function App() {
  return `
    <div class="dashboard-shell">
      <header class="site-header">
        <a class="brand" href="../" aria-label="Back to home">norman<span>jiang</span></a>
        <a class="home-link" href="../">Home <span aria-hidden="true">↗</span></a>
      </header>

      <section class="dashboard-hero">
        <div>
          <p class="eyebrow">Payroll Analytics</p>
          <h1>Hours and pay dashboard</h1>
          <p class="subtle">${records[0].period_start} to ${records[records.length - 1].period_end}, ${records[0].employer}</p>
        </div>
        <aside class="updated" aria-label="Payroll data summary">
          <span>Last update</span>
          <strong>${date(records[records.length - 1].payment_date)}</strong>
          <div>
            <p><span>${totals.weeks}</span> payslips</p>
            <p><span>${totals.work_days}</span> work days</p>
          </div>
        </aside>
      </section>

      <section class="kpis">
        <article><span>Total hours</span><strong>${number(totals.hours)}h</strong><small>Average ${number(totals.average_hours_per_week)}h / week</small></article>
        <article><span>Gross pay</span><strong>${money(totals.gross_pay)}</strong><small>${number(totals.average_effective_hourly_rate)} NZD / hour</small></article>
        <article><span>Net pay</span><strong>${money(totals.net_pay)}</strong><small>Average ${money(totals.average_net_per_week)} / week</small></article>
        <article><span>PAYE tax</span><strong>${money(totals.paye_tax)}</strong><small>${totals.weeks} payslips</small></article>
      </section>

      <section class="grid">
        ${WeeklyBars()}
        ${PayTrend()}
        ${DailyHours()}
        ${CumulativeTrend()}
        ${TaxSplit()}
        ${WeeklyTable()}
      </section>
    </div>
  `;
}

document.querySelector("#app").innerHTML = App();

function animateDashboard() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const duration = 1000;
  const counterElements = [
    ...document.querySelectorAll(".kpis strong, .bar-row strong, .stack-label strong, .split-stats strong"),
    ...[...document.querySelectorAll(".table-panel tbody td")].filter((cell) => cell.cellIndex !== 0 && cell.cellIndex !== 5),
  ];
  const counters = counterElements.map((element) => {
    const content = element.textContent.trim();
    return {
      element,
      value: Number(content.replace(/[^0-9.-]/g, "")),
      isMoney: content.includes("$"),
      suffix: content.endsWith("h") ? "h" : "",
    };
  });
  const widths = [...document.querySelectorAll(".bar-fill, .stack-net")].map((element) => ({
    element,
    target: element.style.width,
  }));
  const dailyBars = [...document.querySelectorAll(".daily-bar > div")];
  const donuts = [...document.querySelectorAll(".donut")].map((element) => ({
    element,
    target: element.style.getPropertyValue("--tax"),
  }));
  const lines = [...document.querySelectorAll(".line-chart .line")];
  const tableBody = document.querySelector(".table-panel tbody");

  counters.forEach(({ element, isMoney, suffix }) => {
    element.textContent = isMoney ? money(0) : `${number(0)}${suffix}`;
  });
  widths.forEach(({ element }) => {
    element.style.width = "0";
  });
  dailyBars.forEach((element) => {
    element.style.transform = "scaleY(0)";
  });
  donuts.forEach(({ element }) => {
    element.style.setProperty("--tax", "0%");
  });
  lines.forEach((line) => {
    const length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
  });
  if (tableBody) tableBody.style.opacity = "0";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const startedAt = performance.now();
      widths.forEach(({ element, target }) => {
        element.style.width = target;
      });
      dailyBars.forEach((element) => {
        element.style.transform = "scaleY(1)";
      });
      donuts.forEach(({ element, target }) => {
        element.style.setProperty("--tax", target);
      });
      lines.forEach((line) => {
        line.style.strokeDashoffset = "0";
      });
      if (tableBody) tableBody.style.opacity = "1";

      function tick(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        counters.forEach(({ element, value, isMoney, suffix }) => {
          const current = value * eased;
          element.textContent = isMoney ? money(current) : `${number(current)}${suffix}`;
        });
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  });
}

animateDashboard();
