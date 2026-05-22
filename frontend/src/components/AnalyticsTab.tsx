/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, FinanceAccount, Category, Transaction, Currency, TypeOfCashFlow } from "../types";
import { convertToCurrency } from "../storage";
import { categoryColors, defaultColors } from "../initialData";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Award, Scale, Percent } from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsProps {
  user: User;
  accounts: FinanceAccount[];
  categories: Category[];
  transactions: Transaction[];
}

export default function AnalyticsTab({ user, accounts, categories, transactions }: AnalyticsProps) {
  // Calculate total incomes and expenses in user's home currency
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    const acc = accounts.find(a => a.fa_id === tx.fa_id);
    if (!acc) return;
    const cat = categories.find(c => c.category_id === tx.category_id);
    if (!cat) return;

    const amountInHome = convertToCurrency(tx.amount, acc.currency, user.currency);
    if (cat.type_of_cash_flow === TypeOfCashFlow.INCOME) {
      totalIncome += amountInHome;
    } else {
      totalExpense += amountInHome;
    }
  });

  const netBalance = totalIncome - totalExpense;
  const isProfit = netBalance >= 0;

  // Expenses categories percentage calculation
  const expenseMap: Record<number, { name: string; sum: number }> = {};
  let absoluteExpenses = 0;

  transactions.forEach(tx => {
    const cat = categories.find(c => c.category_id === tx.category_id);
    if (!cat || cat.type_of_cash_flow !== TypeOfCashFlow.EXPENSE) return;
    const acc = accounts.find(a => a.fa_id === tx.fa_id);
    if (!acc) return;

    const amountInHome = convertToCurrency(tx.amount, acc.currency, user.currency);
    absoluteExpenses += amountInHome;

    if (expenseMap[tx.category_id]) {
      expenseMap[tx.category_id].sum += amountInHome;
    } else {
      expenseMap[tx.category_id] = {
        name: cat.category_name,
        sum: amountInHome,
      };
    }
  });

  const expenseStats = Object.keys(expenseMap).map(key => {
    const catId = Number(key);
    const item = expenseMap[catId];
    return {
      category_id: catId,
      category_name: item.name,
      total_amount: item.sum,
      percentage: absoluteExpenses > 0 ? (item.sum / absoluteExpenses) * 100 : 0,
    };
  }).sort((a, b) => b.total_amount - a.total_amount);

  // Income categories breakdown
  const incomeMap: Record<number, { name: string; sum: number }> = {};
  let absoluteIncomes = 0;

  transactions.forEach(tx => {
    const cat = categories.find(c => c.category_id === tx.category_id);
    if (!cat || cat.type_of_cash_flow !== TypeOfCashFlow.INCOME) return;
    const acc = accounts.find(a => a.fa_id === tx.fa_id);
    if (!acc) return;

    const amountInHome = convertToCurrency(tx.amount, acc.currency, user.currency);
    absoluteIncomes += amountInHome;

    if (incomeMap[tx.category_id]) {
      incomeMap[tx.category_id].sum += amountInHome;
    } else {
      incomeMap[tx.category_id] = {
        name: cat.category_name,
        sum: amountInHome,
      };
    }
  });

  const incomeStats = Object.keys(incomeMap).map(key => {
    const catId = Number(key);
    const item = incomeMap[catId];
    return {
      category_id: catId,
      category_name: item.name,
      total_amount: item.sum,
      percentage: absoluteIncomes > 0 ? (item.sum / absoluteIncomes) * 100 : 0,
    };
  }).sort((a, b) => b.total_amount - a.total_amount);

  const formatCurrency = (val: number, curr: Currency) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: curr,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="analytics_tab">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Аналітика та Фінансові Звіти</h2>
        <p className="text-xs text-slate-500 mt-1">Оцініть свій чистий прибуток чи збитки за весь час ведення обліку</p>
      </div>

      {/* Bento Layout Grid for Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="analytics_bento_grid">
        
        {/* Main large widget: Financial Balance & Profit/Loss statement (Col: 8) */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between" id="profit_loss_main_bento">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Підсумкове Сальдо</span>
              <h3 className="text-sm font-semibold text-slate-500 mt-0.5">Різниця між доходами та витратами</h3>
            </div>
            
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${
              isProfit ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              <Scale className="w-4 h-4" />
              <span>{isProfit ? "Прибутковий стан" : "Збитковий стан"}</span>
            </div>
          </div>

          <div className="py-2">
            <div className={`text-4xl md:text-5xl font-extrabold font-mono tracking-tight ${
              isProfit ? "text-emerald-600" : "text-red-600"
            }`}>
              {isProfit ? "+" : ""}{formatCurrency(netBalance, user.currency)}
            </div>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed max-w-md">
              {isProfit 
                ? "Чудова робота! Ваші доходи перевищують витрати. Ви успішно нарощуєте свій фінансовий резерв та капітал." 
                : "Ваші поточні витрати перевищили обсяги доходів. Рекомендуємо переосмислити ліміти на шопінг чи розваги."}
            </p>
          </div>

          {/* Graphical Progress Bar flow */}
          <div className="mt-8 pt-6 border-t border-slate-100/80">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-4 h-4" /> Дохід ({totalIncome > 0 ? "100" : "0"}%)
              </span>
              <span className="flex items-center gap-1 text-red-500">
                Витрати ({totalIncome > 0 ? ((totalExpense / (totalIncome || 1)) * 100).toFixed(0) : "0"}%) <TrendingDown className="w-4 h-4" />
              </span>
            </div>
            
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              {totalIncome > 0 ? (
                <>
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (1 - (totalExpense / totalIncome)) * 100)}%` }}
                    title="Чистий прибуток"
                  />
                  <div 
                    className="bg-red-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%` }}
                    title="Витрачено"
                  />
                </>
              ) : (
                <div className="w-full bg-slate-200 h-full" />
              )}
            </div>
          </div>
        </div>

        {/* Small bento widget: Metrics snapshot (Col: 4) */}
        <div className="md:col-span-4 bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="performance_highlights_bento">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Швидкий інсайт</span>
            </div>
            <h4 className="text-lg font-bold tracking-tight">Ефективність бюджету</h4>
          </div>

          <div className="my-6">
            <div className="text-3xl font-bold tracking-tight text-indigo-300 font-mono">
              {totalExpense > 0 && totalIncome > 0 
                ? `${((totalIncome - totalExpense) / totalIncome * 100).toFixed(0)}%` 
                : "0%"}
            </div>
            <span className="text-xs text-slate-400 block mt-1">Частка багатства, що вдалося зберегти</span>
          </div>

          <div className="space-y-3.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Чистий дохід:</span>
              <span className="font-semibold text-emerald-400 font-mono">+{formatCurrency(totalIncome, user.currency).split(",")[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>Чистий збиток:</span>
              <span className="font-semibold text-red-400 font-mono">-{formatCurrency(totalExpense, user.currency).split(",")[0]}</span>
            </div>
          </div>
        </div>

        {/* Breakdown category list for Expenses (Col: 6) */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" id="expenses_breakdown_block_tab">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Витрати за категоріями</h3>
          </div>

          {expenseStats.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              Недостатньо даних для розрахунку витрат
            </div>
          ) : (
            <div className="space-y-4">
              {expenseStats.map((stat, idx) => {
                const color = categoryColors[stat.category_id] || defaultColors[idx % defaultColors.length];
                return (
                  <div key={stat.category_id} className="text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-700 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 rounded-full h-2 block" style={{ backgroundColor: color }}></span>
                        <span>{stat.category_name}</span>
                      </div>
                      <div className="font-mono text-slate-900 font-bold">
                        {formatCurrency(stat.total_amount, user.currency).split(",")[0]} ({stat.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    {/* Progress tracking tube line */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full" 
                        style={{ backgroundColor: color }} 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Breakdown category list for Incomes (Col: 6) */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" id="incomes_breakdown_block_tab">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Джерела надходжень</h3>
          </div>

          {incomeStats.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              Недостатньо даних для розрахунку доходів
            </div>
          ) : (
            <div className="space-y-4">
              {incomeStats.map((stat, idx) => {
                const color = categoryColors[stat.category_id] || defaultColors[(idx + 6) % defaultColors.length];
                return (
                  <div key={stat.category_id} className="text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-700 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 rounded-full h-2 block" style={{ backgroundColor: color }}></span>
                        <span>{stat.category_name}</span>
                      </div>
                      <div className="font-mono text-slate-900 font-bold">
                        {formatCurrency(stat.total_amount, user.currency).split(",")[0]} ({stat.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full" 
                        style={{ backgroundColor: color }} 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
