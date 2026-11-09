import React, { useState } from "react";
import {
  ArrowRight,
  Heart,
  MessageSquare,
  Rocket,
  Layers,
  QrCode,
  Languages,
  Calendar,
  Share2,
} from "lucide-react";

interface LandingPageViewProps {
  onEnterApp: (realm?: "socializing" | "founders") => void;
  onOpenLogin: () => void;
  onOpenPayment: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterApp,
  onOpenLogin,
  onOpenPayment,
}) => {
  const [activePreviewRealm, setActivePreviewRealm] = useState<"socializing" | "founders">("socializing");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-500/10">
            B
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Balaga
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                balaga.online
              </span>
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <a href="#dual-realms" className="hover:text-white transition">Dual Realms</a>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#payments" className="hover:text-white transition">Zero-Fee UPI</a>
          <a href="#architecture" className="hover:text-white transition">₹0 Dev Stack</a>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPayment}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>UPI Payment</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
          >
            Log In
          </button>

          <button
            onClick={() => onEnterApp()}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-8 pt-16 pb-20 overflow-hidden flex flex-col items-center text-center">
        {/* Glow ambient background elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-violet-600/15 via-emerald-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>India's Premier Dual-Realm Network</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">100% Zero Data Leakage</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          One Platform.{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
            Social Life
          </span>{" "}
          &{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Startup Ambition
          </span>
          .
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Switch effortlessly between community circles, vernacular stories, and Bangalore hangouts — and an elite startup incubator with co-founder matchmaking, Kanban hiring pipelines, and 0% UPI payments.
        </p>

        {/* Dual Realm Selector Demo */}
        <div className="mt-8 flex items-center p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setActivePreviewRealm("socializing")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePreviewRealm === "socializing"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Socializing Realm</span>
          </button>
          <button
            onClick={() => setActivePreviewRealm("founders")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePreviewRealm === "founders"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Founders Realm</span>
          </button>
        </div>

        {/* Realm Preview Card */}
        <div className="mt-8 w-full max-w-3xl p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-2xl text-left transition-all duration-300">
          {activePreviewRealm === "socializing" ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Socializing Realm</h3>
                    <p className="text-xs text-violet-400">Culture, Hobbies, Friends & Bhasha Vernacular</p>
                  </div>
                </div>
                <button
                  onClick={() => onEnterApp("socializing")}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-violet-900/30"
                >
                  <span>Enter Socializing</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                    <Languages className="w-3.5 h-3.5 text-violet-400" />
                    <span>IndicTrans2 Bhasha</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Auto script detection & 1-click regional translation in Kannada, Hindi, Tamil & Telugu.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    <span>Hey.xyz Media Feed</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Multi-photo responsive quad grids, full-screen lightbox viewer & zero-latency previews.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                    <span>Chatwoot Real-Time</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Online/away presence indicators, double blue read receipts & hover emoji reactions.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Founders Realm</h3>
                    <p className="text-xs text-emerald-400">Startups, Co-Founders, Launchpad & Hiring</p>
                  </div>
                </div>
                <button
                  onClick={() => onEnterApp("founders")}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-900/30"
                >
                  <span>Enter Founders</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Twenty CRM Kanban</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Visual 6-stage recruiter hiring pipeline (Applied, Screening, Interview, Offer, Hired).
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cal.com Schedulers</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Embedded 1-on-1 mentor office hours & investor pitch bookings with Asia/Kolkata slots.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dub.co Attribution</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Custom short-links (balaga.link/p/...) and deep referral traffic analytics for product launches.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ZERO-FEE UPI PAYMENTS SHOWCASE */}
      <section id="payments" className="px-4 sm:px-8 py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
              India Zero-MDR Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              Accept Payments with <span className="text-amber-400">0% Gateway Fees</span>.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              No 2% payment gateway commissions. Balaga supports native NPCI UPI Intent and dynamic QR codes. Money settles directly from Google Pay, PhonePe, Paytm, and CRED into your Indian bank account.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onOpenPayment}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <QrCode className="w-4 h-4" />
                <span>Test UPI Payment Flow</span>
              </button>
              <span className="text-xs text-slate-500">Supports GPay, PhonePe, Paytm & BHIM</span>
            </div>
          </div>

          {/* Mini QR Demo Card */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center text-center space-y-3 w-64 shrink-0">
            <div className="p-3 bg-white rounded-2xl shadow-inner">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=balaga@okhdfcbank&pn=Balaga%20Network&am=499&cu=INR"
                alt="UPI Demo QR"
                className="w-28 h-28"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Instant UPI Checkout</div>
              <p className="text-[10px] text-emerald-400 font-semibold">0% Commission · Instant Settlement</p>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE STATS SECTION */}
      <section id="architecture" className="px-4 sm:px-8 py-16 max-w-5xl mx-auto w-full text-center space-y-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Built on the ₹0 Free-For-Dev Stack</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Bootstrapped founders can run their entire MVP infrastructure with enterprise reliability at zero monthly cost.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Database</div>
            <div className="text-sm font-bold text-white">Supabase Postgres</div>
            <div className="text-[10px] text-emerald-400 font-semibold">50,000 MAUs Free</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Edge Hosting</div>
            <div className="text-sm font-bold text-white">Cloudflare + Vercel</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Unlimited Bandwidth</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Transactional Email</div>
            <div className="text-sm font-bold text-white">Resend API</div>
            <div className="text-[10px] text-emerald-400 font-semibold">3,000 Emails/Mo Free</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">AI Inference</div>
            <div className="text-sm font-bold text-white">Groq Cloud LPUs</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Free Llama 3.3 Speed</div>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            B
          </div>
          <span className="text-slate-400 font-medium">Balaga.online · Indian Cultural & Startup Network</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEnterApp("socializing")}
            className="hover:text-slate-300 transition"
          >
            Socializing
          </button>
          <span>·</span>
          <button
            onClick={() => onEnterApp("founders")}
            className="hover:text-slate-300 transition"
          >
            Founders
          </button>
          <span>·</span>
          <button
            onClick={onOpenLogin}
            className="text-emerald-400 font-semibold hover:underline"
          >
            Log In
          </button>
        </div>
      </footer>

    </div>
  );
};
