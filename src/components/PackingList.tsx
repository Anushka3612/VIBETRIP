import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Sparkles, RotateCcw } from 'lucide-react';
import { PackingCategory, AppLanguage } from '../types/trip';
import { t } from '../utils/translations';

interface PackingListProps {
  categories: PackingCategory[];
  checkedItems: Record<string, boolean>;
  onToggleItem: (itemKey: string) => void;
  onAddCustomItem: (categoryIndex: number, item: string) => void;
  onResetPackingList: () => void;
  language: AppLanguage;
}

export const PackingList: React.FC<PackingListProps> = ({
  categories,
  checkedItems,
  onToggleItem,
  onAddCustomItem,
  onResetPackingList,
  language,
}) => {
  const [newInputs, setNewInputs] = useState<Record<number, string>>({});

  // Calculate overall packed progress
  let totalItems = 0;
  let packedCount = 0;

  categories.forEach((cat, cIdx) => {
    cat.items.forEach((item, iIdx) => {
      totalItems += 1;
      const key = `${cIdx}_${item}`;
      if (checkedItems[key]) packedCount += 1;
    });
  });

  const progressPct = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  const handleAddSubmit = (cIdx: number, e: React.FormEvent) => {
    e.preventDefault();
    const val = (newInputs[cIdx] || '').trim();
    if (!val) return;
    onAddCustomItem(cIdx, val);
    setNewInputs((prev) => ({ ...prev, [cIdx]: '' }));
  };

  return (
    <section
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-colors"
      aria-labelledby="packing-list-heading"
    >
      {/* Header and Progress */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3
            id="packing-list-heading"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <span>{t('packingTab', language)}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
              {packedCount}/{totalItems} {language === 'hi' ? 'पैक हुआ' : 'packed'}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
            {language === 'hi'
              ? 'मौसम, रूट और ऊंचाई के अनुसार तैयार की गई जरूरी सामानों की सूची।'
              : 'Smart checklist tailored to your destination, terrain, altitude, and climate.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onResetPackingList}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] transition-colors no-print"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{language === 'hi' ? 'रीसेट' : 'Reset Checks'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>{t('packedProgress', language)}</span>
          <span className="text-teal-600 dark:text-teal-400">{progressPct}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Packing progress: ${progressPct}% completed`}
          />
        </div>
      </div>

      {/* Categorized List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {categories.map((cat, cIdx) => (
          <div
            key={cIdx}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span>{cat.category}</span>
              </h4>

              <div className="space-y-2 mb-4" role="group" aria-label={cat.category}>
                {cat.items.map((item, iIdx) => {
                  const itemKey = `${cIdx}_${item}`;
                  const isChecked = !!checkedItems[itemKey];

                  return (
                    <label
                      key={iIdx}
                      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm select-none ${
                        isChecked
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-slate-600 dark:text-slate-400 line-through'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleItem(itemKey)}
                        className="sr-only"
                      />
                      <span className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        )}
                      </span>
                      <span className="leading-tight">{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Item Input */}
            <form onSubmit={(e) => handleAddSubmit(cIdx, e)} className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 no-print flex gap-2">
              <label htmlFor={`add-item-${cIdx}`} className="sr-only">
                Add custom item to {cat.category}
              </label>
              <input
                id={`add-item-${cIdx}`}
                type="text"
                value={newInputs[cIdx] || ''}
                onChange={(e) =>
                  setNewInputs((prev) => ({ ...prev, [cIdx]: e.target.value }))
                }
                placeholder={t('addItem', language)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center min-h-[36px] min-w-[36px]"
                aria-label={`Add item to ${cat.category}`}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
};
