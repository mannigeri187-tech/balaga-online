import { TwentyKanbanBoard, KanbanColumn } from "./TwentyKanbanBoard";
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  PlusCircle,
  Bookmark,
  BookmarkCheck,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  Users,
  Calendar,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  X,
  } from "lucide-react";
import {
  JobListing,
  JobApplication,
  HiringDashboardMetrics,
  HiringPermissionMember,
} from "@platform/shared-types";


const ATS_COLUMNS: KanbanColumn[] = [
  { id: "applied", title: "Applied", accentColor: "border-slate-500", badgeColor: "bg-slate-500/10 text-slate-400" },
  { id: "shortlisted", title: "Review", accentColor: "border-indigo-500", badgeColor: "bg-indigo-500/10 text-indigo-400" },
  { id: "screening", title: "Screening", accentColor: "border-amber-500", badgeColor: "bg-amber-500/10 text-amber-400" },
  { id: "interview", title: "Interview (Cal)", accentColor: "border-purple-500", badgeColor: "bg-purple-500/10 text-purple-400" },
  { id: "offer", title: "Offer Extended", accentColor: "border-emerald-500", badgeColor: "bg-emerald-500/10 text-emerald-400" },
  { id: "hired", title: "Hired", accentColor: "border-green-500", badgeColor: "bg-green-500/10 text-green-400" },
];

