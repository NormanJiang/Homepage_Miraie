# Payroll Hours Dashboard
# Miraie 2026.7.11


This site visualizes payslip data extracted from Outlook PDF attachments sent by `payrollak@onestaff.co.nz`.

The deployed site intentionally does not include raw payslip PDFs, IRD number, home address, or bank account details. It only embeds analytics fields such as hours, gross pay, PAYE tax, net pay, payment date, employer, and role.

## Refresh Workflow

1. Use Codex with Outlook Email access to search for new messages:
   `from:payrollak@onestaff.co.nz received>=2026-06-01 hasattachment:true`
2. Fetch any new PDF attachments into `work/payslips/`.
3. Run:
   `python scripts/extract_payslips.py`
4. Copy `work/payslip-data.json` to `src/payslip-data.json`.
5. Build, commit, save a Sites version, and deploy.

The `同步新工资单` button calls `/api/sync`. It is ready for a future Microsoft Graph/OAuth implementation, but this static deployment cannot directly reuse the Codex Outlook connector session.
