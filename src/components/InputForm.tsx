import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, ChevronDown, ChevronUp, AlertCircle, RotateCcw } from 'lucide-react';
import { CurrencyCode, TravelStyle, TransportPreference, DietaryPreference, AppLanguage } from '../types/trip';
import { t } from '../utils/translations';
import { EXCHANGE_RATES } from '../utils/currency';

export interface TripFormData {
  vibe: string;
  days: string;
  travelers: string;
  budget: string;
  currency: CurrencyCode;
  startingCity: string;
  travelMonth: string;
  travelStyle: TravelStyle | '';
  transportPref: TransportPreference | '';
  dietaryPreference: DietaryPreference | '';
}

interface InputFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
  language: AppLanguage;
  initialValues?: Partial<TripFormData>;
}

const EXAMPLE_VIBES = [
  {
    title: 'Quiet Mountains & Cafes',
    text: 'Quiet mountains, cheap homestays, 4 days, with two friends, scenic hikes & pine trees in Himachal',
    tag: 'Himachal',
  },
  {
    title: 'Beach Party & Sunsets',
    text: 'Beach party with friends, 5 days, mid-budget, seafood, scooter rides & sunset shacks in Goa',
    tag: 'Goa',
  },
  {
    title: 'Heritage & Street Food',
    text: 'Heritage and food, solo traveler, weekend getaway, vibrant bazaars, palaces and local sweets',
    tag: 'Rajasthan',
  },
  {
    title: 'High Altitude Adventure',
    text: 'Spiti valley high altitude adventure, 7 days, rugged road trip, ancient monasteries and star-gazing',
    tag: 'Spiti Valley',
  },
];

