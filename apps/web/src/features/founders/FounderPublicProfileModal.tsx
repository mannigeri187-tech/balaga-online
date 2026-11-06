import React, { useState } from "react";
import {
  X,
  Briefcase,
  GraduationCap,
  MapPin,
  Award,
  MessageSquare,
  UserPlus,
  Check,
  Clock,
  Sparkles,
  Building2,
  FileText,
  Share2,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

export interface PublicFounderProfile {
  id: string;
  displayName: string;
  username: string;
  headline: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  companyName?: string;
  companyRole?: string;
  schoolName?: string;
  connectionsCount?: string;
  followersCount?: string;
  mutualsText?: string;
  about?: string;
  connectionStatus?: "none" | "pending" | "connected";
  openTo?: {
    roles: string;
    services: string;
  };
  experience?: Array<{
    id: string;
    company: string;
    role: string;
    duration: string;
    location: string;
    description: string;
    logoUrl?: string;
  }>;
  education?: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    duration: string;
    grade?: string;
    logoUrl?: string;
  }>;
  skills?: Array<{
    name: string;
    endorsementsCount: number;
  }>;
  featuredArticles?: Array<{
    id: string;
    title: string;
    summary: string;
    reactionsCount: number;
    commentsCount: number;
    timeAgo: string;
  }>;
  startupDetails?: {
    name: string;
    tagline: string;
    stage: string;
    seeking: string;
    equityOffer: string;
  };
}

interface FounderPublicProfileModalProps {
  founder: PublicFounderProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (founderId: string) => void;
  onMessage?: (founderId: string) => void;
}

