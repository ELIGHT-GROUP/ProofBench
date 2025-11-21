import { supabase } from "../client";
import type { Video, CreateVideoData, UpdateVideoData } from "./types";

// ============================================
// Video Management
// ============================================

/**
 * Create a new video in a section
 */
export async function createVideo(
  sectionId: string,
  data: CreateVideoData
): Promise<Video> {
  const { data: video, error } = await supabase
    .from("videos")
    .insert({
      section_id: sectionId,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating video:", error);
    throw error;
  }

  return video;
}

/**
 * Update a video
 */
export async function updateVideo(
  videoId: string,
  data: UpdateVideoData
): Promise<Video> {
  const { data: video, error } = await supabase
    .from("videos")
    .update(data)
    .eq("id", videoId)
    .select()
    .single();

  if (error) {
    console.error("Error updating video:", error);
    throw error;
  }

  return video;
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId: string): Promise<void> {
  const { error } = await supabase.from("videos").delete().eq("id", videoId);

  if (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
}

/**
 * Reorder videos in a section
 */
export async function reorderVideos(
  sectionId: string,
  videoIds: string[]
): Promise<void> {
  const updates = videoIds.map((videoId, index) =>
    supabase
      .from("videos")
      .update({ order_index: index })
      .eq("id", videoId)
      .eq("section_id", sectionId)
  );

  const results = await Promise.all(updates);

  for (const { error } of results) {
    if (error) {
      console.error("Error reordering videos:", error);
      throw error;
    }
  }
}
