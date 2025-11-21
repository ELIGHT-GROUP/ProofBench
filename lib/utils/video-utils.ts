/**
 * Video utility functions for handling YouTube/Vimeo embeds and formatting
 */

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extract video ID from Vimeo URL
 */
export function extractVimeoId(url: string): string | null {
  const pattern = /(?:vimeo\.com\/)([0-9]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Detect video platform from URL
 */
export function detectVideoPlatform(
  url: string
): "youtube" | "vimeo" | "unknown" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("vimeo.com")) {
    return "vimeo";
  }
  return "unknown";
}

/**
 * Convert any video URL to embeddable iframe URL
 */
export function getEmbedUrl(url: string): string | null {
  const platform = detectVideoPlatform(url);

  if (platform === "youtube") {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  }

  if (platform === "vimeo") {
    const videoId = extractVimeoId(url);
    if (!videoId) return null;
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return null;
}

/**
 * Validate if URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  const platform = detectVideoPlatform(url);

  if (platform === "youtube") {
    return extractYouTubeId(url) !== null;
  }

  if (platform === "vimeo") {
    return extractVimeoId(url) !== null;
  }

  return false;
}

/**
 * Format duration in seconds to readable string (e.g., "1:23:45" or "12:34")
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Parse duration string to seconds
 */
export function parseDuration(durationStr: string): number {
  const parts = durationStr.split(":").map(Number);

  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

/**
 * Calculate course/section total duration from videos
 */
export function calculateTotalDuration(
  videos: Array<{ duration: number | null }>
): number {
  return videos.reduce((total, video) => total + (video.duration || 0), 0);
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(
  completedVideos: number,
  totalVideos: number
): number {
  if (totalVideos === 0) return 0;
  return Math.round((completedVideos / totalVideos) * 100);
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(
  dateString: string | null | undefined
): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }
}

/**
 * Get thumbnail URL from video URL
 */
export function getVideoThumbnail(url: string): string | null {
  const platform = detectVideoPlatform(url);

  if (platform === "youtube") {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // For Vimeo, we'd need to make an API call to get thumbnail
  // For now, return null and handle it in the component
  return null;
}

/**
 * Validate watch percentage (0-100)
 */
export function normalizeWatchPercentage(percentage: number): number {
  return Math.max(0, Math.min(100, Math.round(percentage)));
}

/**
 * Check if video should be marked as complete based on watch percentage
 */
export function shouldMarkComplete(
  watchPercentage: number,
  threshold: number = 95
): boolean {
  return watchPercentage >= threshold;
}
