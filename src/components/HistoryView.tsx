import React, { useState } from 'react';
import { NightSession } from '../types';
import { History, Calendar, Clock, Sparkles, X, Download, Compass } from 'lucide-react';
import { toPng } from 'html-to-image';

interface HistoryViewProps {
  history: NightSession[];
  onNavigateHome: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onNavigateHome,
}) => {
  const [selectedSession, setSelectedSession] = useState<NightSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadHistoricalCard = async (session: NightSession) => {
    const node = document.getElementById(`history-card-modal-${session.id}`);
    if (!node) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#080A18',
      });
      const link = document.createElement('a');
      link.download = `constellation-${session.dateStr.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('Photo download nahi ho saki.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E8DFC8] pb-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] flex items-center gap-2">
          <History className="w-6 h-6 text-[#C85A32]" />
          <span>Pichhli Raatein (Past Nights)</span>
        </h2>
        <p className="text-sm text-[#6C5E50] mt-1">
          Har power cut ek nayi kahani aur ek naya nakshatra (constellation) chhod gaya.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl bg-white/80 border border-[#E5DAC1] p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF5E8] flex items-center justify-center text-[#B45309]">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2C241E]">
            Abhi tak koi raat darj nahi hui hai
          </h3>
          <p className="text-sm text-[#786C5E] max-w-sm mx-auto">
            Jab pehli baar light jayegi aur aap taare sunenge, toh unka nakshatra yahan surakshit ho jayega.
          </p>
          <button
            onClick={onNavigateHome}
            className="mt-2 min-h-[44px] px-5 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-semibold shadow-xs hover:bg-[#B34923] cursor-pointer"
          >
            Aasman Ki Taraf Jao
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {history.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="rounded-3xl bg-white border border-[#E5DAC1] p-5 shadow-xs hover:border-[#C85A32]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#786C5E]">
                    <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{session.dateStr}</span>
                  </span>
                  <span className="text-[11px] font-mono bg-[#FAF5E8] text-[#92400E] px-2 py-0.5 rounded-full font-semibold">
                    {session.openedStarCount} Kisse
                  </span>
                </div>

                {/* Constellation Mini Preview */}
                <div className="w-full h-28 rounded-2xl bg-[#080A18] relative overflow-hidden flex items-center justify-center border border-[#23294E]">
                  <svg className="w-full h-full p-2">
                    {session.constellationPoints.map((point, idx, arr) => {
                      if (idx === 0) return null;
                      const prev = arr[idx - 1];
                      return (
                        <line
                          key={idx}
                          x1={`${prev.x}%`}
                          y1={`${prev.y}%`}
                          x2={`${point.x}%`}
                          y2={`${point.y}%`}
                          stroke="#F5B942"
                          strokeWidth="1.2"
                          strokeDasharray="3 2"
                          opacity="0.6"
                        />
                      );
                    })}
                    {session.constellationPoints.map((point, idx) => (
                      <circle
                        key={idx}
                        cx={`${point.x}%`}
                        cy={`${point.y}%`}
                        r="3"
                        fill="#F5B942"
                      />
                    ))}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-xs text-[#5C4F40] pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#786C5E]" />
                    <span>Duration: {session.durationMinutes} min</span>
                  </span>
                  <span className="font-semibold text-[#C85A32] group-hover:underline flex items-center gap-1">
                    <span>Nakshatra Dekhein</span>
                    <Sparkles className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Constellation Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0A0C1D] text-[#F3E8D0] border-2 border-[#F5B942]/40 p-6 sm:p-7 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#242A4E] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5B942]">
                  {selectedSession.dateStr}
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  Tonight&apos;s Constellation
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="w-8 h-8 rounded-full bg-[#1A1F3F] text-[#8C7E70] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Card Container for export */}
            <div id={`history-card-modal-${selectedSession.id}`} className="space-y-4">
              <div className="w-full h-48 rounded-2xl bg-[#080A18] border border-[#23294E] flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full p-3">
                  {selectedSession.constellationPoints.map((point, idx, arr) => {
                    if (idx === 0) return null;
                    const prev = arr[idx - 1];
                    return (
                      <line
                        key={idx}
                        x1={`${prev.x}%`}
                        y1={`${prev.y}%`}
                        x2={`${point.x}%`}
                        y2={`${point.y}%`}
                        stroke="#F5B942"
                        strokeWidth="1.6"
                        strokeDasharray="4 2"
                        opacity="0.8"
                      />
                    );
                  })}
                  {selectedSession.constellationPoints.map((point, idx) => (
                    <g key={idx}>
                      <circle cx={`${point.x}%`} cy={`${point.y}%`} r="6" fill="#F5B942" opacity="0.3" />
                      <circle cx={`${point.x}%`} cy={`${point.y}%`} r="3.5" fill="#F5B942" />
                      <text
                        x={`${point.x}%`}
                        y={`${point.y - 6}%`}
                        fill="#F3E8D0"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="Fraunces, serif"
                      >
                        {point.creatorName}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#141733] border border-[#2A315A]">
                  <span className="text-[#8C7E70] block">Bijli Gayi Thi</span>
                  <span className="font-serif font-bold text-[#F5B942] text-sm tabular-nums">
                    {selectedSession.durationMinutes} min
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141733] border border-[#2A315A]">
                  <span className="text-[#8C7E70] block">Kahaniyan</span>
                  <span className="font-serif font-bold text-[#F5B942] text-sm tabular-nums">
                    {selectedSession.openedStarCount} Suni Gayi
                  </span>
                </div>
              </div>

              {selectedSession.openedStars.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {selectedSession.openedStars.map((s, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-[#11142B] px-3 py-1.5 rounded-lg flex items-center justify-between border border-[#1E2346]"
                    >
                      <span>{s.creatorName} ({s.relation})</span>
                      <span className="text-[10px] text-[#F5B942] uppercase font-mono">{s.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleDownloadHistoricalCard(selectedSession)}
                disabled={isExporting}
                className="w-full min-h-[44px] rounded-xl bg-[#C85A32] hover:bg-[#B34923] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Download ho raha hai...' : 'Save Constellation (PNG)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
