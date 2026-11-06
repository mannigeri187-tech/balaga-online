import React, { useState } from "react";
import { SocialEvent } from "@platform/shared-types";
import { useWorld } from "../../contexts/WorldContext";
import { Button } from "../../components/ui/Button";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  ShieldCheck,
  Check,
  Star,
  X,
  AlertTriangle,
} from "lucide-react";

export const SocialEvents: React.FC = () => {
  const { socialProfile } = useWorld();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedFormat, setSelectedFormat] = useState<"all" | "in_person" | "online">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState<SocialEvent | null>(null);

  // Events State
  const [events, setEvents] = useState<SocialEvent[]>([
    {
      id: "ev-1",
      organizerId: "10000000-0000-0000-0000-000000000002",
      title: "Cubbon Park Weekend Botanical Sketching",
      description: "Join fellow artists for a gentle morning sketching the ancient bamboo groves, bandstand, and colonial stone gazebos in Cubbon Park. All skill levels welcome!",
      category: "Art & Sketching",
      venueName: "Cubbon Park Bandstand (Public Park)",
      city: "Bengaluru",
      isOnline: false,
      startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 3 + 3600000 * 3).toISOString(),
      publicSafetyGuidance: "Public park venue only. Please bring your own water bottle and meet near the bandstand.",
      isAttendeeListVisible: true,
      status: "active",
      rsvpsCount: {
        going: 18,
        interested: 12,
      },
      myRsvp: "going",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ev-2",
      organizerId: "10000000-0000-0000-0000-000000000003",
      title: "Dawn Century Prep: Nandi Hills Weekend Rollout",
      description: "65km group endurance ride starting from Hebbal flyover to the base of Nandi Hills. Pace: 24-27 km/h. Rear lights and helmets mandatory.",
      category: "Cycling & Fitness",
      venueName: "Hebbal Esteem Mall Plaza (Public Meeting Point)",
      city: "Bengaluru",
      isOnline: false,
      startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 5 + 3600000 * 4).toISOString(),
      publicSafetyGuidance: "Helmets and rear lights mandatory. Stay in single file on NH44.",
      isAttendeeListVisible: true,
      status: "active",
      rsvpsCount: {
        going: 12,
        interested: 9,
      },
      myRsvp: "interested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ev-3",
      organizerId: "10000000-0000-0000-0000-000000000001",
      title: "Sunday Silent Reading & Filter Coffee Meetup",
      description: "60 minutes of uninterrupted silent reading with your current paperback or kindle, followed by group introductions and coffee.",
      category: "Books & Literature",
      venueName: "Third Wave Coffee Roasters (Indiranagar 100ft Rd)",
      city: "Bengaluru",
      isOnline: false,
      startTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 7 + 3600000 * 2).toISOString(),
      publicSafetyGuidance: "Public cafe venue. Seating limited to first 15 confirmed attendees.",
      isAttendeeListVisible: true,
      status: "active",
      rsvpsCount: {
        going: 14,
        interested: 7,
      },
      myRsvp: "going",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Create Event Form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Art & Sketching");
  const [newIsOnline, setNewIsOnline] = useState<boolean>(false);
  const [newVenueName, setNewVenueName] = useState("");

  const categories = ["All", "Art & Sketching", "Cycling & Fitness", "Books & Literature", "Cinema & Film", "Music", "Photography"];

  const handleRsvp = (eventId: string, rsvp: "going" | "interested" | "not_going") => {
    setEvents(
      events.map((ev) => {
        if (ev.id !== eventId) return ev;
        const prevRsvp = ev.myRsvp;
        const currentGoing = ev.rsvpsCount?.going || 0;
        const currentInterested = ev.rsvpsCount?.interested || 0;

        let newGoing = currentGoing;
        let newInterested = currentInterested;

        if (prevRsvp === "going") newGoing = Math.max(0, newGoing - 1);
        if (prevRsvp === "interested") newInterested = Math.max(0, newInterested - 1);

        if (rsvp === "going") newGoing += 1;
        if (rsvp === "interested") newInterested += 1;

        return {
          ...ev,
          myRsvp: rsvp,
          rsvpsCount: {
            going: newGoing,
            interested: newInterested,
          },
        };
      })
    );
  };

  const handleCancelEvent = (eventId: string) => {
    setEvents(
      events.map((ev) => (ev.id === eventId ? { ...ev, status: "cancelled" } : ev))
    );
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVenueName.trim()) return;

    const created: SocialEvent = {
      id: `ev-${Date.now()}`,
      organizerId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      isOnline: newIsOnline,
      venueName: newVenueName.trim(),
      city: "Bengaluru",
      startTime: new Date(Date.now() + 86400000 * 4).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 4 + 3600000 * 3).toISOString(),
      publicSafetyGuidance: "Public, verified meeting location. Please follow all platform community guidelines.",
      isAttendeeListVisible: true,
      status: "active",
      rsvpsCount: {
        going: 1,
        interested: 0,
      },
      myRsvp: "going",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents([created, ...events]);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewVenueName("");
  };

  const filteredEvents = events.filter((ev) => {
    if (activeCategory !== "All" && ev.category !== activeCategory) return false;
    if (selectedFormat === "in_person" && ev.isOnline) return false;
    if (selectedFormat === "online" && !ev.isOnline) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-slate-100">Social Events & Meetups</h2>
          </div>
          <p className="text-xs text-slate-400">
            Meet real people at outdoor sketch walks, morning rides, and weekend cafe book discussions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Organize Event
        </Button>
      </div>

      {/* Safety Policy Guidance Alert */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-violet-500/30 flex items-start gap-3 shadow-md">
        <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">
            Safety Guidance: Public Venues & Verified Locations
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All offline meetups are restricted to well-lit public venues (parks, registered cafes, cultural centres). Live personal GPS coordinates are never collected or broadcasted. Never invite strangers to private residences.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Format:
          </span>
          <button
            onClick={() => setSelectedFormat("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              selectedFormat === "all" ? "text-violet-400 bg-violet-500/10 font-bold" : "text-slate-400"
            }`}
          >
            All Formats
          </button>
          <button
            onClick={() => setSelectedFormat("in_person")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              selectedFormat === "in_person" ? "text-violet-400 bg-violet-500/10 font-bold" : "text-slate-400"
            }`}
          >
            In-Person (Public Venues)
          </button>
          <button
            onClick={() => setSelectedFormat("online")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              selectedFormat === "online" ? "text-violet-400 bg-violet-500/10 font-bold" : "text-slate-400"
            }`}
          >
            Online Stream
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((ev) => {
          const isCreator = socialProfile && ev.organizerId === socialProfile.id;
          const eventDate = new Date(ev.startTime);
          const isCancelled = ev.status === "cancelled";

          return (
            <div
              key={ev.id}
              className={`bg-slate-900/50 border rounded-2xl p-5 space-y-4 transition-all shadow-sm ${
                isCancelled
                  ? "border-rose-900/40 opacity-70"
                  : "border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                      {ev.category}
                    </span>
                    {isCancelled && (
                      <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Event Cancelled
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{ev.title}</h3>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-bold text-slate-200">
                    {eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center sm:justify-end gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>

              {/* Public Venue Details */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>{ev.venueName}</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">{ev.city}</p>
              </div>

              {/* Attendance & RSVP Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Users className="w-4 h-4 text-violet-400" />
                  <span className="font-semibold text-slate-200">{ev.rsvpsCount?.going || 0}</span>
                  <span>Going • {ev.rsvpsCount?.interested || 0} Interested</span>
                  <button
                    onClick={() => setAttendeesModalEvent(ev)}
                    className="text-[11px] text-violet-400 hover:underline ml-1"
                  >
                    (View Attendees)
                  </button>
                </div>

                {/* RSVP Controls */}
                {!isCancelled && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={ev.myRsvp === "going" ? "primary" : "secondary"}
                      size="sm"
                      icon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleRsvp(ev.id, "going")}
                    >
                      Going
                    </Button>
                    <Button
                      variant={ev.myRsvp === "interested" ? "outline" : "ghost"}
                      size="sm"
                      icon={<Star className="w-3.5 h-3.5 text-amber-400" />}
                      onClick={() => handleRsvp(ev.id, "interested")}
                    >
                      Interested
                    </Button>

                    {isCreator && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelEvent(ev.id)}
                        className="ml-2"
                      >
                        Cancel Event
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW ATTENDEES MODAL */}
      {attendeesModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Confirmed RSVPs ({attendeesModalEvent.rsvpsCount?.going || 0})
                </h3>
              </div>
              <button
                onClick={() => setAttendeesModalEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Displaying confirmed RSVPs for "{attendeesModalEvent.title}".
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[
                { name: "Priya Rao", username: "priya_art", status: "Going" },
                { name: "Kabir Menon", username: "kabir_rides", status: "Going" },
                { name: "Tanvi Shah", username: "tanvi_reads", status: "Going" },
                { name: "Aarav Social", username: "aarav_social", status: "Going" },
              ].map((att, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-300 font-bold flex items-center justify-center text-xs">
                      {att.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{att.name}</div>
                      <div className="text-[10px] text-slate-500">@{att.username}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-100">Organize Social Event</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lalbagh Sunrise Botanical Watercolor Walk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What will participants do? What should they bring?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    {categories.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Format
                  </label>
                  <select
                    value={newIsOnline ? "online" : "in_person"}
                    onChange={(e) => setNewIsOnline(e.target.value === "online")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="in_person">In-Person (Public Venue)</option>
                    <option value="online">Online Stream</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Public Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  placeholder="e.g. Cubbon Park Bandstand"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newVenueName.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-900/30"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
