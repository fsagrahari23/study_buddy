import mongoose from "mongoose"

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        questionId: String,
        selectedAnswer: String,
        isCorrect: Boolean,
      },
    ],
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    timeTaken: Number,
    status: {
      type: String,
      enum: ["completed", "incomplete", "abandoned"],
      default: "completed",
    },
  },
  { timestamps: true },
)

export default mongoose.models.QuizResult || mongoose.model("QuizResult", quizResultSchema)
