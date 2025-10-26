import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  files: [],
  currentFile: null,
}

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload
    },
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

export const { setFiles, addFile, setCurrentFile, deleteFile } = filesSlice.actions
export default filesSlice.reducer
