import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  ShieldCheck,
  Briefcase,
  MapPin,
  Sparkles,
  Send,
  Eye,
  Lock,
  X,
  Check,
  Clock,
  MessageSquare,
  Handshake,
  Trash2,
  CheckCircle2,
  Building,
  Target,
  BadgeCheck,
} from "lucide-react";
import {
  NetworkFounderProfile,
  ProfileViewAnalyticsResponse,
} from "@platform/shared-types";
import {
  FounderPublicProfileModal,
  PublicFounderProfile,
} from "./FounderPublicProfileModal";

interface FounderNetworkViewProps {
  onNavigateTab?: (tab: string) => void;
}

type NetworkTab =
  | "discover"
  | "cofounders"
  | "talent"
  | "connections"
  | "received"
  | "sent"
  | "recommended"
  | "analytics";

export const FounderNetworkView: React.FC<FounderNetworkViewProps> = ({
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<NetworkTab>("discover");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [skillsFilter, setSkillsFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // Data states
  const [discoverList, setDiscoverList] = useState<NetworkFounderProfile[]>([]);
  const [cofoundersList, setCofoundersList] = useState<NetworkFounderProfile[]>([]);
  const [talentList, setTalentList] = useState<NetworkFounderProfile[]>([]);
  const [recommendedList, setRecommendedList] = useState<NetworkFounderProfile[]>([]);
  const [connectionsList, setConnectionsList] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<any[]>([]);
  const [sentProposals, setSentProposals] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<ProfileViewAnalyticsResponse | null>(null);
  const [isViewerPremium, setIsViewerPremium] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [selectedFounderProfile, setSelectedFounderProfile] = useState<PublicFounderProfile | null>(null);
  const [connectModalFounder, setConnectModalFounder] = useState<NetworkFounderProfile | null>(null);
  const [connectNote, setConnectNote] = useState("");
  const [cofounderModalFounder, setCofounderModalFounder] = useState<NetworkFounderProfile | null>(null);
  const [proposalForm, setProposalForm] = useState({
    introduction: "",
    ideaDescription: "",
    proposedRole: "Technical Co-Founder",
    reasonForContacting: "",
    commitmentExpectations: "Full-Time (40+ hrs/wk)",
    equityExpectations: "20-25% Equity with 4-year vesting",
  });
  const [reviewProposal, setReviewProposal] = useState<any | null>(null);
  const [moreInfoText, setMoreInfoText] = useState("");
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch initial data based on active tab
  useEffect(() => {
    fetchActiveTabData();
  }, [
    activeTab,
    roleFilter,
    skillsFilter,
    industryFilter,
    stageFilter,
    availabilityFilter,
    workModeFilter,
    sortBy,
  ]);

  const fetchActiveTabData = async () => {
    setIsLoading(true);
    try {
      const headers = {
        "x-mock-user": "true",
        "x-platform-world": "founders",
      };

      if (activeTab === "discover") {
        const params = new URLSearchParams();
        if (searchQuery) params.set("query", searchQuery);
        if (roleFilter !== "all") params.set("role", roleFilter);
        if (skillsFilter !== "all") params.set("skills", skillsFilter);
        if (industryFilter !== "all") params.set("industry", industryFilter);
        if (stageFilter !== "all") params.set("stage", stageFilter);
        if (availabilityFilter !== "all") params.set("availability", availabilityFilter);
        if (workModeFilter !== "all") params.set("workMode", workModeFilter);
        params.set("sortBy", sortBy);

        const res = await fetch(`/api/founders/network/discover?${params.toString()}`, { headers });
        const json = await res.json();
        setDiscoverList(json.founders || []);
        setIsViewerPremium(!!json.isViewerPremium);
      } else if (activeTab === "cofounders") {
        const res = await fetch("/api/founders/network/cofounders", { headers });
        const json = await res.json();
        setCofoundersList(json.cofounders || []);

        const resCfrRec = await fetch("/api/founders/network/cofounder-requests/received", { headers });
        const jsonRec = await resCfrRec.json();
        setReceivedProposals(jsonRec.requests || []);

        const resCfrSent = await fetch("/api/founders/network/cofounder-requests/sent", { headers });
        const jsonSent = await resCfrSent.json();
        setSentProposals(jsonSent.requests || []);
      } else if (activeTab === "talent") {
        const res = await fetch("/api/founders/network/talent", { headers });
        const json = await res.json();
        setTalentList(json.talent || []);
      } else if (activeTab === "recommended") {
        const res = await fetch("/api/founders/network/recommended", { headers });
        const json = await res.json();
        setRecommendedList(json.recommended || []);
      } else if (activeTab === "connections") {
        const res = await fetch("/api/founders/network/connections", { headers });
        const json = await res.json();
        setConnectionsList(json.connections || []);
      } else if (activeTab === "received") {
        const res = await fetch("/api/founders/network/requests/received", { headers });
        const json = await res.json();
        setReceivedRequests(json.requests || []);
      } else if (activeTab === "sent") {
        const res = await fetch("/api/founders/network/requests/sent", { headers });
        const json = await res.json();
        setSentRequests(json.requests || []);
      } else if (activeTab === "analytics") {
        const res = await fetch("/api/founders/profile/views", { headers });
        const json = await res.json();
        setAnalyticsData(json);
      }
    } catch (err) {
      console.error("Error fetching network data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActiveTabData();
  };

  // Follow / Unfollow
  const handleToggleFollow = async (founderId: string) => {
    try {
      const res = await fetch(`/api/founders/feed/authors/${founderId}/follow`, {
        method: "POST",
        headers: {
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
      });
      const data = await res.json();
      showToast(data.message || "Updated follow state");
      fetchActiveTabData();
    } catch (err) {
      showToast("Failed to update follow");
    }
  };

  // Send Connection Request
  const handleSendConnect = async () => {
    if (!connectModalFounder) return;
    try {
      const res = await fetch(`/api/founders/network/connect/${connectModalFounder.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ note: connectNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to send connection request");
      } else {
        showToast("Connection request sent with personalized note!");
        setConnectModalFounder(null);
        setConnectNote("");
        fetchActiveTabData();
      }
    } catch (err) {
      showToast("Error sending connection request");
    }
  };

  // Accept Connection Request
  const handleAcceptRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/founders/network/requests/${id}/accept`, {
        method: "POST",
        headers: {
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        showToast("Connection accepted! You can now message directly.");
        fetchActiveTabData();
      }
    } catch (err) {
      showToast("Error accepting connection");
    }
  };

  // Reject Connection Request
  const handleRejectRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/founders/network/requests/${id}/reject`, {
        method: "POST",
        headers: {
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        showToast("Connection request ignored.");
        fetchActiveTabData();
      }
    } catch (err) {
      showToast("Error rejecting connection");
    }
  };

  // Withdraw Connection Request
  const handleWithdrawRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/founders/network/requests/${id}/withdraw`, {
        method: "POST",
        headers: {
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        showToast("Connection request withdrawn.");
        fetchActiveTabData();
      }
    } catch (err) {
      showToast("Error withdrawing connection");
    }
  };

  // Remove Active Connection
  const handleRemoveConnection = async (partnerId: string) => {
    if (!window.confirm("Remove this connection? Existing conversation history will remain accessible.")) {
      return;
    }
    try {
      const res = await fetch(`/api/founders/network/connections/${partnerId}`, {
        method: "DELETE",
        headers: {
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        showToast("Connection removed. Chat history preserved.");
        fetchActiveTabData();
      }
    } catch (err) {
      showToast("Error removing connection");
    }
  };

  // Send Cofounder Proposal
  const handleSendCofounderProposal = async () => {
    if (!cofounderModalFounder) return;
    try {
      const res = await fetch("/api/founders/network/cofounder-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({
          recipientId: cofounderModalFounder.id,
          ...proposalForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to send cofounder proposal");
      } else {
        showToast("Cofounder proposal submitted directly to founder!");
        setCofounderModalFounder(null);
        setProposalForm({
          introduction: "",
          ideaDescription: "",
          proposedRole: "Technical Co-Founder",
          reasonForContacting: "",
          commitmentExpectations: "Full-Time (40+ hrs/wk)",
          equityExpectations: "20-25% Equity with 4-year vesting",
        });
        fetchActiveTabData();
      }
    } catch (err) {
      showToast("Error submitting cofounder proposal");
    }
  };

  // Action on Cofounder Proposal (Accept / Reject / More Info / Withdraw)
  const handleProposalAction = async (id: string, action: string, extraBody?: any) => {
    try {
      const res = await fetch(`/api/founders/network/cofounder-requests/${id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify(extraBody || {}),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Proposal ${action}ed`);
        setReviewProposal(null);
        setMoreInfoText("");
        fetchActiveTabData();
      } else {
        showToast(data.error || "Error processing proposal");
      }
    } catch (err) {
      showToast("Error processing proposal");
    }
  };

  // Message Click Handler (Enforces Decision 1)
  const handleMessageClick = (profile: NetworkFounderProfile) => {
    if (profile.canMessage) {
      if (onNavigateTab) {
        onNavigateTab("inbox");
      } else {
        showToast(`Opening direct conversation with ${profile.displayName}...`);
      }
    } else {
      // Basic member & unconnected -> Show Premium upgrade or Connect CTA
      setPremiumModalOpen(true);
    }
  };

  // Open Full Public Profile Modal
  const openPublicProfile = async (founder: NetworkFounderProfile) => {
    // Record view in background
    fetch(`/api/founders/profile/${founder.id}/view`, {
      method: "POST",
      headers: { "x-mock-user": "true", "x-platform-world": "founders" },
    }).catch(() => {});

    setSelectedFounderProfile({
      id: founder.id,
      displayName: founder.displayName,
      username: founder.username,
      headline: founder.headline || "Startup Builder",
      avatarUrl: founder.avatarUrl || undefined,
      coverUrl: founder.coverUrl || undefined,
      location: founder.broadLocation || "Bengaluru, India",
      companyName: founder.startupAffiliation?.name || "Independent Venture",
      companyRole: founder.startupAffiliation?.role || founder.roles?.[0] || "Founder",
      schoolName: "Indian Institute of Science / Tech",
      connectionsCount: "500+ founders",
      followersCount: "1,200 followers",
      mutualsText: "You both build in FinTech and Developer Platforms",
      about: founder.bio || "Passionate startup founder building scalable systems.",
      connectionStatus:
        founder.connectionStatus === "accepted"
          ? "connected"
          : founder.connectionStatus === "pending_sent" || founder.connectionStatus === "pending_received"
          ? "pending"
          : "none",
      openTo: {
        roles: founder.lookingFor?.join(", ") || "Technical Co-Founder, Early Engineering",
        services: "Advisory, Mentorship, Tech Review",
      },
      experience: [
        {
          id: "exp-1",
          company: founder.startupAffiliation?.name || "NovaTech Systems",
          role: founder.startupAffiliation?.role || "Co-Founder & Engineering",
          duration: "2024 - Present · 2 yrs",
          location: founder.broadLocation || "Bengaluru, Karnataka",
          description: "Leading system architecture, distributed microservices, and product roadmaps.",
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "National Institute of Technology",
          degree: "Bachelor of Technology (B.Tech)",
          field: "Computer Science and Engineering",
          duration: "2014 - 2018",
        },
      ],
      skills: (founder.skills || ["System Architecture", "Go", "TypeScript", "B2B SaaS"]).map((s) => ({
        name: s,
        endorsementsCount: Math.floor(Math.random() * 25) + 5,
      })),
      startupDetails: founder.startupAffiliation
        ? {
            name: founder.startupAffiliation.name,
            tagline: "Next-gen distributed infrastructure and real-time ledger settlement engines.",
            stage: founder.startupAffiliation.stage.toUpperCase(),
            seeking: founder.lookingFor?.join(", ") || "Technical Co-Founders, Early Engineers",
            equityOffer: "Standard vesting (4 yrs with 1 yr cliff)",
          }
        : undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/50 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Founder Network & Cofounder Discovery</span>
              {isViewerPremium && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
                  Premium Tier Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Connect, Partner & Build Startup Teams
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Discover verified technical talent, pitch cofounder proposals with customizable equity expectations, and expand your professional startup network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === "analytics"
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700"
              }`}
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Profile Views</span>
              {analyticsData && analyticsData.totalViews > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                  {analyticsData.totalViews}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("cofounders")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
            >
              <Handshake className="w-4 h-4" />
              <span>Find Cofounders</span>
            </button>
          </div>
        </div>

        {/* Privacy & world separation notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict Privacy Guaranteed: Email, phone numbers, and exact locations are never exposed publicly.</span>
          </div>
          <span className="text-slate-500">Separate from Socializing realm friendships</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
        {[
          { id: "discover", label: "Discover People", icon: Users },
          { id: "cofounders", label: "Find Cofounders", icon: Handshake, count: receivedProposals.length },
          { id: "talent", label: "Startup Talent", icon: Briefcase },
          { id: "recommended", label: "Recommended", icon: Sparkles },
          { id: "connections", label: "My Connections", icon: UserCheck, count: connectionsList.length },
          { id: "received", label: "Received Requests", icon: UserPlus, count: receivedRequests.length },
          { id: "sent", label: "Sent Requests", icon: Send, count: sentRequests.length },
          { id: "analytics", label: "Profile Views", icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NetworkTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/5 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">
        {/* ======================================================== */}
        {/* TAB 1: DISCOVER PEOPLE (Multi-Filter Discovery)           */}
        {/* ======================================================== */}
        {activeTab === "discover" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, headline, skills, keywords, or startup..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
                >
                  Search
                </button>
              </form>

              {/* Multi-Filters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5 pt-2 border-t border-slate-800/80">
                {/* Role */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="Founder">Founder / CEO</option>
                    <option value="CTO">CTO / Technical Lead</option>
                    <option value="Architect">Systems Architect</option>
                    <option value="Design">Product Designer</option>
                    <option value="Advisor">Advisor / Mentor</option>
                  </select>
                </div>

                {/* Skills */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Skill</label>
                  <select
                    value={skillsFilter}
                    onChange={(e) => setSkillsFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Skills</option>
                    <option value="Go">Go / Golang</option>
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="Kubernetes">Kubernetes / Cloud</option>
                    <option value="TypeScript">TypeScript / React</option>
                    <option value="UI/UX">UI/UX & Design</option>
                    <option value="GTM Strategy">GTM & Sales</option>
                  </select>
                </div>

                {/* Industry */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Industry</label>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Industries</option>
                    <option value="FinTech">FinTech</option>
                    <option value="B2B SaaS">B2B SaaS</option>
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="AI/ML">AI / ML</option>
                    <option value="Cloud Cost">Cloud Infrastructure</option>
                  </select>
                </div>

                {/* Startup Stage */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Startup Stage</label>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Stages</option>
                    <option value="idea">Idea / Concept</option>
                    <option value="prototype">Prototype / MVP</option>
                    <option value="early_traction">Early Traction</option>
                    <option value="scaling">Scaling</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Availability</label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Any Availability</option>
                    <option value="full_time">Full-Time</option>
                    <option value="part_time">Part-Time</option>
                    <option value="weekends">Weekends</option>
                    <option value="advisory">Advisory</option>
                  </select>
                </div>

                {/* Work Mode */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Work Mode</label>
                  <select
                    value={workModeFilter}
                    onChange={(e) => setWorkModeFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Any Mode</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="active">Active Recently</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profiles Grid */}
            {isLoading ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Finding matching founders...</span>
              </div>
            ) : discoverList.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No founders found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Try broadening your search query or resetting filters to discover more builders.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setSkillsFilter("all");
                    setIndustryFilter("all");
                    setStageFilter("all");
                    setAvailabilityFilter("all");
                    setWorkModeFilter("all");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {discoverList.map((founder) => (
                  <FounderProfileCard
                    key={founder.id}
                    founder={founder}
                    onViewProfile={() => openPublicProfile(founder)}
                    onToggleFollow={() => handleToggleFollow(founder.id)}
                    onConnectClick={() => setConnectModalFounder(founder)}
                    onCofounderClick={() => setCofounderModalFounder(founder)}
                    onMessageClick={() => handleMessageClick(founder)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FIND COFOUNDERS (Dedicated Area & Proposals)       */}
        {/* ======================================================== */}
        {activeTab === "cofounders" && (
          <div className="space-y-8">
            {/* Cofounder Proposals Section */}
            {(receivedProposals.length > 0 || sentProposals.length > 0) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-emerald-400" />
                    <span>Active Cofounder Proposals</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {receivedProposals.length} received · {sentProposals.length} sent
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Received proposals */}
                  {receivedProposals.map((cfr) => (
                    <div
                      key={cfr.id}
                      className="bg-slate-950 border border-emerald-900/40 rounded-xl p-4 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Incoming Proposal
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1">
                            {cfr.proposedRole}
                          </h4>
                          <p className="text-xs text-slate-400">
                            From <span className="text-slate-200 font-medium">{cfr.requester?.displayName}</span> ({cfr.requester?.headline})
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${
                            cfr.status === "accepted"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : cfr.status === "more_info_requested"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {cfr.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg space-y-1.5 border border-slate-800">
                        <p><strong className="text-slate-400 font-normal">Idea:</strong> {cfr.ideaDescription}</p>
                        <p><strong className="text-slate-400 font-normal">Commitment:</strong> {cfr.commitmentExpectations}</p>
                        <p><strong className="text-slate-400 font-normal">Equity:</strong> {cfr.equityExpectations}</p>
                        {cfr.moreInfoResponse && (
                          <p className="text-amber-300 border-t border-slate-800 pt-1.5">
                            <strong className="text-amber-400">Note:</strong> {cfr.moreInfoResponse}
                          </p>
                        )}
                      </div>

                      {cfr.status === "pending" && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleProposalAction(cfr.id, "accept")}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                          >
                            Accept & Connect
                          </button>
                          <button
                            onClick={() => setReviewProposal(cfr)}
                            className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                          >
                            Ask Details
                          </button>
                          <button
                            onClick={() => handleProposalAction(cfr.id, "reject")}
                            className="py-1.5 px-3 hover:bg-rose-950/40 text-rose-400 rounded-lg text-xs font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Sent proposals */}
                  {sentProposals.map((cfr) => (
                    <div
                      key={cfr.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                            Sent Proposal
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1">
                            {cfr.proposedRole}
                          </h4>
                          <p className="text-xs text-slate-400">
                            To <span className="text-slate-200 font-medium">{cfr.recipient?.displayName}</span>
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize font-medium">
                          {cfr.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        {cfr.ideaDescription}
                      </p>

                      {cfr.status === "pending" && (
                        <div className="pt-1">
                          <button
                            onClick={() => handleProposalAction(cfr.id, "withdraw")}
                            className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            Withdraw Proposal
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cofounder Candidates List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Available Co-Founders</h3>
                  <p className="text-xs text-slate-400">
                    Active builders seeking technical, business, or operational cofounders.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cofoundersList.map((founder) => (
                  <FounderProfileCard
                    key={founder.id}
                    founder={founder}
                    isCofounderMode
                    onViewProfile={() => openPublicProfile(founder)}
                    onToggleFollow={() => handleToggleFollow(founder.id)}
                    onConnectClick={() => setConnectModalFounder(founder)}
                    onCofounderClick={() => setCofounderModalFounder(founder)}
                    onMessageClick={() => handleMessageClick(founder)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: FIND STARTUP TALENT                                */}
        {/* ======================================================== */}
        {activeTab === "talent" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Startup Talent Directory</h3>
              <p className="text-xs text-slate-400">
                Engineers, product designers, growth marketers, and domain advisors ready to join early-stage teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {talentList.map((founder) => (
                <FounderProfileCard
                  key={founder.id}
                  founder={founder}
                  onViewProfile={() => openPublicProfile(founder)}
                  onToggleFollow={() => handleToggleFollow(founder.id)}
                  onConnectClick={() => setConnectModalFounder(founder)}
                  onCofounderClick={() => setCofounderModalFounder(founder)}
                  onMessageClick={() => handleMessageClick(founder)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: RECOMMENDED FOR YOU (No paid bias)                 */}
        {/* ======================================================== */}
        {activeTab === "recommended" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Algorithmic Recommendations (Zero Paid Bias)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  These recommendations are computed solely based on complementary skill sets (e.g. engineering + design or architecture + sales), shared startup industry interests, and geographical proximity. No sponsored placements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedList.map((founder) => (
                <FounderProfileCard
                  key={founder.id}
                  founder={founder}
                  onViewProfile={() => openPublicProfile(founder)}
                  onToggleFollow={() => handleToggleFollow(founder.id)}
                  onConnectClick={() => setConnectModalFounder(founder)}
                  onCofounderClick={() => setCofounderModalFounder(founder)}
                  onMessageClick={() => handleMessageClick(founder)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MY CONNECTIONS                                     */}
        {/* ======================================================== */}
        {activeTab === "connections" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">My Professional Connections</h3>
                <p className="text-xs text-slate-400">
                  {connectionsList.length} accepted connections in the Balaga Founders ecosystem.
                </p>
              </div>
            </div>

            {connectionsList.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No active connections yet</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Explore Discover People or Find Cofounders to build your startup network.
                </p>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Discover Founders
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {connectionsList.map((conn) => {
                  const partner = conn.partner;
                  if (!partner) return null;
                  return (
                    <FounderProfileCard
                      key={conn.connectionId}
                      founder={partner}
                      isConnectedPartner
                      onViewProfile={() => openPublicProfile(partner)}
                      onToggleFollow={() => handleToggleFollow(partner.id)}
                      onConnectClick={() => {}}
                      onCofounderClick={() => setCofounderModalFounder(partner)}
                      onMessageClick={() => handleMessageClick(partner)}
                      onRemoveConnection={() => handleRemoveConnection(partner.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: RECEIVED REQUESTS                                  */}
        {/* ======================================================== */}
        {activeTab === "received" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Received Connection Requests</h3>
              <p className="text-xs text-slate-400">
                Founders who have requested to connect with you.
              </p>
            </div>

            {receivedRequests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <UserPlus className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm">No pending connection requests received.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-lg text-emerald-400 shrink-0">
                        {req.requester?.avatarUrl ? (
                          <img
                            src={req.requester.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          req.requester?.displayName?.[0] || "F"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-white truncate">
                          {req.requester?.displayName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {req.requester?.headline || "Startup Builder"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{req.requester?.broadLocation || "India"}</span>
                        </div>
                      </div>
                    </div>

                    {req.note && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                        <strong className="text-slate-400 font-normal">Personal Note: </strong>
                        "{req.note}"
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => openPublicProfile(req.requester)}
                        className="py-2 px-3 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: SENT REQUESTS                                      */}
        {/* ======================================================== */}
        {activeTab === "sent" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Sent Connection Requests</h3>
              <p className="text-xs text-slate-400">
                Invitations you have sent that are currently pending.
              </p>
            </div>

            {sentRequests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <Send className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm">No sent connection requests pending.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-lg text-slate-400 shrink-0">
                        {req.recipient?.avatarUrl ? (
                          <img
                            src={req.recipient.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          req.recipient?.displayName?.[0] || "F"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-white truncate">
                          {req.recipient?.displayName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {req.recipient?.headline || "Founder"}
                        </p>
                        <span className="inline-block mt-1 text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                          Pending Response
                        </span>
                      </div>
                    </div>

                    {req.note && (
                      <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        "{req.note}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">
                        Sent {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleWithdrawRequest(req.id)}
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium"
                      >
                        Withdraw Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: PROFILE VIEW ANALYTICS (Premium Decision 2)        */}
        {/* ======================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {analyticsData?.isLocked ? (
              /* Locked state for Basic members */
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    {analyticsData.totalViews} Founders Viewed Your Profile
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    {analyticsData.message || "Upgrade to Balaga Founders Premium to see who viewed your profile, unlock detailed visitor timelines, and access reach analytics."}
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>See full visitor profiles (Founders, Angels & Mentors)</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Direct messaging without needing to connect first</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Priority visibility in cofounder search discovery</span>
                  </div>
                </div>

                <button
                  onClick={() => setPremiumModalOpen(true)}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm"
                >
                  Upgrade to Founders Premium
                </button>
              </div>
            ) : (
              /* Unlocked state for Premium members */
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 font-medium">Total Profile Views</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">
                      {analyticsData?.totalViews || 0}
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
                      +14% from last week
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 font-medium">Unique Viewers</span>
                    <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                      {analyticsData?.uniqueViewersCount || 0}
                    </h3>
                    <span className="text-[11px] text-slate-400 mt-1 inline-block">
                      Verified startup builders
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 font-medium">Subscription Tier</span>
                    <h3 className="text-xl font-bold text-amber-400 mt-1 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>Founders Premium</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 mt-1 inline-block">
                      Full visitor analytics unlocked
                    </span>
                  </div>
                </div>

                {/* Viewers timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-base font-bold text-white">Recent Visitors Timeline</h4>

                  <div className="divide-y divide-slate-800/80">
                    {(analyticsData?.views || []).map((v) => (
                      <div
                        key={v.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 px-3 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-emerald-400">
                            {v.viewer?.avatarUrl ? (
                              <img
                                src={v.viewer.avatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              v.viewer?.displayName?.[0] || "F"
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-white">
                                {v.viewer?.displayName || "Anonymous Founder"}
                              </h5>
                              {(v.viewer as any)?.verificationBadge && (v.viewer as any).verificationBadge !== "none" && (
                                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {v.viewer?.headline || "Startup Builder"} · {v.viewer?.broadLocation || "India"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(v.viewedAt).toLocaleDateString()}</span>
                          </span>
                          {v.viewer && (
                            <button
                              onClick={() => openPublicProfile(v.viewer as any)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                            >
                              View Profile
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SEND CONNECTION REQUEST WITH NOTE               */}
      {/* ======================================================== */}
      {connectModalFounder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Connect with {connectModalFounder.displayName}</h3>
                <p className="text-xs text-slate-400">{connectModalFounder.headline}</p>
              </div>
              <button
                onClick={() => setConnectModalFounder(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                Include a personalized note (Optional, max 300 characters)
              </label>
              <textarea
                value={connectNote}
                maxLength={300}
                onChange={(e) => setConnectNote(e.target.value)}
                placeholder="Mention common interests, complementary skills, or why you'd like to connect..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Adding a note increases acceptance rates by 40%.</span>
                <span>{connectNote.length} / 300</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConnectModalFounder(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnect}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SEND PERSONALIZED COFOUNDER PROPOSAL            */}
      {/* ======================================================== */}
      {cofounderModalFounder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-900/50 rounded-2xl w-full max-w-xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  Cofounder Partnership Proposal
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Propose Partnership to {cofounderModalFounder.displayName}
                </h3>
                <p className="text-xs text-slate-400">{cofounderModalFounder.headline}</p>
              </div>
              <button
                onClick={() => setCofounderModalFounder(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Introduction</label>
                <input
                  type="text"
                  value={proposalForm.introduction}
                  onChange={(e) =>
                    setProposalForm({ ...proposalForm, introduction: e.target.value })
                  }
                  placeholder="e.g. Hi Rohit, I've followed your work on distributed fintech rails..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Startup Idea / Vision Description
                </label>
                <textarea
                  value={proposalForm.ideaDescription}
                  onChange={(e) =>
                    setProposalForm({ ...proposalForm, ideaDescription: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe what you are building, target market, and current prototype stage..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Proposed Role</label>
                  <input
                    type="text"
                    value={proposalForm.proposedRole}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, proposedRole: e.target.value })
                    }
                    placeholder="e.g. Technical Co-Founder / CTO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Commitment Expectations</label>
                  <select
                    value={proposalForm.commitmentExpectations}
                    onChange={(e) =>
                      setProposalForm({
                        ...proposalForm,
                        commitmentExpectations: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Full-Time (40+ hrs/wk)">Full-Time (40+ hrs/wk)</option>
                    <option value="Part-Time (20 hrs/wk)">Part-Time (20 hrs/wk)</option>
                    <option value="Weekends / Advisory">Weekends / Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Reason for Contacting this Specific Founder
                </label>
                <textarea
                  value={proposalForm.reasonForContacting}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      reasonForContacting: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Explain why their specific background and skills fit your venture..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Equity Expectations / Offer
                </label>
                <input
                  type="text"
                  value={proposalForm.equityExpectations}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      equityExpectations: e.target.value,
                    })
                  }
                  placeholder="e.g. 20-25% Equity with 4-year vesting (1-year cliff)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Proposals are tracked securely in the Cofounder Discovery dashboard.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCofounderModalFounder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCofounderProposal}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ASK FOR MORE INFO ON PROPOSAL                    */}
      {/* ======================================================== */}
      {reviewProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Request Details from {reviewProposal.requester?.displayName}
            </h3>
            <p className="text-xs text-slate-400">
              Ask clarifying questions regarding the prototype architecture, traction, or equity terms before deciding.
            </p>
            <textarea
              value={moreInfoText}
              onChange={(e) => setMoreInfoText(e.target.value)}
              placeholder="e.g. Could you share your pitch deck or traction metrics?"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewProposal(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleProposalAction(reviewProposal.id, "more_info", {
                    question: moreInfoText,
                  })
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: UPGRADE TO PREMIUM MODAL                         */}
      {/* ======================================================== */}
      {premiumModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">Balaga Founders Premium</h3>
              <p className="text-xs text-slate-300">
                Unlock direct messaging without connecting first and see exactly who visits your profile.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Message any founder directly without waiting for request acceptance</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full Profile View Analytics & visitor timeline</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Founder badge & priority placement in search</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPremiumModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  showToast("Premium membership activated on developer account!");
                  setPremiumModalOpen(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/25"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Public Profile Modal */}
      <FounderPublicProfileModal
        founder={selectedFounderProfile}
        isOpen={!!selectedFounderProfile}
        onClose={() => setSelectedFounderProfile(null)}
      />
    </div>
  );
};

// ========================================================
// SUB-COMPONENT: FOUNDER PROFILE CARD
// ========================================================
interface FounderProfileCardProps {
  founder: NetworkFounderProfile;
  isCofounderMode?: boolean;
  isConnectedPartner?: boolean;
  onViewProfile: () => void;
  onToggleFollow: () => void;
  onConnectClick: () => void;
  onCofounderClick: () => void;
  onMessageClick: () => void;
  onRemoveConnection?: () => void;
}

const FounderProfileCard: React.FC<FounderProfileCardProps> = ({
  founder,
  isCofounderMode,
  isConnectedPartner,
  onViewProfile,
  onToggleFollow,
  onConnectClick,
  onCofounderClick,
  onMessageClick,
  onRemoveConnection,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-xl hover:shadow-emerald-950/10 group">
      {/* Top Header: Avatar + Headline + Badges */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-13 h-13 w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-lg text-emerald-400">
                {founder.avatarUrl ? (
                  <img
                    src={founder.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  founder.displayName?.[0] || "F"
                )}
              </div>
              {founder.verificationBadge && founder.verificationBadge !== "none" && (
                <div
                  title="Earned Verification Badge"
                  className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 text-emerald-400"
                >
                  <BadgeCheck className="w-4 h-4 fill-emerald-500/20" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={onViewProfile}
                  className="text-left font-bold text-white hover:text-emerald-400 transition-colors text-sm sm:text-base truncate block"
                >
                  {founder.displayName}
                </button>
                {isCofounderMode && (
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded font-semibold">
                    Cofounder
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate line-clamp-1">
                {founder.headline || "Startup Builder"}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>{founder.broadLocation || "India"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onToggleFollow}
            title={founder.isFollowing ? "Unfollow" : "Follow"}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
              founder.isFollowing
                ? "bg-slate-800 text-slate-300 border-slate-700"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
          >
            {founder.isFollowing ? "Following" : "+ Follow"}
          </button>
        </div>

        {/* Startup Affiliation Badge */}
        {founder.startupAffiliation && (
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white truncate">
                {founder.startupAffiliation.name}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 truncate">
                {founder.startupAffiliation.role}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
              {founder.startupAffiliation.stage}
            </span>
          </div>
        )}

        {/* Short introduction bio */}
        {founder.bio && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {founder.bio}
          </p>
        )}

        {/* What person is looking for */}
        {founder.lookingFor && founder.lookingFor.length > 0 && (
          <div className="text-[11px] text-slate-300 flex items-start gap-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
            <Target className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              <strong className="text-slate-400 font-normal">Seeking:</strong>{" "}
              {founder.lookingFor.join(", ")}
            </span>
          </div>
        )}

        {/* Skills pill tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(founder.skills || []).slice(0, 4).map((sk) => (
            <span
              key={sk}
              className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-md font-medium border border-slate-700/50"
            >
              {sk}
            </span>
          ))}
          {(founder.skills || []).length > 4 && (
            <span className="text-[10px] text-slate-500 self-center">
              +{founder.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Actions: View, Connect, Cofounder Proposal, Message */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={onViewProfile}
          className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
        >
          View Profile
        </button>

        <div className="flex items-center gap-1.5">
          {/* Message button */}
          <button
            onClick={onMessageClick}
            title={
              founder.canMessage
                ? "Send direct message"
                : "Direct messaging requires Founders Premium or connection"
            }
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            {!founder.canMessage && <Lock className="w-2.5 h-2.5 text-amber-400" />}
          </button>

          {/* Send Cofounder Proposal */}
          <button
            onClick={onCofounderClick}
            className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>Pitch</span>
          </button>

          {/* Connect / Connected state */}
          {isConnectedPartner ? (
            <button
              onClick={onRemoveConnection}
              title="Remove connection"
              className="p-2 rounded-xl hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : founder.connectionStatus === "accepted" ? (
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connected</span>
            </span>
          ) : founder.connectionStatus === "pending_sent" ? (
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium">
              Requested
            </span>
          ) : founder.connectionStatus === "pending_received" ? (
            <button
              onClick={onConnectClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
            >
              Respond
            </button>
          ) : (
            <button
              onClick={onConnectClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
