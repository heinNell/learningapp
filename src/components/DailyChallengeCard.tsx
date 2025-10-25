import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Calendar, Target } from 'lucide-react'
import { useVoice } from '../hooks/useVoice'

export interface DailyChallenge {
  id: string
  title: string
  description: string
  targetCount: number
  currentCount: number
  reward: string
  rewardStars: number
  expiresAt: number
  completed: boolean
}

interface DailyChallengeCardProps {
  challenge: DailyChallenge
  onComplete: () => void
  soundEnabled: boolean
  highContrast: boolean
  onDismiss?: () => void
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onComplete,
  soundEnabled,
  highContrast,
  onDismiss
}) => {
  const { speak } = useVoice()
  const [showCelebration, setShowCelebration] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    // Update time remaining
    const updateTimer = () => {
      const now = Date.now()
      const remaining = challenge.expiresAt - now
      
      if (remaining <= 0) {
        setTimeRemaining('Expired')
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [challenge.expiresAt])

  useEffect(() => {
    // Check if challenge just completed
    if (challenge.currentCount >= challenge.targetCount && !challenge.completed) {
      setShowCelebration(true)
      if (soundEnabled) {
        speak(`Amazing! You completed the daily challenge! You earned ${challenge.rewardStars} bonus stars!`)
      }
      setTimeout(() => {
        onComplete()
      }, 3000)
    }
  }, [challenge.currentCount, challenge.targetCount, challenge.completed, soundEnabled, speak, onComplete, challenge.rewardStars])

  const progress = Math.min(100, (challenge.currentCount / challenge.targetCount) * 100)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`mb-6 p-6 rounded-3xl shadow-2xl relative overflow-hidden ${
          highContrast
            ? 'bg-black border-4 border-yellow-400'
            : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20" />
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${
              highContrast
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            ✕
          </button>
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/20 backdrop-blur-sm'
              }`}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Calendar size={32} className={highContrast ? 'text-black' : 'text-white'} />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-2xl font-bold ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  {challenge.title}
                </h3>
                {challenge.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                  >
                    ✓ Completed!
                  </motion.div>
                )}
              </div>
              
              <p className={`text-lg ${
                highContrast ? 'text-white' : 'text-white/90'
              }`}>
                {challenge.description}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm font-medium ${
                highContrast ? 'text-gray-300' : 'text-white/80'
              }`}>
                Progress: {challenge.currentCount} / {challenge.targetCount} quizzes
              </div>
              <div className={`text-sm font-medium ${
                highContrast ? 'text-gray-300' : 'text-white/80'
              }`}>
                {Math.round(progress)}%
              </div>
            </div>

            <div className={`h-4 rounded-full overflow-hidden ${
              highContrast ? 'bg-gray-700' : 'bg-white/20'
            }`}>
              <motion.div
                className={`h-full ${
                  challenge.completed ? 'bg-green-500' :
                  highContrast ? 'bg-yellow-400' : 'bg-white'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                highContrast
                  ? 'bg-gray-800 border-2 border-yellow-400'
                  : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <Trophy className={highContrast ? 'text-yellow-400' : 'text-yellow-300'} size={20} />
                <span className={`font-bold ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  {challenge.reward}
                </span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                highContrast
                  ? 'bg-gray-800 border-2 border-yellow-400'
                  : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <Star className={highContrast ? 'text-yellow-400' : 'text-yellow-300'} size={20} />
                <span className={`font-bold ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  +{challenge.rewardStars} Stars
                </span>
              </div>
            </div>

            <div className={`text-sm ${
              highContrast ? 'text-gray-400' : 'text-white/70'
            }`}>
              <div className="flex items-center gap-2">
                <Target size={16} />
                {timeRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 z-20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: 2 }}
                >
                  🏆
                </motion.div>
                <div className="text-4xl font-bold text-white mb-2">
                  Challenge Complete!
                </div>
                <div className="text-2xl text-white/90">
                  +{challenge.rewardStars} Bonus Stars! ⭐
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
