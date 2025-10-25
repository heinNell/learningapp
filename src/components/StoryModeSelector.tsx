
import React from 'react'
import { motion } from 'framer-motion'
import { adventures, getUnlockedChapters } from '../data/storyData'
import { UserProgress } from '../hooks/useProgress'

interface StoryModeSelectorProps {
  progress: UserProgress
  onSelectAdventure: (adventureId: string) => void
  highContrast: boolean
}

export const StoryModeSelector: React.FC<StoryModeSelectorProps> = ({
  progress,
  onSelectAdventure,
  highContrast
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={`text-5xl font-bold mb-4 ${
          highContrast ? 'text-yellow-400' : 'text-white'
        }`}>
          🌟 Adventure Stories 🌟
        </h2>
        <p className={`text-xl ${
          highContrast ? 'text-white' : 'text-white/90'
        }`}>
          Choose your magical learning adventure!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adventures.map((adventure, index) => {
          const unlockedChapters = getUnlockedChapters(adventure, progress.stars)
          const totalChapters = adventure.chapters.length
          const progressPercentage = (unlockedChapters.length / totalChapters) * 100

          return (
            <motion.div
              key={adventure.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                highContrast 
                  ? 'bg-black border-4 border-yellow-400' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}
              onClick={() => onSelectAdventure(adventure.id)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Character Avatar */}
              <div className="absolute top-4 right-4 z-10">
                <motion.div
                  className="text-6xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                >
                  {adventure.character.avatar}
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="absolute top-4 left-4 right-20 z-10">
                <div className={`h-2 rounded-full overflow-hidden ${
                  highContrast ? 'bg-gray-700' : 'bg-white/20'
                }`}>
                  <motion.div
                    className={`h-full ${
                      highContrast ? 'bg-yellow-400' : 'bg-white'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                <div className={`text-sm mt-1 font-bold ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  {unlockedChapters.length}/{totalChapters} Chapters
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-20">
                <h3 className={`text-2xl font-bold mb-2 ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  {adventure.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  highContrast ? 'text-white' : 'text-white/90'
                }`}>
                  {adventure.description}
                </p>

                {/* Character Introduction */}
                <div className={`p-3 rounded-2xl mb-4 ${
                  highContrast 
                    ? 'bg-gray-800 border-2 border-yellow-400' 
                    : 'bg-white/10 backdrop-blur-sm'
                }`}>
                  <div className={`text-lg font-bold mb-1 ${
                    highContrast ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {adventure.character.name} says:
                  </div>
                  <div className={`text-sm italic ${
                    highContrast ? 'text-white' : 'text-white/90'
                  }`}>
                    "{adventure.character.catchphrase}"
                  </div>
                </div>

                {/* Chapter Preview */}
                <div className="space-y-2">
                  {adventure.chapters.map((chapter, chapterIndex) => {
                    const isUnlocked = progress.stars >= chapter.unlockRequirement
                    const isCompleted = unlockedChapters.length > chapterIndex

                    return (
                      <div
                        key={chapter.id}
                        className={`flex items-center gap-2 text-sm ${
                          isUnlocked 
                            ? highContrast ? 'text-white' : 'text-white/90'
                            : highContrast ? 'text-gray-600' : 'text-white/50'
                        }`}
                      >
                        <div className="text-lg">
                          {isCompleted ? '✅' : isUnlocked ? '🔓' : '🔒'}
                        </div>
                        <span className={isCompleted ? 'line-through' : ''}>
                          {chapter.title}
                        </span>
                        {!isUnlocked && (
                          <span className="text-xs">
                            (Need {chapter.unlockRequirement} ⭐)
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Call to Action */}
                <motion.button
                  className={`w-full mt-4 p-3 rounded-2xl font-bold text-lg transition-all ${
                    highContrast 
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                      : 'bg-white text-purple-600 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {unlockedChapters.length === 0 
                    ? 'Start Adventure!' 
                    : unlockedChapters.length === totalChapters 
                    ? 'Replay Adventure' 
                    : 'Continue Adventure'}
                </motion.button>
              </div>

              {/* Magical Sparkles */}
              {Array.from({ length: 5 }).map((_, sparkleIndex) => (
                <motion.div
                  key={sparkleIndex}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: sparkleIndex * 0.4 + index * 0.1,
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                />
              ))}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
