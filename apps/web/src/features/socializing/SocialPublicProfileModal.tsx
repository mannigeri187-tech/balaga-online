import React, { useState } from "react";
import {
  X,
  Grid,
  Film,
  Tag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronLeft,
  Send,
  ExternalLink,
  Play,
} from "lucide-react";

export interface PublicSocialAccount {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
  category?: string;
  bio?: string;
  website?: string;
  postsCount: number;
  followersCount: string;
  followingCount: number;
  isFollowing?: boolean;
  mutualsText?: string;
  highlights?: Array<{
    id: string;
    title: string;
    cover: string;
  }>;
  posts?: Array<{
    id: string;
    mediaUrl: string;
    likesCount: number;
    commentsCount: number;
    caption?: string;
    type?: "image" | "video";
    createdAt?: string;
  }>;
}

interface SocialPublicProfileModalProps {
  user: PublicSocialAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFollow?: (username: string) => void;
  onSendMessage?: (username: string) => void;
}

export const SocialPublicProfileModal: React.FC<SocialPublicProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onToggleFollow,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "tagged">("posts");
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing ?? false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null);
  const [postLikeState, setPostLikeState] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, string[]>>({});
  const [newCommentText, setNewCommentText] = useState("");

  if (!isOpen || !user) return null;

  const handleFollowClick = () => {
    setIsFollowing((prev) => !prev);
    if (onToggleFollow) onToggleFollow(user.username);
  };

  const handleLikePost = (postId: string) => {
    setPostLikeState((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddPostComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setPostComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentText.trim()],
    }));
    setNewCommentText("");
  };

  const defaultHighlights = user.highlights || [
    {
      id: "h-1",
      title: "Live",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
    },
    {
      id: "h-2",
      title: "Travel",
      cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
    },
    {
      id: "h-3",
      title: "Moments",
      cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80",
    },
    {
      id: "h-4",
      title: "Bengaluru",
      cover: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=300&q=80",
    },
  ];

  const defaultPosts = user.posts || [
    {
      id: "p-1",
      mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      likesCount: 142000,
      commentsCount: 3820,
      caption: "Streaming live with the energy turned up to 100! Much love to everyone tuning in 🌍⚡️",
      type: "image",
      createdAt: "2 days ago",
    },
    {
      id: "p-2",
      mediaUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
      likesCount: 98400,
      commentsCount: 2190,
      caption: "Sunset session on the pitch. Keep pushing your limits every single day ⚽️🔥",
      type: "image",
      createdAt: "4 days ago",
    },
    {
      id: "p-3",
      mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      likesCount: 231000,
      commentsCount: 6540,
      caption: "Unbelievable crowd in India! The passion here is unmatched. Thank you Bengaluru! 🇮🇳❤️",
      type: "image",
      createdAt: "1 week ago",
    },
    {
      id: "p-4",
      mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      likesCount: 175000,
      commentsCount: 4210,
      caption: "New beats in the studio today. Turn the volume all the way up 🎶🔥",
      type: "image",
      createdAt: "2 weeks ago",
    },
    {
      id: "p-5",
      mediaUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
      likesCount: 88200,
      commentsCount: 1940,
      caption: "Night drive through the neon lights. Focused on what's ahead.",
      type: "image",
      createdAt: "3 weeks ago",
    },
    {
      id: "p-6",
      mediaUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
      likesCount: 312000,
      commentsCount: 8900,
      caption: "Matchday highlights! The atmosphere was completely electric ⚡️⚽️",
      type: "video",
      createdAt: "1 month ago",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto flex justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-black border border-slate-800 rounded-3xl min-h-[90vh] my-auto overflow-hidden shadow-2xl flex flex-col">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-white flex items-center gap-1.5">
              {user.username}
              {user.isVerified && (
                <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-black">
                  ✓
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Profile options for @${user.username}`)}
              className="p-1.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Profile Body */}
        <div className="p-4 sm:p-8 space-y-6 flex-1">
          {/* 1. Header Info Row (Avatar + Stats & Actions) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
            {/* Avatar with Instagram Gradient Ring */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-black p-0.5 overflow-hidden flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 text-3xl font-bold text-white flex items-center justify-center">
                      {user.displayName?.[0] || user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Meta Info */}
            <div className="space-y-4 flex-1 w-full text-center sm:text-left">
              {/* Row: Username & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-normal text-white">{user.username}</h1>
                  {user.isVerified && (
                    <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 sm:pt-0">
                  <button
                    onClick={handleFollowClick}
                    className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isFollowing
                        ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>

                  <button
                    onClick={() => {
                      if (onSendMessage) onSendMessage(user.username);
                      else alert(`Opening chat with @${user.username}...`);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Message
                  </button>
                </div>
              </div>

              {/* Row: Stats (Posts • Followers • Following) */}
              <div className="flex items-center justify-around sm:justify-start sm:gap-8 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-white">{user.postsCount}</span>{" "}
                  <span className="text-slate-400">posts</span>
                </div>
                <div>
                  <span className="font-bold text-white">{user.followersCount}</span>{" "}
                  <span className="text-slate-400">followers</span>
                </div>
                <div>
                  <span className="font-bold text-white">{user.followingCount}</span>{" "}
                  <span className="text-slate-400">following</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="text-xs space-y-1 max-w-lg">
                <div className="font-semibold text-white">{user.displayName}</div>
                {user.category && (
                  <div className="text-slate-400 font-medium text-[11px]">{user.category}</div>
                )}
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {user.bio ||
                    "Live every day! Streaming, gaming, football and world travel 🌍⚽️ | Bengaluru & Worldwide"}
                </div>
                {user.website && (
                  <a
                    href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 font-semibold hover:underline inline-flex items-center gap-1 pt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {user.mutualsText && (
                  <div className="text-[11px] text-slate-400 pt-1">{user.mutualsText}</div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Story Highlights Bar */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
              {defaultHighlights.map((hl) => (
                <div
                  key={hl.id}
                  onClick={() => setSelectedHighlight(hl)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 border border-slate-700 group-hover:border-slate-500 transition-colors">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                      <img
                        src={hl.cover}
                        alt={hl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium truncate max-w-[70px]">
                    {hl.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Navigation Tabs (POSTS • REELS • TAGGED) */}
          <div className="flex items-center justify-around border-t border-slate-800 text-xs font-semibold tracking-wider">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-3.5 flex items-center gap-2 border-t-2 transition-colors uppercase ${
                activeTab === "posts"
                  ? "border-white text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Posts</span>
            </button>
            <button
              onClick={() => setActiveTab("reels")}
              className={`py-3.5 flex items-center gap-2 border-t-2 transition-colors uppercase ${
                activeTab === "reels"
                  ? "border-white text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Reels</span>
            </button>
            <button
              onClick={() => setActiveTab("tagged")}
              className={`py-3.5 flex items-center gap-2 border-t-2 transition-colors uppercase ${
                activeTab === "tagged"
                  ? "border-white text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Tagged</span>
            </button>
          </div>

          {/* 4. 3-Column Instagram Media Grid (POSTS vs REELS) */}
          {activeTab === "reels" ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
              {defaultPosts
                .filter((p) => p.type === "video" || p.id === "sp-1" || p.id === "sp-3")
                .map((reel) => {
                  const isLiked = postLikeState[reel.id] ?? false;
                  const currentLikes = reel.likesCount + (isLiked ? 1 : 0);

                  return (
                    <div
                      key={reel.id}
                      onClick={() => setSelectedPost(reel)}
                      className="relative aspect-[9/16] bg-slate-900 group cursor-pointer overflow-hidden rounded-md sm:rounded-lg shadow-sm"
                    >
                      <img
                        src={reel.mediaUrl}
                        alt={reel.caption || "Reel"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Gradient bottom shadow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Views Count Badge */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-white text-xs font-bold drop-shadow">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>
                          {currentLikes >= 1000
                            ? `${(currentLikes * 3.4 / 1000).toFixed(1)}k`
                            : `${currentLikes * 3}`}
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-bold text-xs sm:text-sm select-none">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 fill-white" />
                          {currentLikes >= 1000
                            ? `${(currentLikes / 1000).toFixed(1)}k`
                            : currentLikes}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 fill-white" />
                          {reel.commentsCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : activeTab === "tagged" ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
              {defaultPosts.slice(0, 3).map((post) => (
                <div
                  key={`tagged-${post.id}`}
                  onClick={() => setSelectedPost(post)}
                  className="relative aspect-square bg-slate-900 group cursor-pointer overflow-hidden rounded-md sm:rounded-lg"
                >
                  <img
                    src={post.mediaUrl}
                    alt="Tagged post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>@{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
              {defaultPosts.map((post) => {
                const isLiked = postLikeState[post.id] ?? false;
                const currentLikes = post.likesCount + (isLiked ? 1 : 0);
                const commentsList = postComments[post.id] || [];
                const totalComments = post.commentsCount + commentsList.length;

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square bg-slate-900 group cursor-pointer overflow-hidden rounded-md sm:rounded-lg"
                  >
                    <img
                      src={post.mediaUrl}
                      alt={post.caption || "Instagram post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Video indicator badge */}
                    {post.type === "video" && (
                      <div className="absolute top-2 right-2 text-white drop-shadow">
                        <Film className="w-4 h-4" />
                      </div>
                    )}

                    {/* Hover Overlay with ❤️ and 💬 stats */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-xs sm:text-sm select-none">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-white" />
                        {currentLikes >= 1000
                          ? `${(currentLikes / 1000).toFixed(1)}k`
                          : currentLikes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        {totalComments >= 1000
                          ? `${(totalComments / 1000).toFixed(1)}k`
                          : totalComments}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          POST MODAL VIEWER (INSTAGRAM DESKTOP STYLE)
      ======================================================== */}
      {selectedPost && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Left: Media Area */}
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center select-none overflow-hidden max-h-[50vh] md:max-h-[90vh]">
              <img
                src={selectedPost.mediaUrl}
                alt="Post"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right: Author, Caption & Comments Section */}
            <div className="w-full md:w-2/5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950 p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-xs">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-white">{user.username}</span>
                      {user.isVerified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{user.displayName}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Comments & Caption */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs text-slate-200">
                {/* Caption */}
                {selectedPost.caption && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username[0].toUpperCase()
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-white mr-1.5">{user.username}</span>
                      <span className="text-slate-300 leading-relaxed">{selectedPost.caption}</span>
                      <div className="text-[10px] text-slate-500 pt-1">{selectedPost.createdAt || "Just now"}</div>
                    </div>
                  </div>
                )}

                {/* Simulated existing comments */}
                <div className="flex items-start gap-2.5 pt-2">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-violet-600/30 flex items-center justify-center font-bold text-[10px] text-violet-300">
                    P
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-white mr-1.5">priya_art</span>
                    <span className="text-slate-300">The lighting in this shot is unbelievable! 🔥</span>
                    <div className="text-[10px] text-slate-500 pt-0.5">1d ago • Reply</div>
                  </div>
                </div>

                {/* Dynamically added comments */}
                {(postComments[selectedPost.id] || []).map((cmt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 animate-in fade-in duration-150">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-emerald-600/30 flex items-center justify-center font-bold text-[10px] text-emerald-300">
                      You
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-white mr-1.5">aarav_social</span>
                      <span className="text-slate-300">{cmt}</span>
                      <div className="text-[10px] text-slate-500 pt-0.5">Just now</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons & Input */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLikePost(selectedPost.id)}
                      className="transition-transform active:scale-125"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          postLikeState[selectedPost.id]
                            ? "fill-rose-500 text-rose-500"
                            : "text-slate-300 hover:text-white"
                        }`}
                      />
                    </button>
                    <MessageCircle className="w-5 h-5 text-slate-300" />
                    <Send className="w-5 h-5 text-slate-300 hover:text-white" />
                  </div>
                </div>

                <div className="text-xs font-bold text-white">
                  {(
                    selectedPost.likesCount + (postLikeState[selectedPost.id] ? 1 : 0)
                  ).toLocaleString()}{" "}
                  likes
                </div>

                {/* Add comment form */}
                <form
                  onSubmit={(e) => handleAddPostComment(e, selectedPost.id)}
                  className="flex items-center gap-2 pt-1 border-t border-slate-800/80"
                >
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 disabled:opacity-40"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          HIGHLIGHT STORY VIEWER
      ======================================================== */}
      {selectedHighlight && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[75vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
            <img
              src={selectedHighlight.cover}
              alt={selectedHighlight.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />

            {/* Header */}
            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs">{selectedHighlight.title}</span>
                <span className="text-[10px] text-slate-400">• Highlight</span>
              </div>
              <button
                onClick={() => setSelectedHighlight(null)}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom info */}
            <div className="relative z-10 p-4 text-center">
              <span className="text-xs text-white/90 font-medium">
                Tap left or right to explore {selectedHighlight.title} stories
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
