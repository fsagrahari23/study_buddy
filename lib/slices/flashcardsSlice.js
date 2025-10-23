import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  decks: [
    {
      id: "1",
      name: "Algebra Basics",
      cards: 24,
      dueToday: 8,
      createdAt: new Date("2024-09-20"),
    },
    {
      id: "2",
      name: "Chemistry Reactions",
      cards: 18,
      dueToday: 5,
      createdAt: new Date("2024-09-25"),
    },
  ],
  cards: [
    {
      id: "c1",
      deckId: "1",
      question: "What is the quadratic formula?",
      answer: "x = (-b ± √(b² - 4ac)) / 2a",
      easiness: 2.5,
      interval: 3,
      repetitions: 2,
      dueDate: new Date(),
    },
    {
      id: "c2",
      deckId: "1",
      question: "Solve: 2x + 5 = 13",
      answer: "x = 4",
      easiness: 2.3,
      interval: 1,
      repetitions: 1,
      dueDate: new Date(),
    },
  ],
  currentDeck: null,
}

const flashcardsSlice = createSlice({
  name: "flashcards",
  initialState,
  reducers: {
    addDeck: (state, action) => {
      state.decks.push(action.payload)
    },
    addCard: (state, action) => {
      state.cards.push(action.payload)
    },
    updateCard: (state, action) => {
      const index = state.cards.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.cards[index] = { ...state.cards[index], ...action.payload }
      }
    },
    setCurrentDeck: (state, action) => {
      state.currentDeck = action.payload
    },
  },
})

export const { addDeck, addCard, updateCard, setCurrentDeck } = flashcardsSlice.actions
export default flashcardsSlice.reducer
