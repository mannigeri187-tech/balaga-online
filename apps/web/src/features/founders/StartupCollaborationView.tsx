import React, { useState, useEffect } from "react";
import {
  Handshake,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  MessageSquare,
  Building2,
  Star,
  Users,
  Calendar,
  CheckSquare,
  RefreshCw,
  X,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  CollaborationRequest,
  StartupCollaborationProfile,
  StartupOutreachAllowance,
  PartnershipMessage,
  PartnershipTask,
  PartnershipMilestone,
  PartnershipDocument,
  PartnershipMeeting,
  PartnershipReferral,
  PartnershipCommission,
  Startup,
} from "@platform/shared-types";

interface StartupCollaborationViewProps {
  onNavigateTab?: (tab: string) => void;
}

const COLLAB_TYPES_LIST = [
  { id: "all", label: "All Collaboration Types" },
  { id: "referral", label: "Customer Referrals", icon: "🔄", desc: "Reciprocal lead and customer sharing" },
  { id: "rev_share", label: "Revenue Sharing", icon: "💰", desc: "Contracted percentage on joint deals" },
  { id: "integration", label: "Product Integration", icon: "🔌", desc: "API, SDK, and telemetry connections" },
  { id: "joint_marketing", label: "Joint Marketing", icon: "📢", desc: "Co-webinars, whitepapers & PR" },
  { id: "distribution", label: "Distribution Channel", icon: "🚀", desc: "Channel sales & platform bundling" },
  { id: "reseller", label: "Reseller Agreement", icon: "🏷️", desc: "Authorized partner distribution" },
  { id: "resource_share", label: "Resource Sharing", icon: "🤝", desc: "Infrastructure, data, compute sharing" },
  { id: "business_collab", label: "Business Collab", icon: "🏢", desc: "Joint corporate initiatives" },
  { id: "tech_collab", label: "Tech Collab", icon: "💻", desc: "Shared open source or R&D pipelines" },
  { id: "custom", label: "Custom Partnership", icon: "✨", desc: "Bespoke strategic arrangement" },
];

