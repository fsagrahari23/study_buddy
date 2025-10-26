import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Deck from "@/lib/models/Deck"
import Flashcard from "@/lib/models/Flashcard"

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const resolvedParams = await params
        const { deckId } = resolvedParams

        await connectDB()

        // Verify deck ownership
        const deck = await Deck.findOne({ _id: deckId, userId: session.user.id })
        if (!deck) {
            return NextResponse.json({ error: "Deck not found" }, { status: 404 })
        }

        const cards = await Flashcard.find({ deckId, userId: session.user.id }).sort({ createdAt: 1 })

        return NextResponse.json(cards)
    } catch (error) {
        console.error("Error fetching cards:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const resolvedParams = await params
        const { deckId } = resolvedParams
        const { front, back, difficulty } = await request.json()

        if (!front || !back) {
            return NextResponse.json({ error: "Front and back content are required" }, { status: 400 })
        }

        await connectDB()

        // Verify deck ownership
        const deck = await Deck.findOne({ _id: deckId, userId: session.user.id })
        if (!deck) {
            return NextResponse.json({ error: "Deck not found" }, { status: 404 })
        }

        const card = new Flashcard({
            front,
            back,
            deckId,
            userId: session.user.id,
            difficulty: difficulty || "medium",
            nextReviewDate: new Date(),
        })

        await card.save()

        // Update deck card count
        await Deck.findByIdAndUpdate(deckId, { $inc: { cardCount: 1 } })

        return NextResponse.json(card, { status: 201 })
    } catch (error) {
        console.error("Error creating card:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
