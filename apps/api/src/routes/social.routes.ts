import { Router } from "express";
import { enforceWorld } from "../middleware/world.middleware.js";
import { WORLDS } from "@platform/config";
import {
  socialProfilesStore,
  socialPostsStore,
  socialReactionsStore,
  socialCommentsStore,
  socialConnectionsStore,
  socialFollowsStore,
  socialStoriesStore,
  socialStoryViewsStore,
  socialReelsStore,
  socialReelLikesStore,
  socialReelCommentsStore,
  socialReelViewsStore,
  socialCommunitiesStore,
  socialCommunityMembersStore,
  socialCommunityPostsStore,
  socialEventsStore,
  socialEventRsvpsStore,
  socialConversationsStore,
  socialMessagesStore,
  socialNotificationsStore,
  socialBlocksStore,
  socialMutesStore,
  socialReportsStore,
} from "../services/store.js";
import {
  createSocialPostSchema,
  createSocialCommentSchema,
  reactSocialPostSchema,
  updateSocialProfileSchema,
  sendConnectionRequestSchema,
  respondConnectionRequestSchema,
  discoverPeopleQuerySchema,
  createStorySchema,
  replyStorySchema,
  createReelSchema,
  createReelCommentSchema,
  createCommunitySchema,
  createCommunityPostSchema,
  createEventSchema,
  rsvpEventSchema,
  startConversationSchema,
  sendMessageSchema,
  blockUserSchema,
  muteUserSchema,
  createReportSchema,
  unifiedSearchSchema,
} from "@platform/validation";
import {
  SocialPost,
  SocialComment,
  SocialReaction,
  SocialConnection,
  SocialStory,
  SocialReel,
  SocialReelComment,
  SocialCommunity,
  SocialCommunityPost,
  SocialEvent,
  SocialConversation,
  SocialMessage,
  SocialNotification,
  SocialReport,
} from "@platform/shared-types";

export const socialRouter = Router();

// Apply strict Socializing boundary check
socialRouter.use(enforceWorld(WORLDS.SOCIALIZING));

// ==============================================================================
// 1. SOCIAL PROFILES
// ==============================================================================

socialRouter.get("/profile/me", (req, res) => {
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  if (!profile) {
    return res.status(404).json({ error: "Social profile not found" });
  }

  res.json({ profile });
});

socialRouter.put("/profile/me", (req, res) => {
  const accountId = req.worldContext!.accountId;
  const profile = socialProfilesStore.get(accountId);

  if (!profile) {
    return res.status(404).json({ error: "Social profile not found" });
  }

  const result = updateSocialProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const updatedProfile = {
    ...profile,
    ...result.data,
    updatedAt: new Date().toISOString(),
  };

  socialProfilesStore.set(accountId, updatedProfile);
  res.json({ message: "Social profile updated successfully", profile: updatedProfile });
});

// View another public social profile
socialRouter.get("/profile/:username", (req, res) => {
  const viewerProfileId = req.worldContext!.profileId;
  const username = req.params.username;
  const target = Array.from(socialProfilesStore.values()).find((p) => p.username === username);

  if (!target) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // Block check
  if (
    socialBlocksStore.has(`${viewerProfileId}:${target.id}`) ||
    socialBlocksStore.has(`${target.id}:${viewerProfileId}`)
  ) {
    return res.status(404).json({ error: "Profile unavailable" });
  }

  const isFollowing = socialFollowsStore.has(`${viewerProfileId}:${target.id}`);
  const connection = Array.from(socialConnectionsStore.values()).find(
    (c) =>
      (c.requesterId === viewerProfileId && c.recipientId === target.id) ||
      (c.requesterId === target.id && c.recipientId === viewerProfileId)
  );

  const posts = Array.from(socialPostsStore.values()).filter(
    (p) => p.authorId === target.id && !p.isArchived
  );

  res.json({
    profile: target,
    isFollowing,
    connectionStatus: connection ? connection.status : "none",
    postsCount: posts.length,
    posts,
  });
});

// ==============================================================================
// 2. SOCIAL FEED & POSTS
// ==============================================================================

