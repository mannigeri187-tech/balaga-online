import React, { useState } from "react";
import { SocialCommunity, SocialCommunityPost } from "@platform/shared-types";
import { useWorld } from "../../contexts/WorldContext";
import { Button } from "../../components/ui/Button";
import {
  Users,
  Search,
  Plus,
  Lock,
  Globe,
  Shield,
  MessageSquare,
  Heart,
  Send,
  X,
  ArrowLeft,
  Receipt,
  Radio,
} from "lucide-react";
import { CircleSplitModal } from "./CircleSplitModal";
import { RapidHuddleModal } from "./RapidHuddleModal";

export const SocialCommunities: React.FC = () => {
  const { socialProfile } = useWorld();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<SocialCommunity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isHuddleOpen, setIsHuddleOpen] = useState(false);

  // Communities State
  const [communities, setCommunities] = useState<SocialCommunity[]>([
    {
      id: "comm-1",
      creatorId: "10000000-0000-0000-0000-000000000002",
      name: "Bangalore Urban Sketchers",
      slug: "bangalore-urban-sketchers",
      description: "A community for architectural sketchers, plein air painters, and watercolor enthusiasts meeting weekly in Cubbon Park & Lalbagh.",
      category: "Art & Design",
      isPrivate: false,
      coverUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
      avatarUrl: "🎨",
      rules: [
        "Be kind and supportive to beginner artists.",
        "Share only original sketches and works in progress.",
        "Mention location details for weekend outdoor paint-outs.",
      ],
      membersCount: 248,
      isMember: true,
      myRole: "member",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "comm-2",
      creatorId: "10000000-0000-0000-0000-000000000003",
      name: "Deccan Century Cyclists",
      slug: "deccan-century-cyclists",
      description: "Dedicated to weekend endurance road cyclists doing 50k-100k+ loops across Mysore Road, Nandi Hills, and Kanakapura.",
      category: "Fitness & Cycling",
      isPrivate: false,
      coverUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80",
      avatarUrl: "🚴",
      rules: [
        "Helmets and rear tail lights mandatory for all group rollouts.",
        "No drop policy on beginner Saturday morning loops.",
        "Respect local traffic and stay in single file on highways.",
      ],
      membersCount: 412,
      isMember: false,
      myRole: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "comm-3",
      creatorId: "10000000-0000-0000-0000-000000000001",
      name: "Bengaluru Filter Coffee & Reading Club",
      slug: "bengaluru-coffee-reads",
      description: "Sunday morning silent reading sessions followed by lively discussions on contemporary fiction, translations, and essays over filter coffee.",
      category: "Books & Literature",
      isPrivate: true,
      coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
      avatarUrl: "☕",
      rules: [
        "Private club: Members must introduce themselves with their current read.",
        "Zero spoilers for books under 2 years old without content warnings.",
        "Bring your own paperback or e-reader to offline cafes.",
      ],
      membersCount: 135,
      isMember: true,
      myRole: "owner",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "comm-4",
      creatorId: "10000000-0000-0000-0000-000000000004",
      name: "Indie Cinema Society",
      slug: "indie-cinema-society",
      description: "Screening retrospectives, indie regional masterpieces, Malayalam new wave, and global arthouse cinema with post-screening member breakdowns.",
      category: "Cinema & Film",
      isPrivate: false,
      coverUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
      avatarUrl: "🎬",
      rules: [
        "Constructive critique only; respect different cinematic viewpoints.",
        "Legal streaming and cinema house screenings only.",
      ],
      membersCount: 310,
      isMember: false,
      myRole: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "comm-5",
      creatorId: "10000000-0000-0000-0000-000000000001",
      name: "Indie Hackers & Weekend Builders",
      slug: "indie-hackers-weekend",
      description: "Weekend side-project builders, indie hackers, and creative coders in Bengaluru sharing cafe spots, design systems, and launch demos.",
      category: "Tech & Code",
      isPrivate: false,
      coverUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80",
      avatarUrl: "💻",
      rules: [
        "Zero promotional spam; share genuine build-in-public learnings.",
        "Support fellow indie creators with constructive design & code feedback.",
        "Informal weekend offline co-working in cafes.",
      ],
      membersCount: 384,
      isMember: true,
      myRole: "member",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Community Discussion Posts
  const [communityPosts, setCommunityPosts] = useState<Record<string, SocialCommunityPost[]>>({
    "comm-1": [
      {
        id: "cp-1",
        communityId: "comm-1",
        authorId: "10000000-0000-0000-0000-000000000002",
        author: socialProfile || undefined,
        content: "Hey everyone! We're meeting at the North Gate of Lalbagh at 7:30 AM this Saturday. Bring cold-press paper and water brushes. Coffee at MTR afterwards!",
        mediaUrls: [],
        likesCount: 19,
        commentsCount: 4,
        isPinned: false,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
    "comm-3": [
      {
        id: "cp-2",
        communityId: "comm-3",
        authorId: "10000000-0000-0000-0000-000000000001",
        author: socialProfile || undefined,
        content: "Our read for this month is Geetanjali Shree's International Booker winner 'Tomb of Sand' translated by Daisy Rockwell. Grab your copy and start reading chapters 1 to 10 for our first Sunday sync!",
        mediaUrls: [],
        likesCount: 26,
        commentsCount: 6,
        isPinned: true,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
  });

  // New Discussion Post Form
  const [postContent, setPostContent] = useState("");

  // Create Community Form
  const [newCommName, setNewCommName] = useState("");
  const [newCommSlug, setNewCommSlug] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [newCommCategory, setNewCommCategory] = useState("Art & Design");
  const [newCommIsPrivate, setNewCommIsPrivate] = useState<boolean>(false);

  // Toggle Join Community
  const handleToggleJoin = (comm: SocialCommunity) => {
    setCommunities(
      communities.map((c) => {
        if (c.id !== comm.id) return c;
        const willBeMember = !c.isMember;
        return {
          ...c,
          isMember: willBeMember,
          myRole: willBeMember ? "member" : null,
          membersCount: willBeMember ? c.membersCount + 1 : Math.max(0, c.membersCount - 1),
        };
      })
    );

    if (selectedCommunity && selectedCommunity.id === comm.id) {
      setSelectedCommunity({
        ...selectedCommunity,
        isMember: !selectedCommunity.isMember,
        membersCount: !selectedCommunity.isMember
          ? selectedCommunity.membersCount + 1
          : selectedCommunity.membersCount - 1,
      });
    }
  };

  // Submit Community Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity || !postContent.trim()) return;

    const newPost: SocialCommunityPost = {
      id: `cp-${Date.now()}`,
      communityId: selectedCommunity.id,
      authorId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
      author: socialProfile || undefined,
      content: postContent.trim(),
      mediaUrls: [],
      likesCount: 0,
      commentsCount: 0,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCommunityPosts({
      ...communityPosts,
      [selectedCommunity.id]: [newPost, ...(communityPosts[selectedCommunity.id] || [])],
    });

    setPostContent("");
  };

  // Create Community Handler
  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim() || !newCommSlug.trim()) return;

    const created: SocialCommunity = {
      id: `comm-${Date.now()}`,
      creatorId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
      name: newCommName.trim(),
      slug: newCommSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newCommDesc.trim(),
      category: newCommCategory,
      isPrivate: newCommIsPrivate,
      coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
      avatarUrl: "✨",
      rules: ["Be respectful and inclusive to all members."],
      membersCount: 1,
      isMember: true,
      myRole: "owner",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCommunities([created, ...communities]);
    setIsCreateModalOpen(false);
    setNewCommName("");
    setNewCommSlug("");
    setNewCommDesc("");
  };

  const categories = [
    "All",
    "Art & Design",
    "Fitness & Cycling",
    "Books & Literature",
    "Cinema & Film",
    "Music & Audio",
    "Tech & Code",
    "Travel & Outdoors",
  ];

  const filteredCommunities = communities.filter((c) => {
    if (activeCategory !== "All" && c.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-slate-100">Balaga Circles</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Interest-First
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Small, interest-based communities for crafts, sports, cinema, literature, and creative coding. Zero algorithmic ranking.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Democratic Circle Council: Transparent moderation logs & member guidelines</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Radio className="w-4 h-4 text-amber-400" />}
            onClick={() => setIsHuddleOpen(true)}
            className="shrink-0 bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            10-Min Huddle 🎙️
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Receipt className="w-4 h-4 text-emerald-400" />}
            onClick={() => setIsSplitModalOpen(true)}
            className="shrink-0 bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Zero-Math Split 💸
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0"
          >
            Start a Circle
          </Button>
        </div>
      </div>

      {!selectedCommunity ? (
        /* COMMUNITIES DIRECTORY VIEW */
        <div className="space-y-6">
          {/* Search & Categories */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities by name, topic, or description..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

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
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunities.map((comm) => (
              <div
                key={comm.id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Cover */}
                  <div className="h-28 relative">
                    <img
                      src={comm.coverUrl || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80"}
                      alt={comm.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 text-[10px] font-semibold text-slate-200">
                      {comm.isPrivate ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Private</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>Public</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1 bg-slate-950 rounded-xl border border-slate-800">
                        {comm.avatarUrl}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 hover:text-violet-400 cursor-pointer" onClick={() => setSelectedCommunity(comm)}>
                          {comm.name}
                        </h3>
                        <span className="text-[11px] text-violet-400 font-medium">
                          {comm.category} • {comm.membersCount} members
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {comm.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedCommunity(comm)}
                    className="flex-1"
                  >
                    View Community
                  </Button>

                  <Button
                    variant={comm.isMember ? "following" : "primary"}
                    size="sm"
                    onClick={() => handleToggleJoin(comm)}
                  >
                    {comm.isMember ? "Joined" : comm.isPrivate ? "Request Join" : "Join"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SINGLE COMMUNITY DETAIL & DISCUSSION BOARD */
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedCommunity(null)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Communities</span>
          </button>

          {/* Community Hero Header */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="h-44 relative">
              <img
                src={selectedCommunity.coverUrl || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80"}
                alt={selectedCommunity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            <div className="p-5 -mt-10 relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex items-end gap-3.5">
                  <span className="text-4xl p-2 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-md">
                    {selectedCommunity.avatarUrl}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white drop-shadow">
                      {selectedCommunity.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-violet-400 font-semibold">{selectedCommunity.category}</span>
                      <span>•</span>
                      <span>{selectedCommunity.membersCount} members</span>
                      <span>•</span>
                      <span>{selectedCommunity.isPrivate ? "Private" : "Public"} Community</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Radio className="w-3.5 h-3.5 text-amber-400" />}
                    onClick={() => setIsHuddleOpen(true)}
                    className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
                  >
                    10-Min Huddle
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Receipt className="w-3.5 h-3.5 text-emerald-400" />}
                    onClick={() => setIsSplitModalOpen(true)}
                    className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
                  >
                    Split Group Bill
                  </Button>
                  <Button
                    variant={selectedCommunity.isMember ? "destructive" : "primary"}
                    size="sm"
                    onClick={() => handleToggleJoin(selectedCommunity)}
                  >
                    {selectedCommunity.isMember ? "Leave Community" : "Join Community"}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {selectedCommunity.description}
              </p>

              {/* Community Rules */}
              {selectedCommunity.rules && selectedCommunity.rules.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-violet-400" /> Community Rules
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                    {selectedCommunity.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Discussion Board / Feed */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span>Community Discussions</span>
            </h3>

            {/* Post in Community Composer */}
            {selectedCommunity.isMember ? (
              <form onSubmit={handleCreatePost} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3">
                <textarea
                  required
                  rows={3}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder={`Share an update or question with ${selectedCommunity.name}...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!postContent.trim()}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-900/30"
                  >
                    <Send className="w-3.5 h-3.5" /> Post in Community
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                Join this community to start or participate in discussions.
              </div>
            )}

            {/* Community Posts List */}
            <div className="space-y-3">
              {(communityPosts[selectedCommunity.id] || []).length > 0 ? (
                communityPosts[selectedCommunity.id].map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-300 font-bold flex items-center justify-center text-xs">
                          {post.author?.displayName?.[0] || "U"}
                        </div>
                        <span className="font-semibold text-xs text-slate-200">
                          {post.author?.displayName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                      <button className="flex items-center gap-1 hover:text-slate-200">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post.likesCount}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-slate-200">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount} replies</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-6">
                  No discussions yet. Be the first to start a conversation in this community!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE COMMUNITY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-100">Create New Community</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Community Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={(e) => {
                    setNewCommName(e.target.value);
                    setNewCommSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                  }}
                  placeholder="e.g. Bangalore Indie Filmmakers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Unique Slug
                </label>
                <input
                  type="text"
                  required
                  value={newCommSlug}
                  onChange={(e) => setNewCommSlug(e.target.value)}
                  placeholder="bangalore-indie-filmmakers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="What is the mission or focus of this community?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCommCategory}
                    onChange={(e) => setNewCommCategory(e.target.value)}
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
                    Privacy
                  </label>
                  <select
                    value={newCommIsPrivate ? "private" : "public"}
                    onChange={(e) => setNewCommIsPrivate(e.target.value === "private")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="public">Public (Open)</option>
                    <option value="private">Private (Approval)</option>
                  </select>
                </div>
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
                  disabled={!newCommName.trim() || !newCommSlug.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-900/30"
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ZERO-MATH CIRCLE SPLIT MODAL (S15) */}
      <CircleSplitModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        circleName={selectedCommunity?.name || "Balaga Circles"}
      />

      {/* 10-MINUTE RAPID HUDDLE MODAL (S23) */}
      <RapidHuddleModal
        isOpen={isHuddleOpen}
        onClose={() => setIsHuddleOpen(false)}
        circleName={selectedCommunity?.name || "Balaga Circles"}
      />
    </div>
  );
};
