import React, { useState, useEffect, useCallback } from "react";
import { useWorld } from "../../contexts/WorldContext";
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Image,
  Bookmark,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
  Rocket,
  Briefcase,
  HelpCircle,
  Award,
  Handshake,
  Globe,
  Users,
  Lock,
  Shield,
  Trash2,
  Flag,
  VolumeX,
  UserX,
  UserPlus,
  Search,
  X,
  CornerDownRight,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  FounderPublicProfileModal,
  PublicFounderProfile,
} from "./FounderPublicProfileModal";

export type PostType =
  | "general"
  | "startup_announcement"
  | "product_launch"
  | "hiring"
  | "opportunity"
  | "question"
  | "milestone"
  | "collaboration";

export type AudienceType = "public" | "founders" | "connections" | "only_me";

export interface FeedComment {
  id: string;
  postId: string;
  authorId: string;
  author?: {
    displayName: string;
    username: string;
    avatarUrl?: string | null;
    headline?: string | null;
  };
  parentId?: string | null;
  content: string;
  likesCount: number;
  hasLiked?: boolean;
  replies?: FeedComment[];
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  author?: {
    id?: string;
    displayName: string;
    username: string;
    headline?: string;
    avatarUrl?: string | null;
    skills?: string[];
  };
  authorName: string;
  username: string;
  authorHeadline: string;
  authorAvatar?: string | null;
  postType: PostType;
  content: string;
  mediaUrls: string[];
  mediaType: "none" | "image" | "video";
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    image?: string;
  } | null;
  associatedStartupId?: string | null;
  associatedStartup?: {
    id: string;
    name: string;
    stage: string;
    industry: string;
    verificationLevel?: string;
  } | null;
  associatedProductId?: string | null;
  associatedProduct?: {
    id: string;
    name: string;
    tagline: string;
    upvotesCount: number;
    logoUrl?: string;
  } | null;
  audience: AudienceType;
  topics: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  hasSaved?: boolean;
  hasReposted?: boolean;
  isFollowing?: boolean;
  isDirectRepost?: boolean;
  repostedPostId?: string | null;
  repostedPost?: FeedPost | null;
  repostedByAuthorName?: string | null;
  commentary?: string | null;
  createdAt: string;
}