export const StartupCollaborationView: React.FC<StartupCollaborationViewProps> = ({
  onNavigateTab: _onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<string>("discover");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedCollabType, setSelectedCollabType] = useState<string>("all");

  // Data states
  const [startups, setStartups] = useState<any[]>([]);
  const [mySpaces, setMySpaces] = useState<any[]>([]);
  const [incomingProposals, setIncomingProposals] = useState<CollaborationRequest[]>([]);
  const [sentProposals, setSentProposals] = useState<CollaborationRequest[]>([]);
  const [outreachAllowance, setOutreachAllowance] = useState<StartupOutreachAllowance | null>(null);
  const [myCollabProfile, setMyCollabProfile] = useState<StartupCollaborationProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isProposeModalOpen, setIsProposeModalOpen] = useState<boolean>(false);
  const [targetStartupForProposal, setTargetStartupForProposal] = useState<Startup | null>(null);
  const [proposalFormat, setProposalFormat] = useState<"intro" | "detailed">("detailed");
  const [proposalTitle, setProposalTitle] = useState<string>("");
  const [proposalCollabType, setProposalCollabType] = useState<string>("integration");
  const [proposalOffer, setProposalOffer] = useState<string>("");
  const [proposalNeed, setProposalNeed] = useState<string>("");
  const [proposalCommercialTerms, setProposalCommercialTerms] = useState<string>("");
  const [proposalDuration, setProposalDuration] = useState<string>("3-6 Months");

  // Selected space workspace
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [spaceDetails, setSpaceDetails] = useState<any | null>(null);
  const [spaceSubTab, setSpaceSubTab] = useState<string>("overview");
  const [spaceNewMessage, setSpaceNewMessage] = useState<string>("");

  // Space module inputs
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>("");
  const [newMilestoneDate, setNewMilestoneDate] = useState<string>("");
  const [newMeetingTitle, setNewMeetingTitle] = useState<string>("");
  const [newMeetingDate, setNewMeetingDate] = useState<string>("");
  const [newMeetingAgenda, setNewMeetingAgenda] = useState<string>("");
  const [newReferralCustomer, setNewReferralCustomer] = useState<string>("");
  const [newReferralCommission, setNewReferralCommission] = useState<string>("");

  // Review & Dispute state
  const [reviewScores, setReviewScores] = useState({
    communication: 5,
    professionalism: 5,
    reliability: 5,
    delivery: 5,
    transparency: 5,
    overallExperience: 5,
  });
  const [reviewFeedback, setReviewFeedback] = useState<string>("");
  const [disputeCategory, setDisputeCategory] = useState<
    "commercial_terms" | "non_delivery" | "confidentiality" | "communication_breakdown" | "other"
  >("commercial_terms");
  const [disputeDescription, setDisputeDescription] = useState<string>("");

  // Messaging permission check dialog
  const [messageCheckModal, setMessageCheckModal] = useState<{
    open: boolean;
    canMessage: boolean;
    isPremium: boolean;
    reason: string;
    targetName: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "x-mock-user": "true",
    "x-platform-world": "founders",
  });

  // Fetch Discovery Startups
  const fetchDiscoverStartups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedIndustry !== "all") params.append("industry", selectedIndustry);
      if (selectedStage !== "all") params.append("stage", selectedStage);
      if (selectedCollabType !== "all") params.append("partnershipTypes", selectedCollabType);

      const res = await fetch(`/api/founders/collaborations/discover?${params.toString()}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setStartups(data.startups || []);
      }
    } catch (err) {
      console.error("Failed to load startups:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Proposals & Spaces
  const fetchProposalsAndSpaces = async () => {
    try {
      const [pRes, sRes, aRes, profRes] = await Promise.all([
        fetch("/api/founders/collaborations/proposals", { headers: getHeaders() }),
        fetch("/api/founders/collaborations/spaces", { headers: getHeaders() }),
        fetch("/api/founders/collaborations/allowance/st-dev", { headers: getHeaders() }),
        fetch("/api/founders/collaborations/profile/st-dev", { headers: getHeaders() }),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        const incoming = (pData.proposals || []).filter(
          (p: any) => p.receiverStartupId === "st-dev" || p.receiverStartupId === "st-mesh"
        );
        const sent = (pData.proposals || []).filter(
          (p: any) => p.initiatorStartupId === "st-dev" || p.initiatorStartupId === "st-mesh"
        );
        setIncomingProposals(incoming);
        setSentProposals(sent);
      }

      if (sRes.ok) {
        const sData = await sRes.json();
        setMySpaces(sData.spaces || []);
      }

      if (aRes.ok) {
        const aData = await aRes.json();
        setOutreachAllowance(aData.allowance || null);
      }

      if (profRes.ok) {
        const profData = await profRes.json();
        setMyCollabProfile(profData.profile || null);
      }
    } catch (err) {
      console.error("Failed to fetch proposals/spaces:", err);
    }
  };

  // Fetch Space Details
  const fetchSpaceDetails = async (spaceId: string) => {
    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${spaceId}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSpaceDetails(data.space);
      }
    } catch (err) {
      console.error("Failed to fetch space details:", err);
    }
  };

  useEffect(() => {
    fetchDiscoverStartups();
    fetchProposalsAndSpaces();
  }, [selectedIndustry, selectedStage, selectedCollabType]);

  useEffect(() => {
    if (selectedSpaceId) {
      fetchSpaceDetails(selectedSpaceId);
    }
  }, [selectedSpaceId]);

  // Handle Send Proposal (Option A Controlled Outreach Enforced)
  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStartupForProposal) return;

    if (!proposalTitle.trim() || !proposalOffer.trim() || !proposalNeed.trim()) {
      showToast("Please fill in title, what you offer, and what you need.");
      return;
    }

    try {
      const res = await fetch("/api/founders/collaborations/proposals", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          initiatorStartupId: "st-dev",
          receiverStartupId: targetStartupForProposal.id,
          format: proposalFormat,
          collabType: proposalCollabType,
          title: proposalTitle.trim(),
          whatWeOffer: proposalOffer.trim(),
          whatWeNeed: proposalNeed.trim(),
          commercialTerms: proposalCommercialTerms.trim() || undefined,
          proposedDuration: proposalDuration,
          isDraft: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`Proposal Failed: ${data.error || "Unable to send proposal"}`);
        return;
      }

      showToast(`Proposal sent successfully! Available allowance remaining: ${data.remainingAllowance}`);
      setIsProposeModalOpen(false);
      setProposalTitle("");
      setProposalOffer("");
      setProposalNeed("");
      setProposalCommercialTerms("");
      fetchProposalsAndSpaces();
    } catch (err) {
      showToast("Network error submitting proposal");
    }
  };

  // Check Direct Messaging Permissions
  const handleCheckDirectMessage = async (targetProfileId: string, startupName: string) => {
    try {
      const res = await fetch("/api/founders/collaborations/message-check", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ partnerProfileId: targetProfileId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessageCheckModal({
          open: true,
          canMessage: data.canMessage,
          isPremium: data.isPremium,
          reason: data.reason,
          targetName: startupName,
        });
      }
    } catch (err) {
      showToast("Unable to check messaging permissions");
    }
  };

  // Respond to Proposal (Accept, Counter, Reject, Request Info, Meeting)
  const handleRespondProposal = async (
    proposalId: string,
    action: "accept" | "reject" | "counter" | "request_info" | "request_meeting" | "withdraw",
    payload: any = {}
  ) => {
    try {
      const res = await fetch(`/api/founders/collaborations/proposals/${proposalId}/respond`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Action failed");
        return;
      }
      showToast(data.message || `Action ${action} completed`);
      fetchProposalsAndSpaces();
      if (data.spaceId) {
        setSelectedSpaceId(data.spaceId);
        setActiveTab("spaces");
      }
    } catch (err) {
      showToast("Network error executing proposal action");
    }
  };

  // Send Message in Space
  const handleSendSpaceMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !spaceNewMessage.trim()) return;

    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/messages`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text: spaceNewMessage.trim() }),
      });
      if (res.ok) {
        setSpaceNewMessage("");
        fetchSpaceDetails(selectedSpaceId);
      }
    } catch (err) {
      showToast("Error sending message");
    }
  };

  // Add Task in Space
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !newTaskTitle.trim()) return;

    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/tasks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          status: "todo",
          progress: 0,
        }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        fetchSpaceDetails(selectedSpaceId);
        showToast("Task added to workspace");
      }
    } catch (err) {
      showToast("Error adding task");
    }
  };

  // Add Milestone in Space
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !newMilestoneTitle.trim() || !newMilestoneDate) return;

    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/milestones`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: newMilestoneTitle.trim(),
          targetDate: newMilestoneDate,
        }),
      });
      if (res.ok) {
        setNewMilestoneTitle("");
        setNewMilestoneDate("");
        fetchSpaceDetails(selectedSpaceId);
        showToast("Milestone created");
      }
    } catch (err) {
      showToast("Error creating milestone");
    }
  };

  // Schedule Sync Meeting in Space
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !newMeetingTitle.trim()) return;

    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/meetings`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: newMeetingTitle.trim(),
          dateTime: newMeetingDate || new Date().toISOString(),
          agenda: newMeetingAgenda.trim() || "Collaboration Alignment Sync",
        }),
      });
      if (res.ok) {
        setNewMeetingTitle("");
        setNewMeetingDate("");
        setNewMeetingAgenda("");
        fetchSpaceDetails(selectedSpaceId);
        showToast("Sync meeting scheduled successfully");
      }
    } catch (err) {
      showToast("Error scheduling meeting");
    }
  };

  // Submit Referral in Space
  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !spaceDetails || !newReferralCustomer.trim()) return;

    const partnerStartupId =
      spaceDetails.startupAId === "st-dev" ? spaceDetails.startupBId : spaceDetails.startupAId;

    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/referrals`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          receivingStartupId: partnerStartupId,
          customerReference: newReferralCustomer.trim(),
          commissionTerms: newReferralCommission.trim() || "10% Referral Share",
          status: "submitted",
        }),
      });
      if (res.ok) {
        setNewReferralCustomer("");
        setNewReferralCommission("");
        fetchSpaceDetails(selectedSpaceId);
        showToast("Referral logged in partner pipeline");
      }
    } catch (err) {
      showToast("Error submitting referral");
    }
  };

  // Submit Partnership Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !reviewFeedback.trim()) return;

    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/reviews`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          ...reviewScores,
          feedback: reviewFeedback.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Review submission failed");
        return;
      }
      showToast(`Partnership review submitted! Overall score: ${data.review?.overallScore}/5`);
      setReviewFeedback("");
      fetchSpaceDetails(selectedSpaceId);
    } catch (err) {
      showToast("Network error submitting review");
    }
  };

  // Submit Dispute
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !disputeDescription.trim()) return;

    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/disputes`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          category: disputeCategory,
          description: disputeDescription.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Dispute filing failed");
        return;
      }
      showToast("Dispute registered. Balaga platform assistance opened.");
      setDisputeDescription("");
      fetchSpaceDetails(selectedSpaceId);
    } catch (err) {
      showToast("Error filing dispute");
    }
  };

  // Mark Partnership Complete
  const handleCompletePartnership = async () => {
    if (!selectedSpaceId) return;
    try {
      const res = await fetch(`/api/founders/collaborations/spaces/${selectedSpaceId}/complete`, {
        method: "POST",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Partnership successfully completed! +2 bonus weekly proposals granted.");
        fetchSpaceDetails(selectedSpaceId);
        fetchProposalsAndSpaces();
      } else {
        showToast(data.error || "Failed to complete partnership");
      }
    } catch (err) {
      showToast("Network error completing partnership");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 text-emerald-100 px-5 py-3 rounded-xl border border-emerald-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5" />
                Feature 8: Startup Collaboration Network
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Option A: Controlled Outreach Policy
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              B2B Synergies, Integrations & Co-Growth
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
              Discover verified startup partners across India, propose integrations or revenue-share deals, and
              collaborate inside private, dedicated partnership workspaces.
            </p>
          </div>

          {/* Option A Outreach Allowance Card */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 shrink-0 min-w-[280px] shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Controlled Outreach Allowance
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-mono border border-emerald-500/30">
                Option A
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {outreachAllowance ? outreachAllowance.allowanceRemaining : 5}
              </span>
              <span className="text-xs text-slate-400">
                / {outreachAllowance ? outreachAllowance.totalWeeklyLimit : 5} proposals left
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Default 5/week rolling quota prevents spam.{" "}
              <span className="text-emerald-400 font-medium">Earn +2 bonus limit</span> per completed partnership!
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "discover", label: "Discover Startups", icon: Search },
          { id: "spaces", label: "Partnership Spaces", icon: Handshake, badge: mySpaces.length },
          { id: "incoming", label: "Incoming Proposals", icon: Clock, badge: incomingProposals.length },
          { id: "sent", label: "Sent Proposals", icon: Send, badge: sentProposals.length },
          { id: "profile", label: "Our Partner Profile", icon: Building2 },
          { id: "analytics", label: "Collaboration Analytics", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "spaces") setSelectedSpaceId(null);
              }}
              className={`px-4 py-2.5 rounded-t-xl font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "border-emerald-500 text-emerald-400 bg-slate-900/60 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DISCOVER STARTUPS */}
      {activeTab === "discover" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDiscoverStartups()}
                placeholder="Search startups, technologies (Go, Rust), offerings, or needs..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Industries</option>
                <option value="FinTech">FinTech</option>
                <option value="Developer Infrastructure">Dev Infra</option>
                <option value="B2B SaaS">B2B SaaS</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Logistics">Logistics</option>
              </select>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Stages</option>
                <option value="idea">Idea</option>
                <option value="mvp">MVP</option>
                <option value="early_traction">Early Traction</option>
                <option value="growth">Growth</option>
                <option value="scale">Scale</option>
              </select>

              <select
                value={selectedCollabType}
                onChange={(e) => setSelectedCollabType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                {COLLAB_TYPES_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchDiscoverStartups}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
          </div>

          {/* Startups Grid */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : startups.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No partner startups found</h3>
              <p className="text-slate-400 text-sm mt-1">
                Try loosening your filters or search keywords to explore more registered startup builders.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {startups.map((item) => {
                const s = item.startup;
                const p = item.collabProfile;
                return (
                  <div
                    key={s.id}
                    className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Startup Identity */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-white text-base hover:text-emerald-400 transition-colors">
                                {s.name}
                              </h3>
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-xs text-slate-400">
                              {s.industry} • {s.broadLocation} • {s.stage}
                            </p>
                          </div>
                        </div>

                        {/* Synergy match pill */}
                        {item.matchScore > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <Sparkles className="w-3 h-3" />
                            {item.matchScore}% Synergy
                          </span>
                        )}
                      </div>

                      <p className="text-slate-300 text-xs leading-relaxed mb-4">
                        {p.whatWeDo || s.oneLiner}
                      </p>

                      {/* Offers & Needs */}
                      <div className="space-y-2.5 mb-4 text-xs">
                        <div className="bg-slate-950/60 border border-emerald-950/60 rounded-xl p-3">
                          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1">
                            🌱 What They Offer
                          </span>
                          <p className="text-slate-300 line-clamp-2">{p.whatWeOffer}</p>
                        </div>
                        <div className="bg-slate-950/60 border border-indigo-950/60 rounded-xl p-3">
                          <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">
                            🎯 What They Need
                          </span>
                          <p className="text-slate-300 line-clamp-2">{p.whatWeNeed}</p>
                        </div>
                      </div>

                      {/* Preferred Types Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.preferredPartnershipTypes?.map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50"
                          >
                            {t.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {item.averageRating}
                        </span>
                        <span>•</span>
                        <span>{item.completedPartnershipsCount} Completed</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCheckDirectMessage(s.creatorId, s.name)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          Message
                        </button>
                        <button
                          onClick={() => {
                            setTargetStartupForProposal(s);
                            setIsProposeModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Propose
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PARTNERSHIP SPACES */}
      {activeTab === "spaces" && (
        <div className="space-y-6">
          {!selectedSpaceId ? (
            /* Spaces List */
            mySpaces.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Handshake className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white">No active Partnership Spaces yet</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Once a collaboration proposal is accepted by either party, a private joint workspace is
                  automatically provisioned here.
                </p>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" /> Discover Partners
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySpaces.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSpaceId(s.id)}
                    className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition-all shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                          {s.partnershipType}
                        </span>
                        <h3 className="font-bold text-white text-base mt-2 group-hover:text-emerald-400 transition-colors">
                          {s.startupA?.name} × {s.startupB?.name}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{s.objectives}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          s.status === "completed"
                            ? "bg-blue-950 text-blue-400 border border-blue-500/30"
                            : s.status === "disputed"
                            ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 rounded-xl p-3 mb-4">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Tasks Completed</span>
                        <span className="font-bold text-white">
                          {s.completedTasksCount} / {s.tasksCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Target Duration</span>
                        <span className="font-bold text-white">{s.agreedDuration || "6 Months"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Click to open private workspace</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Selected Space Complete Workspace */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Workspace Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <button
                    onClick={() => setSelectedSpaceId(null)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors"
                  >
                    ← Back to All Spaces
                  </button>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">
                      {spaceDetails?.startupA?.name} × {spaceDetails?.startupB?.name} Workspace
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {spaceDetails?.status || "active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">{spaceDetails?.objectives}</p>
                </div>

                <div className="flex items-center gap-2">
                  {spaceDetails?.status !== "completed" && (
                    <button
                      onClick={handleCompletePartnership}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete Partnership (+2 Bonus)
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="px-6 border-b border-slate-800 bg-slate-950/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: "overview", label: "Overview", icon: Layers },
                  { id: "chat", label: "Private Chat", icon: MessageSquare, badge: spaceDetails?.messages?.length },
                  { id: "tasks", label: "Tasks & To-Dos", icon: CheckSquare, badge: spaceDetails?.tasks?.length },
                  { id: "milestones", label: "Milestones", icon: Calendar, badge: spaceDetails?.milestones?.length },
                  { id: "documents", label: "Documents", icon: FileText, badge: spaceDetails?.documents?.length },
                  { id: "meetings", label: "Meetings", icon: Clock, badge: spaceDetails?.meetings?.length },
                  { id: "referrals", label: "Referrals", icon: Users, badge: spaceDetails?.referrals?.length },
                  { id: "commissions", label: "Commissions", icon: Award },
                  { id: "review", label: "Review & Ratings", icon: Star },
                  { id: "dispute", label: "Dispute Desk", icon: AlertTriangle },
                ].map((st) => {
                  const Icon = st.icon;
                  const isActive = spaceSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSpaceSubTab(st.id)}
                      className={`px-3 py-3 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                        isActive
                          ? "border-emerald-500 text-emerald-400 font-bold"
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                      {typeof st.badge === "number" && st.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300">
                          {st.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sub-Tab Content */}
              <div className="p-6">
                {/* 1. OVERVIEW */}
                {spaceSubTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Partnership Type</span>
                        <span className="text-base font-bold text-white capitalize">
                          {spaceDetails?.partnershipType?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Agreed Duration</span>
                        <span className="text-base font-bold text-white">
                          {spaceDetails?.agreedDuration || "6 Months"}
                        </span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 block mb-1">Target End Date</span>
                        <span className="text-base font-bold text-white">
                          {spaceDetails?.targetCompletionDate
                            ? new Date(spaceDetails.targetCompletionDate).toLocaleDateString()
                            : "Ongoing"}
                        </span>
                      </div>
                    </div>

                    {/* Activity Logs */}
                    <div>
                      <h4 className="text-sm font-bold text-white mb-3">Partnership Activity History</h4>
                      <div className="space-y-2">
                        {spaceDetails?.activityLogs?.map((log: any) => (
                          <div
                            key={log.id}
                            className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs flex items-center justify-between"
                          >
                            <span className="text-slate-300">{log.details}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CHAT */}
                {spaceSubTab === "chat" && (
                  <div className="flex flex-col h-[480px]">
                    <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800 mb-3">
                      {spaceDetails?.messages?.map((msg: PartnershipMessage) => (
                        <div key={msg.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl max-w-xl">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-emerald-400">{msg.senderName}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendSpaceMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={spaceNewMessage}
                        onChange={(e) => setSpaceNewMessage(e.target.value)}
                        placeholder="Write a message in private partnership space..."
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. TASKS */}
                {spaceSubTab === "tasks" && (
                  <div className="space-y-5">
                    <form onSubmit={handleCreateTask} className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a new deliverable or action item..."
                        className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Task
                      </button>
                    </form>

                    <div className="space-y-2">
                      {spaceDetails?.tasks?.map((t: PartnershipTask) => (
                        <div
                          key={t.id}
                          className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                t.status === "completed" ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            <span
                              className={`font-medium ${
                                t.status === "completed" ? "line-through text-slate-500" : "text-white"
                              }`}
                            >
                              {t.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. MILESTONES */}
                {spaceSubTab === "milestones" && (
                  <div className="space-y-5">
                    <form onSubmit={handleCreateMilestone} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="Milestone title (e.g. Staging integration live)..."
                        className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="date"
                        value={newMilestoneDate}
                        onChange={(e) => setNewMilestoneDate(e.target.value)}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Milestone
                      </button>
                    </form>

                    <div className="space-y-2.5">
                      {spaceDetails?.milestones?.map((m: PartnershipMilestone) => (
                        <div
                          key={m.id}
                          className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <h4 className="font-bold text-white text-sm">{m.title}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{m.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-emerald-400 font-mono block">
                              Target: {new Date(m.targetDate).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize">
                              {m.isCompleted ? "Completed" : "In Progress"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. DOCUMENTS */}
                {spaceSubTab === "documents" && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white text-sm">Secure Partnership Documents</h4>
                        <p className="text-slate-400 mt-0.5">Confidential NDAs, integration guides, and partnership agreements.</p>
                      </div>
                      <span className="text-emerald-400 font-mono text-xs">Private Vault</span>
                    </div>

                    <div className="space-y-2.5">
                      {spaceDetails?.documents && spaceDetails.documents.length > 0 ? (
                        spaceDetails.documents.map((doc: PartnershipDocument) => (
                          <div
                            key={doc.id}
                            className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-indigo-400" />
                              <div>
                                <span className="font-bold text-white text-sm block">{doc.name}</span>
                                <span className="text-slate-400 text-[11px]">
                                  {doc.fileSize} • {doc.accessLevel}
                                </span>
                              </div>
                            </div>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                            >
                              Download
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500 text-xs">No documents uploaded yet.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. MEETINGS */}
                {spaceSubTab === "meetings" && (
                  <div className="space-y-5">
                    <form onSubmit={handleScheduleMeeting} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-white">Schedule Partnership Sync</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newMeetingTitle}
                          onChange={(e) => setNewMeetingTitle(e.target.value)}
                          placeholder="Meeting title (e.g. Technical API Alignment)..."
                          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="datetime-local"
                          value={newMeetingDate}
                          onChange={(e) => setNewMeetingDate(e.target.value)}
                          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMeetingAgenda}
                          onChange={(e) => setNewMeetingAgenda(e.target.value)}
                          placeholder="Meeting agenda & discussion topics..."
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" /> Schedule Sync
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2.5">
                      {spaceDetails?.meetings && spaceDetails.meetings.length > 0 ? (
                        spaceDetails.meetings.map((meet: PartnershipMeeting) => (
                          <div
                            key={meet.id}
                            className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                <h4 className="font-bold text-white text-sm">{meet.title}</h4>
                              </div>
                              <p className="text-slate-400 text-xs mt-1">{meet.agenda}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-emerald-400 font-mono block">
                                {new Date(meet.dateTime).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-[10px] text-slate-500">{meet.meetingUrlOrLocation}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500 text-xs">No upcoming sync meetings scheduled.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. REFERRALS */}
                {spaceSubTab === "referrals" && (
                  <div className="space-y-5">
                    <form onSubmit={handleCreateReferral} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newReferralCustomer}
                        onChange={(e) => setNewReferralCustomer(e.target.value)}
                        placeholder="Customer Reference (e.g. Fintech Series A Startup #392)..."
                        className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={newReferralCommission}
                        onChange={(e) => setNewReferralCommission(e.target.value)}
                        placeholder="Commission (e.g. 10% Deal Size)"
                        className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shrink-0"
                      >
                        Log Referral
                      </button>
                    </form>

                    <div className="space-y-2.5">
                      {spaceDetails?.referrals?.map((ref: PartnershipReferral) => (
                        <div
                          key={ref.id}
                          className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white text-sm">{ref.customerReference}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Terms: {ref.commissionTerms || "Standard terms"}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                            {ref.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. COMMISSIONS (WITH LEGAL DISCLAIMER) */}
                {spaceSubTab === "commissions" && (
                  <div className="space-y-4">
                    <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl text-xs text-amber-200 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Platform Regulatory Disclaimer</span>
                        Balaga provides digital record-keeping and pipeline tracking for startup partnerships. Balaga
                        does not hold funds, create wallets, or offer escrow services. All commission, fee, and
                        revenue transfers occur directly between the respective companies.
                      </div>
                    </div>

                    <div className="space-y-2">
                      {spaceDetails?.commissions?.map((comm: PartnershipCommission) => (
                        <div
                          key={comm.id}
                          className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white text-sm">{comm.rateOrAmount}</span>
                            <span className="text-slate-400 block text-[11px]">{comm.calculationBasis}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {comm.reportedPaymentStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. REVIEWS (6 DIMENSIONS) */}
                {spaceSubTab === "review" && (
                  <div className="max-w-2xl space-y-5">
                    <h4 className="text-sm font-bold text-white">Rate & Review Partner Startup</h4>
                    <p className="text-xs text-slate-400">
                      Evaluated on a 1-5 scale across 6 professional dimensions. Limit 1 review per participating
                      startup with Right of Reply for the reviewed party.
                    </p>

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {[
                          { key: "communication", label: "Communication" },
                          { key: "professionalism", label: "Professionalism" },
                          { key: "reliability", label: "Reliability" },
                          { key: "delivery", label: "Execution & Delivery" },
                          { key: "transparency", label: "Transparency" },
                          { key: "overallExperience", label: "Overall Experience" },
                        ].map((dim) => (
                          <div key={dim.key} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                            <span className="text-slate-300 block mb-1">{dim.label}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() =>
                                    setReviewScores((prev) => ({ ...prev, [dim.key]: val }))
                                  }
                                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                                    (reviewScores as any)[dim.key] >= val
                                      ? "bg-amber-500 text-slate-950"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <textarea
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        placeholder="Detailed constructive feedback regarding the collaboration..."
                        className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                      >
                        Submit Verified Review
                      </button>
                    </form>
                  </div>
                )}

                {/* 8. DISPUTES */}
                {spaceSubTab === "dispute" && (
                  <div className="max-w-2xl space-y-4">
                    <h4 className="text-sm font-bold text-white">Platform Mediation & Dispute Desk</h4>
                    <p className="text-xs text-slate-400">
                      File a collaboration issue if terms were violated or communication broke down.
                    </p>

                    <form onSubmit={handleSubmitDispute} className="space-y-3">
                      <select
                        value={disputeCategory}
                        onChange={(e) => setDisputeCategory(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="commercial_terms">Commercial Terms Discrepancy</option>
                        <option value="non_delivery">Non-Delivery of Agreed Milestones</option>
                        <option value="confidentiality">Confidentiality / NDA Concern</option>
                        <option value="communication_breakdown">Communication Breakdown</option>
                        <option value="other">Other Dispute Reason</option>
                      </select>

                      <textarea
                        value={disputeDescription}
                        onChange={(e) => setDisputeDescription(e.target.value)}
                        placeholder="Detailed explanation of the issue..."
                        className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                      />

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
                      >
                        File Formal Dispute
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INCOMING PROPOSALS */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingProposals.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No incoming proposals</h3>
              <p className="text-slate-400 text-sm mt-1">
                When other founders propose partnerships to your startup, they will appear here with full terms for
                your review.
              </p>
            </div>
          ) : (
            incomingProposals.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {p.collabType}
                    </span>
                    <span className="text-xs font-bold text-white">{p.initiatorStartup?.name}</span>
                    <span className="text-xs text-slate-500">• {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{p.title}</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs mt-3 bg-slate-950/60 rounded-xl p-3 max-w-2xl">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-semibold block">They Offer:</span>
                      <p className="text-slate-300">{p.whatWeOffer}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-400 font-semibold block">They Need:</span>
                      <p className="text-slate-300">{p.whatWeNeed}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  {p.status === "pending" || p.status === "countered" ? (
                    <>
                      <button
                        onClick={() => handleRespondProposal(p.id, "accept")}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow"
                      >
                        Accept & Open Workspace
                      </button>
                      <button
                        onClick={() =>
                          handleRespondProposal(p.id, "counter", {
                            counterTerms: {
                              commercialTerms: "15% Mutual Rev Share",
                              notes: "Suggested counter terms",
                            },
                          })
                        }
                        className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                      >
                        Counter
                      </button>
                      <button
                        onClick={() => handleRespondProposal(p.id, "reject")}
                        className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-xl text-xs font-semibold"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 capitalize">
                      {p.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: SENT PROPOSALS */}
      {activeTab === "sent" && (
        <div className="space-y-4">
          {sentProposals.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No sent proposals yet</h3>
              <p className="text-slate-400 text-sm mt-1">
                Explore the discover directory to initiate collaboration proposals with other startups.
              </p>
            </div>
          ) : (
            sentProposals.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {p.collabType}
                    </span>
                    <span className="font-bold text-white">To: {p.receiverStartup?.name}</span>
                  </div>
                  <h4 className="font-semibold text-slate-200 text-sm">{p.title}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      p.status === "accepted"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : p.status === "rejected"
                        ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {p.status}
                  </span>

                  {p.status === "pending" && (
                    <button
                      onClick={() => handleRespondProposal(p.id, "withdraw")}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px]"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: PARTNER PROFILE EDITOR */}
      {activeTab === "profile" && myCollabProfile && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-3xl space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white">Startup Collaboration & Outreach Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines what other founders see when exploring your startup in the collaboration network.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">What Your Startup Does</label>
              <textarea
                value={myCollabProfile.whatWeDo}
                onChange={(e) =>
                  setMyCollabProfile({ ...myCollabProfile, whatWeDo: e.target.value })
                }
                className="w-full h-20 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">What You Offer Partners</label>
                <textarea
                  value={myCollabProfile.whatWeOffer}
                  onChange={(e) =>
                    setMyCollabProfile({ ...myCollabProfile, whatWeOffer: e.target.value })
                  }
                  className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">What You Need From Partners</label>
                <textarea
                  value={myCollabProfile.whatWeNeed}
                  onChange={(e) =>
                    setMyCollabProfile({ ...myCollabProfile, whatWeNeed: e.target.value })
                  }
                  className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                const res = await fetch("/api/founders/collaborations/profile/st-dev", {
                  method: "PUT",
                  headers: getHeaders(),
                  body: JSON.stringify(myCollabProfile),
                });
                if (res.ok) {
                  showToast("Collaboration profile updated successfully!");
                }
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* PROPOSAL MODAL (OPTION A CONTROLLED OUTREACH AWARE) */}
      {isProposeModalOpen && targetStartupForProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Option A Outreach Proposal
                </span>
                <h3 className="text-base font-bold text-white">
                  Propose Partnership to {targetStartupForProposal.name}
                </h3>
              </div>
              <button
                onClick={() => setIsProposeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="p-5 space-y-4 text-xs">
              {/* Option A quota check banner */}
              <div className="bg-slate-950 border border-indigo-500/30 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-300">
                  Weekly Outreach Allowance:{" "}
                  <strong className="text-emerald-400">
                    {outreachAllowance ? outreachAllowance.allowanceRemaining : 5} remaining
                  </strong>
                </span>
                <span className="text-[10px] text-slate-500">Resets weekly</span>
              </div>

              {/* Format selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProposalFormat("intro")}
                  className={`flex-1 py-2 rounded-lg font-semibold text-xs border ${
                    proposalFormat === "intro"
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Simple Introduction
                </button>
                <button
                  type="button"
                  onClick={() => setProposalFormat("detailed")}
                  className={`flex-1 py-2 rounded-lg font-semibold text-xs border ${
                    proposalFormat === "detailed"
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Detailed Proposal
                </button>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="e.g. Telemetry Integration & Bi-directional Referral"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Partnership Type</label>
                <select
                  value={proposalCollabType}
                  onChange={(e) => setProposalCollabType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  {COLLAB_TYPES_LIST.filter((t) => t.id !== "all").map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">What Your Startup Offers</label>
                  <textarea
                    value={proposalOffer}
                    onChange={(e) => setProposalOffer(e.target.value)}
                    placeholder="Describe exact assets, tech, reach or services you provide..."
                    className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">What You Need From Them</label>
                  <textarea
                    value={proposalNeed}
                    onChange={(e) => setProposalNeed(e.target.value)}
                    placeholder="Describe what resources, APIs or channels you expect..."
                    className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {proposalFormat === "detailed" && (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Commercial / Financial Terms</label>
                  <input
                    type="text"
                    value={proposalCommercialTerms}
                    onChange={(e) => setProposalCommercialTerms(e.target.value)}
                    placeholder="e.g. Zero-fee reciprocal tech integration + 10% co-sell rev-share"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Proposed Collaboration Duration</label>
                <select
                  value={proposalDuration}
                  onChange={(e) => setProposalDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="1-3 Months">1-3 Months (Pilot)</option>
                  <option value="3-6 Months">3-6 Months (Standard)</option>
                  <option value="6-12 Months">6-12 Months (Annual Partnership)</option>
                  <option value="Ongoing">Ongoing / Long-term Strategic</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGING PERMISSION MODAL */}
      {messageCheckModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                messageCheckModal.canMessage ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"
              }`}
            >
              <MessageSquare className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Direct Message with {messageCheckModal.targetName}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{messageCheckModal.reason}</p>
            </div>

            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => setMessageCheckModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {messageCheckModal.canMessage ? (
                <button
                  onClick={() => {
                    setMessageCheckModal(null);
                    showToast("Opening direct chat in Founders Inbox...");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Open Inbox Chat
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMessageCheckModal(null);
                    showToast("Redirecting to Premium subscription options...");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
