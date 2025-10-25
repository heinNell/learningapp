import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { CategoryCard } from './components/CategoryCard'
import { QuizCard } from './components/QuizCard'
import { StoryQuizCard } from './components/StoryQuizCard'
import { ProgressBar } from './components/ProgressBar'
import { ParentalMenu } from './components/ParentalMenu'
import { CelebrationEffect } from './components/CelebrationEffect'
import { StoryModeSelector } from './components/StoryModeSelector'
import { StoryIntroduction } from './components/StoryIntroduction'
import { ChapterCompletion } from './components/ChapterCompletion'
import { AuthenticationWrapper } from './components/AuthenticationWrapper'
import { categories, quizData, QuizQuestion } from './data/quizData'
import { Adventure, StoryChapter } from './data/storyData'
import { useAuth } from './hooks/useAuth'
import { useSupabaseProgress } from './hooks/useSupabaseProgress'
import { useStoryProgressSync } from './hooks/useStoryProgressSync'
import { useVoice } from './hooks/useVoice'
import { enhancedStoryService } from './services/storyService'
import { LearningBuddyComponent } from './components/LearningBuddyComponent'
import { LearningBuddy, defaultBuddies } from './data/learningBuddyData'
import { FamilyModeSelector } from './components/FamilyModeSelector'
import { FamilySession } from './data/familyModeData'
import { adaptiveLearningEngine } from './data/adaptiveLearningData'
import { DailyChallengeCard, DailyChallenge } from './components/DailyChallengeCard'
import { soundEffectManager } from './utils/soundEffects'

interface Settings {
  difficulty: 'beginner' | 'advanced'
  sound_enabled: boolean
  high_contrast: boolean
  categories_enabled: Record<string, boolean>
}

type GameState = 'menu' | 'story-select' | 'story-intro' | 'quiz' | 'story-quiz' | 'results' | 'chapter-complete' | 'family-mode-setup' | 'family-session'
type CelebrationType = 'correct' | 'badge' | 'level' | null

