import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StarItem, StarType } from '../types';
import { audioSynth } from '../services/audioSynthesizer';
import { wakeLockService } from '../services/wakeLock';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sun,
  Flame,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';

interface AndheraSkyViewProps {
  stars: StarItem[];
  openedStarIds: string[];
  onStarOpened: (star: StarItem) => void;
  onReturnOfLight: () => void;
  sessionStartTime: number;
}

export const AndheraSkyView: React.FC<AndheraSkyViewProps> = ({
  stars,
  openedStarIds,
  onStarOpened,
  onReturnOfLight,
  sessionStartTime,
}) => {
  const [selectedStar, setSelectedStar] = useState<StarItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [passThePhonePrompt, setPassThePhonePrompt] = useState<string | null>(null);

  // Chunauti 30s Countdown
  const [challengeSeconds, setChallengeSeconds] = useState(30);
  const [isChallengeRunning, setIsChallengeRunning] = useState(false);

  // Text Line-by-Line Whisper Reveal
  const [revealedLineIndex, setRevealedLineIndex] = useState(0);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Enable Screen Wake Lock and Cricket Ambience
  useEffect(() => {
    wakeLockService.requestLock();
    audioSynth.startCricketAmbience();

    return () => {
      audioSynth.stopCricketAmbience();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  // Calculate elapsed power cut minutes for subtle display
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  useEffect(() => {
    const updateElapsed = () => {
      const diff = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
      setElapsedMinutes(diff);
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 30000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Handle ambient sound toggle
  const toggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    audioSynth.setMuted(next);
  };

  // Concentric Circles Polar Positioning
  // Stars arranged in concentric orbits radiating from center (50%, 50%)
  const positionedStars = useMemo(() => {
    if (stars.length === 0) return [];

    const rings = [
      { ringIndex: 1, radiusPercent: 22, maxStars: 4 },
      { ringIndex: 2, radiusPercent: 34, maxStars: 7 },
      { ringIndex: 3, radiusPercent: 44, maxStars: 10 },
    ];

    return stars.map((star, idx) => {
      // Determine ring
      let ringIndex = 1;
      let angleOffset = 0;
      let radiusPercent = 22;

      if (idx < 3) {
        ringIndex = 1;
        radiusPercent = 22;
        angleOffset = (idx / 3) * Math.PI * 2 + 0.3;
      } else if (idx < 8) {
        ringIndex = 2;
        radiusPercent = 33;
        angleOffset = ((idx - 3) / 5) * Math.PI * 2 + 0.7;
      } else {
        ringIndex = 3;
        radiusPercent = 43;
        angleOffset = ((idx - 8) / Math.max(1, stars.length - 8)) * Math.PI * 2 + 1.2;
      }

      // Calculate percentage coords with center at (50, 50)
      const xPercent = 50 + radiusPercent * Math.cos(angleOffset);
      const yPercent = 50 + radiusPercent * Math.sin(angleOffset);

      const isOpened = openedStarIds.includes(star.id);

      return {
        ...star,
        xPercent: Math.max(8, Math.min(92, xPercent)),
        yPercent: Math.max(10, Math.min(90, yPercent)),
        isOpened,
        ringIndex,
      };
    });
  }, [stars, openedStarIds]);

  // Open Star Card
  const handleOpenStar = (star: StarItem) => {
    audioSynth.playStarChime();
    setSelectedStar(star);
    setIsPlayingAudio(false);
    setAudioCurrentTime(0);
    setAudioDuration(star.audioDuration || 30);
    setRevealedLineIndex(0);
    setChallengeSeconds(30);
    setIsChallengeRunning(star.type === 'chunauti');

    // Create audio player if voice note
    if (star.audioBlob) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const url = URL.createObjectURL(star.audioBlob);
      const audio = new Audio(url);
      audio.ontimeupdate = () => setAudioCurrentTime(audio.currentTime);
      audio.onended = () => {
        setIsPlayingAudio(false);
        handleMarkStoryFinished(star);
      };
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioDuration(audio.duration);
        }
      };
      audioPlayerRef.current = audio;
    }
  };

  // Text Whisper Line Reveal Timer
  useEffect(() => {
    if (!selectedStar || selectedStar.type !== 'kahani' || selectedStar.audioBlob) return;
    const text = selectedStar.textContent || '';
    const lines = text.split(/(?<=[.?!।])\s+/);
    if (revealedLineIndex < lines.length) {
      const timer = setTimeout(() => {
        setRevealedLineIndex((prev) => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [selectedStar, revealedLineIndex]);

  // Chunauti Countdown Timer
  useEffect(() => {
    if (!isChallengeRunning || challengeSeconds <= 0) return;
    const interval = setInterval(() => {
      setChallengeSeconds((prev) => {
        if (prev <= 1) {
          setIsChallengeRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isChallengeRunning, challengeSeconds]);

  // Handle Audio Play/Pause
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  // Close Card and Trigger "Pass the phone" prompt
  const handleCloseCard = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setSelectedStar(null);
  };

  const handleMarkStoryFinished = (star: StarItem) => {
    onStarOpened(star);
    handleCloseCard();

    // Select random family member for "Pass the phone"
    const distinctCreators = Array.from(new Set(stars.map((s) => `${s.creatorName} (${s.relation})`)));
    const randomMember = distinctCreators[Math.floor(Math.random() * distinctCreators.length)] || 'kisi aur';
    setPassThePhonePrompt(`Ab agla taara ${randomMember} chunein!`);
    setTimeout(() => {
      setPassThePhonePrompt(null);
    }, 7000);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#05060F] text-[#F3E8D0] select-none touch-manipulation font-sans"
      style={{
        // Max brightness feel should be LOW.
        filter: 'brightness(0.92)',
      }}
    >
      {/* Radial Night Sky Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#131735_0%,#080918_65%,#05060F_100%)] pointer-events-none" />

      {/* Concentric Celestial Orbit Rings (Subtle Guide Rings) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <circle cx="50%" cy="50%" r="22%" fill="none" stroke="#F5B942" strokeWidth="0.8" strokeDasharray="3 5" />
        <circle cx="50%" cy="50%" r="33%" fill="none" stroke="#F5B942" strokeWidth="0.8" strokeDasharray="4 6" />
        <circle cx="50%" cy="50%" r="43%" fill="none" stroke="#F5B942" strokeWidth="0.8" strokeDasharray="4 8" />

        {/* Faint Constellation Thread connecting opened stars */}
        {positionedStars
          .filter((s) => s.isOpened)
          .map((star, idx, arr) => {
            if (idx === 0) return null;
            const prev = arr[idx - 1];
            return (
              <line
                key={`line-${star.id}`}
                x1={`${prev.xPercent}%`}
                y1={`${prev.yPercent}%`}
                x2={`${star.xPercent}%`}
                y2={`${star.yPercent}%`}
                stroke="#F5B942"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.35"
              />
            );
          })}
      </svg>

      {/* Central Glowing Diya (Mitti ka Diya with candle flickering flame) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
        {/* Soft Candle-Orange Radial Glow Aura */}
        <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[radial-gradient(circle,#F5B942_0%,#EA580C_35%,rgba(5,6,15,0)_70%)] opacity-35 blur-xl pointer-events-none animate-pulse" />

        {/* Diya Cup & Flame */}
        <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center">
          {/* Flickering Flame */}
          <div className="relative w-6 h-10 -mb-1 animate-diya origin-bottom">
            <div className="w-6 h-9 rounded-[50%_50%_40%_40%/70%_70%_30%_30%] bg-gradient-to-t from-[#DC2626] via-[#F97316] to-[#FEF08A] shadow-[0_0_16px_#F5B942] relative flex items-center justify-center">
              <div className="w-2.5 h-4.5 rounded-full bg-white opacity-85 blur-[0.5px]" />
            </div>
          </div>
          {/* Earthen Clay Diya Body */}
          <div className="w-16 h-7 rounded-b-[24px] rounded-t-[6px] bg-gradient-to-b from-[#B45309] to-[#78350F] shadow-[0_4px_12px_rgba(0,0,0,0.8)] border-t border-[#F59E0B]/50 flex items-center justify-center">
            <div className="w-10 h-1.5 rounded-full bg-[#92400E] opacity-75" />
          </div>
        </div>
      </div>

      {/* Stars on the Night Sky */}
      {positionedStars.map((star, idx) => {
        // Color hints:
        // Kahani = Warm Gold (#F5B942)
        // Sawaal = Soft Blue-White (#BEE3F8)
        // Chunauti = Warm Orange (#FB923C)
        const starColor =
          star.type === 'kahani'
            ? '#F5B942'
            : star.type === 'sawaal'
            ? '#BEE3F8'
            : '#FB923C';

        const glowColor =
          star.type === 'kahani'
            ? 'rgba(245, 185, 66, 0.65)'
            : star.type === 'sawaal'
            ? 'rgba(190, 227, 248, 0.65)'
            : 'rgba(251, 146, 60, 0.65)';

        return (
          <div
            key={star.id}
            style={{
              left: `${star.xPercent}%`,
              top: `${star.yPercent}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-20 group"
          >
            {/* Interactive tap target hitbox: min 48px */}
            <button
              onClick={() => handleOpenStar(star)}
              className="w-12 h-12 flex items-center justify-center rounded-full focus:outline-none cursor-pointer active:scale-90 transition-transform"
              title={`${star.creatorName} ka taara (${star.type})`}
            >
              {star.isOpened ? (
                // Suna ja chuka (Faded outlined ring)
                <div
                  className="w-5 h-5 rounded-full border border-dashed flex items-center justify-center opacity-40 transition-opacity"
                  style={{ borderColor: starColor }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: starColor }} />
                </div>
              ) : (
                // Glowing active star
                <div className="relative flex items-center justify-center">
                  {/* Subtle outer breathing aura */}
                  <div
                    className="absolute w-7 h-7 rounded-full blur-sm opacity-50 animate-twinkle"
                    style={{
                      backgroundColor: glowColor,
                      animationDelay: `${(idx * 0.4) % 3}s`,
                    }}
                  />
                  {/* Star Core */}
                  <div
                    className="relative w-4 h-4 rounded-full flex items-center justify-center transition-all group-hover:scale-125"
                    style={{
                      backgroundColor: starColor,
                      boxShadow: `0 0 12px ${glowColor}, 0 0 4px ${starColor}`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                  </div>
                </div>
              )}
            </button>

            {/* Quiet Creator Label below star */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-wide font-serif opacity-60 text-[#D8CBBA] pointer-events-none">
              {star.creatorName}
            </div>
          </div>
        );
      })}

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
        {/* Procedural Cricket Sound Mute Toggle */}
        <button
          onClick={toggleMute}
          className="min-h-[44px] px-3.5 py-2 rounded-full bg-[#121429]/80 border border-[#2B3050] text-[#D4C7B5] hover:text-[#F5B942] text-xs flex items-center gap-2 backdrop-blur-sm transition-colors cursor-pointer"
          title={isAudioMuted ? 'Cricket sound un-mute karein' : 'Cricket sound mute karein'}
        >
          {isAudioMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#8E8373]" />
              <span className="text-[11px]">Shaant</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#F5B942]" />
              <span className="text-[11px]">Jheenghur Chalu</span>
            </>
          )}
        </button>

        {/* Return of Power (Low-contrast discreet corner button) */}
        <button
          onClick={onReturnOfLight}
          className="min-h-[44px] px-4 py-2 rounded-full bg-[#1A1C33]/70 hover:bg-[#25284B] border border-[#F5B942]/20 hover:border-[#F5B942]/50 text-[#F5B942]/80 hover:text-[#F5B942] text-xs font-serif font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all cursor-pointer"
        >
          <Sun className="w-3.5 h-3.5 text-[#F5B942]" />
          <span>Bijli Aa Gayi</span>
        </button>
      </div>

      {/* "Pass the phone" Prompt (Appears after completing a star) */}
      {passThePhonePrompt && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-sm px-5 py-2.5 rounded-full bg-[#191D3D]/90 border border-[#F5B942]/40 text-[#F5B942] text-xs sm:text-sm font-serif text-center shadow-lg animate-fadeIn backdrop-blur-md">
          {passThePhonePrompt}
        </div>
      )}

      {/* Battery-Friendly Bottom Note */}
      <div className="absolute bottom-4 left-0 right-0 z-30 text-center pointer-events-none px-4">
        <p className="text-[11px] text-[#82786B]/70 tracking-wide font-sans">
          Screen dim hai taaki battery bachi rahe · Phone ko beech mein rakhein
        </p>
      </div>

      {/* EXPANDED STAR CARD MODAL (Candle-Glow Bordered Centerpiece) */}
      {selectedStar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0D0F24]/95 border border-[#F5B942]/40 p-6 sm:p-7 shadow-[0_0_40px_rgba(245,185,66,0.18)] text-[#F3E8D0] space-y-5 animate-scaleUp">
            {/* Candle Glow Top Border Accent */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-[#F5B942] to-transparent" />

            {/* Header: Creator & Relation */}
            <div className="flex items-center justify-between border-b border-[#242A4E] pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#A89C8F]">
                  {selectedStar.type === 'kahani'
                    ? 'Kahani ka Taara'
                    : selectedStar.type === 'sawaal'
                    ? 'Sawaal ka Taara'
                    : 'Chunauti ka Taara'}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#F5B942]">
                  {selectedStar.creatorName} ({selectedStar.relation})
                </h3>
              </div>

              <button
                onClick={handleCloseCard}
                className="w-8 h-8 rounded-full bg-[#171A38] text-[#8C7E70] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Optional Title */}
            {selectedStar.title && (
              <div className="font-serif text-base text-[#FDE047] italic">
                &ldquo;{selectedStar.title}&rdquo;
              </div>
            )}

            {/* CASE 1: KAHANI (VOICE NOTE) */}
            {selectedStar.type === 'kahani' && selectedStar.audioBlob && (
              <div className="space-y-4 text-center py-2">
                {/* Big Glowing Play/Pause Button */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={togglePlayAudio}
                    className="w-18 h-18 rounded-full bg-gradient-to-br from-[#F5B942] to-[#D97706] text-[#2C1804] flex items-center justify-center shadow-[0_0_24px_rgba(245,185,66,0.5)] active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-8 h-8 fill-[#2C1804]" />
                    ) : (
                      <Play className="w-8 h-8 fill-[#2C1804] ml-1" />
                    )}
                  </button>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full bg-[#F5B942] transition-all ${
                        isPlayingAudio ? 'animate-sound-bar' : 'h-1.5 opacity-40'
                      }`}
                      style={{
                        animationDelay: `${(i * 0.08) % 1.2}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Audio Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-[#1A1F3D] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F5B942] h-full transition-all"
                      style={{
                        width: `${Math.min(100, (audioCurrentTime / (audioDuration || 30)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#8C7E70]">
                    <span>{Math.floor(audioCurrentTime)}s</span>
                    <span>{Math.round(audioDuration || 30)}s</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleMarkStoryFinished(selectedStar)}
                    className="w-full min-h-[46px] rounded-xl bg-[#1C2044] hover:bg-[#252A56] text-[#F5B942] text-xs font-semibold flex items-center justify-center gap-2 border border-[#F5B942]/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#F5B942]" />
                    <span>Suna Ja Chuka (Kahani Poori)</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASE 2: KAHANI (TEXT STORY) - Line-by-line Whisper Reveal */}
            {selectedStar.type === 'kahani' && !selectedStar.audioBlob && (
              <div className="space-y-4 py-2">
                <div className="font-serif text-base sm:text-lg leading-relaxed text-[#F3E8D0] space-y-2.5 min-h-[90px]">
                  {selectedStar.textContent
                    ?.split(/(?<=[.?!।])\s+/)
                    .slice(0, revealedLineIndex + 1)
                    .map((line, idx) => (
                      <p key={idx} className="animate-fadeIn">
                        {line}
                      </p>
                    ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleMarkStoryFinished(selectedStar)}
                    className="w-full min-h-[46px] rounded-xl bg-[#1C2044] hover:bg-[#252A56] text-[#F5B942] text-xs font-semibold flex items-center justify-center gap-2 border border-[#F5B942]/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#F5B942]" />
                    <span>Suna Ja Chuka (Kahani Poori)</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASE 3: SAWAAL */}
            {selectedStar.type === 'sawaal' && (
              <div className="space-y-4 py-2">
                {selectedStar.targetPerson && (
                  <div className="text-xs text-[#0284C7] font-semibold bg-[#0369A1]/20 px-3 py-1 rounded-full inline-block">
                    {selectedStar.creatorName} ne poocha hai {selectedStar.targetPerson} se:
                  </div>
                )}

                <div className="font-serif text-lg sm:text-xl text-[#BEE3F8] font-bold leading-relaxed">
                  &ldquo;{selectedStar.textContent}&rdquo;
                </div>

                <div className="pt-3 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleMarkStoryFinished(selectedStar)}
                    className="min-h-[46px] px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Jawab De Diya</span>
                  </button>

                  <button
                    onClick={handleCloseCard}
                    className="min-h-[46px] px-4 py-2 rounded-xl bg-[#171B38] hover:bg-[#20254C] text-[#8C7E70] hover:text-white text-xs font-medium cursor-pointer"
                  >
                    <span>Baad Mein</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASE 4: CHUNAUTI (30s Candle Countdown) */}
            {selectedStar.type === 'chunauti' && (
              <div className="space-y-4 py-2 text-center">
                <div className="font-serif text-base sm:text-lg text-[#FB923C] font-semibold leading-relaxed">
                  &ldquo;{selectedStar.textContent}&rdquo;
                </div>

                {/* Candle Countdown Widget */}
                <div className="rounded-2xl bg-[#141733] border border-[#EA580C]/30 p-4 space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <Flame
                      className={`w-6 h-6 ${
                        challengeSeconds > 0 ? 'text-[#EA580C] animate-diya' : 'text-[#6C5E50]'
                      }`}
                    />
                    <span className="font-serif text-3xl font-bold tabular-nums text-[#FB923C]">
                      {challengeSeconds}s
                    </span>
                  </div>

                  {/* Melting Candle Wax Bar */}
                  <div className="w-full bg-[#080918] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#EA580C] to-[#F5B942] h-full transition-all"
                      style={{
                        width: `${(challengeSeconds / 30) * 100}%`,
                      }}
                    />
                  </div>

                  {challengeSeconds === 0 && (
                    <div className="text-xs text-[#F5B942] font-semibold">
                      🎉 Samay Poora Hua! Shabash!
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleMarkStoryFinished(selectedStar)}
                    className="w-full min-h-[46px] rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#C2410C]/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>Chunauti Poori Hui!</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
