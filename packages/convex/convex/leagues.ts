import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// =====================
// Queries
// =====================

export const getLeagues = query({
  args: {
    category: v.optional(v.string()),
    type: v.optional(v.union(v.literal("competition"), v.literal("community"), v.literal("challenge"))),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("subscribers_only"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let leaguesQuery = ctx.db
      .query("leagues")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .order("desc");

    const paginatedLeagues = await leaguesQuery.paginate(args.paginationOpts);
    
    // Filter and enrich
    const enrichedLeagues = await Promise.all(
      paginatedLeagues.page
        .filter((league) => {
          if (args.category && league.category !== args.category) return false;
          if (args.type && league.type !== args.type) return false;
          if (args.visibility && league.visibility !== args.visibility) return false;
          return true;
        })
        .map(async (league) => {
          const creator = await ctx.db.get(league.creatorId);
          return { ...league, creator };
        })
    );

    return {
      ...paginatedLeagues,
      page: enrichedLeagues,
    };
  },
});

export const getFeaturedLeagues = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const leagues = await ctx.db
      .query("leagues")
      .withIndex("by_is_featured", (q) => q.eq("isFeatured", true))
      .take(limit);
    
    const enrichedLeagues = await Promise.all(
      leagues.map(async (league) => {
        const creator = await ctx.db.get(league.creatorId);
        return { ...league, creator };
      })
    );

    return enrichedLeagues;
  },
});

export const getLeagueById = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const league = await ctx.db.get(args.leagueId);
    
    if (!league) return null;
    
    const creator = await ctx.db.get(league.creatorId);
    
    let isMember = false;
    let memberRole = null;
    
    if (identity) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      
      if (currentUser) {
        const membership = await ctx.db
          .query("leagueMembers")
          .withIndex("by_league_and_user", (q) => 
            q.eq("leagueId", args.leagueId).eq("userId", currentUser._id)
          )
          .unique();
        
        if (membership) {
          isMember = true;
          memberRole = membership.role;
        }
      }
    }
    
    return {
      ...league,
      creator,
      isMember,
      memberRole,
    };
  },
});

export const getUserLeagues = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("leagueMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
    
    const leagues = await Promise.all(
      memberships.map(async (membership) => {
        const league = await ctx.db.get(membership.leagueId);
        if (!league) return null;
        
        const creator = await ctx.db.get(league.creatorId);
        return {
          ...league,
          creator,
          role: membership.role,
          score: membership.score,
          rank: membership.rank,
        };
      })
    );

    return leagues.filter(Boolean);
  },
});

export const getLeagueMembers = query({
  args: { 
    leagueId: v.id("leagues"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginatedMembers = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_and_score", (q) => q.eq("leagueId", args.leagueId))
      .order("desc")
      .paginate(args.paginationOpts);
    
    const enrichedMembers = await Promise.all(
      paginatedMembers.page.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return { ...member, user };
      })
    );

    return {
      ...paginatedMembers,
      page: enrichedMembers,
    };
  },
});

export const getLeagueLeaderboard = query({
  args: { 
    leagueId: v.id("leagues"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    
    const members = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_and_score", (q) => q.eq("leagueId", args.leagueId))
      .order("desc")
      .take(limit);
    
    const leaderboard = await Promise.all(
      members.map(async (member, index) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user,
          rank: index + 1,
        };
      })
    );

    return leaderboard;
  },
});

// =====================
// Mutations
// =====================

export const createLeague = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.string(),
    type: v.union(v.literal("competition"), v.literal("community"), v.literal("challenge")),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("subscribers_only")),
    maxMembers: v.optional(v.number()),
    rules: v.optional(v.string()),
    prizePool: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.id("leagues"),
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

    const leagueId = await ctx.db.insert("leagues", {
      creatorId: user._id,
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      coverImageUrl: args.coverImageUrl,
      category: args.category,
      type: args.type,
      visibility: args.visibility,
      memberCount: 1,
      maxMembers: args.maxMembers,
      rules: args.rules,
      prizePool: args.prizePool,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      isFeatured: false,
    });

    // Add creator as owner member
    await ctx.db.insert("leagueMembers", {
      leagueId,
      userId: user._id,
      role: "owner",
      score: 0,
      joinedAt: Date.now(),
    });

    return leagueId;
  },
});

