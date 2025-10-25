
export interface LearningPattern {
  userId: string
  category: string
  strengths: string[]
  weaknesses: string[]
  optimalDifficulty: number // 0-1 scale
  learningSpeed: 'slow' | 'medium' | 'fast'
  attentionSpan: number // minutes
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening'
  preferredFeedbackStyle: 'immediate' | 'delayed' | 'minimal'
  motivationTriggers: string[]
}

export interface PerformanceMetrics {
  accuracy: number
  averageResponseTime: number
  streakLength: number
  sessionDuration: number
  questionsAttempted: number
  categoriesExplored: string[]
  improvementRate: number
  consistencyScore: number
}

export interface AdaptiveRecommendation {
  type: 'difficulty' | 'category' | 'break' | 'review' | 'challenge'
  priority: 'low' | 'medium' | 'high'
  reason: string
  action: string
  estimatedImpact: number
  confidence: number
  category?: string
}

export interface MistakePattern {
  category: string
  commonErrors: {
    errorType: string
    frequency: number
    lastOccurrence: Date
    relatedConcepts: string[]
  }[]
  recommendedPractice: {
    focusAreas: string[]
    suggestedExercises: string[]
    targetRepetitions: number
  }
}

export class AdaptiveLearningEngine {
  private learningPatterns: Map<string, LearningPattern> = new Map()
  private performanceHistory: Map<string, PerformanceMetrics[]> = new Map()
  private mistakePatterns: Map<string, MistakePattern[]> = new Map()

  constructor() {
    this.loadStoredData()
  }

  private loadStoredData() {
    try {
      const patterns = localStorage.getItem('learning_patterns')
      const performance = localStorage.getItem('performance_history')
      const mistakes = localStorage.getItem('mistake_patterns')

      if (patterns) {
        this.learningPatterns = new Map(JSON.parse(patterns))
      }
      if (performance) {
        this.performanceHistory = new Map(JSON.parse(performance))
      }
      if (mistakes) {
        this.mistakePatterns = new Map(JSON.parse(mistakes))
      }
    } catch (error) {
      console.warn('Failed to load adaptive learning data:', error)
    }
  }

  private saveData() {
    try {
      localStorage.setItem('learning_patterns', JSON.stringify([...this.learningPatterns]))
      localStorage.setItem('performance_history', JSON.stringify([...this.performanceHistory]))
      localStorage.setItem('mistake_patterns', JSON.stringify([...this.mistakePatterns]))
    } catch (error) {
      console.warn('Failed to save adaptive learning data:', error)
    }
  }

  analyzePerformance(
    userId: string,
    sessionData: {
      category: string
      questions: Array<{
        id: string
        correct: boolean
        timeSpent: number
        difficulty: number
      }>
      sessionStart: Date
      sessionEnd: Date
    }
  ): PerformanceMetrics {
    const correctAnswers = sessionData.questions.filter(q => q.correct).length
    const totalQuestions = sessionData.questions.length
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0

    const averageResponseTime = sessionData.questions.reduce((sum, q) => sum + q.timeSpent, 0) / totalQuestions
    const sessionDuration = (sessionData.sessionEnd.getTime() - sessionData.sessionStart.getTime()) / 1000 / 60

    // Calculate streak
    let currentStreak = 0
    for (let i = sessionData.questions.length - 1; i >= 0; i--) {
      if (sessionData.questions[i].correct) {
        currentStreak++
      } else {
        break
      }
    }

    const metrics: PerformanceMetrics = {
      accuracy,
      averageResponseTime,
      streakLength: currentStreak,
      sessionDuration,
      questionsAttempted: totalQuestions,
      categoriesExplored: [sessionData.category],
      improvementRate: this.calculateImprovementRate(userId, sessionData.category, accuracy),
      consistencyScore: this.calculateConsistencyScore(userId)
    }

    // Store performance history
    const userHistory = this.performanceHistory.get(userId) || []
    userHistory.push(metrics)
    this.performanceHistory.set(userId, userHistory.slice(-20)) // Keep last 20 sessions

    this.saveData()
    return metrics
  }

