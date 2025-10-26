import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ["user", "assistant"],
    },
    content: {
        type: String,
        required: true,
    },
    tool: {
        type: String,
        default: null,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
})

const chatSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        messages: [messageSchema],
    },
    { timestamps: true },
)

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema)
