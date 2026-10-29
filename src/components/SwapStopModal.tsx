import React, { useEffect, useRef } from 'react';
import { X, ArrowRightLeft, Sparkles, Clock, Check, Loader2 } from 'lucide-react';
import { StopItem, SwapAlternative, CurrencyCode, AppLanguage } from '../types/trip';
import { formatCurrency } from '../utils/currency';

interface SwapStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  currentStop: StopItem | null;
  alternatives: SwapAlternative[];
  isLoading: boolean;
  onSelectAlternative: (alt: SwapAlternative) => void;
  currency: CurrencyCode;
  language: AppLanguage;
}

export const SwapStopModal: React.FC<SwapStopModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  currentStop,
  alternatives,
  isLoading,
  onSelectAlternative,
  currency,
  language,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentStop) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="swap-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 id="swap-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {language === 'hi' ? 'स्थान बदलें (Day ' + dayNumber + ')' : `Swap Stop • Day ${dayNumber}`}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'वर्तमान: ' : 'Replacing: '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentStop.placeName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 text-center" role="status" aria-live="polite">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {language === 'hi' ? '3 बेहतरीन विकल्प खोजे जा रहे हैं...' : 'Finding 3 curated alternative spots...'}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                Matching distance, theme, duration, and vibe.
              </p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No alternatives found. Please try again.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'इनमें से कोई एक विकल्प चुनें:' : 'Select one of these AI-recommended alternatives:'}
              </p>

              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {alt.placeName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{alt.durationHours}h
                        </span>
                        <span className="font-bold text-teal-700 dark:text-teal-300">
                          {formatCurrency(alt.estimatedCostINR, currency)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                      {alt.description}
                    </p>

                    <div className="text-[11px] text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/60 p-2 rounded-lg border border-teal-200 dark:border-teal-900/60 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{alt.whyBetter}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectAlternative(alt)}
                    className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] transition-colors"
                  >
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>{language === 'hi' ? 'यह विकल्प चुनें' : 'Swap with this Place'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
