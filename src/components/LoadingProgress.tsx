import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, MapPin, DollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AppLanguage } from '../types/trip';

interface LoadingProgressProps {
  language: AppLanguage;
}

const STEPS_EN = [
  { text: 'Analyzing your travel mood, vibe & companions...', icon: Compass },
  { text: 'Finding scenic mountain passes, coastal routes & realistic travel times...', icon: MapPin },
  { text: 'Selecting authentic local stays, dhabas & handpicked activities...', icon: Sparkles },
  { text: 'Verifying seasonal road status, landslides, snow & permit requirements...', icon: ShieldAlert },
  { text: 'Finalizing day-by-day budget split & customized packing checklist...', icon: DollarSign },
];

const STEPS_HI = [
  { text: 'आपकी यात्रा के मूड, वाइब और साथियों का विश्लेषण किया जा रहा है...', icon: Compass },
  { text: 'प्राकृतिक रास्तों, खूबसूरत मोड़ों और यथार्थवादी यात्रा समय की गणना...', icon: MapPin },
  { text: 'स्थानीय होमस्टे, ढाबों और रोमांचक गतिविधियों का चयन...', icon: Sparkles },
  { text: 'मौसमी सड़कों, बर्फबारी, लैंडस्लाइड और परमिट नियमों की पुष्टि...', icon: ShieldAlert },
  { text: 'प्रति-दिन बजट और आवश्यक पैकिंग सूची तैयार की जा रही है...', icon: DollarSign },
];

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ language }) => {
  const steps = language === 'hi' ? STEPS_HI : STEPS_EN;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-lg text-center max-w-2xl mx-auto my-8"
      role="status"
      aria-live="polite"
    >
      {/* Animated Spinner Icon */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100 dark:border-teal-950/80 animate-ping opacity-25"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-600 border-r-transparent border-b-emerald-600 border-l-transparent animate-spin"></div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
          <Compass className="w-6 h-6 animate-pulse" aria-hidden="true" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
        {language === 'hi' ? 'आपकी आदर्श यात्रा तैयार हो रही है' : 'Crafting Your Tailored Itinerary'}
      </h3>
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-8 max-w-md mx-auto">
        {language === 'hi'
          ? 'हम यथार्थवादी यात्रा समय, सही बजट और मौसम की स्थिति का मिलान कर रहे हैं।'
          : 'Gemini is planning realistic travel times, verified seasonal advice, and honest budget estimates.'}
      </p>

      {/* Step Indicators */}
      <div className="space-y-3.5 text-left max-w-lg mx-auto mb-8">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const IconComponent = step.icon;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 shadow-sm'
                  : isDone
                  ? 'opacity-80'
                  : 'opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'bg-teal-600 text-white animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <IconComponent className="w-4 h-4" aria-hidden="true" />
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  isCurrent
                    ? 'text-teal-950 dark:text-teal-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {step.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Accessible Skeleton Placeholder */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60" aria-hidden="true">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mx-auto animate-pulse"></div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-full w-1/2 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
};
