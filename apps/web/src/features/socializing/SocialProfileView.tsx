import React, { useState, useRef, useEffect } from "react";
import { SocialProfile } from "@platform/shared-types";
import { useWorld } from "../../contexts/WorldContext";
import { useAuth } from "../../contexts/AuthContext";
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
  Lock,
  Eye,
  EyeOff,
  QrCode,
  Briefcase,
  Bell,
  LogOut,
  Check,
  Upload,
  Shield,
  Copy,
  Sparkles,
  RotateCw,
  Rocket,
  IndianRupee,
  BookOpen,
  Moon,
  ShieldCheck,
  Globe,
  Database,
} from "lucide-react";
import { getBuilderCardByUsername } from "./socialAccountsData";
import { MonkModeModal } from "./MonkModeModal";
import { TrustFingerprintModal } from "./TrustFingerprintModal";
import { UniversalPortalModal } from "./UniversalPortalModal";
import { DataExportModal } from "./DataExportModal";

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
  const { socialProfile, switchWorld } = useWorld();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<SocialProfile | null>(
    propProfile || socialProfile || null
  );

  const [activeTab, setActiveTab] = useState<"posts" | "showcase" | "chapters" | "saved" | "tagged">("posts");
  const [isFlippedToBuilder, setIsFlippedToBuilder] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const builderCard = getBuilderCardByUsername(profile?.username || "aarav_social");

  // Settings & Modals State (Instagram-style Settings Action Sheet matching Pic 3)
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLikedModalOpen, setIsLikedModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMonkModalOpen, setIsMonkModalOpen] = useState(false);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isDataExportModalOpen, setIsDataExportModalOpen] = useState(false);
  const [isMonkModeActive, setIsMonkModeActive] = useState<boolean>(() => {
    return localStorage.getItem("balaga_monk_mode") === "true";
  });

  const handleToggleMonkMode = (durationMinutes: number) => {
    if (durationMinutes > 0) {
      setIsMonkModeActive(true);
      localStorage.setItem("balaga_monk_mode", "true");
    } else {
      setIsMonkModeActive(false);
      localStorage.removeItem("balaga_monk_mode");
    }
  };

  // Privacy State: Private vs Public
  const [isPrivateAccount, setIsPrivateAccount] = useState<boolean>(() => {
    return localStorage.getItem("balaga_is_private") === "true";
  });
  const [viewAsVisitor, setViewAsVisitor] = useState(false);

  // Professional Account Settings (accounts/professional_account_settings)
  const [isProfessionalAccount, setIsProfessionalAccount] = useState<boolean>(() => {
    return localStorage.getItem("balaga_is_pro") === "true";
  });
  const [professionalCategory, setProfessionalCategory] = useState<string>(() => {
    return localStorage.getItem("balaga_pro_cat") || "Creator";
  });
  const [showCategoryLabel, setShowCategoryLabel] = useState<boolean>(() => {
    return localStorage.getItem("balaga_show_cat") !== "false";
  });
  const [proEmail, setProEmail] = useState("aarav.social@balaga.online");

  // 1. Note State & Modal (Instagram Note Feature)
  const [activeNote, setActiveNote] = useState<string | null>("Filter coffee & sketches ☕");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(activeNote || "");

  // 2. Profile Photo Modal & Local File Upload Ref
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

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

  // 5. Creator Showcase Items (Curated personal portfolio of art, photo, design, essays)
  const [showcaseItems] = useState([
    {
      id: "sc-1",
      title: "Cubbon Botanical Flora",
      category: "Watercolor & Gouache",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&q=80",
      description: "Field studies of bamboo shoots and teak bark under natural morning light on 300gsm cold press paper.",
      tools: ["Cold Press Arches 300gsm", "Daniel Smith Watercolors", "Escoda Sable"],
      year: "2026",
      appreciationsCount: 142,
    },
    {
      id: "sc-2",
      title: "Monsoon Reflections over Bangalore",
      category: "35mm Analog Photography",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80",
      description: "Street reflections, wet asphalt, and amber headlights around Brigade Road after a sudden evening downpour.",
      tools: ["Leica M6", "Voigtlander 35mm f/1.4", "Kodak Portra 400"],
      year: "2026",
      appreciationsCount: 289,
    },
    {
      id: "sc-3",
      title: "Balaga Design Tokens & Spatial UI",
      category: "Digital Product Architecture",
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1000&q=80",
      description: "A dark-mode first, tactile design language engineered for high-density multi-world interaction and low cognitive load.",
      tools: ["Figma", "Tailwind CSS", "CSS 3D Transforms"],
      year: "2026",
      appreciationsCount: 318,
    },
  ]);

  // 6. Actionable Living Collections (Saved inspiration connected to real-world actions)
  const [livingCollections] = useState([
    {
      id: "col-1",
      title: "Quiet Bangalore Cafes & Green Corners",
      itemsCount: 3,
      coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      actionType: "radar",
      actionLabel: "Launch Radar Beacon ⚡",
    },
    {
      id: "col-2",
      title: "Design Tokens & Motion Studies",
      itemsCount: 4,
      coverUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
      actionType: "checklist",
      actionLabel: "Review Checklist 📋",
    },
    {
      id: "col-3",
      title: "Literature & Regional Essay Vault",
      itemsCount: 2,
      coverUrl: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80",
      actionType: "circle",
      actionLabel: "Open Reading Circle ☕",
    },
  ]);

  // 7. Life Chapters & Memory Vault (S14)
  const [lifeChapters, setLifeChapters] = useState([
    {
      id: "ch-3",
      title: "Chapter 3: Indiranagar Studio & Building Balaga",
      era: "2025 – Present",
      location: "Bengaluru, India",
      summary: "Setting up a hardware & design workspace with friends, prototyping tactile multi-realm software, and dawn cycling loops to Nandi.",
      isCapsuleLocked: false,
      capsuleStatusText: "Active Chapter • Open Memory Stream",
      contributors: [
        { name: "Priya Rao", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
        { name: "Kabir Mehta", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
      ],
      milestones: [
        {
          id: "m-31",
          photoUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
          title: "First Studio Workbench Setup",
          date: "Jan 2026",
          note: "Soldered the telemetry receivers and framed the first Balaga paper sketches on the brick wall.",
        },
        {
          id: "m-32",
          photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
          title: "100km Century Ride with Deccan Squad",
          date: "Mar 2026",
          note: "Reached Nandi summit before sunrise. Cold wind, hot chai, and zero flats.",
        },
      ],
    },
    {
      id: "ch-2",
      title: "Chapter 2: Western Ghats Coffee Trails & Film Notes",
      era: "2023 – 2024",
      location: "Madikeri, Coorg",
      summary: "One year away from screens in coffee estates, learning 35mm film photography and natural water-coloring in monsoons.",
      isCapsuleLocked: true,
      capsuleStatusText: "Time Capsule Locked • Unlocks Dec 31, 2026",
      contributors: [
        { name: "Ananya Iyer", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" },
      ],
      milestones: [
        {
          id: "m-21",
          photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
          title: "Monsoon Mist over Plantation Ridge",
          date: "July 2024",
          note: "Continuous rain for 14 days straight. Watercolors took 6 hours to dry.",
        },
      ],
    },
    {
      id: "ch-1",
      title: "Chapter 1: College Fine Arts & Systems Engineering",
      era: "2019 – 2023",
      location: "Mysuru & Bengaluru",
      summary: "Dual life of distributed computing coursework by night and life drawing sketchbooks by day in Chamundi foothills.",
      isCapsuleLocked: false,
      capsuleStatusText: "Graduation Capsule Opened • 48 Shared Memories",
      contributors: [
        { name: "Rohit Deshmukh", avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&q=80" },
      ],
      milestones: [
        {
          id: "m-11",
          photoUrl: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80",
          title: "Final Year Degree Project & Exhibition",
          date: "May 2023",
          note: "Presented the thesis on spatial interfaces for collaborative creator guilds.",
        },
      ],
    },
  ]);

  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterEra, setNewChapterEra] = useState("");
  const [newChapterLocation, setNewChapterLocation] = useState("");
  const [newChapterSummary, setNewChapterSummary] = useState("");

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;

    const newCh = {
      id: `ch-${Date.now()}`,
      title: newChapterTitle.trim(),
      era: newChapterEra.trim() || "2026",
      location: newChapterLocation.trim() || "Bengaluru",
      summary: newChapterSummary.trim() || "A new personal chapter on Balaga.",
      isCapsuleLocked: false,
      capsuleStatusText: "Active Chapter • Just Opened",
      contributors: [],
      milestones: [
        {
          id: `m-${Date.now()}`,
          photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
          title: "Chapter Initiated",
          date: "Today",
          note: newChapterSummary.trim() || "Chapter started.",
        },
      ],
    };

    setLifeChapters([newCh, ...lifeChapters]);
    setNewChapterTitle("");
    setNewChapterEra("");
    setNewChapterLocation("");
    setNewChapterSummary("");
    setIsAddChapterModalOpen(false);
  };

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

  // Load saved avatar and listen for new posts
  useEffect(() => {
    const savedAvatar = localStorage.getItem("balaga_social_avatar");
    if (savedAvatar) {
      setProfile((prev) => (prev ? { ...prev, avatarUrl: savedAvatar } : prev));
    }

    try {
      const storedPosts = JSON.parse(localStorage.getItem("balaga_user_posts") || "[]");
      if (storedPosts.length > 0) {
        setUserPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = storedPosts
            .filter((sp: any) => !existingIds.has(sp.id))
            .map((sp: any) => ({
              id: sp.id,
              imageUrl: sp.mediaUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
              caption: sp.content,
              likesCount: sp.likesCount || 0,
              commentsCount: sp.commentsCount || 0,
            }));
          return [...newItems, ...prev];
        });
      }
    } catch {}

    const onPostCreated = (e: any) => {
      if (e.detail) {
        const p = e.detail;
        setUserPosts((prev) => [
          {
            id: p.id,
            imageUrl: p.mediaUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
            caption: p.content,
            likesCount: 0,
            commentsCount: 0,
          },
          ...prev,
        ]);
      }
    };
    window.addEventListener("balaga:new-post", onPostCreated);
    return () => window.removeEventListener("balaga:new-post", onPostCreated);
  }, []);

  // Handle Update Profile Photo
  const handleSavePhoto = (newUrl: string) => {
    if (!profile) return;
    const updated = { ...profile, avatarUrl: newUrl };
    setProfile(updated);
    try {
      localStorage.setItem("balaga_social_avatar", newUrl);
    } catch {}
    setIsPhotoModalOpen(false);
    setPhotoUrlInput("");
  };

  // Handle Local Photo Upload from folder/device
  const handleLocalAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleSavePhoto(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Professional Account Settings
  const handleSaveProfessionalSettings = () => {
    try {
      localStorage.setItem("balaga_is_pro", isProfessionalAccount ? "true" : "false");
      localStorage.setItem("balaga_pro_cat", professionalCategory);
      localStorage.setItem("balaga_show_cat", showCategoryLabel ? "true" : "false");
    } catch {}
    setIsProfessionalModalOpen(false);
  };

  // Handle Save Account Privacy
  const handleSavePrivacySettings = () => {
    try {
      localStorage.setItem("balaga_is_private", isPrivateAccount ? "true" : "false");
    } catch {}
    setIsPrivacyModalOpen(false);
  };

  // Sample Liked Posts and Reels list
  const likedPostsList = [
    {
      id: "lp-1",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      caption: "Sunrise misty coffee session in Coorg 🌲☕",
      likesCount: 342,
      commentsCount: 28,
    },
    {
      id: "lp-2",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      caption: "Live acrylic art exhibition in Bangalore 🎨",
      likesCount: 521,
      commentsCount: 45,
    },
    {
      id: "lp-3",
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      caption: "Cycling rollout to Nandi foothills 🚴",
      likesCount: 189,
      commentsCount: 16,
    },
    {
      id: "lp-4",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
      caption: "Filter coffee brewing masterclass notes ☕",
      likesCount: 420,
      commentsCount: 34,
    },
  ];

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
              <button
                type="button"
                onClick={() => setIsTrustModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                title="View Balaga Trust Fingerprint (Unpurchasable Peer Trust)"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>98% Trust</span>
              </button>
              {isPrivateAccount && (
                <span title="Private Account" className="inline-flex items-center text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-full text-[11px] gap-1 border border-slate-700/80">
                  <Lock className="w-3 h-3 text-slate-300" />
                  <span>Private</span>
                </span>
              )}
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
                  type="button"
                  onClick={() => setIsFlippedToBuilder(!isFlippedToBuilder)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    isFlippedToBuilder
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                  title="3D Card Flip to Founders Builder identity"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlippedToBuilder ? "Personal" : "3D Flip 🔄"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMonkModalOpen(true)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    isMonkModeActive
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                  title="Monk Mode / Deep-Work Cloak"
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isMonkModeActive ? "Monk 🧘" : "Monk Mode"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPortalModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  title="Universal Balaga Portal (IRL QR & Public Hub)"
                >
                  <Globe className="w-3.5 h-3.5 text-violet-400" />
                  <span>Portal 🌐</span>
                </button>
                <button
                  onClick={() => setIsSettingsMenuOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {isPrivateAccount && (
                  <button
                    type="button"
                    onClick={() => setViewAsVisitor(!viewAsVisitor)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      viewAsVisitor
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                    title="Toggle preview of what visitors see"
                  >
                    {viewAsVisitor ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{viewAsVisitor ? "Exit Preview" : "Visitor View"}</span>
                  </button>
                )}
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
                {builderCard.isPublicBuilder && (
                  <button
                    type="button"
                    onClick={() => setIsFlippedToBuilder(!isFlippedToBuilder)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                      isFlippedToBuilder
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                    }`}
                    title="3D Card Flip to Founders Builder identity"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlippedToBuilder ? "Personal" : "3D Flip 🔄"}</span>
                  </button>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Profile Options"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute right-0 top-9 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-30 text-xs space-y-0.5 animate-in fade-in duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setIsMoreMenuOpen(false);
                          setToastMsg("Profile URL copied to clipboard!");
                          setTimeout(() => setToastMsg(null), 2500);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                      >
                        Copy Profile URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          setToastMsg(`Muted stories and posts from @${profile?.username || "user"}`);
                          setTimeout(() => setToastMsg(null), 2500);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300"
                      >
                        Mute User
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          setToastMsg("Report submitted to moderation team.");
                          setTimeout(() => setToastMsg(null), 2500);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-amber-400"
                      >
                        Report Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          setToastMsg(`Blocked @${profile?.username || "user"}.`);
                          setTimeout(() => setToastMsg(null), 2500);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-rose-400 font-semibold"
                      >
                        Block User
                      </button>
                    </div>
                  )}
                </div>
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

          {/* Row 3: Display Name, Pronouns, Category & Bio */}
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-semibold text-slate-100">{profile.displayName}</span>
              {profile.pronouns && (
                <span className="text-slate-400 text-xs">({profile.pronouns})</span>
              )}
            </div>

            {/* Professional Category Label */}
            {isProfessionalAccount && showCategoryLabel && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-violet-400 bg-violet-950/40 border border-violet-800/40 px-2 py-0.5 rounded-md inline-block">
                  {professionalCategory}
                </span>
              </div>
            )}

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

      {/* 3D BUILDER CARD PREVIEW (FLIPPED STATE) */}
      {isFlippedToBuilder && (
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  Verified Builder Identity
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  {builderCard.stage}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {profile.displayName}
                <span className="text-amber-400 text-sm font-normal">(@{profile.username})</span>
              </h2>
              <p className="text-sm font-medium text-amber-200/90">
                {builderCard.headline}
              </p>
            </div>

            <button
              onClick={() => setIsFlippedToBuilder(false)}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 self-start"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip Back to Personal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-800">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">Tech Stack & Tools</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {builderCard.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs bg-slate-800 text-amber-200/90 px-2.5 py-1 rounded-md border border-amber-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">Superpowers</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {builderCard.superpowers.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {builderCard.lookingFor && (
            <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-amber-300">Looking for: </span>
              {builderCard.lookingFor}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>🔒 Firewall: Separated from personal social feeds</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href={`upi://pay?pa=aarav.social@okhdfcbank&pn=BalagaBuilder&cu=INR&tn=Appreciating Builder ${encodeURIComponent(profile.displayName)}`}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>UPI Shabaash</span>
              </a>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5"
                onClick={() => switchWorld("founders")}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Open in Founders Realm</span>
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* 3. TABS OR PRIVATE ACCOUNT SHIELD */}
      {isPrivateAccount && (viewAsVisitor || !isSelf) ? (
        <div className="border-t border-slate-800 pt-16 pb-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-300">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-100">This account is private</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Follow this account to see their photos and videos.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* TABS (POSTS, SHOWCASE, SAVED / COLLECTIONS, TAGGED) */}
          <div className="border-t border-slate-800">
            <div className="flex items-center justify-center gap-6 sm:gap-14 text-xs font-semibold uppercase tracking-wider">
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
                onClick={() => setActiveTab("showcase")}
                className={`py-3.5 flex items-center gap-1.5 transition-colors border-t-2 -mt-[2px] ${
                  activeTab === "showcase"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Showcase ✨</span>
              </button>
              <button
                onClick={() => setActiveTab("chapters")}
                className={`py-3.5 flex items-center gap-1.5 transition-colors border-t-2 -mt-[2px] ${
                  activeTab === "chapters"
                    ? "border-emerald-400 text-emerald-300"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Chapters 📖</span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`py-3.5 flex items-center gap-1.5 transition-colors border-t-2 -mt-[2px] ${
                  activeTab === "saved"
                    ? "border-violet-400 text-violet-300"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Collections 📌</span>
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

          {/* CREATOR SHOWCASE (S10) */}
          {activeTab === "showcase" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-violet-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      Creator Showcase
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                        MUSEUM-GRADE
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Curated original works, field studies, and creative craft without commercialization or algorithm penalties.
                    </p>
                  </div>
                </div>
                {isSelf && (
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0"
                    onClick={() => alert("Feature: Add piece to your Showcase is ready for your uploads!")}
                  >
                    + Add New Piece
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {showcaseItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl overflow-hidden shadow-lg transition-all flex flex-col group"
                  >
                    <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{item.category}</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {item.year}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Mediums & Tools */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                          Medium & Tools:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.tools.map((tool) => (
                            <span
                              key={tool}
                              className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
                          <span>{item.appreciationsCount} appreciations</span>
                        </span>

                        <a
                          href={`upi://pay?pa=aarav.social@okhdfcbank&pn=BalagaCreator&cu=INR&tn=Appreciating ${encodeURIComponent(item.title)} on Balaga Showcase`}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          title="Send direct Shabaash tip (0% fee)"
                        >
                          <IndianRupee className="w-3 h-3 text-amber-400" />
                          <span>Shabaash ⚡</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIFE CHAPTERS & MEMORY VAULT (S14) */}
          {activeTab === "chapters" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      Life Chapters & Memory Vault
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                        MILESTONES
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Meaningful life milestones, time capsules, and collaborative memories across your life eras.
                    </p>
                  </div>
                </div>
                {isSelf && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0"
                    onClick={() => setIsAddChapterModalOpen(true)}
                  >
                    + Add Life Chapter
                  </Button>
                )}
              </div>

              {/* Chapters Timeline List */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
                {lifeChapters.map((chapter) => (
                  <div key={chapter.id} className="relative pl-12 space-y-3">
                    {/* Timeline bullet */}
                    <div className="absolute left-3.5 -translate-x-1/2 top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-400 shadow-md flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all">
                      {/* Chapter Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-base font-bold text-white">
                              {chapter.title}
                            </h4>
                            <span className="text-xs font-mono bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                              {chapter.era}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              {chapter.location}
                            </span>
                          </div>
                        </div>

                        {/* Capsule Status Pill */}
                        <div
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 self-start ${
                            chapter.isCapsuleLocked
                              ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{chapter.capsuleStatusText}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {chapter.summary}
                      </p>

                      {/* Milestones in this chapter */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          Milestone Moments:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {chapter.milestones.map((m) => (
                            <div
                              key={m.id}
                              className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden p-3 flex gap-3 group"
                            >
                              <img
                                src={m.photoUrl}
                                alt={m.title}
                                className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
                              />
                              <div className="flex flex-col justify-between text-xs min-w-0">
                                <div>
                                  <h5 className="font-semibold text-white truncate">
                                    {m.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                                    {m.note}
                                  </p>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  {m.date}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shared Contributors */}
                      {chapter.contributors && chapter.contributors.length > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/60">
                          <span className="flex items-center gap-2">
                            <span>Collaborative Memory Contributors:</span>
                            <div className="flex -space-x-1.5">
                              {chapter.contributors.map((c, i) => (
                                <img
                                  key={i}
                                  src={c.avatarUrl}
                                  alt={c.name}
                                  title={c.name}
                                  className="w-5 h-5 rounded-full border border-slate-900 object-cover"
                                />
                              ))}
                            </div>
                          </span>

                          <button
                            onClick={() =>
                              alert(
                                `Shared vault for ${chapter.title} is synced across all tagged contributors.`
                              )
                            }
                            className="text-emerald-400 hover:underline"
                          >
                            View Shared Vault
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONABLE LIVING COLLECTIONS (S12) */}
          {activeTab === "saved" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/40">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      Actionable Living Collections
                      <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded font-mono">
                        ACTIONABLE
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Curations connected to live action triggers — turn passive bookmarks into meetups, checklists, and circles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Collections Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {livingCollections.map((col) => (
                  <div
                    key={col.id}
                    className="bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-xl overflow-hidden p-3.5 space-y-3 transition-all group"
                  >
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-slate-950">
                      <img
                        src={col.coverUrl}
                        alt={col.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {col.itemsCount} items
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-violet-300">
                        {col.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Living Board • Updated this week
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Triggering collection action: ${col.actionLabel}`)}
                      className="w-full py-1.5 px-3 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{col.actionLabel}</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  All Saved Posts
                </h4>
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
              </div>
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
        </>
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

      {/* MODAL 2: CHANGE PROFILE PHOTO MODAL (Local folder/photos upload) */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100">Change Profile Photo</h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden file input for local folder/photos */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLocalAvatarUpload}
            />

            {/* Upload from Local Device / Photos Button */}
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-violet-900/30 transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload photo from computer / photos</span>
            </button>

            {/* Remove Current Photo */}
            {profile.avatarUrl && (
              <button
                type="button"
                onClick={() => handleSavePhoto("")}
                className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-2xl border border-rose-500/30 transition-colors"
              >
                Remove Current Photo
              </button>
            )}

            <div className="pt-2 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">
                Or pick from sample avatars:
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
              <div className="space-y-2 pt-3">
                <label className="text-[11px] font-semibold text-slate-400 block">Or Image URL</label>
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
                  Save URL Photo
                </Button>
              </div>
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

      {/* MODAL 6: SETTINGS ACTION SHEET MODAL (MATCHING PIC 3) */}
      {isSettingsMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl divide-y divide-slate-800/80 text-center">
            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                setIsProfessionalModalOpen(true);
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-violet-400" />
              <span>Professional account</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                setIsPrivacyModalOpen(true);
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Settings and privacy</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                setIsLikedModalOpen(true);
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Liked posts & reels</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                setActiveTab("saved");
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Saved</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                setIsQrModalOpen(true);
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>QR code</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                onNavigateTab?.("notifications");
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4 text-yellow-400" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                setIsDataExportModalOpen(true);
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-teal-300 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4 text-teal-400" />
              <span>Self-sovereign data export</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsMenuOpen(false);
                logout();
              }}
              className="w-full py-3.5 px-4 text-xs font-semibold text-rose-400 hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out</span>
            </button>

            <button
              onClick={() => setIsSettingsMenuOpen(false)}
              className="w-full py-3.5 px-4 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL 7: PROFESSIONAL ACCOUNT SETTINGS (accounts/professional_account_settings) */}
      {isProfessionalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-400" />
                <h2 className="text-sm font-bold text-slate-100">Professional account settings</h2>
              </div>
              <button
                onClick={() => setIsProfessionalModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Type */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfessionalAccount(true)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isProfessionalAccount
                      ? "border-violet-500 bg-violet-950/30 text-white"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Creator / Pro</span>
                    {isProfessionalAccount && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    For public figures, content producers, artists, and founders.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsProfessionalAccount(false)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    !isProfessionalAccount
                      ? "border-violet-500 bg-violet-950/30 text-white"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Personal</span>
                    {!isProfessionalAccount && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard personal social profile for friends and family.
                  </p>
                </button>
              </div>
            </div>

            {/* Category Selector */}
            {isProfessionalAccount && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Category
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Choose a category that best describes your profile:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      "Creator",
                      "Entrepreneur",
                      "Software Engineer",
                      "Digital Creator",
                      "Artist & Designer",
                      "Photographer",
                      "Writer / Journalist",
                      "Health & Fitness",
                      "Community Builder",
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProfessionalCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          professionalCategory === cat
                            ? "bg-violet-600 text-white border-violet-500"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Category on Profile Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-slate-200 block">
                      Display category label on profile
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Shows &quot;{professionalCategory}&quot; badge on your profile
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCategoryLabel(!showCategoryLabel)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                      showCategoryLabel ? "bg-violet-600" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        showCategoryLabel ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Public Business Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    value={proEmail}
                    onChange={(e) => setProEmail(e.target.value)}
                    placeholder="contact@balaga.online"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsProfessionalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveProfessionalSettings}
                className="bg-violet-600 hover:bg-violet-500 font-bold"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ACCOUNT PRIVACY (SETTINGS AND PRIVACY) */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-100">Account Privacy</h2>
              </div>
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-100">Private account</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When your account is private, only people you approve can see your photos and reels. Your account name, username, and bio remain visible to others.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivateAccount(!isPrivateAccount)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                  isPrivateAccount ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isPrivateAccount ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePrivacySettings}
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold"
              >
                Save Privacy Preference
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: LIKED POSTS & REELS */}
      {isLikedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                <h2 className="text-sm font-bold text-slate-100">Liked posts & reels</h2>
              </div>
              <button
                onClick={() => setIsLikedModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                {likedPostsList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsLikedModalOpen(false);
                      setSelectedPost(item);
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-slate-800"
                  >
                    <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span>{item.likesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: QR CODE */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile QR Code</span>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Card with gradient */}
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-600 to-amber-500 flex flex-col items-center justify-center shadow-xl">
              <div className="p-4 bg-white rounded-2xl shadow-2xl">
                <QrCode className="w-36 h-36 text-slate-950" />
              </div>
              <span className="text-white font-bold text-sm mt-3 tracking-wide drop-shadow">
                @{profile.username}
              </span>
              <span className="text-white/80 text-[11px] drop-shadow">Balaga Socializing</span>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(`https://balaga.online/@${profile.username}`);
                  alert("Profile link copied to clipboard!");
                }}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Profile Link</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD LIFE CHAPTER (S14) */}
      {isAddChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Add New Life Chapter
              </h3>
              <button
                onClick={() => setIsAddChapterModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: European Art Residency"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Era / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 – 2027"
                    value={newChapterEra}
                    onChange={(e) => setNewChapterEra(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Florence & Berlin"
                    value={newChapterLocation}
                    onChange={(e) => setNewChapterLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chapter Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="What defined this era of your life?"
                  value={newChapterSummary}
                  onChange={(e) => setNewChapterSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddChapterModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  Save Life Chapter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MONK MODE / DEEP-WORK CLOAK (S22) */}
      <MonkModeModal
        isOpen={isMonkModalOpen}
        onClose={() => setIsMonkModalOpen(false)}
        isMonkModeActive={isMonkModeActive}
        onToggleMonkMode={handleToggleMonkMode}
      />

      {/* BALAGA TRUST FINGERPRINT (S18) */}
      <TrustFingerprintModal
        isOpen={isTrustModalOpen}
        onClose={() => setIsTrustModalOpen(false)}
        username={profile.username}
        displayName={profile.displayName}
      />

      {/* UNIVERSAL BALAGA PORTAL (S20) */}
      <UniversalPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        username={profile.username}
        name={profile.displayName}
        avatarUrl={profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"}
        bio={profile.bio || "Digital craftsman & builder on Balaga."}
        isBuilder={!!builderCard}
      />

      {/* SELF-SOVEREIGN DATA EXPORT (S26) */}
      <DataExportModal
        isOpen={isDataExportModalOpen}
        onClose={() => setIsDataExportModalOpen(false)}
        username={profile.username}
        displayName={profile.displayName}
      />

      {/* Floating Feedback Toast */}
      {toastMsg && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-slate-900 border border-violet-500/50 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
