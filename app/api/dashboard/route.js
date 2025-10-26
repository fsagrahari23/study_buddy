// app/api/dashboard/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"

import Activity from "@/lib/models/Activity"
import QuizResult from "@/lib/models/QuizResult"
import Note from "@/lib/models/Note"
import Roadmap from "@/lib/models/Roadmap"
import Deck from "@/lib/models/Deck"       // flashcard decks
import Files from "@/lib/models/Files"
import User from "@/lib/models/User"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const userId = session.user.id || session.user._id || session.user?.id

        // Activities (most recent 50)
        const activities = await Activity.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean()

        // Roadmap
        const roadmap = (await Roadmap.findOne({ userId }).lean()) || null

        // Notes
        const notes = await Note.find({ userId }).sort({ updatedAt: -1 }).limit(50).lean()

        // Quiz results (most recent 50)
        const quizzes = await QuizResult.find({ userId }).sort({ createdAt: -1 }).limit(50).lean()

        // Flashcard decks
        const flashcards = await Deck.find({ userId }).lean()

        // Files / uploaded PDFs
        const files = await Files.find({ userId }).sort({ createdAt: -1 }).lean()

        // User profile (light)
        const user = (await User.findById(userId).select("name email avatar").lean()) || {
            name: session.user.name,
            email: session.user.email,
        }

        // Compute stats using aggregation (study ms -> hours)
        const activityStats = await Activity.aggregate([
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
                    quizzesTaken: { $sum: { $cond: [{ $eq: ["$action", "quiz_taken"] }, 1, 0] } },
                    quizScores: {
                        $push: {
                            $cond: [{ $eq: ["$action", "quiz_completed"] }, "$details.score", null],
                        },
                    },
                },
            },
        ])


        const quizStats = await QuizResult.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalQuizzes: { $sum: 1 },
                    avgScore: { $avg: "$percentage" },
                    totalScore: { $sum: "$score" },
                    totalQuestions: { $sum: "$totalQuestions" },
                },
            },
        ])

        console.log(quizStats)

        const activityData = activityStats[0] || {
            totalStudyMs: 0,
            notesViewed: 0,
            quizzesTaken: 0,
            quizScores: [],
        }
        const quizData = quizStats[0] || {
            totalQuizzes: 0,
            avgScore: 0,
            totalScore: 0,
            totalQuestions: 0,
        }

        const validScores = (activityData.quizScores || []).filter((s) => s !== null)
        const activityAvgScore =
            validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0
        const overallAvgScore = quizData.avgScore || activityAvgScore

        const stats = {
            studyHours: Math.round((activityData.totalStudyMs / 3600000) * 100) / 100,
            avgScore: Math.round(overallAvgScore * 100) / 100,
            quizzesTaken: Math.max(activityData.quizzesTaken, quizData.totalQuizzes || 0),
            notesViewed: activityData.notesViewed || 0,
            totalQuizScore: quizData.totalScore || 0,
            totalQuizQuestions: quizData.totalQuestions || 0,
        }

        const payload = { stats, roadmap, notes, activities, quizzes, flashcards, files, user }

        return NextResponse.json(payload)
    } catch (error) {
        console.error("Error in /api/dashboard:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
