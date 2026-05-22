/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Currency {
  UAH = "UAH",
  USD = "USD",
  EUR = "EUR",
}

export enum TypeOfCashFlow {
  INCOME = "income",
  EXPENSE = "expense",
}

export enum FinancialPeriod {
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

export interface User {
  user_id: number;
  email: string;
  username: string;
  currency: Currency;
  created_at: string;
}

export interface FinanceAccount {
  fa_id: number;
  user_id: number;
  fa_name: string;
  balance: number;
  currency: Currency;
  is_active: boolean;
  fa_created_at: string;
}

export interface Category {
  category_id: number;
  user_id: number | null; // null if is_default is true
  category_name: string;
  type_of_cash_flow: TypeOfCashFlow;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  transaction_id: number;
  fa_id: number;
  category_id: number;
  amount: number;
  description?: string;
  transaction_date: string;
  tra_created_at: string;
}

export interface CategoryStat {
  category_name: string;
  total_amount: number;
  percentage: number;
  color?: string;
}

export interface BalanceReport {
  total_income: number;
  total_expense: number;
  net_balance: number;
  currency: Currency;
  expenses_by_category: CategoryStat[];
}
