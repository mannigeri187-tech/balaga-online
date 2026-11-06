import React, { useState } from "react";
import {
  Trophy,
  Users,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface SquadMember {
  role: "Backend" | "Frontend" | "AI/ML" | "Pitch/Product";
  filled: boolean;
  user?: {
    name: string;
    handle: string;
    avatar: string;
    verifiedCommits: number;
  };
}

interface HackathonSquad {
  id: string;
  hackathonName: string;
  projectIdea: string;
  prizePool: string;
  deadlineDays: number;
  members: SquadMember[];
}

interface HackathonSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockSquads: HackathonSquad[] = [
  {
    id: "sq-1",
    hackathonName: "ETHIndia 2026 (Bengaluru)",
    projectIdea: "Zero-Knowledge UPI Settlement Rails for Cross-Border Freelancers",
    prizePool: "₹25,00,000",
    deadlineDays: 4,
    members: [
      {
        role: "Backend",
        filled: true,
        user: {
          name: "Aarav Sharma",
          handle: "aarav_builder",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
          verifiedCommits: 342,
        },
      },
      {
        role: "Frontend",
        filled: true,
        user: {
          name: "Sneha Murthy",
          handle: "sneha_frontend",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
          verifiedCommits: 184,
        },
      },
      {
        role: "AI/ML",
        filled: false,
      },
      {
        role: "Pitch/Product",
        filled: false,
      },
    ],
  },
  {
    id: "sq-2",
    hackathonName: "Bangalore AI Sprint '26",
    projectIdea: "Autonomous Multimodal Legal Contract Auditing for Indian SMBs",
    prizePool: "₹15,00,000",
    deadlineDays: 8,
    members: [
      {
        role: "AI/ML",
        filled: true,
        user: {
          name: "Karthik R.",
          handle: "karthik_ai",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
          verifiedCommits: 419,
        },
      },
      {
        role: "Pitch/Product",
        filled: true,
        user: {
          name: "Meera Nair",
          handle: "meera_pm",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
          verifiedCommits: 88,
        },
      },
      {
        role: "Backend",
        filled: false,
      },
      {
        role: "Frontend",
        filled: false,
      },
    ],
  },
];

export const HackathonSquadModal: React.FC<HackathonSquadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [squads] = useState<HackathonSquad[]>(mockSquads);
  const [appliedRole, setAppliedRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyRole = (squadId: string, role: string) => {
    setAppliedRole(`${squadId}-${role}`);
    setTimeout(() => {
      setAppliedRole(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Hackathon Squad Matchmaker</h2>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  F17 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Role-locked squad formation verified with GitHub commits and hackathon trophies.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-100">No Flaky Teammates: </span>
              Every applicant's role suitability is attested by their verified codebase commits and past hackathon project submissions on Balaga. Zero last-minute dropouts.
            </div>
          </div>

          <div className="space-y-4">
            {squads.map((squad) => (
              <div
                key={squad.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4 hover:border-amber-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                      {squad.hackathonName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">{squad.projectIdea}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-emerald-400">{squad.prizePool} pool</span>
                    <span className="block text-[10px] text-slate-500">{squad.deadlineDays} days until kickoff</span>
                  </div>
                </div>

                {/* Role-Locked Slot Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {squad.members.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between min-h-[90px] ${
                        m.filled
                          ? "bg-slate-950/80 border-slate-800"
                          : "bg-emerald-950/15 border-emerald-500/30 border-dashed"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {m.role}
                        </span>
                        {m.filled ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                            OPEN
                          </span>
                        )}
                      </div>

                      {m.filled && m.user ? (
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={m.user.avatar}
                            alt={m.user.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-700"
                          />
                          <div className="truncate text-left">
                            <span className="text-[11px] font-medium text-slate-200 block truncate">
                              {m.user.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {m.user.verifiedCommits} commits
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={appliedRole === `${squad.id}-${m.role}`}
                          onClick={() => handleApplyRole(squad.id, m.role)}
                          className="mt-2 h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        >
                          {appliedRole === `${squad.id}-${m.role}` ? "Requested!" : "Claim Slot"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Bangalore Hackathon Node • Verified Builder Teams</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs border-slate-700">
            Close Matchmaker
          </Button>
        </div>

      </div>
    </div>
  );
};
