import React, { useState } from 'react';
import { X, ArrowRight, Check, Sparkles, Scale, DollarSign, Hotel, Car, Compass } from 'lucide-react';
import { TripItinerary, TravelStyle, CurrencyCode, AppLanguage } from '../types/trip';
import { formatCurrency } from '../utils/currency';

interface CompareViewProps {
  tripA: TripItinerary;
  tripB: TripItinerary | null;
  onSelectTrip: (trip: TripItinerary) => void;
  onClose: () => void;
  onGenerateVariant: (targetStyle: TravelStyle) => void;
  isGeneratingVariant: boolean;
  currency: CurrencyCode;
  language: AppLanguage;
}

export const CompareView: React.FC<CompareViewProps> = ({
  tripA,
  tripB,
  onSelectTrip,
  onClose,
  onGenerateVariant,
  isGeneratingVariant,
  currency,
  language,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle>('budget');

  const budgetDelta = tripB ? tripB.budget.total - tripA.budget.total : 0;

  return (
    <section
      className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-500/40 dark:border-teal-400/40 p-5 sm:p-7 shadow-xl mb-8 relative animate-fade-in"
      aria-labelledby="compare-view-heading"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Scale className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="compare-view-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? 'यात्रा विकल्पों की तुलना (Compare Mode)' : 'Side-by-Side Trip Comparison'}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {language === 'hi'
                ? 'बजट, आराम और रोमांच के आधार पर दो विकल्पों का विश्लेषण करें'
                : 'Compare styles, budget gaps, and pacing side by side'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close comparison view"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* If Variant B is not generated yet, show generation controls */}
      {!tripB ? (
        <div className="text-center py-8 max-w-md mx-auto">
          <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-3" aria-hidden="true" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            {language === 'hi' ? 'तुलना के लिए दूसरा विकल्प चुनें' : 'Generate a comparison variant'}
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 mb-6">
            Compare your current {tripA.inferredInputs?.travelStyle || 'comfort'} itinerary with an alternate tier:
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {(['budget', 'comfort', 'luxury'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border min-h-[44px] transition-all ${
                  selectedStyle === style
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onGenerateVariant(selectedStyle)}
            disabled={isGeneratingVariant}
            className="w-full py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px]"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingVariant ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>
              {isGeneratingVariant
                ? 'Generating comparison...'
                : `Generate ${selectedStyle.toUpperCase()} Variant`}
            </span>
          </button>
        </div>
      ) : (
        /* Side by Side Comparison Grid */
        <div className="space-y-6">
          {/* Comparison Cards Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan A */}
            <div className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    Option A ({tripA.inferredInputs?.travelStyle || 'Active'})
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatCurrency(tripA.budget.total, currency)}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {tripA.tripTitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                  {tripA.summary}
                </p>

                {/* Stat pills */}
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-1.5">
                    <span>Stay & Hotels:</span>
                    <span className="font-bold">{formatCurrency(tripA.budget.stay, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-1.5">
                    <span>Transport:</span>
                    <span className="font-bold">{formatCurrency(tripA.budget.transport, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Per Person:</span>
                    <span className="font-bold">{formatCurrency(tripA.budget.perPerson, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectTrip(tripA)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Keep Option A as Primary</span>
              </button>
            </div>

            {/* Plan B */}
            <div className="p-5 rounded-2xl border-2 border-teal-500/80 bg-teal-50/30 dark:bg-teal-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                    Option B ({tripB.inferredInputs?.travelStyle || 'Variant'})
                  </span>
                  <span className="text-lg font-black text-teal-700 dark:text-teal-400">
                    {formatCurrency(tripB.budget.total, currency)}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {tripB.tripTitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                  {tripB.summary}
                </p>

                {/* Stat pills */}
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-4">
                  <div className="flex items-center justify-between border-b border-teal-200/60 dark:border-teal-800/60 pb-1.5">
                    <span>Stay & Hotels:</span>
                    <span className="font-bold">{formatCurrency(tripB.budget.stay, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-teal-200/60 dark:border-teal-800/60 pb-1.5">
                    <span>Transport:</span>
                    <span className="font-bold">{formatCurrency(tripB.budget.transport, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Per Person:</span>
                    <span className="font-bold">{formatCurrency(tripB.budget.perPerson, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectTrip(tripB)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] shadow-sm"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Switch to Option B</span>
              </button>
            </div>
          </div>

          {/* Difference Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">Cost Difference: </span>
            {budgetDelta > 0 ? (
              <span className="text-amber-700 dark:text-amber-400 font-bold">
                Option B costs +{formatCurrency(budgetDelta, currency)} more
              </span>
            ) : budgetDelta < 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                Option B saves {formatCurrency(Math.abs(budgetDelta), currency)}
              </span>
            ) : (
              <span>Costs are identical with different activity allocations</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
