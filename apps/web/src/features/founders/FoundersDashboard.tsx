import React, { useState, useEffect } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Eye,
  Plus,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Crown,
  Calendar,
  AlertCircle,
  ThumbsUp,
  Bookmark,
  FileText,
  X,
  ExternalLink,
  UserCheck,
  Rocket,
  Handshake,
  Check,
  GitFork,
  Laptop,
  Trophy,
  Zap,
  Presentation,
  Globe,
  Award,
} from "lucide-react";
import {
  FounderPublicProfileModal,
  PublicFounderProfile,
} from "./FounderPublicProfileModal";
import { ForkableBlueprintsModal } from "./ForkableBlueprintsModal";
import { CodeCastCanvasModal } from "./CodeCastCanvasModal";
import { HackathonSquadModal } from "./HackathonSquadModal";
import { SpeedMentorshipModal } from "./SpeedMentorshipModal";
import { TechTalkMasterclassModal } from "./TechTalkMasterclassModal";
import { CustomSubdomainModal } from "./CustomSubdomainModal";
import { HonestDomainPulseModal } from "./HonestDomainPulseModal";
import { ProofOfTractionModal } from "./ProofOfTractionModal";
import { VerifiableKudosModal } from "./VerifiableKudosModal";

interface FoundersDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const FoundersDashboard: React.FC<FoundersDashboardProps> = ({ onNavigateTab }) => {
  // Loading & Feedback States
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Core Data States
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    connections: 28,
    profileViews: 142,
    activeOpportunities: 4,
    submittedApplications: 2,
    activePartnerships: 3,
    productsLaunched: 1,
    profileMatch: 92,
  });
  const [startups, setStartups] = useState<any[]>([]);
  const [attentionItems, setAttentionItems] = useState<any[]>([]);
  const [recommendedPeople, setRecommendedPeople] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<{
    incoming: any[];
    sent: any[];
    accepted: any[];
    countered: any[];
  }>({
    incoming: [],
    sent: [],
    accepted: [],
    countered: [],
  });
  const [launchpad, setLaunchpad] = useState<{
    myProducts: any[];
    trending: any[];
  }>({
    myProducts: [],
    trending: [],
  });
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);

  // UI Interactive Tab States
  const [activeOppsTab, setActiveOppsTab] = useState<"opportunities" | "jobs">("opportunities");
  const [activeCollabsTab, setActiveCollabsTab] = useState<"incoming" | "accepted" | "sent" | "countered">("incoming");
  const [activeStartupIdx, setActiveStartupIdx] = useState(0);

  // Modals States
  const [selectedFounderProfile, setSelectedFounderProfile] = useState<PublicFounderProfile | null>(null);
  const [isCreateStartupOpen, setIsCreateStartupOpen] = useState(false);
  const [isPostOppOpen, setIsPostOppOpen] = useState(false);
  const [isSubmitProductOpen, setIsSubmitProductOpen] = useState(false);
  const [isBlueprintsModalOpen, setIsBlueprintsModalOpen] = useState(false);
  const [isCodeCastModalOpen, setIsCodeCastModalOpen] = useState(false);
  const [isHackathonModalOpen, setIsHackathonModalOpen] = useState(false);
  const [isSpeedMentorshipOpen, setIsSpeedMentorshipOpen] = useState(false);
  const [isTechTalkModalOpen, setIsTechTalkModalOpen] = useState(false);
  const [isSubdomainModalOpen, setIsSubdomainModalOpen] = useState(false);
  const [isDomainPulseModalOpen, setIsDomainPulseModalOpen] = useState(false);
  const [isProofOfTractionModalOpen, setIsProofOfTractionModalOpen] = useState(false);
  const [isKudosModalOpen, setIsKudosModalOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [selectedProposalToCounter, setSelectedProposalToCounter] = useState<any | null>(null);
  const [counterCommercialTerms, setCounterCommercialTerms] = useState("20% Mutual Referral Share + Co-branding");
  const [counterRevisedOffer, setCounterRevisedOffer] = useState("");
  const [counterRevisedNeed, setCounterRevisedNeed] = useState("");

  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [selectedTargetFounder, setSelectedTargetFounder] = useState<any | null>(null);
  const [introRoleTitle, setIntroRoleTitle] = useState("Technical Co-Founder (FinTech / High-Throughput Rails)");
  const [introNote, setIntroNote] = useState("Hi! Loved your engineering background. Building next-gen Indian settlement rails and looking for a technical co-founder. Would love to connect!");
  const [introEquity, setIntroEquity] = useState("25-30% Equity + Co-founder Title");

  const [selectedStartupDetail, setSelectedStartupDetail] = useState<any | null>(null);
  const [selectedStartupManage, setSelectedStartupManage] = useState<any | null>(null);
  const [selectedOppToApply, setSelectedOppToApply] = useState<any | null>(null);
  const [applyPitchNote, setApplyPitchNote] = useState("");
  const [applyPortfolioUrl, setApplyPortfolioUrl] = useState("https://github.com/aarav-infra");

  // Form States for Modals
  const [newStartupName, setNewStartupName] = useState("");
  const [newStartupOneLiner, setNewStartupOneLiner] = useState("");
  const [newStartupIndustry, setNewStartupIndustry] = useState("B2B SaaS / Infra");
  const [newStartupStage, setNewStartupStage] = useState("early_traction");
  const [newStartupWebsite, setNewStartupWebsite] = useState("https://");

  const [newOppTitle, setNewOppTitle] = useState("");
  const [newOppType, setNewOppType] = useState<any>("developer");
  const [newOppCompensation, setNewOppCompensation] = useState("paid_and_equity");
  const [newOppWorkMode, setNewOppWorkMode] = useState("hybrid");
  const [newOppSkills, setNewOppSkills] = useState("Go, Distributed Systems, PostgreSQL");
  const [newOppDesc, setNewOppDesc] = useState("");

  const [newProdName, setNewProdName] = useState("");
  const [newProdTagline, setNewProdTagline] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Developer Tools");
  const [newProdWebsite, setNewProdWebsite] = useState("https://");
  const [newProdDesc, setNewProdDesc] = useState("");

  // Feed comment inputs
  const [feedCommentInputs, setFeedCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Local-time Greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Toast feedback helper
  const showToast = (success?: string, error?: string) => {
    if (success) {
      setSuccessToast(success);
      setTimeout(() => setSuccessToast(null), 3500);
    }
    if (error) {
      setErrorToast(error);
      setTimeout(() => setErrorToast(null), 3500);
    }
  };

  // 1. Fetch Complete Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/founders/dashboard", {
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });
      if (!res.ok) throw new Error("Failed to load founders dashboard");
      const data = await res.json();

      if (data.profile) setProfile(data.profile);
      if (data.metrics) setMetrics(data.metrics);
      if (data.startups) setStartups(data.startups);
      if (data.attentionItems) setAttentionItems(data.attentionItems);
      if (data.recommendedPeople) setRecommendedPeople(data.recommendedPeople);
      if (data.opportunitiesAndJobs) {
        setOpportunities(data.opportunitiesAndJobs.opportunities || []);
        setJobs(data.opportunitiesAndJobs.jobs || []);
      }
      if (data.collaborations) setCollaborations(data.collaborations);
      if (data.launchpad) setLaunchpad(data.launchpad);
      if (data.feed) setFeedPosts(data.feed);
      if (data.upcomingActivities) setUpcomingActivities(data.upcomingActivities);
    } catch (err: any) {
      console.warn("Using offline fallback data for founders dashboard:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. Action Handlers
  // Act on Attention Item
  const handleAttentionAction = async (itemId: string, action: string) => {
    try {
      setActionLoading(`att-${itemId}-${action}`);
      const res = await fetch(`/api/founders/attention/${itemId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (!res.ok) throw new Error("Failed to update item");
      const data = await res.json();

      setAttentionItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: "completed", actionResult: data.item.actionResult } : item))
      );
      showToast(data.item.actionResult || "Action completed successfully");
      // Refresh metrics
      fetchDashboardData();
    } catch (err: any) {
      showToast(undefined, err.message || "Failed to process action");
    } finally {
      setActionLoading(null);
    }
  };

  // Accept Collaboration Proposal
  const handleAcceptProposal = async (proposalId: string) => {
    try {
      setActionLoading(`accept-${proposalId}`);
      const res = await fetch(`/api/founders/collaborations/proposals/${proposalId}/accept`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (!res.ok) throw new Error("Failed to accept proposal");
      const data = await res.json();

      setCollaborations((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((p) => p.id !== proposalId),
        accepted: [data.proposal, ...prev.accepted],
      }));
      showToast("Partnership Accepted! Workspace created. Use Message Partner to coordinate.");
      fetchDashboardData();
    } catch (err: any) {
      showToast(undefined, err.message || "Error accepting proposal");
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Counter Proposal
  const handleCounterProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposalToCounter) return;

    try {
      setActionLoading("counter");
      const res = await fetch(`/api/founders/collaborations/proposals/${selectedProposalToCounter.id}/counter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          commercialTerms: counterCommercialTerms,
          revisedOffer: counterRevisedOffer,
          revisedNeed: counterRevisedNeed,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit counter-proposal");
      const data = await res.json();

      setCollaborations((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((p) => p.id !== selectedProposalToCounter.id),
        countered: [data.proposal, ...prev.countered],
      }));
      setIsCounterModalOpen(false);
      showToast("Counter-proposal sent to partner startup.");
      fetchDashboardData();
    } catch (err: any) {
      showToast(undefined, err.message || "Error submitting counter-proposal");
    } finally {
      setActionLoading(null);
    }
  };

  // Send Introduction Request to Talent
  const handleSendIntroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetFounder) return;

    try {
      setActionLoading("intro");
      const res = await fetch(`/api/founders/talent/${selectedTargetFounder.id}/intro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          roleTitle: introRoleTitle,
          note: introNote,
          equityOrComp: introEquity,
        }),
      });

      if (!res.ok) throw new Error("Failed to send introduction request");
      setIsIntroModalOpen(false);
      showToast(`Introduction request sent to ${selectedTargetFounder.displayName}!`);
      setRecommendedPeople((prev) =>
        prev.map((p) => (p.id === selectedTargetFounder.id ? { ...p, introStatus: "pending" } : p))
      );
    } catch (err: any) {
      showToast(undefined, err.message || "Failed to send intro request");
    } finally {
      setActionLoading(null);
    }
  };

  // Upvote Product in Launchpad
  const handleToggleUpvote = async (productId: string) => {
    try {
      const res = await fetch(`/api/founders/launchpad/products/${productId}/upvote`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (!res.ok) throw new Error("Failed to upvote product");
      const data = await res.json();

      setLaunchpad((prev) => ({
        myProducts: prev.myProducts.map((p) =>
          p.id === productId ? { ...p, upvotesCount: data.upvotesCount, hasUpvoted: data.hasUpvoted } : p
        ),
        trending: prev.trending.map((p) =>
          p.id === productId ? { ...p, upvotesCount: data.upvotesCount, hasUpvoted: data.hasUpvoted } : p
        ),
      }));
      showToast(data.hasUpvoted ? "Product upvoted!" : "Upvote removed");
    } catch (err: any) {
      showToast(undefined, err.message);
    }
  };

  // Submit New Product
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    try {
      setActionLoading("create-product");
      const res = await fetch("/api/founders/launchpad/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          name: newProdName,
          tagline: newProdTagline || "Developer telemetry & event mesh toolkit",
          category: newProdCategory,
          websiteUrl: newProdWebsite,
          description: newProdDesc || "High-throughput cloud architecture tool for Indian startups.",
          logoUrl: "🚀",
        }),
      });

      if (!res.ok) throw new Error("Failed to launch product");
      const data = await res.json();

      setLaunchpad((prev) => ({
        ...prev,
        myProducts: [data.product, ...prev.myProducts],
      }));
      setIsSubmitProductOpen(false);
      setNewProdName("");
      setNewProdTagline("");
      setNewProdDesc("");
      showToast("Product launched on Balaga Launchpad!");
      fetchDashboardData();
    } catch (err: any) {
      showToast(undefined, err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Create Startup
  const handleCreateStartupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartupName.trim()) return;

    try {
      setActionLoading("create-startup");
      const res = await fetch("/api/founders/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          name: newStartupName,
          oneLiner: newStartupOneLiner,
          industry: newStartupIndustry,
          stage: newStartupStage,
          websiteUrl: newStartupWebsite,
        }),
      });

      if (!res.ok) throw new Error("Failed to create startup");
      const data = await res.json();

      setStartups((prev) => [data.startup, ...prev]);
      setIsCreateStartupOpen(false);
      setNewStartupName("");
      setNewStartupOneLiner("");
      showToast("Startup created and verified in your portfolio!");
      fetchDashboardData();
    } catch (err: any) {
      showToast(undefined, err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Post Opportunity
  const handlePostOppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppTitle.trim()) return;

    try {
      setActionLoading("post-opp");
      const res = await fetch("/api/founders/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          title: newOppTitle,
          type: newOppType,
          compensation: newOppCompensation,
          workMode: newOppWorkMode,
          requiredSkills: newOppSkills.split(",").map((s) => s.trim()),
          description: newOppDesc,
          startupId: startups[0]?.id || "st-dev",
        }),
      });

      if (!res.ok) throw new Error("Failed to post opportunity");
      const data = await res.json();

      if (newOppType === "co_founder" || newOppType === "contributor") {
        setOpportunities((prev) => [data.opportunity, ...prev]);
      } else {
        setJobs((prev) => [data.opportunity, ...prev]);
      }

      setIsPostOppOpen(false);
      setNewOppTitle("");
      setNewOppDesc("");
      showToast("Opportunity posted successfully!");
      fetchDashboardData();
    } catch (err: any) {
      showToast(undefined, err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Like on Founder Feed Post
  const handleToggleFeedLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/founders/feed/${postId}/like`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });
      if (!res.ok) throw new Error("Failed to like post");
      const data = await res.json();

      setFeedPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, hasLiked: data.post.hasLiked, likesCount: data.post.likesCount } : p))
      );
    } catch (err: any) {
      showToast(undefined, err.message);
    }
  };

  // Toggle Save on Founder Feed Post
  const handleToggleFeedSave = async (postId: string) => {
    try {
      const res = await fetch(`/api/founders/feed/${postId}/save`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });
      if (!res.ok) throw new Error("Failed to save post");
      const data = await res.json();

      setFeedPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, hasSaved: data.post.hasSaved } : p))
      );
      showToast(data.post.hasSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
    } catch (err: any) {
      showToast(undefined, err.message);
    }
  };

  // Add Comment to Feed Post
  const handleAddFeedComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const comment = feedCommentInputs[postId];
    if (!comment || !comment.trim()) return;

    try {
      const res = await fetch(`/api/founders/feed/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({ content: comment.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const data = await res.json();

      setFeedPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: data.commentsCount } : p))
      );
      setFeedCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      showToast("Comment posted!");
    } catch (err: any) {
      showToast(undefined, err.message);
    }
  };

  // Submit Job Application
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppToApply) return;
    setSelectedOppToApply(null);
    setApplyPitchNote("");
    showToast(`Application submitted for ${selectedOppToApply.title}!`);
    setMetrics((prev) => ({ ...prev, submittedApplications: prev.submittedApplications + 1 }));
  };

  // Open Public Profile Modal for any clicked founder
  const handleOpenFounderProfile = (f: any) => {
    setSelectedFounderProfile({
      id: f.id,
      displayName: f.displayName,
      username: f.username || "founder",
      headline: f.headline || "Tech Founder & Builder",
      location: f.broadLocation || "Bengaluru, Karnataka",
      avatarUrl: f.avatarUrl || undefined,
      about: f.bio || "Experienced technical founder building high-impact technology platforms for India and global markets.",
      connectionsCount: "420+",
      followersCount: "1.2k",
      experience: [
        {
          id: "exp-1",
          role: f.roles?.[0] || "Founder & CTO",
          company: startups[0]?.name || "NovaTech Systems",
          duration: "2023 - Present · 3 yrs",
          location: "Bengaluru, Karnataka",
          description: "Leading system architecture, distributed services, and platform engineering.",
        },
      ],
      skills: (f.skills || ["Go", "TypeScript", "System Architecture", "PostgreSQL"]).map((s: string) => ({
        name: s,
        endorsementsCount: 14,
      })),
    });
  };

  // Open Current Founder's Own Profile
  const handleOpenMyProfile = () => {
    if (profile) {
      handleOpenFounderProfile(profile);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse p-4">
        <div className="h-40 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-slate-900/40 rounded-xl border border-slate-800/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-slate-900/50 rounded-2xl border border-slate-800" />
            <div className="h-64 bg-slate-900/50 rounded-2xl border border-slate-800" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-72 bg-slate-900/50 rounded-2xl border border-slate-800" />
            <div className="h-64 bg-slate-900/50 rounded-2xl border border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none pb-12">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-rose-500/50 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* ========================================================
          1. WELCOME HEADER (Founders Identity Only)
      ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Left: Avatar + Title + Affiliation + Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleOpenMyProfile}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-2xl shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>👨‍💻</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 rounded-lg border-2 border-slate-900 flex items-center justify-center text-white" title="Verified Founder Profile">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {getGreeting()},
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">Startup Ecosystem Command Center</span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {profile?.displayName || "Aarav Sharma"}
                </h1>
                <span className="text-xs text-slate-400 font-mono">@{profile?.username || "aarav_builder"}</span>
                {profile?.badge && (
                  <Badge type="verified_project" />
                )}
                {profile?.isPremium && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 text-amber-400" /> Premium Founder
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {profile?.headline || "Full-Stack Architect & AI Product Founder"}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profile?.currentAffiliation || "Founder & CTO at NovaTech Systems"}</span>
              </div>
            </div>
          </div>

          {/* Right: Profile Strength & Quick Actions */}
          <div className="flex flex-col items-start sm:items-end gap-3 w-full md:w-auto">
            {/* Profile Completion Bar */}
            <div className="w-full sm:w-56 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Profile Strength</span>
                <span className="text-emerald-400 font-bold">{profile?.profileCompletion || 92}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile?.profileCompletion || 92}%` }}
                />
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenMyProfile}
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                View Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBlueprintsModalOpen(true)}
                icon={<GitFork className="w-3.5 h-3.5 text-emerald-400" />}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                Fork Blueprints ⚡
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCodeCastModalOpen(true)}
                icon={<Laptop className="w-3.5 h-3.5 text-cyan-400" />}
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
              >
                Code Cast 🖥️
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateStartupOpen(true)}
                icon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
              >
                Create Startup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPostOppOpen(true)}
                icon={<Briefcase className="w-3.5 h-3.5" />}
              >
                Post Opportunity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          NEW FOUNDERS INNOVATIONS SHOWCASE ROW
      ======================================================== */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              New Founders Innovations (Live)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Next-generation tools for Indian founders: blueprints, code cast, hackathon squads, 2-min mentorship, tech talks sync, custom subdomains, domain pulse, and traction launches.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsBlueprintsModalOpen(true)}
            icon={<GitFork className="w-3.5 h-3.5 text-emerald-400" />}
            className="bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-slate-800 text-xs"
          >
            Blueprints ⚡
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCodeCastModalOpen(true)}
            icon={<Laptop className="w-3.5 h-3.5 text-cyan-400" />}
            className="bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 text-xs"
          >
            Code Cast 🖥️
          </Button>
          <Button
            size="sm"
            onClick={() => setIsHackathonModalOpen(true)}
            icon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
            className="bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 text-xs"
          >
            Squads 🏆
          </Button>
          <Button
            size="sm"
            onClick={() => setIsSpeedMentorshipOpen(true)}
            icon={<Zap className="w-3.5 h-3.5 text-yellow-400" />}
            className="bg-slate-900 border border-yellow-500/40 text-yellow-300 hover:bg-slate-800 text-xs"
          >
            2-Min Sparks ⚡
          </Button>
          <Button
            size="sm"
            onClick={() => setIsTechTalkModalOpen(true)}
            icon={<Presentation className="w-3.5 h-3.5 text-purple-400" />}
            className="bg-slate-900 border border-purple-500/40 text-purple-300 hover:bg-slate-800 text-xs"
          >
            Tech Talks 📽️
          </Button>
          <Button
            size="sm"
            onClick={() => setIsSubdomainModalOpen(true)}
            icon={<Globe className="w-3.5 h-3.5 text-orange-400" />}
            className="bg-slate-900 border border-orange-500/40 text-orange-300 hover:bg-slate-800 text-xs"
          >
            Subdomains 🌐
          </Button>
          <Button
            size="sm"
            onClick={() => setIsDomainPulseModalOpen(true)}
            icon={<Building2 className="w-3.5 h-3.5 text-rose-400" />}
            className="bg-slate-900 border border-rose-500/40 text-rose-300 hover:bg-slate-800 text-xs"
          >
            Domain Pulse 🏢
          </Button>
          <Button
            size="sm"
            onClick={() => setIsProofOfTractionModalOpen(true)}
            icon={<Rocket className="w-3.5 h-3.5 text-cyan-400" />}
            className="bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 text-xs"
          >
            Traction Launches 🚀
          </Button>
          <Button
            size="sm"
            onClick={() => setIsKudosModalOpen(true)}
            icon={<Award className="w-3.5 h-3.5 text-amber-400" />}
            className="bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 text-xs"
          >
            Kudos Proof 🎖️
          </Button>
        </div>
      </div>

      {/* ========================================================
          2. QUICK STATISTICS (6 Interactive Real-Data Cards)
      ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Connections",
            value: metrics.connections,
            subtext: "+4 this month",
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "hover:border-emerald-500/40",
            onClick: () => onNavigateTab?.("network"),
          },
          {
            label: "Profile Views",
            value: metrics.profileViews,
            subtext: "+18% this week",
            icon: Eye,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "hover:border-blue-500/40",
            onClick: handleOpenMyProfile,
          },
          {
            label: "Active Openings",
            value: metrics.activeOpportunities,
            subtext: "Hiring for team",
            icon: Briefcase,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "hover:border-amber-500/40",
            onClick: () => setActiveOppsTab("opportunities"),
          },
          {
            label: "Applications",
            value: metrics.submittedApplications,
            subtext: "2 under review",
            icon: FileText,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "hover:border-violet-500/40",
            onClick: () => setActiveOppsTab("jobs"),
          },
          {
            label: "Active Collabs",
            value: metrics.activePartnerships,
            subtext: "Spaces synced",
            icon: Handshake,
            color: "text-teal-400",
            bg: "bg-teal-500/10",
            border: "hover:border-teal-500/40",
            onClick: () => setActiveCollabsTab("accepted"),
          },
          {
            label: "Products Launched",
            value: metrics.productsLaunched,
            subtext: "On Launchpad",
            icon: Rocket,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "hover:border-rose-500/40",
            onClick: () => onNavigateTab?.("launchpad"),
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={card.onClick}
              className={`bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 cursor-pointer transition-all duration-150 shadow-sm hover:scale-[1.02] ${card.border}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {card.label}
                </span>
                <div className={`w-6 h-6 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {card.value}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {card.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. MAIN COMPACT GRID: LEFT (8 COLS) + RIGHT (4 COLS)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================== LEFT COLUMN (8 COLS) ==================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* ========================================================
              SECTION 4: NEEDS YOUR ATTENTION (Most Prominent Card)
          ======================================================== */}
          <div className="bg-slate-900/70 border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Needs Your Attention
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                      {attentionItems.filter((i) => i.status === "pending").length} Pending
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Prioritized pending proposals, introductions, and candidate applications</p>
                </div>
              </div>
            </div>

            {/* Attention Tasks List */}
            <div className="space-y-3">
              {attentionItems.filter((i) => i.status === "pending").length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800">
                  ✨ You are all caught up! No pending attention tasks right now.
                </div>
              ) : (
                attentionItems
                  .filter((i) => i.status === "pending")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                          {item.senderAvatar || "👤"}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-500">• {item.date}</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            <strong className="text-slate-100">{item.senderName}</strong>: {item.context}
                          </p>
                        </div>
                      </div>

                      {/* Permitted Real Actions */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        {item.type === "collaboration_proposal" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProposalToCounter(item);
                                setIsCounterModalOpen(true);
                              }}
                              disabled={actionLoading !== null}
                            >
                              Counter
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAcceptProposal(item.proposalId || "collab-1")}
                              isLoading={actionLoading === `accept-${item.proposalId || "collab-1"}`}
                            >
                              Accept
                            </Button>
                          </>
                        )}

                        {item.type === "connection_request" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "decline")}
                              disabled={actionLoading !== null}
                            >
                              Ignore
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "accept")}
                              isLoading={actionLoading === `att-${item.id}-accept`}
                            >
                              Accept
                            </Button>
                          </>
                        )}

                        {item.type === "job_application_review" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "reject")}
                              disabled={actionLoading !== null}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "shortlist")}
                              isLoading={actionLoading === `att-${item.id}-shortlist`}
                            >
                              Shortlist
                            </Button>
                          </>
                        )}

                        {item.type === "build_space_invite" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "decline")}
                              disabled={actionLoading !== null}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "join_space")}
                              isLoading={actionLoading === `att-${item.id}-join_space`}
                            >
                              Join Space
                            </Button>
                          </>
                        )}

                        {item.type === "mentor_request" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "decline")}
                              disabled={actionLoading !== null}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAttentionAction(item.id, "schedule")}
                              isLoading={actionLoading === `att-${item.id}-schedule`}
                            >
                              Schedule Call
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* ========================================================
              SECTION 3: MY STARTUPS (Multiple Memberships Supported)
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">My Startups</h3>
                  <p className="text-xs text-slate-400">Startups and ventures you own or collaborate in</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateStartupOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create Startup
                </Button>
              </div>
            </div>

            {/* Startups Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {startups.map((st, idx) => (
                <div
                  key={st.id}
                  className={`bg-slate-950/70 border rounded-xl p-4 space-y-3 transition-all cursor-pointer ${
                    activeStartupIdx === idx ? "border-emerald-500/50 shadow-md shadow-emerald-950/20" : "border-slate-800 hover:border-slate-700"
                  }`}
                  onClick={() => setActiveStartupIdx(idx)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-xl font-bold text-emerald-400">
                        {st.logoUrl || "🚀"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-100">{st.name}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {st.industry} • <span className="capitalize">{st.stage?.replace("_", " ")}</span>
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {st.membershipRole || "Owner"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {st.oneLiner}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>👥 {st.teamCount || 3} Team Members</span>
                    <span>⚡ {st.productsCount || 1} Product • {st.activeCollabsCount || 1} Collab</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setSelectedStartupDetail(st)}
                    >
                      View Startup
                    </Button>
                    {(st.membershipRole === "owner" || st.membershipRole === "admin") && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setSelectedStartupManage(st)}
                      >
                        Manage Startup
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              SECTION 6: OPPORTUNITIES & JOBS
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Opportunities & Jobs</h3>
                  <p className="text-xs text-slate-400">Co-founder openings, contributor roles, and job postings</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPostOppOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Post Opening
              </Button>
            </div>

            {/* Toggle Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveOppsTab("opportunities")}
                className={`flex-1 pb-2.5 text-center text-xs font-semibold transition-colors relative ${
                  activeOppsTab === "opportunities" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Startup Opportunities ({opportunities.length})
                {activeOppsTab === "opportunities" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setActiveOppsTab("jobs")}
                className={`flex-1 pb-2.5 text-center text-xs font-semibold transition-colors relative ${
                  activeOppsTab === "jobs" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Engineering & Team Jobs ({jobs.length})
                {activeOppsTab === "jobs" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {(activeOppsTab === "opportunities" ? opportunities : jobs).map((opp) => (
                <div
                  key={opp.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-100">{opp.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 capitalize">
                        {opp.type?.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-1">
                      <span>💰 {opp.compensation?.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>📍 {opp.workMode} ({opp.broadLocation})</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">🏢 {opp.startup?.name || "NovaTech Systems"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedOppToApply(opp)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              SECTION 9: FOUNDER FEED PREVIEW (With Like/Comment/Save)
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Founder Discussions & Updates</h3>
                  <p className="text-xs text-slate-400">Recent architectural insights and startup milestones from founders</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab?.("feed")}
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                View All Feed
              </Button>
            </div>

            <div className="space-y-4">
              {feedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-lg">
                        {post.authorAvatar || "👨‍💻"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                          {post.authorName}
                          <span className="text-slate-500 font-normal">@{post.username}</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{post.authorHeadline}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Feed Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleFeedLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          post.hasLiked ? "text-emerald-400 font-semibold" : "hover:text-white"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${post.hasLiked ? "fill-emerald-400" : ""}`} />
                        <span>{post.likesCount}</span>
                      </button>
                      <button
                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount} Comments</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleFeedSave(post.id)}
                      className={`p-1 rounded hover:text-white transition-colors ${
                        post.hasSaved ? "text-emerald-400" : ""
                      }`}
                      title={post.hasSaved ? "Saved" : "Save post"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${post.hasSaved ? "fill-emerald-400" : ""}`} />
                    </button>
                  </div>

                  {/* Inline Comment Input */}
                  {activeCommentPostId === post.id && (
                    <form
                      onSubmit={(e) => handleAddFeedComment(post.id, e)}
                      className="flex items-center gap-2 pt-2 border-t border-slate-800/40"
                    >
                      <input
                        type="text"
                        value={feedCommentInputs[post.id] || ""}
                        onChange={(e) =>
                          setFeedCommentInputs({ ...feedCommentInputs, [post.id]: e.target.value })
                        }
                        placeholder="Share your perspective or insight..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={!feedCommentInputs[post.id]?.trim()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                      >
                        Send
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN (4 COLS) ==================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* ========================================================
              SECTION 11: QUICK ACTIONS (8 Shortcuts)
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab?.("network")}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Find Cofounder</span>
                <span className="text-[10px] text-slate-500">Search matches</span>
              </button>
              <button
                onClick={() => setIsCreateStartupOpen(true)}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Create Startup</span>
                <span className="text-[10px] text-slate-500">Register project</span>
              </button>
              <button
                onClick={() => setIsPostOppOpen(true)}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Post Opportunity</span>
                <span className="text-[10px] text-slate-500">Hire builders</span>
              </button>
              <button
                onClick={() => setIsSubmitProductOpen(true)}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Submit Product</span>
                <span className="text-[10px] text-slate-500">Launchpad</span>
              </button>
              <button
                onClick={() => setActiveCollabsTab("incoming")}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Find Partners</span>
                <span className="text-[10px] text-slate-500">B2B integrations</span>
              </button>
              <button
                onClick={() => setActiveOppsTab("jobs")}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Hire Talent</span>
                <span className="text-[10px] text-slate-500">Job board</span>
              </button>
              <button
                onClick={() => onNavigateTab?.("network")}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Find Mentor</span>
                <span className="text-[10px] text-slate-500">Domain experts</span>
              </button>
              <button
                onClick={() => onNavigateTab?.("inbox")}
                className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-slate-200 group-hover:text-emerald-400">Open Inbox</span>
                <span className="text-[10px] text-slate-500">Messaging</span>
              </button>
              <button
                onClick={() => setIsBlueprintsModalOpen(true)}
                className="p-2.5 bg-slate-950/70 border border-emerald-500/40 hover:border-emerald-500 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-emerald-400 group-hover:text-emerald-300">⚡ Fork Blueprints</span>
                <span className="text-[10px] text-slate-500">Decks & SAFE notes</span>
              </button>
              <button
                onClick={() => setIsCodeCastModalOpen(true)}
                className="p-2.5 bg-slate-950/70 border border-cyan-500/40 hover:border-cyan-500 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-cyan-400 group-hover:text-cyan-300">🖥️ Live Code Cast</span>
                <span className="text-[10px] text-slate-500">WebGL & CLI demo</span>
              </button>
              <button
                onClick={() => setIsHackathonModalOpen(true)}
                className="p-2.5 bg-slate-950/70 border border-amber-500/40 hover:border-amber-500 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-amber-400 group-hover:text-amber-300">🏆 Hackathon Squads</span>
                <span className="text-[10px] text-slate-500">Role-locked teams</span>
              </button>
              <button
                onClick={() => setIsSpeedMentorshipOpen(true)}
                className="p-2.5 bg-slate-950/70 border border-yellow-500/40 hover:border-yellow-500 hover:bg-slate-900 text-left rounded-xl transition-all group"
              >
                <span className="block font-semibold text-yellow-400 group-hover:text-yellow-300">⚡ 2-Min Mentorship</span>
                <span className="text-[10px] text-slate-500">120s sparks</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              SECTION 10: UPCOMING ACTIVITIES (Timezone-Aware)
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Upcoming Activities
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">IST (UTC+5:30)</span>
            </div>

            <div className="space-y-2.5">
              {upcomingActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      act.status === "urgent" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {act.type?.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{act.timeLabel}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{act.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>With: {Array.isArray(act.attendees) ? act.attendees.join(", ") : act.attendees}</span>
                    {act.meetingUrl && (
                      <a
                        href={act.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Join <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              SECTION 5: RECOMMENDED PEOPLE (Cofounders & Mentors)
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Recommended People
              </h3>
              <button
                onClick={() => onNavigateTab?.("network")}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                View Network
              </button>
            </div>

            <div className="space-y-3">
              {recommendedPeople.slice(0, 4).map((person) => (
                <div
                  key={person.id}
                  className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => handleOpenFounderProfile(person)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-300 text-sm group-hover:scale-105 transition-transform">
                        {person.displayName[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 group-hover:underline">
                          {person.displayName}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{person.headline}</p>
                      </div>
                    </div>

                    <span className="text-[9px] text-slate-400 font-mono">
                      {person.broadLocation?.split(",")[0]}
                    </span>
                  </div>

                  {/* Skills Pills */}
                  {person.skills && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {person.skills.slice(0, 3).map((s: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[11px]"
                      onClick={() => handleOpenFounderProfile(person)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-[11px]"
                      onClick={() => {
                        setSelectedTargetFounder(person);
                        setIsIntroModalOpen(true);
                      }}
                      disabled={person.introStatus === "pending"}
                    >
                      {person.introStatus === "pending" ? "Request Sent" : "Connect"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              SECTION 7: COLLABORATION OVERVIEW
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Handshake className="w-3.5 h-3.5 text-emerald-400" /> Startup Collaborations
              </h3>
              <span className="text-xs text-slate-400 font-medium">B2B Integration Mesh</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 text-[11px]">
              <button
                onClick={() => setActiveCollabsTab("incoming")}
                className={`flex-1 pb-1.5 text-center font-medium ${
                  activeCollabsTab === "incoming" ? "text-emerald-400 font-bold border-b-2 border-emerald-400" : "text-slate-400"
                }`}
              >
                Incoming ({collaborations.incoming?.length || 0})
              </button>
              <button
                onClick={() => setActiveCollabsTab("accepted")}
                className={`flex-1 pb-1.5 text-center font-medium ${
                  activeCollabsTab === "accepted" ? "text-emerald-400 font-bold border-b-2 border-emerald-400" : "text-slate-400"
                }`}
              >
                Spaces ({collaborations.accepted?.length || 0})
              </button>
            </div>

            <div className="space-y-3">
              {(activeCollabsTab === "incoming" ? collaborations.incoming : collaborations.accepted)?.map((collab) => (
                <div key={collab.id} className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{collab.title}</h4>
                      <span className="text-[10px] text-emerald-400 font-medium">{collab.commercialTerms}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {collab.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {collab.whatWeOffer}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {collab.status === "accepted" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onNavigateTab?.("inbox")}
                        icon={<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                      >
                        Message Partner
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setSelectedProposalToCounter(collab);
                            setIsCounterModalOpen(true);
                          }}
                        >
                          Counter
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleAcceptProposal(collab.id)}
                          isLoading={actionLoading === `accept-${collab.id}`}
                        >
                          Accept
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              SECTION 8: PRODUCT LAUNCHPAD
          ======================================================== */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Rocket className="w-3.5 h-3.5 text-emerald-400" /> Product Launchpad
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsSubmitProductOpen(true)}
                icon={<Plus className="w-3 h-3" />}
              >
                Submit
              </Button>
            </div>

            <div className="space-y-3">
              {launchpad.trending.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                      {prod.logoUrl || "🚀"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{prod.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{prod.tagline}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleUpvote(prod.id)}
                    className={`px-2.5 py-1.5 rounded-lg border flex flex-col items-center transition-all ${
                      prod.hasUpvoted
                        ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px]">▲</span>
                    <span className="text-xs font-bold">{prod.upvotesCount}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: CREATE STARTUP
      ======================================================== */}
      {isCreateStartupOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Register New Startup / Project</h3>
              </div>
              <button onClick={() => setIsCreateStartupOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStartupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Startup / Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZetaRails"
                  value={newStartupName}
                  onChange={(e) => setNewStartupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">One-Liner / Value Proposition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-gen UPI settlement mesh for Indian cross-border trade"
                  value={newStartupOneLiner}
                  onChange={(e) => setNewStartupOneLiner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
                  <select
                    value={newStartupIndustry}
                    onChange={(e) => setNewStartupIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="B2B SaaS / Infra">B2B SaaS / Infra</option>
                    <option value="FinTech / Banking">FinTech / Banking</option>
                    <option value="AI / Developer Tools">AI / Developer Tools</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="E-Commerce / D2C">E-Commerce / D2C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stage</label>
                  <select
                    value={newStartupStage}
                    onChange={(e) => setNewStartupStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="idea">Idea / Prototype</option>
                    <option value="early_traction">Early Traction</option>
                    <option value="scaling">Scaling / Funded</option>
                    <option value="profitable">Profitable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://yourstartup.in"
                  value={newStartupWebsite}
                  onChange={(e) => setNewStartupWebsite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateStartupOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={actionLoading === "create-startup"}>
                  Register Startup
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: POST OPPORTUNITY
      ======================================================== */}
      {isPostOppOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Post Opportunity / Job Listing</h3>
              </div>
              <button onClick={() => setIsPostOppOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostOppSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Distributed Consensus Engineer"
                  value={newOppTitle}
                  onChange={(e) => setNewOppTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newOppType}
                    onChange={(e) => setNewOppType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="co_founder">Co-Founder</option>
                    <option value="developer">Engineering / Dev</option>
                    <option value="designer">UI/UX Design</option>
                    <option value="marketing">Growth / Marketing</option>
                    <option value="mentor">Advisor / Mentor</option>
                    <option value="contributor">Contributor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
                  <select
                    value={newOppWorkMode}
                    onChange={(e) => setNewOppWorkMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                    <option value="in_person">In-Person</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Compensation</label>
                <select
                  value={newOppCompensation}
                  onChange={(e) => setNewOppCompensation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="paid_and_equity">Salary + Equity</option>
                  <option value="equity">Equity Only (Co-founder)</option>
                  <option value="paid">Competitive Salary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Go, Rust, PostgreSQL, Raft, Distributed Systems"
                  value={newOppSkills}
                  onChange={(e) => setNewOppSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the mandate, team, and expectations..."
                  value={newOppDesc}
                  onChange={(e) => setNewOppDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsPostOppOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={actionLoading === "post-opp"}>
                  Publish Opening
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SUBMIT PRODUCT
      ======================================================== */}
      {isSubmitProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Submit Product to Launchpad</h3>
              </div>
              <button onClick={() => setIsSubmitProductOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NovaTelemetry SDK"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. eBPF-powered tracing for distributed Indian payment services"
                  value={newProdTagline}
                  onChange={(e) => setNewProdTagline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="FinTech Infra">FinTech Infra</option>
                    <option value="AI / Productivity">AI / Productivity</option>
                    <option value="Security / Auth">Security / Auth</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://novatech.dev"
                    value={newProdWebsite}
                    onChange={(e) => setNewProdWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <textarea
                  rows={3}
                  placeholder="What problem does this solve for users?"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsSubmitProductOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={actionLoading === "create-product"}>
                  Launch on Launchpad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: COUNTER PROPOSAL
      ======================================================== */}
      {isCounterModalOpen && selectedProposalToCounter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Counter-Propose Terms</h3>
              </div>
              <button onClick={() => setIsCounterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block font-semibold">Original Proposal:</span>
              <p className="text-slate-200 font-bold">{selectedProposalToCounter.title}</p>
              <p className="text-emerald-400 font-mono text-[11px]">{selectedProposalToCounter.context || selectedProposalToCounter.commercialTerms}</p>
            </div>

            <form onSubmit={handleCounterProposalSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Revised Commercial / Partnership Terms</label>
                <input
                  type="text"
                  required
                  value={counterCommercialTerms}
                  onChange={(e) => setCounterCommercialTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Revised Offer (What you will provide)</label>
                <textarea
                  rows={2}
                  value={counterRevisedOffer}
                  onChange={(e) => setCounterRevisedOffer(e.target.value)}
                  placeholder="e.g. Co-marketing case study + dedicated developer integration sandbox..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Revised Need (What partner must provide)</label>
                <textarea
                  rows={2}
                  value={counterRevisedNeed}
                  onChange={(e) => setCounterRevisedNeed(e.target.value)}
                  placeholder="e.g. Priority developer support SLA + joint API documentation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCounterModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={actionLoading === "counter"}>
                  Send Counter-Proposal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SEND INTRO REQUEST
      ======================================================== */}
      {isIntroModalOpen && selectedTargetFounder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Connect with {selectedTargetFounder.displayName}</h3>
              </div>
              <button onClick={() => setIsIntroModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <p className="text-slate-300 font-semibold">{selectedTargetFounder.headline}</p>
              <p className="text-[11px] text-slate-500">{selectedTargetFounder.broadLocation}</p>
            </div>

            <form onSubmit={handleSendIntroSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opportunity / Connection Intent</label>
                <input
                  type="text"
                  required
                  value={introRoleTitle}
                  onChange={(e) => setIntroRoleTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personalized Message</label>
                <textarea
                  rows={3}
                  required
                  value={introNote}
                  onChange={(e) => setIntroNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Equity or Compensation Proposal</label>
                <input
                  type="text"
                  value={introEquity}
                  onChange={(e) => setIntroEquity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsIntroModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={actionLoading === "intro"}>
                  Send Introduction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: VIEW STARTUP DETAILS
      ======================================================== */}
      {selectedStartupDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-emerald-500/30 flex items-center justify-center text-xl">
                  {selectedStartupDetail.logoUrl || "🚀"}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedStartupDetail.name}</h3>
                  <span className="text-xs text-emerald-400">{selectedStartupDetail.industry}</span>
                </div>
              </div>
              <button onClick={() => setSelectedStartupDetail(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Value Proposition</span>
                <p className="text-slate-200">{selectedStartupDetail.oneLiner}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Stage</span>
                  <span className="font-bold text-slate-200 capitalize">{selectedStartupDetail.stage?.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="font-bold text-slate-200">{selectedStartupDetail.broadLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Your Role</span>
                  <span className="font-bold text-emerald-400 uppercase">{selectedStartupDetail.membershipRole}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Verification</span>
                  <span className="font-bold text-slate-200 capitalize">{selectedStartupDetail.verificationLevel?.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedStartupDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MANAGE STARTUP
      ======================================================== */}
      {selectedStartupManage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Manage {selectedStartupManage.name}</h3>
              </div>
              <button onClick={() => setSelectedStartupManage(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-200">
                You have <strong>{selectedStartupManage.membershipRole?.toUpperCase()}</strong> administrative permissions for this startup.
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Administrative Capabilities</label>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Manage Team Permissions & Role Allocation
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Accept or Counter B2B Collaboration Proposals
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Publish Job Openings & Review Applications
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Manage Launchpad Products & Updates
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedStartupManage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: APPLY TO JOB / OPPORTUNITY
      ======================================================== */}
      {selectedOppToApply && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Apply for {selectedOppToApply.title}</h3>
              </div>
              <button onClick={() => setSelectedOppToApply(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="font-semibold text-slate-200">{selectedOppToApply.startup?.name || "NovaTech Systems"}</span>
              <p className="text-slate-400">{selectedOppToApply.compensation} • {selectedOppToApply.workMode}</p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Portfolio or GitHub URL</label>
                <input
                  type="url"
                  required
                  value={applyPortfolioUrl}
                  onChange={(e) => setApplyPortfolioUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Note / Why are you a strong match?</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share relevant architecture experience, open-source work, or systems you built..."
                  value={applyPitchNote}
                  onChange={(e) => setApplyPitchNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedOppToApply(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          PUBLIC FOUNDER PROFILE MODAL (LinkedIn-Style)
      ======================================================== */}
      {selectedFounderProfile && (
        <FounderPublicProfileModal
          founder={selectedFounderProfile}
          isOpen={true}
          onClose={() => setSelectedFounderProfile(null)}
          onConnect={() => {
            showToast(`Connection request sent to ${selectedFounderProfile.displayName}!`);
            setSelectedFounderProfile(null);
          }}
          onMessage={() => {
            setSelectedFounderProfile(null);
            onNavigateTab?.("inbox");
          }}
        />
      )}

      {/* ========================================================
          FORKABLE BUILDER BLUEPRINTS MODAL (F16)
      ======================================================== */}
      <ForkableBlueprintsModal
        isOpen={isBlueprintsModalOpen}
        onClose={() => setIsBlueprintsModalOpen(false)}
        onForkToBuildSpace={(title) => {
          showToast(`Forked "${title}" directly into your Build Space!`);
          onNavigateTab?.("build-spaces");
        }}
      />

      {/* ========================================================
          INTERACTIVE PROJECT CANVASES & CODE CAST MODAL (F15)
      ======================================================== */}
      <CodeCastCanvasModal
        isOpen={isCodeCastModalOpen}
        onClose={() => setIsCodeCastModalOpen(false)}
        projectName={startups[activeStartupIdx]?.name || "NovaTech Systems"}
      />

      {/* ========================================================
          HACKATHON SQUAD MATCHMAKER (F17)
      ======================================================== */}
      <HackathonSquadModal
        isOpen={isHackathonModalOpen}
        onClose={() => setIsHackathonModalOpen(false)}
      />

      {/* ========================================================
          2-MINUTE SPEED MENTORSHIP SPARKS (F18)
      ======================================================== */}
      <SpeedMentorshipModal
        isOpen={isSpeedMentorshipOpen}
        onClose={() => setIsSpeedMentorshipOpen(false)}
      />

      {/* ========================================================
          TECH TALK SYNC & SLIDE MASTERCLASS (F19)
      ======================================================== */}
      <TechTalkMasterclassModal
        isOpen={isTechTalkModalOpen}
        onClose={() => setIsTechTalkModalOpen(false)}
      />

      {/* ========================================================
          CUSTOM STARTUP SUBDOMAINS (F20)
      ======================================================== */}
      <CustomSubdomainModal
        isOpen={isSubdomainModalOpen}
        onClose={() => setIsSubdomainModalOpen(false)}
      />

      {/* ========================================================
          HONEST DOMAIN PULSE (F21)
      ======================================================== */}
      <HonestDomainPulseModal
        isOpen={isDomainPulseModalOpen}
        onClose={() => setIsDomainPulseModalOpen(false)}
      />

      {/* ========================================================
          PROOF-OF-TRACTION COMMUNITY LAUNCHES (F22)
      ======================================================== */}
      <ProofOfTractionModal
        isOpen={isProofOfTractionModalOpen}
        onClose={() => setIsProofOfTractionModalOpen(false)}
      />

      {/* ========================================================
          VERIFIABLE PROOF-OF-SKILL KUDOS (F23)
      ======================================================== */}
      <VerifiableKudosModal
        isOpen={isKudosModalOpen}
        onClose={() => setIsKudosModalOpen(false)}
      />
    </div>
  );
};
