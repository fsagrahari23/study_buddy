import mongoose from "mongoose"

const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                "note_created",
                "note_viewed",
                "flashcard_reviewed",
                "quiz_taken",
                "quiz_completed",
                "study_session_started",
                "study_session_ended",
                "file_uploaded",
                "chat_message_sent",
                "roadmap_generated",
                "marksheet_viewed",
            ],
        },
        details: {
            type: mongoose.Schema.Types.Mixed, // Flexible object for additional data like duration, score, etc.
            default: {},
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
)

export default mongoose.models.Activity || mongoose.model("Activity", activitySchema)
