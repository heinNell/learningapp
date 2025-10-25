export interface LearningBuddy {
  id: string
  name: string
  avatar: string
  personality: 'cheerful' | 'wise' | 'playful' | 'gentle' | 'energetic'
  level: number
  experience: number
  mood: 'happy' | 'excited' | 'sleepy' | 'curious' | 'proud'
  preferences: {
    favoriteCategory: string
    encouragementStyle: 'gentle' | 'enthusiastic' | 'patient'
    celebrationLevel: 'subtle' | 'moderate' | 'explosive'
  }
  relationships: {
    trustLevel: number // 0-100
    playfulness: number // 0-100
    learningBond: number // 0-100
  }
  memories: {
    bestSubject: string
    strugglingArea: string
    lastPlayTime: Date
    totalSessions: number
    favoriteTime: 'morning' | 'afternoon' | 'evening'
  }
}

export interface BuddyResponse {
  type: 'encouragement' | 'celebration' | 'comfort' | 'guidance' | 'rest' | 'greeting' | 'correct' | 'incorrect' | 'goodbye' | 'idle'
  text: string
  animation: 'bounce' | 'spin' | 'dance' | 'sleep' | 'think' | 'cheer'
  emotion: string
  voiceTone: 'excited' | 'gentle' | 'proud' | 'sleepy' | 'curious'
}

export const defaultBuddies: LearningBuddy[] = [
  {
    id: 'spark',
    name: 'Spark',
    avatar: '⚡',
    personality: 'energetic',
    level: 1,
    experience: 0,
    mood: 'excited',
    preferences: {
      favoriteCategory: 'sounds',
      encouragementStyle: 'enthusiastic',
      celebrationLevel: 'explosive'
    },
    relationships: {
      trustLevel: 50,
      playfulness: 80,
      learningBond: 30
    },
    memories: {
      bestSubject: 'sounds',
      strugglingArea: 'shapes',
      lastPlayTime: new Date(),
      totalSessions: 0,
      favoriteTime: 'morning'
    }
  },
  {
    id: 'luna',
    name: 'Luna',
    avatar: '🌙',
    personality: 'gentle',
    level: 1,
    experience: 0,
    mood: 'curious',
    preferences: {
      favoriteCategory: 'colors',
      encouragementStyle: 'gentle',
      celebrationLevel: 'moderate'
    },
    relationships: {
      trustLevel: 70,
      playfulness: 40,
      learningBond: 60
    },
    memories: {
      bestSubject: 'colors',
      strugglingArea: 'animals',
      lastPlayTime: new Date(),
      totalSessions: 0,
      favoriteTime: 'evening'
    }
  },
  {
    id: 'sage',
    name: 'Sage',
    avatar: '🦉',
    personality: 'wise',
    level: 1,
    experience: 0,
    mood: 'curious',
    preferences: {
      favoriteCategory: 'shapes',
      encouragementStyle: 'patient',
      celebrationLevel: 'subtle'
    },
    relationships: {
      trustLevel: 90,
      playfulness: 30,
      learningBond: 80
    },
    memories: {
      bestSubject: 'shapes',
      strugglingArea: 'fruits',
      lastPlayTime: new Date(),
      totalSessions: 0,
      favoriteTime: 'afternoon'
    }
  }
]

