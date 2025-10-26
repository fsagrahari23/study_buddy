import mongoose from "mongoose"

const milestoneSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    subjects: [{
        type: String,
        required: true,
    }],
    duration: {
        type: String,
        required: true,
    },
    tasks: [{
        type: String,
        required: true,
    }],
    completed: {
        type: Boolean,
        default: false,
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    completedAt: {
        type: Date,
    },
    startedAt: {
        type: Date,
    },
})

const recommendationSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    type: {
        type: String,

        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
    },
})

const subjectAnalysisSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    averageScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    totalQuizzes: {
        type: Number,
        default: 0,
    },
    weakTopics: [{
        topic: String,
        score: Number,
        frequency: Number,
    }],
    strongTopics: [{
        topic: String,
        score: Number,
        frequency: Number,
    }],
    improvement: {
        type: Number, // percentage improvement over time
        default: 0,
    },
})

const roadmapSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        milestones: [milestoneSchema],
        recommendations: [recommendationSchema],
        subjectAnalysis: [subjectAnalysisSchema],
        estimatedDuration: {
            type: String,
            required: true,
        },
        successRate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        overallProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        status: {
            type: String,

            default: "active",
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        // Activity stats at generation time
        generationStats: {
            totalStudyHours: Number,
            notesViewed: Number,
            flashcardsReviewed: Number,
            quizzesTaken: Number,
            averageScore: Number,
        },
    },
    { timestamps: true },
)

// Indexes for performance
roadmapSchema.index({ user: 1, status: 1 })
roadmapSchema.index({ user: 1, generatedAt: -1 })

// Virtual for completion percentage
roadmapSchema.virtual("completionPercentage").get(function () {
    if (this.milestones.length === 0) return 0
    const completedMilestones = this.milestones.filter(m => m.completed).length
    return Math.round((completedMilestones / this.milestones.length) * 100)
})

// Method to update progress
roadmapSchema.methods.updateProgress = function () {
    const totalMilestones = this.milestones.length
    if (totalMilestones === 0) {
        this.overallProgress = 0
        return
    }

    const completedMilestones = this.milestones.filter(m => m.completed).length
    const averageProgress = this.milestones.reduce((sum, m) => sum + m.progress, 0) / totalMilestones

    this.overallProgress = Math.round((completedMilestones / totalMilestones) * 100 + (averageProgress * 0.3))
    this.lastUpdated = new Date()

    if (this.overallProgress >= 100) {
        this.status = "completed"
        this.completedAt = new Date()
    }
}

// Method to complete milestone
roadmapSchema.methods.completeMilestone = function (milestoneId) {
    const milestone = this.milestones.find(m => m._id === milestoneId)
    if (milestone && !milestone.completed) {
        milestone.completed = true
        milestone.progress = 100
        milestone.completedAt = new Date()
        this.updateProgress()
    }
}

// Method to update milestone progress
roadmapSchema.methods.updateMilestoneProgress = function (milestoneId, progress) {
    const milestone = this.milestones.find(m => m._id === milestoneId)
    if (milestone) {
        milestone.progress = Math.min(100, Math.max(0, progress))
        if (progress >= 100 && !milestone.completed) {
            milestone.completed = true
            milestone.completedAt = new Date()
        }
        this.updateProgress()
    }
}

export default mongoose.models.Roadmap || mongoose.model("Roadmap", roadmapSchema)
