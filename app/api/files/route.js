import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Files from "@/lib/models/Files"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const files = await Files.find({ userId: session.user.id }).sort({ createdAt: -1 })

        // Add URL to each file
        const filesWithUrl = files.map(file => ({
            ...file.toObject(),
            url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${file.name}`
        }))

        return NextResponse.json({ files: filesWithUrl })
    } catch (error) {
        console.error("Error fetching files:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
