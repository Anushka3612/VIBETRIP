import React, { useState } from 'react';
import { Send, Sparkles, Sliders, Undo2, Redo2, SlidersHorizontal, ArrowDownCircle, Flame, Coffee, Compass } from 'lucide-react';
import { TravelStyle, AppLanguage } from '../types/trip';
import { t } from '../utils/translations';

interface ChatRefinerProps {
  onRefine: (prompt: string) => void;
  onApplyTweaks: (tweaks: { pace: 'relaxed' | 'balanced' | 'packed'; travelStyle: TravelStyle }) => void;
  isLoading: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  language: AppLanguage;
  currentTravelStyle?: TravelStyle;
}

const QUICK_PROMPTS_EN = [
  'Make it 20% cheaper with budget homestays',
  'Add 1 exciting adventure activity or trek',
  'Make the pace more relaxed with less road travel',
  'Suggest authentic local street food dhabas',
  'Adjust for a family with kids',
];

const QUICK_PROMPTS_HI = [
  'बजट होमस्टे के साथ 20% सस्ता करें',
  'एक रोमांचक एडवेंचर या ट्रेक गतिविधि जोड़ें',
  'कम सड़क यात्रा के साथ गति अधिक आरामदायक करें',
  'प्रसिद्ध स्थानीय स्ट्रीट फूड और ढाबे सुझाएं',
  'परिवार और बच्चों के अनुकूल बदलाव करें',
];

export const ChatRefiner: React.FC<ChatRefinerProps> = ({
  onRefine,
  onApplyTweaks,
  isLoading,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  language,
  currentTravelStyle = 'comfort',
}) => {
  const [chatInput, setChatInput] = useState('');
  const [showSliders, setShowSliders] = useState(false);
  const [pace, setPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle>(currentTravelStyle);

  const quickPrompts = language === 'hi' ? QUICK_PROMPTS_HI : QUICK_PROMPTS_EN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    onRefine(chatInput.trim());
    setChatInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    onRefine(prompt);
  };

  const handleTweakSubmit = () => {
    if (isLoading) return;
    onApplyTweaks({
      pace,
      travelStyle: selectedStyle,
    });
  };

  return (
    <section
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-colors no-print"
      aria-labelledby="refiner-heading"
    >
      {/* Top Header: Title & Undo/Redo */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 id="refiner-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? 'यात्रा में मनचाहे बदलाव करें' : 'Refine & Tweak Itinerary'}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {language === 'hi'
                ? 'AI मौजूदा योजना को बदलेगा — शुरू से बनाने की जरूरत नहीं'
                : 'Conversational edits update existing days without restarting'}
            </p>
          </div>
        </div>

        {/* Undo & Redo History buttons */}
        <div className="flex items-center gap-1.5" role="group" aria-label="History undo and redo">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold min-h-[44px] transition-colors ${
              canUndo && !isLoading
                ? 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            aria-label={t('undoBtn', language)}
            title="Undo last modification (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('undoBtn', language)}</span>
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold min-h-[44px] transition-colors ${
              canRedo && !isLoading
                ? 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            aria-label={t('redoBtn', language)}
            title="Redo last undone change (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('redoBtn', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold min-h-[44px] transition-colors ${
              showSliders
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            aria-expanded={showSliders}
            aria-label="Toggle Pace & Style Sliders"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{language === 'hi' ? 'स्लाइडर्स' : 'Pace & Style'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Sliders Panel */}
      {showSliders && (
        <div className="mb-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pace Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('paceSliderLabel', language)}
              </label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Trip pacing selection">
                {(['relaxed', 'balanced', 'packed'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPace(p)}
                    role="radio"
                    aria-checked={pace === p}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center min-h-[44px] transition-all ${
                      pace === p
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {p === 'relaxed' && t('paceRelaxed', language)}
                    {p === 'balanced' && t('paceBalanced', language)}
                    {p === 'packed' && t('pacePacked', language)}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('travelStyleLabel', language)}
              </label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Travel style selection">
                {(['budget', 'comfort', 'luxury'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStyle(s)}
                    role="radio"
                    aria-checked={selectedStyle === s}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center capitalize min-h-[44px] transition-all ${
                      selectedStyle === s
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleTweakSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm min-h-[40px]"
            >
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('applyTweaks', language)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Refinement Chips */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(q)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-300 font-medium transition-colors min-h-[36px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="refinement-input" className="sr-only">
          Itinerary refinement instruction
        </label>
        <div className="relative flex-1">
          <input
            id="refinement-input"
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isLoading}
            placeholder={t('chatRefinerPlaceholder', language)}
            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 min-h-[44px] focus:bg-white dark:focus:bg-slate-800 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!chatInput.trim() || isLoading}
          className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 min-h-[44px] shadow-sm transition-all ${
            !chatInput.trim() || isLoading
              ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
              : 'bg-teal-600 hover:bg-teal-700 active:scale-95 shadow-teal-600/20'
          }`}
          aria-label={t('chatRefinerSubmit', language)}
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t('chatRefinerSubmit', language)}</span>
        </button>
      </form>
    </section>
  );
};
