import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  Lock,
  Flame,
  X,
  Search,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface CompanyPulse {
  id: string;
  domain: string;
  companyName: string;
  verifiedMembers: number;
  overallRating: number;
  cultureScore: number;
  techStackModernness: number;
  onCallSanity: number;
  recentThreads: PulseThread[];
}

interface PulseThread {
  id: string;
  authorLabel: string;
  isAnonymous: boolean;
  topic: string;
  snippet: string;
  upvotes: number;
  repliesCount: number;
  postedAt: string;
}

interface HonestDomainPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockCompanyPulses: CompanyPulse[] = [
  {
    id: "zerodha",
    domain: "zerodha.com",
    companyName: "Zerodha",
    verifiedMembers: 142,
    overallRating: 4.8,
    cultureScore: 96,
    techStackModernness: 92,
    onCallSanity: 88,
    recentThreads: [
      {
        id: "t1",
        authorLabel: "Senior Core Infra Dev • @zerodha.com (Verified)",
        isAnonymous: true,
        topic: "Handling 15M orders/sec on market open days without Kafka",
        snippet: "We rely heavily on self-hosted Redis cluster and raw TCP sockets in Go. No Kafka cluster overhead, sub-millisecond p99 latencies.",
        upvotes: 84,
        repliesCount: 19,
        postedAt: "3 hours ago"
      },
      {
        id: "t2",
        authorLabel: "Platform Engineer • @zerodha.com (Verified)",
        isAnonymous: false,
        topic: "Zero-meeting Thursdays: Does it actually hold?",
        snippet: "Yes, completely enforced by tech leadership. Pull requests and async RFCs are the norm. Best engineering sanity in Indian tech.",
        upvotes: 62,
        repliesCount: 11,
        postedAt: "1 day ago"
      }
    ]
  },
  {
    id: "swiggy",
    domain: "swiggy.in",
    companyName: "Swiggy",
    verifiedMembers: 310,
    overallRating: 4.3,
    cultureScore: 84,
    techStackModernness: 90,
    onCallSanity: 76,
    recentThreads: [
      {
        id: "t3",
        authorLabel: "Staff Logistics Architect • @swiggy.in (Verified)",
        isAnonymous: true,
        topic: "Rain Surge dynamic dispatch algorithm v3 real-world telemetry",
        snippet: "During monsoon spikes, our dispatch heuristics recompute delivery routes every 8 seconds across 40 micro-zones using Golang workers.",
        upvotes: 95,
        repliesCount: 28,
        postedAt: "5 hours ago"
      }
    ]
  },
  {
    id: "postman",
    domain: "postman.com",
    companyName: "Postman",
    verifiedMembers: 185,
    overallRating: 4.6,
    cultureScore: 90,
    techStackModernness: 94,
    onCallSanity: 86,
    recentThreads: [
      {
        id: "t4",
        authorLabel: "API Systems Lead • @postman.com (Verified)",
        isAnonymous: true,
        topic: "Migrating from monolith Node to Rust for local mock servers",
        snippet: "Local execution latency dropped from 85ms to 3ms. Cold boot memory consumption down by 78%.",
        upvotes: 112,
        repliesCount: 34,
        postedAt: "Yesterday"
      }
    ]
  }
];

