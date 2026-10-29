import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-3.8-flash';

const tripResponseSchema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    destination: { type: Type.STRING },
    bestTimeNote: { type: Type.STRING },
    inferredInputs: {
      type: Type.OBJECT,
      properties: {
        days: { type: Type.INTEGER },
        travelers: { type: Type.INTEGER },
        budgetINR: { type: Type.NUMBER },
        travelStyle: { type: Type.STRING },
        transportPref: { type: Type.STRING },
        startingCity: { type: Type.STRING },
        travelMonth: { type: Type.STRING },
        dietaryPreference: { type: Type.STRING },
      },
      required: ['days', 'travelers', 'budgetINR', 'travelStyle', 'transportPref'],
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          stops: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                placeName: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                durationHours: { type: Type.NUMBER },
                estimatedCostINR: { type: Type.NUMBER },
                travelFromPrevious: {
                  type: Type.OBJECT,
                  properties: {
                    mode: { type: Type.STRING },
                    hours: { type: Type.NUMBER },
                    costINR: { type: Type.NUMBER },
                    distanceKm: { type: Type.NUMBER },
                  },
                  required: ['mode', 'hours', 'costINR'],
                },
              },
              required: ['time', 'placeName', 'description', 'category', 'durationHours', 'estimatedCostINR'],
            },
          },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mealType: { type: Type.STRING },
                recommendation: { type: Type.STRING },
                estimatedCostINR: { type: Type.NUMBER },
              },
              required: ['mealType', 'recommendation', 'estimatedCostINR'],
            },
          },
          stayRecommendation: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              areaName: { type: Type.STRING },
              hotelOrHostelSuggestion: { type: Type.STRING },
              costPerNightINR: { type: Type.NUMBER },
            },
            required: ['type', 'areaName', 'costPerNightINR'],
          },
        },
        required: ['dayNumber', 'theme', 'stops', 'meals', 'stayRecommendation'],
      },
    },
    budget: {
      type: Type.OBJECT,
      properties: {
        transport: { type: Type.NUMBER },
        stay: { type: Type.NUMBER },
        food: { type: Type.NUMBER },
        activities: { type: Type.NUMBER },
        miscellaneous: { type: Type.NUMBER },
        total: { type: Type.NUMBER },
        perPerson: { type: Type.NUMBER },
        requestedBudgetGapNote: { type: Type.STRING },
      },
      required: ['transport', 'stay', 'food', 'activities', 'miscellaneous', 'total', 'perPerson'],
    },
    packingList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['category', 'items'],
      },
    },
    safetyAndPermitNotes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['tripTitle', 'summary', 'destination', 'bestTimeNote', 'days', 'budget', 'packingList', 'safetyAndPermitNotes', 'warnings'],
};

// Safe JSON parser with repair for escaped markdown or edge formatting
function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Generate with primary model, fallback model, and retry
async function generateStructuredTrip(systemInstruction: string, prompt: string) {
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: tripResponseSchema,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini model');
      }

      const parsed = cleanAndParseJSON(text);

      // Extract search grounding metadata if present
      const groundingSources: { title: string; uri: string }[] = [];
      const chunks = (response as any)?.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri) {
            groundingSources.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri,
            });
          }
        }
      }

      parsed.groundingSources = groundingSources;
      return parsed;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate trip plan from AI models');
}

