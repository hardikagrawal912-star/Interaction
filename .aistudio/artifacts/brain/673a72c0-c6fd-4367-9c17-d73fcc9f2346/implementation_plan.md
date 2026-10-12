# Light Gayi, Kahani Aayi (जब बत्ती गुल, कहानियाँ चालू)

A mobile-first, offline-capable web application for Indian families to gather during power cuts. In daylight, the family stocks a sky of voice stories, thought-provoking questions, and playful challenges. When a power cut strikes (detected via offline events or a manual button), the screen gently fades into a dim, battery-saving dark night sky with stars arranged in concentric circles around a warm central diya. When power returns, a sunrise gradient reveals "Tonight's Constellation" connecting the listened stories, exportable as a keepsake card.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and incorporated:
> - **Ambient Sound Effects**: Soft procedural cricket night sounds during Andhera Mode with a subtle top-corner mute toggle.
> - **Night Sky Architecture**: Stars positioned in harmonic concentric rings radiating outward from a warm glowing central Diya (earthen lamp).
> - **Kahani Audio Recording**: Voice notes include an optional story title/caption alongside the speaker name and family relation.

---

## 1. Overview & Core Concept

- **What It Does**: Bridges generations during power outages by turning a blackout into a shared family storytelling circle. The phone is placed face-up in the center of the room.
- **Target Audience / Persona**: Multi-generational households (Dadi, Nani, Papa, Mummy, Bhai, Behen, Dost, Bachche) who want warmth, connection, and nostalgia when electrical appliances and Wi-Fi shut down.
- **Key Value**: 100% offline-ready, zero-network dependency after initial load, battery-conservative dark palette, and tangible memory preservation with exportable constellations.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Ghar Ki Subah (Daylight Setup & Home)**:
   - Warm cream background (`#FBF7EE`), terracotta accents (`#C85A32`), and marigold gold (`#E59E24`).
   - Clean status indicator: Connectivity badge, waiting stars count, and two primary action buttons:
     - `Aasman Bharo` (Stock the Sky)
     - `Light Gayi` (Manual power-cut trigger with instant transition)
   - Quick access to `Pichhli Raatein` (Past Nights History) and `Settings` (Export backup, Clear data).

2. **Aasman Bharo (Stock the Sky Form)**:
   - Simple, human-friendly form:
     - "Who is leaving this?" (Speaker name + relationship chips: Dadi, Nani, Papa, Mummy, Bhai, Behen, Dost, Other).
     - "Star Type":
       - **Kahani**: 30-second voice note with live waveform visualizer, countdown timer, re-record button, and optional caption, OR text story up to 280 characters.
       - **Sawaal**: Family question addressed to a specific person (e.g., "Dadi, aapki pehli salary kitni thi?").
       - **Chunauti**: Playful dark-friendly challenge with countdown timer.
     - **Surprise Me Button**: Instantly provisions 10 curated starter family stories in Hinglish.
     - Manage list of unread stars with individual delete actions. Voice notes remain sealed with a lock badge.

3. **Andhera Shuru (Power Cut Transition & Detection)**:
   - Automatically triggered upon `window.addEventListener('offline')` (with 2-second debounce) or clicking `Light Gayi`.
   - Displays a 3-second gentle toast: `"Andhera shuru ho raha hai..."` with an immediate `Roko` (Cancel) button to avoid accidental transitions.
   - Screen dims from cream to `#05060F` over a smooth 3-second fade while Screen Wake Lock is engaged.

