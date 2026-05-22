/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, FinanceAccount, Category, Transaction, Currency } from "./types";
import { defaultAccounts, defaultCategories, defaultTransactions } from "./initialData";

const STORAGE_KEYS = {
  USER: "ft_user",
  ACCOUNTS: "ft_accounts",
  CATEGORIES: "ft_categories",
  TRANSACTIONS: "ft_transactions",
};

export function initializeStorage() {
  const currentUser = getStoredUser();
  
  // Only initialize defaults if NO user is logged in (guest mode)
  if (!currentUser) {
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(defaultAccounts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTransactions));
    }
  }
  // If user IS logged in, they'll fetch their own data from backend instead
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
}

export function setStoredUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export function getStoredAccounts(): FinanceAccount[] {
  const accountsStr = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  return accountsStr ? JSON.parse(accountsStr) : defaultAccounts;
}

export function setStoredAccounts(accounts: FinanceAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export function getStoredCategories(): Category[] {
  const categoriesStr = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return categoriesStr ? JSON.parse(categoriesStr) : defaultCategories;
}

export function setStoredCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getStoredTransactions(): Transaction[] {
  const transactionsStr = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return transactionsStr ? JSON.parse(transactionsStr) : defaultTransactions;
}

export function setStoredTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Simple exchange rates for analytical normalization (main currency: UAH)
export const EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.UAH]: 1.0,
  [Currency.USD]: 41.2, // ~41.2 UAH on 2026
  [Currency.EUR]: 44.5, // ~44.5 UAH on 2026
};

export function convertToCurrency(amount: number | string, from: Currency, to: Currency): number {
  const numAmount = Number(amount);
  if (from === to) return numAmount;
  const uahAmount = numAmount * EXCHANGE_RATES[from];
  return uahAmount / EXCHANGE_RATES[to];
}

// Clear all user data on logout
export function clearAllUserData(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem("access_token");
}
