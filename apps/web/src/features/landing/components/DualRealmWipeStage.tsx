import React, { useState, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Languages,
  Layers,
  MessageSquare,
  Calendar,
  Share2,
  ArrowRight,
  Sparkles,
  Clock,
  Sliders,
} from "lucide-react";

interface DualRealmWipeStageProps {
  onEnterApp: (realm: "socializing" | "founders") => void;
}

export const DualRealmWipeStage: React.FC<DualRealmWipeStageProps> = ({
  onEnterApp,
}) => {
  // Slider position from 0 (all founders) to 100 (all social). Default 50 (half-and-half)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 5), 95);
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      updatePosition(e.touches[0].clientX);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Controller & Percentage Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#a09c91]">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>INTERACTIVE REALM CURTAIN</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300">
            Social {Math.round(sliderPos)}% · {Math.round(100 - sliderPos)}% Founders
          </span>
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSliderPos(85)}
            className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-violet-950/40 border border-violet-500/30 text-violet-300 hover:bg-violet-900/50 transition"
          >
            Expand Social
          </button>
          <button
            onClick={() => setSliderPos(50)}
            className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#161822] border border-white/10 text-[#d8d3c7] hover:bg-[#202330] transition"
          >
            Equal Split (50/50)
          </button>
          <button
            onClick={() => setSliderPos(15)}
            className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 transition"
          >
            Expand Founders
          </button>
        </div>
      </div>

      {/* Main Interactive Split Curtain Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[540px] sm:h-[480px] rounded-3xl border border-white/10 overflow-hidden select-none shadow-2xl bg-[#090b10]"
      >
        {/* ── LAYER 1 (BASE): FOUNDERS REALM (Right Side) ── */}
        <div className="absolute inset-0 bg-[#090e0c] p-6 sm:p-10 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-lg">
                🚀
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">Priya Sharma</span>
                  <span className="text-xs font-mono text-emerald-400">@priya_builder</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-[10px] font-mono text-emerald-200 border border-emerald-700/50">
                    Seed AI Founder
                  </span>
                </div>
                <p className="text-xs text-[#8c887e]">
                  Venture ecosystem · Twenty CRM ATS · Cal.com Asia/Kolkata
                </p>
              </div>
            </div>

            <button
              onClick={() => onEnterApp("founders")}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40 flex items-center gap-1.5"
            >
              <span>Enter Founders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Body */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
            <div className="p-4 rounded-2xl bg-[#0d1412] border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Twenty CRM Kanban
                </span>
                <span className="font-mono text-[10px] text-emerald-400">ATS Active</span>
              </div>
              <div className="p-2 rounded-xl bg-[#060a08] border border-white/5 space-y-1 font-mono text-[10px]">
                <div className="text-white font-bold">Aditi Sen · Staff Backend</div>
                <div className="text-[#8c887e]">Stage: Tech Round (2/3)</div>
              </div>
              <p className="text-[11px] text-[#8c887e]">
                6-stage candidate pipeline built into your dashboard.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1412] border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Cal.com Scheduler
                </span>
                <span className="font-mono text-[10px] text-emerald-400">Asia/Kolkata</span>
              </div>
              <div className="p-2 rounded-xl bg-[#060a08] border border-white/5 space-y-1 font-mono text-[10px]">
                <div className="text-white font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> 30-Min Office Hours
                </div>
                <div className="text-emerald-300">Next Slot: 4:30 PM Today</div>
              </div>
              <p className="text-[11px] text-[#8c887e]">
                Automatic calendar sync for mentor & investor sessions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1412] border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  Dub.co Attribution
                </span>
                <span className="font-mono text-[10px] text-cyan-400">+48.2%</span>
              </div>
              <div className="p-2 rounded-xl bg-[#060a08] border border-white/5 space-y-1 font-mono text-[10px]">
                <div className="text-emerald-300 font-bold">balaga.link/p/neural</div>
                <div className="text-white">1,842 Unique Demo Clicks</div>
              </div>
              <p className="text-[11px] text-[#8c887e]">
                Track referral sources and conversions in real time.
              </p>
            </div>
          </div>

          {/* Security stamp */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8c887e] border-t border-emerald-500/10 pt-3">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Founders Data Isolated · Row-Level Security
            </span>
            <span>x-platform-world: founders</span>
          </div>
        </div>

        {/* ── LAYER 2 (CLIPPED OVERLAY): SOCIALIZING REALM (Left Side) ── */}
        <div
          className="absolute inset-0 bg-[#0d0914] p-6 sm:p-10 flex flex-col justify-between overflow-hidden"
          style={{
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-violet-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-lg">
                🎨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">Aarav Social</span>
                  <span className="text-xs font-mono text-violet-400">@aarav_social</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-900/60 text-[10px] font-mono text-violet-200 border border-violet-700/50">
                    Bengaluru Explorer
                  </span>
                </div>
                <p className="text-xs text-[#8c887e]">
                  Vernacular reels · IndicTrans2 Bhasha · Hey.xyz Quad Media
                </p>
              </div>
            </div>

            <button
              onClick={() => onEnterApp("socializing")}
              className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-lg shadow-violet-900/40 flex items-center gap-1.5"
            >
              <span>Enter Socializing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Body */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
            <div className="p-4 rounded-2xl bg-[#140e1f] border border-violet-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-violet-300">
                <span className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-violet-400" />
                  IndicTrans2 AI
                </span>
                <span className="font-mono text-[10px] text-amber-400">Kannada</span>
              </div>
              <div className="p-2 rounded-xl bg-[#09060f] border border-white/5 space-y-1 font-mono text-[10px]">
                <div className="text-white font-bold">ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು! ಕಾಫಿ ಟೈಮ್ ☕</div>
                <div className="text-violet-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  "Hello Bengaluru! Coffee time ☕"
                </div>
              </div>
              <p className="text-[11px] text-[#8c887e]">
                10+ Indian language scripts auto-detected and translated.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#140e1f] border border-violet-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-violet-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-400" />
                  Hey.xyz Quad Media
                </span>
                <span className="font-mono text-[10px] text-violet-400">4-Quad Grid</span>
              </div>
              <div className="p-2 rounded-xl bg-[#09060f] border border-white/5 grid grid-cols-2 gap-1 text-[9px] font-mono text-center">
                <div className="p-1 rounded bg-violet-950/60 text-violet-200">Cubbon Park</div>
                <div className="p-1 rounded bg-fuchsia-950/60 text-fuchsia-200">Indiranagar</div>
              </div>
              <p className="text-[11px] text-[#8c887e]">
                Zero-compression 4K lightbox galleries and reels.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#140e1f] border border-violet-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-violet-300">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                  Chatwoot DMs
                </span>
                <span className="font-mono text-[10px] text-cyan-400">✓✓ Read</span>
              </div>
              <div className="p-2 rounded-xl bg-[#09060f] border border-white/5 space-y-1 font-mono text-[10px]">
                <div className="text-[#8c887e]">"Badminton tonight at 7 PM? 🏸"</div>
                <div className="text-violet-300">"I'm in! Bringing racquets."</div>
              </div>
              <p className="text-[11px] text-[#8c887e]">
                Encrypted chat without leaking private phone numbers.
              </p>
            </div>
          </div>

          {/* Security stamp */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8c887e] border-t border-violet-500/10 pt-3">
            <span className="text-violet-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Social Data Isolated · Row-Level Security
            </span>
            <span>x-platform-world: socializing</span>
          </div>
        </div>

        {/* ── INTERACTIVE DRAGGABLE DIVIDER HANDLE ── */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-200 to-amber-500 cursor-ew-resize z-30 shadow-2xl shadow-amber-500/50"
          style={{
            left: `${sliderPos}%`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Circular tactile center knob */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#07080a] border-2 border-amber-400 shadow-2xl shadow-amber-400/60 flex items-center justify-center text-[#e5a855] text-xs font-bold transition-transform hover:scale-110 active:scale-95"
            title="Drag horizontally to wipe between Socializing and Founders"
          >
            ↔
          </div>
        </div>
      </div>
    </div>
  );
};
