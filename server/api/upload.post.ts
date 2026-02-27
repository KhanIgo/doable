import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// Use S3_BUCKET_ID as the bucket name for Beget
const bucketName = process.env.S3_BUCKET_ID || process.env.S3_BUCKET

if (!bucketName) {
  console.error('❌ S3 bucket not configured. Set S3_BUCKET_ID or S3_BUCKET in .env')
}

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: false
})

console.log('✓ S3 Client configured:', {
  endpoint: process.env.S3_ENDPOINT,
  bucket: bucketName,
  region: process.env.S3_REGION
})

export default defineEventHandler(async (event) => {
  // Read raw body as buffer
  const buffer = await readRawBody(event, false)
  
  if (!buffer || buffer.length === 0) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  // Check if S3 is configured (either S3_BUCKET or S3_BUCKET_ID for Beget)
  const hasBucket = process.env.S3_BUCKET || process.env.S3_BUCKET_ID
  if (!hasBucket || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_ENDPOINT) {
    throw createError({ 
      statusCode: 500, 
      message: 'S3 not configured. Please set S3_ENDPOINT, S3_BUCKET_ID (or S3_BUCKET), S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in your .env file' 
    })
  }

  const contentType = getHeader(event, 'content-type') || 'application/octet-stream'
  const fileName = getHeader(event, 'x-file-name') || 'upload'
  
  // Generate unique filename
  const extension = fileName.split('.').pop() || 'png'
  const key = `uploads/${uuidv4()}.${extension}`
  
  try {
    // Convert to Buffer if needed
    const fileBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    
    console.log('📤 Uploading to S3:', {
      bucket: bucketName,
      key: key,
      contentType: contentType,
      size: fileBuffer.length
    })
    
    const uploadParams: any = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType
    }
    
    await s3Client.send(new PutObjectCommand(uploadParams))
    
    console.log('✓ Image uploaded successfully:', key)

    // Build image URL for Beget S3 storage
    let imageUrl: string
    if (process.env.S3_ENDPOINT && bucketName) {
      // Beget format: https://s3.region.storage.provider.com/bucket-id/key
      const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, '')
      imageUrl = `${endpoint}/${bucketName}/${key}`
    } else if (process.env.S3_ENDPOINT) {
      // Generic S3-compatible format
      const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, '')
      imageUrl = `${endpoint}/${process.env.S3_BUCKET}/${key}`
    } else {
      // AWS format
      imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
    }

    return {
      url: imageUrl,
      key
    }
  } catch (error: any) {
    console.error('S3 upload error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      endpoint: process.env.S3_ENDPOINT,
      bucket: bucketName
    })
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to upload image: ' + (error.message || 'Unknown error') 
    })
  }
})
