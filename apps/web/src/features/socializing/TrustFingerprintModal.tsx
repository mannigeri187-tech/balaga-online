import React from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Smartphone,
} from "lucide-react";

interface TrustFingerprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  displayName?: string;
}

export const TrustFingerprintModal: React.FC<TrustFingerprintModalProps> = ({
  isOpen,
  onClose,
  username = "aarav_social",
  displayName = "Aarav Patel",
}) => {
  if (!isOpen) return null;

  const trustMetrics = [
    {
      id: "device",
      title: "Hardware Device Attestation",
      description: "Cryptographically verified device running genuine Balaga client",
      score: "Verified Secure",
      status: "pass",
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "age",
      title: "Account Standing & Longevity",
      description: "Member in good standing since platform inception • 0 policy violations",
      score: "Clean Record",
      status: "pass",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "vouches",
      title: "Earned Peer Vouches",
      description: "Endorsed by 14 mutual circle members in Bangalore Urban Sketchers & Deccan Cyclists",
      score: "14 Vouches",
      status: "pass",
      icon: <Users className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "merit",
      title: "Organic Community Karma",
      description: "Earned purely through helpful answers and meetup attendance • Never purchased",
      score: "98.4% Trust Index",
      status: "pass",
      icon: <Award className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const recentVouchers = [
    { name: "Priya Rao", username: "priya_art", note: "Vouched for Cubbon Park art meetups" },
    { name: "Kabir Mehta", username: "kabir_rides", note: "Vouched for endurance ride conduct" },
    { name: "Ananya Iyer", username: "ananya_film", note: "Vouched for gear lending trust" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Balaga Trust Fingerprint
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                  UNPURCHASABLE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Layered peer trust • Zero paid checkmarks
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
          {/* Top Score Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Overall Trust Rating
              </span>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                Level 3 Verified Peer
                <span className="text-xs text-emerald-400 font-mono font-normal">
                  (Tier: High Trust)
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Vouched for by {displayName} (@{username})
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center font-mono font-bold text-base shadow-lg shadow-emerald-950/40">
              98%
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2.5">
            {trustMetrics.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-white truncate">
                      {item.title}
                    </h5>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold ml-2 shrink-0">
                      {item.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Peer Vouches */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Recent Peer Vouches:
            </span>
            <div className="space-y-1.5">
              {recentVouchers.map((v) => (
                <div
                  key={v.username}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{v.name}</span>{" "}
                    <span className="text-[10px] text-slate-500">(@{v.username})</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{v.note}</p>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Commitment */}
          <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-slate-800">
            Balaga Authenticity Standard: Badges are earned through community actions, never sold for money.
          </div>
        </div>
      </div>
    </div>
  );
};
