import { useState, useEffect, useCallback } from 'react'
import { enhancedStoryService, UserAdventureProgress } from '../services/enhancedStoryService'
import { Adventure, StoryChapter } from '../data/storyData'

export interface StoryProgressState {
  [adventureId: string]: {
    currentChapterId?: string
    chaptersCompleted: string[]
    totalQuestionsAnswered: number
    totalCorrectAnswers: number
    lastPlayedAt: string
  }
}

export interface UseEnhancedStoryProgressReturn {
  storyProgress: StoryProgressState
  loading: boolean
  error: string | null
  
  // Adventure management
  getAdventureByCategory: (categoryId: string) => Promise<Adventure | null>
  getAllAdventures: () => Promise<Adventure[]>
  
  // Chapter management
  getCurrentChapter: (adventure: Adventure, userStars: number) => Promise<StoryChapter | null>
  getUnlockedChapters: (adventure: Adventure, userStars: number) => StoryChapter[]
  
  // Progress tracking
  updateAdventureProgress: (adventureId: string, updates: Partial<{
    currentChapterId: string
    chaptersCompleted: string[]
    totalQuestionsAnswered: number
    totalCorrectAnswers: number
  }>) => Promise<void>
  
  completeChapter: (
    adventureId: string,
    chapterId: string,
    questionsAnswered: number,
    correctAnswers: number,
    completionTimeSeconds?: number
  ) => Promise<void>
  
  setCurrentChapter: (adventureId: string, chapterId: string) => Promise<void>
  
  // Progress queries
  getAdventureProgress: (adventureId: string) => StoryProgressState[string] | null
  isChapterCompleted: (adventureId: string, chapterId: string) => boolean
  getCompletionStats: (adventureId: string) => {
    chaptersCompleted: number
    totalChapters: number
    accuracy: number
    totalQuestions: number
  }
  
  // Utility functions
  resetAdventureProgress: (adventureId: string) => Promise<void>
  syncProgress: () => Promise<void>
  clearCache: () => void
}