const MOCK_PIPELINE_APPLICANTS: any[] = [
  {
    id: "app-mock-1",
    status: "applied",
    currentRole: "Senior Go / Distributed Systems Engineer",
    experienceYears: 6,
    expectedCompensation: "₹24 LPA",
    joiningTimeline: "15 days",
    canMessage: true,
    personalIntro: "10+ years engineering high-throughput fintech infrastructure across India. Ex-Razorpay Senior Staff Engineer.",
    resumeFileName: "vikram_sen_resume.pdf",
    applicant: {
      displayName: "Vikram Sen",
      headline: "Ex-Razorpay Senior Staff Engineer | High-throughput Go",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      skills: ["Go", "Distributed Systems", "PostgreSQL", "Kafka"],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "app-mock-2",
    status: "screening",
    currentRole: "Full-Stack React & Node Architect",
    experienceYears: 5,
    expectedCompensation: "₹24 LPA",
    joiningTimeline: "15 days",
    canMessage: true,
    personalIntro: "Design technologist with 8 years building creative tools for vernacular crafts and cultural archiving.",
    resumeFileName: "ananya_deshmukh_cv.pdf",
    applicant: {
      displayName: "Ananya Deshmukh",
      headline: "Lead Frontend Engineer @ Vernacular Design Labs",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      skills: ["React", "TypeScript", "Tailwind", "Next.js"],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "app-mock-3",
    status: "interview",
    currentRole: "Lead Product Designer & Design Systems",
    experienceYears: 4,
    expectedCompensation: "₹24 LPA",
    joiningTimeline: "15 days",
    canMessage: true,
    personalIntro: "Specializing in micro-interactions, dark-mode design systems and responsive cross-platform canvas tools.",
    resumeFileName: "nikhil_rao_portfolio.pdf",
    applicant: {
      displayName: "Nikhil Rao",
      headline: "Design Technologist | Figma + Tailwind + Framer",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
      skills: ["Product Design", "Figma", "User Research", "Prototyping"],
    },
    createdAt: new Date().toISOString(),
  },
];

interface HiringCentreViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const HiringCentreView: React.FC<HiringCentreViewProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    | "discover"
    | "recommended"
    | "recent"
    | "remote"
    | "internships"
    | "saved"
    | "applications"
    | "my_jobs"
    | "dashboard"
  >("discover");

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [myStartupJobs, setMyStartupJobs] = useState<JobListing[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<HiringDashboardMetrics | null>(null);
  const [teamPermissions, setTeamPermissions] = useState<HiringPermissionMember[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("recent");

  // Modals state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobListing | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobListing | null>(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState<boolean>(false);
  const [pipelineJob, setPipelineJob] = useState<JobListing | null>(null);
  const [pipelineApplicants, setPipelineApplicants] = useState<JobApplication[]>([]);
  const [pipelineViewMode, setPipelineViewMode] = useState<"kanban" | "list">("kanban");
  const [interviewModalApp, setInterviewModalApp] = useState<JobApplication | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [reportModalJob, setReportModalJob] = useState<JobListing | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Hardcoded current authenticated founder context
  const currentStartupId = "st-mesh"; // BharatFin Mesh

  // Fetch jobs based on active tab
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/api/founders/hiring/jobs";
      if (activeSubTab === "recommended") {
        endpoint = "/api/founders/hiring/jobs/recommended";
      } else if (activeSubTab === "recent") {
        endpoint = "/api/founders/hiring/jobs/recent";
      } else if (activeSubTab === "remote") {
        endpoint = "/api/founders/hiring/jobs/remote";
      } else if (activeSubTab === "internships") {
        endpoint = "/api/founders/hiring/jobs/internships";
      } else if (activeSubTab === "saved") {
        endpoint = "/api/founders/hiring/saved";
      } else {
        const params = new URLSearchParams();
        if (searchTerm) params.append("q", searchTerm);
        if (selectedDepartment !== "all") params.append("department", selectedDepartment);
        if (selectedWorkMode !== "all") params.append("workMode", selectedWorkMode);
        if (selectedEmploymentType !== "all") params.append("employmentType", selectedEmploymentType);
        if (selectedSort) params.append("sort", selectedSort);
        endpoint = `/api/founders/hiring/jobs?${params.toString()}`;
      }

      const res = await fetch(endpoint, {
        headers: {
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch My Applications
  const fetchMyApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/founders/hiring/my-applications", {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setMyApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch My Startup Jobs
  const fetchMyStartupJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/founders/hiring/startups/${currentStartupId}/jobs`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setMyStartupJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch startup jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Dashboard Metrics
  const fetchDashboardMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/founders/hiring/startups/${currentStartupId}/dashboard`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Team Permissions
  const fetchTeamPermissions = async () => {
    try {
      const res = await fetch(`/api/founders/hiring/startups/${currentStartupId}/permissions`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setTeamPermissions(data.permissions || []);
      }
    } catch (err) {
      console.error("Failed to fetch team permissions:", err);
    }
  };

  useEffect(() => {
    if (activeSubTab === "applications") {
      fetchMyApplications();
    } else if (activeSubTab === "my_jobs") {
      fetchMyStartupJobs();
    } else if (activeSubTab === "dashboard") {
      fetchDashboardMetrics();
    } else {
      fetchJobs();
    }
  }, [
    activeSubTab,
    searchTerm,
    selectedDepartment,
    selectedWorkMode,
    selectedEmploymentType,
    selectedSort,
  ]);

  // Toggle Save Job
  const handleToggleSave = async (jobId: string) => {
    try {
      const res = await fetch(`/api/founders/hiring/jobs/${jobId}/save`, {
        method: "POST",
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage(data.message);
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, hasSaved: data.saved } : j))
        );
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to save job:", err);
    }
  };

  // Open Candidate Pipeline Modal for recruiter
  const openPipeline = async (job: JobListing) => {
    setPipelineJob(job);
    try {
      const res = await fetch(`/api/founders/hiring/jobs/${job.id}/candidates`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setPipelineApplicants(data.applicants && data.applicants.length > 0 ? data.applicants : MOCK_PIPELINE_APPLICANTS);
      }
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Official Recruitment Centre
              </span>
              <span className="text-xs text-slate-400">• Startup Vacancies</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-emerald-400" />
              Hiring Centre
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Connect with high-growth Indian startups hiring top builders, engineers, and product leaders.
              Official jobs published exclusively by verified startup team representatives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                fetchTeamPermissions();
                setShowPermissionsModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hiring Permissions
            </button>
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post Official Job
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {statusMessage && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 9 Navigation Subtabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        {[
          { id: "discover", label: "Discover Jobs", icon: Search },
          { id: "recommended", label: "Recommended", icon: Sparkles },
          { id: "recent", label: "Recently Posted", icon: Clock },
          { id: "remote", label: "Remote Jobs", icon: Building },
          { id: "internships", label: "Internships", icon: FileText },
          { id: "saved", label: "Saved Jobs", icon: Bookmark },
          { id: "applications", label: "My Applications", icon: FileCheck },
          { id: "my_jobs", label: "My Startup Jobs", icon: Users },
          { id: "dashboard", label: "Hiring Dashboard", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar (Visible in job discovery subtabs) */}
      {["discover", "remote", "internships"].includes(activeSubTab) && (
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by job title, skills, startup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Departments</option>
            <option value="Core Engineering">Core Engineering</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Design & UX">Design & UX</option>
            <option value="Growth & Marketing">Growth & Marketing</option>
            <option value="Executive">Executive</option>
          </select>

          <select
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Work Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on-site">On-site</option>
          </select>

          <select
            value={selectedEmploymentType}
            onChange={(e) => setSelectedEmploymentType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Employment Types</option>
            <option value="full-time">Full-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>

          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="deadline">Sort: Approaching Deadline</option>
            <option value="views">Sort: Most Viewed</option>
            <option value="applications">Sort: Most Applications</option>
          </select>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Loading Hiring Centre data...
        </div>
      ) : activeSubTab === "applications" ? (
        /* My Applications Tab */
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            My Submitted Applications ({myApplications.length})
          </h2>
          {myApplications.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              You have not submitted any active job applications yet. Discover open positions in Discover Jobs!
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-400">
                          {app.startup?.name}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-slate-400">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{app.job?.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                          app.status === "hired"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : app.status === "offer"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : app.status === "interview"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : app.status === "shortlisted"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : app.status === "rejected"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : app.status === "withdrawn"
                            ? "bg-slate-700 text-slate-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        Status: {app.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{app.personalIntro}</p>

                  {/* Scheduled Interviews if any */}
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="p-3 bg-purple-950/30 border border-purple-900/50 rounded-lg text-xs space-y-1 text-purple-200">
                      <div className="font-semibold flex items-center gap-1.5 text-purple-300">
                        <Calendar className="w-3.5 h-3.5" />
                        Scheduled Interview: {app.interviews[0].interviewDate} at{" "}
                        {app.interviews[0].interviewTime} ({app.interviews[0].timezone})
                      </div>
                      <p className="text-[11px] text-purple-300/80">
                        Type: {app.interviews[0].interviewType.replace("_", " ")} • Link:{" "}
                        <a
                          href={app.interviews[0].meetingLocationOrLink}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-white"
                        >
                          {app.interviews[0].meetingLocationOrLink}
                        </a>
                      </p>
                      {app.interviews[0].candidateFacingNotes && (
                        <p className="text-[11px] italic text-purple-300/70">
                          Note from panel: "{app.interviews[0].candidateFacingNotes}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Timeline History */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Last updated {new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {app.status !== "withdrawn" && app.status !== "hired" && (
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to withdraw your application?")) {
                            await fetch(`/api/founders/hiring/applications/${app.id}/withdraw`, {
                              method: "POST",
                              headers: { "x-platform-world": "founders" },
                            });
                            fetchMyApplications();
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-300 underline"
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === "my_jobs" ? (
        /* My Startup Jobs (Recruiter View) */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Startup Job Listings ({myStartupJobs.length})
            </h2>
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Post New Job
            </button>
          </div>

          <div className="space-y-3">
            {myStartupJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">
                        {job.department}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400 capitalize">
                        {job.employmentType}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400 capitalize">{job.workMode}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{job.title}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                      job.status === "open"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : job.status === "paused"
                        ? "bg-amber-500/20 text-amber-400"
                        : job.status === "draft"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> {job.viewsCount} Views
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> {job.applicationsCount} Applicants
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Deadline:{" "}
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPipeline(job)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Manage Candidates ({job.applicationsCount})
                    </button>
                    <button
                      onClick={async () => {
                        const newStatus = job.status === "open" ? "paused" : "open";
                        await fetch(`/api/founders/hiring/jobs/${job.id}/status`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "x-platform-world": "founders",
                          },
                          body: JSON.stringify({ status: newStatus }),
                        });
                        fetchMyStartupJobs();
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      {job.status === "open" ? "Pause Applications" : "Reopen Job"}
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedJobForDetail(job)}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Preview Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === "dashboard" ? (
        /* Hiring Dashboard Metrics View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Recruitment Command Dashboard
            </h2>
            <span className="text-xs text-slate-400">
              Verified Metrics for {myStartupJobs[0]?.startup?.name || "BharatFin Mesh"}
            </span>
          </div>

          {dashboardMetrics && (
            <>
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[
                  { label: "Active Jobs", val: dashboardMetrics.activeJobs, color: "text-emerald-400" },
                  { label: "Total Applications", val: dashboardMetrics.totalApplications, color: "text-white" },
                  { label: "Shortlisted", val: dashboardMetrics.shortlisted, color: "text-amber-400" },
                  { label: "Interviews", val: dashboardMetrics.interviews, color: "text-purple-400" },
                  { label: "Offers Made", val: dashboardMetrics.offers, color: "text-blue-400" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1"
                  >
                    <span className="text-[11px] font-medium text-slate-400">{stat.label}</span>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Recruitment Pipeline Funnel Breakdown */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Candidate Pipeline Funnel
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Applied (Unviewed)</span>
                    <span className="text-lg font-bold text-slate-200">
                      {dashboardMetrics.newApplications}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Viewed / Screening</span>
                    <span className="text-lg font-bold text-slate-200">
                      {dashboardMetrics.viewedApplications + dashboardMetrics.screening}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Active Interviews</span>
                    <span className="text-lg font-bold text-purple-400">
                      {dashboardMetrics.interviews}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Hires Finalized</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {dashboardMetrics.hires}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Application Deadlines */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Upcoming Deadlines (Next 30 Days)
                </h3>
                {dashboardMetrics.upcomingDeadlines.length === 0 ? (
                  <p className="text-xs text-slate-400">No deadlines approaching in the next 30 days.</p>
                ) : (
                  <div className="space-y-2">
                    {dashboardMetrics.upcomingDeadlines.map((dl) => (
                      <div
                        key={dl.id}
                        className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white block">{dl.title}</span>
                          <span className="text-slate-400 text-[11px]">
                            {dl.applicationsCount} applicants submitted
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-medium text-[11px]">
                          Closes on {new Date(dl.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Standard Job Cards Grid (Discover, Recommended, Remote, etc.) */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {jobs.length} open {activeSubTab === "recommended" ? "recommended " : ""}jobs
            </span>
            {activeSubTab === "recommended" && (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Matched to your skills & work preferences
              </span>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm space-y-2">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No job postings match your selected criteria or search term.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("all");
                  setSelectedWorkMode("all");
                  setSelectedEmploymentType("all");
                }}
                className="text-xs text-emerald-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Startup info header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-base">
                          {job.startup?.name ? job.startup.name.slice(0, 2).toUpperCase() : "ST"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {job.startup?.name}
                            </span>
                            {job.startup?.verificationLevel === "verified_business" && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold">
                                Verified
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block line-clamp-1">
                            {job.startup?.oneLiner}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSave(job.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          job.hasSaved
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                        title={job.hasSaved ? "Unsave" : "Save Job"}
                      >
                        {job.hasSaved ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Job Title & Department */}
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                          {job.department}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 capitalize">
                          {job.employmentType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 capitalize flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {job.broadLocation} ({job.workMode})
                        </span>
                      </div>
                    </div>

                    {/* Job Summary */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {job.jobSummary}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap items-center gap-1">
                      {job.requiredSkills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="text-[10px] text-slate-500">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compensation & Actions Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Compensation</span>
                      <span className="text-xs font-bold text-white">
                        {job.compensationType === "range" && job.compensationMin && job.compensationMax
                          ? `₹${(job.compensationMin / 100000).toFixed(1)}L - ₹${(job.compensationMax / 100000).toFixed(1)}L / yr`
                          : job.compensationType === "fixed" && job.compensationMin
                          ? `₹${job.compensationMin.toLocaleString()} / mo`
                          : job.compensationType === "negotiable"
                          ? "Negotiable Equity / Cash"
                          : "Undisclosed"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJobForDetail(job)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        Details
                      </button>

                      {job.hasApplied ? (
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedJobForApply(job)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                        >
                          Apply Now
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

      {/* ===================================================================== */}
      {/* MODAL 1: JOB DETAIL MODAL                                              */}
      {/* ===================================================================== */}
      {selectedJobForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 relative text-slate-200">
            <button
              onClick={() => setSelectedJobForDetail(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedJobForDetail.department}
                </span>
                <span className="text-xs text-slate-400">
                  Posted {new Date(selectedJobForDetail.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedJobForDetail.title}</h2>
              <p className="text-xs text-slate-300 font-medium">
                {selectedJobForDetail.startup?.name} • {selectedJobForDetail.broadLocation} (
                {selectedJobForDetail.workMode}) • {selectedJobForDetail.employmentType}
              </p>
            </div>

            {/* Compensation & Openings Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Compensation</span>
                <span className="font-bold text-white">
                  {selectedJobForDetail.compensationType === "range" &&
                  selectedJobForDetail.compensationMin &&
                  selectedJobForDetail.compensationMax
                    ? `₹${(selectedJobForDetail.compensationMin / 100000).toFixed(1)}L - ₹${(
                        selectedJobForDetail.compensationMax / 100000
                      ).toFixed(1)}L`
                    : selectedJobForDetail.compensationType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Experience</span>
                <span className="font-bold text-white">
                  {selectedJobForDetail.experienceRequirements}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Openings</span>
                <span className="font-bold text-white">{selectedJobForDetail.openingsCount}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Application Deadline</span>
                <span className="font-bold text-amber-400">
                  {new Date(selectedJobForDetail.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">About the Role</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedJobForDetail.description}
              </p>
            </div>

            {/* Responsibilities */}
            {selectedJobForDetail.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {selectedJobForDetail.responsibilities.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJobForDetail.requiredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter Contact if authorized */}
            {selectedJobForDetail.hiringContact && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] block">Hiring Lead</span>
                <span className="font-bold text-white">
                  {selectedJobForDetail.hiringContact.name} ({selectedJobForDetail.hiringContact.title})
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setReportModalJob(selectedJobForDetail);
                  setSelectedJobForDetail(null);
                }}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Report Job Listing
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJobForDetail(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedJobForApply(selectedJobForDetail);
                    setSelectedJobForDetail(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30"
                >
                  Proceed to Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: APPLY FOR JOB MODAL                                           */}
      {/* ===================================================================== */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400">
                  {selectedJobForApply.startup?.name}
                </span>
                <h3 className="text-lg font-bold text-white">Apply for {selectedJobForApply.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJobForApply(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const intro = (form.elements.namedItem("personalIntro") as HTMLTextAreaElement).value;
                const availability = (form.elements.namedItem("availability") as HTMLSelectElement).value;
                const joining = (form.elements.namedItem("joiningTimeline") as HTMLSelectElement).value;
                const expectedComp = (form.elements.namedItem("expectedComp") as HTMLInputElement).value;
                const portfolio = (form.elements.namedItem("portfolio") as HTMLInputElement).value;

                try {
                  const res = await fetch(`/api/founders/hiring/jobs/${selectedJobForApply.id}/apply`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-platform-world": "founders",
                    },
                    body: JSON.stringify({
                      personalIntro: intro,
                      resumeUrl: "/uploads/resumes/my_resume_cv.pdf",
                      resumeFileName: "Candidate_Official_CV.pdf",
                      resumeFileSize: 1024 * 650,
                      availability,
                      joiningTimeline: joining,
                      expectedCompensation: expectedComp,
                      portfolioUrl: portfolio,
                      relevantSkills: selectedJobForApply.requiredSkills,
                      screeningAnswers: {},
                    }),
                  });

                  if (res.ok) {
                    const data = await res.json();
                    setStatusMessage(data.message);
                    setSelectedJobForApply(null);
                    fetchJobs();
                    setActiveSubTab("applications");
                  } else {
                    const err = await res.json();
                    alert(err.error || "Failed to submit application");
                  }
                } catch (err) {
                  console.error("Application error:", err);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Personal Introduction & Elevator Pitch *
                </label>
                <textarea
                  name="personalIntro"
                  rows={3}
                  required
                  placeholder="Introduce yourself, your recent high-impact wins, and why this startup excites you..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Availability *</label>
                  <select
                    name="availability"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="part_time">Part-Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Joining Timeline *</label>
                  <select
                    name="joiningTimeline"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Immediate">Immediate (&lt; 7 days)</option>
                    <option value="15 days">15 days</option>
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expected Compensation</label>
                  <input
                    type="text"
                    name="expectedComp"
                    placeholder="e.g. ₹45,00,000 / year"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Portfolio or GitHub Link</label>
                  <input
                    type="url"
                    name="portfolio"
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Uploaded CV preview notice */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> Attached: Candidate_Official_CV.pdf (650 KB)
                </span>
                <span className="text-[10px] text-emerald-400/80">Validated Private Storage</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-900/30"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CREATE OFFICIAL JOB MODAL                                     */}
      {/* ===================================================================== */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400">
                  Authorized Recruiter Only
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Post Official Startup Job</h3>
              </div>
              <button
                onClick={() => setShowCreateJobModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                const dept = (form.elements.namedItem("department") as HTMLSelectElement).value;
                const empType = (form.elements.namedItem("employmentType") as HTMLSelectElement).value;
                const mode = (form.elements.namedItem("workMode") as HTMLSelectElement).value;
                const loc = (form.elements.namedItem("location") as HTMLInputElement).value;
                const minSal = Number((form.elements.namedItem("minComp") as HTMLInputElement).value) || 3000000;
                const maxSal = Number((form.elements.namedItem("maxComp") as HTMLInputElement).value) || 5000000;
                const summary = (form.elements.namedItem("jobSummary") as HTMLInputElement).value;
                const desc = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
                const skillsStr = (form.elements.namedItem("skills") as HTMLInputElement).value;
                const reqSkills = skillsStr ? skillsStr.split(",").map((s) => s.trim()) : ["Go", "Distributed Systems"];

                try {
                  const res = await fetch("/api/founders/hiring/jobs", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-platform-world": "founders",
                    },
                    body: JSON.stringify({
                      startupId: currentStartupId,
                      title,
                      department: dept,
                      employmentType: empType,
                      workMode: mode,
                      broadLocation: loc,
                      compensationType: "range",
                      compensationMin: minSal,
                      compensationMax: maxSal,
                      currency: "INR",
                      openingsCount: 1,
                      applicationDeadline: new Date(Date.now() + 86400000 * 30).toISOString(),
                      jobSummary: summary,
                      description: desc,
                      responsibilities: [
                        "Architect core distributed features with low latency guarantees.",
                        "Collaborate with engineering leads and product management.",
                      ],
                      requiredSkills: reqSkills,
                      experienceRequirements: "4-7 years",
                      status: "open",
                    }),
                  });

                  if (res.ok) {
                    const data = await res.json();
                    setStatusMessage(data.message);
                    setShowCreateJobModal(false);
                    fetchJobs();
                    setActiveSubTab("my_jobs");
                  } else {
                    const err = await res.json();
                    alert(err.error || "Failed to create official job listing.");
                  }
                } catch (err) {
                  console.error("Job creation error:", err);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Senior Distributed Systems Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <select
                    name="department"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Core Engineering">Core Engineering</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Growth & Marketing">Growth & Marketing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Type *</label>
                  <select
                    name="employmentType"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Mode *</label>
                  <select
                    name="workMode"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Broad Location *</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue="Bengaluru, Karnataka"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Annual CTC (INR)</label>
                  <input
                    type="number"
                    name="minComp"
                    defaultValue={3000000}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Annual CTC (INR)</label>
                  <input
                    type="number"
                    name="maxComp"
                    defaultValue={4500000}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Required Skills (comma separated) *</label>
                <input
                  type="text"
                  name="skills"
                  defaultValue="Go, PostgreSQL, Distributed Systems, Redis"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Summary (1-2 sentences) *</label>
                <input
                  type="text"
                  name="jobSummary"
                  required
                  placeholder="Short description shown on preview cards..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Description *</label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  placeholder="Elaborate on the startup mission, architectural challenges, and growth trajectory..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-900/30"
                >
                  Publish Official Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: TWENTY-CRM STYLE CANDIDATE PIPELINE KANBAN                   */}
      {/* ===================================================================== */}
      {pipelineJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col p-6 space-y-4 text-slate-200 shadow-2xl">
            {/* Header with Title and Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Twenty CRM ATS Engine
                  </span>
                  <span className="text-xs text-slate-400">
                    {pipelineApplicants.length} Candidates in Pipeline
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{pipelineJob.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPipelineViewMode("kanban")}
                    className={"px-3 py-1 text-xs font-bold rounded-lg transition-colors " + (pipelineViewMode === "kanban" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                  >
                    Kanban Board
                  </button>
                  <button
                    type="button"
                    onClick={() => setPipelineViewMode("list")}
                    className={"px-3 py-1 text-xs font-bold rounded-lg transition-colors " + (pipelineViewMode === "list" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                  >
                    List Table
                  </button>
                </div>

                <button
                  onClick={() => setPipelineJob(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close pipeline"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto min-h-[460px]">
              {pipelineViewMode === "kanban" ? (
                <TwentyKanbanBoard
                  columns={ATS_COLUMNS}
                  items={pipelineApplicants.map((app) => ({
                    id: app.id,
                    columnId: app.status || "applied",
                    title: app.applicant?.displayName || "Candidate",
                    subtitle: (app.currentRole || app.applicant?.headline || "Software Engineer") + " • " + (app.experienceYears || 4) + " yrs exp",
                    avatarUrl: app.applicant?.avatarUrl,
                    tags: app.applicant?.skills?.slice(0, 3) || ["TypeScript", "FullStack"],
                    metrics: [
                      {
                        label: "Expected CTC",
                        value: app.expectedCompensation || "Market Standard",
                      },
                      {
                        label: "Notice Period",
                        value: app.joiningTimeline || "Immediate",
                      },
                    ],
                    actionLabel: "Schedule (Cal)",
                    onActionClick: () => setInterviewModalApp(app),
                  }))}
                  onMoveItem={async (appId: string, targetColId: string) => {
                    setPipelineApplicants((prev) =>
                      prev.map((a) => (a.id === appId ? { ...a, status: targetColId as any } : a))
                    );
                    try {
                      await fetch("/api/founders/hiring/applications/" + appId + "/status", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-platform-world": "founders",
                        },
                        body: JSON.stringify({ status: targetColId }),
                      });
                    } catch {}
                  }}
                  onItemClick={(item: any) => {
                    const matched = pipelineApplicants.find((a) => a.id === item.id);
                    if (matched) setInterviewModalApp(matched);
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {pipelineApplicants.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{app.applicant?.displayName || "Candidate"}</h4>
                        <span className="text-xs text-slate-400">
                          {(app.currentRole || app.applicant?.headline) + " • " + (app.experienceYears || 5) + " yrs exp"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            setPipelineApplicants((prev) =>
                              prev.map((a) => (a.id === app.id ? { ...a, status: newStatus as any } : a))
                            );
                            await fetch("/api/founders/hiring/applications/" + app.id + "/status", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "x-platform-world": "founders" },
                              body: JSON.stringify({ status: newStatus }),
                            }).catch(() => {});
                          }}
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1"
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Review</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="hired">Hired</option>
                        </select>
                        <button
                          onClick={() => setInterviewModalApp(app)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" /> Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: INTERVIEW SCHEDULING MODAL                                    */}
      {/* ===================================================================== */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-purple-400">Interview Scheduling</span>
                <h3 className="text-base font-bold text-white">
                  Schedule Round with {interviewModalApp.applicant?.displayName}
                </h3>
              </div>
              <button
                onClick={() => setInterviewModalApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const date = (form.elements.namedItem("date") as HTMLInputElement).value;
                const time = (form.elements.namedItem("time") as HTMLInputElement).value;
                const type = (form.elements.namedItem("type") as HTMLSelectElement).value;
                const link = (form.elements.namedItem("link") as HTMLInputElement).value;
                const notes = (form.elements.namedItem("notes") as HTMLTextAreaElement).value;

                try {
                  const res = await fetch(
                    `/api/founders/hiring/applications/${interviewModalApp.id}/interviews`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "x-platform-world": "founders",
                      },
                      body: JSON.stringify({
                        interviewDate: date,
                        interviewTime: time,
                        timezone: "Asia/Kolkata",
                        interviewType: type,
                        meetingLocationOrLink: link,
                        candidateFacingNotes: notes,
                      }),
                    }
                  );

                  if (res.ok) {
                    alert("Interview successfully scheduled and candidate notified.");
                    setInterviewModalApp(null);
                    if (pipelineJob) openPipeline(pipelineJob);
                  } else {
                    const err = await res.json();
                    alert(err.error || "Failed to schedule interview.");
                  }
                } catch (err) {
                  console.error("Interview scheduling error:", err);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Interview Date *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time (IST) *</label>
                  <input
                    type="text"
                    name="time"
                    required
                    defaultValue="03:00 PM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Interview Type *</label>
                <select
                  name="type"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="technical">Technical Architecture Round</option>
                  <option value="cultural_fit">Cultural & Founders Fit</option>
                  <option value="video">Introductory Video Screen</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Meeting Link or Location *</label>
                <input
                  type="text"
                  name="link"
                  required
                  defaultValue="https://meet.google.com/bfm-interview"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Candidate Preparation Note</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Instructions sent directly to the candidate..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalApp(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Confirm & Notify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: MANAGE TEAM HIRING PERMISSIONS MODAL                          */}
      {/* ===================================================================== */}
      {showPermissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 text-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400">Team Access Control</span>
                <h3 className="text-base font-bold text-white">Startup Hiring Permissions</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirmed Decision: Owner & Admin hold full hiring authority. Hiring Manager and Editor
                  require explicit grant. Viewers have zero access.
                </p>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {teamPermissions.map((mem) => (
                <div
                  key={mem.profileId}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{mem.profileName}</span>
                    <span className="text-slate-400 text-[11px] capitalize">
                      Role: {mem.role} • {mem.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {mem.role === "owner" || mem.role === "admin" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                        Full Hiring Control
                      </span>
                    ) : mem.role === "viewer" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-500 font-semibold text-[10px]">
                        No Hiring Access
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          const res = await fetch(
                            `/api/founders/hiring/startups/${currentStartupId}/permissions`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "x-platform-world": "founders",
                              },
                              body: JSON.stringify({
                                profileId: mem.profileId,
                                canManageHiring: !mem.canManageHiring,
                              }),
                            }
                          );
                          if (res.ok) {
                            fetchTeamPermissions();
                          } else {
                            const err = await res.json();
                            alert(err.error || "Permission change denied");
                          }
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                          mem.canManageHiring
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-red-500/10 hover:text-red-300"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {mem.canManageHiring ? "Hiring Granted (Revoke)" : "Grant Hiring Access"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: REPORT JOB MODAL                                              */}
      {/* ===================================================================== */}
      {reportModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-200 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Report Job: {reportModalJob.title}
            </h3>
            <p className="text-slate-400">
              Help maintain trust & safety in the Balaga Founders network. Fraudulent, scam, or
              misleading job listings are strictly investigated.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const reason = (form.elements.namedItem("reason") as HTMLSelectElement).value;
                const details = (form.elements.namedItem("details") as HTMLTextAreaElement).value;

                await fetch(`/api/founders/hiring/jobs/${reportModalJob.id}/report`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-platform-world": "founders",
                  },
                  body: JSON.stringify({ reason, details }),
                });

                alert("Thank you. The listing has been flagged for moderation review.");
                setReportModalJob(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Report *</label>
                <select
                  name="reason"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Suspicious compensation or fee requested">
                    Suspicious compensation or upfront fee requested
                  </option>
                  <option value="Misleading job description or requirements">
                    Misleading job description or requirements
                  </option>
                  <option value="Impersonation of existing startup">
                    Impersonation of existing startup
                  </option>
                  <option value="Spam or promotional advertisement">
                    Spam or promotional advertisement
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Additional Details</label>
                <textarea
                  name="details"
                  rows={3}
                  placeholder="Provide context or evidence to assist our Trust & Safety reviewers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportModalJob(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
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
