/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveScreen, StarItem, NightSession, ConstellationPoint } from './types';
import {
  getAllStars,
  addStar,
  deleteStar,
  seedStarterStars,
  getAllNights,
  saveNightSession,
  clearAllData,
} from './services/db';
import { audioSynth } from './services/audioSynthesizer';
import { registerPwaServiceWorker } from './services/pwaRegister';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { StockSkyView } from './components/StockSkyView';
import { AndheraSkyView } from './components/AndheraSkyView';
import { BijliWapasView } from './components/BijliWapasView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { Moon, X, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [stars, setStars] = useState<StarItem[]>([]);
  const [history, setHistory] = useState<NightSession[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // Active Night Session State
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [openedStarIds, setOpenedStarIds] = useState<string[]>([]);
  const [completedSession, setCompletedSession] = useState<NightSession | null>(null);

  // Transition & Blackout Fade State
  const [isBlackoutFading, setIsBlackoutFading] = useState(false);

  // 3-Second Toast State before entering Andhera Mode
  const [andheraToastSeconds, setAndheraToastSeconds] = useState<number | null>(null);
  const andheraToastTimerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Register PWA service worker once (strictly outside preview iframe)
  useEffect(() => {
    registerPwaServiceWorker();
  }, []);

  // Load Stars and History from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      let loadedStars = await getAllStars();
      if (loadedStars.length === 0) {
        // Auto-seed starter stars on first run so the sky is never empty
        loadedStars = await seedStarterStars(false);
      }
      setStars(loadedStars);

      const loadedHistory = await getAllNights();
      setHistory(loadedHistory);
    } catch (err) {
      console.error('Error loading data from IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Execute Blackout Transition (3-second dim to near-black with soft tick)
  const executeAndheraTransition = useCallback(() => {
    setAndheraToastSeconds(null);
    audioSynth.playSoftTick();
    setIsBlackoutFading(true);

    const fadeDuration = demoMode ? 500 : 3000;
    setTimeout(() => {
      setSessionStartTime(Date.now());
      setOpenedStarIds([]);
      setActiveScreen('andhera');
      setIsBlackoutFading(false);
    }, fadeDuration);
  }, [demoMode]);

  // Cancel Pending Andhera Mode
  const cancelAndheraTransition = () => {
    if (andheraToastTimerRef.current) {
      clearInterval(andheraToastTimerRef.current);
      andheraToastTimerRef.current = null;
    }
    setAndheraToastSeconds(null);
  };

  // Start the 3-second "Andhera shuru ho raha hai..." toast countdown
  const startAndheraToastCountdown = useCallback(() => {
    if (activeScreen === 'andhera') return;
    if (demoMode) {
      // In demo mode, trigger immediately for video recording
      executeAndheraTransition();
      return;
    }

    setAndheraToastSeconds(3);
    let count = 3;

    if (andheraToastTimerRef.current) {
      clearInterval(andheraToastTimerRef.current);
    }

    andheraToastTimerRef.current = window.setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (andheraToastTimerRef.current) {
          clearInterval(andheraToastTimerRef.current);
          andheraToastTimerRef.current = null;
        }
        executeAndheraTransition();
      } else {
        setAndheraToastSeconds(count);
      }
    }, 1000);
  }, [activeScreen, demoMode, executeAndheraTransition]);

  // Trigger Return of Light (Bijli Aa Gayi)
  const handleReturnOfLight = useCallback(async () => {
    const endTime = Date.now();
    const durationMinutes = Math.max(1, Math.round((endTime - sessionStartTime) / 60000));

    const openedStarsDetails = stars
      .filter((s) => openedStarIds.includes(s.id))
      .map((s) => ({
        id: s.id,
        title: s.title || (s.type === 'kahani' ? 'Kahani' : s.type === 'sawaal' ? 'Sawaal' : 'Chunauti'),
        creatorName: s.creatorName,
        relation: s.relation,
        type: s.type,
        textContent: s.textContent,
        hasAudio: !!s.audioBlob,
        audioDuration: s.audioDuration,
      }));

    // Seed coordinates for constellation card
    const constellationPoints: ConstellationPoint[] = openedStarsDetails.map((s, idx) => {
      const angle = (idx / Math.max(1, openedStarsDetails.length)) * Math.PI * 2 + 0.5;
      const radius = 25 + (idx % 2 === 0 ? 12 : -8);
      const x = Math.round(50 + radius * Math.cos(angle));
      const y = Math.round(50 + radius * Math.sin(angle));
      return {
        x: Math.max(15, Math.min(85, x)),
        y: Math.max(15, Math.min(85, y)),
        id: s.id,
        title: s.title,
        type: s.type,
        creatorName: s.creatorName,
      };
    });

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const dateStr = new Date(endTime).toLocaleDateString('hi-IN', options);

    const session: NightSession = {
      id: `night_${endTime}`,
      dateStr,
      startTime: sessionStartTime,
      endTime,
      durationMinutes,
      openedStarCount: openedStarIds.length,
      openedStars: openedStarsDetails,
      constellationPoints,
    };

    try {
      await saveNightSession(session);
      const updatedHistory = await getAllNights();
      setHistory(updatedHistory);
    } catch (err) {
      console.warn('Failed to save night session to history:', err);
    }

    setCompletedSession(session);
    setActiveScreen('bijli-wapas');
  }, [sessionStartTime, stars, openedStarIds]);

  // Offline / Online Event Listeners with 2-second debounce
  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      if (activeScreen === 'andhera') return;

      // 2-second debounce to ignore Wi-Fi flicker
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = window.setTimeout(() => {
        if (!navigator.onLine) {
          startAndheraToastCountdown();
        }
      }, 2000);
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (andheraToastSeconds !== null) {
        cancelAndheraTransition();
      }
      // If currently in Andhera Mode, automatic transition to Bijli Wapas!
      if (activeScreen === 'andhera') {
        handleReturnOfLight();
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeScreen, andheraToastSeconds, startAndheraToastCountdown, handleReturnOfLight]);

  // Manual Trigger: Light Gayi Button
  const handleManualTriggerLightGayi = () => {
    startAndheraToastCountdown();
  };

  // Add a Star Handler
  const handleAddStar = async (star: StarItem) => {
    await addStar(star);
    await refreshData();
  };

  // Delete a Star Handler
  const handleDeleteStar = async (id: string) => {
    await deleteStar(id);
    await refreshData();
  };

  // Add 10 Starter Stories (Surprise Me)
  const handleAddStarterContent = async () => {
    await seedStarterStars(true);
    await refreshData();
  };

  // Clear All Data
  const handleClearAllData = async () => {
    await clearAllData();
    await refreshData();
  };

  // Mark Star as Opened in Active Session
  const handleStarOpened = (star: StarItem) => {
    if (!openedStarIds.includes(star.id)) {
      setOpenedStarIds((prev) => [...prev, star.id]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* 3-Second Dimming Transition Overlay */}
      {isBlackoutFading && (
        <div
          className="fixed inset-0 z-50 bg-[#05060F] transition-opacity pointer-events-auto flex items-center justify-center text-center p-4"
          style={{
            transitionDuration: demoMode ? '500ms' : '3000ms',
            opacity: 1,
          }}
        >
          <div className="space-y-3 text-[#F5B942] animate-pulse">
            <Moon className="w-10 h-10 mx-auto fill-[#F5B942]" />
            <div className="font-serif text-xl sm:text-2xl font-bold">
              Andhera Ho Raha Hai...
            </div>
            <p className="text-xs text-[#E8DFC8]/70 font-sans">
              Screen dim ho rahi hai · Phone ko beech mein rakhein
            </p>
          </div>
        </div>
      )}

      {/* 3-Second "Andhera shuru ho raha hai..." Toast with Cancel Button */}
      {andheraToastSeconds !== null && (
        <aside
          aria-label="Power cut alert"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-3.5 rounded-2xl bg-[#1C1738] text-[#F5B942] shadow-2xl border border-[#F5B942]/40 flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B942] animate-ping shrink-0" />
            <div>
              <div className="font-serif font-bold text-xs sm:text-sm text-white">
                Andhera shuru ho raha hai... ({andheraToastSeconds}s)
              </div>
              <div className="text-[11px] text-[#D8CBBA]">
                Phone night mode mein switch hone wala hai
              </div>
            </div>
          </div>

          <button
            onClick={cancelAndheraTransition}
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
          >
            Roko (Cancel)
          </button>
        </aside>
      )}

      {/* Render Screen Based on State */}
      {activeScreen === 'andhera' ? (
        <main className="w-full h-full">
          <AndheraSkyView
            stars={stars}
            openedStarIds={openedStarIds}
            onStarOpened={handleStarOpened}
            onReturnOfLight={handleReturnOfLight}
            sessionStartTime={sessionStartTime}
          />
        </main>
      ) : activeScreen === 'bijli-wapas' && completedSession ? (
        <main className="w-full h-full">
          <BijliWapasView
            session={completedSession}
            onGoHome={() => setActiveScreen('home')}
          />
        </main>
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Top Bar Navigation (Visible in Daylight screens) */}
          <Header
            activeScreen={activeScreen}
            onNavigate={(screen) => setActiveScreen(screen)}
            onTriggerLightGayi={handleManualTriggerLightGayi}
            starsCount={stars.length}
            isOnline={isOnline}
          />

          {/* Main Daylight Content Area */}
          <main className="flex-1 pb-16">
            {activeScreen === 'home' && (
              <HomeView
                stars={stars}
                isOnline={isOnline}
                onNavigate={(screen) => setActiveScreen(screen)}
                onTriggerLightGayi={handleManualTriggerLightGayi}
                onAddStarterContent={handleAddStarterContent}
              />
            )}

            {activeScreen === 'stock' && (
              <StockSkyView
                stars={stars}
                onAddStar={handleAddStar}
                onDeleteStar={handleDeleteStar}
                onAddStarterContent={handleAddStarterContent}
              />
            )}

            {activeScreen === 'history' && (
              <HistoryView
                history={history}
                onNavigateHome={() => setActiveScreen('home')}
              />
            )}

            {activeScreen === 'settings' && (
              <SettingsView
                demoMode={demoMode}
                onToggleDemoMode={(enabled) => setDemoMode(enabled)}
                onClearAllData={handleClearAllData}
                onDataImported={refreshData}
              />
            )}
          </main>

          {/* Quiet Daylight Footer */}
          <footer className="w-full border-t border-[#E8DFC8] py-4 text-center text-xs text-[#8C7E70] bg-[#FBF7EE]">
            <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Light Gayi, Kahani Aayi · When the lights go out, the stories come on.</span>
              <span className="text-[11px] text-[#A89C8F]">Offline-Ready PWA · IndexedDB Storage</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