export const HonestDomainPulseModal: React.FC<HonestDomainPulseModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("zerodha");
  const [searchFilter, setSearchFilter] = useState("");
  const [newThreadTopic, setNewThreadTopic] = useState("");
  const [newThreadSnippet, setNewThreadSnippet] = useState("");
  const [postAsAnonymous, setPostAsAnonymous] = useState(true);
  const [pulses, setPulses] = useState<CompanyPulse[]>(mockCompanyPulses);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCompany = pulses.find((p) => p.id === selectedCompanyId) || pulses[0];

  const handlePostThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTopic.trim() || !newThreadSnippet.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newThread: PulseThread = {
        id: `t-${Date.now()}`,
        authorLabel: postAsAnonymous
          ? `Verified Engineer • @${activeCompany.domain} (Anonymous)`
          : `Aarav Sharma • @${activeCompany.domain} (Verified)`,
        isAnonymous: postAsAnonymous,
        topic: newThreadTopic.trim(),
        snippet: newThreadSnippet.trim(),
        upvotes: 1,
        repliesCount: 0,
        postedAt: "Just now"
      };

      setPulses((prev) =>
        prev.map((c) =>
          c.id === activeCompany.id
            ? { ...c, recentThreads: [newThread, ...c.recentThreads] }
            : c
        )
      );

      setNewThreadTopic("");
      setNewThreadSnippet("");
      setIsSubmitting(false);
      setSubmitFeedback("Thread published to verified domain channel!");
      setTimeout(() => setSubmitFeedback(null), 3000);
    }, 400);
  };

  const handleUpvote = (threadId: string) => {
    setPulses((prev) =>
      prev.map((c) =>
        c.id === activeCompany.id
          ? {
              ...c,
              recentThreads: c.recentThreads.map((t) =>
                t.id === threadId ? { ...t, upvotes: t.upvotes + 1 } : t
              )
            }
          : c
      )
    );
  };

  const filteredCompanies = pulses.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-rose-500/30 text-rose-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Honest Domain Pulse
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                  F21 Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Work Email Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Candid, civil engineering insights from verified company domains with anti-dox anonymity
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

        {/* Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Sidebar: Companies List */}
          <div className="w-full md:w-72 border-r border-slate-800 p-4 flex flex-col gap-3 bg-slate-950/40">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search domains..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCompanies.map((c) => {
                const isSelected = c.id === activeCompany.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompanyId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-rose-500/10 border-rose-500/40 text-white"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{c.companyName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                        ★ {c.overallRating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>@{c.domain}</span>
                      <span>{c.verifiedMembers} verified</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Zero-knowledge verification: Company domains are verified via DKIM token without storing raw email in plain text.
              </span>
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Selected Company Radar & Metrics */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{activeCompany.companyName}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      @{activeCompany.domain}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeCompany.verifiedMembers} engineers & product founders verified inside this hub
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-rose-400">★ {activeCompany.overallRating}</span>
                  <span className="text-xs text-slate-400">Domain Sentiment Index</span>
                </div>
              </div>

              {/* Three Dimension Score Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Culture & Autonomy</span>
                    <span className="text-emerald-400">{activeCompany.cultureScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${activeCompany.cultureScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Tech Stack Modernness</span>
                    <span className="text-cyan-400">{activeCompany.techStackModernness}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${activeCompany.techStackModernness}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">On-Call Sanity</span>
                    <span className="text-amber-400">{activeCompany.onCallSanity}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${activeCompany.onCallSanity}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Post Candid Thread Form */}
            <form onSubmit={handlePostThread} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Share Candid Insight or Ask AMA
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={postAsAnonymous}
                    onChange={(e) => setPostAsAnonymous(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
                  />
                  <span>Post Anonymously (Hide Name)</span>
                </label>
              </div>

              <input
                type="text"
                value={newThreadTopic}
                onChange={(e) => setNewThreadTopic(e.target.value)}
                placeholder="Topic: e.g. Actual microservices count vs monolith reality..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />

              <textarea
                value={newThreadSnippet}
                onChange={(e) => setNewThreadSnippet(e.target.value)}
                placeholder="Share your technical observation, architecture lessons learned, or question..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Protected under Balaga Zero-Retaliation Domain Shield.
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !newThreadTopic.trim() || !newThreadSnippet.trim()}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs px-4"
                >
                  {isSubmitting ? "Publishing..." : "Publish Insight"}
                </Button>
              </div>

              {submitFeedback && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{submitFeedback}</span>
                </div>
              )}
            </form>

            {/* Recent Threads Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" /> Domain Insights & AMA Threads ({activeCompany.recentThreads.length})
                </h4>
              </div>

              {activeCompany.recentThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 hover:border-slate-600 transition"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-300 flex items-center gap-1">
                      {thread.authorLabel}
                    </span>
                    <span>{thread.postedAt}</span>
                  </div>

                  <h5 className="text-sm font-bold text-white tracking-tight">
                    {thread.topic}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {thread.snippet}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                    <button
                      onClick={() => handleUpvote(thread.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{thread.upvotes} Upvotes</span>
                    </button>

                    <div className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{thread.repliesCount} replies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Anti-Defamation & Civility Rule: Discussions must focus on tech stack, engineering culture, and architectures.</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Close Pulse
          </Button>
        </div>
      </div>
    </div>
  );
};
