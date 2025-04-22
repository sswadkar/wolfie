import { NextResponse, NextRequest } from "next/server";
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

const REGION = "us-east-1";
const BUCKET_NAME = "wolfie-commerical";
const PUBLIC_PREFIX = "uploaded/"; // All public docs should live under this prefix

const s3 = new S3Client({ region: REGION });

export async function GET() {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: PUBLIC_PREFIX,
    });

    const listResponse = await s3.send(listCommand);

    const files = (listResponse.Contents || []).map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    }));

    return NextResponse.json({ files });
  } catch (err) {
    console.error("Error listing public documents:", err);
    return NextResponse.json({ error: "Failed to list documents." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const key = req.nextUrl.searchParams.get("key");
  
    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }
  
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
  
      await s3.send(deleteCommand);
  
      return NextResponse.json({ message: "Document deleted successfully" });
    } catch (err) {
      console.error("Error deleting document:", err);
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }
  }