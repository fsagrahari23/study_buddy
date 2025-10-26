import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Note from "@/lib/models/Note"

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const shortNotes = await Note.find({
            userId: session.user.id,
            isShort: true
        }).sort({ createdAt: -1 })

        return NextResponse.json({ notes: shortNotes })
    } catch (error) {
        console.error("Error fetching short notes:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { title, content, category, tags } = await request.json()

        if (!title || !content) {
            return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
        }

        await connectDB()

        const newNote = new Note({
            title,
            content,
            category: category || "General",
            tags: tags || [],
            userId: session.user.id,
            isShort: true,
            readTime: Math.ceil(content.length / 200), // Rough estimate: 200 chars per minute
        })

        await newNote.save()

        return NextResponse.json({ note: newNote }, { status: 201 })
    } catch (error) {
        console.error("Error creating short note:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
