import React, { useState, useEffect } from "react";
import {
  Search,
  Zap,
  Globe,
  Briefcase,
  Users,
  Code,
  TrendingUp,
  Bot,
  Building2,
  Headphones,
  Compass,
  ArrowRight,
  X,
  Sparkles
} from "lucide-react";
import { useWorld } from "../contexts/WorldContext";
import { WORLDS } from "@platform/config";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  realm: "founders" | "socializing" | "global";
  icon: any;
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const { activeWorld, switchWorld } = useWorld();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    // World Switchers
    {
      id: "switch-founders",
      title: "Switch to Founders Realm",
      subtitle: "B2B, Co-founders, Funding Decks & Hiring",
      realm: "global",
      icon: Briefcase,
      action: () => {
        switchWorld(WORLDS.FOUNDERS);
        onNavigateTab("dashboard");
        onClose();
      }
    },
    {
      id: "switch-social",
      title: "Switch to Socializing Realm",
      subtitle: "Circles, Stories, Photography, Radar & Friends",
      realm: "global",
      icon: Users,
      action: () => {
        switchWorld(WORLDS.SOCIALIZING);
        onNavigateTab("feed");
        onClose();
      }
    },
    {
      id: "ai-control-centre",
      title: "Balaga Intelligence Control Centre",
      subtitle: "Privacy controls, AI consent, token audit logs & assistant playground",
      realm: "global",
      icon: Sparkles,
      action: () => {
        onNavigateTab("ai");
        onClose();
      }
    },
    // Founders Innovations
    {
      id: "f-squads",
      title: "Hackathon Squad Matchmaker",
      subtitle: "Role-locked team cards [Backend, AI, Design, Pitch]",
      realm: "founders",
      icon: Zap,
      action: () => {
        switchWorld(WORLDS.FOUNDERS);
        onNavigateTab("dashboard");
        onClose();
      }
    },
    {
      id: "f-speed-mentorship",
      title: "2-Minute Speed Mentorship Sparks",
      subtitle: "120s rapid video/audio chats with VC & unicorn mentors",
      realm: "founders",
      icon: Zap,
      action: () => {
        switchWorld(WORLDS.FOUNDERS);
        onNavigateTab("dashboard");
        onClose();
      }
    },
    {
      id: "f-subdomains",
      title: "Custom Startup Subdomains (*.balaga.online)",
      subtitle: "Zero-touch edge routing and automated SSL certificates",
      realm: "founders",
      icon: Globe,
      action: () => {
        switchWorld(WORLDS.FOUNDERS);
        onNavigateTab("dashboard");
        onClose();
      }
    },
    {
      id: "f-pulse",
      title: "Honest Domain Pulse",
      subtitle: "Verified-work-email engineering culture forums (@zerodha.com)",
      realm: "founders",
      icon: Building2,
      action: () => {
        switchWorld(WORLDS.FOUNDERS);
        onNavigateTab("dashboard");
        onClose();
      }
    },
    {
      id: "f-buildspaces",
      title: "Build Spaces & Sprints",
      subtitle: "Kanban boards, project docs, and GitHub code hooks",
      realm: "founders",
      icon: Code,
      action: () => {
        switchWorld(WORLDS.FOUNDERS);
        onNavigateTab("build-spaces");
        onClose();
      }
    },
    // Socializing Innovations
    {
      id: "s-thirdspace",
      title: "Ambient Third Space (Co-Working Lounges)",
      subtitle: "Monsoon rain soundscapes & walkie-talkie sparks",
      realm: "socializing",
      icon: Headphones,
      action: () => {
        switchWorld(WORLDS.SOCIALIZING);
        onNavigateTab("communities");
        onClose();
      }
    },
    {
      id: "s-microapps",
      title: "Living Micro-Apps Container",
      subtitle: "Interactive Akshara canvas, Tapri Chai calculator & synth",
      realm: "socializing",
      icon: Code,
      action: () => {
        switchWorld(WORLDS.SOCIALIZING);
        onNavigateTab("feed");
        onClose();
      }
    },
    {
      id: "s-predictions",
      title: "Decisional Prediction Stakes",
      subtitle: "Karma-only civic & community forecast markets",
      realm: "socializing",
      icon: TrendingUp,
      action: () => {
        switchWorld(WORLDS.SOCIALIZING);
        onNavigateTab("feed");
        onClose();
      }
    },
    {
      id: "s-twin",
      title: "Autonomous Social Twin",
      subtitle: "Privacy-preserving encrypted vector introductions",
      realm: "socializing",
      icon: Bot,
      action: () => {
        switchWorld(WORLDS.SOCIALIZING);
        onNavigateTab("feed");
        onClose();
      }
    },
    {
      id: "s-campushub",
      title: "Campus Network & Society Hub",
      subtitle: "Club archives, senior mock interviews & dynamic QR passes",
      realm: "socializing",
      icon: Compass,
      action: () => {
        switchWorld(WORLDS.SOCIALIZING);
        onNavigateTab("communities");
        onClose();
      }
    }
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to feature... (e.g. Subdomain, Audio, Twin)"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
            <span>ESC to close</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands or features found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition ${
                    isSelected
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border shrink-0 ${
                        cmd.realm === "founders"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : cmd.realm === "socializing"
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                          : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white truncate">
                          {cmd.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-semibold ${
                            cmd.realm === "founders"
                              ? "bg-emerald-950 text-emerald-300"
                              : cmd.realm === "socializing"
                              ? "bg-violet-950 text-violet-300"
                              : "bg-cyan-950 text-cyan-300"
                          }`}
                        >
                          {cmd.realm}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 text-slate-500 shrink-0 ${
                      isSelected ? "opacity-100 text-cyan-400" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Active World: {activeWorld.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
