import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import filesReducer from "./slices/filesSlice"
import flashcardsReducer from "./slices/flashcardsSlice"
import quizzesReducer from "./slices/quizzesSlice"
import notesReducer from "./slices/notesSlice"
import chatsReducer from "./slices/chatsSlice"
import aiReducer from "./slices/aiSlice"
import eventsReducer from "./slices/eventsSlice"
import noteGenerationReducer from "./slices/noteGenerationSlice"
import activityReducer from "./slices/activitySlice"
import roadmapReducer from "./slices/roadmapSlice"
import marksheetReducer from "./slices/marksheetSlice"
import detailedAnswersReducer from "./slices/detailedAnswersSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer,
    flashcards: flashcardsReducer,
    quizzes: quizzesReducer,
    notes: notesReducer,
    chats: chatsReducer,
    ai: aiReducer,
    events: eventsReducer,
    noteGeneration: noteGenerationReducer,
    activity: activityReducer,
    roadmap: roadmapReducer,
    marksheet: marksheetReducer,
    detailedAnswers: detailedAnswersReducer,
  },
})
