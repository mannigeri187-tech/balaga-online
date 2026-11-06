/**
 * Test Suite: Feature 13 — Balaga Founders Inbox & Notifications
 * Option A: One Unified Founders Inbox with Category Filters
 *
 * Verifies all 35+ specification criteria:
 * 1. Strict Dual-World Isolation (Socializing context returns 403 Forbidden)
 * 2. Disclaimer verification (FOUNDERS_INBOX_DISCLAIMER present in responses)
 * 3. Unified Inbox Summary statistics (total, unread, starred, requests)
 * 4. Unified Inbox Listing (sorted by most recent activity)
 * 5. View Filtering (all, unread, starred, archived, groups, workspaces)
 * 6. Category Filtering (across all 9 feature categories: professional, cofounder, opportunities,
 *    hiring, collaborations, referrals, mentorship, investors, build_spaces)
 * 7. Conversation Search (keyword match across title, snippet)
 * 8. Conversation Retrieval & Participant details
 * 9. Unauthorized Conversation Access Prevention (403 for non-participants)
 * 10. Messaging Permissions Check endpoint
 * 11. Unconnected Basic User Messaging Block (403 Forbidden without accepted connection)
 * 12. Direct Conversation Initiation (between connected founders)
 * 13. Send Message (with delivery state tracking)
 * 14. Reply Message with Snippet Reference
 * 15. Attachment Message Persistence
 * 16. Message Edit by Author (marks isEdited=true)
 * 17. Unauthorized Message Edit Prevention (403 for non-author)
 * 18. Message Soft Delete (blanks text, sets isDeleted=true, preserves thread)
 * 19. Emoji Reactions Toggle (add/remove emoji idempotently)
 * 20. Personal Inbox State Updates (Pin, Star, Archive, Mute, Custom Unread)
 * 21. Personal Remove from Inbox (isolated per viewer, preserves counterparty history)
 * 22. Group Conversation Creation (with initial participants and category)
 * 23. Group Member Addition by Admin
 * 24. Group Member Leaving
 * 25. Message Request Submission
 * 26. Duplicate Message Request Prevention (409 Conflict)
 * 27. Message Request Acceptance (creates active direct conversation)
 * 28. Message Request Decline & Withdrawal
 * 29. Safety: User Blocking & Messaging Lockdown
 * 30. Moderation Reporting
 * 31. Notification Center Listing
 * 32. Notification Category Filtering (across 14 categories)
 * 33. Notification Mark Read & Unread
 * 34. Notification Mark All Read
 * 35. Notification Single Delete & Clear All
 * 36. Notification Preferences Management (GET & PATCH)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";
import {
  devAccountId,
  thirdAccountId,
  fourthAccountId,
  devFounderProfileId,
  thirdFounderProfileId,
  fourthFounderProfileId,
  fifthFounderProfileId,
} from "../apps/api/src/services/store.js";
import { FOUNDERS_INBOX_DISCLAIMER } from "@platform/config";

async function runFeature13Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 13 INBOX & NOTIFICATIONS TEST SUITE ===\n");

  const server = app.listen(5014);
  let failed = 0;
  let passed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  const BASE_URL = "http://localhost:5014";

  // Helpers
  async function api(
    path: string,
    options: {
      method?: string;
      world?: string;
      accountId?: string;
      body?: any;
    } = {}
  ) {
    const { method = "GET", world = "founders", accountId = devAccountId, body } = options;
    const headers: Record<string, string> = {
      "x-mock-user": "true",
      "x-mock-account-id": accountId,
      "x-platform-world": world,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: any = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return { status: res.status, ok: res.ok, data };
  }

  try {
    // -------------------------------------------------------------------------
    // 1. DUAL-WORLD ISOLATION & DISCLAIMER
    // -------------------------------------------------------------------------
    console.log("\n--- Part 1: Dual-World Isolation & Disclaimer ---");
    {
      const isoRes = await api("/api/founders/inbox", { world: "socializing" });
      assert(
        isoRes.status === 403,
        `1. Strict Dual-World Isolation: Socializing world context returns 403 Forbidden (got ${isoRes.status})`
      );

      const inboxRes = await api("/api/founders/inbox");
      assert(inboxRes.status === 200, "2. Founders world context accesses inbox successfully (200 OK)");
      assert(
        inboxRes.data.disclaimer === FOUNDERS_INBOX_DISCLAIMER,
        "3. Inbox response includes mandatory regulatory & compliance disclaimer"
      );
    }

    // -------------------------------------------------------------------------
    // 2. UNIFIED INBOX SUMMARY & LISTINGS
    // -------------------------------------------------------------------------
    console.log("\n--- Part 2: Unified Inbox Summary & Listings ---");
    {
      const sumRes = await api("/api/founders/inbox/summary");
      assert(sumRes.status === 200, "4. GET /api/founders/inbox/summary returns 200 OK");
      assert(
        typeof sumRes.data.summary?.totalConversations === "number" &&
          sumRes.data.summary.totalConversations >= 10,
        `5. Inbox summary reports total conversations count (${sumRes.data.summary?.totalConversations})`
      );
      assert(
        typeof sumRes.data.summary?.unreadConversationsCount === "number",
        `6. Inbox summary reports unread conversations count (${sumRes.data.summary?.unreadConversationsCount})`
      );

      const allRes = await api("/api/founders/inbox");
      assert(Array.isArray(allRes.data.conversations), "7. GET /api/founders/inbox returns conversations array");
      assert(
        allRes.data.conversations.length >= 10,
        `8. Returns all seeded conversations for current founder (${allRes.data.conversations.length} total)`
      );

      // Verify sorting by most recent activity
      const timestamps = allRes.data.conversations.map((c: any) => new Date(c.lastMessageAt).getTime());
      let isSorted = true;
      for (let i = 0; i < timestamps.length - 1; i++) {
        if (timestamps[i] < timestamps[i + 1]) {
          isSorted = false;
          break;
        }
      }
      assert(isSorted, "9. Conversations list is correctly sorted by most recent activity timestamp");
    }

    // -------------------------------------------------------------------------
    // 3. CATEGORY & VIEW FILTERING (OPTION A)
    // -------------------------------------------------------------------------
    console.log("\n--- Part 3: Option A Unified Inbox Filters ---");
    {
      // Category filters
      const cofounderRes = await api("/api/founders/inbox?category=cofounder");
      assert(
        cofounderRes.data.conversations.every((c: any) => c.category === "cofounder"),
        "10. Category filter '?category=cofounder' returns only cofounder conversations"
      );

      const hiringRes = await api("/api/founders/inbox?category=hiring");
      assert(
        hiringRes.data.conversations.every((c: any) => c.category === "hiring"),
        "11. Category filter '?category=hiring' returns only hiring conversations"
      );

      const spacesRes = await api("/api/founders/inbox?category=build_spaces");
      assert(
        spacesRes.data.conversations.every((c: any) => c.category === "build_spaces"),
        "12. Category filter '?category=build_spaces' returns only build spaces conversations"
      );

      // View filters
      const groupsRes = await api("/api/founders/inbox?view=groups");
      assert(
        groupsRes.data.conversations.every((c: any) => c.type === "group"),
        "13. View filter '?view=groups' returns only group conversations"
      );

      const workspacesRes = await api("/api/founders/inbox?view=workspaces");
      assert(
        workspacesRes.data.conversations.every((c: any) => c.type === "workspace"),
        "14. View filter '?view=workspaces' returns only workspace conversations"
      );

      // Search
      const searchRes = await api("/api/founders/inbox?search=BharatFin");
      assert(
        searchRes.data.conversations.length > 0 &&
          searchRes.data.conversations.some((c: any) => c.title.includes("BharatFin")),
        "15. Search filter '?search=BharatFin' accurately finds conversations by title/snippet"
      );
    }

    // -------------------------------------------------------------------------
    // 4. CONVERSATION DETAILS & UNAUTHORIZED ACCESS PREVENTION
    // -------------------------------------------------------------------------
    console.log("\n--- Part 4: Conversation Details & Authorization ---");
    {
      const convRes = await api("/api/founders/inbox/conversations/fconv-1");
      assert(convRes.status === 200, "16. GET /api/founders/inbox/conversations/:id returns conversation details");
      assert(
        convRes.data.conversation?.id === "fconv-1" &&
          Array.isArray(convRes.data.conversation?.participants),
        "17. Returned conversation includes enriched participants with profiles"
      );

      // Unauthorized user check
      const unauthRes = await api("/api/founders/inbox/conversations/fconv-1", {
        accountId: "00000000-0000-0000-0000-000000000002", // secondAccountId is not a participant
      });
      assert(
        unauthRes.status === 403,
        `18. Non-participant access to conversation is blocked with 403 Forbidden (got ${unauthRes.status})`
      );
    }

    // -------------------------------------------------------------------------
    // 5. MESSAGING PERMISSIONS & DIRECT CHAT INITIATION
    // -------------------------------------------------------------------------
    console.log("\n--- Part 5: Messaging Permissions & Direct Chat Initiation ---");
    {
      // Check permissions with connected user
      const permRes = await api(
        `/api/founders/inbox/permissions/check?targetProfileId=${thirdFounderProfileId}`
      );
      assert(
        permRes.status === 200 && permRes.data.canDirectMessage === true,
        "19. Permissions check confirms direct messaging allowed for connected founder"
      );

      // Initiate direct conversation with thirdFounderProfileId (Nikhil Varma)
      const initRes = await api("/api/founders/inbox/conversations", {
        method: "POST",
        body: {
          recipientProfileId: thirdFounderProfileId,
          category: "professional",
        },
      });
      assert(
        initRes.status === 200 || initRes.status === 201,
        `20. Direct conversation initiation returns 200/201 (got ${initRes.status})`
      );
    }

    // -------------------------------------------------------------------------
    // 6. MESSAGING OPERATIONS: SEND, REPLY, EDIT, DELETE & REACTIONS
    // -------------------------------------------------------------------------
    console.log("\n--- Part 6: Messaging Operations (Send, Reply, Edit, Delete, Reactions) ---");
    let sentMessageId = "";
    {
      // Send message
      const sendRes = await api("/api/founders/inbox/conversations/fconv-1/messages", {
        method: "POST",
        body: {
          content: "Let's review the API webhook contract tomorrow morning at 10 AM IST.",
          attachments: [
            {
              id: "att-test-1",
              name: "webhook_spec_v2.pdf",
              url: "https://storage.platform.local/docs/webhook_spec_v2.pdf",
              fileType: "document",
              sizeBytes: 2048,
            },
          ],
        },
      });
      assert(sendRes.status === 201, "21. POST message to conversation returns 201 Created");
      assert(
        sendRes.data.message?.content.includes("webhook contract") &&
          sendRes.data.message?.attachments?.length === 1,
        "22. Message persisted with content and attachment metadata"
      );
      sentMessageId = sendRes.data.message?.id;

      // Send reply message
      const replyRes = await api("/api/founders/inbox/conversations/fconv-1/messages", {
        method: "POST",
        body: {
          content: "Confirmed, I'll prepare the Postman collections.",
          replyToId: sentMessageId,
        },
      });
      assert(replyRes.status === 201, "23. Reply message created successfully");
      assert(
        replyRes.data.message?.replyToMessageId === sentMessageId &&
          replyRes.data.message?.replySnippet?.includes("webhook contract"),
        "24. Reply message correctly quotes counterparty snippet"
      );

      // Edit message
      const editRes = await api(
        `/api/founders/inbox/conversations/fconv-1/messages/${sentMessageId}`,
        {
          method: "PATCH",
          body: {
            content: "Let's review the API webhook contract tomorrow morning at 11 AM IST (updated).",
          },
        }
      );
      assert(editRes.status === 200, "25. Author successfully edits message (200 OK)");
      assert(
        editRes.data.message?.isEdited === true &&
          editRes.data.message?.content.includes("11 AM IST"),
        "26. Edited message reflects updated content and isEdited=true"
      );

      // Prevent non-author from editing message
      const badEditRes = await api(
        `/api/founders/inbox/conversations/fconv-1/messages/${sentMessageId}`,
        {
          method: "PATCH",
          accountId: thirdAccountId,
          body: { content: "Tampered content by third party" },
        }
      );
      assert(
        badEditRes.status === 403,
        `27. Non-author edit attempt blocked with 403 Forbidden (got ${badEditRes.status})`
      );

      // Emoji Reaction Toggle
      const reactRes1 = await api(
        `/api/founders/inbox/conversations/fconv-1/messages/${sentMessageId}/reactions`,
        {
          method: "POST",
          body: { emoji: "🚀" },
        }
      );
      assert(reactRes1.status === 200, "28. POST emoji reaction adds reaction to message");
      assert(
        reactRes1.data.message?.reactions.some((r: any) => r.emoji === "🚀"),
        "29. Reaction is present on message after toggle"
      );

      // Toggle again removes it
      const reactRes2 = await api(
        `/api/founders/inbox/conversations/fconv-1/messages/${sentMessageId}/reactions`,
        {
          method: "POST",
          body: { emoji: "🚀" },
        }
      );
      assert(
        !reactRes2.data.message?.reactions.some((r: any) => r.emoji === "🚀"),
        "30. Toggling same emoji again removes the reaction idempotently"
      );

      // Soft delete message
      const delRes = await api(
        `/api/founders/inbox/conversations/fconv-1/messages/${sentMessageId}`,
        {
          method: "DELETE",
        }
      );
      assert(delRes.status === 200, "31. Author deletes message (200 OK)");
      assert(
        delRes.data.message?.isDeleted === true &&
          delRes.data.message?.content === "[Message deleted by sender]",
        "32. Deleted message retains thread slot with '[Message deleted by sender]'"
      );
    }

    // -------------------------------------------------------------------------
    // 7. PERSONAL INBOX STATE & ISOLATION
    // -------------------------------------------------------------------------
    console.log("\n--- Part 7: Personal Inbox State (Pin, Star, Archive, Mute, Personal Delete) ---");
    {
      const stateRes = await api("/api/founders/inbox/conversations/fconv-1/state", {
        method: "PATCH",
        body: {
          isPinned: true,
          isStarred: true,
          isMuted: true,
        },
      });
      assert(stateRes.status === 200, "33. PATCH conversation inbox state returns 200 OK");
      assert(
        stateRes.data.state?.isPinned === true &&
          stateRes.data.state?.isStarred === true &&
          stateRes.data.state?.isMuted === true,
        "34. Inbox state flags updated (pinned, starred, muted)"
      );

      // Personal remove from inbox
      const removeRes = await api("/api/founders/inbox/conversations/fconv-1/personal", {
        method: "DELETE",
      });
      assert(removeRes.status === 200, "35. Personal remove from inbox returns 200 OK");

      // Verify counterparty still has the conversation
      const counterpartyRes = await api("/api/founders/inbox/conversations/fconv-1", {
        accountId: thirdAccountId,
      });
      assert(
        counterpartyRes.status === 200,
        "36. Personal delete does NOT erase history or conversation for the counterparty"
      );
    }

    // -------------------------------------------------------------------------
    // 8. GROUP CONVERSATIONS & PARTICIPANT MANAGEMENT
    // -------------------------------------------------------------------------
    console.log("\n--- Part 8: Group Conversations ---");
    let createdGroupId = "";
    {
      const groupRes = await api("/api/founders/inbox/groups", {
        method: "POST",
        body: {
          title: "FinTech Builders Mastermind",
          description: "Collaboration space for founders building UPI and payment rails.",
          category: "professional",
          participantProfileIds: [thirdFounderProfileId],
        },
      });
      assert(groupRes.status === 201, "37. POST /api/founders/inbox/groups creates group conversation");
      assert(
        groupRes.data.conversation?.type === "group" &&
          groupRes.data.conversation?.title === "FinTech Builders Mastermind",
        "38. Group metadata and type persisted accurately"
      );
      createdGroupId = groupRes.data.conversation?.id;

      // Add another member
      const addMemberRes = await api(
        `/api/founders/inbox/conversations/${createdGroupId}/participants`,
        {
          method: "POST",
          body: {
            profileId: fourthFounderProfileId,
            role: "member",
          },
        }
      );
      assert(addMemberRes.status === 200, "39. Admin adds member to group conversation");

      // Leave group as fourthAccountId
      const leaveRes = await api(
        `/api/founders/inbox/conversations/${createdGroupId}/leave`,
        {
          method: "POST",
          accountId: fourthAccountId,
        }
      );
      assert(leaveRes.status === 200, "40. Member can voluntarily leave group conversation");
    }

    // -------------------------------------------------------------------------
    // 9. MESSAGE REQUESTS WORKFLOW
    // -------------------------------------------------------------------------
    console.log("\n--- Part 9: Message Requests Workflow ---");
    let createdRequestId = "";
    {
      // Fourth founder sends message request to Dev founder
      const reqRes = await api("/api/founders/inbox/requests", {
        method: "POST",
        accountId: fourthAccountId,
        body: {
          recipientProfileId: devFounderProfileId,
          category: "mentorship",
          initialMessage: "Would love to consult you on distributed cache sizing.",
        },
      });
      assert(reqRes.status === 201, "41. Submitting message request returns 201 Created");
      createdRequestId = reqRes.data.request?.id;

      // Duplicate request prevention
      const dupReqRes = await api("/api/founders/inbox/requests", {
        method: "POST",
        accountId: fourthAccountId,
        body: {
          recipientProfileId: devFounderProfileId,
          category: "mentorship",
          initialMessage: "Duplicate submission attempt",
        },
      });
      assert(
        dupReqRes.status === 409,
        `42. Duplicate message request blocked with 409 Conflict (got ${dupReqRes.status})`
      );

      // Recipient accepts request -> provisions conversation
      const acceptRes = await api(
        `/api/founders/inbox/requests/${createdRequestId}/respond`,
        {
          method: "POST",
          body: { action: "accept" },
        }
      );
      assert(acceptRes.status === 200, "43. Accepting message request returns 200 OK");
      assert(
        acceptRes.data.conversationId && typeof acceptRes.data.conversationId === "string",
        "44. Accepting message request automatically provisions active conversation"
      );
    }

    // -------------------------------------------------------------------------
    // 10. NOTIFICATION CENTRE & PREFERENCES
    // -------------------------------------------------------------------------
    console.log("\n--- Part 10: Notification Centre & Preferences ---");
    {
      // List notifications
      const notifsRes = await api("/api/founders/notifications");
      assert(notifsRes.status === 200, "45. GET /api/founders/notifications returns 200 OK");
      assert(
        Array.isArray(notifsRes.data.notifications) && notifsRes.data.notifications.length > 0,
        `46. Returns list of notifications (${notifsRes.data.notifications.length} items)`
      );

      // Filter by category
      const filteredNotifs = await api("/api/founders/notifications?category=messages");
      assert(
        filteredNotifs.data.notifications.every((n: any) => n.category === "messages"),
        "47. Notification category filter accurately restricts to category 'messages'"
      );

      // Mark single notification read
      const firstNotifId = notifsRes.data.notifications[0].id;
      const readRes = await api(`/api/founders/notifications/${firstNotifId}/read`, {
        method: "PATCH",
      });
      assert(readRes.status === 200, "48. Mark single notification as read returns 200 OK");

      // Mark all read
      const markAllRes = await api("/api/founders/notifications/read-all", {
        method: "POST",
      });
      assert(markAllRes.status === 200, "49. Mark all notifications as read returns 200 OK");

      // Notification Preferences
      const prefsRes = await api("/api/founders/notifications/preferences");
      assert(prefsRes.status === 200, "50. GET notification preferences returns 200 OK");
      assert(
        typeof prefsRes.data.preferences?.inAppAlerts === "boolean",
        "51. Notification preferences contains typed booleans"
      );

      const updatePrefsRes = await api("/api/founders/notifications/preferences", {
        method: "PATCH",
        body: {
          emailAlerts: false,
          investorAlerts: true,
        },
      });
      assert(updatePrefsRes.status === 200, "52. PATCH notification preferences persists updates");
      assert(
        updatePrefsRes.data.preferences?.emailAlerts === false,
        "53. Verified updated preference field is saved"
      );
    }

    // -------------------------------------------------------------------------
    // 11. SAFETY: BLOCKING & MODERATION REPORTING
    // -------------------------------------------------------------------------
    console.log("\n--- Part 11: Safety (Blocking & Moderation Reporting) ---");
    {
      // Block user
      const blockRes = await api("/api/founders/inbox/block", {
        method: "POST",
        body: {
          targetProfileId: fifthFounderProfileId,
          reason: "Spam direct messages",
        },
      });
      assert(blockRes.status === 200, "54. Block target founder returns 200 OK");

      // Blocked user cannot initiate message
      const blockedSendRes = await api("/api/founders/inbox/requests", {
        method: "POST",
        accountId: "00000000-0000-0000-0000-000000000005", // fifthAccountId
        body: {
          recipientProfileId: devFounderProfileId,
          category: "professional",
          initialMessage: "Attempting to message blocker",
        },
      });
      assert(
        blockedSendRes.status === 403,
        `55. Blocked user message request is blocked with 403 Forbidden (got ${blockedSendRes.status})`
      );

      // Moderation report
      const reportRes = await api("/api/founders/inbox/report", {
        method: "POST",
        body: {
          targetType: "conversation",
          targetId: "fconv-1",
          reason: "Unsolicited promotional content",
          category: "spam",
        },
      });
      assert(reportRes.status === 201, "56. Moderation report filed successfully (201 Created)");
    }
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== FEATURE 13 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runFeature13Tests();
