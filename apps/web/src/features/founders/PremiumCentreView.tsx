import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  Eye,
  TrendingUp,
  BarChart3,
  Zap,
  ArrowRight,
  MessageSquare,
  FileText,
  Lock,
} from "lucide-react";
import {
  SubscriptionDetails,
  ProfileViewerRecord,
  ProfileAnalyticsData,
  NetworkingInsightsData,
} from "@platform/shared-types";
import { PREMIUM_BENEFITS } from "@platform/config";
import { GoldPremiumCrown } from "../../components/ui/VerificationBadge";
import { PremiumCrown } from "../../components/ui/PremiumCrown";

export const PremiumCentreView: React.FC = () => {
  const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"benefits" | "viewers" | "analytics" | "insights">("benefits");
  const [loading, setLoading] = useState(false);

  // Profile Viewers State
  const [viewers, setViewers] = useState<ProfileViewerRecord[]>([]);
  const [totalViewsCount, setTotalViewsCount] = useState<number>(0);
  const [isViewersBlocked, setIsViewersBlocked] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<ProfileAnalyticsData | null>(null);

  // Insights State
  const [insights, setInsights] = useState<NetworkingInsightsData | null>(null);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/founders/subscriptions/me", {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setSubDetails(data.subscription);
      }
    } catch (err) {
      console.error("Failed to load subscription", err);
    }
  };

  const fetchViewers = async () => {
    try {
      const res = await fetch("/api/founders/network/profile/viewers", {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.status === 403) {
        setIsViewersBlocked(true);
        const d = await res.json();
        setTotalViewsCount(d.totalViewsCount || 0);
      } else if (res.ok) {
        setIsViewersBlocked(false);
        const d = await res.json();
        setViewers(d.viewers || []);
        setTotalViewsCount(d.totalViewsCount || 0);
      }
    } catch (err) {
      console.error("Failed to load viewers", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/founders/network/profile/analytics", {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const d = await res.json();
        setAnalytics(d);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/founders/network/insights", {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const d = await res.json();
        setInsights(d);
      }
    } catch (err) {
      console.error("Failed to load insights", err);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchViewers();
    fetchAnalytics();
    fetchInsights();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/founders/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({ tier: "premium", durationMonths: 12 }),
      });
      if (res.ok) {
        await fetchSubscription();
        await fetchViewers();
        await fetchAnalytics();
        await fetchInsights();
      }
    } catch (err) {
      console.error("Failed to upgrade", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAutoRenew = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/founders/subscriptions/cancel", {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });
      if (res.ok) {
        await fetchSubscription();
      }
    } catch (err) {
      console.error("Failed to cancel renewal", err);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subDetails?.tier === "premium" && subDetails?.status === "active";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Gold Premium Master Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/40 p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
          <GoldPremiumCrown size={160} />
        </div>

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <GoldPremiumCrown size={16} />
            <span>Balaga Professional Membership</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Gold Premium</span>
            <PremiumCrown size="lg" />
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Elevate your professional trajectory with direct messaging privileges, personalized connection notes,
            profile viewer identities, advanced analytics, and the signature Gold Crown badge.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isPremium ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Active Member • Renews {subDetails?.expiresAt ? new Date(subDetails.expiresAt).toLocaleDateString() : "Annual"}</span>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-900/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Upgrade to Gold Premium</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {isPremium && subDetails?.autoRenew && (
              <button
                onClick={handleCancelAutoRenew}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              >
                Cancel Auto-Renew
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("benefits")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "benefits"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>8 Premium Benefits</span>
        </button>
        <button
          onClick={() => setActiveTab("viewers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "viewers"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Profile Viewers ({totalViewsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "analytics"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Advanced Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "insights"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Networking Insights</span>
        </button>
      </div>

      {/* Tab 1: 8 Premium Benefits Matrix */}
      {activeTab === "benefits" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREMIUM_BENEFITS.map((benefit, idx) => (
            <div
              key={benefit.key}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {idx === 0 && <MessageSquare className="w-5 h-5" />}
                    {idx === 1 && <FileText className="w-5 h-5" />}
                    {idx === 2 && <GoldPremiumCrown size={20} />}
                    {idx === 3 && <Eye className="w-5 h-5" />}
                    {idx === 4 && <BarChart3 className="w-5 h-5" />}
                    {idx === 5 && <TrendingUp className="w-5 h-5" />}
                    {idx === 6 && <Sparkles className="w-5 h-5" />}
                    {idx === 7 && <Zap className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-mono text-slate-500">0{idx + 1}</span>
                </div>
                <h4 className="text-sm font-semibold text-white leading-snug">{benefit.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Free: Restricted</span>
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Gold Premium</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Profile Viewer Identities */}
      {activeTab === "viewers" && (
        <div className="space-y-4">
          {isViewersBlocked ? (
            <div className="p-10 text-center rounded-2xl bg-slate-900/60 border border-amber-500/30 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">{totalViewsCount} Founders Viewed Your Profile</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Only Gold Premium members can see the exact identities and timestamps of who viewed their profile.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-900/30"
              >
                Upgrade to Unlock Identities
              </button>
            </div>
          ) : viewers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <Eye className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No profile views logged in the past 30 days.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewers.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                      {v.viewer?.displayName?.charAt(0) || "F"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">{v.viewer?.displayName || "Founder"}</span>
                        {/* If viewer also has gold premium */}
                        <PremiumCrown size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{v.viewer?.headline || "Tech Founder"}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-500">{new Date(v.viewedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Advanced Profile Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Profile Views</span>
              <p className="text-2xl font-bold text-white">{analytics?.totalViews ?? 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Unique Viewers</span>
              <p className="text-2xl font-bold text-amber-400">{analytics?.uniqueViewersCount ?? 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Engagement Actions</span>
              <p className="text-2xl font-bold text-emerald-400">{analytics?.engagementActionsCount ?? 0}</p>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-white">7-Day View Trend</h4>
            <div className="grid grid-cols-7 gap-2 h-32 items-end pt-4">
              {(analytics?.recentViewsTrend || []).map((t) => (
                <div key={t.date} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(15, (t.views + 1) * 25)}%` }}
                  />
                  <span className="text-[10px] text-slate-500">{t.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Networking Insights */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          {!isPremium ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <TrendingUp className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-base font-semibold text-white">Detailed Networking Insights Locked</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Track connection momentum, introduction conversion rates, and ecosystem reach.
              </p>
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                Upgrade to Access
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400">Accepted Connections</span>
                <p className="text-2xl font-bold text-white">{insights?.connectionsCount ?? 0}</p>
                <span className="text-xs text-emerald-400 font-medium">+{insights?.growthRatePercentage ?? 0}% growth this month</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400">Sent Requests</span>
                <p className="text-2xl font-bold text-white">{insights?.pendingRequestsSentCount ?? 0}</p>
                <span className="text-xs text-slate-500">Personalized notes enabled</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400">Opportunity & Collab Activity</span>
                <p className="text-2xl font-bold text-white">
                  {(insights?.opportunitiesInteractionsCount ?? 0) + (insights?.collaborationsCount ?? 0)}
                </p>
                <span className="text-xs text-amber-400 font-medium">High ecosystem presence</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
