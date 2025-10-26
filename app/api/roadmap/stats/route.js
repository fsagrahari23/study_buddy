// /app/api/stats-simple/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import connectDB from "@/lib/mongodb"
import Activity from "../../../../lib/models/Activity"
import QuizResult from "../../../../lib/models/QuizResult"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request) {
    try {
        // Get user session
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const userId = session.user.id

        // Aggregate Study Hours & Notes Viewed from Activity
        const activityData = await Activity.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalStudyMs: {
                        $sum: {
                            $cond: [
                                { $in: ["$action", ["study_session_started", "study_session_ended"]] },
                                { $ifNull: ["$details.duration", 0] },
                                0,
                            ],
                        },
                    },
                    notesViewed: { $sum: { $cond: [{ $eq: ["$action", "note_viewed"] }, 1, 0] } },
                },
            },
        ])

        // Aggregate Quizzes Taken
        const quizData = await QuizResult.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    quizzesTaken: { $sum: 1 },
                    avgScore: { $avg: "$percentage" },
                },
            },
        ])

        const totalStudyHours = activityData[0]?.totalStudyMs
            ? Math.round((activityData[0].totalStudyMs / 3600000) * 100) / 100
            : 0
        const notesViewed = activityData[0]?.notesViewed ?? 0
        const quizzesTaken = quizData[0]?.quizzesTaken ?? 0
        const avgScore = quizData[0]?.avgScore ? Math.round(quizData[0].avgScore) : 0

        const stats = {
            studyHours: `${totalStudyHours}h`,
            avgScore: `${avgScore}%`,
            quizzesTaken,
            notesViewed,
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Error fetching simple stats:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
