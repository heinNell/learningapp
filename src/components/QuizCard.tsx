
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuizQuestion } from '../data/quizData'
import { useVoice } from '../hooks/useVoice'

interface QuizCardProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean, selectedAnswer: string) => void
  difficulty: 'beginner' | 'advanced'
  soundEnabled: boolean
  highContrast: boolean
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  onAnswer,
  difficulty,
  soundEnabled,
  highContrast
}) => {
  const { speak } = useVoice()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState(difficulty === 'advanced' ? 30 : 0)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Reset audio state for new question
    setAudioPlayed(false)
    
    if (soundEnabled) {
      // For sound questions, play audio automatically
      if (question.audio && audioRef.current) {
        const timer = setTimeout(() => {
          audioRef.current?.play().catch(() => {
            // Silently handle missing audio files - they're optional
          })
        }, 500)
        return () => clearTimeout(timer)
      } else {
        // Read the question after a short delay
        const timer = setTimeout(() => {
          speak(question.narration)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [question, soundEnabled, speak])

  useEffect(() => {
    if (difficulty === 'advanced' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (difficulty === 'advanced' && timeLeft === 0 && !selectedAnswer) {
      // Time's up!
      handleAnswer('', false)
    }
  }, [timeLeft, difficulty, selectedAnswer])

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)

    if (soundEnabled) {
      if (isCorrect) {
        // Warm, appreciative voice for correct answers
        const encouragingPhrases = [
          `Wonderful! You found the ${question.correctAnswer}!`,
          `Yes! That's exactly right! It's a ${question.correctAnswer}!`,
          `Perfect! You got it! That's a ${question.correctAnswer}!`,
          `Amazing work! You chose the ${question.correctAnswer}!`,
          `Brilliant! You're absolutely right! It's a ${question.correctAnswer}!`
        ]
        const phrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)]
        
        // Use slower, warmer, more appreciative tone
        speak(phrase, { 
          isExcited: true,  // This now uses rate: 0.9, pitch: 1.25
          rate: 0.85,       // Even slower for complex words - warm teacher pace
          pitch: 1.2,       // Warm, congratulatory tone
          volume: 1.0
        })
      } else {
        // Gentle, supportive voice for incorrect answers
        const supportivePhrases = [
          "That's okay! Let's think about it together!",
          "Not quite, but you're doing great! Let's try another!",
          "Nice try! Every answer helps you learn!",
          "Almost! You're getting closer! Keep going!"
        ]
        const phrase = supportivePhrases[Math.floor(Math.random() * supportivePhrases.length)]
        
        speak(phrase, {
          isExcited: false,
          rate: 0.9,
          pitch: 1.1,  // Lower, gentler tone
          volume: 0.85
        })
      }
    }

    setTimeout(() => {
      onAnswer(isCorrect, answer)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setTimeLeft(difficulty === 'advanced' ? 30 : 0)
    }, 2500)  // Slightly longer to let voice finish
  }

  const buttonVariants = {
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 },
    correct: { 
      scale: 1.1, 
      backgroundColor: '#4ECDC4',
      transition: { duration: 0.3 }
    },
    incorrect: { 
      scale: 0.95, 
      backgroundColor: '#FF6B6B',
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      className={`max-w-4xl mx-auto p-8 rounded-3xl shadow-2xl ${
        highContrast 
          ? 'bg-black text-white border-4 border-yellow-400' 
          : 'bg-gradient-to-br from-purple-400 via-pink-400 to-red-400'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Timer for advanced mode */}
      {difficulty === 'advanced' && (
        <div className="mb-4 text-center">
          <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            ⏰ {timeLeft}s
          </div>
        </div>
      )}

      {/* Audio Player for Sound Questions */}
      {question.audio && (
        <div className="mb-6 text-center">
          <audio
            ref={audioRef}
            src={question.audio}
            onEnded={() => setAudioPlayed(true)}
            onError={() => {
              // Silently handle missing audio - files are optional enhancements
              setAudioPlayed(false)
            }}
          />
          <motion.button
            onClick={() => audioRef.current?.play()}
            className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all shadow-lg ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-white/90 text-purple-600 hover:bg-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            🔊 {audioPlayed ? 'Play Sound Again' : 'Listen to Sound'}
          </motion.button>
        </div>
      )}

      {/* Question */}
      <motion.h2 
        className={`text-4xl font-bold text-center mb-8 ${
          highContrast ? 'text-yellow-400' : 'text-white'
        }`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {question.question}
      </motion.h2>

      {/* Image */}
      {question.image && (
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        >
          <img
            src={question.image}
            alt="Quiz question"
            className={`w-80 h-80 object-cover rounded-3xl shadow-lg ${
              highContrast ? 'border-4 border-yellow-400' : ''
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
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                }
                ${isSelected && isCorrect ? 'bg-green-400 text-white' : ''}
                ${isSelected && !isCorrect ? 'bg-red-400 text-white' : ''}
                disabled:cursor-not-allowed
                transition-all duration-300
              `}
              variants={buttonVariants}
              whileHover={!showFeedback ? 'hover' : undefined}
              whileTap={!showFeedback ? 'tap' : undefined}
              animate={
                isSelected 
                  ? isCorrect ? 'correct' : 'incorrect'
                  : { opacity: 1, y: 0 }
              }
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              onClick={() => !showFeedback && handleAnswer(option, isCorrect)}
              disabled={showFeedback}
              aria-label={`Option ${index + 1}: ${option}`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </div>
            </motion.button>
          )
        })}
      </div>

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
                😊💪
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
