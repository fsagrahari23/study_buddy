import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchQuizzes = createAsyncThunk("quizzes/fetchQuizzes", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/quizzes")
    if (!response.ok) throw new Error("Failed to fetch quizzes")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createQuiz = createAsyncThunk("quizzes/createQuiz", async (quizData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    })
    if (!response.ok) throw new Error("Failed to create quiz")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const submitQuizAnswers = createAsyncThunk(
  "quizzes/submitAnswers",
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/quiz-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers }),
      })
      if (!response.ok) throw new Error("Failed to submit quiz")
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchQuizResults = createAsyncThunk("quizzes/fetchResults", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/quiz-results")
    console.log(response)
    if (!response.ok) throw new Error("Failed to fetch results")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  quizzes: [],
  results: [],
  currentQuiz: null,
  loading: false,
  error: null,
  submitting: false,
  generatingQuiz: false,
  generationError: null,
}

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setGeneratingQuiz: (state, action) => {
      state.generatingQuiz = action.payload
    },
    setGenerationError: (state, action) => {
      state.generationError = action.payload
    },
    addQuiz: (state, action) => {
      state.quizzes.push(action.payload)
    },
    addResult: (state, action) => {
      state.results.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false
        state.quizzes = action.payload
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createQuiz.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false
        state.quizzes.push(action.payload)
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(submitQuizAnswers.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitQuizAnswers.fulfilled, (state, action) => {
        state.submitting = false
        state.results.push(action.payload)
      })
      .addCase(submitQuizAnswers.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(fetchQuizResults.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setCurrentQuiz, clearError, setGeneratingQuiz, setGenerationError, addQuiz, addResult } = quizzesSlice.actions
export default quizzesSlice.reducer
