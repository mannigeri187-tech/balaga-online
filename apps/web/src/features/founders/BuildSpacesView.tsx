import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Lock,
  Globe,
  MessageSquare,
  FileText,
  Video,
  Activity,
  Settings,
  UserPlus,
  Send,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Target,
} from "lucide-react";
import {
  BuildSpace,
  BuildSpacePublicListing,
  BuildSpaceTask,
  BuildSpaceMilestone,
  BuildSpaceMessage,
  BuildSpaceDocument,
  BuildSpaceMeeting,
  BuildSpaceActivity as BuildSpaceActivityType,
  BuildSpaceMember,
  BuildSpaceJoinRequest,
  BuildSpaceInvitation,
  BuildSpaceStats,
} from "@platform/shared-types";
import { BUILD_SPACES_REGULATORY_DISCLAIMER } from "@platform/config";

interface BuildSpacesViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const BuildSpacesView: React.FC<BuildSpacesViewProps> = ({ onNavigateTab: _onNavigateTab }) => {
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<
    "all" | "projects" | "partnerships" | "discover" | "my_created" | "invitations" | "join_requests" | "archived"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Data states
  const [spaces, setSpaces] = useState<BuildSpace[]>([]);
  const [publicListings, setPublicListings] = useState<BuildSpacePublicListing[]>([]);
  const [invitations, setInvitations] = useState<BuildSpaceInvitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<BuildSpaceJoinRequest[]>([]);
  const [stats, setStats] = useState<BuildSpaceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active workspace detail view state
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [currentSpace, setCurrentSpace] = useState<BuildSpace | null>(null);
  const [spaceMembers, setSpaceMembers] = useState<BuildSpaceMember[]>([]);
  const [spaceTasks, setSpaceTasks] = useState<BuildSpaceTask[]>([]);
  const [spaceMilestones, setSpaceMilestones] = useState<BuildSpaceMilestone[]>([]);
  const [spaceMessages, setSpaceMessages] = useState<BuildSpaceMessage[]>([]);
  const [spaceDocuments, setSpaceDocuments] = useState<BuildSpaceDocument[]>([]);
  const [spaceMeetings, setSpaceMeetings] = useState<BuildSpaceMeeting[]>([]);
  const [spaceActivities, setSpaceActivities] = useState<BuildSpaceActivityType[]>([]);
  const [workspaceSubTab, setWorkspaceSubTab] = useState<
    "overview" | "tasks" | "milestones" | "chat" | "documents" | "meetings" | "members" | "settings"
  >("overview");
  const [taskViewMode, setTaskViewMode] = useState<"kanban" | "list">("kanban");
  const [chatChannel, setChatChannel] = useState("general");
  const [newMessageText, setNewMessageText] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [targetPublicSpace, setTargetPublicSpace] = useState<BuildSpacePublicListing | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    shortDescription: "",
    detailedOverview: "",
    category: "software",
    developmentStage: "building",
    mainGoals: "",
    skillsRequired: "",
    technologiesUsed: "",
    visibility: "private" as "private" | "public",
  });

  const [joinForm, setJoinForm] = useState({
    introduction: "",
    relevantSkills: "",
    portfolioLinks: "",
  });

  const [inviteForm, setInviteForm] = useState({
    inviteeProfileId: "",
    role: "member" as "admin" | "editor" | "member" | "viewer",
    message: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    status: "todo" as "todo" | "in_progress" | "in_review" | "completed",
    dueDate: "",
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    targetDate: "",
    completionCriteria: "",
  });

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    time: "15:00",
    agenda: "",
    onlineMeetingLink: "",
  });

  const [documentForm, setDocumentForm] = useState({
    name: "",
    folder: "specifications",
    fileUrl: "",
    description: "",
  });

  // Base API caller with mock auth headers
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`/api/founders${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-mock-user": "true",
        "x-platform-world": "founders",
        ...(options.headers || {}),
      },
    });
    return res.json();
  };

  // Load spaces and counters
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [spacesData, statsData, publicData, invitesData, requestsData] = await Promise.all([
        apiFetch(`/build-spaces?type=${activeTab === "projects" ? "project" : activeTab === "partnerships" ? "partnership" : "all"}&status=${statusFilter}&category=${categoryFilter}&search=${encodeURIComponent(searchQuery)}`),
        apiFetch("/build-spaces/stats"),
        apiFetch("/build-spaces/projects/discover"),
        apiFetch("/build-spaces/invitations/my"),
        apiFetch("/build-spaces/join-requests/my"),
      ]);

      if (spacesData.spaces) setSpaces(spacesData.spaces);
      if (statsData.stats) setStats(statsData.stats);
      if (publicData.projects) setPublicListings(publicData.projects);
      if (invitesData.invitations) setInvitations(invitesData.invitations);
      if (requestsData.requests) setJoinRequests(requestsData.requests);
    } catch (e) {
      console.error("Failed to load Build Spaces data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSpaceId) {
      loadDashboardData();
    }
  }, [activeTab, categoryFilter, statusFilter, searchQuery, selectedSpaceId]);

  // Load specific space details when opened
  const loadSpaceDetail = async (spaceId: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch(`/build-spaces/${spaceId}`);
      if (data.space) {
        setCurrentSpace(data.space);
        setSpaceMembers(data.members || []);
        setSpaceTasks(data.tasks || []);
        setSpaceMilestones(data.milestones || []);
        setSpaceMeetings(data.meetings || []);
        setSpaceDocuments(data.documents || []);

        // Load chat and activities
        const [msgsData, actsData] = await Promise.all([
          apiFetch(`/build-spaces/${spaceId}/messages`),
          apiFetch(`/build-spaces/${spaceId}/activities`),
        ]);
        if (msgsData.messages) setSpaceMessages(msgsData.messages);
        if (actsData.activities) setSpaceActivities(actsData.activities);
      }
    } catch (e) {
      console.error("Failed to load space detail", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSpace = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setWorkspaceSubTab("overview");
    loadSpaceDetail(spaceId);
  };

  const handleBackToDashboard = () => {
    setSelectedSpaceId(null);
    setCurrentSpace(null);
  };

  // Actions
  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/build-spaces/projects", {
        method: "POST",
        body: JSON.stringify({
          name: createForm.name,
          shortDescription: createForm.shortDescription,
          detailedOverview: createForm.detailedOverview,
          category: createForm.category,
          developmentStage: createForm.developmentStage,
          mainGoals: createForm.mainGoals.split(",").map((s) => s.trim()).filter(Boolean),
          skillsRequired: createForm.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
          technologiesUsed: createForm.technologiesUsed.split(",").map((s) => s.trim()).filter(Boolean),
          visibility: createForm.visibility,
        }),
      });

      if (res.space) {
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          shortDescription: "",
          detailedOverview: "",
          category: "software",
          developmentStage: "building",
          mainGoals: "",
          skillsRequired: "",
          technologiesUsed: "",
          visibility: "private",
        });
        handleOpenSpace(res.space.id);
      }
    } catch (err) {
      console.error("Failed to create space", err);
    }
  };

  const handleToggleVisibility = async () => {
    if (!currentSpace) return;
    const newVis = currentSpace.visibility === "private" ? "public" : "private";
    try {
      const res = await apiFetch(`/build-spaces/${currentSpace.id}/visibility`, {
        method: "PUT",
        body: JSON.stringify({ visibility: newVis }),
      });
      if (res.space) {
        setCurrentSpace(res.space);
        setShowVisibilityModal(false);
      }
    } catch (err) {
      console.error("Failed to change visibility", err);
    }
  };

  const handleSubmitJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPublicSpace) return;
    try {
      await apiFetch(`/build-spaces/${targetPublicSpace.id}/join-requests`, {
        method: "POST",
        body: JSON.stringify({
          introduction: joinForm.introduction,
          relevantSkills: joinForm.relevantSkills.split(",").map((s) => s.trim()).filter(Boolean),
          portfolioLinks: joinForm.portfolioLinks ? [joinForm.portfolioLinks] : [],
        }),
      });
      setShowJoinModal(false);
      setJoinForm({ introduction: "", relevantSkills: "", portfolioLinks: "" });
      loadDashboardData();
    } catch (err) {
      console.error("Failed to submit join request", err);
    }
  };

  const handleRespondInvitation = async (invitationId: string, action: "accept" | "reject") => {
    try {
      await apiFetch(`/build-spaces/invitations/${invitationId}/respond`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      loadDashboardData();
    } catch (err) {
      console.error("Failed to respond to invitation", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;
    try {
      const res = await apiFetch(`/build-spaces/${currentSpace.id}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          status: taskForm.status,
          dueDate: taskForm.dueDate || undefined,
        }),
      });
      if (res.task) {
        setSpaceTasks([...spaceTasks, res.task]);
        setShowTaskModal(false);
        setTaskForm({ title: "", description: "", priority: "normal", status: "todo", dueDate: "" });
      }
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleToggleTaskStatus = async (task: BuildSpaceTask) => {
    if (!currentSpace) return;
    const nextStatus = task.status === "completed" ? "in_progress" : "completed";
    try {
      const res = await apiFetch(`/build-spaces/${currentSpace.id}/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.task) {
        setSpaceTasks(spaceTasks.map((t) => (t.id === task.id ? res.task : t)));
      }
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;
    try {
      const res = await apiFetch(`/build-spaces/${currentSpace.id}/milestones`, {
        method: "POST",
        body: JSON.stringify({
          title: milestoneForm.title,
          description: milestoneForm.description,
          targetDate: milestoneForm.targetDate,
          completionCriteria: milestoneForm.completionCriteria,
        }),
      });
      if (res.milestone) {
        setSpaceMilestones([...spaceMilestones, res.milestone]);
        setShowMilestoneModal(false);
        setMilestoneForm({ title: "", description: "", targetDate: "", completionCriteria: "" });
      }
    } catch (err) {
      console.error("Failed to create milestone", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace || !newMessageText.trim()) return;
    try {
      const res = await apiFetch(`/build-spaces/${currentSpace.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          channel: chatChannel,
          text: newMessageText.trim(),
        }),
      });
      if (res.message) {
        setSpaceMessages([...spaceMessages, res.message]);
        setNewMessageText("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;
    try {
      const res = await apiFetch(`/build-spaces/${currentSpace.id}/meetings`, {
        method: "POST",
        body: JSON.stringify({
          title: meetingForm.title,
          date: meetingForm.date,
          time: meetingForm.time,
          agenda: meetingForm.agenda,
          onlineMeetingLink: meetingForm.onlineMeetingLink,
        }),
      });
      if (res.meeting) {
        setSpaceMeetings([...spaceMeetings, res.meeting]);
        setShowMeetingModal(false);
        setMeetingForm({ title: "", date: "", time: "15:00", agenda: "", onlineMeetingLink: "" });
      }
    } catch (err) {
      console.error("Failed to schedule meeting", err);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;
    try {
      const res = await apiFetch(`/build-spaces/${currentSpace.id}/documents`, {
        method: "POST",
        body: JSON.stringify({
          name: documentForm.name,
          folder: documentForm.folder,
          fileUrl: documentForm.fileUrl || "https://balaga.online/documents/spec.pdf",
          description: documentForm.description,
        }),
      });
      if (res.document) {
        setSpaceDocuments([...spaceDocuments, res.document]);
        setShowDocumentModal(false);
        setDocumentForm({ name: "", folder: "specifications", fileUrl: "", description: "" });
      }
    } catch (err) {
      console.error("Failed to upload document", err);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;
    try {
      await apiFetch(`/build-spaces/${currentSpace.id}/invitations`, {
        method: "POST",
        body: JSON.stringify({
          inviteeProfileId: inviteForm.inviteeProfileId,
          role: inviteForm.role,
          message: inviteForm.message,
        }),
      });
      setShowInviteModal(false);
      setInviteForm({ inviteeProfileId: "", role: "member", message: "" });
    } catch (err) {
      console.error("Failed to send invitation", err);
    }
  };

  // Render Workspace Detail View
  if (selectedSpaceId && currentSpace) {
    return (
      <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen">
        {/* Top Header */}
        <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-16 z-20 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToDashboard}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Back to All Spaces"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-2xl">{currentSpace.logoUrl || (currentSpace.type === "partnership" ? "🤝" : "🚀")}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">{currentSpace.name}</h1>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      currentSpace.type === "partnership"
                        ? "bg-purple-900/40 text-purple-300 border border-purple-700/50"
                        : "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50"
                    }`}
                  >
                    {currentSpace.type === "partnership" ? "Partnership Space" : "Project Space"}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                      currentSpace.visibility === "private"
                        ? "bg-slate-800 text-slate-300"
                        : "bg-blue-900/40 text-blue-300 border border-blue-700/50"
                    }`}
                  >
                    {currentSpace.visibility === "private" ? (
                      <>
                        <Lock className="w-3 h-3" /> Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3" /> Public
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{currentSpace.shortDescription}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentSpace.type === "project" && (currentSpace.currentUserRole === "owner" || currentSpace.currentUserRole === "admin") && (
                <button
                  onClick={() => setShowVisibilityModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Visibility: {currentSpace.visibility}
                </button>
              )}
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-2">
            {[
              { id: "overview", label: "Overview", icon: Layers },
              { id: "tasks", label: `Tasks (${spaceTasks.length})`, icon: CheckCircle2 },
              { id: "milestones", label: `Milestones (${spaceMilestones.length})`, icon: Target },
              { id: "chat", label: `Chat (${spaceMessages.length})`, icon: MessageSquare },
              { id: "documents", label: `Documents (${spaceDocuments.length})`, icon: FileText },
              { id: "meetings", label: `Meetings (${spaceMeetings.length})`, icon: Video },
              { id: "members", label: `Members (${spaceMembers.length})`, icon: Users },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = workspaceSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setWorkspaceSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Tab Contents */}
        <div className="p-6 max-w-7xl mx-auto">
          {workspaceSubTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Details, Goals, Tasks Summary */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Detailed Overview</h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {currentSpace.detailedOverview}
                  </p>

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800 pt-4">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Stage</span>
                      <span className="text-xs font-medium text-emerald-400 capitalize">{currentSpace.developmentStage}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Category</span>
                      <span className="text-xs font-medium text-slate-200 capitalize">{currentSpace.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Completion</span>
                      <span className="text-xs font-medium text-slate-200">{currentSpace.targetCompletionDate || "Ongoing"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Your Role</span>
                      <span className="text-xs font-medium text-purple-300 capitalize">{currentSpace.currentUserRole || "Member"}</span>
                    </div>
                  </div>
                </div>

                {/* Main Goals */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Key Objectives & Outcomes
                  </h3>
                  <div className="space-y-2">
                    {currentSpace.mainGoals.map((goal, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Genuine Progress Bars */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">Workspace Progress Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Task Completion</span>
                        <span className="font-semibold text-emerald-400">{currentSpace.taskProgressPercentage || 0}% ({currentSpace.tasksCompletedCount || 0}/{currentSpace.tasksTotalCount || 0})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${currentSpace.taskProgressPercentage || 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Milestone Progress</span>
                        <span className="font-semibold text-purple-400">{currentSpace.milestoneProgressPercentage || 0}% ({currentSpace.milestonesCompletedCount || 0}/{currentSpace.milestonesTotalCount || 0})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${currentSpace.milestoneProgressPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Team Members & Activity */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Team Members ({spaceMembers.length})
                    </h3>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Invite
                    </button>
                  </div>
                  <div className="space-y-3">
                    {spaceMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-emerald-300">
                            {m.profile?.displayName?.[0] || "U"}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-200 block">{m.profile?.displayName || "Member"}</span>
                            <span className="text-[10px] text-slate-400">{m.title || "Collaborator"}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 uppercase">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {spaceActivities.slice(0, 5).map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-slate-300">{act.details}</p>
                          <span className="text-[10px] text-slate-500">
                            {new Date(act.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TASKS SUB-TAB */}
          {workspaceSubTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTaskViewMode("kanban")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      taskViewMode === "kanban" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Kanban Board
                  </button>
                  <button
                    onClick={() => setTaskViewMode("list")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      taskViewMode === "list" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Task List
                  </button>
                </div>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>

              {taskViewMode === "kanban" ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(["todo", "in_progress", "in_review", "completed"] as const).map((columnStatus) => {
                    const colTasks = spaceTasks.filter((t) => t.status === columnStatus);
                    const titleMap = {
                      todo: "To Do",
                      in_progress: "In Progress",
                      in_review: "In Review",
                      completed: "Completed",
                    };
                    return (
                      <div key={columnStatus} className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-xs font-semibold text-slate-300">{titleMap[columnStatus]}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                            {colTasks.length}
                          </span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {colTasks.map((t) => (
                            <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  t.priority === "urgent" ? "bg-red-900/40 text-red-300" :
                                  t.priority === "high" ? "bg-amber-900/40 text-amber-300" :
                                  "bg-slate-800 text-slate-400"
                                }`}>
                                  {t.priority}
                                </span>
                                <button
                                  onClick={() => handleToggleTaskStatus(t)}
                                  className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                                    t.status === "completed"
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "border-slate-700 hover:border-emerald-500"
                                  }`}
                                >
                                  {t.status === "completed" && <Check className="w-3 h-3" />}
                                </button>
                              </div>
                              <p className="text-xs font-medium text-slate-200">{t.title}</p>
                              {t.dueDate && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{t.dueDate}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
                  {spaceTasks.map((t) => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTaskStatus(t)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                            t.status === "completed"
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-700 hover:border-emerald-500"
                          }`}
                        >
                          {t.status === "completed" && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <p className={`text-sm font-medium ${t.status === "completed" ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {t.title}
                          </p>
                          <span className="text-xs text-slate-400">{t.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 uppercase">{t.status.replace("_", " ")}</span>
                        <span className="text-xs text-slate-500">{t.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MILESTONES SUB-TAB */}
          {workspaceSubTab === "milestones" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Project Milestones</h3>
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Milestone
                </button>
              </div>

              <div className="space-y-3">
                {spaceMilestones.map((m) => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">{m.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          m.status === "completed" ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50" :
                          m.status === "in_progress" ? "bg-blue-900/40 text-blue-300 border border-blue-700/50" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {m.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{m.description}</p>
                      {m.completionCriteria && (
                        <p className="text-[11px] text-slate-400">Criteria: {m.completionCriteria}</p>
                      )}
                    </div>
                    {m.targetDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {m.targetDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAT SUB-TAB */}
          {workspaceSubTab === "chat" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[550px]">
              {/* Channel Selector */}
              <div className="border-b border-slate-800 p-3 flex items-center gap-2 bg-slate-950/40">
                {["general", "announcements", "tasks", "milestones", "meetings"].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChatChannel(ch)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${
                      chatChannel === ch ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    #{ch}
                  </button>
                ))}
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {spaceMessages
                  .filter((m) => m.channel === chatChannel)
                  .map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0">
                        {msg.senderName[0] || "U"}
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-w-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-200">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-3 flex items-center gap-2 bg-slate-950/60">
                <input
                  type="text"
                  placeholder={`Message #${chatChannel}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* DOCUMENTS SUB-TAB */}
          {workspaceSubTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Workspace Documents & Artifacts</h3>
                <button
                  onClick={() => setShowDocumentModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spaceDocuments.map((doc) => (
                  <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/50 text-emerald-400 flex items-center justify-center mb-3">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">{doc.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{doc.description}</p>
                    </div>
                    <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{doc.fileSize || "1.2 MB"}</span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                      >
                        Download <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEETINGS SUB-TAB */}
          {workspaceSubTab === "meetings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Scheduled Collaboration Meetings</h3>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Schedule Meeting
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaceMeetings.map((meet) => (
                  <div key={meet.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{meet.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{meet.date} at {meet.time} ({meet.timezone})</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 uppercase">
                        {meet.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{meet.agenda}</p>
                    {meet.onlineMeetingLink && (
                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <a
                          href={meet.onlineMeetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white inline-flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Call
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEMBERS SUB-TAB */}
          {workspaceSubTab === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Workspace Members & Permissions</h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaceMembers.map((m) => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-emerald-400">
                        {m.profile?.displayName?.[0] || "U"}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{m.profile?.displayName || "Member"}</h4>
                        <span className="text-xs text-slate-400">{m.title || "Collaborator"}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-purple-300 uppercase">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Change Visibility Modal */}
        {showVisibilityModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Change Workspace Visibility
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentSpace.visibility === "private"
                  ? "Changing to Public allows other Balaga Founders members to discover your project outline and submit requests to join. Internal tasks, chats, documents, and meetings will remain strictly private to approved members."
                  : "Changing to Private will immediately remove this project from public project discovery. Only currently approved members will continue to have access."}
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowVisibilityModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleVisibility}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500"
                >
                  Confirm Change to {currentSpace.visibility === "private" ? "Public" : "Private"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <form onSubmit={handleCreateTask} className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-semibold text-white">Create New Task</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Implement OTLP 1.0 JSON exporter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Requirements, specs, or acceptance criteria..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Milestone Modal */}
        {showMilestoneModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <form onSubmit={handleCreateMilestone} className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-semibold text-white">Create New Milestone</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  placeholder="e.g. Alpha Architecture Validation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  placeholder="Summary of milestone deliverables..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={milestoneForm.targetDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Completion Criteria</label>
                <input
                  type="text"
                  value={milestoneForm.completionCriteria}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, completionCriteria: e.target.value })}
                  placeholder="e.g. End-to-end telemetry verified in staging"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {showMeetingModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <form onSubmit={handleScheduleMeeting} className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-semibold text-white">Schedule Collaboration Meeting</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="e.g. Weekly Engineering Sync"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Agenda</label>
                <textarea
                  value={meetingForm.agenda}
                  onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  placeholder="Topics to discuss, demo, or decision points..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={meetingForm.onlineMeetingLink}
                  onChange={(e) => setMeetingForm({ ...meetingForm, onlineMeetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upload Document Modal */}
        {showDocumentModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <form onSubmit={handleUploadDocument} className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-semibold text-white">Upload Workspace Document</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  value={documentForm.name}
                  onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                  placeholder="e.g. Architecture Overview v1.0.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Folder</label>
                <select
                  value={documentForm.folder}
                  onChange={(e) => setDocumentForm({ ...documentForm, folder: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="specifications">Specifications</option>
                  <option value="designs">Designs</option>
                  <option value="contracts">Contracts</option>
                  <option value="meeting_notes">Meeting Notes</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">File URL / Storage Link</label>
                <input
                  type="text"
                  value={documentForm.fileUrl}
                  onChange={(e) => setDocumentForm({ ...documentForm, fileUrl: e.target.value })}
                  placeholder="https://balaga.online/docs/spec.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  value={documentForm.description}
                  onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                  placeholder="Summary of document purpose..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <form onSubmit={handleInviteMember} className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-semibold text-white">Invite Collaborator to Space</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Member Profile ID / Email</label>
                <input
                  type="text"
                  required
                  value={inviteForm.inviteeProfileId}
                  onChange={(e) => setInviteForm({ ...inviteForm, inviteeProfileId: e.target.value })}
                  placeholder="e.g. founder-id-123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Role Assignment</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="admin">Admin (Manage members, settings, all content)</option>
                  <option value="editor">Editor (Tasks, milestones, documents, meetings)</option>
                  <option value="member">Member (Tasks, comments, chat, upload docs)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Invitation Message (Optional)</label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  placeholder="Welcome to our project build space! We're collaborating on..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Render Build Spaces Main Dashboard
  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
                Feature 12 • Balaga Founders
              </span>
              <span className="text-xs text-slate-400 font-mono">Option C: Private & Public Spaces</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Balaga Build Spaces</h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Unified private collaboration and project management system for founders, cofounders, and startup partnerships. Organize tasks, milestones, discussions, and docs with zero external noise.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{BUILD_SPACES_REGULATORY_DISCLAIMER}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition"
            >
              <Plus className="w-4 h-4" />
              Create Project Space
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              Discover Public Projects
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Counters */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All Spaces", count: stats?.totalSpaces },
              { id: "projects", label: "Project Spaces", count: stats?.projectSpacesCount },
              { id: "partnerships", label: "Partnership Spaces", count: stats?.partnershipSpacesCount },
              { id: "discover", label: "Public Projects", count: publicListings.length },
              { id: "my_created", label: "My Created", count: stats?.myCreatedCount },
              { id: "invitations", label: "Invitations", count: stats?.pendingInvitationsCount },
              { id: "join_requests", label: "Join Requests", count: stats?.pendingJoinRequestsCount },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {tab.label}
                  {typeof tab.count === "number" && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-emerald-700 text-white" : "bg-slate-800 text-slate-400"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Discover Public Projects (Option C) */}
        {activeTab === "discover" ? (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Option C Public Discovery:</span> Only designated project outlines are shown. Internal tasks, chats, documents, and meetings remain strictly private to approved members.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {publicListings.map((p) => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="text-2xl">{p.logoUrl || "⚡"}</div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{p.name}</h3>
                          <span className="text-[10px] text-emerald-400 capitalize">{p.category} • {p.developmentStage}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/50">
                        Public
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {p.shortDescription}
                    </p>

                    {p.skillsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.skillsRequired.slice(0, 3).map((sk, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">By {p.ownerName}</span>
                    <button
                      onClick={() => {
                        setTargetPublicSpace(p);
                        setShowJoinModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition flex items-center gap-1"
                    >
                      Request to Join <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "invitations" ? (
          /* Tab 2: Received Invitations */
          <div className="space-y-4">
            {invitations.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No pending workspace invitations</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invitations.map((inv) => (
                  <div key={inv.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">{inv.space?.name || "Workspace Invitation"}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 uppercase font-semibold">
                        Role: {inv.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{inv.message || "You have been invited to collaborate on this workspace."}</p>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleRespondInvitation(inv.id, "reject")}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespondInvitation(inv.id, "accept")}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                      >
                        Accept & Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "join_requests" ? (
          /* Tab 3: Join Requests */
          <div className="space-y-4">
            {joinRequests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No submitted or pending join requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinRequests.map((req) => (
                  <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Join Application</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                        req.status === "accepted" ? "bg-emerald-900/40 text-emerald-300" :
                        req.status === "rejected" ? "bg-red-900/40 text-red-300" :
                        "bg-amber-900/40 text-amber-300"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{req.introduction}</p>
                    <div className="flex flex-wrap gap-1">
                      {req.relevantSkills.map((sk, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Spaces Grid with Search & Filters */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workspaces by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                >
                  <option value="all">All Categories</option>
                  <option value="software">Software</option>
                  <option value="ai_ml">AI & ML</option>
                  <option value="saas">SaaS</option>
                  <option value="mobile_apps">Mobile Apps</option>
                  <option value="hardware">Hardware</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Loading workspaces...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {spaces.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleOpenSpace(s.id)}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-600/50 hover:shadow-xl hover:shadow-emerald-950/20 transition cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="text-2xl">{s.logoUrl || (s.type === "partnership" ? "🤝" : "🚀")}</div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">{s.name}</h3>
                            <span className="text-[10px] text-slate-400 capitalize">{s.category} • {s.developmentStage}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            s.type === "partnership"
                              ? "bg-purple-900/40 text-purple-300 border border-purple-700/50"
                              : "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50"
                          }`}
                        >
                          {s.type === "partnership" ? "Partnership" : "Project"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{s.shortDescription}</p>

                      {/* Genuine Progress Bars */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Tasks: {s.tasksCompletedCount || 0}/{s.tasksTotalCount || 0}</span>
                          <span className="font-semibold text-emerald-400">{s.taskProgressPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${s.taskProgressPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{s.memberCount} members</span>
                      </div>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        Open Space <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Project Space */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <form onSubmit={handleCreateSpace} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-white">Create Project Build Space</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. NovaMesh Telemetry Core"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={createForm.shortDescription}
                  onChange={(e) => setCreateForm({ ...createForm, shortDescription: e.target.value })}
                  placeholder="One sentence describing what you are building..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Detailed Overview *</label>
                <textarea
                  required
                  value={createForm.detailedOverview}
                  onChange={(e) => setCreateForm({ ...createForm, detailedOverview: e.target.value })}
                  placeholder="Deep dive into the architecture, target users, problem statement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="software">Software</option>
                    <option value="ai_ml">AI and Machine Learning</option>
                    <option value="saas">SaaS</option>
                    <option value="mobile_apps">Mobile Applications</option>
                    <option value="web_dev">Web Development</option>
                    <option value="hardware">Hardware</option>
                    <option value="education">Education</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Visibility (Option C)</label>
                  <select
                    value={createForm.visibility}
                    onChange={(e) => setCreateForm({ ...createForm, visibility: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="private">Private (Invited only)</option>
                    <option value="public">Public (Discoverable)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Main Goals (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={createForm.mainGoals}
                  onChange={(e) => setCreateForm({ ...createForm, mainGoals: e.target.value })}
                  placeholder="e.g. Build prototype, Launch alpha demo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Skills Needed</label>
                <input
                  type="text"
                  value={createForm.skillsRequired}
                  onChange={(e) => setCreateForm({ ...createForm, skillsRequired: e.target.value })}
                  placeholder="e.g. Rust, eBPF, Kubernetes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Request to Join */}
        {showJoinModal && targetPublicSpace && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <form onSubmit={handleSubmitJoinRequest} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-bold text-white">Request to Join {targetPublicSpace.name}</h3>
              <p className="text-xs text-slate-300">
                The project owner will review your application and background before granting workspace access.
              </p>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Introduction & Goals *</label>
                <textarea
                  required
                  value={joinForm.introduction}
                  onChange={(e) => setJoinForm({ ...joinForm, introduction: e.target.value })}
                  placeholder="Explain why you want to collaborate and what value you can add..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-24"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Relevant Skills *</label>
                <input
                  type="text"
                  required
                  value={joinForm.relevantSkills}
                  onChange={(e) => setJoinForm({ ...joinForm, relevantSkills: e.target.value })}
                  placeholder="e.g. Distributed Systems, Rust, UI Design"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
