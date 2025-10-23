import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  roadmap: null,
  isGenerating: false,
  error: null,
  generatedAt: null,
  recommendations: [],
}

const roadmapSlice = createSlice({
  name: "roadmap",
  initialState,
  reducers: {
    generateRoadmapStart: (state) => {
      state.isGenerating = true
      state.error = null
    },
    generateRoadmapSuccess: (state, action) => {
      state.roadmap = action.payload.roadmap
      state.recommendations = action.payload.recommendations
      state.generatedAt = new Date().toISOString()
      state.isGenerating = false
    },
    generateRoadmapError: (state, action) => {
      state.error = action.payload
      state.isGenerating = false
    },
    updateRoadmapProgress: (state, action) => {
      if (state.roadmap) {
        const milestone = state.roadmap.milestones.find((m) => m.id === action.payload.milestoneId)
        if (milestone) {
          milestone.completed = action.payload.completed
          milestone.progress = action.payload.progress || 0
        }
      }
    },
  },
})

export const { generateRoadmapStart, generateRoadmapSuccess, generateRoadmapError, updateRoadmapProgress } =
  roadmapSlice.actions
export default roadmapSlice.reducer
