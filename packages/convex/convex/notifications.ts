import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// =====================
// Queries
// =====================

export const getNotifications = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    let notificationsQuery;
    if (args.unreadOnly) {
      notificationsQuery = ctx.db
        .query("notifications")
        .withIndex("by_user_and_read", (q) => 
          q.eq("userId", user._id).eq("isRead", false)
        )
        .order("desc");
    } else {
      notificationsQuery = ctx.db
        .query("notifications")
        .withIndex("by_user_id", (q) => q.eq("userId", user._id))
        .order("desc");
    }

    const paginatedNotifications = await notificationsQuery.paginate(args.paginationOpts);
    
    // Enrich with actor data if available
    const enrichedNotifications = await Promise.all(
      paginatedNotifications.page.map(async (notification) => {
        let actor = null;
        if (notification.metadata?.actorId) {
          actor = await ctx.db.get(notification.metadata.actorId);
        }
        return { ...notification, actor };
      })
    );

    return {
      ...paginatedNotifications,
      page: enrichedNotifications,
    };
  },
});

export const getUnreadCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return 0;
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => 
        q.eq("userId", user._id).eq("isRead", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

// =====================
// Mutations
// =====================

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== user._id) {
      throw new Error("This notification doesn't belong to you");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });

    return null;
  },
});

export const markAllAsRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => 
        q.eq("userId", user._id).eq("isRead", false)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }

    return null;
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== user._id) {
      throw new Error("This notification doesn't belong to you");
    }

    await ctx.db.delete(args.notificationId);

    return null;
  },
});

export const clearAllNotifications = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return null;
  },
});

// Internal mutations for creating notifications
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("follow"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("mention"),
      v.literal("subscription"),
      v.literal("tip"),
      v.literal("league_invite"),
      v.literal("league_update"),
      v.literal("achievement"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    imageUrl: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.object({
      actorId: v.optional(v.id("users")),
      postId: v.optional(v.id("posts")),
      commentId: v.optional(v.id("comments")),
      leagueId: v.optional(v.id("leagues")),
      transactionId: v.optional(v.id("transactions")),
    })),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      imageUrl: args.imageUrl,
      actionUrl: args.actionUrl,
      isRead: false,
      metadata: args.metadata,
    });

    return notificationId;
  },
});
