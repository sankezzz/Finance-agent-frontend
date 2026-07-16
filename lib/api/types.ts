// Typed mirror of api-reference.md. All money values are INR (₹), plain numbers.
// Percentages (savings_rate, debt_to_income) are FRACTIONS (0.42 == 42%).

/* ----------------------------- Enums ----------------------------- */

export type DocumentType =
  | "bank_statement"
  | "credit_card_statement"
  | "salary_slip"
  | "investment_statement"
  | "loan_statement";

export type DocumentStatus = "uploaded" | "processing" | "parsed" | "failed";

export type RunStatus = "pending" | "running" | "done" | "failed";
export type StageStatus = "pending" | "running" | "done" | "failed";
export type Stage = "parse" | "categorize" | "analyze" | "recommend";

export type LoanType =
  | "home"
  | "personal"
  | "auto"
  | "education"
  | "credit_card"
  | "other";

export type TransactionCategory =
  | "Food"
  | "Rent"
  | "Utilities"
  | "Shopping"
  | "Travel"
  | "Entertainment"
  | "EMI_Loan"
  | "Health"
  | "Investment"
  | "Income"
  | "Transfer"
  | "Other";

export type RecommendationCategory =
  | "savings"
  | "debt"
  | "spending"
  | "emergency_fund"
  | "investment"
  | "income"
  | "general";

export type Priority = "high" | "medium" | "low";

export type FactKind = "income" | "expense" | "asset" | "liability";

/* --------------------------- User models --------------------------- */

export interface Loan {
  type: LoanType;
  outstanding: number;
  monthly_emi: number;
}

export interface FinancialGoal {
  name: string;
  target_amount: number;
  target_date: string | null; // "YYYY-MM-DD" | null
}

export interface User {
  id: string;
  name: string;
  age: number;
  monthly_income: number | null;
  dependents: number;
  existing_loans: Loan[];
  financial_goals: FinancialGoal[];
  created_at: string;
}

/* ---------------------------- Documents ---------------------------- */

export interface Document {
  id: string;
  user_id: string;
  doc_type: DocumentType;
  filename: string;
  storage_path: string;
  content_type: string | null;
  size_bytes: number | null;
  status: DocumentStatus;
  created_at: string;
  url: string | null; // reserved; not currently populated
}

/* ------------------------------- Run ------------------------------- */

export interface StageState {
  stage: Stage;
  status: StageStatus;
  error: string | null;
}

export interface Run {
  id: string;
  user_id: string;
  status: RunStatus;
  current_stage: Stage | null;
  stages: StageState[]; // always the 4 stages, in order
  error: string | null;
  created_at: string;
  updated_at: string;
}

/* ---------------------------- Dashboard ---------------------------- */

export interface TrendPoint {
  month: string; // "2025-04"
  expenses: number;
  debt: number;
  investments: number;
}

export interface Snapshot {
  period_start: string | null;
  period_end: string | null;
  months: number;

  monthly_income: number;
  monthly_expenses: number;
  essential_expenses: number;
  discretionary_expenses: number;
  monthly_debt_payments: number;
  monthly_investments: number;
  net_cash_flow: number;

  subscription_count: number;
  subscriptions_monthly: number;

  savings_rate: number; // fraction
  debt_to_income: number; // fraction
  total_assets: number;
  total_liabilities: number;
  emergency_runway_months: number | null;

  health_score: number; // 0-100
  savings_score: number; // 0-100
  debt_score: number; // 0-100
  runway_score: number; // 0-100

  expense_breakdown: Record<string, number>; // category -> monthly ₹
  monthly_trend: TrendPoint[];

  // DB fields also present
  id?: string;
  run_id?: string;
  user_id?: string;
  created_at?: string;
}

export interface Recommendation {
  title: string;
  category: RecommendationCategory;
  priority: Priority;
  rationale: string;
  action: string;
}

export interface FinancialFact {
  id: string;
  run_id: string;
  user_id: string;
  document_id: string | null;
  kind: FactKind;
  subtype: string;
  label: string | null;
  amount: number;
  currency: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SubscriptionItem {
  merchant: string;
  amount: number;
  category: string;
}

/**
 * Reserved for the future persona feature. `persona` is `null` today; the
 * contract won't change when it ships. This is an optimistic shape so the
 * dashboard can render it with a single non-null check.
 */
export interface Persona {
  title: string;
  description: string;
  traits: string[];
}

export interface DashboardResponse {
  user: User;
  run_id: string;
  run_status: RunStatus;
  generated_at: string;

  metrics: Snapshot;

  recommendations_summary: string;
  recommendations: Recommendation[];

  assets: FinancialFact[];
  liabilities: FinancialFact[];
  subscriptions: SubscriptionItem[];

  persona: Persona | null;
}

/* ------------------------- Request payloads ------------------------- */

export interface OnboardingRequest {
  name: string;
  age: number;
  monthly_income: number | null;
  dependents: number;
  existing_loans: Loan[];
  financial_goals: FinancialGoal[];
}

export interface CreateRunRequest {
  user_id: string;
}
