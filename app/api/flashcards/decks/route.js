import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Deck from "@/lib/models/Deck"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const decks = await Deck.find({ userId: session.user.id }).sort({ createdAt: -1 })

        return NextResponse.json(decks)
    } catch (error) {
        console.error("Error fetching decks:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { name, description } = await request.json()

        if (!name) {
            return NextResponse.json({ error: "Deck name is required" }, { status: 400 })
        }

        await connectDB()

        const deck = new Deck({
            name,
            description: description || "",
            userId: session.user.id,
        })

        await deck.save()

        return NextResponse.json(deck, { status: 201 })
    } catch (error) {
        console.error("Error creating deck:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
