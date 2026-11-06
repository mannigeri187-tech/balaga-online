import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertCircle,
  Check,
  X,
  Info,
  Building,
  Rocket,
} from "lucide-react";
import {
  VerificationApplication,
  VerificationDocument,
} from "@platform/shared-types";
import {
  VERIFICATION_LEGAL_DISCLAIMER,
} from "@platform/config";
import {
  BlueProjectIcon,
  TealBusinessSeal,
  GoldPremiumCrown,
} from "../../components/ui/VerificationBadge";

export const VerificationCentreView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"applications" | "apply_blue" | "apply_teal">("applications");
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Blue Form State
  const [blueForm, setBlueForm] = useState({
    startupName: "",
    operatingStage: "Working Prototype",
    website: "",
    description: "",
    docName: "Architecture & Codebase Overview",
    docUrl: "https://storage.platform.local/docs/repo_overview.pdf",
  });

  // Teal Form State
  const [tealForm, setTealForm] = useState({
    legalBusinessName: "",
    registrationType: "Private Limited",
    registrationNumber: "",
    jurisdiction: "ROC Karnataka, Ministry of Corporate Affairs, India",
    website: "",
    docName: "Certificate of Incorporation (COI)",
    docUrl: "https://storage.platform.local/docs/incorporation_cert.pdf",
  });

  // Appeal Modal State
  const [appealAppId, setAppealAppId] = useState<string | null>(null);
  const [appealNotes, setAppealNotes] = useState("");

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/founders/verification/my-applications", {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load verification applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const handleApplyBlue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!blueForm.startupName.trim()) {
      setErrorMsg("Startup or project name is required");
      return;
    }

    try {
      const docs: VerificationDocument[] = [];
      if (blueForm.docName.trim() && blueForm.docUrl.trim()) {
        docs.push({
          id: `vdoc-${Date.now()}`,
          name: blueForm.docName.trim(),
          url: blueForm.docUrl.trim(),
          uploadedAt: new Date().toISOString(),
        });
      }

      const res = await fetch("/api/founders/verification/apply/blue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          startupName: blueForm.startupName.trim(),
          operatingStage: blueForm.operatingStage,
          website: blueForm.website.trim() || undefined,
          description: blueForm.description.trim() || undefined,
          supportingDocuments: docs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit Blue verification application");
      } else {
        setSuccessMsg("Blue Project verification application submitted successfully!");
        setBlueForm({
          startupName: "",
          operatingStage: "Working Prototype",
          website: "",
          description: "",
          docName: "Architecture & Codebase Overview",
          docUrl: "https://storage.platform.local/docs/repo_overview.pdf",
        });
        setActiveTab("applications");
        fetchMyApplications();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error occurred");
    }
  };

  const handleApplyTeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!tealForm.legalBusinessName.trim() || !tealForm.registrationNumber.trim()) {
      setErrorMsg("Legal business name and registration identifier (CIN/LLPIN/GSTIN) are required");
      return;
    }

    try {
      const docs: VerificationDocument[] = [
        {
          id: `vdoc-${Date.now()}`,
          name: tealForm.docName.trim() || "Incorporation Document",
          url: tealForm.docUrl.trim() || "https://storage.platform.local/docs/cert.pdf",
          uploadedAt: new Date().toISOString(),
        },
      ];

      const res = await fetch("/api/founders/verification/apply/teal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          legalBusinessName: tealForm.legalBusinessName.trim(),
          registrationType: tealForm.registrationType,
          registrationNumber: tealForm.registrationNumber.trim(),
          jurisdiction: tealForm.jurisdiction.trim(),
          website: tealForm.website.trim() || undefined,
          supportingDocuments: docs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit Teal verification application");
      } else {
        setSuccessMsg("Teal Registered Business verification application submitted successfully!");
        setTealForm({
          legalBusinessName: "",
          registrationType: "Private Limited",
          registrationNumber: "",
          jurisdiction: "ROC Karnataka, Ministry of Corporate Affairs, India",
          website: "",
          docName: "Certificate of Incorporation (COI)",
          docUrl: "https://storage.platform.local/docs/incorporation_cert.pdf",
        });
        setActiveTab("applications");
        fetchMyApplications();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error occurred");
    }
  };

  const handleAppeal = async () => {
    if (!appealAppId || appealNotes.trim().length < 10) {
      setErrorMsg("Appeal explanation must be at least 10 characters");
      return;
    }

    try {
      const res = await fetch(`/api/founders/verification/applications/${appealAppId}/appeal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({ appealNotes: appealNotes.trim() }),
      });

      if (res.ok) {
        setSuccessMsg("Appeal submitted successfully and returned to queue");
        setAppealAppId(null);
        setAppealNotes("");
        fetchMyApplications();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Failed to submit appeal");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit appeal");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Balaga Identity & Credential Assurance</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Verification Application Centre</h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Submit, track, and authenticate project milestones and legal corporate registrations.
            Earn authentic trust badges recognized across the Indian startup ecosystem.
          </p>
        </div>

        {/* Legal Disclaimer Pill */}
        <div className="mt-6 flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>{VERIFICATION_LEGAL_DISCLAIMER}</span>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Final Badge Designs Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Blue Badge Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <BlueProjectIcon size={28} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Startup / Project
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Blue — Verified Project / Startup</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              For early-stage projects and startups, including those without formal company registration.
              Demonstrates verified codebase, prototype, and milestones.
            </p>
          </div>
        </div>

        {/* Teal Badge Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-teal-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <TealBusinessSeal size={28} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Registered Entity
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Teal — Verified Registered Business</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              For legally registered statutory companies (Pvt Ltd, LLP, Partnership). Authenticated via MCA CIN, LLPIN, or GSTIN documentation.
            </p>
          </div>
        </div>

        {/* Gold Badge Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <GoldPremiumCrown size={28} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Membership
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Gold — Premium Member</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Gold crown inside a white rounded-square tile (replaces purple everywhere in Premium).
              Indicates active subscription with direct DM and connection privileges.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "applications"
              ? "bg-slate-800 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab("apply_blue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "apply_blue"
              ? "bg-blue-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Apply for Blue Project</span>
        </button>
        <button
          onClick={() => setActiveTab("apply_teal")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "apply_teal"
              ? "bg-teal-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Apply for Teal Business</span>
        </button>
      </div>

      {/* Tab: My Applications */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">No Verification Applications Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Apply for Blue Project or Teal Registered Business verification to showcase authenticated credentials to collaborators and investors.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("apply_blue")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Apply for Blue Project
                </button>
                <button
                  onClick={() => setActiveTab("apply_teal")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Apply for Teal Business
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 mt-1">
                      {app.type === "blue_project" ? (
                        <BlueProjectIcon size={24} />
                      ) : (
                        <TealBusinessSeal size={24} />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-white">
                          {app.startupName || app.legalBusinessName}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                            app.status === "verified"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : app.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : app.status === "rejected"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {app.type === "blue_project" ? "Blue Project / Startup" : "Teal Registered Corporate Entity"} • Submitted {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.registrationNumber && (
                        <p className="text-xs text-slate-300 font-mono">
                          ID: {app.registrationNumber} ({app.jurisdiction || "ROC"})
                        </p>
                      )}
                      {app.reviewerNotes && (
                        <p className="text-xs text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                          Reviewer notes: {app.reviewerNotes}
                        </p>
                      )}
                      {app.rejectionReason && (
                        <p className="text-xs text-rose-400 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                          Rejection reason: {app.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {app.status === "rejected" && (
                      <button
                        onClick={() => {
                          setAppealAppId(app.id);
                          setAppealNotes("");
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
                      >
                        Appeal Decision
                      </button>
                    )}
                    <div className="text-xs text-slate-400">
                      {app.supportingDocuments.length} document{app.supportingDocuments.length === 1 ? "" : "s"} attached
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Apply for Blue Project */}
      {activeTab === "apply_blue" && (
        <form onSubmit={handleApplyBlue} className="max-w-2xl p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <BlueProjectIcon size={24} />
            <div>
              <h3 className="text-base font-semibold text-white">Blue Project / Startup Verification</h3>
              <p className="text-xs text-slate-400">Early-stage projects & startups (no formal corporate registration required).</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Startup / Project Name *</label>
              <input
                type="text"
                required
                value={blueForm.startupName}
                onChange={(e) => setBlueForm({ ...blueForm, startupName: e.target.value })}
                placeholder="e.g. DocuLens AI"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Operating Stage *</label>
              <select
                value={blueForm.operatingStage}
                onChange={(e) => setBlueForm({ ...blueForm, operatingStage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Idea & Discovery">Idea & Discovery</option>
                <option value="Working Prototype">Working Prototype</option>
                <option value="Private Alpha">Private Alpha</option>
                <option value="Public Beta">Public Beta</option>
                <option value="Pre-Revenue Launch">Pre-Revenue Launch</option>
                <option value="Post-Revenue / Early Traction">Post-Revenue / Early Traction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Website or Product Demo Link</label>
              <input
                type="url"
                value={blueForm.website}
                onChange={(e) => setBlueForm({ ...blueForm, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Supporting Architecture / Evidence Document</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={blueForm.docName}
                  onChange={(e) => setBlueForm({ ...blueForm, docName: e.target.value })}
                  placeholder="Document Title"
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  value={blueForm.docUrl}
                  onChange={(e) => setBlueForm({ ...blueForm, docUrl: e.target.value })}
                  placeholder="https://storage.platform.local/..."
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
            >
              Submit Blue Verification Application
            </button>
          </div>
        </form>
      )}

      {/* Tab: Apply for Teal Business */}
      {activeTab === "apply_teal" && (
        <form onSubmit={handleApplyTeal} className="max-w-2xl p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <TealBusinessSeal size={24} />
            <div>
              <h3 className="text-base font-semibold text-white">Teal Registered Business Verification</h3>
              <p className="text-xs text-slate-400">Formal company registration with statutory incorporation documents.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Legal Entity / Business Name *</label>
              <input
                type="text"
                required
                value={tealForm.legalBusinessName}
                onChange={(e) => setTealForm({ ...tealForm, legalBusinessName: e.target.value })}
                placeholder="e.g. BharatFin Solutions Private Limited"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Registration Type *</label>
                <select
                  value={tealForm.registrationType}
                  onChange={(e) => setTealForm({ ...tealForm, registrationType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                  <option value="Limited Liability Partnership">LLP</option>
                  <option value="One Person Company">OPC</option>
                  <option value="Registered Partnership">Registered Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship (GSTIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">CIN / LLPIN / GSTIN *</label>
                <input
                  type="text"
                  required
                  value={tealForm.registrationNumber}
                  onChange={(e) => setTealForm({ ...tealForm, registrationNumber: e.target.value })}
                  placeholder="U72200KA2024PTC123456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Statutory Jurisdiction *</label>
              <input
                type="text"
                required
                value={tealForm.jurisdiction}
                onChange={(e) => setTealForm({ ...tealForm, jurisdiction: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Company Website</label>
              <input
                type="url"
                value={tealForm.website}
                onChange={(e) => setTealForm({ ...tealForm, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Statutory Incorporation Document (COI / GST Certificate) *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={tealForm.docName}
                  onChange={(e) => setTealForm({ ...tealForm, docName: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                />
                <input
                  type="url"
                  value={tealForm.docUrl}
                  onChange={(e) => setTealForm({ ...tealForm, docUrl: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30"
            >
              Submit Teal Business Verification Application
            </button>
          </div>
        </form>
      )}

      {/* Appeal Modal */}
      {appealAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Appeal Verification Rejection</h3>
              <button onClick={() => setAppealAppId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Provide clarification or additional context regarding your rejected verification submission.
            </p>
            <textarea
              rows={4}
              value={appealNotes}
              onChange={(e) => setAppealNotes(e.target.value)}
              placeholder="Explain why your application meets Balaga verification standards..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setAppealAppId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAppeal}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
