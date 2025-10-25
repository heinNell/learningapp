
export interface QuizQuestion {
  id: string
  category: string
  question: string
  image?: string
  audio?: string
  options: string[]
  correctAnswer: string
  narration: string
}

export const quizData: QuizQuestion[] = [
  // Animals
  {
    id: 'animal_1',
    category: 'animals',
    question: 'What is this animal?',
    image: 'https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Lion', 'Tiger', 'Bear', 'Wolf'],
    correctAnswer: 'Lion',
    narration: 'What is this animal? Is it a Lion, Tiger, Bear, or Wolf?'
  },
  {
    id: 'animal_2',
    category: 'animals',
    question: 'What is this animal?',
    image: 'https://images.pexels.com/photos/213399/pexels-photo-213399.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Horse', 'Elephant', 'Rhino', 'Hippo'],
    correctAnswer: 'Elephant',
    narration: 'What is this animal? Is it a Horse, Elephant, Rhino, or Hippo?'
  },
  {
    id: 'animal_3',
    category: 'animals',
    question: 'What is this animal?',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Cat', 'Dog', 'Rabbit', 'Hamster'],
    correctAnswer: 'Dog',
    narration: 'What is this animal? Is it a Cat, Dog, Rabbit, or Hamster?'
  },
  {
    id: 'animal_4',
    category: 'animals',
    question: 'What is this animal?',
    image: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Dog', 'Cat', 'Mouse', 'Rat'],
    correctAnswer: 'Cat',
    narration: 'What is this animal? Is it a Dog, Cat, Mouse, or Rat?'
  },
  {
    id: 'animal_5',
    category: 'animals',
    question: 'What is this animal?',
    image: 'https://images.pexels.com/photos/750988/pexels-photo-750988.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Zebra', 'Horse', 'Giraffe', 'Deer'],
    correctAnswer: 'Giraffe',
    narration: 'What is this animal? Is it a Zebra, Horse, Giraffe, or Deer?'
  },

  // Fruits
  {
    id: 'fruit_1',
    category: 'fruits',
    question: 'What is this fruit?',
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Orange', 'Apple', 'Peach', 'Tomato'],
    correctAnswer: 'Apple',
    narration: 'What is this fruit? Is it an Orange, Apple, Peach, or Tomato?'
  },
  {
    id: 'fruit_2',
    category: 'fruits',
    question: 'What is this fruit?',
    image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Apple', 'Banana', 'Lemon', 'Corn'],
    correctAnswer: 'Banana',
    narration: 'What is this fruit? Is it an Apple, Banana, Lemon, or Corn?'
  },
  {
    id: 'fruit_3',
    category: 'fruits',
    question: 'What is this fruit?',
    image: 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Apple', 'Lemon', 'Orange', 'Peach'],
    correctAnswer: 'Orange',
    narration: 'What is this fruit? Is it an Apple, Lemon, Orange, or Peach?'
  },
  {
    id: 'fruit_4',
    category: 'fruits',
    question: 'What is this fruit?',
    image: 'https://images.pexels.com/photos/89778/strawberry-red-fruit-sweet-89778.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Cherry', 'Strawberry', 'Raspberry', 'Tomato'],
    correctAnswer: 'Strawberry',
    narration: 'What is this fruit? Is it a Cherry, Strawberry, Raspberry, or Tomato?'
  },
  {
    id: 'fruit_5',
    category: 'fruits',
    question: 'What is this fruit?',
    image: 'https://images.pexels.com/photos/197907/pexels-photo-197907.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Blueberry', 'Grape', 'Plum', 'Olive'],
    correctAnswer: 'Grape',
    narration: 'What is this fruit? Is it a Blueberry, Grape, Plum, or Olive?'
  },

  // Shapes
  {
    id: 'shape_1',
    category: 'shapes',
    question: 'What shape is this?',
    image: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Square', 'Circle', 'Triangle', 'Rectangle'],
    correctAnswer: 'Circle',
    narration: 'What shape is this? Is it a Square, Circle, Triangle, or Rectangle?'
  },
  {
    id: 'shape_2',
    category: 'shapes',
    question: 'What shape is this?',
    image: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Circle', 'Square', 'Triangle', 'Star'],
    correctAnswer: 'Square',
    narration: 'What shape is this? Is it a Circle, Square, Triangle, or Star?'
  },
  {
    id: 'shape_3',
    category: 'shapes',
    question: 'What shape is this?',
    image: 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Square', 'Circle', 'Triangle', 'Diamond'],
    correctAnswer: 'Triangle',
    narration: 'What shape is this? Is it a Square, Circle, Triangle, or Diamond?'
  },
  {
    id: 'shape_4',
    category: 'shapes',
    question: 'What shape is this?',
    image: 'https://images.pexels.com/photos/1029641/pexels-photo-1029641.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Square', 'Rectangle', 'Triangle', 'Circle'],
    correctAnswer: 'Rectangle',
    narration: 'What shape is this? Is it a Square, Rectangle, Triangle, or Circle?'
  },
  {
    id: 'shape_5',
    category: 'shapes',
    question: 'What shape is this?',
    image: 'https://images.pexels.com/photos/1029898/pexels-photo-1029898.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Circle', 'Square', 'Star', 'Heart'],
    correctAnswer: 'Star',
    narration: 'What shape is this? Is it a Circle, Square, Star, or Heart?'
  },

  // Colors
  {
    id: 'color_1',
    category: 'colors',
    question: 'What color is this?',
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Yellow', 'Red', 'Green', 'Blue'],
    correctAnswer: 'Red',
    narration: 'What color is this? Is it Yellow, Red, Green, or Blue?'
  },
  {
    id: 'color_2',
    category: 'colors',
    question: 'What color is this?',
    image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Red', 'Yellow', 'Green', 'Purple'],
    correctAnswer: 'Yellow',
    narration: 'What color is this? Is it Red, Yellow, Green, or Purple?'
  },
  {
    id: 'color_3',
    category: 'colors',
    question: 'What color is this?',
    image: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Red', 'Yellow', 'Blue', 'Green'],
    correctAnswer: 'Blue',
    narration: 'What color is this? Is it Red, Yellow, Blue, or Green?'
  },
  {
    id: 'color_4',
    category: 'colors',
    question: 'What color is this?',
    image: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Blue', 'Red', 'Green', 'Yellow'],
    correctAnswer: 'Green',
    narration: 'What color is this? Is it Blue, Red, Green, or Yellow?'
  },
  {
    id: 'color_5',
    category: 'colors',
    question: 'What color is this?',
    image: 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Yellow', 'Orange', 'Red', 'Pink'],
    correctAnswer: 'Orange',
    narration: 'What color is this? Is it Yellow, Orange, Red, or Pink?'
  },

  // Sounds - Animal Sounds
  {
    id: 'sound_1',
    category: 'sounds',
    question: 'What animal makes this sound?',
    audio: '/sounds/lion-roar.mp3',
    image: 'https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Lion', 'Tiger', 'Bear', 'Wolf'],
    correctAnswer: 'Lion',
    narration: 'Listen carefully. What animal makes this roaring sound?'
  },
  {
    id: 'sound_2',
    category: 'sounds',
    question: 'What animal makes this sound?',
    audio: '/sounds/dog-bark.mp3',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Cat', 'Dog', 'Sheep', 'Cow'],
    correctAnswer: 'Dog',
    narration: 'Listen to this sound. Which animal barks like this?'
  },
  {
    id: 'sound_3',
    category: 'sounds',
    question: 'What animal makes this sound?',
    audio: '/sounds/cat-meow.mp3',
    image: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Dog', 'Cat', 'Bird', 'Mouse'],
    correctAnswer: 'Cat',
    narration: 'What animal makes this meowing sound?'
  },
  {
    id: 'sound_4',
    category: 'sounds',
    question: 'What animal makes this sound?',
    audio: '/sounds/cow-moo.mp3',
    image: 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Horse', 'Cow', 'Sheep', 'Pig'],
    correctAnswer: 'Cow',
    narration: 'Listen! What farm animal makes this mooing sound?'
  },
  {
    id: 'sound_5',
    category: 'sounds',
    question: 'What animal makes this sound?',
    audio: '/sounds/bird-chirp.mp3',
    image: 'https://images.pexels.com/photos/349758/hummingbird-bird-birds-349758.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Cat', 'Dog', 'Bird', 'Frog'],
    correctAnswer: 'Bird',
    narration: 'What makes this chirping sound?'
  },

  // Sounds - Vehicle Sounds
  {
    id: 'sound_6',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/car-horn.mp3',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Car', 'Train', 'Boat', 'Airplane'],
    correctAnswer: 'Car',
    narration: 'Listen to this beep! What vehicle makes this honking sound?'
  },
  {
    id: 'sound_7',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/train-whistle.mp3',
    image: 'https://images.pexels.com/photos/2351883/pexels-photo-2351883.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Car', 'Train', 'Truck', 'Bus'],
    correctAnswer: 'Train',
    narration: 'Choo choo! What makes this whistle sound?'
  },
  {
    id: 'sound_8',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/airplane-engine.mp3',
    image: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Helicopter', 'Airplane', 'Rocket', 'Drone'],
    correctAnswer: 'Airplane',
    narration: 'Listen to this engine! What flies and makes this sound?'
  },
  {
    id: 'sound_9',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/boat-horn.mp3',
    image: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Car', 'Train', 'Boat', 'Truck'],
    correctAnswer: 'Boat',
    narration: 'What makes this deep horn sound on the water?'
  },
  {
    id: 'sound_10',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/siren.mp3',
    image: 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Police Car', 'Regular Car', 'Bicycle', 'Motorcycle'],
    correctAnswer: 'Police Car',
    narration: 'Listen! What emergency vehicle makes this siren sound?'
  },

  // Sounds - Environment & Nature
  {
    id: 'sound_11',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/rain.mp3',
    image: 'https://images.pexels.com/photos/459451/pexels-photo-459451.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Wind', 'Rain', 'Ocean', 'River'],
    correctAnswer: 'Rain',
    narration: 'Listen to this pitter-patter sound. What is it?'
  },
  {
    id: 'sound_12',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/thunder.mp3',
    image: 'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Thunder', 'Drum', 'Fireworks', 'Explosion'],
    correctAnswer: 'Thunder',
    narration: 'Boom! What makes this loud rumbling sound in the sky?'
  },
  {
    id: 'sound_13',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/ocean-waves.mp3',
    image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['River', 'Ocean', 'Waterfall', 'Fountain'],
    correctAnswer: 'Ocean',
    narration: 'Listen to these waves! What body of water makes this sound?'
  },
  {
    id: 'sound_14',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/wind.mp3',
    image: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Wind', 'Fan', 'Whistle', 'Flute'],
    correctAnswer: 'Wind',
    narration: 'Whoosh! What makes this blowing sound in nature?'
  },
  {
    id: 'sound_15',
    category: 'sounds',
    question: 'What makes this sound?',
    audio: '/sounds/bell.mp3',
    image: 'https://images.pexels.com/photos/2072039/pexels-photo-2072039.jpeg?auto=compress&cs=tinysrgb&w=400',
    options: ['Bell', 'Drum', 'Piano', 'Guitar'],
    correctAnswer: 'Bell',
    narration: 'Ding dong! What makes this ringing sound?'
  }
]

export const categories = [
  { id: 'animals', name: 'Animals', icon: '🦁', color: '#FF6B6B' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#4ECDC4' },
  { id: 'shapes', name: 'Shapes', icon: '⭐', color: '#45B7D1' },
  { id: 'colors', name: 'Colors', icon: '🌈', color: '#96CEB4' },
  { id: 'sounds', name: 'Sounds', icon: '🔊', color: '#FFEAA7' }
]
