/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, FinanceAccount, Category, Transaction, Currency, TypeOfCashFlow } from "../types";
import { Plus, Trash, Search, ArrowDownWideNarrow, Calendar, Tag, Wallet, Filter, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { categoryColors, defaultColors } from "../initialData";
import { motion, AnimatePresence } from "motion/react";

interface TransactionsProps {
  user: User;
  accounts: FinanceAccount[];
  categories: Category[];
  transactions: Transaction[];
  onAddTransaction: (amount: number, faId: number, categoryId: number, description: string, date: string, type: TypeOfCashFlow) => void;
  onDeleteTransaction: (txId: number) => void;
}

export default function TransactionsTab({
  user,
  accounts,
  categories,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionsProps) {
  const activeAccounts = accounts.filter(a => a.is_active);
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [faId, setFaId] = useState<number>(activeAccounts[0]?.fa_id || 0);
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.category_id || 0);
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);

  // Filters state
  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (faId === 0 || categoryId === 0) return;

    // We pass date in local ISO style
    const isoDateStr = new Date(dateStr + "T12:00:00Z").toISOString();
    
    const selectedCategory = categories.find(c => c.category_id === Number(categoryId));
    const flowType = selectedCategory ? selectedCategory.type_of_cash_flow : TypeOfCashFlow.EXPENSE;

    onAddTransaction(
      Number(amount),
      Number(faId),
      Number(categoryId),
      description.trim() || "",
      isoDateStr,
      flowType
    );

    setAmount("");
    setDescription("");
    setShowAddModal(false);
  };

  // Filter transactions dynamically
  const filteredTxs = transactions.filter(tx => {
    const acc = accounts.find(a => a.fa_id === tx.fa_id);
    const cat = categories.find(c => c.category_id === tx.category_id);
    if (!acc || !cat) return false;

    // Search query matches
    const matchesSearch = 
      (tx.description || "").toLowerCase().includes(search.toLowerCase()) ||
      cat.category_name.toLowerCase().includes(search.toLowerCase());

    const matchesAccount = filterAccount === "all" || tx.fa_id === Number(filterAccount);
    const matchesCategory = filterCategory === "all" || tx.category_id === Number(filterCategory);
    const matchesType = filterType === "all" || cat.type_of_cash_flow === filterType;

    return matchesSearch && matchesAccount && matchesCategory && matchesType;
  });

  const formatCurrency = (val: number, curr: Currency) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: curr,
    }).format(val);
  };

  return (
    <div className="space-y-6" id="transactions_tab">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Книга Транзакцій</h2>
          <p className="text-xs text-[#64748B] mt-1">Детальна хронологія та фільтрація всіх доходів та амортизаційних витрат</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Нова транзакція</span>
        </button>
      </div>

      {/* Bento Grid: Filter Bar and Main Log View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Sidebar Filters (Bento 3 columns) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm space-y-4" id="transactions_filters_sidebar">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Фільтрація
            </span>
            {(search || filterAccount !== "all" || filterCategory !== "all" || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterAccount("all");
                  setFilterCategory("all");
                  setFilterType("all");
                }}
                className="text-[10px] text-[#3B82F6] hover:underline font-semibold"
              >
                Очистити
              </button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Опис чи назва</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Пошук..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] text-xs text-slate-700 bg-slate-50"
              />
            </div>
          </div>

          {/* Flow Type selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Тип платежу</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] text-xs text-slate-750 bg-slate-50"
            >
              <option value="all">Усі напрямки</option>
              <option value={TypeOfCashFlow.EXPENSE}>Витрати</option>
              <option value={TypeOfCashFlow.INCOME}>Доходи</option>
            </select>
          </div>

          {/* Account Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">За рахунком</label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] text-xs text-slate-750 bg-slate-50"
            >
              <option value="all">Усі рахунки</option>
              {accounts.map(acc => (
                <option key={acc.fa_id} value={acc.fa_id}>{acc.fa_name}</option>
              ))}
            </select>
          </div>

          {/* Category filter selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">За категорією</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] text-xs text-slate-755 bg-slate-50"
            >
              <option value="all">Усі категорії</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Columns: Main list with entries (Bento 9 columns) */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm" id="transactions_list_holder">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">
              Транзакційні записи ({filteredTxs.length})
            </h3>
            <span className="text-xs text-slate-400">Натисніть для видалення помилкової операції</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1 divide-y divide-slate-100" id="transactions_scroller_list">
            <AnimatePresence>
              {filteredTxs.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-sm">
                  <ArrowDownWideNarrow className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                  <span>Немає транзакцій, що задовольняють фільтри</span>
                </div>
              ) : (
                filteredTxs.map((tx, idx) => {
                  const acc = accounts.find(a => a.fa_id === tx.fa_id);
                  const cat = categories.find(c => c.category_id === tx.category_id);
                  if (!acc || !cat) return null;

                  const isExpense = cat.type_of_cash_flow === TypeOfCashFlow.EXPENSE;
                  const date = new Date(tx.transaction_date).toLocaleDateString("uk-UA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });

                  return (
                    <motion.div
                      layout
                      key={tx.transaction_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="py-3 flex items-center justify-between group hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isExpense ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <span>{cat.category_name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-normal text-slate-500">
                              {acc.fa_name}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-medium">
                            {tx.description || "Без коментаря"} • <span className="font-mono">{date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`text-sm font-bold font-mono text-right ${
                          isExpense ? "text-slate-800" : "text-emerald-600"
                        }`}>
                          {isExpense ? "-" : "+"}{formatCurrency(tx.amount, acc.currency)}
                        </div>

                        <button 
                          onClick={() => onDeleteTransaction(tx.transaction_id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Видалити запис"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Transaction Modal dialog */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="add_transaction_modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full border border-slate-100 relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-1">Створити Транзакцію</h3>
              <p className="text-xs text-slate-500 mb-4">Додати новий запис до фінансової книги</p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Сума</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-sm text-slate-800 font-mono bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Рахунок</label>
                    <select
                      value={faId}
                      onChange={(e) => setFaId(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-700 bg-slate-50"
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
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-700 bg-slate-50"
                    >
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name} ({cat.type_of_cash_flow === "income" ? "дохід" : "витрата"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Коментар</label>
                  <input
                    type="text"
                    placeholder="наприклад, купівля ноутбука"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Дата операції</label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-800 bg-slate-50 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-850 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  Підтвердити операцію
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
