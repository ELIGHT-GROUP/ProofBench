import { supabase } from "../client";
import type { Section, CreateSectionData, UpdateSectionData } from "./types";

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
