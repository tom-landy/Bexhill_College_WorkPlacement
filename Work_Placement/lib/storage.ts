import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
  }
});

const bucket = process.env.S3_BUCKET || "";
const maxSizeBytes = 8 * 1024 * 1024;
const allowedMime = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export function validateEvidenceFile(mime: string, size: number): void {
  if (!allowedMime.has(mime)) {
    throw new Error("Unsupported evidence file type.");
  }
  if (size > maxSizeBytes) {
    throw new Error("Evidence file too large. Max 8MB.");
  }
}

export async function getUploadSignedUrl(objectKey: string, mime: string): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: mime });
  return getSignedUrl(client, cmd, { expiresIn: 300 });
}

export async function getDownloadSignedUrl(objectKey: string): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
  return getSignedUrl(client, cmd, { expiresIn: 300 });
}
