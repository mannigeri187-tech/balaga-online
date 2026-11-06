import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Brain,
  History,
  Settings,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  X,
  Lock,
} from "lucide-react";
import { useWorld } from "../contexts/WorldContext";
import { WORLDS } from "@platform/config";
import {
  AiConsentState,
  AiActivityLog,
  AiMetricsSummary,
  AiResponsePayload,
  ConsequentialActionProposal,
  AiTaskType,
} from "@platform/shared-types";

interface IntelligenceControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntelligenceControlModal: React.FC<IntelligenceControlModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeWorld } = useWorld();
  const isSocial = activeWorld === WORLDS.SOCIALIZING;

  const [activeTab, setActiveTab] = useState<"assistant" | "consent" | "history" | "metrics">("assistant");
  const [promptText, setPromptText] = useState("");
  const [taskType, setTaskType] = useState<AiTaskType>("summary");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AiResponsePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingProposal, setPendingProposal] = useState<ConsequentialActionProposal | null>(null);

  // Consent & Memory State
  const [consent, setConsent] = useState<AiConsentState>({
    accountId: "00000000-0000-0000-0000-000000000001",
    socialAiEnabled: true,
    foundersAiEnabled: true,
    allowSocialMemory: true,
    allowFoundersMemory: true,
    allowExperimentalModels: false,
    updatedAt: new Date().toISOString(),
  });
  const [saveConsentToast, setSaveConsentToast] = useState(false);

  // Activity & Metrics State
  const [activityLogs, setActivityLogs] = useState<AiActivityLog[]>([]);
  const [metrics, setMetrics] = useState<AiMetricsSummary>({
    totalRequests: 14,
    totalTokens: 3820,
    totalCostInr: 0.0,
    socialRequests: 8,
    foundersRequests: 6,
    zeroDataLeakageGuaranteed: true,
    activeProvider: "local_deterministic (Zero-Cost / Offline)",
  });

  // Load consent & logs from API on open
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/ai/consent", {
      headers: {
        "x-platform-world": activeWorld,
        "x-mock-user": "true",
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setConsent(data);
      })
      .catch(() => {});

    fetch("/api/ai/metrics", {
      headers: {
        "x-platform-world": activeWorld,
        "x-mock-user": "true",
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMetrics(data);
      })
      .catch(() => {});

    fetch("/api/ai/activity", {
      headers: {
        "x-platform-world": activeWorld,
        "x-mock-user": "true",
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.logs) setActivityLogs(data.logs);
      })
      .catch(() => {});
  }, [isOpen, activeWorld]);

  if (!isOpen) return null;

  const handleSendPrompt = async () => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setResponse(null);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": activeWorld,
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          prompt: promptText,
          taskType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute AI request");
      }

      setResponse(data);
      if (data.proposedAction) {
        setPendingProposal(data.proposedAction);
      }

      // Refresh logs & metrics
      fetch("/api/ai/metrics", {
        headers: { "x-platform-world": activeWorld, "x-mock-user": "true" },
      })
        .then((r) => r.json())
        .then(setMetrics)
        .catch(() => {});

      fetch("/api/ai/activity", {
        headers: { "x-platform-world": activeWorld, "x-mock-user": "true" },
      })
        .then((r) => r.json())
        .then((d) => setActivityLogs(d.logs || []))
        .catch(() => {});
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveProposal = async (approved: boolean) => {
    if (!pendingProposal) return;
    try {
      await fetch(`/api/ai/actions/${pendingProposal.id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": activeWorld,
          "x-mock-user": "true",
        },
        body: JSON.stringify({ approved }),
      });

      setPendingProposal({
        ...pendingProposal,
        status: approved ? "approved" : "rejected",
      });
    } catch (err: any) {
      alert("Error resolving proposal: " + err.message);
    }
  };

  const handleToggleConsent = async (field: keyof AiConsentState) => {
    const updated = {
      ...consent,
      [field]: !consent[field],
    };
    setConsent(updated);

    try {
      await fetch("/api/ai/consent", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": activeWorld,
          "x-mock-user": "true",
        },
        body: JSON.stringify(updated),
      });
      setSaveConsentToast(true);
      setTimeout(() => setSaveConsentToast(false), 2000);
    } catch (err: any) {
      alert("Failed to update consent preferences");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isSocial
                ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}>
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Balaga Intelligence — {isSocial ? "Socializing AI" : "Founders AI"}
                </h2>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  MILESTONE 1 LIVE
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Zero-Leakage Shield Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Understand context · Recommend wisely · Act with permission · ₹0-first architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-2">
          <button
            onClick={() => setActiveTab("assistant")}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "assistant"
                ? isSocial
                  ? "border-violet-500 text-violet-300"
                  : "border-emerald-500 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("consent")}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "consent"
                ? isSocial
                  ? "border-violet-500 text-violet-300"
                  : "border-emerald-500 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Privacy & Consent Controls</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "history"
                ? isSocial
                  ? "border-violet-500 text-violet-300"
                  : "border-emerald-500 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>User Audit History</span>
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "metrics"
                ? isSocial
                  ? "border-violet-500 text-violet-300"
                  : "border-emerald-500 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Token & Cost Accounting</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: INTERACTIVE ASSISTANT */}
          {activeTab === "assistant" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-100">Realm Context: </span>
                  <span className={isSocial ? "text-violet-400 font-bold" : "text-emerald-400 font-bold"}>
                    {isSocial ? "Socializing (Friends & Interests)" : "Founders (Startups & Collabs)"}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Queries are strictly bound to this realm. The AI is prevented by gateway guards from accessing opposite realm tables.
                  </p>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-400">
                  Provider: <span className="text-sky-400">{metrics.activeProvider}</span>
                </div>
              </div>

              {/* Task Selector */}
              <div className="flex gap-2 flex-wrap">
                {(isSocial
                  ? [
                      { id: "summary" as AiTaskType, label: "Summarize Activity 📋", prompt: "Summarize my Bangalore badminton circle and film chat" },
                      { id: "caption_assistant" as AiTaskType, label: "Caption Drafter ✍️", prompt: "Draft engaging, culturally respectful captions for morning coffee and badminton" },
                      { id: "community_digest" as AiTaskType, label: "Community Digest 📢", prompt: "Synthesize recent circle activities, active discussions and meetups" },
                      { id: "faq_detection" as AiTaskType, label: "Circle FAQ Match ❓", prompt: "Where are the best synthetic badminton courts in Koramangala or HSR?" },
                      { id: "braintrust_assist" as AiTaskType, label: "Brain Trust Mentor 🧠", prompt: "How should a beginner get started with street photography in Bangalore?" },
                      { id: "moderation_assist" as AiTaskType, label: "Moderation Checker 🛡️", prompt: "Check this message for compliance with civil community standards" },
                      { id: "moderation_appeal" as AiTaskType, label: "Appeal Decision ⚖️", prompt: "Review my flagged post about the photography meet for reinstatement" },
                      { id: "living_board_curator" as AiTaskType, label: "Curate Living Board 📁", prompt: "Organize my saved Bangalore cafes into a curated Living Board" },
                      { id: "weekly_recap" as AiTaskType, label: "Weekly Recap 🎉", prompt: "Generate my weekly personal recap of moments and circle interactions" },
                      { id: "inactivity_alert" as AiTaskType, label: "Circle Sentinel ⚡", prompt: "Check Bangalore Film Circle for participation dips and discussion ideas" },
                      { id: "matching" as AiTaskType, label: "Beyond Followers 🤝", prompt: "Find compatible friends with shared creative and badminton interests" },
                      { id: "discovery_explanation" as AiTaskType, label: "Explain Discovery 💡", prompt: "Why was this content recommended on my feed?" },
                      { id: "action_proposal" as AiTaskType, label: "Agentic Task (With Approval) ⚡", prompt: "Organize my saved weekend cafe spots into a Living Board" },
                    ]
                  : [
                      { id: "summary" as AiTaskType, label: "Traction Pulse 🚀", prompt: "Summarize my startup MVP traction & team applications" },
                      { id: "market_research" as AiTaskType, label: "Market & Competitor Intel 📊", prompt: "Analyze the Indian developer tools and real-time workspace market" },
                      { id: "task_breakdown" as AiTaskType, label: "Build Space Task Breakdown 🔨", prompt: "Decompose UPI escrow integration into sprint user stories" },
                      { id: "bottleneck_warning" as AiTaskType, label: "Sprint Bottleneck Warning ⚠️", prompt: "Check active sprint for stalled pull requests and unblocking needs" },
                      { id: "deadline_alert" as AiTaskType, label: "Grants & Hackathons 🏆", prompt: "Alert me to upcoming Indian tech grants, SISFS intake, and hackathons" },
                      { id: "matching" as AiTaskType, label: "Co-founder / ATS Match 🤝", prompt: "Find co-founders with React and Three.js capabilities" },
                      { id: "review" as AiTaskType, label: "Pitch Deck Reviewer 📑", prompt: "Review our pre-seed pitch outline and unit economics narrative" },
                      { id: "action_proposal" as AiTaskType, label: "Agentic Task (With Approval) ⚡", prompt: "Draft a warm collaborator invite to Sneha M." },
                      { id: "discovery_explanation" as AiTaskType, label: "Explain Discovery 💡", prompt: "Why was this investor or opportunity recommended to my startup?" },
                    ]
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTaskType(t.id);
                      setPromptText(t.prompt);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      taskType === t.id
                        ? isSocial
                          ? "bg-violet-600 border-violet-400 text-white shadow-sm"
                          : "bg-emerald-600 border-emerald-400 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className="space-y-2">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={
                    isSocial
                      ? "Ask Balaga Social Intelligence (e.g. summarize my circle discussions, help write a caption)..."
                      : "Ask Balaga Founders Intelligence (e.g. summarize startup traction, review pitch outline)..."
                  }
                  className="w-full h-24 bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-600"
                />

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">
                    🔒 Zero covert profiling. Consequential actions require your approval.
                  </span>
                  <button
                    onClick={handleSendPrompt}
                    disabled={isLoading || !promptText.trim()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg transition ${
                      isLoading || !promptText.trim()
                        ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500"
                        : isSocial
                        ? "bg-violet-600 hover:bg-violet-500 shadow-violet-900/30"
                        : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Query Intelligence</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-200">Gateway Boundary Notice: </span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Response Display */}
              {response && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Intelligence Synthesis</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>Model: <strong className="text-slate-300">{response.model}</strong></span>
                      <span>Latency: <strong className="text-slate-300">{response.latencyMs}ms</strong></span>
                      <span>Cost: <strong className="text-emerald-400">₹{response.costInr}</strong></span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {response.content}
                  </div>

                  {response.explanation && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="text-sky-400 font-semibold">Why this response:</span>
                      <span>{response.explanation}</span>
                    </div>
                  )}

                  {/* CONSEQUENTIAL ACTION APPROVAL GATE */}
                  {pendingProposal && (
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Consequential Action Requires Your Explicit Approval</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>{pendingProposal.title}:</strong> {pendingProposal.description}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        {pendingProposal.status === "pending_approval" ? (
                          <>
                            <button
                              onClick={() => handleResolveProposal(true)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Action</span>
                            </button>
                            <button
                              onClick={() => handleResolveProposal(false)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject & Discard</span>
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs font-bold ${pendingProposal.status === "approved" ? "text-emerald-400" : "text-rose-400"}`}>
                            {pendingProposal.status === "approved" ? "✅ Action Approved and Executed" : "❌ Action Discarded by User"}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRIVACY & CONSENT CONTROLS */}
          {activeTab === "consent" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Privacy-First Intelligence Agreement</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Under Balaga's core architectural tenets, you maintain absolute sovereignty over how AI assists you. Private messages, cap tables, and unreleased project files are excluded from model training.
                </p>
              </div>

              {saveConsentToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AI consent and memory preferences updated successfully.</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">Socializing AI Features</h3>
                    <p className="text-xs text-slate-400">Summaries, beyond-followers matching, Bhasha translation, living boards</p>
                  </div>
                  <button
                    onClick={() => handleToggleConsent("socialAiEnabled")}
                    className={`w-12 h-6 rounded-full transition relative ${
                      consent.socialAiEnabled ? "bg-violet-600" : "bg-slate-700"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      consent.socialAiEnabled ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">Founders AI Features</h3>
                    <p className="text-xs text-slate-400">Startup pulse summaries, opportunity matchmaking, job post assistant</p>
                  </div>
                  <button
                    onClick={() => handleToggleConsent("foundersAiEnabled")}
                    className={`w-12 h-6 rounded-full transition relative ${
                      consent.foundersAiEnabled ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      consent.foundersAiEnabled ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">Social AI Long-Term Memory</h3>
                    <p className="text-xs text-slate-400">Allow assistant to remember your declared sports & creative hobbies</p>
                  </div>
                  <button
                    onClick={() => handleToggleConsent("allowSocialMemory")}
                    className={`w-12 h-6 rounded-full transition relative ${
                      consent.allowSocialMemory ? "bg-violet-600" : "bg-slate-700"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      consent.allowSocialMemory ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">Founders AI Long-Term Memory</h3>
                    <p className="text-xs text-slate-400">Allow assistant to remember your venture stage & hiring preferences</p>
                  </div>
                  <button
                    onClick={() => handleToggleConsent("allowFoundersMemory")}
                    className={`w-12 h-6 rounded-full transition relative ${
                      consent.allowFoundersMemory ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      consent.allowFoundersMemory ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER AUDIT HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span>Recent AI Gateway Requests ({activityLogs.length})</span>
                <span>Full Audit Trail under DPDP Act, 2023</span>
              </div>

              {activityLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No AI activity recorded yet. Run a prompt in the assistant tab to see real audit logs.
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          log.world === "socializing" ? "bg-violet-950 text-violet-300" : "bg-emerald-950 text-emerald-300"
                        }`}>
                          {log.world}
                        </span>
                        <span className="font-semibold text-slate-200">{log.taskType}</span>
                        <span className={`text-[10px] font-mono ${log.status === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                          ● {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{log.summary}</p>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
                      <div>{log.tokensPrompt + log.tokensCompletion} tokens (₹{log.estimatedCostInr})</div>
                      <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()} · {log.durationMs}ms</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: TOKEN & COST ACCOUNTING */}
          {activeTab === "metrics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Total Requests</div>
                  <div className="text-xl font-bold text-white mt-1">{metrics.totalRequests}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Gateway lifetime</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Total Tokens</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">{metrics.totalTokens.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Prompt + Completion</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Total Cost (INR)</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">₹{metrics.totalCostInr}</div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">₹0-First policy active</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">World Breakdown</div>
                  <div className="text-xs font-semibold text-slate-200 mt-1.5">
                    Soc: {metrics.socialRequests} | Fnd: {metrics.foundersRequests}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Strict isolation 100%</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Architectural Zero-Data-Leakage Attestation</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Every request processed by the Balaga Intelligence Gateway executes within a verified cryptographic and database boundary. Private startup cap tables, investment notes, and founder workspaces cannot be queried by Socializing AI, nor can private social connections or messages be accessed by Founders AI.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Gateway Engine: {metrics.activeProvider}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
