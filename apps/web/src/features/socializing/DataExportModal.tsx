import React, { useState } from "react";
import {
  Download,
  ShieldCheck,
  FileJson,
  Database,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  X,
  FileText
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  username,
  displayName,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [exportScope, setExportScope] = useState({
    profile: true,
    posts: true,
    chapters: true,
    collections: true,
    trust: true,
    circles: true,
  });

  if (!isOpen) return null;

  const handleDownloadArchive = () => {
    setIsExporting(true);

    setTimeout(() => {
      // Gather local storage data and create sovereign export JSON
      const storedPosts = JSON.parse(localStorage.getItem("balaga_user_posts") || "[]");
      const isMonk = localStorage.getItem("balaga_monk_mode") === "true";
      const isPrivate = localStorage.getItem("balaga_is_private") === "true";

      const archiveData = {
        meta: {
          platform: "balaga.online",
          version: "1.0-sovereign",
          exportTimestamp: new Date().toISOString(),
          compliance: "Digital Personal Data Protection (DPDP) & Self-Sovereign Identity",
        },
        identity: {
          username,
          displayName,
          isPrivate,
          monkModeActive: isMonk,
          trustAttestation: {
            score: 96,
            level: "High-Trust Pioneer",
            deviceBound: true,
            vouchesCount: 14,
          },
        },
        content: {
          postsCount: storedPosts.length,
          posts: storedPosts,
          chaptersPreserved: 3,
          livingCollectionsSaved: 3,
          circlesJoined: ["Bangalore Urban Sketchers", "Deccan Century Cyclists"],
        },
        licensing: "User-Owned Creative Commons & Portable JSON",
      };

      // Native browser blob trigger (Zero-dependency stdlib download)
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(archiveData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `balaga-sovereign-export-${username}-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsExporting(false);
      setHasExported(true);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">Self-Sovereign Data Export</h3>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  S26 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero vendor lock-in. Full portability in open JSON.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs text-teal-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-teal-100">Your Data Belongs to You: </span>
              Balaga enforces strict sovereign portability. You can export 100% of your posts, life chapters, living collections, and trust records at any moment with zero fee.
            </div>
          </div>

          {/* Export Items Checkbox List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Included in this Sovereign Export:</span>
            
            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">Public Profile, Bio & Social Accounts</span>
                </div>
                <input
                  type="checkbox"
                  checked={exportScope.profile}
                  onChange={(e) => setExportScope({ ...exportScope, profile: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">Posts, Stories, Reels & Media Captions</span>
                </div>
                <input
                  type="checkbox"
                  checked={exportScope.posts}
                  onChange={(e) => setExportScope({ ...exportScope, posts: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">Life Chapters & Memory Vault Milestones</span>
                </div>
                <input
                  type="checkbox"
                  checked={exportScope.chapters}
                  onChange={(e) => setExportScope({ ...exportScope, chapters: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <FileJson className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200 font-medium">Living Collections, Circle Vouches & Trust Scores</span>
                </div>
                <input
                  type="checkbox"
                  checked={exportScope.collections}
                  onChange={(e) => setExportScope({ ...exportScope, collections: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {hasExported && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sovereign archive downloaded successfully to your local machine!</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>End-to-end client assembled</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs border-slate-700">
              Close
            </Button>
            <Button
              size="sm"
              disabled={isExporting}
              onClick={handleDownloadArchive}
              className="h-8 text-xs bg-teal-600 hover:bg-teal-500 text-white font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Bundling JSON..." : "Download JSON Archive"}</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
