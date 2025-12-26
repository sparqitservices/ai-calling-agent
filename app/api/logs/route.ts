import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function GET() {
  const calls = await client.calls.list({ limit: 20 });

  const logs = calls.map(call => ({
    sid: call.sid,
    to: call.to,
    from: call.from,
    status: call.status,
    duration: call.duration,
    startTime: call.startTime,
    endTime: call.endTime,
  }));

  return NextResponse.json(logs);
}
