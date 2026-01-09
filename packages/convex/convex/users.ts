import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// =====================
// Queries
// =====================

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const getInfluencers = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      user: v.object({
        _id: v.id("users"),
        _creationTime: v.number(),
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
      }),
      profile: v.object({
        _id: v.id("influencerProfiles"),
        _creationTime: v.number(),
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
      }),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let profilesQuery = ctx.db
      .query("influencerProfiles")
      .withIndex("by_is_active", (q) => q.eq("isActive", true));

    const profiles = await profilesQuery.take(limit * 2);
    
    const results: Array<{
      user: typeof user;
      profile: typeof profiles[0];
    }> = [];
    
    for (const profile of profiles) {
      if (args.category && profile.category !== args.category) {
        continue;
      }
      
      const user = await ctx.db.get(profile.userId);
      if (!user) continue;
      
      results.push({ user, profile });
      
      if (results.length >= limit) break;
    }
    
    return results;
  },
});

export const searchUsers = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchTerm = args.query.toLowerCase();
    
    // For simplicity, we'll do a basic filter. In production, use search indexes.
    const allUsers = await ctx.db.query("users").take(1000);
    
    const filtered = allUsers.filter((user) => {
      const username = user.username.toLowerCase();
      const firstName = user.firstName?.toLowerCase() ?? "";
      const lastName = user.lastName?.toLowerCase() ?? "";
      
      return (
        username.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm)
      );
    });
    
    return filtered.slice(0, limit);
  },
});

// =====================
// Mutations
// =====================

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.string(),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      username: args.username,
      imageUrl: args.imageUrl,
      isInfluencer: false,
      isVerified: false,
      onboardingCompleted: false,
    });

    return userId;
  },
});

export const updateUser = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
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

    // Check username uniqueness if updating
    if (args.username && args.username !== user.username) {
      const existingUsername = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .unique();

      if (existingUsername) {
        throw new Error("Username already taken");
      }
    }

    await ctx.db.patch(user._id, {
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.username !== undefined && { username: args.username }),
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
      ...(args.bio !== undefined && { bio: args.bio }),
    });

    return null;
  },
});

export const completeOnboarding = mutation({
  args: {
    isInfluencer: v.boolean(),
    username: v.string(),
    bio: v.optional(v.string()),
    // Influencer-specific fields
    displayName: v.optional(v.string()),
    category: v.optional(v.string()),
    subcategories: v.optional(v.array(v.string())),
    tagline: v.optional(v.string()),
  },
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

    // Check username uniqueness
    if (args.username !== user.username) {
      const existingUsername = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique();

      if (existingUsername) {
        throw new Error("Username already taken");
      }
    }

    // Update user
    await ctx.db.patch(user._id, {
      username: args.username,
      bio: args.bio,
      isInfluencer: args.isInfluencer,
      onboardingCompleted: true,
    });

    // Create influencer profile if applicable
    if (args.isInfluencer && args.displayName && args.category) {
      await ctx.db.insert("influencerProfiles", {
        userId: user._id,
        displayName: args.displayName,
        tagline: args.tagline,
        category: args.category,
        subcategories: args.subcategories ?? [],
        socialLinks: {},
        followerCount: 0,
        subscriberCount: 0,
        totalEarnings: 0,
        tipEnabled: true,
        isActive: true,
      });
    }

    return null;
  },
});

export const updateInfluencerProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    subcategories: v.optional(v.array(v.string())),
    socialLinks: v.optional(
      v.object({
        twitter: v.optional(v.string()),
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        tiktok: v.optional(v.string()),
        twitch: v.optional(v.string()),
        website: v.optional(v.string()),
      })
    ),
    monthlySubscriptionPrice: v.optional(v.number()),
    yearlySubscriptionPrice: v.optional(v.number()),
    tipEnabled: v.optional(v.boolean()),
  },
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

    const profile = await ctx.db
      .query("influencerProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      throw new Error("Influencer profile not found");
    }

    const updates: Partial<typeof profile> = {};
    
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.tagline !== undefined) updates.tagline = args.tagline;
    if (args.coverImageUrl !== undefined) updates.coverImageUrl = args.coverImageUrl;
    if (args.category !== undefined) updates.category = args.category;
    if (args.subcategories !== undefined) updates.subcategories = args.subcategories;
    if (args.socialLinks !== undefined) updates.socialLinks = args.socialLinks;
    if (args.monthlySubscriptionPrice !== undefined) updates.monthlySubscriptionPrice = args.monthlySubscriptionPrice;
    if (args.yearlySubscriptionPrice !== undefined) updates.yearlySubscriptionPrice = args.yearlySubscriptionPrice;
    if (args.tipEnabled !== undefined) updates.tipEnabled = args.tipEnabled;

    await ctx.db.patch(profile._id, updates);

    return null;
  },
});

export const deleteUserByClerkId = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      // Delete associated influencer profile
      const profile = await ctx.db
        .query("influencerProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", user._id))
        .unique();

      if (profile) {
        await ctx.db.delete(profile._id);
      }

      await ctx.db.delete(user._id);
    }

    return null;
  },
});

export const updateUserByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      const updates: Partial<typeof user> = {};
      
      if (args.email !== undefined) updates.email = args.email;
      if (args.firstName !== undefined) updates.firstName = args.firstName;
      if (args.lastName !== undefined) updates.lastName = args.lastName;
      if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;

      await ctx.db.patch(user._id, updates);
    }

    return null;
  },
});
