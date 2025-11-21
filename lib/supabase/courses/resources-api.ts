import { supabase } from "../client";
import type { VideoResource, CreateVideoResourceData } from "./types";

// ============================================
// Video Resources
// ============================================

/**
 * Add a resource to a video
 */
export async function createVideoResource(
  videoId: string,
  data: CreateVideoResourceData
): Promise<VideoResource> {
  const { data: resource, error } = await supabase
    .from("video_resources")
    .insert({
      video_id: videoId,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating video resource:", error);
    throw error;
  }

  return resource;
}

/**
 * Delete a video resource
 */
export async function deleteVideoResource(resourceId: string): Promise<void> {
  const { error } = await supabase
    .from("video_resources")
    .delete()
    .eq("id", resourceId);

  if (error) {
    console.error("Error deleting video resource:", error);
    throw error;
  }
}
