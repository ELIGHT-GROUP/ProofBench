# Video Course Feature 

**Context**: Student side: "Courses" section with video playlist (YouTube-like). Admin: manage courses. Tech: Supabase backend, Next.js frontend. All resources are external links (no storage on platform).

---

## 1) Product Summary

* Courses are playlists organized into **sections/modules**. Each section contains multiple **videos**.
* Videos have **title**, **description**, and optional external **resources** (PDF, notes, etc.) stored as links.
* Playback features: **resume from last watched timestamp** and **progress tracking** per video and per course.
* All courses are **free**.
* Admins can **CRUD** courses, add external links for videos, reorder content, and publish/unpublish.

---

## 2) High-level UI (wireframe text)

### Student UI

1. **Courses landing page**

   * Search bar + filters (category, difficulty, published)
   * Grid/list of course cards (thumbnail, title, short description, duration, progress badge)
   * Sidebar: "Continue Watching", "My Courses"

2. **Course detail page**

   * Left: Video player area (top) → currently playing video + controls
   * Right: Course playlist (accordion by section)

     * Section header (name, expand/collapse)
     * Each video row: title, duration, status (not started / in progress / completed), last watched timestamp
   * Below player: resources panel (list of external links: PDFs, notes)
   * Buttons: Mark complete, Download resources (link opens in new tab)

3. **Video player behavior**

   * When user opens a video, load last watched timestamp (if exists) and seek there
   * When user pauses / leaves, persist current timestamp and percentage
   * When video reaches >= 95% (configurable), mark video as completed
   * Playback controls: play/pause, seek, playback speed, full-screen

4. **Student progress views**

   * Course progress bar (sum of completed video durations / total duration)
   * Course completion certificate (future)

### Admin UI

1. **Admin courses list**

   * Table with course title, published state, created_at, actions (edit/delete)
   * Filters: published/unpublished, author

2. **Course editor (create/edit)**

   * Course metadata: title, description, category, thumbnail URL, tags
   * Sections manager: add/remove/reorder sections
   * Within section: add/edit/reorder videos (fields: title, description, video_url, duration(optional), resources[])
   * Publish toggle + save draft
   * Preview mode (view as student)

3. **Video item form**

   * video_url (YouTube/Vimeo/other), optional embed type selection
   * resources: list of {title, url, type}

---

