import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Table as TableIcon,
  AlertTriangle,
  CheckCircle2,
  Users,
  Car,
  Hotel,
  Utensils,
  Compass,
  Coins,
} from 'lucide-react';
import { BudgetBreakdown, CurrencyCode, AppLanguage } from '../types/trip';
import { formatCurrency, convertFromINR, EXCHANGE_RATES } from '../utils/currency';
import { t } from '../utils/translations';

interface BudgetChartProps {
  budget: BudgetBreakdown;
  requestedBudgetINR?: number;
  travelers: number;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  language: AppLanguage;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({
  budget,
  requestedBudgetINR,
  travelers = 1,
  currency,
  onCurrencyChange,
  language,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [perPersonView, setPerPersonView] = useState(false);

  const multiplier = perPersonView ? 1 / Math.max(1, travelers) : 1;

  const categories = [
    {
      id: 'transport',
      label: language === 'hi' ? 'परिवहन (Transport)' : 'Transport & Cabs',
      amount: Math.round(budget.transport * multiplier),
      color: 'bg-teal-500',
      textColor: 'text-teal-600 dark:text-teal-400',
      borderColor: 'border-teal-500',
      icon: Car,
    },
    {
      id: 'stay',
      label: language === 'hi' ? 'ठहराव (Stay & Hotels)' : 'Stay & Accommodation',
      amount: Math.round(budget.stay * multiplier),
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500',
      icon: Hotel,
    },
    {
      id: 'food',
      label: language === 'hi' ? 'भोजन व कैफे (Food)' : 'Food, Dining & Cafes',
      amount: Math.round(budget.food * multiplier),
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500',
      icon: Utensils,
    },
    {
      id: 'activities',
      label: language === 'hi' ? 'गतिविधियां व शुल्क (Activities)' : 'Activities, Treks & Tickets',
      amount: Math.round(budget.activities * multiplier),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-500',
      icon: Compass,
    },
    {
      id: 'miscellaneous',
      label: language === 'hi' ? 'विविध व आपातकालीन (Misc)' : 'Misc, Permits & Buffer',
      amount: Math.round(budget.miscellaneous * multiplier),
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500',
      icon: Coins,
    },
  ];

  const totalDisplay = Math.round(budget.total * multiplier);
  const totalINR = budget.total;

  // Budget status evaluation:
  let budgetStatus: { type: 'under' | 'over' | 'matched'; text: string; detail: string } | null = null;
  if (requestedBudgetINR && requestedBudgetINR > 0) {
    const diff = totalINR - requestedBudgetINR;
    const pct = Math.round((diff / requestedBudgetINR) * 100);

    if (diff > 500) {
      budgetStatus = {
        type: 'over',
        text: t('overBudget', language),
        detail:
          language === 'hi'
            ? `यथार्थवादी योजना आपके प्रारंभिक बजट से ${formatCurrency(diff, currency)} (+${pct}%) अधिक है। विवरण नीचे दिया गया है।`
            : `Realistic cost exceeds initial budget by ${formatCurrency(diff, currency)} (+${pct}%). Adjusted to prevent misleading prices.`,
      };
    } else {
      budgetStatus = {
        type: 'under',
        text: t('withinBudget', language),
        detail:
          language === 'hi'
            ? `यह योजना आपके बजट के पूर्णतः अनुकूल है (${formatCurrency(Math.abs(diff), currency)} की बचत)।`
            : `This itinerary comfortably fits your target budget (${formatCurrency(Math.abs(diff), currency)} buffer remaining).`,
      };
    }
  }

  // Calculate percentages for bars/donut
  const categoriesWithPct = categories.map((c) => ({
    ...c,
    pct: totalINR > 0 ? Math.round(((c.amount / (totalDisplay || 1)) * 100)) : 0,
  }));

  return (
    <section
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-colors"
      aria-labelledby="budget-section-heading"
    >
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3
            id="budget-section-heading"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <span>{t('budgetTab', language)}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {perPersonView ? t('perPerson', language) : t('totalTrip', language)}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
            {language === 'hi'
              ? `${travelers} यात्री • पारदर्शी लागत विभाजन`
              : `${travelers} traveler${travelers > 1 ? 's' : ''} • Realistic category breakdown`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Per-Person vs Total Toggle */}
          {travelers > 1 && (
            <button
              type="button"
              onClick={() => setPerPersonView(!perPersonView)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[44px] transition-colors"
              aria-pressed={perPersonView}
            >
              <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span>{perPersonView ? t('totalTrip', language) : t('perPerson', language)}</span>
            </button>
          )}

          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[44px]"
            aria-label="Select currency for budget display"
          >
            {Object.keys(EXCHANGE_RATES).map((cur) => (
              <option key={cur} value={cur}>
                {cur} ({EXCHANGE_RATES[cur as CurrencyCode].symbol})
              </option>
            ))}
          </select>

          {/* Chart vs Table Accessible Toggle */}
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-800/60" role="group" aria-label="Budget display mode">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`p-2 rounded min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
              aria-pressed={viewMode === 'chart'}
              title="Visual Chart View"
              aria-label="Visual Chart View"
            >
              <PieIcon className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
              aria-pressed={viewMode === 'table'}
              title="Accessible Table View"
              aria-label="Accessible Data Table View"
            >
              <TableIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Budget Reality Check / Status Banner */}
      {budgetStatus && (
        <div
          className={`p-4 rounded-xl mb-6 border flex items-start gap-3 ${
            budgetStatus.type === 'over'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
          }`}
          role="status"
        >
          {budgetStatus.type === 'over' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>{budgetStatus.text}</span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5 leading-relaxed">
              {budgetStatus.detail}
            </p>
          </div>
        </div>
      )}

      {/* Requested Budget Gap Note from Gemini */}
      {budget.requestedBudgetGapNote && (
        <div className="mb-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white">💡 {language === 'hi' ? 'बजट टिप्पणी: ' : 'Budget Note: '}</span>
          {budget.requestedBudgetGapNote}
        </div>
      )}

      {/* Total Display Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-inner">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
            {perPersonView ? t('perPerson', language) : t('totalTrip', language)}
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-0.5 tracking-tight">
            {formatCurrency(totalDisplay, currency)}
          </div>
        </div>
        <div className="text-right text-xs text-slate-300">
          <div>{travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}</div>
          {perPersonView && (
            <div className="text-teal-400 font-bold mt-0.5">
              Group Total: {formatCurrency(budget.total, currency)}
            </div>
          )}
          {!perPersonView && travelers > 1 && (
            <div className="text-teal-400 font-bold mt-0.5">
              ~{formatCurrency(budget.perPerson, currency)} / person
            </div>
          )}
        </div>
      </div>

      {/* Main Breakdown: Chart vs Table */}
      {viewMode === 'chart' ? (
        <div className="space-y-6">
          {/* Stacked Proportional Bar Chart */}
          <div>
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden shadow-inner">
              {categoriesWithPct.map((c) => (
                <div
                  key={c.id}
                  style={{ width: `${c.pct}%` }}
                  className={`${c.color} transition-all duration-500`}
                  title={`${c.label}: ${formatCurrency(c.amount, currency)} (${c.pct}%)`}
                  role="progressbar"
                  aria-valuenow={c.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${c.label} represents ${c.pct}% of total`}
                />
              ))}
            </div>
          </div>

          {/* Cards for each category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesWithPct.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${c.color} text-white flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {c.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {c.pct}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(c.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <caption className="sr-only">Detailed breakdown of estimated travel expenses by category</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <th scope="col" className="py-2.5 pr-4">Category</th>
                <th scope="col" className="py-2.5 px-4 text-right">Estimated Amount</th>
                <th scope="col" className="py-2.5 pl-4 text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoriesWithPct.map((c) => (
                <tr key={c.id} className="text-slate-800 dark:text-slate-200">
                  <td className="py-2.5 pr-4 font-semibold flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${c.color}`}></span>
                    <span>{c.label}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                    {formatCurrency(c.amount, currency)}
                  </td>
                  <td className="py-2.5 pl-4 text-right font-mono text-slate-500 dark:text-slate-400">
                    {c.pct}%
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                <td className="py-3 pr-4">
                  TOTAL {perPersonView ? '(Per Person)' : '(Group)'}
                </td>
                <td className="py-3 px-4 text-right font-mono text-base text-teal-600 dark:text-teal-400">
                  {formatCurrency(totalDisplay, currency)}
                </td>
                <td className="py-3 pl-4 text-right font-mono">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
