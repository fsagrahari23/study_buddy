import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import QuizResult from "@/lib/models/QuizResult"
import Quiz from "@/lib/models/Quiz"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request) {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const results = await QuizResult.find({ userId: session.user.id })
            .populate("quizId")
            .sort({ createdAt: -1 })
        console.log(results)

        return NextResponse.json(results)
    } catch (error) {
        console.error("Error fetching quiz results:", error)
        return NextResponse.json({ error: "Failed to fetch quiz results" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { quizId, answers } = await request.json()

        if (!quizId || !answers) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Get the quiz to calculate score
        const quiz = await Quiz.findById(quizId)
        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
        }

        // Calculate score
        let correctAnswers = 0
        const processedAnswers = answers.map((answer) => {
            const question = quiz.questions.find((q) => q.id === answer.questionId)
            const isCorrect = question && question.correctAnswer === answer.selectedAnswer

            if (isCorrect) {
                correctAnswers++
            }

            return {
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: isCorrect,
            }
        })

        const totalQuestions = quiz.questions.length
        const score = correctAnswers * 10 // 10 points per question
        const totalScore = totalQuestions * 10
        const percentage = Math.round((correctAnswers / totalQuestions) * 100)

        // Create quiz result
        const quizResult = new QuizResult({
            userId: session.user.id,
            quizId: quizId,
            answers: processedAnswers,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            timeTaken: 0, // TODO: Implement time tracking
            status: "completed",
        })

        const savedResult = await quizResult.save()

        return NextResponse.json(savedResult, { status: 201 })
    } catch (error) {
        console.error("Error submitting quiz:", error)
        return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
    }
}
