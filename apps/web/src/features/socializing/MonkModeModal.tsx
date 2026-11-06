import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import {
  X,
  Moon,
  Sparkles,
  BellOff,
} from "lucide-react";

interface MonkModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMonkModeActive: boolean;
  onToggleMonkMode: (durationMinutes: number) => void;
}

export const MonkModeModal: React.FC<MonkModeModalProps> = ({
  isOpen,
  onClose,
  isMonkModeActive,
  onToggleMonkMode,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [emergencyBypassAllowed, setEmergencyBypassAllowed] = useState(true);

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onToggleMonkMode(selectedDuration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Monk Mode / Deep-Work Cloak
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded">
                  WELL-BEING
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Calming digital pause • Zero feed doomscrolling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isMonkModeActive ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center mx-auto text-indigo-300 animate-pulse">
                <Moon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Monk Mode is Active 🧘
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                  Your feeds are shielded, notifications muted, and mind protected. Take this time for deep craft, reading, or rest.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
                <BellOff className="w-3.5 h-3.5 text-indigo-400" />
                <span>Emergency Breakthrough Ping: Enabled for close friends</span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onToggleMonkMode(0);
                  onClose();
                }}
                className="w-full text-xs font-semibold py-2"
              >
                Exit Monk Mode
              </Button>
            </div>
          ) : (
            <form onSubmit={handleStart} className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 p-3.5 rounded-2xl border border-indigo-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Silence is not the absence of sound, but the presence of focus." Shield your workspace from algorithm traps for a dedicated session.
                </p>
              </div>

              {/* Duration selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 45, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedDuration(mins)}
                      className={`py-3 px-2 rounded-xl border text-center transition-all ${
                        selectedDuration === mins
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/40"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="block text-base font-bold font-mono">
                        {mins}m
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {mins === 25 ? "Pomodoro" : mins === 45 ? "Deep Focus" : "Monk Sprint"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety: Emergency Bypass */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Allow Emergency Breakthrough
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Close friends can bypass cloak if urgent
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emergencyBypassAllowed}
                  onChange={(e) => setEmergencyBypassAllowed(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 w-4 h-4"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-1.5"
                >
                  <Moon className="w-4 h-4" />
                  <span>Enter Monk Mode ({selectedDuration} mins)</span>
                </Button>
              </div>
            </form>
          )}

          <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800">
            Balaga Digital Well-Being Guarantee • Zero algorithmic guilt
          </div>
        </div>
      </div>
    </div>
  );
};
