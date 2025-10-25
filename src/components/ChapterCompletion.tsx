
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Adventure, StoryChapter } from '../data/storyData'
import { UserProgress } from '../hooks/useProgress'
import { useVoice } from '../hooks/useVoice'
import Confetti from 'react-confetti'

interface ChapterCompletionProps {
  adventure: Adventure
  completedChapter: StoryChapter
  progress: UserProgress
  score: { correct: number; total: number }
  onContinue: () => void
  onReturnToStory: () => void
  soundEnabled: boolean
  highContrast: boolean
}

export const ChapterCompletion: React.FC<ChapterCompletionProps> = ({
  adventure,
  completedChapter,
  progress,
  score,
  onContinue,
  onReturnToStory,
  soundEnabled,
  highContrast
}) => {
  const { speak } = useVoice()
  
  const percentage = Math.round((score.correct / score.total) * 100)
  const nextChapter = adventure.chapters.find(
    chapter => chapter.unlockRequirement > completedChapter.unlockRequirement
  )
  const isNextChapterUnlocked = nextChapter ? progress.stars >= nextChapter.unlockRequirement : false

  useEffect(() => {
    if (soundEnabled) {
      const timer = setTimeout(() => {
        const congratsMessage = getCompletionMessage()
        speak(congratsMessage)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [soundEnabled, speak])

  const getCompletionMessage = () => {
    const character = adventure.character
    const baseMessage = character.celebration[Math.floor(Math.random() * character.celebration.length)]
    
    if (percentage >= 80) {
      return `${baseMessage} You've completed ${completedChapter.title} with flying colors! You earned ${completedChapter.completionReward}!`
    } else if (percentage >= 60) {
      return `${baseMessage} Great work completing ${completedChapter.title}! You've earned ${completedChapter.completionReward}!`
    } else {
      return `${baseMessage} You completed ${completedChapter.title}! Every adventure teaches us something new. You've earned ${completedChapter.completionReward}!`
    }
  }

  const getPerformanceEmoji = () => {
    if (percentage >= 90) return '🏆'
    if (percentage >= 80) return '🌟'
    if (percentage >= 70) return '⭐'
    if (percentage >= 60) return '💪'
    return '🌱'
  }

  const getPerformanceMessage = () => {
    if (percentage >= 90) return 'Legendary Performance!'
    if (percentage >= 80) return 'Outstanding Adventure!'
    if (percentage >= 70) return 'Great Journey!'
    if (percentage >= 60) return 'Good Exploration!'
    return 'Learning Adventure!'
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
      style={{
        backgroundImage: `url(${completedChapter.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Confetti */}
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={percentage >= 80 ? 200 : 100}
        gravity={0.3}
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
      />

      {/* Background Overlay */}
      <div className={`absolute inset-0 ${
        highContrast 
          ? 'bg-black/85' 
          : 'bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-blue-900/80'
      }`} />

      {/* Main Content */}
      <motion.div
        className={`relative z-10 max-w-4xl mx-auto text-center p-12 rounded-3xl shadow-2xl ${
          highContrast 
            ? 'bg-black/90 border-4 border-yellow-400' 
            : 'bg-white/10 backdrop-blur-lg border-2 border-white/20'
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
      >
        {/* Character Celebration */}
        <motion.div
          className="mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="text-9xl mb-4"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            {adventure.character.avatar}
          </motion.div>
          
          <h1 className={`text-5xl font-bold mb-4 ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Chapter Complete!
          </h1>
        </motion.div>

        {/* Chapter Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <h2 className={`text-4xl font-bold mb-2 ${
            highContrast ? 'text-white' : 'text-white'
          }`}>
            {completedChapter.title}
          </h2>
          <p className={`text-xl ${
            highContrast ? 'text-gray-300' : 'text-white/90'
          }`}>
            {completedChapter.description}
          </p>
        </motion.div>

        {/* Performance Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="text-8xl mb-4">{getPerformanceEmoji()}</div>
          <div className={`text-3xl font-bold mb-4 ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            {getPerformanceMessage()}
          </div>
          <div className={`text-2xl mb-4 ${
            highContrast ? 'text-white' : 'text-white/90'
          }`}>
            You answered <span className="font-bold text-green-400">
              {score.correct}
            </span> out of <span className="font-bold">
              {score.total}
            </span> questions correctly!
          </div>
          <div className={`text-xl ${
            highContrast ? 'text-gray-300' : 'text-white/80'
          }`}>
            {percentage}% Success Rate
          </div>
        </motion.div>

        {/* Reward Display */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 150 }}
          className={`p-6 rounded-3xl mb-8 ${
            highContrast 
              ? 'bg-yellow-400/20 border-2 border-yellow-400' 
              : 'bg-white/20 border-2 border-white/30'
          }`}
        >
          <div className="text-6xl mb-4">🏆</div>
          <div className={`text-2xl font-bold mb-2 ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Reward Earned!
          </div>
          <div className={`text-xl ${
            highContrast ? 'text-white' : 'text-white/90'
          }`}>
            {completedChapter.completionReward}
          </div>
        </motion.div>

        {/* Character Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          className={`p-6 rounded-3xl mb-8 relative ${
            highContrast 
              ? 'bg-black/50 border-2 border-yellow-400' 
              : 'bg-white/10 backdrop-blur-sm border-2 border-white/20'
          }`}
        >
          <div className={`text-lg font-bold mb-2 ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            {adventure.character.name} says:
          </div>
          <div className={`text-lg italic ${
            highContrast ? 'text-white' : 'text-white/90'
          }`}>
            "{adventure.character.celebration[Math.floor(Math.random() * adventure.character.celebration.length)]}"
          </div>
          
          {/* Speech bubble tail */}
          <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 ${
            highContrast 
              ? 'border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-400' 
              : 'border-l-8 border-r-8 border-t-8 border-transparent border-t-white/10'
          }`} />
        </motion.div>

        {/* Next Chapter Preview */}
        {nextChapter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className={`p-6 rounded-3xl mb-8 ${
              isNextChapterUnlocked 
                ? highContrast 
                  ? 'bg-green-900/50 border-2 border-green-400' 
                  : 'bg-green-500/20 border-2 border-green-400'
                : highContrast 
                ? 'bg-gray-800/50 border-2 border-gray-600' 
                : 'bg-gray-500/20 border-2 border-gray-400'
            }`}
          >
            <div className="text-4xl mb-2">
              {isNextChapterUnlocked ? '🔓' : '🔒'}
            </div>
            <div className={`text-xl font-bold mb-2 ${
              isNextChapterUnlocked 
                ? 'text-green-400' 
                : highContrast ? 'text-gray-400' : 'text-gray-300'
            }`}>
              Next Chapter: {nextChapter.title}
            </div>
            <div className={`text-sm ${
              isNextChapterUnlocked 
                ? highContrast ? 'text-white' : 'text-white/90'
                : highContrast ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {isNextChapterUnlocked 
                ? nextChapter.description 
                : `Unlock with ${nextChapter.unlockRequirement} stars (You have ${progress.stars})`}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {nextChapter && isNextChapterUnlocked && (
            <button
              onClick={onContinue}
              className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all ${
                highContrast 
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
              }`}
            >
              Continue Adventure →
            </button>
          )}
          
          <button
            onClick={onReturnToStory}
            className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all ${
              highContrast 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Return to Story
          </button>
        </motion.div>
      </motion.div>

      {/* Floating Celebration Elements */}
      {Array.from({ length: 15 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.sin(index) * 30, 0],
            rotate: [0, 360],
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: index * 0.2
          }}
        >
          {['🎉', '🌟', '⭐', '✨', '💫', '🎊', '🏆', '🎭'][index % 8]}
        </motion.div>
      ))}
    </div>
  )
}
