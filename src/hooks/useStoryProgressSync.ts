
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { Adventure, StoryChapter } from '../data/storyData'
import toast from 'react-hot-toast'

export interface StoryProgress {
  adventureId: string
  currentChapterId: string | null
  completedChapters: string[]
  chapterScores: Record<string, { correct: number; total: number; stars: number }>
  totalStars: number
  completionPercentage: number
  startedAt: string
  lastPlayed: string
  completedAt: string | null
}

export const useStoryProgressSync = () => {
  const { user, isAuthenticated } = useAuth()
  const [storyProgress, setStoryProgress] = useState<Record<string, StoryProgress>>({})
  const [loading, setLoading] = useState(true)

  // Load all story progress from Supabase
  const loadStoryProgress = useCallback(async () => {
    if (!isAuthenticated || !user) {
      // Load from localStorage for guest users
      const savedProgress = localStorage.getItem('story_progress')
      if (savedProgress) {
        setStoryProgress(JSON.parse(savedProgress))
      }
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const { data: progressData, error } = await supabase
        .from('user_adventure_progress')
        .select('*')
        .eq('user_id', user.userId)

      if (progressData && !error) {
        const progressMap: Record<string, StoryProgress> = {}
        
        progressData.forEach((progress) => {
          progressMap[progress.adventure_id] = {
            adventureId: progress.adventure_id,
            currentChapterId: progress.current_chapter_id,
            completedChapters: progress.chapters_completed || [],
            chapterScores: progress.chapter_scores || {},
            totalStars: progress.total_stars || 0,
            completionPercentage: progress.completion_percentage || 0,
            startedAt: progress.started_at,
            lastPlayed: progress.last_played,
            completedAt: progress.completed_at
          }
        })
        
        setStoryProgress(progressMap)
      }
    } catch (error) {
      console.error('Error loading story progress:', error)
      toast.error('Failed to load story progress')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated])

  // Get current chapter for an adventure using existing function logic
  const getCurrentChapter = useCallback(async (adventure: Adventure, userStars: number): Promise<StoryChapter | null> => {
    const adventureProgress = storyProgress[adventure.id]
    
    if (adventureProgress && adventureProgress.currentChapterId) {
      // Find the current chapter
      const currentChapter = adventure.chapters.find(c => c.id === adventureProgress.currentChapterId)
      if (currentChapter && userStars >= currentChapter.unlockRequirement) {
        return currentChapter
      }
    }

    // Find the next available chapter based on stars and completion
    const completedChapters = adventureProgress?.completedChapters || []
    
    for (const chapter of adventure.chapters) {
      // Check if chapter is unlocked and not completed
      if (userStars >= chapter.unlockRequirement && !completedChapters.includes(chapter.id)) {
        return chapter
      }
    }

    // If all chapters are completed, return the last one
    return adventure.chapters[adventure.chapters.length - 1] || null
  }, [storyProgress])

  // Start or update adventure progress
  const updateAdventureProgress = useCallback(async (
    adventureId: string,
    chapterId: string,
    score: { correct: number; total: number }
  ) => {
    const stars = score.correct
    const currentProgress = storyProgress[adventureId] || {
      adventureId,
      currentChapterId: null,
      completedChapters: [],
      chapterScores: {},
      totalStars: 0,
      completionPercentage: 0,
      startedAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      completedAt: null
    }

    // Update chapter score and completion
    const updatedProgress = {
      ...currentProgress,
      currentChapterId: chapterId,
      chapterScores: {
        ...currentProgress.chapterScores,
        [chapterId]: { ...score, stars }
      },
      lastPlayed: new Date().toISOString()
    }

    // Add to completed chapters if not already there
    if (!updatedProgress.completedChapters.includes(chapterId)) {
      updatedProgress.completedChapters.push(chapterId)
    }

    // Calculate total stars and completion percentage
    updatedProgress.totalStars = Object.values(updatedProgress.chapterScores)
      .reduce((total, chapterScore) => total + chapterScore.stars, 0)

    // Update local state
    setStoryProgress(prev => ({
      ...prev,
      [adventureId]: updatedProgress
    }))

    if (isAuthenticated && user) {
      try {
        const { error } = await supabase
          .from('user_adventure_progress')
          .upsert({
            user_id: user.userId,
            adventure_id: adventureId,
            current_chapter_id: updatedProgress.currentChapterId,
            chapters_completed: updatedProgress.completedChapters,
            chapter_scores: updatedProgress.chapterScores,
            total_stars: updatedProgress.totalStars,
            completion_percentage: updatedProgress.completionPercentage,
            started_at: updatedProgress.startedAt,
            last_played: updatedProgress.lastPlayed,
            completed_at: updatedProgress.completedAt
          })

        if (error) throw error
      } catch (error) {
        console.error('Error updating adventure progress:', error)
        toast.error('Failed to save story progress')
      }
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('story_progress', JSON.stringify({
        ...storyProgress,
        [adventureId]: updatedProgress
      }))
    }

    return updatedProgress
  }, [storyProgress, user, isAuthenticated])

  // Get adventure progress
  const getAdventureProgress = useCallback((adventureId: string): StoryProgress | null => {
    return storyProgress[adventureId] || null
  }, [storyProgress])

  // Check if chapter is unlocked
  const isChapterUnlocked = useCallback((chapter: StoryChapter, userStars: number): boolean => {
    return userStars >= chapter.unlockRequirement
  }, [])

  // Get unlocked chapters for an adventure
  const getUnlockedChapters = useCallback((adventure: Adventure, userStars: number): StoryChapter[] => {
    return adventure.chapters.filter(chapter => userStars >= chapter.unlockRequirement)
  }, [])

  // Load progress when user changes
  useEffect(() => {
    loadStoryProgress()
  }, [loadStoryProgress])

  return {
    storyProgress,
    loading,
    getCurrentChapter,
    updateAdventureProgress,
    getAdventureProgress,
    isChapterUnlocked,
    getUnlockedChapters,
    loadStoryProgress
  }
}
