
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
  }
]

export const categories = [
  { id: 'animals', name: 'Animals', icon: '🦁', color: '#FF6B6B' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#4ECDC4' },
  { id: 'shapes', name: 'Shapes', icon: '⭐', color: '#45B7D1' },
  { id: 'colors', name: 'Colors', icon: '🌈', color: '#96CEB4' },
  { id: 'sounds', name: 'Sounds', icon: '🔊', color: '#FFEAA7' }
]
