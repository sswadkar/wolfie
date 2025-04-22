import { NextResponse } from "next/server";
import { BedrockAgentClient, StartIngestionJobCommand } from "@aws-sdk/client-bedrock-agent";
import { v4 as uuidv4 } from "uuid";

const REGION = "us-east-1";
const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID || "";
const DATA_SOURCE_ID = process.env.DATA_SOURCE_ID || "";

const bedrockAgent = new BedrockAgentClient({ region: REGION });

export async function POST() {
  try {
    const command = new StartIngestionJobCommand({
      knowledgeBaseId: KNOWLEDGE_BASE_ID,
      dataSourceId: DATA_SOURCE_ID,
      clientToken: uuidv4(),
    });

    const response = await bedrockAgent.send(command);

    return NextResponse.json({
      message: "Ingestion job started.",
      ingestionJob: response.ingestionJob,
    });
  } catch (err) {
    console.error("Resync error:", err);
    return NextResponse.json({ error: "Failed to trigger ingestion" }, { status: 500 });
  }
}
