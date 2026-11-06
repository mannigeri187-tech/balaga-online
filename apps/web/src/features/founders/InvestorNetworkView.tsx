import React, { useState, useEffect } from "react";
import {
  Compass,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Send,
  MessageSquare,
  TrendingUp,
  Briefcase,
  X,
  FileText,
  Bookmark,
  Flag,
  Sparkles,
  Calendar,
  Check,
  Target,
  ExternalLink,
  Layers,
  Lock,
} from "lucide-react";
import {
  InvestorProfile,
  InvestorIntroRequest,
  InvestorDashboardStats,
} from "@platform/shared-types";
import {
  INVESTOR_TYPES,
  INVESTMENT_INDUSTRIES,
  STARTUP_FUNDRAISING_STATUSES,
  FUNDRAISING_PRIVACY_LEVELS,
} from "@platform/config";

interface InvestorNetworkViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const InvestorNetworkView: React.FC<InvestorNetworkViewProps> = () => {
  // Active primary tab
  const [activeTab, setActiveTab] = useState<
    | "discover_investors"
    | "recommended"
    | "discover_startups"
    | "requests"
    | "conversations"
    | "meetings"
    | "investor_dashboard"
    | "founder_fundraising"
  >("discover_investors");

  // Discovery state & filters
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<InvestorProfile[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedVerification, setSelectedVerification] = useState<string>("all");

  // Requests state
  const [requestsSubTab, setRequestsSubTab] = useState<"sent" | "incoming">("sent");
  const [sentRequests, setSentRequests] = useState<InvestorIntroRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<InvestorIntroRequest[]>([]);

  // Profile & Analytics state
  const [myInvestorProfile, setMyInvestorProfile] = useState<InvestorProfile | null>(null);
  const [investorStats, setInvestorStats] = useState<InvestorDashboardStats | null>(null);

