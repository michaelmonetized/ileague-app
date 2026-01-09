import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// =====================
// Queries
// =====================

export const isFollowing = query({
  args: { userId: v.id("users") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return false;
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    return !!follow;
  },
});

export const getFollowers = query({
  args: { 
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginatedFollows = await ctx.db
      .query("follows")
      .withIndex("by_following_id", (q) => q.eq("followingId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
    
    const enrichedFollowers = await Promise.all(
      paginatedFollows.page.map(async (follow) => {
        const follower = await ctx.db.get(follow.followerId);
        return { ...follow, user: follower };
      })
    );

    return {
      ...paginatedFollows,
      page: enrichedFollowers,
    };
  },
});

export const getFollowing = query({
  args: { 
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginatedFollows = await ctx.db
      .query("follows")
      .withIndex("by_follower_id", (q) => q.eq("followerId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
    
    const enrichedFollowing = await Promise.all(
      paginatedFollows.page.map(async (follow) => {
        const following = await ctx.db.get(follow.followingId);
        return { ...follow, user: following };
      })
    );

    return {
      ...paginatedFollows,
      page: enrichedFollowing,
    };
  },
});

export const getFollowerCount = query({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following_id", (q) => q.eq("followingId", args.userId))
      .collect();
    
    return followers.length;
  },
});

export const getFollowingCount = query({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower_id", (q) => q.eq("followerId", args.userId))
      .collect();
    
    return following.length;
  },
});

// =====================
// Mutations
// =====================

export const followUser = mutation({
  args: { userId: v.id("users") },
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

    if (currentUser._id === args.userId) {
      throw new Error("You cannot follow yourself");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User to follow not found");
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    if (existingFollow) {
      throw new Error("You are already following this user");
    }

    // Create follow relationship
    await ctx.db.insert("follows", {
      followerId: currentUser._id,
      followingId: args.userId,
    });

    // Update follower count on influencer profile if applicable
    if (targetUser.isInfluencer) {
      const profile = await ctx.db
        .query("influencerProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .unique();

      if (profile) {
        await ctx.db.patch(profile._id, {
          followerCount: profile.followerCount + 1,
        });
      }
    }

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "follow",
      title: "New Follower",
      message: `${currentUser.firstName ?? currentUser.username} started following you`,
      imageUrl: currentUser.imageUrl,
      actionUrl: `/@${currentUser.username}`,
      isRead: false,
      metadata: {
        actorId: currentUser._id,
      },
    });

    return null;
  },
});

export const unfollowUser = mutation({
  args: { userId: v.id("users") },
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

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    if (!follow) {
      throw new Error("You are not following this user");
    }

    await ctx.db.delete(follow._id);

    // Update follower count on influencer profile if applicable
    const targetUser = await ctx.db.get(args.userId);
    if (targetUser?.isInfluencer) {
      const profile = await ctx.db
        .query("influencerProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .unique();

      if (profile) {
        await ctx.db.patch(profile._id, {
          followerCount: Math.max(0, profile.followerCount - 1),
        });
      }
    }

    return null;
  },
});

export const toggleFollow = mutation({
  args: { userId: v.id("users") },
  returns: v.object({ isFollowing: v.boolean() }),
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

    if (currentUser._id === args.userId) {
      throw new Error("You cannot follow yourself");
    }

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User to follow not found");
    }

    if (existingFollow) {
      // Unfollow
      await ctx.db.delete(existingFollow._id);

      if (targetUser.isInfluencer) {
        const profile = await ctx.db
          .query("influencerProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
          .unique();

        if (profile) {
          await ctx.db.patch(profile._id, {
            followerCount: Math.max(0, profile.followerCount - 1),
          });
        }
      }

      return { isFollowing: false };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.userId,
      });

      if (targetUser.isInfluencer) {
        const profile = await ctx.db
          .query("influencerProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
          .unique();

        if (profile) {
          await ctx.db.patch(profile._id, {
            followerCount: profile.followerCount + 1,
          });
        }
      }

      // Create notification
      await ctx.db.insert("notifications", {
        userId: args.userId,
        type: "follow",
        title: "New Follower",
        message: `${currentUser.firstName ?? currentUser.username} started following you`,
        imageUrl: currentUser.imageUrl,
        actionUrl: `/@${currentUser.username}`,
        isRead: false,
        metadata: {
          actorId: currentUser._id,
        },
      });

      return { isFollowing: true };
    }
  },
});
