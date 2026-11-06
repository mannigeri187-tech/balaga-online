import React, { useState } from "react";
import {
  GitFork,
  FileText,
  Copy,
  Check,
  Code2,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface Blueprint {
  id: string;
  title: string;
  category: "pitch-deck" | "legal" | "tech-stack" | "gtm";
  categoryLabel: string;
  tag: string;
  author: string;
  forksCount: number;
  description: string;
  files: string[];
  snippet: string;
}

interface ForkableBlueprintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForkToBuildSpace?: (blueprintTitle: string) => void;
}

const mockBlueprints: Blueprint[] = [
  {
    id: "bp-1",
    title: "YC-Style Pre-Seed Pitch Deck Blueprint",
    category: "pitch-deck",
    categoryLabel: "Fundraising",
    tag: "10-Slide Standard",
    author: "Balaga Venture Labs",
    forksCount: 428,
    description: "The battle-tested 10-slide minimalist pitch deck structure that raised over $18M across Bangalore & Silicon Valley accelerators.",
    files: ["deck-outline.md", "financial-model-template.xlsx", "pitch-narrative-script.txt"],
    snippet: `Slide 1: Problem (1 Clear sentence with TAM metrics)
Slide 2: Solution (Tactile screenshot, zero marketing fluff)
Slide 3: Market Gravity (Why now? India UPI/Digital adoption)
Slide 4: Product Demo (30s Interactive canvas link)
Slide 5: Unit Economics (CAC, LTV, Gross Margins)
Slide 6: Team (Founders, past exits, technical pedigree)`,
  },
  {
    id: "bp-2",
    title: "India Founder-Friendly SAFE Note & ESOP Pool",
    category: "legal",
    categoryLabel: "Legal & Equity",
    tag: "Indian Companies Act 2013",
    author: "Bengaluru Tech Bar",
    forksCount: 312,
    description: "Standardized convertible note contract tailored for Indian private limited startups with 10% unallocated ESOP reserve and zero predatory liquidation terms.",
    files: ["safe-agreement-in.docx", "board-resolution-draft.pdf", "cap-table-simulator.xlsx"],
    snippet: `Valuation Cap: Negotiable ($3M - $8M Post-Money)
Discount Rate: 20% on next priced round
Information Rights: Quarterly financial summary to major investors
MFN Clause: Automatic parity with subsequent angel tickets`,
  },
  {
    id: "bp-3",
    title: "Production High-Throughput API Gateway (Go + Postgres)",
    category: "tech-stack",
    categoryLabel: "Engineering",
    tag: "100k RPS Tested",
    author: "ex-Razorpay Architects",
    forksCount: 651,
    description: "Complete, production-ready microservice boilerplate with JWT tenant isolation, Redis rate-limiting, and native Prometheus telemetry.",
    files: ["docker-compose.yml", "server.go", "migrations/001_init.sql", "k8s-manifest.yaml"],
    snippet: `// Zero-overhead rate limiter using Redis Token Bucket
func MiddlewareRateLimit(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        tenant := r.Header.Get("X-Tenant-ID")
        if !limiter.Allow(tenant) {
            http.Error(w, "Rate limit exceeded (429)", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}`,
  },
  {
    id: "bp-4",
    title: "B2B Enterprise SaaS Outbound Cold Playbook",
    category: "gtm",
    categoryLabel: "Go-To-Market",
    tag: "24% Response Rate",
    author: "SaaS Bangalore Guild",
    forksCount: 189,
    description: "Cold email cadence, LinkedIn connection sequences, and ICP qualification rubric used to sign first 10 enterprise pilot contracts.",
    files: ["email-sequence-3step.md", "objection-handling-bible.pdf", "pilot-agreement.docx"],
    snippet: `Touch 1: Pain observation ("Noticed your engineering team is scaling telemetry...")
Touch 2: Value drop (30-second loom or Balaga Canvas demo link)
Touch 3: Permission-based soft ask ("Open to a 10-minute teardown on Thursday?")`,
  },
];

export const ForkableBlueprintsModal: React.FC<ForkableBlueprintsModalProps> = ({
  isOpen,
  onClose,
  onForkToBuildSpace,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedBp, setSelectedBp] = useState<Blueprint>(mockBlueprints[0]);
  const [forkedId, setForkedId] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  const filtered = mockBlueprints.filter(
    (bp) => activeCategory === "all" || bp.category === activeCategory
  );

  const handleFork = (bp: Blueprint) => {
    setForkedId(bp.id);
    onForkToBuildSpace?.(bp.title);
    setTimeout(() => {
      setForkedId(null);
    }, 2500);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(selectedBp.snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Forkable Builder Blueprints</h2>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  F16 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Open-source pitch decks, legal SAFE notes, and technical boilerplates forkable in 1-click.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/20 flex gap-2 overflow-x-auto text-xs">
          {["all", "pitch-deck", "legal", "tech-stack", "gtm"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {cat === "all" ? "All Blueprints" : cat.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Split Grid Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Blueprint List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800/80 p-4 overflow-y-auto space-y-2.5 bg-slate-950/40">
            {filtered.map((bp) => (
              <div
                key={bp.id}
                onClick={() => setSelectedBp(bp)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-left ${
                  selectedBp.id === bp.id
                    ? "bg-emerald-950/30 border-emerald-500/40 shadow-sm"
                    : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-emerald-400">{bp.categoryLabel}</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1">
                    <GitFork className="w-3 h-3" /> {bp.forksCount} forks
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{bp.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {bp.description}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {bp.tag}
                  </span>
                  <span>by {bp.author}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Blueprint Details & Code Snippet (7 cols) */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-slate-900/20 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    {selectedBp.categoryLabel}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ID: {selectedBp.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{selectedBp.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedBp.description}
                </p>
              </div>

              {/* Files Included */}
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  Package Files Included ({selectedBp.files.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBp.files.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3 text-emerald-400" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code / Framework Snippet Preview */}
              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Framework Snippet Preview
                  </span>
                  <button
                    onClick={handleCopySnippet}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Snippet
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-48 scrollbar-thin">
                  {selectedBp.snippet}
                </pre>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero licensing restrictions (MIT / Creative Commons)</span>
              </div>

              <Button
                size="sm"
                onClick={() => handleFork(selectedBp)}
                className={`text-xs font-semibold px-4 ${
                  forkedId === selectedBp.id
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                }`}
              >
                {forkedId === selectedBp.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Forked to Build Space!
                  </>
                ) : (
                  <>
                    <GitFork className="w-3.5 h-3.5 mr-1.5" />
                    Fork into My Build Space
                  </>
                )}
              </Button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