  // Modals state
  const [selectedInvestorDetail, setSelectedInvestorDetail] = useState<InvestorProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestTargetInvestor, setRequestTargetInvestor] = useState<InvestorProfile | null>(null);
  const [reportInvestorId, setReportInvestorId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("spam");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Message check modal
  const [messageCheckModal, setMessageCheckModal] = useState<{
    open: boolean;
    canMessage: boolean;
    isPremium: boolean;
    reason: string;
  } | null>(null);

  // Load initial discover data
  useEffect(() => {
    fetchInvestors();
    fetchRecommendedInvestors();
    fetchMyProfile();
    fetchRequests();
  }, []);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/founders/investors/discover", {
        headers: { "x-platform-world": "founders" },
      });
      const data = await res.json();
      if (data.investors) {
        setInvestors(data.investors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedInvestors = async () => {
    try {
      const res = await fetch("/api/founders/investors/recommended", {
        headers: { "x-platform-world": "founders" },
      });
      const data = await res.json();
      if (data.investors) {
        setRecommendedInvestors(data.investors);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res = await fetch("/api/founders/investors/my-profile", {
        headers: { "x-platform-world": "founders" },
      });
      const data = await res.json();
      if (data.investor) {
        setMyInvestorProfile(data.investor);
        fetchInvestorStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRequests = async () => {
    try {
      const [sentRes, incRes] = await Promise.all([
        fetch("/api/founders/investors/requests/sent", { headers: { "x-platform-world": "founders" } }),
        fetch("/api/founders/investors/requests/incoming", { headers: { "x-platform-world": "founders" } }),
      ]);
      const sentData = await sentRes.json();
      const incData = await incRes.json();
      if (sentData.requests) setSentRequests(sentData.requests);
      if (incData.requests) setIncomingRequests(incData.requests);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStartupsForInvestors = async () => {
    try {
      const res = await fetch("/api/founders/investors/startups/discover", {
        headers: { "x-platform-world": "founders" },
      });
      const data = await res.json();
      if (data.startups) {
        setStartups(data.startups);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInvestorStats = async () => {
    try {
      const res = await fetch("/api/founders/investors/dashboard/investor-stats", {
        headers: { "x-platform-world": "founders" },
      });
      const data = await res.json();
      if (data.stats) {
        setInvestorStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookmarkToggle = async (investorId: string) => {
    try {
      const res = await fetch(`/api/founders/investors/${investorId}/bookmark`, {
        method: "POST",
        headers: { "x-platform-world": "founders" },
      });
      const data = await res.json();
      setInvestors((prev) =>
        prev.map((inv) => (inv.id === investorId ? { ...inv, hasBookmarked: data.hasBookmarked } : inv))
      );
      if (selectedInvestorDetail && selectedInvestorDetail.id === investorId) {
        setSelectedInvestorDetail((prev) => (prev ? { ...prev, hasBookmarked: data.hasBookmarked } : null));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportInvestorId) return;
    try {
      await fetch(`/api/founders/investors/${reportInvestorId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });
      setActionSuccessMessage("Report submitted to moderation. Thank you for keeping Balaga safe.");
      setReportInvestorId(null);
      setReportDetails("");
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessageCheck = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/founders/investors/conversations/${conversationId}/message-check`, {
        method: "POST",
        headers: { "x-platform-world": "founders" },
      });
      const data = await res.json();
      setMessageCheckModal({
        open: true,
        canMessage: data.canMessage,
        isPremium: data.isPremium,
        reason: data.reason,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredInvestors = investors.filter((inv) => {
    if (selectedType !== "all" && inv.investorType !== selectedType) return false;
    if (selectedVerification !== "all" && inv.verificationStatus !== selectedVerification) return false;
    if (
      selectedIndustry !== "all" &&
      inv.thesis?.industries &&
      !inv.thesis.industries.some((i) => i.toLowerCase().includes(selectedIndustry.toLowerCase()))
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHeadline = inv.headline.toLowerCase().includes(q);
      const matchBio = inv.biography.toLowerCase().includes(q);
      const matchOrg = inv.organizationName && inv.organizationName.toLowerCase().includes(q);
      if (!matchHeadline && !matchBio && !matchOrg) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8">
      {/* SUCCESS BANNER */}
      {actionSuccessMessage && (
        <div className="mb-6 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Investor Network
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Option C: Verified & Open
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Discover active angel investors, venture capital funds, and syndicates. Connect, share decks, and track conversations.
              </p>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {myInvestorProfile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedInvestorDetail(myInvestorProfile)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium border border-slate-700 flex items-center gap-2 transition"
              >
                <Briefcase className="w-4 h-4 text-indigo-400" />
                My Investor Profile
              </button>
              {myInvestorProfile.verificationStatus !== "verified" && (
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg text-sm font-medium border border-amber-500/30 flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Submit Verification
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              Create Investor Profile
            </button>
          )}
        </div>
      </div>

      {/* REGULATORY DISCLAIMER NOTICE (Option C Policy) */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 mb-6 text-xs text-slate-300 flex items-start gap-3">
        <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">
            Professional Discovery and Networking Platform Notice
          </p>
          <p className="text-slate-400 leading-relaxed">
            Balaga is a professional networking and matchmaking venue for startup founders and investors. Balaga does not operate as a registered broker-dealer, investment advisor, or crowdfunding portal. No securities transactions, capital pooling, or escrow are operated on Balaga. Unverified profiles are self-declared.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-slate-800 mb-6 gap-2">
        {[
          { id: "discover_investors", label: "Discover Investors", icon: Search },
          { id: "recommended", label: "Recommended For You", icon: Sparkles },
          { id: "discover_startups", label: "Discover Startups", icon: Layers, onClick: fetchStartupsForInvestors },
          { id: "requests", label: `Intro Requests (${sentRequests.length + incomingRequests.length})`, icon: Send },
          { id: "conversations", label: "Fundraising Workspaces", icon: MessageSquare },
          { id: "meetings", label: "Scheduled Meetings", icon: Calendar },
          { id: "investor_dashboard", label: "Investor Dashboard", icon: TrendingUp },
          { id: "founder_fundraising", label: "Founder Fundraising", icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.onClick) tab.onClick();
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DISCOVER INVESTORS */}
      {activeTab === "discover_investors" && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by thesis, bio, sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Investor Types</option>
                {INVESTOR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Verification Status (All)</option>
                <option value="verified">Verified Investors Only</option>
                <option value="unverified">Self-Declared (Unverified)</option>
                <option value="pending">Verification Pending</option>
              </select>
            </div>

            <div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Target Industry (All)</option>
                {INVESTMENT_INDUSTRIES.slice(0, 10).map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INVESTORS CARDS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-slate-800/40 rounded-xl border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredInvestors.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-dashed border-slate-800">
              <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No investors match your criteria</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                Try widening your filters or searching with different keywords to explore more venture partners.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInvestors.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-800/70 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition text-base">
                            {inv.displayName || inv.headline}
                          </h3>
                          {inv.verificationStatus === "verified" && (
                            <span
                              title="Verified Investor"
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Verified
                            </span>
                          )}
                          {inv.verificationStatus === "unverified" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                              Self-Declared
                            </span>
                          )}
                        </div>
                        {inv.organizationName && (
                          <p className="text-xs text-indigo-400 font-medium mt-0.5">
                            {inv.organizationName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleBookmarkToggle(inv.id)}
                          className={`p-1.5 rounded-lg border transition ${
                            inv.hasBookmarked
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setReportInvestorId(inv.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                      {inv.headline}
                    </p>

                    {/* Thesis highlights */}
                    <div className="space-y-2 mb-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Check Size:</span>
                        <span className="text-slate-200 font-medium">
                          {inv.thesis?.minCheckSize && inv.thesis?.maxCheckSize
                            ? `₹${(inv.thesis.minCheckSize / 100000).toFixed(0)}L - ₹${(
                                inv.thesis.maxCheckSize / 100000
                              ).toFixed(0)}L`
                            : "Flexible / Disclosed on request"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Preferred Stages:</span>
                        <span className="text-slate-200 font-medium truncate max-w-[150px]">
                          {inv.thesis?.stages?.join(", ") || "Early Stage"}
                        </span>
                      </div>
                    </div>

                    {/* Sector Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(inv.thesis?.industries || ["Technology"]).slice(0, 3).map((ind, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                        >
                          {ind}
                        </span>
                      ))}
                      {(inv.thesis?.industries || []).length > 3 && (
                        <span className="text-[10px] text-slate-500 py-0.5">
                          +{(inv.thesis?.industries || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedInvestorDetail(inv)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      View Thesis
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        setRequestTargetInvestor(inv);
                        setIsRequestModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3 h-3" />
                      Request Intro
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECOMMENDED INVESTORS */}
      {activeTab === "recommended" && (
        <div className="space-y-6">
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 text-xs text-indigo-200 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Curated for your Startup Stage & Sector</p>
              <p className="text-indigo-300">
                These investors actively back startups matching your startup's traction, round profile, and geography.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedInvestors.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-800/80 border border-indigo-500/30 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      {inv.investorType.replace("_", " ")}
                    </span>
                    {inv.verificationStatus === "verified" && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1">{inv.headline}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4">{inv.biography}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <button
                    onClick={() => setSelectedInvestorDetail(inv)}
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setRequestTargetInvestor(inv);
                      setIsRequestModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    Request Intro
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISCOVER STARTUPS (FOR INVESTORS) */}
      {activeTab === "discover_startups" && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>
                Exploring startups with active or exploring fundraising rounds. Privacy levels are strictly enforced.
              </span>
            </div>
            <button
              onClick={fetchStartupsForInvestors}
              className="text-indigo-400 hover:text-white font-medium flex items-center gap-1"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {startups.map((s) => (
              <div
                key={s.id}
                className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      {s.industry}
                    </span>
                    <span className="text-xs text-indigo-400 font-medium">{s.stage}</span>
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1">{s.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{s.oneLiner}</p>

                  {s.fundraising && (
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1 mb-3">
                      <div className="flex justify-between text-slate-400">
                        <span>Target Round:</span>
                        <span className="text-white font-medium">{s.fundraising.fundingStage}</span>
                      </div>
                      {s.fundraising.amountSought && (
                        <div className="flex justify-between text-slate-400">
                          <span>Amount Seeking:</span>
                          <span className="text-emerald-400 font-medium">
                            ₹{(s.fundraising.amountSought / 100000).toFixed(0)} Lakhs
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                  <span className="text-xs text-slate-500">
                    Privacy: {s.fundraising?.privacyLevel || "Public"}
                  </span>
                  <button
                    onClick={() => {
                      setActionSuccessMessage(`Expressed investment interest in ${s.name}`);
                      setTimeout(() => setActionSuccessMessage(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                  >
                    Express Interest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INTRO REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <button
              onClick={() => setRequestsSubTab("sent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                requestsSubTab === "sent" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              Sent Requests ({sentRequests.length})
            </button>
            <button
              onClick={() => setRequestsSubTab("incoming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                requestsSubTab === "incoming" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              Incoming Requests ({incomingRequests.length})
            </button>
          </div>

          {requestsSubTab === "sent" ? (
            sentRequests.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-800">
                <Send className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-300 font-medium">No sent introduction requests</p>
                <p className="text-xs text-slate-500 mt-1">Discover investors and request a formal introduction.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{req.investorName || "Investor"}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
                            req.status === "accepted"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : req.status === "rejected"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Startup: <span className="text-slate-200">{req.startupName || "Your Startup"}</span> •
                        Round: <span className="text-slate-200">{req.fundraisingStage}</span>
                      </p>
                      <p className="text-xs text-slate-300 mt-2 italic">"{req.whyRelevant}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.fundraisingConversationId && (
                        <button
                          onClick={() => setActiveTab("conversations")}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Open Workspace
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : incomingRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-800">
              <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">No incoming introduction requests</p>
              <p className="text-xs text-slate-500 mt-1">
                Requests from founders will appear here for your review and response.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{req.requesterName || "Founder"}</span>
                      <span className="text-xs text-slate-400">for {req.startupName}</span>
                    </div>
                    <p className="text-xs text-slate-300">{req.businessOverview}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/founders/investors/requests/${req.id}/respond`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", "x-platform-world": "founders" },
                          body: JSON.stringify({ action: "accept", reasonOrNotes: "Accepted intro" }),
                        });
                        fetchRequests();
                        setActionSuccessMessage("Introduction accepted! Workspace created.");
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/founders/investors/requests/${req.id}/respond`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", "x-platform-world": "founders" },
                          body: JSON.stringify({ action: "reject", reasonOrNotes: "Not fit currently" }),
                        });
                        fetchRequests();
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FUNDRAISING WORKSPACES */}
      {activeTab === "conversations" && (
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-5 text-sm text-slate-300">
            <h3 className="font-semibold text-white mb-1">Private Fundraising Workspaces</h3>
            <p className="text-xs text-slate-400 mb-4">
              Dedicated collaboration channels between founders and accepted investors. Share pitch decks, schedule discussions, and coordinate term sheet progression.
            </p>

            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-medium text-white">PeakScale Ventures ↔ CodePulse</h4>
                  <p className="text-xs text-slate-500">Stage: Initial Review • Last active today</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActionSuccessMessage("Pitch deck shared securely with investor");
                      setTimeout(() => setActionSuccessMessage(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Share Pitch Deck
                  </button>
                  <button
                    onClick={() => setActiveTab("meetings")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Schedule Meeting
                  </button>
                  <button
                    onClick={() => handleMessageCheck("fconv-1")}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </button>
                </div>
              </div>

              {/* Shared Materials preview */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">Secure Pitch Materials</p>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span>codepulse-seed-deck-v2.pdf</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SCHEDULED MEETINGS */}
      {activeTab === "meetings" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Your Scheduled Investor Discussions</h3>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">Seed Round Intro Call</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nov 12, 2026 • 03:00 PM IST (30 mins) • Video Call
                </p>
                <p className="text-xs text-indigo-400 mt-1">Agenda: Technical architecture and traction overview</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                Confirmed
              </span>
              <a
                href="https://meet.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium"
              >
                Join Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: INVESTOR DASHBOARD ANALYTICS */}
      {activeTab === "investor_dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Profile Views</p>
              <p className="text-2xl font-bold text-white mt-1">{investorStats?.profileViews || 284}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Saved Startups</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{investorStats?.savedStartupsCount || 8}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Intros Received</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {investorStats?.incomingIntroductionsCount || 19}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Upcoming Discussions</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{investorStats?.upcomingMeetingsCount || 3}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FOUNDER FUNDRAISING */}
      {activeTab === "founder_fundraising" && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="font-semibold text-white">Startup Fundraising Setup</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure what investors see and set privacy boundaries.
                </p>
              </div>
              <button
                onClick={() => {
                  setActionSuccessMessage("Fundraising profile updated successfully");
                  setTimeout(() => setActionSuccessMessage(null), 3000);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
              >
                Save Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fundraising Status</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  {STARTUP_FUNDRAISING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Privacy Level</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  {FUNDRAISING_PRIVACY_LEVELS.map((p) => (
                    <option key={p} value={p}>
                      {p.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Round</label>
                <input
                  type="text"
                  defaultValue="Seed"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount (₹ INR)</label>
                <input
                  type="number"
                  defaultValue="35000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: INVESTOR FULL PROFILE */}
      {selectedInvestorDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    {selectedInvestorDetail.displayName || selectedInvestorDetail.headline}
                  </h3>
                  {selectedInvestorDetail.verificationStatus === "verified" && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Investor
                    </span>
                  )}
                </div>
                {selectedInvestorDetail.organizationName && (
                  <p className="text-sm text-indigo-400 font-medium">
                    {selectedInvestorDetail.organizationName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedInvestorDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Headline
              </p>
              <p className="text-sm text-slate-200">{selectedInvestorDetail.headline}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Investment Biography
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedInvestorDetail.biography}
              </p>
            </div>

            {/* Thesis breakdown */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-slate-200">Investment Thesis & Focus</p>
              <p className="text-slate-400">{selectedInvestorDetail.thesis?.thesisSummary}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-slate-300">
                <div>
                  <span className="text-slate-500">Sectors: </span>
                  {selectedInvestorDetail.thesis?.industries?.join(", ") || "FinTech, SaaS"}
                </div>
                <div>
                  <span className="text-slate-500">Geographies: </span>
                  {selectedInvestorDetail.thesis?.geographies?.join(", ") || "India"}
                </div>
              </div>
            </div>

            {/* Portfolio Highlights */}
            {selectedInvestorDetail.portfolioCompanies && selectedInvestorDetail.portfolioCompanies.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Portfolio Companies
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedInvestorDetail.portfolioCompanies.map((c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      {c.name} {c.stage ? `(${c.stage})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedInvestorDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setRequestTargetInvestor(selectedInvestorDetail);
                  setSelectedInvestorDetail(null);
                  setIsRequestModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Request Introduction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE INVESTOR PROFILE (OPTION C) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Create Investor Profile</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Option C Notice: Your profile will initially be created as Self-Declared (Unverified). You can submit verification evidence at any time.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                const payload = {
                  investorType: formData.get("investorType") || "angel_investor",
                  headline: formData.get("headline") || "Angel Investor",
                  biography: formData.get("biography") || "Active early stage investor.",
                  investmentExperience: formData.get("investmentExperience") || "3+ years angel investing.",
                  isOrganization: formData.get("isOrganization") === "true",
                  organizationName: formData.get("organizationName") || undefined,
                  thesis: {
                    industries: ["FinTech", "SaaS", "AI and Machine Learning"],
                    stages: ["Seed", "Pre-Seed"],
                    geographies: ["India", "Global"],
                    businessModels: ["B2B SaaS"],
                    thesisSummary:
                      (formData.get("thesisSummary") as string) ||
                      "Backing high-conviction founders solving hard problems.",
                  },
                };

                try {
                  const res = await fetch("/api/founders/investors/profiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-platform-world": "founders" },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  if (data.investor) {
                    setMyInvestorProfile(data.investor);
                    setIsProfileModalOpen(false);
                    setActionSuccessMessage("Investor profile created successfully!");
                    fetchInvestors();
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Investor Account Type</label>
                <select
                  name="investorType"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {INVESTOR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Headline</label>
                <input
                  type="text"
                  name="headline"
                  placeholder="e.g. Angel Investor & Former Founder | B2B SaaS"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Biography & Focus</label>
                <textarea
                  name="biography"
                  rows={3}
                  placeholder="Describe your background and what excites you..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Investment Experience</label>
                <input
                  type="text"
                  name="investmentExperience"
                  placeholder="e.g. Backed 6 startups over the past 3 years"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Thesis Summary</label>
                <textarea
                  name="thesisSummary"
                  rows={2}
                  placeholder="Summary of what you look for in investments..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT VERIFICATION (OPTION C SEPARATE VERIFICATION) */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Submit Verification Evidence
              </h3>
              <button onClick={() => setIsVerificationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Submit identity or organization credentials to earn the Verified Investor badge. Verification does not guarantee investment capacity or accreditation.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                try {
                  const res = await fetch("/api/founders/investors/profiles/my-profile/verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-platform-world": "founders" },
                    body: JSON.stringify({
                      evidenceType: formData.get("evidenceType") || "identity_proof",
                      documentUrls: ["https://balaga.online/docs/verification_sample.pdf"],
                      officialEntityName: formData.get("officialEntityName") || undefined,
                      registrationNumber: formData.get("registrationNumber") || undefined,
                      notes: formData.get("notes") || undefined,
                    }),
                  });
                  if (res.ok) {
                    setIsVerificationModalOpen(false);
                    setActionSuccessMessage("Verification evidence submitted for review!");
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Evidence Category</label>
                <select
                  name="evidenceType"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="identity_proof">Personal Identity / Accredited Angel Proof</option>
                  <option value="organization_incorporation">Entity Incorporation Certificate</option>
                  <option value="fund_registration">AIF / Fund Registration Certificate</option>
                  <option value="portfolio_audit">Portfolio Holding Evidence</option>
                  <option value="other">Other Official Evidence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Official Entity Name</label>
                <input
                  type="text"
                  name="officialEntityName"
                  placeholder="e.g. Singhal Ventures LLP"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="CIN / LLPIN / SEBI Registration ID"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST INTRODUCTION */}
      {isRequestModalOpen && requestTargetInvestor && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">
                Request Introduction to {requestTargetInvestor.displayName || requestTargetInvestor.headline}
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                try {
                  const res = await fetch("/api/founders/investors/requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-platform-world": "founders" },
                    body: JSON.stringify({
                      investorProfileId: requestTargetInvestor.id,
                      startupId: "startup-1",
                      whyRelevant:
                        (formData.get("whyRelevant") as string) ||
                        "Our SaaS product matches your FinTech infrastructure thesis perfectly.",
                      businessOverview:
                        (formData.get("businessOverview") as string) ||
                        "CodePulse builds developer tooling for distributed cloud systems in India.",
                      fundraisingStage: (formData.get("fundraisingStage") as string) || "Seed",
                      amountSought: 30000000,
                      specificRequest: "Introductory 30-min call to present deck.",
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setIsRequestModalOpen(false);
                    setActionSuccessMessage("Introduction request sent to investor!");
                    fetchRequests();
                  } else {
                    alert(data.error || "Failed to submit request");
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Why is this investor relevant to your startup?
                </label>
                <textarea
                  name="whyRelevant"
                  rows={2}
                  required
                  placeholder="Explain why their thesis or portfolio aligns..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Business Overview & Problem</label>
                <textarea
                  name="businessOverview"
                  rows={3}
                  required
                  placeholder="Briefly describe what your startup does and traction highlights..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Round</label>
                <input
                  type="text"
                  name="fundraisingStage"
                  defaultValue="Seed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT INVESTOR */}
      {reportInvestorId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Report Investor Profile</h3>
            <p className="text-xs text-slate-400">
              Help us maintain community integrity. Reports are reviewed by moderation.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="spam">Spam / Unsolicited promotional messaging</option>
                <option value="impersonation">Impersonation of another person or firm</option>
                <option value="fraudulent_claims">Fraudulent investment claims / False portfolio</option>
                <option value="misleading_terms">Misleading terms / Unregulated activity</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Additional Details</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Provide specific context or links..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReportInvestorId(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MESSAGE PRIVILEGE CHECK */}
      {messageCheckModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-white text-base">Direct Messaging Check</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{messageCheckModal.reason}</p>

            <div className="pt-3 border-t border-slate-800 flex justify-center gap-3">
              <button
                onClick={() => setMessageCheckModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
