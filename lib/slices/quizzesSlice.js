import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  quizzes: [
    {
      id: "1",
      title: "Algebra Fundamentals",
      description: "Test your knowledge on basic algebra concepts",
      fileId: "1",
      fileName: "Advanced Mathematics.pdf",
      chapter: "Chapter 2: Algebra Basics",
      chapterPages: "45-78",
      difficulty: "intermediate",
      category: "Mathematics",
      totalQuestions: 10,
      totalScore: 100,
      timeLimit: 30,
      questions: [
        {
          id: "q1",
          question: "What is the derivative of x²?",
          options: ["2x", "x", "2", "x²"],
          correct: 0,
          explanation: "Using the power rule: d/dx(x²) = 2x",
          difficulty: "easy",
        },
        {
          id: "q2",
          question: "Solve: 2x + 5 = 13",
          options: ["x = 4", "x = 9", "x = 3", "x = 6"],
          correct: 0,
          explanation: "2x = 13 - 5 = 8, so x = 4",
          difficulty: "easy",
        },
        {
          id: "q3",
          question: "What is the value of (3x + 2)² when x = 1?",
          options: ["25", "16", "9", "36"],
          correct: 0,
          explanation: "(3(1) + 2)² = (5)² = 25",
          difficulty: "intermediate",
        },
        {
          id: "q4",
          question: "Factor: x² - 5x + 6",
          options: ["(x-2)(x-3)", "(x-1)(x-6)", "(x+2)(x+3)", "(x-2)(x+3)"],
          correct: 0,
          explanation: "x² - 5x + 6 = (x-2)(x-3)",
          difficulty: "intermediate",
        },
        {
          id: "q5",
          question: "Solve the system: x + y = 5, x - y = 1",
          options: ["x=3, y=2", "x=2, y=3", "x=4, y=1", "x=1, y=4"],
          correct: 0,
          explanation: "Adding equations: 2x = 6, so x = 3, y = 2",
          difficulty: "intermediate",
        },
        {
          id: "q6",
          question: "What is the slope of the line 2x - 3y = 6?",
          options: ["2/3", "-2/3", "3/2", "-3/2"],
          correct: 0,
          explanation: "Rewrite as y = (2/3)x - 2, slope = 2/3",
          difficulty: "intermediate",
        },
        {
          id: "q7",
          question: "Expand: (x + 3)(x - 2)",
          options: ["x² + x - 6", "x² - x - 6", "x² + 5x - 6", "x² - 5x + 6"],
          correct: 0,
          explanation: "(x + 3)(x - 2) = x² - 2x + 3x - 6 = x² + x - 6",
          difficulty: "easy",
        },
        {
          id: "q8",
          question: "What is the discriminant of x² - 4x + 4?",
          options: ["0", "4", "-4", "16"],
          correct: 0,
          explanation: "b² - 4ac = (-4)² - 4(1)(4) = 16 - 16 = 0",
          difficulty: "intermediate",
        },
        {
          id: "q9",
          question: "Simplify: (2x³y²)/(4xy)",
          options: ["x²y/2", "xy/2", "x²y", "2xy"],
          correct: 0,
          explanation: "(2x³y²)/(4xy) = (2/4)(x³/x)(y²/y) = (1/2)x²y",
          difficulty: "intermediate",
        },
        {
          id: "q10",
          question: "What is the vertex of y = x² - 4x + 3?",
          options: ["(2, -1)", "(1, 0)", "(2, 1)", "(1, -1)"],
          correct: 0,
          explanation: "Vertex x = -b/2a = 4/2 = 2, y = 4 - 8 + 3 = -1",
          difficulty: "intermediate",
        },
      ],
      createdAt: new Date("2024-10-01"),
      status: "published",
    },
    {
      id: "2",
      title: "Chemistry Basics",
      description: "Fundamental concepts in chemistry",
      fileId: "2",
      fileName: "Physics Fundamentals.pdf",
      chapter: "Chapter 1: Introduction",
      chapterPages: "1-30",
      difficulty: "beginner",
      category: "Chemistry",
      totalQuestions: 8,
      totalScore: 80,
      timeLimit: 25,
      questions: [],
      createdAt: new Date("2024-10-05"),
      status: "published",
    },
  ],
  results: [
    {
      id: "r1",
      quizId: "1",
      score: 85,
      totalScore: 100,
      correctAnswers: 8,
      totalQuestions: 10,
      date: new Date("2024-10-15"),
      timeSpent: 28,
    },
    {
      id: "r2",
      quizId: "2",
      score: 72,
      totalScore: 80,
      correctAnswers: 6,
      totalQuestions: 8,
      date: new Date("2024-10-16"),
      timeSpent: 22,
    },
  ],
  generatingQuiz: false,
  generationError: null,
}

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    addQuiz: (state, action) => {
      state.quizzes.push({
        ...action.payload,
        createdAt: new Date(),
        status: "published",
      })
    },
    updateQuiz: (state, action) => {
      const index = state.quizzes.findIndex((q) => q.id === action.payload.id)
      if (index !== -1) {
        state.quizzes[index] = { ...state.quizzes[index], ...action.payload }
      }
    },
    deleteQuiz: (state, action) => {
      state.quizzes = state.quizzes.filter((q) => q.id !== action.payload)
    },
    addResult: (state, action) => {
      state.results.push(action.payload)
    },
    setGeneratingQuiz: (state, action) => {
      state.generatingQuiz = action.payload
    },
    setGenerationError: (state, action) => {
      state.generationError = action.payload
    },
  },
})

export const { addQuiz, updateQuiz, deleteQuiz, addResult, setGeneratingQuiz, setGenerationError } =
  quizzesSlice.actions
export default quizzesSlice.reducer
