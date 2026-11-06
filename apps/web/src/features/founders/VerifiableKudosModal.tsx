import React, { useState } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  GitCommit,
  ExternalLink,
  Plus,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface VerifiableKudos {
  id: string;
  recipientName: string;
  skillName: string;
  endorserName: string;
  endorserRole: string;
  proofType: "git_commit" | "build_space_ship" | "incident_triage";
  proofTitle: string;
  proofReference: string;
  verifiedAt: string;
}

interface VerifiableKudosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockKudos: VerifiableKudos[] = [
  {
    id: "k-1",
    recipientName: "Aarav Sharma",
    skillName: "High-Throughput Go Systems",
    endorserName: "Vikram Rathore",
    endorserRole: "VP Engineering at FinFlow",
    proofType: "git_commit",
    proofTitle: "Replaced HTTP Gateway with Zero-Alloc Ring Buffer",
    proofReference: "github.com/finflow/core-gateway/commit/8f102a9",
    verifiedAt: "3 days ago"
  },
  {
    id: "k-2",
    recipientName: "Aarav Sharma",
    skillName: "Distributed PostgreSQL Optimization",
    endorserName: "Pooja Hegde",
    endorserRole: "Staff DBA at QuickPay",
    proofType: "incident_triage",
    proofTitle: "P99 Latency Tuning during Diwali Peak Load Spike",
    proofReference: "balaga.online/build-spaces/incident-918",
    verifiedAt: "2 weeks ago"
  },
  {
    id: "k-3",
    recipientName: "Devika Sen",
    skillName: "Zero-Knowledge Authentication",
    endorserName: "Karthik S.",
    endorserRole: "Security Architect at CyberShield",
    proofType: "build_space_ship",
    proofTitle: "Shipped FIDO2 WebAuthn Passkey Native Module",
    proofReference: "balaga.online/build-spaces/zerotrace/sprint-4",
    verifiedAt: "1 month ago"
  }
];

export const VerifiableKudosModal: React.FC<VerifiableKudosModalProps> = ({
  isOpen,
  onClose
}) => {
  const [kudosList, setKudosList] = useState<VerifiableKudos[]>(mockKudos);
  const [isAwardingOpen, setIsAwardingOpen] = useState(false);
  const [recipientInput, setRecipientInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [proofTypeInput, setProofTypeInput] = useState<"git_commit" | "build_space_ship" | "incident_triage">("git_commit");
  const [proofTitleInput, setProofTitleInput] = useState("");
  const [proofRefInput, setProofRefInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAwardKudos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientInput.trim() || !skillInput.trim() || !proofRefInput.trim()) return;

    const newKudos: VerifiableKudos = {
      id: `k-${Date.now()}`,
      recipientName: recipientInput.trim(),
      skillName: skillInput.trim(),
      endorserName: "Aarav Sharma",
      endorserRole: "Verified Founder",
      proofType: proofTypeInput,
      proofTitle: proofTitleInput.trim() || "Peer Production Verification",
      proofReference: proofRefInput.trim(),
      verifiedAt: "Just now"
    };

    setKudosList([newKudos, ...kudosList]);
    setRecipientInput("");
    setSkillInput("");
    setProofTitleInput("");
    setProofRefInput("");
    setIsAwardingOpen(false);
    setFeedback(`Verifiable kudos awarded to ${newKudos.recipientName}!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Verifiable Proof-of-Skill Kudos
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  F23 Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Commit & Sprint Backed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic peer skill endorsements backed by verifiable Git commits, PR merges, and incident triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner & Action */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Anti-Fluff Endorsement Standard
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Zero arbitrary endorsements. Every single badge requires an immutable Git commit hash or verified Build Space sprint reference.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsAwardingOpen(!isAwardingOpen)}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Award Verifiable Kudos
            </Button>
          </div>

          {feedback && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Award Kudos Form Modal Block */}
          {isAwardingOpen && (
            <form onSubmit={handleAwardKudos} className="p-5 rounded-2xl bg-slate-800/60 border border-amber-500/40 space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Award Immutable Skill Proof
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Builder Name / @username</label>
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Verified Technical Skill</label>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. Distributed Consensus (Raft)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Proof Verification Type</label>
                  <select
                    value={proofTypeInput}
                    onChange={(e) => setProofTypeInput(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="git_commit">Git Commit Hash</option>
                    <option value="build_space_ship">Build Space Sprint Shipped</option>
                    <option value="incident_triage">Production Incident Triage</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Impact Title</label>
                  <input
                    type="text"
                    value={proofTitleInput}
                    onChange={(e) => setProofTitleInput(e.target.value)}
                    placeholder="e.g. Implemented zero-copy memory ring buffer"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Immutable Proof Link / Commit URI</label>
                <input
                  type="text"
                  value={proofRefInput}
                  onChange={(e) => setProofRefInput(e.target.value)}
                  placeholder="e.g. github.com/repo/commit/7a892b4 or balaga.online/build-spaces/sprint-2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAwardingOpen(false)}
                  className="border-slate-700 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!recipientInput.trim() || !skillInput.trim() || !proofRefInput.trim()}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Confirm & Mint Proof
                </Button>
              </div>
            </form>
          )}

          {/* Kudos List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Verified Builder Kudos Ledger ({kudosList.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kudosList.map((kudos) => (
                <div
                  key={kudos.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          Skill Proof
                        </span>
                        <h5 className="text-sm font-bold text-white mt-0.5">
                          {kudos.skillName}
                        </h5>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 font-medium">
                      "{kudos.proofTitle}"
                    </p>

                    <div className="mt-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                      <GitCommit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-400 truncate flex-1">
                        {kudos.proofReference}
                      </span>
                      <a
                        href={`https://${kudos.proofReference}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300"
                        title="View Commit Proof"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Awarded to <strong className="text-slate-200">{kudos.recipientName}</strong></span>
                    <span>by {kudos.endorserName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>All endorsements cross-referenced against Git commit hashes and build space logs</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Close Kudos
          </Button>
        </div>
      </div>
    </div>
  );
};