  private calculateImprovementRate(userId: string, category: string, currentAccuracy: number): number {
    const history = this.performanceHistory.get(userId) || []
    const categoryHistory = history.filter(h => h.categoriesExplored.includes(category))
    
    if (categoryHistory.length < 2) return 0

    const previousAccuracy = categoryHistory[categoryHistory.length - 2].accuracy
    return currentAccuracy - previousAccuracy
  }

  private calculateConsistencyScore(userId: string): number {
    const history = this.performanceHistory.get(userId) || []
    if (history.length < 3) return 0.5

    const recentAccuracies = history.slice(-5).map(h => h.accuracy)
    const variance = this.calculateVariance(recentAccuracies)
    
    // Lower variance = higher consistency (inverted and normalized)
    return Math.max(0, Math.min(1, 1 - variance))
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    const squaredDifferences = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDifferences.reduce((sum, sq) => sum + sq, 0) / numbers.length
  }

  generateRecommendations(userId: string, currentMetrics: PerformanceMetrics): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = []
    const userPattern = this.learningPatterns.get(userId)

    // Difficulty adjustment recommendations
    if (currentMetrics.accuracy > 0.9 && currentMetrics.averageResponseTime < 3) {
      recommendations.push({
        type: 'difficulty',
        priority: 'high',
        reason: 'High accuracy with fast response times indicates readiness for more challenge',
        action: 'Increase difficulty level',
        estimatedImpact: 0.8,
        confidence: 0.9
      })
    } else if (currentMetrics.accuracy < 0.4) {
      recommendations.push({
        type: 'difficulty',
        priority: 'high',
        reason: 'Low accuracy suggests current difficulty is too high',
        action: 'Decrease difficulty level',
        estimatedImpact: 0.7,
        confidence: 0.85
      })
    }

    // Break recommendations
    if (currentMetrics.sessionDuration > (userPattern?.attentionSpan || 15)) {
      recommendations.push({
        type: 'break',
        priority: 'medium',
        reason: 'Session duration exceeds optimal attention span',
        action: 'Suggest a short break',
        estimatedImpact: 0.6,
        confidence: 0.75
      })
    }

    // Category recommendations
    const mistakePatterns = this.mistakePatterns.get(userId) || []
    const weakCategories = mistakePatterns
      .filter(pattern => pattern.commonErrors.some(error => error.frequency > 3))
      .map(pattern => pattern.category)