export const useEnhancedStoryProgress = (userId?: string): UseEnhancedStoryProgressReturn => {
  const [storyProgress, setStoryProgress] = useState<StoryProgressState>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adventuresCache, setAdventuresCache] = useState<Map<string, Adventure>>(new Map())

  // Load initial progress from localStorage and database
  useEffect(() => {
    loadInitialProgress()
  }, [userId])

  const loadInitialProgress = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load from localStorage first for immediate display
      const localProgress = loadProgressFromLocal()
      if (Object.keys(localProgress).length > 0) {
        setStoryProgress(localProgress)
      }

      // If user is authenticated, sync with database
      if (userId) {
        await syncProgressFromDatabase()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story progress')
      console.error('Error loading initial progress:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadProgressFromLocal = (): StoryProgressState => {
    try {
      const saved = localStorage.getItem('enhanced_story_progress')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Error loading progress from localStorage:', error)
      return {}
    }
  }

  const saveProgressToLocal = useCallback((progress: StoryProgressState) => {
    try {
      localStorage.setItem('enhanced_story_progress', JSON.stringify(progress))
    } catch (error) {
      console.error('Error saving progress to localStorage:', error)
    }
  }, [])

  const syncProgressFromDatabase = async () => {
    if (!userId) return

    try {
      // Get all adventures to know what progress to load
      const adventures = await enhancedStoryService.getAllAdventures(userId)
      const progressMap: StoryProgressState = {}

      for (const adventure of adventures) {
        const userProgress = await enhancedStoryService.getUserAdventureProgress(userId, adventure.id)
        if (userProgress) {
          progressMap[adventure.id] = {
            currentChapterId: userProgress.current_chapter_id,
            chaptersCompleted: userProgress.chapters_completed || [],
            totalQuestionsAnswered: userProgress.total_questions_answered || 0,
            totalCorrectAnswers: userProgress.total_correct_answers || 0,
            lastPlayedAt: userProgress.last_played_at
          }
        }
      }

      setStoryProgress(progressMap)
      saveProgressToLocal(progressMap)
    } catch (err) {
      console.error('Error syncing progress from database:', err)
      setError('Failed to sync progress from server')
    }
  }

  // Adventure management functions
  const getAdventureByCategory = useCallback(async (categoryId: string): Promise<Adventure | null> => {
    try {
      const cacheKey = `category_${categoryId}`
      if (adventuresCache.has(cacheKey)) {
        return adventuresCache.get(cacheKey)!
      }

      const adventure = await enhancedStoryService.getAdventureByCategory(categoryId, userId)
      if (adventure) {
        setAdventuresCache(prev => new Map(prev).set(cacheKey, adventure))
      }
      return adventure
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get adventure')
      return null
    }
  }, [userId, adventuresCache])

  const getAllAdventures = useCallback(async (): Promise<Adventure[]> => {
    try {
      return await enhancedStoryService.getAllAdventures(userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get adventures')
      return []
    }
  }, [userId])

  // Chapter management functions
  const getCurrentChapter = useCallback(async (
    adventure: Adventure,
    userStars: number
  ): Promise<StoryChapter | null> => {
    try {
      return await enhancedStoryService.getCurrentChapter(adventure, userStars, userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current chapter')
      return null
    }
  }, [userId])

  const getUnlockedChapters = useCallback((
    adventure: Adventure,
    userStars: number
  ): StoryChapter[] => {
    return enhancedStoryService.getUnlockedChapters(adventure, userStars)
  }, [])

  // Progress tracking functions
  const updateAdventureProgress = useCallback(async (
    adventureId: string,
    updates: Partial<{
      currentChapterId: string
      chaptersCompleted: string[]
      totalQuestionsAnswered: number
      totalCorrectAnswers: number
    }>
  ): Promise<void> => {
    try {
      // Update local state immediately
      setStoryProgress(prev => {
        const current = prev[adventureId] || {
          chaptersCompleted: [],
          totalQuestionsAnswered: 0,
          totalCorrectAnswers: 0,
          lastPlayedAt: new Date().toISOString()
        }

        const updated = {
          ...current,
          ...updates,
          lastPlayedAt: new Date().toISOString()
        }

        const newProgress = { ...prev, [adventureId]: updated }
        saveProgressToLocal(newProgress)
        return newProgress
      })

      // Sync with database if user is authenticated
      if (userId) {
        await enhancedStoryService.updateAdventureProgress(userId, adventureId, updates)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
      throw err
    }
  }, [userId, saveProgressToLocal])

  const completeChapter = useCallback(async (
    adventureId: string,
    chapterId: string,
    questionsAnswered: number,
    correctAnswers: number,
    completionTimeSeconds?: number
  ): Promise<void> => {
    try {
      const currentProgress = storyProgress[adventureId]
      const chaptersCompleted = currentProgress?.chaptersCompleted || []
      
      // Don't add duplicate completions
      if (!chaptersCompleted.includes(chapterId)) {
        const newChaptersCompleted = [...chaptersCompleted, chapterId]
        
        await updateAdventureProgress(adventureId, {
          chaptersCompleted: newChaptersCompleted,
          totalQuestionsAnswered: (currentProgress?.totalQuestionsAnswered || 0) + questionsAnswered,
          totalCorrectAnswers: (currentProgress?.totalCorrectAnswers || 0) + correctAnswers
        })

        // Record detailed completion in database
        if (userId) {
          await enhancedStoryService.completeChapter(
            userId,
            adventureId,
            chapterId,
            questionsAnswered,
            correctAnswers,
            completionTimeSeconds
          )
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete chapter')
      throw err
    }
  }, [storyProgress, userId, updateAdventureProgress])

  const setCurrentChapter = useCallback(async (
    adventureId: string,
    chapterId: string
  ): Promise<void> => {
    try {
      await updateAdventureProgress(adventureId, {
        currentChapterId: chapterId
      })

      if (userId) {
        await enhancedStoryService.setCurrentChapter(userId, adventureId, chapterId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set current chapter')
      throw err
    }
  }, [userId, updateAdventureProgress])

  // Progress query functions
  const getAdventureProgress = useCallback((adventureId: string): StoryProgressState[string] | null => {
    return storyProgress[adventureId] || null
  }, [storyProgress])

  const isChapterCompleted = useCallback((adventureId: string, chapterId: string): boolean => {
    const progress = storyProgress[adventureId]
    return progress?.chaptersCompleted?.includes(chapterId) || false
  }, [storyProgress])

  const getCompletionStats = useCallback((adventureId: string) => {
    const progress = storyProgress[adventureId]
    const chaptersCompleted = progress?.chaptersCompleted?.length || 0
    const totalQuestions = progress?.totalQuestionsAnswered || 0
    const correctAnswers = progress?.totalCorrectAnswers || 0
    
    return {
      chaptersCompleted,
      totalChapters: 0, // Will be filled when adventure is loaded
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      totalQuestions
    }
  }, [storyProgress])

  // Utility functions
  const resetAdventureProgress = useCallback(async (adventureId: string): Promise<void> => {
    try {
      // Remove from local state
      setStoryProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[adventureId]
        saveProgressToLocal(newProgress)
        return newProgress
      })

      // Reset in database
      if (userId) {
        await enhancedStoryService.resetAdventureProgress(userId, adventureId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset progress')
      throw err
    }
  }, [userId, saveProgressToLocal])

  const syncProgress = useCallback(async (): Promise<void> => {
    if (userId) {
      await syncProgressFromDatabase()
    }
  }, [userId])

  const clearCache = useCallback(() => {
    enhancedStoryService.clearCache()
    setAdventuresCache(new Map())
  }, [])

  return {
    storyProgress,
    loading,
    error,
    
    // Adventure management
    getAdventureByCategory,
    getAllAdventures,
    
    // Chapter management
    getCurrentChapter,
    getUnlockedChapters,
    
    // Progress tracking
    updateAdventureProgress,
    completeChapter,
    setCurrentChapter,
    
    // Progress queries
    getAdventureProgress,
    isChapterCompleted,
    getCompletionStats,
    
    // Utility functions
    resetAdventureProgress,
    syncProgress,
    clearCache
  }
}