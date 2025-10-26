import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { GoogleGenerativeAI } from "@google/generative-ai"
import connectDB from "@/lib/mongodb"
import Note from "@/lib/models/Note"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { noteId } = await request.json()
        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
        }

        await connectDB()

        // Fetch the note - handle both ObjectId and string IDs
        let note
        try {
            note = await Note.findOne({ _id: noteId, userId: session.user.id })
        } catch (error) {
            // If ObjectId cast fails, try finding by a custom field or handle string ID
            note = await Note.findOne({ userId: session.user.id, title: noteId }) // Assuming noteId might be a title or custom ID
        }
        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 })
        }

        // Generate summary using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        const prompt = `Create a concise summary of the following note. Include the main points, key takeaways, and why this concept matters.

Title: ${note.title}
Content: ${note.content}

Format the summary with bold headings and bullet points for key takeaways.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const summary = response.text()

        return NextResponse.json({ summary })
    } catch (error) {
        console.error("Error generating summary:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