export const FounderPublicProfileModal: React.FC<FounderPublicProfileModalProps> = ({
  founder,
  isOpen,
  onClose,
  onConnect,
  onMessage,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "connected">(
    founder?.connectionStatus || "none"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !founder) return null;

  const handleConnectClick = () => {
    if (connectionStatus === "none") {
      setConnectionStatus("pending");
      setToastMessage("Connection request sent to " + founder.displayName);
      setTimeout(() => setToastMessage(null), 3000);
      if (onConnect) onConnect(founder.id);
    } else if (connectionStatus === "pending") {
      setConnectionStatus("none");
      setToastMessage("Connection request withdrawn");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleCopyProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/founders/in/" + founder.username);
      setToastMessage("Profile link copied to clipboard!");
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      setToastMessage("Link ready to share");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Default fallback data for complete LinkedIn experience
  const experienceList = founder.experience || [
    {
      id: "exp-1",
      company: founder.companyName || "PulseEngine AI",
      role: founder.companyRole || "Co-Founder in Residence & Systems Architect",
      duration: "Jan 2024 – Present • 1 yr 3 mos",
      location: "Bengaluru, Karnataka, India • Hybrid",
      description:
        "Building scalable settlement telemetry and vernacular billing mesh for high-frequency Indian commerce. Architected microservices cluster capable of processing 25k requests/sec.",
    },
    {
      id: "exp-2",
      company: "Razorpay",
      role: "Senior Staff Software Engineer — Core Rails",
      duration: "2020 – 2024 • 4 yrs",
      location: "Bengaluru, India",
      description:
        "Led the Settlement & UPI Payouts Core engineering group handling over ₹15,000 Cr monthly throughput with 99.99% availability. Mentored 14 engineers and drove Aurora PostgreSQL multi-region partitioning.",
    },
    {
      id: "exp-3",
      company: "Flipkart",
      role: "Software Development Engineer II (SDE-II)",
      duration: "2017 – 2020 • 3 yrs",
      location: "Bengaluru, India",
      description:
        "Engineered real-time automated dispatch allocation algorithms reducing warehouse fulfillment queue latencies by 34%.",
    },
  ];

  const educationList = founder.education || [
    {
      id: "edu-1",
      school: founder.schoolName || "Indian Institute of Technology, Madras (IIT-M)",
      degree: "Bachelor of Technology (B.Tech)",
      field: "Computer Science and Engineering",
      duration: "2013 – 2017",
      grade: "CGPA: 9.2 / 10",
    },
  ];

  const skillsList = founder.skills || [
    { name: "FinTech Infrastructure & UPI Rails", endorsementsCount: 64 },
    { name: "Go & High-Concurrency Systems", endorsementsCount: 52 },
    { name: "PostgreSQL & Distributed Storage", endorsementsCount: 41 },
    { name: "Engineering Architecture & Hiring", endorsementsCount: 33 },
    { name: "Startup Mentorship & Product Strategy", endorsementsCount: 26 },
  ];

  const featuredArticles = founder.featuredArticles || [
    {
      id: "art-1",
      title: "Architecting Zero-Downtime Database Migrations on Aurora PostgreSQL",
      summary:
        "Key lessons learned while migrating a 20TB active transaction ledger without dropping single merchant webhooks.",
      reactionsCount: 248,
      commentsCount: 38,
      timeAgo: "2 weeks ago",
    },
    {
      id: "art-2",
      title: "Why Settlement Latency in UPI AutoPay is the Next Frontier for Indian SaaS",
      summary:
        "A breakdown of mandate registration states, webhook retries, and reconciliation mesh designs.",
      reactionsCount: 412,
      commentsCount: 62,
      timeAgo: "1 month ago",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto flex justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-60 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl min-h-[90vh] my-auto overflow-hidden shadow-2xl flex flex-col">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Founders Realm Profile • LinkedIn Standard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyProfile}
              className="p-1.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title="Share profile link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* ========================================================
              1. LINKEDIN HEADER CARD
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm relative">
            {/* Banner Cover */}
            <div className="h-40 sm:h-52 w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 relative overflow-hidden">
              {founder.coverUrl ? (
                <img
                  src={founder.coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              )}
            </div>

            {/* Profile Avatar & Top Content */}
            <div className="px-6 pb-6 pt-0 relative">
              {/* Overlapping Avatar */}
              <div className="relative -mt-16 sm:-mt-20 mb-4 inline-block">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-slate-950 bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center font-bold text-3xl sm:text-4xl text-emerald-400">
                  {founder.avatarUrl ? (
                    <img
                      src={founder.avatarUrl}
                      alt={founder.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    founder.displayName[0]
                  )}
                </div>
                {/* Active Founder Badge */}
                <div className="absolute bottom-1 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 text-[10px] font-black" title="Verified Founder">
                  ✓
                </div>
              </div>

              {/* Founder Header Row: Name & Education / Company badges */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      {founder.displayName}
                    </h1>
                    <span className="text-xs text-slate-400 font-medium">(He/Him)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      1st Degree
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {founder.headline}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {founder.location || "Bengaluru, Karnataka, India"}
                    </span>
                    <span>•</span>
                    <button
                      onClick={handleCopyProfile}
                      className="text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Contact info
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="font-bold text-emerald-400">
                      {founder.connectionsCount || "500+ connections"}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">
                      {founder.followersCount || "8,420 followers"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1">
                    {founder.mutualsText ||
                      "Priya Rao, Aarav Mehta and 28 other mutual connections in Bengaluru"}
                  </p>
                </div>

                {/* Right side: Top current experience & education pills */}
                <div className="hidden md:flex flex-col gap-2 shrink-0 max-w-xs text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium text-slate-200 truncate">
                      {founder.companyName || "PulseEngine AI"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-medium text-slate-200 truncate">
                      {founder.schoolName || "IIT Madras"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-5">
                <button
                  onClick={handleConnectClick}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    connectionStatus === "connected"
                      ? "bg-emerald-600 text-white"
                      : connectionStatus === "pending"
                      ? "bg-slate-800 text-emerald-300 border border-emerald-500/40"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/50"
                  }`}
                >
                  {connectionStatus === "connected" ? (
                    <>
                      <Check className="w-4 h-4" /> Connected
                    </>
                  ) : connectionStatus === "pending" ? (
                    <>
                      <Clock className="w-4 h-4" /> Pending Request
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Connect
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (onMessage) onMessage(founder.id);
                    else alert(`Opening Founders Chat with ${founder.displayName}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </button>

                <button
                  onClick={handleCopyProfile}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Profile
                </button>
              </div>

              {/* "Open To" Box Card (LinkedIn Style) */}
              <div className="mt-5 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open to Co-Founder Collaboration & Technical Advisory</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {founder.openTo?.roles ||
                    "Co-Founder, CTO, VP Engineering roles • Hybrid or Remote in Bengaluru"}
                </p>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Providing services: Distributed Architecture Consulting, Payment Rail Audits
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              2. ABOUT SECTION
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-white">About</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {founder.about ||
                `10+ years engineering high-throughput fintech infrastructure across India. At Razorpay, I architected the core UPI payout rail handling over ₹15,000 Cr monthly volume with 99.99% uptime.

Deeply passionate about open settlement protocols, Go microservices, and distributed databases. Currently exploring early-stage technical co-founder partnerships and bootstrapping PulseEngine AI to solve telemetry for vernacular fintechs in India.

Always open to connecting with fellow founders, systems architects, and angel investors.`}
            </p>
          </div>

          {/* ========================================================
              3. FEATURED / ACTIVITY SECTION
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Featured & Activity</h2>
                <span className="text-xs text-slate-400">Thought leadership & technical articles</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase">
                      <FileText className="w-3 h-3" /> Technical Article • {art.timeAgo}
                    </div>
                    <h3 className="font-bold text-xs text-slate-200 hover:text-emerald-400 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ThumbsUp className="w-3 h-3" /> {art.reactionsCount} reactions
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {art.commentsCount} comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              4. EXPERIENCE TIMELINE
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Experience</span>
            </h2>

            <div className="space-y-6">
              {experienceList.map((exp) => (
                <div key={exp.id} className="flex items-start gap-4 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-emerald-400 shrink-0 text-sm">
                    {exp.company[0]}
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-sm text-slate-100">{exp.role}</h3>
                    <div className="text-xs text-slate-300 font-medium">{exp.company}</div>
                    <div className="text-[11px] text-slate-400">{exp.duration}</div>
                    <div className="text-[11px] text-slate-500">{exp.location}</div>
                    <p className="text-slate-300 leading-relaxed pt-1">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              5. EDUCATION
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Education</span>
            </h2>

            <div className="space-y-4">
              {educationList.map((edu) => (
                <div key={edu.id} className="flex items-start gap-4 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0 text-sm">
                    {edu.school[0]}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-slate-100">{edu.school}</h3>
                    <p className="text-slate-300 font-medium">
                      {edu.degree}, {edu.field}
                    </p>
                    <p className="text-[11px] text-slate-400">{edu.duration}</p>
                    {edu.grade && (
                      <p className="text-[11px] text-emerald-400 font-semibold">{edu.grade}</p>
                    )}
                  </div>
                </div>
              ))}
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
              {skillsList.map((skill) => (
                <div
                  key={skill.name}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <span className="font-semibold text-xs text-slate-200">{skill.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    {skill.endorsementsCount} endorsements
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
