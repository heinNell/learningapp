
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dlbhoeewbrhtwxnjeqwq.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYmhvZWV3YnJodHd4bmplcXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDUwODYsImV4cCI6MjA3NjAyMTA4Nn0.rF8qrCxDM4A8V2xG2DtMHMGTkCBljLJGFuxcQwnRnzw'

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// TypeScript interfaces for database schema
export interface User {
  id: string
  created_at: string
  child_name: string
  parent_email?: string
}

export interface UserSettings {
  user_id: string
  difficulty: 'beginner' | 'advanced'
  sound_enabled: boolean
  high_contrast: boolean
  categories_enabled: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface UserProgress {
  user_id: string
  stars: number
  badges: number
  level: number
  total_correct: number
  total_questions: number
  streak_days: number
  achievements: string[]
  category_progress: Record<string, any>
  last_active: string
  created_at: string
  updated_at: string
}

export interface QuizResult {
  id: string
  user_id: string
  category: string
  question_id: string
  question_text: string
  selected_answer: string
  correct_answer: string
  is_correct: boolean
  response_time_ms: number
  difficulty: string
  session_id: string
  answered_at: string
}

export interface StoryProgress {
  id: string
  user_id: string
  adventure_id: string
  chapter_id: string
  completed: boolean
  stars_earned: number
  completion_time_ms: number
  completed_at: string
}

export interface Adventure {
  id: string
  title: string
  description: string
  category_id: string
  difficulty: string
  total_chapters: number
  unlock_requirement: number
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  adventure_id: string
  chapter_number: number
  title: string
  description: string
  questions_needed: number
  unlock_requirement: number
  story_content: any
  created_at: string
  updated_at: string
}
