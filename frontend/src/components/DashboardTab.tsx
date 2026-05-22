/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, FinanceAccount, Category, Transaction, Currency, TypeOfCashFlow } from "../types";
import { convertToCurrency, EXCHANGE_RATES } from "../storage";
import { categoryColors, defaultColors } from "../initialData";
import { 
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, 
  PlusCircle, ShoppingBag, Plus, Info, LayoutDashboard, Utensils, 
  HelpCircle, CheckCircle2 
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  user: User;
  accounts: FinanceAccount[];
  categories: Category[];
  transactions: Transaction[];
  onQuickAdd: (amount: number, faId: number, categoryId: number, desc: string, type: TypeOfCashFlow) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardTab({ 
  user, 
  accounts, 
  categories, 
  transactions,
  onQuickAdd,
  setActiveTab 
}: DashboardProps) {
  const activeAccounts = accounts.filter(a => a.is_active);
  const [quickAmount, setQuickAmount] = useState("");
  const [quickAccount, setQuickAccount] = useState(activeAccounts[0]?.fa_id || 0);
  const [quickType, setQuickType] = useState<TypeOfCashFlow>(TypeOfCashFlow.EXPENSE);
  const [quickCategory, setQuickCategory] = useState<number>(0);
  const [quickDesc, setQuickDesc] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter default quick category list depending on type Selection
  const activeCategories = categories.filter(c => c.type_of_cash_flow === quickType);
  
  // Auto-set category when type changes or first loads
  const handleTypeChange = (type: TypeOfCashFlow) => {
    setQuickType(type);
    const matched = categories.find(c => c.type_of_cash_flow === type);
    if (matched) setQuickCategory(matched.category_id);
  };

  // If first category hasn't been set, sync it
  if (quickCategory === 0 && activeCategories.length > 0) {
    setQuickCategory(activeCategories[0].category_id);
  }

  // Calculate high-level metrics
  let totalBalanceMockUserCurrency = 0;
  accounts.forEach(acc => {
    totalBalanceMockUserCurrency += convertToCurrency(acc.balance, acc.currency, user.currency);
  });

  // Calculate sum of incomes and expenses in user's home currency
  let periodicIncome = 0;
  let periodicExpense = 0;

  transactions.forEach(tx => {
    const acc = accounts.find(a => a.fa_id === tx.fa_id);
    if (!acc) return;
    
    const cat = categories.find(c => c.category_id === tx.category_id);
    if (!cat) return;

    const amountInHome = convertToCurrency(tx.amount, acc.currency, user.currency);
    if (cat.type_of_cash_flow === TypeOfCashFlow.INCOME) {
      periodicIncome += amountInHome;
    } else {
      periodicExpense += amountInHome;
    }
  });

  // Dynamic distribution of expenses by category for top categories SVG representation
  const expenseBreakdownMap: Record<number, { name: string; value: number }> = {};
  let totalExpenseForBreakdown = 0;

  transactions.forEach(tx => {
    const cat = categories.find(c => c.category_id === tx.category_id);
    if (!cat || cat.type_of_cash_flow !== TypeOfCashFlow.EXPENSE) return;
    
    const acc = accounts.find(a => a.fa_id === tx.fa_id);
    if (!acc) return;

    const amountInHome = convertToCurrency(tx.amount, acc.currency, user.currency);
    totalExpenseForBreakdown += amountInHome;
    
    if (expenseBreakdownMap[tx.category_id]) {
      expenseBreakdownMap[tx.category_id].value += amountInHome;
    } else {
      expenseBreakdownMap[tx.category_id] = {
        name: cat.category_name,
        value: amountInHome,
      };
    }
  });

  const categoryStats = Object.keys(expenseBreakdownMap).map(key => {
    const categoryId = Number(key);
    const item = expenseBreakdownMap[categoryId];
    return {
      category_id: categoryId,
      category_name: item.name,
      total_amount: item.value,
      percentage: totalExpenseForBreakdown > 0 ? (item.value / totalExpenseForBreakdown) * 100 : 0,
    };
  }).sort((a, b) => b.total_amount - a.total_amount);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmount || isNaN(Number(quickAmount)) || Number(quickAmount) <= 0) return;
    if (quickAccount === 0 || quickCategory === 0) return;

    onQuickAdd(
      Number(quickAmount),
      Number(quickAccount),
      Number(quickCategory),
      quickDesc || (quickType === TypeOfCashFlow.INCOME ? "Швидкий дохід" : "Швидка витрата"),
      quickType
    );

    setQuickAmount("");
    setQuickDesc("");
    setSuccessMsg("Транзакцію успішно зареєстровано!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Helper inside chart representations
  const formatCurrency = (val: number, curr: Currency) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6" id="dashboard_tab">
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Main aggregate Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px] border border-slate-800" id="aggregates_net_balance_card">
          <div>
            <div className="flex items-center justify-between text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <span>Загальний Капітал</span>
              <Wallet className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold tracking-tight mt-2.5">
              {formatCurrency(totalBalanceMockUserCurrency, user.currency)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-100/75">
            <span className="font-mono">
              UAH: {formatCurrency(convertToCurrency(totalBalanceMockUserCurrency, user.currency, Currency.UAH), Currency.UAH)}
            </span>
            <span className="font-mono">
              USD: ${convertToCurrency(totalBalanceMockUserCurrency, user.currency, Currency.USD).toFixed(0)}
            </span>
            <span className="font-mono">
              EUR: €{convertToCurrency(totalBalanceMockUserCurrency, user.currency, Currency.EUR).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Card 2: Income counters */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between min-h-[160px]" id="aggregates_income_card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Надходження (Всього)</span>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 mt-2 font-mono">
                +{formatCurrency(periodicIncome, user.currency)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Сума всіх доданих джерел доходу</span>
          </div>
        </div>

        {/* Card 3: Expense counters */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between min-h-[160px]" id="aggregates_expenses_card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-sans">Витрати (Всього)</span>
              <div className="text-2xl font-bold tracking-tight text-red-600 mt-2 font-mono">
                -{formatCurrency(periodicExpense, user.currency)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 bg-red-50/50 p-2 rounded-lg border border-red-100/50 flex items-center gap-1.5">
            <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
            <span>Категоризовані оперативні витрати</span>
          </div>
        </div>
      </div>

      {/* Analytics and Quick Add Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Custom Visual SVG Pie/Sector Chart & Distribution (Columns: 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between" id="dashboard_visual_budget_chart">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Категорії Витрат</h3>
              <span className="text-xs text-slate-400">Топ за обсягом</span>
            </div>

            {categoryStats.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
                <ShoppingBag className="w-10 h-10 stroke-1 text-slate-300 mb-2" />
                <span>Транзакцій витрат ще не зареєстровано</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center py-4">
                {/* SVG Visual Circle representing Pie Ring */}
                <div className="flex justify-center items-center relative" id="donut_graphics_container">
                  <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="20"
                    />
                    {/* SVG Segment generation */}
                    {(() => {
                      let accumulatedPercent = 0;
                      return categoryStats.slice(0, 5).map((stat, idx) => {
                        const radius = 70;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDasharray = `${(stat.percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                        accumulatedPercent += stat.percentage;
                        const color = categoryColors[stat.category_id] || defaultColors[idx % defaultColors.length];
                        
                        return (
                          <circle
                            key={stat.category_id}
                            cx="90"
                            cy="90"
                            r={radius}
                            fill="transparent"
                            stroke={color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500 ease-in-out hover:stroke-[25px] cursor-pointer"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute text-center bg-white rounded-full p-2" id="canvas_inside_details">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest scale-90">Всього</div>
                    <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                      {formatCurrency(totalExpenseForBreakdown, user.currency).split(",")[0]}
                    </div>
                  </div>
                </div>

                {/* List detailing the Top Categories percents */}
                <div className="space-y-3" id="charts_percentages_lines">
                  {categoryStats.slice(0, 4).map((stat, idx) => {
                    const color = categoryColors[stat.category_id] || defaultColors[idx % defaultColors.length];
                    return (
                      <div key={stat.category_id} className="text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                            <span>{stat.category_name}</span>
                          </div>
                          <span className="font-bold text-slate-900 font-mono">{stat.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full rounded-full" 
                            style={{ backgroundColor: color }} 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab("reports")} 
            className="w-full text-center text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition-colors pt-3 border-t border-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Повний фінансовий звіт</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Transaction Entry widget (Columns: 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between" id="dashboard_quick_add_panel">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Миттєвий запис</h3>
              <Info className="w-4 h-4 text-slate-400" />
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl" id="flow_selection_toggle_group">
                <button
                  type="button"
                  onClick={() => handleTypeChange(TypeOfCashFlow.EXPENSE)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    quickType === TypeOfCashFlow.EXPENSE 
                      ? "bg-white text-rose-600 shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Витрата
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange(TypeOfCashFlow.INCOME)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    quickType === TypeOfCashFlow.INCOME 
                      ? "bg-white text-emerald-600 shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Дохід
                </button>
              </div>

              {/* Quick Input amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Сума ({user.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm text-slate-800 font-mono bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Quick Dropdown selectors */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Рахунок</label>
                  <select
                    value={quickAccount}
                    onChange={(e) => setQuickAccount(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs text-slate-700 bg-slate-50"
                  >
                    {accounts.filter(a => a.is_active).map(acc => (
                      <option key={acc.fa_id} value={acc.fa_id}>
                        {acc.fa_name} ({acc.currency})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Категорія</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs text-slate-700 bg-slate-50"
                  >
                    {activeCategories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Короткий опис</label>
                <input
                  type="text"
                  placeholder="наприклад, обід"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs text-slate-800 bg-slate-50"
                />
              </div>

              {successMsg && (
                <div className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 rounded-full fill-white" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Зафіксувати операцію</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recent transactions and accounts overview list */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="dashboard_activities_segment">
        {/* Recent Transactions lists (Col: 7) */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between" id="dashboard_recent_transactions">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Останні операції</h3>
              <button 
                onClick={() => setActiveTab("transactions")} 
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Всі транзакції
              </button>
            </div>

            <div className="divide-y divide-slate-100" id="recent_transactions_scoller_cards">
              {transactions.slice(0, 4).map(tx => {
                const acc = accounts.find(a => a.fa_id === tx.fa_id);
                const cat = categories.find(c => c.category_id === tx.category_id);
                if (!cat) return null;

                const isExpense = cat.type_of_cash_flow === TypeOfCashFlow.EXPENSE;
                const date = new Date(tx.transaction_date).toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "short",
                });
                
                return (
                  <div key={tx.transaction_id} className="py-3 flex items-center justify-between group transition-colors hover:bg-slate-50/50 px-1 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isExpense ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {isExpense ? "-" : "+"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{cat.category_name}</div>
                        <div className="text-xs text-slate-400 font-medium">
                          {tx.description || "Без опису"} • <span className="text-indigo-600">{acc?.fa_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${
                        isExpense ? "text-slate-800" : "text-emerald-600"
                      }`}>
                        {isExpense ? "-" : "+"}{formatCurrency(tx.amount, acc?.currency || Currency.UAH)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Financial accounts snapshot list (Col: 5) */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between" id="dashboard_accounts_snapshot">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Стан рахунків</h3>
              <button 
                onClick={() => setActiveTab("accounts")} 
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Редагувати
              </button>
            </div>

            <div className="space-y-3" id="compact_accounts_dashboard_grid">
              {accounts.map(acc => (
                <div key={acc.fa_id} className="p-3 border border-slate-100/80 rounded-xl flex items-center justify-between hover:border-slate-200 transition-colors bg-slate-50/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{acc.fa_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {acc.is_active ? "Активний" : "Архівний"} • {acc.currency}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-800">
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
