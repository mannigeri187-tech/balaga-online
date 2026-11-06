import React, { useState } from "react";
import { PeopleDiscoveryProfile, SocialConnection } from "@platform/shared-types";
import { Button } from "../../components/ui/Button";
import {
  Search,
  UserPlus,
  Check,
  UserCheck,
  MapPin,
  Sparkles,
  Clock,
  Filter,
} from "lucide-react";

export const PeopleDiscovery: React.FC = () => {
  const [subTab, setSubTab] = useState<"discover" | "connections">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");

  // Mock initial discovery candidates
  const [people, setPeople] = useState<PeopleDiscoveryProfile[]>([
    {
      id: "10000000-0000-0000-0000-000000000003",
      accountId: "00000000-0000-0000-0000-000000000003",
      username: "kabir_rides",
      displayName: "Kabir Menon",
      pronouns: "he/him",
      bio: "Endurance cyclist, indie cinema obsessive, and specialty pour-over experimenter.",
      interests: ["Cycling", "Indie Cinema", "Coffee", "Photography", "Fitness"],
      hobbies: ["Biking", "Brewing"],
      languages: ["English", "Malayalam", "Hindi"],
      broadLocation: "Bengaluru, Karnataka",
      city: "Bengaluru",
      state: "Karnataka",
      allowDmsFrom: "everyone",
      showActivityStatus: true,
      isPrivate: false,
      connectionStatus: "pending_received",
      isFollowing: false,
      sharedInterests: ["Photography", "Coffee", "Indie Cinema"],
      sharedHobbies: ["Biking"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "10000000-0000-0000-0000-000000000004",
      accountId: "00000000-0000-0000-0000-000000000004",
      username: "tanvi_reads",
      displayName: "Tanvi Shah",
      pronouns: "she/her",
      bio: "Contemporary literature lover, analog 35mm film shooter, and weekend cafe hopper.",
      interests: ["Books", "Photography", "Indie Cinema", "Architecture"],
      hobbies: ["Reading", "Film Photography"],
      languages: ["English", "Gujarati", "Hindi"],
      broadLocation: "Mumbai, Maharashtra",
      city: "Mumbai",
      state: "Maharashtra",
      allowDmsFrom: "everyone",
      showActivityStatus: true,
      isPrivate: false,
      connectionStatus: "none",
      isFollowing: false,
      sharedInterests: ["Photography", "Indie Cinema"],
      sharedHobbies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "10000000-0000-0000-0000-000000000005",
      accountId: "00000000-0000-0000-0000-000000000005",
      username: "rohan_acoustic",
      displayName: "Rohan Das",
      pronouns: "he/him",
      bio: "Acoustic fingerstyle guitarist, specialty vinyl record collector, and espresso enthusiast.",
      interests: ["Acoustic Music", "Indie Cinema", "Vinyl", "Coffee"],
      hobbies: ["Guitar", "Cooking"],
      languages: ["English", "Marathi", "Hindi"],
      broadLocation: "Pune, Maharashtra",
      city: "Pune",
      state: "Maharashtra",
      allowDmsFrom: "everyone",
      showActivityStatus: true,
      isPrivate: false,
      connectionStatus: "none",
      isFollowing: false,
      sharedInterests: ["Coffee", "Indie Cinema"],
      sharedHobbies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Initial accepted connections
  const [connections, setConnections] = useState<SocialConnection[]>([
    {
      id: "conn-1",
      requesterId: "10000000-0000-0000-0000-000000000001",
      recipientId: "10000000-0000-0000-0000-000000000002",
      recipient: {
        id: "10000000-0000-0000-0000-000000000002",
        accountId: "00000000-0000-0000-0000-000000000002",
        username: "priya_art",
        displayName: "Priya Rao",
        pronouns: "she/her",
        bio: "Watercolor artist & botanical sketcher in Cubbon Park.",
        interests: ["Watercolor", "Architecture", "Coffee", "Books", "Photography"],
        hobbies: ["Sketching", "Gardening"],
        languages: ["English", "Kannada", "Telugu"],
        broadLocation: "Bengaluru, Karnataka",
        city: "Bengaluru",
        state: "Karnataka",
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      status: "accepted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Handle Connect click
  const handleConnect = (profileId: string) => {
    setPeople(
      people.map((p) =>
        p.id === profileId ? { ...p, connectionStatus: "pending_sent" } : p
      )
    );
  };

  // Handle Follow / Unfollow toggle
  const handleToggleFollow = (profileId: string) => {
    setPeople(
      people.map((p) =>
        p.id === profileId ? { ...p, isFollowing: !p.isFollowing } : p
      )
    );
  };

  // Handle Accept connection request
  const handleAcceptRequest = (profileId: string) => {
    const acceptedUser = people.find((p) => p.id === profileId);
    if (!acceptedUser) return;

    setPeople(
      people.map((p) =>
        p.id === profileId ? { ...p, connectionStatus: "connected" } : p
      )
    );

    const newConnection: SocialConnection = {
      id: `conn-${Date.now()}`,
      requesterId: profileId,
      recipientId: "10000000-0000-0000-0000-000000000001",
      recipient: acceptedUser,
      status: "accepted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConnections([...connections, newConnection]);
  };

  // Handle Decline connection request
  const handleDeclineRequest = (profileId: string) => {
    setPeople(
      people.map((p) =>
        p.id === profileId ? { ...p, connectionStatus: "none" } : p
      )
    );
  };

  // Filter candidates
  const filteredPeople = people.filter((p) => {
    if (selectedInterest !== "All" && !p.interests.includes(selectedInterest)) return false;
    if (selectedCity !== "All" && p.city !== selectedCity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = p.displayName.toLowerCase().includes(q) || p.username.toLowerCase().includes(q);
      const matchesBio = p.bio?.toLowerCase().includes(q);
      const matchesInterest = p.interests.some((i) => i.toLowerCase().includes(q));
      if (!matchesName && !matchesBio && !matchesInterest) return false;
    }
    return true;
  });

  const incomingRequests = people.filter((p) => p.connectionStatus === "pending_received");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-slate-100">Beyond Followers</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Synergy Matchmaker
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Discover people based on shared crafts, sports, and creative styles—not follower counts or popularity algorithms.
          </p>
          <div className="pt-0.5 text-[10px] text-slate-500 font-medium">
            ✨ 0% Vanity Metrics • 100% Mutual Interest Matching
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setSubTab("discover")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "discover"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Discover People
          </button>
          <button
            onClick={() => setSubTab("connections")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              subTab === "connections"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Connections</span>
            {incomingRequests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] flex items-center justify-center font-bold text-white">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {subTab === "discover" ? (
        <div className="space-y-6">
          {/* Incoming Requests Banner */}
          {incomingRequests.length > 0 && (
            <div className="bg-gradient-to-r from-violet-950/60 to-slate-900 border border-violet-500/30 rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                  <UserPlus className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">
                    {incomingRequests.length} Pending Connection Request
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {incomingRequests[0].displayName} wants to connect with you.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubTab("connections")}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Review Requests
              </button>
            </div>
          )}

          {/* Search & Filter Controls */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, hobby, passion, or bio..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="All">All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>

            {/* Interest Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">
                Interest:
              </span>
              {[
                "All",
                "Cycling",
                "Photography",
                "Books",
                "Coffee",
                "Indie Cinema",
                "Architecture",
                "Acoustic Music",
              ].map((interest) => (
                <button
                  key={interest}
                  onClick={() => setSelectedInterest(interest)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedInterest === interest
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* People Discovery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPeople.map((person) => {
              const synergy = Math.min(98, 65 + (person.sharedInterests.length * 10) + (person.sharedHobbies.length * 5));

              return (
              <div
                key={person.id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3.5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                        {person.displayName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-100">{person.displayName}</h4>
                          {person.pronouns && (
                            <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded font-medium">
                              {person.pronouns}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">@{person.username}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{person.broadLocation}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm shrink-0">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{synergy}% Synergy</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{person.bio}</p>

                  {/* Shared Interests Highlights */}
                  {person.sharedInterests.length > 0 && (
                    <div className="mt-3 p-2 rounded-xl bg-violet-950/30 border border-violet-500/20 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-violet-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Shared Interests with you</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {person.sharedInterests.map((interest) => (
                          <span
                            key={interest}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-violet-600/30 text-violet-300 font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Interests */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {person.interests.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                  {person.connectionStatus === "connected" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled
                      icon={<UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      className="flex-1"
                    >
                      Connected
                    </Button>
                  ) : person.connectionStatus === "pending_sent" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled
                      icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
                      className="flex-1"
                    >
                      Request Sent
                    </Button>
                  ) : person.connectionStatus === "pending_received" ? (
                    <div className="flex-1 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptRequest(person.id)}
                        className="flex-1"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeclineRequest(person.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="connection"
                      size="sm"
                      icon={<UserPlus className="w-3.5 h-3.5" />}
                      onClick={() => handleConnect(person.id)}
                      className="flex-1"
                    >
                      Connect
                    </Button>
                  )}

                  <Button
                    variant={person.isFollowing ? "following" : "follow"}
                    size="sm"
                    onClick={() => handleToggleFollow(person.id)}
                  >
                    {person.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        /* Connections & Pending Requests Tab */
        <div className="space-y-6">
          {/* Pending Requests Section */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Connection Requests ({incomingRequests.length})</span>
            </h3>

            {incomingRequests.length > 0 ? (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center font-bold text-violet-300">
                        {req.displayName[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-200">{req.displayName}</h4>
                        <span className="text-[11px] text-slate-400">@{req.username} • {req.broadLocation}</span>
                        <p className="text-[11px] text-slate-300 mt-0.5">{req.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Check className="w-3.5 h-3.5" />}
                        onClick={() => handleAcceptRequest(req.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeclineRequest(req.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No pending connection requests right now.</p>
            )}
          </section>

          {/* Active Connections List */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Active Friends & Connections ({connections.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connections.map((c) => {
                const partner = c.recipient;
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300">
                        {partner?.displayName?.[0] || "U"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-200">
                          {partner?.displayName}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          @{partner?.username} • {partner?.city}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30">
                      Connected
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
