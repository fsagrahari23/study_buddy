import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  chats: [], // array of {id: fileId, messages: []}
  currentFileChat: null,
}

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setFileChat: (state, action) => {
      const { fileId, messages } = action.payload
      const existingChat = state.chats.find(chat => chat.id === fileId)
      if (existingChat) {
        existingChat.messages = messages || []
      } else {
        state.chats.push({ id: fileId, messages: messages || [] })
      }
      state.currentFileChat = fileId
    },
    addMessageToFileChat: (state, action) => {
      const { fileId, message } = action.payload
      const chat = state.chats.find(chat => chat.id === fileId)
      if (chat) {
        chat.messages.push(message)
      } else {
        state.chats.push({ id: fileId, messages: [message] })
      }
    },
    loadFileChat: (state, action) => {
      const { fileId } = action.payload
      const stored = localStorage.getItem(`chat_${fileId}`)
      const messages = stored ? JSON.parse(stored) : []
      const existingChat = state.chats.find(chat => chat.id === fileId)
      if (existingChat) {
        existingChat.messages = messages
      } else {
        state.chats.push({ id: fileId, messages })
      }
      state.currentFileChat = fileId
    },
    saveFileChat: (state, action) => {
      const { fileId } = action.payload
      const chat = state.chats.find(chat => chat.id === fileId)
      if (chat) {
        localStorage.setItem(`chat_${fileId}`, JSON.stringify(chat.messages))
      }
    },
  },
})

export const { setFileChat, addMessageToFileChat, loadFileChat, saveFileChat } = chatsSlice.actions
export default chatsSlice.reducer
