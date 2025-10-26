import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import connectDB from "../../../../lib/mongodb"
import Roadmap from "../../../../lib/models/Roadmap"
import Activity from "../../../../lib/models/Activity"

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { milestoneId } = await request.json()

        if (!milestoneId) {
            return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 })
        }

        await connectDB()

        const roadmap = await Roadmap.findOne({ user: session.user.id, status: "active" })

        if (!roadmap) {
            return NextResponse.json({ error: "No active roadmap found" }, { status: 404 })
        }

        // Complete milestone
        roadmap.completeMilestone(milestoneId)
        await roadmap.save()

        // Record activity
        const activity = new Activity({
            user: session.user.id,
            action: "milestone_completed",
            details: {
                roadmapId: roadmap._id,
                milestoneId,
                overallProgress: roadmap.overallProgress,
                status: roadmap.status,
            },
        })
        await activity.save()

        return NextResponse.json({
            milestoneId,
            completed: true,
            overallProgress: roadmap.overallProgress,
            status: roadmap.status,
            completedAt: roadmap.completedAt,
        })
    } catch (error) {
        console.error("Error completing milestone:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
