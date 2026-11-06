import React, { useState } from "react";
import { SocialProfile } from "@platform/shared-types";
import { useWorld } from "../../contexts/WorldContext";
import { SocialProfileEditor } from "./SocialProfileEditor";
import { Button } from "../../components/ui/Button";
import {
  Settings,
  Grid,
  Bookmark,
  UserCheck,
  Heart,
  MessageCircle,
  Plus,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  X,
  Smile,
  Camera,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SocialProfileViewProps {
  profile?: SocialProfile | null;
  isSelf?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const SocialProfileView: React.FC<SocialProfileViewProps> = ({
  profile: propProfile,
  isSelf = true,
  onNavigateTab,
}) => {
  const { socialProfile } = useWorld();
  const [profile, setProfile] = useState<SocialProfile | null>(
    propProfile || socialProfile || null
  );

  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged">("posts");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // 1. Note State & Modal (Instagram Note Feature)
  const [activeNote, setActiveNote] = useState<string | null>("Filter coffee & sketches ☕");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(activeNote || "");

  // 2. Profile Photo Modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState("");

  // 3. Highlights State & Viewer Modal
  const [highlights, setHighlights] = useState([
    {
      id: "hl-1",
      title: "vision",
      coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      stories: [
        {
          id: "s-1",
          mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
          caption: "Morning misty view over the hills 🌲",
        },
        {
          id: "s-2",
          mediaUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
          caption: "Architecture walk with friends",
        },
      ],
    },
    {
      id: "hl-2",
      title: "Coorg 🌲",
      coverUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      stories: [
        {
          id: "s-3",
          mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
          caption: "Road trip through plantation trails",
        },
      ],
    },
    {
      id: "hl-3",
      title: "Sketches 🎨",
      coverUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      stories: [
        {
          id: "s-4",
          mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
          caption: "Cubbon Park sketches with watercolors",
        },
      ],
    },
    {
      id: "hl-4",
      title: "Cafes ☕",
      coverUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
      stories: [
        {
          id: "s-5",
          mediaUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
          caption: "Best filter coffee bar in town",
        },
      ],
    },
  ]);

  const [activeHighlight, setActiveHighlight] = useState<typeof highlights[0] | null>(null);
  const [activeHighlightSlide, setActiveHighlightSlide] = useState(0);
  const [isNewHighlightModalOpen, setIsNewHighlightModalOpen] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState("");

  // 4. Grid Posts with Delete option
  const [userPosts, setUserPosts] = useState([
    {
      id: "p-1",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      caption: "Misty trails and plantation roads in Madikeri 🌲☕",
      likesCount: 142,
      commentsCount: 18,
    },
    {
      id: "p-2",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      caption: "Watercolor sketches under Cubbon Park bamboo grove",
      likesCount: 236,
      commentsCount: 34,
    },
    {
      id: "p-3",
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      caption: "Sunrise cycling rollout to Nandi Hills at dawn",
      likesCount: 98,
      commentsCount: 12,
    },
    {
      id: "p-4",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
      caption: "Late evening 35mm film shots around Brigade Road",
      likesCount: 189,
      commentsCount: 21,
    },
    {
      id: "p-5",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
      caption: "Sunday morning filter coffee & podi dosa ritual",
      likesCount: 312,
      commentsCount: 45,
    },
    {
      id: "p-6",
      imageUrl: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80",
      caption: "Weekend literature reading club notes & journaling",
      likesCount: 164,
      commentsCount: 15,
    },
  ]);

  const [selectedPost, setSelectedPost] = useState<typeof userPosts[0] | null>(null);

  // Handle Share Note
  const handleShareNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDraft.trim()) {
      setActiveNote(null);
    } else {
      setActiveNote(noteDraft.trim());
    }
    setIsNoteModalOpen(false);
  };

  // Handle Update Profile Photo
  const handleSavePhoto = (newUrl: string) => {
    if (!profile) return;
    const updated = { ...profile, avatarUrl: newUrl };
    setProfile(updated);
    setIsPhotoModalOpen(false);
    setPhotoUrlInput("");
  };

  // Handle Add Highlight
  const handleCreateHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlightTitle.trim()) return;

    const newHl = {
      id: `hl-${Date.now()}`,
      title: newHighlightTitle.trim(),
      coverUrl: userPosts[0]?.imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      stories: [
        {
          id: `s-${Date.now()}`,
          mediaUrl: userPosts[0]?.imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
          caption: newHighlightTitle.trim(),
        },
      ],
    };

    setHighlights([...highlights, newHl]);
    setNewHighlightTitle("");
    setIsNewHighlightModalOpen(false);
  };

  // Handle Delete Post
  const handleDeletePost = (postId: string) => {
    setUserPosts(userPosts.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-8">
      {/* 1. INSTAGRAM PROFILE HEADER */}
      <header className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 md:gap-16">
        {/* Left: Large Circular Avatar with Note bubble */}
        <div className="relative shrink-0 flex flex-col items-center">
          {/* Note speech bubble (Clickable to add/edit thought) */}
          {isSelf && (
            <button
              onClick={() => {
                setNoteDraft(activeNote || "");
                setIsNoteModalOpen(true);
              }}
              className="absolute -top-4 md:-top-5 z-20 bg-slate-800/95 hover:bg-slate-700/95 border border-slate-700 text-slate-200 text-[11px] font-medium px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 group"
              title="Share a thought"
            >
              <span className="max-w-[120px] truncate">
                {activeNote || "Note..."}
              </span>
              <span className="text-xs group-hover:rotate-12 transition-transform">💭</span>
            </button>
          )}

          {/* Profile Avatar circle with hover camera action */}
          <div
            onClick={() => isSelf && setIsPhotoModalOpen(true)}
            className={`w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-violet-600/40 to-pink-500/40 border border-slate-700/80 shadow-2xl overflow-hidden relative group ${
              isSelf ? "cursor-pointer" : ""
            }`}
            title={isSelf ? "Click to change profile photo" : undefined}
          >
            <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-violet-300">
                  {profile.displayName ? profile.displayName[0] : "B"}
                </div>
              )}

              {/* Camera overlay on hover for profile owner */}
              {isSelf && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-semibold mt-1">Change Photo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="flex-1 space-y-4 text-center sm:text-left w-full">
          {/* Row 1: Username & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <h1 className="text-xl md:text-2xl font-normal text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              <span>{profile.username}</span>
            </h1>

            {isSelf ? (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-1.5 rounded-lg border-0"
                >
                  Edit profile
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateTab?.("saved")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-1.5 rounded-lg border-0"
                >
                  View archive
                </Button>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Button
                  variant={isFollowing ? "following" : "primary"}
                  size="sm"
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateTab?.("inbox")}
                >
                  Message
                </Button>
                <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Row 2: Stats (Posts, Followers, Following) */}
          <div className="flex items-center justify-center sm:justify-start gap-8 text-sm">
            <div>
              <span className="font-semibold text-slate-100">{userPosts.length}</span>{" "}
              <span className="text-slate-400">posts</span>
            </div>
            <div>
              <span className="font-semibold text-slate-100">248</span>{" "}
              <span className="text-slate-400">followers</span>
            </div>
            <div>
              <span className="font-semibold text-slate-100">182</span>{" "}
              <span className="text-slate-400">following</span>
            </div>
          </div>

          {/* Row 3: Display Name, Pronouns & Bio */}
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-semibold text-slate-100">{profile.displayName}</span>
              {profile.pronouns && (
                <span className="text-slate-400 text-xs">({profile.pronouns})</span>
              )}
            </div>

            {profile.bio && (
              <p className="text-slate-200 whitespace-pre-line leading-relaxed max-w-lg">
                {profile.bio}
              </p>
            )}

            {/* Location & Website link */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-xs text-slate-400 pt-1">
              {profile.broadLocation && (
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-violet-400" />
                  {profile.broadLocation}
                </span>
              )}
              <a
                href={`https://balaga.online/@${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-violet-400 hover:underline font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                balaga.online/@{profile.username}
              </a>
            </div>

            {/* Interest Tags */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-2">
                {profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-slate-900 text-violet-300 border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. STORY HIGHLIGHTS (Clickable to open stories viewer) */}
      <section className="pt-4 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-6 sm:gap-8 px-2">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              onClick={() => {
                setActiveHighlight(hl);
                setActiveHighlightSlide(0);
              }}
              className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 border-2 border-slate-700 group-hover:border-slate-400 transition-colors">
                <img
                  src={hl.coverUrl}
                  alt={hl.title}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-white truncate max-w-[72px]">
                {hl.title}
              </span>
            </div>
          ))}

          {/* New highlight button for owner */}
          {isSelf && (
            <div
              onClick={() => setIsNewHighlightModalOpen(true)}
              className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-800 hover:border-slate-700 bg-slate-900/60 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] font-medium text-slate-400 group-hover:text-white">
                New
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. INSTAGRAM TABS (POSTS, SAVED, TAGGED) */}
      <div className="border-t border-slate-800">
        <div className="flex items-center justify-center gap-12 sm:gap-16 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3.5 flex items-center gap-1.5 transition-colors border-t-2 -mt-[2px] ${
              activeTab === "posts"
                ? "border-white text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`py-3.5 flex items-center gap-1.5 transition-colors border-t-2 -mt-[2px] ${
              activeTab === "saved"
                ? "border-white text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
          <button
            onClick={() => setActiveTab("tagged")}
            className={`py-3.5 flex items-center gap-1.5 transition-colors border-t-2 -mt-[2px] ${
              activeTab === "tagged"
                ? "border-white text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tagged</span>
          </button>
        </div>
      </div>

      {/* 4. POSTS GRID (3-Column square layout with hover overlays) */}
      {activeTab === "posts" && (
        <div className="grid grid-cols-3 gap-1 md:gap-6">
          {userPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square bg-slate-900 overflow-hidden group cursor-pointer"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Overlay with Likes & Comments count */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 sm:gap-6 text-white text-xs sm:text-sm font-bold transition-opacity duration-150">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likesCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.commentsCount}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SAVED TAB */}
      {activeTab === "saved" && (
        <div className="grid grid-cols-3 gap-1 md:gap-6">
          {userPosts.slice(0, 3).map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square bg-slate-900 overflow-hidden group cursor-pointer"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 sm:gap-6 text-white text-xs sm:text-sm font-bold transition-opacity duration-150">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 fill-white" />
                  <span>Saved</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAGGED TAB */}
      {activeTab === "tagged" && (
        <div className="py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Photos of you</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When people tag you in photos and reels, they will appear here.
          </p>
        </div>
      )}

      {/* MODAL 1: NEW NOTE MODAL (Matches user screenshot 1) */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header: X on left, "New note" in center, "Share" on right */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-slate-100">New note</h2>
              <button
                onClick={handleShareNote}
                disabled={!noteDraft.trim() && !activeNote}
                className="text-sm font-bold text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors"
              >
                Share
              </button>
            </div>

            {/* Note Content Input Bubble above Avatar */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative flex flex-col items-center">
                {/* Speech Bubble */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 w-64 shadow-xl relative">
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value.slice(0, 60))}
                    placeholder="Share a thought..."
                    rows={2}
                    className="w-full bg-transparent border-0 text-xs text-slate-100 placeholder-slate-400 focus:outline-none resize-none text-center font-medium"
                    autoFocus
                  />
                  <div className="text-[10px] text-right text-slate-500">
                    {noteDraft.length}/60
                  </div>
                  {/* Bubble Pointer triangle */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800" />
                </div>

                {/* Avatar underneath */}
                <div className="w-20 h-20 rounded-full mt-4 p-0.5 bg-gradient-to-tr from-violet-600 to-pink-500 overflow-hidden">
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xl font-bold text-violet-300">
                        {profile.displayName[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setNoteDraft((prev) => prev + " ✨")}
                  className="mt-3 text-slate-400 hover:text-yellow-400 transition-colors"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Footer: Audience settings */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-center text-xs text-slate-400">
              <span>Shared with followers you follow back ⌄</span>
            </div>

            {/* Delete note option if already set */}
            {activeNote && (
              <div className="text-center pt-1">
                <button
                  onClick={() => {
                    setActiveNote(null);
                    setNoteDraft("");
                    setIsNoteModalOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:underline font-semibold"
                >
                  Delete current note
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PROFILE PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100">Change Profile Photo</h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select an avatar preset or enter an image URL to update your Socializing profile picture:
            </p>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
              ].map((url, i) => (
                <button
                  key={i}
                  onClick={() => handleSavePhoto(url)}
                  className="aspect-square rounded-xl overflow-hidden border border-slate-700 hover:border-violet-400 transition-colors"
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-semibold text-slate-300 block">Or Image URL</label>
              <input
                type="url"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
              <Button
                variant="primary"
                size="sm"
                disabled={!photoUrlInput.trim()}
                onClick={() => handleSavePhoto(photoUrlInput.trim())}
                className="w-full mt-2"
              >
                Save Photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: HIGHLIGHT VIEWER MODAL */}
      {activeHighlight && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-950 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800">
            {/* Story slide progress indicator */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
              {activeHighlight.stories.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      i <= activeHighlightSlide ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={activeHighlight.coverUrl}
                  alt={activeHighlight.title}
                  className="w-7 h-7 rounded-full border border-white object-cover"
                />
                <span className="font-bold drop-shadow">{activeHighlight.title}</span>
              </div>
              <button
                onClick={() => setActiveHighlight(null)}
                className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Content */}
            <div className="w-full h-full relative">
              <img
                src={activeHighlight.stories[activeHighlightSlide]?.mediaUrl}
                alt="Highlight slide"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Caption */}
              <div className="absolute bottom-6 left-4 right-4 z-20 text-white text-xs leading-relaxed drop-shadow">
                {activeHighlight.stories[activeHighlightSlide]?.caption}
              </div>

              {/* Left/Right Click Navigators */}
              <button
                onClick={() =>
                  setActiveHighlightSlide(Math.max(0, activeHighlightSlide - 1))
                }
                disabled={activeHighlightSlide === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white disabled:opacity-0 hover:bg-black/60 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (activeHighlightSlide < activeHighlight.stories.length - 1) {
                    setActiveHighlightSlide(activeHighlightSlide + 1);
                  } else {
                    setActiveHighlight(null);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW HIGHLIGHT MODAL */}
      {isNewHighlightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100">New Highlight</h3>
              <button
                onClick={() => setIsNewHighlightModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateHighlight} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  Highlight Name
                </label>
                <input
                  type="text"
                  value={newHighlightTitle}
                  onChange={(e) => setNewHighlightTitle(e.target.value)}
                  placeholder="e.g. Trips, Coffee, Art..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  autoFocus
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={!newHighlightTitle.trim()}
                className="w-full"
              >
                Create Highlight
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: POST DETAIL & DELETE MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-3">
            <div className="aspect-square bg-black overflow-hidden relative">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.caption}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedPost.caption}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  {selectedPost.likesCount} likes
                </span>

                {/* Delete Post option for owner */}
                {isSelf && (
                  <button
                    onClick={() => handleDeletePost(selectedPost.id)}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete post</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Editor Modal */}
      {isSelf && isEditorOpen && (
        <SocialProfileEditor
          profile={profile}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={(updated) => {
            setProfile({ ...profile, ...updated });
          }}
        />
      )}
    </div>
  );
};
