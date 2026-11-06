import React, { useState } from "react";
import {
  Globe,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Server,
  Zap,
  Lock,
  X,
  Search
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface SubdomainRecord {
  subdomain: string;
  targetCompany: string;
  stage: string;
  sslActive: boolean;
  dnsStatus: "propagated" | "pending";
  totalRequests: string;
  cacheHit: string;
  createdAt: string;
}

interface CustomSubdomainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialClaimedSubdomains: SubdomainRecord[] = [
  {
    subdomain: "hypertrace",
    targetCompany: "Hypertrace AI",
    stage: "Seed • $1.2M",
    sslActive: true,
    dnsStatus: "propagated",
    totalRequests: "482.4k",
    cacheHit: "98.4%",
    createdAt: "2 days ago"
  },
  {
    subdomain: "kannada-llm",
    targetCompany: "Kannada Indic Core",
    stage: "Pre-Seed • Grants",
    sslActive: true,
    dnsStatus: "propagated",
    totalRequests: "1.2M",
    cacheHit: "99.1%",
    createdAt: "5 days ago"
  },
  {
    subdomain: "bengalurudevs",
    targetCompany: "Namma Dev Guild",
    stage: "Community • Bootstrapped",
    sslActive: true,
    dnsStatus: "propagated",
    totalRequests: "94.1k",
    cacheHit: "96.7%",
    createdAt: "1 week ago"
  }
];

export const CustomSubdomainModal: React.FC<CustomSubdomainModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [claimedList, setClaimedList] = useState<SubdomainRecord[]>(initialClaimedSubdomains);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [newSubdomainSuccess, setNewSubdomainSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const sanitizedQuery = searchQuery.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const isAvailable =
    sanitizedQuery.length >= 3 &&
    !claimedList.some((item) => item.subdomain === sanitizedQuery);

  const handleClaim = () => {
    if (!isAvailable || !sanitizedQuery) return;
    setIsClaiming(true);
    setTimeout(() => {
      const newRecord: SubdomainRecord = {
        subdomain: sanitizedQuery,
        targetCompany: `${sanitizedQuery.toUpperCase()} Technologies`,
        stage: "Founders Preview",
        sslActive: true,
        dnsStatus: "propagated",
        totalRequests: "1",
        cacheHit: "100%",
        createdAt: "Just now"
      };
      setClaimedList([newRecord, ...claimedList]);
      setNewSubdomainSuccess(sanitizedQuery);
      setIsClaiming(false);
      setSearchQuery("");
    }, 600);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Custom Startup Subdomains
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  F20 Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Auto SSL/TLS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant high-performance branded domains (*.balaga.online) with zero-config edge routing
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Claim Subdomain Bar */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/80 shadow-lg">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setNewSubdomainSuccess(null);
                  }}
                  placeholder="e.g. namma-pay, vector-db, deep-code"
                  className="w-full pl-10 pr-32 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-mono"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 pointer-events-none font-mono">
                  .balaga.online
                </span>
              </div>
              <Button
                variant="primary"
                onClick={handleClaim}
                disabled={!isAvailable || isClaiming}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 shadow-md flex items-center justify-center gap-2"
              >
                {isClaiming ? (
                  <>Provisioning...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Claim Subdomain
                  </>
                )}
              </Button>
            </div>

            {/* Availability feedback */}
            {sanitizedQuery.length > 0 && (
              <div className="mt-3 flex items-center justify-between text-xs">
                {sanitizedQuery.length < 3 ? (
                  <span className="text-amber-400">Must be at least 3 characters.</span>
                ) : isAvailable ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-mono">{sanitizedQuery}.balaga.online</span> is available for instant setup!
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Subdomain already claimed by another founder team.
                  </span>
                )}
                <span className="text-slate-400">CNAME target: <code className="text-amber-300 font-mono">cname.balaga.online</code></span>
              </div>
            )}

            {newSubdomainSuccess && (
              <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Successfully claimed <strong>{newSubdomainSuccess}.balaga.online</strong> with active SSL!
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(`https://${newSubdomainSuccess}.balaga.online`)}
                  className="px-2.5 py-1 bg-emerald-800/60 hover:bg-emerald-700 text-white rounded font-mono text-[11px] flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  {copiedUrl === `https://${newSubdomainSuccess}.balaga.online` ? "Copied" : "Copy Link"}
                </button>
              </div>
            )}
          </div>

          {/* Infrastructure Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Edge Anycast Routing</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Traffic routed through Mumbai, Chennai & Singapore edge nodes (&lt;12ms latency across India).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Managed Wildcard SSL</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Automatic zero-touch Let's Encrypt TLS renewal every 60 days with HSTS enforcement.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Direct Build Space Bind</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Links seamlessly to Balaga Build Spaces, GitHub repo webhooks, and pitch room decks.
                </p>
              </div>
            </div>
          </div>

          {/* Active Claimed Subdomains List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" /> Active Ecosystem Subdomains
              </h3>
              <span className="text-xs text-slate-400">
                Total Live: {claimedList.length}
              </span>
            </div>

            <div className="space-y-3">
              {claimedList.map((rec) => {
                const fullUrl = `https://${rec.subdomain}.balaga.online`;
                return (
                  <div
                    key={rec.subdomain}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-semibold text-amber-300 text-sm">
                            {rec.subdomain}.balaga.online
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700/60 text-slate-300 font-medium">
                            {rec.stage}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> SSL Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {rec.targetCompany} • Claimed {rec.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                      <div className="text-left sm:text-right mr-2">
                        <div className="text-xs font-semibold text-slate-200">
                          {rec.totalRequests} reqs
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rec.cacheHit} cache hit
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(fullUrl)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedUrl === fullUrl ? "Copied" : "Copy"}
                      </button>

                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Protected under Balaga Zero-Custody Edge Proxy Architecture</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
};
