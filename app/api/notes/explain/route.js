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

        // Generate explanation using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        const prompt = `Explain the following concept in detail. Break it down into key components, provide real-world applications, address common misconceptions, and give practice tips.

Title: ${note.title}
Content: ${note.content}

Please structure your response with clear headings and bullet points for readability.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const explanation = response.text()

        return NextResponse.json({ explanation })
    } catch (error) {
        console.error("Error generating explanation:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