socialRouter.get("/feed", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const feedType = req.query.type === "following" ? "following" : "for_you";

  // Filter out blocked or muted users
  const posts = Array.from(socialPostsStore.values())
    .filter((post) => !post.isArchived)
    .filter(
      (post) =>
        !socialBlocksStore.has(`${currentProfileId}:${post.authorId}`) &&
        !socialBlocksStore.has(`${post.authorId}:${currentProfileId}`) &&
        !socialMutesStore.has(`${currentProfileId}:${post.authorId}`)
    )
    .filter((post) => {
      if (feedType === "following") {
        return (
          socialFollowsStore.has(`${currentProfileId}:${post.authorId}`) ||
          post.authorId === currentProfileId
        );
      }
      return true; // For You includes organic algorithmic discovery
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((post) => {
      const reactionKey = `${post.id}:${currentProfileId}`;
      const userReaction = socialReactionsStore.get(reactionKey);

      return {
        ...post,
        hasLiked: !!userReaction,
        userReaction: userReaction?.reactionType || null,
      };
    });

  res.json({
    world: WORLDS.SOCIALIZING,
    feedType,
    posts,
  });
});

socialRouter.post("/posts", (req, res) => {
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const result = createSocialPostSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { content, postType, mediaUrls, pollOptions } = result.data;

  const formattedPoll =
    postType === "poll" && pollOptions
      ? pollOptions.map((opt, idx) => ({
          id: opt.id || `opt-${idx + 1}`,
          text: opt.text,
          votes: 0,
        }))
      : undefined;

  const newPost: SocialPost = {
    id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    authorId: profileId,
    author: profile,
    content,
    postType,
    mediaUrls,
    mediaType:
      postType === "poll" ? "poll" : postType === "video" ? "video" : mediaUrls.length > 0 ? "image" : "none",
    pollOptions: formattedPoll,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialPostsStore.set(newPost.id, newPost);
  res.status(201).json({ message: "Post published successfully", post: newPost });
});

socialRouter.delete("/posts/:id", (req, res) => {
  const postId = req.params.id;
  const profileId = req.worldContext!.profileId;

  const post = socialPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (post.authorId !== profileId) {
    return res.status(403).json({ error: "Only the author can delete this post" });
  }

  socialPostsStore.delete(postId);
  res.json({ message: "Post deleted successfully" });
});

socialRouter.post("/posts/:id/react", (req, res) => {
  const postId = req.params.id;
  const profileId = req.worldContext!.profileId;

  const post = socialPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const result = reactSocialPostSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { reactionType } = result.data;
  const reactionKey = `${postId}:${profileId}`;
  const existingReaction = socialReactionsStore.get(reactionKey);

  if (existingReaction) {
    if (existingReaction.reactionType === reactionType) {
      socialReactionsStore.delete(reactionKey);
      post.likesCount = Math.max(0, post.likesCount - 1);
      return res.json({ message: "Reaction removed", hasLiked: false, userReaction: null, likesCount: post.likesCount });
    } else {
      existingReaction.reactionType = reactionType;
      return res.json({ message: "Reaction updated", hasLiked: true, userReaction: reactionType, likesCount: post.likesCount });
    }
  }

  const newReaction: SocialReaction = {
    postId,
    profileId,
    reactionType,
    createdAt: new Date().toISOString(),
  };

  socialReactionsStore.set(reactionKey, newReaction);
  post.likesCount += 1;

  res.status(201).json({
    message: "Reaction added",
    hasLiked: true,
    userReaction: reactionType,
    likesCount: post.likesCount,
  });
});

socialRouter.get("/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  const comments = Array.from(socialCommentsStore.values())
    .filter((c) => c.postId === postId && !c.parentCommentId)
    .map((parent) => {
      const replies = Array.from(socialCommentsStore.values()).filter(
        (child) => child.parentCommentId === parent.id
      );
      return { ...parent, replies };
    });

  res.json({ comments });
});

socialRouter.post("/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const post = socialPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const result = createSocialCommentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { content, parentCommentId } = result.data;

  const newComment: SocialComment = {
    id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    postId,
    authorId: profileId,
    author: profile,
    parentCommentId: parentCommentId || null,
    content,
    likesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialCommentsStore.set(newComment.id, newComment);
  post.commentsCount += 1;

  res.status(201).json({ message: "Comment added successfully", comment: newComment });
});

// ==============================================================================
// 2.5. SOCIAL GRAPH, CONNECTIONS & PEOPLE DISCOVERY
// ==============================================================================

// Send Connection Request
socialRouter.post("/connections/request", (req, res) => {
  const requesterId = req.worldContext!.profileId;

  const result = sendConnectionRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { recipientId } = result.data;

  if (requesterId === recipientId) {
    return res.status(400).json({ error: "You cannot send a connection request to yourself" });
  }

  const recipientProfile = Array.from(socialProfilesStore.values()).find((p) => p.id === recipientId);
  if (!recipientProfile) {
    return res.status(404).json({ error: "Recipient profile not found" });
  }

  const existing = Array.from(socialConnectionsStore.values()).find(
    (c) =>
      (c.requesterId === requesterId && c.recipientId === recipientId) ||
      (c.requesterId === recipientId && c.recipientId === requesterId)
  );

  if (existing) {
    if (existing.status === "accepted") {
      return res.status(400).json({ error: "You are already connected with this user" });
    }
    if (existing.status === "pending") {
      return res.status(400).json({ error: "A connection request is already pending between you" });
    }
  }

  const requesterProfile = Array.from(socialProfilesStore.values()).find((p) => p.id === requesterId);
  const newConnection: SocialConnection = {
    id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    requesterId,
    requester: requesterProfile,
    recipientId,
    recipient: recipientProfile,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialConnectionsStore.set(newConnection.id, newConnection);
  res.status(201).json({ message: "Connection request sent", connection: newConnection });
});

// Get Connections List (Accepted, Pending Incoming, Pending Outgoing)
socialRouter.get("/connections", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;

  const all = Array.from(socialConnectionsStore.values());
  const accepted = all
    .filter((c) => c.status === "accepted" && (c.requesterId === currentProfileId || c.recipientId === currentProfileId))
    .map((c) => {
      const partner = c.requesterId === currentProfileId ? c.recipient : c.requester;
      return { ...c, partner };
    });

  const pendingIncoming = all.filter((c) => c.status === "pending" && c.recipientId === currentProfileId);
  const pendingOutgoing = all.filter((c) => c.status === "pending" && c.requesterId === currentProfileId);

  res.json({
    connections: accepted,
    pendingIncoming,
    pendingOutgoing,
    totalCount: accepted.length,
  });
});

// Respond to Connection Request
socialRouter.post("/connections/:id/respond", (req, res) => {
  const connectionId = req.params.id;
  const currentProfileId = req.worldContext!.profileId;

  const connection = socialConnectionsStore.get(connectionId);
  if (!connection) {
    return res.status(404).json({ error: "Connection request not found" });
  }

  const result = respondConnectionRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { action } = result.data;

  if (action === "accept" || action === "reject") {
    if (connection.recipientId !== currentProfileId) {
      return res.status(403).json({ error: "Only the recipient can accept or reject this request" });
    }
    connection.status = action === "accept" ? "accepted" : "rejected";
    connection.updatedAt = new Date().toISOString();
    return res.json({ message: `Connection ${connection.status}`, connection });
  }

  if (action === "withdrawn") {
    if (connection.requesterId !== currentProfileId) {
      return res.status(403).json({ error: "Only the requester can withdraw this request" });
    }
    connection.status = "withdrawn";
    connection.updatedAt = new Date().toISOString();
    return res.json({ message: "Connection request withdrawn", connection });
  }
});

// Remove Connection
socialRouter.delete("/connections/:partnerProfileId", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const partnerId = req.params.partnerProfileId;

  const found = Array.from(socialConnectionsStore.values()).find(
    (c) =>
      (c.requesterId === currentProfileId && c.recipientId === partnerId) ||
      (c.requesterId === partnerId && c.recipientId === currentProfileId)
  );

  if (!found) {
    return res.status(404).json({ error: "Connection not found" });
  }

  socialConnectionsStore.delete(found.id);
  res.json({ message: "Connection removed successfully" });
});

