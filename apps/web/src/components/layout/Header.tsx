import React, { useState, useRef, useEffect } from "react";
import { WorldSwitcher } from "./WorldSwitcher";
import { useWorld } from "../../contexts/WorldContext";
import { useAuth } from "../../contexts/AuthContext";
import { WORLDS } from "@platform/config";
import { Badge } from "../ui/Badge";
import {
  Search,
  User,
  Settings,
  Bookmark,
  Users,
  Activity,
  HelpCircle,
  LogOut,
  ChevronDown,
  Globe,
  QrCode,
  LogIn,
} from "lucide-react";

interface HeaderProps {
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateTab }) => {
  const { activeWorld, socialProfile, founderProfile } = useWorld();
  const { account } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSocial = activeWorld === WORLDS.SOCIALIZING;

  // Strict World Isolation: Never display founder profile in Socializing realm!
  const currentProfile = isSocial ? socialProfile : founderProfile;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (action: string) => {
    setIsDropdownOpen(false);
    if (onNavigateTab) {
      onNavigateTab(action);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* TOP-LEFT CORNER: Persistent Section Switcher */}
      <div className="flex items-center gap-3">
        <WorldSwitcher />
      </div>

      {/* SEARCH BAR (Desktop & Tablet) */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder={
            isSocial
              ? "Search friends, hobbies, communities..."
              : "Search startups, co-founders, products..."
          }
          className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
        />
      </div>

      {/* TOP-RIGHT CORNER: Navigation Actions, Profile Avatar & Dropdown */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => handleMenuClick("landing")}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition"
          title="View Public Landing Page"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Landing Page</span>
        </button>

        <button
          onClick={() => handleMenuClick("payment")}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition"
          title="Open Zero-Fee UPI Payment Gateway"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>UPI 0% MDR</span>
        </button>

        {account?.subscriptionTier === "premium" && (
          <div className="hidden sm:block">
            <Badge type="premium_member" showLabel={true} />
          </div>
        )}

        {currentProfile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all duration-150 focus:outline-none"
              aria-label="User Profile Menu"
              aria-expanded={isDropdownOpen}
            >
              {/* Profile Avatar with Hover Ring */}
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-700/80 overflow-hidden ring-2 ring-transparent hover:ring-violet-500/50 transition-all shadow-sm">
                {currentProfile.avatarUrl ? (
                  <img
                    src={currentProfile.avatarUrl}
                    alt={currentProfile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentProfile.displayName ? currentProfile.displayName[0] : "B"}</span>
                )}
              </div>

              {/* Display Name & Handle (Desktop) */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentProfile.displayName}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  @{currentProfile.username}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl divide-y divide-slate-800/80">
                {/* User Identity Info Header */}
                <div className="px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-100">{currentProfile.displayName}</p>
                  <p className={`text-[11px] font-mono ${isSocial ? "text-violet-400" : "text-emerald-400"}`}>
                    @{currentProfile.username}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSocial ? "bg-violet-400" : "bg-emerald-400"}`} />
                    <span>{isSocial ? "Socializing Realm" : "Founders Realm"}</span>
                  </div>
                </div>

                {/* Primary Profile Actions */}
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => handleMenuClick("profile")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                  >
                    <User className={`w-4 h-4 ${isSocial ? "text-violet-400" : "text-emerald-400"}`} />
                    <span>View My Profile</span>
                  </button>
                  {isSocial ? (
                    <>
                      <button
                        onClick={() => handleMenuClick("saved")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Posts</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick("communities")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                      >
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>My Communities</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMenuClick("dashboard")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                      >
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>Founder Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick("hiring")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                      >
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>Twenty CRM Kanban</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Platform Navigation & Gateways */}
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => handleMenuClick("landing")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Public Landing Page</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick("payment")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-teal-400" />
                    <span>Zero-Fee UPI Gateway</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick("login")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-violet-400" />
                    <span>Switch Profile / Login</span>
                  </button>
                </div>

                {/* Account Settings & Support */}
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => handleMenuClick("profile")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Privacy</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick(isSocial ? "feed" : "dashboard")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Help & Support</span>
                  </button>
                </div>

                {/* Logout Button */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      window.location.reload();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-amber-400">Profile Incomplete</div>
        )}
      </div>
    </header>
  );
};
