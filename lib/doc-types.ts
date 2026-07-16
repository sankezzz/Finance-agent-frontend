import type { DocumentType } from "@/lib/api/types";

export const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "bank_statement", label: "Bank statement" },
  { value: "salary_slip", label: "Salary slip" },
  { value: "credit_card_statement", label: "Credit card statement" },
  { value: "loan_statement", label: "Loan statement" },
  { value: "investment_statement", label: "Investment statement" },
];

const LABELS: Record<DocumentType, string> = Object.fromEntries(
  DOC_TYPES.map((d) => [d.value, d.label])
) as Record<DocumentType, string>;

export function docTypeLabel(t: DocumentType): string {
  return LABELS[t] ?? t;
}

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".csv",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
];

export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");

export function isAcceptedFile(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Best-effort guess of a document's type from its filename. */
export function guessDocType(filename: string): DocumentType {
  const n = filename.toLowerCase();
  if (/(salary|payslip|pay-slip|payroll)/.test(n)) return "salary_slip";
  if (/(credit.?card|creditcard|\bcc\b)/.test(n)) return "credit_card_statement";
  if (/(loan|emi|mortgage)/.test(n)) return "loan_statement";
  if (/(invest|mutual|portfolio|demat|folio|equity|stock)/.test(n))
    return "investment_statement";
  return "bank_statement";
}