// System prompt builder
function buildSystemInstruction(language: string = 'en') {
  const langNote = language === 'hi' 
    ? 'IMPORTANT: All descriptions, titles, recommendations, notes, and warnings MUST be in natural, conversational Hindi (Devanagari script).' 
    : 'All output must be in clear, engaging English.';

  return `You are an expert, honest travel planner. Plan realistic routes with sensible travel times, never overpack a day, respect the budget, and flag seasonal risks (snow, landslides, monsoon, road closures, permit needs).
You have deep firsthand knowledge of Indian travel routes (Himachal Pradesh: Shimla, Manali, Kasol, Spiti Valley, Dharamshala, Jibhi, Bir Billing, Tirthan Valley; Goa, Rajasthan, Kerala, Uttarakhand, Ladakh, Northeast) as well as global destinations.
${langNote}

CRITICAL RULES:
1. Realism: Account for mountain roads (e.g. 100km in Himachal takes 4-5 hours, not 2 hours). Include buffer time.
2. Honest Budgeting: If the requested budget is unrealistically low (e.g. ₹3,000 for 5 days luxury in Manali), DO NOT fabricate unrealistic prices. Calculate the closest realistic budget plan, and clearly state what you adjusted in the "warnings" array and in "requestedBudgetGapNote".
3. Inferred inputs: If any fields (days, travelers, budget, starting city, style, month) were not explicitly specified in the user prompt, make smart inferences from the vibe text and populate 'inferredInputs'.
4. Seasonal Risks & Permits: Explicitly check the travel month or typical conditions. Highlight snow blockages (e.g. Rohtang Pass, Kunzum Pass in winter), monsoon landslides (July-August in Western Himalayas), permits needed (e.g. Inner Line Permit for Spiti/Ladakh, Rohtang permit, national park fees).
5. Meaningful Stops: Each stop must have category (Sightseeing, Food, Adventure, Culture, Nature, Relaxation, Transit), realistic duration, and travel details from the previous stop.`;
}

// Route 1: Generate initial trip
app.post('/api/trip/generate', async (req: Request, res: Response) => {
  try {
    const {
      vibe,
      days,
      travelers,
      budget,
      currency = 'INR',
      startingCity,
      travelMonth,
      travelStyle,
      transportPref,
      dietaryPreference,
      language = 'en',
    } = req.body;

    if (!vibe || typeof vibe !== 'string' || vibe.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a trip vibe or description.' });
    }

    const sanitizedVibe = vibe.trim().slice(0, 1000);

    const userPrompt = `USER VIBE / TRIP DESCRIPTION:
"${sanitizedVibe}"

SPECIFIC USER PREFERENCES (If any field is blank or null, infer the best choice from the vibe description):
- Number of Days: ${days || 'Not specified (infer from vibe)'}
- Number of Travelers: ${travelers || 'Not specified (infer from vibe)'}
- Total Budget (${currency}): ${budget ? `${budget} ${currency}` : 'Not specified (estimate sensible realistic budget for this vibe in INR)'}
- Starting City: ${startingCity || 'Not specified (infer default hub like Delhi or closest hub)'}
- Travel Month: ${travelMonth || 'Not specified (infer best season for this vibe)'}
- Travel Style: ${travelStyle || 'Not specified (infer budget/comfort/luxury from vibe)'}
- Transport Preference: ${transportPref || 'Not specified (infer sensible transport like Volvo bus/car/train)'}
- Dietary Preference: ${dietaryPreference || 'Not specified (default to versatile local food)'}
- Language: ${language}

Please generate the complete, realistic, day-by-day itinerary JSON. Include realistic Indian Rupee (INR) cost estimates.`;

    const systemInstruction = buildSystemInstruction(language);
    const tripData = await generateStructuredTrip(systemInstruction, userPrompt);

    // Ensure id and timestamps
    tripData.id = 'trip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    tripData.createdAt = new Date().toISOString();
    tripData.inferredInputs = tripData.inferredInputs || {};
    tripData.inferredInputs.currency = currency;

    res.json({ success: true, trip: tripData });
  } catch (error: any) {
    console.error('Trip generation error:', error);
    res.status(500).json({
      error: error?.message || 'Unable to generate trip plan. Please try again.',
    });
  }
});

