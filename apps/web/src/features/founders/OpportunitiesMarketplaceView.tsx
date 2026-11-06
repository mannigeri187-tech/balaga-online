import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  Plus,
  Bookmark,
  MapPin,
  CheckCircle2,
  X,
  Send,
  MessageSquare,
  Lock,
  Sparkles,
  Users,
  Building,
  BadgeCheck,
  Calendar,
  FileText,
  UserCheck,
  Handshake,
  HeartHandshake,
  DollarSign,
  Laptop,
} from "lucide-react";
import {
  Opportunity,
  OpportunityCategory,
  OpportunityCompensation,
  OpportunityStatus,
  OpportunityApplicationStatus,
} from "@platform/shared-types";

interface OpportunitiesMarketplaceViewProps {
  onNavigateTab?: (tab: string) => void;
}

type MarketplaceTab =
  | "discover"
  | "recommended"
  | "cofounder"
  | "collaboration"
  | "freelance"
  | "mentor"
  | "beta_tester"
  | "my_applications"
  | "my_published";

export const OpportunitiesMarketplaceView: React.FC<OpportunitiesMarketplaceViewProps> = ({
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("discover");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [skillsFilter, setSkillsFilter] = useState("all");
  const [compensationFilter, setCompensationFilter] = useState("all");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // Data states
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendedOpps, setRecommendedOpps] = useState<Opportunity[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myPublishedOpps, setMyPublishedOpps] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [detailModalOpp, setDetailModalOpp] = useState<Opportunity | null>(null);
  const [applyModalOpp, setApplyModalOpp] = useState<Opportunity | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [manageApplicantsOpp, setManageApplicantsOpp] = useState<Opportunity | null>(null);
  const [applicantsList, setApplicantsList] = useState<any[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [reportModalOpp, setReportModalOpp] = useState<Opportunity | null>(null);
  const [reportReason, setReportReason] = useState("misleading_compensation");
  const [reportDetails, setReportDetails] = useState("");
  const [connectionPromptOpen, setConnectionPromptOpen] = useState(false);

  // Application form state
  const [applyForm, setApplyForm] = useState({
    introduction: "",
    whyInterested: "",
    skillsAndExperience: "",
    portfolioLinks: "",
    availabilityCommitment: "Full-Time (40 hrs/wk)",
    compensationExpectations: "",
    questionAnswers: {} as Record<string, string>,
  });

  // New Opportunity form state
  const [newOppForm, setNewOppForm] = useState({
    title: "",
    category: "developer" as OpportunityCategory,
    summary: "",
    description: "",
    responsibilities: "",
    requiredSkills: "",
    preferredSkills: "",
    experienceLevel: "Mid-Senior (3-5 yrs)",
    commitmentHours: "Full-Time (40 hrs/wk)",
    workMode: "remote" as "remote" | "hybrid" | "in_person",
    broadLocation: "Bengaluru, Karnataka",
    compensation: "paid_and_equity" as OpportunityCompensation,
    compensationDetails: "",
    deadline: "",
    openingsCount: 1,
    applicationQuestions: "",
    startupId: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch data on tab or filter change
  useEffect(() => {
    fetchTabData();
  }, [
    activeTab,
    categoryFilter,
    skillsFilter,
    compensationFilter,
    workModeFilter,
    experienceFilter,
    sortBy,
  ]);

  const fetchTabData = async () => {
    setIsLoading(true);
    try {
      const headers = {
        "x-mock-user": "true",
        "x-platform-world": "founders",
      };

      if (
        activeTab === "discover" ||
        activeTab === "cofounder" ||
        activeTab === "collaboration" ||
        activeTab === "freelance" ||
        activeTab === "mentor" ||
        activeTab === "beta_tester"
      ) {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);

        // Map tab to category if on category-specific tab
        const effCat =
          activeTab === "cofounder"
            ? "cofounder"
            : activeTab === "collaboration"
            ? "collaboration"
            : activeTab === "freelance"
            ? "freelance"
            : activeTab === "mentor"
            ? "mentor"
            : activeTab === "beta_tester"
            ? "beta_tester"
            : categoryFilter;

        if (effCat !== "all") params.set("category", effCat);
        if (skillsFilter !== "all") params.set("skills", skillsFilter);
        if (compensationFilter !== "all") params.set("compensation", compensationFilter);
        if (workModeFilter !== "all") params.set("workMode", workModeFilter);
        if (experienceFilter !== "all") params.set("experience", experienceFilter);
        params.set("sortBy", sortBy);

        const res = await fetch(`/api/founders/opportunities/marketplace?${params.toString()}`, { headers });
        const json = await res.json();
        setOpportunities(json.opportunities || []);
      } else if (activeTab === "recommended") {
        const res = await fetch("/api/founders/opportunities/marketplace/recommended", { headers });
        const json = await res.json();
        setRecommendedOpps(json.recommended || []);
      } else if (activeTab === "my_applications") {
        const res = await fetch("/api/founders/opportunities/my-applications", { headers });
        const json = await res.json();
        setMyApplications(json.applications || []);
      } else if (activeTab === "my_published") {
        const res = await fetch("/api/founders/opportunities/my-published", { headers });
        const json = await res.json();
        setMyPublishedOpps(json.opportunities || []);
      }
    } catch (err) {
      console.error("Error fetching opportunities data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTabData();
  };

  // Save / Bookmark Opportunity
  const handleToggleSave = async (oppId: string) => {
    try {
      const res = await fetch(`/api/founders/opportunities/marketplace/${oppId}/save`, {
        method: "POST",
        headers: { "x-mock-user": "true", "x-platform-world": "founders" },
      });
      const data = await res.json();
      showToast(data.message || "Updated bookmark");
      fetchTabData();
    } catch {
      showToast("Error toggling bookmark");
    }
  };

  // Submit Application
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalOpp) return;

    try {
      const questionAnswers = (applyModalOpp.applicationQuestions || []).map((q) => ({
        question: q,
        answer: applyForm.questionAnswers[q] || "N/A",
      }));

      const res = await fetch(`/api/founders/opportunities/marketplace/${applyModalOpp.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({
          introduction: applyForm.introduction,
          whyInterested: applyForm.whyInterested,
          skillsAndExperience: applyForm.skillsAndExperience,
          portfolioLinks: applyForm.portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean),
          availabilityCommitment: applyForm.availabilityCommitment,
          compensationExpectations: applyForm.compensationExpectations,
          questionAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to submit application");
      } else {
        showToast("Application submitted successfully to publisher!");
        setApplyModalOpp(null);
        setApplyForm({
          introduction: "",
          whyInterested: "",
          skillsAndExperience: "",
          portfolioLinks: "",
          availabilityCommitment: "Full-Time (40 hrs/wk)",
          compensationExpectations: "",
          questionAnswers: {},
        });
        fetchTabData();
      }
    } catch {
      showToast("Error submitting application");
    }
  };

  // Withdraw Application
  const handleWithdrawApplication = async (appId: string) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      const res = await fetch(`/api/founders/opportunities/applications/${appId}/withdraw`, {
        method: "POST",
        headers: { "x-mock-user": "true", "x-platform-world": "founders" },
      });
      if (res.ok) {
        showToast("Application withdrawn successfully.");
        fetchTabData();
      }
    } catch {
      showToast("Error withdrawing application");
    }
  };

  // Publish New Opportunity
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/founders/opportunities/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({
          ...newOppForm,
          responsibilities: newOppForm.responsibilities
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          requiredSkills: newOppForm.requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          preferredSkills: newOppForm.preferredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          applicationQuestions: newOppForm.applicationQuestions
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          startupId: newOppForm.startupId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to publish opportunity");
      } else {
        showToast("Opportunity published to marketplace!");
        setPublishModalOpen(false);
        setActiveTab("my_published");
        fetchTabData();
      }
    } catch {
      showToast("Error publishing opportunity");
    }
  };

  // Update Listing Status (Open, Paused, Closed)
  const handleUpdateOppStatus = async (oppId: string, status: OpportunityStatus) => {
    try {
      const res = await fetch(`/api/founders/opportunities/marketplace/${oppId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Listing status updated to '${status}'`);
        fetchTabData();
      }
    } catch {
      showToast("Error updating listing status");
    }
  };

  // Open Manage Applicants Modal for a listing
  const handleOpenApplicants = async (opp: Opportunity) => {
    setManageApplicantsOpp(opp);
    setApplicantsLoading(true);
    try {
      const res = await fetch(`/api/founders/opportunities/marketplace/${opp.id}/applicants`, {
        headers: { "x-mock-user": "true", "x-platform-world": "founders" },
      });
      const json = await res.json();
      setApplicantsList(json.applicants || []);
    } catch {
      showToast("Error fetching applicants");
    } finally {
      setApplicantsLoading(false);
    }
  };

  // Update Applicant Status (Viewed, Shortlisted, Meeting, Accepted, Declined)
  const handleUpdateApplicantStatus = async (
    appId: string,
    status: OpportunityApplicationStatus,
    internalNotes?: string
  ) => {
    try {
      const res = await fetch(`/api/founders/opportunities/applications/${appId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ status, internalNotes }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Applicant status updated to '${status}'`);
        // Refresh applicants list
        if (manageApplicantsOpp) {
          handleOpenApplicants(manageApplicantsOpp);
        }
      }
    } catch {
      showToast("Error updating applicant status");
    }
  };

  // Confirmed Decision (Section 7):
  // When an applicant clicks "Message" on an Accepted application, check permissions:
  // If allowed (Premium or connected), open conversation; if not, prompt to connect first!
  const handleMessageClick = (canMessage: boolean, partnerName: string) => {
    if (canMessage) {
      if (onNavigateTab) {
        onNavigateTab("inbox");
      } else {
        showToast(`Opening private conversation with ${partnerName}...`);
      }
    } else {
      setConnectionPromptOpen(true);
    }
  };

  // Submit Moderation Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalOpp) return;
    try {
      const res = await fetch(`/api/founders/opportunities/marketplace/${reportModalOpp.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-user": "true",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      });
      if (res.ok) {
        showToast("Opportunity reported to moderation queue.");
        setReportModalOpp(null);
        setReportDetails("");
      }
    } catch {
      showToast("Error reporting opportunity");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-teal-950/50 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>Opportunities Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Personal, Project & Technical Opportunities
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Find cofounders, contract developers, UI/UX designers, beta testers, and domain mentors. Formal corporate employment listings remain exclusively in the Hiring Centre.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPublishModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Post an Opportunity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
        {[
          { id: "discover", label: "Discover All", icon: Briefcase },
          { id: "recommended", label: "Recommended", icon: Sparkles },
          { id: "cofounder", label: "Cofounder", icon: Handshake },
          { id: "collaboration", label: "Collaboration", icon: HeartHandshake },
          { id: "freelance", label: "Freelance & Contract", icon: DollarSign },
          { id: "mentor", label: "Mentorship", icon: UserCheck },
          { id: "beta_tester", label: "Beta Testers", icon: Laptop },
          { id: "my_applications", label: "My Applications", icon: Send, count: myApplications.length },
          { id: "my_published", label: "My Published", icon: FileText, count: myPublishedOpps.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MarketplaceTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "border-teal-500 text-teal-400 bg-teal-500/5 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar for Browse Tabs */}
      {activeTab !== "my_applications" && activeTab !== "my_published" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search opportunities by title, required skills, keywords, or startup..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-teal-600/20"
            >
              Search
            </button>
          </form>

          {/* Multi-Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-800/80">
            {/* Category */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Categories</option>
                <option value="cofounder">Cofounder</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="marketing">Marketing & DevRel</option>
                <option value="sales">Sales & BD</option>
                <option value="freelance">Freelance Contract</option>
                <option value="contributor">Contributor</option>
                <option value="beta_tester">Beta Tester</option>
                <option value="mentor">Mentor</option>
                <option value="collaboration">Collaboration</option>
              </select>
            </div>

            {/* Compensation */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Compensation</label>
              <select
                value={compensationFilter}
                onChange={(e) => setCompensationFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Types</option>
                <option value="paid">Paid</option>
                <option value="equity">Equity-Based</option>
                <option value="paid_and_equity">Paid + Equity</option>
                <option value="voluntary">Voluntary / Unpaid</option>
                <option value="discussion">Open to Discussion</option>
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Work Mode</label>
              <select
                value={workModeFilter}
                onChange={(e) => setWorkModeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">Any Mode</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="in_person">In Person</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Experience</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">Any Level</option>
                <option value="early">Early / Mid</option>
                <option value="senior">Senior (5+ yrs)</option>
                <option value="principal">Staff / Principal</option>
              </select>
            </div>

            {/* Skill */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Skill</label>
              <select
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Skills</option>
                <option value="Go">Go / Golang</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="Kubernetes">Kubernetes</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Solidity">Solidity</option>
                <option value="Figma">Figma / UI</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="recommended">Recommended Match</option>
                <option value="newest">Recently Published</option>
                <option value="deadline">Approaching Deadline</option>
                <option value="applications">Most Applications</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="space-y-6">
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading opportunities...</span>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* TABS 1-7: BROWSE & RECOMMENDED LISTINGS                   */}
            {/* ======================================================== */}
            {activeTab !== "my_applications" && activeTab !== "my_published" && (
              <div className="space-y-6">
                {activeTab === "recommended" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-300">
                    <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>
                      Opportunities matched algorithmically to your skills, interests, and availability preferences. Zero paid or sponsored bias.
                    </span>
                  </div>
                )}

                {(activeTab === "recommended" ? recommendedOpps : opportunities).length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-lg font-semibold text-white">No opportunities found</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                      Try broadening your search query or adjusting your filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {(activeTab === "recommended" ? recommendedOpps : opportunities).map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        onViewDetails={() => setDetailModalOpp(opp)}
                        onApply={() => setApplyModalOpp(opp)}
                        onToggleSave={() => handleToggleSave(opp.id)}
                        onReport={() => setReportModalOpp(opp)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 8: MY APPLICATIONS                                    */}
            {/* ======================================================== */}
            {activeTab === "my_applications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">My Submitted Applications</h3>
                  <p className="text-xs text-slate-400">
                    Track the review progress of your applications.
                  </p>
                </div>

                {myApplications.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <Send className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-400">You haven't submitted any applications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myApplications.map((app) => {
                      const opp = app.opportunity;
                      return (
                        <div
                          key={app.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                                  {opp?.category || "Opportunity"}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    app.status === "accepted"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : app.status === "shortlisted"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : app.status === "declined"
                                      ? "bg-rose-500/20 text-rose-300"
                                      : app.status === "withdrawn"
                                      ? "bg-slate-800 text-slate-500"
                                      : "bg-teal-500/20 text-teal-300"
                                  }`}
                                >
                                  Status: {app.status}
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-white mt-1.5">{opp?.title}</h4>
                              <p className="text-xs text-slate-400">
                                Published by {opp?.creator?.displayName || "Founder"} · Applied{" "}
                                {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Confirmed Decision: Explicit Message Button on Accepted applications */}
                            {app.status === "accepted" && (
                              <button
                                onClick={() =>
                                  handleMessageClick(
                                    app.canMessage,
                                    opp?.creator?.displayName || "Publisher"
                                  )
                                }
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 self-start transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Message Publisher</span>
                                {!app.canMessage && <Lock className="w-3 h-3 text-amber-300" />}
                              </button>
                            )}
                          </div>

                          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                            <p>
                              <strong className="text-slate-400 font-normal">Introduction:</strong>{" "}
                              {app.introduction}
                            </p>
                            <p>
                              <strong className="text-slate-400 font-normal">Why Interested:</strong>{" "}
                              {app.whyInterested}
                            </p>
                            {app.meetingDetails && (
                              <div className="bg-teal-950/40 border border-teal-500/30 p-2.5 rounded-lg text-teal-300 mt-2 space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Meeting Scheduled: {new Date(app.meetingDetails.date).toLocaleString()}</span>
                                </div>
                                {app.meetingDetails.link && (
                                  <p className="text-[11px]">Link: <a href={app.meetingDetails.link} target="_blank" rel="noreferrer" className="underline">{app.meetingDetails.link}</a></p>
                                )}
                              </div>
                            )}
                          </div>

                          {app.status !== "withdrawn" && app.status !== "accepted" && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleWithdrawApplication(app.id)}
                                className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                Withdraw Application
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 9: MY PUBLISHED OPPORTUNITIES (Publisher Dashboard)    */}
            {/* ======================================================== */}
            {activeTab === "my_published" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">My Published Opportunities</h3>
                    <p className="text-xs text-slate-400">
                      Manage listings, view applicant pipelines, and update listing visibility.
                    </p>
                  </div>
                  <button
                    onClick={() => setPublishModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 self-start"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Listing</span>
                  </button>
                </div>

                {myPublishedOpps.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-400">You haven't published any opportunities yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myPublishedOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                                {opp.category}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  opp.status === "open"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : opp.status === "paused"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {opp.status}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white mt-1.5">{opp.title}</h4>
                            <p className="text-xs text-slate-400">
                              {opp.compensationDetails || opp.compensation} · {opp.broadLocation}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenApplicants(opp)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>View Applicants ({opp.applicationsCount || 0})</span>
                            </button>
                          </div>
                        </div>

                        {/* Pipeline Stats */}
                        <div className="grid grid-cols-4 gap-2 text-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Views</span>
                            <span className="font-bold text-white">{opp.viewsCount || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Applied</span>
                            <span className="font-bold text-teal-400">{opp.applicationsCount || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Shortlisted</span>
                            <span className="font-bold text-amber-400">{opp.shortlistedCount || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Accepted</span>
                            <span className="font-bold text-emerald-400">{opp.acceptedCount || 0}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                          <span className="text-slate-500 text-[11px]">
                            Deadline: {opp.deadline || "Open ended"}
                          </span>

                          <div className="flex items-center gap-2">
                            {opp.status === "open" ? (
                              <button
                                onClick={() => handleUpdateOppStatus(opp.id, "paused")}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs"
                              >
                                Pause
                              </button>
                            ) : opp.status === "paused" ? (
                              <button
                                onClick={() => handleUpdateOppStatus(opp.id, "open")}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs"
                              >
                                Reopen
                              </button>
                            ) : null}

                            {opp.status !== "closed" && (
                              <button
                                onClick={() => handleUpdateOppStatus(opp.id, "closed")}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg text-xs"
                              >
                                Close
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: OPPORTUNITY DETAIL MODAL                        */}
      {/* ======================================================== */}
      {detailModalOpp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 sm:p-7 space-y-6 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full">
                  {detailModalOpp.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{detailModalOpp.title}</h3>
                <p className="text-xs text-slate-400">
                  Published by {detailModalOpp.creator?.displayName} · {detailModalOpp.broadLocation}
                </p>
              </div>
              <button onClick={() => setDetailModalOpp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compensation & Work arrangement cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-0.5">Compensation</span>
                <span className="font-bold text-emerald-400 capitalize">
                  {detailModalOpp.compensation.replace(/_/g, " ")}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">{detailModalOpp.compensationDetails || "As discussed"}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-0.5">Work Arrangement</span>
                <span className="font-bold text-white capitalize">{detailModalOpp.workMode}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{detailModalOpp.commitmentHours || "Flexible"}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-0.5">Experience Level</span>
                <span className="font-bold text-teal-400">{detailModalOpp.experienceLevel}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Openings: {detailModalOpp.openingsCount}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs text-slate-300">
              <h4 className="font-bold text-white text-sm">Description</h4>
              <p className="leading-relaxed whitespace-pre-line">{detailModalOpp.description}</p>
            </div>

            {/* Responsibilities */}
            {detailModalOpp.responsibilities && detailModalOpp.responsibilities.length > 0 && (
              <div className="space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-white text-sm">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {detailModalOpp.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {detailModalOpp.requiredSkills.map((s) => (
                  <span key={s} className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg font-medium border border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setDetailModalOpp(null);
                  setReportModalOpp(detailModalOpp);
                }}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
              >
                Report this Opportunity
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDetailModalOpp(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const target = detailModalOpp;
                    setDetailModalOpp(null);
                    setApplyModalOpp(target);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: APPLY OPPORTUNITY MODAL                         */}
      {/* ======================================================== */}
      {applyModalOpp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleApplySubmit}
            className="bg-slate-900 border border-teal-900/50 rounded-2xl w-full max-w-xl p-6 sm:p-7 space-y-5 shadow-2xl my-8"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full">
                  Submit Application
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{applyModalOpp.title}</h3>
                <p className="text-xs text-slate-400">Apply directly to {applyModalOpp.creator?.displayName}</p>
              </div>
              <button type="button" onClick={() => setApplyModalOpp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Personalized Introduction & Background
                </label>
                <textarea
                  required
                  rows={3}
                  value={applyForm.introduction}
                  onChange={(e) => setApplyForm({ ...applyForm, introduction: e.target.value })}
                  placeholder="Introduce yourself, your recent engineering/design achievements, and why you are reaching out..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Why are you interested in this specific opportunity?
                </label>
                <textarea
                  required
                  rows={2}
                  value={applyForm.whyInterested}
                  onChange={(e) => setApplyForm({ ...applyForm, whyInterested: e.target.value })}
                  placeholder="What excites you about the problem space, technology stack, or product vision?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Relevant Skills, Projects & Architecture Experience
                </label>
                <textarea
                  required
                  rows={2}
                  value={applyForm.skillsAndExperience}
                  onChange={(e) => setApplyForm({ ...applyForm, skillsAndExperience: e.target.value })}
                  placeholder="Mention concrete systems, APIs, or designs you've built..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Availability & Commitment</label>
                  <input
                    type="text"
                    required
                    value={applyForm.availabilityCommitment}
                    onChange={(e) => setApplyForm({ ...applyForm, availabilityCommitment: e.target.value })}
                    placeholder="e.g. Full-Time, 20 hrs/wk, Weekends"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Compensation Expectations (Optional)</label>
                  <input
                    type="text"
                    value={applyForm.compensationExpectations}
                    onChange={(e) => setApplyForm({ ...applyForm, compensationExpectations: e.target.value })}
                    placeholder="e.g. As listed, Equity, Open"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Portfolio & Project Links</label>
                <input
                  type="text"
                  value={applyForm.portfolioLinks}
                  onChange={(e) => setApplyForm({ ...applyForm, portfolioLinks: e.target.value })}
                  placeholder="https://github.com/..., https://dribbble.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Publisher Custom Questions */}
              {applyModalOpp.applicationQuestions && applyModalOpp.applicationQuestions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="font-bold text-white block">Publisher Questions</span>
                  {applyModalOpp.applicationQuestions.map((q, idx) => (
                    <div key={idx}>
                      <label className="text-slate-400 block mb-1">{q}</label>
                      <input
                        type="text"
                        required
                        value={applyForm.questionAnswers[q] || ""}
                        onChange={(e) =>
                          setApplyForm({
                            ...applyForm,
                            questionAnswers: {
                              ...applyForm.questionAnswers,
                              [q]: e.target.value,
                            },
                          })
                        }
                        placeholder="Your answer..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">Applicant details are private to the publisher.</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setApplyModalOpp(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: POST AN OPPORTUNITY MODAL                       */}
      {/* ======================================================== */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handlePublishSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 sm:p-7 space-y-5 shadow-2xl my-8"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full">
                  Post Opportunity
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Create Opportunity Listing</h3>
                <p className="text-xs text-slate-400">
                  Publish personal, collaborative, or verified startup opportunities.
                </p>
              </div>
              <button type="button" onClick={() => setPublishModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  value={newOppForm.title}
                  onChange={(e) => setNewOppForm({ ...newOppForm, title: e.target.value })}
                  placeholder="e.g. Technical Co-Founder (Fintech Rails) or React Native Developer for MVP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={newOppForm.category}
                    onChange={(e) => setNewOppForm({ ...newOppForm, category: e.target.value as OpportunityCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="cofounder">Cofounder</option>
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="marketing">Marketing & DevRel</option>
                    <option value="sales">Sales & BD</option>
                    <option value="freelance">Freelance Contract</option>
                    <option value="contributor">Contributor</option>
                    <option value="beta_tester">Beta Tester</option>
                    <option value="mentor">Mentor</option>
                    <option value="collaboration">Collaboration</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Compensation Arrangement</label>
                  <select
                    value={newOppForm.compensation}
                    onChange={(e) => setNewOppForm({ ...newOppForm, compensation: e.target.value as OpportunityCompensation })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="equity">Equity-Based</option>
                    <option value="paid_and_equity">Paid + Equity</option>
                    <option value="voluntary">Voluntary / Unpaid</option>
                    <option value="discussion">Open to Discussion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Compensation Details / Terms</label>
                <input
                  type="text"
                  value={newOppForm.compensationDetails}
                  onChange={(e) => setNewOppForm({ ...newOppForm, compensationDetails: e.target.value })}
                  placeholder="e.g. ₹60,000 - ₹80,000/mo or 20-25% Equity or Contributor Swag"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Short Summary (1-2 sentences)</label>
                <input
                  type="text"
                  value={newOppForm.summary}
                  onChange={(e) => setNewOppForm({ ...newOppForm, summary: e.target.value })}
                  placeholder="Quick summary for listing preview cards..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Description</label>
                <textarea
                  required
                  rows={3}
                  value={newOppForm.description}
                  onChange={(e) => setNewOppForm({ ...newOppForm, description: e.target.value })}
                  placeholder="Explain the problem space, project objectives, and what you're creating together..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Responsibilities (One per line)</label>
                <textarea
                  rows={2}
                  value={newOppForm.responsibilities}
                  onChange={(e) => setNewOppForm({ ...newOppForm, responsibilities: e.target.value })}
                  placeholder="Design high-throughput event pub/sub&#10;Implement Raft consensus&#10;Benchmark micro-latencies"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={newOppForm.requiredSkills}
                    onChange={(e) => setNewOppForm({ ...newOppForm, requiredSkills: e.target.value })}
                    placeholder="Go, PostgreSQL, Distributed Systems"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Work Mode</label>
                  <select
                    value={newOppForm.workMode}
                    onChange={(e) => setNewOppForm({ ...newOppForm, workMode: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newOppForm.broadLocation}
                    onChange={(e) => setNewOppForm({ ...newOppForm, broadLocation: e.target.value })}
                    placeholder="Bengaluru, Karnataka"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Experience Level</label>
                  <input
                    type="text"
                    required
                    value={newOppForm.experienceLevel}
                    onChange={(e) => setNewOppForm({ ...newOppForm, experienceLevel: e.target.value })}
                    placeholder="Mid-Senior (3-5 yrs)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newOppForm.deadline}
                    onChange={(e) => setNewOppForm({ ...newOppForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Optional Associated Startup
                </label>
                <select
                  value={newOppForm.startupId}
                  onChange={(e) => setNewOppForm({ ...newOppForm, startupId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="">Personal Opportunity (No company association)</option>
                  <option value="st-dev">NovaTech Systems (Authorized Owner)</option>
                  <option value="st-mesh">BharatFin Mesh (Authorized Member)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Only authorized members may publish company-associated opportunities.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">Unpaid internships must comply with applicable law.</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25"
                >
                  Publish Listing
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: MANAGE APPLICANTS MODAL                         */}
      {/* ======================================================== */}
      {manageApplicantsOpp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full">
                  Applicant Pipeline
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Applicants for: {manageApplicantsOpp.title}</h3>
                <p className="text-xs text-slate-400">Private candidate management dashboard</p>
              </div>
              <button
                type="button"
                onClick={() => setManageApplicantsOpp(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicantsLoading ? (
              <div className="py-12 text-center text-slate-400">Loading applicants...</div>
            ) : applicantsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm">No applications submitted yet for this listing.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {applicantsList.map((app) => (
                  <div
                    key={app.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-teal-400">
                          {app.applicant?.avatarUrl ? (
                            <img src={app.applicant.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            app.applicant?.displayName?.[0] || "A"
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{app.applicant?.displayName}</h4>
                          <p className="text-xs text-slate-400">{app.applicant?.headline}</p>
                          <span className="text-[11px] text-slate-500">{app.applicant?.broadLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status update select */}
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateApplicantStatus(app.id, e.target.value as OpportunityApplicationStatus)
                          }
                          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-medium"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="viewed">Viewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="meeting">Meeting</option>
                          <option value="accepted">Accepted</option>
                          <option value="declined">Declined</option>
                        </select>

                        {/* Confirmed Decision: Explicit Message Button on Accepted applications */}
                        {app.status === "accepted" && (
                          <button
                            onClick={() =>
                              handleMessageClick(app.canMessage, app.applicant?.displayName || "Applicant")
                            }
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Message</span>
                            {!app.canMessage && <Lock className="w-2.5 h-2.5 text-amber-300" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg text-xs text-slate-300 space-y-1 border border-slate-800/80">
                      <p><strong className="text-slate-400 font-normal">Intro:</strong> {app.introduction}</p>
                      <p><strong className="text-slate-400 font-normal">Why:</strong> {app.whyInterested}</p>
                      <p><strong className="text-slate-400 font-normal">Skills:</strong> {app.skillsAndExperience}</p>
                      {app.internalNotes && (
                        <p className="text-amber-300 pt-1 border-t border-slate-800">
                          <strong className="text-amber-400">Internal Note:</strong> {app.internalNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setManageApplicantsOpp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: CONNECTION REQUIRED PROMPT                      */}
      {/* ======================================================== */}
      {connectionPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Connection Required to Message</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As per Balaga Founders messaging rules, Basic members must have an accepted professional connection before initiating private messages, or you can upgrade to Founders Premium for instant unconnected messaging.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConnectionPromptOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setConnectionPromptOpen(false);
                  if (onNavigateTab) onNavigateTab("network");
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Go to Network to Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: REPORT OPPORTUNITY MODAL                        */}
      {/* ======================================================== */}
      {reportModalOpp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleReportSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Report Opportunity</h3>
            <p className="text-xs text-slate-400">
              Help keep Balaga Founders trusted and scam-free.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Reason for report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="misleading_compensation">Misleading or undisclosed compensation</option>
                  <option value="spam_or_duplicate">Spam or duplicate listing</option>
                  <option value="suspicious_link">Suspicious links or phishing</option>
                  <option value="unauthorized_company_job">Unauthorized company listing</option>
                  <option value="inappropriate_content">Inappropriate or abusive content</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Additional details (Optional)</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context for moderation review..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReportModalOpp(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ========================================================
// SUB-COMPONENT: OPPORTUNITY CARD
// ========================================================
interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: () => void;
  onApply: () => void;
  onToggleSave: () => void;
  onReport: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onViewDetails,
  onApply,
  onToggleSave,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-xl hover:shadow-teal-950/10 group">
      <div className="space-y-3">
        {/* Top Badges: Category + Compensation + Save */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full">
              {opportunity.category || opportunity.type}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                opportunity.compensation === "paid"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : opportunity.compensation === "paid_and_equity"
                  ? "bg-teal-500/20 text-teal-300"
                  : opportunity.compensation === "equity"
                  ? "bg-purple-500/20 text-purple-300"
                  : opportunity.compensation === "voluntary"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {opportunity.compensation.replace(/_/g, " ")}
            </span>
          </div>

          <button
            onClick={onToggleSave}
            title={opportunity.hasSaved ? "Remove bookmark" : "Save opportunity"}
            className={`p-1.5 rounded-lg border transition-all ${
              opportunity.hasSaved
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "text-slate-400 border-transparent hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${opportunity.hasSaved ? "fill-amber-400" : ""}`} />
          </button>
        </div>

        {/* Title */}
        <div>
          <button
            onClick={onViewDetails}
            className="text-left font-bold text-white hover:text-teal-400 transition-colors text-base line-clamp-1 block"
          >
            {opportunity.title}
          </button>

          {/* Publisher info & Startup affiliation */}
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
            <span>By {opportunity.creator?.displayName || "Founder"}</span>
            {(opportunity.creator as any)?.verificationBadge && (opportunity.creator as any).verificationBadge !== "none" && (
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            )}
            {opportunity.startup && (
              <>
                <span>·</span>
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Building className="w-3 h-3 text-teal-400" />
                  {opportunity.startup.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {opportunity.summary || opportunity.description}
        </p>

        {/* Compensation details */}
        {opportunity.compensationDetails && (
          <div className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded-lg font-medium inline-block">
            {opportunity.compensationDetails}
          </div>
        )}

        {/* Required skills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {opportunity.requiredSkills.slice(0, 4).map((sk) => (
            <span
              key={sk}
              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium border border-slate-700/60"
            >
              {sk}
            </span>
          ))}
          {opportunity.requiredSkills.length > 4 && (
            <span className="text-[10px] text-slate-500 self-center">
              +{opportunity.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{opportunity.workMode === "remote" ? "Remote" : opportunity.broadLocation}</span>
          </span>
          {opportunity.applicationsCount !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{opportunity.applicationsCount} applied</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
          >
            Details
          </button>
          {opportunity.hasApplied ? (
            <span className="px-3 py-1.5 bg-slate-800 text-teal-400 rounded-xl text-xs font-semibold">
              Applied
            </span>
          ) : (
            <button
              onClick={onApply}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
