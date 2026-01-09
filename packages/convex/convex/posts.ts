import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// =====================
// Queries
// =====================

export const getFeedPosts = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    visibility: v.optional(v.union(v.literal("public"), v.literal("followers"), v.literal("subscribers"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let postsQuery = ctx.db
      .query("posts")
      .order("desc");

    // Apply visibility filter
    if (args.visibility) {
      postsQuery = ctx.db
        .query("posts")
        .withIndex("by_visibility", (q) => q.eq("visibility", args.visibility!))
        .order("desc");
    }

    const paginatedPosts = await postsQuery.paginate(args.paginationOpts);
    
    // Enrich posts with author data
    const enrichedPosts = await Promise.all(
      paginatedPosts.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        
        // Check if current user liked this post
        let isLiked = false;
        if (identity) {
          const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
          
          if (currentUser) {
            const like = await ctx.db
              .query("likes")
              .withIndex("by_user_and_target", (q) => 
                q.eq("userId", currentUser._id).eq("targetType", "post").eq("targetId", post._id)
              )
              .unique();
            isLiked = !!like;
          }
        }
        
        return {
          ...post,
          author,
          isLiked,
        };
      })
    );

    return {
      ...paginatedPosts,
      page: enrichedPosts,
    };
  },
});

export const getPostById = query({
  args: { postId: v.id("posts") },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
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
      author: v.union(
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
      isLiked: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const post = await ctx.db.get(args.postId);
    
    if (!post) return null;
    
    const author = await ctx.db.get(post.authorId);
    
    let isLiked = false;
    if (identity) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      
      if (currentUser) {
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_target", (q) => 
            q.eq("userId", currentUser._id).eq("targetType", "post").eq("targetId", post._id)
          )
          .unique();
        isLiked = !!like;
      }
    }
    
    return {
      ...post,
      author,
      isLiked,
    };
  },
});

export const getUserPosts = query({
  args: { 
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginatedPosts = await ctx.db
      .query("posts")
      .withIndex("by_author_id", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
    
    const enrichedPosts = await Promise.all(
      paginatedPosts.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { ...post, author };
      })
    );

    return {
      ...paginatedPosts,
      page: enrichedPosts,
    };
  },
});

export const getLeaguePosts = query({
  args: { 
    leagueId: v.id("leagues"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginatedPosts = await ctx.db
      .query("posts")
      .withIndex("by_league_id", (q) => q.eq("leagueId", args.leagueId))
      .order("desc")
      .paginate(args.paginationOpts);
    
    const enrichedPosts = await Promise.all(
      paginatedPosts.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { ...post, author };
      })
    );

    return {
      ...paginatedPosts,
      page: enrichedPosts,
    };
  },
});

// =====================
// Mutations
// =====================

export const createPost = mutation({
  args: {
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
    leagueId: v.optional(v.id("leagues")),
    isScheduled: v.optional(v.boolean()),
    scheduledAt: v.optional(v.number()),
  },
  returns: v.id("posts"),
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

    const isScheduled = args.isScheduled ?? false;
    const publishedAt = isScheduled ? undefined : Date.now();

    const postId = await ctx.db.insert("posts", {
      authorId: user._id,
      leagueId: args.leagueId,
      type: args.type,
      title: args.title,
      content: args.content,
      mediaUrls: args.mediaUrls,
      thumbnailUrl: args.thumbnailUrl,
      visibility: args.visibility,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isPinned: false,
      isScheduled,
      scheduledAt: args.scheduledAt,
      publishedAt,
    });

    return postId;
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    thumbnailUrl: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("followers"), v.literal("subscribers"))),
    isPinned: v.optional(v.boolean()),
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

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== user._id) {
      throw new Error("You can only edit your own posts");
    }

    const updates: Partial<typeof post> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.mediaUrls !== undefined) updates.mediaUrls = args.mediaUrls;
    if (args.thumbnailUrl !== undefined) updates.thumbnailUrl = args.thumbnailUrl;
    if (args.visibility !== undefined) updates.visibility = args.visibility;
    if (args.isPinned !== undefined) updates.isPinned = args.isPinned;

    await ctx.db.patch(args.postId, updates);

    return null;
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
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

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== user._id) {
      throw new Error("You can only delete your own posts");
    }

    // Delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .collect();
    
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_target", (q) => q.eq("targetType", "post").eq("targetId", args.postId))
      .collect();
    
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    await ctx.db.delete(args.postId);

    return null;
  },
});

export const likePost = mutation({
  args: { postId: v.id("posts") },
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

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_target", (q) => 
        q.eq("userId", user._id).eq("targetType", "post").eq("targetId", args.postId)
      )
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, {
        likeCount: Math.max(0, post.likeCount - 1),
      });
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId: user._id,
        targetType: "post",
        targetId: args.postId,
      });
      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount + 1,
      });
    }

    return null;
  },
});

export const sharePost = mutation({
  args: { postId: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(args.postId, {
      shareCount: post.shareCount + 1,
    });

    return null;
  },
});
