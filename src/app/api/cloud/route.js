import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const runtime = "nodejs";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.DDB_TABLE_NAME; // ej: sensor-detect-events

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

export async function GET() {
  if (!TABLE_NAME) {
    return NextResponse.json(
      { error: "DDB_TABLE_NAME no está definido" },
      { status: 500 }
    );
  }

  // Scan simple (para demo). Para producción se usaría Query + índices.
  const resp = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));

  const items = resp.Items || [];

  // Ordenar por timestamp (si existe)
  items.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));

  const last = items[0] || null;

  const counts = items.reduce(
    (acc, it) => {
      const n = it.nivel || "UNKNOWN";
      acc[n] = (acc[n] || 0) + 1;
      return acc;
    },
    {}
  );

  return NextResponse.json({
    total: items.length,
    counts,
    last,
    items: items.slice(0, 20),
  });
}
