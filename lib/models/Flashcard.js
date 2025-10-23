import mongoose from "mongoose"

const flashcardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      required: true,
    },
    back: {
      type: String,
      required: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
  },
  { timestamps: true },
)

export default mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema)
