import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adaptiveLearningEngine, AdaptiveRecommendation, PerformanceMetrics } from '../data/adaptiveLearningData'
import { categories } from '../data/quizData'
import { TrendingUp, TrendingDown, Clock, Target, Brain, Award } from 'lucide-react'

interface CategoryStat {
  category: string
  id: string
  accuracy: number
  sessions: number
  improvement: number
}

interface PerformanceData {
  totalSessions: number
  avgAccuracy: number
  avgResponseTime: number
  totalQuestions: number
  categoryStats: CategoryStat[]
  recentPerformance: PerformanceMetrics[]
}

interface LearningPathStep {
  step: number
  category: stringw 
  categoryId: string
  reason: string
  estimatedTime: number
  priority: number
}

interface Prediction {
  predictedAccuracy: number
  confidence: 'High' | 'Medium' | 'Low'
  estimatedQuestions: number
  estimatedCorrect: number
}

interface AnalyticsDashboardProps {
  userId: string
  userName: string
  highContrast: boolean
  onClose: () => void
  onApplyRecommendation: (action: string, category?: string) => void
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  userName,
  highContrast,
  onClose,
  onApplyRecommendation
}) => {
  const [aiDifficulty, setAiDifficulty] = useState<number>(0.5)
  const [showPredictions, setShowPredictions] = useState(false)

  // Get learning patterns and performance data
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([])
  const [learningPath, setLearningPath] = useState<LearningPathStep[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [userId])

  const loadAnalytics = () => {
    try {
      // Load performance history from localStorage
      const historyData = localStorage.getItem('performance_history')
      
      if (historyData) {
        const history = JSON.parse(historyData) as [string, PerformanceMetrics[]][]
        const userHistory = history.find((h) => h[0] === userId)?.[1] || []
        
        // Calculate aggregate metrics
        const totalSessions = userHistory.length
        const avgAccuracy = userHistory.reduce((sum, h) => sum + h.accuracy, 0) / totalSessions || 0
        const avgResponseTime = userHistory.reduce((sum, h) => sum + h.averageResponseTime, 0) / totalSessions || 0
        const totalQuestions = userHistory.reduce((sum, h) => sum + h.questionsAttempted, 0)
        
        // Category breakdown
        const categoryStats: CategoryStat[] = categories.map(cat => {
          const catHistory = userHistory.filter((h) => h.categoriesExplored.includes(cat.id))
          const catAccuracy = catHistory.reduce((sum, h) => sum + h.accuracy, 0) / catHistory.length || 0
          return {
            category: cat.name,
            id: cat.id,
            accuracy: catAccuracy,
            sessions: catHistory.length,
            improvement: catHistory.length > 1 ? 
              catHistory[catHistory.length - 1].accuracy - catHistory[0].accuracy : 0
          }
        })

        setPerformanceData({
          totalSessions,
          avgAccuracy,
          avgResponseTime,
          totalQuestions,
          categoryStats,
          recentPerformance: userHistory.slice(-7)
        })

        // Get recommendations if available
        const latestMetrics = userHistory[userHistory.length - 1]
        if (latestMetrics) {
          const recs = adaptiveLearningEngine.generateRecommendations(userId, latestMetrics)
          setRecommendations(recs)
        }

        // Generate learning path
        const path = generateLearningPath(categoryStats)
        setLearningPath(path)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const generateLearningPath = (categoryStats: CategoryStat[]): LearningPathStep[] => {
    const prioritized = categoryStats
      .map(cat => ({
        ...cat,
        priority: calculatePriority(cat)
      }))
      .sort((a, b) => b.priority - a.priority)

    return prioritized.slice(0, 3).map((cat, index) => ({
      step: index + 1,
      category: cat.category,
      categoryId: cat.id,
      reason: cat.accuracy < 0.5 ? 'Needs improvement' : 
              cat.accuracy < 0.7 ? 'Building skills' : 'Ready for advanced',
      estimatedTime: Math.ceil((1 - cat.accuracy) * 30),
      priority: cat.priority
    }))
  }

  const calculatePriority = (cat: CategoryStat): number => {
    let priority = 0
    if (cat.accuracy < 0.5) priority += 50
    else if (cat.accuracy < 0.7) priority += 30
    if (cat.improvement > 0) priority += 20
    if (cat.accuracy > 0.9) priority -= 30
    return priority
  }

  const predictPerformance = (category: string, difficulty: number): Prediction | null => {
    if (!performanceData) return null
    const catData = performanceData.categoryStats.find((c) => c.id === category)
    if (!catData) return null

    const basePrediction = catData.accuracy
    const difficultyAdjustment = (0.5 - difficulty) * 0.3
    const improvementTrend = catData.improvement * 0.2
    const predicted = Math.max(0, Math.min(1, basePrediction + difficultyAdjustment + improvementTrend))
    
    return {
      predictedAccuracy: Math.round(predicted * 100),
      confidence: catData.sessions > 5 ? 'High' : catData.sessions > 2 ? 'Medium' : 'Low',
      estimatedQuestions: 10,
      estimatedCorrect: Math.round(predicted * 10)
    }
  }

  if (!performanceData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        highContrast ? 'bg-black text-white' : 'bg-white'
      }`}>
        <div className="text-2xl">Loading analytics... 📊</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${
      highContrast ? 'bg-black text-white' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${
              highContrast ? 'text-yellow-400' : 'text-gray-800'
            }`}>
              📊 Learning Analytics Dashboard
            </h1>
            <p className={`text-lg ${
              highContrast ? 'text-white' : 'text-gray-600'
            }`}>
              {userName}'s Learning Journey
            </p>
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            ← Back
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Award className={highContrast ? 'text-yellow-400' : 'text-blue-500'} size={24} />
              <div className={`text-sm font-medium ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>Overall Accuracy</div>
            </div>
            <div className={`text-3xl font-bold ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
              {Math.round(performanceData.avgAccuracy * 100)}%
            </div>
            <div className={`text-xs mt-2 ${highContrast ? 'text-gray-500' : 'text-gray-500'}`}>
              Across {performanceData.totalSessions} sessions
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Clock className={highContrast ? 'text-yellow-400' : 'text-green-500'} size={24} />
              <div className={`text-sm font-medium ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>Avg Response Time</div>
            </div>
            <div className={`text-3xl font-bold ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
              {performanceData.avgResponseTime.toFixed(1)}s
            </div>
            <div className={`text-xs mt-2 ${highContrast ? 'text-gray-500' : 'text-gray-500'}`}>Per question</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Target className={highContrast ? 'text-yellow-400' : 'text-purple-500'} size={24} />
              <div className={`text-sm font-medium ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>Total Questions</div>
            </div>
            <div className={`text-3xl font-bold ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
              {performanceData.totalQuestions}
            </div>
            <div className={`text-xs mt-2 ${highContrast ? 'text-gray-500' : 'text-gray-500'}`}>Questions answered</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Brain className={highContrast ? 'text-yellow-400' : 'text-pink-500'} size={24} />
              <div className={`text-sm font-medium ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>AI Difficulty</div>
            </div>
            <div className={`text-3xl font-bold ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
              {Math.round(aiDifficulty * 100)}%
            </div>
            <div className={`text-xs mt-2 ${highContrast ? 'text-gray-500' : 'text-gray-500'}`}>Recommended level</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Performance */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className={`lg:col-span-2 p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
            <h3 className={`text-2xl font-bold mb-6 ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
              📈 Performance by Category
            </h3>
            <div className="space-y-4">
              {performanceData.categoryStats.map((cat, index) => {
                const percentage = Math.round(cat.accuracy * 100)
                const isStrength = cat.accuracy >= 0.8
                const isWeakness = cat.accuracy < 0.5
                
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categories.find(c => c.id === cat.id)?.icon}</span>
                        <span className={`font-semibold ${highContrast ? 'text-white' : 'text-gray-700'}`}>{cat.category}</span>
                        {isStrength && <span className="text-green-500 text-sm">⭐ Strength</span>}
                        {isWeakness && <span className="text-orange-500 text-sm">💡 Focus Area</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>{percentage}%</span>
                        {cat.improvement > 0 && <TrendingUp className="text-green-500" size={16} />}
                        {cat.improvement < 0 && <TrendingDown className="text-red-500" size={16} />}
                      </div>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${highContrast ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <motion.div className={`h-full ${isStrength ? 'bg-green-500' : isWeakness ? 'bg-orange-500' : 'bg-blue-500'}`}
                        initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.6 + index * 0.1 }} />
                    </div>
                    <div className={`text-xs mt-1 ${highContrast ? 'text-gray-500' : 'text-gray-500'}`}>{cat.sessions} sessions completed</div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
            className={`p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
            <h3 className={`text-xl font-bold mb-4 ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>🎯 AI Recommendations</h3>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className={`p-4 rounded-xl ${
                    rec.priority === 'high' ? highContrast ? 'bg-red-900/50 border border-red-500' : 'bg-red-50 border border-red-200' :
                    rec.priority === 'medium' ? highContrast ? 'bg-yellow-900/50 border border-yellow-500' : 'bg-yellow-50 border border-yellow-200' :
                    highContrast ? 'bg-gray-800 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`text-xs font-bold uppercase ${rec.priority === 'high' ? 'text-red-500' : rec.priority === 'medium' ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {rec.priority} Priority
                      </div>
                      <div className={`text-xs ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>{Math.round(rec.confidence * 100)}% confident</div>
                    </div>
                    <div className={`text-sm font-semibold mb-2 ${highContrast ? 'text-white' : 'text-gray-700'}`}>{rec.action}</div>
                    <div className={`text-xs mb-3 ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>{rec.reason}</div>
                    <button onClick={() => onApplyRecommendation(rec.action, rec.category)}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                        highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                      Apply Recommendation
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                <Brain size={48} className="mx-auto mb-3 opacity-50" />
                <p>Complete more quizzes to receive personalized recommendations!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Difficulty Slider */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className={`mt-6 p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
          <h3 className={`text-xl font-bold mb-4 ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>🤖 AI-Powered Difficulty Slider</h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>Easy</span>
              <span className={`text-sm font-bold ${highContrast ? 'text-yellow-400' : 'text-blue-600'}`}>
                AI Recommended: {Math.round(aiDifficulty * 100)}%
              </span>
              <span className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>Hard</span>
            </div>
            <input type="range" min="0" max="100" value={Math.round(aiDifficulty * 100)}
              onChange={(e) => setAiDifficulty(parseInt(e.target.value) / 100)}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${Math.round(aiDifficulty * 100)}%, ${highContrast ? '#374151' : '#e5e7eb'} ${Math.round(aiDifficulty * 100)}%, ${highContrast ? '#374151' : '#e5e7eb'} 100%)`
              }} />
            <div className={`text-center mt-3 text-sm ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>
              {aiDifficulty < 0.3 ? '🟢 Beginner' : aiDifficulty < 0.6 ? '🟡 Intermediate' : aiDifficulty < 0.8 ? '🟠 Advanced' : '🔴 Expert'}
            </div>
          </div>
        </motion.div>

        {/* Learning Path */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className={`mt-6 p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
          <h3 className={`text-xl font-bold mb-4 ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>🗺️ Personalized Learning Path</h3>
          <div className="space-y-4">
            {learningPath.map((step, index) => (
              <div key={index} className={`flex items-center gap-4 p-4 rounded-xl ${
                highContrast ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-500 text-white'
                }`}>{step.step}</div>
                <div className="flex-1">
                  <div className={`font-bold ${highContrast ? 'text-white' : 'text-gray-800'}`}>{step.category}</div>
                  <div className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.reason} • Est. {step.estimatedTime} min
                  </div>
                </div>
                <button onClick={() => onApplyRecommendation('practice', step.categoryId)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}>
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Predictor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className={`mt-6 p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>🔮 Performance Predictor</h3>
            <button onClick={() => setShowPredictions(!showPredictions)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                highContrast ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              {showPredictions ? 'Hide' : 'Show'} Predictions
            </button>
          </div>
          {showPredictions && (
            <div className="space-y-3">
              {performanceData.categoryStats.filter((cat) => cat.sessions > 0).map((cat) => {
                const prediction = predictPerformance(cat.id, aiDifficulty)
                if (!prediction) return null
                return (
                  <div key={cat.id} className={`p-4 rounded-xl ${
                    highContrast ? 'bg-gray-800 border border-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`font-semibold ${highContrast ? 'text-white' : 'text-gray-800'}`}>{cat.category} - Next Quiz</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        prediction.confidence === 'High' ? 'bg-green-500 text-white' :
                        prediction.confidence === 'Medium' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
                      }`}>{prediction.confidence} Confidence</div>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${highContrast ? 'text-yellow-400' : 'text-blue-600'}`}>
                      Predicted: {prediction.predictedAccuracy}% accuracy
                    </div>
                    <div className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>
                      Expected: {prediction.estimatedCorrect} / {prediction.estimatedQuestions} correct
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Category Priority Ranking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          className={`mt-6 p-6 rounded-2xl ${highContrast ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white shadow-lg'}`}>
          <h3 className={`text-xl font-bold mb-4 ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
            🏆 Category Priority Ranking
          </h3>
          <div className={`text-sm mb-4 ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-calculated priorities based on performance, improvement, and mastery
          </div>
          <div className="space-y-2">
            {performanceData.categoryStats
              .map((cat) => ({ ...cat, priority: calculatePriority(cat) }))
              .sort((a, b) => b.priority - a.priority)
              .map((cat, index) => (
                <div key={cat.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  highContrast ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      highContrast ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`font-semibold ${highContrast ? 'text-white' : 'text-gray-800'}`}>{cat.category}</span>
                  </div>
                  <div className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-600'}`}>
                    Priority: {cat.priority > 0 ? 'High' : cat.priority < -20 ? 'Low' : 'Medium'}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
