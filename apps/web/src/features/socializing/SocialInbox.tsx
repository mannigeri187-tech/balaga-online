import React, { useState } from "react";
import { SocialConversation, SocialMessage } from "@platform/shared-types";
import { useWorld } from "../../contexts/WorldContext";
import {
  MessageSquare,
  Search,
  Send,
  Image,
  ShieldAlert,
  MoreVertical,
  UserX,
  VolumeX,
  Flag,
  CheckCheck,
  Check,
  UploadCloud,
} from "lucide-react";

export interface ExtendedSocialMessage extends SocialMessage {
  deliveryState?: "sent" | "delivered" | "read";
  reactions?: Record<string, number>;
}

export interface InboxConversation extends SocialConversation {
  partner: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isBlocked?: boolean;
    isMuted?: boolean;
    presence?: "online" | "away" | "offline";
    lastSeen?: string;
  };
}

export const SocialInbox: React.FC = () => {
  const { socialProfile } = useWorld();

  const [activeTab, setActiveTab] = useState<"messages" | "requests">("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string>("conv-1");
  const [messageInput, setMessageInput] = useState("");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Conversations State
  const [conversations, setConversations] = useState<InboxConversation[]>([
    {
      id: "conv-1",
      isGroup: false,
      lastMessage: "Looking forward to seeing your sketches at Lalbagh this weekend!",
      lastMessageAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      unreadCount: 0,
      participants: [
        {
          conversationId: "conv-1",
          profileId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
          isAdmin: false,
          status: "accepted",
          joinedAt: new Date().toISOString(),
        },
        {
          conversationId: "conv-1",
          profileId: "10000000-0000-0000-0000-000000000002",
          isAdmin: false,
          status: "accepted",
          joinedAt: new Date().toISOString(),
        },
      ],
      partner: {
        id: "10000000-0000-0000-0000-000000000002",
        name: "Priya Rao",
        username: "priya_art",
        avatar: "🎨",
        isBlocked: false,
        isMuted: false,
        presence: "online",
        lastSeen: "Active now",
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "conv-2",
      isGroup: false,
      lastMessage: "What tire pressure do you run on the gravel detour?",
      lastMessageAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      unreadCount: 2,
      participants: [
        {
          conversationId: "conv-2",
          profileId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
          isAdmin: false,
          status: "accepted",
          joinedAt: new Date().toISOString(),
        },
        {
          conversationId: "conv-2",
          profileId: "10000000-0000-0000-0000-000000000003",
          isAdmin: false,
          status: "accepted",
          joinedAt: new Date().toISOString(),
        },
      ],
      partner: {
        id: "10000000-0000-0000-0000-000000000003",
        name: "Kabir Menon",
        username: "kabir_rides",
        avatar: "🚴",
        isBlocked: false,
        isMuted: false,
        presence: "away",
        lastSeen: "Active 15m ago",
      },
      createdAt: new Date().toISOString(),
    },
  ]);

  // Message Requests State
  const [requests, setRequests] = useState<
    Array<{ id: string; sender: { id: string; name: string; username: string; avatar: string; location: string }; message: string; time: string }>
  >([
    {
      id: "req-1",
      sender: {
        id: "10000000-0000-0000-0000-000000000006",
        name: "Sneha Nair",
        username: "sneha_shutter",
        avatar: "📷",
        location: "Bengaluru, Karnataka",
      },
      message: "Hi Aarav! Loved your street photography carousel from Malleshwaram. Would love to join the next photowalk!",
      time: "3h ago",
    },
  ]);

  // Active Messages Thread State
  const [messages, setMessages] = useState<Record<string, ExtendedSocialMessage[]>>({
    "conv-1": [
      {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "10000000-0000-0000-0000-000000000002",
        content: "Hey Aarav! Are you joining the Cubbon Park watercolor walk this Saturday?",
        mediaUrl: null,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        deliveryState: "read",
        reactions: { "🎨": 1 },
      },
      {
        id: "msg-2",
        conversationId: "conv-1",
        senderId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
        content: "Yes! Bringing my sketchbook and camera. Have you picked a spot near the bamboo grove?",
        mediaUrl: null,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        deliveryState: "read",
        reactions: { "👍": 1 },
      },
      {
        id: "msg-3",
        conversationId: "conv-1",
        senderId: "10000000-0000-0000-0000-000000000002",
        content: "Looking forward to seeing your sketches at Lalbagh this weekend!",
        mediaUrl: null,
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        deliveryState: "read",
        reactions: { "❤️": 1 },
      },
    ],
    "conv-2": [
      {
        id: "msg-4",
        conversationId: "conv-2",
        senderId: "10000000-0000-0000-0000-000000000003",
        content: "What tire pressure do you run on the gravel detour?",
        mediaUrl: null,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        deliveryState: "delivered",
        reactions: {},
      },
    ],
  });

  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleToggleReaction = (msgId: string, emoji: string) => {
    if (!activeConv) return;
    setMessages((prev) => {
      const convMsgs = prev[activeConv.id] || [];
      return {
        ...prev,
        [activeConv.id]: convMsgs.map((m) => {
          if (m.id !== msgId) return m;
          const currentReactions = { ...(m.reactions || {}) };
          if (currentReactions[emoji]) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          }
          return { ...m, reactions: currentReactions };
        }),
      };
    });
  };

  const activeConv = conversations.find((c) => c.id === selectedConversationId);
  const activeMessages = activeConv ? messages[activeConv.id] || [] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachedImage) || !activeConv) return;
    if (activeConv.partner.isBlocked) return;

    const userMsgText = messageInput.trim() || (attachedImage ? "📷 Photo" : "");
    const msgId = `msg-${Date.now()}`;

    const newMessage: ExtendedSocialMessage = {
      id: msgId,
      conversationId: activeConv.id,
      senderId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
      content: userMsgText,
      mediaUrl: attachedImage || null,
      createdAt: new Date().toISOString(),
      deliveryState: "sent",
      reactions: {},
    };

    setMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: userMsgText,
              lastMessageAt: new Date().toISOString(),
            }
          : c
      )
    );

    setMessageInput("");
    setAttachedImage(null);
    setShowImagePicker(false);

    // Chatwoot Real-Time Flow: Advance to delivered -> read -> simulated contextual reply
    const currentConvId = activeConv.id;
    const partner = activeConv.partner;

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [currentConvId]: (prev[currentConvId] || []).map((m) =>
          m.id === msgId ? { ...m, deliveryState: "delivered" } : m
        ),
      }));
    }, 400);

    if (partner.presence === "online") {
      setTimeout(() => {
        setIsPartnerTyping(true);
        setMessages((prev) => ({
          ...prev,
          [currentConvId]: (prev[currentConvId] || []).map((m) =>
            m.id === msgId ? { ...m, deliveryState: "read" } : m
          ),
        }));
      }, 900);

      setTimeout(() => {
        setIsPartnerTyping(false);
        const replyText =
          currentConvId === "conv-1"
            ? "Awesome! Can't wait to see your watercolor sketches. See you Saturday at Cubbon! 🎨✨"
            : "Good question! About 38 PSI gives you optimal cornering grip and avoids pinch flats on that gravel detour 🚴💨";

        const replyMsg: ExtendedSocialMessage = {
          id: `msg-${Date.now()}`,
          conversationId: currentConvId,
          senderId: partner.id,
          content: replyText,
          mediaUrl: null,
          createdAt: new Date().toISOString(),
          deliveryState: "read",
          reactions: {},
        };

        setMessages((prev) => ({
          ...prev,
          [currentConvId]: [...(prev[currentConvId] || []), replyMsg],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConvId
              ? {
                  ...c,
                  lastMessage: replyText,
                  lastMessageAt: new Date().toISOString(),
                }
              : c
          )
        );
      }, 2300);
    }
  };

  const handleToggleBlock = (convId: string) => {
    setConversations(
      conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              partner: { ...c.partner, isBlocked: !c.partner.isBlocked },
            }
          : c
      )
    );
    setIsOptionsOpen(false);
  };

  const handleToggleMute = (convId: string) => {
    setConversations(
      conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              partner: { ...c.partner, isMuted: !c.partner.isMuted },
            }
          : c
      )
    );
    setIsOptionsOpen(false);
  };

  const handleAcceptRequest = (reqId: string) => {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;

    const newConv: InboxConversation = {
      id: `conv-${Date.now()}`,
      isGroup: false,
      lastMessage: req.message,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      participants: [
        {
          conversationId: `conv-${Date.now()}`,
          profileId: socialProfile?.id || "10000000-0000-0000-0000-000000000001",
          isAdmin: false,
          status: "accepted",
          joinedAt: new Date().toISOString(),
        },
        {
          conversationId: `conv-${Date.now()}`,
          profileId: req.sender.id,
          isAdmin: false,
          status: "accepted",
          joinedAt: new Date().toISOString(),
        },
      ],
      partner: {
        id: req.sender.id,
        name: req.sender.name,
        username: req.sender.username,
        avatar: req.sender.avatar,
        isBlocked: false,
        isMuted: false,
      },
      createdAt: new Date().toISOString(),
    };

    setConversations([newConv, ...conversations]);
    setMessages({
      ...messages,
      [newConv.id]: [
        {
          id: `msg-${Date.now()}`,
          conversationId: newConv.id,
          senderId: req.sender.id,
          content: req.message,
          mediaUrl: null,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setRequests(requests.filter((r) => r.id !== reqId));
    setSelectedConversationId(newConv.id);
    setActiveTab("messages");
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequests(requests.filter((r) => r.id !== reqId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-slate-100">Social Inbox</h2>
          </div>
          <p className="text-xs text-slate-400">
            Independent private conversations. Never mixed with Founders workspace chats.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "messages"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Direct Messages
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "requests"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Requests</span>
            {requests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-violet-500 text-[10px] flex items-center justify-center font-bold text-white">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "messages" ? (
        /* MESSAGING SPLIT PANE */
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          {/* Conversation List Sidebar */}
          <div className="border-r border-slate-800 flex flex-col">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {conversations.map((conv) => {
                const isSelected = selectedConversationId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      setIsOptionsOpen(false);
                    }}
                    className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-violet-950/30 border-l-2 border-violet-500"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-300 font-bold flex items-center justify-center text-sm border border-violet-500/30">
                        {conv.partner.avatar}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
    conv.partner.presence === "online" ? "bg-emerald-500" : conv.partner.presence === "away" ? "bg-amber-500" : "bg-slate-500"
  }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {conv.partner.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.partner.isBlocked ? (
                          <span className="text-rose-400 italic">User is blocked</span>
                        ) : (
                          conv.lastMessage || "No messages yet"
                        )}
                      </p>
                    </div>

                    {(conv.unreadCount || 0) > 0 && (
                      <span className="w-4 h-4 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          <div className="col-span-2 flex flex-col justify-between bg-slate-950/40">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-600/20 text-violet-300 font-bold flex items-center justify-center text-sm">
                      {activeConv.partner.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-100">
                          {activeConv.partner.name}
                        </h4>
                        {activeConv.partner.isBlocked && (
                          <span className="text-[10px] bg-rose-500/15 text-rose-400 px-1.5 py-0.2 rounded font-semibold">
                            Blocked
                          </span>
                        )}
                        {activeConv.partner.isMuted && (
                          <VolumeX className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      <span className={`text-[10px] font-medium flex items-center gap-1 ${
                        activeConv.partner.presence === "online" ? "text-emerald-400" : "text-slate-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          activeConv.partner.presence === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                        }`} />
                        {activeConv.partner.lastSeen || (activeConv.partner.presence === "online" ? "Active now" : "Offline")}
                      </span>
                    </div>
                  </div>

                  {/* Header Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isOptionsOpen && (
                      <div className="absolute right-0 top-8 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-30 space-y-0.5 text-xs">
                        <button
                          onClick={() => handleToggleMute(activeConv.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 flex items-center gap-2"
                        >
                          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activeConv.partner.isMuted ? "Unmute" : "Mute Notifications"}</span>
                        </button>
                        <button
                          onClick={() => handleToggleBlock(activeConv.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-rose-400 flex items-center gap-2 font-medium"
                        >
                          <UserX className="w-3.5 h-3.5 text-rose-400" />
                          <span>{activeConv.partner.isBlocked ? "Unblock User" : "Block User"}</span>
                        </button>
                        <button
                          onClick={() => {
                            alert("Report submitted to safety moderation team.");
                            setIsOptionsOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-amber-400 flex items-center gap-2"
                        >
                          <Flag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Report Conversation</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Body (Chatwoot Real-Time Engine) */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {activeMessages.map((msg) => {
                    const isMe = msg.senderId === (socialProfile?.id || "10000000-0000-0000-0000-000000000001");
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group relative ${isMe ? "items-end" : "items-start"}`}
                      >
                        {/* Quick Hover Reactions Bar (Chatwoot Standard) */}
                        <div
                          className={`absolute -top-3 hidden group-hover:flex items-center gap-0.5 bg-slate-900 border border-slate-700 rounded-full px-1.5 py-0.5 shadow-lg z-10 ${
                            isMe ? "right-2" : "left-2"
                          }`}
                        >
                          {["👍", "❤️", "🔥", "🙌", "✨"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="hover:scale-125 transition text-xs p-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        <div
                          className={`max-w-xs md:max-w-sm rounded-2xl p-3 text-xs leading-relaxed space-y-1 shadow-sm ${
                            isMe
                              ? "bg-violet-600 text-white rounded-br-none"
                              : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60"
                          }`}
                        >
                          {msg.mediaUrl && (
                            <img
                              src={msg.mediaUrl}
                              alt="Attachment"
                              className="rounded-xl max-h-48 w-full object-cover mb-1.5 border border-white/10"
                            />
                          )}
                          <p>{msg.content}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] ${
                              isMe ? "text-violet-200" : "text-slate-400"
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {/* Chatwoot Read Receipts: Sent ✓ | Delivered ✓✓ | Read ✓✓ (Blue) */}
                            {isMe && (
                              <span className="inline-flex items-center" title={msg.deliveryState || "sent"}>
                                {msg.deliveryState === "read" ? (
                                  <CheckCheck className="w-3 h-3 text-sky-300" />
                                ) : msg.deliveryState === "delivered" ? (
                                  <CheckCheck className="w-3 h-3 text-violet-200" />
                                ) : (
                                  <Check className="w-3 h-3 text-violet-300" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reactions Pill Counter */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                            {Object.entries(msg.reactions).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className="px-1.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] flex items-center gap-1 hover:border-violet-500 transition"
                              >
                                <span>{emoji}</span>
                                <span className="text-slate-300 font-bold">{count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Chatwoot Live Typing Indicator */}
                  {isPartnerTyping && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-1.5 px-3 bg-slate-900/70 border border-slate-800 rounded-xl w-fit animate-in fade-in">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.3s]" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-300">
                        {activeConv.partner.name} is typing...
                      </span>
                    </div>
                  )}
                </div>

                {/* Photo Attachment Quick-Picks Picker */}
                {showImagePicker && (
                  <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-semibold">Attach Image URL or Preset:</span>
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={attachedImage || ""}
                        onChange={(e) => setAttachedImage(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      {attachedImage && (
                        <button
                          type="button"
                          onClick={() => setAttachedImage(null)}
                          className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <div className="w-full pb-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setAttachedImage(reader.result as string);
                                setShowImagePicker(false);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Local Photo from Device</span>
                        </button>
                      </div>
                      <span>Presets:</span>
                      {[
                        { label: "Coffee", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80" },
                        { label: "Cubbon Park", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80" },
                        { label: "Code Meetup", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setAttachedImage(item.url);
                            setShowImagePicker(false);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-violet-300"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Image Thumbnail Preview */}
                {attachedImage && !showImagePicker && (
                  <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={attachedImage} alt="Attachment" className="w-8 h-8 rounded object-cover border border-slate-700" />
                      <span className="text-violet-300 text-[11px] font-medium">Image attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="text-slate-400 hover:text-rose-400 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Bottom Composer or Blocked Alert */}
                {activeConv.partner.isBlocked ? (
                  <div className="p-3 bg-rose-950/30 border-t border-rose-900/40 text-center text-xs text-rose-400 flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>You have blocked this user. Unblock them to resume messaging.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-900/30">
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(!showImagePicker)}
                      className={`p-2 rounded-xl transition-colors ${
                        showImagePicker || attachedImage
                          ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                          : "text-slate-400 hover:text-violet-400 hover:bg-slate-800"
                      }`}
                      title="Attach photo"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={attachedImage ? "Add a caption (optional)..." : "Type a message..."}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() && !attachedImage}
                      className="p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a conversation to start messaging.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MESSAGE REQUESTS VIEW */
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <span>Incoming Direct Message Requests ({requests.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Messages from users outside your direct connections. Accepting allows them to chat with you and notifies them.
          </p>

          <div className="space-y-3">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-300 font-bold flex items-center justify-center text-sm shrink-0">
                      {req.sender.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-slate-200">{req.sender.name}</h4>
                        <span className="text-[10px] text-slate-500">@{req.sender.username}</span>
                        <span className="text-[10px] text-slate-500">• {req.sender.location}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        "{req.message}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-900/30"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No message requests right now.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
