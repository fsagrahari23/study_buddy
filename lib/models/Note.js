import mongoose from "mongoose"

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a note title"],
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: String,
    tags: [String],
    fileId: String,
    chapter: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isShort: {
      type: Boolean,
      default: false,
    },
    readTime: Number,
  },
  { timestamps: true },
)

export default mongoose.models.Note || mongoose.model("Note", noteSchema)
