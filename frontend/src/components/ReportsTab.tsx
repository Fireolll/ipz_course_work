/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, FinanceAccount, Category, Transaction, Currency, TypeOfCashFlow } from "../types";
import { convertToCurrency, EXCHANGE_RATES } from "../storage";
import { categoryColors, defaultColors } from "../initialData";
import { TrendingUp, TrendingDown, FileText, ArrowUpRight, Flame, PieChart, Sliders, Check, Shuffle } from "lucide-react";
import { motion } from "motion/react";

interface ReportsProps {
  user: User;
  accounts: FinanceAccount[];
  categories: Category[];
  transactions: Transaction[];
}

export default function ReportsTab({ user, accounts, categories, transactions }: ReportsProps) {
  const [filterPeriod, setFilterPeriod] = useState<"all" | "30days" | "7days">("all");

  const filterByPeriod = (txDate: string) => {
    if (filterPeriod === "all") return true;
    const txTime = new Date(txDate).getTime();
    const nowTime = new Date("2026-05-21T17:35:16Z").getTime(); // Use current local time from metadata
    const diffDays = (nowTime - txTime) / (1000 * 60 * 60 * 24);
    
    if (filterPeriod === "30days") return diffDays <= 30;
    if (filterPeriod === "7days") return diffDays <= 7;
    return true;
  };

  // Re-calculate stats on-the-fly depending on period filter
  let totalIncome = 0;
  let totalExpense = 0;
  
  const expenseBreakdownMap: Record<number, { name: string; value: number }> = {};

  transactions.forEach(tx => {
    if (!filterByPeriod(tx.transaction_date)) return;

    const acc = accounts.find(a => a.fa_id === tx.fa_id);
    if (!acc) return;
    
    const cat = categories.find(c => c.category_id === tx.category_id);
    if (!cat) return;

    // Normalize amount into user's home currency
    const amountInHome = convertToCurrency(tx.amount, acc.currency, user.currency);

    if (cat.type_of_cash_flow === TypeOfCashFlow.INCOME) {
      totalIncome += amountInHome;
    } else {
      totalExpense += amountInHome;
      if (expenseBreakdownMap[tx.category_id]) {
        expenseBreakdownMap[tx.category_id].value += amountInHome;
      } else {
        expenseBreakdownMap[tx.category_id] = {
          name: cat.category_name,
          value: amountInHome,
        };
      }
    }
  });

  const netBalance = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // Render lists of top categories
  const categoryStats = Object.keys(expenseBreakdownMap).map(key => {
    const categoryId = Number(key);
    const item = expenseBreakdownMap[categoryId];
    return {
      category_id: categoryId,
      category_name: item.name,
      total_amount: item.value,
      percentage: totalExpense > 0 ? (item.value / totalExpense) * 100 : 0,
    };
  }).sort((a, b) => b.total_amount - a.total_amount);

  const formatCurrency = (val: number, curr: Currency) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: curr,
    }).format(val);
  };

  // Automated intelligent hints depending on budget parameters
  const getAnalyticalAdvice = () => {
    if (totalExpense === 0 && totalIncome === 0) {
      return {
        title: "Немає фінансової активності за період",
        text: "Спробуйте додати перші доходи та витрати на головному екрані або у вкладці транзакцій.",
        level: "info",
      };
    }
    if (expenseRatio > 90) {
      return {
        title: "Увага: Критичний рівень витрат!",
        text: `Ви витратили ${expenseRatio.toFixed(0)}% вашого сукупного доходу. Рекомендується обмежити розважальні категорії та переглянути підписки.`,
        level: "warning",
      };
    }
    if (expenseRatio > 70) {
      return {
        title: "Бюджет у стані легкого напруження",
        text: "Більше 70% доходів витрачено. Перегляньте категорії Кафе та Розваги для оптимізації касового рахунку.",
        level: "neutral",
      };
    }
    return {
      title: "Чудова фінансова стабільність!",
      text: `Ви заощадили ${(100 - expenseRatio).toFixed(0)}% своїх коштів. Візуалізуйте довгострокові інвестиційні цілі для покращення балансів.`,
      level: "success",
    };
  };

  const advice = getAnalyticalAdvice();

  return (
    <div className="space-y-6" id="reports_tab">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Фінансовий Аналіз</h2>
          <p className="text-xs text-[#64748B] mt-1">Зведені аналітичні дані та інтелектуальні поради щодо оптимізації бюджету</p>
        </div>

        {/* Dynamic Period selection tabs */}
        <div className="flex p-1 bg-white border border-[#E2E8F0] rounded-xl self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setFilterPeriod("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterPeriod === "all" ? "bg-[#0F172A] text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            За весь час
          </button>
          <button
            onClick={() => setFilterPeriod("30days")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterPeriod === "30days" ? "bg-[#0F172A] text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Останні 30 днів
          </button>
          <button
            onClick={() => setFilterPeriod("7days")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterPeriod === "7days" ? "bg-[#0F172A] text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            За тиждень
          </button>
        </div>
      </div>

      {/* Grid structure following Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Main Balance Report (Col: 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between" id="reports_aggregate_bento">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#1E293B] text-sm uppercase tracking-wider">Балансовий звіт</h3>
              <span className="text-[10px] font-bold text-slate-400">КОНВЕРТОВАНО У {user.currency}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-emerald-600 text-xs font-extrabold uppercase">
                  <span>Доходи</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold font-mono text-[#0F172A] mt-2">
                  +{formatCurrency(totalIncome, user.currency)}
                </p>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-rose-600 text-xs font-extrabold uppercase">
                  <span>Витрати</span>
                  <TrendingDown className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold font-mono text-[#0F172A] mt-2">
                  -{formatCurrency(totalExpense, user.currency)}
                </p>
              </div>
            </div>

            {/* Middle Section: Net Cashflow dynamic visual line scale */}
            <div className="space-y-2 mb-6" id="cashflow_balance_progress_tracker">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Співвідношення витрат та доходів</span>
                <span className="font-bold text-[#1E293B] font-mono">{expenseRatio.toFixed(0)}% витрачено</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                <motion.div 
                  className="bg-emerald-500 h-full"
                  style={{ width: `${Math.max(0, Math.min(100, 100 - expenseRatio))}%` }}
                  title="Заощаджено"
                />
                <motion.div 
                  className="bg-rose-500 h-full"
                  style={{ width: `${Math.max(0, Math.min(100, expenseRatio))}%` }}
                  title="Витрачено"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase font-mono pt-1">
                <span>Заощадження: {(100 - expenseRatio).toFixed(0)}%</span>
                <span>Витрати: {expenseRatio.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase">Чистий фінансовий потік</span>
            <span className={`text-base font-extrabold font-mono ${netBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {netBalance >= 0 ? "+" : ""}{formatCurrency(netBalance, user.currency)}
            </span>
          </div>
        </div>

        {/* Card 2: Interactive Smart advice panel (Bento 5 columns) */}
        <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]" id="reports_analytic_advise_bento">
          {/* Circular graphics for bento layout decoration */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#3B82F6]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#3B82F6]">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Рекомендації</span>
            </div>

            <motion.h4 
              key={advice.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold tracking-tight text-white mb-2"
            >
              {advice.title}
            </motion.h4>
            <motion.p 
              key={advice.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-slate-350 leading-relaxed font-sans"
            >
              {advice.text}
            </motion.p>
          </div>

          <div className="z-10 mt-6 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
            Автоматизовано на базі показників касового потоку групи ІО-44
          </div>
        </div>
      </div>

      {/* Detail breakdown per category in Bento layout columns */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm" id="reports_by_category_breakdown">
        <h3 className="font-bold text-sm text-[#1E293B] mb-5 uppercase tracking-wider">Структуризація витрат по категоріях</h3>

        {categoryStats.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
            <PieChart className="w-10 h-10 stroke-1 text-slate-350 mb-2" />
            <span>Категорії витрат не задіяні за вказаний період</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reports_category_styler_grid">
            {categoryStats.map((stat, idx) => {
              const color = categoryColors[stat.category_id] || defaultColors[idx % defaultColors.length];
              
              return (
                <div key={stat.category_id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                      <span className="text-sm font-bold text-slate-800">{stat.category_name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {formatCurrency(stat.total_amount, user.currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 font-mono w-10 text-right">
                      {stat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
