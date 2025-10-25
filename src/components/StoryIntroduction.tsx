
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Adventure, StoryChapter, getCurrentChapter } from '../data/storyData'
import { UserProgress } from '../hooks/useProgress'
import { useVoice } from '../hooks/useVoice'

interface StoryIntroductionProps {
  adventure: Adventure
  progress: UserProgress
  onStartChapter: (chapterId: string) => void
  onBack: () => void
  soundEnabled: boolean
  highContrast: boolean
}

export const StoryIntroduction: React.FC<StoryIntroductionProps> = ({
  adventure,
  progress,
  onStartChapter,
  onBack,
  soundEnabled,
  highContrast
}) => {
  const { speak } = useVoice()
  const [currentScene, setCurrentScene] = useState<'introduction' | 'chapter-select'>('introduction')
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null)
  
  const currentChapter = getCurrentChapter(adventure, progress.stars)

  useEffect(() => {
    if (soundEnabled && currentScene === 'introduction') {
      const timer = setTimeout(() => {
        speak(adventure.character.introduction)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [adventure, soundEnabled, speak, currentScene])

  const handleStartAdventure = () => {
    if (currentChapter) {
      if (soundEnabled) {
        speak(`Let's begin our adventure in ${currentChapter.title}! ${currentChapter.description}`)
      }
      onStartChapter(currentChapter.id)
    }
  }

  const handleChapterSelect = (chapter: StoryChapter) => {
    setSelectedChapter(chapter)
    if (soundEnabled) {
      speak(`${chapter.title}: ${chapter.description}`)
    }
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: currentChapter ? `url(${currentChapter.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay */}
      <div className={`absolute inset-0 ${
        highContrast 
          ? 'bg-black/80' 
          : 'bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-blue-900/80'
      }`} />

      {/* Content */}
      <div className="relative z-10 p-6">
        <AnimatePresence mode="wait">
          {currentScene === 'introduction' && (
            <motion.div
              key="introduction"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Character Introduction */}
              <motion.div
                className="mb-8"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="text-9xl mb-4"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                >
                  {adventure.character.avatar}
                </motion.div>
                
                <h1 className={`text-6xl font-bold mb-4 ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  {adventure.character.name}
                </h1>
                
                <div className={`text-2xl italic mb-6 ${
                  highContrast ? 'text-white' : 'text-white/90'
                }`}>
                  "{adventure.character.catchphrase}"
                </div>
              </motion.div>

              {/* Story Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h2 className={`text-5xl font-bold mb-4 ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  {adventure.title}
                </h2>
                <p className={`text-xl ${
                  highContrast ? 'text-white' : 'text-white/90'
                }`}>
                  {adventure.description}
                </p>
              </motion.div>

              {/* Character Speech Bubble */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className={`relative p-8 rounded-3xl mb-8 max-w-2xl mx-auto ${
                  highContrast 
                    ? 'bg-black border-4 border-yellow-400' 
                    : 'bg-white/10 backdrop-blur-lg border-2 border-white/20'
                }`}
              >
                <div className={`text-xl leading-relaxed ${
                  highContrast ? 'text-white' : 'text-white'
                }`}>
                  {adventure.character.introduction}
                </div>
                
                {/* Speech bubble tail */}
                <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 ${
                  highContrast 
                    ? 'border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-400' 
                    : 'border-l-8 border-r-8 border-t-8 border-transparent border-t-white/10'
                }`} />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4 justify-center"
              >
                <button
                  onClick={onBack}
                  className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all ${
                    highContrast 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  ← Back to Stories
                </button>
                
                <button
                  onClick={() => setCurrentScene('chapter-select')}
                  className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all ${
                    highContrast 
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                  }`}
                >
                  Choose Chapter →
                </button>
              </motion.div>

              {/* Floating Elements */}
              {Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute text-4xl opacity-30"
                  style={{
                    left: `${10 + (index * 12)}%`,
                    top: `${20 + Math.sin(index) * 30}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 3 + index * 0.5,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                >
                  {['✨', '🌟', '⭐', '💫', '🎭', '🎪', '🎨', '🎵'][index]}
                </motion.div>
              ))}
            </motion.div>
          )}

          {currentScene === 'chapter-select' && (
            <motion.div
              key="chapter-select"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className={`text-4xl font-bold mb-4 ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  Choose Your Chapter
                </h2>
                <p className={`text-xl ${
                  highContrast ? 'text-white' : 'text-white/90'
                }`}>
                  Select which part of the adventure you'd like to explore!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {adventure.chapters.map((chapter, index) => {
                  const isUnlocked = progress.stars >= chapter.unlockRequirement
                  const isSelected = selectedChapter?.id === chapter.id

                  return (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 ${
                        isUnlocked 
                          ? `transform hover:scale-105 ${
                              isSelected 
                                ? highContrast 
                                  ? 'ring-4 ring-yellow-400 bg-yellow-400/20' 
                                  : 'ring-4 ring-white bg-white/20'
                                : highContrast 
                                ? 'bg-black border-2 border-yellow-400 hover:border-yellow-300' 
                                : 'bg-white/10 hover:bg-white/20'
                            }`
                          : `opacity-50 cursor-not-allowed ${
                              highContrast ? 'bg-gray-800 border-2 border-gray-600' : 'bg-gray-800/50'
                            }`
                      }`}
                      onClick={() => isUnlocked && handleChapterSelect(chapter)}
                      style={{
                        backgroundImage: isUnlocked ? `url(${chapter.backgroundImage})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className={`absolute inset-0 ${
                        highContrast ? 'bg-black/70' : 'bg-gradient-to-t from-black/80 to-transparent'
                      }`} />
                      
                      <div className="relative z-10 p-6">
                        <div className="text-right mb-2">
                          <div className="text-3xl">
                            {isUnlocked ? '🔓' : '🔒'}
                          </div>
                        </div>
                        
                        <h3 className={`text-2xl font-bold mb-2 ${
                          highContrast ? 'text-yellow-400' : 'text-white'
                        }`}>
                          {chapter.title}
                        </h3>
                        
                        <p className={`text-sm mb-4 ${
                          highContrast ? 'text-white' : 'text-white/90'
                        }`}>
                          {chapter.description}
                        </p>
                        
                        {!isUnlocked && (
                          <div className={`text-sm ${
                            highContrast ? 'text-gray-400' : 'text-white/70'
                          }`}>
                            Need {chapter.unlockRequirement} ⭐ to unlock
                          </div>
                        )}
                        
                        {isUnlocked && (
                          <div className={`text-sm font-bold ${
                            highContrast ? 'text-yellow-400' : 'text-white'
                          }`}>
                            Reward: {chapter.completionReward}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setCurrentScene('introduction')}
                  className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all ${
                    highContrast 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  ← Back to Introduction
                </button>
                
                {selectedChapter && (
                  <button
                    onClick={() => onStartChapter(selectedChapter.id)}
                    className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all ${
                      highContrast 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                        : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                    }`}
                  >
                    Start {selectedChapter.title} →
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
