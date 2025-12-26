import { NextResponse } from "next/server";
import twilio from "twilio";

export const runtime = "nodejs";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function GET(req: Request) {
  // 🔐 Security check
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const call = await client.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: process.env.WIFE_PHONE_NUMBER!,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice`,
    });

    return NextResponse.json({
      ok: true,
      callSid: call.sid,
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron call failed:", err);
    return NextResponse.json(
      { ok: false, error: "Call failed" },
      { status: 500 }
    );
  }
}
