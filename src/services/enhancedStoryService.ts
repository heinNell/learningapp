import { supabase } from '../lib/supabase'
import { Adventure, StoryChapter, Character, adventures as staticAdventures } from '../data/storyData'

export interface DatabaseAdventure {
  id: string
  category_id: string
  title: string
  description: string
  character_data: any
  final_reward: string
  unlock_requirement: number
  total_chapters: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseChapter {
  id: string
  adventure_id: string
  chapter_number: number
  title: string
  description: string
  setting: string
  background_image: string
  unlock_requirement: number
  questions_needed: number
  completion_reward: string
  story_content: any
  is_active: boolean
  created_at: string
}

export interface UserAdventureProgress {
  id: string
  user_id: string
  adventure_id: string
  current_chapter_id?: string
  chapters_completed: string[]
  total_questions_answered: number
  total_correct_answers: number
  last_played_at: string
  created_at: string
  updated_at: string
}

export interface ChapterCompletion {
  id: string
  user_id: string
  adventure_id: string
  chapter_id: string
  questions_answered: number
  correct_answers: number
  completion_time_seconds?: number
  completed_at: string
}

class EnhancedStoryService {
  private adventuresCache: Map<string, Adventure> = new Map()
  private chaptersCache: Map<string, StoryChapter[]> = new Map()
  private progressCache: Map<string, UserAdventureProgress> = new Map()

  // Get adventure by category with database integration
  async getAdventureByCategory(categoryId: string, userId?: string): Promise<Adventure | null> {
    try {
      const cacheKey = `category_${categoryId}`
      
      // Check cache first
      if (this.adventuresCache.has(cacheKey)) {
        return this.adventuresCache.get(cacheKey)!
      }

      // Try database first
      const { data: adventureData, error: adventureError } = await supabase
        .from('adventures')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .single()

      if (adventureData && !adventureError) {
        // Fetch chapters for this adventure
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('adventure_id', adventureData.id)
          .eq('is_active', true)
          .order('chapter_number')

        if (!chaptersError && chaptersData) {
          const adventure = this.mapDatabaseToAdventure(adventureData, chaptersData)
          this.adventuresCache.set(cacheKey, adventure)
          
          // Load user progress if available
          if (userId) {
            await this.loadUserProgress(userId, adventure.id)
          }
          
          return adventure
        }
      }

      // Fallback to static data
      const staticAdventure = staticAdventures.find(a => a.categoryId === categoryId)
      if (staticAdventure) {
        this.adventuresCache.set(cacheKey, staticAdventure)
        return staticAdventure
      }

      return null
    } catch (error) {
      console.error('Error in getAdventureByCategory:', error)
      
      // Fallback to static data on error
      const staticAdventure = staticAdventures.find(a => a.categoryId === categoryId)
      return staticAdventure || null
    }
  }

  // Get all adventures with user progress
  async getAllAdventures(userId?: string): Promise<Adventure[]> {
    try {
      // Try database first
      const { data: adventuresData, error: adventuresError } = await supabase
        .from('adventures')
        .select('*')
        .eq('is_active', true)
        .order('category_id')

      if (adventuresData && !adventuresError) {
        const adventures: Adventure[] = []

        for (const adventureData of adventuresData) {
          const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('*')
            .eq('adventure_id', adventureData.id)
            .eq('is_active', true)
            .order('chapter_number')

          if (!chaptersError && chaptersData) {
            const adventure = this.mapDatabaseToAdventure(adventureData, chaptersData)
            adventures.push(adventure)
            
            // Load user progress for each adventure
            if (userId) {
              await this.loadUserProgress(userId, adventure.id)
            }
          }
        }

        if (adventures.length > 0) {
          return adventures
        }
      }

      // Fallback to static data
      return staticAdventures
    } catch (error) {
      console.error('Error fetching all adventures:', error)
      return staticAdventures
    }
  }

