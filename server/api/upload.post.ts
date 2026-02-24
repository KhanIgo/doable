import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
})

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, false)
  
  if (!body) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  // Check if S3 is configured
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID) {
    throw createError({ 
      statusCode: 500, 
      message: 'S3 not configured. Please set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in your .env file' 
    })
  }

  const contentType = getHeader(event, 'content-type') || 'application/octet-stream'
  const fileName = getHeader(event, 'x-file-name') || 'upload'
  
  // Generate unique filename
  const extension = fileName.split('.').pop() || 'png'
  const key = `uploads/${uuidv4()}.${extension}`
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: Buffer.from(body, 'base64'),
      ContentType: contentType,
      ACL: 'public-read'
    }))

    // Build image URL using custom endpoint or S3-compatible format
    let imageUrl: string
    if (process.env.S3_ENDPOINT) {
      // For custom S3-compatible storage (MinIO, etc.)
      const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, '')
      imageUrl = `${endpoint}/${process.env.S3_BUCKET}/${key}`
    } else {
      // Fallback to AWS format
      imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
    }

    return {
      url: imageUrl,
      key
    }
  } catch (error: any) {
    console.error('S3 upload error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to upload image: ' + error.message
    })
  }
})