export const generateBuddyResponse = (
  buddy: LearningBuddy,
  context: 'correct' | 'incorrect' | 'greeting' | 'goodbye' | 'encouragement' | 'rest' | 'idle',
  performanceData?: { streak: number; accuracy: number; timeSpent: number; category?: string }
): BuddyResponse => {
  const responses: Record<string, Record<string, string[]>> = {
    correct: {
      cheerful: [
        "Hooray! That was absolutely amazing! 🎉",
        "You're getting so good at this! I'm so proud! ✨",
        "Wow! You're like a learning superhero! 🦸‍♀️"
      ],
      wise: [
        "Excellent thinking! Your mind is growing stronger! 🧠",
        "Wonderful! You understood that perfectly! 📚",
        "That's the spirit of a true learner! Keep exploring! 🔍"
      ],
      playful: [
        "Yippee! That was so much fun! Let's do another! 🎪",
        "You nailed it! High five! 🙌",
        "Awesome sauce! You're on fire! 🔥"
      ],
      gentle: [
        "Beautiful work, my friend. You're learning so well! 🌸",
        "That's right! You should feel very proud! 💖",
        "Lovely! Your effort is really paying off! 🌟"
      ],
      energetic: [
        "BOOM! That was incredible! You're unstoppable! ⚡",
        "YES! You're crushing it! Keep going! 🚀",
        "WOW! That was lightning fast! Amazing! ⭐"
      ]
    },
    incorrect: {
      cheerful: [
        "That's okay! Learning is all about trying! Let's think together! 💭",
        "No worries! Every mistake helps us grow! You've got this! 🌱",
        "That's part of learning! I believe in you! 💪"
      ],
      wise: [
        "Hmm, let's think about this differently. What do you notice? 🤔",
        "Learning happens step by step. Let's try another approach! 📖",
        "Every great learner makes mistakes. They help us understand better! 🎓"
      ],
      playful: [
        "Oopsie! That's okay - let's play with this idea some more! 🎈",
        "No biggie! Let's have another go at it! 🎯",
        "That's alright! Learning is like a fun puzzle! 🧩"
      ],
      gentle: [
        "It's perfectly okay, dear. Let's take our time and try again! 🤗",
        "That's fine! Learning takes patience, and you're doing great! 🌺",
        "Don't worry at all. Let's explore this together gently! 🦋"
      ],
      energetic: [
        "No problem! Let's power through this together! 💥",
        "That's cool! Mistakes are just practice in disguise! ⚡",
        "All good! Let's charge ahead and try again! 🔋"
      ]
    },
    greeting: {
      cheerful: [
        "Hello there, sunshine! Ready for some fun learning? 🌞",
        "Hi buddy! I've been waiting to learn with you! 😊",
        "Welcome back! I missed you! Let's have an amazing time! 🎈"
      ],
      wise: [
        "Greetings, young scholar! What shall we discover today? 📚",
        "Hello! I sense great curiosity in you today! 🔍",
        "Welcome! Your mind is ready for new knowledge! 🧠"
      ],
      playful: [
        "Hey there, learning buddy! Time to play and learn! 🎪",
        "Hiya! Let's make learning super fun today! 🎨",
        "Hello! Ready for some awesome learning adventures? 🎢"
      ],
      gentle: [
        "Hello, dear friend. I'm so happy you're here! 🌸",
        "Hi there! Take your time, we'll learn together peacefully! 🌿",
        "Welcome! Let's have a gentle, wonderful learning time! 🕊️"
      ],
      energetic: [
        "HEY THERE! Ready to LEARN and GROW? Let's GO! ⚡",
        "HELLO! Time for some HIGH-ENERGY learning! 🚀",
        "HI! Let's make today AMAZING with super learning! 🌟"
      ]
    },
    goodbye: {
      cheerful: ["See you soon! Keep being awesome! 👋"],
      wise: ["Farewell, young scholar! Until we meet again! 📚"],
      playful: ["Bye bye! Can't wait to play again! 🎈"],
      gentle: ["Goodbye, dear friend. Rest well! 🌙"],
      energetic: ["BYE! You were AMAZING today! ⚡"]
    },
    encouragement: {
      cheerful: ["You're doing great! Keep it up! 🌟"],
      wise: ["Your progress is remarkable! 📚"],
      playful: ["Woohoo! You're a star! ⭐"],
      gentle: ["You're doing wonderfully! 💖"],
      energetic: ["KEEP GOING! You're AWESOME! 🚀"]
    },
    rest: {
      cheerful: ["I'll rest here while you think... 😴"],
      wise: ["Taking a moment to ponder... 🤔"],
      playful: ["Just chilling for a bit! 😊"],
      gentle: ["Resting peacefully... 🌙"],
      energetic: ["Recharging my energy! ⚡"]
    },
    idle: {
      cheerful: ["Ready when you are! 😊"],
      wise: ["Awaiting your next question... 📚"],
      playful: ["Let's go! 🎮"],
      gentle: ["Take your time... 🌸"],
      energetic: ["READY TO GO! ⚡"]
    }
  }

  const personalityResponses = responses[context]?.[buddy.personality] || responses['idle']?.[buddy.personality] || ["Great job!"]
  const randomResponse = personalityResponses[Math.floor(Math.random() * personalityResponses.length)]

  const animations: Record<string, string[]> = {
    correct: ['bounce', 'dance', 'cheer', 'spin'],
    incorrect: ['think', 'bounce'],
    greeting: ['bounce', 'dance'],
    goodbye: ['bounce'],
    encouragement: ['cheer', 'bounce'],
    rest: ['sleep'],
    idle: ['bounce']
  }

  return {
    type: context,
    text: randomResponse,
    animation: (animations[context]?.[Math.floor(Math.random() * animations[context].length)] || 'bounce') as BuddyResponse['animation'],
    emotion: buddy.mood,
    voiceTone: buddy.personality === 'energetic' ? 'excited' : 
               buddy.personality === 'gentle' ? 'gentle' : 
               buddy.personality === 'wise' ? 'curious' : 'excited'
  }
}

export const updateBuddyFromPerformance = (
  buddy: LearningBuddy,
  performance: {
    correct: boolean
    category: string
    timeSpent: number
    difficulty: string
  }
): LearningBuddy => {
  const updatedBuddy = { ...buddy }
  
  // Update experience and level
  updatedBuddy.experience += performance.correct ? 10 : 3
  if (updatedBuddy.experience >= updatedBuddy.level * 100) {
    updatedBuddy.level += 1
    updatedBuddy.experience = 0
  }
  
  // Update relationships
  if (performance.correct) {
    updatedBuddy.relationships.trustLevel = Math.min(100, updatedBuddy.relationships.trustLevel + 2)
    updatedBuddy.relationships.learningBond = Math.min(100, updatedBuddy.relationships.learningBond + 3)
  }
  
  // Update memories
  updatedBuddy.memories.totalSessions += 1
  updatedBuddy.memories.lastPlayTime = new Date()
  
  if (performance.correct && Math.random() > 0.7) {
    updatedBuddy.memories.bestSubject = performance.category
  }
  
  if (!performance.correct && Math.random() > 0.8) {
    updatedBuddy.memories.strugglingArea = performance.category
  }
  
  // Update mood based on performance
  if (performance.correct) {
    updatedBuddy.mood = updatedBuddy.relationships.learningBond > 70 ? 'proud' : 'happy'
  } else {
    updatedBuddy.mood = 'curious'
  }
  
  return updatedBuddy
}
