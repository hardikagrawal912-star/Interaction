import React, { useState, useEffect, useRef } from 'react';
import { NightSession } from '../types';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft, Sparkles, CheckCircle2, Share2, Sun } from 'lucide-react';

interface BijliWapasViewProps {
  session: NightSession;
  onGoHome: () => void;
}

export const BijliWapasView: React.FC<BijliWapasViewProps> = ({
  session,
  onGoHome,
}) => {
  const [sunrisePhase, setSunrisePhase] = useState<'animating' | 'completed'>('animating');
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // 4-second sunrise warming animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setSunrisePhase('completed');
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Save Card as PNG using html-to-image
  const handleSaveAsImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#0A0C1B',
      });
      const link = document.createElement('a');
      link.download = `kahani-constellation-${session.dateStr.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting constellation card image:', err);
      alert('Photo download karne mein takleef aayi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* 4-Second Sunrise Transition Gradient Background */}
      <div
        className={`fixed inset-0 transition-all duration-[3800ms] ease-out pointer-events-none ${
          sunrisePhase === 'animating'
            ? 'bg-gradient-to-t from-[#F59E0B] via-[#7C2D12] to-[#05060F]'
            : 'bg-gradient-to-b from-[#FBF7EE] via-[#FCE7D2] to-[#F5D8B8]'
        }`}
      />

      {/* Sunrise Flare Graphic during animation */}
      {sunrisePhase === 'animating' && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-20 text-center space-y-4 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-gradient-to-t from-[#FEF08A] to-[#F59E0B] shadow-[0_0_80px_#F59E0B] flex items-center justify-center text-[#78350F]">
            <Sun className="w-12 h-12 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FEF08A] tracking-wide">
            Bijli Wapas Aa Gayi...
          </div>
          <p className="text-sm text-[#FDE68A] font-sans">
            Aasman mein subah ki roshni phail rahi hai
          </p>
        </div>
      )}

      {/* Tonight's Constellation Card (Revealed after Sunrise) */}
      {sunrisePhase === 'completed' && (
        <div className="relative z-10 w-full max-w-lg space-y-6 animate-fadeIn py-6">
          {/* Top Return Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={onGoHome}
              className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#2C241E] text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-xs border border-[#E8DFC8] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#C85A32]" />
              <span>Ghar Wapas (Home)</span>
            </button>

            <span className="text-xs font-semibold text-[#8C5209] bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#FDE68A]">
              ✨ Aaj Raat Ka Yaadgaar Pal
            </span>
          </div>

          {/* THE KEEPSAKE CARD (Captured as PNG) */}
          <div
            ref={cardRef}
            className="rounded-3xl bg-[#080A18] text-[#F3E8D0] p-6 sm:p-8 shadow-2xl border-2 border-[#F5B942]/40 relative overflow-hidden"
          >
            {/* Celestial Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#191E42_0%,#080A18_70%)] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Card Header */}
              <div className="text-center space-y-1 border-b border-[#242A4E] pb-4">
                <span className="text-[11px] font-mono tracking-widest text-[#F5B942] uppercase">
                  Light Gayi, Kahani Aayi
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Tonight&apos;s Constellation
                </h2>
                <div className="text-xs text-[#A89C8F] font-sans">
                  {session.dateStr}
                </div>
              </div>

              {/* Constellation Canvas / SVG Graphic */}
              <div className="relative w-full h-52 rounded-2xl bg-[#0D1026] border border-[#23294E] flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full p-4">
                  {/* Outer Orbit Rings */}
                  <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#F5B942" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.25" />
                  <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#F5B942" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.2" />

                  {/* Celestial Connecting Lines */}
                  {session.constellationPoints.map((point, idx, arr) => {
                    if (idx === 0) return null;
                    const prev = arr[idx - 1];
                    return (
                      <line
                        key={`constellation-line-${idx}`}
                        x1={`${prev.x}%`}
                        y1={`${prev.y}%`}
                        x2={`${point.x}%`}
                        y2={`${point.y}%`}
                        stroke="#F5B942"
                        strokeWidth="1.8"
                        strokeDasharray="4 2"
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* Golden Constellation Star Points */}
                  {session.constellationPoints.map((point, idx) => (
                    <g key={`point-${idx}`}>
                      {/* Aura */}
                      <circle
                        cx={`${point.x}%`}
                        cy={`${point.y}%`}
                        r="8"
                        fill="#F5B942"
                        opacity="0.25"
                      />
                      {/* Star Dot */}
                      <circle
                        cx={`${point.x}%`}
                        cy={`${point.y}%`}
                        r="4"
                        fill={point.type === 'kahani' ? '#F5B942' : point.type === 'sawaal' ? '#BEE3F8' : '#FB923C'}
                      />
                      {/* Star Label */}
                      <text
                        x={`${point.x}%`}
                        y={`${point.y - 7}%`}
                        fill="#EFE7D3"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="Fraunces, serif"
                        opacity="0.85"
                      >
                        {point.creatorName}
                      </text>
                    </g>
                  ))}
                </svg>

                {session.constellationPoints.length === 0 && (
                  <div className="text-xs text-[#8C7E70] italic">
                    (Aaj raat koi taara nahi khola gaya)
                  </div>
                )}
              </div>

              {/* Night Highlights */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-[#141733] border border-[#2A315A] p-3">
                  <div className="text-[11px] text-[#A89C8F]">Bijli Gayi Thi</div>
                  <div className="font-serif text-lg font-bold text-[#F5B942] tabular-nums mt-0.5">
                    {session.durationMinutes} minute
                  </div>
                </div>

                <div className="rounded-xl bg-[#141733] border border-[#2A315A] p-3">
                  <div className="text-[11px] text-[#A89C8F]">Kahaniyan & Sawaal</div>
                  <div className="font-serif text-lg font-bold text-[#F5B942] tabular-nums mt-0.5">
                    {session.openedStarCount} Suni Gayi
                  </div>
                </div>
              </div>

              {/* List of Opened Stories */}
              {session.openedStars.length > 0 && (
                <div className="space-y-2 border-t border-[#242A4E] pt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A89C8F]">
                    Aaj Raat Ke Kisse:
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {session.openedStars.map((st, i) => (
                      <div
                        key={i}
                        className="text-xs flex items-center justify-between bg-[#11142B] px-3 py-1.5 rounded-lg border border-[#22284C]"
                      >
                        <span className="text-[#F3E8D0] font-medium truncate">
                          {st.creatorName} ({st.relation})
                        </span>
                        <span className="text-[10px] text-[#F5B942] uppercase tracking-wider shrink-0 ml-2">
                          {st.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Footer Quote */}
              <div className="text-center pt-2 text-[10px] text-[#8C7E70] italic border-t border-[#242A4E]/60">
                &ldquo;Andhere ne humein baaton ki roshni di.&rdquo;
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSaveAsImage}
              disabled={isExporting}
              className="w-full sm:flex-1 min-h-[48px] px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B34923] text-white font-medium text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Tasveer ban rahi hai...' : 'Save as Image (PNG)'}</span>
            </button>

            <button
              onClick={onGoHome}
              className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-xl bg-white hover:bg-[#F8F4EA] border border-[#D5C6A8] text-[#2C241E] font-medium text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>Wapas Jao</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
