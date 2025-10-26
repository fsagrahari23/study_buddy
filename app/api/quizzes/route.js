import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quiz from "@/lib/models/Quiz"
import Files from "@/lib/models/Files"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request) {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const quizzes = await Quiz.find({ createdBy: session.user.id }).sort({ createdAt: -1 })

        return NextResponse.json(quizzes)
    } catch (error) {
        console.error("Error fetching quizzes:", error)
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { fileId, chapter, difficulty, numQuestions } = await request.json()

        if (!fileId || !chapter || !difficulty || !numQuestions) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Get pineconeID from Files model
        const file = await Files.findById(fileId)
        if (!file || !file.pineconedoc_id) {
            return NextResponse.json({ error: "File not found or missing pinecone ID" }, { status: 404 })
        }

        // Call external API
        const apiResponse = await fetch("https://helper-function-103741319333.us-central1.run.app/gen_quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pineconeID: file.pineconedoc_id,
                topicName: chapter,
                difficulty: difficulty,
                numQuestions: parseInt(numQuestions),
            }),
        })

        if (!apiResponse.ok) {
            throw new Error(`External API error: ${apiResponse.status}`)
        }

        const apiData = await apiResponse.json()

        // Map API response to Quiz schema
        const questions = apiData.questions.map((q, index) => ({
            id: `q${index + 1}`,
            question: q.question_text,
            options: q.options,
            correctAnswer: q.correct_answer,
            explanation: "", // API doesn't provide explanation
            relatedConcepts: [], // API doesn't provide related concepts
        }))

        // Create quiz in database
        const quiz = new Quiz({
            title: apiData.title,
            description: `Quiz generated from ${file.name} - ${chapter}`,
            fileId: fileId,
            chapter: chapter,
            difficulty: difficulty,
            category: file.name.split(".")[0],
            questions: questions,
            timeLimit: Math.ceil(questions.length * 2.5), // 2.5 minutes per question
            passingScore: 60,
            createdBy: session.user.id,
        })

        const savedQuiz = await quiz.save()

        return NextResponse.json(savedQuiz, { status: 201 })
    } catch (error) {
        console.error("Error creating quiz:", error)
        return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
    }
}
