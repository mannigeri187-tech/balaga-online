import React, { useState, useEffect } from "react";
import {
  Rocket,
  Search,
  Plus,
  Users,
  Briefcase,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Building2,
  MapPin,
  DollarSign,
  AlertCircle,
  ChevronRight,
  X,
  UserPlus,
  ArrowLeftRight,
  BarChart3,
  Handshake,
  Lock,
} from "lucide-react";

interface StartupHubViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const StartupHubView: React.FC<StartupHubViewProps> = ({ onNavigateTab }) => {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<"discover" | "my_startups">("discover");
  const [profileTab, setProfileTab] = useState<
    | "overview"
    | "about"
    | "products"
    | "updates"
    | "team"
    | "jobs"
    | "opportunities"
    | "collaborations"
    | "contact"
  >("overview");

  // Data states
  const [startups, setStartups] = useState<any[]>([]);
  const [myStartups, setMyStartups] = useState<{
    ownedStartups: any[];
    joinedStartups: any[];
    pendingInvitations: any[];
    pendingTransfers: any[];
  }>({
    ownedStartups: [],
    joinedStartups: [],
    pendingInvitations: [],
    pendingTransfers: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [filterSeekingTalent, setFilterSeekingTalent] = useState(false);
  const [filterSeekingCollabs, setFilterSeekingCollabs] = useState(false);
  const [sortBy, setSortBy] = useState("trending");

  // Modals
  const [selectedStartup, setSelectedStartup] = useState<any | null>(null);
  const [startupProfileDetails, setStartupProfileDetails] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [teamModalStartup, setTeamModalStartup] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [analyticsStartup, setAnalyticsStartup] = useState<any | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [investModalStartup, setInvestModalStartup] = useState<any | null>(null);
  const [updateModalStartup, setUpdateModalStartup] = useState<any | null>(null);
  const [transferModalStartup, setTransferModalStartup] = useState<any | null>(null);

  // Form states
  const [newStartupForm, setNewStartupForm] = useState({
    name: "",
    slug: "",
    oneLiner: "",
    industry: "B2B SaaS / Infra",
    stage: "early_traction",
    broadLocation: "Bengaluru, Karnataka",
    websiteUrl: "",
    problem: "",
    solution: "",
    technologies: "Go, PostgreSQL, React, AWS",
    seekingTalent: true,
    seekingCollabs: true,
  });

  const [inviteForm, setInviteForm] = useState({
    inviteeProfileId: "",
    role: "editor",
    title: "",
  });

  const [transferForm, setTransferForm] = useState({
    targetOwnerProfileId: "",
    previousOwnerResultingRole: "admin",
    note: "",
  });

  const [investForm, setInvestForm] = useState({
    inquiryType: "angel",
    ticketSizeRange: "₹25L - ₹50L",
    message: "",
  });

  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    updateType: "milestone",
  });

