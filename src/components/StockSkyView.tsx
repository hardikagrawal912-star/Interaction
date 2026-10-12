import React, { useState, useRef, useEffect } from 'react';
import { StarItem, StarType, FamilyRelation } from '../types';
import { VoiceRecorder, RecordingResult } from '../services/voiceRecorder';
import {
  Mic,
  Square,
  RotateCcw,
  Sparkles,
  Trash2,
  Lock,
  Volume2,
  HelpCircle,
  Flame,
  CheckCircle,
  AlertCircle,
  VolumeX,
} from 'lucide-react';

interface StockSkyViewProps {
  stars: StarItem[];
  onAddStar: (star: StarItem) => Promise<void>;
  onDeleteStar: (id: string) => Promise<void>;
  onAddStarterContent: () => Promise<void>;
}

const RELATIONS: FamilyRelation[] = [
  'Dadi',
  'Nani',
  'Papa',
  'Mummy',
  'Bhai',
  'Behen',
  'Dost',
  'Dada',
  'Nana',
  'Other',
];

export const StockSkyView: React.FC<StockSkyViewProps> = ({
  stars,
  onAddStar,
  onDeleteStar,
  onAddStarterContent,
}) => {
  // Form State
  const [creatorName, setCreatorName] = useState('');
  const [relation, setRelation] = useState<FamilyRelation>('Dadi');
  const [starType, setStarType] = useState<StarType>('kahani');
  const [kahaniMode, setKahaniMode] = useState<'voice' | 'text'>('voice');
  const [storyTitle, setStoryTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [targetPerson, setTargetPerson] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<RecordingResult | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioWaveVolume, setAudioWaveVolume] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const recorderRef = useRef<VoiceRecorder | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
      }
    };
  }, []);

  // Handle start recording
  const handleStartRecording = async () => {
    setAudioError(null);
    setRecordedAudio(null);
    setRecordingSeconds(0);
    const recorder = new VoiceRecorder();
    recorderRef.current = recorder;

    try {
      setIsRecording(true);
      await recorder.startRecording(
        (elapsed) => setRecordingSeconds(elapsed),
        async () => {
          // Max 30 seconds reached
          try {
            const res = await recorder.stopRecording();
            setRecordedAudio(res);
            setIsRecording(false);
          } catch {
            setIsRecording(false);
          }
        },
        (amplitude) => setAudioWaveVolume(amplitude)
      );
    } catch (err: unknown) {
      setIsRecording(false);
      const e = err as { message?: string };
      setAudioError(e.message || 'Mic chalu nahi ho saka. Text kahani likhein!');
      setKahaniMode('text'); // graceful text fallback on permission denial
    }
  };

  // Handle stop recording
  const handleStopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;
    try {
      const res = await recorderRef.current.stopRecording();
      setRecordedAudio(res);
      setIsRecording(false);
    } catch (err: unknown) {
      setIsRecording(false);
      const e = err as { message?: string };
      setAudioError(e.message || 'Audio save nahi ho paya.');
    }
  };

  // Handle re-record
  const handleReRecord = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setRecordedAudio(null);
    setRecordingSeconds(0);
    setIsPlayingPreview(false);
  };

  // Handle preview audio play/stop
  const handleTogglePreviewPlay = () => {
    if (!recordedAudio) return;
    if (!audioPreviewRef.current) {
      const audioUrl = URL.createObjectURL(recordedAudio.blob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingPreview(false);
      audioPreviewRef.current = audio;
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  // Submit Star to Sky
  const handleSubmitStar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim()) {
      alert('Kripya apna naam darj karein!');
      return;
    }

    if (starType === 'kahani') {
      if (kahaniMode === 'voice' && !recordedAudio) {
        alert('Kripya 30 second ki aawaz record karein ya text story chunein!');
        return;
      }
      if (kahaniMode === 'text' && !textContent.trim()) {
        alert('Kripya kahani ka text likhein!');
        return;
      }
    } else if (starType === 'sawaal' && !textContent.trim()) {
      alert('Kripya sawaal likhein!');
      return;
    } else if (starType === 'chunauti' && !textContent.trim()) {
      alert('Kripya chunauti ka vivaran likhein!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Seeded positioning math
      const ringIndex = (stars.length % 3) + 1;
      const angleRatio = ((stars.length * 137.5) % 360) / 360;
      const radiusRatio = 0.22 + ringIndex * 0.12;

      const newStar: StarItem = {
        id: `star_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        creatorName: creatorName.trim(),
        relation,
        type: starType,
        title: storyTitle.trim() || undefined,
        textContent: textContent.trim() || undefined,
        audioBlob: kahaniMode === 'voice' ? recordedAudio?.blob : undefined,
        audioDuration: kahaniMode === 'voice' ? recordedAudio?.duration : undefined,
        targetPerson: starType === 'sawaal' ? (targetPerson.trim() || 'Sabhi se') : undefined,
        createdAt: Date.now(),
        ringIndex,
        angleRatio,
        radiusRatio,
      };

      await onAddStar(newStar);

      // Reset form
      setTextContent('');
      setStoryTitle('');
      setTargetPerson('');
      setRecordedAudio(null);
      setRecordingSeconds(0);
      setFormSuccessMessage(`Ek naya taara aasman mein jagmagane laga! ✨`);
      setTimeout(() => setFormSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Taara jodne mein samasya aayi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFC8] pb-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E]">
            Aasman Bharo (Stock the Sky)
          </h2>
          <p className="text-sm text-[#6A5D50] mt-0.5">
            Light jaane se pehle ek kissa, sawaal ya chunauti aasman mein chhod dein.
          </p>
        </div>

        <button
          onClick={onAddStarterContent}
          className="self-start sm:self-auto min-h-[44px] px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#EAA82F] text-[#452205] text-xs font-semibold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Surprise Me (10 Starter Stories)</span>
        </button>
      </div>

      {formSuccessMessage && (
        <div className="p-4 rounded-2xl bg-[#EAF5E9] border border-[#BDE0BC] text-[#1E5D2D] text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-[#2E7D32] shrink-0" />
          <span className="font-medium">{formSuccessMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmitStar}
        className="rounded-3xl bg-white/85 border border-[#E5DAC1] p-5 sm:p-8 space-y-6 shadow-sm"
      >
        {/* Creator Name & Relation */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6A5D50]">
            01. Yeh Taara Kaun Chhod Raha Hai?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="Aapka Naam (jaise: Sunita, Aarav)"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                required
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#FAF6EC] border border-[#DACDB3] text-[#2C241E] text-sm placeholder-[#9C8F80] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40"
              />
            </div>

            {/* Relation Picker Chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {RELATIONS.map((rel) => (
                <button
                  type="button"
                  key={rel}
                  onClick={() => setRelation(rel)}
                  className={`min-h-[36px] px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    relation === rel
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'bg-[#F2ECE0] text-[#5C5042] hover:bg-[#EBE2D2]'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Star Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6A5D50]">
            02. Taare Ka Prakaar Chunein
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setStarType('kahani')}
              className={`min-h-[50px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                starType === 'kahani'
                  ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] ring-2 ring-[#F59E0B]/30'
                  : 'bg-[#FAF6EC] border-[#E8DFC8] text-[#5C5042] hover:bg-[#F5EEDD]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-serif font-bold text-sm">
                <Volume2 className="w-4 h-4 text-[#D97706]" />
                <span>Kahani</span>
              </div>
              <span className="text-[11px] text-[#786C5E] mt-0.5">30s Awaaz ya Text</span>
            </button>

            <button
              type="button"
              onClick={() => setStarType('sawaal')}
              className={`min-h-[50px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                starType === 'sawaal'
                  ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1] ring-2 ring-[#0284C7]/30'
                  : 'bg-[#FAF6EC] border-[#E8DFC8] text-[#5C5042] hover:bg-[#F5EEDD]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-serif font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-[#0284C7]" />
                <span>Sawaal</span>
              </div>
              <span className="text-[11px] text-[#786C5E] mt-0.5">Parivar ke liye prashn</span>
            </button>

            <button
              type="button"
              onClick={() => setStarType('chunauti')}
              className={`min-h-[50px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                starType === 'chunauti'
                  ? 'bg-[#FFEDD5] border-[#EA580C] text-[#C2410C] ring-2 ring-[#EA580C]/30'
                  : 'bg-[#FAF6EC] border-[#E8DFC8] text-[#5C5042] hover:bg-[#F5EEDD]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-serif font-bold text-sm">
                <Flame className="w-4 h-4 text-[#EA580C]" />
                <span>Chunauti</span>
              </div>
              <span className="text-[11px] text-[#786C5E] mt-0.5">30s Andhere ka Khel</span>
            </button>
          </div>
        </div>

        {/* Content Section: Kahani */}
        {starType === 'kahani' && (
          <div className="space-y-4 rounded-2xl bg-[#FAF6EC] border border-[#E8DFC8] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5A4C3D] uppercase tracking-wider">
                Kahani Record Karein Ya Likhein
              </span>
              <div className="flex items-center gap-1 bg-[#EBE2D2] p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setKahaniMode('voice')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    kahaniMode === 'voice'
                      ? 'bg-white text-[#2C241E] font-semibold shadow-xs'
                      : 'text-[#6C5E50]'
                  }`}
                >
                  🎙️ Voice Note (30s)
                </button>
                <button
                  type="button"
                  onClick={() => setKahaniMode('text')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    kahaniMode === 'text'
                      ? 'bg-white text-[#2C241E] font-semibold shadow-xs'
                      : 'text-[#6C5E50]'
                  }`}
                >
                  ✍️ Text Story
                </button>
              </div>
            </div>

            {/* Optional Story Title / Caption */}
            <div>
              <label className="block text-xs font-medium text-[#6A5D50] mb-1">
                Kahani ka Naam / Kicker (Optional)
              </label>
              <input
                type="text"
                placeholder="Jaise: 'Bachpan ki Garmi' ya 'Pehli Cycle'"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                maxLength={60}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-[#D5C6A8] text-sm text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30"
              />
            </div>

            {kahaniMode === 'voice' ? (
              <div className="space-y-3">
                {audioError && (
                  <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{audioError}</span>
                  </div>
                )}

                {!recordedAudio ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="relative inline-flex items-center justify-center">
                      {isRecording && (
                        <div
                          className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60"
                          style={{
                            transform: `scale(${1 + audioWaveVolume * 0.8})`,
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 cursor-pointer z-10 ${
                          isRecording
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-[#C85A32] hover:bg-[#B34923]'
                        }`}
                      >
                        {isRecording ? (
                          <Square className="w-6 h-6 fill-white" />
                        ) : (
                          <Mic className="w-7 h-7" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[#2C241E]">
                        {isRecording ? (
                          <span className="text-red-600 font-mono text-base">
                            Recording chalu hai: {recordingSeconds}s / 30s
                          </span>
                        ) : (
                          'Laal button daba kar 30s tak bolein'
                        )}
                      </div>
                      <p className="text-xs text-[#786C5E]">
                        {isRecording
                          ? 'Khatam karne ke liye dobara tap karein'
                          : 'Yeh aawaz night mode tak seal rahegi'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-[#D5C6A8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#246B34] flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
                          Audio Record Ho Gaya ({recordedAudio.duration}s)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleReRecord}
                        className="text-xs text-[#C85A32] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Dobara Record Karein</span>
                      </button>
                    </div>

                    {/* Preview Player */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleTogglePreviewPlay}
                        className="px-4 py-2 rounded-xl bg-[#EFE2C7] hover:bg-[#E5D7B7] text-[#2C241E] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        {isPlayingPreview ? (
                          <>
                            <VolumeX className="w-4 h-4 text-[#C85A32]" />
                            <span>Sunna Rokein</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-[#C85A32]" />
                            <span>Preview Sunein</span>
                          </>
                        )}
                      </button>
                      <span className="text-xs text-[#8C7E70] italic">
                        (Andhera mode mein yeh taara ban kar chamkega)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  rows={3}
                  maxLength={280}
                  placeholder="Apni kahani likhein... (max 280 characters)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#D5C6A8] text-sm text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 resize-none"
                />
                <div className="text-right text-[11px] text-[#8C7E70] mt-1 tabular-nums">
                  {textContent.length} / 280 akshar
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Section: Sawaal */}
        {starType === 'sawaal' && (
          <div className="space-y-4 rounded-2xl bg-[#FAF6EC] border border-[#E8DFC8] p-4 sm:p-5">
            <div>
              <label className="block text-xs font-semibold text-[#5A4C3D] uppercase tracking-wider mb-1">
                Kisse Poochna Hai?
              </label>
              <input
                type="text"
                placeholder="Jaise: Dadi se, Papa se, Ya Poore Parivar se"
                value={targetPerson}
                onChange={(e) => setTargetPerson(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-[#D5C6A8] text-sm text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4C3D] uppercase tracking-wider mb-1">
                Aapka Sawaal
              </label>
              <textarea
                rows={3}
                maxLength={200}
                placeholder="Jaise: 'Aapki pehli salary kitni thi aur aapne sabse pehle kya khareeda tha?'"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                required
                className="w-full p-3 rounded-xl bg-white border border-[#D5C6A8] text-sm text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 resize-none"
              />
              <div className="text-right text-[11px] text-[#8C7E70] mt-1 tabular-nums">
                {textContent.length} / 200 akshar
              </div>
            </div>
          </div>
        )}

        {/* Content Section: Chunauti */}
        {starType === 'chunauti' && (
          <div className="space-y-4 rounded-2xl bg-[#FAF6EC] border border-[#E8DFC8] p-4 sm:p-5">
            <div>
              <label className="block text-xs font-semibold text-[#5A4C3D] uppercase tracking-wider mb-1">
                Andhere Ki Chunauti (30 Second Challenge)
              </label>
              <textarea
                rows={3}
                maxLength={200}
                placeholder="Jaise: 'Bina dekhe ghar ka koi ek purana gaana gungunao' ya 'Haath se chhat par jaanwar ki parchhai banao'"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                required
                className="w-full p-3 rounded-xl bg-white border border-[#D5C6A8] text-sm text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/30 resize-none"
              />
              <div className="text-right text-[11px] text-[#8C7E70] mt-1 tabular-nums">
                {textContent.length} / 200 akshar
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || isRecording}
            className="w-full min-h-[50px] px-6 py-3 rounded-2xl bg-[#C85A32] hover:bg-[#B34923] disabled:opacity-50 text-white font-medium text-sm sm:text-base shadow-md shadow-[#C85A32]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-[#FDE047]" />
            <span>{isSubmitting ? 'Taara jud raha hai...' : 'Aasman Mein Chamkao (Add Star)'}</span>
          </button>
        </div>
      </form>

      {/* Existing Stars List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-[#2C241E] flex items-center gap-2">
            <span>Aasman ke Maujooda Taare</span>
            <span className="text-xs font-sans font-normal text-[#786C5E] bg-[#EFE7D3] px-2.5 py-0.5 rounded-full">
              {stars.length} Taare
            </span>
          </h3>
        </div>

        {stars.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/70 border border-[#E5DAC1] text-center text-sm text-[#786C5E]">
            Abhi koi taara nahi hai. Upar diye gaye form se pehla kissa jodein!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {stars.map((star) => (
              <div
                key={star.id}
                className="rounded-2xl bg-white border border-[#E5DAC1] p-4 flex flex-col justify-between shadow-xs hover:border-[#D5C6A8] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold ${
                          star.type === 'kahani'
                            ? 'bg-[#FEF3C7] text-[#B45309]'
                            : star.type === 'sawaal'
                            ? 'bg-[#E0F2FE] text-[#0369A1]'
                            : 'bg-[#FFEDD5] text-[#C2410C]'
                        }`}
                      >
                        {star.type === 'kahani' ? 'K' : star.type === 'sawaal' ? 'S' : 'C'}
                      </span>
                      <span className="font-semibold text-sm text-[#2C241E]">
                        {star.creatorName}
                      </span>
                      <span className="text-xs text-[#8C7E70]">({star.relation})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteStar(star.id)}
                      className="text-[#A39688] hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Taara hatayein"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {star.title && (
                    <div className="font-serif font-bold text-sm text-[#42362B] mt-2">
                      {star.title}
                    </div>
                  )}

                  {star.targetPerson && (
                    <div className="text-[11px] text-[#0369A1] font-medium mt-1">
                      Poocha gaya: {star.targetPerson}
                    </div>
                  )}

                  <p className="text-xs text-[#5C4F40] mt-1.5 leading-relaxed">
                    {star.textContent || (star.audioBlob ? '🎙️ Awaaz ki kahani' : 'Kissa')}
                  </p>
                </div>

                {/* Sealed Voice Indicator */}
                {star.audioBlob && (
                  <div className="mt-3 pt-2.5 border-t border-[#F2ECE0] flex items-center justify-between text-[11px] text-[#8C7E70]">
                    <span className="flex items-center gap-1.5 text-[#B45309] font-medium">
                      <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Sealed Voice Note ({star.audioDuration || 30}s)</span>
                    </span>
                    <span className="text-[10px] text-[#A89C8F]">Andhera hone par khulega</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