// Follow User
socialRouter.post("/follows/:profileId", (req, res) => {
  const followerId = req.worldContext!.profileId;
  const followingId = req.params.profileId;

  if (followerId === followingId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  const target = Array.from(socialProfilesStore.values()).find((p) => p.id === followingId);
  if (!target) {
    return res.status(404).json({ error: "Profile not found" });
  }

  socialFollowsStore.add(`${followerId}:${followingId}`);
  res.status(201).json({ message: `Now following @${target.username}`, followingId });
});

// Unfollow User
socialRouter.delete("/follows/:profileId", (req, res) => {
  const followerId = req.worldContext!.profileId;
  const followingId = req.params.profileId;

  socialFollowsStore.delete(`${followerId}:${followingId}`);
  res.json({ message: "Unfollowed successfully", followingId });
});

// People Discovery
socialRouter.get("/discover/people", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const currentProfile = Array.from(socialProfilesStore.values()).find((p) => p.id === currentProfileId);

  const filter = discoverPeopleQuerySchema.safeParse(req.query);
  const { interest, hobby, language, city, q } = filter.success ? filter.data : (req.query as any);

  const currentInterests = currentProfile?.interests || [];
  const currentHobbies = currentProfile?.hobbies || [];

  const candidates = Array.from(socialProfilesStore.values())
    .filter((p) => p.id !== currentProfileId && !p.isPrivate)
    .filter((p) => {
      if (q && q.trim()) {
        const query = q.toLowerCase();
        const matchesName = p.displayName.toLowerCase().includes(query) || p.username.toLowerCase().includes(query);
        const matchesBio = p.bio?.toLowerCase().includes(query);
        if (!matchesName && !matchesBio) return false;
      }
      if (interest && !p.interests.some((i) => i.toLowerCase().includes(interest.toLowerCase()))) {
        return false;
      }
      if (hobby && !p.hobbies.some((h) => h.toLowerCase().includes(hobby.toLowerCase()))) {
        return false;
      }
      if (language && !p.languages.some((l) => l.toLowerCase().includes(language.toLowerCase()))) {
        return false;
      }
      if (city && p.city?.toLowerCase() !== city.toLowerCase()) {
        return false;
      }
      return true;
    })
    .map((p) => {
      const conn = Array.from(socialConnectionsStore.values()).find(
        (c) =>
          (c.requesterId === currentProfileId && c.recipientId === p.id) ||
          (c.requesterId === p.id && c.recipientId === currentProfileId)
      );

      let connectionStatus: "none" | "pending_sent" | "pending_received" | "connected" = "none";
      if (conn) {
        if (conn.status === "accepted") connectionStatus = "connected";
        else if (conn.status === "pending") {
          connectionStatus = conn.requesterId === currentProfileId ? "pending_sent" : "pending_received";
        }
      }

      const isFollowing = socialFollowsStore.has(`${currentProfileId}:${p.id}`);

      const sharedInterests = p.interests.filter((i) =>
        currentInterests.some((ci) => ci.toLowerCase() === i.toLowerCase())
      );
      const sharedHobbies = p.hobbies.filter((h) =>
        currentHobbies.some((ch) => ch.toLowerCase() === h.toLowerCase())
      );

      return {
        ...p,
        connectionStatus,
        connectionId: conn?.id || null,
        isFollowing,
        sharedInterests,
        sharedHobbies,
      };
    })
    .sort(
      (a, b) =>
        b.sharedInterests.length + b.sharedHobbies.length - (a.sharedInterests.length + a.sharedHobbies.length)
    );

  res.json({
    world: WORLDS.SOCIALIZING,
    results: candidates,
    total: candidates.length,
  });
});

// ==============================================================================
// 3. STORIES (24h Ephemeral Expiry & Viewers Tracking)
// ==============================================================================

socialRouter.get("/stories", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const now = new Date().getTime();

  // Strict Server-Side 24-hour expiration enforcement
  const activeStories = Array.from(socialStoriesStore.values())
    .filter((story) => new Date(story.expiresAt).getTime() > now)
    .filter(
      (story) =>
        !socialBlocksStore.has(`${currentProfileId}:${story.authorId}`) &&
        !socialBlocksStore.has(`${story.authorId}:${currentProfileId}`) &&
        !socialMutesStore.has(`${currentProfileId}:${story.authorId}`)
    )
    .map((story) => {
      const hasViewed = socialStoryViewsStore.has(`${story.id}:${currentProfileId}`);
      const viewsCount = Array.from(socialStoryViewsStore.values()).filter((k) =>
        k.startsWith(`${story.id}:`)
      ).length;

      return {
        ...story,
        hasViewed,
        viewsCount,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ stories: activeStories });
});

