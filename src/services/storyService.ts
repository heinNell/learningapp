
import { supabase } from '../lib/supabase'
import { Adventure, StoryChapter, Character, adventures as staticAdventures } from '../data/storyData'

export interface DatabaseAdventure {
  id: string
  category_id: string
  title: string
  description: string
  character_id: string
  character_data: any
  final_reward: string
  unlock_requirement: number
  is_active: boolean
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
  is_active: boolean
  created_at: string
}

class EnhancedStoryService {
  private adventuresCache: Map<string, Adventure> = new Map()
  private chaptersCache: Map<string, StoryChapter[]> = new Map()

  // Get adventure by category with database fallback
  async getAdventureByCategory(categoryId: string): Promise<Adventure | null> {
    try {
      // Check cache first
      const cacheKey = `category_${categoryId}`
      if (this.adventuresCache.has(cacheKey)) {
        return this.adventuresCache.get(cacheKey)!
      }

      // Try to fetch from database first
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
          .order('chapter_order')

        if (!chaptersError && chaptersData) {
          const adventure = this.mapDatabaseToAdventure(adventureData, chaptersData)
          this.adventuresCache.set(cacheKey, adventure)
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

  // Get current chapter with enhanced logic
  async getCurrentChapter(
    adventure: Adventure,
    userStars: number,
    userId?: string
  ): Promise<StoryChapter | null> {
    try {
      if (userId) {
        // Get user's current progress from database
        const { data: progressData, error: progressError } = await supabase
          .from('user_adventure_progress')
          .select('current_chapter_id, chapters_completed')
          .eq('user_id', userId)
          .eq('adventure_id', adventure.id)
          .single()

        if (progressData && !progressError) {
          // If user has a current chapter set, return that (if still unlocked)
          if (progressData.current_chapter_id) {
            const currentChapter = adventure.chapters.find(c => c.id === progressData.current_chapter_id)
            if (currentChapter && userStars >= currentChapter.unlockRequirement) {
              return currentChapter
            }
          }

          // Find next uncompleted chapter
          const completedChapters = progressData.chapters_completed || []
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

  // Get all adventures with database integration
  async getAllAdventures(): Promise<Adventure[]> {
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
            .order('chapter_order')

          if (!chaptersError && chaptersData) {
            const adventure = this.mapDatabaseToAdventure(adventureData, chaptersData)
            adventures.push(adventure)
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

  // Get unlocked chapters
  async getUnlockedChapters(adventure: Adventure, userStars: number): Promise<StoryChapter[]> {
    return adventure.chapters.filter(chapter => userStars >= chapter.unlockRequirement)
  }

  // Map database objects to application objects
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

    // Use character data from database or fallback to static
    const character: Character = adventureData.character_data || {
      id: adventureData.character_id,
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

  // Clear cache when needed
  clearCache(): void {
    this.adventuresCache.clear()
    this.chaptersCache.clear()
  }

  // Sync static data to database (for admin use)
  async syncStaticDataToDatabase(): Promise<void> {
    try {
      for (const adventure of staticAdventures) {
        // Insert or update adventure
        const { error: adventureError } = await supabase
          .from('adventures')
          .upsert({
            id: adventure.id,
            category_id: adventure.categoryId,
            title: adventure.title,
            description: adventure.description,
            character_id: adventure.character.id,
            character_data: adventure.character,
            final_reward: adventure.finalReward,
            unlock_requirement: 0,
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
              chapter_order: i + 1,
              title: chapter.title,
              description: chapter.description,
              setting: chapter.setting,
              background_image: chapter.backgroundImage,
              unlock_requirement: chapter.unlockRequirement,
              questions_needed: chapter.questionsNeeded,
              completion_reward: chapter.completionReward,
              is_active: true
            })

          if (chapterError) {
            console.error('Error syncing chapter:', chapter.id, chapterError)
          }
        }
      }

      console.log('Static data synced to database successfully')
    } catch (error) {
      console.error('Error syncing static data to database:', error)
    }
  }
}

export const enhancedStoryService = new EnhancedStoryService()

// Export the functions for backward compatibility
export const getAdventureByCategory = (categoryId: string) => 
  enhancedStoryService.getAdventureByCategory(categoryId)

export const getCurrentChapter = (adventure: Adventure, userStars: number, userId?: string) => 
  enhancedStoryService.getCurrentChapter(adventure, userStars, userId)

export const getUnlockedChapters = (adventure: Adventure, userStars: number) => 
  enhancedStoryService.getUnlockedChapters(adventure, userStars)
