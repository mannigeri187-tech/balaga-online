import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import {
  X,
  ShieldAlert,
  Navigation,
  Clock,
  Battery,
  AlertTriangle,
  Home,
  CheckCircle2,
} from "lucide-react";

interface GuardianSafeJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuardianSafeJourneyModal: React.FC<GuardianSafeJourneyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [journeyState, setJourneyState] = useState<"idle" | "active" | "arrived">("idle");
  const [destination, setDestination] = useState("Koramangala 4th Block");
  const [travelMode, setTravelMode] = useState<"cab" | "auto" | "metro" | "bike">("auto");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedGuardians, setSelectedGuardians] = useState<string[]>([
    "priya_art",
    "kabir_rides",
  ]);

  // Active journey timer
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);

  const guardians = [
    {
      username: "priya_art",
      name: "Priya Rao",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      phone: "+91 98450 11223",
    },
    {
      username: "kabir_rides",
      name: "Kabir Mehta",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      phone: "+91 99801 33445",
    },
    {
      username: "ananya_film",
      name: "Ananya Iyer",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
      phone: "+91 97312 55667",
    },
  ];

  useEffect(() => {
    let timer: any = null;
    if (journeyState === "active" && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [journeyState, remainingSeconds]);

  if (!isOpen) return null;

  const startJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    setRemainingSeconds(durationMinutes * 60);
    setJourneyState("active");
  };

  const markArrived = () => {
    setJourneyState("arrived");
  };

  const triggerSOS = () => {
    const alertMsg = `🚨 EMERGENCY ALERT from Aarav on Balaga Guardian Beacon!\nLocation: Heading to ${destination}.\nETA expired or assistance needed. Please call or check immediately!`;
    navigator.clipboard?.writeText(alertMsg);
    alert(
      "EMERGENCY DISTRESS BEACON ACTIVATED!\n\nAlert copied to clipboard and high-priority push notification dispatched to your selected guardians (Priya Rao, Kabir Mehta)."
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Guardian Safe-Journey
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded">
                  PEER SAFETY
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Safe transit check-in with trusted friends
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
        <div className="p-6 space-y-5">
          {journeyState === "idle" && (
            <form onSubmit={startJourney} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <Navigation className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koramangala 4th Block, Home, Indiranagar Metro"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Travel Mode
                  </label>
                  <select
                    value={travelMode}
                    onChange={(e: any) => setTravelMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="auto">🛺 Auto-Rickshaw</option>
                    <option value="cab">🚕 Cab / Uber / Ola</option>
                    <option value="metro">🚇 Namma Metro</option>
                    <option value="bike">🛵 Two-Wheeler / Rapido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={25}>25 Minutes</option>
                    <option value={35}>35 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Guardians to Notify */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Trusted Guardians ({selectedGuardians.length} selected)
                </label>
                <div className="space-y-1.5">
                  {guardians.map((g) => {
                    const isSelected = selectedGuardians.includes(g.username);
                    return (
                      <div
                        key={g.username}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGuardians(selectedGuardians.filter((u) => u !== g.username));
                          } else {
                            setSelectedGuardians([...selectedGuardians, g.username]);
                          }
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-200"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={g.avatarUrl}
                            alt={g.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-white">{g.name}</p>
                            <p className="text-[10px] text-slate-400">{g.phone}</p>
                          </div>
                        </div>

                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected
                              ? "bg-rose-500 border-rose-400 text-slate-950 font-bold"
                              : "border-slate-700"
                          }`}
                        >
                          {isSelected && "✓"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 shadow-lg shadow-rose-950/40"
                >
                  🚀 Activate Safe-Journey Beacon
                </Button>
              </div>
            </form>
          )}

          {journeyState === "active" && (
            <div className="space-y-5 text-center">
              {/* Pulsing beacon graphic */}
              <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto relative animate-pulse">
                <Navigation className="w-8 h-8 text-rose-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 animate-ping" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                  BEACON BROADCASTING
                </span>
                <h4 className="text-base font-bold text-white mt-2">
                  En Route to {destination}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Guardians notified • Auto-alert if not checked in by countdown
                </p>
              </div>

              {/* Countdown Clock */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-around">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>ETA Remaining</span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-white">
                    {formatTime(remainingSeconds)}
                  </span>
                </div>

                <div className="h-8 w-px bg-slate-800" />

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Device Battery</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-emerald-400">84%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={markArrived}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30"
                >
                  <Home className="w-4 h-4" />
                  <span>Reached Safely 🏡 (Check In)</span>
                </Button>

                <button
                  type="button"
                  onClick={triggerSOS}
                  className="w-full py-2 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-600/50 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>EMERGENCY SOS: Alert Guardians Now</span>
                </button>
              </div>
            </div>
          )}

          {journeyState === "arrived" && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Safely Reached Destination!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  A green arrival confirmation has been sent to your guardians. Beacon deactivated.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setJourneyState("idle");
                  onClose();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-6"
              >
                Done
              </Button>
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
            🔒 Privacy First: Zero tracking after arrival. Data stays between you & guardians.
          </div>
        </div>
      </div>
    </div>
  );
};
