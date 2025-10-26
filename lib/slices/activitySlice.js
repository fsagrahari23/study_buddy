import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchActivities = createAsyncThunk("activity/fetchActivities", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/activity")
    if (!response.ok) throw new Error("Failed to fetch activities")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const recordActivity = createAsyncThunk("activity/recordActivity", async (activityData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activityData),
    })
    if (!response.ok) throw new Error("Failed to record activity")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  activities: [],
  stats: {
    totalStudyHours: 0,
    notesViewed: 0,
    flashcardsReviewed: 0,
    quizzesTaken: 0,
    averageScore: 0,
    subjectStats: {},
  },
  loading: false,
  error: null,
}

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false
        state.activities = action.payload.activities
        state.stats = action.payload.stats
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(recordActivity.pending, (state) => {
        state.loading = true
      })
      .addCase(recordActivity.fulfilled, (state, action) => {
        state.loading = false
        state.activities.push(action.payload.activity)
        state.stats = action.payload.stats
      })
      .addCase(recordActivity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = activitySlice.actions
export default activitySlice.reducer
