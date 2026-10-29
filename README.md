# VibeTrip 🏔️🧭

> **Turn any travel mood or vibe into a realistic, day-by-day itinerary with an interactive budget breakdown, seasonal travel warnings, and route intelligence.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-teal.svg)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Gemini%20API-2.5%20%2F%203.8%20Flash-orange.svg)](https://ai.google.dev/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-green.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 🌟 Overview

**VibeTrip** is an AI-powered travel planner that transforms natural language descriptions (e.g. *"quiet mountains, cheap homestays, 4 days with two friends, riverside cafes & scenic hikes"*) into fully structured, editable itineraries. Designed for any destination worldwide—with specialized domain knowledge for India and the Himalayas (Himachal Pradesh, Spiti Valley, Ladakh, Rajasthan, Goa, and more)—it calculates realistic transit times on winding mountain roads, flags seasonal hazards (monsoons, snow passes, landslides), validates permit requirements, and performs honest budget checks.

---

## ✨ Key Features

- **Natural Language Vibe Input**: Enter open-ended vibes or choose from curated presets. Supports real-time voice input via the Web Speech API.
- **Smart Parameter Inference**: Blank fields (days, group size, budget, style, transit) are intelligently deduced by Gemini from your description and presented for easy adjustment.
- **Honest Budgeting**: Never fabricates unrealistically low prices. Highlights budget gaps with constructive advice and breaks costs down into Transport, Stay, Food, Activities, and Misc (with total and per-person views in INR ₹, USD $, EUR €, and GBP £).
- **Day-by-Day Timeline & Route Intelligence**: Collapsible daily cards with timed stops, category tags, meal recommendations, night stays, and direct *"Open in Google Maps"* links.
- **Interactive Editing & Refinement**:
  - **Conversational Refiner**: Modify existing plans on the fly (*"Make it 20% cheaper"*, *"Add rafting"*, *"Remove Day 3 trekking"*).
  - **Single-Day Regeneration**: Refresh any specific day without modifying others.
  - **Stop Swapping**: Get 3 curated AI alternative spots with one-click replacements.
  - **Full Undo / Redo**: Keyboard-friendly (`Ctrl+Z`, `Ctrl+Y`) state history stack.
- **Persistent Packing List**: Pre-grouped checklist (clothing, tech, medicine, toiletries) tailored to destination terrain and climate, with custom item additions saved locally.
- **Side-by-Side Comparison**: Generate and evaluate 2 trip variations (e.g., Budget vs. Comfort) side-by-side.
- **Export & Share**: Print-optimized PDF stylesheet (`@media print`), copyable plain text, downloadable JSON, and native Web Share integration.
- **WCAG 2.2 AA Accessibility**: Full keyboard navigation, visible high-contrast focus rings, screen reader announcements (`aria-live`), text scaling (`A-` / `A` / `A+`), theme toggles (Light, Dark, and High-Contrast), and bilingual UI support (English & Hindi हिन्दी).
- **Speech Synthesis**: Built-in "Read Aloud" narration for day-by-day itinerary listening.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend / API**: Express, Node.js, `@google/genai` TypeScript SDK
- **AI Model**: `gemini-2.5-flash` / `gemini-3.8-flash` with structured JSON schema (`responseSchema`)
- **Storage**: Browser `localStorage` for offline trips and packing checklist state

---

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/vibetrip.git
   cd vibetrip
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 Disclaimer

*Costs, travel durations, and schedules are AI-generated estimates. Always verify local road conditions, weather advisories, inner line permits, and pricing before traveling.*
