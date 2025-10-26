import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Note from "@/lib/models/Note"

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { noteId } = params
        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
        }

        await connectDB()

        const note = await Note.findOne({
            _id: noteId,
            userId: session.user.id,
            isShort: true
        })

        if (!note) {
            return NextResponse.json({ error: "Short note not found" }, { status: 404 })
        }

        return NextResponse.json({ note })
    } catch (error) {
        console.error("Error fetching short note:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { noteId } = params
        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
        }

        await connectDB()

        const deletedNote = await Note.findOneAndDelete({
            _id: noteId,
            userId: session.user.id,
            isShort: true
        })

        if (!deletedNote) {
            return NextResponse.json({ error: "Short note not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Short note deleted successfully" })
    } catch (error) {
        console.error("Error deleting short note:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
