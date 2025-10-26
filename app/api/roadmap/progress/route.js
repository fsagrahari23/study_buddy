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

        const { milestoneId, progress } = await request.json()

        if (!milestoneId || typeof progress !== "number") {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
        }

        await connectDB()

        const roadmap = await Roadmap.findOne({ user: session.user.id, status: "active" })

        if (!roadmap) {
            return NextResponse.json({ error: "No active roadmap found" }, { status: 404 })
        }

        // Update milestone progress
        roadmap.updateMilestoneProgress(milestoneId, progress)
        await roadmap.save()

        // Record activity
        const activity = new Activity({
            user: session.user.id,
            action: "milestone_progress_updated",
            details: {
                roadmapId: roadmap._id,
                milestoneId,
                progress,
                overallProgress: roadmap.overallProgress,
            },
        })
        await activity.save()

        return NextResponse.json({
            milestoneId,
            progress,
            overallProgress: roadmap.overallProgress,
            status: roadmap.status,
        })
    } catch (error) {
        console.error("Error updating milestone progress:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
