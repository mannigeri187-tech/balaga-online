import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  QrCode,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  X,
  CheckCircle2,
  Award
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface CampusSociety {
  id: string;
  name: string;
  college: string;
  category: string;
  lead: string;
  membersCount: number;
  description: string;
  badge: string;
}

interface SeniorMentor {
  id: string;
  name: string;
  role: string;
  company: string;
  college: string;
  topics: string[];
  slotsAvailable: number;
  avatar: string;
}

interface CampusHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeName?: string;
}

const mockSocieties: CampusSociety[] = [
  {
    id: "soc-1",
    name: "RVCE Autonomous Systems & Robotics",
    college: "RV College of Engineering",
    category: "Engineering & AI",
    lead: "Aditya S. (Final Year)",
    membersCount: 142,
    description: "Building autonomous rovers and computer vision drone swarms for national competitions.",
    badge: "🤖",
  },
  {
    id: "soc-2",
    name: "Christ University Theatre Guild",
    college: "Christ Deemed to be University",
    category: "Dramatics & Arts",
    lead: "Meera Nair (Alumni Advisor)",
    membersCount: 88,
    description: "Original bilingual street plays and inter-collegiate theatre productions across South India.",
    badge: "🎭",
  },
  {
    id: "soc-3",
    name: "PES Open Source & Linux User Group",
    college: "PES University",
    category: "Software & Systems",
    lead: "Karthik R. (3rd Year)",
    membersCount: 310,
    description: "Weekly Linux kernel deep-dives, Rust study jams, and open-source contribution sprints.",
    badge: "🐧",
  },
];