  // Get current chapter with enhanced logic
  async getCurrentChapter(
    adventure: Adventure,
    userStars: number,
    userId?: string
  ): Promise<StoryChapter | null> {
    try {
      if (userId) {
        const progressKey = `${userId}_${adventure.id}`
        let userProgress = this.progressCache.get(progressKey)

        if (!userProgress) {
          userProgress = await this.loadUserProgress(userId, adventure.id)
        }

        if (userProgress) {
          // If user has a current chapter set, return that (if still unlocked)
          if (userProgress.current_chapter_id) {
            const currentChapter = adventure.chapters.find(c => c.id === userProgress!.current_chapter_id)
            if (currentChapter && userStars >= currentChapter.unlockRequirement) {
              return currentChapter
            }
          }

          // Find next uncompleted chapter
          const completedChapters = userProgress.chapters_completed || []
          for (const chapter of adventure.chapters) {
            if (userStars >= chapter.unlockRequirement && !completedChapters.includes(chapter.id)) {
              return chapter
            }
          }
        }
      }

      // Default logic: find first unlocked chapter
      for (const chapter of adventure.chapters) {
        if (userStars >= chapter.unlockRequirement) {
          return chapter
        }
      }

      // Return first chapter if none are unlocked
      return adventure.chapters[0] || null
    } catch (error) {
      console.error('Error in getCurrentChapter:', error)
      
      // Fallback to first available chapter
      return adventure.chapters.find(c => userStars >= c.unlockRequirement) || adventure.chapters[0] || null
    }
  }

  // Update user adventure progress
  async updateAdventureProgress(
    userId: string,
    adventureId: string,
    updates: Partial<{
      currentChapterId: string
      chaptersCompleted: string[]
      totalQuestionsAnswered: number
      totalCorrectAnswers: number
    }>
  ): Promise<UserAdventureProgress> {
    try {
      const progressKey = `${userId}_${adventureId}`
      let currentProgress = this.progressCache.get(progressKey)

      const updateData: any = {
        user_id: userId,
        adventure_id: adventureId,
        last_played_at: new Date().toISOString()
      }

      if (updates.currentChapterId !== undefined) {
        updateData.current_chapter_id = updates.currentChapterId
      }
      if (updates.chaptersCompleted !== undefined) {
        updateData.chapters_completed = updates.chaptersCompleted
      }
      if (updates.totalQuestionsAnswered !== undefined) {
        updateData.total_questions_answered = updates.totalQuestionsAnswered
      }
      if (updates.totalCorrectAnswers !== undefined) {
        updateData.total_correct_answers = updates.totalCorrectAnswers
      }

      const { data, error } = await supabase
        .from('user_adventure_progress')
        .upsert(updateData)
        .select()
        .single()

      if (error) {
        console.error('Error updating adventure progress:', error)
        throw error
      }

      // Update cache
      this.progressCache.set(progressKey, data)
      return data
    } catch (error) {
      console.error('Error in updateAdventureProgress:', error)
      throw error
    }
  }

  // Complete a chapter
  async completeChapter(
    userId: string,
    adventureId: string,
    chapterId: string,
    questionsAnswered: number,
    correctAnswers: number,
    completionTimeSeconds?: number
  ): Promise<void> {
    try {
      // Record detailed completion
      const { error: completionError } = await supabase
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

      if (completionError) {
        console.error('Error recording chapter completion:', completionError)
      }

      // Update adventure progress
      const progressKey = `${userId}_${adventureId}`
      let currentProgress = this.progressCache.get(progressKey)

      if (!currentProgress) {
        currentProgress = await this.loadUserProgress(userId, adventureId)
      }

      const chaptersCompleted = currentProgress?.chapters_completed || []
      
      // Don't add duplicate completions
      if (!chaptersCompleted.includes(chapterId)) {
        const newChaptersCompleted = [...chaptersCompleted, chapterId]
        
        await this.updateAdventureProgress(userId, adventureId, {
          chaptersCompleted: newChaptersCompleted,
          totalQuestionsAnswered: (currentProgress?.total_questions_answered || 0) + questionsAnswered,
          totalCorrectAnswers: (currentProgress?.total_correct_answers || 0) + correctAnswers
        })
      }
    } catch (error) {
      console.error('Error in completeChapter:', error)
      throw error
    }
  }

  // Set current chapter
  async setCurrentChapter(userId: string, adventureId: string, chapterId: string): Promise<void> {
    try {
      await this.updateAdventureProgress(userId, adventureId, {
        currentChapterId: chapterId
      })
    } catch (error) {
      console.error('Error in setCurrentChapter:', error)
      throw error
    }
  }

  // Get user progress for an adventure
  async getUserAdventureProgress(userId: string, adventureId: string): Promise<UserAdventureProgress | null> {
    const progressKey = `${userId}_${adventureId}`
    
    if (this.progressCache.has(progressKey)) {
      return this.progressCache.get(progressKey)!
    }

    return await this.loadUserProgress(userId, adventureId)
  }

  // Check if chapter is completed
  async isChapterCompleted(userId: string, adventureId: string, chapterId: string): Promise<boolean> {
    const progress = await this.getUserAdventureProgress(userId, adventureId)
    return progress?.chapters_completed?.includes(chapterId) || false
  }

