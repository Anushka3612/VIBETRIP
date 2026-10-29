import React, { useState, useEffect } from 'react';
import { X, Bookmark, Trash2, Copy, Edit2, Check, Calendar, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { TripItinerary, CurrencyCode, AppLanguage } from '../types/trip';
import { formatCurrency } from '../utils/currency';
import { t } from '../utils/translations';

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: TripItinerary[];
  activeTripId: string;
  onSelectTrip: (trip: TripItinerary) => void;
  onDeleteTrip: (tripId: string) => void;
  onDuplicateTrip: (tripId: string) => void;
  onRenameTrip: (tripId: string, newTitle: string) => void;
  currency: CurrencyCode;
  language: AppLanguage;
}

export const SavedTripsDrawer: React.FC<SavedTripsDrawerProps> = ({
  isOpen,
  onClose,
  savedTrips,
  activeTripId,
  onSelectTrip,
  onDeleteTrip,
  onDuplicateTrip,
  onRenameTrip,
  currency,
  language,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const startRename = (trip: TripItinerary) => {
    setEditingId(trip.id);
    setEditTitle(trip.tripTitle);
  };

  const saveRename = (tripId: string) => {
    if (editTitle.trim()) {
      onRenameTrip(tripId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-trips-title"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 id="saved-trips-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t('myTrips', language)} ({savedTrips.length})
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'आपके डिवाइस पर सहेजे गए ट्रिप' : 'Locally stored itineraries'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close saved trips drawer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Trips List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedTrips.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                {language === 'hi' ? 'कोई ट्रिप सहेजा नहीं गया है' : 'No saved trips yet'}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {language === 'hi'
                  ? 'अपनी पसंदीदा योजनाएं सहेजने के लिए "Save Trip" पर क्लिक करें।'
                  : 'Click "Save Trip" on any generated itinerary to access it later.'}
              </p>
            </div>
          ) : (
            savedTrips.map((trip) => {
              const isActive = trip.id === activeTripId;

              return (
                <div
                  key={trip.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {editingId === trip.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs sm:text-sm font-bold rounded-lg border border-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveRename(trip.id)}
                          className="p-1.5 rounded-lg bg-teal-600 text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="Confirm rename"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {trip.tripTitle}
                          </h4>
                          {isActive && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-teal-600" aria-hidden="true" />
                            {trip.destination}
                          </span>
                          <span>• {trip.days?.length || 0} days</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Est. {formatCurrency(trip.budget?.total || 0, currency)}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTrip(trip);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 min-h-[36px]"
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isActive ? 'Viewing' : 'Open'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startRename(trip)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label={`Rename ${trip.tripTitle}`}
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateTrip(trip.id)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label={`Duplicate ${trip.tripTitle}`}
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label={`Delete ${trip.tripTitle}`}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
