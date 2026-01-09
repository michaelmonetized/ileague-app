import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // =====================
  // User & Profile Tables
  // =====================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.string(),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    isInfluencer: v.boolean(),
    isVerified: v.boolean(),
    onboardingCompleted: v.boolean(),
    stripeCustomerId: v.optional(v.string()),
    stripeConnectAccountId: v.optional(v.string()),
    stripeConnectOnboarded: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_is_influencer", ["isInfluencer"]),

  influencerProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    tagline: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.string(),
    subcategories: v.array(v.string()),
    socialLinks: v.object({
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      twitch: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    followerCount: v.number(),
    subscriberCount: v.number(),
    totalEarnings: v.number(),
    monthlySubscriptionPrice: v.optional(v.number()),
    yearlySubscriptionPrice: v.optional(v.number()),
    tipEnabled: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_category", ["category"])
    .index("by_follower_count", ["followerCount"])
    .index("by_is_active", ["isActive"]),

  // =====================
  // League Tables
  // =====================
  leagues: defineTable({
    creatorId: v.id("users"),
    name: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.string(),
    type: v.union(
      v.literal("competition"),
      v.literal("community"),
      v.literal("challenge")
    ),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("subscribers_only")),
    memberCount: v.number(),
    maxMembers: v.optional(v.number()),
    rules: v.optional(v.string()),
    prizePool: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
  })
    .index("by_creator_id", ["creatorId"])
    .index("by_category", ["category"])
    .index("by_type", ["type"])
    .index("by_visibility", ["visibility"])
    .index("by_is_featured", ["isFeatured"])
    .index("by_is_active", ["isActive"]),

  leagueMembers: defineTable({
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("moderator"), v.literal("member")),
    score: v.number(),
    rank: v.optional(v.number()),
    joinedAt: v.number(),
  })
    .index("by_league_id", ["leagueId"])
    .index("by_user_id", ["userId"])
    .index("by_league_and_user", ["leagueId", "userId"])
    .index("by_league_and_score", ["leagueId", "score"]),

  // =====================
  // Content Tables
  // =====================
  posts: defineTable({
    authorId: v.id("users"),
    leagueId: v.optional(v.id("leagues")),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("poll"),
      v.literal("announcement")
    ),
    title: v.optional(v.string()),
    content: v.string(),
    mediaUrls: v.optional(v.array(v.string())),
    thumbnailUrl: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("followers"), v.literal("subscribers")),
    likeCount: v.number(),
    commentCount: v.number(),
    shareCount: v.number(),
    isPinned: v.boolean(),
    isScheduled: v.boolean(),
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
  })
    .index("by_author_id", ["authorId"])
    .index("by_league_id", ["leagueId"])
    .index("by_visibility", ["visibility"])
    .index("by_author_and_published", ["authorId", "publishedAt"])
    .index("by_is_pinned", ["isPinned"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
    likeCount: v.number(),
    replyCount: v.number(),
    isEdited: v.boolean(),
  })
    .index("by_post_id", ["postId"])
    .index("by_author_id", ["authorId"])
    .index("by_parent_id", ["parentId"]),

  likes: defineTable({
    userId: v.id("users"),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    targetId: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_user_and_target", ["userId", "targetType", "targetId"]),

  // =====================
  // Relationship Tables
  // =====================
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower_id", ["followerId"])
    .index("by_following_id", ["followingId"])
    .index("by_follower_and_following", ["followerId", "followingId"]),

  subscriptions: defineTable({
    subscriberId: v.id("users"),
    influencerId: v.id("users"),
    tier: v.union(v.literal("monthly"), v.literal("yearly")),
    status: v.union(v.literal("active"), v.literal("canceled"), v.literal("expired")),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  })
    .index("by_subscriber_id", ["subscriberId"])
    .index("by_influencer_id", ["influencerId"])
    .index("by_subscriber_and_influencer", ["subscriberId", "influencerId"])
    .index("by_stripe_subscription_id", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  // =====================
  // Payment Tables
  // =====================
  transactions: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    type: v.union(v.literal("subscription"), v.literal("tip"), v.literal("prize"), v.literal("refund")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded")),
    stripePaymentIntentId: v.optional(v.string()),
    stripeTransferId: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.object({
      subscriptionId: v.optional(v.id("subscriptions")),
      leagueId: v.optional(v.id("leagues")),
      postId: v.optional(v.id("posts")),
    })),
  })
    .index("by_sender_id", ["senderId"])
    .index("by_recipient_id", ["recipientId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_stripe_payment_intent_id", ["stripePaymentIntentId"]),

  payouts: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    stripePayoutId: v.optional(v.string()),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"]),

  // =====================
  // Notification Tables
  // =====================
  notifications: defineTable({
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
    isRead: v.boolean(),
    metadata: v.optional(v.object({
      actorId: v.optional(v.id("users")),
      postId: v.optional(v.id("posts")),
      commentId: v.optional(v.id("comments")),
      leagueId: v.optional(v.id("leagues")),
      transactionId: v.optional(v.id("transactions")),
    })),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"])
    .index("by_type", ["type"]),

  // =====================
  // Analytics Tables
  // =====================
  profileViews: defineTable({
    profileUserId: v.id("users"),
    viewerId: v.optional(v.id("users")),
    viewedAt: v.number(),
    source: v.optional(v.string()),
  })
    .index("by_profile_user_id", ["profileUserId"])
    .index("by_profile_and_date", ["profileUserId", "viewedAt"]),

  postViews: defineTable({
    postId: v.id("posts"),
    viewerId: v.optional(v.id("users")),
    viewedAt: v.number(),
    duration: v.optional(v.number()),
  })
    .index("by_post_id", ["postId"])
    .index("by_post_and_date", ["postId", "viewedAt"]),

  // =====================
  // Media Storage
  // =====================
  media: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("audio")),
    mimeType: v.string(),
    size: v.number(),
    filename: v.string(),
    url: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_storage_id", ["storageId"]),

  // =====================
  // Reports & Moderation
  // =====================
  reports: defineTable({
    reporterId: v.id("users"),
    targetType: v.union(v.literal("user"), v.literal("post"), v.literal("comment"), v.literal("league")),
    targetId: v.string(),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("inappropriate"),
      v.literal("misinformation"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved"), v.literal("dismissed")),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_reporter_id", ["reporterId"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_status", ["status"]),
});