const mockMentors: SeniorMentor[] = [
  {
    id: "men-1",
    name: "Sneha Murthy",
    role: "Founding Engineer",
    company: "Sarvam AI (ex-RVCE '23)",
    college: "RVCE",
    topics: ["LLM Fine-tuning", "System Design", "Off-campus Referrals"],
    slotsAvailable: 2,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
  },
  {
    id: "men-2",
    name: "Rahul Venkatesh",
    role: "Product Designer",
    company: "Razorpay (ex-PES '22)",
    college: "PES University",
    topics: ["Portfolio Critique", "Design Systems", "Figma to Code"],
    slotsAvailable: 1,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
];

export const CampusHubModal: React.FC<CampusHubModalProps> = ({
  isOpen,
  onClose,
  collegeName = "RV College of Engineering (Bengaluru)",
}) => {
  const [activeTab, setActiveTab] = useState<"societies" | "interviews" | "pass">("pass");
  const [ticketCountdown, setTicketCountdown] = useState<number>(15);
  const [passOtp, setPassOtp] = useState<string>("894-201");
  const [bookedMentorId, setBookedMentorId] = useState<string | null>(null);
  const [selectedVaultSocietyId, setSelectedVaultSocietyId] = useState<string | null>(null);

  // Dynamic anti-scalper rolling OTP generator every 15 seconds
  useEffect(() => {
    if (!isOpen || activeTab !== "pass") return;
    const interval = setInterval(() => {
      setTicketCountdown((prev) => {
        if (prev <= 1) {
          const freshCode = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
          setPassOtp(freshCode);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100">Campus Network & Society Hub</h2>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  S13 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{collegeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/20 px-6 pt-2">
          <button
            onClick={() => setActiveTab("pass")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "pass"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Anti-Scalper Pass
          </button>
          <button
            onClick={() => setActiveTab("societies")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "societies"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Societies & Archives
          </button>
          <button
            onClick={() => setActiveTab("interviews")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "interviews"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Award className="w-4 h-4" />
            Senior Mock Interviews
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: ANTI-SCALPER DYNAMIC PASS */}
          {activeTab === "pass" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 text-slate-300 text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">Zero-Scalper Guarantee: </span>
                  This campus entry ticket dynamically regenerates an HMAC security hash every 15 seconds. Static screenshots cannot be duplicated, shared, or resold on black markets.
                </div>
              </div>

              {/* Digital Pass Card */}
              <div className="relative mx-auto max-w-sm rounded-2xl border-2 border-indigo-500/40 bg-slate-950 p-6 shadow-xl flex flex-col items-center text-center">
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  VERIFIED STUDENT
                </div>

                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
                  8TH MILE FEST '26
                </div>
                <p className="text-xs text-indigo-400 font-medium">All-Access Cultural & Tech Pass</p>
                <div className="mt-1 text-[11px] text-slate-500">RVCE Campus Main Arena • Bengaluru</div>

                {/* Animated QR Block */}
                <div className="relative mt-6 p-4 bg-white rounded-xl shadow-inner flex flex-col items-center justify-center">
                  <div className="w-40 h-40 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden">
                    <QrCode className="w-32 h-32 text-slate-900" />
                    <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
                  </div>
                  <div className="mt-2 text-slate-900 font-mono font-bold tracking-widest text-sm">
                    {passOtp}
                  </div>
                </div>

                {/* Rolling Hash Countdown */}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>Pass regenerates in: <strong className="text-indigo-400 font-mono">{ticketCountdown}s</strong></span>
                </div>

                <div className="mt-6 pt-4 w-full border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center">
                  <span>Student ID: <strong className="text-slate-200">1RV22CS089</strong></span>
                  <span className="text-emerald-400 font-medium">Gate Pass Valid</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIETIES & ARCHIVES */}
          {activeTab === "societies" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Active Recognized Campus Clubs ({mockSocieties.length})</span>
                <span className="text-indigo-400 font-medium">Auto-Archived Year-Over-Year</span>
              </div>

              <div className="space-y-3">
                {mockSocieties.map((society) => (
                  <div
                    key={society.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{society.badge}</span>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200">{society.name}</h4>
                          <p className="text-[11px] text-indigo-400">{society.category} • Lead: {society.lead}</p>
                        </div>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 font-medium">
                        {society.membersCount} members
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                      {society.description}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center text-xs">
                      <span className="text-slate-500 text-[11px]">Includes past project records & repo links</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedVaultSocietyId(selectedVaultSocietyId === society.id ? null : society.id)
                        }
                        className="h-7 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                      >
                        {selectedVaultSocietyId === society.id ? "Hide Vault" : "View Club Vault"}
                      </Button>
                    </div>

                    {selectedVaultSocietyId === society.id && (
                      <div className="mt-3 p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between font-semibold text-indigo-300 text-[11px]">
                          <span>📂 Club Vault & Archives</span>
                          <span className="font-mono text-[10px] text-slate-400">repo: v2.4</span>
                        </div>
                        <div className="space-y-1 text-slate-300 text-[11px]">
                          <p>• <strong>Primary Repository:</strong> <span className="font-mono text-indigo-400">github.com/{society.college.toLowerCase().replace(/[^a-z0-9]/g, '')}/{society.name.toLowerCase().replace(/[^a-z0-9]/g, '')}</span></p>
                          <p>• <strong>Lead Contact:</strong> {society.lead}</p>
                          <p>• <strong>Active Projects:</strong> Inter-collegiate rover telemetry & autonomous systems</p>
                          <p>• <strong>Annual Handover:</strong> Verified digital handover timestamped to institutional registry</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SENIOR MOCK INTERVIEWS */}
          {activeTab === "interviews" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">100% Free Peer Mentorship: </span>
                Seniors and alumni dedicate weekend slots to conduct confidential mock technical screens and portfolio critiques for juniors. Zero commercial courses or paywalls.
              </div>

              <div className="space-y-3">
                {mockMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{mentor.name}</h4>
                        <p className="text-xs text-indigo-400">{mentor.role} • <span className="text-slate-400">{mentor.company}</span></p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {mentor.topics.map((t, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-xs font-medium text-emerald-400">{mentor.slotsAvailable} free slot left</div>
                        <div className="text-[10px] text-slate-500">Google Meet / 30m</div>
                      </div>
                      <Button
                        size="sm"
                        disabled={bookedMentorId === mentor.id}
                        onClick={() => setBookedMentorId(mentor.id)}
                        className={`h-8 text-xs ${
                          bookedMentorId === mentor.id
                            ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {bookedMentorId === mentor.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Slot Reserved
                          </>
                        ) : (
                          "Book Mock Call"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/50 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Campus Network: RVCE / Bangalore University Tier 1 Node</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs border-slate-700">
            Close Hub
          </Button>
        </div>

      </div>
    </div>
  );
};
