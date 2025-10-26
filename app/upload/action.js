"use server"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


const acceptedType = ["application/pdf"];
const maxSize = 1024 * 1024 * 10

export async function getSignedURL(type, size, name, checksum) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return { failure: "Unauthorized" }
    }

    console.log(session)

    const s3 = new S3Client({
        region: process.env.AWS_BUCKET_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })



    if (!acceptedType.includes(type)) {
        return { failure: "invalid file type" }
    }
    if (size > maxSize) {
        return { failure: "file size is too long" }
    }
    const putObjCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: name || 'test-file',
        ContentLength: size,
        ContentType: type,
        ChecksumSHA256: checksum,

    })
    const signedUrl = await getSignedUrl(s3, putObjCommand, {
        expiresIn: 60
    })

    return { success: { url: signedUrl, userId: session.user.id } }
}
