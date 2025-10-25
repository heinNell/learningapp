
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export interface UserProgress {
  stars: number
  badges: number
  level: number
  totalCorrect: number
  totalQuestions: number
  streakDays: number
  achievements: string[]
  categoryProgress: Record<string, any>
}

export interface QuizResult {
  category: string
  questionId: string
  questionText: string
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  responseTimeMs: number
  difficulty: string
  sessionId: string
}

export const useSupabaseProgress = () => {
  const { user, isAuthenticated } = useAuth()
  const [progress, setProgress] = useState<UserProgress>({
    stars: 0,
    badges: 0,
    level: 1,
    totalCorrect: 0,
    totalQuestions: 0,
    streakDays: 0,
    achievements: [],
    categoryProgress: {}
  })
  const [loading, setLoading] = useState(true)

  // Load user progress from Supabase
  const loadProgress = useCallback(async () => {
    if (!isAuthenticated || !user) {
      // Load from localStorage for guest users
      const savedProgress = localStorage.getItem('quiz_progress')
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress))
      }
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Get user progress from Supabase
      const { data: progressData, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.userId)
        .single()

      if (progressData && !error) {
        setProgress({
          stars: progressData.stars || 0,
          badges: progressData.badges || 0,
          level: progressData.level || 1,
          totalCorrect: progressData.total_correct || 0,
          totalQuestions: progressData.total_questions || 0,
          streakDays: progressData.streak_days || 0,
          achievements: progressData.achievements || [],
          categoryProgress: progressData.category_progress || {}
        })
      } else if (error && error.code === 'PGRST116') {
        // No progress record exists, create one
        await initializeProgress()
      }
    } catch (error) {
      console.error('Error loading progress:', error)
      toast.error('Failed to load progress')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated])

  // Initialize progress for new users
  const initializeProgress = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.userId,
          stars: 0,
          badges: 0,
          level: 1,
          total_correct: 0,
          total_questions: 0,
          streak_days: 0,
          achievements: [],
          category_progress: {}
        })

      if (error) throw error
    } catch (error) {
      console.error('Error initializing progress:', error)
    }
  }

  // Update progress after quiz completion
  const updateProgress = useCallback(async (isCorrect: boolean, category?: string) => {
    const newProgress = {
      ...progress,
      totalQuestions: progress.totalQuestions + 1,
      totalCorrect: isCorrect ? progress.totalCorrect + 1 : progress.totalCorrect,
      stars: isCorrect ? progress.stars + 1 : progress.stars
    }

    // Calculate badges and levels
    newProgress.badges = Math.floor(newProgress.stars / 10)
    newProgress.level = Math.floor(newProgress.stars / 50) + 1

    // Update category progress
    if (category) {
      const categoryData = newProgress.categoryProgress[category] || { correct: 0, total: 0 }
      categoryData.total += 1
      if (isCorrect) categoryData.correct += 1
      newProgress.categoryProgress[category] = categoryData
    }

    setProgress(newProgress)

    if (isAuthenticated && user) {
      try {
        // Update progress in Supabase
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: user.userId,
            stars: newProgress.stars,
            badges: newProgress.badges,
            level: newProgress.level,
            total_correct: newProgress.totalCorrect,
            total_questions: newProgress.totalQuestions,
            streak_days: newProgress.streakDays,
            achievements: newProgress.achievements,
            category_progress: newProgress.categoryProgress,
            last_active: new Date().toISOString()
          })

        if (error) throw error
      } catch (error) {
        console.error('Error updating progress:', error)
        toast.error('Failed to save progress')
      }
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('quiz_progress', JSON.stringify(newProgress))
    }

    return newProgress
  }, [progress, user, isAuthenticated])

  // Save quiz result
  const saveQuizResult = useCallback(async (result: QuizResult) => {
    if (!isAuthenticated || !user) return

    try {
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.userId,
          category: result.category,
          question_id: result.questionId,
          question_text: result.questionText,
          selected_answer: result.selectedAnswer,
          correct_answer: result.correctAnswer,
          is_correct: result.isCorrect,
          response_time_ms: result.responseTimeMs,
          difficulty: result.difficulty,
          session_id: result.sessionId,
          answered_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving quiz result:', error)
    }
  }, [user, isAuthenticated])

  // Reset progress
  const resetProgress = useCallback(async () => {
    const resetData: UserProgress = {
      stars: 0,
      badges: 0,
      level: 1,
      totalCorrect: 0,
      totalQuestions: 0,
      streakDays: 0,
      achievements: [],
      categoryProgress: {}
    }

    setProgress(resetData)

    if (isAuthenticated && user) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: user.userId,
            ...resetData,
            total_correct: resetData.totalCorrect,
            total_questions: resetData.totalQuestions,
            streak_days: resetData.streakDays,
            category_progress: resetData.categoryProgress,
            last_active: new Date().toISOString()
          })

        if (error) throw error
        toast.success('Progress reset successfully')
      } catch (error) {
        console.error('Error resetting progress:', error)
        toast.error('Failed to reset progress')
      }
    } else {
      localStorage.setItem('quiz_progress', JSON.stringify(resetData))
      toast.success('Progress reset successfully')
    }
  }, [user, isAuthenticated])

  // Load progress when user changes
  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return {
    progress,
    loading,
    updateProgress,
    saveQuizResult,
    resetProgress,
    loadProgress
  }
}
