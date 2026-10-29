import React from 'react';
import { Compass, Moon, Sun, Eye, Bookmark, Sparkles, Languages } from 'lucide-react';
import { ThemeMode, TextSizeMode, AppLanguage } from '../types/trip';
import { t } from '../utils/translations';

interface NavbarProps {
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  textSize: TextSizeMode;
  onTextSizeChange: (size: TextSizeMode) => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  savedTripsCount: number;
  onOpenSavedTrips: () => void;
  onNewTrip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onThemeChange,
  textSize,
  onTextSizeChange,
  language,
  onLanguageChange,
  savedTripsCount,
  onOpenSavedTrips,
  onNewTrip,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Skip to Content Accessibility Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        {t('skipToContent', language)}
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNewTrip}
              className="group flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl p-1"
              aria-label="VibeTrip Home - Plan a new trip"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 animate-pulse" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Vibe<span className="text-teal-600 dark:text-teal-400">Trip</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 hidden sm:inline-block">
                    AI Planner
                  </span>
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 hidden md:block">
                  {language === 'hi' ? 'वाइब से बनाएं यथार्थवादी यात्रा' : 'Mood to Realistic Itinerary'}
                </p>
              </div>
            </button>
          </div>

          {/* Controls: Language, Text Size, Theme, My Trips, New Trip */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[44px] min-w-[44px] justify-center transition-colors"
              aria-label={`Switch language. Current: ${language === 'en' ? 'English' : 'हिंदी'}`}
              title="Toggle English / हिंदी"
            >
              <Languages className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Text Size (A- / A / A+) */}
            <div
              className="hidden lg:flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-800/60"
              role="group"
              aria-label="Text size control"
            >
              <button
                type="button"
                onClick={() => onTextSizeChange('sm')}
                className={`px-2 py-1 text-xs font-bold rounded min-h-[44px] min-w-[36px] flex items-center justify-center transition-colors ${
                  textSize === 'sm'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                }`}
                aria-pressed={textSize === 'sm'}
                aria-label="Small font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange('md')}
                className={`px-2 py-1 text-xs font-bold rounded min-h-[44px] min-w-[36px] flex items-center justify-center transition-colors ${
                  textSize === 'md'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                }`}
                aria-pressed={textSize === 'md'}
                aria-label="Standard font size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange('lg')}
                className={`px-2 py-1 text-xs font-bold rounded min-h-[44px] min-w-[36px] flex items-center justify-center transition-colors ${
                  textSize === 'lg'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                }`}
                aria-pressed={textSize === 'lg'}
                aria-label="Large font size"
              >
                A+
              </button>
            </div>

            {/* Theme Toggle: Light / Dark / High-Contrast */}
            <button
              type="button"
              onClick={() => {
                if (theme === 'light') onThemeChange('dark');
                else if (theme === 'dark') onThemeChange('high-contrast');
                else onThemeChange('light');
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 transition-colors"
              aria-label={`Toggle theme. Current theme: ${theme}`}
              title={`Current: ${theme}. Click to switch theme.`}
            >
              {theme === 'light' && <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />}
              {theme === 'dark' && <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />}
              {theme === 'high-contrast' && <Eye className="w-4 h-4 text-yellow-400" aria-hidden="true" />}
              <span className="hidden sm:inline capitalize">
                {theme === 'high-contrast' ? 'High Contrast' : theme}
              </span>
            </button>

            {/* My Trips Button */}
            <button
              type="button"
              onClick={onOpenSavedTrips}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[44px] min-w-[44px] justify-center transition-colors"
              aria-label={`View saved trips. ${savedTripsCount} trips saved.`}
            >
              <Bookmark className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span className="hidden sm:inline">{t('myTrips', language)}</span>
              {savedTripsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-teal-600 rounded-full">
                  {savedTripsCount}
                </span>
              )}
            </button>

            {/* New Trip Button */}
            <button
              type="button"
              onClick={onNewTrip}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm hover:shadow transition-all min-h-[44px] justify-center"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xs:inline">{t('newTrip', language)}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
