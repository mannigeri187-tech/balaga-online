import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  Clock,
  FileText,
  Radio,
} from "lucide-react";

interface RapidHuddleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleName?: string;
}

export const RapidHuddleModal: React.FC<RapidHuddleModalProps> = ({
  isOpen,
  onClose,
  circleName = "Deccan Century Cyclists",
}) => {
  const [topic] = useState("Saturday Dawn Route & Breakfast Check 🚴");
  const [isMuted, setIsMuted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(10 * 60); // 10 minutes hard cap
  const [scratchpad, setScratchpad] = useState(
    "- Rollout: 5:45 AM sharp from Silk Board\n- First stop: Nandi foothills tea stall (38km)\n- Pack extra tube & CO2 cartridge"
  );
  const [isConcluded, setIsConcluded] = useState(false);

  const participants = [
    {
      id: "u-1",
      name: "Aarav Patel (You)",
      username: "aarav_social",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
      isSpeaking: true,
    },
    {
      id: "u-2",
      name: "Kabir Mehta",
      username: "kabir_rides",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      isSpeaking: false,
    },
    {
      id: "u-3",
      name: "Priya Rao",
      username: "priya_art",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      isSpeaking: false,
    },
    {
      id: "u-4",
      name: "Ananya Iyer",
      username: "ananya_film",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
      isSpeaking: false,
    },
  ];

  useEffect(() => {
    let timer: any = null;
    if (isOpen && remainingSeconds > 0 && !isConcluded) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsConcluded(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, remainingSeconds, isConcluded]);

  if (!isOpen) return null;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center relative">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                10-Minute Rapid Huddle
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                  HARD 10:00 CAP
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Spontaneous voice drop-in • Auto-terminates at zero
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isConcluded ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 text-2xl">
                🙌
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  10-Minute Huddle Concluded!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Time's up! Zero meeting bloat. Notes have been recorded to the circle scratchpad.
                </p>
              </div>

              <Button
                size="sm"
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-6"
                onClick={onClose}
              >
                Close Huddle
              </Button>
            </div>
          ) : (
            <>
              {/* Top Timer & Topic Strip */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Topic ({circleName})
                  </span>
                  <p className="text-xs font-bold text-white truncate">{topic}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-300">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span className="text-sm font-mono font-bold">
                    {formatTimer(remainingSeconds)}
                  </span>
                </div>
              </div>

              {/* Participants Grid with Speaking Waveform */}
              <div className="grid grid-cols-4 gap-3 py-2">
                {participants.map((user) => (
                  <div key={user.id} className="flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={`relative w-14 h-14 rounded-full p-0.5 border-2 transition-all ${
                        user.isSpeaking
                          ? "border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105"
                          : "border-slate-800"
                      }`}
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                      {user.isSpeaking && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                          <Volume2 className="w-2.5 h-2.5 text-slate-950" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[70px]">
                      {user.name.split(" ")[0]}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {user.isSpeaking ? "Speaking" : "Listening"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shared Live Scratchpad */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                    Shared Ephemeral Scratchpad
                  </span>
                  <span className="text-[10px] text-slate-500">Syncs live with circle</span>
                </div>
                <textarea
                  rows={3}
                  value={scratchpad}
                  onChange={(e) => setScratchpad(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isMuted
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMuted ? "Muted" : "Mute Mic"}</span>
                </button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsConcluded(true)}
                  className="text-xs"
                >
                  Leave Huddle
                </Button>
              </div>
            </>
          )}

          <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800">
            Balaga Zero-Fatigue Guarantee: Voice calls strictly terminate at 10 minutes.
          </div>
        </div>
      </div>
    </div>
  );
};
