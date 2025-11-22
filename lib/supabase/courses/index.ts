// Export all types
export type {
  CourseCategory,
  VideoResourceType,
  Course,
  Section,
  Video,
  VideoResource,
  VideoProgress,
  VideoWithProgress,
  SectionWithVideos,
  CourseWithSections,
  CourseWithProgress,
  CreateCourseData,
  UpdateCourseData,
  CreateSectionData,
  UpdateSectionData,
  CreateVideoData,
  UpdateVideoData,
  CreateVideoResourceData,
  UpdateVideoProgressData,
  CourseFilters,
  VideoComment,
  VideoCommentWithUser,
  VideoCommentWithReplies,
  CreateCommentData,
  UpdateCommentData,
} from "./types";

// Export course management functions
export {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
} from "./courses-api";

// Export section management functions
export {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from "./sections-api";

// Export video management functions
export {
  createVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
} from "./videos-api";

// Export video resource functions
export { createVideoResource, deleteVideoResource } from "./resources-api";

// Export progress tracking functions
export {
  getVideoProgress,
  updateVideoProgress,
  markVideoComplete,
  getCourseProgress,
  getCoursesWithProgress,
  getContinueWatchingCourses,
} from "./progress-api";

// Export comment functions
export {
  getVideoComments,
  createComment,
  updateComment,
  deleteComment,
} from "./comments-api";
