import { supabase } from "../client";
import type {
  Course,
  CourseWithSections,
  CourseWithProgress,
  Section,
  SectionWithVideos,
  Video,
  VideoWithProgress,
  VideoResource,
  VideoProgress,
  CreateCourseData,
  UpdateCourseData,
  CreateSectionData,
  UpdateSectionData,
  CreateVideoData,
  UpdateVideoData,
  CreateVideoResourceData,
  UpdateVideoProgressData,
  CourseFilters,
} from "./types";

// ============================================
// Course Management
// ============================================

/**
 * Get all courses with optional filtering
 */
export async function getCourses(filters?: CourseFilters): Promise<Course[]> {
  let query = supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.published !== undefined) {
    query = query.eq("published", filters.published);
  }

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  if (filters?.created_by) {
    query = query.eq("created_by", filters.created_by);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single course by ID with all sections and videos
 */
export async function getCourseById(
  courseId: string
): Promise<CourseWithSections | null> {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (courseError) {
    console.error("Error fetching course:", courseError);
    throw courseError;
  }

  if (!course) return null;

  // Fetch sections with videos
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    throw sectionsError;
  }

  // Fetch all videos for these sections
  const sectionsWithVideos: SectionWithVideos[] = [];

  for (const section of sections || []) {
    const { data: videos, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .eq("section_id", section.id)
      .order("order_index", { ascending: true });

    if (videosError) {
      console.error("Error fetching videos:", videosError);
      throw videosError;
    }

    // Fetch progress for each video (if user is authenticated)
    const videosWithProgress: VideoWithProgress[] = [];

    for (const video of videos || []) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let progress: VideoProgress | undefined;
      if (user) {
        const { data: progressData } = await supabase
          .from("video_progress")
          .select("*")
          .eq("video_id", video.id)
          .eq("user_id", user.id)
          .single();

        progress = progressData || undefined;
      }

      // Fetch resources for this video
      const { data: resources } = await supabase
        .from("video_resources")
        .select("*")
        .eq("video_id", video.id);

      videosWithProgress.push({
        ...video,
        progress,
        resources: resources || [],
      });
    }

    sectionsWithVideos.push({
      ...section,
      videos: videosWithProgress,
    });
  }

  return {
    ...course,
    sections: sectionsWithVideos,
  };
}

/**
 * Create a new course
 */
export async function createCourse(data: CreateCourseData): Promise<Course> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to create a course");
  }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      ...data,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating course:", error);
    throw error;
  }

  return course;
}

/**
 * Update a course
 */
export async function updateCourse(
  courseId: string,
  data: UpdateCourseData
): Promise<Course> {
  const { data: course, error } = await supabase
    .from("courses")
    .update(data)
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    console.error("Error updating course:", error);
    throw error;
  }

  return course;
}

/**
 * Delete a course (cascade deletes sections, videos, etc.)
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

/**
 * Publish or unpublish a course
 */
export async function publishCourse(
  courseId: string,
  published: boolean
): Promise<Course> {
  return updateCourse(courseId, { published });
}

// ============================================
// Section Management
// ============================================

/**
 * Create a new section in a course
 */
export async function createSection(
  courseId: string,
  data: CreateSectionData
): Promise<Section> {
  const { data: section, error } = await supabase
    .from("sections")
    .insert({
      course_id: courseId,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating section:", error);
    throw error;
  }

  return section;
}

/**
 * Update a section
 */
export async function updateSection(
  sectionId: string,
  data: UpdateSectionData
): Promise<Section> {
  const { data: section, error } = await supabase
    .from("sections")
    .update(data)
    .eq("id", sectionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating section:", error);
    throw error;
  }

  return section;
}

/**
 * Delete a section (cascade deletes videos)
 */
export async function deleteSection(sectionId: string): Promise<void> {
  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
}

/**
 * Reorder sections in a course
 */
export async function reorderSections(
  courseId: string,
  sectionIds: string[]
): Promise<void> {
  // Update order_index for each section
  const updates = sectionIds.map((sectionId, index) =>
    supabase
      .from("sections")
      .update({ order_index: index })
      .eq("id", sectionId)
      .eq("course_id", courseId)
  );

  const results = await Promise.all(updates);

  for (const { error } of results) {
    if (error) {
      console.error("Error reordering sections:", error);
      throw error;
    }
  }
}

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

  if (!user || !videos || totalVideos === 0) {
    return {
      ...course,
      total_videos: totalVideos,
      completed_videos: 0,
      progress_percentage: 0,
    };
  }

  const videoIds = videos.map((v) => v.id);

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
