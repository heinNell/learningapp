
export interface Character {
  id: string
  name: string
  avatar: string
  personality: 'friendly' | 'wise' | 'playful' | 'brave' | 'curious'
  catchphrase: string
  introduction: string
  encouragement: string[]
  celebration: string[]
  comfort: string[]
}

export interface StoryChapter {
  id: string
  title: string
  description: string
  setting: string
  backgroundImage: string
  unlockRequirement: number // stars needed to unlock
  questionsNeeded: number
  completionReward: string
}

export interface Adventure {
  id: string
  categoryId: string
  title: string
  description: string
  character: Character
  chapters: StoryChapter[]
  finalReward: string
}

export const characters: Character[] = [
  {
    id: 'leo_lion',
    name: 'Leo the Lion',
    avatar: '🦁',
    personality: 'brave',
    catchphrase: 'Roar with knowledge!',
    introduction: "Greetings, young explorer! I'm Leo, the bravest lion in the Animal Kingdom. Join me on a wild safari adventure!",
    encouragement: [
      "You're as brave as a lion!",
      "Keep exploring, young adventurer!",
      "Your curiosity makes you stronger!",
      "Every great explorer makes mistakes - let's try again!"
    ],
    celebration: [
      "Magnificent! You've earned your explorer stripes!",
      "Roar-some job! The animals are impressed!",
      "You're becoming a true wildlife expert!",
      "Outstanding! Even the king of the jungle is proud!"
    ],
    comfort: [
      "Don't worry, every great explorer learns from their journey!",
      "The best adventurers never give up!",
      "You're doing great - let's discover more together!"
    ]
  },
  {
    id: 'ruby_rabbit',
    name: 'Ruby the Rabbit',
    avatar: '🐰',
    personality: 'friendly',
    catchphrase: 'Hop into learning!',
    introduction: "Hi there! I'm Ruby, and I love hopping through the Magical Garden! Want to discover the most delicious fruits with me?",
    encouragement: [
      "You're berry good at this!",
      "Keep hopping toward success!",
      "Your learning is growing like a beautiful garden!",
      "Every seed of knowledge will bloom!"
    ],
    celebration: [
      "Fan-tas-tic! You've harvested great knowledge!",
      "Sweet success! You know your fruits!",
      "You're the best garden helper ever!",
      "Absolutely a-peel-ing work!"
    ],
    comfort: [
      "Don't worry, every garden needs time to grow!",
      "The sweetest fruits come to those who keep trying!",
      "You're planting seeds of wisdom!"
    ]
  },
  {
    id: 'stella_star',
    name: 'Stella the Star',
    avatar: '⭐',
    personality: 'wise',
    catchphrase: 'Shape your destiny!',
    introduction: "Welcome to the Cosmic Shape Realm! I'm Stella, your guide through the geometric wonders of the universe!",
    encouragement: [
      "You're shaping up to be amazing!",
      "Your mind is as bright as a star!",
      "Every shape tells a cosmic story!",
      "The universe believes in you!"
    ],
    celebration: [
      "Stellar performance! You've mastered the shapes!",
      "You're a geometric genius!",
      "The cosmos celebrates your wisdom!",
      "Shape-tacular! You're a star!"
    ],
    comfort: [
      "Even stars need time to shine their brightest!",
      "The universe is patient with all learners!",
      "Your potential is infinite like space itself!"
    ]
  },
  {
    id: 'rainbow_phoenix',
    name: 'Rainbow the Phoenix',
    avatar: '🌈',
    personality: 'playful',
    catchphrase: 'Paint the world with colors!',
    introduction: "Hello, little artist! I'm Rainbow, the Phoenix of Colors! Let's paint the world with knowledge and joy!",
    encouragement: [
      "You're adding beautiful colors to the world!",
      "Your learning palette is expanding!",
      "Every color has its own magic!",
      "Keep painting your path to success!"
    ],
    celebration: [
      "Brilliant! You've created a masterpiece of knowledge!",
      "Color-ful job! You're a rainbow of talent!",
      "You've painted success with flying colors!",
      "Vibrant victory! You shine like a rainbow!"
    ],
    comfort: [
      "Every great artist starts with simple strokes!",
      "Colors are more beautiful when we take our time!",
      "Your creative spirit will guide you!"
    ]
  },
  {
    id: 'echo_owl',
    name: 'Echo the Owl',
    avatar: '🦉',
    personality: 'curious',
    catchphrase: 'Listen to learn!',
    introduction: "Hoot hoot! I'm Echo, the wisest owl in the Sound Forest! Let's explore the magical world of sounds together!",
    encouragement: [
      "Your ears are getting sharper!",
      "You're becoming a sound detective!",
      "Every sound tells a story!",
      "Listen carefully - wisdom is all around!"
    ],
    celebration: [
      "Hoot-ray! You've mastered the sounds!",
      "Sound-sational! Your ears are amazing!",
      "You've solved the mystery of sounds!",
      "Wise work! You're as clever as an owl!"
    ],
    comfort: [
      "The forest is patient with all young listeners!",
      "Every sound expert started just like you!",
      "Your curiosity will lead you to success!"
    ]
  }
]

