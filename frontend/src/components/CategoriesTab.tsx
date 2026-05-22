/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Category, TypeOfCashFlow } from "../types";
import { categoryColors, defaultColors } from "../initialData";
import { Plus, Tag, ArrowUpRight, ArrowDownRight, Folder, Layers, Trash, X, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CategoriesProps {
  user: User;
  categories: Category[];
  onAddCategory: (name: string, type: TypeOfCashFlow) => void;
  onDeleteCategory: (categoryId: number) => void;
}

export default function CategoriesTab({
  user,
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoriesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<TypeOfCashFlow>(TypeOfCashFlow.EXPENSE);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory(name.trim(), type);
    setName("");
    setShowAddModal(false);
  };

  const getCategoryColor = (cat: Category, index: number) => {
    return categoryColors[cat.category_id] || defaultColors[index % defaultColors.length];
  };

  return (
    <div className="space-y-6" id="categories_tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Бюджетні Категорії</h2>
          <p className="text-xs text-slate-500 mt-1">Організовуйте доходи та витрати за категоріями для точного аналізу</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-850 text-white font-medium rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Нова категорія</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="cats_layout_wrapper">
        {/* Expenses categories section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs" id="expenses_cats_block">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Категорії витрат</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories
              .filter(c => c.type_of_cash_flow === TypeOfCashFlow.EXPENSE)
              .map((cat, idx) => {
                const color = getCategoryColor(cat, idx);
                return (
                  <div
                    key={cat.category_id}
                    className="p-3 border border-slate-100 rounded-2xl flex flex-col justify-between hover:border-slate-200 transition-colors bg-slate-50/50 group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                      {!cat.is_default && (
                        <button
                          onClick={() => onDeleteCategory(cat.category_id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-600 text-slate-400 transition-opacity p-0.5 rounded cursor-pointer"
                          title="Видалити"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-850 mt-4 truncate">{cat.category_name}</div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">
                      {cat.is_default ? "Системна" : "Власна"}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Incomes categories section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs" id="incomes_cats_block">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Категорії доходів</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories
              .filter(c => c.type_of_cash_flow === TypeOfCashFlow.INCOME)
              .map((cat, idx) => {
                const color = getCategoryColor(cat, idx + 10);
                return (
                  <div
                    key={cat.category_id}
                    className="p-3 border border-slate-100 rounded-2xl flex flex-col justify-between hover:border-slate-200 transition-colors bg-slate-50/50 group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                      {!cat.is_default && (
                        <button
                          onClick={() => onDeleteCategory(cat.category_id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-600 text-slate-400 transition-opacity p-0.5 rounded cursor-pointer"
                          title="Видалити"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-850 mt-4 truncate">{cat.category_name}</div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">
                      {cat.is_default ? "Системна" : "Власна"}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Adding custom Category modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="add_category_modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full border border-slate-100 relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                id="close_category_modal_btn"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-1">Додати Бюджетну Категорію</h3>
              <p className="text-xs text-slate-500 mb-4 font-normal">Створюйте індивідуальні фінансові пласти для записів</p>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Flow type selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Тип грошового потоку</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType(TypeOfCashFlow.EXPENSE)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        type === TypeOfCashFlow.EXPENSE 
                          ? "bg-white text-rose-600 shadow-xs" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Для витрат
                    </button>
                    <button
                      type="button"
                      onClick={() => setType(TypeOfCashFlow.INCOME)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        type === TypeOfCashFlow.INCOME 
                          ? "bg-white text-emerald-600 shadow-xs" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Для доходів
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Назва категорії</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="Наприклад: Таксі, Підписки, Одяг"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-850 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  Зберегти нову категорію
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
