import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  generatedFlashcards: [],
  aiResponses: {},
  loading: false,
  error: null,
}

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    addGeneratedFlashcards: (state, action) => {
      state.generatedFlashcards.push(...action.payload)
    },
    setAiResponse: (state, action) => {
      state.aiResponses[action.payload.id] = action.payload.response
    },
    clearGeneratedFlashcards: (state) => {
      state.generatedFlashcards = []
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setLoading, addGeneratedFlashcards, setAiResponse, clearGeneratedFlashcards, setError } = aiSlice.actions
export default aiSlice.reducer