const MONTHS = [
  'Any Season',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  isLoading,
  language,
  initialValues,
}) => {
  const [vibe, setVibe] = useState(initialValues?.vibe || '');
  const [days, setDays] = useState(initialValues?.days || '');
  const [travelers, setTravelers] = useState(initialValues?.travelers || '');
  const [budget, setBudget] = useState(initialValues?.budget || '');
  const [currency, setCurrency] = useState<CurrencyCode>(initialValues?.currency || 'INR');
  const [startingCity, setStartingCity] = useState(initialValues?.startingCity || '');
  const [travelMonth, setTravelMonth] = useState(initialValues?.travelMonth || 'Any Season');
  const [travelStyle, setTravelStyle] = useState<TravelStyle | ''>(initialValues?.travelStyle || '');
  const [transportPref, setTransportPref] = useState<TransportPreference | ''>(initialValues?.transportPref || '');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference | ''>(initialValues?.dietaryPreference || '');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<{ vibe?: string; days?: string; budget?: string }>({});

  // Voice recognition support via Web Speech API
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setVibe((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleExampleClick = (exampleText: string) => {
    setVibe(exampleText);
    setErrors((prev) => ({ ...prev, vibe: undefined }));
  };

  const handleReset = () => {
    setVibe('');
    setDays('');
    setTravelers('');
    setBudget('');
    setStartingCity('');
    setTravelMonth('Any Season');
    setTravelStyle('');
    setTransportPref('');
    setDietaryPreference('');
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { vibe?: string; days?: string; budget?: string } = {};

    if (!vibe.trim()) {
      newErrors.vibe = language === 'hi' ? 'कृपया अपनी यात्रा का वाइब दर्ज करें।' : 'Please describe your trip vibe.';
    }

    if (days) {
      const numDays = parseInt(days, 10);
      if (isNaN(numDays) || numDays < 1 || numDays > 30) {
        newErrors.days = language === 'hi' ? 'दिन 1 से 30 के बीच होने चाहिए।' : 'Days must be between 1 and 30.';
      }
    }

    if (budget) {
      const numBudget = parseFloat(budget);
      if (isNaN(numBudget) || numBudget <= 0) {
        newErrors.budget = language === 'hi' ? 'बजट शून्य से अधिक होना चाहिए।' : 'Budget must be greater than zero.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      vibe: vibe.trim(),
      days,
      travelers,
      budget,
      currency,
      startingCity: startingCity.trim(),
      travelMonth: travelMonth === 'Any Season' ? '' : travelMonth,
      travelStyle,
      transportPref,
      dietaryPreference,
    });
  };

  return (
    <section aria-labelledby="planner-heading" className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 sm:p-8 transition-colors"
      >
        {/* Main Title & Subtitle */}
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <span>{language === 'hi' ? 'प्राकृतिक भाषा AI ट्रिप जनरेटर' : 'Natural Language AI Trip Planner'}</span>
          </div>
          <h2
            id="planner-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            {language === 'hi' ? 'कैसी यात्रा पर जाना चाहते हैं?' : 'What kind of trip are you craving?'}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
            {language === 'hi'
              ? 'मूड, दोस्त, बजट या ख्वाहिश लिखें — AI बाकी सब समझ लेगा और यथार्थवादी रूट तैयार करेगा।'
              : 'Describe your vibe, mood, companions, or pacing. Blank fields will be intelligently inferred!'}
          </p>
        </div>

        {/* Large Vibe Textarea with Voice Input */}
        <div className="relative mb-4">
          <label
            htmlFor="vibe-input"
            className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between"
          >
            <span>{t('vibeLabel', language)} <span className="text-rose-500">*</span></span>
            <span className="text-xs font-normal text-slate-600 dark:text-slate-400">
              {vibe.length}/1000
            </span>
          </label>

          <div className="relative rounded-xl shadow-inner">
            <textarea
              id="vibe-input"
              rows={4}
              maxLength={1000}
              value={vibe}
              onChange={(e) => {
                setVibe(e.target.value);
                if (errors.vibe) setErrors((prev) => ({ ...prev, vibe: undefined }));
              }}
              placeholder={t('vibePlaceholder', language)}
              aria-required="true"
              aria-invalid={!!errors.vibe}
              aria-describedby={errors.vibe ? 'vibe-error' : 'vibe-hint'}
              className={`w-full p-4 pr-14 text-sm sm:text-base rounded-xl border bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-y min-h-[120px] ${
                errors.vibe
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:border-teal-500'
              }`}
            />

            {/* Voice Input Button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`absolute right-3.5 bottom-3.5 p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/30 ring-4 ring-rose-200 dark:ring-rose-900/50'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-600 shadow-sm'
                }`}
                aria-label={isListening ? t('voiceListening', language) : t('voiceStart', language)}
                title={isListening ? t('voiceListening', language) : t('voiceStart', language)}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Mic className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          <p id="vibe-hint" className="sr-only">
            Describe your destination, pace, who you are traveling with, and activities you enjoy.
          </p>

          {errors.vibe && (
            <p id="vibe-error" className="mt-1.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errors.vibe}</span>
            </p>
          )}

          {isListening && (
            <div className="mt-2 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2 animate-pulse" aria-live="polite">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{t('voiceListening', language)}</span>
            </div>
          )}
        </div>

        {/* 4 Example Vibe Chips */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('exampleChipsLabel', language)}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Example trip vibes">
            {EXAMPLE_VIBES.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(chip.text)}
                className="text-left p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 hover:border-teal-300 dark:hover:border-teal-700 transition-all flex items-start gap-2.5 min-h-[44px]"
              >
                <span className="shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                  {chip.tag}
                </span>
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                  {chip.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Refinement Controls Accordion */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 text-left font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors min-h-[44px]"
            aria-expanded={showAdvanced}
            aria-controls="advanced-controls"
          >
            <div className="flex items-center gap-2">
              <span className="text-teal-600 dark:text-teal-400 font-mono text-xs">✨</span>
              <span>{t('refineHeading', language)}</span>
              <span className="text-xs font-normal text-slate-600 dark:text-slate-400 hidden sm:inline">
                ({language === 'hi' ? 'खाली छोड़ेंगे तो AI खुद तय करेगा' : 'leave blank for AI inference'})
              </span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
            )}
          </button>

          {showAdvanced && (
            <div id="advanced-controls" className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Number of Days */}
              <div>
                <label htmlFor="trip-days" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('daysLabel', language)} (1-30)
                </label>
                <input
                  type="number"
                  id="trip-days"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="e.g. 4 (or blank)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                  aria-describedby={errors.days ? 'days-error' : undefined}
                />
                {errors.days && (
                  <p id="days-error" className="mt-1 text-xs text-rose-500">{errors.days}</p>
                )}
              </div>

              {/* Number of Travelers */}
              <div>
                <label htmlFor="trip-travelers" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('travelersLabel', language)} (1-20)
                </label>
                <input
                  type="number"
                  id="trip-travelers"
                  min={1}
                  max={20}
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  placeholder="e.g. 2 (or blank)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                />
              </div>

              {/* Total Budget & Currency Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="trip-budget" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('budgetLabel', language)}
                  </label>
                  <label htmlFor="currency-select" className="sr-only">
                    {t('currencyLabel', language)}
                  </label>
                  <select
                    id="currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-transparent border-0 cursor-pointer p-0 focus:ring-0"
                  >
                    {Object.keys(EXCHANGE_RATES).map((cur) => (
                      <option key={cur} value={cur} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {cur} ({EXCHANGE_RATES[cur as CurrencyCode].symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-600 dark:text-slate-400 pointer-events-none">
                    {EXCHANGE_RATES[currency].symbol}
                  </span>
                  <input
                    type="number"
                    id="trip-budget"
                    min={100}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                    aria-describedby={errors.budget ? 'budget-error' : undefined}
                  />
                </div>
                {errors.budget && (
                  <p id="budget-error" className="mt-1 text-xs text-rose-500">{errors.budget}</p>
                )}
              </div>

              {/* Starting City */}
              <div>
                <label htmlFor="starting-city" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('startingCityLabel', language)}
                </label>
                <input
                  type="text"
                  id="starting-city"
                  value={startingCity}
                  onChange={(e) => setStartingCity(e.target.value)}
                  placeholder={t('startingCityPlaceholder', language)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                />
              </div>

              {/* Travel Month */}
              <div>
                <label htmlFor="travel-month" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('travelMonthLabel', language)}
                </label>
                <select
                  id="travel-month"
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travel Style */}
              <div>
                <label htmlFor="travel-style" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('travelStyleLabel', language)}
                </label>
                <select
                  id="travel-style"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value as TravelStyle | '')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                >
                  <option value="">AI Inferred (Recommended)</option>
                  <option value="budget">Budget (Hostels, Dhabas, Buses)</option>
                  <option value="comfort">Comfort (Boutique Stays, Cabs)</option>
                  <option value="luxury">Luxury (Resorts, Premium Dining)</option>
                </select>
              </div>

              {/* Transport Preference */}
              <div>
                <label htmlFor="transport-pref" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('transportLabel', language)}
                </label>
                <select
                  id="transport-pref"
                  value={transportPref}
                  onChange={(e) => setTransportPref(e.target.value as TransportPreference | '')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                >
                  <option value="">AI Inferred (Best Route)</option>
                  <option value="bus">Bus / Volvo</option>
                  <option value="train">Train / Rail</option>
                  <option value="car">Car / Private Cab</option>
                  <option value="bike">Motorbike / Scooter</option>
                  <option value="flight">Flight</option>
                </select>
              </div>

              {/* Dietary Preference */}
              <div>
                <label htmlFor="diet-pref" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('dietLabel', language)}
                </label>
                <select
                  id="diet-pref"
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference | '')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
                >
                  <option value="">Any / Local Cuisine</option>
                  <option value="vegetarian">Pure Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="jain">Jain Friendly</option>
                  <option value="halal">Halal</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Submit & Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 min-h-[44px] transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{language === 'hi' ? 'रीसेट करें' : 'Clear Form'}</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-2.5 min-h-[44px] transition-all ${
              isLoading
                ? 'bg-teal-400 dark:bg-teal-700 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] shadow-teal-600/25 hover:shadow-teal-600/35'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isLoading ? t('generatingBtn', language) : t('generateBtn', language)}</span>
          </button>
        </div>
      </form>
    </section>
  );
};
