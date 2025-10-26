"use server"

import Files from "@/lib/models/Files"
import connectDB from "../../lib/mongodb"

export async function saveFile(name, userId, fileSize) {
    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${name}`

    console.log(url)

    try {
        await connectDB()

        // Fetch topics from the API
        const response = await fetch("https://helper-function-103741319333.us-central1.run.app/gen_topic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        })

        console.log(response)

        if (!response.ok) {
            throw new Error("Failed to fetch topics from API")
        }

        const { pineconeID, topicName } = await response.json()

        // Save to database
        const newFile = new Files({
            name,
            pineconedoc_id: pineconeID,
            topics: topicName, // assuming topicName is an array
            userId,
            url,
            size: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
        })

        const savedFile = await newFile.save()

        return { success: savedFile.name }
    } catch (error) {
        console.error("Error saving file:", error)
        return { failure: error.message }
    }
}
