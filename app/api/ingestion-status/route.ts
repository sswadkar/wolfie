import { NextResponse } from "next/server";
import { BedrockAgentClient, GetIngestionJobCommand } from "@aws-sdk/client-bedrock-agent";

const REGION = "us-east-1";
const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID || "";
const DATA_SOURCE_ID = process.env.DATA_SOURCE_ID || "";

const client = new BedrockAgentClient({ region: REGION });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const response = await client.send(
    new GetIngestionJobCommand({
      knowledgeBaseId: KNOWLEDGE_BASE_ID,
      dataSourceId: DATA_SOURCE_ID,
      ingestionJobId: jobId,
    })
  );

  return NextResponse.json({ status: response.ingestionJob?.status });
}
