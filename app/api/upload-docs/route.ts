import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import {
  BedrockAgentClient,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";
import { v4 as uuidv4 } from "uuid";

// --- Config ---
const REGION = "us-east-1";
const BUCKET_NAME = "wolfie-commerical";
const PREFIX = "uploaded/";
const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID || "";
const DATA_SOURCE_ID = process.env.DATA_SOURCE_ID || "";

// --- Clients ---
const s3 = new S3Client({ region: REGION });
const bedrockAgent = new BedrockAgentClient({ region: REGION });

// --- Handler ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("documents") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided." },
        { status: 400 }
      );
    }

    const uploadedKeys: string[] = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const s3Key = `${PREFIX}${file.name}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: Buffer.from(buffer),
        ContentType: file.type || "application/octet-stream",
      });

      await s3.send(uploadCommand);
      uploadedKeys.push(s3Key);
    }

    // --- Trigger ingestion ---
    const ingestionCommand = new StartIngestionJobCommand({
      knowledgeBaseId: KNOWLEDGE_BASE_ID,
      dataSourceId: DATA_SOURCE_ID,
      clientToken: uuidv4(),
    });

    const ingestionResponse = await bedrockAgent.send(ingestionCommand);

    // --- Optionally: list all objects in the bucket ---
    const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const listResponse = await s3.send(listCommand);
    const allDocs = (listResponse.Contents || []).map((item) => item.Key);

    return NextResponse.json({
      message: "File(s) uploaded and ingestion job started.",
      uploadedFiles: uploadedKeys,
      ingestionJob: ingestionResponse.ingestionJob,
      allDocuments: allDocs,
    });
  } catch (err) {
    console.error("Upload/Ingestion error:", err);
    return NextResponse.json(
      { error: "Upload or ingestion failed." },
      { status: 500 }
    );
  }
}
