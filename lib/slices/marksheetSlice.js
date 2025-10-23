import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  detailedAnalysis: null,
  selectedResultId: null,
  analysisLoading: false,
  analysisError: null,
  weakPointsCache: {},
}

const marksheetSlice = createSlice({
  name: "marksheet",
  initialState,
  reducers: {
    setSelectedResult: (state, action) => {
      state.selectedResultId = action.payload
    },
    setDetailedAnalysis: (state, action) => {
      state.detailedAnalysis = action.payload
      state.weakPointsCache[action.payload.resultId] = action.payload
    },
    setAnalysisLoading: (state, action) => {
      state.analysisLoading = action.payload
    },
    setAnalysisError: (state, action) => {
      state.analysisError = action.payload
    },
    clearAnalysis: (state) => {
      state.detailedAnalysis = null
      state.selectedResultId = null
      state.analysisError = null
    },
  },
})

export const { setSelectedResult, setDetailedAnalysis, setAnalysisLoading, setAnalysisError, clearAnalysis } =
  marksheetSlice.actions
export default marksheetSlice.reducer
