import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Settings,
  X,
  ExternalLink,
  Shield,
  MessageSquare,
  Users,
  Briefcase,
  Rocket,
  Handshake,
  TrendingUp,
  Award,
  DollarSign,
  Layers,
  Lock,
  Loader2,
  Check,
} from "lucide-react";
import {
  FoundersNotification,
  FoundersNotificationPreferences,
} from "@platform/shared-types";
import {
  FoundersNotificationCategory,
} from "@platform/config";

const NOTIF_CATEGORIES: { label: string; value: FoundersNotificationCategory | "all" }[] = [
  { label: "All Alerts", value: "all" },
  { label: "Messages", value: "messages" },
  { label: "Connections", value: "connections" },
  { label: "Cofounder", value: "cofounder_requests" },
  { label: "Opportunities", value: "opportunities" },
  { label: "Hiring", value: "hiring" },
  { label: "Startup Hub", value: "startup_hub" },
  { label: "Launchpad", value: "product_launchpad" },
  { label: "Collaborations", value: "collaborations" },
  { label: "Referrals", value: "referrals" },
  { label: "Mentorship", value: "mentorship" },
  { label: "Investors", value: "investors" },
  { label: "Build Spaces", value: "build_spaces" },
  { label: "Verification", value: "verification" },
  { label: "Security", value: "account_security" },
];

export const FoundersNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<FoundersNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FoundersNotificationCategory | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Preferences modal
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [preferences, setPreferences] = useState<FoundersNotificationPreferences | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (unreadOnly) params.set("unreadOnly", "true");

      const res = await fetch(`/api/founders/notifications?${params.toString()}`, {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/founders/notifications/preferences", {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedCategory, unreadOnly]);

  useEffect(() => {
    fetchPreferences();
  }, []);

  // Mark single read / unread
  const handleToggleRead = async (id: string, currentlyRead: boolean) => {
    try {
      const endpoint = currentlyRead ? "unread" : "read";
      const res = await fetch(`/api/founders/notifications/${id}/${endpoint}`, {
        method: "PATCH",
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: !currentlyRead } : n))
        );
      }
    } catch (err) {
      console.error("Error toggling read:", err);
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/founders/notifications/read-all", {
        method: "POST",
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  // Clear all
  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/founders/notifications/clear-all", {
        method: "DELETE",
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  // Delete single
  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/founders/notifications/${id}`, {
        method: "DELETE",
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Save Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    try {
      setIsSavingPrefs(true);
      const res = await fetch("/api/founders/notifications/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        setShowPrefsModal(false);
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Category Icon helper
  const getCategoryIcon = (category: FoundersNotificationCategory) => {
    switch (category) {
      case "messages":
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case "connections":
        return <Users className="w-4 h-4 text-blue-400" />;
      case "cofounder_requests":
        return <Users className="w-4 h-4 text-purple-400" />;
      case "opportunities":
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case "hiring":
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case "startup_hub":
        return <Rocket className="w-4 h-4 text-indigo-400" />;
      case "product_launchpad":
        return <Award className="w-4 h-4 text-orange-400" />;
      case "collaborations":
        return <Handshake className="w-4 h-4 text-cyan-400" />;
      case "referrals":
        return <TrendingUp className="w-4 h-4 text-violet-400" />;
      case "mentorship":
        return <Award className="w-4 h-4 text-rose-400" />;
      case "investors":
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      case "build_spaces":
        return <Layers className="w-4 h-4 text-teal-400" />;
      case "verification":
        return <Shield className="w-4 h-4 text-blue-400" />;
      case "account_security":
        return <Lock className="w-4 h-4 text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Founders Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verified professional updates, requests, and milestone alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark All Read
          </button>
          <button
            onClick={() => setShowPrefsModal(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Notification Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Clear All Notifications"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {NOTIF_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            Unread only
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No notifications found.</p>
            <p className="text-slate-500 text-[11px]">
              New connections, messages, investor intros, and build space updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                n.isRead
                  ? "bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/40"
                  : "bg-slate-900/90 border-slate-700 shadow-sm hover:bg-slate-900"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getCategoryIcon(n.category)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-white">{n.title}</h3>
                    <span className="text-[9px] px-1.5 py-0.2 rounded border bg-slate-800 text-slate-400 font-medium uppercase">
                      {n.category.replace("_", " ")}
                    </span>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed break-words">{n.description}</p>
                  <div className="flex items-center gap-3 pt-0.5 text-[10px] text-slate-500">
                    <span>
                      {new Date(n.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {n.navigationTarget && (
                      <a
                        href={n.navigationTarget}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggleRead(n.id, n.isRead)}
                  title={n.isRead ? "Mark unread" : "Mark read"}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <Check className={`w-3.5 h-3.5 ${n.isRead ? "text-slate-600" : "text-emerald-400"}`} />
                </button>
                <button
                  onClick={() => handleDeleteNotification(n.id)}
                  title="Delete"
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preferences Modal */}
      {showPrefsModal && preferences && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" /> Notification Preferences
              </h3>
              <button
                onClick={() => setShowPrefsModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 divide-y divide-slate-800/40">
                {/* Global channels */}
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Alert Channels
                  </h4>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>In-App Banner & Popup Alerts</span>
                    <input
                      type="checkbox"
                      checked={preferences.inAppAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, inAppAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Email Digest & Urgent Alerts</span>
                    <input
                      type="checkbox"
                      checked={preferences.emailAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, emailAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                </div>

                {/* Categories */}
                <div className="pt-3 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Category Subscriptions
                  </h4>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Direct & Group Messages</span>
                    <input
                      type="checkbox"
                      checked={preferences.messageAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, messageAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Connection Requests & Approvals</span>
                    <input
                      type="checkbox"
                      checked={preferences.connectionAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, connectionAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Opportunities & Applications</span>
                    <input
                      type="checkbox"
                      checked={preferences.opportunityAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, opportunityAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Hiring Centre & Job Candidacies</span>
                    <input
                      type="checkbox"
                      checked={preferences.hiringAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, hiringAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Startup Hub Updates & Inquiries</span>
                    <input
                      type="checkbox"
                      checked={preferences.startupAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, startupAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Startup Collaborations</span>
                    <input
                      type="checkbox"
                      checked={preferences.collaborationAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, collaborationAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Referrals & Commission Agreements</span>
                    <input
                      type="checkbox"
                      checked={preferences.referralAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, referralAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Mentorship Requests & Sessions</span>
                    <input
                      type="checkbox"
                      checked={preferences.mentorshipAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, mentorshipAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Investor Intros & Meetings</span>
                    <input
                      type="checkbox"
                      checked={preferences.investorAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, investorAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300">
                    <span>Build Spaces Tasks & Milestones</span>
                    <input
                      type="checkbox"
                      checked={preferences.workspaceAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, workspaceAlerts: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPrefsModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPrefs}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
                >
                  {isSavingPrefs ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
