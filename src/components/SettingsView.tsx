import React, { useState, useRef } from 'react';
import { exportAllDataAsJson, importDataFromJson } from '../services/db';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Smartphone,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Info,
  X,
} from 'lucide-react';

interface SettingsViewProps {
  demoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onClearAllData: () => Promise<void>;
  onDataImported: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  demoMode,
  onToggleDemoMode,
  onClearAllData,
  onDataImported,
}) => {
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Export JSON Backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const jsonString = await exportAllDataAsJson();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kahani-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Kahaniyon ka backup safaltapoorvak download ho gaya!');
    } catch (err) {
      console.error(err);
      setErrorMessage('Backup download karne mein samasya aayi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON Backup
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const text = await file.text();
      const result = await importDataFromJson(text);
      await onDataImported();
      setStatusMessage(
        `Backup restore safal raha! (${result.starsCount} taare aur ${result.historyCount} raatein wapas aa gayi)`
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'File format galat hai.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Confirm Clear All Data
  const handleConfirmClear = async () => {
    try {
      await onClearAllData();
      setShowClearConfirmModal(false);
      setStatusMessage('Saara data aur audio notes permanently hata diye gaye hain.');
    } catch {
      setErrorMessage('Data clear karne mein samasya aayi.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E8DFC8] pb-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#C85A32]" />
          <span>Settings & Data Prabandhan</span>
        </h2>
        <p className="text-sm text-[#6C5E50] mt-1">
          Backup, PWA app installation aur demo mode settings.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-[#EAF5E9] border border-[#BDE0BC] text-[#1E5D2D] text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#2E7D32] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: PWA APP INSTALLATION */}
      <div className="rounded-3xl bg-white border border-[#E5DAC1] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#2C241E] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#C85A32]" />
              <span>Offline App (PWA) Install</span>
            </h3>
            <p className="text-xs text-[#6C5E50]">
              Phone ke home screen par install karein taaki bina internet ke airplane mode mein bhi chale.
            </p>
          </div>

          <div>
            {isInstalled ? (
              <span className="text-xs bg-[#EAF5E9] text-[#246B34] font-semibold px-3 py-1.5 rounded-full border border-[#BDE0BC]">
                Installed ✓
              </span>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-semibold shadow-xs hover:bg-[#B34923] cursor-pointer"
              >
                Install App
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSModal(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FAF6EC] border border-[#DACDB3] text-[#2C241E] text-xs font-semibold hover:bg-[#F3EBD8] cursor-pointer"
              >
                Install on iPhone
              </button>
            ) : (
              <span className="text-xs text-[#8C7E70] bg-[#F2ECE0] px-3 py-1 rounded-full">
                Browser Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: DEMO MODE TOGGLE */}
      <div className="rounded-3xl bg-white border border-[#E5DAC1] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#2C241E]">
              Demo Mode
            </h3>
            <p className="text-xs text-[#6C5E50] leading-relaxed">
              Video recording ya demonstration ke liye. Real offline detection ke 2s debounce ko bypass karta hai aur &ldquo;Light Gayi&rdquo; dabate hi turant Andhera Mode chalu karta hai.
            </p>
          </div>

          <button
            onClick={() => onToggleDemoMode(!demoMode)}
            className="text-2xl text-[#C85A32] cursor-pointer shrink-0"
            title="Demo mode toggle"
          >
            {demoMode ? (
              <ToggleRight className="w-10 h-10 text-[#246B34]" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-[#8C7E70]" />
            )}
          </button>
        </div>
        <div className="text-[11px] text-[#786C5E] font-medium">
          Status: {demoMode ? '✅ Demo Mode Chalu Hai (Instant Trigger)' : '⚪ Normal Mode (Real Offline Detection Active)'}
        </div>
      </div>

      {/* SECTION 3: BACKUP & RESTORE STORIES */}
      <div className="rounded-3xl bg-white border border-[#E5DAC1] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-[#2C241E]">
            Backup & Export
          </h3>
          <p className="text-xs text-[#6C5E50]">
            Browser data clear hone par bhi parivar ke audio notes aur yaadein na khoyen, isliye backup save karein.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2C241E] hover:bg-[#1A1512] text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-[#F5B942]" />
            <span>{isExporting ? 'Exporting...' : 'Export All Stories (JSON Backup)'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF6EC] hover:bg-[#F3EBD8] border border-[#DACDB3] text-[#2C241E] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 text-[#C85A32]" />
            <span>Import / Restore Backup</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: CLEAR DATA (WITH STRICT CONFIRMATION) */}
      <div className="rounded-3xl bg-[#FFF5F5] border border-[#FED7D7] p-5 sm:p-6 space-y-3 shadow-xs">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-[#C53030] flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#C53030]" />
            <span>Clear Data (Khatam Karein)</span>
          </h3>
          <p className="text-xs text-[#742A2A]">
            IndexedDB se saare recorded voice notes, text kisse aur pichhli raaton ka itihaas hamesha ke liye delete ho jayega.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E53E3E] hover:bg-[#C53030] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR CLEAR DATA */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#FEB2B2] p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FED7D7] text-[#C53030] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="font-serif text-lg font-bold text-[#2C241E]">
                Kya aap sach mein sab delete karna chahte hain?
              </h4>
              <p className="text-xs text-[#6C5E50] leading-relaxed">
                Warning: Aapke parivar ke <strong>recorded voice notes</strong>, kahaniyan aur <strong>constellation history</strong> permanently delete ho jayenge. Iske baad inhe recover nahi kiya ja sakega.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="min-h-[44px] rounded-xl bg-[#FAF6EC] border border-[#DACDB3] text-[#2C241E] text-xs font-semibold hover:bg-[#F3EBD8] cursor-pointer"
              >
                Roko (Cancel)
              </button>

              <button
                onClick={handleConfirmClear}
                className="min-h-[44px] rounded-xl bg-[#E53E3E] text-white text-xs font-semibold hover:bg-[#C53030] cursor-pointer shadow-sm"
              >
                Haan, Delete Karein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS INSTALLATION GUIDE MODAL */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#E5DAC1] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-2">
              <h4 className="font-serif text-base font-bold text-[#2C241E]">
                iPhone / iPad Par Install Karein
              </h4>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-[#8C7E70] hover:text-[#2C241E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#5C4F40] space-y-3">
              <p>
                1. Safari browser ke neeche <strong>Share</strong> button (📤) par tap karein.
              </p>
              <p>
                2. Menu ko thoda scroll karke <strong>Add to Home Screen</strong> (होम स्क्रीन में जोड़ें) chunein.
              </p>
              <p>
                3. Upar right corner mein <strong>Add</strong> dabayein. App aapke phone mein install ho jayegi!
              </p>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full min-h-[44px] rounded-xl bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B34923]"
            >
              Samajh Gaya (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
