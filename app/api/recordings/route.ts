import { NextResponse } from "next/server";
import twilio from "twilio";

export const runtime = "nodejs"; // REQUIRED (Twilio SDK)

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function GET() {
  try {
    const recordings = await client.recordings.list({ limit: 20 });

    const data = recordings.map((r) => ({
      sid: r.sid,
      duration: r.duration,
      createdAt: r.dateCreated,
      url: `https://api.twilio.com${r.uri.replace(".json", ".mp3")}`,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Recording fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}
