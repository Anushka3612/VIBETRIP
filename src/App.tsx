import React, { useState, useEffect, useCallback } from 'react';
import {
  TripItinerary,
  CurrencyCode,
  TravelStyle,
  ThemeMode,
  TextSizeMode,
  AppLanguage,
  StopItem,
  SwapAlternative,
} from './types/trip';
import { Navbar } from './components/Navbar';
import { InputForm, TripFormData } from './components/InputForm';
import { ItineraryView } from './components/ItineraryView';
import { LoadingProgress } from './components/LoadingProgress';
import { ErrorState } from './components/ErrorState';
import { SavedTripsDrawer } from './components/SavedTripsDrawer';
import {
  getSavedTrips,
  saveTrip,
  deleteTrip,
  duplicateTrip,
  getThemePreference,
  saveThemePreference,
  getTextSizePreference,
  saveTextSizePreference,
  getLanguagePreference,
  saveLanguagePreference,
} from './utils/storage';
import { t } from './utils/translations';
import { Sparkles, Mountain, ShieldCheck, Heart } from 'lucide-react';

// Default realistic sample trip so the app is immediately alive and testable
const INITIAL_SAMPLE_TRIP: TripItinerary = {
  id: 'trip_himachal_sample_01',
  createdAt: new Date().toISOString(),
  tripTitle: 'Kasol & Parvati Valley Pine Trail',
  summary:
    'A tranquil 4-day mountain getaway designed for friends, balancing riverside cafes in Kasol, a scenic trek to Tosh village, and relaxation along the Parvati River on a smart budget.',
  destination: 'Himachal Pradesh (Kasol, Tosh, Manikaran)',
  bestTimeNote: 'March to June (pleasant summer flowers) & September to November (crisp mountain views)',
  inferredInputs: {
    days: 4,
    travelers: 2,
    budgetINR: 18000,
    currency: 'INR',
    travelStyle: 'budget',
    transportPref: 'bus',
    startingCity: 'Delhi',
    travelMonth: 'April',
    dietaryPreference: 'any',
  },
  days: [
    {
      dayNumber: 1,
      theme: 'Arrival in Kasol & Riverside Cafe Culture',
      stops: [
        {
          time: '08:30 AM',
          placeName: 'Bhuntar to Kasol Transit',
          description: 'Arrive at Bhuntar via overnight Volvo bus from Delhi. Take a local Himachal Pradesh Roadways bus or shared cab winding through the Parvati gorge.',
          category: 'Transit',
          durationHours: 1.5,
          estimatedCostINR: 150,
          travelFromPrevious: {
            mode: 'Local Bus / Shared Cab',
            hours: 1.5,
            costINR: 150,
            distanceKm: 32,
          },
        },
        {
          time: '11:00 AM',
          placeName: 'Check-in & Parvati River Walk',
          description: 'Settle into a wooden riverside homestay in Old Kasol. Take a mindful stroll across the suspension footbridge watching the glacier-fed rapids.',
          category: 'Relaxation',
          durationHours: 2.5,
          estimatedCostINR: 0,
          travelFromPrevious: {
            mode: 'Walk',
            hours: 0.2,
            costINR: 0,
          },
        },
        {
          time: '03:00 PM',
          placeName: 'Old Kasol Market & Falafel Crawl',
          description: 'Explore the vibrant cedar-scented alleyways, artisan handicraft stalls, and try authentic Israeli shakshuka and fresh mint tea.',
          category: 'Food',
          durationHours: 2.5,
          estimatedCostINR: 400,
        },
        {
          time: '07:00 PM',
          placeName: 'Acoustic Riverside Jam Session',
          description: 'Unwind at an open-air cafe with bonfires, chill ambient music, and mountain hospitality.',
          category: 'Relaxation',
          durationHours: 2.0,
          estimatedCostINR: 350,
        },
      ],
      meals: [
        { mealType: 'Breakfast', recommendation: 'Fresh parathas and ginger lemon tea near Kasol bridge', estimatedCostINR: 120 },
        { mealType: 'Lunch', recommendation: 'Hummus, pita & falafel platter at evergreen cafe', estimatedCostINR: 350 },
        { mealType: 'Dinner', recommendation: 'Himachali Siddu with ghee & lentil soup', estimatedCostINR: 250 },
      ],
      stayRecommendation: {
        type: 'Riverside Wooden Homestay / Hostel',
        areaName: 'Old Kasol or Chalal trail',
        hotelOrHostelSuggestion: 'Parvati Valley Backpackers Inn',
        costPerNightINR: 1200,
      },
    },
    {
      dayNumber: 2,
      theme: 'Chalal Pine Forest Walk & Manikaran Hot Springs',
      stops: [
        {
          time: '09:00 AM',
          placeName: 'Chalal Village Pine Trail',
          description: 'Cross the hanging cable bridge and walk through ancient deodar and pine groves along the river to the peaceful hamlet of Chalal.',
          category: 'Nature',
          durationHours: 3.0,
          estimatedCostINR: 0,
        },
        {
          time: '01:30 PM',
          placeName: 'Manikaran Sahib Gurudwara & Thermal Springs',
          description: 'Take a short local bus up to Manikaran. Visit the historic Gurudwara nestled under steep granite cliffs, famous for natural healing sulfur hot springs.',
          category: 'Culture',
          durationHours: 3.0,
          estimatedCostINR: 80,
          travelFromPrevious: {
            mode: 'Local Bus',
            hours: 0.4,
            costINR: 40,
            distanceKm: 5,
          },
        },
        {
          time: '06:00 PM',
          placeName: 'Sunset viewpoint overlooking Parvati Valley',
          description: 'Golden hour photo session watching the peaks catch the last alpine glow before returning to Kasol.',
          category: 'Sightseeing',
          durationHours: 1.5,
          estimatedCostINR: 0,
        },
      ],
      meals: [
        { mealType: 'Breakfast', recommendation: 'Muesli bowl with fresh mountain apples and honey', estimatedCostINR: 150 },
        { mealType: 'Lunch', recommendation: 'Blessed Langar meal at Manikaran Sahib (community kitchen)', estimatedCostINR: 0 },
        { mealType: 'Dinner', recommendation: 'Wood-fired thin crust pizza & apple crumble', estimatedCostINR: 400 },
      ],
      stayRecommendation: {
        type: 'Riverside Wooden Homestay',
        areaName: 'Old Kasol',
        hotelOrHostelSuggestion: 'Parvati Valley Backpackers Inn',
        costPerNightINR: 1200,
      },
    },
    {
      dayNumber: 3,
      theme: 'Scenic Hike to Tosh Village & Glacier Views',
      stops: [
        {
          time: '08:30 AM',
          placeName: 'Drive to Barshaini Dam',
          description: 'Shared taxi through the gorge up to Barshaini, the trailhead for Tosh and Kheerganga.',
          category: 'Transit',
          durationHours: 1.2,
          estimatedCostINR: 200,
          travelFromPrevious: {
            mode: 'Shared Cab',
            hours: 1.2,
            costINR: 200,
            distanceKm: 18,
          },
        },
        {
          time: '10:30 AM',
          placeName: 'Hike up to Tosh Village (2,400m)',
          description: 'Pleasant 45-minute uphill trail through apple orchards, wooden footbridges, and mountain streams leading to the cliffside village of Tosh.',
          category: 'Adventure',
          durationHours: 2.0,
          estimatedCostINR: 0,
        },
        {
          time: '01:30 PM',
          placeName: 'Tosh Waterfall & Glacier Viewpoint',
          description: 'Walk past the village outskirts towards the roaring glacier waterfall with panoramic vistas of the Tosh glacier and snow-capped peaks.',
          category: 'Nature',
          durationHours: 3.0,
          estimatedCostINR: 0,
        },
        {
          time: '06:00 PM',
          placeName: 'Rooftop Cafe Sunset in Tosh',
          description: 'Sit back on floor cushions with hot chocolate and cinnamon rolls as the stars appear over the mountain silhouettes.',
          category: 'Relaxation',
          durationHours: 2.5,
          estimatedCostINR: 300,
        },
      ],
      meals: [
        { mealType: 'Breakfast', recommendation: 'Oatmeal & ginger tea at Barshaini trailhead', estimatedCostINR: 100 },
        { mealType: 'Lunch', recommendation: 'Hot Thukpa and steamed momos in Tosh', estimatedCostINR: 200 },
        { mealType: 'Dinner', recommendation: 'Spiced hot chocolate and local trout / dal bhat', estimatedCostINR: 350 },
      ],
      stayRecommendation: {
        type: 'Cliffside Wooden Guesthouse',
        areaName: 'Upper Tosh',
        hotelOrHostelSuggestion: 'Tosh Alpine Haven',
        costPerNightINR: 1100,
      },
    },
    {
      dayNumber: 4,
      theme: 'Apple Orchards, Souvenirs & Return via Kullu Valley',
      stops: [
        {
          time: '08:30 AM',
          placeName: 'Morning Mist Walk in Tosh Orchards',
          description: 'Breathe in crisp mountain air and take in morning sun on the glacier before walking down to Barshaini.',
          category: 'Nature',
          durationHours: 2.0,
          estimatedCostINR: 0,
        },
        {
          time: '11:30 AM',
          placeName: 'Return to Kasol for Souvenirs & Kullu Shawls',
          description: 'Pick up local cedar honey, handmade woolens, Himachal tea, and wooden carvings.',
          category: 'Culture',
          durationHours: 2.5,
          estimatedCostINR: 500,
          travelFromPrevious: {
            mode: 'Shared Cab to Kasol',
            hours: 1.0,
            costINR: 200,
            distanceKm: 18,
          },
        },
        {
          time: '04:00 PM',
          placeName: 'Bhuntar Departure Hub',
          description: 'Head to Bhuntar bus stand for the evening overnight AC Volvo bus journey back towards home.',
          category: 'Transit',
          durationHours: 1.5,
          estimatedCostINR: 150,
          travelFromPrevious: {
            mode: 'Local Bus',
            hours: 1.5,
            costINR: 150,
          },
        },
      ],
      meals: [
        { mealType: 'Breakfast', recommendation: 'Pancakes and black coffee at Tosh cafe', estimatedCostINR: 150 },
        { mealType: 'Lunch', recommendation: 'Traditional North Indian thali at Kasol main market', estimatedCostINR: 220 },
        { mealType: 'Dinner', recommendation: 'Dhaba dinner at Bilaspur transit stop', estimatedCostINR: 200 },
      ],
      stayRecommendation: {
        type: 'Overnight Volvo Coach (Delhi/Chandigarh return)',
        areaName: 'Transit',
        costPerNightINR: 0,
      },
    },
  ],
  budget: {
    transport: 4200,
    stay: 3500,
    food: 4600,
    activities: 1600,
    miscellaneous: 1500,
    total: 15400,
    perPerson: 7700,
    requestedBudgetGapNote: 'The estimated budget of ₹15,400 is well within your ₹18,000 threshold, leaving a healthy ₹2,600 buffer for emergency cab rides or shopping.',
  },
  packingList: [
    {
      category: 'Clothing & Warm Layers',
      items: [
        'Windproof & water-resistant fleece jacket',
        'Thermal base layer (top & bottom)',
        'Quick-dry trekking trousers',
        'Woolen beanie, neck gaiter & gloves',
        'Sturdy broken-in trekking shoes with good grip',
        'Woolen socks (3 pairs)',
      ],
    },
    {
      category: 'Medicine & First Aid',
      items: [
        'Motion sickness tablets (Avomine for winding ghat roads)',
        'Paracetamol, Band-Aids & antiseptic cream',
        'Electrolyte sachets (ORS/Electral)',
        'Pain relief spray (Volini)',
      ],
    },
    {
      category: 'Tech & Documents',
      items: [
        'Government Photo ID (Aadhar/Passport) with photocopies',
        'Power bank (20,000 mAh - mountain power cuts happen)',
        'Sufficient physical cash (ATMs in Kasol/Tosh often run dry)',
        'Universal waterproof pouch for phone',
      ],
    },
    {
      category: 'Toiletries & Essentials',
      items: [
        'High SPF Sunscreen (SPF 50+) & UV Sunglasses',
        'Lip balm with SPF',
        'Reusable water bottle with filtration',
        'Quick-dry microfiber towel',
      ],
    },
  ],
  checkedPackingItems: {},
  safetyAndPermitNotes: [
    'Parvati River Safety: NEVER step onto wet boulders near the river. Water levels fluctuate unpredictably due to upstream dams and sudden melting.',
    'Cash Warning: Carry sufficient cash from Delhi/Chandigarh or Bhuntar. Kasol ATMs are notorious for running out of cash or network downtime.',
    'Monsoon Landslides: If traveling between July and August, mountain roads are prone to sudden rockfalls. Autumn (Sep-Nov) and Spring (Mar-Jun) are ideal.',
    'Permits: No special permit required for Kasol, Manikaran, or Tosh for Indian nationals. Foreigners must register C-form at designated police check-posts.',
  ],
  warnings: [
    'Keep your schedule flexible around Bhuntar during peak weekend traffic.',
  ],
};

