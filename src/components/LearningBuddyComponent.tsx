
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LearningBuddy, BuddyResponse, generateBuddyResponse, updateBuddyFromPerformance } from '../data/learningBuddyData'
import { useVoice } from '../hooks/useVoice'

interface LearningBuddyComponentProps {
  buddy: LearningBuddy
  onBuddyUpdate: (updatedBuddy: LearningBuddy) => void
  context: 'idle' | 'correct' | 'incorrect' | 'greeting' | 'goodbye' | 'encouragement' | 'rest'
  performanceData?: {
    streak: number
    accuracy: number
    timeSpent: number
    category: string
  }
  soundEnabled: boolean
  highContrast: boolean
}

export const LearningBuddyComponent: React.FC<LearningBuddyComponentProps> = ({
  buddy,
  onBuddyUpdate,
  context,
  performanceData,
  soundEnabled,
  highContrast
}) => {
  const { speak } = useVoice()
  const [currentResponse, setCurrentResponse] = useState<BuddyResponse | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [buddyState, setBuddyState] = useState<'active' | 'sleeping' | 'thinking' | 'celebrating'>('active')
  const [lastInteraction, setLastInteraction] = useState<Date>(new Date())

  // Generate response based on context
  const generateResponse = useCallback(() => {
    const response = generateBuddyResponse(buddy, context, performanceData)
    setCurrentResponse(response)
    
    // Only speak if not idle and sound enabled
    if (soundEnabled && response.text && context !== 'idle') {
      // Use less excited voice for buddy to not compete with main narration
      speak(response.text, { isExcited: false })
    }

    // Update buddy state based on response
    if (response.animation === 'sleep') {
      setBuddyState('sleeping')
    } else if (response.animation === 'think') {
      setBuddyState('thinking')
    } else if (response.animation === 'dance' || response.animation === 'cheer') {
      setBuddyState('celebrating')
    } else {
      setBuddyState('active')
    }

    setLastInteraction(new Date())
  }, [buddy, context, performanceData, soundEnabled, speak])

  // Generate response when context changes (with delay to prevent overlap)
  useEffect(() => {
    if (context !== 'idle') {
      // Delay buddy response to not overlap with main narration
      const timer = setTimeout(() => {
        generateResponse()
      }, 1500) // Wait 1.5s for main narration to finish
      return () => clearTimeout(timer)
    }
  }, [context, generateResponse])

  // Update buddy based on performance
  useEffect(() => {
    if (performanceData && (context === 'correct' || context === 'incorrect')) {
      const updatedBuddy = updateBuddyFromPerformance(buddy, {
        correct: context === 'correct',
        category: performanceData.category,
        timeSpent: performanceData.timeSpent,
        difficulty: 'medium'
      })
      onBuddyUpdate(updatedBuddy)
    }
  }, [performanceData, context, buddy, onBuddyUpdate])

  // Auto-sleep after inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const now = new Date()
      const timeSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / 1000 / 60
      
      if (timeSinceLastInteraction > 5 && buddyState !== 'sleeping') {
        setBuddyState('sleeping')
        setCurrentResponse({
          type: 'rest',
          text: "I'll just rest here while you think... 😴",
          animation: 'sleep',
          emotion: 'sleepy',
          voiceTone: 'gentle'
        })
      }
    }

    const interval = setInterval(checkInactivity, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [lastInteraction, buddyState])

  const getAnimationVariants = () => {
    const baseVariants = {
      idle: {
        y: [0, -5, 0],
        rotate: [0, 2, -2, 0],
        scale: 1,
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      },
      bounce: {
        y: [0, -20, 0],
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.6,
          repeat: 2
        }
      },
      dance: {
        rotate: [0, 10, -10, 10, -10, 0],
        scale: [1, 1.2, 1.1, 1.2, 1],
        y: [0, -10, -5, -10, 0],
        transition: {
          duration: 1.5,
          repeat: 1
        }
      },
      spin: {
        rotate: [0, 360],
        scale: [1, 1.3, 1],
        transition: {
          duration: 1,
          repeat: 1
        }
      },
      sleep: {
        y: [0, 3, 0],
        opacity: [1, 0.7, 1],
        scale: 0.9,
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      },
      think: {
        rotate: [0, 5, -5, 0],
        y: [0, -3, 0],
        transition: {
          duration: 1,
          repeat: 3
        }
      },
      cheer: {
        y: [0, -25, -10, -25, 0],
        rotate: [0, 15, -15, 15, 0],
        scale: [1, 1.2, 1.1, 1.2, 1],
        transition: {
          duration: 2,
          repeat: 1
        }
      }
    }

    return baseVariants
  }

  const getBuddyMood = () => {
    const moodEmojis = {
      happy: '😊',
      excited: '🤩',
      sleepy: '😴',
      curious: '🤔',
      proud: '😌'
    }
    return moodEmojis[buddy.mood] || '😊'
  }

  const getBuddyLevelDisplay = () => {
    const stars = '⭐'.repeat(Math.min(buddy.level, 5))
    return stars
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 100 }}
            className="relative"
          >
            {/* Speech Bubble */}
            <AnimatePresence>
              {currentResponse && currentResponse.text && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  className={`absolute bottom-full right-0 mb-4 max-w-xs p-4 rounded-2xl shadow-lg ${
                    highContrast 
                      ? 'bg-black border-2 border-yellow-400 text-white' 
                      : 'bg-white text-gray-800 border-2 border-purple-200'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {currentResponse.text}
                  </div>
                  {/* Speech bubble tail */}
                  <div className={`absolute top-full right-4 w-0 h-0 ${
                    highContrast 
                      ? 'border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-400' 
                      : 'border-l-8 border-r-8 border-t-8 border-transparent border-t-purple-200'
                  }`} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buddy Character */}
            <motion.div
              className={`relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer ${
                highContrast 
                  ? 'bg-black border-4 border-yellow-400' 
                  : 'bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg'
              }`}
              variants={getAnimationVariants()}
              animate={currentResponse?.animation || 'idle'}
              onClick={() => {
                generateResponse()
                setLastInteraction(new Date())
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Main Avatar */}
              <div className="text-4xl relative">
                {buddy.avatar}
                
                {/* Mood indicator */}
                <div className="absolute -top-1 -right-1 text-lg">
                  {getBuddyMood()}
                </div>
                
                {/* Sleep indicator */}
                {buddyState === 'sleeping' && (
                  <motion.div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-lg"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    💤
                  </motion.div>
                )}
              </div>

              {/* Level indicator */}
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs ${
                highContrast ? 'text-yellow-400' : 'text-white'
              }`}>
                {getBuddyLevelDisplay()}
              </div>

              {/* Experience bar */}
              <div className={`absolute -bottom-1 left-0 right-0 h-1 rounded-full overflow-hidden ${
                highContrast ? 'bg-gray-700' : 'bg-white/30'
              }`}>
                <motion.div
                  className={`h-full ${
                    highContrast ? 'bg-yellow-400' : 'bg-white'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(buddy.experience / (buddy.level * 100)) * 100}%` 
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
            </motion.div>

            {/* Buddy stats tooltip */}
            <motion.div
              className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 rounded-lg text-xs opacity-0 pointer-events-none ${
                highContrast 
                  ? 'bg-black border border-yellow-400 text-white' 
                  : 'bg-white text-gray-700 shadow-lg'
              }`}
              whileHover={{ opacity: 1 }}
            >
              <div>Level {buddy.level}</div>
              <div>Trust: {buddy.relationships.trustLevel}%</div>
              <div>Bond: {buddy.relationships.learningBond}%</div>
              <div>{buddy.memories.totalSessions} sessions</div>
            </motion.div>

            {/* Floating particles for celebrations */}
            <AnimatePresence>
              {buddyState === 'celebrating' && (
                <>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className="absolute text-2xl pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                      initial={{ 
                        opacity: 1, 
                        scale: 0,
                        x: 0,
                        y: 0
                      }}
                      animate={{ 
                        opacity: 0,
                        scale: 1,
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                      }}
                      transition={{ 
                        duration: 2,
                        delay: index * 0.1
                      }}
                    >
                      {['✨', '🌟', '⭐', '💫', '🎉', '🎊', '🌈', '💖'][index]}
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Hide/Show toggle */}
            <button
              onClick={() => setIsVisible(false)}
              className={`absolute -top-2 -left-2 w-6 h-6 rounded-full text-xs ${
                highContrast 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show buddy button when hidden */}
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsVisible(true)}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            highContrast 
              ? 'bg-black border-2 border-yellow-400 text-yellow-400' 
              : 'bg-purple-500 text-white shadow-lg'
          }`}
        >
          {buddy.avatar}
        </motion.button>
      )}
    </div>
  )
}
