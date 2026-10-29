import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ShieldX } from 'lucide-react';
import { AppLanguage } from '../types/trip';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  language: AppLanguage;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, language }) => {
  const isOffline = !navigator.onLine || message.toLowerCase().includes('network') || message.toLowerCase().includes('offline');
  const isRateLimit = message.toLowerCase().includes('rate') || message.toLowerCase().includes('429');

  return (
    <div
      className="max-w-xl mx-auto my-8 bg-rose-50/80 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 sm:p-8 text-center shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
        {isOffline ? (
          <WifiOff className="w-7 h-7" aria-hidden="true" />
        ) : isRateLimit ? (
          <ShieldX className="w-7 h-7" aria-hidden="true" />
        ) : (
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-rose-900 dark:text-rose-200 mb-2">
        {isOffline
          ? language === 'hi'
            ? 'इंटरनेट कनेक्शन नहीं है'
            : 'You appear to be offline'
          : isRateLimit
          ? language === 'hi'
            ? 'अनुरोध सीमा पार हो गई'
            : 'Service temporarily busy'
          : language === 'hi'
          ? 'ट्रिप प्लान बनाने में समस्या आई'
          : 'Unable to Plan Trip'}
      </h3>

      <p className="text-sm text-rose-700 dark:text-rose-300 mb-6 max-w-md mx-auto">
        {message ||
          (language === 'hi'
            ? 'कृपया अपना इंटरनेट चेक करें या थोड़ी देर बाद पुनः प्रयास करें।'
            : 'Please verify your internet connection or try refining your vibe description.')}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-md transition-all min-h-[44px]"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}</span>
      </button>
    </div>
  );
};
