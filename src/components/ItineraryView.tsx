import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Share2,
  Printer,
  Copy,
  Download,
  Volume2,
  VolumeX,
  Scale,
  Bookmark,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Info,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Check,
  Compass,
} from 'lucide-react';
import {
  TripItinerary,
  CurrencyCode,
  AppLanguage,
  TravelStyle,
  StopItem,
  SwapAlternative,
} from '../types/trip';
import { DayCard } from './DayCard';
import { BudgetChart } from './BudgetChart';
import { PackingList } from './PackingList';
import { ChatRefiner } from './ChatRefiner';
import { SwapStopModal } from './SwapStopModal';
import { CompareView } from './CompareView';
import { formatCurrency } from '../utils/currency';
import { formatItineraryAsPlainText, downloadItineraryAsJSON } from '../utils/storage';
import { t } from '../utils/translations';

interface ItineraryViewProps {
  trip: TripItinerary;
  onUpdateTrip: (updatedTrip: TripItinerary) => void;
  onSaveTrip: (trip: TripItinerary) => void;
  onRefineChat: (prompt: string) => void;
  onApplyTweaks: (tweaks: { pace: 'relaxed' | 'balanced' | 'packed'; travelStyle: TravelStyle }) => void;
  onRegenerateDay: (dayNumber: number) => void;
  onSwapStop: (dayNumber: number, stop: StopItem) => void;
  isRefining: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  language: AppLanguage;
  swapModalState: {
    isOpen: boolean;
    dayNumber: number;
    currentStop: StopItem | null;
    alternatives: SwapAlternative[];
    isLoading: boolean;
  };
  onCloseSwapModal: () => void;
  onConfirmSwapStop: (alt: SwapAlternative) => void;
  compareState: {
    isOpen: boolean;
    variantTrip: TripItinerary | null;
    isLoading: boolean;
  };
  onOpenCompare: () => void;
  onCloseCompare: () => void;
  onGenerateCompareVariant: (style: TravelStyle) => void;
  onSelectCompareVariant: (selected: TripItinerary) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onUpdateTrip,
  onSaveTrip,
  onRefineChat,
  onApplyTweaks,
  onRegenerateDay,
  onSwapStop,
  isRefining,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currency,
  onCurrencyChange,
  language,
  swapModalState,
  onCloseSwapModal,
  onConfirmSwapStop,
  compareState,
  onOpenCompare,
  onCloseCompare,
  onGenerateCompareVariant,
  onSelectCompareVariant,
}) => {
  const [activeTab, setActiveTab] = useState<'days' | 'budget' | 'map' | 'packing' | 'safety'>('days');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    (trip.days || []).forEach((d) => {
      init[d.dayNumber] = true; // Expanded by default for best UX
    });
    return init;
  });

  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Sync expanded days when days change
  useEffect(() => {
    setExpandedDays((prev) => {
      const next = { ...prev };
      (trip.days || []).forEach((d) => {
        if (next[d.dayNumber] === undefined) next[d.dayNumber] = true;
      });
      return next;
    });
  }, [trip.days]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const toggleAllDays = (expand: boolean) => {
    const next: Record<number, boolean> = {};
    (trip.days || []).forEach((d) => {
      next[d.dayNumber] = expand;
    });
    setExpandedDays(next);
  };

  // Text-to-Speech Read Aloud
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const textToRead = `${trip.tripTitle}. ${trip.summary}. Best time to visit: ${trip.bestTimeNote}. Total estimated cost: ${trip.budget.total} rupees. Day 1: ${trip.days[0]?.theme || ''}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  // Copy Plain Text
  const handleCopyText = async () => {
    try {
      const formatted = formatItineraryAsPlainText(trip);
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Web Share API
  const handleShare = async () => {
    const shareData = {
      title: trip.tripTitle,
      text: `${trip.tripTitle} - ${trip.summary}\nPlanned with VibeTrip AI.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Share cancelled or failed', err);
      }
    } else {
      handleCopyText();
    }
  };

  // Print PDF Layout
  const handlePrint = () => {
    toggleAllDays(true); // Expand all for full print
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Save Trip with notification
  const handleSave = () => {
    onSaveTrip(trip);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Packing list state persistence
  const handleTogglePackingItem = (itemKey: string) => {
    const updatedChecks = { ...(trip.checkedPackingItems || {}) };
    updatedChecks[itemKey] = !updatedChecks[itemKey];
    onUpdateTrip({
      ...trip,
      checkedPackingItems: updatedChecks,
    });
  };

  const handleAddCustomPackingItem = (catIdx: number, newItem: string) => {
    const updatedPacking = JSON.parse(JSON.stringify(trip.packingList || []));
    if (updatedPacking[catIdx]) {
      updatedPacking[catIdx].items.push(newItem);
      onUpdateTrip({
        ...trip,
        packingList: updatedPacking,
      });
    }
  };

  const handleResetPacking = () => {
    onUpdateTrip({
      ...trip,
      checkedPackingItems: {},
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Alert: Saved / Copied */}
      {(savedNotice || copied) && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border border-slate-700 animate-bounce"
          role="status"
          aria-live="polite"
        >
          <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>{savedNotice ? t('savedTripSuccess', language) : t('copiedText', language)}</span>
        </div>
      )}

      {/* Hero Banner: Destination, Trip Title & Summary */}
      <section
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden print-card"
        aria-labelledby="trip-title"
      >
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{trip.destination}</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-semibold border border-slate-700">
              {trip.days?.length || 0} {language === 'hi' ? 'दिन' : 'Days'} • {trip.inferredInputs?.travelers || 1}{' '}
              {language === 'hi' ? 'यात्री' : 'Travelers'}
            </span>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 capitalize">
              {trip.inferredInputs?.travelStyle || 'Comfort'}
            </span>
          </div>

          <h1 id="trip-title" className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
            {trip.tripTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
            {trip.summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-teal-300/90 font-medium bg-white/5 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 w-fit">
            <span className="text-teal-400 font-bold">✨ Best Season:</span>
            <span>{trip.bestTimeNote}</span>
          </div>
        </div>

        {/* Decorative background blur */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />
      </section>

      {/* AI Inferred Parameters Banner */}
      <section
        className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm"
        aria-label="Inferred trip parameters"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-teal-950 dark:text-teal-200">
              {t('inferredBannerTitle', language)}
            </h2>
            <p className="text-xs text-teal-800 dark:text-teal-300/90 mt-0.5">
              {t('inferredBannerDesc', language)}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-teal-200 dark:border-teal-800">
                📅 {trip.days?.length || trip.inferredInputs?.days || 4} Days
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-teal-200 dark:border-teal-800">
                👥 {trip.inferredInputs?.travelers || 1} Travelers
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-teal-200 dark:border-teal-800">
                💰 Est. {formatCurrency(trip.budget?.total || 0, currency)}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-teal-200 dark:border-teal-800 capitalize">
                🎒 Style: {trip.inferredInputs?.travelStyle || 'Comfort'}
              </span>
              {trip.inferredInputs?.startingCity && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-teal-200 dark:border-teal-800">
                  📍 From: {trip.inferredInputs.startingCity}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Warnings & Seasonal Alerts Callout (if any) */}
      {trip.warnings?.length > 0 && (
        <section
          className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm"
          role="region"
          aria-label="Important travel alerts"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
              {language === 'hi' ? 'महत्वपूर्ण योजना नोट्स व बजट अलर्ट:' : 'Important Planning & Budget Reality Notes:'}
            </h3>
            <ul className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 space-y-1 list-disc list-inside">
              {trip.warnings.map((w, idx) => (
                <li key={idx} className="leading-relaxed">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Action Toolbar: Read Aloud, Compare, Save, Print/PDF, Copy, Download, Share */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border min-h-[44px] transition-all ${
              isPlayingSpeech
                ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
            aria-label={isPlayingSpeech ? t('stopReading', language) : t('readAloud', language)}
          >
            {isPlayingSpeech ? (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            )}
            <span>{isPlayingSpeech ? t('stopReading', language) : t('readAloud', language)}</span>
          </button>

          {/* Compare Mode Toggle */}
          <button
            type="button"
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 min-h-[44px] transition-colors"
          >
            <Scale className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <span>{t('compareBtn', language)}</span>
          </button>

          {/* Save Trip Button */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm min-h-[44px] transition-colors"
          >
            <Bookmark className="w-4 h-4" aria-hidden="true" />
            <span>{t('saveTrip', language)}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 transition-colors"
            title="Print or Save as PDF"
            aria-label={t('exportPdf', language)}
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">{t('exportPdf', language)}</span>
          </button>

          {/* Copy Plain Text */}
          <button
            type="button"
            onClick={handleCopyText}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 transition-colors"
            title="Copy formatted plain text"
            aria-label={t('copyText', language)}
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">{copied ? t('copiedText', language) : t('copyText', language)}</span>
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={() => downloadItineraryAsJSON(trip)}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 transition-colors"
            title="Download structured JSON"
            aria-label={t('downloadJson', language)}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">JSON</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 transition-colors"
            title="Share trip itinerary"
            aria-label={t('shareBtn', language)}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">{t('shareBtn', language)}</span>
          </button>
        </div>
      </div>

      {/* Compare View Overlay (if active) */}
      {compareState.isOpen && (
        <CompareView
          tripA={trip}
          tripB={compareState.variantTrip}
          onSelectTrip={onSelectCompareVariant}
          onClose={onCloseCompare}
          onGenerateVariant={onGenerateCompareVariant}
          isGeneratingVariant={compareState.isLoading}
          currency={currency}
          language={language}
        />
      )}

      {/* Conversational Chat Refinement Panel */}
      <ChatRefiner
        onRefine={onRefineChat}
        onApplyTweaks={onApplyTweaks}
        isLoading={isRefining}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        language={language}
        currentTravelStyle={trip.inferredInputs?.travelStyle}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 no-print">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1" aria-label="Trip views">
          <button
            type="button"
            onClick={() => setActiveTab('days')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap min-h-[44px] flex items-center gap-2 transition-all ${
              activeTab === 'days'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-current={activeTab === 'days' ? 'page' : undefined}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>{t('daysTimeline', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap min-h-[44px] flex items-center gap-2 transition-all ${
              activeTab === 'budget'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-current={activeTab === 'budget' ? 'page' : undefined}
          >
            <span>💰</span>
            <span>{t('budgetTab', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap min-h-[44px] flex items-center gap-2 transition-all ${
              activeTab === 'map'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-current={activeTab === 'map' ? 'page' : undefined}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{t('mapTab', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packing')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap min-h-[44px] flex items-center gap-2 transition-all ${
              activeTab === 'packing'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-current={activeTab === 'packing' ? 'page' : undefined}
          >
            <span>🎒</span>
            <span>{t('packingTab', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap min-h-[44px] flex items-center gap-2 transition-all ${
              activeTab === 'safety'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-current={activeTab === 'safety' ? 'page' : undefined}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>{t('safetyTab', language)}</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: Days Timeline */}
      {activeTab === 'days' && (
        <section aria-label="Day by day itinerary timeline" className="space-y-4">
          <div className="flex items-center justify-between no-print px-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {trip.days?.length || 0} {language === 'hi' ? 'दिनों का कार्यक्रम' : 'Days Planned'}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => toggleAllDays(true)}
                className="text-teal-600 dark:text-teal-400 hover:underline p-1"
              >
                {language === 'hi' ? 'सभी खोलें' : 'Expand All'}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => toggleAllDays(false)}
                className="text-slate-600 dark:text-slate-400 hover:underline p-1"
              >
                {language === 'hi' ? 'सभी बंद करें' : 'Collapse All'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {trip.days?.map((day) => (
              <DayCard
                key={day.dayNumber}
                day={day}
                destination={trip.destination}
                currency={currency}
                language={language}
                isExpanded={!!expandedDays[day.dayNumber]}
                onToggleExpand={() => toggleDay(day.dayNumber)}
                onRegenerateDay={onRegenerateDay}
                onSwapStop={onSwapStop}
                isRegenerating={isRefining}
              />
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: Budget Breakdown */}
      {activeTab === 'budget' && (
        <BudgetChart
          budget={trip.budget}
          requestedBudgetINR={trip.inferredInputs?.budgetINR}
          travelers={trip.inferredInputs?.travelers || 1}
          currency={currency}
          onCurrencyChange={onCurrencyChange}
          language={language}
        />
      )}

      {/* TAB 3: Map & Places */}
      {activeTab === 'map' && (
        <section
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-colors"
          aria-labelledby="map-places-heading"
        >
          <div className="mb-6">
            <h3 id="map-places-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t('mapTab', language)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'सभी पड़ावों का भौगोलिक दृश्य और गूगल मैप्स सीधे लिंक।'
                : 'Geographic stops overview with direct Google Maps routes.'}
            </p>
          </div>

          <div className="space-y-4">
            {trip.days?.map((day) => (
              <div
                key={day.dayNumber}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Day {day.dayNumber}: {day.theme}
                  </span>
                  <span className="text-xs text-slate-500">
                    {day.stops?.length || 0} stops
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {day.stops?.map((stop, sIdx) => {
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${stop.placeName}, ${trip.destination}`
                    )}`;

                    return (
                      <div
                        key={sIdx}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>{stop.time}</span>
                            <span className="font-semibold text-teal-600">{stop.category}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {stop.placeName}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {stop.description}
                          </p>
                        </div>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors min-h-[36px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t('openMaps', language)}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: Packing List */}
      {activeTab === 'packing' && (
        <PackingList
          categories={trip.packingList || []}
          checkedItems={trip.checkedPackingItems || {}}
          onToggleItem={handleTogglePackingItem}
          onAddCustomItem={handleAddCustomPackingItem}
          onResetPackingList={handleResetPacking}
          language={language}
        />
      )}

      {/* TAB 5: Safety, Permits & Seasonal Alerts */}
      {activeTab === 'safety' && (
        <section
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-colors space-y-6"
          aria-labelledby="safety-heading"
        >
          <div>
            <h3 id="safety-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" aria-hidden="true" />
              <span>{t('safetyTab', language)}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'मौसम, सड़क की स्थिति, ऊंचाई और सरकारी परमिट से संबंधित महत्वपूर्ण दिशा-निर्देश।'
                : 'Crucial ground intelligence: weather conditions, road closures, permits & altitude safety.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip.safetyAndPermitNotes?.map((note, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Web Grounding Sources (if available from Google Search) */}
          {trip.groundingSources && trip.groundingSources.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Grounding Sources & References
              </h4>
              <div className="flex flex-wrap gap-2">
                {trip.groundingSources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-teal-600 dark:text-teal-400 hover:underline bg-slate-50 dark:bg-slate-800"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Swap Stop Modal */}
      <SwapStopModal
        isOpen={swapModalState.isOpen}
        onClose={onCloseSwapModal}
        dayNumber={swapModalState.dayNumber}
        currentStop={swapModalState.currentStop}
        alternatives={swapModalState.alternatives}
        isLoading={swapModalState.isLoading}
        onSelectAlternative={onConfirmSwapStop}
        currency={currency}
        language={language}
      />
    </div>
  );
};
