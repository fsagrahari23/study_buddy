import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Roadmap from "@/lib/models/Roadmap"
import Activity from "@/lib/models/Activity"

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { title, description, subjects, duration, tasks } = await request.json()

        // Validate required fields
        if (!title || !description || !subjects || !duration || !tasks) {
            return NextResponse.json(
                { error: "Missing required fields: title, description, subjects, duration, tasks" },
                { status: 400 }
            )
        }

        // Find the user's active roadmap
        const roadmap = await Roadmap.findOne({
            user: session.user.id,
            status: "active"
        })

        if (!roadmap) {
            return NextResponse.json(
                { error: "No active roadmap found. Please generate a roadmap first." },
                { status: 404 }
            )
        }

        // Generate new milestone ID (increment from existing max ID)
        const maxId = roadmap.milestones.length > 0
            ? Math.max(...roadmap.milestones.map(m => m.id))
            : 0
        const newMilestoneId = maxId + 1

        // Create new milestone
        const newMilestone = {
            id: newMilestoneId,
            title,
            description,
            subjects: Array.isArray(subjects) ? subjects : [subjects],
            duration,
            tasks: Array.isArray(tasks) ? tasks : [tasks],
            completed: false,
            progress: 0,
            startedAt: new Date()
        }

        // Add milestone to roadmap
        roadmap.milestones.push(newMilestone)
        roadmap.lastUpdated = new Date()
        await roadmap.save()

        // Record activity
        await Activity.create({
            user: session.user.id,
            action: "custom_milestone_added",
            details: {
                milestoneId: newMilestoneId,
                title,
                subjects: newMilestone.subjects
            },
            timestamp: new Date()
        })

        return NextResponse.json({
            success: true,
            milestone: newMilestone,
            message: "Custom milestone added successfully"
        })

    } catch (error) {
        console.error("Error adding custom milestone:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
