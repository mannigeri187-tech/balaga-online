import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Star,
  Pin,
  Archive,
  VolumeX,
  Volume2,
  CheckCheck,
  Check,
  Clock,
  Plus,
  Users,
  Paperclip,
  Trash2,
  Edit2,
  Reply,
  X,
  Shield,
  Loader2,
  Info,
  Folder,
} from "lucide-react";
import {
  FoundersConversation,
  FoundersMessage,
  FoundersMessageRequest,
  FoundersInboxSummary,
} from "@platform/shared-types";
import {
  FOUNDERS_INBOX_DISCLAIMER,
  FoundersInboxCategory,
  FoundersInboxView,
} from "@platform/config";

const CATEGORIES: { label: string; value: FoundersInboxCategory | "all" }[] = [
  { label: "All Categories", value: "all" },
  { label: "Professional", value: "professional" },
  { label: "Cofounder", value: "cofounder" },
  { label: "Opportunities", value: "opportunities" },
  { label: "Hiring", value: "hiring" },
  { label: "Collaborations", value: "collaborations" },
  { label: "Referrals", value: "referrals" },
  { label: "Mentorship", value: "mentorship" },
  { label: "Investors", value: "investors" },
  { label: "Build Spaces", value: "build_spaces" },
];

const VIEWS: { label: string; value: FoundersInboxView }[] = [
  { label: "All Messages", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Starred", value: "starred" },
  { label: "Archived", value: "archived" },
  { label: "Message Requests", value: "requests" },
  { label: "Groups", value: "groups" },
  { label: "Workspaces", value: "workspaces" },
];

const REACTION_EMOJIS = ["👍", "❤️", "🚀", "💡", "🔥"];

export const FoundersInbox: React.FC = () => {
  const [conversations, setConversations] = useState<FoundersConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FoundersMessage[]>([]);
  const [selectedView, setSelectedView] = useState<FoundersInboxView>("all");
  const [selectedCategory, setSelectedCategory] = useState<FoundersInboxCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState<FoundersInboxSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Message compose state
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState<FoundersMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<FoundersMessage | null>(null);
  const [attachments, setAttachments] = useState<{ id: string; name: string; url: string; fileType: "document" | "image"; sizeBytes: number }[]>([]);

  // Requests state
  const [requests, setRequests] = useState<FoundersMessageRequest[]>([]);
  const [requestTab, setRequestTab] = useState<"incoming" | "sent">("incoming");

  // UI Drawer & Modals
  const [showRightDetails, setShowRightDetails] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState<FoundersInboxCategory>("professional");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/founders/inbox/summary", {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedView !== "all") params.set("view", selectedView);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/founders/inbox?${params.toString()}`, {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        const convs: FoundersConversation[] = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0 && !activeConversationId && selectedView !== "requests") {
          setActiveConversationId(convs[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/founders/inbox/requests?type=${requestTab}`, {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId: string) => {
    try {
      setMessagesLoading(true);
      const res = await fetch(`/api/founders/inbox/conversations/${convId}/messages`, {
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (selectedView === "requests") {
      fetchRequests();
    } else {
      fetchConversations();
    }
  }, [selectedView, selectedCategory, searchQuery, requestTab]);

  useEffect(() => {
    if (activeConversationId && selectedView !== "requests") {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && attachments.length === 0) return;
    if (!activeConversationId) return;

    if (editingMessage) {
      // Edit mode
      try {
        const res = await fetch(
          `/api/founders/inbox/conversations/${activeConversationId}/messages/${editingMessage.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-platform-world": "founders",
              "x-mock-user": "true",
            },
            body: JSON.stringify({ content: messageText }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => prev.map((m) => (m.id === editingMessage.id ? data.message : m)));
          setEditingMessage(null);
          setMessageText("");
        }
      } catch (err) {
        console.error("Error editing message:", err);
      }
      return;
    }

    // Normal Send
    try {
      const res = await fetch(
        `/api/founders/inbox/conversations/${activeConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-platform-world": "founders",
            "x-mock-user": "true",
          },
          body: JSON.stringify({
            content: messageText,
            replyToId: replyingTo ? replyingTo.id : undefined,
            attachments: attachments.length > 0 ? attachments : undefined,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setMessageText("");
        setReplyingTo(null);
        setAttachments([]);
        fetchConversations();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    if (!activeConversationId) return;
    try {
      const res = await fetch(
        `/api/founders/inbox/conversations/${activeConversationId}/messages/${msgId}`,
        {
          method: "DELETE",
          headers: { "x-platform-world": "founders", "x-mock-user": "true" },
        }
      );
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, isDeleted: true, content: "[Message deleted by sender]" } : m))
        );
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // Toggle Reaction
  const handleToggleReaction = async (msgId: string, emoji: string) => {
    if (!activeConversationId) return;
    try {
      const res = await fetch(
        `/api/founders/inbox/conversations/${activeConversationId}/messages/${msgId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-platform-world": "founders",
            "x-mock-user": "true",
          },
          body: JSON.stringify({ emoji }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === msgId ? data.message : m)));
      }
    } catch (err) {
      console.error("Error toggling reaction:", err);
    }
  };

  // Update State (pin, star, archive, mute)
  const handleUpdateInboxState = async (
    convId: string,
    patch: { isPinned?: boolean; isStarred?: boolean; isArchived?: boolean; isMuted?: boolean; isUnread?: boolean }
  ) => {
    try {
      const res = await fetch(`/api/founders/inbox/conversations/${convId}/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        fetchConversations();
        fetchSummary();
      }
    } catch (err) {
      console.error("Error updating inbox state:", err);
    }
  };

  // Remove from personal inbox
  const handleRemoveFromInbox = async (convId: string) => {
    try {
      const res = await fetch(`/api/founders/inbox/conversations/${convId}/personal`, {
        method: "DELETE",
        headers: { "x-platform-world": "founders", "x-mock-user": "true" },
      });
      if (res.ok) {
        if (activeConversationId === convId) {
          setActiveConversationId(null);
        }
        fetchConversations();
        fetchSummary();
      }
    } catch (err) {
      console.error("Error removing conversation:", err);
    }
  };

  // Respond to request
  const handleRespondRequest = async (requestId: string, action: "accept" | "decline" | "withdraw") => {
    try {
      const res = await fetch(`/api/founders/inbox/requests/${requestId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchRequests();
        fetchSummary();
        if (action === "accept" && data.conversationId) {
          setSelectedView("all");
          setActiveConversationId(data.conversationId);
        }
      }
    } catch (err) {
      console.error("Error responding to request:", err);
    }
  };

  // Create group conversation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;

    try {
      const res = await fetch("/api/founders/inbox/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
          "x-mock-user": "true",
        },
        body: JSON.stringify({
          title: newGroupTitle.trim(),
          description: newGroupDescription.trim() || undefined,
          category: newGroupCategory,
          participantProfileIds: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewGroupModal(false);
        setNewGroupTitle("");
        setNewGroupDescription("");
        setSelectedView("groups");
        setActiveConversationId(data.conversation.id);
        fetchConversations();
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  // Category badge styling helper
  const getCategoryBadgeClass = (category: FoundersInboxCategory) => {
    switch (category) {
      case "professional":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "cofounder":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "opportunities":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "hiring":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "collaborations":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "referrals":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "mentorship":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "investors":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "build_spaces":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  // Group reaction array by emoji count
  const renderReactions = (msg: FoundersMessage) => {
    if (!msg.reactions || msg.reactions.length === 0) return null;
    const emojiMap: Record<string, number> = {};
    msg.reactions.forEach((r) => {
      emojiMap[r.emoji] = (emojiMap[r.emoji] || 0) + 1;
    });

    return (
      <div className="flex items-center gap-1 mt-1 flex-wrap">
        {Object.entries(emojiMap).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => handleToggleReaction(msg.id, emoji)}
            className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            {emoji} {count}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Founders Inbox</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Option A · Unified Center
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized professional messaging across all 9 startup and founder categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <strong className="text-white">{summary.totalConversations}</strong> Convs
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <strong className="text-emerald-300">{summary.unreadConversationsCount}</strong> Unread
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <strong className="text-amber-300">{summary.pendingRequestsCount}</strong> Requests
              </span>
            </div>
          )}
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Group
          </button>
        </div>
      </div>

      {/* Compliance & Regulatory Disclaimer */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-300">Notice: </strong>
          {FOUNDERS_INBOX_DISCLAIMER}
        </div>
      </div>

      {/* Search and Navigation Bar */}
      <div className="space-y-2">
        {/* View Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/60 scrollbar-none">
          {VIEWS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedView(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedView === tab.value
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {tab.label}
              {tab.value === "unread" && summary && summary.unreadConversationsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-bold">
                  {summary.unreadConversationsCount}
                </span>
              )}
              {tab.value === "requests" && summary && summary.pendingRequestsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                  {summary.pendingRequestsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Categories Bar & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations, titles or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedView === "requests" ? (
        /* ==================== MESSAGE REQUESTS VIEW ==================== */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRequestTab("incoming")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  requestTab === "incoming"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Incoming Requests
              </button>
              <button
                onClick={() => setRequestTab("sent")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  requestTab === "sent"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sent Requests
              </button>
            </div>
            <span className="text-xs text-slate-500">{requests.length} total</span>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Shield className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No {requestTab} message requests.</p>
              <p className="text-slate-500 text-[11px]">
                Direct messages from unconnected founders appear here until accepted.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {requestTab === "incoming" ? req.sender?.displayName || "Founder" : "To Recipient"}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getCategoryBadgeClass(
                          req.category
                        )}`}
                      >
                        {req.category.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {req.initialMessage && (
                      <p className="text-xs text-slate-300 italic">"{req.initialMessage}"</p>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Status: {req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {requestTab === "incoming" && req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleRespondRequest(req.id, "accept")}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, "decline")}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {requestTab === "sent" && req.status === "pending" && (
                      <button
                        onClick={() => handleRespondRequest(req.id, "withdraw")}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ==================== UNIFIED INBOX SPLIT VIEW ==================== */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[700px] shadow-2xl">
          {/* Left Column: Conversations List (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-800 flex flex-col h-full bg-slate-950/40">
            {/* Header / counter */}
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{conversations.length} Conversations</span>
              <span className="text-[11px] text-slate-500">Sorted by recent activity</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
              {isLoading ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                  <p>No conversations match your current filters.</p>
                  <p className="text-[11px] text-slate-600">Select another view or category.</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isPinned = conv.isPinned;
                  const isStarred = conv.isStarred;
                  const isMuted = conv.isMuted;
                  const unread = conv.unreadCount || 0;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`p-3 cursor-pointer transition-colors relative group flex items-start gap-3 ${
                        isActive
                          ? "bg-slate-800/80 border-l-4 border-emerald-500"
                          : "hover:bg-slate-900/70"
                      }`}
                    >
                      {/* Avatar with Chatwoot Presence Indicator */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg overflow-hidden">
                          {conv.avatarUrl || (conv.type === "group" ? "👥" : conv.type === "workspace" ? "🚀" : "💬")}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-sm" title="Online" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                            {isPinned && <Pin className="w-3 h-3 text-emerald-400 shrink-0 fill-emerald-400" />}
                            {conv.title}
                          </h3>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>

                        {/* Category & Indicators */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded border font-medium uppercase ${getCategoryBadgeClass(
                              conv.category
                            )}`}
                          >
                            {conv.category.replace("_", " ")}
                          </span>
                          {isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          {isMuted && <VolumeX className="w-3 h-3 text-slate-500" />}
                          {conv.type === "group" && (
                            <span className="text-[9px] text-slate-400">group</span>
                          )}
                          {conv.type === "workspace" && (
                            <span className="text-[9px] text-teal-400">workspace</span>
                          )}
                        </div>

                        {/* Last message preview */}
                        <p className="text-[11px] text-slate-400 truncate">
                          {conv.lastMessageSnippet || "No messages yet"}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Messages View (7 cols or split with drawer) */}
          <div
            className={`flex flex-col h-full bg-slate-900/30 ${
              showRightDetails ? "lg:col-span-5" : "lg:col-span-7"
            }`}
          >
            {activeConv ? (
              <>
                {/* Active Conversation Top Header */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-base shrink-0">
                      {activeConv.avatarUrl || (activeConv.type === "group" ? "👥" : "💬")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white truncate">{activeConv.title}</h2>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-semibold ${getCategoryBadgeClass(
                            activeConv.category
                          )}`}
                        >
                          {activeConv.category.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                        <span>·</span>
                        <span>{activeConv.participants?.length || 2} participants · {activeConv.description || "Active channel"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        handleUpdateInboxState(activeConv.id, {
                          isStarred: !activeConv.isStarred,
                        })
                      }
                      title={activeConv.isStarred ? "Unstar" : "Star"}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        activeConv.isStarred
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          activeConv.isStarred ? "fill-amber-400" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateInboxState(activeConv.id, {
                          isPinned: !activeConv.isPinned,
                        })
                      }
                      title={activeConv.isPinned ? "Unpin" : "Pin to top"}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        activeConv.isPinned
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Pin
                        className={`w-4 h-4 ${
                          activeConv.isPinned ? "fill-emerald-400" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateInboxState(activeConv.id, {
                          isArchived: !activeConv.isArchived,
                        })
                      }
                      title={activeConv.isArchived ? "Unarchive" : "Archive"}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateInboxState(activeConv.id, {
                          isMuted: !activeConv.isMuted,
                        })
                      }
                      title={activeConv.isMuted ? "Unmute" : "Mute"}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      {activeConv.isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowRightDetails(!showRightDetails)}
                      title="Toggle Details Drawer"
                      className={`p-1.5 rounded-lg border transition-colors ${
                        showRightDetails
                          ? "bg-slate-800 text-emerald-400 border-slate-700"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No messages yet in this conversation. Start the conversation below.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn =
                        msg.senderProfileId === "20000000-0000-0000-0000-000000000001"; // devFounderProfileId

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col group ${isOwn ? "items-end" : "items-start"}`}
                        >
                          {/* Sender name if group or non-own */}
                          {!isOwn && (
                            <span className="text-[10px] text-slate-400 mb-1 ml-1 font-medium">
                              {msg.sender?.displayName || "Founder"}
                            </span>
                          )}

                          {/* Message Bubble Container */}
                          <div className="relative max-w-[85%] sm:max-w-[75%]">
                            {/* Reply Quote Banner if present */}
                            {msg.replySnippet && (
                              <div className="mb-1 p-2 rounded-lg bg-slate-950/60 border-l-2 border-emerald-400 text-[10px] text-slate-400">
                                <span className="font-semibold text-slate-300">Replying to: </span>
                                <span className="truncate block">{msg.replySnippet}</span>
                              </div>
                            )}

                            {/* Main Content Bubble */}
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isOwn
                                  ? "bg-emerald-600/90 text-white rounded-br-xs shadow"
                                  : "bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60 shadow"
                              } ${msg.isDeleted ? "italic text-slate-400" : ""}`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                              {/* Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {msg.attachments.map((att, idx) => (
                                    <a
                                      key={idx}
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/40 text-[11px] text-emerald-300 hover:underline"
                                    >
                                      <Paperclip className="w-3 h-3" />
                                      <span className="truncate">{att.name}</span>
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* Metadata & Delivery State */}
                              <div
                                className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] ${
                                  isOwn ? "text-emerald-200" : "text-slate-400"
                                }`}
                              >
                                {msg.isEdited && <span>(edited)</span>}
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {isOwn && (
                                  <span>
                                    {msg.deliveryState === "read" ? (
                                      <CheckCheck className="w-3 h-3 text-cyan-300 inline" />
                                    ) : msg.deliveryState === "delivered" ? (
                                      <CheckCheck className="w-3 h-3 text-slate-300 inline" />
                                    ) : msg.deliveryState === "sent" ? (
                                      <Check className="w-3 h-3 text-slate-300 inline" />
                                    ) : (
                                      <Clock className="w-3 h-3 text-slate-400 inline" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Reactions display */}
                            {renderReactions(msg)}

                            {/* Hover Quick Action Buttons */}
                            {!msg.isDeleted && (
                              <div
                                className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-md ${
                                  isOwn ? "right-2" : "left-2"
                                }`}
                              >
                                <button
                                  onClick={() => setReplyingTo(msg)}
                                  title="Reply"
                                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                >
                                  <Reply className="w-3 h-3" />
                                </button>
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleToggleReaction(msg.id, emoji)}
                                    className="p-1 hover:bg-slate-800 rounded text-xs"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                                {isOwn && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingMessage(msg);
                                        setMessageText(msg.content);
                                      }}
                                      title="Edit"
                                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      title="Delete"
                                      className="p-1 hover:bg-slate-800 rounded text-rose-400 hover:text-rose-300"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Banner */}
                {replyingTo && (
                  <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <Reply className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium text-slate-300">
                        Replying to {replyingTo.sender?.displayName || "message"}:
                      </span>
                      <span className="truncate italic">"{replyingTo.content}"</span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Edit Message Banner */}
                {editingMessage && (
                  <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editing message...</span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingMessage(null);
                        setMessageText("");
                      }}
                      className="p-1 hover:bg-amber-500/20 rounded text-amber-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter file URL (PDF, JPG, PNG):");
                      if (url) {
                        setAttachments((prev) => [
                          ...prev,
                          {
                            id: `att-${Date.now()}`,
                            name: url.split("/").pop() || "attachment",
                            url,
                            fileType: url.endsWith(".pdf") ? "document" : "image",
                            sizeBytes: 1024,
                          },
                        ]);
                      }
                    }}
                    title="Attach file"
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={
                      editingMessage
                        ? "Edit your message..."
                        : "Type your message (Enter to send)..."
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() && attachments.length === 0}
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-700" />
                <p className="text-sm font-semibold text-slate-400">Select a conversation</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Choose an authorized conversation from the left to view message history, documents and discussions.
                </p>
              </div>
            )}
          </div>

          {/* Right Drawer: Conversation Details (2 cols when open) */}
          {showRightDetails && activeConv && (
            <div className="lg:col-span-2 border-l border-slate-800 p-4 space-y-4 bg-slate-950/90 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Details</h3>
                <button
                  onClick={() => setShowRightDetails(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Participants
                </h4>
                <div className="space-y-1.5">
                  {activeConv.participants?.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">
                          {p.profile?.displayName || p.profileId.slice(0, 8)}
                        </p>
                        <p className="text-[10px] text-slate-500 capitalize">{p.role}</p>
                      </div>
                      {p.role === "admin" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Entity */}
              {activeConv.relatedEntityType && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <h4 className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-blue-400" /> Linked Context
                  </h4>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                      {activeConv.relatedEntityType.replace("_", " ")}
                    </span>
                    {activeConv.spaceId && (
                      <p className="text-slate-300 text-[11px]">Space: {activeConv.spaceId}</p>
                    )}
                    {activeConv.startupId && (
                      <p className="text-slate-300 text-[11px]">Startup: {activeConv.startupId}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Danger Zone / Remove */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleRemoveFromInbox(activeConv.id)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                >
                  Remove from Inbox
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Create Group Conversation
              </h3>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Group Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru B2B SaaS Mastermind"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value as FoundersInboxCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="State the objective or guidelines for this group..."
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
