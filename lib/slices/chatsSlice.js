import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  chats: [
    {
      id: "1",
      title: "General Questions",
      folder: "General",
      messages: [
        { role: "user", text: "How can I improve my study efficiency?", tool: "tips" },
        { role: "assistant", text: "Here are some effective study strategies...", tool: "tips" },
      ],
      tags: ["study", "tips"],
      createdAt: new Date("2024-10-15"),
    },
    {
      id: "2",
      title: "Math Help",
      folder: "Mathematics",
      messages: [
        { role: "user", text: "Explain quadratic equations", tool: "explain" },
        { role: "assistant", text: "Quadratic equations are polynomial equations of degree 2...", tool: "explain" },
      ],
      tags: ["math", "algebra"],
      createdAt: new Date("2024-10-14"),
    },
  ],
}

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    addChat: (state, action) => {
      state.chats.push(action.payload)
    },
    addMessage: (state, action) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.messages.push(action.payload.message)
      }
    },
    moveChat: (state, action) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.folder = action.payload.folder
      }
    },
  },
})

export const { addChat, addMessage, moveChat } = chatsSlice.actions
export default chatsSlice.reducer
