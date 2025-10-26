import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchDecks = createAsyncThunk("flashcards/fetchDecks", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/flashcards/decks")
    if (!response.ok) throw new Error("Failed to fetch decks")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createDeck = createAsyncThunk("flashcards/createDeck", async (deckData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/flashcards/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deckData),
    })
    if (!response.ok) throw new Error("Failed to create deck")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchCards = createAsyncThunk("flashcards/fetchCards", async (deckId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/flashcards/decks/${deckId}`)
    if (!response.ok) throw new Error("Failed to fetch cards")
    return await response.json()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateCard = createAsyncThunk(
  "flashcards/updateCard",
  async ({ cardId, updates }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to update card")
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const generateFlashcards = createAsyncThunk(
  "flashcards/generateFlashcards",
  async ({ deckId, topic, content }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, topic, content }),
      })
      if (!response.ok) throw new Error("Failed to generate flashcards")
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  decks: [],
  cards: [],
  currentDeck: null,
  loading: false,
  error: null,
  updating: false,
}

const flashcardsSlice = createSlice({
  name: "flashcards",
  initialState,
  reducers: {
    setCurrentDeck: (state, action) => {
      state.currentDeck = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDecks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDecks.fulfilled, (state, action) => {
        state.loading = false
        state.decks = action.payload
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createDeck.pending, (state) => {
        state.loading = true
      })
      .addCase(createDeck.fulfilled, (state, action) => {
        state.loading = false
        state.decks.push(action.payload)
      })
      .addCase(createDeck.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchCards.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false
        state.cards = action.payload
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateCard.pending, (state) => {
        state.updating = true
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.updating = false
        const index = state.cards.findIndex((c) => c._id === action.payload._id)
        if (index !== -1) {
          state.cards[index] = action.payload
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
      .addCase(generateFlashcards.pending, (state) => {
        state.loading = true
      })
      .addCase(generateFlashcards.fulfilled, (state, action) => {
        state.loading = false
        // Add generated cards to the cards array
        state.cards.push(...action.payload)
        // Update current deck's card count
        if (state.currentDeck) {
          state.currentDeck.cardCount = (state.currentDeck.cardCount || 0) + action.payload.length
        }
      })
      .addCase(generateFlashcards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setCurrentDeck, clearError } = flashcardsSlice.actions
export default flashcardsSlice.reducer
