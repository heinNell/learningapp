
export interface FamilyMember {
  id: string
  name: string
  role: 'parent' | 'child' | 'sibling' | 'grandparent' | 'guardian'
  avatar: string
  age?: number
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard'
    categories: string[]
    participationStyle: 'active' | 'supportive' | 'observer'
  }
  stats: {
    sessionsPlayed: number
    questionsAnswered: number
    helpGiven: number
    encouragementGiven: number
  }
}

export interface FamilySession {
  id: string
  type: 'collaborative' | 'turn-based' | 'team-challenge' | 'story-time'
  participants: FamilyMember[]
  leader: string // member id
  category: string
  difficulty: 'mixed' | 'adaptive'
  duration: number // minutes
  specialRules?: {
    helpAllowed: boolean
    discussionTime: number
    drawingMode: boolean
    voiceAnswers: boolean
  }
}

export interface FamilyChallenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'seasonal' | 'milestone'
  requirements: {
    minParticipants: number
    categories: string[]
    targetScore: number
    timeLimit?: number
  }
  rewards: {
    familyBadge: string
    individualRewards: string[]
    unlockContent?: string
  }
  progress: {
    completed: boolean
    currentScore: number
    participatingMembers: string[]
  }
}

export const familyRoles = {
  parent: {
    name: 'Quiz Master',
    description: 'Guide and encourage, provide hints when needed',
    abilities: ['give_hints', 'adjust_difficulty', 'celebrate_progress', 'create_custom_questions'],
    avatar: '👨‍👩‍👧‍👦'
  },
  child: {
    name: 'Super Learner',
    description: 'The star of the show! Answer questions and explore',
    abilities: ['answer_questions', 'ask_for_help', 'choose_categories', 'express_creativity'],
    avatar: '🧒'
  },
  sibling: {
    name: 'Learning Partner',
    description: 'Team up, take turns, and support each other',
    abilities: ['team_answers', 'peer_support', 'friendly_competition', 'shared_celebrations'],
    avatar: '👫'
  },
  grandparent: {
    name: 'Wisdom Keeper',
    description: 'Share stories, provide gentle guidance, celebrate achievements',
    abilities: ['storytelling', 'gentle_encouragement', 'cultural_knowledge', 'patience_modeling'],
    avatar: '👴👵'
  }
}

export const familyActivities = [
  {
    id: 'collaborative_drawing',
    name: 'Family Drawing Challenge',
    description: 'Draw the answer together before choosing!',
    type: 'creative',
    minParticipants: 2,
    duration: 15,
    categories: ['animals', 'shapes', 'fruits'],
    instructions: [
      'Look at the question together',
      'Each family member adds to the drawing',
      'Discuss what you drew',
      'Choose the answer together',
      'Celebrate your teamwork!'
    ]
  },
  {
    id: 'story_creation',
    name: 'Learning Story Time',
    description: 'Create stories using quiz answers!',
    type: 'narrative',
    minParticipants: 2,
    duration: 20,
    categories: ['animals', 'colors', 'sounds'],
    instructions: [
      'Start with a quiz question',
      'Each person adds to the story using the answer',
      'Pass the story to the next person',
      'Continue until everyone contributes',
      'Read the complete story together!'
    ]
  },
  {
    id: 'memory_palace',
    name: 'Family Memory Palace',
    description: 'Build memories together using quiz content!',
    type: 'memory',
    minParticipants: 2,
    duration: 25,
    categories: ['shapes', 'colors', 'animals'],
    instructions: [
      'Choose a familiar place (like your house)',
      'Place quiz answers in different rooms',
      'Walk through together mentally',
      'Test each other on the locations',
      'Add new items as you learn!'
    ]
  }
]

export const generateFamilyChallenge = (
  familyMembers: FamilyMember[],
  type: 'daily' | 'weekly' | 'seasonal' = 'daily'
): FamilyChallenge => {
  const dailyChallenges = [
    {
      title: 'Morning Learning Circle',
      description: 'Start the day with 10 questions together!',
      targetScore: 7,
      categories: ['animals', 'fruits']
    },
    {
      title: 'Bedtime Story Quiz',
      description: 'End the day with gentle learning!',
      targetScore: 5,
      categories: ['colors', 'shapes']
    },
    {
      title: 'Kitchen Learning',
      description: 'Learn about fruits while cooking!',
      targetScore: 8,
      categories: ['fruits']
    }
  ]

  const weeklyChallenges = [
    {
      title: 'Family Learning Marathon',
      description: 'Complete 50 questions together this week!',
      targetScore: 50,
      categories: ['animals', 'fruits', 'shapes', 'colors', 'sounds']
    },
    {
      title: 'Teaching Challenge',
      description: 'Each family member teaches something new!',
      targetScore: 20,
      categories: ['animals', 'shapes']
    }
  ]

  const challenges = type === 'daily' ? dailyChallenges : weeklyChallenges
  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]

  return {
    id: `${type}_${Date.now()}`,
    title: randomChallenge.title,
    description: randomChallenge.description,
    type,
    requirements: {
      minParticipants: Math.min(2, familyMembers.length),
      categories: randomChallenge.categories,
      targetScore: randomChallenge.targetScore,
      timeLimit: type === 'daily' ? 30 : undefined
    },
    rewards: {
      familyBadge: `${randomChallenge.title} Champion`,
      individualRewards: ['Teamwork Star', 'Learning Helper', 'Question Master'],
      unlockContent: type === 'weekly' ? 'Special Family Story Mode' : undefined
    },
    progress: {
      completed: false,
      currentScore: 0,
      participatingMembers: []
    }
  }
}