export const updateLeague = mutation({
  args: {
    leagueId: v.id("leagues"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    rules: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
    prizePool: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
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

    const league = await ctx.db.get(args.leagueId);
    if (!league) {
      throw new Error("League not found");
    }

    // Check if user is owner or admin
    const membership = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_and_user", (q) => 
        q.eq("leagueId", args.leagueId).eq("userId", user._id)
      )
      .unique();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("You don't have permission to edit this league");
    }

    const updates: Partial<typeof league> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.coverImageUrl !== undefined) updates.coverImageUrl = args.coverImageUrl;
    if (args.category !== undefined) updates.category = args.category;
    if (args.rules !== undefined) updates.rules = args.rules;
    if (args.maxMembers !== undefined) updates.maxMembers = args.maxMembers;
    if (args.prizePool !== undefined) updates.prizePool = args.prizePool;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.leagueId, updates);

    return null;
  },
});

export const joinLeague = mutation({
  args: { leagueId: v.id("leagues") },
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

    const league = await ctx.db.get(args.leagueId);
    if (!league) {
      throw new Error("League not found");
    }

    if (!league.isActive) {
      throw new Error("This league is not active");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_and_user", (q) => 
        q.eq("leagueId", args.leagueId).eq("userId", user._id)
      )
      .unique();

    if (existingMembership) {
      throw new Error("You are already a member of this league");
    }

    // Check max members
    if (league.maxMembers && league.memberCount >= league.maxMembers) {
      throw new Error("This league is full");
    }

    // Check visibility restrictions
    if (league.visibility === "private") {
      throw new Error("This is a private league");
    }

    if (league.visibility === "subscribers_only") {
      // Check if user is subscribed to the creator
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_subscriber_and_influencer", (q) => 
          q.eq("subscriberId", user._id).eq("influencerId", league.creatorId)
        )
        .unique();

      if (!subscription || subscription.status !== "active") {
        throw new Error("You must be a subscriber to join this league");
      }
    }

    // Add member
    await ctx.db.insert("leagueMembers", {
      leagueId: args.leagueId,
      userId: user._id,
      role: "member",
      score: 0,
      joinedAt: Date.now(),
    });

    // Update member count
    await ctx.db.patch(args.leagueId, {
      memberCount: league.memberCount + 1,
    });

    return null;
  },
});

export const leaveLeague = mutation({
  args: { leagueId: v.id("leagues") },
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

    const membership = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_and_user", (q) => 
        q.eq("leagueId", args.leagueId).eq("userId", user._id)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this league");
    }

    if (membership.role === "owner") {
      throw new Error("Owners cannot leave the league. Transfer ownership first.");
    }

    const league = await ctx.db.get(args.leagueId);
    if (!league) {
      throw new Error("League not found");
    }

    // Remove membership
    await ctx.db.delete(membership._id);

    // Update member count
    await ctx.db.patch(args.leagueId, {
      memberCount: Math.max(0, league.memberCount - 1),
    });

    return null;
  },
});

export const updateMemberScore = mutation({
  args: {
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    scoreChange: v.number(),
  },
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

    // Check if current user is owner or admin
    const currentMembership = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_and_user", (q) => 
        q.eq("leagueId", args.leagueId).eq("userId", currentUser._id)
      )
      .unique();

    if (!currentMembership || (currentMembership.role !== "owner" && currentMembership.role !== "admin")) {
      throw new Error("You don't have permission to update scores");
    }

    // Find target member
    const targetMembership = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_and_user", (q) => 
        q.eq("leagueId", args.leagueId).eq("userId", args.userId)
      )
      .unique();

    if (!targetMembership) {
      throw new Error("Member not found");
    }

    await ctx.db.patch(targetMembership._id, {
      score: targetMembership.score + args.scoreChange,
    });

    return null;
  },
});
