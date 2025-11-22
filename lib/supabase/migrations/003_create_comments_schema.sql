-- Create video_comments table
CREATE TABLE IF NOT EXISTS public.video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.video_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for video_comments
-- ============================================

-- Anyone can view comments on visible videos
-- This relies on the RLS of the videos table to filter out unpublished content
CREATE POLICY "View comments on visible videos"
  ON public.video_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.videos v
      WHERE v.id = video_comments.video_id
    )
  );

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
  ON public.video_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.video_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.video_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.video_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON public.video_comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- RLS Policies for profiles (Public Access)
-- ============================================

-- Allow public read access to profiles (needed for comments on public courses)
-- We restrict this to only id, full_name, avatar_url, role via the API selection,
-- but for RLS we allow SELECT on the row.
CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- ============================================
-- Triggers for updated_at timestamp
-- ============================================

CREATE TRIGGER on_video_comments_updated
  BEFORE UPDATE ON public.video_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS video_comments_video_id_idx ON public.video_comments(video_id);
CREATE INDEX IF NOT EXISTS video_comments_user_id_idx ON public.video_comments(user_id);
CREATE INDEX IF NOT EXISTS video_comments_parent_id_idx ON public.video_comments(parent_id);
CREATE INDEX IF NOT EXISTS video_comments_created_at_idx ON public.video_comments(created_at DESC);
