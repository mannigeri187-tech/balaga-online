import React from "react";
import { useWorld } from "../../contexts/WorldContext";
import { WORLDS } from "@platform/config";
import {
  Home,
  Film,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Layers,
  Rocket,
  Handshake,
  UserCheck,
  TrendingUp,
  Search,
  User,
  Heart,
  Briefcase,
  Compass,
  Share2,
  DollarSign,
  FolderKanban,
  ShieldCheck,
  Crown,
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { activeWorld } = useWorld();
  const isSocial = activeWorld === WORLDS.SOCIALIZING;

  const socialNavItems = [
    { id: "feed", label: "Home", icon: Home },
    { id: "explore", label: "Search & Explore", icon: Search },
    { id: "reels", label: "Reels", icon: Film },
    { id: "inbox", label: "Messages", icon: MessageSquare, badge: "2" },
    { id: "notifications", label: "Notifications", icon: Heart, badge: "5" },
    { id: "communities", label: "Communities", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "profile", label: "Profile", icon: User },
  ];

  const founderNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Layers },
    { id: "feed", label: "Founder Feed", icon: Home },
    { id: "network", label: "Founder Network", icon: UserCheck },
    { id: "opportunities", label: "Opportunities", icon: Compass },
    { id: "hiring", label: "Hiring Centre", icon: Briefcase },
    { id: "startups", label: "Startup Hub", icon: Rocket },
    { id: "launchpad", label: "Product Launchpad", icon: TrendingUp },
    { id: "collaborations", label: "Collaborations", icon: Handshake, badge: "2" },
    { id: "spaces", label: "Build Spaces", icon: FolderKanban },
    { id: "referrals", label: "Referral Exchange", icon: Share2 },
    { id: "mentors", label: "Mentor Network", icon: Compass },
    { id: "investors", label: "Investor Network", icon: DollarSign },
    { id: "verification", label: "Verification Centre", icon: ShieldCheck },
    { id: "premium", label: "Gold Premium", icon: Crown },
    { id: "inbox", label: "Founders Inbox", icon: MessageSquare, badge: "1" },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "My Profile", icon: User },
  ];

  const navItems = isSocial ? socialNavItems : founderNavItems;

  return (
    <aside className="hidden md:flex w-64 border-r border-slate-800 bg-slate-950 p-4 flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div>
        {/* Brand Header */}
        <div className="mb-5 px-3">
          {isSocial ? (
            <div>
              <span className="font-serif italic text-2xl font-bold tracking-tight text-white block">
                Instagram
              </span>
              <span className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase">
                Socializing Realm
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#0077b5] flex items-center justify-center font-bold text-white text-base font-sans">
                in
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">
                  LinkedIn Feed
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  Founders Realm
                </span>
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? isSocial
                      ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isSocial
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Isolation Status Notice */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Identity Isolation</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Content & notifications are strictly separated from {isSocial ? "Founders" : "Socializing"}.
        </p>
      </div>
    </aside>
  );
};
