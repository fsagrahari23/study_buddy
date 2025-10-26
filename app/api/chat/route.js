import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import connectDB from "../../../lib/mongodb"
import Chat from "../../../lib/models/Chat"
import Activity from "../../../lib/models/Activity"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const body = await request.json()
        const { message, chatId, toolId } = body

        if (!message || !chatId) {
            return NextResponse.json({ error: "Message and chatId are required" }, { status: 400 })
        }

        // Find or create chat
        let chat = await Chat.findOne({ _id: chatId, user: session.user.id })
        if (!chat) {
            chat = new Chat({
                _id: chatId,
                user: session.user.id,
                title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
                messages: [],
            })
        }

        // Add user message to chat
        chat.messages.push({
            role: "user",
            content: message,
            tool: toolId,
            timestamp: new Date(),
        })

        // Prepare messages for Gemini
        const geminiMessages = chat.messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }))

        // Get Gemini response
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })
        const chatSession = model.startChat({
            history: geminiMessages.slice(0, -1), // Exclude the current user message
        })

        const result = await chatSession.sendMessage(message)
        const aiResponse = result.response.text()

        // Add AI response to chat
        chat.messages.push({
            role: "assistant",
            content: aiResponse,
            tool: toolId,
            timestamp: new Date(),
        })

        await chat.save()

        // Record activity
        const activity = new Activity({
            user: session.user.id,
            action: "chat_message_sent",
            details: {
                chatId,
                messageLength: message.length,
                tool: toolId,
            },
        })
        await activity.save()

        return NextResponse.json({
            response: aiResponse,
            chatId: chat._id,
        })
    } catch (error) {
        console.error("Error in chat API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { searchParams } = new URL(request.url)
        const chatId = searchParams.get("chatId")

        if (!chatId) {
            // Return list of chats
            const chats = await Chat.find({ user: session.user.id })
                .sort({ updatedAt: -1 })
                .select("_id title messages createdAt updatedAt")
                .limit(50)

            return NextResponse.json({ chats })
        }

        // Return specific chat
        const chat = await Chat.findOne({ _id: chatId, user: session.user.id })
        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 })
        }

        return NextResponse.json({ chat })
    } catch (error) {
        console.error("Error fetching chat:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { searchParams } = new URL(request.url)
        const chatId = searchParams.get("chatId")

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
        }

        await Chat.findOneAndDelete({ _id: chatId, user: session.user.id })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting chat:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
