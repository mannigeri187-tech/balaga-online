import React, { useState } from "react";
import {
  Globe,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Layers,
  Heart,
  ExternalLink,
  MapPin,
  Radio,
  X
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface UniversalPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  isBuilder?: boolean;
  upiId?: string;
  activeBeacon?: {
    location: string;
    expiresInMinutes: number;
    activity: string;
  };
}

export const UniversalPortalModal: React.FC<UniversalPortalModalProps> = ({
  isOpen,
  onClose,
  username,
  name,
  avatarUrl,
  bio,
  isBuilder = true,
  upiId = "ananya@oksbi",
  activeBeacon = {
    location: "Roastery Coffee House, Koramangala",
    expiresInMinutes: 48,
    activity: "Reading & System Architecture Review",
  },
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "qr">("card");

  const portalUrl = `https://balaga.online/@${username}/portal`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | Balaga Universal Portal`,
          text: `Explore ${name}'s verified projects, creative showcase, and IRL beacons on Balaga.`,
          url: portalUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header bar */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-slate-200">Universal Balaga Portal</span>
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300">
              S20 LIVE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/20 px-5 pt-2">
          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 text-center transition-colors ${
              activeTab === "card"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            Portal Preview
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 text-center transition-colors ${
              activeTab === "qr"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            IRL Quick Scan (QR)
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {activeTab === "card" ? (
            <div className="space-y-4">
              
              {/* Profile Card Preview */}
              <div className="text-center space-y-2">
                <div className="relative inline-block">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-violet-500/50 shadow-lg"
                  />
                  {isBuilder && (
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-violet-600 border border-violet-400 text-white text-[9px] font-bold tracking-wider">
                      BUILDER
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100">{name}</h3>
                  <p className="text-xs font-mono text-violet-400">@{username}</p>
                </div>

                <p className="text-xs text-slate-400 max-w-xs mx-auto line-clamp-2">
                  {bio}
                </p>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bengaluru, Karnataka • RVCE Alumni</span>
                </div>
              </div>

              {/* Live IRL Radar Beacon Pill */}
              {activeBeacon && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="truncate text-left">
                      <div className="text-[11px] font-semibold text-amber-200">Live Beacon Active</div>
                      <div className="text-[10px] text-slate-400 truncate">{activeBeacon.location}</div>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    {activeBeacon.expiresInMinutes}m left
                  </span>
                </div>
              )}

              {/* Portal Action Buttons */}
              <div className="space-y-2 pt-1">
                
                {/* 1. Verified Builder Card 3D Flip */}
                <a
                  href={`#builder-card-${username}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-800/80 transition-all text-xs font-medium text-slate-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-violet-400 group-hover:rotate-180 transition-transform duration-300" />
                    <span>Flip to 3D Builder Persona</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                </a>

                {/* 2. Direct 1-Tap UPI Shabaash */}
                <a
                  href={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&cu=INR`}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all text-xs font-medium text-slate-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Direct UPI Shabaash ({upiId})</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">0% Fee</span>
                </a>

                {/* 3. Creator Showcase Link */}
                <div className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800/80 transition-all text-xs font-medium text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Creator Portfolio & Visual Art Vault</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>

            </div>
          ) : (
            /* TAB 2: IRL QR SCAN */
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-400">
                Let peers and organizers scan this code offline at meetups to open your Universal Balaga Portal instantly.
              </p>

              {/* Dynamic QR Block */}
              <div className="p-6 bg-white rounded-2xl mx-auto w-fit shadow-xl flex flex-col items-center">
                <QrCode className="w-48 h-48 text-slate-900" />
                <div className="mt-2 text-slate-900 text-[11px] font-mono font-bold tracking-tight">
                  balaga.online/@{username}/portal
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                Direct camera scan opens without needing an app store download.
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copied Link!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Copy Portal URL
              </>
            )}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNativeShare}
            className="flex-1 text-xs bg-violet-600 hover:bg-violet-500 text-white"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share Portal
          </Button>
        </div>

      </div>
    </div>
  );
};
