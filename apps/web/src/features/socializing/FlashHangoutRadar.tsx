import React, { useState, useEffect } from "react";
import { useWorld } from "../../contexts/WorldContext";
import { Zap, Clock, MapPin, Users, Plus, X, Coffee, Dumbbell, Palette, Laptop, Check } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface HangoutBeacon {
  id: string;
  creatorName: string;
  creatorAvatar: string;
  creatorUsername: string;
  title: string;
  location: string;
  category: "coffee" | "sports" | "creative" | "code";
  capacity: number;
  joinedUsers: string[];
  expiresAt: number; // Unix timestamp
}

export const FlashHangoutRadar: React.FC = () => {
  const { socialProfile } = useWorld();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Seed Beacons (Real Indian Metro Hotspots)
  const [beacons, setBeacons] = useState<HangoutBeacon[]>([
    {
      id: "b-1",
      creatorName: "Aarav Social",
      creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      creatorUsername: "aarav_social",
      title: "Filter coffee & consumer tech chat ☕",
      location: "Third Wave Coffee, Indiranagar",
      category: "coffee",
      capacity: 4,
      joinedUsers: ["priya_art", "kabir_rides"],
      expiresAt: Date.now() + 52 * 60 * 1000, // 52 mins left
    },
    {
      id: "b-2",
      creatorName: "Kabir M.",
      creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      creatorUsername: "kabir_rides",
      title: "Need 1 player for intermediate badminton 🏸",
      location: "PlayMania, HSR Layout Sector 2",
      category: "sports",
      capacity: 4,
      joinedUsers: ["rahul_tech", "rohan_builds"],
      expiresAt: Date.now() + 74 * 60 * 1000, // 1h 14m left
    },
    {
      id: "b-3",
      creatorName: "Priya R.",
      creatorAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
      creatorUsername: "priya_art",
      title: "Outdoor watercolor sketching & chill 🎨",
      location: "Cubbon Park, Bamboo Grove",
      category: "creative",
      capacity: 6,
      joinedUsers: ["ananya_design"],
      expiresAt: Date.now() + 38 * 60 * 1000, // 38 mins left
    },
  ]);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("Church Street, Bengaluru");
  const [newCategory, setNewCategory] = useState<"coffee" | "sports" | "creative" | "code">("coffee");
  const [newCapacity, setNewCapacity] = useState(4);

  // Live Timer Countdown Tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleJoin = (beaconId: string) => {
    const myUsername = socialProfile?.username || "me";
    setBeacons((prev) =>
      prev.map((b) => {
        if (b.id !== beaconId) return b;
        const alreadyJoined = b.joinedUsers.includes(myUsername);
        if (alreadyJoined) {
          setToastMessage(`You left "${b.title}"`);
          setTimeout(() => setToastMessage(null), 2500);
          return {
            ...b,
            joinedUsers: b.joinedUsers.filter((u) => u !== myUsername),
          };
        } else {
          if (b.joinedUsers.length + 1 >= b.capacity) {
            setToastMessage(`🎉 You claimed the last spot at "${b.location}"! See you there!`);
          } else {
            setToastMessage(`🎉 You're in! Heading to "${b.location}"`);
          }
          setTimeout(() => setToastMessage(null), 3000);
          return {
            ...b,
            joinedUsers: [...b.joinedUsers, myUsername],
          };
        }
      })
    );
  };

  const handleCreateBeacon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBeacon: HangoutBeacon = {
      id: `b-${Date.now()}`,
      creatorName: socialProfile?.displayName || "Aarav Social",
      creatorAvatar: socialProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      creatorUsername: socialProfile?.username || "aarav_social",
      title: newTitle.trim(),
      location: newLocation.trim(),
      category: newCategory,
      capacity: newCapacity,
      joinedUsers: [],
      expiresAt: Date.now() + 120 * 60 * 1000, // Strict 120-min countdown
    };

    setBeacons([newBeacon, ...beacons]);
    setNewTitle("");
    setIsCreateModalOpen(false);
    setToastMessage("⚡ Flash Radar Beacon lit! Active for the next 120 minutes.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "coffee":
        return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
      case "sports":
        return <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />;
      case "creative":
        return <Palette className="w-3.5 h-3.5 text-pink-400" />;
      case "code":
      default:
        return <Laptop className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/60 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Live Pulse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">
                Flash Hangout Radar
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-400">
              120-min real-life beacons active near you in Bengaluru
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Light Beacon</span>
        </button>
      </div>

      {/* Safety Notice & Consent Disclosure */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400">
        <span className="text-amber-400 font-bold shrink-0">🛡️ Safety First:</span>
        <span className="truncate">Public venues only • 120-min auto-destruction • Peer assistance, not a safety guarantee</span>
      </div>

      {/* Horizontal Carousel of Live Beacons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {beacons.map((beacon) => {
          const myUsername = socialProfile?.username || "me";
          const isJoined = beacon.joinedUsers.includes(myUsername);
          const totalJoined = beacon.joinedUsers.length + 1; // +1 for creator
          const isFull = totalJoined >= beacon.capacity;
          const timeLeft = formatTimeLeft(beacon.expiresAt);

          return (
            <div
              key={beacon.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isJoined
                  ? "bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-2">
                {/* Meta row: Category pill + Countdown timer */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-300">
                    {getCategoryIcon(beacon.category)}
                    <span className="capitalize">{beacon.category}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 font-mono text-amber-400 font-bold bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}</span>
                  </span>
                </div>

                {/* Beacon Title */}
                <h4 className="font-bold text-xs text-slate-100 line-clamp-2 leading-tight">
                  {beacon.title}
                </h4>

                {/* Location */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-violet-400 shrink-0" />
                  <span className="truncate">{beacon.location}</span>
                </div>
              </div>

              {/* Bottom Action: Capacity + 1-Tap Join */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Users className="w-3 h-3" />
                  <span className="font-semibold text-slate-200">
                    {totalJoined}/{beacon.capacity} spots
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleJoin(beacon.id)}
                  disabled={isFull && !isJoined}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isJoined
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : isFull
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950/30"
                  }`}
                >
                  {isJoined ? "Joined ✓" : isFull ? "Full" : "I'm In"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE BEACON MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Light a Flash Hangout Beacon</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBeacon} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  What&apos;s the plan? (Short & catchy)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Filter coffee & pitch chat at Church Street"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Third Wave Coffee, Indiranagar"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="coffee">☕ Coffee & Chill</option>
                    <option value="sports">🏸 Sports & Fitness</option>
                    <option value="creative">🎨 Art & Creative</option>
                    <option value="code">💻 Code & Hack</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Max People</label>
                  <select
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value={2}>2 People (1-on-1)</option>
                    <option value={4}>4 People (Double date / Court)</option>
                    <option value={6}>6 People (Small circle)</option>
                    <option value={8}>8 People (Lounge meetup)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-[11px] text-amber-300/90 leading-relaxed">
                ⚡ <strong>120-Minute Guarantee:</strong> This beacon will broadcast to verified members in your area and automatically self-destruct in exactly 2 hours.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newTitle.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Broadcast Beacon (120 min)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
