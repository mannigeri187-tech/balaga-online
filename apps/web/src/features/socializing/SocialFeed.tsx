import React, { useState, useEffect } from "react";
import { useWorld } from "../../contexts/WorldContext";
import { SocialPost, SocialComment } from "@platform/shared-types";
import { SocialProfileEditor } from "./SocialProfileEditor";
import { HeyMediaGrid } from "./HeyMediaGrid";
import { Button } from "../../components/ui/Button";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Image,
  Send,
  BarChart2,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Trash2,
  Eye,
  RotateCw,
  Rocket,
  IndianRupee,
  Handshake,
  Languages,
  ShieldAlert,
  Code,
  TrendingUp,
  Bot,
  Sparkles,
} from "lucide-react";
import { WORLDS } from "@platform/config";
import { FlashHangoutRadar } from "./FlashHangoutRadar";
import { GuardianSafeJourneyModal } from "./GuardianSafeJourneyModal";
import { MicroAppsContainerModal } from "./MicroAppsContainerModal";
import { PredictionStakesModal } from "./PredictionStakesModal";
import { AutonomousSocialTwinModal } from "./AutonomousSocialTwinModal";
import { translateWithBhasha } from "./bhashaEngine";
import { IntelligenceControlModal } from "../../components/IntelligenceControlModal";

import {
  SocialPublicProfileModal,
  PublicSocialAccount,
} from "./SocialPublicProfileModal";
import { getAccountByUsername, getBuilderCardByUsername } from "./socialAccountsData";

