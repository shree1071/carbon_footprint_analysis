import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Sun,
  Moon,
  Building2,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

const ROUTE_TITLES = {
  '/': 'Campus Carbon Footprint Calculator',
  '/calculator': 'Campus Carbon Footprint Calculator',
  '/telemetry': 'BMSIT Live Telemetry Dashboard',
  '/analytics': 'Multi-Scope Carbon Analytics',
  '/electricity': 'Electricity Billing Invoices',
  '/recommendations': 'Prescriptive Decarbonization Advisory',
  '/simulation': 'What-If Policy Simulator',
  '/reports': 'ESG Compliance & Audit Reports',
};

export const Topbar = ({ onOpenSidebar }) => {
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();

  const activeTitle = ROUTE_TITLES[location.pathname] || 'Carbon IQ Platform';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {activeTitle}
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-mono">
              <Building2 className="w-3 h-3" />
              BMSIT Campus
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
            Greenhouse Gas Accounting • ISO 14064 Standards • CEA India 0.82 Grid Baseline
          </p>
        </div>
      </div>

      {/* Right Actions: Standards Badge & Theme Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Engine Pill */}
        <div
          title="GHG Protocol Carbon Calculation Engine"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">Calculator Engine Active</span>
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-sky-600 transition-transform -rotate-12 hover:rotate-0 duration-300" />
          )}
        </button>
      </div>
    </header>
  );
};
