import { supabase } from "../client";
import type {
  VideoComment,
  VideoCommentWithUser,
  VideoCommentWithReplies,
  CreateCommentData,
  UpdateCommentData,
} from "./types";

// ============================================
// Comment Management
// ============================================

/**
 * Get all comments for a video with user information and nested replies
 */
export async function getVideoComments(
  videoId: string
): Promise<VideoCommentWithReplies[]> {
  // Fetch all comments for this video
  const { data: comments, error } = await supabase
    .from("video_comments")
    .select(
      `
      *,
      user:profiles!video_comments_user_id_fkey (
        id,
        full_name,
        avatar_url,
        role
      )
    `
    )
    .eq("video_id", videoId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }

  if (!comments) return [];

  // Organize comments into a tree structure
  const commentMap = new Map<string, VideoCommentWithReplies>();
  const rootComments: VideoCommentWithReplies[] = [];

  // First pass: create all comment objects
  comments.forEach((comment: any) => {
    const commentWithUser: VideoCommentWithReplies = {
      ...comment,
      user: comment.user,
      replies: [],
    };
    commentMap.set(comment.id, commentWithUser);
  });

  // Second pass: organize into tree structure
  comments.forEach((comment: any) => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parent_id) {
      // This is a reply, add it to parent's replies
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

/**
 * Create a new comment or reply
 */
export async function createComment(
  videoId: string,
  data: CreateCommentData
): Promise<VideoComment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to create a comment");
  }

  const { data: comment, error } = await supabase
    .from("video_comments")
    .insert({
      video_id: videoId,
      user_id: user.id,
      content: data.content,
      parent_id: data.parent_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    throw error;
  }

  return comment;
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  data: UpdateCommentData
): Promise<VideoComment> {
  const { data: comment, error } = await supabase
    .from("video_comments")
    .update({
      content: data.content,
    })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    console.error("Error updating comment:", error);
    throw error;
  }

  return comment;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from("video_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
