import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { GoogleGenerativeAI } from "@google/generative-ai"
import connectDB from "@/lib/mongodb"
import Flashcard from "@/lib/models/Flashcard"
import Deck from "@/lib/models/Deck"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { deckId, topic, content } = await request.json()

        if (!deckId || !topic || !content) {
            return NextResponse.json({ error: "Deck ID, topic, and content are required" }, { status: 400 })
        }

        await connectDB()

        // Verify deck ownership
        const deck = await Deck.findOne({ _id: deckId, userId: session.user.id })
        if (!deck) {
            return NextResponse.json({ error: "Deck not found" }, { status: 404 })
        }

        // Generate flashcards using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        const prompt = `Generate 4-6 flashcards from the following content about "${topic}". Each flashcard should have a clear question and a concise answer. Format the response as a JSON array of objects with "question" and "answer" properties.

Content: ${content}

Please ensure the flashcards cover key concepts and are suitable for spaced repetition learning.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        let flashcards
        try {
            // Extract JSON from the response (Gemini might add extra text)
            const jsonMatch = text.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
                flashcards = JSON.parse(jsonMatch[0])
            } else {
                flashcards = JSON.parse(text)
            }
        } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError)
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
        }

        // Save flashcards to database
        const savedCards = []
        for (const card of flashcards) {
            const newCard = new Flashcard({
                front: card.question,
                back: card.answer,
                deckId,
                userId: session.user.id,
                difficulty: "medium",
                nextReviewDate: new Date(),
            })
            await newCard.save()
            savedCards.push(newCard)
        }

        // Update deck card count
        await Deck.findByIdAndUpdate(deckId, { $inc: { cardCount: savedCards.length } })

        return NextResponse.json(savedCards)
    } catch (error) {
        console.error("Error generating flashcards:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
