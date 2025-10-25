
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuizQuestion } from '../data/quizData'
import { Adventure, StoryChapter } from '../data/storyData'
import { useVoice } from '../hooks/useVoice'

interface StoryQuizCardProps {
  question: QuizQuestion
  adventure: Adventure
  chapter: StoryChapter
  onAnswer: (isCorrect: boolean, selectedAnswer: string) => void
  difficulty: 'beginner' | 'advanced'
  soundEnabled: boolean
  highContrast: boolean
  questionNumber: number
  totalQuestions: number
}

export const StoryQuizCard: React.FC<StoryQuizCardProps> = ({
  question,
  adventure,
  chapter,
  onAnswer,
  difficulty,
  soundEnabled,
  highContrast,
  questionNumber,
  totalQuestions
}) => {
  const { speak } = useVoice()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState(difficulty === 'advanced' ? 30 : 0)
  const [showCharacterResponse, setShowCharacterResponse] = useState(false)

  useEffect(() => {
    if (soundEnabled) {
      const timer = setTimeout(() => {
        const contextualNarration = getContextualNarration()
        speak(contextualNarration)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [question, soundEnabled, speak])

  useEffect(() => {
    if (difficulty === 'advanced' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (difficulty === 'advanced' && timeLeft === 0 && !selectedAnswer) {
      handleAnswer('', false)
    }
  }, [timeLeft, difficulty, selectedAnswer])

  const getContextualNarration = () => {
    const baseNarration = question.narration
    const chapterContext = getChapterContext()
    return `${chapterContext} ${baseNarration}`
  }

  const getChapterContext = () => {
    switch (chapter.id) {
      case 'jungle_expedition':
        return "Deep in the jungle, we've discovered something amazing!"
      case 'savanna_quest':
        return "Under the vast African sky, what do you see roaming the plains?"
      case 'ocean_depths':
        return "Swimming through the crystal waters, we encounter..."
      case 'orchard_awakening':
        return "In the magical orchard, which delicious fruit has appeared?"
      case 'berry_patch_mystery':
        return "The mystery deepens! What fruit are we investigating?"
      case 'harvest_festival':
        return "At the grand celebration, which fruit should we celebrate?"
      case 'planet_discovery':
        return "On this alien world, we discover a fascinating shape!"
      case 'constellation_creation':
        return "Among the stars, which shape shall we connect?"
      case 'galaxy_architect':
        return "To build our galaxy, we need to identify this shape!"
      case 'color_kingdom':
        return "To restore the kingdom's beauty, what color do we need?"
      case 'prism_palace':
        return "The magical prisms are showing us this beautiful color!"
      case 'rainbow_celebration':
        return "For our rainbow festival, which vibrant color do we see?"
      case 'whispering_woods':
        return "Listen carefully to the forest's gentle sounds..."
      case 'echo_caverns':
        return "The cavern echoes reveal this mysterious sound!"
      case 'symphony_summit':
        return "At the mountain's peak, we hear this majestic sound!"
      default:
        return "On our adventure, we discover..."
    }
  }

  const getCharacterResponse = (isCorrect: boolean) => {
    const character = adventure.character
    if (isCorrect) {
      const responses = character.celebration
      return responses[Math.floor(Math.random() * responses.length)]
    } else {
      const responses = character.comfort
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    setShowCharacterResponse(true)

    const characterResponse = getCharacterResponse(isCorrect)

    if (soundEnabled) {
      if (isCorrect) {
        speak(`${characterResponse} That's a ${question.correctAnswer}!`)
      } else {
        speak(characterResponse)
      }
    }

    setTimeout(() => {
      onAnswer(isCorrect, answer)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setShowCharacterResponse(false)
      setTimeLeft(difficulty === 'advanced' ? 30 : 0)
    }, 3000)
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
      style={{
        backgroundImage: `url(${chapter.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Overlay */}
      <div className={`absolute inset-0 ${
        highContrast 
          ? 'bg-black/80' 
          : 'bg-gradient-to-br from-purple-900/70 via-pink-900/70 to-blue-900/70'
      }`} />

      {/* Floating Character */}
      <motion.div
        className="absolute top-8 right-8 z-20"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        <div className="text-8xl">{adventure.character.avatar}</div>
      </motion.div>

      {/* Character Response Bubble */}
      <AnimatePresence>
        {showCharacterResponse && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`absolute top-32 right-8 z-20 p-4 rounded-3xl max-w-xs ${
              highContrast 
                ? 'bg-black border-2 border-yellow-400' 
                : 'bg-white/90 backdrop-blur-sm'
            }`}
          >
            <div className={`font-bold text-lg ${
              highContrast ? 'text-yellow-400' : 'text-purple-600'
            }`}>
              {adventure.character.name}:
            </div>
            <div className={`${
              highContrast ? 'text-white' : 'text-gray-800'
            }`}>
              {getCharacterResponse(selectedAnswer === question.correctAnswer)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Quiz Content */}
      <motion.div
        className={`relative z-10 max-w-4xl mx-auto p-8 rounded-3xl shadow-2xl ${
          highContrast 
            ? 'bg-black/90 text-white border-4 border-yellow-400' 
            : 'bg-white/10 backdrop-blur-lg border-2 border-white/20'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Chapter Progress */}
        <div className="text-center mb-4">
          <div className={`text-lg font-bold ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            {chapter.title} • Question {questionNumber} of {totalQuestions}
          </div>
          
          {difficulty === 'advanced' && (
            <div className={`text-xl font-bold mt-2 ${
              timeLeft <= 5 ? 'text-red-500 animate-pulse' : 
              highContrast ? 'text-white' : 'text-white'
            }`}>
              ⏰ {timeLeft}s
            </div>
          )}
        </div>

        {/* Contextual Story Text */}
        <motion.div
          className={`text-center mb-6 p-4 rounded-2xl ${
            highContrast 
              ? 'bg-gray-800 border-2 border-yellow-400' 
              : 'bg-white/10 backdrop-blur-sm'
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`text-lg italic ${
            highContrast ? 'text-white' : 'text-white/90'
          }`}>
            {getChapterContext()}
          </div>
        </motion.div>

        {/* Question */}
        <motion.h2 
          className={`text-4xl font-bold text-center mb-8 ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {question.question}
        </motion.h2>

        {/* Image */}
        {question.image && (
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          >
            <img
              src={question.image}
              alt="Quiz question"
              className={`w-80 h-80 object-cover rounded-3xl shadow-lg ${
                highContrast ? 'border-4 border-yellow-400' : 'border-4 border-white/20'
              }`}
            />
          </motion.div>
        )}

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-6">
          {question.options.map((option, index) => {
            const isCorrect = option === question.correctAnswer
            const isSelected = selectedAnswer === option
            
            return (
              <motion.button
                key={option}
                className={`
                  p-6 text-2xl font-bold rounded-2xl shadow-lg min-h-[100px]
                  ${highContrast 
                    ? 'bg-white text-black border-4 border-yellow-400 hover:bg-yellow-100' 
                    : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
                  }
                  ${isSelected && isCorrect ? 'bg-green-400 text-white border-green-400' : ''}
                  ${isSelected && !isCorrect ? 'bg-red-400 text-white border-red-400' : ''}
                  disabled:cursor-not-allowed
                  transition-all duration-300
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                onClick={() => !showFeedback && handleAnswer(option, isCorrect)}
                disabled={showFeedback}
                whileHover={!showFeedback ? { scale: 1.05, y: -2 } : undefined}
                whileTap={!showFeedback ? { scale: 0.95 } : undefined}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Story Progress Indicator */}
        <div className="mt-8 text-center">
          <div className={`text-sm ${
            highContrast ? 'text-gray-400' : 'text-white/70'
          }`}>
            Chapter Progress: {questionNumber}/{chapter.questionsNeeded} questions
          </div>
          <div className={`w-full h-2 mt-2 rounded-full overflow-hidden ${
            highContrast ? 'bg-gray-700' : 'bg-white/20'
          }`}>
            <motion.div
              className={`h-full ${
                highContrast ? 'bg-yellow-400' : 'bg-white'
              }`}
              initial={{ width: 0 }}
              animate={{ 
                width: `${(questionNumber / chapter.questionsNeeded) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Magical Particles */}
      {Array.from({ length: 12 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(index) * 20, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: index * 0.5
          }}
        >
          {['✨', '⭐', '🌟', '💫'][index % 4]}
        </motion.div>
      ))}

      {/* Feedback Animation */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {selectedAnswer === question.correctAnswer ? (
              <motion.div
                className="text-8xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                🎉✨🌟
              </motion.div>
            ) : (
              <motion.div
                className="text-8xl"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                💪🌱✨
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
