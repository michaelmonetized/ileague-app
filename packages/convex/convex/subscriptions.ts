import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// =====================
// Queries
// =====================

export const getActiveSubscription = query({
  args: { influencerId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscriber_and_influencer", (q) => 
        q.eq("subscriberId", currentUser._id).eq("influencerId", args.influencerId)
      )
      .unique();

    if (!subscription || subscription.status !== "active") {
      return null;
    }

    return subscription;
  },
});

export const getMySubscriptions = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const paginatedSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscriber_id", (q) => q.eq("subscriberId", currentUser._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const enrichedSubscriptions = await Promise.all(
      paginatedSubscriptions.page.map(async (subscription) => {
        const influencer = await ctx.db.get(subscription.influencerId);
        const profile = influencer
          ? await ctx.db
              .query("influencerProfiles")
              .withIndex("by_user_id", (q) => q.eq("userId", influencer._id))
              .unique()
          : null;

        return {
          ...subscription,
          influencer,
          profile,
        };
      })
    );

    return {
      ...paginatedSubscriptions,
      page: enrichedSubscriptions,
    };
  },
});

export const getMySubscribers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const paginatedSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_influencer_id", (q) => q.eq("influencerId", currentUser._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const enrichedSubscriptions = await Promise.all(
      paginatedSubscriptions.page.map(async (subscription) => {
        const subscriber = await ctx.db.get(subscription.subscriberId);
        return {
          ...subscription,
          subscriber,
        };
      })
    );

    return {
      ...paginatedSubscriptions,
      page: enrichedSubscriptions,
    };
  },
});

export const getSubscriberCount = query({
  args: { influencerId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const activeSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_influencer_id", (q) => q.eq("influencerId", args.influencerId))
      .collect();

    return activeSubscriptions.filter((s) => s.status === "active").length;
  },
});

// =====================
// Mutations
// =====================

export const createSubscription = internalMutation({
  args: {
    subscriberId: v.id("users"),
    influencerId: v.id("users"),
    tier: v.union(v.literal("monthly"), v.literal("yearly")),
    stripeSubscriptionId: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
  },
  returns: v.id("subscriptions"),
  handler: async (ctx, args) => {
    // Check for existing subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscriber_and_influencer", (q) => 
        q.eq("subscriberId", args.subscriberId).eq("influencerId", args.influencerId)
      )
      .unique();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        tier: args.tier,
        status: "active",
        stripeSubscriptionId: args.stripeSubscriptionId,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });
      return existing._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("subscriptions", {
      subscriberId: args.subscriberId,
      influencerId: args.influencerId,
      tier: args.tier,
      status: "active",
      stripeSubscriptionId: args.stripeSubscriptionId,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });

    // Update subscriber count on influencer profile
    const profile = await ctx.db
      .query("influencerProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.influencerId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        subscriberCount: profile.subscriberCount + 1,
      });
    }

    // Create notification for influencer
    const subscriber = await ctx.db.get(args.subscriberId);
    if (subscriber) {
      await ctx.db.insert("notifications", {
        userId: args.influencerId,
        type: "subscription",
        title: "New Subscriber! 🎉",
        message: `${subscriber.firstName ?? subscriber.username} just subscribed to you`,
        imageUrl: subscriber.imageUrl,
        actionUrl: `/@${subscriber.username}`,
        isRead: false,
        metadata: {
          actorId: args.subscriberId,
        },
      });
    }

    return subscriptionId;
  },
});

export const updateSubscriptionStatus = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.union(v.literal("active"), v.literal("canceled"), v.literal("expired")),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription_id", (q) => 
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const previousStatus = subscription.status;

    const updates: Partial<typeof subscription> = {
      status: args.status,
    };

    if (args.currentPeriodEnd !== undefined) {
      updates.currentPeriodEnd = args.currentPeriodEnd;
    }

    if (args.cancelAtPeriodEnd !== undefined) {
      updates.cancelAtPeriodEnd = args.cancelAtPeriodEnd;
    }

    await ctx.db.patch(subscription._id, updates);

    // Update subscriber count if status changed
    if (previousStatus === "active" && args.status !== "active") {
      const profile = await ctx.db
        .query("influencerProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", subscription.influencerId))
        .unique();

      if (profile) {
        await ctx.db.patch(profile._id, {
          subscriberCount: Math.max(0, profile.subscriberCount - 1),
        });
      }
    }

    return null;
  },
});

export const cancelSubscription = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.subscriberId !== currentUser._id) {
      throw new Error("You can only cancel your own subscriptions");
    }

    // Mark for cancellation at period end
    await ctx.db.patch(args.subscriptionId, {
      cancelAtPeriodEnd: true,
    });

    // Note: The actual Stripe cancellation should be handled via the Stripe API
    // This mutation just marks it locally

    return null;
  },
});
