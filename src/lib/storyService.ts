
import { supabase } from './supabase'
import { Adventure, StoryChapter, Character } from '../data/storyData'

export interface DatabaseAdventure {
  id: string
  category_id: string
  title: string
  description: string
  character_id: string
  final_reward: string
  created_at: string
  updated_at: string
}

export interface DatabaseChapter {
  id: string
  adventure_id: string
  chapter_order: number
  title: string
  description: string
  setting: string
  background_image: string
  unlock_requirement: number
  questions_needed: number
  completion_reward: string
  created_at: string
}

class StoryService {
  private adventuresCache: Map<string, Adventure> = new Map()
  private chaptersCache: Map<string, StoryChapter[]> = new Map()

  async getAdventureByCategory(categoryId: string): Promise<Adventure | null> {
    try {
      // Check cache first
      const cacheKey = `category_${categoryId}`
      if (this.adventuresCache.has(cacheKey)) {
        return this.adventuresCache.get(cacheKey)!
      }

      // Fetch from database
      const { data: adventureData, error: adventureError } = await supabase
        .from('adventures')
        .select('*')
        .eq('category_id', categoryId)
        .single()

      if (adventureError || !adventureData) {
        console.error('Error fetching adventure by category:', adventureError)
        return null
      }

      // Fetch chapters for this adventure
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('adventure_id', adventureData.id)
        .order('chapter_order')

      if (chaptersError) {
        console.error('Error fetching chapters:', chaptersError)
        return null
      }

      // Convert database format to application format
      const adventure = this.mapDatabaseToAdventure(adventureData, chaptersData || [])
      
      // Cache the result
      this.adventuresCache.set(cacheKey, adventure)
      
      return adventure
    } catch (error) {
      console.error('Error in getAdventureByCategory:', error)
      return null
    }
  }

  async getCurrentChapter(
    adventureId: string, 
    userId: string, 
    userStars: number
  ): Promise<StoryChapter | null> {
    try {
      // Get user's current progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_adventure_progress')
        .select('current_chapter_id, chapters_completed')
        .eq('user_id', userId)
        .eq('adventure_id', adventureId)
        .single()

      // Get all chapters for this adventure
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('adventure_id', adventureId)
        .order('chapter_order')

      if (chaptersError || !chaptersData) {
        console.error('Error fetching chapters:', chaptersError)
        return null
      }

      const chapters = chaptersData.map(this.mapDatabaseToChapter)

      // If user has progress and a current chapter set, return that
      if (progressData && progressData.current_chapter_id) {
        const currentChapter = chapters.find(c => c.id === progressData.current_chapter_id)
        if (currentChapter && userStars >= currentChapter.unlockRequirement) {
          return currentChapter
        }
      }

      // Otherwise, find the next available chapter based on stars and completion
      const completedChapters = progressData?.chapters_completed || []
      
      for (const chapter of chapters) {
        // Check if chapter is unlocked and not completed
        if (userStars >= chapter.unlockRequirement && !completedChapters.includes(chapter.id)) {
          return chapter
        }
      }

      // If all chapters are completed, return the last one
      return chapters[chapters.length - 1] || null
    } catch (error) {
      console.error('Error in getCurrentChapter:', error)
      return null
    }
  }

  async getAllAdventures(): Promise<Adventure[]> {
    try {
      const { data: adventuresData, error: adventuresError } = await supabase
        .from('adventures')
        .select('*')
        .order('category_id')

      if (adventuresError || !adventuresData) {
        console.error('Error fetching adventures:', adventuresError)
        return []
      }

      const adventures: Adventure[] = []

      for (const adventureData of adventuresData) {
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('adventure_id', adventureData.id)
          .order('chapter_order')

        if (chaptersError) {
          console.error('Error fetching chapters for adventure:', adventureData.id, chaptersError)
          continue
        }

        const adventure = this.mapDatabaseToAdventure(adventureData, chaptersData || [])
        adventures.push(adventure)
      }

      return adventures
    } catch (error) {
      console.error('Error fetching all adventures:', error)
      return []
    }
  }

  async getUnlockedChapters(adventureId: string, userStars: number): Promise<StoryChapter[]> {
    try {
      const { data: chaptersData, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('adventure_id', adventureId)
        .lte('unlock_requirement', userStars)
        .order('chapter_order')

      if (error || !chaptersData) {
        console.error('Error fetching unlocked chapters:', error)
        return []
      }

      return chaptersData.map(this.mapDatabaseToChapter)
    } catch (error) {
      console.error('Error in getUnlockedChapters:', error)
      return []
    }
  }

  private mapDatabaseToAdventure(
    adventureData: DatabaseAdventure, 
    chaptersData: DatabaseChapter[]
  ): Adventure {
    const chapters = chaptersData.map(this.mapDatabaseToChapter)
    
    // Import character data (this would need to be enhanced to fetch from DB too)
    const { characters } = require('../data/storyData')
    const character = characters.find((c: Character) => c.id === adventureData.character_id) || characters[0]

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

  private mapDatabaseToChapter(chapterData: DatabaseChapter): StoryChapter {
    return {
      id: chapterData.id,
      title: chapterData.title,
      description: chapterData.description || '',
      setting: chapterData.setting || '',
      backgroundImage: chapterData.background_image || '',
      unlockRequirement: chapterData.unlock_requirement,
      questionsNeeded: chapterData.questions_needed,
      completionReward: chapterData.completion_reward || ''
    }
  }

  // Clear cache when needed
  clearCache(): void {
    this.adventuresCache.clear()
    this.chaptersCache.clear()
  }
}

export const storyService = new StoryService()

// Export the functions that were declared but not used
export const getAdventureByCategory = (categoryId: string) => 
  storyService.getAdventureByCategory(categoryId)

export const getCurrentChapter = (adventureId: string, userId: string, userStars: number) => 
  storyService.getCurrentChapter(adventureId, userId, userStars)
