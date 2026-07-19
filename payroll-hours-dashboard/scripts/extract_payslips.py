import json
import re
from datetime import datetime
from pathlib import Path

import pdfplumber


MONEY_RE = re.compile(r"\$([0-9,]+\.\d{2})")
PERIOD_RE = re.compile(r"PAY SLIP - PERIOD ENDING:\s*(\d{2}/\d{2}/\d{4})")
PAYMENT_RE = re.compile(r"Payment will be made into your nominated bank account on\s*(\d{2}/\d{2}/\d{4})")


def money(value):
    if value is None:
        return None
    match = MONEY_RE.search(str(value))
    return round(float(match.group(1).replace(",", "")), 2) if match else None


def iso_date(value):
    return datetime.strptime(value, "%d/%m/%Y").date().isoformat()


def parse_pdf(path):
    with pdfplumber.open(path) as pdf:
        page = pdf.pages[0]
        text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
        tables = page.extract_tables()

    period_end = iso_date(PERIOD_RE.search(text).group(1))
    payment_match = PAYMENT_RE.search(text)
    payment_date = iso_date(payment_match.group(1)) if payment_match else None

    rows = []
    employer = None
    for table in tables:
        for i, row in enumerate(table):
            cells = [(cell or "").strip() for cell in row]
            if cells and cells[0] == "Open Country Dairy":
                employer = cells[0]
            if len(cells) >= 6 and re.match(r"\d{2}/\d{2}/\d{4}", cells[0]):
                rows.append(
                    {
                        "date": iso_date(cells[0]),
                        "job": cells[1],
                        "item": cells[2],
                        "hours": float(cells[3]),
                        "rate": money(cells[4]),
                        "amount": money(cells[5]),
                    }
                )

    values = {}
    ytd = {}
    in_ytd = False
    for line in text.splitlines():
        stripped = line.strip()
        if stripped == "YEAR TO DATE:":
            in_ytd = True
            continue
        if stripped.startswith("EMP #:"):
            in_ytd = False
        for label, key in [
            ("Gross:", "gross_pay"),
            ("PAYE Tax:", "paye_tax"),
            ("Net Pay:", "net_pay"),
            ("Gross Pay", "gross_pay"),
            ("PAYE Tax", "paye_tax"),
            ("Net Pay", "net_pay"),
        ]:
            if stripped.startswith(label):
                amount = money(stripped)
                if amount is not None:
                    (ytd if in_ytd else values)[key] = amount

    filename_period = re.match(r"(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})\.pdf", path.name)
    week_start = filename_period.group(1) if filename_period else (rows[0]["date"] if rows else None)
    week_end = filename_period.group(2) if filename_period else period_end
    total_hours = round(sum(row["hours"] for row in rows), 2)
    effective_rate = round(values.get("gross_pay", 0) / total_hours, 2) if total_hours else None

    return {
        "source_file": path.name,
        "period_start": week_start,
        "period_end": period_end,
        "last_work_date": week_end,
        "payment_date": payment_date,
        "employer": employer,
        "work_entries": rows,
        "total_hours": total_hours,
        "gross_pay": values.get("gross_pay"),
        "paye_tax": values.get("paye_tax"),
        "net_pay": values.get("net_pay"),
        "effective_hourly_rate": effective_rate,
        "ytd_gross_pay": ytd.get("gross_pay"),
        "ytd_paye_tax": ytd.get("paye_tax"),
        "ytd_net_pay": ytd.get("net_pay"),
    }


def main():
    base = Path("work/payslips")
    records = [parse_pdf(path) for path in sorted(base.glob("*.pdf"))]
    records.sort(key=lambda row: row["period_start"])

    cumulative_hours = 0
    cumulative_gross = 0
    cumulative_net = 0
    cumulative_tax = 0
    for row in records:
        cumulative_hours += row["total_hours"] or 0
        cumulative_gross += row["gross_pay"] or 0
        cumulative_net += row["net_pay"] or 0
        cumulative_tax += row["paye_tax"] or 0
        row["cumulative_hours"] = round(cumulative_hours, 2)
        row["cumulative_gross_pay"] = round(cumulative_gross, 2)
        row["cumulative_net_pay"] = round(cumulative_net, 2)
        row["cumulative_paye_tax"] = round(cumulative_tax, 2)

    daily = []
    for row in records:
        for entry in row["work_entries"]:
            daily.append(
                {
                    **entry,
                    "period_start": row["period_start"],
                    "period_end": row["period_end"],
                    "employer": row["employer"],
                }
            )

    output = {
        "generated_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "payroll_sender": "payrollak@onestaff.co.nz",
        "records": records,
        "daily_entries": daily,
        "totals": {
            "weeks": len(records),
            "work_days": len(daily),
            "hours": round(cumulative_hours, 2),
            "gross_pay": round(cumulative_gross, 2),
            "net_pay": round(cumulative_net, 2),
            "paye_tax": round(cumulative_tax, 2),
            "average_hours_per_week": round(cumulative_hours / len(records), 2) if records else 0,
            "average_net_per_week": round(cumulative_net / len(records), 2) if records else 0,
            "average_effective_hourly_rate": round(cumulative_gross / cumulative_hours, 2) if cumulative_hours else 0,
        },
    }

    out = Path("work/payslip-data.json")
    out.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(json.dumps(output["totals"], indent=2))


if __name__ == "__main__":
    main()
