// Course type definitions

export type CourseCategory =
  | "programming"
  | "design"
  | "business"
  | "marketing"
  | "personal_development"
  | "other";

export type VideoResourceType = "pdf" | "notes" | "link" | "code" | "other";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: CourseCategory;
  thumbnail_url: string | null;
  tags: string[] | null;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  course_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration: number | null; // in seconds
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface VideoResource {
  id: string;
  video_id: string;
  title: string;
  url: string;
  type: VideoResourceType;
  created_at: string;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  last_position: number; // in seconds
  watch_percentage: number; // 0-100
  completed: boolean;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface VideoWithProgress extends Video {
  progress?: VideoProgress;
  resources?: VideoResource[];
}

export interface SectionWithVideos extends Section {
  videos: VideoWithProgress[];
}

export interface CourseWithSections extends Course {
  sections: SectionWithVideos[];
}

export interface CourseWithProgress extends Course {
  total_videos: number;
  completed_videos: number;
  progress_percentage: number;
  last_watched_at?: string;
}

// Form data types
export interface CreateCourseData {
  title: string;
  description?: string;
  category: CourseCategory;
  thumbnail_url?: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  category?: CourseCategory;
  thumbnail_url?: string;
  tags?: string[];
  published?: boolean;
}

export interface CreateSectionData {
  name: string;
  order_index?: number;
}

export interface UpdateSectionData {
  name?: string;
  order_index?: number;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  video_url: string;
  duration?: number;
  order_index?: number;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  video_url?: string;
  duration?: number;
  order_index?: number;
}

export interface CreateVideoResourceData {
  title: string;
  url: string;
  type: VideoResourceType;
}

export interface UpdateVideoProgressData {
  last_position: number;
  watch_percentage: number;
  completed?: boolean;
}

// Filter types
export interface CourseFilters {
  category?: CourseCategory;
  published?: boolean;
  search?: string;
  created_by?: string;
}

// ============================================
// Comment types
// ============================================

export interface VideoComment {
  id: string;
  video_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface VideoCommentWithUser extends VideoComment {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "student" | "admin" | "superadmin";
  };
}

export interface VideoCommentWithReplies extends VideoCommentWithUser {
  replies: VideoCommentWithUser[];
}

// Form data types for comments
export interface CreateCommentData {
  content: string;
  parent_id?: string;
}

export interface UpdateCommentData {
  content: string;
}
