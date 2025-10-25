
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface StoryProgress {
  adventureId: string
  currentChapterId?: string
  chaptersCompleted: string[]
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  lastPlayedAt: string
}

export interface ChapterCompletion {
  chapterId: string
  questionsAnswered: number
  correctAnswers: number
  completionTimeSeconds?: number
  completedAt: string
}

export const useStoryProgress = (userId?: string) => {
  const [storyProgress, setStoryProgress] = useState<Map<string, StoryProgress>>(new Map())
  const [loading, setLoading] = useState(true)

  // Load story progress from database or localStorage
  useEffect(() => {
    if (userId) {
      loadStoryProgressFromDB()
    } else {
      loadStoryProgressFromLocal()
    }
  }, [userId])

  const loadStoryProgressFromDB = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('user_adventure_progress')
        .select(`
          adventure_id,
          current_chapter_id,
          chapters_completed,
          total_questions_answered,
          total_correct_answers,
          last_played_at
        `)
        .eq('user_id', userId)

      if (data && !error) {
        const progressMap = new Map<string, StoryProgress>()
        data.forEach(progress => {
          progressMap.set(progress.adventure_id, {
            adventureId: progress.adventure_id,
            currentChapterId: progress.current_chapter_id || undefined,
            chaptersCompleted: progress.chapters_completed || [],
            totalQuestionsAnswered: progress.total_questions_answered || 0,
            totalCorrectAnswers: progress.total_correct_answers || 0,
            lastPlayedAt: progress.last_played_at
          })
        })
        setStoryProgress(progressMap)
      }
    } catch (error) {
      console.error('Error loading story progress:', error)
      loadStoryProgressFromLocal() // Fallback to local storage
    } finally {
      setLoading(false)
    }
  }

  const loadStoryProgressFromLocal = () => {
    try {
      const saved = localStorage.getItem('story_progress')
      if (saved) {
        const progressData = JSON.parse(saved)
        const progressMap = new Map<string, StoryProgress>()
        Object.entries(progressData).forEach(([adventureId, progress]) => {
          progressMap.set(adventureId, progress as StoryProgress)
        })
        setStoryProgress(progressMap)
      }
    } catch (error) {
      console.error('Error loading story progress from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveStoryProgressToLocal = useCallback((progressMap: Map<string, StoryProgress>) => {
    try {
      const progressObj = Object.fromEntries(progressMap)
      localStorage.setItem('story_progress', JSON.stringify(progressObj))
    } catch (error) {
      console.error('Error saving story progress to localStorage:', error)
    }
  }, [])

  const updateStoryProgress = useCallback(async (
    adventureId: string,
    updates: Partial<StoryProgress>
  ): Promise<StoryProgress> => {
    const currentProgress = storyProgress.get(adventureId) || {
      adventureId,
      chaptersCompleted: [],
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      lastPlayedAt: new Date().toISOString()
    }

    const newProgress: StoryProgress = {
      ...currentProgress,
      ...updates,
      lastPlayedAt: new Date().toISOString()
    }

    // Update local state
    const newProgressMap = new Map(storyProgress)
    newProgressMap.set(adventureId, newProgress)
    setStoryProgress(newProgressMap)

    // Save to database or localStorage
    if (userId) {
      try {
        await supabase
          .from('user_adventure_progress')
          .upsert({
            user_id: userId,
            adventure_id: adventureId,
            current_chapter_id: newProgress.currentChapterId,
            chapters_completed: newProgress.chaptersCompleted,
            total_questions_answered: newProgress.totalQuestionsAnswered,
            total_correct_answers: newProgress.totalCorrectAnswers,
            last_played_at: newProgress.lastPlayedAt
          })
      } catch (error) {
        console.error('Error saving story progress to database:', error)
        // Still save locally as fallback
        saveStoryProgressToLocal(newProgressMap)
      }
    } else {
      saveStoryProgressToLocal(newProgressMap)
    }

    return newProgress
  }, [storyProgress, userId, saveStoryProgressToLocal])

  const completeChapter = useCallback(async (
    adventureId: string,
    chapterId: string,
    questionsAnswered: number,
    correctAnswers: number,
    completionTimeSeconds?: number
  ): Promise<void> => {
    const currentProgress = storyProgress.get(adventureId)
    const chaptersCompleted = currentProgress?.chaptersCompleted || []
    
    // Don't add duplicate completions
    if (!chaptersCompleted.includes(chapterId)) {
      const newChaptersCompleted = [...chaptersCompleted, chapterId]
      
      await updateStoryProgress(adventureId, {
        chaptersCompleted: newChaptersCompleted,
        totalQuestionsAnswered: (currentProgress?.totalQuestionsAnswered || 0) + questionsAnswered,
        totalCorrectAnswers: (currentProgress?.totalCorrectAnswers || 0) + correctAnswers
      })

      // Record detailed completion
      if (userId) {
        try {
          await supabase
            .from('chapter_completions')
            .upsert({
              user_id: userId,
              adventure_id: adventureId,
              chapter_id: chapterId,
              questions_answered: questionsAnswered,
              correct_answers: correctAnswers,
              completion_time_seconds: completionTimeSeconds,
              completed_at: new Date().toISOString()
            })
        } catch (error) {
          console.error('Error recording chapter completion:', error)
        }
      }
    }
  }, [storyProgress, updateStoryProgress, userId])

  const setCurrentChapter = useCallback(async (
    adventureId: string,
    chapterId: string
  ): Promise<void> => {
    await updateStoryProgress(adventureId, {
      currentChapterId: chapterId
    })
  }, [updateStoryProgress])

  const getAdventureProgress = useCallback((adventureId: string): StoryProgress | null => {
    return storyProgress.get(adventureId) || null
  }, [storyProgress])

  const isChapterCompleted = useCallback((adventureId: string, chapterId: string): boolean => {
    const progress = storyProgress.get(adventureId)
    return progress?.chaptersCompleted.includes(chapterId) || false
  }, [storyProgress])

  const resetAdventureProgress = useCallback(async (adventureId: string): Promise<void> => {
    if (userId) {
      try {
        // Delete from database
        await supabase
          .from('user_adventure_progress')
          .delete()
          .eq('user_id', userId)
          .eq('adventure_id', adventureId)

        await supabase
          .from('chapter_completions')
          .delete()
          .eq('user_id', userId)
          .eq('adventure_id', adventureId)
      } catch (error) {
        console.error('Error resetting adventure progress:', error)
      }
    }

    // Update local state
    const newProgressMap = new Map(storyProgress)
    newProgressMap.delete(adventureId)
    setStoryProgress(newProgressMap)
    saveStoryProgressToLocal(newProgressMap)
  }, [storyProgress, userId, saveStoryProgressToLocal])

  return {
    storyProgress: Object.fromEntries(storyProgress),
    loading,
    updateStoryProgress,
    completeChapter,
    setCurrentChapter,
    getAdventureProgress,
    isChapterCompleted,
    resetAdventureProgress
  }
}
