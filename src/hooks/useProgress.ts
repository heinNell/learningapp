
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface UserProgress {
  stars: number
  badges: number
  level: number
  totalCorrect: number
  totalQuestions: number
}

export const useProgress = (userId?: string) => {
  const [progress, setProgress] = useState<UserProgress>({
    stars: 0,
    badges: 0,
    level: 1,
    totalCorrect: 0,
    totalQuestions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadProgress()
    } else {
      // Load from localStorage for guest users
      const savedProgress = localStorage.getItem('quiz_progress')
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress))
      }
      setLoading(false)
    }
  }, [userId])

  const loadProgress = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data && !error) {
        setProgress({
          stars: data.stars,
          badges: data.badges,
          level: data.level,
          totalCorrect: data.total_correct || 0,
          totalQuestions: data.total_questions || 0
        })
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (isCorrect: boolean) => {
    const newProgress = {
      ...progress,
      totalQuestions: progress.totalQuestions + 1,
      totalCorrect: isCorrect ? progress.totalCorrect + 1 : progress.totalCorrect,
      stars: isCorrect ? progress.stars + 1 : progress.stars
    }

    // Calculate badges and levels
    newProgress.badges = Math.floor(newProgress.stars / 10)
    newProgress.level = Math.floor(newProgress.stars / 50) + 1

    setProgress(newProgress)

    if (userId) {
      // Save to Supabase
      await supabase
        .from('progress')
        .upsert({
          user_id: userId,
          stars: newProgress.stars,
          badges: newProgress.badges,
          level: newProgress.level,
          total_correct: newProgress.totalCorrect,
          total_questions: newProgress.totalQuestions,
          last_active: new Date().toISOString()
        })
    } else {
      // Save to localStorage
      localStorage.setItem('quiz_progress', JSON.stringify(newProgress))
    }

    return newProgress
  }

  const resetProgress = async () => {
    const resetData = {
      stars: 0,
      badges: 0,
      level: 1,
      totalCorrect: 0,
      totalQuestions: 0
    }

    setProgress(resetData)

    if (userId) {
      await supabase
        .from('progress')
        .upsert({
          user_id: userId,
          ...resetData,
          last_active: new Date().toISOString()
        })
    } else {
      localStorage.setItem('quiz_progress', JSON.stringify(resetData))
    }
  }

  return { progress, updateProgress, resetProgress, loading }
}
