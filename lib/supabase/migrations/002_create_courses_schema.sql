-- Create enum for course categories
CREATE TYPE course_category AS ENUM ('programming', 'design', 'business', 'marketing', 'personal_development', 'other');

-- Create enum for video resource types
CREATE TYPE video_resource_type AS ENUM ('pdf', 'notes', 'link', 'code', 'other');

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category course_category NOT NULL DEFAULT 'other',
  thumbnail_url TEXT,
  tags TEXT[],
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sections table (course modules)
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER, -- duration in seconds
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(section_id, order_index)
);

-- Create video_resources table
CREATE TABLE IF NOT EXISTS public.video_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type video_resource_type NOT NULL DEFAULT 'link',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create video_progress table (track user progress)
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  last_position INTEGER NOT NULL DEFAULT 0, -- position in seconds
  watch_percentage INTEGER NOT NULL DEFAULT 0, -- 0-100
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for courses
-- ============================================

-- Students can view published courses
CREATE POLICY "Students can view published courses"
  ON public.courses
  FOR SELECT
  USING (published = true);

-- Admins and superadmins can view all courses
CREATE POLICY "Admins can view all courses"
  ON public.courses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admins and superadmins can insert courses
CREATE POLICY "Admins can insert courses"
  ON public.courses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admins and superadmins can update courses
CREATE POLICY "Admins can update courses"
  ON public.courses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admins and superadmins can delete courses
CREATE POLICY "Admins can delete courses"
  ON public.courses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- RLS Policies for sections
-- ============================================

-- Anyone can view sections of published courses
CREATE POLICY "View sections of published courses"
  ON public.sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = sections.course_id AND published = true
    )
  );

-- Admins can view all sections
CREATE POLICY "Admins can view all sections"
  ON public.sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admins can manage sections
CREATE POLICY "Admins can insert sections"
  ON public.sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update sections"
  ON public.sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete sections"
  ON public.sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- RLS Policies for videos
-- ============================================

-- Anyone can view videos of published courses
CREATE POLICY "View videos of published courses"
  ON public.videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sections s
      INNER JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = videos.section_id AND c.published = true
    )
  );

-- Admins can view all videos
CREATE POLICY "Admins can view all videos"
  ON public.videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admins can manage videos
CREATE POLICY "Admins can insert videos"
  ON public.videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update videos"
  ON public.videos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete videos"
  ON public.videos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- RLS Policies for video_resources
-- ============================================

-- Anyone can view resources of published courses
CREATE POLICY "View resources of published courses"
  ON public.video_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.videos v
      INNER JOIN public.sections s ON s.id = v.section_id
      INNER JOIN public.courses c ON c.id = s.course_id
      WHERE v.id = video_resources.video_id AND c.published = true
    )
  );

-- Admins can view all resources
CREATE POLICY "Admins can view all resources"
  ON public.video_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admins can manage resources
CREATE POLICY "Admins can insert resources"
  ON public.video_resources
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update resources"
  ON public.video_resources
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete resources"
  ON public.video_resources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- RLS Policies for video_progress
-- ============================================

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON public.video_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON public.video_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON public.video_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all progress (for analytics)
CREATE POLICY "Admins can view all progress"
  ON public.video_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- Triggers for updated_at timestamps
-- ============================================

CREATE TRIGGER on_courses_updated
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_sections_updated
  BEFORE UPDATE ON public.sections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_videos_updated
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_video_progress_updated
  BEFORE UPDATE ON public.video_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS courses_published_idx ON public.courses(published);
CREATE INDEX IF NOT EXISTS courses_category_idx ON public.courses(category);
CREATE INDEX IF NOT EXISTS courses_created_by_idx ON public.courses(created_by);
CREATE INDEX IF NOT EXISTS sections_course_id_idx ON public.sections(course_id);
CREATE INDEX IF NOT EXISTS sections_order_idx ON public.sections(course_id, order_index);
CREATE INDEX IF NOT EXISTS videos_section_id_idx ON public.videos(section_id);
CREATE INDEX IF NOT EXISTS videos_order_idx ON public.videos(section_id, order_index);
CREATE INDEX IF NOT EXISTS video_resources_video_id_idx ON public.video_resources(video_id);
CREATE INDEX IF NOT EXISTS video_progress_user_id_idx ON public.video_progress(user_id);
CREATE INDEX IF NOT EXISTS video_progress_video_id_idx ON public.video_progress(video_id);
CREATE INDEX IF NOT EXISTS video_progress_user_video_idx ON public.video_progress(user_id, video_id);
