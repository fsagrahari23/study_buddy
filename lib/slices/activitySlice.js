import { createSlice } from "@reduxjs/toolkit"

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
}

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    trackActivity: (state, action) => {
      const activity = {
        id: Date.now(),
        type: action.payload.type, // 'note_view', 'flashcard_review', 'quiz_taken', 'note_generated'
        subject: action.payload.subject,
        duration: action.payload.duration || 0,
        score: action.payload.score || null,
        timestamp: new Date().toISOString(),
        details: action.payload.details || {},
      }

      state.activities.push(activity)

      // Update stats
      if (action.payload.type === "flashcard_review") {
        state.stats.flashcardsReviewed += 1
        state.stats.totalStudyHours += action.payload.duration / 60
      } else if (action.payload.type === "quiz_taken") {
        state.stats.quizzesTaken += 1
        state.stats.totalStudyHours += action.payload.duration / 60
        if (action.payload.score) {
          const scores = state.activities.filter((a) => a.type === "quiz_taken" && a.score).map((a) => a.score)
          state.stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
        }
      } else if (action.payload.type === "note_view") {
        state.stats.notesViewed += 1
        state.stats.totalStudyHours += action.payload.duration / 60
      }

      // Update subject stats
      if (action.payload.subject) {
        if (!state.stats.subjectStats[action.payload.subject]) {
          state.stats.subjectStats[action.payload.subject] = {
            timeSpent: 0,
            activities: 0,
            averageScore: 0,
          }
        }
        state.stats.subjectStats[action.payload.subject].timeSpent += action.payload.duration || 0
        state.stats.subjectStats[action.payload.subject].activities += 1
        if (action.payload.score) {
          state.stats.subjectStats[action.payload.subject].averageScore = action.payload.score
        }
      }
    },
    clearActivities: (state) => {
      state.activities = []
      state.stats = initialState.stats
    },
  },
})

export const { trackActivity, clearActivities } = activitySlice.actions
export default activitySlice.reducer