export const adventures: Adventure[] = [
  {
    id: 'safari_adventure',
    categoryId: 'animals',
    title: 'The Great Safari Adventure',
    description: 'Join Leo the Lion on an epic journey through different habitats to meet amazing animals!',
    character: characters[0], // Leo
    chapters: [
      {
        id: 'jungle_expedition',
        title: 'Jungle Expedition',
        description: 'Venture deep into the lush jungle to discover its wild inhabitants!',
        setting: 'Dense jungle with towering trees and mysterious sounds',
        backgroundImage: 'https://images.pexels.com/photos/975771/pexels-photo-975771.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 0,
        questionsNeeded: 3,
        completionReward: 'Jungle Explorer Badge'
      },
      {
        id: 'savanna_quest',
        title: 'Savanna Quest',
        description: 'Cross the vast savanna to meet the majestic creatures of the plains!',
        setting: 'Golden grasslands stretching to the horizon under the African sun',
        backgroundImage: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 5,
        questionsNeeded: 4,
        completionReward: 'Savanna Ranger Badge'
      },
      {
        id: 'ocean_depths',
        title: 'Ocean Depths',
        description: 'Dive into the mysterious ocean to discover marine life!',
        setting: 'Crystal blue waters teeming with colorful sea creatures',
        backgroundImage: 'https://images.pexels.com/photos/1001594/pexels-photo-1001594.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 15,
        questionsNeeded: 3,
        completionReward: 'Ocean Explorer Badge'
      }
    ],
    finalReward: 'Master Wildlife Guardian Certificate'
  },
  {
    id: 'garden_adventure',
    categoryId: 'fruits',
    title: 'The Magical Garden Quest',
    description: 'Help Ruby the Rabbit tend to the enchanted fruit garden and learn about delicious fruits!',
    character: characters[1], // Ruby
    chapters: [
      {
        id: 'orchard_awakening',
        title: 'Orchard Awakening',
        description: 'Wake up the sleepy orchard and help the fruit trees bloom!',
        setting: 'A magical orchard with sparkling fruit trees',
        backgroundImage: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 0,
        questionsNeeded: 3,
        completionReward: 'Garden Helper Badge'
      },
      {
        id: 'berry_patch_mystery',
        title: 'Berry Patch Mystery',
        description: 'Solve the mystery of the missing berries in the enchanted berry patch!',
        setting: 'A colorful patch filled with berry bushes and friendly garden creatures',
        backgroundImage: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 8,
        questionsNeeded: 4,
        completionReward: 'Berry Detective Badge'
      },
      {
        id: 'harvest_festival',
        title: 'Grand Harvest Festival',
        description: 'Celebrate the harvest with all the garden friends!',
        setting: 'A festive garden party with fruits, flowers, and celebration',
        backgroundImage: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 20,
        questionsNeeded: 3,
        completionReward: 'Harvest Master Badge'
      }
    ],
    finalReward: 'Master Gardener Certificate'
  },
  {
    id: 'cosmic_adventure',
    categoryId: 'shapes',
    title: 'The Cosmic Shape Journey',
    description: 'Travel through space with Stella the Star to discover geometric wonders across the universe!',
    character: characters[2], // Stella
    chapters: [
      {
        id: 'planet_discovery',
        title: 'Planet Discovery',
        description: 'Explore different planets, each with unique geometric features!',
        setting: 'Colorful alien planets with geometric landscapes',
        backgroundImage: 'https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 0,
        questionsNeeded: 3,
        completionReward: 'Space Explorer Badge'
      },
      {
        id: 'constellation_creation',
        title: 'Constellation Creation',
        description: 'Connect the stars to create beautiful shape constellations!',
        setting: 'The vast cosmos with twinkling stars waiting to be connected',
        backgroundImage: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 10,
        questionsNeeded: 4,
        completionReward: 'Star Mapper Badge'
      },
      {
        id: 'galaxy_architect',
        title: 'Galaxy Architect',
        description: 'Design your own galaxy using the power of geometric shapes!',
        setting: 'A cosmic workshop where galaxies are born from geometric patterns',
        backgroundImage: 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 25,
        questionsNeeded: 3,
        completionReward: 'Galaxy Builder Badge'
      }
    ],
    finalReward: 'Master Cosmic Architect Certificate'
  },
  {
    id: 'rainbow_adventure',
    categoryId: 'colors',
    title: 'The Rainbow Phoenix Quest',
    description: 'Join Rainbow the Phoenix on a magical journey to restore colors to the world!',
    character: characters[3], // Rainbow
    chapters: [
      {
        id: 'color_kingdom',
        title: 'The Faded Kingdom',
        description: 'Help bring color back to the kingdom that lost its hues!',
        setting: 'A once-colorful kingdom now in grayscale, waiting for color magic',
        backgroundImage: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 0,
        questionsNeeded: 3,
        completionReward: 'Color Restorer Badge'
      },
      {
        id: 'prism_palace',
        title: 'The Prism Palace',
        description: 'Navigate through the magical prism palace where colors dance and play!',
        setting: 'A crystalline palace where light refracts into beautiful rainbows',
        backgroundImage: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 12,
        questionsNeeded: 4,
        completionReward: 'Prism Master Badge'
      },
      {
        id: 'rainbow_celebration',
        title: 'The Great Rainbow Celebration',
        description: 'Celebrate the return of colors with a magnificent rainbow festival!',
        setting: 'A vibrant celebration with rainbows, fireworks, and colorful joy',
        backgroundImage: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 30,
        questionsNeeded: 3,
        completionReward: 'Rainbow Guardian Badge'
      }
    ],
    finalReward: 'Master Color Phoenix Certificate'
  },
  {
    id: 'sound_adventure',
    categoryId: 'sounds',
    title: 'The Enchanted Sound Forest',
    description: 'Explore the mystical Sound Forest with Echo the Owl to discover the secrets of every sound!',
    character: characters[4], // Echo
    chapters: [
      {
        id: 'whispering_woods',
        title: 'The Whispering Woods',
        description: 'Listen carefully to the gentle sounds of the forest awakening!',
        setting: 'A peaceful forest where every leaf and branch creates gentle melodies',
        backgroundImage: 'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 0,
        questionsNeeded: 3,
        completionReward: 'Forest Listener Badge'
      },
      {
        id: 'echo_caverns',
        title: 'The Echo Caverns',
        description: 'Venture into mysterious caverns where sounds bounce and multiply!',
        setting: 'Mystical caverns with crystal formations that amplify every sound',
        backgroundImage: 'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 15,
        questionsNeeded: 4,
        completionReward: 'Echo Master Badge'
      },
      {
        id: 'symphony_summit',
        title: 'Symphony Summit',
        description: 'Reach the highest peak where all the sounds of nature create a grand symphony!',
        setting: 'A majestic mountain peak where all sounds unite in perfect harmony',
        backgroundImage: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
        unlockRequirement: 35,
        questionsNeeded: 3,
        completionReward: 'Symphony Conductor Badge'
      }
    ],
    finalReward: 'Master Sound Sage Certificate'
  }
]

export const getAdventureByCategory = (categoryId: string): Adventure | undefined => {
  return adventures.find(adventure => adventure.categoryId === categoryId)
}

export const getUnlockedChapters = (adventure: Adventure, stars: number): StoryChapter[] => {
  return adventure.chapters.filter(chapter => stars >= chapter.unlockRequirement)
}

export const getCurrentChapter = (adventure: Adventure, stars: number): StoryChapter | null => {
  const unlockedChapters = getUnlockedChapters(adventure, stars)
  if (unlockedChapters.length === 0) return adventure.chapters[0]
  
  // Return the last unlocked chapter that hasn't been completed yet
  return unlockedChapters[unlockedChapters.length - 1]
}
