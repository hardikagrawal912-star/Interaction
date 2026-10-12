import React from 'react';
import { ActiveScreen, StarItem } from '../types';
import { Sparkles, Moon, Wifi, WifiOff, Volume2, HelpCircle, Flame, PlusCircle, Compass, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  stars: StarItem[];
  isOnline: boolean;
  onNavigate: (screen: ActiveScreen) => void;
  onTriggerLightGayi: () => void;
  onAddStarterContent: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stars,
  isOnline,
  onNavigate,
  onTriggerLightGayi,
  onAddStarterContent,
}) => {
  const kahaniCount = stars.filter((s) => s.type === 'kahani').length;
  const sawaalCount = stars.filter((s) => s.type === 'sawaal').length;
  const chunautiCount = stars.filter((s) => s.type === 'chunauti').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5E9] text-[#246B34] font-medium border border-[#C5E5C4]">
              <Wifi className="w-3.5 h-3.5" />
              <span>Bijli Chalu · Online</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4E5] text-[#B45309] font-medium border border-[#FDE68A] animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline · Andhera Mode Taiyaar</span>
            </span>
          )}
        </div>

        <div className="text-[#786C5E] font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E59E24]" />
          <span>
            {stars.length === 0
              ? 'Aasman abhi khaali hai'
              : `${stars.length} Taare aasman mein intezaar kar rahe hain`}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#F5EBD7] to-[#EFE2C7] border border-[#E2D2B0] p-6 sm:p-10 shadow-sm text-center">
        {/* Soft Background Diya Illustration Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F5B942]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E59E24]/15 text-[#8C5209] text-xs font-semibold tracking-wide uppercase">
            <span>✨ Parivar ki Kahaniyon ka Aasman</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#241C15] font-bold tracking-tight leading-tight">
            Light Gayi, <br className="sm:hidden" />
            <span className="text-[#C85A32] italic font-normal">Kahani Aayi</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#5A4C3D] leading-relaxed">
            &ldquo;When the lights go out, the stories come on.&rdquo;
            <br />
            Jab ghar mein andhera chha jaye, toh screen ko beech mein rakh do aur purane kisse, sawaal aur masti shuru karo.
          </p>

          {/* Two Big Primary Action Buttons (min 48px height for finger touch) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('stock')}
              className="w-full sm:w-auto min-h-[52px] px-7 py-3 rounded-2xl bg-[#C85A32] hover:bg-[#B34923] text-white font-medium text-base shadow-md shadow-[#C85A32]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#FDE047]" />
              <span>Aasman Bharo</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-sans">
                {stars.length} Taare
              </span>
            </button>

            <button
              onClick={onTriggerLightGayi}
              className="w-full sm:w-auto min-h-[52px] px-7 py-3 rounded-2xl bg-[#0F0C22] hover:bg-[#070514] text-[#F5B942] font-medium text-base shadow-lg shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-[#F5B942]/30"
            >
              <Moon className="w-5 h-5 text-[#F5B942] fill-[#F5B942]" />
              <span>Light Gayi (Andhera Shuru)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
        <div className="rounded-2xl bg-white/70 border border-[#E8DFC8] p-4 shadow-xs">
          <div className="w-8 h-8 mx-auto rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] mb-1.5">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2C241E] tabular-nums">
            {kahaniCount}
          </div>
          <div className="text-xs text-[#786C5E] font-medium">Kahaniyan</div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-[#E8DFC8] p-4 shadow-xs">
          <div className="w-8 h-8 mx-auto rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] mb-1.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2C241E] tabular-nums">
            {sawaalCount}
          </div>
          <div className="text-xs text-[#786C5E] font-medium">Sawaal</div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-[#E8DFC8] p-4 shadow-xs">
          <div className="w-8 h-8 mx-auto rounded-full bg-[#FFEDD5] flex items-center justify-center text-[#EA580C] mb-1.5">
            <Flame className="w-4 h-4" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2C241E] tabular-nums">
            {chunautiCount}
          </div>
          <div className="text-xs text-[#786C5E] font-medium">Chunautiyan</div>
        </div>
      </div>

      {/* Empty State or Quick Preview */}
      {stars.length === 0 ? (
        <div className="rounded-3xl bg-white/80 border border-[#E5DAC1] p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
            <Compass className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#2C241E]">
              Aasman abhi taaron se saja nahi hai
            </h3>
            <p className="text-sm text-[#6C5E50]">
              Pehle se Dadi, Papa ya bachchon ke kisse bhar kar rakhein, ya hamari taraf se 10 khoobsurat kisse shuru karein!
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onAddStarterContent}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#F5B942] hover:bg-[#E5A830] text-[#422006] font-semibold text-sm shadow-sm transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Surprise Me (10 Starter Stories)</span>
            </button>
            <button
              onClick={() => onNavigate('stock')}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8F4EA] border border-[#D5C6A8] text-[#3D3328] font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C85A32]" />
              <span>Khud Ek Taara Jodo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white/80 border border-[#E5DAC1] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#2C241E] flex items-center gap-2">
              <span>Aasman ke Chamakte Taare</span>
              <span className="text-xs font-sans font-normal text-[#8A7B6D]">
                ({stars.length} total)
              </span>
            </h3>
            <button
              onClick={() => onNavigate('stock')}
              className="text-xs font-semibold text-[#C85A32] hover:text-[#9A3412] flex items-center gap-1 cursor-pointer"
            >
              <span>Sabhi Dekhein</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stars.slice(0, 4).map((star) => (
              <div
                key={star.id}
                className="p-3.5 rounded-2xl bg-[#FAF6EC] border border-[#E9E0CE] flex items-start gap-3"
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    star.type === 'kahani'
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : star.type === 'sawaal'
                      ? 'bg-[#E0F2FE] text-[#0369A1]'
                      : 'bg-[#FFEDD5] text-[#C2410C]'
                  }`}
                >
                  {star.type === 'kahani' ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : star.type === 'sawaal' ? (
                    <HelpCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Flame className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-[#2C241E] truncate">
                      {star.creatorName} ({star.relation})
                    </span>
                    <span className="text-[10px] text-[#8C7E70] uppercase tracking-wider font-mono">
                      {star.type}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C4F40] line-clamp-2 mt-1">
                    {star.title || star.textContent || (star.audioBlob ? '🎙️ Awaaz ki kahani (sealed)' : 'Kissa')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works (Desi Family Guide) */}
      <div className="rounded-3xl bg-[#FAF5E8] border border-[#E8DFC8] p-5 sm:p-7 space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#2C241E]">
          Yeh Kaise Kaam Karta Hai? (Ghar ka Niyam)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-[#5C4F40]">
          <div className="space-y-1">
            <div className="font-serif font-bold text-[#C85A32] text-base">01. Din Mein Bharo</div>
            <p>
              Dadi, Papa, Bachche sab apni aawaz mein 30 second ki kahani ya mazedaar sawaal aasman mein seal kar dein.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-serif font-bold text-[#C85A32] text-base">02. Light Jaane Par</div>
            <p>
              Wi-Fi band hote hi ya &ldquo;Light Gayi&rdquo; dabane par screen dheere se andhere aasman mein badal jayegi.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-serif font-bold text-[#C85A32] text-base">03. Diye ke Chaaron Taraf</div>
            <p>
              Phone ko beech mein rakhein aur ek-ek karke taara chunein. Bijli aate hi aaj raat ka constellation card banega!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
