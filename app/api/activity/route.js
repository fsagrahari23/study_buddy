import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import connectDB from "../../../lib/mongodb"
import Activity from "../../../lib/models/Activity"
import User from "../../../lib/models/User"

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit")) || 50
        const page = parseInt(searchParams.get("page")) || 1
        const skip = (page - 1) * limit

        // Fetch activities for the user
        const activities = await Activity.find({ user: session.user.id })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")

        // Calculate stats
        const totalActivities = await Activity.countDocuments({ user: session.user.id })

        const stats = await Activity.aggregate([
            { $match: { user: session.user.id } },
            {
                $group: {
                    _id: null,
                    totalStudyHours: {
                        $sum: {
                            $cond: [
                                { $in: ["$action", ["study_session_started", "study_session_ended"]] },
                                { $divide: [{ $ifNull: ["$details.duration", 0] }, 3600000] }, // Convert ms to hours
                                0,
                            ],
                        },
                    },
                    notesViewed: {
                        $sum: { $cond: [{ $eq: ["$action", "note_viewed"] }, 1, 0] },
                    },
                    flashcardsReviewed: {
                        $sum: { $cond: [{ $eq: ["$action", "flashcard_reviewed"] }, 1, 0] },
                    },
                    quizzesTaken: {
                        $sum: { $cond: [{ $eq: ["$action", "quiz_taken"] }, 1, 0] },
                    },
                    quizScores: {
                        $push: {
                            $cond: [
                                { $eq: ["$action", "quiz_completed"] },
                                "$details.score",
                                null,
                            ],
                        },
                    },
                },
            },
        ])

        const userStats = stats[0] || {
            totalStudyHours: 0,
            notesViewed: 0,
            flashcardsReviewed: 0,
            quizzesTaken: 0,
            quizScores: [],
        }

        // Calculate average score
        const validScores = userStats.quizScores.filter((score) => score !== null)
        const averageScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0

        // Subject stats (simplified - you can expand this based on your needs)
        const subjectStats = {} // Placeholder for subject-wise stats

        const response = {
            activities,
            stats: {
                totalStudyHours: Math.round(userStats.totalStudyHours * 100) / 100,
                notesViewed: userStats.notesViewed,
                flashcardsReviewed: userStats.flashcardsReviewed,
                quizzesTaken: userStats.quizzesTaken,
                averageScore: Math.round(averageScore * 100) / 100,
                subjectStats,
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalActivities / limit),
                totalActivities,
                hasNext: page * limit < totalActivities,
                hasPrev: page > 1,
            },
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error fetching activities:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const body = await request.json()
        const { action, details = {} } = body

        if (!action) {
            return NextResponse.json({ error: "Action is required" }, { status: 400 })
        }

        // Create new activity
        const activity = new Activity({
            user: session.user.id,
            action,
            details,
        })

        await activity.save()

        // Update user stats if necessary
        if (action === "study_session_ended" && details.duration) {
            await User.findByIdAndUpdate(session.user.id, {
                $inc: { totalStudyHours: details.duration / 3600000 }, // Convert ms to hours
            })
        }

        // Fetch updated stats
        const stats = await Activity.aggregate([
            { $match: { user: session.user.id } },
            {
                $group: {
                    _id: null,
                    totalStudyHours: {
                        $sum: {
                            $cond: [
                                { $in: ["$action", ["study_session_started", "study_session_ended"]] },
                                { $divide: [{ $ifNull: ["$details.duration", 0] }, 3600000] },
                                0,
                            ],
                        },
                    },
                    notesViewed: {
                        $sum: { $cond: [{ $eq: ["$action", "note_viewed"] }, 1, 0] },
                    },
                    flashcardsReviewed: {
                        $sum: { $cond: [{ $eq: ["$action", "flashcard_reviewed"] }, 1, 0] },
                    },
                    quizzesTaken: {
                        $sum: { $cond: [{ $eq: ["$action", "quiz_taken"] }, 1, 0] },
                    },
                    quizScores: {
                        $push: {
                            $cond: [
                                { $eq: ["$action", "quiz_completed"] },
                                "$details.score",
                                null,
                            ],
                        },
                    },
                },
            },
        ])

        const userStats = stats[0] || {
            totalStudyHours: 0,
            notesViewed: 0,
            flashcardsReviewed: 0,
            quizzesTaken: 0,
            quizScores: [],
        }

        const validScores = userStats.quizScores.filter((score) => score !== null)
        const averageScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0

        const subjectStats = {} // Placeholder

        const response = {
            activity,
            stats: {
                totalStudyHours: Math.round(userStats.totalStudyHours * 100) / 100,
                notesViewed: userStats.notesViewed,
                flashcardsReviewed: userStats.flashcardsReviewed,
                quizzesTaken: userStats.quizzesTaken,
                averageScore: Math.round(averageScore * 100) / 100,
                subjectStats,
            },
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error recording activity:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
