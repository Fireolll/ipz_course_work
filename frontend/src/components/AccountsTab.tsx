/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, FinanceAccount, Currency } from "../types";
import { Plus, CreditCard, Shield, Pocket, Ban, CheckCircle, RefreshCw, X, AlertOctagon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AccountsProps {
  user: User;
  accounts: FinanceAccount[];
  onAddAccount: (name: string, balance: number, currency: Currency) => void;
  onUpdateStatus: (faId: number, isActive: boolean) => void;
  onUpdateBalance: (faId: number, newBalance: number) => void;
}

export default function AccountsTab({ 
  user, 
  accounts, 
  onAddAccount, 
  onUpdateStatus, 
  onUpdateBalance 
}: AccountsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState<Currency>(Currency.UAH);
  
  const [tuningAccountId, setTuningAccountId] = useState<number | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAddAccount(
      name,
      balance ? Number(balance) : 0,
      currency
    );

    setName("");
    setBalance("");
    setCurrency(Currency.UAH);
    setShowAddModal(false);
  };

  const startBalanceTuning = (acc: FinanceAccount) => {
    setTuningAccountId(acc.fa_id);
    setAdjustmentValue(acc.balance.toString());
  };

  const saveBalanceTuning = (faId: number) => {
    if (adjustmentValue === "" || isNaN(Number(adjustmentValue))) return;
    onUpdateBalance(faId, Number(adjustmentValue));
    setTuningAccountId(null);
  };

  // Pre-configured custom backgrounds for visual card decoration
  const getCardBackground = (currency: Currency, idx: number) => {
    const gradients = [
      "from-slate-900 via-purple-950 to-indigo-950", // Slate-Purple Card
      "from-emerald-800 to-teal-950",               // Emerald Card
      "from-amber-600 to-amber-900",               // Amber Card
      "from-blue-700 to-slate-900",                // Blue Card
    ];
    return gradients[idx % gradients.length];
  };

  const formatCurrency = (val: number, curr: Currency) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: curr,
    }).format(val);
  };

  return (
    <div className="space-y-6" id="accounts_tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Фінансові Рахунки</h2>
          <p className="text-xs text-slate-500 mt-1">Керуйте власними ресурсами, віртуальними картками та готівкою</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-850 text-white font-medium rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Створити рахунок</span>
        </button>
      </div>

      {/* Grid of beautifully polished accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="bank_cards_rendering_grid">
        <AnimatePresence mode="popLayout">
          {accounts.map((acc, index) => {
            const isTuning = tuningAccountId === acc.fa_id;
            const cardBg = getCardBackground(acc.currency, index);
            
            return (
              <motion.div
                layout
                key={acc.fa_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-3xl overflow-hidden p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[220px] bg-gradient-to-br ${cardBg} text-white`}
              >
                {/* Micro glassmorphic reflection background inside card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                {/* Top Section */}
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">{acc.fa_name}</h3>
                    <span className="text-[10px] text-white/60 font-mono tracking-widest uppercase">
                      {acc.currency} ACCOUNT
                    </span>
                  </div>
                  
                  <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border flex items-center gap-1 bg-white/10 border-white/20">
                    {acc.is_active ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        <span className="text-emerald-300">Живий</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        <span className="text-red-300">Архів</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Balance display section */}
                <div className="relative z-10 my-4">
                  {isTuning ? (
                    <div className="flex items-center gap-2" id="adjustment_balance_form">
                      <input
                        type="number"
                        step="0.01"
                        value={adjustmentValue}
                        onChange={(e) => setAdjustmentValue(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-slate-900 text-sm font-mono border-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="0.00"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveBalanceTuning(acc.fa_id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setTuningAccountId(null)}
                        className="p-1 px-2 hover:bg-white/10 rounded-lg text-xs text-white"
                      >
                        Скасувати
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-white/50 tracking-wider font-semibold block uppercase">Поточний Баланс</span>
                      <div className="text-3xl font-extrabold font-mono tracking-tight mt-1">
                        {formatCurrency(acc.balance, acc.currency)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom interactive command controls */}
                <div className="relative z-10 pt-3 border-t border-white/10 flex justify-between items-center bg-white/5 -mx-6 -mb-6 px-6 py-3.5 backdrop-blur-xs">
                  <button
                    onClick={() => startBalanceTuning(acc)}
                    disabled={!acc.is_active}
                    className="text-xs text-white/80 hover:text-white font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Змінити баланс</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(acc.fa_id, !acc.is_active)}
                    className="text-xs text-white/80 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {acc.is_active ? (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Деактивувати</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                        <span className="text-emerald-300 font-semibold">Активувати</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Account Creation Modal dialog */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="add_account_modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full border border-slate-100 relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-1">Створити Новий Рахунок</h3>
              <p className="text-xs text-slate-500 mb-4">Налаштуйте параметри платіжного гаманця</p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Назва рахунку</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="Приклад: Приват Картка, Готівка USD"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Початковий баланс</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-sm text-slate-850 bg-slate-50 font-mono focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Валюта</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600 rounded-xl text-xs text-slate-700 bg-slate-50"
                  >
                    <option value={Currency.UAH}>UAH - Українська гривня</option>
                    <option value={Currency.USD}>USD - Долар США</option>
                    <option value={Currency.EUR}>EUR - Євро</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  Підтвердити створення
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
