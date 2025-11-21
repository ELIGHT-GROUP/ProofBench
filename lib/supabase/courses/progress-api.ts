import { supabase } from "../client";
import type {
  CourseWithProgress,
  VideoProgress,
  UpdateVideoProgressData,
  CourseFilters,
} from "./types";
import { getCourses } from "./courses-api";

// ============================================
// Progress Tracking
// ============================================

/**
 * Get user's progress for a specific video
 */
export async function getVideoProgress(
  videoId: string
): Promise<VideoProgress | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("video_progress")
    .select("*")
    .eq("video_id", videoId)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error fetching video progress:", error);
    throw error;
  }

  return data;
}

/**
 * Update or create video progress
 */
export async function updateVideoProgress(
  videoId: string,
  data: UpdateVideoProgressData
): Promise<VideoProgress> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to update progress");
  }

  // Check if progress exists
  const existing = await getVideoProgress(videoId);

  if (existing) {
    // Update existing progress
    const { data: updated, error } = await supabase
      .from("video_progress")
      .update({
        ...data,
        last_watched_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating video progress:", error);
      throw error;
    }

    return updated;
  } else {
    // Create new progress
    const { data: created, error } = await supabase
      .from("video_progress")
      .insert({
        user_id: user.id,
        video_id: videoId,
        ...data,
        last_watched_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating video progress:", error);
      throw error;
    }

    return created;
  }
}

/**
 * Mark a video as complete
 */
export async function markVideoComplete(
  videoId: string
): Promise<VideoProgress> {
  return updateVideoProgress(videoId, {
    last_position: 0,
    watch_percentage: 100,
    completed: true,
  });
}

/**
 * Get course progress for the current user
 */
export async function getCourseProgress(
  courseId: string
): Promise<CourseWithProgress | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    console.error("Error fetching course:", courseError);
    return null;
  }

  // Get all videos in this course
  const { data: sections } = await supabase
    .from("sections")
    .select("id")
    .eq("course_id", courseId);

  if (!sections || sections.length === 0) {
    return {
      ...course,
      total_videos: 0,
      completed_videos: 0,
      progress_percentage: 0,
    };
  }

  const sectionIds = sections.map((s) => s.id);

  const { data: videos } = await supabase
    .from("videos")
    .select("id")
    .in("section_id", sectionIds);

  const totalVideos = videos?.length || 0;

  if (!user || totalVideos === 0) {
    return {
      ...course,
      total_videos: totalVideos,
      completed_videos: 0,
      progress_percentage: 0,
    };
  }

  const videoIds = videos?.map((v) => v.id) || [];

  const { data: progress } = await supabase
    .from("video_progress")
    .select("*")
    .eq("user_id", user.id)
    .in("video_id", videoIds)
    .eq("completed", true);

  const completedVideos = progress?.length || 0;
  const progressPercentage =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  // Get last watched timestamp
  const { data: lastWatched } = await supabase
    .from("video_progress")
    .select("last_watched_at")
    .eq("user_id", user.id)
    .in("video_id", videoIds)
    .order("last_watched_at", { ascending: false })
    .limit(1)
    .single();

  return {
    ...course,
    total_videos: totalVideos,
    completed_videos: completedVideos,
    progress_percentage: progressPercentage,
    last_watched_at: lastWatched?.last_watched_at,
  };
}

/**
 * Get all courses with progress for current user
 */
export async function getCoursesWithProgress(
  filters?: CourseFilters
): Promise<CourseWithProgress[]> {
  const courses = await getCourses(filters);

  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const progress = await getCourseProgress(course.id);
      return (
        progress || {
          ...course,
          total_videos: 0,
          completed_videos: 0,
          progress_percentage: 0,
        }
      );
    })
  );

  return coursesWithProgress;
}

/**
 * Get courses that user has started watching (continue watching)
 */
export async function getContinueWatchingCourses(): Promise<
  CourseWithProgress[]
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get all video progress for user
  const { data: progressRecords } = await supabase
    .from("video_progress")
    .select("video_id, last_watched_at")
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false });

  if (!progressRecords || progressRecords.length === 0) return [];

  // Get unique courses from these videos
  const videoIds = progressRecords.map((p) => p.video_id);

  const { data: videos } = await supabase
    .from("videos")
    .select("section_id")
    .in("id", videoIds);

  if (!videos) return [];

  const sectionIds = [...new Set(videos.map((v) => v.section_id))];

  const { data: sections } = await supabase
    .from("sections")
    .select("course_id")
    .in("id", sectionIds);

  if (!sections) return [];

  const courseIds = [...new Set(sections.map((s) => s.course_id))];

  // Get course details with progress
  const coursesWithProgress = await Promise.all(
    courseIds.map((courseId) => getCourseProgress(courseId))
  );

  // Filter out nulls and sort by last watched
  return coursesWithProgress
    .filter(
      (c): c is CourseWithProgress =>
        c !== null && c.progress_percentage > 0 && c.progress_percentage < 100
    )
    .sort((a, b) => {
      if (!a.last_watched_at) return 1;
      if (!b.last_watched_at) return -1;
      return (
        new Date(b.last_watched_at).getTime() -
        new Date(a.last_watched_at).getTime()
      );
    });
}