// Route 2: Refine existing trip via chat-style instructions
app.post('/api/trip/refine', async (req: Request, res: Response) => {
  try {
    const { currentTrip, refinementPrompt, language = 'en' } = req.body;

    if (!currentTrip || !refinementPrompt) {
      return res.status(400).json({ error: 'Missing current trip or refinement prompt.' });
    }

    const systemInstruction = buildSystemInstruction(language);
    const userPrompt = `Here is the current trip plan:
${JSON.stringify(currentTrip, null, 2)}

USER REFINEMENT REQUEST:
"${refinementPrompt.trim().slice(0, 500)}"

Please update the itinerary based strictly on the user's refinement (for example: make it cheaper, add adventure activity, replace trekking with cafe hopping, adjust for kids/family, change transit, etc.).
Keep unchanged days intact, update the budget numbers accurately, and update safety/warnings if relevant. Return the updated full itinerary JSON matching the schema.`;

    const updatedTrip = await generateStructuredTrip(systemInstruction, userPrompt);
    updatedTrip.id = currentTrip.id || 'trip_' + Date.now();
    updatedTrip.createdAt = currentTrip.createdAt || new Date().toISOString();
    updatedTrip.updatedAt = new Date().toISOString();

    res.json({ success: true, trip: updatedTrip });
  } catch (error: any) {
    console.error('Trip refinement error:', error);
    res.status(500).json({
      error: error?.message || 'Unable to refine trip. Please try again.',
    });
  }
});

// Route 3: Regenerate a single day
app.post('/api/trip/regenerate-day', async (req: Request, res: Response) => {
  try {
    const { currentTrip, dayNumber, customPrompt = '', language = 'en' } = req.body;

    if (!currentTrip || typeof dayNumber !== 'number') {
      return res.status(400).json({ error: 'Missing trip or day number.' });
    }

    const singleDaySchema = {
      type: Type.OBJECT,
      properties: {
        theme: { type: Type.STRING },
        stops: tripResponseSchema.properties.days.items.properties.stops,
        meals: tripResponseSchema.properties.days.items.properties.meals,
        stayRecommendation: tripResponseSchema.properties.days.items.properties.stayRecommendation,
      },
      required: ['theme', 'stops', 'meals', 'stayRecommendation'],
    };

    const targetDay = currentTrip.days?.find((d: any) => d.dayNumber === dayNumber);
    const destination = currentTrip.destination || 'Destination';

    const prompt = `Trip Destination: ${destination}
Overall Trip Summary: ${currentTrip.summary}
Travel Style: ${currentTrip.inferredInputs?.travelStyle || 'comfort'}
Regenerating Day ${dayNumber}.
Current Day Plan: ${JSON.stringify(targetDay || {})}
User custom preference for this day (if any): "${customPrompt}"

Provide a fresh, exciting alternative plan for Day ${dayNumber} that fits smoothly between the previous and next days of the trip. Realistic stops, times, and costs in INR.`;

    const systemInstruction = buildSystemInstruction(language);

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: singleDaySchema,
        temperature: 0.8,
      },
    });

    const newDayContent = cleanAndParseJSON(response.text || '{}');

    // Clone and splice updated day
    const updatedTrip = JSON.parse(JSON.stringify(currentTrip));
    const dayIndex = updatedTrip.days.findIndex((d: any) => d.dayNumber === dayNumber);
    if (dayIndex !== -1) {
      updatedTrip.days[dayIndex] = {
        dayNumber,
        ...newDayContent,
      };

      // Recalculate day activity & meals costs into total budget
      let newActivities = 0;
      let newFood = 0;
      let newStay = 0;
      for (const d of updatedTrip.days) {
        for (const s of d.stops || []) {
          newActivities += Number(s.estimatedCostINR) || 0;
        }
        for (const m of d.meals || []) {
          newFood += Number(m.estimatedCostINR) || 0;
        }
        if (d.stayRecommendation?.costPerNightINR) {
          newStay += Number(d.stayRecommendation.costPerNightINR) || 0;
        }
      }

      if (updatedTrip.budget) {
        updatedTrip.budget.activities = Math.round(newActivities);
        updatedTrip.budget.food = Math.round(newFood);
        if (newStay > 0) updatedTrip.budget.stay = Math.round(newStay);
        const transport = updatedTrip.budget.transport || 0;
        const misc = updatedTrip.budget.miscellaneous || 0;
        updatedTrip.budget.total = Math.round(transport + updatedTrip.budget.stay + updatedTrip.budget.food + updatedTrip.budget.activities + misc);
        const travelers = updatedTrip.inferredInputs?.travelers || 1;
        updatedTrip.budget.perPerson = Math.round(updatedTrip.budget.total / Math.max(1, travelers));
      }
    }

    res.json({ success: true, trip: updatedTrip });
  } catch (error: any) {
    console.error('Day regeneration error:', error);
    res.status(500).json({ error: error?.message || 'Unable to regenerate day.' });
  }
});

