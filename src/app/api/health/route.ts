import { NextResponse } from "next/server";
import { existsSync, accessSync, constants, mkdirSync } from "fs";
import path from "path";
import { getBotToken, getOwnerChatId } from "@/lib/telegram";
import { crmQueueStats, flushCrmQueue } from "@/lib/bot-crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  void flushCrmQueue().catch((err) =>
    console.error("[health] crm flush", err)
  );

  const dataDir = path.join(process.cwd(), ".data");
  let dataWritable = false;
  try {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    accessSync(dataDir, constants.W_OK);
    dataWritable = true;
  } catch {
    dataWritable = false;
  }

  const queue = crmQueueStats();
  const body = {
    ok: true,
    ts: new Date().toISOString(),
    telegramToken: Boolean(getBotToken()),
    telegramOwner: Boolean(getOwnerChatId()),
    dataWritable,
    leadsWebhook: Boolean(process.env.LEADS_WEBHOOK_URL?.trim()),
    crmQueuePending: queue.pending,
  };

  const healthy = body.telegramToken && body.dataWritable;
  return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
