/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, FinanceAccount, Category, Transaction, Currency, TypeOfCashFlow } from "./types";
import { 
  initializeStorage, getStoredUser, setStoredUser, 
  getStoredAccounts, setStoredAccounts, 
  getStoredCategories, setStoredCategories, 
  getStoredTransactions, setStoredTransactions,
  clearAllUserData 
} from "./storage";
import { api } from "./api";

import AuthLayout from "./components/AuthLayout";
import DashboardTab from "./components/DashboardTab";
import AccountsTab from "./components/AccountsTab";
import TransactionsTab from "./components/TransactionsTab";
import CategoriesTab from "./components/CategoriesTab";
import AnalyticsTab from "./components/AnalyticsTab";
import AboutTab from "./components/AboutTab";

import { 
  LayoutDashboard, CreditCard, Receipt, Tag, BarChart3, 
  Info, LogOut, Wallet, Menu, X, UserCheck 
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Initialize data stores on load
  useEffect(() => {
    initializeStorage();
    const storedUser = getStoredUser();
    setUser(storedUser);
    
    if (storedUser) {
      // If user is logged in, sync with backend immediately
      fetchUserData(storedUser.user_id);
    } else {
      // Otherwise use local/default data
      setAccounts(getStoredAccounts());
      setCategories(getStoredCategories());
      setTransactions(getStoredTransactions());
    }
  }, []);

  // Sync state helpers to persistent Storage
  const updateAccountsState = (accList: FinanceAccount[]) => {
    setAccounts(accList);
    setStoredAccounts(accList);
  };

  const updateCategoriesState = (catList: Category[]) => {
    setCategories(catList);
    setStoredCategories(catList);
  };

  const updateTransactionsState = (txList: Transaction[]) => {
    setTransactions(txList);
    setStoredTransactions(txList);
  };

  // Auth logout helper
  const handleLogout = () => {
    clearAllUserData();
    setUser(null);
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
  };

  // Fetch user's real data from backend after login
  const fetchUserData = async (userId: number) => {
    try {
      const [accountsData, categoriesData, transactionsData] = await Promise.all([
        api.getAccounts(),
        api.getCategories(),
        api.getTransactions(),
      ]);
      
      setAccounts(accountsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
      
      // Persist to localStorage
      setStoredAccounts(accountsData);
      setStoredCategories(categoriesData);
      setStoredTransactions(transactionsData);
    } catch (error) {
      console.error("Failed to fetch user data from API, falling back to local storage:", error);
      // Fallback: use stored data from localStorage
      setAccounts(getStoredAccounts());
      setCategories(getStoredCategories());
      setTransactions(getStoredTransactions());
    }
  };

  // Interactions for Transactions
  const handleAddTransaction = async (
    amount: number, 
    faId: number, 
    categoryId: number, 
    desc: string, 
    date: string
  ) => {
    try {
      const newTxData = {
        fa_id: faId,
        category_id: categoryId,
        amount,
        description: desc,
        transaction_date: date
      };

      const savedTx = await api.createTransaction(newTxData);
      
      // Update local state with data from backend
      updateTransactionsState([savedTx, ...transactions]);

      // Refresh accounts as balance changed on backend
      const updatedAccounts = await api.getAccounts();
      updateAccountsState(updatedAccounts);
    } catch (error: any) {
      console.error("Failed to add transaction:", error);
      alert(`Не вдалося додати транзакцію: ${error.message}`);
    }
  };

  const handleDeleteTransaction = async (txId: number) => {
    try {
      await api.deleteTransaction(txId);
      
      // Filter out deleted transaction
      updateTransactionsState(transactions.filter(t => t.transaction_id !== txId));
      
      // Refresh accounts as balance was refunded on backend
      const updatedAccounts = await api.getAccounts();
      updateAccountsState(updatedAccounts);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Не вдалося видалити транзакцію");
    }
  };

  // Accounts interaction handlers
  const handleAddAccount = async (name: string, balance: number, currency: Currency) => {
    try {
      const newAccData = {
        fa_name: name,
        balance,
        currency,
        is_active: true
      };
      const savedAcc = await api.createAccount(newAccData);
      updateAccountsState([...accounts, savedAcc]);
    } catch (error: any) {
      console.error("Failed to add account:", error);
      alert(`Не вдалося створити рахунок: ${error.message}`);
    }
  };

  const handleUpdateAccountStatus = async (faId: number, isActive: boolean) => {
    try {
      const updatedAcc = await api.updateAccountStatus(faId, { is_active: isActive });
      updateAccountsState(accounts.map(acc => acc.fa_id === faId ? updatedAcc : acc));
    } catch (error: any) {
      console.error("Failed to update account status:", error);
      alert(`Не вдалося змінити статус рахунку: ${error.message}`);
    }
  };

  const handleUpdateAccountBalance = async (faId: number, newBalance: number) => {
    try {
      const updatedAcc = await api.updateAccountBalance(faId, { balance: newBalance });
      updateAccountsState(accounts.map(acc => acc.fa_id === faId ? updatedAcc : acc));
    } catch (error: any) {
      console.error("Failed to update account balance:", error);
      alert(`Не вдалося оновити баланс: ${error.message}`);
    }
  };

  // Categories interaction handlers
  const handleAddCategory = async (name: string, type: TypeOfCashFlow) => {
    try {
      const newCatData = {
        category_name: name,
        type_of_cash_flow: type,
        is_default: false
      };
      const savedCat = await api.createCategory(newCatData);
      updateCategoriesState([...categories, savedCat]);
    } catch (error: any) {
      console.error("Failed to add category:", error);
      alert(`Не вдалося створити категорію: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await api.deleteCategory(categoryId);
      updateCategoriesState(categories.filter(c => c.category_id !== categoryId));
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(`Не вдалося видалити категорію. Можливо, вона системна або використовується. Деталі: ${error.message}`);
    }
  };

  // Render correct content tab helper
  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            user={user}
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            onQuickAdd={(a, fid, cid, desc) => handleAddTransaction(a, fid, cid, desc, new Date().toISOString())}
            setActiveTab={setActiveTab}
          />
        );
      case "accounts":
        return (
          <AccountsTab
            user={user}
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onUpdateStatus={handleUpdateAccountStatus}
            onUpdateBalance={handleUpdateAccountBalance}
          />
        );
      case "transactions":
        return (
          <TransactionsTab
            user={user}
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case "categories":
        return (
          <CategoriesTab
            user={user}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case "analytics":
        return (
          <AnalyticsTab
            user={user}
            accounts={accounts}
            categories={categories}
            transactions={transactions}
          />
        );
      case "about":
        return <AboutTab />;
      default:
        return null;
    }
  };

  // Load Auth Screen if User isn't logged in
  if (!user) {
    return <AuthLayout onSuccess={(u) => {
      setUser(u);
      // Fetch real user data from backend instead of using defaults
      fetchUserData(u.user_id);
    }} />;
  }

  // Active Menu selector visual utility
  const getMenuItemClass = (tabId: string) => {
    const base = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ";
    if (activeTab === tabId) {
      return base + "bg-indigo-50 text-indigo-700 shadow-xs border-l-4 border-indigo-600";
    }
    return base + "text-slate-500 hover:bg-slate-50 hover:text-slate-800";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans" id="main_app_layout">
      {/* Mobile Header bar */}
      <header className="lg:hidden w-full h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base">F</div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">Financial Tracker</span>
        </div>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-6 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
        sidebarOpen ? "translate-x-0 pt-20 lg:pt-6" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-lg shadow-indigo-600/30">F</div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight block">Financial Tracker</span>
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest mt-0.5">KPI IO-44</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" id="sidebar_nav">
            <button onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }} className={getMenuItemClass("dashboard")}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Панель керування</span>
            </button>

            <button onClick={() => { setActiveTab("transactions"); setSidebarOpen(false); }} className={getMenuItemClass("transactions")}>
              <Receipt className="w-4 h-4" />
              <span>Джерела та Витрати</span>
            </button>

            <button onClick={() => { setActiveTab("accounts"); setSidebarOpen(false); }} className={getMenuItemClass("accounts")}>
              <CreditCard className="w-4 h-4" />
              <span>Платіжні Рахунки</span>
            </button>

            <button onClick={() => { setActiveTab("categories"); setSidebarOpen(false); }} className={getMenuItemClass("categories")}>
              <Tag className="w-4 h-4" />
              <span>Категорії бюджету</span>
            </button>

            <button onClick={() => { setActiveTab("analytics"); setSidebarOpen(false); }} className={getMenuItemClass("analytics")}>
              <BarChart3 className="w-4 h-4" />
              <span>Статистика та Звіти</span>
            </button>

            <button onClick={() => { setActiveTab("about"); setSidebarOpen(false); }} className={getMenuItemClass("about")}>
              <Info className="w-4 h-4" />
              <span>Про систему</span>
            </button>
          </nav>
        </div>

        {/* User Card in Sidebar bottom */}
        <div className="space-y-3.5 pt-4 border-t border-slate-150">
          <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-150/70">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
              {user.username.substring(0, 2)}
            </div>
            <div className="truncate">
              <span className="font-bold text-xs text-slate-800 block truncate">{user.username}</span>
              <span className="text-[9px] text-slate-450 block truncate font-mono">{user.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 rounded-xl text-xs text-rose-600 font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Вийти з кабінету</span>
          </button>
        </div>
      </aside>

      {/* Main viewport Container overlay for mobile backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-20 lg:hidden"
        />
      )}

      {/* Main Content frame */}
      <main className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {renderTabContent()}
      </main>
    </div>
  );
}
