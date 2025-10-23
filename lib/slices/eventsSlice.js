import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  events: [],
  selectedNote: null,
  noteHistory: [],
}

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    selectNote: (state, action) => {
      state.selectedNote = action.payload
      // Add to history if not already there
      if (!state.noteHistory.find((n) => n.id === action.payload.id)) {
        state.noteHistory.push(action.payload)
      }
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null
    },
    addEvent: (state, action) => {
      state.events.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      })
    },
    clearHistory: (state) => {
      state.noteHistory = []
    },
  },
})

export const { selectNote, clearSelectedNote, addEvent, clearHistory } = eventsSlice.actions
export default eventsSlice.reducer
