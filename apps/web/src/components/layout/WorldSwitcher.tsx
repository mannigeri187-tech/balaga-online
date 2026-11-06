import React, { useState, useRef, useEffect } from "react";
import { useWorld } from "../../contexts/WorldContext";
import { WORLDS, WORLD_METADATA, DEFAULT_BRAND_NAME } from "@platform/config";
import { ChevronDown, Compass, Rocket, Check, PlusCircle, X, Sparkles } from "lucide-react";

export const WorldSwitcher: React.FC = () => {
  const { activeWorld, switchWorld, hasSocialProfile, hasFounderProfile } = useWorld();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingWorldCreation, setPendingWorldCreation] = useState<"socializing" | "founders" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentMeta = WORLD_METADATA[activeWorld];
  const isSocial = activeWorld === WORLDS.SOCIALIZING;

  const handleSelectWorld = (targetWorld: "socializing" | "founders") => {
    if (targetWorld === WORLDS.SOCIALIZING && !hasSocialProfile) {
      setPendingWorldCreation(WORLDS.SOCIALIZING);
      setIsOpen(false);
      return;
    }
    if (targetWorld === WORLDS.FOUNDERS && !hasFounderProfile) {
      setPendingWorldCreation(WORLDS.FOUNDERS);
      setIsOpen(false);
      return;
    }
    switchWorld(targetWorld);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* Persistent Button in Top-Left */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
            isSocial
              ? "bg-violet-950/60 border-violet-500/40 text-violet-100 hover:bg-violet-900/50 hover:border-violet-400"
              : "bg-emerald-950/60 border-emerald-500/40 text-emerald-100 hover:bg-emerald-900/50 hover:border-emerald-400"
          } shadow-lg`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              isSocial ? "bg-violet-600 text-white" : "bg-emerald-600 text-white"
            }`}
          >
            {isSocial ? <Compass className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
          </div>
          
          <div className="text-left flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
              {DEFAULT_BRAND_NAME}
            </span>
            <span className="text-sm font-bold flex items-center gap-1.5 leading-tight">
              {currentMeta.name}
            </span>
          </div>

          <ChevronDown
            className={`w-4 h-4 opacity-70 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Switcher Dropdown */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              Switch World Identity
            </div>

            <div className="mt-1 space-y-1">
              {/* World 1: Socializing Option */}
              <button
                onClick={() => handleSelectWorld(WORLDS.SOCIALIZING)}
                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors ${
                  isSocial
                    ? "bg-violet-600/20 border border-violet-500/40 text-white"
                    : "hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    isSocial ? "bg-violet-600 text-white" : "bg-slate-800 text-violet-400"
                  }`}
                >
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-violet-200">
                      {WORLD_METADATA[WORLDS.SOCIALIZING].name}
                    </span>
                    {isSocial && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Friends, communities and interests.
                  </p>
                  {!hasSocialProfile && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium mt-1">
                      <PlusCircle className="w-3 h-3" /> Create Profile to Enter
                    </span>
                  )}
                </div>
              </button>

              {/* World 2: Founders Option */}
              <button
                onClick={() => handleSelectWorld(WORLDS.FOUNDERS)}
                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors ${
                  !isSocial
                    ? "bg-emerald-600/20 border border-emerald-500/40 text-white"
                    : "hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    !isSocial ? "bg-emerald-600 text-white" : "bg-slate-800 text-emerald-400"
                  }`}
                >
                  <Rocket className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-emerald-200">
                      {WORLD_METADATA[WORLDS.FOUNDERS].name}
                    </span>
                    {!isSocial && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Startups, talent, products and collaboration.
                  </p>
                  {!hasFounderProfile && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium mt-1">
                      <PlusCircle className="w-3 h-3" /> Create Profile to Enter
                    </span>
                  )}
                </div>
              </button>
            </div>

            <div className="p-2 border-t border-slate-800 mt-1">
              <p className="text-[11px] text-slate-400 leading-tight">
                🔒 Profiles, feeds, inboxes & notifications remain strictly isolated under your login.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CREATE PROFILE MODAL (When attempting to enter a world without a profile) */}
      {pendingWorldCreation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">
                  Create {pendingWorldCreation === "socializing" ? "Socializing" : "Founders"} Profile
                </h3>
              </div>
              <button
                onClick={() => setPendingWorldCreation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your master login account is ready. To enter the{" "}
              <strong>{pendingWorldCreation === "socializing" ? "Socializing" : "Founders"}</strong> world,
              you must complete its dedicated profile. Content and identities remain strictly independent.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {pendingWorldCreation === "socializing" ? "Social Display Name" : "Professional Name"}
                </label>
                <input
                  type="text"
                  placeholder={pendingWorldCreation === "socializing" ? "e.g. Aarav S." : "e.g. Aarav Sharma"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unique Username (@handle)
                </label>
                <input
                  type="text"
                  placeholder={pendingWorldCreation === "socializing" ? "e.g. aarav_explores" : "e.g. aarav_builder"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {pendingWorldCreation === "socializing" ? "Interests & Hobbies" : "Professional Headline & Skills"}
                </label>
                <input
                  type="text"
                  placeholder={pendingWorldCreation === "socializing" ? "e.g. Photography, Badminton, Travel" : "e.g. Co-founder & CTO | AI, SaaS"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setPendingWorldCreation(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  switchWorld(pendingWorldCreation);
                  setPendingWorldCreation(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg ${
                  pendingWorldCreation === "socializing"
                    ? "bg-violet-600 hover:bg-violet-500 shadow-violet-900/30"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30"
                }`}
              >
                Create Profile & Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
