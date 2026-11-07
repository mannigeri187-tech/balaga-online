import React, { useState } from "react";
import { useWorld } from "../../contexts/WorldContext";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Edit3,
  Share2,
  Building2,
  Sparkles,
  Check,
  Eye,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { PremiumCrown } from "../../components/ui/PremiumCrown";
import { BlueProjectIcon } from "../../components/ui/VerificationBadge";

interface FoundersProfileViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const FoundersProfileView: React.FC<FoundersProfileViewProps> = ({ onNavigateTab }) => {
  const { founderProfile } = useWorld();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Profile States with rich defaults
  const [headline] = useState(
    founderProfile?.headline ||
      "Founder & CEO @ PulseEngine AI (YC W24) | Building Vernacular Settlement Infrastructure | Ex-Razorpay Senior Staff Engineer | Angel Investor"
  );
  const [aboutText, setAboutText] = useState(
    founderProfile?.bio ||
      `10+ years engineering high-throughput fintech infrastructure across India. At Razorpay, I architected the core UPI payout rail handling over ₹15,000 Cr monthly volume with 99.99% uptime.

Deeply passionate about open settlement protocols, Go microservices, and distributed databases. Currently bootstrapping PulseEngine AI to solve telemetry for vernacular fintechs in India.

Always open to connecting with passionate engineers, angel investors, and potential co-founders.`
  );

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempAbout, setTempAbout] = useState(aboutText);
  const [isOpenToOpportunities, setIsOpenToOpportunities] = useState(true);

  const handleSaveAbout = () => {
    setAboutText(tempAbout);
    setIsEditingAbout(false);
    setToastMessage("About section updated!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back to Dashboard Navigation */}
      {onNavigateTab && (
        <button
          onClick={() => onNavigateTab("dashboard")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Founders Command Center</span>
        </button>
      )}

      {/* ========================================================
          1. LINKEDIN MAIN PROFILE HEADER CARD
      ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm relative">
        {/* Cover Banner */}
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 bg-slate-950/70 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Verified Founder Account
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Circular Avatar overlapping banner */}
          <div className="relative -mt-16 sm:-mt-20 mb-4 inline-block">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-slate-950 bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center font-bold text-3xl sm:text-4xl text-emerald-400">
              {founderProfile?.avatarUrl ? (
                <img
                  src={founderProfile.avatarUrl}
                  alt={founderProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{founderProfile?.displayName ? founderProfile.displayName[0] : "A"}</span>
              )}
            </div>
            <div
              className="absolute bottom-1 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 text-[10px] font-black"
              title="Verified Founder Identity"
            >
              ✓
            </div>
          </div>

          {/* Name & Headline */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {founderProfile?.displayName || "Aarav Mehta"}
                </h1>
                <PremiumCrown size="md" />
                <BlueProjectIcon size={20} />
                <span className="text-xs text-slate-400 font-medium">(He/Him)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Founder
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {headline}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {founderProfile?.broadLocation || "Bengaluru, Karnataka, India"}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">
                  Contact info
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs pt-1">
                <span className="font-bold text-emerald-400">500+ connections</span>
                <span>•</span>
                <span className="text-slate-400">6,180 followers</span>
              </div>
            </div>

            {/* Current Affiliations */}
            <div className="hidden md:flex flex-col gap-2 shrink-0 max-w-xs text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate">
                  PulseEngine AI (Founder & CEO)
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate">
                  IIT Madras (Computer Science)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-5">
            <button
              type="button"
              onClick={() => {
                const next = !isOpenToOpportunities;
                setIsOpenToOpportunities(next);
                setToastMessage(next ? "Status updated: Open to Opportunities" : "Status updated: Focused on Current Venture");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors ${
                isOpenToOpportunities
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              {isOpenToOpportunities ? "Open to Opportunities" : "Focused on Venture"}
            </button>
            <button
              type="button"
              onClick={() => {
                setToastMessage("Choose section: Patents, Advisory, or Certifications");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Add Profile Section
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setToastMessage("Profile URL copied!");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* "Open To" Box */}
          <div className="mt-5 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open to Co-Founder Collaboration & Early-Stage Angel Inquiries</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Technical Co-Founder, Advisor, Enterprise FinTech Partnerships • Bengaluru
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. LINKEDIN PRIVATE ANALYTICS CARD
      ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Analytics</h3>
            <span className="text-[10px] text-slate-500">• Private to you</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-lg font-bold text-emerald-400">384</span>
            <span className="text-xs text-slate-300 font-medium">Profile viewers</span>
            <p className="text-[10px] text-slate-500">Past 90 days • +28% this week</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-lg font-bold text-white">1,820</span>
            <span className="text-xs text-slate-300 font-medium">Post impressions</span>
            <p className="text-[10px] text-slate-500">Check out who engaged</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-lg font-bold text-purple-400">92</span>
            <span className="text-xs text-slate-300 font-medium">Search appearances</span>
            <p className="text-[10px] text-slate-500">Found in FinTech keywords</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. ABOUT SECTION
      ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">About</h2>
          <button
            onClick={() => {
              setTempAbout(aboutText);
              setIsEditingAbout(!isEditingAbout);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {isEditingAbout ? (
          <div className="space-y-3">
            <textarea
              rows={5}
              value={tempAbout}
              onChange={(e) => setTempAbout(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingAbout(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAbout}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-xs text-white hover:bg-emerald-500 font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {aboutText}
          </p>
        )}
      </div>

      {/* ========================================================
          4. EXPERIENCE SECTION
      ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Experience</span>
          </h2>
          <button
            type="button"
            onClick={() => {
              setToastMessage("Add new role or venture form opened");
              setTimeout(() => setToastMessage(null), 2500);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Add Experience"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 text-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-emerald-400 shrink-0 text-sm">
              P
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-sm text-slate-100">Founder & CEO</h3>
              <div className="text-xs text-slate-300 font-medium">PulseEngine AI • Full-time</div>
              <div className="text-[11px] text-slate-400">Jan 2024 – Present • 1 yr 3 mos</div>
              <div className="text-[11px] text-slate-500">Bengaluru, Karnataka, India • Hybrid</div>
              <p className="text-slate-300 leading-relaxed pt-1">
                Bootstrapping India's next-gen vernacular fintech telemetry and settlement mesh. Scaled initial pilot to 40+ SMB customers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-emerald-400 shrink-0 text-sm">
              R
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-sm text-slate-100">Senior Staff Software Engineer</h3>
              <div className="text-xs text-slate-300 font-medium">Razorpay • Full-time</div>
              <div className="text-[11px] text-slate-400">2020 – 2024 • 4 yrs</div>
              <div className="text-[11px] text-slate-500">Bengaluru, India</div>
              <p className="text-slate-300 leading-relaxed pt-1">
                Led core checkout & payout rails processing ₹15,000 Cr+ monthly volume. Architected Go microservices and multi-region database sharding.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. EDUCATION SECTION
      ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>Education</span>
        </h2>

        <div className="flex items-start gap-4 text-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0 text-sm">
            I
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-slate-100">
              Indian Institute of Technology, Madras (IIT-M)
            </h3>
            <p className="text-slate-300 font-medium">
              Bachelor of Technology (B.Tech), Computer Science and Engineering
            </p>
            <p className="text-[11px] text-slate-400">2013 – 2017</p>
            <p className="text-[11px] text-emerald-400 font-semibold">Grade: 9.2 / 10 CGPA</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. SKILLS & ENDORSEMENTS
      ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Skills & Endorsements</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "FinTech Rails & UPI Infrastructure", count: 64 },
            { name: "Go & High-Concurrency Systems", count: 52 },
            { name: "PostgreSQL & Distributed Storage", count: 41 },
            { name: "Engineering Leadership & Hiring", count: 33 },
          ].map((s) => (
            <div
              key={s.name}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <span className="font-semibold text-xs text-slate-200">{s.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                {s.count} endorsements
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
