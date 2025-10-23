import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  generatedNotes: [],
  currentGeneration: null,
  isGenerating: false,
  error: null,
  selectedChapters: {},
}

const noteGenerationSlice = createSlice({
  name: "noteGeneration",
  initialState,
  reducers: {
    startGeneration: (state, action) => {
      state.isGenerating = true
      state.error = null
      state.currentGeneration = {
        id: Date.now().toString(),
        fileId: action.payload.fileId,
        fileName: action.payload.fileName,
        chapters: action.payload.chapters,
        startedAt: new Date(),
        status: "generating",
      }
    },
    completeGeneration: (state, action) => {
      state.isGenerating = false
      if (state.currentGeneration) {
        state.currentGeneration.status = "completed"
        state.currentGeneration.completedAt = new Date()
        state.currentGeneration.content = action.payload.content
        state.generatedNotes.unshift(state.currentGeneration)
      }
    },
    failGeneration: (state, action) => {
      state.isGenerating = false
      state.error = action.payload
      if (state.currentGeneration) {
        state.currentGeneration.status = "failed"
      }
    },
    setSelectedChapters: (state, action) => {
      state.selectedChapters[action.payload.fileId] = action.payload.chapters
    },
    deleteGeneratedNote: (state, action) => {
      state.generatedNotes = state.generatedNotes.filter((n) => n.id !== action.payload)
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  startGeneration,
  completeGeneration,
  failGeneration,
  setSelectedChapters,
  deleteGeneratedNote,
  clearError,
} = noteGenerationSlice.actions
export default noteGenerationSlice.reducer