  const showNotification = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // 1. Fetch Discover Startups
  const fetchStartups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedIndustry !== "all") params.append("industry", selectedIndustry);
      if (selectedStage !== "all") params.append("stage", selectedStage);
      if (filterSeekingTalent) params.append("seekingTalent", "true");
      if (filterSeekingCollabs) params.append("seekingCollabs", "true");
      params.append("sort", sortBy);

      const res = await fetch(`/api/founders/startups?${params.toString()}`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setStartups(data.startups || []);
      }
    } catch (err) {
      console.error("Error fetching startups:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch My Startups
  const fetchMyStartups = async () => {
    try {
      const res = await fetch("/api/founders/startups/my-startups", {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setMyStartups(data);
      }
    } catch (err) {
      console.error("Error fetching my startups:", err);
    }
  };

  useEffect(() => {
    fetchStartups();
    fetchMyStartups();
  }, [searchQuery, selectedIndustry, selectedStage, filterSeekingTalent, filterSeekingCollabs, sortBy]);

  // 3. Fetch Full Startup Profile (9 Tabs)
  const openStartupProfile = async (startup: any) => {
    setSelectedStartup(startup);
    setProfileTab("overview");
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/founders/startups/${startup.slug || startup.id}`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setStartupProfileDetails(data);
      }
    } catch (err) {
      console.error("Error loading startup profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 4. Follow / Unfollow Startup
  const handleToggleFollow = async (startupId: string) => {
    try {
      const res = await fetch(`/api/founders/startups/${startupId}/follow`, {
        method: "POST",
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        showNotification("success", data.message);
        // Refresh local items
        setStartups((prev) =>
          prev.map((s) =>
            s.id === startupId
              ? { ...s, isFollowing: data.following, followersCount: data.followersCount }
              : s
          )
        );
        if (selectedStartup && selectedStartup.id === startupId) {
          setSelectedStartup((prev: any) => ({
            ...prev,
            isFollowing: data.following,
            followersCount: data.followersCount,
          }));
        }
      }
    } catch (err) {
      showNotification("error", "Failed to update follow status");
    }
  };

  // 5. Create Startup Wizard Submit
  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newStartupForm.name,
        slug:
          newStartupForm.slug.trim() ||
          newStartupForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        oneLiner: newStartupForm.oneLiner,
        industry: newStartupForm.industry,
        stage: newStartupForm.stage,
        broadLocation: newStartupForm.broadLocation,
        websiteUrl: newStartupForm.websiteUrl || undefined,
        problem: newStartupForm.problem || undefined,
        solution: newStartupForm.solution || undefined,
        technologies: newStartupForm.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        seekingTalent: newStartupForm.seekingTalent,
        seekingCollabs: newStartupForm.seekingCollabs,
      };

      const res = await fetch("/api/founders/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("success", "Startup created successfully! You are the official Owner.");
        setShowCreateModal(false);
        fetchStartups();
        fetchMyStartups();
      } else {
        showNotification("error", data.error || "Failed to create startup");
      }
    } catch (err) {
      showNotification("error", "Error creating startup");
    }
  };

  // 6. Open Team Management
  const openTeamManagement = async (startup: any) => {
    setTeamModalStartup(startup);
    try {
      const res = await fetch(`/api/founders/startups/${startup.id}/team`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || data.team || []);
      }
    } catch (err) {
      console.error("Error loading team members:", err);
    }
  };

  // 7. Invite Team Member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamModalStartup) return;
    try {
      const res = await fetch(`/api/founders/startups/${teamModalStartup.id}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", "Invitation sent successfully!");
        setInviteForm({ inviteeProfileId: "", role: "editor", title: "" });
        openTeamManagement(teamModalStartup);
      } else {
        showNotification("error", data.error || "Failed to send invitation");
      }
    } catch (err) {
      showNotification("error", "Error sending invitation");
    }
  };

  // 8. Respond to Team Invitation
  const handleRespondInvitation = async (invId: string, action: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/founders/startups/invitations/${invId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", data.message || `Invitation ${action}ed`);
        fetchMyStartups();
      } else {
        showNotification("error", data.error || "Action failed");
      }
    } catch (err) {
      showNotification("error", "Error processing invitation");
    }
  };

  // 9. Option A: Initiate Ownership Transfer
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalStartup) return;
    try {
      const res = await fetch(`/api/founders/startups/${transferModalStartup.id}/ownership-transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify(transferForm),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(
          "success",
          "Ownership transfer invitation sent! The recipient must explicitly accept for transfer to finalize."
        );
        setTransferModalStartup(null);
        fetchMyStartups();
      } else {
        showNotification("error", data.error || "Failed to initiate transfer");
      }
    } catch (err) {
      showNotification("error", "Error initiating ownership transfer");
    }
  };

  // 10. Option A: Respond to Ownership Transfer Request
  const handleRespondTransfer = async (requestId: string, action: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/founders/startups/ownership-transfer/${requestId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", data.message || `Transfer ${action}ed`);
        fetchMyStartups();
        fetchStartups();
      } else {
        showNotification("error", data.error || "Failed to respond to transfer");
      }
    } catch (err) {
      showNotification("error", "Error responding to transfer request");
    }
  };

  // 11. View Analytics
  const openAnalytics = async (startup: any) => {
    setAnalyticsStartup(startup);
    try {
      const res = await fetch(`/api/founders/startups/${startup.id}/analytics`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data.analytics);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  // 12. Submit Investor Inquiry
  const handleSendInvestInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investModalStartup) return;
    try {
      const res = await fetch(`/api/founders/startups/${investModalStartup.id}/invest-inquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify(investForm),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", "Investor expression of interest delivered to startup founders!");
        setInvestModalStartup(null);
        setInvestForm({ inquiryType: "angel", ticketSizeRange: "₹25L - ₹50L", message: "" });
      } else {
        showNotification("error", data.error || "Failed to send inquiry");
      }
    } catch (err) {
      showNotification("error", "Error sending investor inquiry");
    }
  };

  // 13. Publish Official Update
  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModalStartup) return;
    try {
      const res = await fetch(`/api/founders/startups/${updateModalStartup.id}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify(updateForm),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", "Official startup update published and broadcast to Founder Feed!");
        setUpdateModalStartup(null);
        setUpdateForm({ title: "", content: "", updateType: "milestone" });
        if (selectedStartup) openStartupProfile(selectedStartup);
      } else {
        showNotification("error", data.error || "Failed to publish update");
      }
    } catch (err) {
      showNotification("error", "Error publishing update");
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case "idea":
      case "research":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "validation":
      case "mvp":
        return "bg-amber-950/60 text-amber-300 border-amber-800/60";
      case "early_traction":
        return "bg-blue-950/60 text-blue-300 border-blue-800/60";
      case "growth":
      case "scaling":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800/60";
      case "profitable":
        return "bg-purple-950/60 text-purple-300 border-purple-800/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-600 text-emerald-200"
              : "bg-rose-950/90 border-rose-600 text-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
            <Rocket className="w-3.5 h-3.5" />
            India Startup Ecosystem Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Startup Hub
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Discover India’s fastest-growing technology startups, follow official milestones, connect for high-impact B2B partnerships, and manage your ventures with auditable ownership control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Startup
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("discover")}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "discover"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="w-4 h-4" />
            Discover Startups
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {startups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("my_startups")}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "my_startups"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            My Startups & Ventures
            {(myStartups.ownedStartups.length > 0 ||
              myStartups.joinedStartups.length > 0 ||
              myStartups.pendingTransfers.length > 0) && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                {myStartups.ownedStartups.length + myStartups.joinedStartups.length}
              </span>
            )}
            {myStartups.pendingTransfers.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DISCOVER STARTUPS                                  */}
      {/* ======================================================== */}
      {activeTab === "discover" && (
        <div className="space-y-6">
          {/* Multi-Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search startups by name, problem, tech stack, or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Industry Dropdown */}
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Industries</option>
                <option value="fintech">FinTech / Banking</option>
                <option value="saas">B2B SaaS / Infra</option>
                <option value="health">HealthTech / Bio</option>
                <option value="drone">Drone / Robotics</option>
                <option value="ai">AI / Machine Learning</option>
                <option value="commerce">E-Commerce / D2C</option>
              </select>

              {/* Stage Dropdown */}
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Stages</option>
                <option value="idea">Idea Stage</option>
                <option value="mvp">MVP / Prototype</option>
                <option value="early_traction">Early Traction</option>
                <option value="growth">Growth & Expansion</option>
                <option value="scaling">Scaling</option>
                <option value="profitable">Profitable / Bootstrapped</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="trending">🔥 Trending</option>
                <option value="followers">👥 Most Followed</option>
                <option value="recent">⚡ Recently Founded</option>
              </select>
            </div>

            {/* Quick Toggle Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800/60">
              <span className="text-xs text-slate-500 font-medium">Quick filters:</span>
              <button
                type="button"
                onClick={() => setFilterSeekingTalent(!filterSeekingTalent)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterSeekingTalent
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Actively Hiring Talent
              </button>

              <button
                type="button"
                onClick={() => setFilterSeekingCollabs(!filterSeekingCollabs)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterSeekingCollabs
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                Open to B2B Partnerships
              </button>
            </div>
          </div>

          {/* Startups Directory Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
              <Rocket className="w-10 h-10 animate-bounce text-indigo-400" />
              <p className="text-sm">Loading verified startup directory...</p>
            </div>
          ) : startups.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8 space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-300">No startups match your search</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Try widening your filters or clearing search criteria to discover more Indian technology ventures.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedIndustry("all");
                  setSelectedStage("all");
                  setFilterSeekingTalent(false);
                  setFilterSeekingCollabs(false);
                }}
                className="mt-2 text-indigo-400 text-sm font-medium hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {startups.map((startup) => (
                <div
                  key={startup.id}
                  className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-950/20 group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Logo, Badges, Follow */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xl font-bold text-indigo-400 group-hover:border-indigo-500/50 transition-colors shrink-0">
                          {startup.logoUrl ? (
                            <img
                              src={startup.logoUrl}
                              alt={startup.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            startup.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                              {startup.name}
                            </h3>
                            {startup.verificationLevel === "verified_business" && (
                              <span title="Verified Business">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {startup.broadLocation}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleFollow(startup.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                          startup.isFollowing
                            ? "bg-indigo-950/80 border-indigo-700 text-indigo-300 hover:bg-rose-950/60 hover:border-rose-700 hover:text-rose-300"
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                        }`}
                      >
                        {startup.isFollowing ? "Following" : "+ Follow"}
                      </button>
                    </div>

                    {/* Stage & Industry Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getStageBadgeColor(
                          startup.stage
                        )}`}
                      >
                        {startup.stage.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                        {startup.industry}
                      </span>
                    </div>

                    {/* One Liner */}
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {startup.oneLiner}
                    </p>
                  </div>

                  {/* Bottom Stats & Action */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {startup.followersCount || 0} followers
                      </span>

                      {startup.openJobsCount > 0 && (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {startup.openJobsCount} open {startup.openJobsCount === 1 ? "role" : "roles"}
                        </span>
                      )}

                      {startup.productsCount > 0 && (
                        <span className="text-indigo-400 font-medium flex items-center gap-1">
                          <Rocket className="w-3.5 h-3.5" />
                          {startup.productsCount} {startup.productsCount === 1 ? "product" : "products"}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openStartupProfile(startup)}
                      className="w-full py-2 rounded-xl bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      View Public Profile
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MY STARTUPS & VENTURES                            */}
      {/* ======================================================== */}
      {activeTab === "my_startups" && (
        <div className="space-y-8">
          {/* Option A Pending Ownership Transfer Alerts */}
          {myStartups.pendingTransfers && myStartups.pendingTransfers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" />
                Action Required: Pending Ownership Transfer Invitations (Option A)
              </h3>
              {myStartups.pendingTransfers.map((req: any) => (
                <div
                  key={req.id}
                  className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-600/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20"
                >
                  <div className="space-y-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider">
                      Ownership Transfer Proposal
                    </span>
                    <h4 className="text-base font-semibold text-white">
                      {req.currentOwner?.displayName || "The current owner"} wants to transfer full startup ownership of{" "}
                      <span className="text-amber-300">{req.startup?.name}</span> to you.
                    </h4>
                    {req.note && (
                      <p className="text-xs text-slate-300 italic">
                        &quot;{req.note}&quot;
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      Under Balaga Founders Option A, ownership transitions only upon your explicit acceptance. The former owner will become an authorized {req.previousOwnerResultingRole}.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleRespondTransfer(req.id, "accept")}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      Accept Ownership
                    </button>
                    <button
                      onClick={() => handleRespondTransfer(req.id, "decline")}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Team Invitations */}
          {myStartups.pendingInvitations && myStartups.pendingInvitations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 uppercase tracking-wide">
                <UserPlus className="w-4 h-4" />
                Pending Startup Team Invitations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStartups.pendingInvitations.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {inv.startup?.name || "Startup Team"}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Invited as <span className="text-indigo-300 font-medium">{inv.title || inv.role}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondInvitation(inv.id, "accept")}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondInvitation(inv.id, "decline")}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. Owned Startups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Startups You Own
                </h2>
                <p className="text-xs text-slate-400">
                  Full administrative and operational authority. Exactly one active Owner per venture.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold cursor-pointer border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Startup
              </button>
            </div>

            {myStartups.ownedStartups.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-2">
                <Rocket className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">You do not currently own any startups.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Register your first startup venture
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStartups.ownedStartups.map((st: any) => (
                  <div
                    key={st.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{st.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            OWNER
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{st.oneLiner}</p>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {st.membersCount || 1} team members
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => openStartupProfile(st)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                      >
                        Public Profile
                      </button>

                      <button
                        onClick={() => openTeamManagement(st)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium cursor-pointer flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Team & Permissions
                      </button>

                      <button
                        onClick={() => {
                          setTransferModalStartup(st);
                          setTransferForm({
                            targetOwnerProfileId: "",
                            previousOwnerResultingRole: "admin",
                            note: "",
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        Transfer Ownership
                      </button>

                      <button
                        onClick={() => openAnalytics(st)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer flex items-center gap-1"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Analytics
                      </button>

                      <button
                        onClick={() => setUpdateModalStartup(st)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Publish Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Joined Startups */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Startups You&apos;ve Joined
              </h2>
              <p className="text-xs text-slate-400">
                Ventures where you are a team member (Admin, Editor, Hiring Manager, or Viewer).
              </p>
            </div>

            {myStartups.joinedStartups.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-1">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">You haven&apos;t joined any external startup teams yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStartups.joinedStartups.map((st: any) => (
                  <div
                    key={st.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{st.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold border border-indigo-500/30 uppercase">
                            {st.myRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{st.oneLiner}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => openStartupProfile(st)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                      >
                        View Profile
                      </button>

                      {st.canPublishUpdates && (
                        <button
                          onClick={() => setUpdateModalStartup(st)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Publish Update
                        </button>
                      )}

                      {st.isAdmin && (
                        <button
                          onClick={() => openAnalytics(st)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer flex items-center gap-1"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          Analytics
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PUBLIC STARTUP PROFILE (9 TABS INTEGRATED)      */}
      {/* ======================================================== */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300 shrink-0">
                  {selectedStartup.logoUrl ? (
                    <img
                      src={selectedStartup.logoUrl}
                      alt={selectedStartup.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    selectedStartup.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedStartup.name}</h2>
                    {selectedStartup.verificationLevel === "verified_business" && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Business
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedStartup.oneLiner}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {selectedStartup.broadLocation}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{selectedStartup.stage.replace("_", " ")}</span>
                    <span>•</span>
                    <span>{selectedStartup.followersCount || 0} followers</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvestModalStartup(selectedStartup)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Express Interest
                </button>
                <button
                  onClick={() => handleToggleFollow(selectedStartup.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border ${
                    selectedStartup.isFollowing
                      ? "bg-slate-800 border-slate-700 text-slate-300"
                      : "bg-indigo-600 border-indigo-500 text-white"
                  }`}
                >
                  {selectedStartup.isFollowing ? "Following" : "+ Follow"}
                </button>
                <button
                  onClick={() => setSelectedStartup(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 9 Tabs Bar */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/20 overflow-x-auto text-xs font-medium">
              {[
                { id: "overview", label: "Overview" },
                { id: "about", label: "About" },
                { id: "products", label: "Products" },
                { id: "updates", label: "Updates" },
                { id: "team", label: "Team" },
                { id: "jobs", label: "Jobs" },
                { id: "opportunities", label: "Opportunities" },
                { id: "collaborations", label: "Collabs" },
                { id: "contact", label: "Contact & Pitch" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id as any)}
                  className={`py-3 px-3 border-b-2 font-medium tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                    profileTab === tab.id
                      ? "border-indigo-500 text-indigo-400 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
              {loadingProfile ? (
                <div className="py-20 text-center text-slate-500">Loading startup details...</div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {profileTab === "overview" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
                          The Problem We Solve
                        </h4>
                        <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                          {selectedStartup.problem ||
                            "Indian enterprises and startups struggle with high operational reconciliation latency and multi-point switch drop-offs across legacy rails."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                          Our Architectural Solution
                        </h4>
                        <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                          {selectedStartup.solution ||
                            "A unified distributed double-entry event settlement fabric delivering automated idempotency and sub-10ms reconciliation."}
                        </p>
                      </div>

                      {/* Tech Stack */}
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                          Core Technologies & Architecture
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedStartup.technologies || ["Go", "PostgreSQL", "Kafka", "Redis", "Docker"]).map(
                            (tech: string) => (
                              <span
                                key={tech}
                                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-mono"
                              >
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ABOUT */}
                  {profileTab === "about" && (
                    <div className="space-y-4">
                      <p className="leading-relaxed text-slate-300">
                        {selectedStartup.fullAbout || selectedStartup.oneLiner}
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                        <div>
                          <span className="text-xs text-slate-500 block">Industry</span>
                          <span className="text-sm text-slate-200 font-medium">{selectedStartup.industry}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Location</span>
                          <span className="text-sm text-slate-200 font-medium">{selectedStartup.broadLocation}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Founded Date</span>
                          <span className="text-sm text-slate-200 font-medium">
                            {selectedStartup.foundedDate || "2024"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Business Model</span>
                          <span className="text-sm text-slate-200 font-medium">
                            {selectedStartup.businessModel || "B2B SaaS API usage fees"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PRODUCTS */}
                  {profileTab === "products" && (
                    <div className="space-y-4">
                      {startupProfileDetails?.products && startupProfileDetails.products.length > 0 ? (
                        startupProfileDetails.products.map((p: any) => (
                          <div
                            key={p.id}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <h5 className="font-bold text-white text-base">{p.name}</h5>
                              <p className="text-xs text-slate-400 mt-0.5">{p.tagline}</p>
                            </div>
                            {p.websiteUrl && (
                              <a
                                href={p.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/30 border border-indigo-500/30 flex items-center gap-1"
                              >
                                Visit Product
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          No public products listed yet. Products launched via Product Launchpad will appear here.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: UPDATES */}
                  {profileTab === "updates" && (
                    <div className="space-y-4">
                      {startupProfileDetails?.updates && startupProfileDetails.updates.length > 0 ? (
                        startupProfileDetails.updates.map((u: any) => (
                          <div
                            key={u.id}
                            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-semibold uppercase">
                                {u.updateType.replace("_", " ")}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h5 className="font-bold text-white text-base">{u.title}</h5>
                            <p className="text-xs text-slate-300 leading-relaxed">{u.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          No official startup updates published yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: TEAM */}
                  {profileTab === "team" && (
                    <div className="space-y-3">
                      {startupProfileDetails?.team && startupProfileDetails.team.length > 0 ? (
                        startupProfileDetails.team.map((m: any) => (
                          <div
                            key={m.profileId}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-300">
                                {m.displayName.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-bold text-white text-sm">{m.displayName}</h5>
                                <p className="text-xs text-slate-400">{m.title || m.role}</p>
                              </div>
                            </div>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase font-mono">
                              {m.role}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-500">Team directory is private or empty.</div>
                      )}
                    </div>
                  )}

                  {/* TAB 6: JOBS (Feature 5 Integration) */}
                  {profileTab === "jobs" && (
                    <div className="space-y-3">
                      {startupProfileDetails?.jobs && startupProfileDetails.jobs.length > 0 ? (
                        startupProfileDetails.jobs.map((j: any) => (
                          <div
                            key={j.id}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                          >
                            <div>
                              <h5 className="font-bold text-white text-sm">{j.title}</h5>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {j.department} • {j.workMode} • ₹
                                {(j.compensationMin / 100000).toFixed(1)}L - ₹
                                {(j.compensationMax / 100000).toFixed(1)}L
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedStartup(null);
                                if (onNavigateTab) onNavigateTab("hiring");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shrink-0"
                            >
                              Apply via Hiring Centre
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          No open positions at this time. All official company jobs are managed in the Hiring Centre.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 7: OPPORTUNITIES (Feature 4 Integration) */}
                  {profileTab === "opportunities" && (
                    <div className="space-y-3">
                      {startupProfileDetails?.opportunities && startupProfileDetails.opportunities.length > 0 ? (
                        startupProfileDetails.opportunities.map((opp: any) => (
                          <div
                            key={opp.id}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                          >
                            <div>
                              <h5 className="font-bold text-white text-sm">{opp.title}</h5>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {opp.category.toUpperCase()} • {opp.broadLocation}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedStartup(null);
                                if (onNavigateTab) onNavigateTab("opportunities");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer shrink-0"
                            >
                              View in Opportunities
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          No personal opportunities listed for this venture.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 8: COLLABORATIONS */}
                  {profileTab === "collaborations" && (
                    <div className="space-y-3">
                      {startupProfileDetails?.collaborations && startupProfileDetails.collaborations.length > 0 ? (
                        startupProfileDetails.collaborations.map((c: any) => (
                          <div
                            key={c.id}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <h5 className="font-bold text-white text-sm">{c.title}</h5>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Partner: {c.partnerStartup?.name || "Ecosystem Partner"}
                              </p>
                            </div>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                              Active Partnership
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          No public active partnerships. Commercial terms and private records remain strictly protected.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 9: CONTACT & PITCH */}
                  {profileTab === "contact" && (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                      <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
                      <h4 className="text-base font-bold text-white">Interested in Backing or Partnering?</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Submit a direct expression of interest or schedule an introductory sync with the founding team.
                      </p>
                      <button
                        onClick={() => setInvestModalStartup(selectedStartup)}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Send Investor Pitch / Inquiry
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REGISTER STARTUP WIZARD                         */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Register Startup Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Launch your venture profile on Balaga Founders. You will automatically become the official Owner.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStartup} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Startup Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStartupForm.name}
                  onChange={(e) => setNewStartupForm({ ...newStartupForm, name: e.target.value })}
                  placeholder="e.g. AeroPulse Technologies"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unique Slug (URL Handle)
                </label>
                <input
                  type="text"
                  value={newStartupForm.slug}
                  onChange={(e) => setNewStartupForm({ ...newStartupForm, slug: e.target.value })}
                  placeholder="e.g. aeropulse-tech (leave blank to auto-generate)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  One-Liner Hook *
                </label>
                <input
                  type="text"
                  required
                  value={newStartupForm.oneLiner}
                  onChange={(e) => setNewStartupForm({ ...newStartupForm, oneLiner: e.target.value })}
                  placeholder="e.g. Autonomous drone logistics for rural healthcare delivery across India"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry Domain *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStartupForm.industry}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, industry: e.target.value })}
                    placeholder="e.g. Drone Tech / Health Logistics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Stage *
                  </label>
                  <select
                    value={newStartupForm.stage}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, stage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="idea">Idea Stage</option>
                    <option value="research">Research & Exploration</option>
                    <option value="validation">Validation / Waitlist</option>
                    <option value="mvp">MVP Built</option>
                    <option value="early_traction">Early Traction</option>
                    <option value="growth">Growth & Expansion</option>
                    <option value="scaling">Scaling</option>
                    <option value="profitable">Profitable / Bootstrapped</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    HQ Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStartupForm.broadLocation}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, broadLocation: e.target.value })}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={newStartupForm.websiteUrl}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, websiteUrl: e.target.value })}
                    placeholder="https://yourstartup.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Problem We Solve
                </label>
                <textarea
                  rows={2}
                  value={newStartupForm.problem}
                  onChange={(e) => setNewStartupForm({ ...newStartupForm, problem: e.target.value })}
                  placeholder="What friction exists in the Indian market that you are addressing?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Solution Architecture
                </label>
                <textarea
                  rows={2}
                  value={newStartupForm.solution}
                  onChange={(e) => setNewStartupForm({ ...newStartupForm, solution: e.target.value })}
                  placeholder="How does your technology solve this uniquely?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={newStartupForm.technologies}
                  onChange={(e) => setNewStartupForm({ ...newStartupForm, technologies: e.target.value })}
                  placeholder="Rust, Go, Kafka, React"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={newStartupForm.seekingTalent}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, seekingTalent: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  Actively Seeking Talent
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={newStartupForm.seekingCollabs}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, seekingCollabs: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  Open to B2B Partnerships
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Confirm & Create Startup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: TEAM MANAGEMENT & OPTION A OWNERSHIP TRANSFER    */}
      {/* ======================================================== */}
      {teamModalStartup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Team Management — {teamModalStartup.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage team roles, invite collaborators, and oversee permissions.
                </p>
              </div>
              <button
                onClick={() => setTeamModalStartup(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Existing Members */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Team Members ({teamMembers.length})
                </h4>
                <div className="space-y-2">
                  {teamMembers.map((m) => (
                    <div
                      key={m.profileId}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-indigo-300">
                          {m.displayName ? m.displayName.charAt(0) : "M"}
                        </div>
                        <div>
                          <h5 className="font-semibold text-white text-sm">
                            {m.displayName || m.profile?.displayName || "Member"}
                          </h5>
                          <p className="text-xs text-slate-400">{m.title || m.role}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase font-bold border ${
                          m.role === "owner"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : m.role === "admin"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Member Form */}
              <form onSubmit={handleInviteMember} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite New Team Member
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Member Profile ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={inviteForm.inviteeProfileId}
                      onChange={(e) => setInviteForm({ ...inviteForm, inviteeProfileId: e.target.value })}
                      placeholder="e.g. 20000000-0000-0000-0000-000000000003"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Role *
                    </label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="admin">Admin (Full Control)</option>
                      <option value="hiring_manager">Hiring Manager</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.title}
                    onChange={(e) => setInviteForm({ ...inviteForm, title: e.target.value })}
                    placeholder="e.g. VP of Engineering"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: OPTION A OWNERSHIP TRANSFER MODAL                */}
      {/* ======================================================== */}
      {transferModalStartup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-600/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-amber-400" />
                  Transfer Startup Ownership (Option A)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Secure, auditable transition for <span className="text-white font-semibold">{transferModalStartup.name}</span>
                </p>
              </div>
              <button
                onClick={() => setTransferModalStartup(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateTransfer} className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Option A Transfer Protocol Rules:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Recipient must be an active team member of this startup.</li>
                  <li>Ownership transition occurs <strong>ONLY after the recipient explicitly accepts</strong>.</li>
                  <li>You will transition to your chosen role (Admin, Editor, or Viewer).</li>
                  <li>Exactly one active Owner exists at any time.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Team Member Profile ID *
                </label>
                <input
                  type="text"
                  required
                  value={transferForm.targetOwnerProfileId}
                  onChange={(e) => setTransferForm({ ...transferForm, targetOwnerProfileId: e.target.value })}
                  placeholder="e.g. 20000000-0000-0000-0000-000000000004"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Resulting Role After Transfer *
                </label>
                <select
                  value={transferForm.previousOwnerResultingRole}
                  onChange={(e) => setTransferForm({ ...transferForm, previousOwnerResultingRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="admin">Admin (Retain full operations & hiring control)</option>
                  <option value="editor">Editor (Content & products management)</option>
                  <option value="viewer">Viewer (Read-only observation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message / Transition Note to Recipient
                </label>
                <textarea
                  rows={2}
                  value={transferForm.note}
                  onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                  placeholder="Provide context or instructions for taking over stewardship..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTransferModalStartup(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
                >
                  Initiate Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REAL COMPUTED STARTUP ANALYTICS                 */}
      {/* ======================================================== */}
      {analyticsStartup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Analytics — {analyticsStartup.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time computed engagement metrics.</p>
              </div>
              <button
                onClick={() => setAnalyticsStartup(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {analyticsData ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-500 block">Profile Views</span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      {analyticsData.profileViews}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-500 block">Followers</span>
                    <span className="text-2xl font-bold text-indigo-400 mt-1 block">
                      {analyticsData.followersCount}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-500 block">Product Views</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                      {analyticsData.productViews}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-500 block">Update Engagements</span>
                    <span className="text-2xl font-bold text-purple-400 mt-1 block">
                      {analyticsData.updateEngagement}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-500 block">Hiring Applications</span>
                    <span className="text-2xl font-bold text-amber-400 mt-1 block">
                      {analyticsData.applicationsReceived}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-500 block">Partnership Requests</span>
                    <span className="text-2xl font-bold text-cyan-400 mt-1 block">
                      {analyticsData.collaborationRequests}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">Loading analytics...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: INVESTOR INQUIRY / EXPRESS INTEREST             */}
      {/* ======================================================== */}
      {investModalStartup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  Express Investor Interest
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Delivered directly to the founders of <span className="text-white font-semibold">{investModalStartup.name}</span>
                </p>
              </div>
              <button
                onClick={() => setInvestModalStartup(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvestInquiry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Inquiry / Backer Type *
                </label>
                <select
                  value={investForm.inquiryType}
                  onChange={(e) => setInvestForm({ ...investForm, inquiryType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="angel">Angel Investor</option>
                  <option value="syndicate">Angel Syndicate / Club</option>
                  <option value="institutional">Institutional Venture Capital</option>
                  <option value="strategic">Strategic Enterprise Partner</option>
                  <option value="info_request">Deck & Data Room Access Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Indicative Ticket Size Range
                </label>
                <select
                  value={investForm.ticketSizeRange}
                  onChange={(e) => setInvestForm({ ...investForm, ticketSizeRange: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="₹10L - ₹25L">₹10L - ₹25L</option>
                  <option value="₹25L - ₹50L">₹25L - ₹50L</option>
                  <option value="₹50L - ₹1 Cr">₹50L - ₹1 Cr</option>
                  <option value="₹1 Cr - ₹5 Cr">₹1 Cr - ₹5 Cr</option>
                  <option value="Discussion">Open to Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message / Value Proposition *
                </label>
                <textarea
                  rows={4}
                  required
                  value={investForm.message}
                  onChange={(e) => setInvestForm({ ...investForm, message: e.target.value })}
                  placeholder="Describe your syndicate/fund, portfolio synergies, and what you can offer beyond capital..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInvestModalStartup(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: PUBLISH OFFICIAL STARTUP UPDATE                 */}
      {/* ======================================================== */}
      {updateModalStartup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-indigo-400" />
                  Publish Official Update
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Broadcasting as <span className="text-white font-semibold">{updateModalStartup.name}</span> to the Founder Feed.
                </p>
              </div>
              <button
                onClick={() => setUpdateModalStartup(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Update Title *
                </label>
                <input
                  type="text"
                  required
                  value={updateForm.title}
                  onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                  placeholder="e.g. Crosses ₹500 Cr Monthly Volume or V2 Gateway Launch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={updateForm.updateType}
                  onChange={(e) => setUpdateForm({ ...updateForm, updateType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="milestone">Milestone Unlocked</option>
                  <option value="product_update">Product & Feature Launch</option>
                  <option value="partnership">Strategic Partnership</option>
                  <option value="hiring">Hiring & Expansion</option>
                  <option value="funding">Funding Announcement</option>
                  <option value="announcement">Official Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={updateForm.content}
                  onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                  placeholder="Share details, metrics, and milestones achieved..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUpdateModalStartup(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Broadcast Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
