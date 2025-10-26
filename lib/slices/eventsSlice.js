import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchNoteDetails = createAsyncThunk("events/fetchNoteDetails", async (noteId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/notes/${noteId}`)
    if (!response.ok) throw new Error("Failed to fetch note details")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchEventHistory = createAsyncThunk("events/fetchHistory", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/events")
    if (!response.ok) throw new Error("Failed to fetch event history")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const logEvent = createAsyncThunk("events/logEvent", async (eventData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) throw new Error("Failed to log event")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  events: [],
  selectedNote: null,
  noteHistory: [],
  loading: false,
  error: null,
}

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    selectNote: (state, action) => {
      state.selectedNote = action.payload
      if (!state.noteHistory.find((n) => n.id === action.payload.id)) {
        state.noteHistory.push(action.payload)
      }
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null
    },
    clearHistory: (state) => {
      state.noteHistory = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoteDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNoteDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedNote = action.payload
        if (!state.noteHistory.find((n) => n.id === action.payload.id)) {
          state.noteHistory.push(action.payload)
        }
      })
      .addCase(fetchNoteDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchEventHistory.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchEventHistory.fulfilled, (state, action) => {
        state.loading = false
        state.events = action.payload
      })
      .addCase(fetchEventHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(logEvent.pending, (state) => {
        state.loading = true
      })
      .addCase(logEvent.fulfilled, (state, action) => {
        state.loading = false
        state.events.push(action.payload)
      })
      .addCase(logEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { selectNote, clearSelectedNote, clearHistory, clearError } = eventsSlice.actions
export default eventsSlice.reducer