socialRouter.post("/stories", (req, res) => {
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const result = createStorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { mediaUrl, mediaType, caption, audience } = result.data;

  const newStory: SocialStory = {
    id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    authorId: profileId,
    author: profile,
    mediaUrl,
    mediaType,
    caption: caption || null,
    audience,
    expiresAt: new Date(Date.now() + 86400000).toISOString(), // Exactly 24h
    createdAt: new Date().toISOString(),
  };

  socialStoriesStore.set(newStory.id, newStory);
  res.status(201).json({ message: "Story published (expires in 24 hours)", story: newStory });
});

// View story (Records viewer)
socialRouter.post("/stories/:id/view", (req, res) => {
  const storyId = req.params.id;
  const viewerId = req.worldContext!.profileId;

  const story = socialStoriesStore.get(storyId);
  if (!story || new Date(story.expiresAt).getTime() <= Date.now()) {
    return res.status(404).json({ error: "Story not found or expired" });
  }

  socialStoryViewsStore.add(`${storyId}:${viewerId}`);
  res.json({ message: "View recorded" });
});

// Story Viewers List (STRICT AUTHOR-ONLY PERMISSION)
socialRouter.get("/stories/:id/viewers", (req, res) => {
  const storyId = req.params.id;
  const currentProfileId = req.worldContext!.profileId;

  const story = socialStoriesStore.get(storyId);
  if (!story) {
    return res.status(404).json({ error: "Story not found" });
  }

  // Only the story author can see who viewed their story
  if (story.authorId !== currentProfileId) {
    return res.status(403).json({ error: "Forbidden: Only the story author can inspect viewer list" });
  }

  const viewers = Array.from(socialStoryViewsStore)
    .filter((k) => k.startsWith(`${storyId}:`))
    .map((k) => {
      const vId = k.split(":")[1];
      return Array.from(socialProfilesStore.values()).find((p) => p.id === vId);
    })
    .filter(Boolean);

  res.json({ viewers, total: viewers.length });
});

// Delete Own Story
socialRouter.delete("/stories/:id", (req, res) => {
  const storyId = req.params.id;
  const currentProfileId = req.worldContext!.profileId;

  const story = socialStoriesStore.get(storyId);
  if (!story) {
    return res.status(404).json({ error: "Story not found" });
  }

  if (story.authorId !== currentProfileId) {
    return res.status(403).json({ error: "Forbidden: Cannot delete another user's story" });
  }

  socialStoriesStore.delete(storyId);
  res.json({ message: "Story deleted" });
});

