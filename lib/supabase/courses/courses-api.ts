import { supabase } from "../client";
import type {
  Course,
  CourseWithSections,
  SectionWithVideos,
  VideoWithProgress,
  VideoProgress,
  CreateCourseData,
  UpdateCourseData,
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
