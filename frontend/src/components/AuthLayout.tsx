/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Currency } from "../types";
import { setStoredUser } from "../storage";
import { Mail, Lock, User as UserIcon, Wallet, ArrowUpRight, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../api";

interface AuthProps {
  onSuccess: (user: User) => void;
}

export default function AuthLayout({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [currency, setCurrency] = useState<Currency>(Currency.UAH);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Будь ласка, заповніть всі обов'язкові поля.");
      }
      if (!isLogin && !username) {
        throw new Error("Будь ласка, введіть ім'я користувача.");
      }

      let user: User;

      if (isLogin) {
        // LOGIN: authenticate with backend
        const tokenResponse = await api.login({ email, password });
        // Store token for future requests
        localStorage.setItem("access_token", tokenResponse.access_token);
        
        // Fetch user data after getting token
        const userResponse = await api.getMe();
        user = {
          user_id: userResponse.user_id,
          email: userResponse.email,
          username: userResponse.user_nickname,
          currency: userResponse.currency,
          created_at: userResponse.created_at,
        };
      } else {
        // REGISTER: create new user on backend
        const registerData = {
          email,
          password,
          user_nickname: username,
          currency,
          financial_period: "month",
        };
        const userResponse = await api.register(registerData);
        
        // After registration, login to get token
        const tokenResponse = await api.login({ email, password });
        localStorage.setItem("access_token", tokenResponse.access_token);
        
        user = {
          user_id: userResponse.user_id,
          email: userResponse.email,
          username: userResponse.user_nickname,
          currency: userResponse.currency,
          created_at: userResponse.created_at,
        };
      }

      setStoredUser(user);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || "Сталася помилка при авторизації.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans" id="auth_container">
      {/* Visual Left Banner */}
      <div className="flex-1 bg-emerald-700 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden" id="auth_info_banner">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600 rounded-full blur-[80px] opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-600 rounded-full blur-[60px] opacity-40 -ml-20 -mb-20"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Financial Tracker</span>
        </div>

        <div className="relative z-10 my-auto py-12 lg:py-0 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-600/50 backdrop-blur-sm border border-emerald-500/30 text-emerald-100 uppercase tracking-widest">
              Курсовий Проєкт
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mt-4 leading-tight">
              Розумне керування вашим капіталом
            </h1>
            <p className="text-emerald-100/80 mt-4 text-base leading-relaxed">
              Аналізуйте доходи, оптимізуйте щоденні витрати, керуйте мультивалютними рахунками у зручному та безпечному фінансовому дашборді.
            </p>
          </motion.div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-emerald-100/90">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Аналітика витрат по категоріях у реальному часі</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100/90">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Керування банківськими картками та готівкою</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100/90">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>Конвертація валют та побудова діаграм звітів</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/60 font-mono">
          Розроблено студентами групи ІО-44 Пінчуком Т. М. та Радченко А. В. • KPI 2026
        </div>
      </div>

      {/* Auth Entry Form */}
      <div className="w-full lg:w-[480px] p-8 lg:p-16 flex flex-col justify-center bg-white" id="auth_form_panel">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {isLogin ? "Вітаємо знову!" : "Створити акаунт"}
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              {isLogin 
                ? "Увійдіть зі своїми тестовими даними для доступу до системи фінансів." 
                : "Зареєструйте новий акаунт для ведення власного бюджету."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  key="username-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-xs font-semibold text-slate-600 block">Ім'я користувача</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Іван Іванов"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm bg-slate-50 focus:bg-white text-slate-800 transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Електронна пошта</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm bg-slate-50 focus:bg-white text-slate-800 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Пароль</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm bg-slate-50 focus:bg-white text-slate-800 transition-colors"
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  key="currency-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-xs font-semibold text-slate-600 block">Основна валюта</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm bg-slate-50 text-slate-800 transition-colors"
                  >
                    <option value={Currency.UAH}>Українська гривня (UAH)</option>
                    <option value={Currency.USD}>Долар США (USD)</option>
                    <option value={Currency.EUR}>Євро (EUR)</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="text-xs font-medium text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-sm transition-all focus:outline-none active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? "Увійти" : "Зареєструватися"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 p-3 bg-indigo-50/10 border border-indigo-100/50 rounded-xl text-xs text-indigo-700 flex flex-col gap-1.5 leading-relaxed">
              <span className="font-semibold block">💡 Тестовий доступ:</span>
              <p>Для швидкого входу ви можете автоматично заповнити форму:</p>
              <button
                type="button"
                onClick={() => {
                  setEmail("finance.io44@kpi.ua");
                  setPassword("admin123");
                }}
                className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer border border-indigo-200/50"
              >
                Заповнити тестовими даними
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setEmail("");
                setPassword("");
                setUsername("");
                setCurrency(Currency.UAH);
              }}
              className="text-xs text-slate-500 hover:text-emerald-700 font-medium transition-colors"
            >
              {isLogin ? "Немає облікового запису? Зареєструватися" : "Вже маєте акаунт? Увійти"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
