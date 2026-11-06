import React, { useState, useEffect } from "react";
import {
  Zap,
  Clock,
  Video,
  Mic,
  MicOff,
  VideoOff,
  X,
  PhoneOff,
  FileCheck2,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface MentorSparkSlot {
  id: string;
  mentorName: string;
  mentorRole: string;
  mentorCompany: string;
  avatar: string;
  topic: string;
  isLiveNow: boolean;
}

interface SpeedMentorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockSparks: MentorSparkSlot[] = [
  {
    id: "spk-1",
    mentorName: "Rohan Varma",
    mentorRole: "ex-VP Product",
    mentorCompany: "Swiggy / Series B Angel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    topic: "Early D2C / Marketplaces Unit Economics Teardown",
    isLiveNow: true,
  },
  {
    id: "spk-2",
    mentorName: "Deepa Krishnan",
    mentorRole: "Head of Infrastructure",
    mentorCompany: "Postman (Bengaluru)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    topic: "API Architecture & Zero-Downtime Migration Screen",
    isLiveNow: true,
  },
];

export const SpeedMentorshipModal: React.FC<SpeedMentorshipModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSession, setActiveSession] = useState<MentorSparkSlot | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(120);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Synchronized 120-second countdown timer
  useEffect(() => {
    if (!activeSession || sessionCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, sessionCompleted]);

  if (!isOpen) return null;

  const handleStartSpark = (slot: MentorSparkSlot) => {
    setActiveSession(slot);
    setTimerSeconds(120);
    setSessionCompleted(false);
  };

  const handleEndSpark = () => {
    setSessionCompleted(true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">2-Minute Speed Mentorship Sparks</h2>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
                  F18 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Strictly timed 120s lightning advice. No 1-hour fluff calls.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveSession(null);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {!activeSession ? (
            /* ACTIVE SPARKS LIST */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-yellow-950/20 border border-yellow-500/20 text-xs text-slate-300 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">The 120-Second Rule: </span>
                  Founders get exactly 60 seconds to pitch one tactical blocker, and verified mentors get 60 seconds to deliver high-signal advice. Call auto-terminates at 00:00.
                </div>
              </div>

              <div className="space-y-3">
                {mockSparks.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-yellow-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={slot.avatar}
                          alt={slot.mentorName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500/40"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100">{slot.mentorName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                            Live Office Hours
                          </span>
                        </div>
                        <p className="text-xs text-yellow-400 font-medium">{slot.mentorRole} • <span className="text-slate-400">{slot.mentorCompany}</span></p>
                        <p className="text-[11px] text-slate-400 mt-1">{slot.topic}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleStartSpark(slot)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shrink-0 self-end sm:self-center"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Start 120s Spark
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : sessionCompleted ? (
            /* SESSION ACTION PLAN SUMMARY */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">120-Second Spark Completed!</h3>
                <p className="text-xs text-slate-400 mt-1">High-signal takeaways with {activeSession.mentorName}</p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-2 text-xs">
                <span className="font-semibold text-emerald-400 block">Lightning Takeaways:</span>
                <p className="text-slate-300">• Stop offering free pilots to enterprise leads; charge a nominal commitment fee.</p>
                <p className="text-slate-300">• Decouple ledger writes from analytics database using Redis streams.</p>
                <p className="text-slate-300">• Send follow-up traction snapshot to mentor in 7 days.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSession(null)}
                className="text-xs border-slate-700"
              >
                Back to Mentor Sparks
              </Button>
            </div>
          ) : (
            /* LIVE 120-SECOND CALL SCREEN */
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-yellow-500/40 shadow-2xl flex flex-col justify-between p-4">
                
                {/* Top Status & Hard Timer */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-mono text-slate-200 font-bold uppercase tracking-wider">
                      Live Spark Stream
                    </span>
                  </div>

                  {/* Hard Visual Timer */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-yellow-500/40 shadow-lg">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span className={`text-sm font-mono font-bold ${timerSeconds <= 15 ? "text-rose-400 animate-pulse" : "text-yellow-300"}`}>
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                {/* Mentor Video Feed (Simulated) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={activeSession.avatar}
                    alt={activeSession.mentorName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500/30 shadow-2xl"
                  />
                </div>

                {/* Bottom Controls */}
                <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <div className="text-left text-xs">
                    <span className="font-bold text-slate-100 block">{activeSession.mentorName}</span>
                    <span className="text-[10px] text-yellow-400">{activeSession.mentorRole}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                    >
                      {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                    >
                      {isVideoOff ? <VideoOff className="w-4 h-4 text-rose-400" /> : <Video className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleEndSpark}
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      <PhoneOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-yellow-400" />
            <span>Strict zero-recording confidentiality</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs border-slate-700">
            Close Sparks
          </Button>
        </div>

      </div>
    </div>
  );
};
