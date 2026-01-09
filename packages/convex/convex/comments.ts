import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// =====================
// Queries
// =====================

export const getPostComments = query({
  args: { 
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const paginatedComments = await ctx.db
      .query("comments")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .order("desc")
      .paginate(args.paginationOpts);
    
    const enrichedComments = await Promise.all(
      paginatedComments.page.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        
        // Check if current user liked this comment
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
                q.eq("userId", currentUser._id).eq("targetType", "comment").eq("targetId", comment._id)
              )
              .unique();
            isLiked = !!like;
          }
        }
        
        // Get replies count
        const replies = await ctx.db
          .query("comments")
          .withIndex("by_parent_id", (q) => q.eq("parentId", comment._id))
          .collect();
        
        return {
          ...comment,
          author,
          isLiked,
          replyCount: replies.length,
        };
      })
    );

    return {
      ...paginatedComments,
      page: enrichedComments,
    };
  },
});

export const getCommentReplies = query({
  args: { 
    commentId: v.id("comments"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const paginatedReplies = await ctx.db
      .query("comments")
      .withIndex("by_parent_id", (q) => q.eq("parentId", args.commentId))
      .order("asc")
      .paginate(args.paginationOpts);
    
    const enrichedReplies = await Promise.all(
      paginatedReplies.page.map(async (reply) => {
        const author = await ctx.db.get(reply.authorId);
        
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
                q.eq("userId", currentUser._id).eq("targetType", "comment").eq("targetId", reply._id)
              )
              .unique();
            isLiked = !!like;
          }
        }
        
        return {
          ...reply,
          author,
          isLiked,
        };
      })
    );

    return {
      ...paginatedReplies,
      page: enrichedReplies,
    };
  },
});

// =====================
// Mutations
// =====================

export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  returns: v.id("comments"),
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

    // If this is a reply, check parent comment exists
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      // Update parent comment reply count
      await ctx.db.patch(args.parentId, {
        replyCount: parentComment.replyCount + 1,
      });
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: user._id,
      parentId: args.parentId,
      content: args.content,
      likeCount: 0,
      replyCount: 0,
      isEdited: false,
    });

    // Update post comment count
    await ctx.db.patch(args.postId, {
      commentCount: post.commentCount + 1,
    });

    // Create notification for post author (if not self-commenting)
    if (post.authorId !== user._id) {
      await ctx.db.insert("notifications", {
        userId: post.authorId,
        type: "comment",
        title: "New Comment",
        message: `${user.firstName ?? user.username} commented on your post`,
        imageUrl: user.imageUrl,
        actionUrl: `/post/${args.postId}`,
        isRead: false,
        metadata: {
          actorId: user._id,
          postId: args.postId,
          commentId,
        },
      });
    }

    return commentId;
  },
});

export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
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

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== user._id) {
      throw new Error("You can only edit your own comments");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      isEdited: true,
    });

    return null;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
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

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== user._id) {
      throw new Error("You can only delete your own comments");
    }

    // Update post comment count
    const post = await ctx.db.get(comment.postId);
    if (post) {
      await ctx.db.patch(comment.postId, {
        commentCount: Math.max(0, post.commentCount - 1),
      });
    }

    // Update parent comment reply count if this is a reply
    if (comment.parentId) {
      const parentComment = await ctx.db.get(comment.parentId);
      if (parentComment) {
        await ctx.db.patch(comment.parentId, {
          replyCount: Math.max(0, parentComment.replyCount - 1),
        });
      }
    }

    // Delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_target", (q) => q.eq("targetType", "comment").eq("targetId", args.commentId))
      .collect();
    
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete replies
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent_id", (q) => q.eq("parentId", args.commentId))
      .collect();
    
    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    await ctx.db.delete(args.commentId);

    return null;
  },
});

export const likeComment = mutation({
  args: { commentId: v.id("comments") },
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

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_target", (q) => 
        q.eq("userId", user._id).eq("targetType", "comment").eq("targetId", args.commentId)
      )
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.commentId, {
        likeCount: Math.max(0, comment.likeCount - 1),
      });
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId: user._id,
        targetType: "comment",
        targetId: args.commentId,
      });
      await ctx.db.patch(args.commentId, {
        likeCount: comment.likeCount + 1,
      });
    }

    return null;
  },
});
