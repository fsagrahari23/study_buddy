
import mongoose from "mongoose"

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a quiz title"],
      trim: true,
    },
    description: String,
    fileId: {
      type: String,
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    category: String,
    questions: [
      {
        id: String,
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String,
        relatedConcepts: [String],
      },
    ],
    timeLimit: {
      type: Number,
      default: 30,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema)
