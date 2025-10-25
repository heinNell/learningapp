
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'

interface CelebrationEffectProps {
  show: boolean
  type: 'correct' | 'badge' | 'level'
  onComplete: () => void
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  show,
  type,
  onComplete
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  const getEmojis = () => {
    switch (type) {
      case 'correct':
        return ['🎉', '⭐', '✨', '🌟']
      case 'badge':
        return ['🏆', '🎖️', '👑', '💎']
      case 'level':
        return ['🚀', '🎊', '🎆', '🔥']
      default:
        return ['🎉', '⭐', '✨']
    }
  }

  const getMessage = () => {
    switch (type) {
      case 'correct':
        return 'Great Job!'
      case 'badge':
        return 'New Badge Earned!'
      case 'level':
        return 'Level Up!'
      default:
        return 'Awesome!'
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti */}
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={type === 'level' ? 200 : type === 'badge' ? 100 : 50}
            gravity={0.3}
            colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
          />

          {/* Central Message */}
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                {getEmojis()[0]}
              </motion.div>
              
              <motion.h2
                className="text-6xl font-bold text-white drop-shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {getMessage()}
              </motion.h2>
            </motion.div>
          </div>

          {/* Floating Emojis */}
          {getEmojis().map((emoji, index) => (
            <motion.div
              key={index}
              className="absolute text-6xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ 
                scale: 0, 
                rotate: 0,
                opacity: 0
              }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 360, 720],
                opacity: [0, 1, 0],
                y: [0, -100, -200]
              }}
              transition={{ 
                duration: 3,
                delay: index * 0.2,
                ease: 'easeOut'
              }}
            >
              {emoji}
            </motion.div>
          ))}

          {/* Sparkle Effect */}
          {Array.from({ length: 20 }).map((_, index) => (
            <motion.div
              key={`sparkle-${index}`}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatType: 'loop'
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
