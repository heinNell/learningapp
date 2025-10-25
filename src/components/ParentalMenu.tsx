
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { categories } from '../data/quizData'

interface ParentalMenuProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    difficulty: 'beginner' | 'advanced'
    sound_enabled: boolean
    high_contrast: boolean
    categories_enabled: Record<string, boolean>
  }
  onUpdateSettings: (settings: any) => void
  onResetProgress: () => void
}

export const ParentalMenu: React.FC<ParentalMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress
}) => {
  const [localSettings, setLocalSettings] = useState(settings)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onClose()
  }

  const handleReset = () => {
    onResetProgress()
    setShowResetConfirm(false)
    onClose()
  }

  const toggleCategory = (categoryId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      categories_enabled: {
        ...prev.categories_enabled,
        [categoryId]: !prev.categories_enabled[categoryId]
      }
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                🔒 Parent Settings
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Difficulty Settings */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🎯 Difficulty Level
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-xl border-2 transition-all ${
                    localSettings.difficulty === 'beginner'
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-300 bg-gray-50 text-gray-600'
                  }`}
                  onClick={() => setLocalSettings(prev => ({ ...prev, difficulty: 'beginner' }))}
                >
                  <div className="text-2xl mb-2">🌱</div>
                  <div className="font-bold">Beginner</div>
                  <div className="text-sm">4 choices, no timer</div>
                </button>
                <button
                  className={`p-4 rounded-xl border-2 transition-all ${
                    localSettings.difficulty === 'advanced'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-300 bg-gray-50 text-gray-600'
                  }`}
                  onClick={() => setLocalSettings(prev => ({ ...prev, difficulty: 'advanced' }))}
                >
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-bold">Advanced</div>
                  <div className="text-sm">6 choices, 30s timer</div>
                </button>
              </div>
            </div>

            {/* Audio & Accessibility */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🔊 Audio & Accessibility
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localSettings.sound_enabled}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      sound_enabled: e.target.checked 
                    }))}
                    className="w-6 h-6 text-blue-600 rounded"
                  />
                  <div>
                    <div className="font-bold text-gray-800">🔊 Voice Narration</div>
                    <div className="text-sm text-gray-600">Read questions and answers aloud</div>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localSettings.high_contrast}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      high_contrast: e.target.checked 
                    }))}
                    className="w-6 h-6 text-blue-600 rounded"
                  />
                  <div>
                    <div className="font-bold text-gray-800">🌓 High Contrast Mode</div>
                    <div className="text-sm text-gray-600">Better visibility for visual impairments</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                📚 Quiz Categories
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={localSettings.categories_enabled[category.id] !== false}
                      onChange={() => toggleCategory(category.id)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="text-2xl">{category.icon}</div>
                    <div className="font-bold text-gray-800">{category.name}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Progress */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🔄 Reset Progress
              </h3>
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full p-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Reset All Progress
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-xl text-red-800">
                    <div className="font-bold mb-2">⚠️ Are you sure?</div>
                    <div className="text-sm">This will delete all stars, badges, and progress. This cannot be undone.</div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleReset}
                      className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 p-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 p-4 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 p-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
