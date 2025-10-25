
import React from 'react'
import { motion } from 'framer-motion'
import { UserProgress } from '../hooks/useProgress'

interface ProgressBarProps {
  progress: UserProgress
  highContrast?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  highContrast = false 
}) => {
  const starsToNextBadge = 10 - (progress.stars % 10)
  const starsToNextLevel = 50 - (progress.stars % 50)

  return (
    <div className={`p-6 rounded-2xl ${
      highContrast 
        ? 'bg-black border-4 border-yellow-400' 
        : 'bg-gradient-to-r from-purple-500 to-pink-500'
    } shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-2xl font-bold ${
          highContrast ? 'text-yellow-400' : 'text-white'
        }`}>
          Your Progress
        </h3>
        <div className={`text-lg ${
          highContrast ? 'text-white' : 'text-white/80'
        }`}>
          Level {progress.level}
        </div>
      </div>

      {/* Stars */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⭐</span>
          <span className={`text-xl font-bold ${
            highContrast ? 'text-white' : 'text-white'
          }`}>
            {progress.stars} Stars
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: Math.min(progress.stars, 20) }).map((_, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
            >
              ⭐
            </motion.span>
          ))}
          {progress.stars > 20 && (
            <span className={`text-lg ${
              highContrast ? 'text-yellow-400' : 'text-white'
            }`}>
              +{progress.stars - 20} more!
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🏆</span>
          <span className={`text-xl font-bold ${
            highContrast ? 'text-white' : 'text-white'
          }`}>
            {progress.badges} Badges
          </span>
          {starsToNextBadge > 0 && (
            <span className={`text-sm ${
              highContrast ? 'text-yellow-400' : 'text-white/80'
            }`}>
              ({starsToNextBadge} stars to next!)
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(progress.badges, 10) }).map((_, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.2, type: 'spring' }}
            >
              🏆
            </motion.span>
          ))}
          {progress.badges > 10 && (
            <span className={`text-lg ${
              highContrast ? 'text-yellow-400' : 'text-white'
            }`}>
              +{progress.badges - 10}
            </span>
          )}
        </div>
      </div>

      {/* Accuracy */}
      {progress.totalQuestions > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className={`text-xl font-bold ${
              highContrast ? 'text-white' : 'text-white'
            }`}>
              {Math.round((progress.totalCorrect / progress.totalQuestions) * 100)}% Accuracy
            </span>
          </div>
          <div className={`h-4 rounded-full ${
            highContrast ? 'bg-gray-700' : 'bg-white/20'
          } overflow-hidden`}>
            <motion.div
              className={`h-full ${
                highContrast ? 'bg-yellow-400' : 'bg-white'
              }`}
              initial={{ width: 0 }}
              animate={{ 
                width: `${(progress.totalCorrect / progress.totalQuestions) * 100}%` 
              }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Next Level Progress */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🚀</span>
          <span className={`text-lg ${
            highContrast ? 'text-white' : 'text-white'
          }`}>
            {starsToNextLevel} stars to Level {progress.level + 1}
          </span>
        </div>
        <div className={`h-3 rounded-full ${
          highContrast ? 'bg-gray-700' : 'bg-white/20'
        } overflow-hidden`}>
          <motion.div
            className={`h-full ${
              highContrast ? 'bg-yellow-400' : 'bg-white'
            }`}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((progress.stars % 50) / 50) * 100}%` 
            }}
            transition={{ duration: 1, delay: 0.8 }}
          />
        </div>
      </div>
    </div>
  )
}