// Route 4: Swap stop - suggests 3 realistic alternatives
app.post('/api/trip/swap-stop', async (req: Request, res: Response) => {
  try {
    const { destination, stop, dayTheme, travelStyle = 'comfort', language = 'en' } = req.body;

    if (!stop) {
      return res.status(400).json({ error: 'Missing stop information.' });
    }

    const swapSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          placeName: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          durationHours: { type: Type.NUMBER },
          estimatedCostINR: { type: Type.NUMBER },
          whyBetter: { type: Type.STRING },
        },
        required: ['placeName', 'category', 'description', 'durationHours', 'estimatedCostINR', 'whyBetter'],
      },
    };

    const prompt = `Destination: ${destination || 'Himachal Pradesh'}
Day Theme: ${dayTheme || 'Exploration'}
Current Stop to Replace:
- Name: ${stop.placeName}
- Current Category: ${stop.category}
- Duration: ${stop.durationHours} hours
- Cost: ₹${stop.estimatedCostINR}
- Description: ${stop.description}

Suggest exactly 3 diverse, high-quality, realistic alternative places or activities nearby that can replace this stop.
Keep duration roughly compatible (${Math.max(1, Math.round(stop.durationHours))} hours) and appropriate for travel style (${travelStyle}).
Return JSON array of 3 alternatives.`;

    const systemInstruction = buildSystemInstruction(language);

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: swapSchema,
        temperature: 0.75,
      },
    });

    const alternatives = cleanAndParseJSON(response.text || '[]');
    res.json({ success: true, alternatives });
  } catch (error: any) {
    console.error('Swap stop error:', error);
    res.status(500).json({ error: error?.message || 'Unable to suggest alternative stops.' });
  }
});

// Route 5: Compare variants (e.g. Budget vs Comfort vs Luxury vs Adventure)
app.post('/api/trip/compare-variant', async (req: Request, res: Response) => {
  try {
    const { currentTrip, targetStyle, language = 'en' } = req.body;

    if (!currentTrip || !targetStyle) {
      return res.status(400).json({ error: 'Missing current trip or target style.' });
    }

    const systemInstruction = buildSystemInstruction(language);
    const prompt = `Here is the current trip plan:
${JSON.stringify(currentTrip, null, 2)}

TASK: Generate a comparative variation of this trip tailored specifically to style: "${targetStyle.toUpperCase()}".
For example:
- If targetStyle is 'budget': prioritize sleeper/volvo buses, trusted hostels/homestays, authentic street food dhabas, free scenic hikes, minimize cab fares.
- If targetStyle is 'comfort' or 'luxury': prioritize private comfortable cabs, boutique heritage hotels / resorts with valley views, renowned dining, private guided experiences.
- If targetStyle is 'adventure': swap standard sightseeing for high-adrenaline activities (trekking, river rafting, paragliding, mountain biking, cliff jumping).

Keep the same destination and duration, but adjust stays, transport, stops, and budget accurately to reflect the ${targetStyle} tier. Return complete trip JSON.`;

    const variantTrip = await generateStructuredTrip(systemInstruction, prompt);
    variantTrip.id = 'trip_variant_' + Date.now();
    variantTrip.createdAt = new Date().toISOString();

    res.json({ success: true, variantTrip });
  } catch (error: any) {
    console.error('Compare variant error:', error);
    res.status(500).json({ error: error?.message || 'Unable to generate comparison variant.' });
  }
});

// Vite middleware in dev or static serving in production
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeTrip server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
