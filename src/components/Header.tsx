import React from 'react';
import { ActiveScreen } from '../types';
import { Sparkles, Moon, History, Settings, Sun } from 'lucide-react';

interface HeaderProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onTriggerLightGayi: () => void;
  starsCount: number;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onNavigate,
  onTriggerLightGayi,
  starsCount,
  isOnline,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FBF7EE]/95 backdrop-blur-md border-b border-[#E8DFC8]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus-visible:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E59E24] to-[#C85A32] flex items-center justify-center shadow-sm text-white group-hover:scale-105 transition-transform">
            <span className="text-lg font-serif">✨</span>
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-[#2C241E] tracking-tight block leading-tight">
              Light Gayi, Kahani Aayi
            </span>
            <span className="text-[11px] font-sans text-[#786C5E] hidden sm:block">
              बत्ती गुल · किस्से चालू
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeScreen === 'home'
                ? 'bg-[#EFE7D3] text-[#2C241E] font-semibold'
                : 'text-[#5C5042] hover:bg-[#F3EBD8]'
            }`}
          >
            Ghar
          </button>

          <button
            onClick={() => onNavigate('stock')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeScreen === 'stock'
                ? 'bg-[#EFE7D3] text-[#2C241E] font-semibold'
                : 'text-[#5C5042] hover:bg-[#F3EBD8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Aasman Bharo</span>
            {starsCount > 0 && (
              <span className="ml-1 text-[10px] font-mono bg-[#E8DFC8] px-1.5 py-0.2 rounded-full text-[#4A3E31]">
                {starsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeScreen === 'history'
                ? 'bg-[#EFE7D3] text-[#2C241E] font-semibold'
                : 'text-[#5C5042] hover:bg-[#F3EBD8]'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#786C5E]" />
            <span className="hidden sm:inline">Pichhli Raatein</span>
            <span className="sm:hidden">Raatein</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`p-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors text-[#5C5042] hover:bg-[#F3EBD8] ${
              activeScreen === 'settings' ? 'bg-[#EFE7D3] text-[#2C241E]' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4 text-[#786C5E]" />
          </button>
        </nav>

        {/* Zone 3: Primary Action Trigger (Light Gayi) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTriggerLightGayi}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C1738] hover:bg-[#0E0C22] text-[#F5B942] font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer border border-[#F5B942]/30"
          >
            <Moon className="w-4 h-4 text-[#F5B942] fill-[#F5B942]/30" />
            <span>Light Gayi!</span>
          </button>
        </div>
      </div>
    </header>
  );
};
