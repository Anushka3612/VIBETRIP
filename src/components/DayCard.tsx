import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RotateCw,
  ArrowRightLeft,
  MapPin,
  ExternalLink,
  Utensils,
  Hotel,
  Clock,
  Car,
  Compass,
  Mountain,
  Coffee,
  Sparkles,
} from 'lucide-react';
import { DayPlan, StopItem, CurrencyCode, AppLanguage } from '../types/trip';
import { formatCurrency } from '../utils/currency';
import { t } from '../utils/translations';

interface DayCardProps {
  day: DayPlan;
  destination: string;
  currency: CurrencyCode;
  language: AppLanguage;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRegenerateDay: (dayNumber: number) => void;
  onSwapStop: (dayNumber: number, stop: StopItem) => void;
  isRegenerating: boolean;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  destination,
  currency,
  language,
  isExpanded,
  onToggleExpand,
  onRegenerateDay,
  onSwapStop,
  isRegenerating,
}) => {
  const [customRegenPrompt, setCustomRegenPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const getCategoryBadge = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('food') || cat.includes('cafe') || cat.includes('dining')) {
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: Coffee,
      };
    }
    if (cat.includes('adventure') || cat.includes('trek') || cat.includes('rafting') || cat.includes('hike')) {
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: Mountain,
      };
    }
    if (cat.includes('culture') || cat.includes('heritage') || cat.includes('temple') || cat.includes('monastery')) {
      return {
        bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: Sparkles,
      };
    }
    if (cat.includes('nature') || cat.includes('lake') || cat.includes('valley') || cat.includes('viewpoint')) {
      return {
        bg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        icon: Compass,
      };
    }
    return {
      bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: MapPin,
    };
  };

  // Calculate day total cost
  const dayStopsCost = (day.stops || []).reduce((acc, s) => acc + (s.estimatedCostINR || 0), 0);
  const dayMealsCost = (day.meals || []).reduce((acc, m) => acc + (m.estimatedCostINR || 0), 0);
  const dayTotal = dayStopsCost + dayMealsCost + (day.stayRecommendation?.costPerNightINR || 0);

  return (
    <article
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all print-card mb-4"
      aria-labelledby={`day-${day.dayNumber}-heading`}
    >
      {/* Header bar / Accordion trigger */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3.5 flex-1 min-w-[240px]">
          <span className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-teal-600/20 shrink-0">
            D{day.dayNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                {language === 'hi' ? `दिन ${day.dayNumber}` : `Day ${day.dayNumber}`}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                • {formatCurrency(dayTotal, currency)} est.
              </span>
            </div>
            <h3
              id={`day-${day.dayNumber}-heading`}
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
            >
              {day.theme}
            </h3>
          </div>
        </div>

        {/* Actions: Regenerate Day & Expand Toggle */}
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => setShowPromptInput(!showPromptInput)}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 min-h-[44px] transition-colors"
            title="Regenerate this specific day"
            aria-label={`Regenerate Day ${day.dayNumber}`}
          >
            <RotateCw className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${isRegenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">{t('regenerateDay', language)}</span>
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`day-${day.dayNumber}-details`}
            aria-label={isExpanded ? `Collapse Day ${day.dayNumber}` : `Expand Day ${day.dayNumber}`}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Optional custom regeneration prompt box */}
      {showPromptInput && (
        <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 border-b border-teal-200 dark:border-teal-900 no-print flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customRegenPrompt}
            onChange={(e) => setCustomRegenPrompt(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'इस दिन के लिए क्या बदलना चाहते हैं? (जैसे: ट्रेक की जगह शांत झील)'
                : 'Custom wish for this day (e.g. more relaxing cafes, waterfall hike)...'
            }
            className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => {
              onRegenerateDay(day.dayNumber);
              setShowPromptInput(false);
            }}
            disabled={isRegenerating}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg min-h-[40px] flex items-center justify-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isRegenerating ? 'Generating...' : 'Go'}</span>
          </button>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div id={`day-${day.dayNumber}-details`} className="p-4 sm:p-6 space-y-6">
          {/* Stops Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span>{language === 'hi' ? 'दिन के प्रमुख पड़ाव' : 'Planned Stops & Timeline'}</span>
            </h4>

            <div className="space-y-4 relative before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {day.stops?.map((stop, idx) => {
                const badge = getCategoryBadge(stop.category);
                const BadgeIcon = badge.icon;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${stop.placeName}, ${destination}`
                )}`;

                return (
                  <div key={idx} className="relative pl-9 sm:pl-10 group">
                    {/* Timeline Node */}
                    <div className="absolute left-2 top-2.5 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-600 dark:border-teal-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400"></div>
                    </div>

                    {/* Travel from previous note */}
                    {stop.travelFromPrevious && idx > 0 && (
                      <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/60 w-fit">
                        <Car className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                        <span>
                          {stop.travelFromPrevious.mode} • ~{stop.travelFromPrevious.hours}h
                          {stop.travelFromPrevious.costINR > 0
                            ? ` • ${formatCurrency(stop.travelFromPrevious.costINR, currency)}`
                            : ' • Included'}
                        </span>
                      </div>
                    )}

                    <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            {stop.time}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                          >
                            <BadgeIcon className="w-3 h-3" aria-hidden="true" />
                            <span>{stop.category}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            ~{stop.durationHours}h
                          </span>
                          {stop.estimatedCostINR > 0 && (
                            <span className="font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                              {formatCurrency(stop.estimatedCostINR, currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                        {stop.placeName}
                      </h5>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                        {stop.description}
                      </p>

                      {/* Stop Controls: Swap & Google Maps */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                        <button
                          type="button"
                          onClick={() => onSwapStop(day.dayNumber, stop)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold min-h-[36px] transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                          <span>{t('swapStop', language)}</span>
                        </button>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold min-h-[36px] transition-colors"
                          aria-label={`Open ${stop.placeName} in Google Maps`}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          <span>{t('openMaps', language)}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meals & Stay Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Meals */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-amber-50/30 dark:bg-amber-950/10">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{language === 'hi' ? 'भोजन अनुशंसाएं' : 'Local Meals & Food'}</span>
              </h5>
              <div className="space-y-2">
                {day.meals?.map((meal, mIdx) => (
                  <div key={mIdx} className="text-xs flex items-start justify-between gap-2 border-b border-amber-100 dark:border-amber-900/30 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {meal.mealType}:{' '}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {meal.recommendation}
                      </span>
                    </div>
                    {meal.estimatedCostINR > 0 && (
                      <span className="shrink-0 font-semibold text-slate-600 dark:text-slate-400">
                        ~{formatCurrency(meal.estimatedCostINR, currency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stay Recommendation */}
            {day.stayRecommendation && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-teal-50/30 dark:bg-teal-950/10 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 mb-2 flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{language === 'hi' ? 'रात का ठहराव' : 'Night Stay Recommendation'}</span>
                  </h5>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {day.stayRecommendation.type} in {day.stayRecommendation.areaName}
                  </p>
                  {day.stayRecommendation.hotelOrHostelSuggestion && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {day.stayRecommendation.hotelOrHostelSuggestion}
                    </p>
                  )}
                </div>
                <div className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-300">
                  Est. {formatCurrency(day.stayRecommendation.costPerNightINR, currency)} / night
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