4. **Andhera Mode (Night Sky & Central Diya)**:
   - Near-black indigo canvas (`#05060F`) with a central gently flickering Diya flame emitting a warm radial candle glow.
   - Stars distributed in subtle concentric rings around the diya:
     - **Gold (#F5B942)** for Kahani
     - **Soft Blue-White (#BEE3F8)** for Sawaal
     - **Warm Amber (#FB923C)** for Chunauti
   - Tapping a star expands into a candle-glow bordered card:
     - Kahani: Voice player with glowing audio bars or text rendered line-by-line.
     - Sawaal: Large question card with "[Name] ne poocha hai [Person] se" and action buttons "Jawab de diya" / "Baad mein".
     - Chunauti: Playful task with a 30-second candle-shaped countdown timer.
   - When finished, the star turns into a faint dotted outline (`suna ja chuka`), connecting to the active session.
   - "Pass the phone" prompt: `"Ab agla taara kaun chunega?"` calling out a random family member.
   - Ambient cricket audio with mute toggle in the top corner. Battery saver note at bottom: `"Screen dim hai taaki battery bachi rahe."`
   - Discreet low-contrast corner button: `"Bijli aa gayi"`.

5. **Bijli Wapas (Sunrise & Constellation Card)**:
   - Triggered upon `window.addEventListener('online')` or tapping `Bijli aa gayi`.
   - 4-second sunrise glow transition warming into dawn colors.
   - **Tonight's Constellation**: Canvas/SVG map drawing celestial lines between all opened stars with night duration, story count, and date.
   - Action buttons: `Save as image` (PNG download via canvas/html-to-image) and `Wapas jao`.

6. **Pichhli Raatein (History Screen)**:
   - Timeline cards of past power-cut nights with date, duration, and constellation previews.
   - Full review of saved constellation summaries.

7. **Settings & Data Management**:
   - Backup & restore: "Export all stories" (JSON backup file with embedded audio data).
   - "Clear data" with strict confirmation dialog warning of permanent deletion.
   - PWA Install prompt with iOS guide fallback.
   - Demo mode toggle to trigger the flow without toggling airplane mode.

---

## 3. Key Product Decisions & Trade-Offs

- **Procedural Ambient Audio**: Rather than relying on external MP3 audio files that might fail in hermetic sandboxes or offline mode, a pure Web Audio API synthesizer generates soft soothing cricket chirps and night room tone entirely client-side.
- **Concentric Diya Sky Layout**: Uses a seeded polar-coordinate math algorithm $(r_i, \theta_i)$ to position stars deterministically in concentric rings around the diya center $(50\%, 50\%)$, ensuring consistent star placement across re-renders without overlap.
- **Audio Recording Fallback**: MediaRecorder prioritizes `audio/webm;codecs=opus`, with automatic fallback to `audio/mp4` and `audio/ogg`, storing binary audio Blobs directly in IndexedDB.
- **Safe PWA Service Worker Registration**: Service worker is registered only in production/standalone environments and skipped inside iframe preview wrappers, ensuring zero interference with AI Studio live editing.
- **Screen Wake Lock**: Automatically requests `navigator.wakeLock.request('screen')` during Andhera Mode and gracefully handles unsupported browsers without errors.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       LIGHT GAYI, KAHANI AAYI                             │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌───────────────────────────────┐              ┌───────────────────────────────┐
│     Daylight Interface        │              │       Andhera Mode Sky        │
│  - Home & Status Display      │              │  - Concentric Polar Star Canvas│
│  - Aasman Bharo (Stock Form)  │              │  - Central Flickering Diya    │
│  - MediaRecorder Audio Engine │              │  - Story Modal & Waveform     │
│  - Past Nights History        │              │  - 30s Candle Countdown       │
│  - Settings & JSON Backup     │              │  - Procedural Cricket Audio   │
└───────────────────────────────┘              └───────────────────────────────┘
           │                                                  │
           └─────────────────────────┬────────────────────────┘
                                     ▼
                      ┌───────────────────────────────┐
                      │    Storage & Service Layer    │
                      │  - IndexedDB (idb wrapper)    │
                      │  - Stars & Audio Blobs Store  │
                      │  - NightSessions Store        │
                      │  - Network State & Debounce   │
                      │  - Wake Lock Controller       │
                      │  - Constellation PNG Renderer │
                      └───────────────────────────────┘
```

### Core Data Models

```typescript
export type StarType = 'kahani' | 'sawaal' | 'chunauti';
export type FamilyRelation = 'Dadi' | 'Nani' | 'Papa' | 'Mummy' | 'Bhai' | 'Behen' | 'Dost' | 'Other';

export interface StarItem {
  id: string;
  creatorName: string;
  relation: FamilyRelation;
  type: StarType;
  title?: string;
  textContent?: string;
  audioBlob?: Blob;
  audioDuration?: number;
  targetPerson?: string; // For Sawaal
  createdAt: number;
  ringIndex?: number;
  angle?: number;
}

export interface NightSession {
  id: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  openedStarIds: string[];
  constellationSvg?: string;
}
```
