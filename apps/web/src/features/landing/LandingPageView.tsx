import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  QrCode,
  Lock,
  Heart,
  Rocket,
  CheckCircle2,
  Users,
  Languages,
  Calendar,
  Share2,
  MessageSquare,
  Zap,
  Check,
} from "lucide-react";
import { HeroCanvas } from "./components/HeroCanvas";
import { KineticMarquee } from "./components/KineticMarquee";
import { DualRealmWipeStage } from "./components/DualRealmWipeStage";
import { TiltCard } from "./components/TiltCard";
import { CustomCursor } from "./components/CustomCursor";

interface LandingPageViewProps {
  onEnterApp: (realm?: "socializing" | "founders") => void;
  onOpenLogin: (mode?: "login" | "signup") => void;
  onOpenPayment: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterApp,
  onOpenLogin,
  onOpenPayment,
}) => {
  const [activeInteractiveWorld, setActiveInteractiveWorld] = useState<"socializing" | "founders">("socializing");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#fcfbf9] flex flex-col font-sans selection:bg-[#e5a855] selection:text-[#07080a] overflow-x-hidden antialiased">
      {/* Butterflow-Style Interactive Custom Trailing Cursor */}
      <CustomCursor />

      {/* Real-time Top Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 z-[100] transition-all duration-75 ease-out pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* ─────────────────────────────────────────────────────────────
          FLOATING BUTTERFLOW-STYLE EDITORIAL HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-7xl mx-auto">
        <nav className="border border-white/10 bg-[#0c0d12]/80 backdrop-blur-2xl rounded-full px-5 py-3 flex items-center justify-between shadow-2xl shadow-black/80 transition-all">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-3 group text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e5a855] via-[#d97706] to-[#b45309] flex items-center justify-center font-black text-[#07080a] text-sm shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                B
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Balaga
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-widest text-amber-400/90 border border-amber-400/30 px-2 py-0.5 rounded-full bg-amber-950/30">
                  balaga.online
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Anchors */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-medium text-[#a39f93]">
            <button onClick={() => scrollToSection("problem")} className="hover:text-white transition">
              The Split
            </button>
            <button onClick={() => scrollToSection("transformation")} className="hover:text-white transition">
              Bifurcation
            </button>
            <button onClick={() => scrollToSection("social-realm")} className="hover:text-white transition">
              Socializing
            </button>
            <button onClick={() => scrollToSection("founders-realm")} className="hover:text-white transition">
              Founders
            </button>
            <button onClick={() => scrollToSection("zero-bleed")} className="hover:text-white transition">
              Zero-Bleed Privacy
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-white transition">
              How it Works
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPayment}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#161822] hover:bg-[#1f2230] text-[#ded9cd] border border-white/10 text-xs font-medium transition"
              title="Zero-MDR Direct UPI Settlement"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Fee UPI</span>
            </button>

            <button
              onClick={() => onOpenLogin("login")}
              className="px-4 py-1.5 rounded-full bg-[#161822] hover:bg-[#1f2230] text-[#fcfbf9] border border-white/10 text-xs font-semibold transition"
            >
              Log In
            </button>

            <button
              onClick={() => onOpenLogin("signup")}
              className="px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-[#e5a855] to-[#d97706] hover:from-[#f5b865] hover:to-[#e68716] text-[#07080a] text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 group"
            >
              <span>Join Balaga</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: CINEMATIC HERO
      ───────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative pt-16 sm:pt-24 pb-24 sm:pb-32 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Generative ambient canvas */}
        <HeroCanvas />

        {/* Ambient Top Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-600/10 via-amber-500/10 to-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Status Badge */}
        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#11131a]/90 border border-white/10 text-xs text-[#a09c91] mb-8 shadow-inner backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-white">Sovereign Dual-Realm Architecture</span>
          <span className="text-white/20">|</span>
          <span className="text-[#e5a855] font-semibold">100% Zero Data Leakage</span>
        </div>

        {/* Grand Hero Typography */}
        <div className="relative z-10 max-w-5xl">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white leading-[0.92]">
            Two Worlds. <br />
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#e5a855] via-[#f7cb88] to-[#e5a855]">
              One Identity.
            </span>{" "}
            <br />
            <span className="text-white">Infinite Possibilities.</span>
          </h1>
        </div>

        {/* Subtitle Statement */}
        <p className="relative z-10 mt-8 text-sm sm:text-base md:text-lg text-[#a8a498] max-w-2xl leading-relaxed font-light">
          India's sovereign network uniting authentic vernacular culture, local circles, and regional stories with an elite startup incubator, Twenty CRM Kanban hiring, and 0% commission UPI payments.
        </p>

        {/* Hero CTAs */}
        <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => onOpenLogin("signup")}
            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#e5a855] via-[#d97706] to-[#b45309] hover:from-[#f5b865] hover:to-[#c66307] text-[#07080a] text-xs sm:text-sm font-black transition shadow-xl shadow-amber-500/25 flex items-center gap-2 group"
          >
            <span>Join Balaga Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onEnterApp()}
            className="px-6 py-3.5 rounded-full bg-[#141620] hover:bg-[#1d202e] text-[#fcfbf9] border border-white/10 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Launch Live Platform</span>
          </button>

          <button
            onClick={() => scrollToSection("transformation")}
            className="px-5 py-3.5 rounded-full bg-transparent hover:bg-white/5 text-[#a8a498] hover:text-white text-xs sm:text-sm font-medium transition"
          >
            Explore the 2 Worlds ↓
          </button>
        </div>

        {/* Real-Time Architectural Metrics */}
        <div className="relative z-10 mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-white/10">
          <div className="text-left p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-2xl sm:text-3xl font-light text-white font-mono">0%</p>
            <p className="text-[10px] sm:text-[11px] text-[#8c887e] uppercase tracking-wider mt-1">Direct UPI Commission</p>
          </div>
          <div className="text-left p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-2xl sm:text-3xl font-light text-white font-mono">100%</p>
            <p className="text-[10px] sm:text-[11px] text-[#8c887e] uppercase tracking-wider mt-1">RLS Schema Isolation</p>
          </div>
          <div className="text-left p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-2xl sm:text-3xl font-light text-white font-mono">10+</p>
            <p className="text-[10px] sm:text-[11px] text-[#8c887e] uppercase tracking-wider mt-1">IndicTrans2 Scripts</p>
          </div>
          <div className="text-left p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-2xl sm:text-3xl font-light text-white font-mono">&lt;5ms</p>
            <p className="text-[10px] sm:text-[11px] text-[#8c887e] uppercase tracking-wider mt-1">Realm Context Flip</p>
          </div>
        </div>
      </section>

      {/* KINETIC TICKER RIBBON */}
      <KineticMarquee
        items={[
          "Socializing Realm",
          "Founders Realm",
          "Zero Data Bleed",
          "IndicTrans2 Vernacular",
          "Twenty CRM Kanban",
          "Cal.com Schedulers",
          "0% MDR Direct UPI",
          "Hey.xyz Quad Media",
          "Dub.co Attribution",
        ]}
        direction="left"
        variant="amber"
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: THE PROBLEM (FRAGMENTED DIGITAL LIFE)
      ───────────────────────────────────────────────────────────── */}
      <section id="problem" className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto border-b border-white/10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Column: Sticky Narrative Header */}
          <div className="lg:w-5/12 lg:sticky lg:top-28 space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e5a855] font-semibold">
              [ 02 // THE CONFLICT ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              The Split-Identity Crisis.
            </h2>
            <p className="text-sm sm:text-base text-[#a09c91] leading-relaxed">
              Why are you forced to live as four fragmented people across four disconnected corporate silos every day?
            </p>
            <div className="pt-4">
              <div className="p-4 rounded-2xl bg-[#12141c] border border-red-500/20 text-xs text-red-300 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  The Cost of Web Fragmentation
                </div>
                <p className="text-[#8c887e]">
                  You hide your tech ambition on Instagram because your friends cringe, and you post robotic corporate theater on LinkedIn because you can't be authentic.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contrast Comparison Matrix */}
          <div className="lg:w-7/12 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Instagram Card */}
              <TiltCard glowColor="subtle" maxTilt={8} dataCursor="EXPAND">
                <div className="p-6 rounded-3xl bg-[#0f1118] border border-white/5 space-y-2.5 h-full">
                  <div className="text-xs font-mono text-red-400 uppercase tracking-wider">01 · Personal Silo</div>
                  <h3 className="text-lg font-bold text-white">Instagram</h3>
                  <p className="text-xs text-[#8c887e] leading-relaxed">
                    Great for weekend café stories and badminton photos, but completely useless for recruiting engineers, finding a co-founder, or pitching angels.
                  </p>
                </div>
              </TiltCard>

              {/* LinkedIn Card */}
              <TiltCard glowColor="subtle" maxTilt={8} dataCursor="EXPAND">
                <div className="p-6 rounded-3xl bg-[#0f1118] border border-white/5 space-y-2.5 h-full">
                  <div className="text-xs font-mono text-red-400 uppercase tracking-wider">02 · Corporate Mask</div>
                  <h3 className="text-lg font-bold text-white">LinkedIn</h3>
                  <p className="text-xs text-[#8c887e] leading-relaxed">
                    Choked with performative "I am thrilled to announce" fake cringe, rigid corporate resumes, and zero authentic human connection.
                  </p>
                </div>
              </TiltCard>

              {/* Calendly Card */}
              <TiltCard glowColor="subtle" maxTilt={8} dataCursor="EXPAND">
                <div className="p-6 rounded-3xl bg-[#0f1118] border border-white/5 space-y-2.5 h-full">
                  <div className="text-xs font-mono text-red-400 uppercase tracking-wider">03 · Expensive Booking</div>
                  <h3 className="text-lg font-bold text-white">Calendly & Tools</h3>
                  <p className="text-xs text-[#8c887e] leading-relaxed">
                    Paying $15/month just to share a booking link, while juggling multiple calendar tabs and broken timezone converters.
                  </p>
                </div>
              </TiltCard>

              {/* WhatsApp Card */}
              <TiltCard glowColor="subtle" maxTilt={8} dataCursor="EXPAND">
                <div className="p-6 rounded-3xl bg-[#0f1118] border border-white/5 space-y-2.5 h-full">
                  <div className="text-xs font-mono text-red-400 uppercase tracking-wider">04 · Privacy Leakage</div>
                  <h3 className="text-lg font-bold text-white">WhatsApp / DMs</h3>
                  <p className="text-xs text-[#8c887e] leading-relaxed">
                    Forced to give out your personal phone number to recruiters, candidates, and strangers, exposing your personal life to everyone.
                  </p>
                </div>
              </TiltCard>
            </div>

            {/* The Balaga Resolution */}
            <TiltCard glowColor="amber" maxTilt={6} dataCursor="SOVEREIGN">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-[#181510] to-[#12141c] border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#e5a855] font-semibold">
                  <Sparkles className="w-4 h-4 text-[#e5a855]" />
                  <span>THE BALAGA SOVEREIGN ALTERNATIVE</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  One Master Account. Zero Data Bleed. Two Parallel Realms.
                </h3>
                <p className="text-xs sm:text-sm text-[#a8a498] leading-relaxed">
                  Log in once at <strong>balaga.online</strong>. Enjoy authentic cultural life, vernacular reels, and friends on one side. Switch instantly to recruit talent, book mentor office hours, and launch products on the other.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: ONE IDENTITY TRANSFORMS INTO TWO WORLDS
      ───────────────────────────────────────────────────────────── */}
      <section id="transformation" className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto border-b border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e5a855] font-semibold">
            [ 03 // BIFURCATION ]
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            One Sovereign Identity. <br />
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#e5a855] via-amber-200 to-amber-500">
              Mathematical Bifurcation.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#a09c91] leading-relaxed">
            Drag the golden cursor stage below to scrub between Socializing and Founders realms in real time. Experience dual sovereign views without context corruption.
          </p>
        </div>

        {/* Live Butterflow-Style Interactive Realm Scrub Stage */}
        <DualRealmWipeStage onEnterApp={onEnterApp} />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: THE SOCIALIZING WORLD
      ───────────────────────────────────────────────────────────── */}
      <section id="social-realm" className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto border-b border-white/10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Realm Philosophy */}
          <div className="lg:w-5/12 lg:sticky lg:top-28 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-[10px] font-mono uppercase tracking-wider text-violet-300">
              <Heart className="w-3 h-3 text-violet-400" />
              <span>REALM 01 · SOCIALIZING</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Culture, Hobbies & Authentic Human Scale.
            </h2>
            
            <p className="text-sm sm:text-base text-[#a09c91] leading-relaxed">
              No corporate posturing. No algorithmic outrage. A vibrant social network celebrating India's rich multilingual tapestry, weekend hobbies, and real neighborhood hangouts.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onEnterApp("socializing")}
                className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-lg shadow-violet-900/40 flex items-center gap-2 group"
              >
                <span>Enter Socializing Realm</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Pillars */}
          <div className="lg:w-7/12 space-y-4">
            {/* Pillar 1 */}
            <TiltCard glowColor="violet" maxTilt={6} dataCursor="VERNACULAR">
              <div className="p-6 rounded-3xl bg-[#0f1017] border border-violet-500/15 space-y-3 hover:border-violet-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Languages className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">IndicTrans2 Vernacular Engine</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Seamless script auto-detection across 10+ Indian languages (Kannada, Hindi, Tamil, Telugu, Marathi, Bengali). Read vernacular posts with 1-click contextual translation and Web Speech voice playback.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 2 */}
            <TiltCard glowColor="violet" maxTilt={6} dataCursor="GALLERY">
              <div className="p-6 rounded-3xl bg-[#0f1017] border border-violet-500/15 space-y-3 hover:border-violet-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Hey.xyz Multi-Media & Lightbox</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Responsive 4-quad photo galleries, high-frame-rate vernacular video reels, and full-screen lightbox viewing. Zero compression degradation so your photography looks pristine.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 3 */}
            <TiltCard glowColor="violet" maxTilt={6} dataCursor="CIRCLES">
              <div className="p-6 rounded-3xl bg-[#0f1017] border border-violet-500/15 space-y-3 hover:border-violet-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Local Circles & Flash Hangouts</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Connect over badminton matches, weekend hiking, book clubs, and film screenings in Indiranagar, Koramangala, Bandra, and beyond with zero algorithmic friction.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 4 */}
            <TiltCard glowColor="violet" maxTilt={6} dataCursor="MESSAGES">
              <div className="p-6 rounded-3xl bg-[#0f1017] border border-violet-500/15 space-y-3 hover:border-violet-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Chatwoot Real-Time Messenger</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Encrypted peer messaging with live presence dots, double blue read receipts, and hover emoji reaction docks without ever exposing your private phone number.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: THE FOUNDERS WORLD
      ───────────────────────────────────────────────────────────── */}
      <section id="founders-realm" className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto border-b border-white/10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Realm Philosophy */}
          <div className="lg:w-5/12 lg:sticky lg:top-28 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
              <Rocket className="w-3 h-3 text-emerald-400" />
              <span>REALM 02 · FOUNDERS</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              A Complete Startup Incubator In Your Browser.
            </h2>
            
            <p className="text-sm sm:text-base text-[#a09c91] leading-relaxed">
              Replace thousands of dollars in fragmented SaaS subscriptions. Hire engineers, book mentor office hours, launch products, and raise capital from one high-velocity dashboard.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onEnterApp("founders")}
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40 flex items-center gap-2 group"
              >
                <span>Enter Founders Realm</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Pillars */}
          <div className="lg:w-7/12 space-y-4">
            {/* Pillar 1 */}
            <TiltCard glowColor="emerald" maxTilt={6} dataCursor="KANBAN">
              <div className="p-6 rounded-3xl bg-[#0b1210] border border-emerald-500/15 space-y-3 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Twenty CRM Kanban ATS</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Visual 6-stage recruiter hiring pipeline (Applied → Screening → Interview → Technical → Offer → Hired). Drag and drop candidate applications directly without paying $300/mo for Ashby.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 2 */}
            <TiltCard glowColor="emerald" maxTilt={6} dataCursor="SCHEDULER">
              <div className="p-6 rounded-3xl bg-[#0b1210] border border-emerald-500/15 space-y-3 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Cal.com Schedulers (Asia/Kolkata)</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Native 30-minute 1-on-1 office hour bookings for mentors and angel investors with automated timezone calibration, calendar sync, and confirmation reminders.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 3 */}
            <TiltCard glowColor="emerald" maxTilt={6} dataCursor="LAUNCHPAD">
              <div className="p-6 rounded-3xl bg-[#0b1210] border border-emerald-500/15 space-y-3 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Dub.co Launchpad & Attribution</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Generate custom short-links (<code className="text-emerald-400 font-mono">balaga.link/p/...</code>) for demo day. Track referrer sources, unique visitors, and conversion metrics in real time.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 4 */}
            <TiltCard glowColor="emerald" maxTilt={6} dataCursor="SQUAD">
              <div className="p-6 rounded-3xl bg-[#0b1210] border border-emerald-500/15 space-y-3 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Hackathon Squad Matchmaker</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Role-locked team cards pairing frontend builders, backend architects, and AI researchers into hackathon squads in seconds.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: SEAMLESS WORLD SWITCHING
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto border-b border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e5a855] font-semibold">
            [ 06 // FLUIDITY ]
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Flip Reality in Under Five Milliseconds.
          </h2>
          <p className="text-sm sm:text-base text-[#a09c91] leading-relaxed">
            One button in the top header switches your active universe. The browser updates state, rebinds API authentication headers, and swaps view trees instantaneously.
          </p>
        </div>

        {/* Interactive Switcher Demo Container */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0e1017] border border-white/10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center p-1.5 rounded-full bg-[#161822] border border-white/10">
            <button
              onClick={() => setActiveInteractiveWorld("socializing")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeInteractiveWorld === "socializing"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                  : "text-[#8c887e] hover:text-white"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Socializing Mode</span>
            </button>
            <button
              onClick={() => setActiveInteractiveWorld("founders")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeInteractiveWorld === "founders"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-[#8c887e] hover:text-white"
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Founders Mode</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#08090d] border border-white/5 font-mono text-xs text-left space-y-2">
            <div className="text-[#8c887e] flex items-center justify-between">
              <span>ACTIVE_TOKEN_SCOPE:</span>
              <span className={activeInteractiveWorld === "socializing" ? "text-violet-400 font-bold" : "text-emerald-400 font-bold"}>
                {activeInteractiveWorld === "socializing" ? "realm_socializing_v2" : "realm_founders_v2"}
              </span>
            </div>
            <div className="text-[#8c887e] flex items-center justify-between">
              <span>HTTP_HEADER:</span>
              <span className="text-amber-400 font-semibold">x-platform-world: {activeInteractiveWorld}</span>
            </div>
            <div className="text-[#8c887e] flex items-center justify-between">
              <span>LEAKAGE_RISK:</span>
              <span className="text-emerald-400 font-bold">0.000% (Row-Level Security Enforced)</span>
            </div>
          </div>

          <p className="text-xs text-[#8c887e]">
            Try clicking the buttons above to preview the state mutation.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: INDEPENDENT EXPERIENCES & PRIVACY BOUNDARIES
      ───────────────────────────────────────────────────────────── */}
      <section id="zero-bleed" className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto border-b border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e5a855] font-semibold">
            [ 07 // ZERO-BLEED GUARANTEE ]
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Cryptographic Separation at Every Layer.
          </h2>
          <p className="text-sm sm:text-base text-[#a09c91] leading-relaxed">
            Your personal photos will never leak into investor meetings. Your startup pitch decks will never clutter your social circle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Privacy Box 1 */}
          <TiltCard glowColor="amber" maxTilt={5} dataCursor="SECURITY">
            <div className="p-8 rounded-3xl bg-[#0e1017] border border-white/10 space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Row-Level Security (RLS)</h3>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Every query is stamped with the session's active realm. Postgres rejects any request attempting to query across world boundaries, guaranteeing zero memory or cache bleed.
                </p>
                <ul className="space-y-2 text-xs text-[#a09c91] pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Strictly partitioned database tables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Independent handle namespaces (@user_social vs @user_builder)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>No cross-pollinated activity feeds</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-[#08090d] border border-white/5 font-mono text-[10px] text-emerald-400 flex items-center gap-2 mt-4">
                <Lock className="w-3.5 h-3.5" />
                <span>AES-256 session encryption with Supabase Auth</span>
              </div>
            </div>
          </TiltCard>

          {/* Privacy Box 2: Zero-Fee UPI Payment Spotlight */}
          <TiltCard glowColor="emerald" maxTilt={5} dataCursor="UPI">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0e1017] via-[#10171a] to-[#0c1412] border border-emerald-500/30 space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Zero-Fee UPI Gateway</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    0% MDR
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#8c887e] leading-relaxed">
                  Direct NPCI bank-to-bank settlement (<code className="text-emerald-400 font-mono">balaga@okhdfcbank</code>). Unlock Creator, Founder, and Annual passes with instant QR generation and 1-tap mobile deep links.
                </p>
                <ul className="space-y-2 text-xs text-[#a09c91] pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>₹0 commission to foreign payment aggregators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Direct settlement to your bank account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Google Pay, PhonePe, and Paytm 1-tap intent</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenPayment}
                className="w-full mt-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#07080a] text-xs font-black transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Launch Zero-Fee UPI Payment Gateway</span>
              </button>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: HOW BALAGA WORKS
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto border-b border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e5a855] font-semibold">
            [ 08 // THE JOURNEY ]
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            How Balaga Works.
          </h2>
          <p className="text-sm sm:text-base text-[#a09c91] leading-relaxed">
            Three intuitive steps to liberate your digital existence from corporate walled gardens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <TiltCard glowColor="amber" maxTilt={6} dataCursor="STEP 01">
            <div className="p-8 rounded-3xl bg-[#0e1017] border border-white/10 space-y-4 relative h-full">
              <span className="text-4xl font-mono font-light text-[#e5a855]/40">01</span>
              <h3 className="text-lg font-bold text-white">Claim Your Sovereign ID</h3>
              <p className="text-xs text-[#8c887e] leading-relaxed">
                Create your master account with email and verify your address. One master credential secures your entire digital footprint across both realms.
              </p>
            </div>
          </TiltCard>

          {/* Step 2 */}
          <TiltCard glowColor="violet" maxTilt={6} dataCursor="STEP 02">
            <div className="p-8 rounded-3xl bg-[#0e1017] border border-white/10 space-y-4 relative h-full">
              <span className="text-4xl font-mono font-light text-violet-400/40">02</span>
              <h3 className="text-lg font-bold text-white">Initialize Twin Personas</h3>
              <p className="text-xs text-[#8c887e] leading-relaxed">
                Curate your creative social handle for friends and vernacular stories. Then craft your verified builder portfolio for co-founders and investors.
              </p>
            </div>
          </TiltCard>

          {/* Step 3 */}
          <TiltCard glowColor="emerald" maxTilt={6} dataCursor="STEP 03">
            <div className="p-8 rounded-3xl bg-[#0e1017] border border-white/10 space-y-4 relative h-full">
              <span className="text-4xl font-mono font-light text-emerald-400/40">03</span>
              <h3 className="text-lg font-bold text-white">Traverse Realms At Will</h3>
              <p className="text-xs text-[#8c887e] leading-relaxed">
                Tap the persistent top-left switcher anytime. Go from reviewing candidate resumes to sharing a weekend photography reel in less than 5 milliseconds.
              </p>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: FINAL BRAND REVEAL & JOIN BALAGA CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-36 px-4 sm:px-8 max-w-5xl mx-auto text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-violet-600/15 to-emerald-500/15 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative z-10 p-8 sm:p-14 rounded-3xl bg-[#0e1017]/90 border border-white/15 backdrop-blur-3xl shadow-2xl space-y-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e5a855] font-semibold">
            [ 09 // READY TO COMMENCE ]
          </span>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            Stop Splitting Your Life. <br />
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#e5a855] via-amber-200 to-amber-500">
              Own Both Realms.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#a09c91] max-w-xl mx-auto leading-relaxed">
            Join creators, builders, and community visionaries already active on Balaga's sovereign dual-realm network.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenLogin("signup")}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#e5a855] via-[#d97706] to-[#b45309] hover:from-[#f5b865] hover:to-[#c66307] text-[#07080a] text-sm font-black transition shadow-2xl shadow-amber-500/30 flex items-center gap-2 group"
            >
              <span>Join Balaga — It's Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onEnterApp()}
              className="px-8 py-4 rounded-full bg-[#181a24] hover:bg-[#222534] text-white border border-white/10 text-sm font-bold transition flex items-center gap-2"
            >
              <span>Launch Live App</span>
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#8c887e]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free forever tier</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct UPI access</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: PROFESSIONAL FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#060709] py-16 px-4 sm:px-8 text-xs text-[#8c887e]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Brand column */}
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e5a855] to-[#b45309] flex items-center justify-center font-black text-[#07080a] text-sm">
                  B
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  Balaga.online
                </span>
              </div>
              <p className="text-xs text-[#8c887e] leading-relaxed">
                India's sovereign dual-realm ecosystem. Two worlds. One identity. Infinite possibilities. Built on zero-cost high-performance infrastructure.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Edge Nodes Operational (Cloudflare + Supabase + Render)</span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                  Two Realms
                </p>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button onClick={() => onEnterApp("socializing")} className="hover:text-white transition">
                      Socializing Realm
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onEnterApp("founders")} className="hover:text-white transition">
                      Founders Realm
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection("transformation")} className="hover:text-white transition">
                      Live Bifurcation
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection("zero-bleed")} className="hover:text-white transition">
                      Zero Data Bleed
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                  Technologies
                </p>
                <ul className="space-y-2 text-xs">
                  <li>
                    <span className="text-[#a09c91]">IndicTrans2 Bhasha</span>
                  </li>
                  <li>
                    <span className="text-[#a09c91]">Twenty CRM Kanban</span>
                  </li>
                  <li>
                    <span className="text-[#a09c91]">Cal.com Schedulers</span>
                  </li>
                  <li>
                    <span className="text-[#a09c91]">Hey.xyz Quad Media</span>
                  </li>
                  <li>
                    <span className="text-[#a09c91]">Dub.co Attribution</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                  Payments & Auth
                </p>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button onClick={onOpenPayment} className="hover:text-white transition">
                      Zero-Fee UPI Gateway
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onOpenLogin("login")} className="hover:text-white transition">
                      Sign In
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onOpenLogin("signup")} className="hover:text-white transition">
                      Create Account
                    </button>
                  </li>
                  <li>
                    <span className="text-[#a09c91]">Supabase RLS</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6c6960]">
            <div>
              © 2026 Balaga.online. All rights reserved. Built for Bharat & the Global Sovereign Web.
            </div>
            <div className="flex items-center gap-6 font-mono text-[10px]">
              <span>ZERO_MDR: ENABLED</span>
              <span>RLS_ISOLATION: 100%</span>
              <span>TIMEZONE: ASIA/KOLKATA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
