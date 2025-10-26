import mongoose from "mongoose"


const Files = new mongoose.Schema({
    name: {
        type: String
    },
    pineconedoc_id: {
        type: String
    },
    topics: [String],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    url: {
        type: String
    },
    size: {
        type: String,
        default: "0 MB"
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
})


export default mongoose.models.Files || mongoose.model("Files", Files)