  // Get unlocked chapters
  getUnlockedChapters(adventure: Adventure, userStars: number): StoryChapter[] {
    return adventure.chapters.filter(chapter => userStars >= chapter.unlockRequirement)
  }

  // Reset adventure progress
  async resetAdventureProgress(userId: string, adventureId: string): Promise<void> {
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

      // Clear cache
      const progressKey = `${userId}_${adventureId}`
      this.progressCache.delete(progressKey)
    } catch (error) {
      console.error('Error resetting adventure progress:', error)
      throw error
    }
  }

  // Private helper methods
  private async loadUserProgress(userId: string, adventureId: string): Promise<UserAdventureProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_adventure_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('adventure_id', adventureId)
        .single()

      if (data && !error) {
        const progressKey = `${userId}_${adventureId}`
        this.progressCache.set(progressKey, data)
        return data
      }

      return null
    } catch (error) {
      console.error('Error loading user progress:', error)
      return null
    }
  }

  private mapDatabaseToAdventure(
    adventureData: DatabaseAdventure,
    chaptersData: DatabaseChapter[]
  ): Adventure {
    const chapters: StoryChapter[] = chaptersData.map(chapterData => ({
      id: chapterData.id,
      title: chapterData.title,
      description: chapterData.description || '',
      setting: chapterData.setting || '',
      backgroundImage: chapterData.background_image || '',
      unlockRequirement: chapterData.unlock_requirement,
      questionsNeeded: chapterData.questions_needed,
      completionReward: chapterData.completion_reward || ''
    }))

    // Use character data from database
    const character: Character = adventureData.character_data || {
      id: 'default',
      name: 'Adventure Character',
      avatar: '🎮',
      personality: 'friendly',
      catchphrase: 'Let\'s learn together!',
      introduction: 'Welcome to this adventure!',
      encouragement: ['You\'re doing great!'],
      celebration: ['Excellent work!'],
      comfort: ['Keep trying!']
    }

    return {
      id: adventureData.id,
      categoryId: adventureData.category_id,
      title: adventureData.title,
      description: adventureData.description || '',
      character,
      chapters,
      finalReward: adventureData.final_reward || ''
    }
  }

  // Clear all caches
  clearCache(): void {
    this.adventuresCache.clear()
    this.chaptersCache.clear()
    this.progressCache.clear()
  }

  // Sync static data to database (for development/admin use)
  async syncStaticDataToDatabase(): Promise<void> {
    try {
      console.log('Starting story data sync...')
      
      for (const adventure of staticAdventures) {
        // Insert or update adventure
        const { error: adventureError } = await supabase
          .from('adventures')
          .upsert({
            id: adventure.id,
            category_id: adventure.categoryId,
            title: adventure.title,
            description: adventure.description,
            character_data: adventure.character,
            final_reward: adventure.finalReward,
            unlock_requirement: 0,
            total_chapters: adventure.chapters.length,
            is_active: true
          })

        if (adventureError) {
          console.error('Error syncing adventure:', adventure.id, adventureError)
          continue
        }

        // Insert or update chapters
        for (let i = 0; i < adventure.chapters.length; i++) {
          const chapter = adventure.chapters[i]
          const { error: chapterError } = await supabase
            .from('chapters')
            .upsert({
              id: chapter.id,
              adventure_id: adventure.id,
              chapter_number: i + 1,
              title: chapter.title,
              description: chapter.description,
              setting: chapter.setting,
              background_image: chapter.backgroundImage,
              unlock_requirement: chapter.unlockRequirement,
              questions_needed: chapter.questionsNeeded,
              completion_reward: chapter.completionReward,
              story_content: {
                character_id: adventure.character.id,
                intro: `Welcome to ${chapter.title}!`,
                setting_description: chapter.description
              },
              is_active: true
            })

          if (chapterError) {
            console.error('Error syncing chapter:', chapter.id, chapterError)
          }
        }
      }

      console.log('Story data sync completed successfully')
      this.clearCache() // Clear cache after sync
    } catch (error) {
      console.error('Error syncing static data to database:', error)
    }
  }
}

// Create singleton instance
export const enhancedStoryService = new EnhancedStoryService()

// Export convenience functions for backward compatibility
export const getAdventureByCategory = (categoryId: string, userId?: string) => 
  enhancedStoryService.getAdventureByCategory(categoryId, userId)

export const getCurrentChapter = (adventure: Adventure, userStars: number, userId?: string) => 
  enhancedStoryService.getCurrentChapter(adventure, userStars, userId)

export const getUnlockedChapters = (adventure: Adventure, userStars: number) => 
  enhancedStoryService.getUnlockedChapters(adventure, userStars)

export default enhancedStoryService