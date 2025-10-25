
import React from 'react'
import { motion } from 'framer-motion'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  onClick: () => void
  disabled?: boolean
  highContrast?: boolean
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  disabled = false,
  highContrast = false
}) => {
  return (
    <motion.button
      className={`
        relative p-8 rounded-3xl shadow-2xl min-h-[200px] w-full
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${highContrast 
          ? 'bg-black text-white border-4 border-yellow-400' 
          : 'bg-white text-gray-800'
        }
        transition-all duration-300 overflow-hidden
      `}
      style={!highContrast ? { backgroundColor: category.color } : undefined}
      whileHover={!disabled ? { scale: 1.05, y: -5 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={!disabled ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-6xl transform rotate-12">
          {category.icon}
        </div>
        <div className="absolute bottom-4 left-4 text-4xl transform -rotate-12">
          {category.icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <motion.div
          className="text-8xl mb-4"
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {category.icon}
        </motion.div>
        
        <h3 className={`text-3xl font-bold text-center ${
          highContrast ? 'text-yellow-400' : 'text-white'
        }`}>
          {category.name}
        </h3>
        
        {disabled && (
          <div className="mt-2 text-lg font-medium text-gray-500">
            Coming Soon!
          </div>
        )}
      </div>

      {/* Shine effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
          whileHover={{ 
            opacity: [0, 0.3, 0],
            x: ['-100%', '100%']
          }}
          transition={{ duration: 0.8 }}
        />
      )}
    </motion.button>
  )
}