    if (weakCategories.length > 0) {
      recommendations.push({
        type: 'review',
        priority: 'medium',
        reason: `Identified weakness in ${weakCategories.join(', ')}`,
        action: `Focus on ${weakCategories[0]} category`,
        estimatedImpact: 0.7,
        confidence: 0.8,
        category: weakCategories[0]
      })
    }

    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })
  }

  updateLearningPattern(
    userId: string,
    sessionData: {
      category: string
      performance: PerformanceMetrics
      timeOfDay: 'morning' | 'afternoon' | 'evening'
      mistakes: Array<{ questionId: string; selectedAnswer: string; correctAnswer: string }>
    }
  ) {
    const pattern = this.learningPatterns.get(userId) || this.createDefaultPattern(userId)

    // Update strengths and weaknesses
    if (sessionData.performance.accuracy > 0.8) {
      if (!pattern.strengths.includes(sessionData.category)) {
        pattern.strengths.push(sessionData.category)
      }
      pattern.weaknesses = pattern.weaknesses.filter(w => w !== sessionData.category)
    } else if (sessionData.performance.accuracy < 0.5) {
      if (!pattern.weaknesses.includes(sessionData.category)) {
        pattern.weaknesses.push(sessionData.category)
      }
    }

    // Update learning speed based on response times
    if (sessionData.performance.averageResponseTime < 2) {
      pattern.learningSpeed = 'fast'
    } else if (sessionData.performance.averageResponseTime > 5) {
      pattern.learningSpeed = 'slow'
    } else {
      pattern.learningSpeed = 'medium'
    }

    // Update best time of day
    pattern.bestTimeOfDay = sessionData.timeOfDay

    // Update mistake patterns
    this.updateMistakePatterns(userId, sessionData.category, sessionData.mistakes)

    this.learningPatterns.set(userId, pattern)
    this.saveData()
  }

  private createDefaultPattern(userId: string): LearningPattern {
    return {
      userId,
      category: '',
      strengths: [],
      weaknesses: [],
      optimalDifficulty: 0.5,
      learningSpeed: 'medium',
      attentionSpan: 15,
      bestTimeOfDay: 'afternoon',
      preferredFeedbackStyle: 'immediate',
      motivationTriggers: ['celebration', 'progress', 'achievement']
    }
  }

  private updateMistakePatterns(
    userId: string,
    category: string,
    mistakes: Array<{ questionId: string; selectedAnswer: string; correctAnswer: string }>
  ) {
    const userMistakes = this.mistakePatterns.get(userId) || []
    let categoryPattern = userMistakes.find(p => p.category === category)

    if (!categoryPattern) {
      categoryPattern = {
        category,
        commonErrors: [],
        recommendedPractice: {
          focusAreas: [],
          suggestedExercises: [],
          targetRepetitions: 3
        }
      }
      userMistakes.push(categoryPattern)
    }

    // Analyze mistake patterns
    mistakes.forEach(mistake => {
      const errorType = `${mistake.correctAnswer}_confused_with_${mistake.selectedAnswer}`
      const existingError = categoryPattern!.commonErrors.find(e => e.errorType === errorType)

      if (existingError) {
        existingError.frequency++
        existingError.lastOccurrence = new Date()
      } else {
        categoryPattern!.commonErrors.push({
          errorType,
          frequency: 1,
          lastOccurrence: new Date(),
          relatedConcepts: [mistake.correctAnswer, mistake.selectedAnswer]
        })
      }
    })

    this.mistakePatterns.set(userId, userMistakes)
  }

  getDynamicDifficulty(userId: string, category: string): number {
    const pattern = this.learningPatterns.get(userId)
    const recentPerformance = this.performanceHistory.get(userId)?.slice(-3) || []

    if (!pattern || recentPerformance.length === 0) {
      return 0.5 // Default difficulty
    }

    const categoryPerformance = recentPerformance.filter(p => 
      p.categoriesExplored.includes(category)
    )

    if (categoryPerformance.length === 0) {
      return pattern.optimalDifficulty
    }

    const avgAccuracy = categoryPerformance.reduce((sum, p) => sum + p.accuracy, 0) / categoryPerformance.length
    const avgResponseTime = categoryPerformance.reduce((sum, p) => sum + p.averageResponseTime, 0) / categoryPerformance.length

    // Adjust difficulty based on performance
    let adjustedDifficulty = pattern.optimalDifficulty

    if (avgAccuracy > 0.85 && avgResponseTime < 3) {
      adjustedDifficulty = Math.min(1, adjustedDifficulty + 0.1)
    } else if (avgAccuracy < 0.5) {
      adjustedDifficulty = Math.max(0.1, adjustedDifficulty - 0.1)
    }

    // Update the stored optimal difficulty
    pattern.optimalDifficulty = adjustedDifficulty
    this.learningPatterns.set(userId, pattern)

    return adjustedDifficulty
  }

  getPersonalizedEncouragement(userId: string, performance: PerformanceMetrics): string {
    const pattern = this.learningPatterns.get(userId)
    
    if (!pattern) {
      return "Great job! Keep learning!"
    }

    const encouragements = {
      high_accuracy: [
        "Wow! You're really mastering this!",
        "Excellent work! Your understanding is growing!",
        "Amazing! You're becoming an expert!"
      ],
      improving: [
        "I can see you're getting better!",
        "Great progress! Keep it up!",
        "You're learning so well!"
      ],
      struggling: [
        "That's okay! Learning takes practice!",
        "Every expert was once a beginner!",
        "You're doing great by trying!"
      ],
      consistent: [
        "I love your consistency!",
        "Your steady effort is paying off!",
        "You're building great learning habits!"
      ]
    }

    if (performance.accuracy > 0.8) {
      return encouragements.high_accuracy[Math.floor(Math.random() * encouragements.high_accuracy.length)]
    } else if (performance.improvementRate > 0.1) {
      return encouragements.improving[Math.floor(Math.random() * encouragements.improving.length)]
    } else if (performance.consistencyScore > 0.7) {
      return encouragements.consistent[Math.floor(Math.random() * encouragements.consistent.length)]
    } else {
      return encouragements.struggling[Math.floor(Math.random() * encouragements.struggling.length)]
    }
  }
}

export const adaptiveLearningEngine = new AdaptiveLearningEngine()
