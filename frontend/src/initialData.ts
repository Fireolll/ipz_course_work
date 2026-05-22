/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, FinanceAccount, Transaction, Currency, TypeOfCashFlow } from "./types";

export const defaultCategories: Category[] = [
  // Default Income Categories
  {
    category_id: 1,
    user_id: null,
    category_name: "Зарплата",
    type_of_cash_flow: TypeOfCashFlow.INCOME,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 2,
    user_id: null,
    category_name: "Фріланс",
    type_of_cash_flow: TypeOfCashFlow.INCOME,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 3,
    user_id: null,
    category_name: "Кешбек",
    type_of_cash_flow: TypeOfCashFlow.INCOME,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 4,
    user_id: null,
    category_name: "Інвестиції",
    type_of_cash_flow: TypeOfCashFlow.INCOME,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  
  // Default Expense Categories
  {
    category_id: 5,
    user_id: null,
    category_name: "Продукти",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 6,
    user_id: null,
    category_name: "Кафе та ресторани",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 7,
    user_id: null,
    category_name: "Оренда та комунальні",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 8,
    user_id: null,
    category_name: "Транспорт",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 9,
    user_id: null,
    category_name: "Розваги",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 10,
    user_id: null,
    category_name: "Здоров'я та спорт",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 11,
    user_id: null,
    category_name: "Шопінг",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    category_id: 12,
    user_id: null,
    category_name: "Техніка",
    type_of_cash_flow: TypeOfCashFlow.EXPENSE,
    is_default: true,
    created_at: "2026-01-01T00:00:00Z",
  }
];

// NOTE: defaultAccounts are no longer hardcoded with user_id: 1
// Users now fetch their own accounts from the backend after login
export const defaultAccounts: FinanceAccount[] = [];

// NOTE: defaultTransactions are no longer hardcoded with user_id: 1
// Users now fetch their own transactions from the backend after login
export const defaultTransactions: Transaction[] = [];

// Add colors for the default categories to make analytics look world-class
export const categoryColors: Record<number, string> = {
  1: "#10B981", // Salary - Emerald
  2: "#059669", // Freelance - Dark Green
  3: "#34D399", // Cashback - Green
  4: "#0284C7", // Investments - Blue
  5: "#F59E0B", // Products - Amber
  6: "#EF4444", // Restaurants - Red
  7: "#EC4899", // Rent - Pink
  8: "#3B82F6", // Transport - Blue
  9: "#8B5CF6", // Entertainment - Purple
  10: "#06B6D4", // Health/Sport - Cyan
  11: "#F43F5E", // Shopping - Rose
  12: "#64748B", // Tech - Slate
};

export const defaultColors = [
  "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F43F5E", "#14B8A6", "#6366F1",
  "#84CC16", "#EAB308", "#64748B"
];
