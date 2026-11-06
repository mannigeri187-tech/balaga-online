import React, { useState, useEffect } from "react";
import {
  Share2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Lock,
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  X,
  FileText,
  UserCheck,
  RefreshCw,
  Bookmark,
  Flag,
  Sparkles,
} from "lucide-react";
import {
  ReferralListing,
  ReferralRequest,
  ReferralCommissionAgreement,
  ReferralCommissionVersion,
  ReferralPipelineRecord,
  ReferralExchangeAnalytics,
} from "@platform/shared-types";

interface ReferralExchangeViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const ReferralExchangeView: React.FC<ReferralExchangeViewProps> = ({ onNavigateTab }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"discover" | "my_listings" | "requests" | "pipeline" | "analytics">("discover");

  // Discovery state & filters
  const [listings, setListings] = useState<ReferralListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>("all"); // offering, requesting, all
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedArrangement, setSelectedArrangement] = useState<string>("all");
  const [selectedCommission, setSelectedCommission] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Management state
  const [myListings, setMyListings] = useState<ReferralListing[]>([]);
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [pipeline, setPipeline] = useState<ReferralPipelineRecord[]>([]);
  const [analytics, setAnalytics] = useState<ReferralExchangeAnalytics | null>(null);

  // Modals
  const [selectedListingDetail, setSelectedListingDetail] = useState<ReferralListing | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [requestModalListing, setRequestModalListing] = useState<ReferralListing | null>(null);
  const [commissionAgreementModal, setCommissionAgreementModal] = useState<{ open: boolean; requestId: string; agreement: ReferralCommissionAgreement | null }>({
    open: false,
    requestId: "",
    agreement: null,
  });
  const [pipelineDetailModal, setPipelineDetailModal] = useState<ReferralPipelineRecord | null>(null);
  const [messageCheckModal, setMessageCheckModal] = useState<{
    open: boolean;
    canMessage: boolean;
    isPremium: boolean;
    reason: string;
    targetName: string;
  } | null>(null);
  const [reportListingId, setReportListingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("misleading_commission");
  const [reportDetails, setReportDetails] = useState<string>("");

  // Create listing form state
  const [formPublisherType, setFormPublisherType] = useState<"individual" | "startup">("individual");
  const [formStartupId, setFormStartupId] = useState<string>("st-dev");
  const [formListingType, setFormListingType] = useState<"offering" | "requesting">("offering");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formIndustry, setFormIndustry] = useState<string>("FinTech");
  const [formTargetAudience, setFormTargetAudience] = useState<string>("");
  const [formCustomerCategory, setFormCustomerCategory] = useState<string>("");
  const [formProductOrService, setFormProductOrService] = useState<string>("");
  const [formIdealProfile, setFormIdealProfile] = useState<string>("");
  const [formQualifications, setFormQualifications] = useState<string>("");
  const [formBroadRegion, setFormBroadRegion] = useState<string>("Bengaluru, India");
  const [formExpectedOutcome, setFormExpectedOutcome] = useState<string>("");
  const [formArrangement, setFormArrangement] = useState<string>("commission_based");
  const [formCommissionChoice, setFormCommissionChoice] = useState<string>("percentage");
  const [formDisclosedCommission, setFormDisclosedCommission] = useState<string>("");
  const [formExpiryDate, setFormExpiryDate] = useState<string>(
    new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0]
  );
  const [formWebsiteUrl, setFormWebsiteUrl] = useState<string>("");

  // Request form state
  const [reqMessage, setReqMessage] = useState<string>("");
  const [reqRelevance, setReqRelevance] = useState<string>("");
  const [reqOpportunity, setReqOpportunity] = useState<string>("");
  const [reqExpectedOutcome, setReqExpectedOutcome] = useState<string>("");

  // Propose counter-terms form state
  const [counterCommType, setCounterCommType] = useState<string>("percentage");
  const [counterRateOrAmount, setCounterRateOrAmount] = useState<string>("12%");
  const [counterCalcBasis, setCounterCalcBasis] = useState<string>("Net first-year deal closing ARR");
  const [counterPaymentFreq, setCounterPaymentFreq] = useState<string>("One-time upon client invoice clearance");
  const [counterResponsibilities, setCounterResponsibilities] = useState<string>("Warm C-level intro + collaborative product demo");

  // Pipeline stage update form state
  const [updateStage, setUpdateStage] = useState<string>("introduced");
  const [updatePrivateName, setUpdatePrivateName] = useState<string>("");
  const [updatePrivateEmail, setUpdatePrivateEmail] = useState<string>("");
  const [updatePrivatePhone, setUpdatePrivatePhone] = useState<string>("");
  const [updatePrivateCompany, setUpdatePrivateCompany] = useState<string>("");
  const [updatePrivateNotes, setUpdatePrivateNotes] = useState<string>("");

  // Outcome & payment update state
  const [outcomeRevenue, setOutcomeRevenue] = useState<string>("");
  const [outcomeCommission, setOutcomeCommission] = useState<string>("");
  const [outcomeNotes, setOutcomeNotes] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Toast / feedback message
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "x-platform-world": "founders",
  });

  // Fetch Discover listings
  const fetchDiscoverListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: selectedType,
        industry: selectedIndustry,
        arrangement: selectedArrangement,
        commissionChoice: selectedCommission,
        sort: sortBy,
        q: searchQuery,
      });
      const res = await fetch(`/api/founders/referrals/discover?${params.toString()}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error("Failed to load discover listings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch My Listings, Requests, Pipeline, Analytics
  const fetchManagementData = async () => {
    try {
      const [lRes, rRes, pRes, aRes] = await Promise.all([
        fetch("/api/founders/referrals/my-listings", { headers: getHeaders() }),
        fetch("/api/founders/referrals/requests", { headers: getHeaders() }),
        fetch("/api/founders/referrals/pipeline", { headers: getHeaders() }),
        fetch("/api/founders/referrals/analytics", { headers: getHeaders() }),
      ]);

      if (lRes.ok) {
        const lData = await lRes.json();
        setMyListings(lData.listings || []);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setRequests(rData.requests || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setPipeline(pData.pipeline || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAnalytics(aData.analytics || null);
      }
    } catch (err) {
      console.error("Failed to fetch referral management data:", err);
    }
  };

  useEffect(() => {
    fetchDiscoverListings();
  }, [selectedType, selectedIndustry, selectedArrangement, selectedCommission, sortBy]);

  useEffect(() => {
    fetchManagementData();
  }, [activeTab]);

  // Create Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast("Please provide a title and description");
      return;
    }

    try {
      const res = await fetch("/api/founders/referrals/listings", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          publisherType: formPublisherType,
          startupId: formPublisherType === "startup" ? formStartupId : null,
          listingType: formListingType,
          title: formTitle.trim(),
          description: formDescription.trim(),
          industry: formIndustry,
          targetAudience: formTargetAudience.trim() || "Technology & Enterprise Decision Makers",
          customerCategory: formCustomerCategory.trim() || "B2B SaaS",
          productOrService: formProductOrService.trim() || formTitle.trim(),
          idealReferralProfile: formIdealProfile.trim() || "CTOs, CXOs and Founders",
          requiredQualifications: formQualifications.trim() || undefined,
          broadRegion: formBroadRegion.trim(),
          expectedOutcome: formExpectedOutcome.trim() || "Introductory alignment call and discovery",
          referralArrangement: formArrangement,
          commissionChoice: formCommissionChoice,
          disclosedCommissionDetails: formDisclosedCommission.trim() || undefined,
          expiryDate: new Date(formExpiryDate).toISOString(),
          websiteUrl: formWebsiteUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to publish listing");
        return;
      }

      showToast(data.message || "Referral listing published successfully!");
      setIsCreateModalOpen(false);
      fetchDiscoverListings();
      fetchManagementData();
    } catch (err) {
      showToast("Network error publishing listing");
    }
  };

  // Submit Referral Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalListing) return;
    if (!reqMessage.trim() || !reqRelevance.trim() || !reqOpportunity.trim()) {
      showToast("Please fill in message, relevance, and potential opportunity");
      return;
    }

    try {
      const res = await fetch(`/api/founders/referrals/listings/${requestModalListing.id}/requests`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          requesterType: "individual",
          message: reqMessage.trim(),
          relevance: reqRelevance.trim(),
          potentialOpportunity: reqOpportunity.trim(),
          expectedOutcome: reqExpectedOutcome.trim() || "Executive Introduction",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to submit referral request");
        return;
      }

      showToast("Referral request submitted successfully!");
      setRequestModalListing(null);
      setReqMessage("");
      setReqRelevance("");
      setReqOpportunity("");
      fetchDiscoverListings();
      fetchManagementData();
    } catch (err) {
      showToast("Error submitting request");
    }
  };

  // Respond to Referral Request
  const handleRespondRequest = async (requestId: string, action: "accept" | "reject" | "request_info" | "withdraw") => {
    try {
      const res = await fetch(`/api/founders/referrals/requests/${requestId}/respond`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Action failed");
        return;
      }
      showToast(data.message || `Request ${action}ed`);
      fetchManagementData();
      if (data.commissionAgreement) {
        setCommissionAgreementModal({
          open: true,
          requestId,
          agreement: data.commissionAgreement,
        });
      }
    } catch (err) {
      showToast("Network error performing action");
    }
  };

  // Check Direct Messaging Permissions
  const handleCheckDirectMessage = async (requestId: string) => {
    try {
      const res = await fetch(`/api/founders/referrals/requests/${requestId}/message-check`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMessageCheckModal({
          open: true,
          canMessage: data.canMessage,
          isPremium: data.isPremium,
          reason: data.reason,
          targetName: data.targetName,
        });
      }
    } catch (err) {
      showToast("Error checking messaging privileges");
    }
  };

  // Propose Commission Terms
  const handleProposeCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionAgreementModal.requestId) return;

    try {
      const res = await fetch(`/api/founders/referrals/requests/${commissionAgreementModal.requestId}/commission/propose`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          commissionType: counterCommType,
          rateOrAmount: counterRateOrAmount.trim(),
          calculationBasis: counterCalcBasis.trim(),
          paymentFrequency: counterPaymentFreq.trim(),
          responsibilities: counterResponsibilities.trim(),
          effectiveDate: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to propose terms");
        return;
      }

      showToast("Revised terms proposed! Awaiting confirmation.");
      setCommissionAgreementModal((prev) => ({ ...prev, agreement: data.agreement }));
      fetchManagementData();
    } catch (err) {
      showToast("Network error proposing terms");
    }
  };

  // Confirm Commission Terms
  const handleConfirmCommission = async (version: number) => {
    if (!commissionAgreementModal.requestId) return;

    try {
      const res = await fetch(`/api/founders/referrals/requests/${commissionAgreementModal.requestId}/commission/confirm`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ version, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Confirmation failed");
        return;
      }
      showToast(data.message || "Terms confirmation recorded");
      setCommissionAgreementModal((prev) => ({ ...prev, agreement: data.agreement }));
      fetchManagementData();
    } catch (err) {
      showToast("Network error confirming terms");
    }
  };

  // Update Pipeline Stage & Customer Private Data
  const handleUpdatePipelineStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineDetailModal) return;

    try {
      const res = await fetch(`/api/founders/referrals/pipeline/${pipelineDetailModal.id}/stage`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          stage: updateStage,
          customerPrivateData:
            updatePrivateCompany || updatePrivateName || updatePrivateEmail || updatePrivatePhone
              ? {
                  companyName: updatePrivateCompany.trim(),
                  contactName: updatePrivateName.trim(),
                  contactEmail: updatePrivateEmail.trim(),
                  contactPhone: updatePrivatePhone.trim(),
                  notes: updatePrivateNotes.trim(),
                }
              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to update pipeline stage");
        return;
      }

      showToast(`Referral progressed to ${updateStage.toUpperCase()}`);
      setPipelineDetailModal(null);
      fetchManagementData();
    } catch (err) {
      showToast("Error updating stage");
    }
  };

  // Record Outcome
  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineDetailModal || !outcomeNotes.trim()) return;

    try {
      const res = await fetch(`/api/founders/referrals/pipeline/${pipelineDetailModal.id}/outcome`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          reportedRevenueValue: outcomeRevenue ? parseFloat(outcomeRevenue) : undefined,
          calculatedCommissionAmount: outcomeCommission ? parseFloat(outcomeCommission) : undefined,
          outcomeNotes: outcomeNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Referral outcome recorded successfully!");
        setPipelineDetailModal(null);
        setOutcomeNotes("");
        setOutcomeRevenue("");
        setOutcomeCommission("");
        fetchManagementData();
      }
    } catch (err) {
      showToast("Error recording outcome");
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineDetailModal) return;

    try {
      const res = await fetch(`/api/founders/referrals/pipeline/${pipelineDetailModal.id}/payment`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          paymentStatus,
          paymentNotes: paymentNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Payment status updated with regulatory disclaimer");
        setPipelineDetailModal(null);
        fetchManagementData();
      }
    } catch (err) {
      showToast("Error recording payment status");
    }
  };

  // Save / Bookmark Listing
  const handleToggleSaveListing = async (listingId: string, currentSaved: boolean) => {
    try {
      const method = currentSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/founders/referrals/listings/${listingId}/save`, {
        method,
        headers: getHeaders(),
      });
      if (res.ok) {
        showToast(currentSaved ? "Listing removed from bookmarks" : "Listing saved to bookmarks");
        fetchDiscoverListings();
      }
    } catch (err) {
      showToast("Error updating bookmark");
    }
  };

  // Submit Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportListingId) return;

    try {
      const res = await fetch(`/api/founders/referrals/listings/${reportListingId}/report`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails.trim(),
        }),
      });
      if (res.ok) {
        showToast("Report submitted for moderation review");
        setReportListingId(null);
        setReportDetails("");
      }
    } catch (err) {
      showToast("Error submitting report");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Referral Exchange
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Option C: Public Disclosure & Private Negotiation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Business & Professional Referral Marketplace
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Offer warm introductions to Indian enterprise customers, request introductions to buyers and mentors,
              and negotiate clear, mutually-confirmed commission terms.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Publish Referral Listing
          </button>
        </div>

        {/* Regulatory Disclaimer Card */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Platform Disclaimer:</strong> Balaga provides an auditable digital pipeline and dual-party confirmation
            records for referral arrangements. Balaga does not operate an escrow, hold funds, or guarantee payments. All
            financial settlements occur directly between participating parties.
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "discover", label: "Discover Referrals", icon: Search },
          { id: "my_listings", label: "My Referral Listings", icon: FileText, badge: myListings.length },
          { id: "requests", label: "Requests & Proposals", icon: Send, badge: requests.length },
          { id: "pipeline", label: "Active Pipeline", icon: Layers, badge: pipeline.length },
          { id: "analytics", label: "Exchange Analytics", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* =========================================================================
          TAB 1: DISCOVER REFERRALS
      ========================================================================== */}
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
                onKeyDown={(e) => e.key === "Enter" && fetchDiscoverListings()}
                placeholder="Search referrals by title, industry, target customer or product..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Offerings & Requests</option>
                <option value="offering">Offering a Referral</option>
                <option value="requesting">Requesting a Referral</option>
              </select>

              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Industries</option>
                <option value="FinTech">FinTech</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Logistics">Logistics</option>
                <option value="B2B SaaS">B2B SaaS</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Healthcare">Healthcare</option>
              </select>

              <select
                value={selectedArrangement}
                onChange={(e) => setSelectedArrangement(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Arrangements</option>
                <option value="commission_based">Commission-Based</option>
                <option value="mutual_referral">Mutual Referral</option>
                <option value="one_way">One-Way Referral</option>
                <option value="non_commercial">Non-Commercial</option>
              </select>

              <select
                value={selectedCommission}
                onChange={(e) => setSelectedCommission(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Commission Types</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
                <option value="negotiable">Commission Negotiable</option>
                <option value="no_commission">No Commission</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="views">Sort: Most Viewed</option>
                <option value="popular">Sort: Most In-Demand</option>
              </select>

              <button
                onClick={fetchDiscoverListings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No referral listings found</h3>
              <p className="text-slate-400 text-sm mt-1">
                Try loosening your search filters or be the first to publish a referral opportunity!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Publish First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3.5">
                    {/* Header: Type Pill & Commission Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          l.listingType === "offering"
                            ? "bg-emerald-950/70 text-emerald-400 border border-emerald-500/30"
                            : "bg-indigo-950/70 text-indigo-400 border border-indigo-500/30"
                        }`}
                      >
                        {l.listingType === "offering" ? "Offering Intros" : "Seeking Intros"}
                      </span>

                      <button
                        onClick={() => handleToggleSaveListing(l.id, Boolean(l.isSaved))}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          l.isSaved
                            ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                            : "bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                        title={l.isSaved ? "Saved" : "Save Listing"}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Listing Title */}
                    <div>
                      <h3
                        onClick={() => setSelectedListingDetail(l)}
                        className="text-base font-bold text-white hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer"
                      >
                        {l.title}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {l.description}
                      </p>
                    </div>

                    {/* Meta Specs */}
                    <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Target Audience:</span>
                        <span className="font-medium text-right truncate max-w-[170px]">{l.targetAudience}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Commission:</span>
                        <span className="font-semibold text-emerald-400 text-right truncate max-w-[170px]">
                          {l.disclosedCommissionDetails || l.commissionChoice.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Arrangement:</span>
                        <span className="capitalize text-slate-300">{l.referralArrangement.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Publisher */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold shrink-0">
                        {l.startup ? "🏢" : "👤"}
                      </div>
                      <span className="text-xs text-slate-300 truncate font-medium">
                        {l.startup?.name || l.publisherProfile?.displayName || "Founder"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setSelectedListingDetail(l)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setRequestModalListing(l)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg font-semibold flex items-center gap-1 shadow"
                      >
                        <span>{l.listingType === "offering" ? "Request" : "Offer"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: MY REFERRAL LISTINGS
      ========================================================================== */}
      {activeTab === "my_listings" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Your Published Referral Opportunities</h3>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Listing
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">You haven't published any referral listings yet.</p>
              <p className="text-slate-500 text-xs mt-1">Publish an offering or request to find synergistic referral partners.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((l) => (
                <div
                  key={l.id}
                  className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {l.listingType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          l.status === "active" ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {l.status}
                      </span>
                      <span className="text-xs text-slate-400">• {l.industry}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{l.title}</h4>
                    <p className="text-xs text-slate-400">
                      Terms: <span className="text-emerald-400">{l.disclosedCommissionDetails || l.commissionChoice}</span> • {l.viewsCount} views • {l.requestsCount} requests
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setSelectedListingDetail(l)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                    >
                      View Public Page
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("requests");
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                    >
                      View Requests ({l.requestsCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: REQUESTS & PROPOSALS
      ========================================================================== */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Incoming & Sent Referral Requests</h3>

          {requests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Send className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">No referral requests active right now.</p>
              <p className="text-slate-500 text-xs mt-1">Discover listings and submit an introduction request to get started.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs text-slate-400">Listing Reference:</span>
                      <h4 className="text-sm font-bold text-white">{r.listing?.title || "Referral Opportunity"}</h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        r.status === "accepted"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : r.status === "rejected"
                          ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                          : "bg-amber-950 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block mb-1">Message from Requester:</span>
                      <p className="text-slate-200 leading-relaxed">{r.message}</p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block mb-1">Potential Opportunity / Lead:</span>
                      <p className="text-emerald-400 font-medium">{r.potentialOpportunity}</p>
                      <span className="text-slate-400 block mt-2 mb-0.5">Relevance Rationale:</span>
                      <p className="text-slate-300">{r.relevance}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Submitted on {new Date(r.createdAt).toLocaleDateString()} by {r.requesterProfile?.displayName || "Partner"}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Message Partner (Direct messaging permission check) */}
                      <button
                        onClick={() => handleCheckDirectMessage(r.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        Message Partner
                      </button>

                      {/* View Commission Agreement */}
                      {r.commissionAgreementId && (
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/founders/referrals/requests/${r.id}/commission`, {
                              headers: getHeaders(),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setCommissionAgreementModal({
                                open: true,
                                requestId: r.id,
                                agreement: data.agreement,
                              });
                            }
                          }}
                          className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Commission Terms
                        </button>
                      )}

                      {/* If pending response */}
                      {r.status === "submitted" && (
                        <>
                          <button
                            onClick={() => handleRespondRequest(r.id, "reject")}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-xs font-semibold"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespondRequest(r.id, "accept")}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                          >
                            Accept & Agree Terms
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: ACTIVE PIPELINE
      ========================================================================== */}
      {activeTab === "pipeline" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Referral Introduction & Conversion Pipeline</h3>
              <p className="text-xs text-slate-400">Track stage progression from introduction to closing with customer data protection.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" /> Customer Privacy Protected
            </div>
          </div>

          {pipeline.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">No active referral pipelines currently tracking.</p>
              <p className="text-slate-500 text-xs mt-1">When a referral request is accepted, it automatically tracks here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pipeline.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-mono">Lead Reference:</span>
                      <h4 className="text-base font-bold text-white">{p.customerReference}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                        {p.stage}
                      </span>
                      <button
                        onClick={() => {
                          setPipelineDetailModal(p);
                          setUpdateStage(p.stage);
                          if (p.customerPrivateData) {
                            setUpdatePrivateCompany(p.customerPrivateData.companyName || "");
                            setUpdatePrivateName(p.customerPrivateData.contactName || "");
                            setUpdatePrivateEmail(p.customerPrivateData.contactEmail || "");
                            setUpdatePrivatePhone(p.customerPrivateData.contactPhone || "");
                            setUpdatePrivateNotes(p.customerPrivateData.notes || "");
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Manage Pipeline
                      </button>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-bold uppercase">
                    {[
                      { key: "accepted", label: "Accepted" },
                      { key: "introduced", label: "Introduced" },
                      { key: "contacted", label: "Contacted" },
                      { key: "qualified", label: "Qualified" },
                      { key: "converted", label: "Converted" },
                      { key: "closed", label: "Closed" },
                    ].map((step, idx) => {
                      const stagesOrder = ["accepted", "introduced", "contacted", "qualified", "converted", "closed"];
                      const currentIdx = stagesOrder.indexOf(p.stage);
                      const isPastOrCurrent = currentIdx >= idx;
                      return (
                        <div
                          key={step.key}
                          className={`py-1.5 rounded-lg border transition-all ${
                            isPastOrCurrent
                              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400 font-bold"
                              : "bg-slate-950/50 border-slate-800 text-slate-600"
                          }`}
                        >
                          {step.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Outcome & Financials Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Reported Deal Revenue:</span>
                      <span className="font-bold text-white font-mono">
                        {p.reportedRevenueValue ? `₹${p.reportedRevenueValue.toLocaleString()}` : "Not reported yet"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Commission Outcome:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {p.calculatedCommissionAmount ? `₹${p.calculatedCommissionAmount.toLocaleString()}` : "Terms in progress"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Payment Status:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize text-[11px] font-semibold">
                        {p.paymentStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Protected Customer Contact Information */}
                  {p.customerPrivateData && (
                    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                        <Lock className="w-3.5 h-3.5" /> Authorized Lead Information (Confidential)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-300">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Company:</span>
                          <span className="font-medium">{p.customerPrivateData.companyName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Contact Person:</span>
                          <span className="font-medium">{p.customerPrivateData.contactName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Email / Phone:</span>
                          <span className="font-medium text-emerald-400">
                            {p.customerPrivateData.contactEmail || p.customerPrivateData.contactPhone || "Masked"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: EXCHANGE ANALYTICS
      ========================================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Database-Backed Referral Metrics</h3>
            <span className="text-xs text-slate-500">Live platform computed totals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Listings", value: analytics?.activeListingsCount ?? 0, icon: Briefcase, color: "text-emerald-400" },
              { label: "Requests Sent", value: analytics?.requestsSentCount ?? 0, icon: Send, color: "text-indigo-400" },
              { label: "Requests Received", value: analytics?.requestsReceivedCount ?? 0, icon: Clock, color: "text-amber-400" },
              { label: "Accepted Referrals", value: analytics?.acceptedReferralsCount ?? 0, icon: CheckCircle2, color: "text-teal-400" },
              { label: "Introductions Done", value: analytics?.introductionsCompletedCount ?? 0, icon: Share2, color: "text-blue-400" },
              { label: "Qualified Leads", value: analytics?.qualifiedLeadsCount ?? 0, icon: UserCheck, color: "text-purple-400" },
              { label: "Reported Conversions", value: analytics?.reportedConversionsCount ?? 0, icon: TrendingUp, color: "text-rose-400" },
              {
                label: "Total Reported Revenue",
                value: analytics?.totalReportedRevenue ? `₹${analytics.totalReportedRevenue.toLocaleString()}` : "₹0",
                icon: DollarSign,
                color: "text-emerald-400",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs">{stat.label}</span>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-bold text-white font-mono">{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & OVERLAYS
      ========================================================================== */}

      {/* 1. CREATE LISTING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Publish Referral Opportunity
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4 text-xs">
              {/* Type Selector (Offering vs Requesting) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormListingType("offering")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formListingType === "offering"
                      ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="block text-sm">Offering a Referral</span>
                  <span className="text-[10px] text-slate-400 font-normal">I can provide warm introductions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormListingType("requesting")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formListingType === "requesting"
                      ? "bg-indigo-950/70 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="block text-sm">Requesting a Referral</span>
                  <span className="text-[10px] text-slate-400 font-normal">I need intros to specific buyers</span>
                </button>
              </div>

              {/* Publisher Entity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Publishing Identity</label>
                  <select
                    value={formPublisherType}
                    onChange={(e) => setFormPublisherType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="individual">As Individual Founder</option>
                    <option value="startup">On Behalf of Startup</option>
                  </select>
                </div>
                {formPublisherType === "startup" && (
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Select Startup</label>
                    <select
                      value={formStartupId}
                      onChange={(e) => setFormStartupId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                    >
                      <option value="st-dev">NovaTech (Your Startup)</option>
                      <option value="st-mesh">BharatFin (Managed)</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Listing Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Enterprise FinTech Introductions across Mumbai & Bengaluru"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Detailed Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail exact relationships, networks, or specific target decision-makers you are engaging..."
                  className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Industry</label>
                  <select
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="FinTech">FinTech</option>
                    <option value="E-Commerce">E-Commerce / D2C</option>
                    <option value="B2B SaaS">B2B SaaS</option>
                    <option value="Logistics">Logistics</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Broad Region</label>
                  <input
                    type="text"
                    value={formBroadRegion}
                    onChange={(e) => setFormBroadRegion(e.target.value)}
                    placeholder="e.g. Bengaluru, Mumbai, Pan-India"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Customer / Audience</label>
                  <input
                    type="text"
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value)}
                    placeholder="e.g. Tier-1 NBFCs, D2C Lifestyle Brands"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Customer Category</label>
                  <input
                    type="text"
                    value={formCustomerCategory}
                    onChange={(e) => setFormCustomerCategory(e.target.value)}
                    placeholder="e.g. Enterprise B2B, Retail Brands"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Product or Service Involved</label>
                  <input
                    type="text"
                    value={formProductOrService}
                    onChange={(e) => setFormProductOrService(e.target.value)}
                    placeholder="e.g. Cloud Telemetry, Conversion Engine"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ideal Referral Profile</label>
                  <input
                    type="text"
                    value={formIdealProfile}
                    onChange={(e) => setFormIdealProfile(e.target.value)}
                    placeholder="e.g. CTOs, VP Growth, Head of Compliance"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Required Qualifications / Conditions</label>
                  <input
                    type="text"
                    value={formQualifications}
                    onChange={(e) => setFormQualifications(e.target.value)}
                    placeholder="e.g. Must have SOC2 or Shopify store"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Expected Outcome</label>
                  <input
                    type="text"
                    value={formExpectedOutcome}
                    onChange={(e) => setFormExpectedOutcome(e.target.value)}
                    placeholder="e.g. Executive Intro & Scheduled POC"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Arrangement</label>
                  <select
                    value={formArrangement}
                    onChange={(e) => setFormArrangement(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="commission_based">Commission-Based</option>
                    <option value="mutual_referral">Mutual Referral</option>
                    <option value="one_way">One-Way</option>
                    <option value="non_commercial">Non-Commercial</option>
                    <option value="open_discussion">Open to Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Website URL (Optional)</label>
                  <input
                    type="url"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              {/* Option C: Commission Policy Choice */}
              <div className="border border-indigo-500/30 bg-slate-950/70 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Option C Commission Terms
                  </span>
                  <span className="text-[10px] text-slate-400">Public or Private Negotiation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Commission Model</label>
                    <select
                      value={formCommissionChoice}
                      onChange={(e) => setFormCommissionChoice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                    >
                      <option value="percentage">Percentage (%) Commission</option>
                      <option value="fixed">Fixed (₹) Commission</option>
                      <option value="recurring">Recurring Commission</option>
                      <option value="negotiable">Commission Negotiable</option>
                      <option value="no_commission">No Commission (Non-Commercial)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Disclosed Details</label>
                    <input
                      type="text"
                      value={formDisclosedCommission}
                      onChange={(e) => setFormDisclosedCommission(e.target.value)}
                      placeholder="e.g. 10% of Year 1 contract, or ₹15,000 per deal"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SUBMIT REFERRAL REQUEST MODAL */}
      {requestModalListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Send Referral Request:</span>
                <h3 className="text-sm font-bold text-white">{requestModalListing.title}</h3>
              </div>
              <button onClick={() => setRequestModalListing(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Personalized Introduction Message</label>
                <textarea
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're reaching out regarding this referral..."
                  className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Specific Opportunity / Proposed Introduction</label>
                <input
                  type="text"
                  value={reqOpportunity}
                  onChange={(e) => setReqOpportunity(e.target.value)}
                  placeholder="e.g. Series A Lending Tech in Bengaluru or Top D2C Apparel Founder"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Why this is Relevant (Mutual Fit)</label>
                <textarea
                  value={reqRelevance}
                  onChange={(e) => setReqRelevance(e.target.value)}
                  placeholder="Explain why this prospect is looking for this solution and how you know them..."
                  className="w-full h-16 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Expected Outcome (Goal)</label>
                <input
                  type="text"
                  value={reqExpectedOutcome}
                  onChange={(e) => setReqExpectedOutcome(e.target.value)}
                  placeholder="e.g. Schedule discovery call, pilot agreement"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRequestModalListing(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. COMMISSION AGREEMENT & NEGOTIATION MODAL (OPTION C) */}
      {commissionAgreementModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl p-6 space-y-5 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Referral Commission Agreement</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      commissionAgreementModal.agreement?.isFullyConfirmed
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-950 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {commissionAgreementModal.agreement?.isFullyConfirmed ? "Both Parties Confirmed" : "Confirmation Required"}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Option C: Both parties must explicitly confirm terms before referral activation.
                </p>
              </div>
              <button
                onClick={() => setCommissionAgreementModal({ open: false, requestId: "", agreement: null })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Version History & Terms */}
            <div className="space-y-3">
              <span className="font-semibold text-slate-300 block">Version History & Proposed Terms:</span>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {commissionAgreementModal.agreement?.versions?.map((v: ReferralCommissionVersion) => (
                  <div
                    key={v.version}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      v.status === "confirmed"
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                        : "bg-slate-950/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        Version {v.version} ({v.commissionType.replace(/_/g, " ")})
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800">
                        {v.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Rate / Amount:</span>
                        <span className="font-bold text-emerald-400">{v.rateOrAmount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Calculation Basis:</span>
                        <span>{v.calculationBasis}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong>Responsibilities:</strong> {v.responsibilities}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-500">
                        Publisher Confirmed: {v.confirmedByPartyA ? "✅" : "⏳ Pending"} | Requester Confirmed: {v.confirmedByPartyB ? "✅" : "⏳ Pending"}
                      </span>

                      {v.status !== "confirmed" && (
                        <button
                          onClick={() => handleConfirmCommission(v.version)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold"
                        >
                          Confirm Version {v.version}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Propose Counter-Terms Form */}
            <form onSubmit={handleProposeCommission} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Propose Revised / Counter Terms
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Commission Type</label>
                  <select
                    value={counterCommType}
                    onChange={(e) => setCounterCommType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                    <option value="recurring">Recurring</option>
                    <option value="no_commission">No Commission</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Rate or Amount</label>
                  <input
                    type="text"
                    value={counterRateOrAmount}
                    onChange={(e) => setCounterRateOrAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Calculation Basis</label>
                  <input
                    type="text"
                    value={counterCalcBasis}
                    onChange={(e) => setCounterCalcBasis(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Payment Frequency</label>
                  <input
                    type="text"
                    value={counterPaymentFreq}
                    onChange={(e) => setCounterPaymentFreq(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Coordinated Responsibilities</label>
                <input
                  type="text"
                  value={counterResponsibilities}
                  onChange={(e) => setCounterResponsibilities(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  Submit Counter Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PIPELINE STAGE & OUTCOME MANAGEMENT MODAL */}
      {pipelineDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 block">Manage Referral Pipeline:</span>
                <h3 className="text-sm font-bold text-white">{pipelineDetailModal.customerReference}</h3>
              </div>
              <button onClick={() => setPipelineDetailModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Advance Stage & Record Private Lead Data */}
            <form onSubmit={handleUpdatePipelineStage} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white block">Update Pipeline Stage</span>
              <div className="flex gap-2">
                <select
                  value={updateStage}
                  onChange={(e) => setUpdateStage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="accepted">1. Accepted</option>
                  <option value="introduced">2. Introduced (Intro Email/Call Done)</option>
                  <option value="contacted">3. Contacted (Discovery Started)</option>
                  <option value="qualified">4. Qualified (Active Requirement)</option>
                  <option value="converted">5. Converted (Contract Signed)</option>
                  <option value="closed">6. Closed</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shrink-0"
                >
                  Update Stage
                </button>
              </div>

              {/* Private Lead Info Input */}
              <div className="border-t border-slate-800/80 pt-2 space-y-2">
                <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Update Protected Lead Contact Information
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={updatePrivateCompany}
                    onChange={(e) => setUpdatePrivateCompany(e.target.value)}
                    placeholder="Company Name"
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                  <input
                    type="text"
                    value={updatePrivateName}
                    onChange={(e) => setUpdatePrivateName(e.target.value)}
                    placeholder="Contact Person"
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    value={updatePrivateEmail}
                    onChange={(e) => setUpdatePrivateEmail(e.target.value)}
                    placeholder="Contact Email"
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                  <input
                    type="text"
                    value={updatePrivatePhone}
                    onChange={(e) => setUpdatePrivatePhone(e.target.value)}
                    placeholder="Contact Phone"
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>
            </form>

            {/* 2. Record Revenue & Outcome */}
            <form onSubmit={handleRecordOutcome} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white block">Record Conversion Outcome & Revenue</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Contract Revenue (₹)</label>
                  <input
                    type="number"
                    value={outcomeRevenue}
                    onChange={(e) => setOutcomeRevenue(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Commission Due (₹)</label>
                  <input
                    type="number"
                    value={outcomeCommission}
                    onChange={(e) => setOutcomeCommission(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>
              <input
                type="text"
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Outcome notes, enterprise deal summary..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                required
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
              >
                Save Outcome
              </button>
            </form>

            {/* 3. Record Payment Status with Regulatory Disclaimer */}
            <form onSubmit={handleRecordPayment} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white block">Commission Settlement Status</span>
              <div className="flex gap-2">
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="pending">Pending Settlement</option>
                  <option value="reported_paid">Reported Paid (Direct Bank / Provider)</option>
                  <option value="disputed">Disputed Terms</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Payment settlement notes or reference (optional)..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Save Payment Status
                </button>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
                <strong>Disclaimer:</strong> Balaga does not operate escrow or hold funds. Payments occur directly between parties.
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MESSAGING PERMISSIONS CHECK MODAL */}
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
                    showToast("Opening conversation in Founders Inbox...");
                    if (onNavigateTab) onNavigateTab("inbox");
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Open Founders Inbox
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMessageCheckModal(null);
                    showToast("Redirecting to Founder Network to connect...");
                    if (onNavigateTab) onNavigateTab("network");
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Send Connection Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. LISTING DETAIL MODAL */}
      {selectedListingDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl p-6 space-y-4 my-8 text-xs">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedListingDetail.listingType === "offering"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                      : "bg-indigo-950 text-indigo-400 border border-indigo-500/30"
                  }`}
                >
                  {selectedListingDetail.listingType === "offering" ? "Offering Introductions" : "Requesting Introductions"}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{selectedListingDetail.title}</h3>
              </div>
              <button onClick={() => setSelectedListingDetail(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>{selectedListingDetail.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Industry:</span>
                  <span className="font-semibold text-white">{selectedListingDetail.industry}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Broad Region:</span>
                  <span className="font-semibold text-white">{selectedListingDetail.broadRegion}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Arrangement:</span>
                  <span className="capitalize">{selectedListingDetail.referralArrangement.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Commission Terms:</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedListingDetail.disclosedCommissionDetails || selectedListingDetail.commissionChoice}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Ideal Target Profile:</span>
                <p className="text-slate-200">{selectedListingDetail.idealReferralProfile}</p>
              </div>

              {selectedListingDetail.requiredQualifications && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Required Qualifications:</span>
                  <p className="text-slate-200">{selectedListingDetail.requiredQualifications}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setReportListingId(selectedListingDetail.id)}
                className="text-slate-500 hover:text-rose-400 flex items-center gap-1 text-[11px]"
              >
                <Flag className="w-3.5 h-3.5" /> Report Listing
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedListingDetail(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const l = selectedListingDetail;
                    setSelectedListingDetail(null);
                    setRequestModalListing(l);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  {selectedListingDetail.listingType === "offering" ? "Request Introduction" : "Offer Referral"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. REPORT LISTING MODAL */}
      {reportListingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" /> Report Referral Listing
            </h3>
            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="misleading_commission">Misleading Commission Claims</option>
                  <option value="spam">Spam / Low Quality Mass Outreach</option>
                  <option value="fake_referral">Fake or Fabricated Lead Claims</option>
                  <option value="suspicious_link">Malicious or Suspicious Links</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Details</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context for platform moderation..."
                  className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportListingId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
