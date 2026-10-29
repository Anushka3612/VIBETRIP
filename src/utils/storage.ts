import { TripItinerary, ThemeMode, TextSizeMode, AppLanguage } from '../types/trip';

const STORAGE_KEYS = {
  SAVED_TRIPS: 'vibetrip_saved_trips_v1',
  ACTIVE_TRIP_ID: 'vibetrip_active_trip_id_v1',
  THEME: 'vibetrip_theme_v1',
  TEXT_SIZE: 'vibetrip_text_size_v1',
  LANGUAGE: 'vibetrip_lang_v1',
  REDUCED_MOTION: 'vibetrip_reduced_motion_v1',
};

export function getSavedTrips(): TripItinerary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_TRIPS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading saved trips:', err);
    return [];
  }
}

export function saveTrip(trip: TripItinerary): void {
  try {
    const trips = getSavedTrips();
    const existingIndex = trips.findIndex((t) => t.id === trip.id);
    if (existingIndex >= 0) {
      trips[existingIndex] = trip;
    } else {
      trips.unshift(trip);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, trip.id);
  } catch (err) {
    console.error('Error saving trip:', err);
  }
}

export function deleteTrip(tripId: string): TripItinerary[] {
  try {
    const trips = getSavedTrips().filter((t) => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
    return trips;
  } catch (err) {
    console.error('Error deleting trip:', err);
    return [];
  }
}

export function duplicateTrip(tripId: string): TripItinerary | null {
  try {
    const trips = getSavedTrips();
    const target = trips.find((t) => t.id === tripId);
    if (!target) return null;
    const copy: TripItinerary = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'trip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      tripTitle: `${target.tripTitle} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    trips.unshift(copy);
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
    return copy;
  } catch (err) {
    console.error('Error duplicating trip:', err);
    return null;
  }
}

export function getThemePreference(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    if (stored && ['light', 'dark', 'high-contrast'].includes(stored)) return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, mode);
  } catch {}
}

export function getTextSizePreference(): TextSizeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TEXT_SIZE) as TextSizeMode;
    if (stored && ['sm', 'md', 'lg'].includes(stored)) return stored;
    return 'md';
  } catch {
    return 'md';
  }
}

export function saveTextSizePreference(size: TextSizeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size);
  } catch {}
}

export function getLanguagePreference(): AppLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as AppLanguage;
    if (stored && ['en', 'hi'].includes(stored)) return stored;
    return 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguagePreference(lang: AppLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch {}
}

// Export formatting helpers
export function formatItineraryAsPlainText(trip: TripItinerary): string {
  const lines: string[] = [];
  lines.push(`=========================================`);
  lines.push(`🌍 ${trip.tripTitle}`);
  lines.push(`Destination: ${trip.destination}`);
  lines.push(`Summary: ${trip.summary}`);
  lines.push(`Best Season: ${trip.bestTimeNote}`);
  lines.push(`Travelers: ${trip.inferredInputs?.travelers || 1} | Style: ${trip.inferredInputs?.travelStyle || 'comfort'}`);
  lines.push(`=========================================\n`);

  lines.push(`💰 ESTIMATED BUDGET:`);
  lines.push(`- Transport: ₹${trip.budget?.transport?.toLocaleString('en-IN')}`);
  lines.push(`- Accommodation: ₹${trip.budget?.stay?.toLocaleString('en-IN')}`);
  lines.push(`- Food: ₹${trip.budget?.food?.toLocaleString('en-IN')}`);
  lines.push(`- Activities & Entry: ₹${trip.budget?.activities?.toLocaleString('en-IN')}`);
  lines.push(`- Miscellaneous: ₹${trip.budget?.miscellaneous?.toLocaleString('en-IN')}`);
  lines.push(`- TOTAL: ₹${trip.budget?.total?.toLocaleString('en-IN')} (₹${trip.budget?.perPerson?.toLocaleString('en-IN')} per person)\n`);

  if (trip.warnings?.length) {
    lines.push(`⚠️ BUDGET & PLANNING NOTES:`);
    trip.warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push(``);
  }

  if (trip.safetyAndPermitNotes?.length) {
    lines.push(`🛡️ SAFETY & PERMIT REQUIREMENTS:`);
    trip.safetyAndPermitNotes.forEach((s) => lines.push(`- ${s}`));
    lines.push(``);
  }

  lines.push(`📅 DAY-BY-DAY ITINERARY:`);
  trip.days.forEach((day) => {
    lines.push(`\n-----------------------------------------`);
    lines.push(`DAY ${day.dayNumber}: ${day.theme}`);
    lines.push(`-----------------------------------------`);
    
    day.stops.forEach((stop, idx) => {
      lines.push(`${stop.time} - ${stop.placeName} (${stop.category}, ~${stop.durationHours}h)`);
      lines.push(`  Details: ${stop.description}`);
      if (stop.estimatedCostINR > 0) {
        lines.push(`  Est. Cost: ₹${stop.estimatedCostINR.toLocaleString('en-IN')}`);
      }
      if (stop.travelFromPrevious && idx > 0) {
        lines.push(`  Transit from previous: ${stop.travelFromPrevious.mode} (~${stop.travelFromPrevious.hours}h, ₹${stop.travelFromPrevious.costINR})`);
      }
    });

    if (day.meals?.length) {
      lines.push(`Meals:`);
      day.meals.forEach((m) => {
        lines.push(`  • ${m.mealType}: ${m.recommendation} (approx ₹${m.estimatedCostINR})`);
      });
    }

    if (day.stayRecommendation) {
      lines.push(`Stay Recommendation: ${day.stayRecommendation.type} in ${day.stayRecommendation.areaName} (${day.stayRecommendation.hotelOrHostelSuggestion || ''} - ~₹${day.stayRecommendation.costPerNightINR}/night)`);
    }
  });

  lines.push(`\n=========================================`);
  lines.push(`Generated by VibeTrip AI Trip Planner`);
  lines.push(`Disclaimer: Timings and costs are estimates. Verify current weather, permits & road conditions.`);
  return lines.join('\n');
}

export function downloadItineraryAsJSON(trip: TripItinerary): void {
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VibeTrip_${trip.destination.replace(/[^a-zA-Z0-9]/g, '_')}_${trip.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