function App() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null)
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0
  })
  
  const [settings, setSettings] = useState<Settings>({
    difficulty: 'beginner',
    sound_enabled: true,
    high_contrast: false,
    categories_enabled: {
      animals: true,
      fruits: true,
      shapes: true,
      colors: true,
      sounds: true
    }
  })

  const [showParentalMenu, setShowParentalMenu] = useState(false)
  const [parentalHoldTimer, setParentalHoldTimer] = useState<number | null>(null)
  const [celebration, setCelebration] = useState<CelebrationType>(null)
  const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Learning Buddy State
  const [selectedBuddy, setSelectedBuddy] = useState<LearningBuddy>(() => {
    const savedBuddy = localStorage.getItem('selected_buddy')
    return savedBuddy ? JSON.parse(savedBuddy) : defaultBuddies[0]
  })
  const [buddyContext, setBuddyContext] = useState<'idle' | 'correct' | 'incorrect' | 'greeting' | 'goodbye' | 'encouragement' | 'rest'>('idle')

  // Family Mode State
  const [familySession, setFamilySession] = useState<FamilySession | null>(null)

  // Adaptive Learning State
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date())
  const [questionStartTimes, setQuestionStartTimes] = useState<Date[]>([])
  const [questionResults, setQuestionResults] = useState<Array<{
    id: string
    correct: boolean
    timeSpent: number
    difficulty: number
  }>>([])

  // Daily Challenge State
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [showDailyChallenge, setShowDailyChallenge] = useState(true)

  // Hooks
  const { user, isAuthenticated } = useAuth()
  const { progress, updateProgress, saveQuizResult, resetProgress, loading: progressLoading } = useSupabaseProgress()
  const { getCurrentChapter, updateAdventureProgress } = useStoryProgressSync()
  const { speak } = useVoice()

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('quiz_settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save buddy to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selected_buddy', JSON.stringify(selectedBuddy))
  }, [selectedBuddy])

  // Initialize or load daily challenge
  useEffect(() => {
    const today = new Date().toDateString()
    const savedChallengeData = localStorage.getItem('daily_challenge')
    const lastChallengeDate = localStorage.getItem('last_challenge_date')

    if (lastChallengeDate === today && savedChallengeData) {
      // Load existing challenge
      setDailyChallenge(JSON.parse(savedChallengeData))
    } else {
      // Generate new daily challenge
      const newChallenge = generateDailyChallenge()
      setDailyChallenge(newChallenge)
      localStorage.setItem('daily_challenge', JSON.stringify(newChallenge))
      localStorage.setItem('last_challenge_date', today)
    }
  }, [])

  // Save daily challenge when it changes
  useEffect(() => {
    if (dailyChallenge) {
      localStorage.setItem('daily_challenge', JSON.stringify(dailyChallenge))
    }
  }, [dailyChallenge])

  const generateDailyChallenge = (): DailyChallenge => {
    const challenges = [
      {
        title: '🌟 Daily Learning Star',
        description: 'Complete 5 quizzes today!',
        targetCount: 5,
        reward: 'Daily Star Badge',
        rewardStars: 10
      },
      {
        title: '🎯 Quiz Master Challenge',
        description: 'Answer 3 quizzes perfectly today!',
        targetCount: 3,
        reward: 'Perfect Day Badge',
        rewardStars: 15
      },
      {
        title: '🚀 Learning Streak',
        description: 'Complete 7 quizzes today!',
        targetCount: 7,
        reward: 'Super Learner Badge',
        rewardStars: 20
      },
      {
        title: '🌈 Category Explorer',
        description: 'Try all 5 categories today!',
        targetCount: 5,
        reward: 'Explorer Badge',
        rewardStars: 12
      }
    ]

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    return {
      id: `daily_${Date.now()}`,
      ...randomChallenge,
      currentCount: 0,
      expiresAt: endOfDay.getTime(),
      completed: false
    }
  }

  const updateDailyChallengeProgress = () => {
    if (dailyChallenge && !dailyChallenge.completed) {
      const updatedChallenge = {
        ...dailyChallenge,
        currentCount: dailyChallenge.currentCount + 1
      }
      
      // Check if challenge is now complete
      if (updatedChallenge.currentCount >= updatedChallenge.targetCount) {
        updatedChallenge.completed = true
        // Award bonus stars
        updateProgress(true, selectedCategory || undefined).then(() => {
          // Add bonus stars with animation delay
          for (let i = 0; i < updatedChallenge.rewardStars; i++) {
            setTimeout(() => {
              updateProgress(true, selectedCategory || undefined)
            }, i * 100)
          }
        })
      }
      
      setDailyChallenge(updatedChallenge)
    }
  }

  const handleDailyChallengeComplete = () => {
    if (settings.sound_enabled) {
      speak('Congratulations! You earned your daily reward!')
    }
  }

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem('quiz_settings', JSON.stringify(newSettings))
  }, [])

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  // Sync sound effect manager with settings
  useEffect(() => {
    soundEffectManager.setEnabled(settings.sound_enabled)
  }, [settings.sound_enabled])

  // Welcome message
  useEffect(() => {
    if (settings.sound_enabled && gameState === 'menu') {
      setBuddyContext('greeting')
      const timer = setTimeout(() => {
        speak('Welcome to Kids Quiz Adventure! Choose between quick quiz or story mode!', { isExcited: true })
        setTimeout(() => setBuddyContext('idle'), 3000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState, settings.sound_enabled, speak])

  const startQuiz = (categoryId: string) => {
    const categoryQuestions = quizData.filter(q => q.category === categoryId)
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, Math.min(10, shuffled.length))
    
    setSelectedCategory(categoryId)
    setCurrentQuestions(selectedQuestions)
    setCurrentQuestionIndex(0)
    setSessionResults({ correct: 0, total: 0 })
    setGameState('quiz')

    // Reset adaptive learning session tracking
    setSessionStartTime(new Date())
    setQuestionStartTimes([new Date()])
    setQuestionResults([])

    if (settings.sound_enabled) {
      const categoryName = categories.find(c => c.id === categoryId)?.name || 'quiz'
      speak(`Let's start the ${categoryName} quiz! Get ready!`, { isExcited: true })
    }
  }

  const startStoryAdventure = async (adventureId: string) => {
    try {
      // Get adventure using enhanced service
      const adventure = await enhancedStoryService.getAdventureByCategory(adventureId)
      if (adventure) {
        setSelectedAdventure(adventure)
        setSelectedCategory(adventure.categoryId)
        setGameState('story-intro')
      }
    } catch (error) {
      console.error('Error starting story adventure:', error)
      toast.error('Failed to load story adventure')
    }
  }

  const startStoryChapter = async (chapterId: string) => {
    if (!selectedAdventure) return
    
    const chapter = selectedAdventure.chapters.find(c => c.id === chapterId)
    if (!chapter) return

    setSelectedChapter(chapter)
    
    // Get questions for this chapter
    const categoryQuestions = quizData.filter(q => q.category === selectedAdventure.categoryId)
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, chapter.questionsNeeded)
    
    setCurrentQuestions(selectedQuestions)
    setCurrentQuestionIndex(0)
    setSessionResults({ correct: 0, total: 0 })
    setGameState('story-quiz')

    if (settings.sound_enabled) {
      speak(`Beginning ${chapter.title}! Let's explore together!`, { isExcited: true })
    }
  }

  const handleAnswer = async (isCorrect: boolean, selectedAnswer: string) => {
    const currentQuestion = currentQuestions[currentQuestionIndex]
    const newSessionResults = {
      ...sessionResults,
      correct: sessionResults.correct + (isCorrect ? 1 : 0),
      total: sessionResults.total + 1
    }
    setSessionResults(newSessionResults)

    // Track response time for adaptive learning
    const questionEndTime = new Date()
    const questionStartTime = questionStartTimes[currentQuestionIndex] || new Date()
    const timeSpent = (questionEndTime.getTime() - questionStartTime.getTime()) / 1000

    // Record question result for adaptive learning
    const questionResult = {
      id: currentQuestion.id,
      correct: isCorrect,
      timeSpent,
      difficulty: settings.difficulty === 'beginner' ? 0.5 : 0.8
    }
    setQuestionResults([...questionResults, questionResult])

    // Update buddy context based on answer
    setBuddyContext(isCorrect ? 'correct' : 'incorrect')
    setTimeout(() => setBuddyContext('idle'), 3000)

    // Save quiz result to database
    if (selectedCategory && currentQuestion) {
      await saveQuizResult({
        category: selectedCategory,
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        responseTimeMs: 0, // Could be tracked with a timer
        difficulty: settings.difficulty,
        sessionId
      })
    }

    // Update global progress
    const oldBadges = progress.badges
    const oldLevel = progress.level
    
    const newProgress = await updateProgress(isCorrect, selectedCategory || undefined)

    // Check for achievements with sound effects
    if (isCorrect) {
      setCelebration('correct')
      soundEffectManager.playCorrectAnswerCelebration()
      
      // Check for badge achievement
      if (newProgress.badges > oldBadges) {
        setTimeout(() => {
          setCelebration('badge')
          soundEffectManager.playBadgeCelebration()
        }, 1500)
      }
      
      // Check for level achievement
      if (newProgress.level > oldLevel) {
        setTimeout(() => {
          setCelebration('level')
          soundEffectManager.playLevelUpCelebration()
        }, 3000)
      }
    }

    // Move to next question or show results
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        // Track start time for next question
        setQuestionStartTimes([...questionStartTimes, new Date()])
      } else {
        // Analyze session with adaptive learning engine
        if (user && selectedCategory) {
          try {
            const currentHour = new Date().getHours()
            const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening'
            
            const allQuestionResults = [...questionResults, questionResult]
            
            const sessionData = {
              category: selectedCategory,
              questions: allQuestionResults,
              sessionStart: sessionStartTime,
              sessionEnd: new Date()
            }

            // Analyze performance and get metrics
            const metrics = adaptiveLearningEngine.analyzePerformance(user.id || 'guest', sessionData)
            
            // Update learning pattern
            adaptiveLearningEngine.updateLearningPattern(user.id || 'guest', {
              category: selectedCategory,
              performance: metrics,
              timeOfDay,
              mistakes: allQuestionResults
                .filter(q => !q.correct)
                .map(q => {
                  const question = currentQuestions.find(cq => cq.id === q.id)
                  return {
                    questionId: q.id,
                    selectedAnswer: '',
                    correctAnswer: question?.correctAnswer || ''
                  }
                })
            })

            // Get personalized encouragement
            const encouragement = adaptiveLearningEngine.getPersonalizedEncouragement(
              user.id || 'guest',
              metrics
            )
            
            // Show recommendation if high priority
            const recommendations = adaptiveLearningEngine.generateRecommendations(user.id || 'guest', metrics)
            if (recommendations.length > 0 && recommendations[0].priority === 'high') {
              setTimeout(() => {
                toast(encouragement, { duration: 4000, icon: '🎯' })
              }, 3000)
            }
          } catch (error) {
            console.error('Error analyzing adaptive learning:', error)
          }
        }
        // Update story progress if in story mode
        if (gameState === 'story-quiz' && selectedAdventure && selectedChapter) {
          updateAdventureProgress(selectedAdventure.id, selectedChapter.id, newSessionResults)
        }
        
        // Update daily challenge progress
        updateDailyChallengeProgress()

        // Determine which results screen to show
        if (gameState === 'story-quiz') {
          setGameState('chapter-complete')
        } else {
          setGameState('results')
        }
        
        // Results narration with enthusiasm
        if (settings.sound_enabled) {
          const percentage = Math.round((newSessionResults.correct / newSessionResults.total) * 100)
          if (percentage >= 80) {
            speak(`WOW! FANTASTIC! You got ${newSessionResults.correct} out of ${newSessionResults.total} correct! That's ${percentage} percent! You're AMAZING!`, { isExcited: true })
            soundEffectManager.play('success', 0.8)
          } else if (percentage >= 60) {
            speak(`GREAT job! You got ${newSessionResults.correct} out of ${newSessionResults.total} correct! Keep up the WONDERFUL work!`, { isExcited: true })
            soundEffectManager.play('applause', 0.6)
          } else {
            speak(`Nice try! You got ${newSessionResults.correct} out of ${newSessionResults.total}. Every answer helps you learn! Let's try again!`, { isExcited: false })
          }
        }
      }
    }, 2000)
  }

  const handleParentalMenuAccess = () => {
    const timer = setTimeout(() => {
      setShowParentalMenu(true)
      setParentalHoldTimer(null)
    }, 3000) as unknown as number
    setParentalHoldTimer(timer)
  }

  const handleParentalMenuCancel = () => {
    if (parentalHoldTimer) {
      clearTimeout(parentalHoldTimer)
      setParentalHoldTimer(null)
    }
  }

  const resetGame = () => {
    setGameState('menu')
    setSelectedCategory(null)
    setSelectedAdventure(null)
    setSelectedChapter(null)
    setCurrentQuestions([])
    setCurrentQuestionIndex(0)
    setSessionResults({ correct: 0, total: 0 })
    setFamilySession(null)
  }

  const handleStartFamilySession = (session: FamilySession) => {
    setFamilySession(session)
    setSelectedCategory(session.category === 'mixed' ? 'animals' : session.category)
    
    // Get questions based on session preferences
    const categoryQuestions = session.category === 'mixed' 
      ? quizData 
      : quizData.filter(q => q.category === session.category)
    
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, 10)
    
    setCurrentQuestions(selectedQuestions)
    setCurrentQuestionIndex(0)
    setSessionResults({ correct: 0, total: 0 })
    setGameState('family-session')

    if (settings.sound_enabled) {
      speak('Let\'s start our family learning adventure together! Everyone ready? Let\'s GO!', { isExcited: true })
    }
  }

  const continueToNextChapter = async () => {
    if (!selectedAdventure) return
    
    try {
      const nextChapter = await getCurrentChapter(selectedAdventure, progress.stars)
      
      if (nextChapter && nextChapter.id !== selectedChapter?.id) {
        startStoryChapter(nextChapter.id)
      } else {
        setGameState('story-intro')
      }
    } catch (error) {
      console.error('Error getting next chapter:', error)
      setGameState('story-intro')
    }
  }

  if (progressLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        settings.high_contrast ? 'bg-black text-white' : 'bg-gradient-to-br from-purple-400 via-pink-400 to-red-400'
      }`}>
        <div className="text-4xl font-bold">Loading... 🎮</div>
      </div>
    )
  }

  return (
    <AuthenticationWrapper showUserInfo={isAuthenticated}>
      <div className={`min-h-screen transition-all duration-500 ${
        settings.high_contrast 
          ? 'bg-black text-white' 
          : 'bg-gradient-to-br from-purple-400 via-pink-400 to-red-400'
      }`}>
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="text-6xl">🎮</div>
            <div>
              <h1 className={`text-4xl font-bold ${
                settings.high_contrast ? 'text-yellow-400' : 'text-white'
              }`}>
                Kids Quiz Adventure
              </h1>
              <p className={`text-lg ${
                settings.high_contrast ? 'text-white' : 'text-white/80'
              }`}>
                Learn and have fun!
              </p>
            </div>
          </motion.div>

          {/* Parental Menu Access */}
          <motion.button
            className={`w-12 h-12 rounded-full ${
              settings.high_contrast 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white/20 text-white'
            } flex items-center justify-center text-2xl`}
            onMouseDown={handleParentalMenuAccess}
            onMouseUp={handleParentalMenuCancel}
            onTouchStart={handleParentalMenuAccess}
            onTouchEnd={handleParentalMenuCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Hold for 3 seconds to access parental menu"
          >
            ⚙️
          </motion.button>
        </header>

        {/* Progress Bar */}
        <div className="px-6 mb-6">
          <ProgressBar progress={progress} highContrast={settings.high_contrast} />
        </div>

        {/* Daily Challenge */}
        {dailyChallenge && showDailyChallenge && !dailyChallenge.completed && gameState === 'menu' && (
          <div className="px-6 mb-6">
            <DailyChallengeCard
              challenge={dailyChallenge}
              onComplete={handleDailyChallengeComplete}
              soundEnabled={settings.sound_enabled}
              highContrast={settings.high_contrast}
              onDismiss={() => setShowDailyChallenge(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {gameState === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-8">
                  <motion.h2
                    className={`text-5xl font-bold mb-4 ${
                      settings.high_contrast ? 'text-yellow-400' : 'text-white'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Choose Your Adventure!
                  </motion.h2>
                  <motion.p
                    className={`text-xl ${
                      settings.high_contrast ? 'text-white' : 'text-white/90'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Quick quiz or immersive story mode?
                  </motion.p>
                </div>

                {/* Mode Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <motion.button
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setGameState('story-select')}
                    className={`p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 ${
                      settings.high_contrast 
                        ? 'bg-black border-4 border-yellow-400 hover:bg-yellow-400/10' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    <div className="text-8xl mb-4">📚</div>
                    <h3 className={`text-3xl font-bold mb-4 ${
                      settings.high_contrast ? 'text-yellow-400' : 'text-white'
                    }`}>
                      Story Mode
                    </h3>
                    <p className={`text-lg ${
                      settings.high_contrast ? 'text-white' : 'text-white/90'
                    }`}>
                      Join character companions on magical learning adventures!
                    </p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => {
                      // Show categories for quick quiz
                      setGameState('menu')
                      // Scroll to categories
                      setTimeout(() => {
                        const categoriesElement = document.getElementById('categories')
                        categoriesElement?.scrollIntoView({ behavior: 'smooth' })
                      }, 100)
                    }}
                    className={`p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 ${
                      settings.high_contrast 
                        ? 'bg-black border-4 border-yellow-400 hover:bg-yellow-400/10' 
                        : 'bg-gradient-to-br from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
                    }`}
                  >
                    <div className="text-8xl mb-4">⚡</div>
                    <h3 className={`text-3xl font-bold mb-4 ${
                      settings.high_contrast ? 'text-yellow-400' : 'text-white'
                    }`}>
                      Quick Quiz
                    </h3>
                    <p className={`text-lg ${
                      settings.high_contrast ? 'text-white' : 'text-white/90'
                    }`}>
                      Jump straight into fun learning challenges!
                    </p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    onClick={() => setGameState('family-mode-setup')}
                    className={`p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 ${
                      settings.high_contrast 
                        ? 'bg-black border-4 border-yellow-400 hover:bg-yellow-400/10' 
                        : 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    }`}
                  >
                    <div className="text-8xl mb-4">👨‍👩‍👧‍👦</div>
                    <h3 className={`text-3xl font-bold mb-4 ${
                      settings.high_contrast ? 'text-yellow-400' : 'text-white'
                    }`}>
                      Family Mode
                    </h3>
                    <p className={`text-lg ${
                      settings.high_contrast ? 'text-white' : 'text-white/90'
                    }`}>
                      Learn together as a family with collaborative games!
                    </p>
                  </motion.button>
                </div>

                {/* Quick Quiz Categories */}
                <div id="categories">
                  <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${
                      settings.high_contrast ? 'text-yellow-400' : 'text-white'
                    }`}>
                      Quick Quiz Categories
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 + index * 0.1 }}
                      >
                        <CategoryCard
                          category={category}
                          onClick={() => startQuiz(category.id)}
                          disabled={!settings.categories_enabled[category.id]}
                          highContrast={settings.high_contrast}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === 'story-select' && (
              <motion.div
                key="story-select"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <div className="mb-6 flex justify-center">
                  <button
                    onClick={resetGame}
                    className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
                      settings.high_contrast 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    ← Back to Main Menu
                  </button>
                </div>
                <StoryModeSelector
                  progress={progress}
                  onSelectAdventure={startStoryAdventure}
                  highContrast={settings.high_contrast}
                />
              </motion.div>
            )}

            {gameState === 'story-intro' && selectedAdventure && (
              <motion.div
                key="story-intro"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <StoryIntroduction
                  adventure={selectedAdventure}
                  progress={progress}
                  onStartChapter={startStoryChapter}
                  onBack={() => setGameState('story-select')}
                  soundEnabled={settings.sound_enabled}
                  highContrast={settings.high_contrast}
                />
              </motion.div>
            )}

            {gameState === 'quiz' && currentQuestions[currentQuestionIndex] && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <div className="text-center mb-6">
                  <div className={`text-2xl font-bold ${
                    settings.high_contrast ? 'text-yellow-400' : 'text-white'
                  }`}>
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </div>
                  <div className={`w-full h-2 ${
                    settings.high_contrast ? 'bg-gray-700' : 'bg-white/20'
                  } rounded-full mt-2 overflow-hidden`}>
                    <motion.div
                      className={`h-full ${
                        settings.high_contrast ? 'bg-yellow-400' : 'bg-white'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <QuizCard
                  question={currentQuestions[currentQuestionIndex]}
                  onAnswer={handleAnswer}
                  difficulty={settings.difficulty}
                  soundEnabled={settings.sound_enabled}
                  highContrast={settings.high_contrast}
                />
              </motion.div>
            )}

            {gameState === 'story-quiz' && selectedAdventure && selectedChapter && currentQuestions[currentQuestionIndex] && (
              <motion.div
                key="story-quiz"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <StoryQuizCard
                  question={currentQuestions[currentQuestionIndex]}
                  adventure={selectedAdventure}
                  chapter={selectedChapter}
                  onAnswer={handleAnswer}
                  difficulty={settings.difficulty}
                  soundEnabled={settings.sound_enabled}
                  highContrast={settings.high_contrast}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={selectedChapter.questionsNeeded}
                />
              </motion.div>
            )}

            {gameState === 'chapter-complete' && selectedAdventure && selectedChapter && (
              <motion.div
                key="chapter-complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ChapterCompletion
                  adventure={selectedAdventure}
                  completedChapter={selectedChapter}
                  progress={progress}
                  score={sessionResults}
                  onContinue={continueToNextChapter}
                  onReturnToStory={() => setGameState('story-intro')}
                  soundEnabled={settings.sound_enabled}
                  highContrast={settings.high_contrast}
                />
              </motion.div>
            )}

            {gameState === 'family-mode-setup' && (
              <motion.div
                key="family-mode-setup"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <FamilyModeSelector
                  onStartFamilySession={handleStartFamilySession}
                  soundEnabled={settings.sound_enabled}
                  highContrast={settings.high_contrast}
                />
                <div className="text-center mt-8">
                  <button
                    onClick={resetGame}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                      settings.high_contrast
                        ? 'bg-white/20 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    ← Back to Main Menu
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'family-session' && familySession && currentQuestions[currentQuestionIndex] && (
              <motion.div
                key="family-session"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-center mb-6">
                  <div className={`text-3xl font-bold mb-2 ${
                    settings.high_contrast ? 'text-yellow-400' : 'text-white'
                  }`}>
                    👨‍👩‍👧‍👦 Family Learning Time
                  </div>
                  <div className={`text-xl mb-4 ${
                    settings.high_contrast ? 'text-white' : 'text-white/90'
                  }`}>
                    {familySession.participants.length} family members • {familySession.type.replace('-', ' ')}
                  </div>
                  <div className={`text-2xl font-bold ${
                    settings.high_contrast ? 'text-yellow-400' : 'text-white'
                  }`}>
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </div>
                  <div className={`w-full h-2 ${
                    settings.high_contrast ? 'bg-gray-700' : 'bg-white/20'
                  } rounded-full mt-2 overflow-hidden`}>
                    <motion.div
                      className={`h-full ${
                        settings.high_contrast ? 'bg-yellow-400' : 'bg-white'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <QuizCard
                  question={currentQuestions[currentQuestionIndex]}
                  onAnswer={handleAnswer}
                  difficulty={settings.difficulty}
                  soundEnabled={settings.sound_enabled}
                  highContrast={settings.high_contrast}
                />
              </motion.div>
            )}

            {gameState === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="max-w-2xl mx-auto text-center"
              >
                <motion.div
                  className={`p-12 rounded-3xl shadow-2xl ${
                    settings.high_contrast 
                      ? 'bg-black border-4 border-yellow-400' 
                      : 'bg-white'
                  }`}
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-8xl mb-6">
                    {sessionResults.correct / sessionResults.total >= 0.8 ? '🏆' : 
                     sessionResults.correct / sessionResults.total >= 0.6 ? '🌟' : '💪'}
                  </div>
                  
                  <h2 className={`text-4xl font-bold mb-4 ${
                    settings.high_contrast ? 'text-yellow-400' : 'text-gray-800'
                  }`}>
                    {sessionResults.correct / sessionResults.total >= 0.8 ? 'Fantastic!' : 
                     sessionResults.correct / sessionResults.total >= 0.6 ? 'Good Job!' : 'Nice Try!'}
                  </h2>
                  
                  <div className={`text-2xl mb-8 ${
                    settings.high_contrast ? 'text-white' : 'text-gray-600'
                  }`}>
                    You got <span className="font-bold text-green-600">
                      {sessionResults.correct}
                    </span> out of <span className="font-bold">
                      {sessionResults.total}
                    </span> correct!
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => selectedCategory && startQuiz(selectedCategory)}
                      className={`flex-1 p-4 rounded-2xl font-bold text-xl transition-all ${
                        settings.high_contrast 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={resetGame}
                      className={`flex-1 p-4 rounded-2xl font-bold text-xl transition-all ${
                        settings.high_contrast 
                          ? 'bg-white text-black hover:bg-gray-200' 
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      Main Menu
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Parental Menu */}
        <ParentalMenu
          isOpen={showParentalMenu}
          onClose={() => setShowParentalMenu(false)}
          settings={settings}
          onUpdateSettings={saveSettings}
          onResetProgress={resetProgress}
        />

        {/* Celebration Effects */}
        <CelebrationEffect
          show={celebration !== null}
          type={celebration || 'correct'}
          onComplete={() => setCelebration(null)}
        />

        {/* Learning Buddy */}
        <LearningBuddyComponent
          buddy={selectedBuddy}
          onBuddyUpdate={(updatedBuddy) => setSelectedBuddy(updatedBuddy)}
          context={buddyContext}
          performanceData={{
            streak: sessionResults.correct,
            accuracy: sessionResults.total > 0 ? sessionResults.correct / sessionResults.total : 0,
            timeSpent: 0,
            category: selectedCategory || ''
          }}
          soundEnabled={settings.sound_enabled}
          highContrast={settings.high_contrast}
        />

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: settings.high_contrast ? '#000' : '#fff',
              color: settings.high_contrast ? '#fff' : '#000',
              border: settings.high_contrast ? '2px solid #ffd700' : 'none',
              fontSize: '18px',
              fontWeight: 'bold'
            }
          }}
        />
      </div>
    </AuthenticationWrapper>
  )
}

export default App
