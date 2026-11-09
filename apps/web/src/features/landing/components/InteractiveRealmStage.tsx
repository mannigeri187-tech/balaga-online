import React, { useState } from "react";
import {
  Heart,
  Rocket,
  ShieldCheck,
  Languages,
  Layers,
  MessageSquare,
  Calendar,
  Share2,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";

interface InteractiveRealmStageProps {
  onEnterApp: (realm: "socializing" | "founders") => void;
}

export const InteractiveRealmStage: React.FC<InteractiveRealmStageProps> = ({
  onEnterApp,
}) => {
  const [activeRealm, setActiveRealm] = useState<"socializing" | "founders">("socializing");

  const isSocial = activeRealm === "socializing";

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-[#0e1015]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden transition-all duration-500">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
            [ 03 // LIVE TRANSFORMATION STAGE ]
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#fcfbf9] mt-1">
            Test the Bifurcation Live
          </h3>
          <p className="text-xs text-[#a09c91] mt-0.5">
            Switch state below to watch the entire UI, cryptographic header, and data pipeline mutate.
          </p>
        </div>

        {/* Tactile Switcher */}
        <div className="flex items-center p-1.5 rounded-full bg-[#161820] border border-white/10 shadow-inner w-fit">
          <button
            onClick={() => setActiveRealm("socializing")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              isSocial
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/50"
                : "text-[#8c887d] hover:text-white"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Socializing Realm</span>
          </button>

          <button
            onClick={() => setActiveRealm("founders")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              !isSocial
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/50"
                : "text-[#8c887d] hover:text-white"
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Founders Realm</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Body */}
      <div className="pt-8">
        {isSocial ? (
          /* SOCIALIZING REALM VIEW */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-violet-950/20 border border-violet-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-lg">
                  🎨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Aarav Social</span>
                    <span className="text-[11px] font-mono text-violet-400">@aarav_social</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-900/50 text-[10px] font-mono text-violet-200 border border-violet-700/50">
                      Bengaluru · Koramangala
                    </span>
                  </div>
                  <p className="text-xs text-[#a09c91] mt-0.5">
                    Street photographer · Weekend badminton player · Kannada & Hindi vernacular explorer
                  </p>
                </div>
              </div>

              <button
                onClick={() => onEnterApp("socializing")}
                className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-900/40 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>Launch Socializing World</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1: IndicTrans2 */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-300 text-xs font-bold">
                    <Languages className="w-4 h-4 text-violet-400" />
                    <span>IndicTrans2 Bhasha</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Auto-Detect</span>
                </div>
                <div className="p-3 rounded-xl bg-[#090a0f] border border-white/5 space-y-1.5 font-sans">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">ನಮಸ್ಕಾರ ಬೆಂಗಳೂರು! ಕಾಫಿ ಟೈಮ್ ☕</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-900/60 text-violet-200">
                      Kannada
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8e8a7f] flex items-center gap-1 pt-1 border-t border-white/5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Translated: "Hello Bengaluru! Coffee time ☕"</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8e8a7f] leading-relaxed">
                  Deep learning Vernacular AI. Preserves cultural nuances across Kannada, Hindi, Tamil, and Telugu without broken transliteration.
                </p>
              </div>

              {/* Feature 2: Hey.xyz Quad Grid */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-300 text-xs font-bold">
                    <Layers className="w-4 h-4 text-violet-400" />
                    <span>Hey.xyz Quad Media</span>
                  </div>
                  <span className="text-[10px] font-mono text-violet-400">4K Lightbox</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden p-1 bg-[#090a0f] border border-white/5">
                  <div className="h-12 rounded bg-gradient-to-br from-violet-600/40 to-fuchsia-600/30 flex items-center justify-center text-[10px] font-mono text-violet-200">
                    Cubbon Park
                  </div>
                  <div className="h-12 rounded bg-gradient-to-br from-indigo-600/40 to-violet-600/30 flex items-center justify-center text-[10px] font-mono text-violet-200">
                    Indiranagar
                  </div>
                  <div className="h-12 rounded bg-gradient-to-br from-fuchsia-600/40 to-pink-600/30 flex items-center justify-center text-[10px] font-mono text-violet-200">
                    Filter Coffee
                  </div>
                  <div className="h-12 rounded bg-gradient-to-br from-purple-600/40 to-indigo-600/30 flex items-center justify-center text-[10px] font-mono text-violet-200">
                    +12 Photos
                  </div>
                </div>
                <p className="text-[11px] text-[#8e8a7f] leading-relaxed">
                  Responsive quad photography matrices with zero algorithmic compression, high frame rates, and lightbox carousel viewing.
                </p>
              </div>

              {/* Feature 3: Chatwoot DMs */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-300 text-xs font-bold">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    <span>Chatwoot Real-Time DMs</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/5 space-y-1.5">
                  <div className="flex justify-start">
                    <span className="bg-[#1b1e2c] text-white text-[10px] px-2.5 py-1 rounded-xl rounded-bl-none">
                      Badminton tonight at 7 PM? 🏸
                    </span>
                  </div>
                  <div className="flex justify-end items-center gap-1">
                    <span className="bg-violet-600 text-white text-[10px] px-2.5 py-1 rounded-xl rounded-br-none">
                      I'm in! Bringing the racquets.
                    </span>
                    <span className="text-[9px] text-cyan-400 font-bold">✓✓</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8e8a7f] leading-relaxed">
                  Private peer messaging with double blue read receipts and hover emoji docks without sharing personal phone numbers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* FOUNDERS REALM VIEW */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-lg">
                  🚀
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Priya Sharma</span>
                    <span className="text-[11px] font-mono text-emerald-400">@priya_builder</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-[10px] font-mono text-emerald-200 border border-emerald-700/50">
                      Seed Stage · AI/ML
                    </span>
                  </div>
                  <p className="text-xs text-[#a09c91] mt-0.5">
                    Founder @ NeuralForge · Hiring Senior Backend (Go/Rust) · Seeking Seed Syndicate
                  </p>
                </div>
              </div>

              <button
                onClick={() => onEnterApp("founders")}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-900/40 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>Launch Founders World</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1: Twenty CRM Kanban */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Twenty CRM Kanban ATS</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">6 Stages</span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-[#090a0f] border border-white/5 text-[9px] font-mono">
                  <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
                    <div className="font-bold text-[8px] text-[#7d7a71]">SCREEN (3)</div>
                    <div className="truncate mt-1 text-white">Rohit M.</div>
                  </div>
                  <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-200">
                    <div className="font-bold text-[8px] text-[#7d7a71]">TECH (2)</div>
                    <div className="truncate mt-1 text-white">Aditi S.</div>
                  </div>
                  <div className="p-1.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-200">
                    <div className="font-bold text-[8px] text-[#7d7a71]">OFFER (1)</div>
                    <div className="truncate mt-1 text-white">Dev K.</div>
                  </div>
                </div>
                <p className="text-[11px] text-[#8e8a7f] leading-relaxed">
                  Enterprise recruitment pipelines built right into your dashboard. Review candidates and move stages without third-party ATS subscriptions.
                </p>
              </div>

              {/* Feature 2: Cal.com Schedulers */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Cal.com Schedulers</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Asia/Kolkata</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" /> 30-Min Office Hours
                    </span>
                    <span className="text-emerald-400 font-bold">₹0 Free</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-[#1c202a] text-slate-300 text-[9px] font-mono">
                      4:00 PM
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold">
                      4:30 PM (Selected)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#1c202a] text-slate-300 text-[9px] font-mono">
                      5:00 PM
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8e8a7f] leading-relaxed">
                  Book 1-on-1 mentor sessions and investor pitch discussions with automated timezone calibration and calendar invites.
                </p>
              </div>

              {/* Feature 3: Dub.co Attribution */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>Dub.co Attribution</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">+48.2% Conv</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/5 space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between text-[#8c887e]">
                    <span>Short-Link:</span>
                    <span className="text-emerald-300 font-bold">balaga.link/p/neural</span>
                  </div>
                  <div className="flex justify-between text-[#8c887e]">
                    <span>Unique Clicks:</span>
                    <span className="text-white font-bold">1,842</span>
                  </div>
                  <div className="flex justify-between text-[#8c887e]">
                    <span>Referrals:</span>
                    <span className="text-cyan-400 font-bold">Twitter (62%), AngelList (38%)</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8e8a7f] leading-relaxed">
                  Deep referral attribution and trackable links for your product launches, pitch decks, and investor updates.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security footnote */}
      <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8c887e]">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RLS Database Scoping: Profiles, DMs & Activities strictly quarantined.</span>
        </div>
        <div className="text-[11px] font-mono text-amber-400">
          Status: 100% Zero-Bleed Enforced
        </div>
      </div>
    </div>
  );
};
