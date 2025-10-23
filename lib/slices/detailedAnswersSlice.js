import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentQuestion: 0,
  expandedQuestions: [],
  aiExplanations: {},
  loadingExplanations: {},
}

const detailedAnswersSlice = createSlice({
  name: "detailedAnswers",
  initialState,
  reducers: {
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload
    },
    toggleExpandedQuestion: (state, action) => {
      const idx = state.expandedQuestions.indexOf(action.payload)
      if (idx > -1) {
        state.expandedQuestions.splice(idx, 1)
      } else {
        state.expandedQuestions.push(action.payload)
      }
    },
    setAIExplanation: (state, action) => {
      state.aiExplanations[action.payload.questionId] = action.payload.explanation
      state.loadingExplanations[action.payload.questionId] = false
    },
    setLoadingExplanation: (state, action) => {
      state.loadingExplanations[action.payload] = true
    },
    resetDetailedAnswers: (state) => {
      state.currentQuestion = 0
      state.expandedQuestions = []
      state.aiExplanations = {}
      state.loadingExplanations = {}
    },
  },
})

export const {
  setCurrentQuestion,
  toggleExpandedQuestion,
  setAIExplanation,
  setLoadingExplanation,
  resetDetailedAnswers,
} = detailedAnswersSlice.actions
export default detailedAnswersSlice.reducer
