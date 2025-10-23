import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  files: [
    {
      id: "1",
      name: "Advanced Mathematics.pdf",
      pages: 245,
      uploadedAt: new Date("2024-10-15"),
      size: "12.5 MB",
    },
    {
      id: "2",
      name: "Physics Fundamentals.pdf",
      pages: 189,
      uploadedAt: new Date("2024-10-10"),
      size: "8.3 MB",
    },
  ],
  currentFile: null,
}

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    addFile: (state, action) => {
      state.files.push(action.payload)
    },
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload
    },
    deleteFile: (state, action) => {
      state.files = state.files.filter((f) => f.id !== action.payload)
    },
  },
})

export const { addFile, setCurrentFile, deleteFile } = filesSlice.actions
export default filesSlice.reducer
