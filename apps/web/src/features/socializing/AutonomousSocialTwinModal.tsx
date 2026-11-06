import React, { useState } from "react";
import {
  Bot,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Cpu,
  RefreshCw,
  Plus,
  Trash2,
  Handshake,
  X
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface SocialTwinAttribute {
  id: string;
  category: "Interests" | "Hobbies" | "Weekend Vibes" | "Reading";
  label: string;
  weight: number;
}

interface PeerTwinIntroduction {
  id: string;
  peerName: string;
  peerAvatar: string;
  peerHandle: string;
  commonVectors: string[];
  matchScore: number;
  introRationale: string;
  status: "pending" | "connected" | "dismissed";
}

interface AutonomousSocialTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialAttributes: SocialTwinAttribute[] = [
  { id: "a1", category: "Interests", label: "Kannada Indic Computing & NLP", weight: 94 },
  { id: "a2", category: "Hobbies", label: "Weekend Cycling (Nandi Hills / Hesaraghatta)", weight: 88 },
  { id: "a3", category: "Weekend Vibes", label: "Specialty Filter Coffee & Book Cafes", weight: 92 },
  { id: "a4", category: "Reading", label: "Distributed Systems & Rust RFCs", weight: 85 },
];

const mockIntroductions: PeerTwinIntroduction[] = [
  {
    id: "intro-1",
    peerName: "Kavya Murthy",
    peerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    peerHandle: "kavya_indic",
    commonVectors: ["Indic NLP", "Filter Coffee", "Indiranagar Cafes"],
    matchScore: 94,
    introRationale: "Both Twins identified strong alignment around regional Indic language models and weekend cafe co-working.",
    status: "pending"
  },
  {
    id: "intro-2",
    peerName: "Rahul Verma",
    peerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    peerHandle: "rahul_rides",
    commonVectors: ["Cycling", "Rust Systems", "Monk Mode"],
    matchScore: 89,
    introRationale: "Both Twins share weekend endurance cycling routes and deep-work sprint preferences.",
    status: "pending"
  }
];

export const AutonomousSocialTwinModal: React.FC<AutonomousSocialTwinModalProps> = ({
  isOpen,
  onClose
}) => {
  const [twinEnabled, setTwinEnabled] = useState(true);
  const [attributes, setAttributes] = useState<SocialTwinAttribute[]>(initialAttributes);
  const [introductions, setIntroductions] = useState<PeerTwinIntroduction[]>(mockIntroductions);
  const [newAttrLabel, setNewAttrLabel] = useState("");
  const [newAttrCategory, setNewAttrCategory] = useState<SocialTwinAttribute["category"]>("Interests");
  const [isSimulatingHandshake, setIsSimulatingHandshake] = useState(false);
  const [handshakeLog, setHandshakeLog] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrLabel.trim()) return;

    const newAttr: SocialTwinAttribute = {
      id: `attr-${Date.now()}`,
      category: newAttrCategory,
      label: newAttrLabel.trim(),
      weight: 90
    };

    setAttributes([...attributes, newAttr]);
    setNewAttrLabel("");
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(attributes.filter((a) => a.id !== id));
  };

  const handleSimulateHandshake = () => {
    setIsSimulatingHandshake(true);
    setHandshakeLog(null);

    setTimeout(() => {
      setIsSimulatingHandshake(false);
      setHandshakeLog("Encrypted Vector Exchange Complete: Zero plaintext leaked • 3 common interests matched with 91% affinity.");
    }, 700);
  };

  const handleAcceptIntro = (id: string) => {
    setIntroductions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "connected" } : i))
    );
  };

  const handleDismissIntro = (id: string) => {
    setIntroductions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "dismissed" } : i))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Autonomous Social Twin
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                  S25 Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Zero-Knowledge Introductions
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Privacy-preserving on-device AI assistant that exchanges encrypted affinity vectors to discover genuine friend sparks
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
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Twin Status & Learned Attributes */}
          <div className="w-full md:w-96 border-r border-slate-800 p-5 flex flex-col gap-4 bg-slate-950/40 overflow-y-auto">
            {/* Status toggle card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Twin Engine</span>
                </div>
                <button
                  onClick={() => setTwinEnabled(!twinEnabled)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition ${
                    twinEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {twinEnabled ? "ACTIVE (LOCAL)" : "PAUSED"}
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                256-dimensional encrypted embeddings synthesized purely in browser local storage. Zero telemetry sent to cloud LLMs.
              </p>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Vector Hash: 0x8f2b..41e</span>
                <span>Last updated: Just now</span>
              </div>
            </div>

            {/* Learned Attributes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Learned Social Attributes ({attributes.length})
                </span>
              </div>

              <div className="space-y-2">
                {attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-violet-400 block font-mono uppercase">
                        {attr.category}
                      </span>
                      <span className="text-slate-200 truncate block font-medium">
                        {attr.label}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAttribute(attr.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add custom attribute form */}
              <form onSubmit={handleAddAttribute} className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex gap-2">
                  <select
                    value={newAttrCategory}
                    onChange={(e) => setNewAttrCategory(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-2 py-1.5 text-slate-200 focus:outline-none"
                  >
                    <option value="Interests">Interests</option>
                    <option value="Hobbies">Hobbies</option>
                    <option value="Weekend Vibes">Vibes</option>
                    <option value="Reading">Reading</option>
                  </select>
                  <input
                    type="text"
                    value={newAttrLabel}
                    onChange={(e) => setNewAttrLabel(e.target.value)}
                    placeholder="Add hobby or vibe..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg text-xs px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!newAttrLabel.trim()}
                    className="bg-violet-600 hover:bg-violet-500 px-3 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Curated Mutual Introductions */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Interactive Vector Handshake Simulator */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Zero-Knowledge Introduction Handshake
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Simulate how two autonomous Twins perform an encrypted inner-product vector match to find mutual connections without revealing personal raw profiles.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleSimulateHandshake}
                disabled={isSimulatingHandshake}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 flex items-center gap-2 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingHandshake ? "animate-spin" : ""}`} />
                {isSimulatingHandshake ? "Encrypting Vector..." : "Test Twin Handshake"}
              </Button>
            </div>

            {handshakeLog && (
              <div className="p-3 bg-violet-950/60 border border-violet-500/40 rounded-xl text-xs text-violet-200 flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span>{handshakeLog}</span>
              </div>
            )}

            {/* Curated Introductions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-violet-400" />
                  Curated Twin Introductions ({introductions.filter((i) => i.status !== "dismissed").length})
                </span>
                <span className="text-[11px] text-slate-500">Encrypted Discovery</span>
              </div>

              {introductions.filter((i) => i.status !== "dismissed").map((intro) => (
                <div
                  key={intro.id}
                  className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-violet-500/40 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={intro.peerAvatar}
                        alt={intro.peerName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{intro.peerName}</h4>
                          <span className="text-xs text-slate-400 font-mono">@{intro.peerHandle}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {intro.introRationale}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono font-bold text-violet-400">
                        {intro.matchScore}% Match
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono">Vector Affinity</span>
                    </div>
                  </div>

                  {/* Common vectors badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400 font-medium">Common Affinity:</span>
                    {intro.commonVectors.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-medium"
                      >
                        #{v}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      {intro.status === "connected"
                        ? "✓ Introduction Spark Sent!"
                        : "Both Twins verified zero-leakage consent"}
                    </span>

                    {intro.status === "connected" ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Spark Delivered
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDismissIntro(intro.id)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          Dismiss
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptIntro(intro.id)}
                          className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4"
                        >
                          Accept Intro Spark ✨
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Zero-Knowledge Promise: Raw user chats or exact GPS coordinates are NEVER converted into vector tags.</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Close Twin
          </Button>
        </div>
      </div>
    </div>
  );
};