interface LinkedInFeedViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const LinkedInFeedView: React.FC<LinkedInFeedViewProps> = ({ onNavigateTab }) => {
  const { founderProfile } = useWorld();
  const [selectedFounder, setSelectedFounder] = useState<PublicFounderProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Feed State
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [activeTab, setActiveTab] = useState<"for_you" | "following" | "latest" | "saved">("for_you");
  const [activeTopic, setActiveTopic] = useState<string>("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [tabCounts, setTabCounts] = useState({
    for_you: 0,
    following: 0,
    latest: 0,
    saved: 0,
  });

  // Sidebar Discovery State
  const [suggestedFounders, setSuggestedFounders] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [trendingStartups, setTrendingStartups] = useState<any[]>([]);
  const [recentLaunches, setRecentLaunches] = useState<any[]>([]);

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerContent, setComposerContent] = useState("");
  const [composerPostType, setComposerPostType] = useState<PostType>("general");
  const [composerAudience, setComposerAudience] = useState<AudienceType>("public");
  const [composerStartupId, setComposerStartupId] = useState("st-dev");
  const [composerMediaUrl, setComposerMediaUrl] = useState("");
  const [composerTopics, setComposerTopics] = useState<string[]>(["Startups", "Technology"]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Quote Repost Modal State
  const [quoteModalPost, setQuoteModalPost] = useState<FeedPost | null>(null);
  const [quoteCommentary, setQuoteCommentary] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Report Modal State
  const [reportModalPost, setReportModalPost] = useState<FeedPost | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Comments State
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, FeedComment[]>>({});
  const [commentSortMap, setCommentSortMap] = useState<Record<string, "relevant" | "newest">>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Open Menus State
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [openRepostDropdownId, setOpenRepostDropdownId] = useState<string | null>(null);

  const topicOptions = [
    "All Topics",
    "Startups",
    "Technology",
    "AI/ML",
    "Product Launches",
    "Hiring",
    "Opportunities",
    "Fundraising",
    "Business",
    "Marketing",
    "Community",
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // 1. Fetch Feed Posts
  const fetchFeed = useCallback(async (tab = activeTab, topic = activeTopic, search = searchQuery) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        tab,
        ...(topic && topic !== "All Topics" ? { topic } : {}),
        ...(search ? { search } : {}),
      });

      const res = await fetch(`/api/founders/feed?${queryParams.toString()}`, {
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        if (data.counts) {
          setTabCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch founder feed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, activeTopic, searchQuery]);

  // 2. Fetch Sidebar Discovery Data
  const fetchSidebar = useCallback(async () => {
    try {
      const res = await fetch("/api/founders/feed/sidebar", {
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestedFounders(data.suggestedFounders || []);
        setTrendingTopics(data.trendingTopics || []);
        setTrendingStartups(data.trendingStartups || []);
        setRecentLaunches(data.recentLaunches || []);
      }
    } catch (err) {
      console.error("Failed to fetch feed sidebar:", err);
    }
  }, []);

  useEffect(() => {
    fetchFeed(activeTab, activeTopic, searchQuery);
    fetchSidebar();
  }, [activeTab, activeTopic, fetchFeed, fetchSidebar]);

  // Handle Tab Switch
  const handleTabChange = (tab: "for_you" | "following" | "latest" | "saved") => {
    setActiveTab(tab);
    fetchFeed(tab, activeTopic, searchQuery);
  };

  // Handle Topic Filter
  const handleTopicClick = (topic: string) => {
    setActiveTopic(topic);
    fetchFeed(activeTab, topic, searchQuery);
  };

  // 3. Post Creation (Publish)
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerContent.trim()) {
      showToast("Please enter content for your post.");
      return;
    }

    try {
      setIsPublishing(true);
      const res = await fetch("/api/founders/feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          content: composerContent,
          postType: composerPostType,
          audience: composerAudience,
          associatedStartupId:
            composerPostType === "startup_announcement" || composerPostType === "hiring"
              ? composerStartupId
              : undefined,
          mediaUrls: composerMediaUrl.trim() ? [composerMediaUrl.trim()] : [],
          mediaType: composerMediaUrl.trim() ? "image" : "none",
          topics: composerTopics,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [data.post, ...prev]);
        setComposerContent("");
        setComposerMediaUrl("");
        setIsComposerOpen(false);
        showToast("Professional post published successfully!");
        fetchFeed();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to publish post.");
      }
    } catch (err) {
      console.error("Error publishing post:", err);
      showToast("Network error publishing post.");
    } finally {
      setIsPublishing(false);
    }
  };

  // 4. Toggle Like on Post
  const handleToggleLike = async (postId: string) => {
    try {
      // Optimistic UI update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const nextHasLiked = !p.hasLiked;
            return {
              ...p,
              hasLiked: nextHasLiked,
              likesCount: nextHasLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
            };
          }
          return p;
        })
      );

      const res = await fetch(`/api/founders/feed/${postId}/like`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, hasLiked: data.hasLiked, likesCount: data.likesCount } : p))
        );
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // 5. Toggle Save Post (Bookmark)
  const handleToggleSave = async (postId: string) => {
    try {
      const res = await fetch(`/api/founders/feed/${postId}/save`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, hasSaved: data.hasSaved } : p))
        );
        showToast(data.hasSaved ? "Saved to your Founders Bookmarks" : "Removed from Bookmarks");
        // Update saved count
        setTabCounts((prev) => ({
          ...prev,
          saved: data.hasSaved ? prev.saved + 1 : Math.max(0, prev.saved - 1),
        }));
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // 6. Share Post (Copy Link)
  const handleSharePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/founders/feed/${postId}/share`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, sharesCount: data.sharesCount } : p))
        );
        navigator.clipboard?.writeText(`${window.location.origin}/founders/feed#${postId}`);
        showToast("Post link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  // 7. Option A: Direct Repost
  const handleDirectRepost = async (postId: string) => {
    setOpenRepostDropdownId(null);
    try {
      const res = await fetch(`/api/founders/feed/${postId}/repost`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, hasReposted: data.hasReposted, repostsCount: data.repostsCount }
              : p
          )
        );
        showToast(data.message);
      }
    } catch (err) {
      console.error("Direct repost error:", err);
    }
  };

  // 8. Option B: Quote Post (Repost with Commentary)
  const handlePublishQuotePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModalPost || !quoteCommentary.trim()) {
      showToast("Please write your commentary before publishing.");
      return;
    }

    try {
      setIsSubmittingQuote(true);
      const res = await fetch(`/api/founders/feed/${quoteModalPost.id}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          commentary: quoteCommentary,
          audience: "public",
          topics: quoteModalPost.topics,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [data.post, ...prev]);
        setQuoteModalPost(null);
        setQuoteCommentary("");
        showToast("Quote post published to your network!");
      }
    } catch (err) {
      console.error("Quote post error:", err);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // 9. Fetch & Toggle Comments Drawer
  const handleToggleComments = async (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }

    setOpenCommentsPostId(postId);
    const sort = commentSortMap[postId] || "relevant";

    try {
      const res = await fetch(`/api/founders/feed/${postId}/comments?sort=${sort}`, {
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  // 10. Add Comment or Reply
  const handleAddComment = async (postId: string, parentId?: string) => {
    const text = parentId
      ? replyInputMap[parentId]?.trim()
      : commentInputMap[postId]?.trim();

    if (!text) return;

    try {
      setIsSubmittingComment(true);
      const res = await fetch(`/api/founders/feed/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          content: text,
          parentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (parentId) {
          setReplyInputMap((prev) => ({ ...prev, [parentId]: "" }));
          setActiveReplyCommentId(null);
        } else {
          setCommentInputMap((prev) => ({ ...prev, [postId]: "" }));
        }

        // Re-fetch comments for freshness
        const sort = commentSortMap[postId] || "relevant";
        const cRes = await fetch(`/api/founders/feed/${postId}/comments?sort=${sort}`, {
          headers: {
            "x-platform-world": "founders",
            "x-mock-user": "true",
          },
        });
        if (cRes.ok) {
          const cData = await cRes.json();
          setCommentsMap((prev) => ({ ...prev, [postId]: cData.comments || [] }));
        }

        // Update post comment count
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: data.commentsCount } : p))
        );
        showToast("Comment added!");
      }
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 11. Like a Comment
  const handleLikeComment = async (commentId: string, postId: string) => {
    try {
      const res = await fetch(`/api/founders/feed/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCommentsMap((prev) => {
          const current = prev[postId] || [];
          const updated = current.map((c) => {
            if (c.id === commentId) {
              return { ...c, hasLiked: data.hasLiked, likesCount: data.likesCount };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? { ...r, hasLiked: data.hasLiked, likesCount: data.likesCount }
                    : r
                ),
              };
            }
            return c;
          });
          return { ...prev, [postId]: updated };
        });
      }
    } catch (err) {
      console.error("Like comment error:", err);
    }
  };

  // 12. Delete Comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      const res = await fetch(`/api/founders/feed/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        showToast("Comment deleted");
        setCommentsMap((prev) => {
          const current = prev[postId] || [];
          const filtered = current
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== commentId),
            }));
          return { ...prev, [postId]: filtered };
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
          )
        );
      }
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  // 13. Delete Post
  const handleDeletePost = async (postId: string) => {
    setOpenPostMenuId(null);
    if (!confirm("Are you sure you want to permanently delete this post?")) return;

    try {
      const res = await fetch(`/api/founders/feed/${postId}`, {
        method: "DELETE",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast("Post deleted successfully");
      }
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  // 14. Report Post
  const handleReportPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalPost) return;

    try {
      setIsSubmittingReport(true);
      const res = await fetch(`/api/founders/feed/${reportModalPost.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });

      if (res.ok) {
        setReportModalPost(null);
        setReportDetails("");
        showToast("Post reported to platform moderation team. Thank you.");
      }
    } catch (err) {
      console.error("Report post error:", err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // 15. Follow / Unfollow Founder
  const handleToggleFollow = async (authorId: string, authorName: string) => {
    try {
      const res = await fetch(`/api/founders/feed/authors/${authorId}/follow`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.authorId === authorId ? { ...p, isFollowing: data.isFollowing } : p))
        );
        setSuggestedFounders((prev) =>
          prev.map((f) => (f.id === authorId ? { ...f, isFollowing: data.isFollowing } : f))
        );
        showToast(data.isFollowing ? `Now following ${authorName}` : `Unfollowed ${authorName}`);
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  // 16. Mute Author
  const handleMuteAuthor = async (authorId: string, authorName: string) => {
    setOpenPostMenuId(null);
    try {
      const res = await fetch(`/api/founders/feed/authors/${authorId}/mute`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.authorId !== authorId));
        showToast(`${authorName}'s posts muted from your feed`);
      }
    } catch (err) {
      console.error("Mute error:", err);
    }
  };

  // 17. Block Author
  const handleBlockAuthor = async (authorId: string, authorName: string) => {
    setOpenPostMenuId(null);
    if (!confirm(`Are you sure you want to block ${authorName}? You won't see their posts or network profile.`)) return;

    try {
      const res = await fetch(`/api/founders/feed/authors/${authorId}/block`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.authorId !== authorId));
        showToast(`${authorName} has been blocked.`);
      }
    } catch (err) {
      console.error("Block error:", err);
    }
  };

  // Helper: Post Type Badges
  const renderPostTypeBadge = (type: PostType) => {
    switch (type) {
      case "product_launch":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Rocket className="w-2.5 h-2.5" /> Product Launch
          </span>
        );
      case "startup_announcement":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-2.5 h-2.5" /> Announcement
          </span>
        );
      case "hiring":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Briefcase className="w-2.5 h-2.5" /> We're Hiring
          </span>
        );
      case "opportunity":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <UserPlus className="w-2.5 h-2.5" /> Opportunity
          </span>
        );
      case "question":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <HelpCircle className="w-2.5 h-2.5" /> Question
          </span>
        );
      case "milestone":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Award className="w-2.5 h-2.5" /> Milestone
          </span>
        );
      case "collaboration":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Handshake className="w-2.5 h-2.5" /> Collaboration
          </span>
        );
      default:
        return null;
    }
  };

  // Helper: Audience Icon
  const renderAudienceIcon = (audience: AudienceType) => {
    switch (audience) {
      case "connections":
        return (
          <span title="Connections Only">
            <Users className="w-3 h-3 text-slate-400" />
          </span>
        );
      case "founders":
        return (
          <span title="Founders Realm Only">
            <Shield className="w-3 h-3 text-emerald-400" />
          </span>
        );
      case "only_me":
        return (
          <span title="Only Me (Draft)">
            <Lock className="w-3 h-3 text-rose-400" />
          </span>
        );
      case "public":
      default:
        return (
          <span title="Public">
            <Globe className="w-3 h-3 text-slate-400" />
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* ========================================================
            COLUMN 1 (LEFT): USER IDENTITY & NAVIGATION SHORTCUTS
        ======================================================== */}
        <aside className="hidden lg:block md:col-span-3 space-y-4 select-none">
          {/* Identity Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm backdrop-blur">
            <div className="h-16 w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
            </div>

            <div className="px-4 pb-4 pt-0 text-center relative">
              <div
                className="relative -mt-9 mb-2 inline-block cursor-pointer group"
                onClick={() => onNavigateTab && onNavigateTab("profile")}
              >
                <div className="w-16 h-16 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden mx-auto flex items-center justify-center font-bold text-xl text-emerald-400 shadow-md group-hover:ring-2 ring-emerald-500/40 transition-all">
                  {founderProfile?.avatarUrl ? (
                    <img
                      src={founderProfile.avatarUrl}
                      alt={founderProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{founderProfile?.displayName ? founderProfile.displayName[0] : "A"}</span>
                  )}
                </div>
              </div>

              <h2
                onClick={() => onNavigateTab && onNavigateTab("profile")}
                className="font-bold text-sm text-white hover:text-emerald-400 cursor-pointer transition-colors"
              >
                {founderProfile?.displayName || "Aarav Sharma"}
              </h2>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                {founderProfile?.headline || "Full-Stack Architect & AI Product Founder"}
              </p>
            </div>

            {/* Profile Metrics */}
            <div className="border-t border-slate-800/80 px-4 py-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 hover:text-white cursor-pointer transition-colors">
                <span>Profile views</span>
                <span className="font-bold text-emerald-400">142</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 hover:text-white cursor-pointer transition-colors">
                <span>Post impressions</span>
                <span className="font-bold text-white">1,820</span>
              </div>
            </div>

            {/* Shortcut links */}
            <div className="border-t border-slate-800/80 p-2 text-xs space-y-1">
              <button
                onClick={() => onNavigateTab && onNavigateTab("dashboard")}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800/60 flex items-center gap-2 font-medium transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Command Center</span>
              </button>
              <button
                onClick={() => handleTabChange("saved")}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-medium transition-colors ${
                  activeTab === "saved"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved Posts</span>
                </div>
                {tabCounts.saved > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-bold">
                    {tabCounts.saved}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Startups Mini Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
              My Startup Affiliations
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div>
                  <span className="font-bold text-slate-200 block">NovaTech Systems</span>
                  <span className="text-[10px] text-slate-400">Founder & CTO • Seed</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div>
                  <span className="font-bold text-slate-200 block">BharatFin Mesh</span>
                  <span className="text-[10px] text-slate-400">Co-Founder & Architect</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================
            COLUMN 2 (CENTER): FEED TABS, COMPOSER & POSTS STREAM
        ======================================================== */}
        <main className="md:col-span-12 lg:col-span-6 space-y-4">
          {/* 1. TOP START A POST COMPOSER */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-sm text-emerald-400 shrink-0 cursor-pointer"
                onClick={() => onNavigateTab && onNavigateTab("profile")}
              >
                {founderProfile?.avatarUrl ? (
                  <img
                    src={founderProfile.avatarUrl}
                    alt={founderProfile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{founderProfile?.displayName ? founderProfile.displayName[0] : "A"}</span>
                )}
              </div>
              <button
                onClick={() => setIsComposerOpen(true)}
                className="flex-1 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-full py-2.5 px-4 text-xs text-left text-slate-400 transition-colors font-medium flex items-center justify-between"
              >
                <span>Start a post, announce a milestone, or discuss startup tech...</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center justify-around pt-2 text-xs text-slate-300 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setComposerPostType("general");
                  setIsComposerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
              >
                <Image className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-medium">Media</span>
              </button>
              <button
                onClick={() => {
                  setComposerPostType("product_launch");
                  setIsComposerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
              >
                <Rocket className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-medium">Launch</span>
              </button>
              <button
                onClick={() => {
                  setComposerPostType("startup_announcement");
                  setIsComposerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-medium">Announce</span>
              </button>
              <button
                onClick={() => {
                  setComposerPostType("hiring");
                  setIsComposerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-medium">Hiring</span>
              </button>
            </div>
          </div>

          {/* 2. FEED TABS BAR (For You, Following, Latest, Saved) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 shadow-sm flex items-center justify-between gap-1 overflow-x-auto select-none">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleTabChange("for_you")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "for_you"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>For You</span>
              </button>

              <button
                onClick={() => handleTabChange("following")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "following"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Following</span>
                {tabCounts.following > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white font-bold">
                    {tabCounts.following}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange("latest")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "latest"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>

              <button
                onClick={() => handleTabChange("saved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "saved"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved</span>
                {tabCounts.saved > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white font-bold">
                    {tabCounts.saved}
                  </span>
                )}
              </button>
            </div>

            {/* Keyword Search Bar */}
            <div className="relative shrink-0 hidden sm:block">
              <input
                type="text"
                placeholder="Filter posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchFeed(activeTab, activeTopic, e.target.value);
                }}
                className="w-32 focus:w-44 bg-slate-950/80 border border-slate-800 text-[11px] text-slate-200 placeholder:text-slate-500 rounded-xl pl-7 pr-2.5 py-1.5 focus:outline-none focus:border-emerald-500 transition-all"
              />
              <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 3. HORIZONTAL SCROLLING TOPIC FILTERS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none text-xs">
            {topicOptions.map((topic) => {
              const isSelected = activeTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950"
                      : "bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {topic === "All Topics" ? "🔥 All Topics" : `#${topic}`}
                </button>
              );
            })}
          </div>

          {/* 4. POSTS STREAM */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-28 h-3.5 bg-slate-800 rounded" />
                      <div className="w-48 h-2.5 bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-12 bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">No posts in this feed tab yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {activeTab === "saved"
                  ? "You haven't bookmarked any posts yet. Click the bookmark icon on any post to save it for quick reference."
                  : activeTab === "following"
                  ? "You are not following any founders with posts in this topic. Explore Suggested Founders on the right!"
                  : "Be the first to share an architectural milestone, product launch, or discussion with the Balaga Founders community."}
              </p>
              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-950"
              >
                Create a Post
              </button>
            </div>
          ) : (
            posts.map((post) => {
              const isAuthor = post.authorId === (founderProfile?.id || "20000000-0000-0000-0000-000000000001");
              const isCommentsOpen = openCommentsPostId === post.id;
              const postComments = commentsMap[post.id] || [];

              return (
                <article
                  key={post.id}
                  id={post.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative hover:border-slate-700/80 transition-colors"
                >
                  {/* Direct Repost Header Banner */}
                  {post.isDirectRepost && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pb-1 border-b border-slate-800/60">
                      <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{post.repostedByAuthorName || "Aarav Sharma"} reposted</span>
                    </div>
                  )}

                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() =>
                          setSelectedFounder({
                            id: post.authorId,
                            displayName: post.authorName,
                            username: post.username,
                            headline: post.authorHeadline,
                            avatarUrl: post.authorAvatar || undefined,
                            connectionsCount: "420+",
                            experience: [],
                            skills: [],
                          })
                        }
                        className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-sm text-emerald-400 cursor-pointer shrink-0 hover:ring-2 ring-emerald-500/30 transition-all"
                      >
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{post.authorName ? post.authorName[0] : "F"}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() =>
                              setSelectedFounder({
                                id: post.authorId,
                                displayName: post.authorName,
                                username: post.username,
                                headline: post.authorHeadline,
                                avatarUrl: post.authorAvatar || undefined,
                                connectionsCount: "420+",
                                experience: [],
                                skills: [],
                              })
                            }
                            className="font-bold text-sm text-white hover:text-emerald-400 cursor-pointer transition-colors"
                          >
                            {post.authorName}
                          </span>

                          <span className="text-[10px] text-slate-400">@{post.username}</span>

                          {renderPostTypeBadge(post.postType)}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                          {post.authorHeadline}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span>
                            {new Date(post.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            {renderAudienceIcon(post.audience)}
                            <span className="capitalize">{post.audience.replace("_", " ")}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* More Menu Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenPostMenuId(openPostMenuId === post.id ? null : post.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openPostMenuId === post.id && (
                        <div className="absolute right-0 top-8 z-30 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 text-xs space-y-0.5">
                          {isAuthor ? (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Post</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setOpenPostMenuId(null);
                                  handleToggleFollow(post.authorId, post.authorName);
                                }}
                                className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{post.isFollowing ? "Unfollow Author" : "Follow Author"}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenPostMenuId(null);
                                  handleMuteAuthor(post.authorId, post.authorName);
                                }}
                                className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                              >
                                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                                <span>Mute Author</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenPostMenuId(null);
                                  handleBlockAuthor(post.authorId, post.authorName);
                                }}
                                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Block Author</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenPostMenuId(null);
                                  setReportModalPost(post);
                                }}
                                className="w-full text-left px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-lg flex items-center gap-2 border-t border-slate-800/80"
                              >
                                <Flag className="w-3.5 h-3.5 text-rose-400" />
                                <span>Report Post</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-xs sm:text-[13px] text-slate-200 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Topic Hashtag Pills */}
                  {post.topics && post.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.topics.map((t) => (
                        <span
                          key={t}
                          onClick={() => handleTopicClick(t)}
                          className="text-[11px] text-emerald-400/90 hover:text-emerald-300 cursor-pointer font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Media (Images/Video) */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mt-2">
                      <img
                        src={post.mediaUrls[0]}
                        alt="Post media"
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Link Preview Card */}
                  {post.linkPreview && (
                    <a
                      href={post.linkPreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                        External Reference
                      </span>
                      <span className="font-bold text-xs text-white block mt-0.5">
                        {post.linkPreview.title}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {post.linkPreview.description}
                      </p>
                    </a>
                  )}

                  {/* Option B: Embedded Quote Card */}
                  {post.repostedPost && (
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-[10px] font-bold text-emerald-400">
                          {post.repostedPost.authorAvatar ? (
                            <img
                              src={post.repostedPost.authorAvatar}
                              alt={post.repostedPost.authorName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{post.repostedPost.authorName[0]}</span>
                          )}
                        </div>
                        <span className="font-bold text-xs text-white">
                          {post.repostedPost.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {post.repostedPost.authorHeadline}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {post.repostedPost.content}
                      </p>
                    </div>
                  )}

                  {/* Associated Startup Chip */}
                  {post.associatedStartup && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🚀</span>
                        <div>
                          <span className="font-bold text-slate-200 block">
                            {post.associatedStartup.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {post.associatedStartup.stage} • {post.associatedStartup.industry}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                        Verified
                      </span>
                    </div>
                  )}

                  {/* Social Counters Bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/70">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                        👍
                      </span>
                      <span>{post.likesCount} likes</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        onClick={() => handleToggleComments(post.id)}
                        className="cursor-pointer hover:text-slate-200"
                      >
                        {post.commentsCount} comments
                      </span>
                      <span>•</span>
                      <span>{post.repostsCount} reposts</span>
                      <span>•</span>
                      <span>{post.sharesCount} shares</span>
                    </div>
                  </div>

                  {/* Engagement Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/70 text-xs font-semibold relative">
                    {/* 1. Like */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors ${
                        post.hasLiked
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${post.hasLiked ? "fill-emerald-400" : ""}`}
                      />
                      <span>Like</span>
                    </button>

                    {/* 2. Comment */}
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors ${
                        isCommentsOpen
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Comment</span>
                    </button>

                    {/* 3. Repost Dropdown */}
                    <div className="flex-1 relative">
                      <button
                        onClick={() =>
                          setOpenRepostDropdownId(
                            openRepostDropdownId === post.id ? null : post.id
                          )
                        }
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors ${
                          post.hasReposted
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <Repeat2 className="w-4 h-4" />
                        <span>Repost</span>
                      </button>

                      {openRepostDropdownId === post.id && (
                        <div className="absolute left-0 bottom-11 z-30 w-52 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 text-xs space-y-1">
                          <button
                            onClick={() => handleDirectRepost(post.id)}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-start gap-2"
                          >
                            <Repeat2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold block">
                                {post.hasReposted ? "Undo Repost" : "Repost"}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Instantly share with your followers
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setOpenRepostDropdownId(null);
                              setQuoteModalPost(post);
                            }}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-start gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold block">Repost with thoughts</span>
                              <span className="text-[10px] text-slate-400 block">
                                Add your perspective or insights
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 4. Save */}
                    <button
                      onClick={() => handleToggleSave(post.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors ${
                        post.hasSaved
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${post.hasSaved ? "fill-emerald-400" : ""}`}
                      />
                      <span>Save</span>
                    </button>

                    {/* 5. Share */}
                    <button
                      onClick={() => handleSharePost(post.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* 5. EXPANDABLE COMMENTS DRAWER */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      {/* Sort Toggle Bar */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span className="font-bold text-slate-300">Discussion ({post.commentsCount})</span>
                        <div className="flex items-center gap-1.5">
                          <span>Sort by:</span>
                          <select
                            value={commentSortMap[post.id] || "relevant"}
                            onChange={async (e) => {
                              const newSort = e.target.value as "relevant" | "newest";
                              setCommentSortMap((prev) => ({ ...prev, [post.id]: newSort }));
                              const res = await fetch(`/api/founders/feed/${post.id}/comments?sort=${newSort}`, {
                                headers: { "x-platform-world": "founders", "x-mock-user": "true" },
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setCommentsMap((prev) => ({ ...prev, [post.id]: data.comments || [] }));
                              }
                            }}
                            className="bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 rounded-lg px-2 py-0.5 focus:outline-none"
                          >
                            <option value="relevant">Most Relevant</option>
                            <option value="newest">Newest First</option>
                          </select>
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                          {founderProfile?.avatarUrl ? (
                            <img
                              src={founderProfile.avatarUrl}
                              alt={founderProfile.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>A</span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Add a constructive thought or ask a question..."
                          value={commentInputMap[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1 bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputMap[post.id]?.trim() || isSubmittingComment}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all"
                        >
                          Comment
                        </button>
                      </div>

                      {/* Comments List */}
                      {postComments.length === 0 ? (
                        <p className="text-center text-xs text-slate-500 py-3">
                          No comments yet. Start the professional conversation!
                        </p>
                      ) : (
                        <div className="space-y-3 pt-2">
                          {postComments.map((comment) => (
                            <div key={comment.id} className="space-y-2">
                              {/* Top-Level Comment */}
                              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-200">
                                      {comment.author?.displayName || "Founder"}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  {(comment.authorId === (founderProfile?.id || "20000000-0000-0000-0000-000000000001") ||
                                    isAuthor) && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                      className="text-slate-500 hover:text-rose-400 p-1"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-slate-300 leading-relaxed">{comment.content}</p>

                                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-semibold">
                                  <button
                                    onClick={() => handleLikeComment(comment.id, post.id)}
                                    className={`flex items-center gap-1 hover:text-emerald-400 ${
                                      comment.hasLiked ? "text-emerald-400" : ""
                                    }`}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{comment.likesCount}</span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setActiveReplyCommentId(
                                        activeReplyCommentId === comment.id ? null : comment.id
                                      )
                                    }
                                    className="hover:text-emerald-400"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>

                              {/* Nested Reply Input */}
                              {activeReplyCommentId === comment.id && (
                                <div className="pl-6 flex items-center gap-2">
                                  <CornerDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <input
                                    type="text"
                                    placeholder={`Reply to ${comment.author?.displayName || "Founder"}...`}
                                    value={replyInputMap[comment.id] || ""}
                                    onChange={(e) =>
                                      setReplyInputMap((prev) => ({
                                        ...prev,
                                        [comment.id]: e.target.value,
                                      }))
                                    }
                                    className="flex-1 bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post.id, comment.id)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                                  >
                                    Reply
                                  </button>
                                </div>
                              )}

                              {/* Nested Replies List */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="pl-6 space-y-2 border-l border-slate-800/80 ml-3">
                                  {comment.replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs space-y-1"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-200">
                                          {reply.author?.displayName || "Founder"}
                                        </span>
                                        {(reply.authorId === (founderProfile?.id || "20000000-0000-0000-0000-000000000001") ||
                                          isAuthor) && (
                                          <button
                                            onClick={() => handleDeleteComment(reply.id, post.id)}
                                            className="text-slate-500 hover:text-rose-400 p-0.5"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-slate-300">{reply.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </main>

        {/* ========================================================
            COLUMN 3 (RIGHT): SECONDARY DISCOVERY & TRENDING
        ======================================================== */}
        <aside className="hidden lg:block md:col-span-3 space-y-4 select-none">
          {/* 1. Suggested Founders Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 backdrop-blur">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
              Suggested Founders
            </span>
            <div className="space-y-3">
              {suggestedFounders.map((founder) => (
                <div key={founder.id} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      onClick={() =>
                        setSelectedFounder({
                          id: founder.id,
                          displayName: founder.displayName,
                          username: founder.username,
                          headline: founder.headline,
                          avatarUrl: founder.avatarUrl || undefined,
                          connectionsCount: "350+",
                          experience: [],
                          skills: (founder.skills || []).map((s: string) => ({ name: s, endorsementsCount: 12 })),
                        })
                      }
                      className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0 cursor-pointer"
                    >
                      {founder.avatarUrl ? (
                        <img
                          src={founder.avatarUrl}
                          alt={founder.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{founder.displayName[0]}</span>
                      )}
                    </div>
                    <div>
                      <span
                        onClick={() =>
                          setSelectedFounder({
                            id: founder.id,
                            displayName: founder.displayName,
                            username: founder.username,
                            headline: founder.headline,
                            avatarUrl: founder.avatarUrl || undefined,
                            connectionsCount: "350+",
                            experience: [],
                            skills: (founder.skills || []).map((s: string) => ({ name: s, endorsementsCount: 12 })),
                          })
                        }
                        className="font-bold text-slate-200 block hover:text-emerald-400 cursor-pointer transition-colors"
                      >
                        {founder.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 block">
                        {founder.headline}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(founder.id, founder.displayName)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                      founder.isFollowing
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {founder.isFollowing ? "Following" : "+ Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Trending Topics Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 backdrop-blur">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
              Trending Topics in India
            </span>
            <div className="space-y-2">
              {trendingTopics.map((topic) => (
                <div
                  key={topic.name}
                  onClick={() => handleTopicClick(topic.name)}
                  className="flex items-center justify-between text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  <span className="font-medium">#{topic.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{topic.count} posts</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Trending Startups Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 backdrop-blur">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
              Trending Startups
            </span>
            <div className="space-y-2.5">
              {trendingStartups.map((st) => (
                <div key={st.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{st.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                      {st.stage}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{st.oneLiner}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Recent Product Launches */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 backdrop-blur">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
              Recent Product Launches
            </span>
            <div className="space-y-2.5">
              {recentLaunches.map((prod) => (
                <div key={prod.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{prod.name}</span>
                    <span className="text-[10px] font-bold text-amber-400">
                      ▲ {prod.upvotesCount}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{prod.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================
          MODAL 1: CREATE POST COMPOSER (8 Post Types & Audience)
      ======================================================== */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Create Professional Post</span>
              </h3>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4">
              {/* Author & Visibility Controls */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400">
                    {founderProfile?.avatarUrl ? (
                      <img
                        src={founderProfile.avatarUrl}
                        alt={founderProfile.displayName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>A</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {founderProfile?.displayName || "Aarav Sharma"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Posting as Founder
                    </span>
                  </div>
                </div>

                {/* Audience Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Audience:</span>
                  <select
                    value={composerAudience}
                    onChange={(e) => setComposerAudience(e.target.value as AudienceType)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="public">🌐 Public (All)</option>
                    <option value="founders">🏢 Founders Only</option>
                    <option value="connections">🤝 Connections Only</option>
                    <option value="only_me">🔒 Only Me (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Post Type Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Post Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: "general", label: "General", icon: Sparkles },
                    { id: "startup_announcement", label: "Announcement", icon: Award },
                    { id: "product_launch", label: "Product Launch", icon: Rocket },
                    { id: "hiring", label: "Hiring", icon: Briefcase },
                    { id: "opportunity", label: "Opportunity", icon: UserPlus },
                    { id: "question", label: "Question", icon: HelpCircle },
                    { id: "milestone", label: "Milestone", icon: CheckCircle2 },
                    { id: "collaboration", label: "Collaboration", icon: Handshake },
                  ].map((pt) => {
                    const Icon = pt.icon;
                    const isSelected = composerPostType === pt.id;
                    return (
                      <button
                        type="button"
                        key={pt.id}
                        onClick={() => setComposerPostType(pt.id as PostType)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold"
                            : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{pt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Startup Affiliation Selector (If announcement or hiring) */}
              {(composerPostType === "startup_announcement" || composerPostType === "hiring") && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-emerald-400 block">
                    Authorized Startup Affiliation
                  </label>
                  <select
                    value={composerStartupId}
                    onChange={(e) => setComposerStartupId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="st-dev">NovaTech Systems (Owner)</option>
                    <option value="st-mesh">BharatFin Mesh (Co-Founder)</option>
                  </select>
                </div>
              )}

              {/* Post Content Textarea */}
              <div className="space-y-1">
                <textarea
                  rows={4}
                  placeholder="Share engineering breakthroughs, product telemetry benchmarks, or hiring openings..."
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 text-xs sm:text-[13px] text-white placeholder:text-slate-500 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Optional Media URL */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Image className="w-3.5 h-3.5 text-blue-400" />
                  <span>Media Image URL (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={composerMediaUrl}
                  onChange={(e) => setComposerMediaUrl(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Topics Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Topics
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {topicOptions
                    .filter((t) => t !== "All Topics")
                    .map((t) => {
                      const isSelected = composerTopics.includes(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() =>
                            setComposerTopics((prev) =>
                              isSelected ? prev.filter((item) => item !== t) : [...prev, t]
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          #{t}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || !composerContent.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5"
                >
                  {isPublishing ? "Publishing..." : "Publish to Feed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: QUOTE REPOST (Repost with Commentary)
      ======================================================== */}
      {quoteModalPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Repost with Your Thoughts</span>
              </h3>
              <button
                onClick={() => setQuoteModalPost(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishQuotePost} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Add your perspective, benchmark takeaways, or tag colleagues..."
                value={quoteCommentary}
                onChange={(e) => setQuoteCommentary(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />

              {/* Original Post Preview */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">
                    {quoteModalPost.authorName}
                  </span>
                  <span className="text-[10px] text-slate-400">• {quoteModalPost.authorHeadline}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {quoteModalPost.content}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuoteModalPost(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote || !quoteCommentary.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl"
                >
                  {isSubmittingQuote ? "Publishing..." : "Publish Quote Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: REPORT POST FOR MODERATION
      ======================================================== */}
      {reportModalPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Report Post</span>
              </h3>
              <button
                onClick={() => setReportModalPost(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportPost} className="space-y-3 text-xs">
              <p className="text-slate-400">
                Help us keep the Founders realm professional and safe. Why are you reporting this post?
              </p>

              <div className="space-y-1.5">
                {[
                  { id: "spam", label: "Spam or promotional abuse" },
                  { id: "harassment", label: "Harassment or unprofessional conduct" },
                  { id: "misinformation", label: "False claims or financial misinformation" },
                  { id: "ip_violation", label: "Intellectual property or trade secret infringement" },
                  { id: "other", label: "Other platform violation" },
                ].map((reason) => (
                  <label
                    key={reason.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer text-slate-300 hover:bg-slate-800/60"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.id}
                      checked={reportReason === reason.id}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context for our platform moderators..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportModalPost(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
                >
                  {isSubmittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: FOUNDER PUBLIC PROFILE MODAL
      ======================================================== */}
      {selectedFounder && (
        <FounderPublicProfileModal
          founder={selectedFounder}
          isOpen={!!selectedFounder}
          onClose={() => setSelectedFounder(null)}
          onConnect={() => {
            showToast(`Connection request sent to ${selectedFounder.displayName}`);
          }}
          onMessage={() => {
            showToast(`Private founder chat opened with ${selectedFounder.displayName}`);
          }}
        />
      )}
    </div>
  );
};
