import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { parse } from "url";
import { NextResponse } from "next/server";

// Helper to convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// Determine base URL dynamically
function getBaseUrl(req: Request): string {
    const isLocalhost =
      req.headers.get("host")?.includes("localhost") ||
      req.headers.get("x-forwarded-host")?.includes("localhost");
  
    return isLocalhost
      ? "http://localhost:3000"
      : `https://${req.headers.get("host")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accessKey, secretKey, region = "us-east-1", documentUrl } = body;

    if (!accessKey || !secretKey || !documentUrl) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Extract bucket and key from the S3 URL
    const { hostname, pathname } = parse(documentUrl);
    if (!hostname || !pathname) {
      return NextResponse.json({ message: "Invalid S3 URL." }, { status: 400 });
    }

    const bucket = hostname.split(".")[0];
    const key = decodeURIComponent(pathname.slice(1));

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const s3Response = await s3Client.send(command);
    const buffer = await streamToBuffer(s3Response.Body as Readable);
    const filename = key.split("/").pop() || "document.pdf";

    const formData = new FormData();
    formData.append("documents", new Blob([buffer]), filename);

    const baseUrl = getBaseUrl(req);

    const uploadRes = await fetch(`${baseUrl}/api/upload-docs`, {
        method: "POST",
        body: formData,
      });

    const result = (await uploadRes.json()) as {
        message?: string;
        ingestionJob?: { ingestionJobId?: string };
        uploadedFiles?: string[];
      };

    if (!uploadRes.ok) {
      return NextResponse.json({ message: "Upload to knowledge base failed", error: result }, { status: 500 });
    }

    return NextResponse.json({
      message: "File uploaded from S3 and ingested successfully.",
      ingestionJob: result.ingestionJob,
      uploadedFiles: result.uploadedFiles,
    });
  } catch (err) {
    console.error("S3 Connect Error:", err);
    return NextResponse.json({ message: err || "Internal Server Error" }, { status: 500 });
  }
}
