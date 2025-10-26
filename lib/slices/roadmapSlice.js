import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const generateRoadmap = createAsyncThunk("roadmap/generateRoadmap", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) throw new Error("Failed to generate roadmap")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchRoadmap = createAsyncThunk("roadmap/fetchRoadmap", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/roadmap")
    console.log("dghhg")
    if (!response.ok) throw new Error("Failed to fetch roadmap")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateMilestoneProgress = createAsyncThunk(
  "roadmap/updateMilestoneProgress",
  async ({ milestoneId, progress }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/roadmap/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, progress }),
      })
      if (!response.ok) throw new Error("Failed to update progress")
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const completeMilestone = createAsyncThunk(
  "roadmap/completeMilestone",
  async (milestoneId, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/roadmap/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      })
      if (!response.ok) throw new Error("Failed to complete milestone")
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const addCustomMilestone = createAsyncThunk(
  "roadmap/addCustomMilestone",
  async ({ title, description, subjects, duration, tasks }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/roadmap/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, subjects, duration, tasks }),
      })
      if (!response.ok) throw new Error("Failed to add custom milestone")
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  roadmap: null,
  isGenerating: false,
  isLoading: false,
  error: null,
  generatedAt: null,
  recommendations: [],
  subjectAnalysis: [],
}

const roadmapSlice = createSlice({
  name: "roadmap",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setRoadmap: (state, action) => {
      state.roadmap = action.payload.roadmap
      state.recommendations = action.payload.recommendations || []
      state.subjectAnalysis = action.payload.subjectAnalysis || []
      state.generatedAt = action.payload.generatedAt
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Roadmap
      .addCase(generateRoadmap.pending, (state) => {
        state.isGenerating = true
        state.error = null
      })
      .addCase(generateRoadmap.fulfilled, (state, action) => {
        state.roadmap = action.payload.roadmap
        state.recommendations = action.payload.recommendations || []
        state.subjectAnalysis = action.payload.subjectAnalysis || []
        state.generatedAt = new Date().toISOString()
        state.isGenerating = false
      })
      .addCase(generateRoadmap.rejected, (state, action) => {
        state.error = action.payload
        state.isGenerating = false
      })
      // Fetch Roadmap
      .addCase(fetchRoadmap.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRoadmap.fulfilled, (state, action) => {
        state.roadmap = action.payload.roadmap
        state.recommendations = action.payload.recommendations || []
        state.subjectAnalysis = action.payload.subjectAnalysis || []
        state.generatedAt = action.payload.generatedAt
        state.isLoading = false
      })
      .addCase(fetchRoadmap.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      // Update Progress
      .addCase(updateMilestoneProgress.fulfilled, (state, action) => {
        if (state.roadmap) {
          const milestone = state.roadmap.milestones.find((m) => m._id === action.payload.milestoneId)
          if (milestone) {
            milestone.progress = action.payload.progress
            if (action.payload.progress >= 100) {
              milestone.completed = true
              milestone.completedAt = new Date().toISOString()
            }
          }
        }
      })
      // Complete Milestone
      .addCase(completeMilestone.fulfilled, (state, action) => {
        if (state.roadmap) {
          const milestone = state.roadmap.milestones.find((m) => m._id === action.payload.milestoneId)
          if (milestone) {
            milestone.completed = true
            milestone.progress = 100
            milestone.completedAt = new Date().toISOString()
          }
        }
      })
      // Add Custom Milestone
      .addCase(addCustomMilestone.fulfilled, (state, action) => {
        if (state.roadmap && action.payload.milestone) {
          state.roadmap.milestones.push(action.payload.milestone)
          state.roadmap.lastUpdated = new Date().toISOString()
        }
      })
      .addCase(addCustomMilestone.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError, setRoadmap } = roadmapSlice.actions
export default roadmapSlice.reducer
