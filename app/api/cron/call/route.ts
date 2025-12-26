import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function GET() {
  // 🔐 Simple protection (cron-only)
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing CRON_SECRET" }, { status: 500 });
  }

  // Place the call
  await client.calls.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: process.env.WIFE_PHONE_NUMBER!,
    url: "https://ai-calling-agent-chi.vercel.app/voice",
  });

  return NextResponse.json({
    ok: true,
    message: "Scheduled call triggered",
  });
}
