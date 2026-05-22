/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, FolderGit2, Users, FileCode2, ServerCrash, CheckCircle2 } from "lucide-react";

export default function AboutTab() {
  return (
    <div className="space-y-6 max-w-4xl" id="about_tab">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Про Фінансову Систему</h2>
        <p className="text-xs text-slate-500 mt-1">Курсова робота студентів ІО-44 Пінчука Тараса Миколайовича та Радченко Антона Володимировича</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="about_bento_grid">
        {/* Core details of authors */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between" id="about_devs_card">
          <div>
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <Users className="w-5 h-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">Розробники ІО-44</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Цей веб-застосунок є фронтенд-оболонкою для системи керування особистими фінансами, розробленої в рамках курсової роботи з інженерії програмного забезпечення.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-800">Пінчук Тарас Миколайович</p>
                <p className="text-[10px] text-slate-400 font-mono">Група ІО-44 • КПІ ім. Ігоря Сікорського</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-800">Радченко Антон Володимирович</p>
                <p className="text-[10px] text-slate-400 font-mono">Група ІО-44 • КПІ ім. Ігоря Сікорського</p>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-50">
            Кафедра Обчислювальної Техніки (ОТ)
          </div>
        </div>

        {/* Technical stack of backend integration */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="about_tech_card">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">Архітектура Бекенду</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Бекенд-сервер реалізований на мові програмування Python з використанням сучасного фреймворку FastAPI та бази даних PostgreSQL.
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SQLAlchemy + Alembic для міграцій</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OAuth2 / JWT для безпечного логіну</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pydantic схеми для валідації</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Кастомні з звітами на Fast-API</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-[9px] font-mono mt-4 text-slate-400">
            GitHub Repo: Fireolll/ipz_course_work
          </div>
        </div>
      </div>
    </div>
  );
}