// Reply to Story (Creates a direct message in Social Inbox)
socialRouter.post("/stories/:id/reply", (req, res) => {
  const storyId = req.params.id;
  const senderId = req.worldContext!.profileId;

  const story = socialStoriesStore.get(storyId);
  if (!story || new Date(story.expiresAt).getTime() <= Date.now()) {
    return res.status(404).json({ error: "Story expired or not found" });
  }

  const result = replyStorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const recipientId = story.authorId;
  if (senderId === recipientId) {
    return res.status(400).json({ error: "Cannot reply to your own story" });
  }

  // Check existing conversation or create new
  let conv = Array.from(socialConversationsStore.values()).find(
    (c) =>
      !c.isGroup &&
      c.participants.some((p) => p.profileId === senderId) &&
      c.participants.some((p) => p.profileId === recipientId)
  );

  if (!conv) {
    const sender = Array.from(socialProfilesStore.values()).find((p) => p.id === senderId);
    const recipient = Array.from(socialProfilesStore.values()).find((p) => p.id === recipientId);

    conv = {
      id: `conv-${Date.now()}`,
      isGroup: false,
      creatorId: senderId,
      lastMessageAt: new Date().toISOString(),
      lastMessage: result.data.content,
      participants: [
        { conversationId: `conv-${Date.now()}`, profileId: senderId, profile: sender, isAdmin: true, status: "accepted", joinedAt: new Date().toISOString() },
        { conversationId: `conv-${Date.now()}`, profileId: recipientId, profile: recipient, isAdmin: false, status: "accepted", joinedAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
    };
    socialConversationsStore.set(conv.id, conv);
  }

  const newMsg: SocialMessage = {
    id: `msg-${Date.now()}`,
    conversationId: conv.id,
    senderId,
    content: `Replied to story: "${result.data.content}"`,
    mediaUrl: story.mediaUrl,
    createdAt: new Date().toISOString(),
  };

  socialMessagesStore.set(newMsg.id, newMsg);
  conv.lastMessage = newMsg.content;
  conv.lastMessageAt = new Date().toISOString();

  res.status(201).json({ message: "Story reply sent as message", conversationId: conv.id, messageItem: newMsg });
});

// ==============================================================================
// 4. REELS AND SHORT VIDEOS
// ==============================================================================

socialRouter.get("/reels", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;

  const reels = Array.from(socialReelsStore.values())
    .filter((reel) => !reel.isArchived)
    .filter(
      (reel) =>
        !socialBlocksStore.has(`${currentProfileId}:${reel.authorId}`) &&
        !socialBlocksStore.has(`${reel.authorId}:${currentProfileId}`)
    )
    .map((reel) => {
      const hasLiked = socialReelLikesStore.has(`${reel.id}:${currentProfileId}`);
      return {
        ...reel,
        hasLiked,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ reels });
});

socialRouter.post("/reels", (req, res) => {
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const result = createReelSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { videoUrl, thumbnailUrl, caption, audioTrack, hashtags } = result.data;

  const newReel: SocialReel = {
    id: `reel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    authorId: profileId,
    author: profile,
    videoUrl,
    thumbnailUrl: thumbnailUrl || null,
    caption,
    audioTrack,
    hashtags,
    viewsCount: 0,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  socialReelsStore.set(newReel.id, newReel);
  res.status(201).json({ message: "Reel published successfully", reel: newReel });
});

// Like Reel
socialRouter.post("/reels/:id/like", (req, res) => {
  const reelId = req.params.id;
  const profileId = req.worldContext!.profileId;

  const reel = socialReelsStore.get(reelId);
  if (!reel) {
    return res.status(404).json({ error: "Reel not found" });
  }

  const likeKey = `${reelId}:${profileId}`;
  if (socialReelLikesStore.has(likeKey)) {
    socialReelLikesStore.delete(likeKey);
    reel.likesCount = Math.max(0, reel.likesCount - 1);
    return res.json({ message: "Like removed", hasLiked: false, likesCount: reel.likesCount });
  }

  socialReelLikesStore.add(likeKey);
  reel.likesCount += 1;
  res.json({ message: "Reel liked", hasLiked: true, likesCount: reel.likesCount });
});

// Track Reel View (Deduplicated)
socialRouter.post("/reels/:id/view", (req, res) => {
  const reelId = req.params.id;
  const viewerId = req.worldContext!.profileId;

  const reel = socialReelsStore.get(reelId);
  if (!reel) {
    return res.status(404).json({ error: "Reel not found" });
  }

  const viewKey = `${reelId}:${viewerId}`;
  if (!socialReelViewsStore.has(viewKey)) {
    socialReelViewsStore.add(viewKey);
    reel.viewsCount += 1;
  }

  res.json({ viewsCount: reel.viewsCount });
});

// Reel Comments
socialRouter.get("/reels/:id/comments", (req, res) => {
  const reelId = req.params.id;
  const comments = Array.from(socialReelCommentsStore.values())
    .filter((c) => c.reelId === reelId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({ comments });
});

socialRouter.post("/reels/:id/comments", (req, res) => {
  const reelId = req.params.id;
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const reel = socialReelsStore.get(reelId);
  if (!reel) {
    return res.status(404).json({ error: "Reel not found" });
  }

  const result = createReelCommentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const newComment: SocialReelComment = {
    id: `rc-${Date.now()}`,
    reelId,
    authorId: profileId,
    author: profile,
    content: result.data.content,
    likesCount: 0,
    createdAt: new Date().toISOString(),
  };

  socialReelCommentsStore.set(newComment.id, newComment);
  reel.commentsCount += 1;

  res.status(201).json({ message: "Comment added", comment: newComment });
});

// ==============================================================================
// 5. COMMUNITIES & DISCUSSIONS
// ==============================================================================

socialRouter.get("/communities", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const category = req.query.category as string | undefined;

  const communities = Array.from(socialCommunitiesStore.values())
    .filter((c) => (category ? c.category.toLowerCase() === category.toLowerCase() : true))
    .map((c) => {
      const member = socialCommunityMembersStore.get(`${c.id}:${currentProfileId}`);
      return {
        ...c,
        isMember: member?.status === "active",
        membershipStatus: member ? member.status : "none",
        myRole: member?.role || null,
      };
    });

  res.json({ communities });
});

socialRouter.get("/communities/:slug", (req, res) => {
  const slug = req.params.slug;
  const currentProfileId = req.worldContext!.profileId;

  const community = Array.from(socialCommunitiesStore.values()).find((c) => c.slug === slug);
  if (!community) {
    return res.status(404).json({ error: "Community not found" });
  }

  const member = socialCommunityMembersStore.get(`${community.id}:${currentProfileId}`);
  const isApproved = member?.status === "active";

  // If private community and not an approved member, discussion posts are hidden
  const posts =
    community.isPrivate && !isApproved
      ? []
      : Array.from(socialCommunityPostsStore.values())
          .filter((p) => p.communityId === community.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    community: {
      ...community,
      isMember: isApproved,
      membershipStatus: member ? member.status : "none",
      myRole: member?.role || null,
    },
    posts,
    canPost: isApproved,
  });
});

socialRouter.post("/communities", (req, res) => {
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const result = createCommunitySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { name, slug, description, avatarUrl, coverUrl, category, isPrivate, rules } = result.data;

  // Uniqueness check
  if (Array.from(socialCommunitiesStore.values()).some((c) => c.slug === slug)) {
    return res.status(400).json({ error: "Community slug already taken" });
  }

  const newComm: SocialCommunity = {
    id: `comm-${Date.now()}`,
    creatorId: profileId,
    creator: profile,
    name,
    slug,
    description,
    avatarUrl: avatarUrl || null,
    coverUrl: coverUrl || null,
    category,
    isPrivate,
    rules,
    membersCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialCommunitiesStore.set(newComm.id, newComm);

  // Creator is automatically owner
  socialCommunityMembersStore.set(`${newComm.id}:${profileId}`, {
    communityId: newComm.id,
    profileId,
    role: "owner",
    status: "active",
    joinedAt: new Date().toISOString(),
  });

  res.status(201).json({ message: "Community created successfully", community: newComm });
});

// Join community
socialRouter.post("/communities/:id/join", (req, res) => {
  const communityId = req.params.id;
  const profileId = req.worldContext!.profileId;

  const community = socialCommunitiesStore.get(communityId);
  if (!community) {
    return res.status(404).json({ error: "Community not found" });
  }

  const memberKey = `${communityId}:${profileId}`;
  const existing = socialCommunityMembersStore.get(memberKey);

  if (existing && existing.status === "active") {
    return res.status(400).json({ error: "Already an active member" });
  }

  if (community.isPrivate) {
    // Requires owner review
    socialCommunityMembersStore.set(memberKey, {
      communityId,
      profileId,
      role: "member",
      status: "pending_request",
      joinedAt: new Date().toISOString(),
    });
    return res.json({ message: "Join request submitted for review", status: "pending_request" });
  }

  // Public: Join immediately
  socialCommunityMembersStore.set(memberKey, {
    communityId,
    profileId,
    role: "member",
    status: "active",
    joinedAt: new Date().toISOString(),
  });
  community.membersCount += 1;

  res.json({ message: "Joined community successfully", status: "active" });
});

// Leave community
socialRouter.post("/communities/:id/leave", (req, res) => {
  const communityId = req.params.id;
  const profileId = req.worldContext!.profileId;

  const memberKey = `${communityId}:${profileId}`;
  if (!socialCommunityMembersStore.has(memberKey)) {
    return res.status(400).json({ error: "Not a member of this community" });
  }

  socialCommunityMembersStore.delete(memberKey);
  const comm = socialCommunitiesStore.get(communityId);
  if (comm) comm.membersCount = Math.max(1, comm.membersCount - 1);

  res.json({ message: "Left community" });
});

// Create community discussion post
socialRouter.post("/communities/:id/posts", (req, res) => {
  const communityId = req.params.id;
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const member = socialCommunityMembersStore.get(`${communityId}:${profileId}`);
  if (!member || member.status !== "active") {
    return res.status(403).json({ error: "Must be an active member to post discussions" });
  }

  const result = createCommunityPostSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const newPost: SocialCommunityPost = {
    id: `cp-${Date.now()}`,
    communityId,
    authorId: profileId,
    author: profile,
    content: result.data.content,
    mediaUrls: result.data.mediaUrls,
    likesCount: 0,
    commentsCount: 0,
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialCommunityPostsStore.set(newPost.id, newPost);
  res.status(201).json({ message: "Discussion posted", post: newPost });
});

// ==============================================================================
// 6. EVENTS & MEETUPS (Public Venues Only)
// ==============================================================================

socialRouter.get("/events", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const city = req.query.city as string | undefined;

  const events = Array.from(socialEventsStore.values())
    .filter((e) => e.status !== "cancelled" || req.query.include_cancelled === "true")
    .filter((e) => (city && city !== "All" ? e.city.toLowerCase() === city.toLowerCase() : true))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((e) => {
      const rsvp = socialEventRsvpsStore.get(`${e.id}:${currentProfileId}`);
      return {
        ...e,
        myRsvp: rsvp?.rsvpStatus || null,
      };
    });

  res.json({ events });
});

socialRouter.post("/events", (req, res) => {
  const profileId = req.worldContext!.profileId;
  const profile = Array.from(socialProfilesStore.values()).find((p) => p.id === profileId);

  const result = createEventSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const {
    title,
    description,
    coverUrl,
    category,
    venueName,
    city,
    isOnline,
    meetingUrl,
    startTime,
    endTime,
    publicSafetyGuidance,
    isAttendeeListVisible,
  } = result.data;

  const newEvent: SocialEvent = {
    id: `event-${Date.now()}`,
    organizerId: profileId,
    organizer: profile,
    title,
    description,
    coverUrl: coverUrl || null,
    category,
    venueName,
    city,
    isOnline,
    meetingUrl: meetingUrl || null,
    startTime,
    endTime: endTime || null,
    publicSafetyGuidance,
    isAttendeeListVisible,
    status: "active",
    rsvpsCount: { going: 1, interested: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialEventsStore.set(newEvent.id, newEvent);

  // Organizer automatically marked as Going
  socialEventRsvpsStore.set(`${newEvent.id}:${profileId}`, {
    eventId: newEvent.id,
    profileId,
    rsvpStatus: "going",
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({ message: "Event created successfully", event: newEvent });
});

// RSVP to Event
socialRouter.post("/events/:id/rsvp", (req, res) => {
  const eventId = req.params.id;
  const profileId = req.worldContext!.profileId;

  const event = socialEventsStore.get(eventId);
  if (!event || event.status === "cancelled") {
    return res.status(404).json({ error: "Event unavailable or cancelled" });
  }

  const result = rsvpEventSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { rsvpStatus } = result.data;
  const rsvpKey = `${eventId}:${profileId}`;

  socialEventRsvpsStore.set(rsvpKey, {
    eventId,
    profileId,
    rsvpStatus,
    updatedAt: new Date().toISOString(),
  });

  // Recompute counts
  const allRsvps = Array.from(socialEventRsvpsStore.values()).filter((r) => r.eventId === eventId);
  const going = allRsvps.filter((r) => r.rsvpStatus === "going").length;
  const interested = allRsvps.filter((r) => r.rsvpStatus === "interested").length;

  event.rsvpsCount = { going, interested };

  res.json({ message: "RSVP updated", myRsvp: rsvpStatus, rsvpsCount: event.rsvpsCount });
});

// Cancel Event (Organizer only)
socialRouter.post("/events/:id/cancel", (req, res) => {
  const eventId = req.params.id;
  const profileId = req.worldContext!.profileId;

  const event = socialEventsStore.get(eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (event.organizerId !== profileId) {
    return res.status(403).json({ error: "Forbidden: Only the organizer can cancel this event" });
  }

  event.status = "cancelled";
  event.updatedAt = new Date().toISOString();

  res.json({ message: "Event has been cancelled", event });
});

// ==============================================================================
// 7. SOCIAL INBOX AND DIRECT MESSAGES
// ==============================================================================

socialRouter.get("/inbox/conversations", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;

  const convs = Array.from(socialConversationsStore.values())
    .filter((c) => c.participants.some((p) => p.profileId === currentProfileId && p.status === "accepted"))
    .filter((c) => {
      // Filter out conversations where the partner is blocked
      const partner = c.participants.find((p) => p.profileId !== currentProfileId);
      if (partner) {
        if (
          socialBlocksStore.has(`${currentProfileId}:${partner.profileId}`) ||
          socialBlocksStore.has(`${partner.profileId}:${currentProfileId}`)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  res.json({ conversations: convs });
});

socialRouter.post("/inbox/conversations", (req, res) => {
  const senderId = req.worldContext!.profileId;
  const result = startConversationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { recipientId, initialMessage } = result.data;
  if (senderId === recipientId) {
    return res.status(400).json({ error: "Cannot start a conversation with yourself" });
  }

  // Block enforcement
  if (
    socialBlocksStore.has(`${senderId}:${recipientId}`) ||
    socialBlocksStore.has(`${recipientId}:${senderId}`)
  ) {
    return res.status(403).json({ error: "Cannot message this user due to block restrictions" });
  }

  const sender = Array.from(socialProfilesStore.values()).find((p) => p.id === senderId);
  const recipient = Array.from(socialProfilesStore.values()).find((p) => p.id === recipientId);
  if (!recipient) {
    return res.status(404).json({ error: "Recipient not found" });
  }

  // DM Privacy Check
  const isConnected = Array.from(socialConnectionsStore.values()).some(
    (c) =>
      c.status === "accepted" &&
      ((c.requesterId === senderId && c.recipientId === recipientId) ||
        (c.requesterId === recipientId && c.recipientId === senderId))
  );

  if (recipient.allowDmsFrom === "none") {
    return res.status(403).json({ error: "This user does not accept direct message requests" });
  }
  if (recipient.allowDmsFrom === "connections" && !isConnected) {
    return res.status(403).json({ error: "This user only accepts messages from established connections" });
  }

  // Check if conversation already exists
  let conv = Array.from(socialConversationsStore.values()).find(
    (c) =>
      !c.isGroup &&
      c.participants.some((p) => p.profileId === senderId) &&
      c.participants.some((p) => p.profileId === recipientId)
  );

  if (!conv) {
    conv = {
      id: `conv-${Date.now()}`,
      isGroup: false,
      creatorId: senderId,
      lastMessageAt: new Date().toISOString(),
      lastMessage: initialMessage,
      participants: [
        { conversationId: `conv-${Date.now()}`, profileId: senderId, profile: sender, isAdmin: true, status: "accepted", joinedAt: new Date().toISOString() },
        { conversationId: `conv-${Date.now()}`, profileId: recipientId, profile: recipient, isAdmin: false, status: "accepted", joinedAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
    };
    socialConversationsStore.set(conv.id, conv);
  }

  const msg: SocialMessage = {
    id: `msg-${Date.now()}`,
    conversationId: conv.id,
    senderId,
    sender,
    content: initialMessage,
    createdAt: new Date().toISOString(),
  };

  socialMessagesStore.set(msg.id, msg);
  conv.lastMessage = msg.content;
  conv.lastMessageAt = new Date().toISOString();

  res.status(201).json({ message: "Conversation initialized", conversation: conv, messageItem: msg });
});

// Get Messages for Conversation (STRICT PARTICIPANT ACCESS CONTROL)
socialRouter.get("/inbox/conversations/:id/messages", (req, res) => {
  const convId = req.params.id;
  const currentProfileId = req.worldContext!.profileId;

  const conv = socialConversationsStore.get(convId);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  // Strict participant check
  const isParticipant = conv.participants.some((p) => p.profileId === currentProfileId && p.status === "accepted");
  if (!isParticipant) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this conversation" });
  }

  const messages = Array.from(socialMessagesStore.values())
    .filter((m) => m.conversationId === convId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({ conversation: conv, messages });
});

// Send message to conversation
socialRouter.post("/inbox/conversations/:id/messages", (req, res) => {
  const convId = req.params.id;
  const senderId = req.worldContext!.profileId;
  const sender = Array.from(socialProfilesStore.values()).find((p) => p.id === senderId);

  const conv = socialConversationsStore.get(convId);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const isParticipant = conv.participants.some((p) => p.profileId === senderId && p.status === "accepted");
  if (!isParticipant) {
    return res.status(403).json({ error: "Forbidden: Not an authorized participant" });
  }

  const result = sendMessageSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { content, mediaUrl, attachments } = result.data;

  const msg: SocialMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    conversationId: convId,
    senderId,
    sender,
    content,
    mediaUrl: mediaUrl || null,
    attachments,
    createdAt: new Date().toISOString(),
  };

  socialMessagesStore.set(msg.id, msg);
  conv.lastMessage = content;
  conv.lastMessageAt = new Date().toISOString();

  res.status(201).json({ message: "Message sent", messageItem: msg });
});

// Mark conversation as read
socialRouter.post("/inbox/conversations/:id/read", (req, res) => {
  const convId = req.params.id;
  const currentProfileId = req.worldContext!.profileId;

  const conv = socialConversationsStore.get(convId);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const participant = conv.participants.find((p) => p.profileId === currentProfileId);
  if (participant) {
    participant.lastReadAt = new Date().toISOString();
  }
  conv.unreadCount = 0;

  res.json({ success: true, message: "Conversation marked as read" });
});

// ==============================================================================
// 8. SOCIAL NOTIFICATIONS
// ==============================================================================

socialRouter.get("/notifications", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const { category } = req.query;

  let notifications = Array.from(socialNotificationsStore.values())
    .filter((n) => n.recipientProfileId === currentProfileId)
    .map((n) => {
      if (!n.actor && n.actorProfileId) {
        const found = Array.from(socialProfilesStore.values()).find((p) => p.id === n.actorProfileId);
        return { ...n, actor: found || null };
      }
      return n;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (category && category !== "all") {
    notifications = notifications.filter((n) => {
      switch (category) {
        case "likes":
          return n.notificationType === "like" || n.notificationType === "reel_like";
        case "comments":
          return n.notificationType === "comment" || n.notificationType === "nested_reply";
        case "followers":
          return n.notificationType === "follow";
        case "requests":
          return n.notificationType === "connection_req" || n.notificationType === "connection_accept";
        case "mentions":
          return n.notificationType === "mention";
        case "communities":
          return n.notificationType === "community_post" || n.notificationType === "community_join";
        case "events":
          return n.notificationType === "event_invite" || n.notificationType === "event_rsvp";
        case "stories_reels":
          return n.notificationType === "story_reply" || n.notificationType === "reel_like";
        default:
          return true;
      }
    });
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.json({ notifications, unreadCount, total: notifications.length });
});

socialRouter.post("/notifications/:id/read", (req, res) => {
  const notifId = req.params.id;
  const currentProfileId = req.worldContext!.profileId;

  const notif = socialNotificationsStore.get(notifId);
  if (!notif || notif.recipientProfileId !== currentProfileId) {
    return res.status(404).json({ error: "Notification not found" });
  }

  notif.isRead = true;
  res.json({ message: "Marked as read", notification: notif });
});

socialRouter.post("/notifications/read-all", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;

  Array.from(socialNotificationsStore.values())
    .filter((n) => n.recipientProfileId === currentProfileId)
    .forEach((n) => (n.isRead = true));

  res.json({ message: "All notifications marked as read" });
});

socialRouter.delete("/notifications/:id", (req, res) => {
  const notifId = req.params.id;
  const currentProfileId = req.worldContext!.profileId;

  const notif = socialNotificationsStore.get(notifId);
  if (!notif || notif.recipientProfileId !== currentProfileId) {
    return res.status(404).json({ error: "Notification not found" });
  }

  socialNotificationsStore.delete(notifId);
  res.json({ message: "Notification dismissed successfully", id: notifId });
});

// ==============================================================================
// 9. PRIVACY, SAFETY, BLOCKING & REPORTING
// ==============================================================================

socialRouter.post("/safety/block", (req, res) => {
  const blockerId = req.worldContext!.profileId;
  const result = blockUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { targetProfileId } = result.data;
  if (blockerId === targetProfileId) {
    return res.status(400).json({ error: "Cannot block yourself" });
  }

  socialBlocksStore.add(`${blockerId}:${targetProfileId}`);
  res.json({ message: "User blocked successfully", blockedId: targetProfileId });
});

socialRouter.delete("/safety/block/:targetProfileId", (req, res) => {
  const blockerId = req.worldContext!.profileId;
  const targetId = req.params.targetProfileId;

  socialBlocksStore.delete(`${blockerId}:${targetId}`);
  res.json({ message: "User unblocked successfully", unblockedId: targetId });
});

socialRouter.post("/safety/mute", (req, res) => {
  const muterId = req.worldContext!.profileId;
  const result = muteUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { targetProfileId } = result.data;
  socialMutesStore.add(`${muterId}:${targetProfileId}`);
  res.json({ message: "User muted successfully", mutedId: targetProfileId });
});

socialRouter.post("/safety/report", (req, res) => {
  const reporterId = req.worldContext!.profileId;
  const result = createReportSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { targetType, targetId, reason, details } = result.data;

  const newReport: SocialReport = {
    id: `rep-${Date.now()}`,
    reporterId,
    targetType,
    targetId,
    reason,
    details: details || null,
    status: "pending",
    adminNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialReportsStore.set(newReport.id, newReport);
  res.status(201).json({ message: "Report submitted for moderation review", report: newReport });
});

// ==============================================================================
// 10. UNIFIED SEARCH ACROSS PEOPLE, POSTS, COMMUNITIES & EVENTS
// ==============================================================================

socialRouter.get("/search", (req, res) => {
  const currentProfileId = req.worldContext!.profileId;
  const result = unifiedSearchSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { q, type, city } = result.data;
  const query = q.toLowerCase();

  // Search People
  const people =
    type === "all" || type === "people"
      ? Array.from(socialProfilesStore.values())
          .filter((p) => p.id !== currentProfileId && !p.isPrivate)
          .filter((p) => !socialBlocksStore.has(`${currentProfileId}:${p.id}`))
          .filter((p) => {
            const matches =
              p.displayName.toLowerCase().includes(query) ||
              p.username.toLowerCase().includes(query) ||
              p.interests.some((i) => i.toLowerCase().includes(query)) ||
              p.bio?.toLowerCase().includes(query);
            if (city && p.city?.toLowerCase() !== city.toLowerCase()) return false;
            return matches;
          })
      : [];

  // Search Posts
  const posts =
    type === "all" || type === "posts"
      ? Array.from(socialPostsStore.values())
          .filter((p) => !p.isArchived)
          .filter((p) => !socialBlocksStore.has(`${currentProfileId}:${p.authorId}`))
          .filter((p) => p.content.toLowerCase().includes(query))
      : [];

  // Search Communities
  const communities =
    type === "all" || type === "communities"
      ? Array.from(socialCommunitiesStore.values())
          .filter((c) => !c.isPrivate)
          .filter((c) => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query))
      : [];

  // Search Events
  const events =
    type === "all" || type === "events"
      ? Array.from(socialEventsStore.values())
          .filter((e) => e.status !== "cancelled")
          .filter((e) => {
            const matches =
              e.title.toLowerCase().includes(query) ||
              e.venueName.toLowerCase().includes(query) ||
              e.description.toLowerCase().includes(query);
            if (city && e.city.toLowerCase() !== city.toLowerCase()) return false;
            return matches;
          })
      : [];

  res.json({
    world: WORLDS.SOCIALIZING,
    query: q,
    results: {
      people,
      posts,
      communities,
      events,
    },
  });
});