export default function App() {
  const [currentTrip, setCurrentTrip] = useState<TripItinerary | null>(INITIAL_SAMPLE_TRIP);
  const [history, setHistory] = useState<TripItinerary[]>([INITIAL_SAMPLE_TRIP]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // App settings
  const [theme, setTheme] = useState<ThemeMode>(getThemePreference());
  const [textSize, setTextSize] = useState<TextSizeMode>(getTextSizePreference());
  const [language, setLanguage] = useState<AppLanguage>(getLanguagePreference());
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Saved trips
  const [savedTrips, setSavedTrips] = useState<TripItinerary[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Swap Stop Modal State
  const [swapModalState, setSwapModalState] = useState<{
    isOpen: boolean;
    dayNumber: number;
    currentStop: StopItem | null;
    alternatives: SwapAlternative[];
    isLoading: boolean;
  }>({
    isOpen: false,
    dayNumber: 1,
    currentStop: null,
    alternatives: [],
    isLoading: false,
  });

  // Compare State
  const [compareState, setCompareState] = useState<{
    isOpen: boolean;
    variantTrip: TripItinerary | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    variantTrip: null,
    isLoading: false,
  });

  // Apply Theme & Text Size to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-high-contrast');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('dark', 'theme-high-contrast');
    }

    saveThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    root.classList.add(`font-size-${textSize}`);
    saveTextSizePreference(textSize);
  }, [textSize]);

  useEffect(() => {
    saveLanguagePreference(language);
  }, [language]);

  // Load saved trips on mount
  useEffect(() => {
    const stored = getSavedTrips();
    setSavedTrips(stored);
  }, []);

  // Push to history for undo/redo
  const pushToHistory = useCallback(
    (newTrip: TripItinerary) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(newTrip);
        return next;
      });
      setHistoryIndex((prev) => prev + 1);
      setCurrentTrip(newTrip);
    },
    [historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentTrip(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentTrip(history[newIdx]);
    }
  };

  // Keyboard shortcut listener: Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Handle Initial Trip Generation
  const handleGenerateTrip = async (formData: TripFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/trip/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate itinerary. Please try again.');
      }

      const generated: TripItinerary = data.trip;
      generated.userVibe = formData.vibe;
      pushToHistory(generated);
      setCurrency(formData.currency || 'INR');

      // Scroll smoothly to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err?.message || 'Something went wrong while planning your trip.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Conversational Refinement
  const handleRefineChat = async (refinementPrompt: string) => {
    if (!currentTrip) return;
    setIsRefining(true);
    setError(null);

    try {
      const res = await fetch('/api/trip/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrip,
          refinementPrompt,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to refine trip.');
      }

      pushToHistory(data.trip);
    } catch (err: any) {
      console.error('Refinement error:', err);
      setError(err?.message || 'Unable to update trip. Please try a different request.');
    } finally {
      setIsRefining(false);
    }
  };

  // Handle Pace & Style Tweaks
  const handleApplyTweaks = async (tweaks: { pace: 'relaxed' | 'balanced' | 'packed'; travelStyle: TravelStyle }) => {
    const prompt = `Adjust itinerary pace to ${tweaks.pace.toUpperCase()} and travel style to ${tweaks.travelStyle.toUpperCase()}. Rebalance daily travel times and activities accordingly.`;
    await handleRefineChat(prompt);
  };

  // Handle Single Day Regeneration
  const handleRegenerateDay = async (dayNumber: number) => {
    if (!currentTrip) return;
    setIsRefining(true);
    setError(null);

    try {
      const res = await fetch('/api/trip/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrip,
          dayNumber,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to regenerate day ${dayNumber}`);
      }

      pushToHistory(data.trip);
    } catch (err: any) {
      console.error('Day regen error:', err);
      setError(err?.message || 'Failed to regenerate day.');
    } finally {
      setIsRefining(false);
    }
  };

  // Handle Swap Stop Opening
  const handleOpenSwapStop = async (dayNumber: number, stop: StopItem) => {
    if (!currentTrip) return;
    setSwapModalState({
      isOpen: true,
      dayNumber,
      currentStop: stop,
      alternatives: [],
      isLoading: true,
    });

    try {
      const day = currentTrip.days.find((d) => d.dayNumber === dayNumber);
      const res = await fetch('/api/trip/swap-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: currentTrip.destination,
          stop,
          dayTheme: day?.theme || '',
          travelStyle: currentTrip.inferredInputs?.travelStyle || 'comfort',
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to suggest alternatives.');
      }

      setSwapModalState((prev) => ({
        ...prev,
        alternatives: data.alternatives || [],
        isLoading: false,
      }));
    } catch (err) {
      console.error('Swap stop fetch error:', err);
      setSwapModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Confirm Swap Stop
  const handleConfirmSwapStop = (alt: SwapAlternative) => {
    if (!currentTrip || !swapModalState.currentStop) return;

    const clonedTrip: TripItinerary = JSON.parse(JSON.stringify(currentTrip));
    const day = clonedTrip.days.find((d) => d.dayNumber === swapModalState.dayNumber);

    if (day) {
      const stopIndex = day.stops.findIndex(
        (s) => s.placeName === swapModalState.currentStop?.placeName
      );

      if (stopIndex !== -1) {
        day.stops[stopIndex] = {
          ...day.stops[stopIndex],
          placeName: alt.placeName,
          category: alt.category,
          description: alt.description,
          durationHours: alt.durationHours,
          estimatedCostINR: alt.estimatedCostINR,
        };

        // Recalculate activities cost and total
        let totalAct = 0;
        clonedTrip.days.forEach((d) => {
          d.stops.forEach((s) => (totalAct += s.estimatedCostINR || 0));
        });
        clonedTrip.budget.activities = Math.round(totalAct);
        clonedTrip.budget.total = Math.round(
          (clonedTrip.budget.transport || 0) +
            (clonedTrip.budget.stay || 0) +
            (clonedTrip.budget.food || 0) +
            clonedTrip.budget.activities +
            (clonedTrip.budget.miscellaneous || 0)
        );
        clonedTrip.budget.perPerson = Math.round(
          clonedTrip.budget.total / Math.max(1, clonedTrip.inferredInputs?.travelers || 1)
        );

        pushToHistory(clonedTrip);
      }
    }

    setSwapModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Compare mode: generate variant
  const handleGenerateCompareVariant = async (targetStyle: TravelStyle) => {
    if (!currentTrip) return;
    setCompareState((prev) => ({ ...prev, isLoading: true }));

    try {
      const res = await fetch('/api/trip/compare-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrip,
          targetStyle,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate comparison variant.');
      }

      setCompareState((prev) => ({
        ...prev,
        variantTrip: data.variantTrip,
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('Compare generation error:', err);
      setCompareState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Save Trip to LocalStorage
  const handleSaveCurrentTrip = (tripToSave: TripItinerary) => {
    saveTrip(tripToSave);
    setSavedTrips(getSavedTrips());
  };

  // Delete Trip from LocalStorage
  const handleDeleteSavedTrip = (tripId: string) => {
    const updated = deleteTrip(tripId);
    setSavedTrips(updated);
  };

  // Duplicate Trip
  const handleDuplicateSavedTrip = (tripId: string) => {
    const copy = duplicateTrip(tripId);
    if (copy) {
      setSavedTrips(getSavedTrips());
    }
  };

  // Rename Trip
  const handleRenameSavedTrip = (tripId: string, newTitle: string) => {
    const list = getSavedTrips();
    const target = list.find((t) => t.id === tripId);
    if (target) {
      target.tripTitle = newTitle;
      saveTrip(target);
      setSavedTrips(getSavedTrips());
      if (currentTrip && currentTrip.id === tripId) {
        setCurrentTrip({ ...currentTrip, tripTitle: newTitle });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        theme={theme}
        onThemeChange={setTheme}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        language={language}
        onLanguageChange={setLanguage}
        savedTripsCount={savedTrips.length}
        onOpenSavedTrips={() => setIsSavedDrawerOpen(true)}
        onNewTrip={() => {
          const formEl = document.getElementById('planner-form');
          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* Input Form Section */}
        <div id="planner-form">
          <InputForm
            onSubmit={handleGenerateTrip}
            isLoading={isLoading}
            language={language}
          />
        </div>

        {/* Loading Progress State */}
        {isLoading && <LoadingProgress language={language} />}

        {/* Error Notification */}
        {error && (
          <ErrorState
            message={error}
            onRetry={() => setError(null)}
            language={language}
          />
        )}

        {/* Itinerary Results Section */}
        {currentTrip && !isLoading && (
          <div id="results-section">
            <ItineraryView
              trip={currentTrip}
              onUpdateTrip={(updated) => pushToHistory(updated)}
              onSaveTrip={handleSaveCurrentTrip}
              onRefineChat={handleRefineChat}
              onApplyTweaks={handleApplyTweaks}
              onRegenerateDay={handleRegenerateDay}
              onSwapStop={handleOpenSwapStop}
              isRefining={isRefining}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              currency={currency}
              onCurrencyChange={setCurrency}
              language={language}
              swapModalState={swapModalState}
              onCloseSwapModal={() =>
                setSwapModalState((prev) => ({ ...prev, isOpen: false }))
              }
              onConfirmSwapStop={handleConfirmSwapStop}
              compareState={compareState}
              onOpenCompare={() =>
                setCompareState((prev) => ({ ...prev, isOpen: true }))
              }
              onCloseCompare={() =>
                setCompareState((prev) => ({ ...prev, isOpen: false }))
              }
              onGenerateCompareVariant={handleGenerateCompareVariant}
              onSelectCompareVariant={(selected) => {
                pushToHistory(selected);
                setCompareState((prev) => ({ ...prev, isOpen: false }));
              }}
            />
          </div>
        )}
      </main>

      {/* Saved Trips Drawer */}
      <SavedTripsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedTrips={savedTrips}
        activeTripId={currentTrip?.id || ''}
        onSelectTrip={(t) => {
          pushToHistory(t);
          setIsSavedDrawerOpen(false);
        }}
        onDeleteTrip={handleDeleteSavedTrip}
        onDuplicateTrip={handleDuplicateSavedTrip}
        onRenameTrip={handleRenameSavedTrip}
        currency={currency}
        language={language}
      />

      {/* Footer Landmark & Mandatory Travel Disclaimer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Mountain className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <span>VibeTrip AI Trip Planner</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" aria-hidden="true" /> for wanderers
            </span>
          </div>

          {/* Mandatory Disclaimer */}
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('disclaimer', language)}
          </p>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            WCAG 2.2 AA Compliant • Supports Speech Recognition & Synthesis • Offline LocalStorage
          </p>
        </div>
      </footer>
    </div>
  );
}
