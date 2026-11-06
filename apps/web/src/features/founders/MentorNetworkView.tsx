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
  DollarSign,
  TrendingUp,
  Briefcase,
  X,
  FileText,
  UserCheck,
  Bookmark,
  Flag,
  Sparkles,
  Calendar,
  Award,
  BookOpen,
  Check,
  Target,
  ListTodo,
} from "lucide-react";
import {
  MentorProfile,
  MentorshipRequest,
  MentorshipAgreement,
  MentorshipWorkspace,
  MentorshipSession,
  MentorshipGoal,
  MentorshipActionItem,
  MentorshipResource,
  MentorshipReview,
  MentorDashboardStats,
  MenteeDashboardStats,
} from "@platform/shared-types";
import { MENTOR_EXPERTISE_CATEGORIES } from "@platform/config";

interface MentorNetworkViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const MentorNetworkView: React.FC<MentorNetworkViewProps> = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "discover" | "recommended" | "workspaces" | "requests" | "sessions" | "mentor_dashboard" | "mentee_dashboard"
  >("discover");

  // Discovery state & filters
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [recommendedMentors, setRecommendedMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExpertise, setSelectedExpertise] = useState<string>("all");
  const [selectedPricing, setSelectedPricing] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");

  // Requests, workspaces & sessions state
  const [sentRequests, setSentRequests] = useState<MentorshipRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MentorshipRequest[]>([]);
  const [requestsSubTab, setRequestsSubTab] = useState<"sent" | "incoming">("sent");


  // User's own mentor profile & analytics
  const [myMentorProfile, setMyMentorProfile] = useState<MentorProfile | null>(null);
  const [mentorStats, setMentorStats] = useState<MentorDashboardStats | null>(null);
  const [menteeStats, setMenteeStats] = useState<MenteeDashboardStats | null>(null);

  // Modals state
  const [selectedMentorDetail, setSelectedMentorDetail] = useState<MentorProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestTargetMentor, setRequestTargetMentor] = useState<MentorProfile | null>(null);
  const [activeWorkspaceModal, setActiveWorkspaceModal] = useState<MentorshipWorkspace | null>(null);
  const [workspaceSubTab, setWorkspaceSubTab] = useState<
    "overview" | "sessions" | "goals" | "action_items" | "resources" | "notes" | "payment" | "review"
  >("overview");
  const [agreementModal, setAgreementModal] = useState<{
    open: boolean;
    requestId: string;
    agreement: MentorshipAgreement | null;
  }>({
    open: false,
    requestId: "",
    agreement: null,
  });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [messageCheckModal, setMessageCheckModal] = useState<{
    open: boolean;
    canMessage: boolean;
    isPremium: boolean;
    note: string;
    targetName: string;
  } | null>(null);
  const [reportMentorId, setReportMentorId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("misleading_experience");
  const [reportDetails, setReportDetails] = useState<string>("");

  // Create / Edit Profile Form State
  const [formHeadline, setFormHeadline] = useState<string>("");
  const [formIntro, setFormIntro] = useState<string>("");
  const [formExperience, setFormExperience] = useState<string>("");
  const [formExpertise, setFormExpertise] = useState<string[]>(["Startup Building", "Software Engineering"]);
  const [formIndustries, setFormIndustries] = useState<string>("FinTech, SaaS, Developer Tools");
  const [formSkills, setFormSkills] = useState<string>("Architecture, Scaling, Go, React, PostgreSQL");
  const [formCompanyExp, setFormCompanyExp] = useState<string>("");
  const [formPrevMentoring, setFormPrevMentoring] = useState<string>("");
  const [formAchievements, setFormAchievements] = useState<string>("");
  const [formLanguages, setFormLanguages] = useState<string>("English, Hindi");
  const [formLocation, setFormLocation] = useState<string>("Bengaluru, Karnataka");
  const [formPreferredMentees, setFormPreferredMentees] = useState<string>("Technical Founders, Early-stage Teams");
  const [formAvailability, setFormAvailability] = useState<string>("Tuesday & Thursday evenings (6:00 PM - 9:00 PM IST)");
  const [formMeetingFormat, setFormMeetingFormat] = useState<"online" | "in_person" | "hybrid">("online");
  const [formPricingOption, setFormPricingOption] = useState<
    "free" | "paid" | "first_session_free" | "custom" | "discussion"
  >("paid");
  const [formPrice, setFormPrice] = useState<number>(3000);
  const [formDuration, setFormDuration] = useState<number>(45);
  const [formPricingBasis, setFormPricingBasis] = useState<"per_session" | "monthly" | "total_package" | "custom">(
    "per_session"
  );
  const [formSubsequentPrice, setFormSubsequentPrice] = useState<number>(3500);
  const [formCancellation, setFormCancellation] = useState<string>(
    "Free cancellation or reschedule up to 24 hours prior to session."
  );
  const [formWebsiteUrl, setFormWebsiteUrl] = useState<string>("");
  const [formPortfolioUrl, setFormPortfolioUrl] = useState<string>("");

  // Mentorship Request Form State
  const [reqProjectName, setReqProjectName] = useState<string>("");
  const [reqHelpNeeded, setReqHelpNeeded] = useState<string>("");
  const [reqSpecificChallenge, setReqSpecificChallenge] = useState<string>("");
  const [reqGoals, setReqGoals] = useState<string>("");
  const [reqReason, setReqReason] = useState<string>("");
  const [reqFormat, setReqFormat] = useState<
    "one_time" | "ongoing" | "project" | "startup" | "career" | "group"
  >("ongoing");
  const [reqAvailability, setReqAvailability] = useState<string>("Flexible weekday mornings");
  const [reqBudget, setReqBudget] = useState<string>("₹3,000 per session");
  const [reqExpectedDuration, setReqExpectedDuration] = useState<string>("3 Months (bi-weekly)");
  const [reqContext, setReqContext] = useState<string>("");

  // Counter proposal form state
  const [counterPrice, setCounterPrice] = useState<number>(3000);
  const [counterPricingOption, setCounterPricingOption] = useState<string>("paid");
  const [counterDuration, setCounterDuration] = useState<number>(45);
  const [counterCancellation, setCounterCancellation] = useState<string>("24 hours notice required");

  // Schedule session form state
  const [sessTitle, setSessTitle] = useState<string>("Deep Dive Strategy Session");
  const [sessDate, setSessDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [sessTime, setSessTime] = useState<string>("10:00");
  const [sessDuration, setSessDuration] = useState<number>(45);
  const [sessFormat, setSessFormat] = useState<"online" | "in_person" | "hybrid">("online");
  const [sessMeetingLink, setSessMeetingLink] = useState<string>("https://meet.balaga.online/session-link");
  const [sessAgenda, setSessAgenda] = useState<string>("");

  // Workspace sub-items state
  const [workspaceGoals, setWorkspaceGoals] = useState<MentorshipGoal[]>([]);
  const [workspaceActionItems, setWorkspaceActionItems] = useState<MentorshipActionItem[]>([]);
  const [workspaceResources, setWorkspaceResources] = useState<MentorshipResource[]>([]);
  const [workspaceSessions, setWorkspaceSessions] = useState<MentorshipSession[]>([]);
  const [workspaceReviews, setWorkspaceReviews] = useState<MentorshipReview[]>([]);
  const [sharedNotesText, setSharedNotesText] = useState<string>("");
  const [privateNotesText, setPrivateNotesText] = useState<string>("");

  // Form states for new goal / action item / resource
  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [newGoalDesc, setNewGoalDesc] = useState<string>("");
  const [newGoalDate, setNewGoalDate] = useState<string>(
    new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0]
  );
  const [newActionTask, setNewActionTask] = useState<string>("");
  const [newActionDue, setNewActionDue] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [newResTitle, setNewResTitle] = useState<string>("");
  const [newResType, setNewResType] = useState<"document" | "link" | "template" | "guide">("link");
  const [newResUrl, setNewResUrl] = useState<string>("");

  // Review form state
  const [reviewKnowledge, setReviewKnowledge] = useState<number>(5);
  const [reviewComm, setReviewComm] = useState<number>(5);
  const [reviewHelp, setReviewHelp] = useState<number>(5);
  const [reviewProf, setReviewProf] = useState<number>(5);
  const [reviewReliability, setReviewReliability] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [mentorReplyText, setMentorReplyText] = useState<string>("");

  // Payment status form state
  const [paymentStatusChoice, setPaymentStatusChoice] = useState<
    "not_due" | "pending" | "reported_paid" | "disputed" | "cancelled"
  >("reported_paid");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Toast / alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getHeaders = () => ({
    "x-platform-world": "founders",
    "Content-Type": "application/json",
  });

  // Fetch mentors discovery
  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedExpertise !== "all") params.append("expertise", selectedExpertise);
      if (selectedPricing !== "all") params.append("pricingOption", selectedPricing);
      if (selectedFormat !== "all") params.append("meetingFormat", selectedFormat);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("sortBy", sortBy);

      const res = await fetch(`/api/founders/mentors/discover?${params.toString()}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMentors(data.mentors || []);
      }
    } catch (e) {
      console.error("Failed to fetch mentors", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommended mentors
  const fetchRecommended = async () => {
    try {
      const res = await fetch("/api/founders/mentors/recommended", {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendedMentors(data.mentors || []);
      }
    } catch (e) {
      console.error("Failed to fetch recommended mentors", e);
    }
  };

  // Fetch my profile
  const fetchMyProfile = async () => {
    try {
      const res = await fetch("/api/founders/mentors/profiles/my-profile", {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.mentor) {
          setMyMentorProfile(data.mentor);
          // populate form
          setFormHeadline(data.mentor.headline);
          setFormIntro(data.mentor.introduction);
          setFormExperience(data.mentor.professionalExperience);
          setFormExpertise(data.mentor.expertise);
          setFormIndustries(data.mentor.industries.join(", "));
          setFormSkills(data.mentor.skills.join(", "));
          setFormCompanyExp(data.mentor.companyExperience);
          setFormPrevMentoring(data.mentor.previousMentoringExperience || "");
          setFormAchievements(data.mentor.achievements || "");
          setFormLanguages(data.mentor.languages.join(", "));
          setFormLocation(data.mentor.broadLocation);
          setFormPreferredMentees(data.mentor.preferredMenteeCategories.join(", "));
          setFormAvailability(data.mentor.availabilityDescription);
          setFormMeetingFormat(data.mentor.preferredMeetingFormat);
          setFormPricingOption(data.mentor.pricing.pricingOption);
          setFormPrice(data.mentor.pricing.price || 3000);
          setFormDuration(data.mentor.pricing.sessionDurationMinutes || 45);
          setFormPricingBasis(data.mentor.pricing.pricingBasis || "per_session");
          setFormSubsequentPrice(data.mentor.pricing.subsequentSessionPrice || 3500);
          setFormCancellation(data.mentor.pricing.cancellationTerms || "");
          setFormWebsiteUrl(data.mentor.websiteUrl || "");
          setFormPortfolioUrl(data.mentor.portfolioUrl || "");
        }
      }
    } catch (e) {
      console.error("Failed to fetch user mentor profile", e);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const [sentRes, incomingRes] = await Promise.all([
        fetch("/api/founders/mentors/requests/my-requests", { headers: getHeaders() }),
        fetch("/api/founders/mentors/requests/incoming", { headers: getHeaders() }),
      ]);
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests || []);
      }
      if (incomingRes.ok) {
        const data = await incomingRes.json();
        setIncomingRequests(data.requests || []);
      }
    } catch (e) {
      console.error("Failed to fetch requests", e);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const [mStatsRes, menteeStatsRes] = await Promise.all([
        fetch("/api/founders/mentors/dashboard/mentor-stats", { headers: getHeaders() }),
        fetch("/api/founders/mentors/dashboard/mentee-stats", { headers: getHeaders() }),
      ]);
      if (mStatsRes.ok) {
        const data = await mStatsRes.json();
        setMentorStats(data.stats);
      }
      if (menteeStatsRes.ok) {
        const data = await menteeStatsRes.json();
        setMenteeStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  // Fetch single workspace detail
  const openWorkspace = async (workspaceId: string) => {
    try {
      const res = await fetch(`/api/founders/mentors/workspaces/${workspaceId}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveWorkspaceModal(data.workspace);
        setWorkspaceGoals(data.goals || []);
        setWorkspaceActionItems(data.actionItems || []);
        setWorkspaceResources(data.resources || []);
        setWorkspaceSessions(data.sessions || []);
        setWorkspaceReviews(data.reviews || []);
        setSharedNotesText(data.workspace.sharedNotes || "");
        setPrivateNotesText(
          data.isMentor ? data.workspace.mentorPrivateNotes || "" : data.workspace.menteePrivateNotes || ""
        );
        setWorkspaceSubTab("overview");
      }
    } catch (e) {
      console.error("Failed to fetch workspace", e);
    }
  };

  useEffect(() => {
    fetchMentors();
    fetchRecommended();
    fetchMyProfile();
    fetchRequests();
    fetchAnalytics();
  }, [selectedExpertise, selectedPricing, selectedFormat, sortBy]);

  // Handle Save / Edit Profile
  const handleSaveProfile = async (isDraft = false) => {
    try {
      const payload = {
        headline: formHeadline,
        introduction: formIntro,
        professionalExperience: formExperience,
        expertise: formExpertise,
        industries: formIndustries.split(",").map((s) => s.trim()).filter(Boolean),
        skills: formSkills.split(",").map((s) => s.trim()).filter(Boolean),
        companyExperience: formCompanyExp,
        previousMentoringExperience: formPrevMentoring,
        achievements: formAchievements,
        languages: formLanguages.split(",").map((s) => s.trim()).filter(Boolean),
        broadLocation: formLocation,
        preferredMenteeCategories: formPreferredMentees.split(",").map((s) => s.trim()).filter(Boolean),
        availabilityDescription: formAvailability,
        preferredMeetingFormat: formMeetingFormat,
        pricing: {
          pricingOption: formPricingOption,
          price: formPricingOption === "free" ? 0 : Number(formPrice),
          currency: "INR",
          sessionDurationMinutes: Number(formDuration),
          pricingBasis: formPricingBasis,
          subsequentSessionPrice: formPricingOption === "first_session_free" ? Number(formSubsequentPrice) : undefined,
          cancellationTerms: formCancellation,
        },
        websiteUrl: formWebsiteUrl || null,
        portfolioUrl: formPortfolioUrl || null,
        isDraft,
      };

      const url = myMentorProfile
        ? `/api/founders/mentors/profiles/${myMentorProfile.id}`
        : "/api/founders/mentors/profiles";
      const method = myMentorProfile ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setMyMentorProfile(data.mentor);
        setIsProfileModalOpen(false);
        showToast(myMentorProfile ? "Mentor profile updated!" : "Mentor profile published!");
        fetchMentors();
        fetchMyProfile();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save profile");
      }
    } catch (e) {
      console.error(e);
      showToast("Error saving profile");
    }
  };

  // Handle Toggle Status (Active / Paused)
  const handleToggleStatus = async (status: "active" | "paused") => {
    if (!myMentorProfile) return;
    try {
      const res = await fetch(`/api/founders/mentors/profiles/${myMentorProfile.id}/status`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMyMentorProfile({ ...myMentorProfile, status });
        showToast(`Mentor profile status changed to ${status}`);
        fetchMentors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Bookmark Toggle
  const handleToggleBookmark = async (mentorId: string) => {
    try {
      const res = await fetch(`/api/founders/mentors/profiles/${mentorId}/bookmark`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        setMentors((prev) =>
          prev.map((m) => (m.id === mentorId ? { ...m, isSaved: data.isSaved } : m))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Submit Mentorship Request
  const handleSubmitRequest = async () => {
    if (!requestTargetMentor) return;
    try {
      const payload = {
        mentorId: requestTargetMentor.id,
        projectOrStartupName: reqProjectName,
        helpNeeded: reqHelpNeeded,
        specificChallenge: reqSpecificChallenge,
        goals: reqGoals,
        reasonForSelection: reqReason,
        preferredFormat: reqFormat,
        preferredAvailability: reqAvailability,
        budget: reqBudget,
        expectedDuration: reqExpectedDuration,
        additionalContext: reqContext,
      };

      const res = await fetch("/api/founders/mentors/requests", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setIsRequestModalOpen(false);
        showToast(data.message || "Mentorship request submitted!");
        fetchRequests();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to submit request");
      }
    } catch (e) {
      console.error(e);
      showToast("Error submitting mentorship request");
    }
  };

  // Handle Mentor/Mentee Request Response (Accept, Reject, Withdraw)
  const handleRespondRequest = async (requestId: string, action: string, notes?: string) => {
    try {
      const res = await fetch(`/api/founders/mentors/requests/${requestId}/respond`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action, reasonOrNotes: notes }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "Request updated");
        fetchRequests();
        if (data.workspace) {
          openWorkspace(data.workspace.id);
        }
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to respond");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Message Check
  const handleCheckMessaging = async (requestId: string, targetName: string) => {
    try {
      const res = await fetch(`/api/founders/mentors/requests/${requestId}/message-check`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMessageCheckModal({
          open: true,
          canMessage: data.canMessage,
          isPremium: data.isPremium,
          note: data.note,
          targetName,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Option C Agreement Modal
  const openAgreement = async (requestId: string) => {
    try {
      const res = await fetch(`/api/founders/mentors/requests/${requestId}/agreement`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAgreementModal({ open: true, requestId, agreement: data.agreement });
        if (data.agreement?.activeTerms) {
          setCounterPrice(data.agreement.activeTerms.price || 3000);
          setCounterPricingOption(data.agreement.activeTerms.pricingOption);
          setCounterDuration(data.agreement.activeTerms.sessionDurationMinutes || 45);
          setCounterCancellation(data.agreement.activeTerms.cancellationTerms || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Propose Counter Terms
  const handleProposeTerms = async () => {
    if (!agreementModal.requestId) return;
    try {
      const payload = {
        pricingOption: counterPricingOption,
        price: counterPricingOption === "free" ? 0 : Number(counterPrice),
        currency: "INR",
        sessionDurationMinutes: Number(counterDuration),
        pricingBasis: "per_session",
        cancellationTerms: counterCancellation,
        effectiveDate: new Date().toISOString(),
      };

      const res = await fetch(`/api/founders/mentors/requests/${agreementModal.requestId}/agreement/propose`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setAgreementModal((prev) => ({ ...prev, agreement: data.agreement }));
        showToast("New agreement version proposed! Awaiting partner confirmation.");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to propose terms");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Confirm Agreement Version (Bilateral Confirmation)
  const handleConfirmAgreement = async (version: number) => {
    if (!agreementModal.requestId) return;
    try {
      const res = await fetch(`/api/founders/mentors/requests/${agreementModal.requestId}/agreement/confirm`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ version, confirm: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setAgreementModal((prev) => ({ ...prev, agreement: data.agreement }));
        showToast(data.message || "Terms confirmed!");
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Schedule Session
  const handleScheduleSession = async () => {
    if (!activeWorkspaceModal) return;
    try {
      const payload = {
        title: sessTitle,
        sessionDate: sessDate,
        startTime: sessTime,
        durationMinutes: Number(sessDuration),
        format: sessFormat,
        meetingLinkOrLocation: sessMeetingLink,
        agenda: sessAgenda,
      };

      const res = await fetch(`/api/founders/mentors/workspaces/${activeWorkspaceModal.id}/sessions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkspaceSessions((prev) => [...prev, data.session]);
        setIsScheduleModalOpen(false);
        showToast("Mentorship session confirmed and scheduled!");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to schedule session");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Session Status (Reschedule, Complete, Cancel)
  const handleUpdateSessionStatus = async (sessionId: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`/api/founders/mentors/sessions/${sessionId}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? data.session : s))
        );
        showToast(`Session status updated to ${status}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Goal to Workspace
  const handleAddGoal = async () => {
    if (!activeWorkspaceModal || !newGoalTitle.trim()) return;
    try {
      const res = await fetch(`/api/founders/mentors/workspaces/${activeWorkspaceModal.id}/goals`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: newGoalTitle,
          description: newGoalDesc,
          targetDate: newGoalDate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceGoals((prev) => [...prev, data.goal]);
        setNewGoalTitle("");
        setNewGoalDesc("");
        showToast("Milestone goal added!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Goal Progress
  const handleUpdateGoal = async (goalId: string, progress: number, status?: string) => {
    try {
      const res = await fetch(`/api/founders/mentors/goals/${goalId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ progressPercentage: progress, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceGoals((prev) => prev.map((g) => (g.id === goalId ? data.goal : g)));
        showToast("Goal progress updated!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Action Item to Workspace
  const handleAddActionItem = async () => {
    if (!activeWorkspaceModal || !newActionTask.trim()) return;
    try {
      const assignedId = activeWorkspaceModal.menteeProfileId;
      const res = await fetch(`/api/founders/mentors/workspaces/${activeWorkspaceModal.id}/action-items`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          task: newActionTask,
          assignedProfileId: assignedId,
          dueDate: newActionDue,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceActionItems((prev) => [...prev, data.actionItem]);
        setNewActionTask("");
        showToast("Action item assigned!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Action Item Status
  const handleToggleActionItem = async (actionItemId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/founders/mentors/action-items/${actionItemId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceActionItems((prev) =>
          prev.map((a) => (a.id === actionItemId ? data.actionItem : a))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Resource to Workspace
  const handleAddResource = async () => {
    if (!activeWorkspaceModal || !newResTitle.trim() || !newResUrl.trim()) return;
    try {
      const res = await fetch(`/api/founders/mentors/workspaces/${activeWorkspaceModal.id}/resources`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: newResTitle,
          resourceType: newResType,
          urlOrPath: newResUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceResources((prev) => [...prev, data.resource]);
        setNewResTitle("");
        setNewResUrl("");
        showToast("Resource shared to workspace!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Workspace Notes
  const handleSaveNotes = async () => {
    if (!activeWorkspaceModal) return;
    try {
      const res = await fetch(`/api/founders/mentors/workspaces/${activeWorkspaceModal.id}/notes`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          sharedNotes: sharedNotesText,
          privateNotes: privateNotesText,
        }),
      });
      if (res.ok) {
        showToast("Workspace notes saved successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Record Payment Status with Regulatory Disclaimer
  const handleRecordPayment = async () => {
    if (!activeWorkspaceModal) return;
    try {
      const res = await fetch(`/api/founders/mentors/workspaces/${activeWorkspaceModal.id}/payment`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          paymentStatus: paymentStatusChoice,
          paymentNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveWorkspaceModal({
          ...activeWorkspaceModal,
          paymentStatus: data.paymentStatus,
          paymentReportedDate: data.paymentReportedDate,
        });
        showToast(data.message || "Payment status updated!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Mentee Review
  const handleSubmitReview = async () => {
    if (!activeWorkspaceModal || !reviewText.trim()) return;
    try {
      const payload = {
        knowledgeRating: reviewKnowledge,
        communicationRating: reviewComm,
        helpfulnessRating: reviewHelp,
        professionalismRating: reviewProf,
        reliabilityRating: reviewReliability,
        overallRating: Number(
          ((reviewKnowledge + reviewComm + reviewHelp + reviewProf + reviewReliability) / 5).toFixed(1)
        ),
        reviewText,
      };

      const res = await fetch(`/api/founders/mentors/workspaces/${activeWorkspaceModal.id}/reviews`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkspaceReviews((prev) => [...prev, data.review]);
        setReviewText("");
        showToast("Verified mentorship review submitted!");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to submit review");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Mentor Reply on Review
  const handleReplyReview = async (reviewId: string) => {
    if (!mentorReplyText.trim()) return;
    try {
      const res = await fetch(`/api/founders/mentors/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ reply: mentorReplyText }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? data.review : r))
        );
        setMentorReplyText("");
        showToast("Reply published to review!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Report Mentor
  const handleReportMentor = async () => {
    if (!reportMentorId) return;
    try {
      const res = await fetch(`/api/founders/mentors/profiles/${reportMentorId}/report`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });
      if (res.ok) {
        showToast("Report submitted to moderation team.");
        setReportMentorId(null);
        setReportDetails("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/30 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transition-all">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 mr-1" />
              Balaga Founders · Feature 10
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Mentor Network
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              India's premier founder-to-founder and executive mentorship marketplace. Discover battle-tested
              leaders, agree on transparent free or paid arrangements (Option C), and accelerate startup growth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                fetchMyProfile();
                setIsProfileModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center shadow-lg transition-all"
            >
              <Award className="w-4 h-4 mr-2" />
              {myMentorProfile ? "Edit Mentor Profile" : "Become a Mentor"}
            </button>
            {sentRequests.some((r) => r.workspaceId) && (
              <button
                onClick={() => {
                  const activeReq = sentRequests.find((r) => r.workspaceId);
                  if (activeReq?.workspaceId) openWorkspace(activeReq.workspaceId);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center border border-slate-700 shadow-sm"
              >
                <Briefcase className="w-4 h-4 mr-2 text-amber-400" />
                Active Workspace
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-800 flex overflow-x-auto space-x-2 pb-px scrollbar-none">
        {[
          { id: "discover", label: "Discover Mentors", icon: Compass, count: mentors.length },
          { id: "recommended", label: "Recommended for You", icon: Sparkles, count: recommendedMentors.length },
          { id: "requests", label: "Mentorship Requests", icon: Send, count: sentRequests.length + incomingRequests.length },
          { id: "workspaces", label: "My Workspaces", icon: Briefcase, count: sentRequests.filter((r) => r.workspaceId).length },
          { id: "sessions", label: "Scheduled Sessions", icon: Calendar, count: workspaceSessions.length },
          { id: "mentor_dashboard", label: "Mentor Analytics", icon: TrendingUp },
          { id: "mentee_dashboard", label: "Mentee Progress", icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? "border-amber-500 text-amber-400 bg-amber-500/5 rounded-t-lg"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DISCOVER MENTORS */}
      {activeTab === "discover" && (
        <div className="space-y-6">
          {/* Multi-Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, expertise, tech stack, company, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Expertise Categories</option>
                  {MENTOR_EXPERTISE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Pricing Models</option>
                  <option value="free">Free Mentorship</option>
                  <option value="paid">Paid Mentorship</option>
                  <option value="first_session_free">First Session Free</option>
                  <option value="custom">Custom Arrangement</option>
                  <option value="discussion">Open to Discussion</option>
                </select>

                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Formats</option>
                  <option value="online">Online</option>
                  <option value="in_person">In-Person (Public)</option>
                  <option value="hybrid">Hybrid</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="rating">Top Rated</option>
                  <option value="views">Most Viewed</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="newest">Recently Joined</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mentors Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse h-80" />
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <Compass className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-white">No mentors found matching criteria</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Try widening your search terms or clearing your expertise and pricing filters.
              </p>
              <button
                onClick={() => {
                  setSelectedExpertise("all");
                  setSelectedPricing("all");
                  setSelectedFormat("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-sm hover:shadow-amber-500/5"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md">
                          {mentor.profile?.displayName?.charAt(0) || "M"}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                              {mentor.profile?.displayName || "Verified Mentor"}
                            </h3>
                            {mentor.isVerified && (
                              <span title={mentor.verifiedBadgeTitle || "Verified"}>
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{mentor.broadLocation}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleBookmark(mentor.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          mentor.isSaved
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                            : "border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Headline */}
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                      {mentor.headline}
                    </p>

                    {/* Expertise Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.expertise.slice(0, 3).map((exp) => (
                        <span
                          key={exp}
                          className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium"
                        >
                          {exp}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="text-[11px] text-slate-500 self-center">
                          +{mentor.expertise.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-normal">
                      {mentor.introduction}
                    </p>

                    {/* Company Experience */}
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-1 border-t border-slate-800/80">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{mentor.companyExperience}</span>
                    </div>
                  </div>

                  {/* Pricing & Footer Actions */}
                  <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        {mentor.pricing.pricingOption === "free" && (
                          <span className="font-bold text-emerald-400">Free Mentorship</span>
                        )}
                        {mentor.pricing.pricingOption === "first_session_free" && (
                          <span className="font-bold text-emerald-400">
                            1st Session Free · ₹{mentor.pricing.subsequentSessionPrice}/session
                          </span>
                        )}
                        {mentor.pricing.pricingOption === "paid" && (
                          <span className="font-bold text-amber-400">
                            ₹{mentor.pricing.price} / {mentor.pricing.sessionDurationMinutes} min
                          </span>
                        )}
                        {mentor.pricing.pricingOption === "custom" && (
                          <span className="font-bold text-purple-400">Custom Arrangement</span>
                        )}
                        {mentor.pricing.pricingOption === "discussion" && (
                          <span className="font-bold text-blue-400">Open to Discussion</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 text-slate-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold">{mentor.rating}</span>
                        <span className="text-slate-500 text-[11px]">({mentor.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedMentorDetail(mentor)}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setRequestTargetMentor(mentor);
                          setIsRequestModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>Request</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECOMMENDED FOR YOU */}
      {activeTab === "recommended" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Personalized Mentor Recommendations</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Matched according to your technical competencies, startup challenges, and verified track record.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedMentors.map((mentor: any) => (
              <div
                key={mentor.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  {mentor.matchScore}% Match
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                      {mentor.profile?.displayName?.charAt(0) || "M"}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{mentor.profile?.displayName}</h3>
                      <p className="text-[11px] text-slate-400">{mentor.broadLocation}</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 line-clamp-2">{mentor.headline}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.map((exp: string) => (
                      <span
                        key={exp}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3">{mentor.introduction}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMentorDetail(mentor)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setRequestTargetMentor(mentor);
                      setIsRequestModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1"
                  >
                    <span>Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MENTORSHIP REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-3">
            <button
              onClick={() => setRequestsSubTab("sent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                requestsSubTab === "sent"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              My Sent Requests ({sentRequests.length})
            </button>
            <button
              onClick={() => setRequestsSubTab("incoming")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                requestsSubTab === "incoming"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Incoming Requests as Mentor ({incomingRequests.length})
            </button>
          </div>

          {requestsSubTab === "sent" ? (
            sentRequests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                You have not submitted any mentorship requests yet. Browse the Discover tab to find a mentor.
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">
                          Mentorship with {req.mentor?.headline || "Mentor"}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                            req.status === "accepted" || req.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : req.status === "submitted"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : req.status === "rejected" || req.status === "cancelled"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Project: {req.projectOrStartupName}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">Challenge: {req.specificChallenge}</p>
                      <p className="text-[11px] text-slate-500">Duration: {req.expectedDuration} · Budget: {req.budget || "N/A"}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {req.workspaceId ? (
                        <button
                          onClick={() => openWorkspace(req.workspaceId!)}
                          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-1"
                        >
                          <Briefcase className="w-3.5 h-3.5 mr-1" />
                          <span>Open Workspace</span>
                        </button>
                      ) : null}

                      {req.agreementId && (
                        <button
                          onClick={() => openAgreement(req.id)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 text-amber-400" />
                          <span>Pricing Terms</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCheckMessaging(req.id, req.mentor?.headline || "Mentor")}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        <span>Message</span>
                      </button>

                      {req.status === "submitted" && (
                        <button
                          onClick={() => handleRespondRequest(req.id, "withdraw", "Withdrawn by mentee")}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : incomingRequests.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              No incoming mentorship requests at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base">
                        Request from {req.mentee?.displayName || "Founder"}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Project: {req.projectOrStartupName}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">Goals: {req.goals}</p>
                    <p className="text-[11px] text-slate-500">Why Selected: {req.reasonForSelection}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {req.status === "submitted" || req.status === "under_review" || req.status === "more_info_requested" ? (
                      <>
                        <button
                          onClick={() => handleRespondRequest(req.id, "accept", "Mentorship request accepted.")}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, "request_more_info", "Please provide project GitHub or pitch deck.")}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
                        >
                          Request Info
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, "reject", "Unavailable for new mentees currently.")}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold"
                        >
                          Decline
                        </button>
                      </>
                    ) : req.workspaceId ? (
                      <button
                        onClick={() => openWorkspace(req.workspaceId!)}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-1"
                      >
                        <Briefcase className="w-3.5 h-3.5 mr-1" />
                        <span>Workspace</span>
                      </button>
                    ) : null}

                    {req.agreementId && (
                      <button
                        onClick={() => openAgreement(req.id)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium"
                      >
                        Pricing Terms
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WORKSPACES */}
      {activeTab === "workspaces" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <span>Active Mentorship Workspaces</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Collaborative environments for session notes, milestones, action items, and resources.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sentRequests
              .filter((r) => r.workspaceId)
              .map((req) => (
                <div
                  key={req.workspaceId}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-6 space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{req.projectOrStartupName}</h3>
                      <p className="text-xs text-slate-400">
                        Mentor: {req.mentor?.headline || "Verified Mentor"}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">Objectives: {req.goals}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-[11px] text-slate-500">Format: {req.preferredFormat}</span>
                    <button
                      onClick={() => openWorkspace(req.workspaceId!)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: SESSIONS */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Scheduled Mentorship Sessions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calendar of upcoming and past mentorship calls, with direct joining links and agendas.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {workspaceSessions.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No sessions scheduled yet. Open an active workspace to propose and confirm a session.
              </div>
            ) : (
              workspaceSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-base">{sess.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">
                        {sess.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        {sess.sessionDate} at {sess.startTime} ({sess.timezone})
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        {sess.durationMinutes} mins
                      </span>
                    </div>
                    {sess.agenda && <p className="text-xs text-slate-300">Agenda: {sess.agenda}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={sess.meetingLinkOrLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1"
                    >
                      <span>Join Meeting</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    {sess.status !== "completed" && (
                      <button
                        onClick={() => handleUpdateSessionStatus(sess.id, "completed", "Session marked completed")}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MENTOR DASHBOARD ANALYTICS */}
      {activeTab === "mentor_dashboard" && mentorStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Profile Views</span>
              <p className="text-2xl font-extrabold text-white">{mentorStats.profileViews}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Active Mentees</span>
              <p className="text-2xl font-extrabold text-emerald-400">{mentorStats.activeMenteesCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Completed Sessions</span>
              <p className="text-2xl font-extrabold text-amber-400">{mentorStats.completedSessionsCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Average Rating</span>
              <p className="text-2xl font-extrabold text-amber-400">{mentorStats.averageRating} ★</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Mentor Profile Status & Management</h3>
            {myMentorProfile ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{myMentorProfile.headline}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                        myMentorProfile.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {myMentorProfile.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Profile completeness: {mentorStats.profileCompletion}%</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(myMentorProfile.status === "active" ? "paused" : "active")}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium"
                  >
                    {myMentorProfile.status === "active" ? "Pause Profile" : "Activate Profile"}
                  </button>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-slate-400">You have not created a mentor profile yet.</p>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Create Mentor Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: MENTEE DASHBOARD ANALYTICS */}
      {activeTab === "mentee_dashboard" && menteeStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Requests Sent</span>
              <p className="text-2xl font-extrabold text-white">{menteeStats.requestsSentCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Active Mentors</span>
              <p className="text-2xl font-extrabold text-emerald-400">{menteeStats.activeMentorsCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Active Goals</span>
              <p className="text-2xl font-extrabold text-amber-400">{menteeStats.activeGoalsCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Pending Tasks</span>
              <p className="text-2xl font-extrabold text-purple-400">{menteeStats.pendingActionItemsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1: MENTOR DETAIL MODAL */}
      {/* ------------------------------------------------------------------ */}
      {selectedMentorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 relative shadow-2xl my-8">
            <button
              onClick={() => setSelectedMentorDetail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile info */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl font-bold">
                {selectedMentorDetail.profile?.displayName?.charAt(0) || "M"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white">{selectedMentorDetail.profile?.displayName}</h2>
                  {selectedMentorDetail.isVerified && (
                    <span title={selectedMentorDetail.verifiedBadgeTitle || "Verified"}>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{selectedMentorDetail.broadLocation} · {selectedMentorDetail.preferredMeetingFormat}</p>
                <div className="flex items-center space-x-2 text-xs pt-1">
                  <span className="text-amber-400 font-bold">{selectedMentorDetail.rating} ★</span>
                  <span className="text-slate-500">({selectedMentorDetail.reviewsCount} reviews)</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{selectedMentorDetail.sessionsCompletedCount} sessions completed</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Headline</h4>
              <p className="text-sm font-semibold text-slate-200">{selectedMentorDetail.headline}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About & Introduction</h4>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{selectedMentorDetail.introduction}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience & Company Background</h4>
              <p className="text-xs text-slate-300">{selectedMentorDetail.companyExperience}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expertise & Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedMentorDetail.expertise.map((exp) => (
                  <span key={exp} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-medium">
                    {exp}
                  </span>
                ))}
                {selectedMentorDetail.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Option C Mentorship Terms & Pricing</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white capitalize">
                  {selectedMentorDetail.pricing.pricingOption.replace(/_/g, " ")}
                </span>
                {selectedMentorDetail.pricing.price ? (
                  <span className="font-bold text-amber-400">
                    ₹{selectedMentorDetail.pricing.price} / {selectedMentorDetail.pricing.sessionDurationMinutes} min
                  </span>
                ) : null}
              </div>
              {selectedMentorDetail.pricing.cancellationTerms && (
                <p className="text-xs text-slate-400 mt-1">Cancellation: {selectedMentorDetail.pricing.cancellationTerms}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setReportMentorId(selectedMentorDetail.id);
                  setSelectedMentorDetail(null);
                }}
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center space-x-1"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Profile</span>
              </button>

              <button
                onClick={() => {
                  setRequestTargetMentor(selectedMentorDetail);
                  setSelectedMentorDetail(null);
                  setIsRequestModalOpen(true);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1"
              >
                <span>Request Mentorship</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2: CREATE / EDIT MENTOR PROFILE MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 relative shadow-2xl my-8">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">
                {myMentorProfile ? "Edit Mentor Profile" : "Become a Mentor"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure your areas of expertise, meeting formats, and Option C mentorship pricing.
              </p>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Principal Architect at NovaTech · Ex-Razorpay"
                  value={formHeadline}
                  onChange={(e) => setFormHeadline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Introduction & Bio</label>
                <textarea
                  rows={3}
                  placeholder="Introduce your background and who you are excited to mentor..."
                  value={formIntro}
                  onChange={(e) => setFormIntro(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Professional Experience Details</label>
                <textarea
                  rows={3}
                  placeholder="Detailed breakdown of your career trajectory, leadership roles, and scaling milestones..."
                  value={formExperience}
                  onChange={(e) => setFormExperience(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Areas of Expertise (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MENTOR_EXPERTISE_CATEGORIES.map((cat) => {
                    const isChecked = formExpertise.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          if (isChecked) {
                            setFormExpertise(formExpertise.filter((c) => c !== cat));
                          } else {
                            setFormExpertise([...formExpertise, cat]);
                          }
                        }}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                          isChecked
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Core Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Industries (comma-separated)</label>
                  <input
                    type="text"
                    value={formIndustries}
                    onChange={(e) => setFormIndustries(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Startup Experience</label>
                <input
                  type="text"
                  placeholder="e.g. NovaTech Systems (Founder/CTO, 3 yrs), Razorpay (4 yrs)"
                  value={formCompanyExp}
                  onChange={(e) => setFormCompanyExp(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Broad Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Meeting Format</label>
                  <select
                    value={formMeetingFormat}
                    onChange={(e) => setFormMeetingFormat(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  >
                    <option value="online">Online (Video Call)</option>
                    <option value="in_person">In-Person (Agreed Public Venue)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Option C Pricing Configuration */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Option C Pricing Configuration
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "free", label: "Free Mentorship" },
                    { id: "paid", label: "Paid Mentorship" },
                    { id: "first_session_free", label: "First Session Free" },
                    { id: "custom", label: "Custom Arrangement" },
                    { id: "discussion", label: "Open to Discussion" },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setFormPricingOption(p.id as any)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-left ${
                        formPricingOption === p.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {formPricingOption === "paid" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Session Price (₹ INR)</label>
                      <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        value={formDuration}
                        onChange={(e) => setFormDuration(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {formPricingOption === "first_session_free" && (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400">
                      The initial 45-minute discovery session is completely free.
                    </p>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">
                        Subsequent Session Price (₹ INR)
                      </label>
                      <input
                        type="number"
                        value={formSubsequentPrice}
                        onChange={(e) => setFormSubsequentPrice(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Cancellation Terms</label>
                  <input
                    type="text"
                    value={formCancellation}
                    onChange={(e) => setFormCancellation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveProfile(false)}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                {myMentorProfile ? "Save Changes" : "Publish Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 3: SUBMIT MENTORSHIP REQUEST */}
      {/* ------------------------------------------------------------------ */}
      {isRequestModalOpen && requestTargetMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 relative shadow-2xl my-8">
            <button
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Request Mentorship</h2>
              <p className="text-xs text-slate-400 mt-1">
                Approaching <span className="text-white font-semibold">{requestTargetMentor.profile?.displayName}</span> ({requestTargetMentor.headline})
              </p>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Project or Startup Name</label>
                <input
                  type="text"
                  placeholder="e.g. NovaTelemetry Cloud"
                  value={reqProjectName}
                  onChange={(e) => setReqProjectName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">What Help Do You Need?</label>
                <textarea
                  rows={2}
                  placeholder="Describe your current stage and where you need mentorship..."
                  value={reqHelpNeeded}
                  onChange={(e) => setReqHelpNeeded(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Specific Challenge</label>
                <textarea
                  rows={2}
                  placeholder="What core roadblock are you attempting to solve?"
                  value={reqSpecificChallenge}
                  onChange={(e) => setReqSpecificChallenge(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Goals & Expected Outcomes</label>
                <textarea
                  rows={2}
                  placeholder="What measurable outcomes would make this mentorship a success?"
                  value={reqGoals}
                  onChange={(e) => setReqGoals(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Why Did You Choose This Mentor?</label>
                <input
                  type="text"
                  placeholder="e.g. Your experience scaling B2B enterprise GTM at Freshworks..."
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Format</label>
                  <select
                    value={reqFormat}
                    onChange={(e) => setReqFormat(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ongoing">Ongoing Mentorship</option>
                    <option value="one_time">One-time Strategy Session</option>
                    <option value="project">Project Mentorship</option>
                    <option value="startup">Startup Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Duration</label>
                  <input
                    type="text"
                    value={reqExpectedDuration}
                    onChange={(e) => setReqExpectedDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Availability</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekdays mornings / IST"
                    value={reqAvailability}
                    onChange={(e) => setReqAvailability(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Proposed Budget / Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹3,000 per session / Free"
                    value={reqBudget}
                    onChange={(e) => setReqBudget(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Additional Context or Links</label>
                <input
                  type="text"
                  placeholder="e.g. Pitch deck, GitHub repo, or relevant context"
                  value={reqContext}
                  onChange={(e) => setReqContext(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 4: OPTION C AGREEMENT TERMS MODAL */}
      {/* ------------------------------------------------------------------ */}
      {agreementModal.open && agreementModal.agreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 relative shadow-2xl my-8">
            <button
              onClick={() => setAgreementModal({ open: false, requestId: "", agreement: null })}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">Mentorship Agreement (Option C)</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    agreementModal.agreement.isFullyConfirmed
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {agreementModal.agreement.isFullyConfirmed ? "Fully Confirmed" : "Pending Confirmation"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Bilateral confirmation required before terms become active. Version {agreementModal.agreement.currentVersion}.
              </p>
            </div>

            {/* Regulatory Disclaimer */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 leading-relaxed">
              <span className="font-bold">Balaga Regulatory Notice:</span> Balaga records reported pricing and payment
              terms for mutual accountability. Balaga does not operate an internal wallet or escrow, and does not hold
              or guarantee payments.
            </div>

            {/* Version History List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Version History</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {agreementModal.agreement.versions.map((v) => (
                  <div
                    key={v.version}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      v.version === agreementModal.agreement?.currentVersion
                        ? "bg-slate-800/80 border-amber-500/40 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div>
                      <span className="font-bold">v{v.version}: </span>
                      <span className="capitalize">{v.pricingOption.replace(/_/g, " ")}</span>
                      {v.price ? <span> · ₹{v.price}/{v.sessionDurationMinutes}min</span> : null}
                    </div>
                    <span className="text-[10px] text-slate-500">{v.effectiveDate.split("T")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Propose Counter Terms */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-3">
              <h4 className="text-xs font-bold text-white">Propose Revised Terms (Creates Next Version)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Pricing Model</label>
                  <select
                    value={counterPricingOption}
                    onChange={(e) => setCounterPricingOption(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="first_session_free">First Session Free</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleProposeTerms}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-lg"
              >
                Propose Revision
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Mentor Confirmed: {agreementModal.agreement.confirmedByMentor ? "Yes" : "No"} · Mentee Confirmed:{" "}
                {agreementModal.agreement.confirmedByMentee ? "Yes" : "No"}
              </span>

              <button
                onClick={() => handleConfirmAgreement(agreementModal.agreement!.currentVersion)}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Confirm Agreement Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 5: FULL MENTORSHIP WORKSPACE */}
      {/* ------------------------------------------------------------------ */}
      {activeWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 relative shadow-2xl my-8">
            <button
              onClick={() => setActiveWorkspaceModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Workspace Header */}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">Mentorship Workspace</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  {activeWorkspaceModal.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mentor: <span className="text-white font-semibold">{activeWorkspaceModal.mentor?.headline || "Mentor"}</span> ·
                Mentee: <span className="text-white font-semibold">{activeWorkspaceModal.mentee?.displayName || "Mentee"}</span>
              </p>
            </div>

            {/* Workspace Sub-tabs */}
            <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-2 scrollbar-none text-xs">
              {[
                { id: "overview", label: "Overview", icon: Compass },
                { id: "sessions", label: "Sessions", icon: Calendar, count: workspaceSessions.length },
                { id: "goals", label: "Goals", icon: Target, count: workspaceGoals.length },
                { id: "action_items", label: "Action Items", icon: ListTodo, count: workspaceActionItems.length },
                { id: "resources", label: "Resources", icon: FileText, count: workspaceResources.length },
                { id: "notes", label: "Notes & Privacy", icon: BookOpen },
                { id: "payment", label: "Payment Status", icon: DollarSign },
                { id: "review", label: "Feedback & Reviews", icon: Sparkles },
              ].map((sub) => {
                const Icon = sub.icon;
                const isSelected = workspaceSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setWorkspaceSubTab(sub.id as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-tab: OVERVIEW */}
            {workspaceSubTab === "overview" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Agreed Objectives</h4>
                  <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                    {activeWorkspaceModal.agreedObjectives}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-800/30 rounded-xl">
                    <span className="text-slate-400">Duration: </span>
                    <span className="text-white font-medium">{activeWorkspaceModal.expectedDuration}</span>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-xl">
                    <span className="text-slate-400">Format: </span>
                    <span className="text-white font-medium capitalize">{activeWorkspaceModal.mentorshipFormat}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab: SESSIONS */}
            {workspaceSubTab === "sessions" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sessions</h4>
                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Schedule Session</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {workspaceSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{s.title}</span>
                        <p className="text-slate-400">
                          {s.sessionDate} at {s.startTime} · {s.durationMinutes} mins · {s.status}
                        </p>
                      </div>
                      <a
                        href={s.meetingLinkOrLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-semibold rounded-lg"
                      >
                        Join
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab: GOALS */}
            {workspaceSubTab === "goals" && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800/40 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-white">Add Milestone Goal</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Goal title..."
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="date"
                      value={newGoalDate}
                      onChange={(e) => setNewGoalDate(e.target.value)}
                      className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={handleAddGoal}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {workspaceGoals.map((g) => (
                    <div key={g.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{g.title}</span>
                        <span className="text-amber-400 font-bold">{g.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${g.progressPercentage}%` }} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => handleUpdateGoal(g.id, pct)}
                            className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-[10px] text-white rounded"
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab: ACTION ITEMS */}
            {workspaceSubTab === "action_items" && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800/40 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-white">Assign Action Item</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Task description..."
                      value={newActionTask}
                      onChange={(e) => setNewActionTask(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="date"
                      value={newActionDue}
                      onChange={(e) => setNewActionDue(e.target.value)}
                      className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={handleAddActionItem}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {workspaceActionItems.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => handleToggleActionItem(a.id, a.status)}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            a.status === "completed" ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-600"
                          }`}
                        >
                          {a.status === "completed" && <Check className="w-3 h-3 font-bold" />}
                        </div>
                        <span className={a.status === "completed" ? "line-through text-slate-500" : "text-white"}>
                          {a.task}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Due: {a.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab: RESOURCES */}
            {workspaceSubTab === "resources" && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800/40 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-white">Share Resource / Template / Guide</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Resource title..."
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="link">Link</option>
                      <option value="document">Document</option>
                      <option value="template">Template</option>
                      <option value="guide">Guide</option>
                    </select>
                    <input
                      type="text"
                      placeholder="URL or document link..."
                      value={newResUrl}
                      onChange={(e) => setNewResUrl(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <button
                    onClick={handleAddResource}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    Share Resource
                  </button>
                </div>

                <div className="space-y-2">
                  {workspaceResources.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{r.title}</span>
                      <a
                        href={r.urlOrPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline"
                      >
                        Open Link
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab: NOTES */}
            {workspaceSubTab === "notes" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Shared Collaborative Notes (Visible to both Mentor & Mentee)
                  </label>
                  <textarea
                    rows={4}
                    value={sharedNotesText}
                    onChange={(e) => setSharedNotesText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Private Notes (Strictly Confidential to You Only)
                  </label>
                  <textarea
                    rows={3}
                    value={privateNotesText}
                    onChange={(e) => setPrivateNotesText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleSaveNotes}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Save Notes
                </button>
              </div>
            )}

            {/* Sub-tab: PAYMENT */}
            {workspaceSubTab === "payment" && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                  <span className="font-bold">Regulatory Notice: </span>
                  Balaga records payment status for accounting history and transparency. Balaga does not operate an
                  internal wallet or escrow, and does not hold or guarantee funds.
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-slate-300 block">Record Payment Status</label>
                  <select
                    value={paymentStatusChoice}
                    onChange={(e) => setPaymentStatusChoice(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="not_due">Not Due (Free Mentorship)</option>
                    <option value="pending">Pending Payment</option>
                    <option value="reported_paid">Reported Paid (Direct Settlement)</option>
                    <option value="disputed">Payment Disputed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Optional payment notes (e.g. UTR # or date settled)..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />

                  <button
                    onClick={handleRecordPayment}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Update Payment Status
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tab: REVIEW */}
            {workspaceSubTab === "review" && (
              <div className="space-y-4">
                <div className="space-y-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Leave Verified Mentorship Review</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Knowledge: </span>
                      <select
                        value={reviewKnowledge}
                        onChange={(e) => setReviewKnowledge(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} ★</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-slate-400">Communication: </span>
                      <select
                        value={reviewComm}
                        onChange={(e) => setReviewComm(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} ★</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-slate-400">Helpfulness: </span>
                      <select
                        value={reviewHelp}
                        onChange={(e) => setReviewHelp(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} ★</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-slate-400">Professionalism: </span>
                      <select
                        value={reviewProf}
                        onChange={(e) => setReviewProf(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} ★</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-slate-400">Reliability: </span>
                      <select
                        value={reviewReliability}
                        onChange={(e) => setReviewReliability(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} ★</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write your honest, verified review of this mentorship experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />

                  <button
                    onClick={handleSubmitReview}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Submit Review
                  </button>
                </div>

                {workspaceReviews.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Reviews</h4>
                    {workspaceReviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-800/60 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-400">{rev.overallRating} ★</span>
                          <span className="text-slate-500">{rev.createdAt.split("T")[0]}</span>
                        </div>
                        <p className="text-slate-300">{rev.reviewText}</p>
                        {rev.mentorReply && (
                          <div className="p-2 bg-slate-900 rounded-lg text-slate-400 border-l-2 border-amber-500 text-[11px]">
                            <span className="font-bold text-white">Mentor Reply: </span>
                            {rev.mentorReply}
                          </div>
                        )}
                        {!rev.mentorReply && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Mentor right of reply..."
                              value={mentorReplyText}
                              onChange={(e) => setMentorReplyText(e.target.value)}
                              className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white"
                            />
                            <button
                              onClick={() => handleReplyReview(rev.id)}
                              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px]"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 6: SCHEDULE SESSION MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Schedule Mentorship Session</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Session Title</label>
                <input
                  type="text"
                  value={sessTitle}
                  onChange={(e) => setSessTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={sessDate}
                    onChange={(e) => setSessDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Start Time (IST)</label>
                  <input
                    type="time"
                    value={sessTime}
                    onChange={(e) => setSessTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Duration</label>
                  <select
                    value={sessDuration}
                    onChange={(e) => setSessDuration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Meeting Format</label>
                  <select
                    value={sessFormat}
                    onChange={(e) => setSessFormat(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="online">Online / Video Call</option>
                    <option value="in_person">In-Person (Public Venue)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Meeting Link or Public Location</label>
                <input
                  type="text"
                  value={sessMeetingLink}
                  onChange={(e) => setSessMeetingLink(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Session Agenda</label>
                <textarea
                  rows={2}
                  value={sessAgenda}
                  onChange={(e) => setSessAgenda(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSession}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Confirm Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 7: DIRECT MESSAGING PRIVILEGES CHECK */}
      {/* ------------------------------------------------------------------ */}
      {messageCheckModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Direct Messaging Permission</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{messageCheckModal.note}</p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setMessageCheckModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Close
              </button>
              {messageCheckModal.canMessage ? (
                <button
                  onClick={() => {
                    setMessageCheckModal(null);
                    showToast(`Opening conversation with ${messageCheckModal.targetName}...`);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Message in Inbox
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMessageCheckModal(null);
                    showToast("Redirecting to connection request...");
                  }}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl"
                >
                  Send Connection Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 8: REPORT MENTOR MODAL */}
      {/* ------------------------------------------------------------------ */}
      {reportMentorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Report Mentor Profile</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="misleading_experience">Misleading Experience or Credentials</option>
                  <option value="financial_solicitation">Unapproved Financial / Investment Solicitation</option>
                  <option value="inappropriate_behavior">Inappropriate Behavior or Harassment</option>
                  <option value="spam">Spam or Promotional Abuse</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Details</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context for moderation review..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReportMentorId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReportMentor}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
