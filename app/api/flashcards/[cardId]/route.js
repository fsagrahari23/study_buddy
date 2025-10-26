import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Flashcard from "@/lib/models/Flashcard"

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const resolvedParams = await params
        const { cardId } = resolvedParams
        const updates = await request.json()

        await connectDB()

        // Verify card ownership
        const card = await Flashcard.findOne({ _id: cardId, userId: session.user.id })
        if (!card) {
            return NextResponse.json({ error: "Card not found" }, { status: 404 })
        }

        // Update card
        const updatedCard = await Flashcard.findByIdAndUpdate(
            cardId,
            {
                ...updates,
                lastReviewDate: new Date(),
                reviewCount: card.reviewCount + 1,
            },
            { new: true }
        )

        return NextResponse.json(updatedCard)
    } catch (error) {
        console.error("Error updating card:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const resolvedParams = await params
        const { cardId } = resolvedParams

        await connectDB()

        // Verify card ownership and get deckId for count update
        const card = await Flashcard.findOne({ _id: cardId, userId: session.user.id })
        if (!card) {
            return NextResponse.json({ error: "Card not found" }, { status: 404 })
        }

        // Delete card
        await Flashcard.findByIdAndDelete(cardId)

        // Update deck card count
        await require("mongoose").model("Deck").findByIdAndUpdate(card.deckId, { $inc: { cardCount: -1 } })

        return NextResponse.json({ message: "Card deleted successfully" })
    } catch (error) {
        console.error("Error deleting card:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