interface SocialFeedProps {
  initialTab?: "for_you" | "following" | "saved";
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ initialTab = "for_you" }) => {
  const { socialProfile, switchWorld } = useWorld();
  const [activeTab, setActiveTab] = useState<"for_you" | "following" | "saved">(initialTab);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set(["sp-2"]));
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<PublicSocialAccount | null>(null);
  const [followingUsernames, setFollowingUsernames] = useState<Set<string>>(new Set(["priya_art"]));
  const [flippedPostIds, setFlippedPostIds] = useState<Set<string>>(new Set());
  const [tippingPostId, setTippingPostId] = useState<string | null>(null);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isMicroAppsModalOpen, setIsMicroAppsModalOpen] = useState(false);
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [isTwinModalOpen, setIsTwinModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [translatedPostIds, setTranslatedPostIds] = useState<Set<string>>(new Set());
  const [postTargetLangs, setPostTargetLangs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Composer State
  const [postText, setPostText] = useState("");
  const [postType, setPostType] = useState<"text" | "image" | "poll">("text");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Comments State (open comment drawer per post)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyParentIds, setReplyParentIds] = useState<Record<string, string | null>>({});

  // Active Profile State (allows real local updates upon editing)
  const [currentSocialProfile, setCurrentSocialProfile] = useState(socialProfile);

  // 24h Stories Bar items (with full media & real playback)
  const [storiesList, setStoriesList] = useState([
    {
      id: "s-me",
      name: "Your Story",
      username: currentSocialProfile?.username || "aarav_social",
      avatar: "👤",
      isMe: true,
      hasUnread: false,
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      caption: "Sunrise walk along the lake before work. Peaceful Bengaluru morning! 🌅",
      expiresIn: "Expires in 18h",
      viewsCount: 14,
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: "s-2",
      name: "Priya R.",
      username: "priya_art",
      avatar: "🎨",
      isMe: false,
      hasUnread: true,
      mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      caption: "New watercolor wash on cold-press paper. Mixing ochre & burnt sienna 🎨",
      expiresIn: "Expires in 14h",
      viewsCount: 29,
      createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    {
      id: "s-3",
      name: "Kabir M.",
      username: "kabir_rides",
      avatar: "🚴",
      isMe: false,
      hasUnread: true,
      mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      caption: "60km century prep ride completed! Nandi Hills climb was brutal today 🚴‍♂️",
      expiresIn: "Expires in 22h",
      viewsCount: 38,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "s-4",
      name: "Tanvi S.",
      username: "tanvi_reads",
      avatar: "📷",
      isMe: false,
      hasUnread: false,
      mediaUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
      caption: "Late evening 35mm analog film rolls developed! Arthouse cinema vibes 🎬",
      expiresIn: "Expires in 8h",
      viewsCount: 21,
      createdAt: new Date(Date.now() - 16 * 3600000).toISOString(),
    },
    {
      id: "s-5",
      name: "Rohan D.",
      username: "rohan_acoustic",
      avatar: "🎸",
      isMe: false,
      hasUnread: false,
      mediaUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
      caption: "Acoustic fingerstyle session over filter coffee ☕🎶",
      expiresIn: "Expires in 12h",
      viewsCount: 19,
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ]);

  // Story Player State
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState("");
  const [newStoryCaption, setNewStoryCaption] = useState("");
  const [storyReplyText, setStoryReplyText] = useState("");
  const [storyReplyToast, setStoryReplyToast] = useState<string | null>(null);

  // Auto-play progress effect
  useEffect(() => {
    if (activeStoryIdx === null || isStoryPaused) return;

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIdx < storiesList.length - 1) {
            setActiveStoryIdx((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIdx(null);
            return 0;
          }
        }
        return prev + 2; // 5s playback per story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIdx, isStoryPaused, storiesList.length]);

  // Reset progress on story change
  useEffect(() => {
    setStoryProgress(0);
  }, [activeStoryIdx]);

  // Feed Posts with comments & reactions
  const [posts, setPosts] = useState<Array<SocialPost & { commentsList?: SocialComment[] }>>([
    {
      id: "sp-1",
      authorId: "10000000-0000-0000-0000-000000000001",
      author: {
        id: "10000000-0000-0000-0000-000000000001",
        accountId: "00000000-0000-0000-0000-000000000001",
        username: "aarav_social",
        displayName: "Aarav Social",
        pronouns: "he/him",
        broadLocation: "Bengaluru, Karnataka",
        bio: "Photography enthusiast, coffee nerd & weekend badminton player.",
        interests: ["Photography", "Travel", "Indie Cinema", "Fitness"],
        hobbies: ["Badminton", "Baking"],
        languages: ["English", "Hindi", "Kannada"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content:
        "Weekend road trip to Coorg! Coffee plantations, misty trails, and zero laptop screens. 🌲☕",
      postType: "text",
      mediaUrls: [],
      mediaType: "none",
      likesCount: 24,
      commentsCount: 2,
      sharesCount: 3,
      hasLiked: false,
      userReaction: null,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      commentsList: [
        {
          id: "sc-1",
          postId: "sp-1",
          authorId: "10000000-0000-0000-0000-000000000002",
          author: {
            id: "10000000-0000-0000-0000-000000000002",
            accountId: "00000000-0000-0000-0000-000000000002",
            username: "priya_art",
            displayName: "Priya Rao",
            pronouns: "she/her",
            broadLocation: "Bengaluru, Karnataka",
            interests: [],
            hobbies: [],
            languages: [],
            allowDmsFrom: "everyone",
            showActivityStatus: true,
            isPrivate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          content:
            "The mist in Madikeri right now is heavenly! Try the wild honey if you pass through Kushalnagar.",
          likesCount: 4,
          replies: [
            {
              id: "sc-2",
              postId: "sp-1",
              authorId: "10000000-0000-0000-0000-000000000001",
              parentCommentId: "sc-1",
              content: "Already picked up two bottles! Thanks for the tip Priya 🙌",
              likesCount: 2,
              createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        },
      ],
    },
    {
      id: "sp-2",
      authorId: "10000000-0000-0000-0000-000000000002",
      author: {
        id: "10000000-0000-0000-0000-000000000002",
        accountId: "00000000-0000-0000-0000-000000000002",
        username: "priya_art",
        displayName: "Priya Rao",
        pronouns: "she/her",
        broadLocation: "Bengaluru, Karnataka",
        bio: "Watercolor artist & botanical sketcher.",
        interests: ["Watercolor", "Architecture", "Coffee"],
        hobbies: ["Sketching", "Gardening"],
        languages: ["English", "Kannada"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content:
        "Finished another watercolor sketch of Cubbon Park under the bamboo grove. What are your favorite quiet green spots in Bangalore?",
      postType: "image",
      mediaUrls: [
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      ],
      mediaType: "image",
      likesCount: 42,
      commentsCount: 1,
      sharesCount: 5,
      hasLiked: true,
      userReaction: "love",
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      commentsList: [],
    },
    {
      id: "sp-3",
      authorId: "10000000-0000-0000-0000-000000000001",
      author: {
        id: "10000000-0000-0000-0000-000000000001",
        accountId: "00000000-0000-0000-0000-000000000001",
        username: "aarav_social",
        displayName: "Aarav Social",
        pronouns: "he/him",
        broadLocation: "Bengaluru, Karnataka",
        interests: [],
        hobbies: [],
        languages: [],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content:
        "Quick poll for Bangalore weekend socializers: Best spot for Sunday morning filter coffee & podi dosa?",
      postType: "poll",
      mediaUrls: [],
      mediaType: "poll",
      pollOptions: [
        { id: "opt-1", text: "Taaza Thindi (Jayanagar)", votes: 18 },
        { id: "opt-2", text: "CTR / Shri Sagar (Malleshwaram)", votes: 31 },
        { id: "opt-3", text: "Brahmin's Coffee Bar (Shankarapuram)", votes: 22 },
        { id: "opt-4", text: "Veena Stores (Malleshwaram)", votes: 14 },
      ],
      likesCount: 15,
      commentsCount: 3,
      sharesCount: 1,
      hasLiked: false,
      userReaction: null,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      commentsList: [],
    },
    {
      id: "sp-speed",
      authorId: "acc-speed",
      author: {
        id: "acc-speed",
        accountId: "acc-speed-acc",
        username: "ishowspeed",
        displayName: "IShowSpeed",
        pronouns: "he/him",
        broadLocation: "Bengaluru Tour • Worldwide",
        bio: "Live every day! Streaming, football & gaming 🌍⚽️",
        interests: ["Streaming", "Gaming", "Football"],
        hobbies: ["Football", "Gaming"],
        languages: ["English"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content:
        "BENGALURU WAS ELECTRIC TODAY! The passion here is unmatched. Thank you India! 🇮🇳⚡️ SIUUUU",
      postType: "image",
      mediaUrls: [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      ],
      mediaType: "image",
      likesCount: 240000,
      commentsCount: 6120,
      sharesCount: 14200,
      hasLiked: false,
      userReaction: null,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      commentsList: [],
    },
    {
      id: "sp-kabir",
      authorId: "acc-kabir",
      author: {
        id: "acc-kabir",
        accountId: "acc-kabir-acc",
        username: "kabir_rides",
        displayName: "Kabir Mehta",
        pronouns: "he/him",
        broadLocation: "Bengaluru, Karnataka",
        bio: "Brevet endurance cyclist & road cycling enthusiast. Nandi hills dawn ascents 🚴‍♂️☕️",
        interests: ["Cycling", "Coffee", "Fitness"],
        hobbies: ["Cycling"],
        languages: ["English", "Hindi"],
        allowDmsFrom: "everyone",
        showActivityStatus: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content:
        "60km dawn ride to Nandi Hills completed before breakfast! Perfect misty morning on the highway 🚴‍♂️🌅",
      postType: "image",
      mediaUrls: [
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      ],
      mediaType: "image",
      likesCount: 1820,
      commentsCount: 42,
      sharesCount: 15,
      hasLiked: false,
      userReaction: null,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      commentsList: [],
    },
  ]);

  // Listen for posts created from modal or other views
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("balaga_user_posts") || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueStored = stored
            .filter((p: any) => !existingIds.has(p.id))
            .map((p: any) => ({
              id: p.id,
              authorId: p.authorProfileId || "10000000-0000-0000-0000-000000000001",
              author: {
                id: p.authorProfileId || "10000000-0000-0000-0000-000000000001",
                accountId: "00000000-0000-0000-0000-000000000001",
                username: p.authorUsername || "aarav_social",
                displayName: p.authorDisplayName || "Aarav Social",
                interests: [],
                hobbies: [],
                languages: [],
                allowDmsFrom: "everyone" as const,
                showActivityStatus: true,
                isPrivate: false,
                createdAt: p.createdAt || new Date().toISOString(),
                updatedAt: p.createdAt || new Date().toISOString(),
              },
              content: p.content,
              postType: (p.mediaType === "video" ? "text" : p.mediaUrls?.length ? "image" : "text") as any,
              mediaUrls: p.mediaUrls || [],
              mediaType: (p.mediaType || "none") as any,
              likesCount: p.likesCount || 0,
              commentsCount: p.commentsCount || 0,
              sharesCount: 0,
              hasLiked: false,
              userReaction: null,
              isArchived: false,
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.createdAt || new Date().toISOString(),
              commentsList: [],
            }));
          return [...uniqueStored, ...prev];
        });
      }
      const myStory = JSON.parse(localStorage.getItem("balaga_user_my_story") || "null");
      if (myStory) {
        setStoriesList((prev) => [myStory, ...prev.filter((s) => !s.isMe)]);
      }
    } catch {}

    const handleCustomPost = (e: any) => {
      const p = e.detail;
      if (!p) return;
      const formattedPost: SocialPost & { commentsList: SocialComment[] } = {
        id: p.id,
        authorId: p.authorProfileId || "10000000-0000-0000-0000-000000000001",
        author: {
          id: p.authorProfileId || "10000000-0000-0000-0000-000000000001",
          accountId: "00000000-0000-0000-0000-000000000001",
          username: p.authorUsername || "aarav_social",
          displayName: p.authorDisplayName || "Aarav Social",
          interests: [],
          hobbies: [],
          languages: [],
          allowDmsFrom: "everyone" as const,
          showActivityStatus: true,
          isPrivate: false,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.createdAt || new Date().toISOString(),
        },
        content: p.content,
        postType: (p.mediaType === "video" ? "text" : p.mediaUrls?.length ? "image" : "text") as any,
        mediaUrls: p.mediaUrls || [],
        mediaType: (p.mediaType || "none") as any,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        hasLiked: false,
        userReaction: null,
        isArchived: false,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.createdAt || new Date().toISOString(),
        commentsList: [],
      };
      setPosts((prev) => [formattedPost, ...prev]);
      setShareToast("Post shared successfully!");
      setTimeout(() => setShareToast(null), 3000);
    };

    window.addEventListener("balaga:new-post", handleCustomPost);
    return () => window.removeEventListener("balaga:new-post", handleCustomPost);
  }, []);

  // Handle post publish
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && postType === "text") return;

    const newPost: SocialPost & { commentsList: SocialComment[] } = {
      id: `sp-${Date.now()}`,
      authorId: currentSocialProfile?.id || "10000000-0000-0000-0000-000000000001",
      author: currentSocialProfile || undefined,
      content: postText,
      postType,
      mediaUrls: postType === "image" && imageUrls.length > 0 ? imageUrls : [],
      mediaType: postType === "poll" ? "poll" : postType === "image" ? "image" : "none",
      pollOptions:
        postType === "poll"
          ? pollOptions
              .filter((t) => t.trim().length > 0)
              .map((t, idx) => ({ id: `opt-${idx + 1}`, text: t, votes: 0 }))
          : undefined,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      hasLiked: false,
      userReaction: null,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentsList: [],
    };

    setPosts([newPost, ...posts]);
    try {
      const stored = JSON.parse(localStorage.getItem("balaga_user_posts") || "[]");
      localStorage.setItem("balaga_user_posts", JSON.stringify([newPost, ...stored]));
    } catch {}

    // Async sync to PostgreSQL backend
    try {
      fetch("/api/social/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "socializing",
        },
        body: JSON.stringify({
          content: postText,
          postType,
          mediaUrls: postType === "image" && imageUrls.length > 0 ? imageUrls : [],
          pollOptions: newPost.pollOptions,
        }),
      }).catch(() => {});
    } catch {}

    setPostText("");
    setImageUrls([]);
    setPostType("text");
    setPollOptions(["", ""]);
  };

  // Handle reaction toggle
  const handleReaction = (
    postId: string,
    type: "like" | "love" | "celebrate" | "support" | "insightful"
  ) => {
    setPosts(
      posts.map((p) => {
        if (p.id !== postId) return p;
        const isRemoving = p.userReaction === type;
        return {
          ...p,
          hasLiked: !isRemoving,
          userReaction: isRemoving ? null : type,
          likesCount: isRemoving ? Math.max(0, p.likesCount - 1) : p.hasLiked ? p.likesCount : p.likesCount + 1,
        };
      })
    );
  };

  // Handle adding comment or reply
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const parentId = replyParentIds[postId] || null;

    const newComment: SocialComment = {
      id: `sc-${Date.now()}`,
      postId,
      authorId: currentSocialProfile?.id || "10000000-0000-0000-0000-000000000001",
      author: currentSocialProfile || undefined,
      parentCommentId: parentId,
      content: text,
      likesCount: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPosts(
      posts.map((p) => {
        if (p.id !== postId) return p;
        const list = p.commentsList || [];
        let updatedList: SocialComment[];

        if (parentId) {
          // Append as nested reply
          updatedList = list.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          );
        } else {
          // Append as top-level comment
          updatedList = [...list, newComment];
        }

        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: updatedList,
        };
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
    setReplyParentIds({ ...replyParentIds, [postId]: null });
  };

  // Poll Vote Handler
  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts(
      posts.map((p) => {
        if (p.id !== postId || !p.pollOptions) return p;
        return {
          ...p,
          pollOptions: p.pollOptions.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      })
    );
  };

  // Handle Save / Bookmark toggle
  const handleToggleSave = (postId: string) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Handle Share link copy
  const handleShare = async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareToast("Link copied to clipboard!");
      setTimeout(() => setShareToast(null), 2500);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p))
      );
    } catch {
      setShareToast("Post URL copied!");
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  // Delete feed post
  const handleDeleteFeedPost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      const stored = JSON.parse(localStorage.getItem("balaga_user_posts") || "[]");
      localStorage.setItem("balaga_user_posts", JSON.stringify(stored.filter((p: any) => p.id !== postId)));
    } catch {}
    try {
      fetch(`/api/social/posts/${postId}`, {
        method: "DELETE",
        headers: { "x-platform-world": "socializing" },
      }).catch(() => {});
    } catch {}
    setShareToast("Post deleted successfully");
    setTimeout(() => setShareToast(null), 2500);
  };

  // Toggle 3D Balaga Card Flip (Social ↔ Builder)
  const handleToggleFlip = (postId: string) => {
    setFlippedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Send Direct UPI Tip (0% platform fee)
  const handleSendUpiTip = (creatorUsername: string, amount: number) => {
    setTippingPostId(null);
    const upiUrl = `upi://pay?pa=${creatorUsername}@okaxis&pn=${encodeURIComponent(creatorUsername)}&am=${amount}&cu=INR`;
    try {
      window.open(upiUrl, "_blank");
    } catch {
      // Fallback
    }
    setShareToast(`🎉 ₹${amount} Shabaash sent directly to @${creatorUsername}! 0% platform fee.`);
    setTimeout(() => setShareToast(null), 3500);
  };

  // Delete story
  const handleDeleteStory = (storyId: string) => {
    setStoriesList((prev) => prev.filter((s) => s.id !== storyId));
    try {
      localStorage.removeItem("balaga_user_my_story");
    } catch {}
    setActiveStoryIdx(null);
    setShareToast("Story deleted");
    setTimeout(() => setShareToast(null), 2500);
  };

  // Add 24h story
  const handleAddStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryUrl.trim()) return;

    const newStoryItem = {
      id: `s-${Date.now()}`,
      name: "Your Story",
      username: currentSocialProfile?.username || "aarav_social",
      avatar: "👤",
      isMe: true,
      hasUnread: true,
      mediaUrl: newStoryUrl.trim(),
      caption: newStoryCaption.trim() || "New story moment ✨",
      expiresIn: "Expires in 24h",
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    setStoriesList((prev) => [newStoryItem, ...prev.filter((s) => !s.isMe)]);
    try {
      localStorage.setItem("balaga_user_my_story", JSON.stringify(newStoryItem));
    } catch {}
    setNewStoryUrl("");
    setNewStoryCaption("");
    setIsAddStoryOpen(false);
    setShareToast("Story shared! (Expires in 24h)");
    setTimeout(() => setShareToast(null), 3000);
  };

  // Quick reaction / reply to story
  const handleSendStoryReply = (emojiOrText?: string) => {
    const textToSend = emojiOrText || storyReplyText;
    if (!textToSend.trim()) return;

    const targetStory = activeStoryIdx !== null ? storiesList[activeStoryIdx] : null;
    setStoryReplyToast(`Sent "${textToSend}" to ${targetStory?.name || "creator"}`);
    setStoryReplyText("");
    setTimeout(() => setStoryReplyToast(null), 2500);
  };

  // Follow / Unfollow handler
  const handleToggleFollow = (username: string) => {
    setFollowingUsernames((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });

    if (selectedUserProfile && selectedUserProfile.username === username) {
      setSelectedUserProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: !prev.isFollowing,
            }
          : null
      );
    }
  };

  // Open Instagram-style public profile modal for any clicked user
  const handleOpenAuthorProfile = (postAuthorUsername?: string, fallbackName?: string) => {
    if (!postAuthorUsername) return;
    const account = getAccountByUsername(postAuthorUsername);
    if (account) {
      setSelectedUserProfile({
        ...account,
        isFollowing: followingUsernames.has(account.username),
      });
    } else {
      setSelectedUserProfile({
        id: `acc-${postAuthorUsername}`,
        username: postAuthorUsername,
        displayName: fallbackName || postAuthorUsername,
        avatarUrl: undefined,
        bio: "Socializing creator on Balaga ✨",
        followersCount: "142",
        followingCount: 89,
        postsCount: 1,
        isFollowing: followingUsernames.has(postAuthorUsername),
        posts: [],
      });
    }
  };

  // Filter posts based on active feed tab
  const displayedPosts = posts.filter((post) => {
    if (activeTab === "saved") {
      return savedPostIds.has(post.id);
    }
    if (activeTab === "following") {
      const username = post.author?.username;
      return username ? followingUsernames.has(username) : false;
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Floating Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-slate-900 border border-violet-500/50 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* 24-HOUR STORIES BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-4">
          {/* Add story / Your story button */}
          <div
            onClick={() => setIsAddStoryOpen(true)}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
          >
            <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-dashed border-violet-400 group-hover:border-violet-300 flex items-center justify-center transition-transform hover:scale-105">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xl overflow-hidden">
                {storiesList.find((s) => s.isMe)?.mediaUrl ? (
                  <img
                    src={storiesList.find((s) => s.isMe)?.mediaUrl}
                    alt="Your Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-full border-2 border-slate-900 flex items-center justify-center text-white">
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">Add Story</span>
          </div>

          {/* Stories List */}
          {storiesList.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                setActiveStoryIdx(idx);
                setStoryProgress(0);
                setIsStoryPaused(false);
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
            >
              <div
                className={`w-14 h-14 rounded-full p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 ${
                  s.hasUnread
                    ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600"
                    : "border-2 border-slate-700"
                }`}
              >
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xl overflow-hidden">
                  {s.mediaUrl ? (
                    <img src={s.mediaUrl} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{s.avatar}</span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-slate-300 font-medium truncate max-w-[64px]">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. FLASH HANGOUT RADAR (120-Min Real-World Beacons) */}
      <FlashHangoutRadar />

      {/* 2.5 GUARDIAN SAFE-JOURNEY BEACON (S17) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              Guardian Safe-Journey Beacon
              <span className="text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded">
                PEER SAFETY
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Safe transit check-in with trusted friends when traveling home at night.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsGuardianModalOpen(true)}
          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Start Beacon 🛡️</span>
        </button>
      </div>

      {/* 2.8 SOCIAL INNOVATIONS SHOWCASE ROW */}
      <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-emerald-950/40 border border-sky-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Social Innovations Hub
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive micro-apps, karma prediction forecasts, and safe transit beacons.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            size="sm"
            onClick={() => setIsMicroAppsModalOpen(true)}
            icon={<Code className="w-3.5 h-3.5 text-sky-400" />}
            className="bg-slate-900 border border-sky-500/40 text-sky-300 hover:bg-slate-800 text-xs shrink-0"
          >
            Micro-Apps 💻
          </Button>
          <Button
            size="sm"
            onClick={() => setIsPredictionModalOpen(true)}
            icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
            className="bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-slate-800 text-xs shrink-0"
          >
            Prediction Stakes 📈
          </Button>
          <Button
            size="sm"
            onClick={() => setIsTwinModalOpen(true)}
            icon={<Bot className="w-3.5 h-3.5 text-violet-400" />}
            className="bg-slate-900 border border-violet-500/40 text-violet-300 hover:bg-slate-800 text-xs shrink-0"
          >
            Social Twin 🤖
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAiModalOpen(true)}
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            className="bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 text-xs shrink-0"
          >
            AI Digest 📢
          </Button>
        </div>
      </div>

      {/* 3. FEED TABS */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("for_you")}
          className={`flex-1 pb-3 text-center text-sm font-semibold transition-colors relative ${
            activeTab === "for_you" ? "text-violet-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          For You
          {activeTab === "for_you" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`flex-1 pb-3 text-center text-sm font-semibold transition-colors relative ${
            activeTab === "following" ? "text-violet-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Following
          {activeTab === "following" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex-1 pb-3 text-center text-sm font-semibold transition-colors relative ${
            activeTab === "saved" ? "text-violet-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Saved ({savedPostIds.size})
          {activeTab === "saved" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500" />
          )}
        </button>
      </div>

      {/* 4. REAL POST COMPOSER */}
      <form
        onSubmit={handleCreatePost}
        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
      >
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Share weekend experiences, books, cafes, or stories..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />

        {/* Media or Poll dynamic inputs */}
        {postType === "image" && (
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-violet-400" />
                <span>Add Photos ({imageUrls.length}/4)</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    files.slice(0, 4 - imageUrls.length).forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (loadEvt) => {
                        const res = loadEvt.target?.result as string;
                        if (res) setImageUrls((prev) => [...prev, res].slice(0, 4));
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Upload Files
                </button>
              </div>
            </div>

            {/* URL Input Bar */}
            <div className="flex gap-2">
              <input
                type="url"
                value={customImageUrlInput}
                onChange={(e) => setCustomImageUrlInput(e.target.value)}
                placeholder="Or paste public image URL..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                disabled={!customImageUrlInput.trim() || imageUrls.length >= 4}
                onClick={() => {
                  if (customImageUrlInput.trim() && imageUrls.length < 4) {
                    setImageUrls([...imageUrls, customImageUrlInput.trim()]);
                    setCustomImageUrlInput("");
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold"
              >
                Attach
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-[11px] text-slate-400">
              <span className="shrink-0 text-slate-500">Presets:</span>
              <button
                type="button"
                onClick={() => setImageUrls((p) => [...p, "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80"].slice(0, 4))}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0"
              >
                Cubbon Flora 🎨
              </button>
              <button
                type="button"
                onClick={() => setImageUrls((p) => [...p, "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80"].slice(0, 4))}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0"
              >
                Nandi Hills 🚴
              </button>
              <button
                type="button"
                onClick={() => setImageUrls((p) => [...p, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80"].slice(0, 4))}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0"
              >
                Sunrise Lake 🌅
              </button>
            </div>

            {/* Thumbnail Previews */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 group">
                    <img src={url} alt="Attached thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {postType === "poll" && (
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400">Poll Options</span>
            {pollOptions.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={opt}
                onChange={(e) => {
                  const updated = [...pollOptions];
                  updated[idx] = e.target.value;
                  setPollOptions(updated);
                }}
                placeholder={`Option ${idx + 1}`}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ""])}
                className="text-[11px] text-violet-400 font-medium flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Option
              </button>
            )}
          </div>
        )}

        {/* Composer Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPostType(postType === "image" ? "text" : "image")}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                postType === "image"
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                  : "text-slate-400 hover:text-violet-400 hover:bg-slate-800"
              }`}
            >
              <Image className="w-4 h-4" /> Photo
            </button>
            <button
              type="button"
              onClick={() => setPostType(postType === "poll" ? "text" : "poll")}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                postType === "poll"
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                  : "text-slate-400 hover:text-violet-400 hover:bg-slate-800"
              }`}
            >
              <BarChart2 className="w-4 h-4" /> Poll
            </button>
            <button
              type="button"
              onClick={() => {
                const sampleCaptions = [
                  "Filtered sunlight, cold coffee, and unhurried Bangalore mornings. Sometimes the best stories happen without a schedule. ☕✨",
                  "Weekend drills completed! 60 minutes of sweat, laughs, and good energy with the badminton crew. 🏸🔥",
                  "Pausing between frames. 📸 #NammaBengaluru #LifeInChapters",
                ];
                setPostText(sampleCaptions[Math.floor(Math.random() * sampleCaptions.length)]);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-500/30 transition-colors"
              title="Draft Creative AI Caption"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Caption ✨</span>
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!postText.trim() && postType === "text"}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Post
          </Button>
        </div>
      </form>

      {/* 5. FEED POSTS */}
      <div className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center mx-auto text-xl">
              {activeTab === "saved" ? "🔖" : activeTab === "following" ? "👥" : "✨"}
            </div>
            <h4 className="font-bold text-sm text-slate-200">
              {activeTab === "saved"
                ? "No saved posts yet"
                : activeTab === "following"
                ? "No posts in your Following feed"
                : "No posts yet"}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === "saved"
                ? "Bookmark posts by clicking the save icon on any post to read them later."
                : activeTab === "following"
                ? "You only see posts from creators you follow here. Follow creators like @ishowspeed or @priya_art to see their posts and reels!"
                : "Explore creators in the discover tab to see their posts here."}
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("for_you")}
              >
                Browse For You Feed
              </Button>
            </div>
          </div>
        ) : (
          displayedPosts.map((post) => {
            const isFlipped = flippedPostIds.has(post.id);
            const builderCard = getBuilderCardByUsername(post.author?.username);

            return (
              <article
                key={post.id}
                className={`border rounded-2xl p-5 space-y-3 transition-all shadow-sm ${
                  isFlipped
                    ? "bg-slate-950/90 border-amber-500/40 shadow-amber-950/20"
                    : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80"
                }`}
              >
                {/* Post Author */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => handleOpenAuthorProfile(post.author?.username, post.author?.displayName)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 group-hover:scale-105 transition-transform">
                      {post.author?.displayName?.[0] || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-100 group-hover:text-violet-400 group-hover:underline transition-colors">
                          {post.author?.displayName}
                        </h4>
                        {post.author?.pronouns && (
                          <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded font-medium">
                            {post.author.pronouns}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-slate-300">
                        @{post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 3D Balaga Card Flip Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFlip(post.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                        isFlipped
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                      }`}
                      title="Flip card between Social and Builder identity"
                    >
                      <RotateCw className={`w-3 h-3 ${isFlipped ? "rotate-180 text-amber-400 transition-transform duration-300" : ""}`} />
                      <span>{isFlipped ? "Social View" : "3D Flip 🔄"}</span>
                    </button>

                    {post.author?.username && post.authorId !== currentSocialProfile?.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFollow(post.author!.username);
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          followingUsernames.has(post.author.username)
                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                            : "bg-violet-600 text-white hover:bg-violet-500"
                        }`}
                      >
                        {followingUsernames.has(post.author.username) ? "Following" : "Follow"}
                      </button>
                    )}

                    {/* Post Options / Delete if Author */}
                    {post.authorId === currentSocialProfile?.id && (
                      <button
                        onClick={() => handleDeleteFeedPost(post.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isFlipped ? (
                  /* BACK FACE: VERIFIED BUILDER IDENTITY CARD */
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <Rocket className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                          Builder Identity
                        </span>
                      </div>
                      {builderCard.verifiedBadge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {builderCard.verifiedBadge === "gold" ? "⭐ Gold Founder" : "⚡ Verified Builder"}
                        </span>
                      )}
                    </div>

                    {builderCard.isPublicBuilder ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">
                            {builderCard.headline}
                          </h4>
                          {builderCard.startupName && (
                            <p className="text-xs text-amber-300/90 font-medium">
                              🚀 {builderCard.startupName} • <span className="text-slate-400">{builderCard.stage}</span>
                            </p>
                          )}
                        </div>

                        {/* Tech Stack Chips */}
                        {builderCard.techStack.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Superpower Tech Stack
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {builderCard.techStack.map((tech) => (
                                <span
                                  key={tech}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Open Needs */}
                        {builderCard.lookingFor && (
                          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200/90 flex items-start gap-2">
                            <Handshake className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{builderCard.lookingFor}</span>
                          </div>
                        )}

                        {/* Action Bridge: Switch to Founders */}
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            🔒 Opted-in public summary. Deals & internal spaces stay isolated.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Switch to Founders World to view this builder's full startup dashboard and network?")) {
                                switchWorld(WORLDS.FOUNDERS);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-950/30"
                          >
                            <span>Open in Founders World</span>
                            <Rocket className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-1 text-slate-400 text-xs">
                        <p className="font-semibold text-slate-300">Personal Account</p>
                        <p className="text-[11px] text-slate-500">
                          This creator has not opted in to publish a public Builder Card.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* FRONT FACE: ORIGINAL SOCIAL CONTENT */
                  <>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {translatedPostIds.has(post.id)
                          ? translateWithBhasha(post.content, postTargetLangs[post.id] || "en").translatedText
                          : post.content}
                      </p>

                      {/* BHASHA CULTURAL TRANSLATION ENGINE (S16 - INDICTRANS2 SPEC) */}
                      {(() => {
                        const bhasha = translateWithBhasha(post.content, postTargetLangs[post.id] || "en");
                        const isTranslated = translatedPostIds.has(post.id);
                        if (!bhasha.hasSlang && !isTranslated) return null;

                        return (
                          <div className="pt-1 space-y-1.5 text-[11px]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setTranslatedPostIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(post.id)) next.delete(post.id);
                                    else next.add(post.id);
                                    return next;
                                  });
                                }}
                                className="px-2.5 py-0.5 rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1 font-medium transition-colors"
                              >
                                <Languages className="w-3 h-3 text-violet-400" />
                                <span>
                                  {isTranslated ? "Show Original" : "Bhasha Nuance 🌐"}
                                </span>
                              </button>

                              {/* Script & Language Detection Tag */}
                              {bhasha.detectedLanguage.code !== "en" && (
                                <span className="px-2 py-0.5 rounded-md bg-violet-950/40 border border-violet-800/40 text-[10px] text-violet-300 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                  <span>{bhasha.detectedLanguage.nativeName} ({bhasha.detectedLanguage.name})</span>
                                </span>
                              )}

                              {/* Slang Glossary Pills */}
                              {bhasha.detectedSlangs.map((s) => (
                                <span
                                  key={s.term}
                                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1"
                                  title={`${s.language}: ${s.meaning}. ${s.culturalNote}`}
                                >
                                  <span className="font-semibold text-amber-300">{s.term}:</span>
                                  <span>{s.meaning}</span>
                                </span>
                              ))}
                            </div>

                            {/* IndicTrans2 Target Language Switcher */}
                            {isTranslated && (
                              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 text-[10px]">
                                <span className="text-slate-400 font-mono text-[9px] px-1">IndicTrans2:</span>
                                {[
                                  { code: "en", label: "English" },
                                  { code: "kn", label: "ಕನ್ನಡ" },
                                  { code: "hi", label: "हिन्दी" },
                                  { code: "ta", label: "தமிழ்" },
                                  { code: "te", label: "తెలుగు" },
                                ].map((l) => {
                                  const active = (postTargetLangs[post.id] || "en") === l.code;
                                  return (
                                    <button
                                      key={l.code}
                                      type="button"
                                      onClick={() => setPostTargetLangs((prev) => ({ ...prev, [post.id]: l.code }))}
                                      className={`px-2 py-0.5 rounded transition ${
                                        active
                                          ? "bg-violet-600 text-white font-bold shadow-sm"
                                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                      }`}
                                    >
                                      {l.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                                      {/* Hey.xyz Multi-Media Responsive Grid & Lightbox */}
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="mt-3">
                        <HeyMediaGrid mediaUrls={post.mediaUrls} alt={post.content.slice(0, 30)} />
                      </div>
                    )}

                    {/* Interactive Poll Display */}
                    {post.postType === "poll" && post.pollOptions && (
                      <div className="space-y-2 pt-2">
                        {post.pollOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleVotePoll(post.id, opt.id)}
                            className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-violet-500/50 flex items-center justify-between transition-colors text-xs"
                          >
                            <span className="text-slate-200 font-medium">{opt.text}</span>
                            <span className="text-[11px] font-bold text-violet-400">{opt.votes} votes</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

              {/* Reactions & Interaction Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  {/* Reaction Picker Buttons */}
                  <button
                    onClick={() => handleReaction(post.id, "like")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                      post.userReaction === "like"
                        ? "bg-violet-500/20 text-violet-400 font-semibold"
                        : "hover:bg-slate-800 hover:text-slate-200"
                    }`}
                    title="Like"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.userReaction === "like" ? "fill-violet-400 text-violet-400" : ""
                      }`}
                    />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post.id, "love")}
                    className={`p-1 rounded-lg text-sm transition-transform hover:scale-125 ${
                      post.userReaction === "love" ? "bg-rose-500/20" : ""
                    }`}
                    title="Love"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => handleReaction(post.id, "celebrate")}
                    className={`p-1 rounded-lg text-sm transition-transform hover:scale-125 ${
                      post.userReaction === "celebrate" ? "bg-amber-500/20" : ""
                    }`}
                    title="Celebrate"
                  >
                    🎉
                  </button>
                  <button
                    onClick={() => handleReaction(post.id, "support")}
                    className={`p-1 rounded-lg text-sm transition-transform hover:scale-125 ${
                      post.userReaction === "support" ? "bg-emerald-500/20" : ""
                    }`}
                    title="Support"
                  >
                    🤝
                  </button>

                  {/* Native UPI Shabaash Tipping Button */}
                  <button
                    type="button"
                    onClick={() => setTippingPostId(tippingPostId === post.id ? null : post.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-bold text-xs ${
                      tippingPostId === post.id
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "hover:bg-emerald-500/10 text-emerald-400"
                    }`}
                    title="Send direct UPI tip to creator (0% platform fee)"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Shabaash</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                    }
                    className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount} Comments</span>
                  </button>
                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                    title="Share post link"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{post.sharesCount}</span>
                  </button>
                  <button
                    onClick={() => handleToggleSave(post.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      savedPostIds.has(post.id)
                        ? "text-violet-400 bg-violet-500/15"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                    title={savedPostIds.has(post.id) ? "Remove from saved" : "Save post"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        savedPostIds.has(post.id) ? "fill-violet-400 text-violet-400" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* UPI SHABAASH DIRECT TIPPING POPOVER */}
              {tippingPostId === post.id && (
                <div className="pt-3 border-t border-emerald-900/40 bg-emerald-950/20 p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                        ₹
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-100">
                          Send Shabaash to @{post.author?.username}
                        </h5>
                        <span className="text-[10px] text-slate-400">
                          UPI VPA: <span className="font-mono text-emerald-400">{post.author?.username}@okaxis</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setTippingPostId(null)}
                      className="text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Fast Amount Chips */}
                  <div className="flex items-center gap-2">
                    {[10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleSendUpiTip(post.author?.username || "creator", amt)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 text-emerald-300 font-bold text-xs transition-all active:scale-95"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  {/* Mandatory Zero-Liability Transaction Disclosure */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 leading-relaxed space-y-1">
                    <p className="font-semibold text-slate-300">
                      ⚡ 0% Platform Fee · Direct Creator Fuel
                    </p>
                    <p>
                      Balaga does not process, hold, or escrow your funds. Tapping an amount opens your UPI app (GPay, PhonePe, Paytm, BHIM) where you authorize the payment directly into the creator&apos;s bank account.
                    </p>
                  </div>
                </div>
              )}

            {/* COLLAPSIBLE COMMENTS THREAD */}
            {activeCommentPostId === post.id && (
              <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-150">
                {/* Existing comments list */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {post.commentsList && post.commentsList.length > 0 ? (
                    post.commentsList.map((c) => (
                      <div key={c.id} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenAuthorProfile(c.author?.username, c.author?.displayName)}
                            className="font-semibold text-slate-200 hover:text-violet-400 hover:underline text-left cursor-pointer"
                          >
                            {c.author?.displayName || "User"}
                          </button>
                          <span className="text-[10px] text-slate-500">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300">{c.content}</p>

                        <button
                          onClick={() => setReplyParentIds({ ...replyParentIds, [post.id]: c.id })}
                          className="text-[10px] text-violet-400 font-semibold hover:underline"
                        >
                          Reply
                        </button>

                        {/* Nested Replies */}
                        {c.replies && c.replies.length > 0 && (
                          <div className="pl-3 border-l-2 border-slate-800 mt-2 space-y-1.5">
                            {c.replies.map((reply) => (
                              <div key={reply.id} className="bg-slate-900/60 p-2 rounded-lg text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAuthorProfile(reply.author?.username, reply.author?.displayName)}
                                  className="font-semibold text-slate-200 block text-[11px] hover:text-violet-400 hover:underline text-left cursor-pointer"
                                >
                                  {reply.author?.displayName || "User"}
                                </button>
                                <p className="text-slate-300 text-[11px]">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No comments yet. Start the conversation!</p>
                  )}
                </div>

                {/* Comment Input */}
                <form
                  onSubmit={(e) => handleAddComment(post.id, e)}
                  className="flex items-center gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                    }
                    placeholder={
                      replyParentIds[post.id]
                        ? "Writing reply to comment..."
                        : "Write a comment..."
                    }
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {replyParentIds[post.id] && (
                    <button
                      type="button"
                      onClick={() => setReplyParentIds({ ...replyParentIds, [post.id]: null })}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!commentInputs[post.id]?.trim()}
                    className="p-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </article>
        );
      })
    )}
      </div>

      {/* Social Profile Customization Modal */}
      {currentSocialProfile && (
        <SocialProfileEditor
          profile={currentSocialProfile}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={(updated: any) => {
            setCurrentSocialProfile({ ...currentSocialProfile, ...updated });
          }}
        />
      )}

      {/* ========================================================
          FULL INSTAGRAM 24-HOUR STORY PLAYER
      ======================================================== */}
      {activeStoryIdx !== null && storiesList[activeStoryIdx] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          {/* Main Story Container (9:16 mobile aspect) */}
          <div className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[820px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
            {/* Story Image / Background */}
            <div className="absolute inset-0 z-0">
              {storiesList[activeStoryIdx].mediaUrl ? (
                <img
                  src={storiesList[activeStoryIdx].mediaUrl}
                  alt={storiesList[activeStoryIdx].name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center text-7xl">
                  {storiesList[activeStoryIdx].avatar}
                </div>
              )}
              {/* Gradient Vignette for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85" />
            </div>

            {/* Click Navigation Hotspots (Left for prev, Right for next) */}
            <div
              className="absolute left-0 top-16 bottom-24 w-1/3 z-10 cursor-pointer"
              onClick={() => {
                if (activeStoryIdx > 0) {
                  setActiveStoryIdx(activeStoryIdx - 1);
                } else {
                  setStoryProgress(0);
                }
              }}
              title="Previous story"
            />
            <div
              className="absolute right-0 top-16 bottom-24 w-1/3 z-10 cursor-pointer"
              onClick={() => {
                if (activeStoryIdx < storiesList.length - 1) {
                  setActiveStoryIdx(activeStoryIdx + 1);
                } else {
                  setActiveStoryIdx(null);
                }
              }}
              title="Next story"
            />

            {/* Top Story Controls & Progress Bars */}
            <div className="relative z-20 p-4 space-y-3">
              {/* Progress Bars */}
              <div className="flex items-center gap-1.5 w-full">
                {storiesList.map((story, i) => (
                  <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                      style={{
                        width:
                          i < activeStoryIdx
                            ? "100%"
                            : i === activeStoryIdx
                            ? `${storyProgress}%`
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Author Header */}
              <div className="flex items-center justify-between">
                <div
                  onClick={() => {
                    handleOpenAuthorProfile(
                      storiesList[activeStoryIdx].username,
                      storiesList[activeStoryIdx].name
                    );
                    setActiveStoryIdx(null);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full ring-2 ring-violet-500 overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-white text-sm group-hover:scale-105 transition-transform">
                    {storiesList[activeStoryIdx].avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:underline">
                        {storiesList[activeStoryIdx].name}
                      </span>
                      <span className="text-[10px] text-slate-300">
                        @{storiesList[activeStoryIdx].username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-amber-300/90 font-medium">
                      <span>{storiesList[activeStoryIdx].expiresIn}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-slate-300">
                        <Eye className="w-2.5 h-2.5" />
                        {storiesList[activeStoryIdx].viewsCount} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Action Icons */}
                <div className="flex items-center gap-1 text-white">
                  <button
                    onClick={() => setIsStoryPaused(!isStoryPaused)}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    title={isStoryPaused ? "Play story" : "Pause story"}
                  >
                    {isStoryPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>

                  {storiesList[activeStoryIdx].isMe && (
                    <button
                      onClick={() => handleDeleteStory(storiesList[activeStoryIdx].id)}
                      className="p-1.5 rounded-full hover:bg-rose-500/30 text-rose-300 transition-colors"
                      title="Delete your story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setActiveStoryIdx(null)}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors ml-1"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Caption & Interactive Reply Bar */}
            <div className="relative z-20 p-4 space-y-3">
              {/* Caption */}
              {storiesList[activeStoryIdx].caption && (
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-white leading-relaxed font-medium">
                    {storiesList[activeStoryIdx].caption}
                  </p>
                </div>
              )}

              {/* Story Toast feedback */}
              {storyReplyToast && (
                <div className="text-center bg-violet-600/90 text-white text-[11px] py-1 px-3 rounded-lg animate-in fade-in duration-150">
                  {storyReplyToast}
                </div>
              )}

              {/* Quick Reaction Emojis */}
              <div className="flex items-center justify-around py-1">
                {["❤️", "🔥", "😂", "👏", "😮", "🙌"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendStoryReply(emoji)}
                    className="text-xl hover:scale-125 transition-transform active:scale-95"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Direct Reply Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendStoryReply();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={storyReplyText}
                  onChange={(e) => setStoryReplyText(e.target.value)}
                  placeholder={`Reply to ${storiesList[activeStoryIdx].name}...`}
                  className="flex-1 bg-white/15 border border-white/25 rounded-full px-4 py-2 text-xs text-white placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-400"
                />
                <button
                  type="submit"
                  disabled={!storyReplyText.trim()}
                  className="p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-full transition-colors shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Left / Right chevron navigation handles */}
            {activeStoryIdx > 0 && (
              <button
                onClick={() => setActiveStoryIdx(activeStoryIdx - 1)}
                className="hidden sm:flex absolute -left-12 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 transition-colors"
                title="Previous story"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activeStoryIdx < storiesList.length - 1 && (
              <button
                onClick={() => setActiveStoryIdx(activeStoryIdx + 1)}
                className="hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 transition-colors"
                title="Next story"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          ADD 24-HOUR STORY MODAL
      ======================================================== */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="font-bold text-slate-100 text-base">Add to Your Story</h3>
              </div>
              <button
                onClick={() => setIsAddStoryOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-violet-950/40 border border-violet-800/40 rounded-xl p-3 text-[11px] text-violet-200">
              ⏳ <strong>24-Hour Expiration:</strong> Stories disappear automatically for everyone after 24 hours. Permanent posts remain indefinitely.
            </div>

            <form onSubmit={handleAddStorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Story Photo URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newStoryUrl}
                  onChange={(e) => setNewStoryUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />

                {/* Preset quick picks */}
                <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 text-[10px] text-slate-400">
                  <span className="shrink-0">Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewStoryUrl("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80")
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                  >
                    Lake Sunrise
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewStoryUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80")
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                  >
                    Filter Coffee
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewStoryUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80")
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                  >
                    Cinema Night
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Caption (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={120}
                  placeholder="Share a short thought on this story..."
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Preview if url provided */}
              {newStoryUrl && (
                <div className="h-32 rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src={newStoryUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddStoryOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newStoryUrl.trim()}
                >
                  Share to Story (24h)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instagram-Style Public Profile Modal */}
      {selectedUserProfile && (
        <SocialPublicProfileModal
          user={selectedUserProfile}
          isOpen={true}
          onClose={() => setSelectedUserProfile(null)}
          onToggleFollow={handleToggleFollow}
        />
      )}

      {/* GUARDIAN SAFE-JOURNEY MODAL (S17) */}
      <GuardianSafeJourneyModal
        isOpen={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}
      />

      {/* LIVING MICRO-APPS CONTAINER (S24) */}
      <MicroAppsContainerModal
        isOpen={isMicroAppsModalOpen}
        onClose={() => setIsMicroAppsModalOpen(false)}
      />

      {/* DECISIONAL PREDICTION STAKES (S27) */}
      <PredictionStakesModal
        isOpen={isPredictionModalOpen}
        onClose={() => setIsPredictionModalOpen(false)}
      />

      {/* AUTONOMOUS SOCIAL TWIN (S25) */}
      <AutonomousSocialTwinModal
        isOpen={isTwinModalOpen}
        onClose={() => setIsTwinModalOpen(false)}
      />

      {/* BALAGA SOCIAL INTELLIGENCE ASSISTANT (MILESTONE 2) */}
      <IntelligenceControlModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};
