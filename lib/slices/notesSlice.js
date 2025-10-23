import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  notes: [
    {
      id: "1",
      title: "Calculus Summary",
      content: "# Derivatives\n\n- Rate of change\n- Power rule: d/dx(x^n) = nx^(n-1)",
      tags: ["calculus", "derivatives"],
      createdAt: new Date("2024-10-10"),
    },
    {
      id: "2",
      title: "Biology Notes",
      content: "# Cell Structure\n\n- Nucleus: contains DNA\n- Mitochondria: powerhouse of cell",
      tags: ["biology", "cells"],
      createdAt: new Date("2024-10-12"),
    },
  ],
}

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote: (state, action) => {
      state.notes.push(action.payload)
    },
    updateNote: (state, action) => {
      const index = state.notes.findIndex((n) => n.id === action.payload.id)
      if (index !== -1) {
        state.notes[index] = { ...state.notes[index], ...action.payload }
      }
    },
    deleteNote: (state, action) => {
      state.notes = state.notes.filter((n) => n.id !== action.payload)
    },
  },
})

export const { addNote, updateNote, deleteNote } = notesSlice.actions
export default notesSlice.reducer
