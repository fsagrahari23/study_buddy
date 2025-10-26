import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import connectDB from "../../../lib/mongodb"
import Activity from "../../../lib/models/Activity"
import Roadmap from "../../../lib/models/Roadmap"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// GET - Fetch user's current roadmap
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const roadmap = await Roadmap.findOne({ user: session.user.id, status: "active" })
            .sort({ generatedAt: -1 })


        if (!roadmap) {
            return NextResponse.json({ message: "No active roadmap found" }, { status: 404 })
        }

        return NextResponse.json({
            roadmap: {
                id: roadmap._id,
                title: roadmap.title,
                description: roadmap.description,
                milestones: roadmap.milestones,
                estimatedDuration: roadmap.estimatedDuration,
                successRate: roadmap.successRate,
                overallProgress: roadmap.overallProgress,
                status: roadmap.status,
                generatedAt: roadmap.generatedAt,
            },
            recommendations: roadmap.recommendations,
            subjectAnalysis: roadmap.subjectAnalysis,
        })
    } catch (error) {
        console.error("Error fetching roadmap:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// POST - Generate new roadmap
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        // Check if user already has an active roadmap
        const existingRoadmap = await Roadmap.findOne({ user: session.user.id, status: "active" })
        if (existingRoadmap) {
            return NextResponse.json({ error: "User already has an active roadmap" }, { status: 400 })
        }

        // Fetch detailed activity stats with quiz performance analysis
        const activityStats = await Activity.aggregate([
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
                    quizResults: {
                        $push: {
                            $cond: [
                                { $eq: ["$action", "quiz_completed"] },
                                {
                                    score: "$details.score",
                                    subject: "$details.subject",
                                    topic: "$details.topic",
                                    totalQuestions: "$details.totalQuestions",
                                    correctAnswers: "$details.correctAnswers",
                                    timestamp: "$timestamp",
                                },
                                null,
                            ],
                        },
                    },
                },
            },
        ])

        const stats = activityStats[0] || {
            totalStudyHours: 0,
            notesViewed: 0,
            flashcardsReviewed: 0,
            quizzesTaken: 0,
            quizResults: [],
        }

        // Process quiz results for detailed analysis
        const validQuizResults = stats.quizResults.filter((r) => r !== null)
        const averageScore = validQuizResults.length > 0
            ? validQuizResults.reduce((sum, r) => sum + r.score, 0) / validQuizResults.length
            : 0

        // Analyze subject performance
        const subjectAnalysis = {}
        validQuizResults.forEach((result) => {
            if (result.subject) {
                if (!subjectAnalysis[result.subject]) {
                    subjectAnalysis[result.subject] = {
                        scores: [],
                        topics: {},
                        totalQuizzes: 0,
                    }
                }
                subjectAnalysis[result.subject].scores.push(result.score)
                subjectAnalysis[result.subject].totalQuizzes++

                // Track topic performance
                if (result.topic) {
                    if (!subjectAnalysis[result.subject].topics[result.topic]) {
                        subjectAnalysis[result.subject].topics[result.topic] = []
                    }
                    subjectAnalysis[result.subject].topics[result.topic].push(result.score)
                }
            }
        })

        // Process subject analysis for weak/strong areas
        const processedSubjectAnalysis = Object.keys(subjectAnalysis).map((subject) => {
            const subjData = subjectAnalysis[subject]
            const avgScore = subjData.scores.reduce((a, b) => a + b, 0) / subjData.scores.length

            // Identify weak and strong topics
            const topicPerformance = Object.keys(subjData.topics).map((topic) => {
                const scores = subjData.topics[topic]
                const avgTopicScore = scores.reduce((a, b) => a + b, 0) / scores.length
                return { topic, averageScore: avgTopicScore, attempts: scores.length }
            })

            const weakTopics = topicPerformance
                .filter((t) => t.averageScore < 70)
                .sort((a, b) => a.averageScore - b.averageScore)
                .slice(0, 3)

            const strongTopics = topicPerformance
                .filter((t) => t.averageScore >= 80)
                .sort((a, b) => b.averageScore - a.averageScore)
                .slice(0, 3)

            return {
                subject,
                averageScore: Math.round(avgScore * 100) / 100,
                totalQuizzes: subjData.totalQuizzes,
                weakTopics,
                strongTopics,
                improvement: 0, // Will be calculated based on historical data
            }
        })

        // Prepare comprehensive data for Gemini
        const analysisData = {
            totalStudyHours: Math.round(stats.totalStudyHours * 100) / 100,
            notesViewed: stats.notesViewed,
            flashcardsReviewed: stats.flashcardsReviewed,
            quizzesTaken: stats.quizzesTaken,
            averageScore: Math.round(averageScore * 100) / 100,
            subjectAnalysis: processedSubjectAnalysis,
            totalQuizResults: validQuizResults.length,
        }

        // Generate roadmap using Gemini with detailed analysis
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        const prompt = `
You are an AI study advisor. Based on the following comprehensive user activity and performance analysis, generate a detailed personalized learning roadmap in JSON format.

User Activity Stats:
- Total Study Hours: ${analysisData.totalStudyHours}
- Notes Viewed: ${analysisData.notesViewed}
- Flashcards Reviewed: ${analysisData.flashcardsReviewed}
- Quizzes Taken: ${analysisData.quizzesTaken}
- Average Quiz Score: ${analysisData.averageScore}%
- Total Quiz Results Analyzed: ${analysisData.totalQuizResults}

Subject-wise Performance Analysis:
${analysisData.subjectAnalysis.map(s => `
${s.subject}:
- Average Score: ${s.averageScore}%
- Total Quizzes: ${s.totalQuizzes}
- Weak Topics: ${s.weakTopics.map(t => `${t.topic} (${t.averageScore.toFixed(1)}%)`).join(', ') || 'None identified'}
- Strong Topics: ${s.strongTopics.map(t => `${t.topic} (${t.averageScore.toFixed(1)}%)`).join(', ') || 'None identified'}
`).join('\n')}

Generate a JSON response with the following structure:
{
  "roadmap": {
    "title": "Personalized Learning Roadmap",
    "description": "AI-generated based on your performance analysis",
    "milestones": [
      {
        "id": 1,
        "title": "Milestone Title",
        "description": "Detailed description focusing on weak areas",
        "subjects": ["subject1", "subject2"],
        "duration": "X weeks",
        "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"],
        "completed": false,
        "progress": 0
      }
    ],
    "estimatedDuration": "X weeks",
    "successRate": 85
  },
  "recommendations": [
    {
      "id": 1,
      "type": "focus|consistency|quiz|review|practice",
      "title": "Recommendation Title",
      "description": "Detailed recommendation based on weak/strong areas",
      "priority": "high|medium|low",
      "action": "Action Button Text"
    }
  ],
  "subjectAnalysis": [
    {
      "subject": "Subject Name",
      "averageScore": 85.5,
      "totalQuizzes": 10,
      "weakTopics": [
        {"topic": "Topic Name", "averageScore": 65.0, "frequency": 3}
      ],
      "strongTopics": [
        {"topic": "Topic Name", "averageScore": 92.0, "frequency": 2}
      ],
      "improvement": 5.2
    }
  ]
}

Guidelines:
- Create 4-6 milestones targeting weak subjects and topics
- Focus on improving weak areas while maintaining strong subjects
- Include specific, actionable tasks based on identified weak topics
- Provide detailed recommendations for improvement
- Success rate should be realistic based on current performance (70-95%)
- Make recommendations specific to weak/strong topic analysis
- Include practice strategies for identified weak areas
`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        let roadmapData
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error("No JSON found in response")
            }
            roadmapData = JSON.parse(jsonMatch[0])
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", parseError)
            console.error("Raw response:", text)
            return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 })
        }

        // Create and save roadmap in database
        const roadmap = new Roadmap({
            user: session.user.id,
            title: roadmapData.roadmap.title,
            description: roadmapData.roadmap.description,
            milestones: roadmapData.roadmap.milestones.map((milestone, index) => ({
                ...milestone,
                _id: `milestone_${index + 1}_${Date.now()}`,
            })),
            recommendations: roadmapData.recommendations,
            subjectAnalysis: roadmapData.subjectAnalysis || processedSubjectAnalysis,
            estimatedDuration: roadmapData.roadmap.estimatedDuration,
            successRate: roadmapData.roadmap.successRate,
            generationStats: {
                totalStudyHours: analysisData.totalStudyHours,
                notesViewed: analysisData.notesViewed,
                flashcardsReviewed: analysisData.flashcardsReviewed,
                quizzesTaken: analysisData.quizzesTaken,
                averageScore: analysisData.averageScore,
            },
        })

        await roadmap.save()

        // Record roadmap generation activity
        const activity = new Activity({
            user: session.user.id,
            action: "roadmap_generated",
            details: {
                roadmapId: roadmap._id,
                stats: analysisData,
            },
        })
        await activity.save()

        return NextResponse.json({
            roadmap: {
                id: roadmap._id,
                title: roadmap.title,
                description: roadmap.description,
                milestones: roadmap.milestones,
                estimatedDuration: roadmap.estimatedDuration,
                successRate: roadmap.successRate,
                overallProgress: roadmap.overallProgress,
                status: roadmap.status,
                generatedAt: roadmap.generatedAt,
            },
            recommendations: roadmap.recommendations,
            subjectAnalysis: roadmap.subjectAnalysis,
        })
    } catch (error) {
        console.error("Error generating roadmap:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
