import React, { useState, useRef } from "react";
import { useWorld } from "../../contexts/WorldContext";
import { X, Image, Film, Upload, MapPin, Music } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface CreateMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateMediaModal: React.FC<CreateMediaModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { socialProfile } = useWorld();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"post" | "reel">("post");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("Bengaluru, Karnataka");
  const [soundTitle, setSoundTitle] = useState("Original audio - " + (socialProfile?.username || "balaga"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileSelect = (file: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    if (isVideo) {
      setMode("reel");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleShare = () => {
    if (!mediaUrl && !caption.trim()) return;

    setIsSubmitting(true);

    const newPost = {
      id: `custom-post-${Date.now()}`,
      authorProfileId: socialProfile?.id || "me",
      authorDisplayName: socialProfile?.displayName || "Aarav Social",
      authorUsername: socialProfile?.username || "aarav_social",
      authorAvatarUrl: socialProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      content: caption.trim() || (mode === "post" ? "Sharing a special moment on Balaga ✨" : "New Reel rollout! 🎬"),
      mediaUrls: mediaUrl ? [mediaUrl] : ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80"],
      mediaType: mode === "reel" ? "video" : "image",
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      location: location.trim(),
      soundTitle: mode === "reel" ? soundTitle.trim() : undefined,
    };

    // 1. Save to local storage cache for persistence
    try {
      const existing = JSON.parse(localStorage.getItem("balaga_user_posts") || "[]");
      localStorage.setItem("balaga_user_posts", JSON.stringify([newPost, ...existing]));
    } catch {
      // Local storage fallback
    }

    // 2. Dispatch event for live components
    window.dispatchEvent(new CustomEvent("balaga:new-post", { detail: newPost }));

    setTimeout(() => {
      setIsSubmitting(false);
      onCreated?.();
      onClose();
      // Reset state
      setMediaUrl(null);
      setCaption("");
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("post")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === "post"
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Create Post</span>
            </button>
            <button
              onClick={() => setMode("reel")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === "reel"
                  ? "bg-pink-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Create Reel</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {mediaUrl && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleShare}
                disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg"
              >
                {isSubmitting ? "Sharing..." : "Share"}
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={mode === "post" ? "image/*" : "video/*,image/*"}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!mediaUrl ? (
            /* Upload Drop Area */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 transition-all ${
                dragOver
                  ? "border-violet-500 bg-violet-950/20"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-violet-400 shadow-inner">
                {mode === "post" ? (
                  <Image className="w-8 h-8 text-violet-400" />
                ) : (
                  <Film className="w-8 h-8 text-pink-400" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">
                  Drag {mode === "post" ? "photos" : "videos or photos"} here
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Upload from your computer or photos folder to share with friends on Balaga
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 mt-2 shadow-lg shadow-violet-900/30"
              >
                <Upload className="w-4 h-4" />
                <span>Select from computer / photos</span>
              </Button>

              {/* Sample presets for fast testing */}
              <div className="pt-6 border-t border-slate-800/80 w-full max-w-sm">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Or pick a sample:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(mode === "post"
                    ? [
                        { label: "Bengaluru Cafe", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80" },
                        { label: "Coorg Mist", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" },
                        { label: "Cubbon Park", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80" },
                      ]
                    : [
                        { label: "Sunset Walk", url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80" },
                        { label: "Night Ride", url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80" },
                        { label: "Architecture", url: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80" },
                      ]
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMediaUrl(preset.url)}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-slate-800 hover:border-violet-500 transition-all text-left"
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1">
                        <span className="text-[10px] text-white font-medium text-center line-clamp-1">{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Media Preview & Details Form */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left: Media Preview */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center group shadow-xl">
                {mediaUrl.startsWith("data:video") || mediaUrl.endsWith(".mp4") ? (
                  <video src={mediaUrl} controls autoPlay loop className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs transition-colors backdrop-blur-sm"
                  title="Replace media"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Author, Caption, Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                    {socialProfile?.avatarUrl ? (
                      <img src={socialProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-violet-300">
                        {socialProfile?.displayName?.[0] || "B"}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">
                      {socialProfile?.username || "aarav_social"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {mode === "post" ? "Public Post" : "Public Reel"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Caption & hashtags
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption... e.g. Weekend filter coffee vibes ☕ #Bengaluru #Balaga"
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    autoFocus
                  />
                  <div className="text-[10px] text-right text-slate-500">
                    {caption.length}/2200
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-violet-400" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (e.g. Indiranagar, Bengaluru)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {mode === "reel" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-pink-400" />
                      <span>Audio name</span>
                    </label>
                    <input
                      type="text"
                      value={soundTitle}
                      onChange={(e) => setSoundTitle(e.target.value)}
                      placeholder="e.g. Original Audio"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={handleShare}
                    disabled={isSubmitting}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-violet-900/30"
                  >
                    {isSubmitting ? "Sharing to Balaga..." : `Share ${mode === "post" ? "Post" : "Reel"}`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
