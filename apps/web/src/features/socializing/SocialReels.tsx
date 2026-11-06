import React, { useState } from "react";
import { SocialReel } from "@platform/shared-types";
import { useWorld } from "../../contexts/WorldContext";
import {
  Film,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Music,
  Send,
  X,
  UserCheck,
  UserPlus,
  Check,
} from "lucide-react";

export const SocialReels: React.FC = () => {
  const { socialProfile } = useWorld();
  const [shareToast, setShareToast] = useState<string | null>(null);

  const [reels, setReels] = useState<
    Array<SocialReel & { commentsList?: Array<{ id: string; author: string; text: string; time: string }> }>
  >([
    {
      id: "reel-1",
      authorId: "10000000-0000-0000-0000-000000000002",
      author: {
        id: "10000000-0000-0000-0000-000000000002",
        accountId: "00000000-0000-0000-0000-000000000002",
        username: "priya_art",
        displayName: "Priya Rao",
        pronouns: "she/her",
        broadLocation: "Bengaluru, Karnataka",
        interests: ["Watercolor", "Architecture"],
        hobbies: ["Sketching"],
        languages: ["English", "Kannada"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      caption: "Time-lapse of painting the ancient stone arches in Cubbon Park 🎨🍃 #bangalore #watercolor #artcommunity",
      audioTrack: "Priya Rao • Original Ambient Audio",
      hashtags: ["bangalore", "watercolor", "artcommunity"],
      likesCount: 142,
      commentsCount: 18,
      sharesCount: 24,
      viewsCount: 840,
      hasLiked: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      commentsList: [
        { id: "rc-1", author: "Kabir Menon", text: "The color transitions on the granite pillars are unreal!", time: "2h ago" },
        { id: "rc-2", author: "Tanvi Shah", text: "Please host a weekend sketching meetup in Cubbon!", time: "4h ago" },
      ],
    },
    {
      id: "reel-2",
      authorId: "10000000-0000-0000-0000-000000000003",
      author: {
        id: "10000000-0000-0000-0000-000000000003",
        accountId: "00000000-0000-0000-0000-000000000003",
        username: "kabir_rides",
        displayName: "Kabir Menon",
        pronouns: "he/him",
        broadLocation: "Bengaluru, Karnataka",
        interests: ["Cycling", "Fitness"],
        hobbies: ["Biking"],
        languages: ["English", "Malayalam"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cyclist-riding-on-a-road-at-sunset-42867-large.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      caption: "Descending Nandi Hills at dawn with the cycling squad 🚴💨 #nandihills #cyclingtribe #weekendvibes",
      audioTrack: "Kabir Menon • Morning Rush",
      hashtags: ["nandihills", "cyclingtribe", "weekendvibes"],
      likesCount: 89,
      commentsCount: 12,
      sharesCount: 15,
      viewsCount: 620,
      hasLiked: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      commentsList: [
        { id: "rc-3", author: "Aarav Social", text: "That hairpin turn was insane. What cadence were you pushing?", time: "1d ago" },
      ],
    },
  ]);

  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // Upload Form State
  const [uploadVideoUrl, setUploadVideoUrl] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadAudioTitle, setUploadAudioTitle] = useState("");

  const currentReel = reels[activeReelIndex];

  const handleToggleLike = (reelId: string) => {
    setReels(
      reels.map((r) => {
        if (r.id !== reelId) return r;
        const willLike = !r.hasLiked;
        return {
          ...r,
          hasLiked: willLike,
          likesCount: willLike ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
        };
      })
    );
  };

  const handleToggleFollow = (authorId: string) => {
    setFollowingMap({
      ...followingMap,
      [authorId]: !followingMap[authorId],
    });
  };

  const handleShareReel = async (reelId: string) => {
    try {
      const url = `${window.location.origin}/reels/${reelId}`;
      await navigator.clipboard.writeText(url);
      setShareToast("Reel link copied to clipboard!");
      setTimeout(() => setShareToast(null), 2500);
      setReels((prev) =>
        prev.map((r) => (r.id === reelId ? { ...r, sharesCount: r.sharesCount + 1 } : r))
      );
    } catch {
      setShareToast("Reel link copied!");
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentReel) return;

    const newComment = {
      id: `rc-${Date.now()}`,
      author: socialProfile?.displayName || "You",
      text: newCommentText.trim(),
      time: "Just now",
    };

    setReels(
      reels.map((r) =>
        r.id === currentReel.id
          ? {
              ...r,
              commentsCount: r.commentsCount + 1,
              commentsList: [newComment, ...(r.commentsList || [])],
            }
          : r
      )
    );
    setNewCommentText("");
  };

  const handleUploadReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadVideoUrl.trim() || !uploadCaption.trim()) return;

    const newReel: SocialReel & { commentsList: Array<{ id: string; author: string; text: string; time: string }> } = {
      id: `reel-${Date.now()}`,
      authorId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
      author: socialProfile || undefined,
      videoUrl: uploadVideoUrl,
      thumbnailUrl: uploadVideoUrl,
      caption: uploadCaption,
      audioTrack: uploadAudioTitle.trim() || `${socialProfile?.displayName || "Original"} • Original Sound`,
      hashtags: ["creative", "socializing"],
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      hasLiked: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      commentsList: [],
    };

    setReels([newReel, ...reels]);
    setUploadVideoUrl("");
    setUploadCaption("");
    setUploadAudioTitle("");
    setIsUploadModalOpen(false);
    setActiveReelIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-slate-100">Reels & Short Videos</h2>
          </div>
          <p className="text-xs text-slate-400">
            Immersive vertical videos showcasing crafts, travels, city adventures, and creative arts.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Reel</span>
        </button>
      </div>

      {/* Main Reels Container */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
          {/* Simulated Video Player with Poster / Video */}
          <div className="absolute inset-0 z-0">
            {currentReel?.videoUrl.endsWith(".mp4") ? (
              <video
                src={currentReel.videoUrl}
                poster={currentReel.thumbnailUrl || undefined}
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              />
            ) : (
              <img
                src={currentReel?.thumbnailUrl || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80"}
                alt="Reel poster"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90 pointer-events-none" />
          </div>

          {/* Top Video Status & Controls */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
              Reel {activeReelIndex + 1} of {reels.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Floating Actions Sidebar */}
          <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
            {/* Like */}
            <button
              onClick={() => handleToggleLike(currentReel.id)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                  currentReel.hasLiked
                    ? "bg-rose-600/80 border-rose-500 text-white scale-110"
                    : "bg-black/40 border-white/15 text-white hover:bg-black/60"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${currentReel.hasLiked ? "fill-white" : ""}`}
                />
              </div>
              <span className="text-[11px] font-bold drop-shadow">
                {currentReel.likesCount}
              </span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md transition-all">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-bold drop-shadow">
                {currentReel.commentsCount}
              </span>
            </button>

            {/* Share */}
            <button
              onClick={() => currentReel && handleShareReel(currentReel.id)}
              className="flex flex-col items-center gap-1 group"
              title="Share reel"
            >
              <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md transition-all">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-bold drop-shadow">
                {currentReel.sharesCount}
              </span>
            </button>
          </div>

          {/* Floating Share Toast Notification */}
          {shareToast && (
            <div className="absolute top-4 left-4 right-4 z-50 bg-slate-900/95 border border-violet-500/50 text-white text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{shareToast}</span>
            </div>
          )}

          {/* Bottom Reel Caption & Creator Info */}
          <div className="relative z-10 p-4 space-y-2.5">
            {/* Creator Row */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-violet-600/40 border border-violet-400 flex items-center justify-center font-bold text-white text-xs">
                {currentReel.author?.displayName?.[0] || "U"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white drop-shadow">
                  {currentReel.author?.displayName}
                </span>
                <button
                  onClick={() => handleToggleFollow(currentReel.authorId)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 transition-all ${
                    followingMap[currentReel.authorId]
                      ? "bg-slate-800/80 border-slate-700 text-slate-300"
                      : "bg-violet-600 border-violet-500 text-white"
                  }`}
                >
                  {followingMap[currentReel.authorId] ? (
                    <>
                      <UserCheck className="w-3 h-3" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" /> Follow
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Caption */}
            <p className="text-xs text-white/95 leading-relaxed drop-shadow line-clamp-3">
              {currentReel.caption}
            </p>

            {/* Audio attribution */}
            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
              <Music className="w-3 h-3 text-violet-400 shrink-0" />
              <span className="truncate">{currentReel.audioTrack}</span>
            </div>

            {/* Reel Navigation Switcher */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={activeReelIndex === 0}
                onClick={() => setActiveReelIndex(activeReelIndex - 1)}
                className="text-[11px] font-semibold text-white/80 hover:text-white disabled:opacity-30"
              >
                ↑ Previous Reel
              </button>
              <button
                disabled={activeReelIndex === reels.length - 1}
                onClick={() => setActiveReelIndex(activeReelIndex + 1)}
                className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 disabled:opacity-30"
              >
                ↓ Next Reel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMMENTS SLIDE-UP DRAWER */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Comments ({currentReel?.commentsCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {currentReel?.commentsList && currentReel.commentsList.length > 0 ? (
                currentReel.commentsList.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{c.author}</span>
                      <span className="text-[10px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  No comments yet. Be the first to join the conversation!
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a comment to this reel..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD REEL MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-100">Upload Short Reel</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadReel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Video URL (.mp4 or stream link) *
                </label>
                <input
                  type="url"
                  required
                  value={uploadVideoUrl}
                  onChange={(e) => setUploadVideoUrl(e.target.value)}
                  placeholder="https://assets.mixkit.co/videos/preview/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Caption & Hashtags *
                </label>
                <textarea
                  required
                  rows={3}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Tell people what your reel is about #interests #creative..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Audio / Sound Track Name
                </label>
                <input
                  type="text"
                  value={uploadAudioTitle}
                  onChange={(e) => setUploadAudioTitle(e.target.value)}
                  placeholder="e.g. Acoustic Chill Morning • Original Sound"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadVideoUrl.trim() || !uploadCaption.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-900/30"
                >
                  Publish Reel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
