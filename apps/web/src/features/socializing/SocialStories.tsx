import React, { useState } from "react";
import { SocialStory } from "@platform/shared-types";
import { useWorld } from "../../contexts/WorldContext";
import {
  Sparkles,
  Plus,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  Globe,
  Users,
  AlertCircle,
  Layers,
  Camera,
} from "lucide-react";

export interface StoryAngle {
  id: string;
  contributorName: string;
  angleLabel: string;
  mediaUrl: string;
  caption: string;
}

export interface ExtendedStory extends SocialStory {
  isCoOpStack?: boolean;
  stackTitle?: string;
  eventLocation?: string;
  angles?: StoryAngle[];
}

export const SocialStories: React.FC = () => {
  const { socialProfile } = useWorld();

  // Active 24h stories state
  const [stories, setStories] = useState<ExtendedStory[]>([
    {
      id: "story-1",
      authorId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
      author: socialProfile || undefined,
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      mediaType: "image",
      caption: "Sunrise walk along the lake before work. Peaceful Bengaluru mornings! 🌅",
      audience: "everyone",
      expiresAt: new Date(Date.now() + 18 * 3600000).toISOString(),
      viewsCount: 14,
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: "story-2",
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
      mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      mediaType: "image",
      caption: "New watercolor wash on cold-press paper. Mixing ochre and burnt sienna 🎨",
      audience: "everyone",
      expiresAt: new Date(Date.now() + 14 * 3600000).toISOString(),
      viewsCount: 29,
      createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    {
      id: "story-3",
      authorId: "10000000-0000-0000-0000-000000000003",
      author: {
        id: "10000000-0000-0000-0000-000000000003",
        accountId: "00000000-0000-0000-0000-000000000003",
        username: "kabir_rides",
        displayName: "Kabir Menon",
        pronouns: "he/him",
        broadLocation: "Bengaluru, Karnataka",
        interests: ["Cycling", "Coffee"],
        hobbies: ["Biking"],
        languages: ["English", "Malayalam"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      mediaType: "image",
      caption: "60km century prep ride completed! Nandi Hills climb was brutal today 🚴‍♂️",
      audience: "connections",
      expiresAt: new Date(Date.now() + 22 * 3600000).toISOString(),
      viewsCount: 8,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "story-coop-1",
      authorId: "10000000-0000-0000-0000-000000000003",
      author: {
        id: "10000000-0000-0000-0000-000000000003",
        accountId: "00000000-0000-0000-0000-000000000003",
        username: "deccan_cyclists",
        displayName: "Deccan Squad (Co-Op)",
        pronouns: "they/them",
        broadLocation: "Bengaluru, Karnataka",
        interests: ["Cycling", "Outdoor"],
        hobbies: ["Endurance"],
        languages: ["English", "Kannada"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      mediaType: "image",
      caption: "Nandi Hills Sunrise Loop • Multi-Angle Co-Op Live Stack",
      audience: "everyone",
      expiresAt: new Date(Date.now() + 20 * 3600000).toISOString(),
      viewsCount: 64,
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      isCoOpStack: true,
      stackTitle: "Nandi Sunrise Century 🚴",
      eventLocation: "Nandi Foothills, Bengaluru",
      angles: [
        {
          id: "ang-1",
          contributorName: "Kabir Menon",
          angleLabel: "Handlebar Cam 🎥",
          mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
          caption: "Climbing hairpin 24. Heavy headwind but the morning light is insane! 🌄",
        },
        {
          id: "ang-2",
          contributorName: "Priya Rao",
          angleLabel: "Summit Viewpoint ⛰️",
          mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
          caption: "Waiting at Tipu's Drop for the peloton. Clouds are below us today! ☁️",
        },
        {
          id: "ang-3",
          contributorName: "Aarav Social",
          angleLabel: "Breakfast Stop ☕",
          mediaUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
          caption: "Hot thatte idli and filter coffee at foothills canteen. 60km done! 🥞",
        },
      ],
    },
  ]);

  // Modal States
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeAngleIndex, setActiveAngleIndex] = useState<number>(0);
  const [isContributeAngleOpen, setIsContributeAngleOpen] = useState(false);
  const [newAngleLabel, setNewAngleLabel] = useState("");
  const [newAngleMediaUrl, setNewAngleMediaUrl] = useState("");
  const [newAngleCaption, setNewAngleCaption] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewerListOpen, setIsViewerListOpen] = useState(false);
  const [storyReply, setStoryReply] = useState("");
  const [replySentSuccess, setReplySentSuccess] = useState(false);

  // New Story Form State
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newAudience, setNewAudience] = useState<"everyone" | "connections">("everyone");

  const currentViewingStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const activeAngle = currentViewingStory?.isCoOpStack && currentViewingStory.angles
    ? currentViewingStory.angles[activeAngleIndex] || currentViewingStory.angles[0]
    : null;
  const isAuthor = currentViewingStory && socialProfile && currentViewingStory.authorId === socialProfile.id;

  // Mock viewers for author-only view
  const mockViewers = [
    { name: "Priya Rao", username: "priya_art", time: "2h ago" },
    { name: "Kabir Menon", username: "kabir_rides", time: "3h ago" },
    { name: "Tanvi Shah", username: "tanvi_reads", time: "4h ago" },
    { name: "Rohan Das", username: "rohan_acoustic", time: "5h ago" },
  ];

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    setActiveAngleIndex(0);
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
    setStoryReply("");
    setReplySentSuccess(false);
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    setActiveAngleIndex(0);
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
    setStoryReply("");
    setReplySentSuccess(false);
  };

  const handleContributeAngle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAngleMediaUrl.trim() || !newAngleLabel.trim() || activeStoryIndex === null) return;

    const newAngle: StoryAngle = {
      id: `ang-${Date.now()}`,
      contributorName: socialProfile?.displayName || "You",
      angleLabel: newAngleLabel.trim(),
      mediaUrl: newAngleMediaUrl.trim(),
      caption: newAngleCaption.trim() || "Added a perspective to this Co-Op Stack! 📸",
    };

    setStories((prev) => {
      const copy = [...prev];
      const target = { ...copy[activeStoryIndex] };
      target.angles = [...(target.angles || []), newAngle];
      copy[activeStoryIndex] = target;
      return copy;
    });

    setIsContributeAngleOpen(false);
    setNewAngleLabel("");
    setNewAngleMediaUrl("");
    setNewAngleCaption("");
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;

    const created: SocialStory = {
      id: `story-${Date.now()}`,
      authorId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
      author: socialProfile || undefined,
      mediaUrl: newMediaUrl,
      mediaType: "image",
      caption: newCaption.trim() || undefined,
      audience: newAudience,
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
      viewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setStories([created, ...stories]);
    setNewMediaUrl("");
    setNewCaption("");
    setNewAudience("everyone");
    setIsCreateModalOpen(false);
  };

  const handleSendStoryReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyReply.trim() || !currentViewingStory) return;
    // Dispatches direct story reply to inbox
    setReplySentSuccess(true);
    setStoryReply("");
    setTimeout(() => setReplySentSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-slate-100">24-Hour Stories</h2>
          </div>
          <p className="text-xs text-slate-400">
            Share casual daily moments that automatically expire after 24 hours. No traces left behind.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Story</span>
        </button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Add Story Card */}
        <div
          onClick={() => setIsCreateModalOpen(true)}
          className="aspect-[9/16] rounded-2xl border-2 border-dashed border-violet-500/40 bg-slate-900/30 hover:bg-violet-950/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-4 group"
        >
          <div className="w-12 h-12 rounded-full bg-violet-600/20 group-hover:bg-violet-600/30 text-violet-400 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-200">Create Story</span>
          <span className="text-[10px] text-slate-500 text-center">Expires in 24 hours</span>
        </div>

        {/* Story Cards */}
        {stories.map((story, idx) => {
          const isMyStory = socialProfile && story.authorId === socialProfile.id;
          const timeLeftHours = Math.max(
            0,
            Math.round((new Date(story.expiresAt).getTime() - Date.now()) / 3600000)
          );

          return (
            <div
              key={story.id}
              onClick={() => setActiveStoryIndex(idx)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group shadow-md border border-slate-800 hover:border-violet-500/50 transition-all"
            >
              <img
                src={story.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {story.isCoOpStack && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-600/90 text-white text-[9px] font-bold shadow-md backdrop-blur-sm border border-violet-400/40">
                  <Layers className="w-2.5 h-2.5" />
                  <span>Co-Op ({story.angles?.length || 1})</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border-2 border-violet-500 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                      {story.author?.displayName?.[0] || "U"}
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow">
                      {isMyStory ? "You" : story.author?.displayName}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-300 bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-slate-700">
                    <Clock className="w-3 h-3 text-violet-400" />
                    {timeLeftHours}h
                  </span>
                </div>

                <div className="space-y-1">
                  {story.caption && (
                    <p className="text-[11px] text-slate-200 line-clamp-2 drop-shadow">
                      {story.caption}
                    </p>
                  )}
                  {isMyStory && (
                    <div className="flex items-center gap-1 text-[10px] text-violet-400 font-semibold">
                      <Eye className="w-3 h-3" />
                      <span>{story.viewsCount} views</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STORY VIEWER MODAL */}
      {currentViewingStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
            {/* Top Progress & Header */}
            <div className="absolute top-0 inset-x-0 p-4 z-10 bg-gradient-to-b from-slate-950/80 to-transparent space-y-3">
              {/* Progress bars */}
              <div className="flex items-center gap-1">
                {stories.map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-1 flex-1 rounded-full ${
                      i <= (activeStoryIndex || 0) ? "bg-violet-500" : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Author & Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500 flex items-center justify-center text-xs font-bold text-white">
                    {currentViewingStory.author?.displayName?.[0] || "U"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {currentViewingStory.author?.displayName}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(currentViewingStory.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAuthor && (
                    <button
                      onClick={() => setIsViewerListOpen(true)}
                      className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-violet-300 rounded-full text-[10px] font-semibold border border-slate-700 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{currentViewingStory.viewsCount} Viewers</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveStoryIndex(null)}
                    className="p-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* S11: Co-Op Story Stacks Multi-Angle Switcher */}
              {currentViewingStory.isCoOpStack && currentViewingStory.angles && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <div className="flex items-center gap-1.5 font-semibold text-violet-300">
                      <Layers className="w-3.5 h-3.5 text-violet-400" />
                      <span>{currentViewingStory.stackTitle || "Co-Op Multi-Angle Stack"}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{currentViewingStory.angles.length} Perspectives</span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                    {currentViewingStory.angles.map((ang, aIdx) => (
                      <button
                        key={ang.id}
                        onClick={() => setActiveAngleIndex(aIdx)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide shrink-0 transition-all ${
                          activeAngleIndex === aIdx
                            ? "bg-violet-600 text-white shadow ring-1 ring-violet-400"
                            : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                        }`}
                      >
                        {ang.angleLabel}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsContributeAngleOpen(true)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Angle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Story Media */}
            <img
              src={activeAngle ? activeAngle.mediaUrl : currentViewingStory.mediaUrl}
              alt="Story View"
              className="w-full h-full object-cover"
            />

            {/* Prev/Next Touch Buttons */}
            <button
              onClick={handlePrevStory}
              disabled={activeStoryIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/70 text-white disabled:opacity-0 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextStory}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/70 text-white transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Caption & Reply Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent space-y-2">
              {activeAngle ? (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-violet-300 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>Angle by {activeAngle.contributorName}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {activeAngle.caption}
                  </p>
                </div>
              ) : currentViewingStory.caption ? (
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentViewingStory.caption}
                </p>
              ) : null}

              {/* Reply Input (visible to non-author) */}
              {!isAuthor ? (
                <div>
                  {replySentSuccess ? (
                    <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/40 text-center text-xs font-semibold text-violet-300">
                      Story reply sent to inbox!
                    </div>
                  ) : (
                    <form onSubmit={handleSendStoryReply} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={storyReply}
                        onChange={(e) => setStoryReply(e.target.value)}
                        placeholder={`Reply to ${currentViewingStory.author?.displayName}...`}
                        className="flex-1 bg-slate-900/90 border border-slate-700 rounded-full px-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <button
                        type="submit"
                        disabled={!storyReply.trim()}
                        className="p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-full shadow-md transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="text-center text-[11px] text-slate-400 italic">
                  This story will automatically delete at{" "}
                  {new Date(currentViewingStory.expiresAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>

            {/* INLINE CONTRIBUTE ANGLE SHEET (S11) */}
            {isContributeAngleOpen && (
              <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-md p-5 flex flex-col justify-center animate-in fade-in">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Contribute an Angle to Stack</span>
                    </div>
                    <button
                      onClick={() => setIsContributeAngleOpen(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Add your perspective to this co-op story stack so viewers can switch to your angle!
                  </p>

                  <form onSubmit={handleContributeAngle} className="space-y-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                        Angle Title (e.g. Finish Line 🏁)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Finish Line 🏁"
                        value={newAngleLabel}
                        onChange={(e) => setNewAngleLabel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                        Photo / Media URL
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://..."
                        value={newAngleMediaUrl}
                        onChange={(e) => setNewAngleMediaUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                        Perspective Caption
                      </label>
                      <input
                        type="text"
                        placeholder="What happened from your angle?"
                        value={newAngleCaption}
                        onChange={(e) => setNewAngleCaption(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsContributeAngleOpen(false)}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                      >
                        Publish Angle
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTHOR-ONLY VIEWER LIST MODAL */}
      {isViewerListOpen && currentViewingStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Story Viewers ({currentViewingStory.viewsCount})
                </h3>
              </div>
              <button
                onClick={() => setIsViewerListOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Only you can see who viewed your story. Viewers list is protected by backend privacy authorization.
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {mockViewers.map((viewer, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-300 font-bold flex items-center justify-center text-xs">
                      {viewer.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{viewer.name}</div>
                      <div className="text-[10px] text-slate-500">@{viewer.username}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{viewer.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE STORY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-100">Publish 24-Hour Story</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Photo / Media URL *
                </label>
                <input
                  type="url"
                  required
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="What's happening right now?"
                  maxLength={160}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Audience Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAudience("everyone")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      newAudience === "everyone"
                        ? "bg-violet-600/20 border-violet-500 text-violet-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Everyone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAudience("connections")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      newAudience === "connections"
                        ? "bg-violet-600/20 border-violet-500 text-violet-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Friends Only</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 flex items-start gap-2 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  Stories strictly expire 24 hours after posting. Story files are auto-purged from storage.
                </span>
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
                  disabled={!newMediaUrl.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-900/30"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
