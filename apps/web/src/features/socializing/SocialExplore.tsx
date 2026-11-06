import React, { useState } from "react";
import {
  Search,
  Grid,
  Film,
  Users,
  Heart,
  MessageCircle,
  X,
  Send,
  Play,
  Flame,
  Camera,
} from "lucide-react";
import {
  SocialPublicProfileModal,
  PublicSocialAccount,
} from "./SocialPublicProfileModal";

export const SocialExplore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"for_you" | "accounts" | "reels" | "posts">("for_you");
  const [selectedUser, setSelectedUser] = useState<PublicSocialAccount | null>(null);
  const [selectedExploreItem, setSelectedExploreItem] = useState<any | null>(null);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    ishowspeed: false,
    priya_art: true,
    kabir_rides: false,
    tanvi_reads: true,
    rohan_acoustic: false,
    ananya_design: false,
  });

  // ACCOUNTS LIST (Instagram format, including ishowspeed)
  const allAccounts: PublicSocialAccount[] = [
    {
      id: "acc-speed",
      username: "ishowspeed",
      displayName: "IShowSpeed",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      isVerified: true,
      category: "Digital creator",
      bio: "Live every single day! Streaming, football, gaming and world tour 🌍⚽️ | Catch the stream on YouTube",
      website: "youtube.com/ishowspeed",
      postsCount: 384,
      followersCount: "14.2M",
      followingCount: 198,
      isFollowing: followingMap["ishowspeed"],
      mutualsText: "Followed by priya_art, aarav_social + 48 others",
      highlights: [
        { id: "h-1", title: "Live", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80" },
        { id: "h-2", title: "India Tour", cover: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=300&q=80" },
        { id: "h-3", title: "CR7 Moments", cover: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&q=80" },
        { id: "h-4", title: "Gaming", cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80" },
      ],
      posts: [
        {
          id: "sp-1",
          mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
          likesCount: 240000,
          commentsCount: 6120,
          caption: "BENGALURU WAS ELECTRIC! Much love to all the supporters who showed up today 🇮🇳❤️",
          type: "image",
          createdAt: "1 day ago",
        },
        {
          id: "sp-2",
          mediaUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
          likesCount: 185000,
          commentsCount: 4210,
          caption: "Practicing free kicks before the evening broadcast. SIUUU! ⚽️⚡️",
          type: "image",
          createdAt: "3 days ago",
        },
        {
          id: "sp-3",
          mediaUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
          likesCount: 342000,
          commentsCount: 9280,
          caption: "Matchday highlights! The energy in the stadium was incredible 🔥",
          type: "video",
          createdAt: "5 days ago",
        },
        {
          id: "sp-4",
          mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
          likesCount: 198000,
          commentsCount: 5120,
          caption: "New music video dropping this weekend. Turn the bass all the way up 🎶",
          type: "image",
          createdAt: "1 week ago",
        },
        {
          id: "sp-5",
          mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
          likesCount: 129000,
          commentsCount: 3100,
          caption: "Late night gaming marathon with chat! 🎮",
          type: "image",
          createdAt: "2 weeks ago",
        },
        {
          id: "sp-6",
          mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
          likesCount: 410000,
          commentsCount: 11400,
          caption: "Thank you for 14 Million subscribers! We are just getting started 🌍🚀",
          type: "image",
          createdAt: "3 weeks ago",
        },
      ],
    },
    {
      id: "acc-priya",
      username: "priya_art",
      displayName: "Priya Rao",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      isVerified: true,
      category: "Visual Artist",
      bio: "Watercolor artist & botanical sketcher. Cubbon park mornings & paper textures 🎨🌿 | Bengaluru",
      website: "priyarao.art",
      postsCount: 124,
      followersCount: "42.8k",
      followingCount: 312,
      isFollowing: followingMap["priya_art"],
      mutualsText: "Followed by aarav_social and kabir_rides",
      highlights: [
        { id: "h-p1", title: "Botanicals", cover: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&q=80" },
        { id: "h-p2", title: "En Plein Air", cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80" },
      ],
      posts: [
        {
          id: "pp-1",
          mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
          likesCount: 3200,
          commentsCount: 94,
          caption: "Cold press watercolor study under the bamboo grove at Cubbon Park 🌿",
          type: "image",
          createdAt: "1 day ago",
        },
      ],
    },
    {
      id: "acc-kabir",
      username: "kabir_rides",
      displayName: "Kabir Mehta",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      isVerified: false,
      category: "Athlete / Cyclist",
      bio: "Brevet endurance cyclist & road cycling enthusiast. Nandi hills dawn ascents 🚴‍♂️☕️",
      website: "strava.com/athletes/kabir",
      postsCount: 92,
      followersCount: "18.4k",
      followingCount: 420,
      isFollowing: followingMap["kabir_rides"],
      mutualsText: "Followed by tanvi_reads and priya_art",
    },
    {
      id: "acc-tanvi",
      username: "tanvi_reads",
      displayName: "Tanvi Sharma",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      isVerified: false,
      category: "Writer & Film Critic",
      bio: "35mm analog film rolls & world cinema screenings. Reading fiction & drinking filter coffee 🎬☕️",
      postsCount: 68,
      followersCount: "11.2k",
      followingCount: 290,
      isFollowing: followingMap["tanvi_reads"],
      mutualsText: "Followed by aarav_social",
    },
    {
      id: "acc-rohan",
      username: "rohan_acoustic",
      displayName: "Rohan Deshmukh",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      isVerified: false,
      category: "Musician",
      bio: "Fingerstyle acoustic guitarist. Indiranagar live sets & vinyl collections 🎸🎶",
      postsCount: 54,
      followersCount: "9.8k",
      followingCount: 340,
      isFollowing: followingMap["rohan_acoustic"],
    },
    {
      id: "acc-ananya",
      username: "ananya_design",
      displayName: "Ananya Verma",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
      isVerified: true,
      category: "Architecture & Design",
      bio: "Brutalist architecture in Bangalore. Modernist concrete & urban light studies 🏛📐",
      postsCount: 82,
      followersCount: "28.5k",
      followingCount: 210,
      isFollowing: followingMap["ananya_design"],
    },
  ];

  // EXPLORE MEDIA ITEMS (Instagram Explore Grid mix of 1x1 posts & 2x2 tall reels)
  const exploreItems = [
    {
      id: "ex-1",
      mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      authorUsername: "ishowspeed",
      authorName: "IShowSpeed",
      isVerified: true,
      type: "reel",
      likesCount: 240000,
      commentsCount: 6120,
      viewsCount: "1.8M",
      caption: "BENGALURU LIVE STREAM TURNOUT! Unbelievable energy 🇮🇳🔥",
      aspect: "tall", // featured tall reel
    },
    {
      id: "ex-2",
      mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      authorUsername: "priya_art",
      authorName: "Priya Rao",
      isVerified: true,
      type: "post",
      likesCount: 3200,
      commentsCount: 94,
      caption: "Cubbon Park bamboo watercolor study. Working on soft shadows.",
      aspect: "square",
    },
    {
      id: "ex-3",
      mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      authorUsername: "kabir_rides",
      authorName: "Kabir Mehta",
      isVerified: false,
      type: "post",
      likesCount: 1820,
      commentsCount: 42,
      caption: "Nandi Hills dawn climb. 60km before 8 AM! 🚴‍♂️🌅",
      aspect: "square",
    },
    {
      id: "ex-4",
      mediaUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
      authorUsername: "tanvi_reads",
      authorName: "Tanvi Sharma",
      isVerified: false,
      type: "post",
      likesCount: 940,
      commentsCount: 31,
      caption: "Arthouse cinema festival program arrived. Film schedule planned 🎬",
      aspect: "square",
    },
    {
      id: "ex-5",
      mediaUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
      authorUsername: "ishowspeed",
      authorName: "IShowSpeed",
      isVerified: true,
      type: "post",
      likesCount: 185000,
      commentsCount: 4210,
      caption: "Pitch practice in the evening golden hour ⚽️",
      aspect: "square",
    },
    {
      id: "ex-6",
      mediaUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
      authorUsername: "rohan_acoustic",
      authorName: "Rohan Deshmukh",
      isVerified: false,
      type: "reel",
      likesCount: 4300,
      commentsCount: 112,
      viewsCount: "54k",
      caption: "Filter coffee & fingerstyle chords on Sunday morning ☕️🎶",
      aspect: "square",
    },
    {
      id: "ex-7",
      mediaUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
      authorUsername: "ishowspeed",
      authorName: "IShowSpeed",
      isVerified: true,
      type: "reel",
      likesCount: 342000,
      commentsCount: 9280,
      viewsCount: "2.4M",
      caption: "Matchday celebration SIUUUU! ⚡️⚽️",
      aspect: "tall",
    },
    {
      id: "ex-8",
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      authorUsername: "aarav_social",
      authorName: "Aarav Social",
      isVerified: false,
      type: "post",
      likesCount: 540,
      commentsCount: 18,
      caption: "Peaceful morning mist over Sankey tank.",
      aspect: "square",
    },
    {
      id: "ex-9",
      mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      authorUsername: "ishowspeed",
      authorName: "IShowSpeed",
      isVerified: true,
      type: "post",
      likesCount: 198000,
      commentsCount: 5120,
      caption: "Studio vibes late into the night 🎶🔥",
      aspect: "square",
    },
  ];

  const handleToggleFollow = (username: string) => {
    setFollowingMap((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  const filteredAccounts = allAccounts.filter((acc) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.username.toLowerCase().includes(q) ||
      acc.displayName.toLowerCase().includes(q) ||
      (acc.category && acc.category.toLowerCase().includes(q)) ||
      (acc.bio && acc.bio.toLowerCase().includes(q))
    );
  });

  const filteredExploreItems = exploreItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (activeFilter === "reels" && item.type !== "reel") return false;
    if (activeFilter === "posts" && item.type !== "post") return false;
    if (!q) return true;
    return (
      item.authorUsername.toLowerCase().includes(q) ||
      item.authorName.toLowerCase().includes(q) ||
      item.caption.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ========================================================
          1. INSTAGRAM SEARCH BAR & FILTER TABS
      ======================================================== */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, reels, photos, or hashtags (e.g. ishowspeed, art, cycling)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "for_you", label: "For You", icon: Grid },
            { id: "accounts", label: "Accounts & People", icon: Users },
            { id: "reels", label: "Reels", icon: Film },
            { id: "posts", label: "Posts", icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. ACCOUNTS VIEW (OR INSTANT SEARCH MATCHES)
      ======================================================== */}
      {(activeFilter === "accounts" || (searchQuery.trim().length > 0 && activeFilter === "for_you")) && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Accounts ({filteredAccounts.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">Click any account to view profile</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {filteredAccounts.map((acc) => {
              const isFollowed = followingMap[acc.username] ?? acc.isFollowing;
              return (
                <div
                  key={acc.id}
                  className="py-3 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-900/40 p-2 rounded-xl transition-colors"
                  onClick={() => setSelectedUser(acc)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Story Gradient Ring */}
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 shrink-0">
                      <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center font-bold text-sm text-white">
                        {acc.avatarUrl ? (
                          <img
                            src={acc.avatarUrl}
                            alt={acc.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          acc.displayName[0]
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white group-hover:text-violet-400 transition-colors truncate">
                          {acc.username}
                        </span>
                        {acc.isVerified && (
                          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-black shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {acc.displayName} • {acc.followersCount} followers
                      </div>
                      {acc.bio && (
                        <p className="text-[11px] text-slate-300 truncate max-w-md hidden sm:block">
                          {acc.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFollow(acc.username);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      isFollowed
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-violet-600 hover:bg-violet-500 text-white shadow-sm"
                    }`}
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          3. INSTAGRAM EXPLORE MEDIA GRID (3-COLUMNS WITH HOVER)
      ======================================================== */}
      {activeFilter !== "accounts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-violet-400" />
              <span>Trending on Explore</span>
            </h3>
            <span className="text-[11px] text-slate-500">{filteredExploreItems.length} items</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {filteredExploreItems.map((item) => {
              const isLiked = likedItems[item.id] ?? false;
              const likesCount = item.likesCount + (isLiked ? 1 : 0);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedExploreItem(item)}
                  className={`relative bg-slate-900 group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl shadow-sm ${
                    item.aspect === "tall" ? "row-span-2 aspect-[9/16]" : "aspect-square"
                  }`}
                >
                  <img
                    src={item.mediaUrl}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Creator Indicator */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white">
                    <span>@{item.authorUsername}</span>
                    {item.isVerified && (
                      <span className="w-3 h-3 rounded-full bg-sky-500 text-white flex items-center justify-center text-[7px] font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Reel Indicator Badge */}
                  {item.type === "reel" && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white">
                      <Play className="w-3 h-3 fill-white" />
                      <span>{item.viewsCount}</span>
                    </div>
                  )}

                  {/* Hover Overlay with ❤️ and 💬 stats */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-bold text-xs sm:text-sm select-none z-20">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-white" />
                      {likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      {item.commentsCount >= 1000
                        ? `${(item.commentsCount / 1000).toFixed(1)}k`
                        : item.commentsCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          4. INSTAGRAM PUBLIC PROFILE MODAL (FOR SELECTED USER)
      ======================================================== */}
      {selectedUser && (
        <SocialPublicProfileModal
          user={selectedUser}
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          onToggleFollow={handleToggleFollow}
        />
      )}

      {/* ========================================================
          5. EXPLORE POST VIEWER MODAL
      ======================================================== */}
      {selectedExploreItem && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Left media */}
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center select-none overflow-hidden max-h-[50vh] md:max-h-[90vh]">
              <img
                src={selectedExploreItem.mediaUrl}
                alt="Post"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right details */}
            <div className="w-full md:w-2/5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950 p-4 sm:p-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => {
                      const matched = allAccounts.find(
                        (a) => a.username === selectedExploreItem.authorUsername
                      );
                      if (matched) {
                        setSelectedExploreItem(null);
                        setSelectedUser(matched);
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                      {selectedExploreItem.authorUsername[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-xs text-white">
                        <span>@{selectedExploreItem.authorUsername}</span>
                        {selectedExploreItem.isVerified && (
                          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-black">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {selectedExploreItem.authorName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedExploreItem(null)}
                    className="p-1.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 space-y-3 text-xs text-slate-200">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {selectedExploreItem.caption}
                  </p>
                  <div className="text-[10px] text-slate-500">Trending in Bengaluru</div>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setLikedItems({
                          ...likedItems,
                          [selectedExploreItem.id]: !likedItems[selectedExploreItem.id],
                        })
                      }
                      className="transition-transform active:scale-125"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          likedItems[selectedExploreItem.id]
                            ? "fill-rose-500 text-rose-500"
                            : "text-slate-300 hover:text-white"
                        }`}
                      />
                    </button>
                    <MessageCircle className="w-5 h-5 text-slate-300" />
                    <Send className="w-5 h-5 text-slate-300 hover:text-white" />
                  </div>
                  <button
                    onClick={() => {
                      const matched = allAccounts.find(
                        (a) => a.username === selectedExploreItem.authorUsername
                      );
                      if (matched) {
                        setSelectedExploreItem(null);
                        setSelectedUser(matched);
                      }
                    }}
                    className="text-xs text-sky-400 font-semibold hover:underline"
                  >
                    View Profile
                  </button>
                </div>

                <div className="text-xs font-bold text-white">
                  {(
                    selectedExploreItem.likesCount +
                    (likedItems[selectedExploreItem.id] ? 1 : 0)
                  ).toLocaleString()}{" "}
                  likes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
