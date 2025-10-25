import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoryModeSelector } from './StoryModeSelector'
import { StoryIntroduction } from './StoryIntroduction'
import { StoryQuizCard } from './StoryQuizCard'
import { ChapterCompletion } from './ChapterCompletion'
import { useEnhancedStoryProgress } from '../hooks/useEnhancedStoryProgress'
import { useVoice } from '../hooks/useVoice'
import { Adventure, StoryChapter } from '../data/storyData'
import { quizData, QuizQuestion } from '../data/quizData'

interface StoryModeDisplayProps {
  gameState: 'story-select' | 'story-intro' | 'story-quiz' | 'chapter-complete'
  selectedCategory: string | null
  selectedAdventure: Adventure | null
  selectedChapter: StoryChapter | null
  currentQuestions: QuizQuestion[]
  currentQuestionIndex: number
  sessionResults: { correct: number; total: number }
  userStars: number
  userId?: string
  soundEnabled: boolean
  highContrast: boolean
  onAdventureSelect: (adventureId: string) => void
  onChapterStart: (chapterId: string) => void
  onAnswer: (isCorrect: boolean, selectedAnswer: string) => void
  onBackToMenu: () => void
  onContinueToNext: () => void
  onBackToStorySelect: () => void
}

export const StoryModeDisplay: React.FC<StoryModeDisplayProps> = ({
  gameState,
  selectedCategory,
  selectedAdventure,
  selectedChapter,
  currentQuestions,
  currentQuestionIndex,
  sessionResults,
  userStars,
  userId,
  soundEnabled,
  highContrast,
  onAdventureSelect,
  onChapterStart,
  onAnswer,
  onBackToMenu,
  onContinueToNext,
  onBackToStorySelect
}) => {
  const { speak } = useVoice()
  const {
    storyProgress,
    loading,
    error,
    getAdventureByCategory,
    getAllAdventures,
    getCurrentChapter,
    getUnlockedChapters,
    completeChapter,
    setCurrentChapter,
    isChapterCompleted,
    getCompletionStats
  } = useEnhancedStoryProgress(userId)

  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [loadingAdventures, setLoadingAdventures] = useState(true)

  // Load adventures on component mount
  useEffect(() => {
    loadAdventures()
  }, [])

  const loadAdventures = async () => {
    setLoadingAdventures(true)
    try {
      const allAdventures = await getAllAdventures()
      setAdventures(allAdventures)
    } catch (error) {
      console.error('Error loading adventures:', error)
    } finally {
      setLoadingAdventures(false)
    }
  }

  // Handle adventure selection with backend integration
  const handleAdventureSelect = async (adventureId: string) => {
    try {
      const adventure = adventures.find(a => a.id === adventureId)
      if (adventure && userId) {
        // Set current chapter in backend
        const currentChapter = await getCurrentChapter(adventure, userStars)
        if (currentChapter) {
          await setCurrentChapter(adventure.id, currentChapter.id)
        }
      }
      onAdventureSelect(adventureId)
    } catch (error) {
      console.error('Error selecting adventure:', error)
      // Still proceed with selection even if backend fails
      onAdventureSelect(adventureId)
    }
  }

  // Handle chapter completion with backend sync
  const handleChapterComplete = async (
    adventureId: string,
    chapterId: string,
    questionsAnswered: number,
    correctAnswers: number,
    completionTimeSeconds?: number
  ) => {
    try {
      if (userId) {
        await completeChapter(
          adventureId,
          chapterId,
          questionsAnswered,
          correctAnswers,
          completionTimeSeconds
        )
      }
    } catch (error) {
      console.error('Error completing chapter:', error)
    }
  }

  // Enhanced adventure data with progress
  const getAdventureWithProgress = (adventure: Adventure) => {
    const progress = storyProgress[adventure.id]
    const stats = getCompletionStats(adventure.id)
    const unlockedChapters = getUnlockedChapters(adventure, userStars)
    
    return {
      ...adventure,
      progress: {
        ...progress,
        unlockedChapters: unlockedChapters.length,
        totalChapters: adventure.chapters.length,
        ...stats
      }
    }
  }

  if (loading || loadingAdventures) {
    return (
      <div className={`flex items-center justify-center p-12 ${
        highContrast ? 'text-yellow-400' : 'text-white'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-2xl font-bold">Loading Story Adventures...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-12 ${
        highContrast ? 'text-red-400' : 'text-red-300'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl font-bold mb-2">Oops! Something went wrong</div>
          <div className="text-lg">{error}</div>
          <button
            onClick={loadAdventures}
            className={`mt-4 px-6 py-3 rounded-xl font-bold transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {gameState === 'story-select' && (
        <motion.div
          key="story-select"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.h2
              className={`text-5xl font-bold mb-4 ${
                highContrast ? 'text-yellow-400' : 'text-white'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              Choose Your Story Adventure!
            </motion.h2>
            <motion.p
              className={`text-xl ${
                highContrast ? 'text-white' : 'text-white/90'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Join magical characters on learning journeys!
            </motion.p>
          </div>

          <StoryModeSelector
            adventures={adventures.map(getAdventureWithProgress)}
            userStars={userStars}
            onSelectAdventure={handleAdventureSelect}
            highContrast={highContrast}
            storyProgress={storyProgress}
          />

          <div className="text-center mt-8">
            <button
              onClick={onBackToMenu}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                highContrast
                  ? 'bg-white/20 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              ← Back to Main Menu
            </button>
          </div>
        </motion.div>
      )}

      {gameState === 'story-intro' && selectedAdventure && (
        <motion.div
          key="story-intro"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
        >
          <StoryIntroduction
            adventure={getAdventureWithProgress(selectedAdventure)}
            userStars={userStars}
            onStartChapter={onChapterStart}
            onBack={onBackToStorySelect}
            highContrast={highContrast}
            soundEnabled={soundEnabled}
            storyProgress={storyProgress[selectedAdventure.id]}
          />
        </motion.div>
      )}

      {gameState === 'story-quiz' && selectedChapter && currentQuestions.length > 0 && (
        <motion.div
          key="story-quiz"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <StoryQuizCard
            question={currentQuestions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentQuestions.length}
            onAnswer={onAnswer}
            character={selectedAdventure?.character}
            chapter={selectedChapter}
            highContrast={highContrast}
            soundEnabled={soundEnabled}
          />
        </motion.div>
      )}

      {gameState === 'chapter-complete' && selectedAdventure && selectedChapter && (
        <motion.div
          key="chapter-complete"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          onAnimationComplete={() => {
            // Mark chapter as complete in backend
            if (userId) {
              handleChapterComplete(
                selectedAdventure.id,
                selectedChapter.id,
                sessionResults.total,
                sessionResults.correct
              )
            }
          }}
        >
          <ChapterCompletion
            chapter={selectedChapter}
            character={selectedAdventure.character}
            sessionResults={sessionResults}
            onContinue={onContinueToNext}
            onBackToStory={onBackToStorySelect}
            highContrast={highContrast}
            soundEnabled={soundEnabled}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StoryModeDisplay