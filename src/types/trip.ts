export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type TravelStyle = 'budget' | 'comfort' | 'luxury';

export type TransportPreference = 'bus' | 'train' | 'car' | 'bike' | 'flight' | 'any';

export type DietaryPreference = 'any' | 'vegetarian' | 'vegan' | 'non-veg' | 'jain' | 'halal';

export interface TravelFromPrevious {
  mode: string;
  hours: number;
  costINR: number;
  distanceKm?: number;
}

export interface StopItem {
  id?: string;
  time: string;
  placeName: string;
  description: string;
  category: string;
  durationHours: number;
  estimatedCostINR: number;
  travelFromPrevious?: TravelFromPrevious;
}

export interface MealItem {
  mealType: string;
  recommendation: string;
  estimatedCostINR: number;
}

export interface StayRecommendation {
  type: string;
  areaName: string;
  hotelOrHostelSuggestion?: string;
  costPerNightINR: number;
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  stops: StopItem[];
  meals: MealItem[];
  stayRecommendation: StayRecommendation;
}

export interface BudgetBreakdown {
  transport: number;
  stay: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
  perPerson: number;
  requestedBudgetGapNote?: string;
}

export interface PackingCategory {
  category: string;
  items: string[];
}

export interface InferredInputs {
  days: number;
  travelers: number;
  budgetINR: number;
  currency?: CurrencyCode;
  travelStyle: TravelStyle;
  transportPref: string;
  startingCity?: string;
  travelMonth?: string;
  dietaryPreference?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TripItinerary {
  id: string;
  createdAt: string;
  updatedAt?: string;
  tripTitle: string;
  summary: string;
  destination: string;
  bestTimeNote: string;
  inferredInputs: InferredInputs;
  days: DayPlan[];
  budget: BudgetBreakdown;
  packingList: PackingCategory[];
  checkedPackingItems?: Record<string, boolean>;
  safetyAndPermitNotes: string[];
  warnings: string[];
  groundingSources?: GroundingSource[];
  userVibe?: string;
}

export interface SwapAlternative {
  placeName: string;
  category: string;
  description: string;
  durationHours: number;
  estimatedCostINR: number;
  whyBetter: string;
}

export type ThemeMode = 'light' | 'dark' | 'high-contrast';
export type TextSizeMode = 'sm' | 'md' | 'lg';
export type AppLanguage = 'en' | 'hi';
